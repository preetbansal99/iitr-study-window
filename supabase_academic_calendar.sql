-- =====================================================
-- STUDYWINDOW ACADEMIC CALENDAR - SPRING 2025-26
-- =====================================================

-- 1. Create Enum and Table
DO $$ BEGIN
    CREATE TYPE academic_event_type AS ENUM (
        'teaching',
        'exam',
        'holiday',
        'registration',
        'feedback',
        'institute_event',
        'timetable_override',
        'vacation'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS academic_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    event_type academic_event_type NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_all_day BOOLEAN DEFAULT true,
    semester TEXT DEFAULT 'Spring 2025-26',
    metadata JSONB DEFAULT '{}'::jsonb, -- Store "override_day": "Friday" here
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Clear existing entries for this semester to avoid duplicates during re-seed
DELETE FROM academic_calendar_events WHERE semester = 'Spring 2025-26';

-- 3. Seed Data

INSERT INTO academic_calendar_events (title, event_type, start_date, end_date, semester, metadata) VALUES
-- Semester Dates
('Classes Begin', 'teaching', '2026-01-12', '2026-01-12', 'Spring 2025-26', '{}'),
('Last Teaching Day', 'teaching', '2026-04-30', '2026-04-30', 'Spring 2025-26', '{}'),

-- Registration
('Academic Registration', 'registration', '2026-01-08', '2026-01-09', 'Spring 2025-26', '{}'),
('Late Registration Deadline', 'registration', '2026-01-23', '2026-01-23', 'Spring 2025-26', '{}'),
('Course Add/Change Deadline', 'registration', '2026-01-27', '2026-01-27', 'Spring 2025-26', '{}'),
('Course Withdrawal Deadline', 'registration', '2026-04-27', '2026-04-27', 'Spring 2025-26', '{}'),

-- Holidays
('Republic Day', 'holiday', '2026-01-26', '2026-01-26', 'Spring 2025-26', '{}'),
('Holi', 'holiday', '2026-03-04', '2026-03-04', 'Spring 2025-26', '{}'),
('Mahavir Jayanti', 'holiday', '2026-03-31', '2026-03-31', 'Spring 2025-26', '{}'),
('Good Friday', 'holiday', '2026-04-03', '2026-04-03', 'Spring 2025-26', '{}'),
('Buddha Purnima', 'holiday', '2026-05-01', '2026-05-01', 'Spring 2025-26', '{}'),

-- Exams & Vacations
('Mid-Term Examinations (MTE)', 'exam', '2026-02-26', '2026-03-03', 'Spring 2025-26', '{"exam_type": "MTE"}'),
('Mid-Semester Break', 'vacation', '2026-03-04', '2026-03-08', 'Spring 2025-26', '{}'),
('End-Term Examinations (ETE)', 'exam', '2026-05-02', '2026-05-11', 'Spring 2025-26', '{"exam_type": "ETE"}'),

-- Feedback
('Feedback Form I', 'feedback', '2026-03-11', '2026-03-13', 'Spring 2025-26', '{}'),
('Feedback Form II', 'feedback', '2026-04-28', '2026-04-30', 'Spring 2025-26', '{}'),

-- Institute Events
('National Science Day', 'institute_event', '2026-02-28', '2026-02-28', 'Spring 2025-26', '{}'),
('Institute Research Day', 'institute_event', '2026-03-13', '2026-03-13', 'Spring 2025-26', '{}'),
('Cognizance 2026', 'institute_event', '2026-03-13', '2026-03-15', 'Spring 2025-26', '{}'),

-- Timetable Overrides
-- "Friday timetable followed on..."
('Timetable Override (Friday)', 'timetable_override', '2026-01-31', '2026-01-31', 'Spring 2025-26', '{"override_day_of_week": 5}'), -- 5 = Friday
('Timetable Override (Friday)', 'timetable_override', '2026-02-21', '2026-02-21', 'Spring 2025-26', '{"override_day_of_week": 5}'),
('Timetable Override (Friday)', 'timetable_override', '2026-04-08', '2026-04-08', 'Spring 2025-26', '{"override_day_of_week": 5}');


-- 4. Enable RLS
ALTER TABLE academic_calendar_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Calendar events are viewable by everyone" ON academic_calendar_events;

CREATE POLICY "Calendar events are viewable by everyone" 
ON academic_calendar_events FOR SELECT 
USING (true);

-- 5. Create Index
CREATE INDEX IF NOT EXISTS idx_calendar_events_date_range 
ON academic_calendar_events (start_date, end_date);
