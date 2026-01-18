import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Focus Timer State Machine with Session History
 * ==============================================
 * States: IDLE → FOCUS → BREAK → IDLE
 * + Session history tracking for completed sessions
 */

type TimerState = "idle" | "focus" | "break" | "paused";
type BreakType = "short" | "long";

export interface SessionRecord {
  id: string;
  date: string;
  taskName: string | null;
  durationMinutes: number;
  timestampEnd: number;
  completed: boolean;
}

interface TimerStore {
  // State Machine
  timerState: TimerState;
  breakType: BreakType;

  // Timer values
  timeRemaining: number; // in seconds
  lastTickAt: number; // timestamp for persistence
  sessionStartedAt: number; // when current session started

  // Settings (in minutes)
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;

  // Session tracking
  completedSessions: number;
  linkedTaskName: string | null;
  sessionHistory: SessionRecord[];

  // Actions
  startFocus: (taskName?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  giveUp: () => void;
  tick: () => void;
  restoreState: () => void;
  setLinkedTask: (taskName: string | null) => void;
  clearHistory: () => void;
  updateSettings: (settings: Partial<{
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsUntilLongBreak: number;
  }>) => void;
}

// Helper to send browser notification
const sendNotification = (title: string, body: string) => {
  if (typeof window !== "undefined" && "Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          new Notification(title, { body, icon: "/favicon.ico" });
        }
      });
    }
  }
};

