/**
 * Real Analytics Module
 * =====================
 * Aggregates actual study session data from timer-store
 * Replaces mockAnalytics.ts with real data
 */

import type { SessionRecord } from "@/stores/timer-store";

export type TimeRange = "today" | "week" | "month" | "semester";

export interface DailyStats {
    date: string;
    focusMinutes: number;
    sessionsCompleted: number;
    sessionsAbandoned: number;
}

export interface AnalyticsStats {
    totalFocusMinutes: number;
    totalFocusHours: number;
    totalFocusRemainder: number;
    sessionsCompleted: number;
    sessionsAbandoned: number;
    streak: number;
    chartData: { date: string; hours: number; label: string }[];
}

/**
 * Calculate current study streak from sessions
 * A streak day requires at least 30 minutes of focus
 */
function calculateStreak(sessions: SessionRecord[]): number {
    if (sessions.length === 0) return 0;

    // Group sessions by date
    const dailyMinutes = new Map<string, number>();
    sessions.forEach(session => {
        if (session.completed) {
            const current = dailyMinutes.get(session.date) || 0;
            dailyMinutes.set(session.date, current + session.durationMinutes);
        }
    });

    // Sort dates descending
    const sortedDates = Array.from(dailyMinutes.keys()).sort((a, b) => b.localeCompare(a));

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let expectedDate = today;

    for (const date of sortedDates) {
        // Check if this date is the expected date or yesterday
        const diffDays = Math.floor(
            (new Date(expectedDate).getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffDays > 1) break; // Gap in streak

        const minutes = dailyMinutes.get(date) || 0;
        if (minutes >= 30) { // Minimum 30 min to count as study day
            streak++;
            expectedDate = new Date(new Date(date).getTime() - 24 * 60 * 60 * 1000)
                .toISOString().split('T')[0];
        } else if (date !== today) {
            // Non-study day breaks streak (unless it's today)
            break;
        }
    }

    return streak;
}

/**
 * Get days to include for a time range
 */
function getDaysForRange(range: TimeRange): number {
    switch (range) {
        case "today": return 1;
        case "week": return 7;
        case "month": return 30;
        case "semester": return 120;
    }
}

/**
 * Aggregate stats from real session history
 */
export function getStatsFromSessions(
    sessions: SessionRecord[],
    range: TimeRange
): AnalyticsStats {
    const daysToInclude = getDaysForRange(range);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    // Filter sessions by date range
    const filteredSessions = sessions.filter(s => s.date >= cutoffStr);

    // Group by date for chart data
    const dailyStats = new Map<string, DailyStats>();

    filteredSessions.forEach(session => {
        const existing = dailyStats.get(session.date) || {
            date: session.date,
            focusMinutes: 0,
            sessionsCompleted: 0,
            sessionsAbandoned: 0,
        };

        if (session.completed) {
            existing.focusMinutes += session.durationMinutes;
            existing.sessionsCompleted++;
        } else {
            existing.sessionsAbandoned++;
        }

        dailyStats.set(session.date, existing);
    });

    // Fill in missing dates with zeros
    const chartData: { date: string; hours: number; label: string }[] = [];
    for (let i = daysToInclude - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const stats = dailyStats.get(dateStr);

        chartData.push({
            date: dateStr,
            hours: stats ? parseFloat((stats.focusMinutes / 60).toFixed(1)) : 0,
            label: date.toLocaleDateString("en", { weekday: "short", day: "numeric" }),
        });
    }

    // Calculate totals
    const totalFocusMinutes = filteredSessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.durationMinutes, 0);

    const sessionsCompleted = filteredSessions.filter(s => s.completed).length;
    const sessionsAbandoned = filteredSessions.filter(s => !s.completed).length;

    return {
        totalFocusMinutes,
        totalFocusHours: Math.floor(totalFocusMinutes / 60),
        totalFocusRemainder: totalFocusMinutes % 60,
        sessionsCompleted,
        sessionsAbandoned,
        streak: calculateStreak(sessions), // Use all sessions for streak
        chartData,
    };
}

/**
 * Check if user has any study data
 */
export function hasStudyData(sessions: SessionRecord[]): boolean {
    return sessions.length > 0;
}
