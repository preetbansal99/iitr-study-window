import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    validateUsernameFormat,
    normalizeUsername,
    validatePhone,
    type BranchValue,
    type YearValue
} from '@/lib/validation/username';

/**
 * User Profile Store
 * ==================
 * Manages user profile data in mock mode with persistence.
 * Tracks onboarding state and profile edits.
 */

// Username change cooldown (30 days in milliseconds)
export const USERNAME_CHANGE_COOLDOWN_DAYS = 30;
export const USERNAME_CHANGE_COOLDOWN_MS = USERNAME_CHANGE_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export interface NotificationPreferences {
    replies: boolean;
    mentions: boolean;
    upvotes: boolean;
    newThreads: boolean;
}

export interface UsernameHistoryEntry {
    username: string;
    changedAt: string;
}

export interface UserProfile {
    id: string;
    email: string;
    username: string | null;
    fullName: string | null;
    branch: BranchValue | null;
    year: YearValue | null;
    phone: string | null;
    avatarUrl: string | null;
    bio: string | null;                              // Short academic bio
    anonymousPostingDefault: boolean;                // Toggle for anonymous posting
    notificationPreferences: NotificationPreferences;
    usernameHistory: UsernameHistoryEntry[];         // For moderation
    usernameLastChangedAt: string | null;            // For 30-day cooldown
    createdAt: string;
    updatedAt: string;
    lastEditedAt: string | null;
    onboardingSkipped: boolean;
    onboardingSkippedAt: string | null;
}

interface UserState {
    // Current user profile
    profile: UserProfile | null;
    isLoading: boolean;
    error: string | null;

    // All usernames in the system (for uniqueness check in mock mode)
    allUsernames: string[];

    // Demo mode role override (DEMO MODE ONLY)
    // This does NOT affect real role logic, only UI display
    demoRole: 'ADMIN' | 'STUDENT' | null;

    // Actions
    initializeUser: (email: string, id?: string) => void;
    updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
    setUsername: (username: string) => Promise<{ success: boolean; error?: string }>;
    skipOnboarding: () => void;
    checkUsernameAvailable: (username: string) => boolean;
    isOnboardingRequired: () => boolean;
    clearProfile: () => void;
    setDemoRole: (role: 'ADMIN' | 'STUDENT' | null) => void;
}

// Demo users for uniqueness testing
const DEMO_USERNAMES = [
    'john_doe',
    'jane_smith',
    'preet_b',
    'demo_user',
];

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            profile: null,
            isLoading: false,
            error: null,
            allUsernames: [...DEMO_USERNAMES],
            demoRole: null,

            // Demo mode role override setter
            setDemoRole: (role: 'ADMIN' | 'STUDENT' | null) => {
                set({ demoRole: role });
            },

            initializeUser: (email: string, id?: string) => {
                const existingProfile = get().profile;

                // If profile already exists with same email, don't reinitialize
                if (existingProfile?.email === email) {
                    return;
                }

                set({
                    profile: {
                        id: id || `user-${Date.now()}`,
                        email,
                        username: null,
                        fullName: null,
                        branch: null,
                        year: null,
                        phone: null,
                        avatarUrl: null,
                        bio: null,
                        anonymousPostingDefault: false,
                        notificationPreferences: {
                            replies: true,
                            mentions: true,
                            upvotes: false,
                            newThreads: true,
                        },
                        usernameHistory: [],
                        usernameLastChangedAt: null,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        lastEditedAt: null,
                        onboardingSkipped: false,
                        onboardingSkippedAt: null,
                    },
                });
            },

            updateProfile: async (updates) => {
                const { profile } = get();
                if (!profile) {
                    return { success: false, error: 'No profile found' };
                }

                // Track if this is a username change
                let isUsernameChange = false;

                // Validate username if being updated
                if (updates.username !== undefined && updates.username !== null) {
                    const normalized = normalizeUsername(updates.username);

                    // Check if actually changing username (not just setting for first time)
                    if (profile.username && normalized !== profile.username) {
                        isUsernameChange = true;

                        // Check 30-day cooldown
                        if (profile.usernameLastChangedAt) {
                            const lastChange = new Date(profile.usernameLastChangedAt).getTime();
                            const now = Date.now();
                            if (now - lastChange < USERNAME_CHANGE_COOLDOWN_MS) {
                                const daysRemaining = Math.ceil((USERNAME_CHANGE_COOLDOWN_MS - (now - lastChange)) / (24 * 60 * 60 * 1000));
                                return { success: false, error: `You can change your username again in ${daysRemaining} days` };
                            }
                        }
                    }

                    const validation = validateUsernameFormat(normalized);
                    if (!validation.isValid) {
                        return { success: false, error: validation.error };
                    }

                    // Check uniqueness (excluding current user)
                    const isAvailable = get().checkUsernameAvailable(normalized);
                    if (!isAvailable && normalized !== profile.username) {
                        return { success: false, error: 'Username is already taken' };
                    }

                    updates.username = normalized;
                }

                // Validate phone if being updated
                if (updates.phone !== undefined && updates.phone !== null && updates.phone !== '') {
                    const phoneValidation = validatePhone(updates.phone);
                    if (!phoneValidation.isValid) {
                        return { success: false, error: phoneValidation.error };
                    }
                }

                set((state) => {
                    const newUsername = updates.username;
                    const oldUsername = state.profile?.username;
                    const now = new Date().toISOString();

                    // Update allUsernames if username changed
                    let newAllUsernames = [...state.allUsernames];
                    if (newUsername && newUsername !== oldUsername) {
                        if (oldUsername) {
                            newAllUsernames = newAllUsernames.filter(u => u !== oldUsername);
                        }
                        if (!newAllUsernames.includes(newUsername)) {
                            newAllUsernames.push(newUsername);
                        }
                    }

                    // Build username history if changing
                    let newUsernameHistory = [...(state.profile?.usernameHistory || [])];
                    let newUsernameLastChangedAt = state.profile?.usernameLastChangedAt || null;

                    if (isUsernameChange && oldUsername) {
                        newUsernameHistory.push({ username: oldUsername, changedAt: now });
                        newUsernameLastChangedAt = now;
                    } else if (newUsername && !oldUsername) {
                        // First time setting username
                        newUsernameLastChangedAt = now;
                    }

                    return {
                        profile: state.profile ? {
                            ...state.profile,
                            ...updates,
                            usernameHistory: newUsernameHistory,
                            usernameLastChangedAt: newUsernameLastChangedAt,
                            updatedAt: now,
                            lastEditedAt: now,
                        } : null,
                        allUsernames: newAllUsernames,
                    };
                });

                return { success: true };
            },

            setUsername: async (username: string) => {
                return get().updateProfile({ username });
            },

            skipOnboarding: () => {
                set((state) => ({
                    profile: state.profile ? {
                        ...state.profile,
                        onboardingSkipped: true,
                        onboardingSkippedAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                    } : null,
                }));
            },

            checkUsernameAvailable: (username: string) => {
                const normalized = normalizeUsername(username);
                const { allUsernames, profile } = get();

                // Available if not in list, or if it's the current user's username
                return !allUsernames.includes(normalized) || profile?.username === normalized;
            },

            isOnboardingRequired: () => {
                const { profile } = get();
                if (!profile) return false;

                // Onboarding required if username is null and not skipped
                return profile.username === null && !profile.onboardingSkipped;
            },

            clearProfile: () => {
                set({ profile: null, error: null });
            },
        }),
        {
            name: 'user-profile-storage',
            partialize: (state) => ({
                profile: state.profile,
                allUsernames: state.allUsernames,
            }),
        }
    )
);
