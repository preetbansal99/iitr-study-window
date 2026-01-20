/**
 * IITR Official EE Curriculum Data
 * =================================
 * B.Tech. Electrical Engineering (Program Code: 115)
 * Department: Electrical Engineering, IIT Roorkee
 * 
 * Source: Official IITR Curriculum Document
 * Total Credits: 152-155 (Core) / 170-175 (with Minor/DHC)
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

/** Subject Area Categories */
export type SubjectArea =
    | 'BSC'    // Basic Science Course
    | 'ESC'    // Engineering Science Course
    | 'HSSC'   // Humanities & Social Sciences Course
    | 'ESSC'   // Environmental Science & Sustainability Course
    | 'PCC'    // Program Core Course
    | 'PEC'    // Program Elective Course
    | 'OEC'    // Open Elective Course
    | 'HSSEC'  // HSS Elective Course
    | 'TEB'    // Talent Enhancement Course (Basket)
    | 'TMI'    // Tinkering & Mentoring + IP/Entrepreneurship
    | 'MC'     // Management Course
    | 'DSC'    // Data Science Course
    | 'MSC'    // Minor Specialization Course
    | 'DHC'    // Departmental Honours Course
    | 'CORE';  // Core Activity (e.g., Community Outreach)

/** Course Type Classification */
export type CourseType = 'core' | 'elective' | 'lab' | 'project' | 'activity';

/** Evaluation Scheme */
export interface EvaluationScheme {
    CWS?: { min: number; max: number };  // Continuous Work Submission
    PRS?: number;                         // Practical/Lab
    MTE?: { min: number; max: number };   // Mid-Term Exam
    ETE?: { min: number; max: number };   // End-Term Exam
    PRE?: number;                         // Practical Exam
}

/** Lecture-Tutorial-Practical Structure */
export interface LTP {
    lecture: number;
    tutorial: number;
    practical: number;
}

/** Chapter/Unit within a course */
export interface CourseChapter {
    id: string;
    title: string;
    topics: string[];
}

/** Complete Course Definition */
export interface EECourse {
    code: string;
    title: string;
    credits: number | { min: number; max: number };
    subjectArea: SubjectArea;
    courseType: CourseType;
    ltp?: LTP;
    evaluation?: EvaluationScheme;
    chapters?: CourseChapter[];
    isElectiveSlot?: boolean;          // True if this is a placeholder (e.g., OEC-I)
    electiveCategory?: string;          // For PECs: 'A' | 'B' | 'C' | 'D'
}

/** Semester Definition */
export interface EESemester {
    number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    season: 'autumn' | 'spring';
    year: 1 | 2 | 3 | 4;
    totalCredits: number | { min: number; max: number };
    courses: EECourse[];
}

/** Program-level Info */
export interface EEProgram {
    code: string;
    name: string;
    department: string;
    totalCredits: {
        core: { min: number; max: number };
        withMinorOrHonours: { min: number; max: number };
    };
    semesters: EESemester[];
}

// ============================================
// STANDARD EVALUATION SCHEMES
// ============================================

const EVAL_THEORY_STANDARD: EvaluationScheme = {
    CWS: { min: 20, max: 35 },
    MTE: { min: 20, max: 30 },
    ETE: { min: 40, max: 50 },
};

const EVAL_THEORY_WITH_LAB: EvaluationScheme = {
    CWS: { min: 10, max: 25 },
    PRS: 25,
    MTE: { min: 15, max: 25 },
    ETE: { min: 30, max: 40 },
};

const EVAL_TEB: EvaluationScheme = {
    PRS: 50,
    PRE: 50,
};

const EVAL_FULL_CONTINUOUS: EvaluationScheme = {
    PRS: 60,
    CWS: { min: 40, max: 40 },
};

const EVAL_FULL_PROJECT: EvaluationScheme = {
    PRS: 100,
};

// ============================================
// YEAR 1 — SEMESTER 1 (AUTUMN) — 23 CREDITS
// ============================================

