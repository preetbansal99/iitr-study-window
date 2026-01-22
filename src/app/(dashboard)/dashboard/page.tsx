"use client";

import { useState, useEffect } from "react";
import { FocusTimer } from "@/components/dashboard/focus-timer";
import { TaskList } from "@/components/dashboard/task-list";
import { ProgressTracker } from "@/components/dashboard/progress-tracker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  CalendarDays,
  BookOpen,
  Clock,
  Brain,
  BarChart3,
  Calendar,
  ChevronRight,
  Sun,
  Moon,
  Sunset,
} from "lucide-react";
import { useUserStore } from "@/stores/user-store";

// Demo data
const DEMO_SCHEDULE = [
  { id: "1", subject_name: "Data Structures", type: "Lecture", start_time: "09:00", end_time: "10:00", room_number: "LH-101", color: "#3b82f6" },
  { id: "2", subject_name: "Computer Networks", type: "Tutorial", start_time: "11:00", end_time: "12:00", room_number: "LH-205", color: "#10b981" },
  { id: "3", subject_name: "Operating Systems", type: "Practical", start_time: "14:00", end_time: "16:00", room_number: "Lab-3", color: "#f59e0b" },
  { id: "4", subject_name: "Algorithm Design", type: "Lecture", start_time: "16:00", end_time: "17:00", room_number: "LH-102", color: "#8b5cf6" },
];

const DEMO_EVENTS = [
  { id: "1", title: "Mid-Semester Exam", date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], type: "Exam", color: "#ef4444" },
  { id: "2", title: "Project Submission", date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], type: "Deadline", color: "#f59e0b" },
  { id: "3", title: "Hackathon", date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], type: "Event", color: "#10b981" },
];

// Branch to course code mapping for personalized suggestions
const BRANCH_COURSES: Record<string, string> = {
  ee: "EEC-206",
  ece: "ECN-104",
  cse: "CSN-221",
  me: "MEN-203",
  ce: "CEN-101",
  che: "CHN-201",
  bt: "BTN-102",
  arch: "ARN-102",
  meta: "MTN-101",
  phy: "PHN-101",
};

// Get greeting based on time
function getGreeting(): { text: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good morning", icon: Sun };
  if (hour < 17) return { text: "Good afternoon", icon: Sunset };
  return { text: "Good evening", icon: Moon };
}

export default function DashboardPage() {
  const [showAllTasks, setShowAllTasks] = useState(false);
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  // Get user profile for personalized greeting
  const { profile } = useUserStore();

  // Use username if available, fallback to "Student"
  const displayName = profile?.username
    ? profile.username.split("_")[0].charAt(0).toUpperCase() + profile.username.split("_")[0].slice(1)
    : profile?.fullName?.split(" ")[0] || "Student";

  // Get personalized course suggestion based on branch
  const suggestedCourse = profile?.branchName ? BRANCH_COURSES[profile.branchName as keyof typeof BRANCH_COURSES] : null;

  // Encouraging message based on time of day
  const encouragingMessage = suggestedCourse
    ? `Let's focus on ${suggestedCourse} today.`
    : "Ready to focus?";

  return (
    <div className="p-4 lg:p-8">
      <Tabs defaultValue="focus" className="w-full">
        {/* Tab Navigation */}
        <TabsList className="mb-8 grid w-full max-w-md grid-cols-3 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <TabsTrigger
            value="focus"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
          >
            <Brain className="h-4 w-4" />
            Focus
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
          >
            <Calendar className="h-4 w-4" />
            Schedule
          </TabsTrigger>
          <TabsTrigger
            value="insights"
            className="gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900"
          >
            <BarChart3 className="h-4 w-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* ==================== FOCUS TAB ==================== */}
        <TabsContent value="focus" className="mt-0">
          {/* Zen Header */}
          <div className="mb-10 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 dark:bg-indigo-950">
              <GreetingIcon className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
                {greeting.text}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl">
              {greeting.text}, {displayName}!
            </h1>
            <p className="mt-2 text-lg text-slate-500">{encouragingMessage}</p>
          </div>

          {/* Centered Timer */}
          <div className="mx-auto mb-10 max-w-md">
            <FocusTimer />
          </div>

          {/* Things in Progress - Top 3 Only */}
          <Card className="rounded-xl border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                Things in Progress
              </CardTitle>
              <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 text-indigo-600">
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>All Tasks</DialogTitle>
                  </DialogHeader>
                  <div className="max-h-96 overflow-y-auto">
                    <TaskList />
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <TaskList maxItems={3} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ==================== SCHEDULE TAB ==================== */}
        <TabsContent value="schedule" className="mt-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">
              Your Schedule
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Plan your time and manage events
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Today's Schedule */}
            <Card className="rounded-xl border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Today&apos;s Classes
                </CardTitle>
                <Badge variant="secondary">{DEMO_SCHEDULE.length} classes</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_SCHEDULE.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 rounded-xl border border-border/50 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <div
                        className="h-14 w-1.5 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {entry.subject_name}
                        </p>
                        <div className="flex items-center gap-3 text-sm text-slate-500">
                          <span>{entry.type}</span>
                          {entry.room_number && (
                            <>
                              <span>•</span>
                              <span>{entry.room_number}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {entry.start_time}
                        </p>
                        <p className="text-sm text-slate-500">{entry.end_time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="rounded-xl border-border/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="h-5 w-5 text-purple-600" />
                  Upcoming Events
                </CardTitle>
                <Badge variant="secondary">{DEMO_EVENTS.length} events</Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {DEMO_EVENTS.map((event) => {
                    const eventDate = new Date(event.date);
                    const isToday = eventDate.toDateString() === new Date().toDateString();
                    const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();

                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-xl border border-border/50 p-4 transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        <div
                          className="flex h-14 w-14 flex-col items-center justify-center rounded-xl text-white"
                          style={{ backgroundColor: event.color }}
                        >
                          <span className="text-xs font-medium uppercase">
                            {eventDate.toLocaleDateString("en", { month: "short" })}
                          </span>
                          <span className="text-xl font-bold leading-none">
                            {eventDate.getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Badge variant="outline" className="text-xs">
                              {event.type}
                            </Badge>
                            {isToday && (
                              <span className="font-medium text-red-500">Today</span>
                            )}
                            {isTomorrow && (
                              <span className="font-medium text-orange-500">Tomorrow</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== INSIGHTS TAB ==================== */}
        <TabsContent value="insights" className="mt-0">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">
              Your Insights
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Track your progress and performance
            </p>
          </div>

          <ProgressTracker />
        </TabsContent>
      </Tabs>
    </div>
  );
}
