"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskStore } from "@/stores/task-store";
import { Plus, Trash2, ListTodo, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskListProps {
  maxItems?: number;
  showCard?: boolean;
  suggestedTasks?: string[];
}

export function TaskList({ maxItems, showCard = false, suggestedTasks = [] }: TaskListProps) {
  const { tasks, isLoading, fetchTasks, addTask, deleteTask, toggleComplete } = useTaskStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    await performAddTask(newTaskTitle.trim());
    setNewTaskTitle("");
  };

  const performAddTask = async (title: string) => {
    setIsAdding(true);
    await addTask({
      title: title,
      description: null,
      is_completed: false,
      due_date: null,
      priority: null,
      linked_subject: null,
    });
    setIsAdding(false);
  };

  const handleDismissSuggestion = (title: string) => {
    setDismissedSuggestions([...dismissedSuggestions, title]);
  };

  const pendingTasks = tasks.filter((t) => !t.is_completed);
  const completedTasks = tasks.filter((t) => t.is_completed);

  // Filter suggestions: exclude if already exists in tasks or dismissed
  const activeSuggestions = suggestedTasks.filter(
    (suggestion) =>
      !tasks.some((t) => t.title === suggestion) &&
      !dismissedSuggestions.includes(suggestion)
  );

  // Apply maxItems limit if specified
  const displayPendingTasks = maxItems ? pendingTasks.slice(0, maxItems) : pendingTasks;
  const displayCompletedTasks = maxItems ? [] : completedTasks; // Hide completed in compact mode

  const content = (
    <div className="space-y-4">
      {/* Suggestions Section */}
      {activeSuggestions.length > 0 && (
        <div className="mb-4 space-y-2">
          <h4 className="text-xs font-semibold uppercase text-indigo-500">Suggested for you</h4>
          {activeSuggestions.map((suggestion) => (
            <div key={suggestion} className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50/50 p-2 dark:border-indigo-900 dark:bg-indigo-950/30">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{suggestion}</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  onClick={() => handleDismissSuggestion(suggestion)}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={() => performAddTask(suggestion)}
                >
                  Add
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add task form */}
      <form onSubmit={handleAddTask} className="flex gap-2">
        <Input
          placeholder="Add a quick task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={isAdding || !newTaskTitle.trim()}>
          {isAdding ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </form>

      {/* Task list */}
      <div className={maxItems ? "" : "max-h-[280px] overflow-y-auto pr-2"}>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : tasks.length === 0 && activeSuggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ListTodo className="mb-2 h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500">No tasks yet</p>
            <p className="text-xs text-slate-400">Add your first task above</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Pending tasks */}
            {displayPendingTasks.map((task) => (
              <div
                key={task.id}
                className="group flex items-center gap-3 rounded-xl border border-border/50 bg-white p-3 transition-all hover:border-slate-300 hover:shadow-sm dark:bg-slate-800"
              >
                <Checkbox
                  checked={task.is_completed}
                  onCheckedChange={() => toggleComplete(task.id)}
                  className="h-5 w-5"
                />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200">
                  {task.title}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => deleteTask(task.id)}
                >
                  <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                </Button>
              </div>
            ))}

            {/* Show remaining count if limited */}
            {maxItems && pendingTasks.length > maxItems && (
              <p className="text-center text-sm text-slate-500">
                +{pendingTasks.length - maxItems} more tasks
              </p>
            )}

            {/* Completed tasks (only in full mode) */}
            {displayCompletedTasks.length > 0 && (
              <>
                <div className="py-2">
                  <span className="text-xs font-medium text-slate-400">
                    Completed ({completedTasks.length})
                  </span>
                </div>
                {displayCompletedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <Checkbox
                      checked={task.is_completed}
                      onCheckedChange={() => toggleComplete(task.id)}
                      className="h-5 w-5"
                    />
                    <span
                      className={cn(
                        "flex-1 text-sm text-slate-400 line-through dark:text-slate-500"
                      )}
                    >
                      {task.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card className="rounded-xl border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo className="h-5 w-5 text-blue-600" />
            Quick Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>{content}</CardContent>
      </Card>
    );
  }

  return content;
}
