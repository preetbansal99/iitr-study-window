import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Task } from "@/lib/types";

// Demo mode check
const isDemoMode = typeof window !== "undefined" && !process.env.NEXT_PUBLIC_SUPABASE_URL;

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

// Initial demo tasks
const DEMO_TASKS: Task[] = [
  {
    id: "demo-1",
    user_id: "demo",
    title: "Complete DSA Assignment",
    description: null,
    is_completed: false,
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    priority: "high",
    linked_subject: "Data Structures",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    user_id: "demo",
    title: "Read Chapter 5 - OS",
    description: null,
    is_completed: false,
    due_date: null,
    priority: "medium",
    linked_subject: "Operating Systems",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-3",
    user_id: "demo",
    title: "Submit lab report",
    description: null,
    is_completed: true,
    due_date: null,
    priority: "low",
    linked_subject: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      isLoading: false,
      error: null,

      fetchTasks: async () => {
        set({ isLoading: true, error: null });
        
        // Demo mode - use local storage tasks
        if (isDemoMode || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const storedTasks = get().tasks;
          if (storedTasks.length === 0) {
            set({ tasks: DEMO_TASKS, isLoading: false });
          } else {
            set({ isLoading: false });
          }
          return;
        }

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

        // Demo mode - add locally
        if (isDemoMode || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          const newTask: Task = {
            ...task,
            id: `demo-${Date.now()}`,
            user_id: "demo",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          set((state) => ({
            tasks: [newTask, ...state.tasks],
            isLoading: false,
          }));
          return;
        }

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
        // Demo mode - update locally
        if (isDemoMode || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id ? { ...task, ...updates, updated_at: new Date().toISOString() } : task
            ),
          }));
          return;
        }

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
        // Demo mode - delete locally
        if (isDemoMode || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }));
          return;
        }

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
