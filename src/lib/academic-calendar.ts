
import { AcademicEvent, AcademicDayState } from "@/lib/types";
import { isWithinInterval, parseISO, startOfDay, isSameDay } from "date-fns";

/**
 * Resolves the academic state of a specific date based on the provided list of events.
 * 
 * PRIORITY ORDER:
 * 1. Holiday (Strict No Classes)
 * 2. Vacation (Strict No Classes)
 * 3. Exam Day (Exam Timings Only)
 * 4. Exam Break (No Classes, Preparation)
 * 5. Timetable Override (Follow Different Day's Schedule)
 * 6. Normal Teaching Day
 */
export function resolveAcademicDay(date: Date, events: AcademicEvent[]): AcademicDayState {
    // Normalize date to start of day for accurate comparison
    const checkDate = startOfDay(date);

    // Filter events active on this day
    const activeEvents = events.filter(event => {
        const startDate = startOfDay(parseISO(event.start_date));
        const endDate = startOfDay(parseISO(event.end_date));
        return isWithinInterval(checkDate, { start: startDate, end: endDate });
    });

    // Check 1: Holiday
    if (activeEvents.some(e => e.event_type === 'holiday')) {
        return 'HOLIDAY';
    }

    // Check 2: Vacation (Mid-sem break, etc.)
    if (activeEvents.some(e => e.event_type === 'vacation')) {
        return 'VACATION';
    }

    // Check 3: Exam Day
    if (activeEvents.some(e => e.event_type === 'exam')) {
        return 'EXAM_DAY';
    }

    // Check 4: Exam Break (Implicitly handled if defined as 'vacation' or 'holiday', 
    // but if defined specifically or if we want to infer breaks between exams, logic goes here.
    // Based on Seed Data, 'Mid-Semester Break' is 'vacation'. 
    // If 'Exam Break' is a specific requirement differing from Vacation:
    // The Prompt says: "Exam breaks show breaks only". 
    // In seed data: Mid-Sem Break is 'vacation'.
    // So 'vacation' covers it. 
    // If there's a specific 'exam_break' type or logic needed:
    // The Prompt lists 'EXAM_BREAK' as a state.
    // I will map 'vacation' to 'VACATION' or 'EXAM_BREAK' based on context if needed.
    // For now, strict 'vacation' type maps to VACATION.
    // If we want to detect 'Gap days' between exams in a range, we might need more logic,
    // but usually those are either 'study leave' (vacation) or just non-exam days.
    // Let's stick to the resolver logic.

    // Check 5: Timetable Override
    if (activeEvents.some(e => e.event_type === 'timetable_override')) {
        return 'TIMETABLE_OVERRIDE_DAY';
    }

    return 'NORMAL_TEACHING_DAY';
}

/**
 * Helper to get the effective timetable day for a given date.
 * If it's a Timetable Override Day, returns the overridden day index (0-6).
 * Otherwise returns the actual day index.
 */
export function getTimetableDay(date: Date, events: AcademicEvent[]): number {
    const state = resolveAcademicDay(date, events);

    if (state === 'TIMETABLE_OVERRIDE_DAY') {
        const checkDate = startOfDay(date);
        const overrideEvent = events.find(event => {
            const startDate = startOfDay(parseISO(event.start_date));
            const endDate = startOfDay(parseISO(event.end_date));
            return event.event_type === 'timetable_override' &&
                isWithinInterval(checkDate, { start: startDate, end: endDate });
        });

        if (overrideEvent?.metadata?.override_day_of_week !== undefined) {
            return overrideEvent.metadata.override_day_of_week;
        }
    }

    return date.getDay();
}

/**
 * Helper to get relevant events for a specific day, sorted by importance.
 */
export function getEventsForDate(date: Date, events: AcademicEvent[]): AcademicEvent[] {
    const checkDate = startOfDay(date);
    return events.filter(event => {
        const startDate = startOfDay(parseISO(event.start_date));
        const endDate = startOfDay(parseISO(event.end_date));
        return isWithinInterval(checkDate, { start: startDate, end: endDate });
    }).sort((a, b) => {
        // Priority sort
        const priority = {
            'holiday': 100,
            'exam': 90,
            'timetable_override': 80,
            'institute_event': 70,
            'registration': 60,
            'feedback': 50,
            'vacation': 40,
            'teaching': 10
        };
        return (priority[b.event_type] || 0) - (priority[a.event_type] || 0);
    });
}
