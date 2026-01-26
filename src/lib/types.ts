// Database types for IITR Study Window

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  branch: string | null;
  year: number | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  type: "PDF" | "Link" | "Contact" | "Video";
  category: "Notes" | "Papers" | "Video" | "Contact" | "Other";
  subject_code: string | null;
  subject_name: string | null;
  professor_name: string | null;
  url: string | null;
  file_path: string | null;
  uploaded_by: string | null;
  is_approved: boolean;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface TimetableEntry {
  id: string;
  user_id: string;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string;
  end_time: string;
  type: "Lecture" | "Tutorial" | "Practical" | "Other";
  subject_name: string;
  subject_code: string | null;
  room_number: string | null;
  professor_name: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  is_completed: boolean;
  due_date: string | null;
  priority: "low" | "medium" | "high" | null;
  linked_subject: string | null;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  date: string;
  start_time: string | null;
  end_time: string | null;
  type: "Exam" | "Meeting" | "Personal" | "Deadline" | "Other";
  location: string | null;
  color: string;
  reminder_before: number | null;
  created_at: string;
  updated_at: string;
}

// Timetable slot type for grid display
export interface TimeSlot {
  hour: number;
  entries: TimetableEntry[];
}

// Days of the week
export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

// Entry types with colors
export const ENTRY_TYPES = {
  Lecture: { label: "Lecture", color: "#3b82f6" },
  Tutorial: { label: "Tutorial", color: "#10b981" },
  Practical: { label: "Practical", color: "#f59e0b" },
  Other: { label: "Other", color: "#8b5cf6" },
} as const;

// Event types with colors
export const EVENT_TYPES = {
  Exam: { label: "Exam", color: "#ef4444" },
  Meeting: { label: "Meeting", color: "#3b82f6" },
  Personal: { label: "Personal", color: "#10b981" },
  Deadline: { label: "Deadline", color: "#f59e0b" },
  Other: { label: "Other", color: "#8b5cf6" },
} as const;

// Resource categories
export const RESOURCE_CATEGORIES = [
  "Notes",
  "Papers",
  "Video",
  "Contact",
  "Other",
] as const;


export const RESOURCE_TYPES = ["PDF", "Link", "Contact", "Video"] as const;

// ==========================================
// ACADEMIC CALENDAR TYPES
// ==========================================

export type AcademicEventType =
  | 'teaching'
  | 'exam'
  | 'holiday'
  | 'registration'
  | 'feedback'
  | 'institute_event'
  | 'timetable_override'
  | 'vacation';

export type AcademicDayState =
  | 'NORMAL_TEACHING_DAY'
  | 'HOLIDAY'
  | 'EXAM_DAY'
  | 'EXAM_BREAK'
  | 'TIMETABLE_OVERRIDE_DAY'
  | 'VACATION';

export interface AcademicEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: AcademicEventType;
  start_date: string; // ISO Date YYYY-MM-DD
  end_date: string;   // ISO Date YYYY-MM-DD
  is_all_day: boolean;
  semester: string;
  metadata: {
    override_day_of_week?: number;
    exam_type?: string;
    [key: string]: any;
  };
  created_at: string;
}
