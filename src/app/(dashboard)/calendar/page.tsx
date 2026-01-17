"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Plus,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import type { Event, TimetableEntry } from "@/lib/types";
import { EVENT_TYPES, DAYS_OF_WEEK } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    type: "Personal" as Event["type"],
    location: "",
    color: "#10b981",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Fetch events
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", user?.id)
      .order("date", { ascending: true });

    // Fetch timetable
    const { data: timetableData } = await supabase
      .from("timetable")
      .select("*")
      .eq("user_id", user?.id);

    if (eventsData) setEvents(eventsData);
    if (timetableData) setTimetable(timetableData);
    setIsLoading(false);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setFormData({
      ...formData,
      date: format(date, "yyyy-MM-dd"),
    });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("events").insert([
      {
        ...formData,
        user_id: user?.id,
      },
    ]);

    if (!error) {
      setIsDialogOpen(false);
      setFormData({
        title: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        type: "Personal",
        location: "",
        color: "#10b981",
      });
      fetchData();
    }
    setIsSubmitting(false);
  };

  const handleDeleteEvent = async (id: string) => {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (!error) {
      fetchData();
    }
  };

  // Get calendar days
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Get events for a specific day
  const getEventsForDay = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.date), date));
  };

  // Get timetable entries for a day
  const getTimetableForDay = (date: Date) => {
    const dayOfWeek = date.getDay();
    return timetable.filter((entry) => entry.day_of_week === dayOfWeek);
  };

  // Get selected day's schedule
  const selectedDayEvents = selectedDate ? getEventsForDay(selectedDate) : [];
  const selectedDayTimetable = selectedDate ? getTimetableForDay(selectedDate) : [];

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Calendar
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            View your schedule and manage events
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Mid-semester Exam"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: Event["type"]) =>
                      setFormData({
                        ...formData,
                        type: value,
                        color: EVENT_TYPES[value].color,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(EVENT_TYPES).map(([key, { label, color }]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                            {label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData({ ...formData, start_time: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData({ ...formData, end_time: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Lecture Hall 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Event"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Calendar Grid */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                {format(currentMonth, "MMMM yyyy")}
              </CardTitle>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day headers */}
              <div className="mb-2 grid grid-cols-7 text-center text-sm font-medium text-slate-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const dayTimetable = getTimetableForDay(day);
                  const isToday = isSameDay(day, new Date());
                  const isCurrentMonth = isSameMonth(day, currentMonth);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={day.toString()}
                      onClick={() => handleDateClick(day)}
                      className={cn(
                        "relative flex min-h-[80px] flex-col rounded-lg border p-1 text-left transition-all hover:bg-slate-50 dark:hover:bg-slate-800",
                        !isCurrentMonth && "opacity-40",
                        isSelected &&
                          "border-blue-500 bg-blue-50 dark:bg-blue-950",
                        isToday &&
                          !isSelected &&
                          "border-blue-300 bg-blue-50/50 dark:border-blue-700"
                      )}
                    >
                      <span
                        className={cn(
                          "mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm",
                          isToday && "bg-blue-600 text-white"
                        )}
                      >
                        {format(day, "d")}
                      </span>

                      {/* Events indicators */}
                      <div className="flex flex-wrap gap-0.5">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                        ))}
                        {dayTimetable.slice(0, 2).map((entry) => (
                          <div
                            key={entry.id}
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                        ))}
                        {dayEvents.length + dayTimetable.length > 4 && (
                          <span className="text-[10px] text-slate-400">
                            +{dayEvents.length + dayTimetable.length - 4}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Details */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-purple-600" />
                {selectedDate
                  ? format(selectedDate, "EEEE, MMM d")
                  : "Select a day"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedDate ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Calendar className="mb-2 h-10 w-10 text-slate-300" />
                  <p className="text-sm text-slate-500">
                    Click on a day to see schedule
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {/* Timetable entries */}
                    {selectedDayTimetable.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Classes
                        </h4>
                        <div className="space-y-2">
                          {selectedDayTimetable.map((entry) => (
                            <div
                              key={entry.id}
                              className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                            >
                              <div
                                className="h-10 w-1 rounded-full"
                                style={{ backgroundColor: entry.color }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {entry.subject_name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {entry.start_time?.slice(0, 5)} -{" "}
                                  {entry.end_time?.slice(0, 5)}
                                  {entry.room_number && ` • ${entry.room_number}`}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {entry.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Events */}
                    {selectedDayEvents.length > 0 && (
                      <div>
                        <h4 className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
                          Events
                        </h4>
                        <div className="space-y-2">
                          {selectedDayEvents.map((event) => (
                            <div
                              key={event.id}
                              className="group flex items-center gap-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700"
                            >
                              <div
                                className="h-10 w-1 rounded-full"
                                style={{ backgroundColor: event.color }}
                              />
                              <div className="flex-1">
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {event.title}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {event.start_time?.slice(0, 5) || "All day"}
                                  {event.location && ` • ${event.location}`}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedDayEvents.length === 0 &&
                      selectedDayTimetable.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <CalendarDays className="mb-2 h-10 w-10 text-slate-300" />
                          <p className="text-sm text-slate-500">
                            No schedule for this day
                          </p>
                          <Button
                            variant="link"
                            className="mt-2"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                date: format(selectedDate, "yyyy-MM-dd"),
                              });
                              setIsDialogOpen(true);
                            }}
                          >
                            Add an event
                          </Button>
                        </div>
                      )}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
