/**
 * Academic Identity Module
 * ========================
 * Handles enrollment number parsing, branch mapping, and semester derivation.
 * All identity logic is centralized here.
 */

// ============================================
// BRANCH CODE MAPPING (LOCKED)
// ============================================

export const BRANCH_CODES: Record<number, { code: string; name: string }> = {
    112: { code: "CH", name: "Chemical Engineering" },
    113: { code: "CE", name: "Civil Engineering" },
    114: { code: "CSE", name: "Computer Science & Engineering" },
    115: { code: "EE", name: "Electrical Engineering" },
    116: { code: "ECE", name: "Electronics & Communication Engineering" },
    117: { code: "ME", name: "Mechanical Engineering" },
    119: { code: "PIE", name: "Production & Industrial Engineering" },
    123: { code: "EPH", name: "Engineering Physics" },
    125: { code: "DSAI", name: "Data Science & Artificial Intelligence" },
    323: { code: "MnC", name: "Mathematics & Computing" },
};

// Email domain prefix to branch name mapping
const EMAIL_DOMAIN_TO_BRANCH: Record<string, string> = {
    "ch": "Chemical Engineering",
    "ce": "Civil Engineering",
    "cs": "Computer Science & Engineering",
    "cse": "Computer Science & Engineering",
    "ee": "Electrical Engineering",
    "ec": "Electronics & Communication Engineering",
    "ece": "Electronics & Communication Engineering",
    "me": "Mechanical Engineering",
    "pie": "Production & Industrial Engineering",
    "pni": "Production & Industrial Engineering",
    "eph": "Engineering Physics",
    "ep": "Engineering Physics",
    "dsai": "Data Science & Artificial Intelligence",
    "mt": "Mathematics & Computing",
    "mnc": "Mathematics & Computing",
    "bs": "Mathematics & Computing",
};

// ============================================
// ENROLLMENT NUMBER PARSING
// ============================================

export interface ParsedEnrollment {
    enrollmentYear: number;  // Full year (e.g., 2025)
    branchCode: number;      // 3-digit code (e.g., 115)
    rollNumber: number;      // Roll number (e.g., 109)
}

/**
 * Parse enrollment number in format YYBBBXXX
 * @param enrollment 8-digit enrollment number string
 * @returns Parsed components or null if invalid
 */
export function parseEnrollmentNumber(enrollment: string): ParsedEnrollment | null {
    const cleaned = enrollment.trim();

    if (!/^\d{8}$/.test(cleaned)) {
        return null;
    }

    const yy = parseInt(cleaned.slice(0, 2), 10);
    const bbb = parseInt(cleaned.slice(2, 5), 10);
    const xxx = parseInt(cleaned.slice(5, 8), 10);

    // Convert 2-digit year to full year (assume 2000s for < 50, 1900s otherwise)
    const enrollmentYear = yy < 50 ? 2000 + yy : 1900 + yy;

    // Validate branch code exists
    if (!BRANCH_CODES[bbb]) {
        return null;
    }

    return {
        enrollmentYear,
        branchCode: bbb,
        rollNumber: xxx,
    };
}

/**
 * Get branch name from branch code
 */
export function getBranchName(branchCode: number): string | null {
    return BRANCH_CODES[branchCode]?.name || null;
}

/**
 * Get branch code abbreviation
 */
export function getBranchCode(branchCode: number): string | null {
    return BRANCH_CODES[branchCode]?.code || null;
}

// ============================================
// EMAIL-BASED BRANCH DETECTION (FALLBACK)
// ============================================

/**
 * Extract branch from email domain
 * e.g., preet_b@ee.iitr.ac.in → "Electrical Engineering"
 */
export function getBranchFromEmail(email: string): string | null {
    const match = email.toLowerCase().match(/@([a-z]+)\.iitr\.ac\.in$/);
    if (!match) return null;

    const prefix = match[1];
    return EMAIL_DOMAIN_TO_BRANCH[prefix] || null;
}

/**
 * Get branch code number from email domain
 */
export function getBranchCodeFromEmail(email: string): number | null {
    const branchName = getBranchFromEmail(email);
    if (!branchName) return null;

    // Find the code from the name
    for (const [code, data] of Object.entries(BRANCH_CODES)) {
        if (data.name === branchName) {
            return parseInt(code, 10);
        }
    }
    return null;
}

// ============================================
// SEMESTER DERIVATION
// ============================================

export interface SemesterInfo {
    academicYear: number;  // 1, 2, 3, or 4
    semester: number;      // 1-8
    yearLabel: string;     // "1st Year", "2nd Year", etc.
}

const YEAR_LABELS = ["1st Year", "2nd Year", "3rd Year", "4th Year"];

/**
 * Derive current academic year and semester from enrollment year
 * 
 * Rules:
 * - Academic calendar: Sem 1 = Jul-Dec, Sem 2 = Jan-May
 * - Enrollment year = first year
 * 
 * @param enrollmentYear Full enrollment year (e.g., 2025)
 * @param currentDate Date to calculate from (defaults to now)
 */
export function deriveSemester(
    enrollmentYear: number,
    currentDate: Date = new Date()
): SemesterInfo {
    const currentMonth = currentDate.getMonth() + 1; // 1-12
    const currentYear = currentDate.getFullYear();

    // Determine if we're in first half (Jul-Dec) or second half (Jan-Jun)
    const isFirstHalf = currentMonth >= 7;

    // Calculate academic years elapsed
    let yearsElapsed: number;
    if (isFirstHalf) {
        // Jul-Dec of current calendar year = start of new academic year
        yearsElapsed = currentYear - enrollmentYear;
    } else {
        // Jan-Jun of current calendar year = second semester of previous academic year
        yearsElapsed = currentYear - enrollmentYear - 1;
    }

    // Clamp to valid range (1-4 years)
    const academicYear = Math.min(Math.max(yearsElapsed + 1, 1), 4);

    // Calculate semester (1-8)
    const baseSemester = (academicYear - 1) * 2 + 1;
    const semester = Math.min(baseSemester + (isFirstHalf ? 0 : 1), 8);

    return {
        academicYear,
        semester,
        yearLabel: YEAR_LABELS[academicYear - 1] || "4th Year",
    };
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate enrollment number format
 */
export function isValidEnrollmentNumber(enrollment: string): boolean {
    return parseEnrollmentNumber(enrollment) !== null;
}

/**
 * Extract full name from Google user metadata
 */
export function extractFullName(user: { user_metadata?: { full_name?: string; name?: string } }): string | null {
    return user.user_metadata?.full_name || user.user_metadata?.name || null;
}
