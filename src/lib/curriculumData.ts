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
export const EE_CURRICULUM: Semester[] = [
    {
        number: 1,
        courses: [
            { code: "HSI-101", title: "Soft Skills", credits: 3, type: "core" },
            { code: "MAI-101", title: "Mathematics-I", credits: 4, type: "core" },
            { code: "PHI-101", title: "Physics-I", credits: 4, type: "core" },
            { code: "EEC-101", title: "Programming with C++", credits: 4, type: "core" },
            { code: "TMI-101", title: "Tinkering and Mentoring", credits: 4, type: "core" },
            { code: "ECE-101", title: "Fundamentals of Electronics", credits: 4, type: "core" },
        ],
    },
    {
        number: 2,
        courses: [
            { code: "IKS-102", title: "Indian Knowledge System", credits: 2, type: "core" },
            { code: "MAI-102", title: "Mathematics-II", credits: 4, type: "core" },
            { code: "ESS-102", title: "Environmental Science & Sustainability", credits: 3, type: "core" },
            { code: "ECE-103", title: "Digital Electronics", credits: 4, type: "core" },
            { code: "EEC-102", title: "Basic Electrical Science", credits: 4, type: "core" },
            { code: "EEC-104", title: "Signals and Systems", credits: 4, type: "core" },
        ],
    },
    {
        number: 3,
        courses: [
            { code: "MSI-101", title: "Fundamentals of Management", credits: 3, type: "core" },
            { code: "MAB-103", title: "Numerical Methods", credits: 4, type: "core" },
            { code: "CSE-101", title: "Data Structures & Algorithms", credits: 4, type: "core" },
            {
                code: "EEC-201",
                title: "Network Theory",
                credits: 4,
                type: "core",
                chapters: [
                    { id: "nt-1", title: "Unit 1: Network Elements & Topology", topics: ["Kirchhoff's Laws", "Node Analysis", "Mesh Analysis"] },
                    { id: "nt-2", title: "Unit 2: Network Theorems", topics: ["Superposition", "Thevenin's Theorem", "Norton's Theorem"] },
                    { id: "nt-3", title: "Unit 3: Transient Analysis", topics: ["First Order Circuits", "Second Order Circuits", "Laplace Transform"] },
                    { id: "nt-4", title: "Unit 4: Two-Port Networks", topics: ["Z-Parameters", "Y-Parameters", "Transmission Parameters"] },
                ]
            },
        ],
    },
    {
        number: 4,
        courses: [
            { code: "DAI-101", title: "Data Science", credits: 4, type: "core" },
            { code: "EEC-202", title: "Electrical & Electronic Measurements", credits: 4, type: "core" },
            {
                code: "EEC-204",
                title: "Control Systems",
                credits: 5,
                type: "core",
                chapters: [
                    { id: "cs-1", title: "Unit 1: System Modeling", topics: ["Transfer Functions", "Block Diagrams", "Signal Flow Graphs"] },
                    { id: "cs-2", title: "Unit 2: Time Domain Analysis", topics: ["Transient Response", "Steady State Error", "Stability"] },
                    { id: "cs-3", title: "Unit 3: Frequency Domain Analysis", topics: ["Bode Plot", "Nyquist Plot", "Polar Plot"] },
                    { id: "cs-4", title: "Unit 4: State Space Analysis", topics: ["State Variables", "Controllability", "Observability"] },
                ]
            },
            {
                code: "EEC-206",
                title: "Electrical Machines",
                credits: 4,
                type: "core",
                chapters: [
                    { id: "em-1", title: "Unit 1: Transformers", topics: ["Principle of Operation", "Equivalent Circuit", "Losses & Efficiency"] },
                    { id: "em-2", title: "Unit 2: DC Machines", topics: ["Construction", "EMF Equation", "Characteristics"] },
                    { id: "em-3", title: "Unit 3: Induction Motors", topics: ["Rotating Magnetic Field", "Slip", "Torque-Speed Curve"] },
                    { id: "em-4", title: "Unit 4: Synchronous Machines", topics: ["EMF Equation", "Power Angle", "Synchronization"] },
                ]
            },
            { code: "EEC-208", title: "Power Systems-I", credits: 4, type: "core" },
        ],
    },
    {
        number: 5,
        courses: [
            { code: "EEC-351", title: "Fundamentals of AI/ML", credits: 2, type: "core" },
            {
                code: "EEC-301",
                title: "Power Systems-II",
                credits: 4,
                type: "core",
                chapters: [
                    { id: "ps2-1", title: "Unit 1: Load Flow Analysis", topics: ["Gauss-Seidel", "Newton-Raphson", "Fast Decoupled"] },
                    { id: "ps2-2", title: "Unit 2: Fault Analysis", topics: ["Symmetrical Faults", "Unsymmetrical Faults", "Sequence Networks"] },
                    { id: "ps2-3", title: "Unit 3: Power System Stability", topics: ["Rotor Dynamics", "Swing Equation", "Equal Area Criterion"] },
                    { id: "ps2-4", title: "Unit 4: Economic Operation", topics: ["Economic Dispatch", "Unit Commitment", "Hydrothermal Scheduling"] },
                ]
            },
            {
                code: "EEC-303",
                title: "Power Electronics",
                credits: 4,
                type: "core",
                chapters: [
                    { id: "pe-1", title: "Unit 1: Power Semiconductor Devices", topics: ["SCR", "MOSFET", "IGBT"] },
                    { id: "pe-2", title: "Unit 2: Rectifiers", topics: ["Uncontrolled", "Controlled", "Dual Converters"] },
                    { id: "pe-3", title: "Unit 3: DC-DC Converters", topics: ["Buck", "Boost", "Buck-Boost"] },
                    { id: "pe-4", title: "Unit 4: Inverters", topics: ["VSI", "CSI", "PWM Techniques"] },
                ]
            },
            { code: "EEC-399", title: "Community Outreach", credits: 2, type: "core" },
        ],
    },
    {
        number: 6,
        courses: [
            {
                code: "EEC-300",
                title: "Engineering Analysis and Design",
                credits: 4,
                type: "core",
                chapters: [
                    { id: "ead-1", title: "Unit 1: Problem Formulation", topics: ["Requirements Analysis", "Constraints", "Specifications"] },
                    { id: "ead-2", title: "Unit 2: Design Methodology", topics: ["Conceptual Design", "Detailed Design", "Prototyping"] },
                    { id: "ead-3", title: "Unit 3: Analysis Tools", topics: ["Simulation", "Optimization", "Verification"] },
                ]
            },
            { code: "EEC-391", title: "Technical Communication", credits: 2, type: "core" },
        ],
    },
];

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
