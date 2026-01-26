"use client";

import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores/timer-store";
import { Play, Pause, X, Brain, Coffee, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Focus Timer Component
 * =====================
 * Implements strict state machine UI:
 * - IDLE: Only "START FOCUS" button visible
 * - FOCUS: Timer + Pause/Give Up
 * - BREAK: Timer with green/purple accent (auto-started)
 * - PAUSED: Resume/Give Up buttons
 */

export function FocusTimer({ suggestion }: { suggestion?: string }) {
  const {
    timerState,
    breakType,
    timeRemaining,
    completedSessions,
    focusDuration,
    startFocus,
    pauseTimer,
    resumeTimer,
    giveUp,
    tick,
    restoreState,
  } = useTimerStore();

  // Restore state on mount (handle page refresh)
  useEffect(() => {
    restoreState();
  }, [restoreState]);

  // Timer tick effect - runs every second when active
  useEffect(() => {
    if (timerState !== "focus" && timerState !== "break") {
      return;
    }

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerState, tick]);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formatTime = (num: number) => num.toString().padStart(2, "0");

  // Calculate progress for circular indicator
  const getDuration = () => {
    if (timerState === "break") {
      return breakType === "long"
        ? useTimerStore.getState().longBreakDuration * 60
        : useTimerStore.getState().shortBreakDuration * 60;
    }
    return focusDuration * 60;
  };

  const progress = (timeRemaining / getDuration()) * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Mode-specific styling
  const getModeConfig = () => {
    if (timerState === "break") {
      return breakType === "long"
        ? {
          label: "Long Break",
          color: "text-violet-600 dark:text-violet-400",
          bgColor: "bg-violet-50 dark:bg-violet-950/50",
          ringColor: "stroke-violet-500",
          icon: Sparkles,
        }
        : {
          label: "Short Break",
          color: "text-emerald-600 dark:text-emerald-400",
          bgColor: "bg-emerald-50 dark:bg-emerald-950/50",
          ringColor: "stroke-emerald-500",
          icon: Coffee,
        };
    }
    return {
      label: timerState === "paused" ? "Paused" : "Focus Time",
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-950/50",
      ringColor: "stroke-indigo-500",
      icon: Brain,
    };
  };

  const config = getModeConfig();
  const ModeIcon = config.icon;

  // IDLE State UI
  if (timerState === "idle") {
    return (
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-indigo-50 to-violet-50 shadow-lg dark:from-indigo-950/30 dark:to-violet-950/30">
        <CardContent className="flex flex-col items-center py-12">
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
            <Brain className="h-12 w-12 text-white" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            Ready to Focus?
          </h3>
          <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
            {suggestion || `${completedSessions} sessions completed today`}
          </p>

          <Button
            size="lg"
            className="h-14 gap-3 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-8 text-lg font-semibold shadow-lg transition-all hover:from-indigo-700 hover:to-violet-700 hover:shadow-xl"
            onClick={() => startFocus()}
          >
            <Play className="h-6 w-6" />
            Start Focus
          </Button>

          <p className="mt-4 text-xs text-slate-500">
            {focusDuration} minute session
          </p>
        </CardContent>
      </Card>
    );
  }

  // Active Timer UI (FOCUS, BREAK, PAUSED)
  return (
    <Card className={cn("overflow-hidden border-0 shadow-lg", config.bgColor)}>
      <CardContent className="flex flex-col items-center py-8">
        {/* Status badge */}
        <div className={cn(
          "mb-4 flex items-center gap-2 rounded-full px-4 py-1.5",
          timerState === "break"
            ? "bg-white/80 dark:bg-zinc-900/80"
            : "bg-white/80 dark:bg-zinc-900/80"
        )}>
          <ModeIcon className={cn("h-4 w-4", config.color)} />
          <span className={cn("text-sm font-medium", config.color)}>
            {config.label}
          </span>
        </div>

        {/* Timer Circle */}
        <div className="relative mb-6">
          <svg className="h-48 w-48 -rotate-90 transform">
            {/* Background circle */}
            <circle
              cx="96"
              cy="96"
              r="80"
              className="fill-none stroke-slate-200/50 dark:stroke-slate-700/50"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="96"
              cy="96"
              r="80"
              className={cn("fill-none transition-all duration-300", config.ringColor)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-5xl font-bold text-slate-900 dark:text-white">
              {formatTime(minutes)}:{formatTime(seconds)}
            </span>
            <span className="mt-1 text-sm text-slate-500">
              Session {completedSessions + (timerState === "focus" || timerState === "paused" ? 1 : 0)}
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-4">
          {timerState === "paused" ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={giveUp}
              >
                <X className="h-5 w-5" />
                Give Up
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                onClick={resumeTimer}
              >
                <Play className="h-5 w-5" />
                Resume
              </Button>
            </>
          ) : timerState === "focus" ? (
            <>
              <Button
                variant="outline"
                size="lg"
                className="gap-2 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
                onClick={giveUp}
              >
                <X className="h-5 w-5" />
                Give Up
              </Button>
              <Button
                size="lg"
                className="gap-2 bg-slate-800 hover:bg-slate-900 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                onClick={pauseTimer}
              >
                <Pause className="h-5 w-5" />
                Pause
              </Button>
            </>
          ) : (
            // Break state - just show the timer, no controls needed
            <div className="flex flex-col items-center">
              <p className={cn("text-sm font-medium", config.color)}>
                {breakType === "long" ? "Enjoy your long break!" : "Take a quick breather"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Timer will auto-reset when complete
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
