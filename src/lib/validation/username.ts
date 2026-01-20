/**
 * Username Validation Logic
 * =========================
 * Rules:
 * - 3-30 characters
 * - Lowercase letters, numbers, dash, underscore only
 * - Must start with a letter
 * - No consecutive special characters
 * - Profanity filter
 */

// Simple profanity word list (expandable)
const PROFANITY_LIST = [
    'admin', 'moderator', 'root', 'system', 'null', 'undefined',
    // Add more as needed - keeping it minimal for demo
];

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
    'admin', 'administrator', 'moderator', 'mod', 'system', 'support',
    'help', 'info', 'contact', 'root', 'superuser', 'null', 'undefined',
    'anonymous', 'guest', 'user', 'test', 'demo', 'iitr', 'studywindow',
];

export interface UsernameValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Validates username format
 */
export function validateUsernameFormat(username: string): UsernameValidationResult {
    // Trim and lowercase
    const normalized = username.trim().toLowerCase();

    // Check length
    if (normalized.length < 3) {
        return { isValid: false, error: 'Username must be at least 3 characters' };
    }

    if (normalized.length > 30) {
        return { isValid: false, error: 'Username must be 30 characters or less' };
    }

    // Check allowed characters (letters, numbers, dash, underscore)
    const validPattern = /^[a-z][a-z0-9_-]*$/;
    if (!validPattern.test(normalized)) {
        if (!/^[a-z]/.test(normalized)) {
            return { isValid: false, error: 'Username must start with a letter' };
        }
        return { isValid: false, error: 'Only letters, numbers, dash (-) and underscore (_) allowed' };
    }

    // Check for consecutive special characters
    if (/[-_]{2,}/.test(normalized)) {
        return { isValid: false, error: 'Cannot have consecutive dashes or underscores' };
    }

    // Check ending character
    if (/[-_]$/.test(normalized)) {
        return { isValid: false, error: 'Username cannot end with dash or underscore' };
    }

    // Check reserved usernames
    if (RESERVED_USERNAMES.includes(normalized)) {
        return { isValid: false, error: 'This username is reserved' };
    }

    // Check profanity
    if (containsProfanity(normalized)) {
        return { isValid: false, error: 'Username contains inappropriate content' };
    }

    return { isValid: true };
}

/**
 * Check if text contains profanity
 */
export function containsProfanity(text: string): boolean {
    const normalized = text.toLowerCase();
    return PROFANITY_LIST.some(word => normalized.includes(word));
}

/**
 * Normalize username (trim, lowercase)
 */
export function normalizeUsername(username: string): string {
    return username.trim().toLowerCase();
}

/**
 * Validate phone number format (optional field)
 * Accepts: +91XXXXXXXXXX, 91XXXXXXXXXX, XXXXXXXXXX
 */
export function validatePhone(phone: string): UsernameValidationResult {
    if (!phone || phone.trim() === '') {
        return { isValid: true }; // Optional field
    }

    const normalized = phone.replace(/[\s-]/g, '');

    // Indian phone number pattern
    const phonePattern = /^(\+91|91)?[6-9]\d{9}$/;

    if (!phonePattern.test(normalized)) {
        return { isValid: false, error: 'Please enter a valid Indian phone number' };
    }

    return { isValid: true };
}

/**
 * Branch options for dropdown
 */
export const BRANCH_OPTIONS = [
    { value: 'cse', label: 'Computer Science & Engineering' },
    { value: 'ece', label: 'Electronics & Communication' },
    { value: 'ee', label: 'Electrical Engineering' },
    { value: 'me', label: 'Mechanical Engineering' },
    { value: 'ce', label: 'Civil Engineering' },
    { value: 'che', label: 'Chemical Engineering' },
    { value: 'bt', label: 'Biotechnology' },
    { value: 'arch', label: 'Architecture' },
    { value: 'meta', label: 'Metallurgical Engineering' },
    { value: 'phy', label: 'Engineering Physics' },
    { value: 'other', label: 'Other' },
] as const;

/**
 * Year options for dropdown
 */
export const YEAR_OPTIONS = [
    { value: 1, label: '1st Year' },
    { value: 2, label: '2nd Year' },
    { value: 3, label: '3rd Year' },
    { value: 4, label: '4th Year' },
    { value: 5, label: '5th Year (Integrated)' },
] as const;

export type BranchValue = typeof BRANCH_OPTIONS[number]['value'];
export type YearValue = typeof YEAR_OPTIONS[number]['value'];
