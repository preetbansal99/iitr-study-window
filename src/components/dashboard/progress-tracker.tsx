"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import {
    Flame,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingUp,
    BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTimerStore } from "@/stores/timer-store";
import { getStatsFromSessions, hasStudyData, type TimeRange } from "@/lib/analytics";

export function ProgressTracker() {
    const [timeRange, setTimeRange] = useState<TimeRange>("week");
    const { sessionHistory } = useTimerStore();

    // Get stats from real session history
    const stats = useMemo(
        () => getStatsFromSessions(sessionHistory, timeRange),
        [sessionHistory, timeRange]
    );

    // Check if user has any study data
    const hasData = hasStudyData(sessionHistory);

    const timeRanges: { value: TimeRange; label: string }[] = [
        { value: "today", label: "Today" },
        { value: "week", label: "Week" },
        { value: "month", label: "Month" },
        { value: "semester", label: "Semester" },
    ];

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-indigo-600" />
                            Progress Tracker
                        </CardTitle>
                        {/* Study Streak Badge */}
                        <Badge className="gap-1 bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                            <Flame className="h-3.5 w-3.5" />
                            {stats.streak} Day Streak
                        </Badge>
                    </div>

                    {/* Time Range Filter */}
                    <div className="flex gap-1 rounded-lg bg-white/80 p-1 dark:bg-zinc-900/80">
                        {timeRanges.map((range) => (
                            <Button
                                key={range.value}
                                variant={timeRange === range.value ? "default" : "ghost"}
                                size="sm"
                                className={cn(
                                    "text-xs",
                                    timeRange === range.value && "bg-indigo-600 hover:bg-indigo-700"
                                )}
                                onClick={() => setTimeRange(range.value)}
                            >
                                {range.label}
                            </Button>
                        ))}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-4 space-y-6">
                {/* Empty State */}
                {!hasData && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                            No study sessions yet
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                            Start a focus session using the timer to track your progress and build your streak.
                        </p>
                    </div>
                )}

                {/* KPI Cards Grid */}
                {hasData && (
                    <>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            {/* Focus Time */}
                            <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-indigo-50 p-4 dark:from-blue-950/30 dark:to-indigo-950/30">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                    Focus Time
                                </div>
                                <div className="mt-1 flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.totalFocusHours}
                                    </span>
                                    <span className="text-sm text-slate-500">hrs</span>
                                    <span className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                        {stats.totalFocusRemainder}
                                    </span>
                                    <span className="text-sm text-slate-500">min</span>
                                </div>
                            </div>

                            {/* Sessions Completed */}
                            <div className="rounded-lg border bg-gradient-to-br from-green-50 to-emerald-50 p-4 dark:from-green-950/30 dark:to-emerald-950/30">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    Completed
                                </div>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.sessionsCompleted}
                                    </span>
                                    <span className="ml-1 text-sm text-slate-500">sessions</span>
                                </div>
                            </div>

                            {/* Sessions Abandoned */}
                            <div className="rounded-lg border bg-gradient-to-br from-red-50 to-orange-50 p-4 dark:from-red-950/30 dark:to-orange-950/30">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    Abandoned
                                </div>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.sessionsAbandoned}
                                    </span>
                                    <span className="ml-1 text-sm text-slate-500">sessions</span>
                                </div>
                            </div>

                            {/* Streak */}
                            <div className="rounded-lg border bg-gradient-to-br from-orange-50 to-amber-50 p-4 dark:from-orange-950/30 dark:to-amber-950/30">
                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Flame className="h-4 w-4 text-orange-600" />
                                    Current Streak
                                </div>
                                <div className="mt-1">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">
                                        {stats.streak}
                                    </span>
                                    <span className="ml-1 text-sm text-slate-500">days</span>
                                </div>
                            </div>
                        </div>

                        {/* Focus Trend Chart */}
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-4 font-semibold text-slate-900 dark:text-white">Focus Trend</h4>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stats.chartData}>
                                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 10 }}
                                            className="text-slate-500"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10 }}
                                            className="text-slate-500"
                                            label={{ value: 'Hours', angle: -90, position: 'insideLeft', fontSize: 10 }}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'var(--background)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '8px',
                                            }}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="hours"
                                            stroke="#6366f1"
                                            strokeWidth={2}
                                            dot={{ fill: "#6366f1", strokeWidth: 2 }}
                                            animationDuration={500}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Study Intensity Heat Map */}
                        <div className="rounded-lg border p-4">
                            <h4 className="mb-3 font-semibold text-slate-900 dark:text-white">Study Intensity</h4>
                            <div className="flex flex-wrap gap-1">
                                {stats.chartData.slice(-14).map((day, i) => {
                                    const intensity = Math.min(day.hours / 4, 1); // 4 hours = max intensity
                                    return (
                                        <div
                                            key={i}
                                            className="h-6 w-6 rounded-sm transition-colors"
                                            style={{
                                                backgroundColor: intensity > 0
                                                    ? `rgba(99, 102, 241, ${0.2 + intensity * 0.8})`
                                                    : "rgba(99, 102, 241, 0.1)",
                                            }}
                                            title={`${day.label}: ${day.hours}h`}
                                        />
                                    );
                                })}
                            </div>
                            <div className="mt-2 flex items-center justify-end gap-2 text-xs text-slate-500">
                                <span>Less</span>
                                <div className="flex gap-0.5">
                                    {[0.1, 0.3, 0.5, 0.7, 1].map((opacity) => (
                                        <div
                                            key={opacity}
                                            className="h-3 w-3 rounded-sm"
                                            style={{ backgroundColor: `rgba(99, 102, 241, ${opacity})` }}
                                        />
                                    ))}
                                </div>
                                <span>More</span>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