const SEMESTER_1: EESemester = {
    number: 1,
    season: 'autumn',
    year: 1,
    totalCredits: 23,
    courses: [
        {
            code: 'HSI-101',
            title: 'Soft Skills',
            credits: 3,
            subjectArea: 'HSSC',
            courseType: 'core',
            ltp: { lecture: 2, tutorial: 0, practical: 2 },
            evaluation: {
                CWS: { min: 10, max: 25 },
                PRS: 25,
                MTE: { min: 15, max: 25 },
                ETE: { min: 30, max: 40 },
            },
        },
        {
            code: 'MAI-101',
            title: 'Mathematics-I',
            credits: 4,
            subjectArea: 'BSC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'PHI-101',
            title: 'Physics-I',
            credits: 4,
            subjectArea: 'BSC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
        },
        {
            code: 'EEC-101',
            title: 'Programming with C++',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 0, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
        },
        {
            code: 'TMI-102',
            title: 'Tinkering and Mentoring',
            credits: 2,
            subjectArea: 'TMI',
            courseType: 'activity',
            evaluation: EVAL_FULL_CONTINUOUS,
        },
        {
            code: 'TMI-103',
            title: 'Basics of IP and Entrepreneurship',
            credits: 2,
            subjectArea: 'TMI',
            courseType: 'core',
            ltp: { lecture: 2, tutorial: 0, practical: 0 },
            evaluation: {
                CWS: { min: 50, max: 50 },
                ETE: { min: 50, max: 50 },
            },
        },
        {
            code: 'ECE-101',
            title: 'Fundamentals of Electronics',
            credits: 4,
            subjectArea: 'ESC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
    ],
};

// ============================================
// YEAR 1 — SEMESTER 2 (SPRING) — 20 CREDITS
// ============================================

const SEMESTER_2: EESemester = {
    number: 2,
    season: 'spring',
    year: 1,
    totalCredits: 20,
    courses: [
        {
            code: 'IKS-102',
            title: 'Indian Knowledge System',
            credits: 2,
            subjectArea: 'HSSC',
            courseType: 'core',
            ltp: { lecture: 2, tutorial: 0, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'ESS-102',
            title: 'Environmental Science & Sustainability',
            credits: 3,
            subjectArea: 'ESSC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 0, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'MAI-102',
            title: 'Mathematics-II',
            credits: 4,
            subjectArea: 'BSC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'ECE-103',
            title: 'Digital Electronics',
            credits: 4,
            subjectArea: 'ESC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
        },
        {
            code: 'EEC-102',
            title: 'Basic Electrical Science',
            credits: 3,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 2, tutorial: 1, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'EEC-104',
            title: 'Signals and Systems',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
    ],
};

// ============================================
// YEAR 2 — SEMESTER 3 (AUTUMN) — 21/22 CREDITS
// ============================================

const SEMESTER_3: EESemester = {
    number: 3,
    season: 'autumn',
    year: 2,
    totalCredits: { min: 21, max: 22 },
    courses: [
        {
            code: 'MSI-101',
            title: 'Fundamentals of Management',
            credits: 3,
            subjectArea: 'MC',
            courseType: 'core',
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'MAB-103',
            title: 'Numerical Methods',
            credits: 4,
            subjectArea: 'BSC',
            courseType: 'core',
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'CSE-101',
            title: 'Data Structures and Algorithms',
            credits: 4,
            subjectArea: 'ESC',
            courseType: 'core',
            evaluation: EVAL_THEORY_WITH_LAB,
        },
        {
            code: 'EEC-201',
            title: 'Network Theory',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            evaluation: EVAL_THEORY_STANDARD,
            chapters: [
                { id: 'nt-1', title: 'Unit 1: Network Elements & Topology', topics: ["Kirchhoff's Laws", 'Node Analysis', 'Mesh Analysis'] },
                { id: 'nt-2', title: 'Unit 2: Network Theorems', topics: ['Superposition', "Thevenin's Theorem", "Norton's Theorem"] },
                { id: 'nt-3', title: 'Unit 3: Transient Analysis', topics: ['First Order Circuits', 'Second Order Circuits', 'Laplace Transform'] },
                { id: 'nt-4', title: 'Unit 4: Two-Port Networks', topics: ['Z-Parameters', 'Y-Parameters', 'Transmission Parameters'] },
            ],
        },
        {
            code: 'HSSEC-I',
            title: 'HSS Elective-I',
            credits: 3,
            subjectArea: 'HSSEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'OEC-I',
            title: 'Open Elective-I',
            credits: { min: 3, max: 4 },
            subjectArea: 'OEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
    ],
};

// ============================================
// YEAR 2 — SEMESTER 4 (SPRING) — 24/25 CREDITS
// ============================================

const SEMESTER_4: EESemester = {
    number: 4,
    season: 'spring',
    year: 2,
    totalCredits: { min: 24, max: 25 },
    courses: [
        {
            code: 'DAI-101',
            title: 'Data Science',
            credits: 4,
            subjectArea: 'DSC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 0 },
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'EEC-202',
            title: 'Electrical & Electronic Measurements',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 0, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
        },
        {
            code: 'EEC-204',
            title: 'Control Systems',
            credits: 5,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
            chapters: [
                { id: 'cs-1', title: 'Unit 1: System Modeling', topics: ['Transfer Functions', 'Block Diagrams', 'Signal Flow Graphs'] },
                { id: 'cs-2', title: 'Unit 2: Time Domain Analysis', topics: ['Transient Response', 'Steady State Error', 'Stability'] },
                { id: 'cs-3', title: 'Unit 3: Frequency Domain Analysis', topics: ['Bode Plot', 'Nyquist Plot', 'Polar Plot'] },
                { id: 'cs-4', title: 'Unit 4: State Space Analysis', topics: ['State Variables', 'Controllability', 'Observability'] },
            ],
        },
        {
            code: 'EEC-206',
            title: 'Electrical Machines',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
            chapters: [
                { id: 'em-1', title: 'Unit 1: Transformers', topics: ['Principle of Operation', 'Equivalent Circuit', 'Losses & Efficiency'] },
                { id: 'em-2', title: 'Unit 2: DC Machines', topics: ['Construction', 'EMF Equation', 'Characteristics'] },
                { id: 'em-3', title: 'Unit 3: Induction Motors', topics: ['Rotating Magnetic Field', 'Slip', 'Torque-Speed Curve'] },
                { id: 'em-4', title: 'Unit 4: Synchronous Machines', topics: ['EMF Equation', 'Power Angle', 'Synchronization'] },
            ],
        },
        {
            code: 'EEC-208',
            title: 'Power Systems-I',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 3, tutorial: 1, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
        },
        {
            code: 'OEC-II',
            title: 'Open Elective-II',
            credits: { min: 3, max: 4 },
            subjectArea: 'OEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
    ],
};

// ============================================
// YEAR 3 — SEMESTER 5 (AUTUMN) — 22/23 CREDITS
// ============================================

const SEMESTER_5: EESemester = {
    number: 5,
    season: 'autumn',
    year: 3,
    totalCredits: { min: 22, max: 23 },
    courses: [
        {
            code: 'EEC-351',
            title: 'Fundamentals of AI/ML',
            credits: 2,
            subjectArea: 'PCC',
            courseType: 'core',
            evaluation: EVAL_THEORY_STANDARD,
        },
        {
            code: 'EEC-301',
            title: 'Power Systems-II',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            evaluation: EVAL_THEORY_WITH_LAB,
            chapters: [
                { id: 'ps2-1', title: 'Unit 1: Load Flow Analysis', topics: ['Gauss-Seidel', 'Newton-Raphson', 'Fast Decoupled'] },
                { id: 'ps2-2', title: 'Unit 2: Fault Analysis', topics: ['Symmetrical Faults', 'Unsymmetrical Faults', 'Sequence Networks'] },
                { id: 'ps2-3', title: 'Unit 3: Power System Stability', topics: ['Rotor Dynamics', 'Swing Equation', 'Equal Area Criterion'] },
                { id: 'ps2-4', title: 'Unit 4: Economic Operation', topics: ['Economic Dispatch', 'Unit Commitment', 'Hydrothermal Scheduling'] },
            ],
        },
        {
            code: 'EEC-303',
            title: 'Power Electronics',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            evaluation: EVAL_THEORY_WITH_LAB,
            chapters: [
                { id: 'pe-1', title: 'Unit 1: Power Semiconductor Devices', topics: ['SCR', 'MOSFET', 'IGBT'] },
                { id: 'pe-2', title: 'Unit 2: Rectifiers', topics: ['Uncontrolled', 'Controlled', 'Dual Converters'] },
                { id: 'pe-3', title: 'Unit 3: DC-DC Converters', topics: ['Buck', 'Boost', 'Buck-Boost'] },
                { id: 'pe-4', title: 'Unit 4: Inverters', topics: ['VSI', 'CSI', 'PWM Techniques'] },
            ],
        },
        {
            code: 'EEC-399',
            title: 'Community Outreach',
            credits: 2,
            subjectArea: 'CORE',
            courseType: 'activity',
            evaluation: EVAL_FULL_PROJECT,
        },
        {
            code: 'EET-I',
            title: 'Talent Enhancement Course-I',
            credits: 4,
            subjectArea: 'TEB',
            courseType: 'lab',
            ltp: { lecture: 0, tutorial: 0, practical: 8 },
            evaluation: EVAL_TEB,
            isElectiveSlot: true,
        },
        {
            code: 'HSSEC-II',
            title: 'HSS Elective-II',
            credits: 3,
            subjectArea: 'HSSEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'OEC-III',
            title: 'Open Elective-III',
            credits: { min: 3, max: 4 },
            subjectArea: 'OEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
    ],
};

// ============================================
// YEAR 3 — SEMESTER 6 (SPRING) — 18/21–22 CREDITS
// ============================================

const SEMESTER_6: EESemester = {
    number: 6,
    season: 'spring',
    year: 3,
    totalCredits: { min: 18, max: 22 },
    courses: [
        {
            code: 'EEL-I',
            title: 'Program Elective-I',
            credits: 4,
            subjectArea: 'PEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'EEL-II',
            title: 'Program Elective-II',
            credits: 4,
            subjectArea: 'PEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'EEC-300',
            title: 'Engineering Analysis & Design',
            credits: 4,
            subjectArea: 'PCC',
            courseType: 'core',
            ltp: { lecture: 2, tutorial: 0, practical: 2 },
            evaluation: EVAL_THEORY_WITH_LAB,
            chapters: [
                { id: 'ead-1', title: 'Unit 1: Problem Formulation', topics: ['Requirements Analysis', 'Constraints', 'Specifications'] },
                { id: 'ead-2', title: 'Unit 2: Design Methodology', topics: ['Conceptual Design', 'Detailed Design', 'Prototyping'] },
                { id: 'ead-3', title: 'Unit 3: Analysis Tools', topics: ['Simulation', 'Optimization', 'Verification'] },
            ],
        },
        {
            code: 'EEC-391',
            title: 'Technical Communication',
            credits: 2,
            subjectArea: 'PCC',
            courseType: 'core',
            evaluation: EVAL_FULL_PROJECT,
        },
        {
            code: 'EET-II',
            title: 'Talent Enhancement Course-II',
            credits: 4,
            subjectArea: 'TEB',
            courseType: 'lab',
            ltp: { lecture: 0, tutorial: 0, practical: 8 },
            evaluation: EVAL_TEB,
            isElectiveSlot: true,
        },
        {
            code: 'MSC/DHC-I',
            title: 'Minor / Honours Course-I',
            credits: { min: 3, max: 4 },
            subjectArea: 'MSC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
    ],
};

// ============================================
// YEAR 4 — SEMESTER 7 (AUTUMN) — 16/22–24 CREDITS
// ============================================

const SEMESTER_7: EESemester = {
    number: 7,
    season: 'autumn',
    year: 4,
    totalCredits: { min: 16, max: 24 },
    courses: [
        {
            code: 'EEL-III',
            title: 'Program Elective-III',
            credits: 4,
            subjectArea: 'PEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'EEL-IV',
            title: 'Program Elective-IV',
            credits: 4,
            subjectArea: 'PEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'EEL-V',
            title: 'Program Elective-V',
            credits: 4,
            subjectArea: 'PEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'EEL-VI',
            title: 'Program Elective-VI',
            credits: 4,
            subjectArea: 'PEC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'MSC/DHC-II',
            title: 'Minor / Honours Course-II',
            credits: { min: 3, max: 4 },
            subjectArea: 'MSC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'MSC/DHC-III',
            title: 'Minor / Honours Course-III',
            credits: { min: 3, max: 4 },
            subjectArea: 'MSC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
    ],
};

// ============================================
// YEAR 4 — SEMESTER 8 (SPRING) — 8/14–16 CREDITS
// ============================================

const SEMESTER_8: EESemester = {
    number: 8,
    season: 'spring',
    year: 4,
    totalCredits: { min: 8, max: 16 },
    courses: [
        {
            code: 'EEP-400',
            title: 'BTP / Internship / Entrepreneurship',
            credits: 8,
            subjectArea: 'PCC',
            courseType: 'project',
            evaluation: EVAL_FULL_PROJECT,
        },
        {
            code: 'MSC/DHC-IV',
            title: 'Minor / Honours Course-IV',
            credits: { min: 3, max: 4 },
            subjectArea: 'MSC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
        {
            code: 'MSC/DHC-V',
            title: 'Minor / Honours Course-V',
            credits: { min: 3, max: 4 },
            subjectArea: 'MSC',
            courseType: 'elective',
            isElectiveSlot: true,
        },
    ],
};

// ============================================
// PROGRAM ELECTIVES (PEC) CATALOG
// ============================================

export const EE_PROGRAM_ELECTIVES: Record<string, EECourse[]> = {
    'A. Power Electronics & Electric Drives': [
        { code: 'EEL-540', title: 'Advanced Power Electronics', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-650', title: 'Switch Mode Power Supply', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-541', title: 'Analysis of Electrical Machines', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-655', title: 'Special Machines', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
    ],
    'B. Power Systems Engineering': [
        { code: 'EEL-561', title: 'Power System Operation and Control', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-564', title: 'HVDC Transmission Systems', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-668', title: 'Digital Protection of Power Systems', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-612', title: 'Electrical Transients in Power System', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
    ],
    'C. Systems & Control': [
        { code: 'EEL-580', title: 'Advanced Linear Control Systems', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-585', title: 'Non-Linear Systems and Control', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-686', title: 'Optimal Control', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
        { code: 'EEL-694', title: 'Model Order Reduction', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
    ],
    'D. Instrumentation & Signal Processing': [
        { code: 'EEL-XXX', title: 'Biomedical Instrumentation', credits: 4, subjectArea: 'PEC', courseType: 'elective', ltp: { lecture: 3, tutorial: 1, practical: 0 } },
    ],
};

// ============================================
// TALENT ENHANCEMENT COURSES (TEB) CATALOG
// ============================================

export const EE_TEB_COURSES: EECourse[] = [
    { code: 'EET-XXX', title: 'Microprocessors Lab', credits: 4, subjectArea: 'TEB', courseType: 'lab', ltp: { lecture: 0, tutorial: 0, practical: 8 }, evaluation: EVAL_TEB },
    { code: 'EET-XXX', title: 'PCB Design', credits: 4, subjectArea: 'TEB', courseType: 'lab', ltp: { lecture: 0, tutorial: 0, practical: 8 }, evaluation: EVAL_TEB },
    { code: 'EET-XXX', title: 'Power Electronics Experiments', credits: 4, subjectArea: 'TEB', courseType: 'lab', ltp: { lecture: 0, tutorial: 0, practical: 8 }, evaluation: EVAL_TEB },
    { code: 'EET-XXX', title: 'SCADA', credits: 4, subjectArea: 'TEB', courseType: 'lab', ltp: { lecture: 0, tutorial: 0, practical: 8 }, evaluation: EVAL_TEB },
    { code: 'EET-XXX', title: 'Robotics', credits: 4, subjectArea: 'TEB', courseType: 'lab', ltp: { lecture: 0, tutorial: 0, practical: 8 }, evaluation: EVAL_TEB },
    { code: 'EET-XXX', title: 'Instrumentation Labs', credits: 4, subjectArea: 'TEB', courseType: 'lab', ltp: { lecture: 0, tutorial: 0, practical: 8 }, evaluation: EVAL_TEB },
    { code: 'EET-XXX', title: 'EV Systems', credits: 4, subjectArea: 'TEB', courseType: 'lab', ltp: { lecture: 0, tutorial: 0, practical: 8 }, evaluation: EVAL_TEB },
];

// ============================================
// MINOR SPECIALIZATION COURSES (18–20 CREDITS)
// ============================================

export const EE_MINOR_COURSES: EECourse[] = [
    { code: 'EEC-201', title: 'Network Theory', credits: 4, subjectArea: 'MSC', courseType: 'core' },
    { code: 'EEC-202', title: 'Electrical & Electronic Measurements', credits: 4, subjectArea: 'MSC', courseType: 'core' },
    { code: 'EEC-204', title: 'Control Systems', credits: 5, subjectArea: 'MSC', courseType: 'core' },
    { code: 'EEC-206', title: 'Electrical Machines', credits: 4, subjectArea: 'MSC', courseType: 'core' },
    { code: 'EEC-208', title: 'Power Systems-I', credits: 4, subjectArea: 'MSC', courseType: 'core' },
    { code: 'EEC-303', title: 'Power Electronics', credits: 4, subjectArea: 'MSC', courseType: 'core' },
    { code: 'EEC-104', title: 'Signals and Systems', credits: 4, subjectArea: 'MSC', courseType: 'core' },
];

// ============================================
// DEPARTMENTAL HONOURS COURSES (18–20 CREDITS)
// ============================================

export const EE_HONOURS_COURSES: EECourse[] = [
    { code: 'EEL-540', title: 'Advanced Power Electronics', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-650', title: 'Switch Mode Power Supply', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-541', title: 'Analysis of Electrical Machines', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-655', title: 'Special Machines', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-561', title: 'Power System Operation and Control', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-564', title: 'HVDC Transmission Systems', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-668', title: 'Digital Protection of Power Systems', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-612', title: 'Electrical Transients in Power System', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-580', title: 'Advanced Linear Control Systems', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-585', title: 'Non-Linear Systems and Control', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-686', title: 'Optimal Control', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-694', title: 'Model Order Reduction', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
    { code: 'EEL-XXX', title: 'Biomedical Instrumentation', credits: 4, subjectArea: 'DHC', courseType: 'elective' },
];

// ============================================
// COMPLETE EE PROGRAM
// ============================================

export const EE_PROGRAM: EEProgram = {
    code: '115',
    name: 'B.Tech. Electrical Engineering',
    department: 'Electrical Engineering, IIT Roorkee',
    totalCredits: {
        core: { min: 152, max: 155 },
        withMinorOrHonours: { min: 170, max: 175 },
    },
    semesters: [
        SEMESTER_1,
        SEMESTER_2,
        SEMESTER_3,
        SEMESTER_4,
        SEMESTER_5,
        SEMESTER_6,
        SEMESTER_7,
        SEMESTER_8,
    ],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get semester by number
 */
export function getEESemester(semNumber: number): EESemester | undefined {
    return EE_PROGRAM.semesters.find(s => s.number === semNumber);
}

/**
 * Get course by code from any semester
 */
export function getEECourseByCode(code: string): EECourse | undefined {
    for (const sem of EE_PROGRAM.semesters) {
        const course = sem.courses.find(c => c.code === code);
        if (course) return course;
    }
    // Check elective catalogs
    for (const category of Object.values(EE_PROGRAM_ELECTIVES)) {
        const course = category.find(c => c.code === code);
        if (course) return course;
    }
    return undefined;
}

/**
 * Get all courses for a year
 */
export function getEECoursesByYear(year: 1 | 2 | 3 | 4): EECourse[] {
    return EE_PROGRAM.semesters
        .filter(s => s.year === year)
        .flatMap(s => s.courses);
}

/**
 * Calculate total credits for a semester (handles ranges)
 */
export function getSemesterCredits(sem: EESemester): { min: number; max: number } {
    if (typeof sem.totalCredits === 'number') {
        return { min: sem.totalCredits, max: sem.totalCredits };
    }
    return sem.totalCredits;
}

/**
 * Get all core courses (non-elective)
 */
export function getEECoreCourses(): EECourse[] {
    return EE_PROGRAM.semesters
        .flatMap(s => s.courses)
        .filter(c => !c.isElectiveSlot);
}

/**
 * Validate semester credit totals
 */
export function validateSemesterCredits(): { semester: number; expected: { min: number; max: number }; actual: number; valid: boolean }[] {
    return EE_PROGRAM.semesters.map(sem => {
        const expected = getSemesterCredits(sem);
        const actual = sem.courses.reduce((sum, c) => {
            const credits = typeof c.credits === 'number' ? c.credits : c.credits.max;
            return sum + credits;
        }, 0);
        return {
            semester: sem.number,
            expected,
            actual,
            valid: actual >= expected.min && actual <= expected.max,
        };
    });
}

// ============================================
// VALIDATION CHECKLIST
// ============================================

/**
 * Run all validations and return report
 */
export function runValidation(): string {
    const semesterValidation = validateSemesterCredits();
    const coreCredits = getEECoreCourses().reduce((sum, c) => {
        return sum + (typeof c.credits === 'number' ? c.credits : c.credits.max);
    }, 0);

    let report = '=== EE CURRICULUM VALIDATION REPORT ===\n\n';

    report += 'Semester Credit Totals:\n';
    semesterValidation.forEach(v => {
        const status = v.valid ? '✅' : '❌';
        report += `  Sem ${v.semester}: ${v.actual} credits (expected: ${v.expected.min}-${v.expected.max}) ${status}\n`;
    });

    report += `\nCore Program Credits: ${coreCredits}\n`;
    report += `Expected Range: ${EE_PROGRAM.totalCredits.core.min}-${EE_PROGRAM.totalCredits.core.max}\n`;

    return report;
}
