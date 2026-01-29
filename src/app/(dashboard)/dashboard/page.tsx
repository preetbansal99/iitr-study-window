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
  Plus,
  AlertCircle,
  Coffee,
  GraduationCap
} from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import { useUserStore } from "@/stores/user-store";
import { createClient } from "@/lib/supabase/client";
import type { TimetableEntry, Event, AcademicEvent } from "@/lib/types";
import { resolveAcademicDay, getTimetableDay } from "@/lib/academic-calendar";

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

  // Real schedule data from Supabase
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [academicEvents, setAcademicEvents] = useState<AcademicEvent[]>([]);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(true);
  const [academicState, setAcademicState] = useState<string>("NORMAL_TEACHING_DAY");
  const [timetableDayName, setTimetableDayName] = useState<string>("");

  // Fetch real schedule data
  useEffect(() => {
    const fetchScheduleData = async () => {
      setIsLoadingSchedule(true);
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setIsLoadingSchedule(false);
        return;
      }

      // 1. Fetch Academic Events first to determine day state
      const { data: academicData } = await supabase
        .from("academic_calendar_events")
        .select("*")
        .eq("semester", "Spring 2025-26");

      const allAcademicEvents = (academicData as AcademicEvent[]) || [];
      setAcademicEvents(allAcademicEvents);

      const todayDate = new Date();
      const state = resolveAcademicDay(todayDate, allAcademicEvents);
      setAcademicState(state);

      // 2. Determine effective timetable day
      let dayIndex = todayDate.getDay();

      if (state === 'TIMETABLE_OVERRIDE_DAY') {
        dayIndex = getTimetableDay(todayDate, allAcademicEvents);
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        setTimetableDayName(days[dayIndex]);
      } else if (state === 'HOLIDAY' || state === 'EXAM_DAY' || state === 'EXAM_BREAK' || state === 'VACATION') {
        // No regular classes
        dayIndex = -1;
      }

      // 3. Fetch today's timetable entries if it's a teaching day
      if (dayIndex !== -1) {
        const { data: timetableData } = await supabase
          .from("timetable")
          .select("*")
          .eq("user_id", user.id)
          .eq("day_of_week", dayIndex)
          .order("start_time", { ascending: true });
        setTodaySchedule(timetableData || []);
      } else {
        setTodaySchedule([]);
      }

      // 4. Fetch upcoming events (next 30 days) - Both Personal & Academic
      const todayStr = todayDate.toISOString().split("T")[0];
      const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const { data: eventsData } = await supabase
        .from("events")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", todayStr)
        .lte("date", futureDate)
        .order("date", { ascending: true });

      setUpcomingEvents(eventsData || []);

      // 5. Merge Academic Events into Upcoming Events
      const upcomingAcademicEvents = allAcademicEvents.filter(e => {
        const startDate = new Date(e.start_date);
        return startDate >= todayDate && startDate <= new Date(futureDate);
      }).map(e => ({
        id: e.id,
        user_id: 'system',
        title: e.title,
        description: e.description,
        date: e.start_date,
        start_time: null,
        end_time: null,
        type: e.event_type === 'exam' ? 'Exam' : e.event_type === 'holiday' ? 'Other' : 'Other', // Type casting for display
        location: null,
        color: e.event_type === 'exam' ? '#ef4444' : e.event_type === 'holiday' ? '#f59e0b' : '#6366f1',
        reminder_before: null,
        created_at: e.created_at,
        updated_at: e.created_at
      } as Event));

      // Combine and sort by date
      const allUpcoming = [...(eventsData || []), ...upcomingAcademicEvents].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setUpcomingEvents(allUpcoming);
      setIsLoadingSchedule(false);
    };

    fetchScheduleData();
  }, []);

  // Use username if available, fallback to "Student"
  const displayName = profile?.username
    ? profile.username.split("_")[0].charAt(0).toUpperCase() + profile.username.split("_")[0].slice(1)
    : profile?.fullName?.split(" ")[0] || "Student";

  // Get personalized course suggestion based on branch
  const suggestedCourse = profile?.branchName ? BRANCH_COURSES[profile.branchName as keyof typeof BRANCH_COURSES] : null;

  // Encouraging message based on time of day and academic state
  let encouragingMessage;
  if (academicState === 'EXAM_DAY') {
    encouragingMessage = "Good luck with your exams! Stay focused.";
  } else if (academicState === 'HOLIDAY') {
    encouragingMessage = "Enjoy your holiday! Take a well-deserved break.";
  } else {
    encouragingMessage = suggestedCourse
      ? `Let's focus on ${suggestedCourse} today.`
      : "Ready to focus?";
  }

  // Calculate Suggestions
  const getSuggestions = () => {
    const today = new Date();
    let focusSuggestion = undefined;
    const taskSuggestions: string[] = [];

    // 1. Upcoming Exams check
    const upcomingExams = academicEvents.filter(e =>
      e.event_type === 'exam' &&
      new Date(e.start_date) > today
    ).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    if (upcomingExams.length > 0) {
      const nextExam = upcomingExams[0];
      const daysToExam = differenceInDays(parseISO(nextExam.start_date), today);

      if (daysToExam <= 7 && daysToExam > 0) {
        focusSuggestion = `${nextExam.title.split('(')[0].trim()} starts in ${daysToExam} days — plan focus sessions?`;
        if (daysToExam <= 5) {
          taskSuggestions.push(`Prepare for ${nextExam.title}`);
        }
      }
    }

    // 2. Feedback check
    const activeFeedback = academicEvents.find(e =>
      e.event_type === 'feedback' &&
      new Date(e.start_date) <= today &&
      new Date(e.end_date) >= today
    );

    if (activeFeedback) {
      taskSuggestions.push(`Submit ${activeFeedback.title}`);
    }

    return { focusSuggestion, taskSuggestions };
  };

  const { focusSuggestion, taskSuggestions } = getSuggestions();


  // Helper to render schedule content based on state
  const renderScheduleContent = () => {
    if (isLoadingSchedule) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (academicState === 'HOLIDAY') {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
          <Coffee className="h-10 w-10 text-amber-500 mb-3" />
          <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-400">No classes today</h3>
          <p className="text-sm text-amber-600 dark:text-amber-500">
            It&apos;s a holiday. Enjoy your time off!
          </p>
        </div>
      );
    }

    if (academicState === 'EXAM_DAY') {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Examination Day</h3>
          <p className="text-sm text-red-600 dark:text-red-500">
            Regular classes are suspended. Good luck!
          </p>
        </div>
      );
    }

    if (academicState === 'EXAM_BREAK' || academicState === 'VACATION') {
      return (
        <div className="flex flex-col items-center justify-center py-8 text-center bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
          <Coffee className="h-10 w-10 text-blue-500 mb-3" />
          <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Semester Break</h3>
          <p className="text-sm text-blue-600 dark:text-blue-500">
            No classes scheduled.
          </p>
        </div>
      );
    }

    // Normal Teaching Day or Timetable Override
    return (
      <CardContent className="p-0">
        {academicState === 'TIMETABLE_OVERRIDE_DAY' && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
            <AlertCircle className="h-4 w-4" />
            <span>Timetable Override: Following <strong>{timetableDayName}</strong> schedule today.</span>
          </div>
        )}
        {todaySchedule.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CalendarDays className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              No classes scheduled for today
            </p>
            <Button variant="outline" size="sm" asChild>
              <a href="/timetable" className="gap-2">
                <Plus className="h-4 w-4" />
                Add to Timetable
              </a>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {todaySchedule.map((entry) => (
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
        )}
      </CardContent>
    );
  };

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
          {/* Hero Section - Full width, centered, spacious */}
          <section className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F0F4F9] px-5 py-2.5 dark:bg-slate-800">
              <GreetingIcon className="h-5 w-5 text-[#4285F4]" />
              <span className="text-sm font-medium text-[#131314] dark:text-white">
                {greeting.text}
              </span>
            </div>
            <h1 className="text-4xl font-semibold tracking-tight text-[#131314] dark:text-white lg:text-5xl">
              {greeting.text}, {displayName}!
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-500">
              {encouragingMessage}
            </p>
          </section>

          {/* Centered Timer Section */}
          <section className="mx-auto mb-16 max-w-lg">
            <FocusTimer suggestion={focusSuggestion} />
          </section>

          {/* Tasks Section - Clean card with horizontal action buttons */}
          <section className="mx-auto max-w-3xl">
            <Card className="overflow-hidden rounded-2xl border-0 bg-[#F0F4F9]/50 shadow-sm dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/60 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4285F4]/10">
                    <Clock className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-[#131314] dark:text-white">
                    Things in Progress
                  </CardTitle>
                </div>
                {/* Horizontal action buttons */}
                <div className="flex items-center gap-2">
                  <Dialog open={showAllTasks} onOpenChange={setShowAllTasks}>
                    <DialogTrigger asChild>
                      <Button
                        variant="antigravity-secondary"
                        size="sm"
                        className="gap-1.5"
                      >
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
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <TaskList maxItems={3} suggestedTasks={taskSuggestions} />
              </CardContent>
            </Card>
          </section>
        </TabsContent>

        {/* ==================== SCHEDULE TAB ==================== */}
        <TabsContent value="schedule" className="mt-0">
          {/* Centered Hero Header */}
          <section className="mb-12 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[#131314] dark:text-white lg:text-5xl">
              Your Schedule
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-500">
              Plan your time and manage events
            </p>
          </section>

          <div className="mx-auto max-w-5xl grid gap-8 lg:grid-cols-2">
            {/* Today's Schedule */}
            <Card className="overflow-hidden rounded-2xl border-0 bg-[#F0F4F9]/50 shadow-sm dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/60 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4285F4]/10">
                    <CalendarDays className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-[#131314] dark:text-white">
                    Today&apos;s Classes
                  </CardTitle>
                </div>
                {academicState === 'NORMAL_TEACHING_DAY' && (
                  <Badge variant="secondary" className="bg-[#4285F4]/10 text-[#4285F4]">{todaySchedule.length} classes</Badge>
                )}
              </CardHeader>
              <div className="p-6">
                {renderScheduleContent()}
              </div>
            </Card>

            {/* Upcoming Events */}
            <Card className="overflow-hidden rounded-2xl border-0 bg-[#F0F4F9]/50 shadow-sm dark:bg-slate-900">
              <CardHeader className="flex flex-row items-center justify-between border-b border-slate-200/60 pb-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4285F4]/10">
                    <BookOpen className="h-5 w-5 text-[#4285F4]" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-[#131314] dark:text-white">
                    Upcoming Events
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="bg-[#4285F4]/10 text-[#4285F4]">{upcomingEvents.length} events</Badge>
              </CardHeader>
              <CardContent>
                {upcomingEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <BookOpen className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                      No upcoming events
                    </p>
                    <Button variant="outline" size="sm" asChild>
                      <a href="/calendar" className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add Event
                      </a>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingEvents.map((event) => {
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
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ==================== INSIGHTS TAB ==================== */}
        <TabsContent value="insights" className="mt-0">
          {/* Centered Hero Header */}
          <section className="mb-12 text-center">
            <h1 className="text-4xl font-semibold tracking-tight text-[#131314] dark:text-white lg:text-5xl">
              Your Insights
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-lg text-slate-500">
              Track your progress and performance
            </p>
          </section>

          <div className="mx-auto max-w-5xl">
            <ProgressTracker />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
