import { createClient } from "@/lib/supabase/server";
import { FocusTimer } from "@/components/dashboard/focus-timer";
import { TaskList } from "@/components/dashboard/task-list";
import { QuickStats } from "@/components/dashboard/quick-stats";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, BookOpen, Clock } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

// Demo data for when Supabase is not configured
const DEMO_SCHEDULE = [
  {
    id: "1",
    subject_name: "Data Structures",
    type: "Lecture",
    start_time: "09:00",
    end_time: "10:00",
    room_number: "LH-101",
    color: "#3b82f6",
  },
  {
    id: "2",
    subject_name: "Computer Networks",
    type: "Tutorial",
    start_time: "11:00",
    end_time: "12:00",
    room_number: "LH-205",
    color: "#10b981",
  },
  {
    id: "3",
    subject_name: "Operating Systems",
    type: "Practical",
    start_time: "14:00",
    end_time: "16:00",
    room_number: "Lab-3",
    color: "#f59e0b",
  },
];

const DEMO_EVENTS = [
  {
    id: "1",
    title: "Mid-Semester Exam",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "Exam",
    color: "#ef4444",
  },
  {
    id: "2",
    title: "Project Submission",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    type: "Deadline",
    color: "#f59e0b",
  },
];

export default async function DashboardPage() {
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  let firstName = "Student";
  let todaySchedule = DEMO_SCHEDULE;
  let upcomingEvents = DEMO_EVENTS;

  if (!isDemoMode) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Get user profile
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", user?.id)
      .single();

    // Get today's timetable
    const today = new Date().getDay();
    const { data: schedule } = await supabase
      .from("timetable")
      .select("*")
      .eq("user_id", user?.id)
      .eq("day_of_week", today)
      .order("start_time", { ascending: true });

    // Get upcoming events (next 7 days)
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const { data: events } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user?.id)
      .gte("date", now.toISOString().split("T")[0])
      .lte("date", nextWeek.toISOString().split("T")[0])
      .order("date", { ascending: true })
      .limit(5);

    firstName = profile?.full_name?.split(" ")[0] || "Student";
    todaySchedule = schedule || [];
    upcomingEvents = events || [];
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Here&apos;s your study command center for today.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-8">
        <QuickStats />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Timer & Tasks */}
        <div className="space-y-6 lg:col-span-1">
          <FocusTimer />
          <TaskList />
        </div>

        {/* Right Column - Schedule & Events */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-blue-600" />
                Today&apos;s Schedule
              </CardTitle>
              <Link
                href="/timetable"
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {!todaySchedule || todaySchedule.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="mb-2 h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">No classes scheduled for today</p>
                  <Link
                    href="/timetable"
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Set up your timetable
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {todaySchedule.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                    >
                      <div
                        className="h-12 w-1 rounded-full"
                        style={{ backgroundColor: entry.color || "#3b82f6" }}
                      />
                      <div className="flex-1">
                        <p className="font-medium text-slate-900 dark:text-white">
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
                        <p className="font-medium text-slate-900 dark:text-white">
                          {entry.start_time?.slice(0, 5)}
                        </p>
                        <p className="text-sm text-slate-500">
                          {entry.end_time?.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-purple-600" />
                Upcoming Events
              </CardTitle>
              <Link
                href="/calendar"
                className="text-sm text-blue-600 hover:underline"
              >
                View calendar
              </Link>
            </CardHeader>
            <CardContent>
              {!upcomingEvents || upcomingEvents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="mb-2 h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">No upcoming events</p>
                  <Link
                    href="/calendar"
                    className="mt-2 text-sm text-blue-600 hover:underline"
                  >
                    Add an event
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    const isToday =
                      eventDate.toDateString() === new Date().toDateString();
                    const isTomorrow =
                      eventDate.toDateString() ===
                      new Date(Date.now() + 86400000).toDateString();

                    return (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                      >
                        <div
                          className="flex h-12 w-12 flex-col items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: event.color || "#10b981" }}
                        >
                          <span className="text-xs font-medium uppercase">
                            {eventDate.toLocaleDateString("en", { month: "short" })}
                          </span>
                          <span className="text-lg font-bold leading-none">
                            {eventDate.getDate()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-900 dark:text-white">
                            {event.title}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
                              {event.type}
                            </span>
                            {isToday && (
                              <span className="text-red-500 font-medium">Today</span>
                            )}
                            {isTomorrow && (
                              <span className="text-orange-500 font-medium">Tomorrow</span>
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

          {/* Quick Links */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Link href="/resources">
              <Card className="transition-all hover:border-blue-300 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Resource Hub
                    </p>
                    <p className="text-sm text-slate-500">
                      Find notes, papers & contacts
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Link href="/timetable">
              <Card className="transition-all hover:border-green-300 hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-green-50 p-3 dark:bg-green-950">
                    <CalendarDays className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Weekly Timetable
                    </p>
                    <p className="text-sm text-slate-500">
                      Manage your class schedule
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
