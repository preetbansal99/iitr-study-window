"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Plus, Trash2, Loader2, Clock, Edit2 } from "lucide-react";
import type { TimetableEntry } from "@/lib/types";
import { DAYS_OF_WEEK, ENTRY_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

const HOURS = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

export default function TimetablePage() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimetableEntry | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{
    day: number;
    hour: number;
  } | null>(null);

  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    type: "Lecture" as TimetableEntry["type"],
    room_number: "",
    professor_name: "",
    color: "#3b82f6",
    start_time: "08:00",
    end_time: "09:00",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setIsLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("timetable")
      .select("*")
      .eq("user_id", user?.id)
      .order("start_time", { ascending: true });

    if (!error && data) {
      setEntries(data);
    }
    setIsLoading(false);
  };

  const handleSlotClick = (day: number, hour: number) => {
    // Check if there's an existing entry at this slot
    const existingEntry = entries.find(
      (e) =>
        e.day_of_week === day &&
        parseInt(e.start_time.split(":")[0]) <= hour &&
        parseInt(e.end_time.split(":")[0]) > hour
    );

    if (existingEntry) {
      setSelectedEntry(existingEntry);
      setFormData({
        subject_name: existingEntry.subject_name,
        subject_code: existingEntry.subject_code || "",
        type: existingEntry.type,
        room_number: existingEntry.room_number || "",
        professor_name: existingEntry.professor_name || "",
        color: existingEntry.color,
        start_time: existingEntry.start_time,
        end_time: existingEntry.end_time,
      });
    } else {
      setSelectedEntry(null);
      setSelectedSlot({ day, hour });
      setFormData({
        subject_name: "",
        subject_code: "",
        type: "Lecture",
        room_number: "",
        professor_name: "",
        color: "#3b82f6",
        start_time: `${hour.toString().padStart(2, "0")}:00`,
        end_time: `${(hour + 1).toString().padStart(2, "0")}:00`,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (selectedEntry) {
      // Update existing entry
      const { error } = await supabase
        .from("timetable")
        .update({
          ...formData,
        })
        .eq("id", selectedEntry.id);

      if (!error) {
        setIsDialogOpen(false);
        fetchEntries();
      }
    } else {
      // Create new entry
      const { error } = await supabase.from("timetable").insert([
        {
          ...formData,
          user_id: user?.id,
          day_of_week: selectedSlot?.day,
        },
      ]);

      if (!error) {
        setIsDialogOpen(false);
        fetchEntries();
      }
    }
    setIsSubmitting(false);
  };

  const handleDelete = async () => {
    if (!selectedEntry) return;

    setIsSubmitting(true);
    const { error } = await supabase
      .from("timetable")
      .delete()
      .eq("id", selectedEntry.id);

    if (!error) {
      setIsDialogOpen(false);
      fetchEntries();
    }
    setIsSubmitting(false);
  };

  const getEntriesForSlot = (day: number, hour: number) => {
    return entries.filter(
      (e) =>
        e.day_of_week === day &&
        parseInt(e.start_time.split(":")[0]) <= hour &&
        parseInt(e.end_time.split(":")[0]) > hour
    );
  };

  const isBreakTime = (hour: number) => hour === 13;

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
          Weekly Timetable
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Click on any slot to add or edit your schedule
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <div className="min-w-[900px]">
                {/* Header row with days */}
                <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-700">
                  <div className="border-r border-slate-200 p-3 text-center text-sm font-medium text-slate-500 dark:border-slate-700">
                    <Clock className="mx-auto h-4 w-4" />
                  </div>
                  {DAYS_OF_WEEK.slice(1).concat(DAYS_OF_WEEK.slice(0, 1)).map((day, index) => {
                    const dayIndex = index === 6 ? 0 : index + 1;
                    const isToday = new Date().getDay() === dayIndex;
                    return (
                      <div
                        key={day}
                        className={cn(
                          "border-r border-slate-200 p-3 text-center text-sm font-medium dark:border-slate-700",
                          isToday
                            ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "text-slate-700 dark:text-slate-300"
                        )}
                      >
                        {day.slice(0, 3)}
                        {isToday && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            Today
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Time slots */}
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className={cn(
                      "grid grid-cols-8 border-b border-slate-200 dark:border-slate-700",
                      isBreakTime(hour) &&
                        "bg-amber-50 dark:bg-amber-950/20"
                    )}
                  >
                    {/* Time column */}
                    <div className="flex items-center justify-center border-r border-slate-200 p-2 text-xs text-slate-500 dark:border-slate-700">
                      {hour.toString().padStart(2, "0")}:00
                      {isBreakTime(hour) && (
                        <span className="ml-1 text-amber-600">Break</span>
                      )}
                    </div>

                    {/* Day columns */}
                    {DAYS_OF_WEEK.slice(1).concat(DAYS_OF_WEEK.slice(0, 1)).map((day, index) => {
                      const dayIndex = index === 6 ? 0 : index + 1;
                      const slotEntries = getEntriesForSlot(dayIndex, hour);
                      const entry = slotEntries[0];
                      const isStart =
                        entry && parseInt(entry.start_time.split(":")[0]) === hour;

                      return (
                        <div
                          key={`${day}-${hour}`}
                          onClick={() =>
                            !isBreakTime(hour) && handleSlotClick(dayIndex, hour)
                          }
                          className={cn(
                            "relative min-h-[60px] cursor-pointer border-r border-slate-200 p-1 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
                            isBreakTime(hour) && "cursor-not-allowed"
                          )}
                        >
                          {entry && isStart && (
                            <div
                              className="absolute inset-1 flex flex-col rounded-md p-2 text-white transition-transform hover:scale-[1.02]"
                              style={{
                                backgroundColor: entry.color,
                                height: `calc(${
                                  parseInt(entry.end_time.split(":")[0]) -
                                  parseInt(entry.start_time.split(":")[0])
                                } * 100% - 8px)`,
                              }}
                            >
                              <span className="text-xs font-semibold leading-tight">
                                {entry.subject_name}
                              </span>
                              <span className="mt-0.5 text-[10px] opacity-90">
                                {entry.type}
                              </span>
                              {entry.room_number && (
                                <span className="text-[10px] opacity-90">
                                  {entry.room_number}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEntry ? (
                <>
                  <Edit2 className="h-5 w-5" />
                  Edit Entry
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  Add Entry
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject_name">Subject Name *</Label>
              <Input
                id="subject_name"
                value={formData.subject_name}
                onChange={(e) =>
                  setFormData({ ...formData, subject_name: e.target.value })
                }
                placeholder="e.g., Data Structures"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject_code">Subject Code</Label>
                <Input
                  id="subject_code"
                  value={formData.subject_code}
                  onChange={(e) =>
                    setFormData({ ...formData, subject_code: e.target.value })
                  }
                  placeholder="e.g., CS201"
                />
              </div>

              <div className="space-y-2">
                <Label>Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TimetableEntry["type"]) =>
                    setFormData({
                      ...formData,
                      type: value,
                      color: ENTRY_TYPES[value].color,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(ENTRY_TYPES).map(([key, { label, color }]) => (
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
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room_number">Room Number</Label>
                <Input
                  id="room_number"
                  value={formData.room_number}
                  onChange={(e) =>
                    setFormData({ ...formData, room_number: e.target.value })
                  }
                  placeholder="e.g., LH-101"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="professor_name">Professor</Label>
                <Input
                  id="professor_name"
                  value={formData.professor_name}
                  onChange={(e) =>
                    setFormData({ ...formData, professor_name: e.target.value })
                  }
                  placeholder="e.g., Dr. Smith"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                {Object.values(ENTRY_TYPES).map(({ color }) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={cn(
                      "h-8 w-8 rounded-full transition-all",
                      formData.color === color &&
                        "ring-2 ring-offset-2 ring-slate-900"
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2">
              {selectedEntry && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={isSubmitting}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <div className="ml-auto flex gap-2">
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
                  ) : selectedEntry ? (
                    "Save Changes"
                  ) : (
                    "Add Entry"
                  )}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
