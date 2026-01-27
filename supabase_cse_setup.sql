-- CSE Branch Setup & Seed Data
-- Branch: Computer Science & Engineering
-- Code: 114 (Assumed) / CSE
-- Credits: 152/155 (Variable)

-- 1. Insert into Master Courses (Metadata)
-- We use ON CONFLICT DO NOTHING for common courses (e.g. MAI-101, HSI-101) 
-- For strict updates, one would use DO UPDATE, but we assume Master Data is stable or populated by the first branch.
-- However, for CSE specific courses, we must insert them.

INSERT INTO public.master_courses 
(course_code, course_name, credits_min, credits_max, lecture_hours, tutorial_hours, practical_hours, cws_weightage, mte_weightage, ete_weightage, practical_weightage, pre_weightage)
VALUES
-- Year I Autumn
('CSC-101', 'Programming with C and C++', 4, 4, 3, 0, 2, '20-35%', '20-30%', '40-50%', NULL, NULL),
('ECE-103', 'Digital Electronics', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
-- Year I Spring
('ECE-102', 'Intro to Communication Systems', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-102', 'Data Structures', 4, 4, 3, 0, 2, '20-35%', '20-30%', '40-50%', NULL, NULL),
-- Year II Autumn
('CSC-201', 'Computer Org & Architecture', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-203', 'Design & Analysis of Algorithms', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CST-I', 'Talent Enhancement-I', 2, 2, 0, 0, 4, NULL, NULL, NULL, '100%', NULL),
-- Year II Spring
('CSC-202', 'Theory of Computation', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-204', 'Operating Systems', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-206', 'Software Engineering', 4, 4, 3, 0, 2, '20-35%', '20-30%', '40-50%', NULL, NULL),
('ECE-104', 'Computational Biology', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
-- Year III Autumn
('CSC-351', 'Fundamentals of AI/ML', 2, 2, 2, 0, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-301', 'DBMS', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-303', 'Computer Networks', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-305', 'Compiler Design', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSC-399', 'Community Outreach', 2, 2, 0, 0, 0, NULL, NULL, NULL, '100%', NULL), -- Assumed Practical/Field
('CST-II', 'Talent Enhancement-II', 2, 2, 0, 0, 4, NULL, NULL, NULL, '100%', NULL),
-- Year III Spring
('CSC-300', 'Engg Analysis & Design', 4, 4, 0, 0, 8, '50%', NULL, NULL, NULL, '50%'),
('CSC-391', 'Technical Communication', 2, 2, 0, 0, 4, NULL, NULL, NULL, '100%', NULL),
('CST-III', 'Talent Enhancement-III', 2, 2, 0, 0, 4, NULL, NULL, NULL, '100%', NULL),
('CSL-I', 'Program Elective-I', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSL-II', 'Program Elective-II', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSL-III', 'Program Elective-III', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
-- Year IV Autumn
('CSP-400A', 'Project / Internship / PEC', 4, 4, 0, 0, 8, NULL, NULL, NULL, '100%', NULL),
('CSL-IV', 'Program Elective-IV', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSL-V', 'Program Elective-V', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
('CSL-VI', 'Program Elective-VI', 4, 4, 3, 1, 0, '20-35%', '20-30%', '40-50%', NULL, NULL),
-- Year IV Spring
('CSP-400B', 'Project / Internship / PEC', 6, 6, 0, 0, 12, NULL, NULL, NULL, '100%', NULL)

ON CONFLICT (course_code) DO NOTHING;


-- 2. Insert into Courses (Curriculum Mapping)
-- Branch: Computer Science & Engineering

INSERT INTO public.courses (course_code, branch, semester, course_type) VALUES
-- Semester 1 (Autumn)
('HSI-101', 'Computer Science & Engineering', 1, 'core'),
('MAI-101', 'Computer Science & Engineering', 1, 'core'),
('PHI-101', 'Computer Science & Engineering', 1, 'core'),
('CSC-101', 'Computer Science & Engineering', 1, 'core'),
('TMI-102', 'Computer Science & Engineering', 1, 'core'),
('TMI-103', 'Computer Science & Engineering', 1, 'core'),
('ECE-103', 'Computer Science & Engineering', 1, 'core'),

-- Semester 2 (Spring)
('IKS-102', 'Computer Science & Engineering', 2, 'core'),
('MAI-102', 'Computer Science & Engineering', 2, 'core'),
('ESS-102', 'Computer Science & Engineering', 2, 'core'),
('ECE-102', 'Computer Science & Engineering', 2, 'core'),
('CSC-102', 'Computer Science & Engineering', 2, 'core'),

-- Semester 3 (Autumn)
('HSSEC-I', 'Computer Science & Engineering', 3, 'elective'),
('OEC-I',   'Computer Science & Engineering', 3, 'OEC'),
('MSI-101', 'Computer Science & Engineering', 3, 'core'),
('MAB-103', 'Computer Science & Engineering', 3, 'core'),
('CSC-201', 'Computer Science & Engineering', 3, 'core'),
('CSC-203', 'Computer Science & Engineering', 3, 'core'),
('CST-I',   'Computer Science & Engineering', 3, 'core'),

-- Semester 4 (Spring)
('OEC-II',  'Computer Science & Engineering', 4, 'OEC'),
('DAI-101', 'Computer Science & Engineering', 4, 'core'),
('CSC-202', 'Computer Science & Engineering', 4, 'core'),
('CSC-204', 'Computer Science & Engineering', 4, 'core'),
('CSC-206', 'Computer Science & Engineering', 4, 'core'),
('ECE-104', 'Computer Science & Engineering', 4, 'core'),

-- Semester 5 (Autumn)
('HSSEC-II', 'Computer Science & Engineering', 5, 'elective'),
('OEC-III',  'Computer Science & Engineering', 5, 'OEC'),
('CSC-351',  'Computer Science & Engineering', 5, 'core'),
('CSC-301',  'Computer Science & Engineering', 5, 'core'),
('CSC-303',  'Computer Science & Engineering', 5, 'core'),
('CSC-305',  'Computer Science & Engineering', 5, 'core'),
('CSC-399',  'Computer Science & Engineering', 5, 'core'),
('CST-II',   'Computer Science & Engineering', 5, 'core'),

-- Semester 6 (Spring)
('CSC-300',   'Computer Science & Engineering', 6, 'core'),
('CSC-391',   'Computer Science & Engineering', 6, 'core'),
('CST-III',   'Computer Science & Engineering', 6, 'core'),
('CSL-I',     'Computer Science & Engineering', 6, 'PEC'),
('CSL-II',    'Computer Science & Engineering', 6, 'PEC'),
('CSL-III',   'Computer Science & Engineering', 6, 'PEC'),
('MSC/DHC-I', 'Computer Science & Engineering', 6, 'MSC'),

-- Semester 7 (Autumn)
('CSP-400A',   'Computer Science & Engineering', 7, 'core'),
('CSL-IV',     'Computer Science & Engineering', 7, 'PEC'),
('CSL-V',      'Computer Science & Engineering', 7, 'PEC'),
('CSL-VI',     'Computer Science & Engineering', 7, 'PEC'),
('MSC/DHC-II', 'Computer Science & Engineering', 7, 'MSC'),
('MSC/DHC-III','Computer Science & Engineering', 7, 'MSC'),

-- Semester 8 (Spring)
('CSP-400B',    'Computer Science & Engineering', 8, 'core'),
('MSC/DHC-IV',  'Computer Science & Engineering', 8, 'MSC'),
('MSC/DHC-V',   'Computer Science & Engineering', 8, 'MSC');
