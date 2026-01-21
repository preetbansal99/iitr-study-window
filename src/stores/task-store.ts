import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "@/lib/types";

interface TaskState {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, "id" | "user_id" | "created_at" | "updated_at">) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
}



export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

      fetchTasks: async () => {
        set({ isLoading: true, error: null });

        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: false });

          if (error) throw error;
          set({ tasks: data || [], isLoading: false });
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      addTask: async (task) => {
        set({ isLoading: true, error: null });

        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) throw new Error("Not authenticated");

          const { data, error } = await supabase
            .from("tasks")
            .insert([{ ...task, user_id: user.id }])
            .select()
            .single();

          if (error) throw error;

          set((state) => ({
            tasks: [data, ...state.tasks],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: (error as Error).message, isLoading: false });
        }
      },

      updateTask: async (id, updates) => {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { error } = await supabase.from("tasks").update(updates).eq("id", id);

          if (error) throw error;

          set((state) => ({
            tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      deleteTask: async (id) => {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { error } = await supabase.from("tasks").delete().eq("id", id);

          if (error) throw error;

          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }));
        } catch (error) {
          set({ error: (error as Error).message });
        }
      },

      toggleComplete: async (id) => {
        const task = get().tasks.find((t) => t.id === id);
        if (task) {
          await get().updateTask(id, { is_completed: !task.is_completed });
        }
      },
    }),
    {
      name: "study-tasks-storage",
      partialize: (state) => ({
        tasks: state.tasks,
      }),
    }
  )
);
