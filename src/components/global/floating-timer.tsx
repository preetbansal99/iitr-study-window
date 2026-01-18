"use client";

import { useState, useEffect } from "react";
import { useTimerStore, getTodayFocusTime, type SessionRecord } from "@/stores/timer-store";
import { useTaskStore } from "@/stores/task-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
    Play,
    Pause,
    X,
    ChevronUp,
    ChevronDown,
    Brain,
    Clock,
    History,
    Target,
    Coffee,
    Sparkles,
    CheckCircle2,
    XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingTimer() {
    const {
        timerState,
        breakType,
        timeRemaining,
        focusDuration,
        linkedTaskName,
        sessionHistory,
        completedSessions,
        startFocus,
        pauseTimer,
        resumeTimer,
        giveUp,
        tick,
        restoreState,
        setLinkedTask,
        updateSettings,
    } = useTimerStore();

    const { tasks, fetchTasks } = useTaskStore();
    const [isExpanded, setIsExpanded] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [customDuration, setCustomDuration] = useState(focusDuration);

    // Restore state and fetch tasks on mount
    useEffect(() => {
        restoreState();
        fetchTasks();
    }, [restoreState, fetchTasks]);

    // Timer tick
    useEffect(() => {
        if (timerState !== "focus" && timerState !== "break") return;
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [timerState, tick]);

    // Sync custom duration with store
    useEffect(() => {
        setCustomDuration(focusDuration);
    }, [focusDuration]);

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    const formatTime = (num: number) => num.toString().padStart(2, "0");
    const pendingTasks = tasks.filter((t) => !t.is_completed);
    const todayFocusMinutes = getTodayFocusTime(sessionHistory);

    // Don't show if idle and not expanded
    const isActive = timerState !== "idle";

    // Color based on state
    const getStateColor = () => {
        if (timerState === "break") {
            return breakType === "long" ? "bg-violet-600" : "bg-emerald-600";
        }
        if (timerState === "paused") return "bg-orange-500";
        return "bg-indigo-600";
    };

    const getStateIcon = () => {
        if (timerState === "break") {
            return breakType === "long" ? Sparkles : Coffee;
        }
        return Brain;
    };

    const StateIcon = getStateIcon();

    // Minimized Pill
    if (!isExpanded) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setIsExpanded(true)}
                    className={cn(
                        "flex items-center gap-3 rounded-full px-4 py-3 text-white shadow-xl transition-all",
                        "hover:scale-105 hover:shadow-2xl",
                        isActive ? getStateColor() : "bg-slate-800 dark:bg-slate-700"
                    )}
                >
                    <StateIcon className="h-5 w-5" />
                    {isActive ? (
                        <>
                            <span className="font-mono text-lg font-bold">
                                {formatTime(minutes)}:{formatTime(seconds)}
                            </span>
                            <div className="flex items-center gap-1">
                                {timerState === "paused" ? (
                                    <Play className="h-4 w-4" />
                                ) : (
                                    <Pause className="h-4 w-4" />
                                )}
                            </div>
                        </>
                    ) : (
                        <span className="font-medium">Start Focus</span>
                    )}
                    <ChevronUp className="h-4 w-4" />
                </button>
            </div>
        );
    }

    // Expanded Panel
    return (
        <div className="fixed bottom-6 right-6 z-50 w-80 animate-in slide-in-from-bottom-4">
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-2xl dark:bg-slate-900">
                {/* Header */}
                <div className={cn("flex items-center justify-between p-4 text-white", getStateColor())}>
                    <div className="flex items-center gap-2">
                        <StateIcon className="h-5 w-5" />
                        <span className="font-semibold">
                            {timerState === "idle" && "Focus Timer"}
                            {timerState === "focus" && "Focusing..."}
                            {timerState === "paused" && "Paused"}
                            {timerState === "break" && (breakType === "long" ? "Long Break" : "Short Break")}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20"
                            onClick={() => setShowHistory(!showHistory)}
                        >
                            <History className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-white hover:bg-white/20"
                            onClick={() => setIsExpanded(false)}
                        >
                            <ChevronDown className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* History View */}
                {showHistory ? (
                    <div className="p-4">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="font-semibold text-slate-900 dark:text-white">Session History</h4>
                            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                                <Clock className="mr-1 h-3 w-3" />
                                {Math.floor(todayFocusMinutes / 60)}h {todayFocusMinutes % 60}m today
                            </Badge>
                        </div>
                        <ScrollArea className="h-48">
                            {sessionHistory.length === 0 ? (
                                <p className="py-8 text-center text-sm text-slate-500">No sessions yet</p>
                            ) : (
                                <div className="space-y-2">
                                    {sessionHistory.slice(0, 10).map((session) => (
                                        <div
                                            key={session.id}
                                            className="flex items-center gap-3 rounded-lg bg-slate-50 p-2 dark:bg-slate-800"
                                        >
                                            {session.completed ? (
                                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                                                    {session.taskName || "Untracked Session"}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(session.timestampEnd).toLocaleDateString("en", {
                                                        month: "short",
                                                        day: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <Badge
                                                variant={session.completed ? "secondary" : "outline"}
                                                className={session.completed ? "bg-emerald-100 text-emerald-700" : "text-red-600"}
                                            >
                                                {session.durationMinutes}m
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                ) : (
                    <>
                        {/* Timer Display */}
                        <div className="p-6 text-center">
                            <div className="mb-2 font-mono text-5xl font-bold text-slate-900 dark:text-white">
                                {formatTime(minutes)}:{formatTime(seconds)}
                            </div>
                            <p className="text-sm text-slate-500">
                                Session {completedSessions + (isActive && timerState !== "break" ? 1 : 0)}
                            </p>
                        </div>

                        {/* Controls based on state */}
                        <div className="border-t border-border/50 p-4">
                            {timerState === "idle" && (
                                <div className="space-y-4">
                                    {/* Task Selector */}
                                    <div>
                                        <label className="mb-1.5 block text-xs font-medium text-slate-500">
                                            Link to Task
                                        </label>
                                        <Select
                                            value={linkedTaskName || "none"}
                                            onValueChange={(v) => setLinkedTask(v === "none" ? null : v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Select a task..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">No task linked</SelectItem>
                                                {pendingTasks.map((task) => (
                                                    <SelectItem key={task.id} value={task.title}>
                                                        {task.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Duration Slider */}
                                    <div>
                                        <div className="mb-1.5 flex items-center justify-between">
                                            <label className="text-xs font-medium text-slate-500">Duration</label>
                                            <span className="text-sm font-semibold text-indigo-600">{customDuration} min</span>
                                        </div>
                                        <Slider
                                            value={[customDuration]}
                                            onValueChange={(values: number[]) => {
                                                setCustomDuration(values[0]);
                                                updateSettings({ focusDuration: values[0] });
                                            }}
                                            min={5}
                                            max={90}
                                            step={5}
                                            className="w-full"
                                        />
                                    </div>

                                    {/* Start Button */}
                                    <Button
                                        className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700"
                                        onClick={() => startFocus(linkedTaskName || undefined)}
                                    >
                                        <Play className="h-4 w-4" />
                                        Start Focus
                                    </Button>
                                </div>
                            )}

                            {timerState === "focus" && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={giveUp}
                                    >
                                        <X className="h-4 w-4" />
                                        Give Up
                                    </Button>
                                    <Button className="flex-1 gap-2" onClick={pauseTimer}>
                                        <Pause className="h-4 w-4" />
                                        Pause
                                    </Button>
                                </div>
                            )}

                            {timerState === "paused" && (
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50"
                                        onClick={giveUp}
                                    >
                                        <X className="h-4 w-4" />
                                        Give Up
                                    </Button>
                                    <Button className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700" onClick={resumeTimer}>
                                        <Play className="h-4 w-4" />
                                        Resume
                                    </Button>
                                </div>
                            )}

                            {timerState === "break" && (
                                <div className="text-center">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {breakType === "long" ? "Enjoy your long break!" : "Take a quick breather"}
                                    </p>
                                    <p className="mt-1 text-xs text-slate-400">Auto-resets when complete</p>
                                </div>
                            )}

                            {/* Linked Task Display */}
                            {linkedTaskName && isActive && (
                                <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-50 p-2 dark:bg-slate-800">
                                    <Target className="h-4 w-4 text-indigo-500" />
                                    <span className="truncate text-sm text-slate-600 dark:text-slate-300">
                                        {linkedTaskName}
                                    </span>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
