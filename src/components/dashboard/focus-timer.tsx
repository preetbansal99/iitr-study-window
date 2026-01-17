"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTimerStore } from "@/stores/timer-store";
import { Play, Pause, RotateCcw, Coffee, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function FocusTimer() {
  const {
    timeRemaining,
    isRunning,
    mode,
    completedSessions,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    switchMode,
  } = useTimerStore();

  // Timer tick effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        tick();
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, tick]);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  const formatTime = (num: number) => num.toString().padStart(2, "0");

  const modeConfig = {
    focus: {
      label: "Focus Time",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      icon: Brain,
      ringColor: "stroke-blue-500",
    },
    shortBreak: {
      label: "Short Break",
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
      icon: Coffee,
      ringColor: "stroke-green-500",
    },
    longBreak: {
      label: "Long Break",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      icon: Sparkles,
      ringColor: "stroke-purple-500",
    },
  };

  const currentMode = modeConfig[mode];
  const ModeIcon = currentMode.icon;

  // Calculate progress for circular indicator
  const getDuration = () => {
    const store = useTimerStore.getState();
    switch (mode) {
      case "focus":
        return store.focusDuration * 60;
      case "shortBreak":
        return store.shortBreakDuration * 60;
      case "longBreak":
        return store.longBreakDuration * 60;
    }
  };

  const progress = (timeRemaining / getDuration()) * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <Card className="overflow-hidden">
      <CardHeader className={cn("pb-2", currentMode.bgColor)}>
        <CardTitle className={cn("flex items-center gap-2 text-lg", currentMode.color)}>
          <ModeIcon className="h-5 w-5" />
          {currentMode.label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center py-6">
        {/* Timer Circle */}
        <div className="relative mb-6">
          <svg className="h-48 w-48 -rotate-90 transform">
            {/* Background circle */}
            <circle
              cx="96"
              cy="96"
              r="80"
              className="fill-none stroke-slate-200 dark:stroke-slate-700"
              strokeWidth="8"
            />
            {/* Progress circle */}
            <circle
              cx="96"
              cy="96"
              r="80"
              className={cn("fill-none transition-all duration-300", currentMode.ringColor)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-4xl font-bold text-slate-900 dark:text-white">
              {formatTime(minutes)}:{formatTime(seconds)}
            </span>
            <span className="text-sm text-slate-500">
              Session {completedSessions + 1}
            </span>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={resetTimer}>
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            size="lg"
            className={cn(
              "h-14 w-14 rounded-full shadow-lg transition-all hover:scale-105",
              isRunning
                ? "bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200"
                : "bg-blue-600 hover:bg-blue-700"
            )}
            onClick={isRunning ? pauseTimer : startTimer}
          >
            {isRunning ? (
              <Pause className="h-6 w-6 text-white dark:text-slate-900" />
            ) : (
              <Play className="h-6 w-6 translate-x-0.5 text-white" />
            )}
          </Button>

          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>

        {/* Mode switcher */}
        <div className="mt-6 flex gap-2">
          {(["focus", "shortBreak", "longBreak"] as const).map((m) => (
            <Button
              key={m}
              variant={mode === m ? "default" : "ghost"}
              size="sm"
              onClick={() => switchMode(m)}
              className={cn(
                "text-xs",
                mode === m && m === "focus" && "bg-blue-600 hover:bg-blue-700",
                mode === m && m === "shortBreak" && "bg-green-600 hover:bg-green-700",
                mode === m && m === "longBreak" && "bg-purple-600 hover:bg-purple-700"
              )}
            >
              {m === "focus" ? "Focus" : m === "shortBreak" ? "Short" : "Long"}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
