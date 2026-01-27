-- ECE Branch Setup & Seed Data
-- Branch: Electronics & Communication Engineering (ECE)
-- Code: 115 (Assumed/Generic) or just used as a filter
-- Credits: 155 / 178 (Variable)

-- 1. Insert ECE Courses

-- =============================================
-- YEAR I
-- =============================================

-- Semester 1 (Autumn) - 23 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('HSI-101', 'Soft Skills', 1, 3, 3, 'core', 'Electronics & Communication Engineering', 2, 0, 2),
('MAI-101', 'Mathematics-I', 1, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('PHI-101', 'Physics-I', 1, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 2),
('ECC-101', 'Introduction to Programming', 1, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 0, 2),
('TMI-102', 'Tinkering & Mentoring', 1, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 0), -- Mentoring often has no LTP
('TMI-103', 'Basics of IP & Entrepreneurship', 1, 2, 2, 'core', 'Electronics & Communication Engineering', 2, 0, 0),
('CSE-101', 'Data Structures & Algorithms', 1, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0);

-- Semester 2 (Spring) - 21 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('IKS-102', 'Indian Knowledge System', 2, 2, 2, 'core', 'Electronics & Communication Engineering', 2, 0, 0),
('MAI-102', 'Mathematics-II', 2, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('ESS-102', 'Environmental Science & Sustainability', 2, 3, 3, 'core', 'Electronics & Communication Engineering', 3, 0, 0),
('ECC-102', 'Semiconductor Devices & Applications', 2, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 0, 2),
('ECC-104', 'Digital Logic & Systems', 2, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('ECC-106', 'Signals & Systems', 2, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0);

-- =============================================
-- YEAR II
-- =============================================

-- Semester 3 (Autumn) - 23/24 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('MSI-101', 'Fundamentals of Management', 3, 3, 3, 'core', 'Electronics & Communication Engineering', 3, 0, 0), -- Assumed LTP
('MAB-103', 'Numerical Methods', 3, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('ECC-201', 'Fundamentals of Communication Systems', 3, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0), -- Assumed LTP
('ECC-203', 'Electromagnetics & Radiating Systems', 3, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0), -- Assumed LTP
('ECC-205', 'Network Theory', 3, 2, 2, 'core', 'Electronics & Communication Engineering', 2, 0, 0),
('HSSEC-I', 'HSS Elective-I', 3, 3, 3, 'elective', 'Electronics & Communication Engineering', 3, 0, 0),
('OEC-I', 'Open Elective-I', 3, 3, 4, 'OEC', 'Electronics & Communication Engineering', 3, 0, 0);

-- Semester 4 (Spring) - 23/24 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('DAI-101', 'Data Science', 4, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('PHB-102', 'Quantum & Statistical Mechanics', 4, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('EEE-101', 'Control System Engineering', 4, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('ECT-I', 'Talent Enhancement Course-I', 4, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 0),
('ECC-202', 'Digital Communications', 4, 3, 3, 'core', 'Electronics & Communication Engineering', 3, 0, 0),
('ECC-204', 'Analog Circuits', 4, 3, 3, 'core', 'Electronics & Communication Engineering', 3, 0, 0),
('OEC-II', 'Open Elective-II', 4, 3, 4, 'OEC', 'Electronics & Communication Engineering', 3, 0, 0);


-- =============================================
-- YEAR III
-- =============================================

-- Semester 5 (Autumn) - 21/22 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('ECC-351', 'Fundamentals of AI/ML', 5, 2, 2, 'core', 'Electronics & Communication Engineering', 2, 0, 0),
('ECC-301', 'Digital Signal Processing', 5, 3, 3, 'core', 'Electronics & Communication Engineering', 3, 0, 0),
('ECC-303', 'Microwave Engineering', 5, 4, 4, 'core', 'Electronics & Communication Engineering', 3, 1, 0),
('ECC-305', 'Digital Electronics & Linear IC Lab', 5, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 4), -- Lab
('ECC-399', 'Community Outreach', 5, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 0),
('ECT-II', 'Talent Enhancement Course-II', 5, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 0),
('HSSEC-II', 'HSS Elective-II', 5, 3, 3, 'elective', 'Electronics & Communication Engineering', 3, 0, 0),
('OEC-III', 'Open Elective-III', 5, 3, 4, 'OEC', 'Electronics & Communication Engineering', 3, 0, 0);

-- Semester 6 (Spring) - 18/21-22 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('ECL-I', 'Program Elective-I', 6, 3, 3, 'PEC', 'Electronics & Communication Engineering', 3, 0, 0),
('ECL-II', 'Program Elective-II', 6, 3, 3, 'PEC', 'Electronics & Communication Engineering', 3, 0, 0),
('ECC-300', 'Lab-based Project / Industry Problem', 6, 4, 4, 'core', 'Electronics & Communication Engineering', 0, 0, 8), -- Project
('ECC-302', 'Microwave Laboratory', 6, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 4),
('ECC-304', 'Communication Systems Lab', 6, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 4),
('ECC-306', 'Technical Communication', 6, 2, 2, 'core', 'Electronics & Communication Engineering', 2, 0, 0),
('ECT-III', 'Talent Enhancement Course-III', 6, 2, 2, 'core', 'Electronics & Communication Engineering', 0, 0, 0),
('MSC/DHC-I', 'Minor / Honours-I', 6, 3, 4, 'MSC', 'Electronics & Communication Engineering', 3, 0, 0);

-- =============================================
-- YEAR IV
-- =============================================

-- Semester 7 (Autumn) - 12/18-20 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('ECP-400A', 'BTP / Project / Internship / PEC', 7, 4, 4, 'core', 'Electronics & Communication Engineering', 0, 0, 8),
('ECL-III', 'Program Elective-III', 7, 4, 4, 'PEC', 'Electronics & Communication Engineering', 3, 1, 0),
('ECL-IV', 'Program Elective-IV', 7, 4, 4, 'PEC', 'Electronics & Communication Engineering', 3, 1, 0),
('MSC/DHC-II', 'Minor / Honours-II', 7, 3, 4, 'MSC', 'Electronics & Communication Engineering', 3, 0, 0),
('MSC/DHC-III', 'Minor / Honours-III', 7, 3, 4, 'MSC', 'Electronics & Communication Engineering', 3, 0, 0);

-- Semester 8 (Spring) - 14/20-22 Credits
INSERT INTO public.courses 
(course_code, course_name, semester, credits_min, credits_max, course_type, branch, lecture_hours, tutorial_hours, practical_hours)
VALUES
('ECP-400B', 'BTP / Project / Internship / PEC', 8, 6, 6, 'core', 'Electronics & Communication Engineering', 0, 0, 12),
('ECL-V', 'Program Elective-V', 8, 4, 4, 'PEC', 'Electronics & Communication Engineering', 3, 1, 0),
('ECL-VI', 'Program Elective-VI', 8, 4, 4, 'PEC', 'Electronics & Communication Engineering', 3, 1, 0),
('MSC/DHC-IV', 'Minor / Honours-IV', 8, 3, 4, 'MSC', 'Electronics & Communication Engineering', 3, 0, 0),
('MSC/DHC-V', 'Minor / Honours-V', 8, 3, 4, 'MSC', 'Electronics & Communication Engineering', 3, 0, 0);

