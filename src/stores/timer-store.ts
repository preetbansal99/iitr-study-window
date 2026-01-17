import { create } from "zustand";
import { persist } from "zustand/middleware";

interface TimerState {
  // Timer state
  timeRemaining: number; // in seconds
  isRunning: boolean;
  mode: "focus" | "shortBreak" | "longBreak";

  // Settings
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;

  // Session tracking
  completedSessions: number;

  // Actions
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  tick: () => void;
  switchMode: (mode: "focus" | "shortBreak" | "longBreak") => void;
  updateSettings: (settings: Partial<TimerSettings>) => void;
}

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set, get) => ({
      // Initial state
      timeRemaining: 25 * 60, // 25 minutes in seconds
      isRunning: false,
      mode: "focus",

      // Default settings
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,

      // Session tracking
      completedSessions: 0,

      // Actions
      startTimer: () => set({ isRunning: true }),

      pauseTimer: () => set({ isRunning: false }),

      resetTimer: () => {
        const state = get();
        let duration: number;

        switch (state.mode) {
          case "focus":
            duration = state.focusDuration;
            break;
          case "shortBreak":
            duration = state.shortBreakDuration;
            break;
          case "longBreak":
            duration = state.longBreakDuration;
            break;
        }

        set({
          timeRemaining: duration * 60,
          isRunning: false,
        });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning) return;

        if (state.timeRemaining <= 0) {
          // Timer completed
          let nextMode: "focus" | "shortBreak" | "longBreak";
          let nextDuration: number;
          let completedSessions = state.completedSessions;

          if (state.mode === "focus") {
            completedSessions += 1;
            // Check if it's time for a long break
            if (completedSessions % state.sessionsUntilLongBreak === 0) {
              nextMode = "longBreak";
              nextDuration = state.longBreakDuration;
            } else {
              nextMode = "shortBreak";
              nextDuration = state.shortBreakDuration;
            }
          } else {
            // After any break, go back to focus
            nextMode = "focus";
            nextDuration = state.focusDuration;
          }

          set({
            mode: nextMode,
            timeRemaining: nextDuration * 60,
            isRunning: false,
            completedSessions,
          });

          // Play notification sound or show notification here
          if (typeof window !== "undefined" && "Notification" in window) {
            if (Notification.permission === "granted") {
              new Notification(
                nextMode === "focus" ? "Break over! Time to focus." : "Great work! Take a break."
              );
            }
          }
        } else {
          set({ timeRemaining: state.timeRemaining - 1 });
        }
      },

      switchMode: (mode) => {
        const state = get();
        let duration: number;

        switch (mode) {
          case "focus":
            duration = state.focusDuration;
            break;
          case "shortBreak":
            duration = state.shortBreakDuration;
            break;
          case "longBreak":
            duration = state.longBreakDuration;
            break;
        }

        set({
          mode,
          timeRemaining: duration * 60,
          isRunning: false,
        });
      },

      updateSettings: (settings) => {
        const state = get();
        const newState = { ...state, ...settings };

        // Also update timeRemaining if we're updating the current mode's duration
        let timeRemaining = state.timeRemaining;
        if (settings.focusDuration && state.mode === "focus" && !state.isRunning) {
          timeRemaining = settings.focusDuration * 60;
        } else if (settings.shortBreakDuration && state.mode === "shortBreak" && !state.isRunning) {
          timeRemaining = settings.shortBreakDuration * 60;
        } else if (settings.longBreakDuration && state.mode === "longBreak" && !state.isRunning) {
          timeRemaining = settings.longBreakDuration * 60;
        }

        set({ ...newState, timeRemaining });
      },
    }),
    {
      name: "study-timer-storage",
      partialize: (state) => ({
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        completedSessions: state.completedSessions,
      }),
    }
  )
);
