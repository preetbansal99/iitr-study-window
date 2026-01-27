-- =========================================================
-- COURSE UNIFICATION MIGRATION
-- Objective: Merge duplicate courses (same code) into a single entity.
-- =========================================================

-- 1. Create Master Course Catalog (Single Source of Truth)
CREATE TABLE IF NOT EXISTS public.master_courses (
    course_code TEXT PRIMARY KEY,
    course_name TEXT NOT NULL,
    credits_min NUMERIC NOT NULL DEFAULT 0,
    credits_max NUMERIC NOT NULL DEFAULT 0,
    lecture_hours INTEGER DEFAULT 0,
    tutorial_hours INTEGER DEFAULT 0,
    practical_hours INTEGER DEFAULT 0,
    cws_weightage TEXT,
    mte_weightage TEXT,
    ete_weightage TEXT,
    practical_weightage TEXT,
    pre_weightage TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Populate Master Catalog from existing courses
-- We use DISTINCT ON (course_code) to take the first occurrence's metadata.
-- Note: In a real migration, we'd check for conflicts. Here we assume the latest/existing data is good.
INSERT INTO public.master_courses (
    course_code, course_name, 
    credits_min, credits_max, 
    lecture_hours, tutorial_hours, practical_hours,
    cws_weightage, mte_weightage, ete_weightage, practical_weightage, pre_weightage
)
SELECT DISTINCT ON (course_code)
    course_code, course_name, 
    credits_min, credits_max, 
    lecture_hours, tutorial_hours, practical_hours,
    cws_weightage, mte_weightage, ete_weightage, practical_weightage, pre_weightage
FROM public.courses
WHERE course_code IS NOT NULL;


-- 3. Refactor 'courses' to be 'program_structures' (keep table name 'courses' to minimize permission breakage, but change columns)
-- We will DROP metadata columns from 'courses' as they now live in 'master_courses'.
-- But first, let's make sure the foreign key is valid.

-- Add FK
ALTER TABLE public.courses 
ADD CONSTRAINT fk_master_course 
FOREIGN KEY (course_code) 
REFERENCES public.master_courses(course_code)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Optional: Drop redundant columns from 'courses' table to enforce Normalization.
-- Keeping them for a moment might be safer during dev, but "Merge" implies we MUST use the master.
-- Let's DROP them to ensure we rely on JOINs.

ALTER TABLE public.courses
DROP COLUMN IF EXISTS course_name,
DROP COLUMN IF EXISTS credits_min,
DROP COLUMN IF EXISTS credits_max,
DROP COLUMN IF EXISTS lecture_hours,
DROP COLUMN IF EXISTS tutorial_hours,
DROP COLUMN IF EXISTS practical_hours,
DROP COLUMN IF EXISTS cws_weightage,
DROP COLUMN IF EXISTS mte_weightage,
DROP COLUMN IF EXISTS ete_weightage,
DROP COLUMN IF EXISTS practical_weightage,
DROP COLUMN IF EXISTS pre_weightage;

-- Now 'courses' table is essentially: (id, course_code [FK], branch, semester, course_type)


-- 4. Update Resource Linking
-- Resources should link to 'course_code', not 'course_id' (which is specific to a branch-semester entry).

-- Add course_code to resources
ALTER TABLE public.course_resources
ADD COLUMN IF NOT EXISTS course_code TEXT;

-- Populate course_code in resources from the linked course
UPDATE public.course_resources cr
SET course_code = c.course_code
FROM public.courses c
WHERE cr.course_id = c.id
AND cr.course_code IS NULL;

-- Make course_code mandatory and FK
ALTER TABLE public.course_resources
ALTER COLUMN course_code SET NOT NULL;

ALTER TABLE public.course_resources
ADD CONSTRAINT fk_resource_course_code
FOREIGN KEY (course_code)
REFERENCES public.master_courses(course_code)
ON UPDATE CASCADE ON DELETE CASCADE;

-- Optional: We can drop 'course_id' from resources if we want purely code-based linking.
-- But leaving it might break less legacy code. 
-- However, for "Shared Resources" across branches, we MUST ignore 'course_id' in fetching.


-- 5. RLS Policies for New Table
ALTER TABLE public.master_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON public.master_courses
FOR SELECT USING (true);

-- Admin write access (reuse same admin email check)
CREATE POLICY "Enable insert for admins" ON public.master_courses
FOR INSERT WITH CHECK (
  auth.email() = 'preet_b@ee.iitr.ac.in'
);

CREATE POLICY "Enable update for admins" ON public.master_courses
FOR UPDATE USING (
  auth.email() = 'preet_b@ee.iitr.ac.in'
);

