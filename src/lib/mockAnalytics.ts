/**
 * Mock Analytics Data Generator
 * ==============================
 * Generates 30 days of fake study data for demo mode
 */

export interface StudySession {
    id: string;
    date: string; // YYYY-MM-DD
    startTime: string;
    durationMinutes: number;
    completed: boolean; // false = abandoned
    courseCode?: string;
}

export interface ResourceLog {
    id: string;
    courseCode: string;
    resourceName: string;
    resourceType: "pdf" | "link" | "video";
    accessedAt: string;
    completed: boolean;
}

export interface DailyStats {
    date: string;
    focusMinutes: number;
    sessionsCompleted: number;
    sessionsAbandoned: number;
    tasksCompleted: number;
    tasksTotal: number;
}

export interface AnalyticsData {
    sessions: StudySession[];
    resourceLogs: ResourceLog[];
    dailyStats: DailyStats[];
    streak: number;
}

// Course codes from curriculum
const COURSE_CODES = [
    "EEC-206", "EEC-208", "EEC-204", "DAI-101", "CSE-101",
    "MAI-101", "PHI-101", "MAB-103", "ECC-201"
];

// Resource names
const RESOURCES = [
    { name: "Lecture Notes - Week 1", type: "pdf" },
    { name: "Lecture Notes - Week 2", type: "pdf" },
    { name: "Practice Problems Set", type: "pdf" },
    { name: "Video Tutorial", type: "video" },
    { name: "Reference Material", type: "link" },
    { name: "Past Year Papers", type: "pdf" },
    { name: "Assignment Solutions", type: "pdf" },
    { name: "Lab Manual", type: "pdf" },
] as const;

// Seeded random for consistent results
function seededRandom(seed: number): () => number {
    return () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
    };
}

export function generateMockAnalytics(): AnalyticsData {
    const random = seededRandom(42);
    const sessions: StudySession[] = [];
    const resourceLogs: ResourceLog[] = [];
    const dailyStats: DailyStats[] = [];

    const today = new Date();
    let consecutiveDays = 0;
    let currentStreak = 0;

    // Generate 30 days of data
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // Random number of sessions per day (0-4)
        const numSessions = Math.floor(random() * 5);
        let dayFocusMinutes = 0;
        let dayCompleted = 0;
        let dayAbandoned = 0;

        for (let j = 0; j < numSessions; j++) {
            const completed = random() > 0.2; // 80% completion rate
            const duration = completed
                ? 25 + Math.floor(random() * 35) // 25-60 min if completed
                : 5 + Math.floor(random() * 15);  // 5-20 min if abandoned

            sessions.push({
                id: `session-${i}-${j}`,
                date: dateStr,
                startTime: `${8 + Math.floor(random() * 12)}:${Math.floor(random() * 60).toString().padStart(2, "0")}`,
                durationMinutes: duration,
                completed,
                courseCode: COURSE_CODES[Math.floor(random() * COURSE_CODES.length)],
            });

            if (completed) {
                dayFocusMinutes += duration;
                dayCompleted++;
            } else {
                dayAbandoned++;
            }
        }

        // Generate resource access logs
        const numResources = Math.floor(random() * 4);
        for (let k = 0; k < numResources; k++) {
            const resource = RESOURCES[Math.floor(random() * RESOURCES.length)];
            resourceLogs.push({
                id: `resource-${i}-${k}`,
                courseCode: COURSE_CODES[Math.floor(random() * COURSE_CODES.length)],
                resourceName: resource.name,
                resourceType: resource.type as "pdf" | "link" | "video",
                accessedAt: `${dateStr}T${10 + Math.floor(random() * 10)}:00:00`,
                completed: random() > 0.3,
            });
        }

        // Calculate streak
        if (dayFocusMinutes >= 60) {
            if (i === 0 || consecutiveDays > 0) {
                consecutiveDays++;
            } else {
                consecutiveDays = 1;
            }
        } else if (i > 0) {
            if (consecutiveDays > currentStreak) {
                currentStreak = consecutiveDays;
            }
            consecutiveDays = 0;
        }

        // Daily stats
        const tasksTotal = 3 + Math.floor(random() * 5);
        dailyStats.push({
            date: dateStr,
            focusMinutes: dayFocusMinutes,
            sessionsCompleted: dayCompleted,
            sessionsAbandoned: dayAbandoned,
            tasksCompleted: Math.floor(random() * (tasksTotal + 1)),
            tasksTotal,
        });
    }

    // Final streak check
    if (consecutiveDays > currentStreak) {
        currentStreak = consecutiveDays;
    }

    return {
        sessions,
        resourceLogs,
        dailyStats,
        streak: Math.max(currentStreak, consecutiveDays),
    };
}

// Get stats for a specific time range
export type TimeRange = "today" | "week" | "month" | "semester";

export function getStatsForRange(data: AnalyticsData, range: TimeRange) {
    const today = new Date();
    let daysToInclude: number;

    switch (range) {
        case "today":
            daysToInclude = 1;
            break;
        case "week":
            daysToInclude = 7;
            break;
        case "month":
            daysToInclude = 30;
            break;
        case "semester":
            daysToInclude = 120;
            break;
    }

    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - daysToInclude);
    const cutoffStr = cutoffDate.toISOString().split("T")[0];

    const filteredStats = data.dailyStats.filter(d => d.date >= cutoffStr);

    const totalFocusMinutes = filteredStats.reduce((sum, d) => sum + d.focusMinutes, 0);
    const sessionsCompleted = filteredStats.reduce((sum, d) => sum + d.sessionsCompleted, 0);
    const sessionsAbandoned = filteredStats.reduce((sum, d) => sum + d.sessionsAbandoned, 0);
    const tasksCompleted = filteredStats.reduce((sum, d) => sum + d.tasksCompleted, 0);
    const tasksTotal = filteredStats.reduce((sum, d) => sum + d.tasksTotal, 0);

    return {
        totalFocusMinutes,
        totalFocusHours: Math.floor(totalFocusMinutes / 60),
        totalFocusRemainder: totalFocusMinutes % 60,
        sessionsCompleted,
        sessionsAbandoned,
        tasksCompleted,
        tasksTotal,
        chartData: filteredStats.map(d => ({
            date: d.date,
            hours: parseFloat((d.focusMinutes / 60).toFixed(1)),
            label: new Date(d.date).toLocaleDateString("en", { weekday: "short", day: "numeric" }),
        })),
    };
}

// Get resources by course
export function getResourcesByCourse(data: AnalyticsData, courseCode: string) {
    const courseLogs = data.resourceLogs.filter(r => r.courseCode === courseCode);

    return {
        completed: courseLogs.filter(r => r.completed),
        pending: courseLogs.filter(r => !r.completed),
    };
}

// Get available courses with resource counts
export function getCoursesWithResources(data: AnalyticsData) {
    const courseMap = new Map<string, { completed: number; pending: number }>();

    data.resourceLogs.forEach(log => {
        const existing = courseMap.get(log.courseCode) || { completed: 0, pending: 0 };
        if (log.completed) {
            existing.completed++;
        } else {
            existing.pending++;
        }
        courseMap.set(log.courseCode, existing);
    });

    return Array.from(courseMap.entries()).map(([code, counts]) => ({
        code,
        ...counts,
    }));
}