// Generate unique ID
const generateId = () => `session-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      timerState: "idle",
      breakType: "short",
      timeRemaining: 25 * 60,
      lastTickAt: 0,
      sessionStartedAt: 0,

      // Default settings
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,

      // Session tracking
      completedSessions: 0,
      linkedTaskName: null,
      sessionHistory: [],

      // Start a focus session
      startFocus: (taskName?: string) => {
        const { focusDuration } = get();
        set({
          timerState: "focus",
          timeRemaining: focusDuration * 60,
          lastTickAt: Date.now(),
          sessionStartedAt: Date.now(),
          linkedTaskName: taskName || null,
        });
      },

      // Pause (only during focus)
      pauseTimer: () => {
        const { timerState } = get();
        if (timerState === "focus") {
          set({ timerState: "paused", lastTickAt: 0 });
        }
      },

      // Resume from paused
      resumeTimer: () => {
        const { timerState } = get();
        if (timerState === "paused") {
          set({ timerState: "focus", lastTickAt: Date.now() });
        }
      },

      // Give up / reset to idle - save session if > 1 min
      giveUp: () => {
        const state = get();
        const { focusDuration, sessionStartedAt, linkedTaskName, sessionHistory } = state;

        // Calculate how long they worked
        if (sessionStartedAt > 0) {
          const elapsedMinutes = Math.floor((Date.now() - sessionStartedAt) / 60000);

          // Only save if they worked for more than 1 minute
          if (elapsedMinutes >= 1) {
            const record: SessionRecord = {
              id: generateId(),
              date: new Date().toISOString().split("T")[0],
              taskName: linkedTaskName,
              durationMinutes: elapsedMinutes,
              timestampEnd: Date.now(),
              completed: false, // abandoned
            };
            set({ sessionHistory: [record, ...sessionHistory].slice(0, 50) });
          }
        }

        set({
          timerState: "idle",
          timeRemaining: focusDuration * 60,
          lastTickAt: 0,
          sessionStartedAt: 0,
          linkedTaskName: null,
        });
      },

      // Set linked task
      setLinkedTask: (taskName) => {
        set({ linkedTaskName: taskName });
      },

      // Clear session history
      clearHistory: () => {
        set({ sessionHistory: [] });
      },

      // Tick - called every second
      tick: () => {
        const state = get();

        // Only tick if running (focus or break)
        if (state.timerState !== "focus" && state.timerState !== "break") {
          return;
        }

        if (state.timeRemaining <= 1) {
          // Timer complete
          if (state.timerState === "focus") {
            // Save completed session
            const record: SessionRecord = {
              id: generateId(),
              date: new Date().toISOString().split("T")[0],
              taskName: state.linkedTaskName,
              durationMinutes: state.focusDuration,
              timestampEnd: Date.now(),
              completed: true,
            };

            // Focus complete → Auto-start break
            const newCompletedSessions = state.completedSessions + 1;
            const isLongBreak = newCompletedSessions % state.sessionsUntilLongBreak === 0;
            const breakDuration = isLongBreak
              ? state.longBreakDuration
              : state.shortBreakDuration;

            set({
              timerState: "break",
              breakType: isLongBreak ? "long" : "short",
              timeRemaining: breakDuration * 60,
              completedSessions: newCompletedSessions,
              lastTickAt: Date.now(),
              sessionStartedAt: 0,
              sessionHistory: [record, ...state.sessionHistory].slice(0, 50),
            });

            sendNotification(
              "Focus Complete! 🎉",
              `Great work! ${isLongBreak ? "Long" : "Short"} break starting now.`
            );
          } else {
            // Break complete → Return to idle
            set({
              timerState: "idle",
              timeRemaining: state.focusDuration * 60,
              lastTickAt: 0,
              sessionStartedAt: 0,
              linkedTaskName: null,
            });

            sendNotification(
              "Break Over! ⏰",
              "Ready for another focus session?"
            );
          }
        } else {
          set({
            timeRemaining: state.timeRemaining - 1,
            lastTickAt: Date.now(),
          });
        }
      },

      // Restore state on page load (handle refresh)
      restoreState: () => {
        const state = get();

        // If timer was running, calculate elapsed time
        if (state.lastTickAt > 0 && (state.timerState === "focus" || state.timerState === "break")) {
          const elapsedSeconds = Math.floor((Date.now() - state.lastTickAt) / 1000);
          const newTimeRemaining = Math.max(0, state.timeRemaining - elapsedSeconds);

          if (newTimeRemaining <= 0) {
            // Timer would have completed - handle transition
            if (state.timerState === "focus") {
              // Save completed session
              const record: SessionRecord = {
                id: generateId(),
                date: new Date().toISOString().split("T")[0],
                taskName: state.linkedTaskName,
                durationMinutes: state.focusDuration,
                timestampEnd: Date.now(),
                completed: true,
              };

              const newCompletedSessions = state.completedSessions + 1;
              const isLongBreak = newCompletedSessions % state.sessionsUntilLongBreak === 0;
              const breakDuration = isLongBreak
                ? state.longBreakDuration
                : state.shortBreakDuration;

              set({
                timerState: "break",
                breakType: isLongBreak ? "long" : "short",
                timeRemaining: breakDuration * 60,
                completedSessions: newCompletedSessions,
                lastTickAt: Date.now(),
                sessionStartedAt: 0,
                sessionHistory: [record, ...state.sessionHistory].slice(0, 50),
              });
            } else {
              set({
                timerState: "idle",
                timeRemaining: state.focusDuration * 60,
                lastTickAt: 0,
                sessionStartedAt: 0,
              });
            }
          } else {
            set({
              timeRemaining: newTimeRemaining,
              lastTickAt: Date.now(),
            });
          }
        }
      },

      // Update settings
      updateSettings: (settings) => {
        const state = get();
        const newState = { ...settings };

        // If idle, update timeRemaining to match new focus duration
        if (state.timerState === "idle" && settings.focusDuration) {
          set({ ...newState, timeRemaining: settings.focusDuration * 60 });
        } else {
          set(newState);
        }
      },
    }),
    {
      name: "focus-timer-storage",
      // Persist everything for seamless restore
      partialize: (state) => ({
        timerState: state.timerState,
        breakType: state.breakType,
        timeRemaining: state.timeRemaining,
        lastTickAt: state.lastTickAt,
        sessionStartedAt: state.sessionStartedAt,
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        completedSessions: state.completedSessions,
        linkedTaskName: state.linkedTaskName,
        sessionHistory: state.sessionHistory,
      }),
    }
  )
);

// Helper to get today's total focus time
export function getTodayFocusTime(history: SessionRecord[]): number {
  const today = new Date().toISOString().split("T")[0];
  return history
    .filter((s) => s.date === today && s.completed)
    .reduce((sum, s) => sum + s.durationMinutes, 0);
}
