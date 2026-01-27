-- Extend courses table with Academic Metadata
-- L-T-P Structure
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS lecture_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS tutorial_hours INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS practical_hours INTEGER DEFAULT 0;

-- Weightage Distribution (Text based as per requirements)
ALTER TABLE public.courses
ADD COLUMN IF NOT EXISTS cws_weightage TEXT,
ADD COLUMN IF NOT EXISTS mte_weightage TEXT,
ADD COLUMN IF NOT EXISTS ete_weightage TEXT,
ADD COLUMN IF NOT EXISTS practical_weightage TEXT,
ADD COLUMN IF NOT EXISTS pre_weightage TEXT;

-- Sample Data Updates for Verification (Electrical Engineering - Semester 1/2)

-- EEC-101: Fundamentals of Electronics (Theory Dominant)
UPDATE public.courses 
SET 
  lecture_hours = 3, 
  tutorial_hours = 1, 
  practical_hours = 0,
  cws_weightage = '20-25%',
  mte_weightage = '20-30%',
  ete_weightage = '40-50%'
WHERE course_code = 'EEC-101';

-- MAN-001: Mathematics I (Theory Dominant)
UPDATE public.courses 
SET 
  lecture_hours = 3, 
  tutorial_hours = 1, 
  practical_hours = 0,
  cws_weightage = '25%',
  mte_weightage = '25%',
  ete_weightage = '50%'
WHERE course_code = 'MAN-001';

-- PYN-101: Introduction to Mechanics (Theory)
UPDATE public.courses 
SET 
  lecture_hours = 3, 
  tutorial_hours = 1, 
  practical_hours = 0,
  cws_weightage = '20-35%',
  mte_weightage = '20-30%',
  ete_weightage = '40-50%'
WHERE course_code = 'PYN-101';

-- CEN-105: Introduction to Environmental Science (Theory)
UPDATE public.courses 
SET 
  lecture_hours = 2, 
  tutorial_hours = 0, 
  practical_hours = 0,
  cws_weightage = '15-25%',
  mte_weightage = '30-40%',
  ete_weightage = '40-50%'
WHERE course_code = 'CEN-105';

-- HSN-001A: Communication Skills (Theory + Practical often mixed, but usually treated as theory structure)
UPDATE public.courses 
SET 
  lecture_hours = 1, 
  tutorial_hours = 0, 
  practical_hours = 2,
  cws_weightage = '20-35%',
  mte_weightage = '20-30%',
  ete_weightage = '40-50%',
  practical_weightage = '0%' 
WHERE course_code = 'HSN-001A';

-- Practical Courses (Labs)

-- EEP-101: Introduction to Electrical Engineering Lab (Practical)
-- Assuming code might be slightly different in seed, using generic match or precise if known. 
-- Checking if EEP-101 exists or if it was part of the generic seeding.
-- If not found, these updates just won't apply, which is fine.

-- Update generic "Lab" courses if any
UPDATE public.courses 
SET 
  lecture_hours = 0, 
  tutorial_hours = 0, 
  practical_hours = 2,
  cws_weightage = '0%',
  mte_weightage = '0%',
  ete_weightage = '0%',
  practical_weightage = '100%'
WHERE course_name ILIKE '%Lab%';

-- Project Courses
UPDATE public.courses 
SET 
  lecture_hours = 0, 
  tutorial_hours = 0, 
  practical_hours = 6,
  cws_weightage = '50%',
  pre_weightage = '50%'
WHERE course_name ILIKE '%Project%';
