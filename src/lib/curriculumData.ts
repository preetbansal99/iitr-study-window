/**
 * IITR 2023-24 Official Curriculum Data
 * =====================================
 * Complete course mapping for Electrical Engineering (Sem 1-6)
 * Source: Official IITR PDF documents
 */

// Types
export interface Course {
    code: string;
    title: string;
    credits: number;
    type?: "core" | "elective" | "lab";
    chapters?: Chapter[];
}

export interface Chapter {
    id: string;
    title: string;
    topics: string[];
}

export interface Semester {
    number: 1 | 2 | 3 | 4 | 5 | 6;
    courses: Course[];
}

export interface Branch {
    id: string;
    name: string;
    shortName: string;
    icon: string;
    semesters: Semester[];
}

// Branch Icons mapping
export const BRANCH_ICONS: Record<string, string> = {
    ee: "Zap",
    cse: "Monitor",
    ece: "Radio",
    me: "Cog",
};

// ============================================
// ELECTRICAL ENGINEERING (EE) - OFFICIAL IITR CURRICULUM
// ============================================
// New comprehensive data in src/lib/curriculum/eeData.ts
// This maintains backward compatibility with existing components

import { EE_PROGRAM, getEESemester } from './curriculum/eeData';

// Convert new EE data to legacy format for backward compatibility
export const EE_CURRICULUM: Semester[] = EE_PROGRAM.semesters
    .filter(sem => sem.number <= 6) // Only show semesters 1-6 in current UI
    .map(sem => ({
        number: sem.number as 1 | 2 | 3 | 4 | 5 | 6,
        courses: sem.courses
            .filter(c => !c.isElectiveSlot) // Filter out elective slots for now
            .map(c => ({
                code: c.code,
                title: c.title,
                credits: typeof c.credits === 'number' ? c.credits : c.credits.max,
                type: c.courseType === 'elective' ? 'elective' as const : 'core' as const,
                chapters: c.chapters,
            })),
    }));

// CSE Curriculum (Year 1-2 only for now)
export const CSE_CURRICULUM: Semester[] = [
    {
        number: 1,
        courses: [
            { code: "MAI-101", title: "Mathematics-I", credits: 4, type: "core" },
            { code: "PHI-101", title: "Physics-I", credits: 4, type: "core" },
            { code: "HSI-101", title: "Soft Skills", credits: 3, type: "core" },
            { code: "TMI-101", title: "Tinkering and Mentoring", credits: 4, type: "core" },
            { code: "CSC-101", title: "Introduction to Programming", credits: 4, type: "core" },
        ],
    },
    {
        number: 2,
        courses: [
            { code: "MAI-102", title: "Mathematics-II", credits: 4, type: "core" },
            { code: "IKS-102", title: "Indian Knowledge System", credits: 2, type: "core" },
            { code: "ESS-102", title: "Environmental Science & Sustainability", credits: 3, type: "core" },
            { code: "CSC-102", title: "Object Oriented Programming", credits: 4, type: "core" },
        ],
    },
    {
        number: 3,
        courses: [
            { code: "CSC-201", title: "Computer Organization", credits: 4, type: "core" },
            { code: "CSC-203", title: "Design & Analysis of Algorithms", credits: 4, type: "core" },
            { code: "MAB-103", title: "Numerical Methods", credits: 4, type: "core" },
        ],
    },
    {
        number: 4,
        courses: [
            { code: "DAI-101", title: "Data Science", credits: 4, type: "core" },
            { code: "CSC-202", title: "Theory of Computation", credits: 4, type: "core" },
            { code: "CSC-204", title: "Operating Systems", credits: 4, type: "core" },
        ],
    },
    { number: 5, courses: [] },
    { number: 6, courses: [] },
];

// ECE Curriculum (Placeholder)
export const ECE_CURRICULUM: Semester[] = [
    { number: 1, courses: [{ code: "MAI-101", title: "Mathematics-I", credits: 4, type: "core" }] },
    { number: 2, courses: [{ code: "MAI-102", title: "Mathematics-II", credits: 4, type: "core" }] },
    { number: 3, courses: [{ code: "ECC-201", title: "Communication Systems", credits: 4, type: "core" }] },
    { number: 4, courses: [{ code: "DAI-101", title: "Data Science", credits: 4, type: "core" }] },
    { number: 5, courses: [] },
    { number: 6, courses: [] },
];

// ME Curriculum (Placeholder)
export const ME_CURRICULUM: Semester[] = [
    { number: 1, courses: [{ code: "MAI-101", title: "Mathematics-I", credits: 4, type: "core" }] },
    { number: 2, courses: [{ code: "MAI-102", title: "Mathematics-II", credits: 4, type: "core" }] },
    { number: 3, courses: [{ code: "MIC-201", title: "Engineering Drawing", credits: 4, type: "core" }] },
    { number: 4, courses: [{ code: "MIC-202", title: "Theory of Machines", credits: 4, type: "core" }] },
    { number: 5, courses: [] },
    { number: 6, courses: [] },
];

// All Branches
export const BRANCHES: Branch[] = [
    {
        id: "ee",
        name: "Electrical Engineering",
        shortName: "EE",
        icon: "Zap",
        semesters: EE_CURRICULUM,
    },
    {
        id: "cse",
        name: "Computer Science & Engineering",
        shortName: "CSE",
        icon: "Monitor",
        semesters: CSE_CURRICULUM,
    },
    {
        id: "ece",
        name: "Electronics & Communication",
        shortName: "ECE",
        icon: "Radio",
        semesters: ECE_CURRICULUM,
    },
    {
        id: "me",
        name: "Mechanical Engineering",
        shortName: "ME",
        icon: "Cog",
        semesters: ME_CURRICULUM,
    },
];

// Helper functions
export function getBranchById(id: string): Branch | undefined {
    return BRANCHES.find((b) => b.id === id);
}

export function getSemesterCourses(branchId: string, semesterNum: number): Course[] {
    const branch = getBranchById(branchId);
    if (!branch) return [];
    const semester = branch.semesters.find((s) => s.number === semesterNum);
    return semester?.courses || [];
}

export function getCourseByCode(branchId: string, courseCode: string): Course | undefined {
    const branch = getBranchById(branchId);
    if (!branch) return undefined;
    for (const sem of branch.semesters) {
        const course = sem.courses.find((c) => c.code === courseCode);
        if (course) return course;
    }
    return undefined;
}

export function getTotalCredits(courses: Course[]): number {
    return courses.reduce((sum, course) => sum + course.credits, 0);
}
