/**
 * Permission System
 * ==================
 * Centralized permission logic with ADMIN OVERRIDE
 * 
 * RULE: Admin bypasses ALL permission checks.
 * Admin is identified by email: preet_b@ee.iitr.ac.in
 */

// ============================================
// ADMIN IDENTIFICATION
// ============================================

const ADMIN_EMAIL = 'preet_b@ee.iitr.ac.in';

export type UserRole = 'ADMIN' | 'STUDENT';

/**
 * Compute user role from email
 * - ADMIN: preet_b@ee.iitr.ac.in
 * - STUDENT: all other users
 */
export function getUserRole(email: string | null | undefined): UserRole {
    if (!email) return 'STUDENT';
    return email === ADMIN_EMAIL ? 'ADMIN' : 'STUDENT';
}

/**
 * Check if user is admin
 */
export function isAdmin(email: string | null | undefined): boolean {
    return getUserRole(email) === 'ADMIN';
}

// ============================================
// PERMISSION HELPER (MANDATORY ORDER)
// ============================================
// ALL permission checks MUST follow this order:
// 1. If user.role === "ADMIN" → ALLOW
// 2. Else → evaluate student rules

export interface PermissionContext {
    userEmail: string | null;
    userId?: string | null;
}

export interface PermissionResult {
    allowed: boolean;
    reason?: string;
    isAdminOverride?: boolean;
}

/**
 * Check permission with admin override
 * @param ctx - Permission context (user email)
 * @param studentCheck - Function that returns true if student is allowed
 * @returns PermissionResult
 */
export function checkPermission(
    ctx: PermissionContext,
    studentCheck: () => boolean
): PermissionResult {
    // Step 1: ADMIN OVERRIDE - always allow
    if (isAdmin(ctx.userEmail)) {
        return {
            allowed: true,
            isAdminOverride: true,
            reason: 'Admin override - full access granted',
        };
    }

    // Step 2: Evaluate student rules
    const allowed = studentCheck();
    return {
        allowed,
        isAdminOverride: false,
        reason: allowed ? undefined : 'Permission denied',
    };
}

// ============================================
// SPECIFIC PERMISSION CHECKS
// ============================================

/**
 * Can user post in general community?
 */
export function canPostInGeneralCommunity(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // All authenticated students can post
        return !!ctx.userEmail;
    });
}

/**
 * Can user post in branch community?
 */
export function canPostInBranchCommunity(
    ctx: PermissionContext,
    userBranch: string | null,
    channelBranch: string
): PermissionResult {
    return checkPermission(ctx, () => {
        // Students can only post in their own branch
        return userBranch === channelBranch;
    });
}

/**
 * Can user post in course community?
 */
export function canPostInCourseCommunity(
    ctx: PermissionContext,
    userEnrolledCourses: string[],
    courseCode: string
): PermissionResult {
    return checkPermission(ctx, () => {
        // Students can only post if enrolled in course
        return userEnrolledCourses.includes(courseCode);
    });
}

// ============================================
// CHANNEL POSTING POLICY CHECKS
// ============================================
import type { PostingPolicy, ChannelType } from '@/lib/community/types';

/**
 * Can user post in a channel based on its postingPolicy?
 * This is the PRIMARY posting permission check.
 */
export function canPostInChannel(
    ctx: PermissionContext,
    postingPolicy: PostingPolicy,
    channelType: ChannelType,
    options?: {
        userBranch?: string | null;
        channelBranch?: string;
        userEnrolledCourses?: string[];
        courseCode?: string;
    }
): PermissionResult {
    // Step 1: ADMIN OVERRIDE - always allow
    if (isAdmin(ctx.userEmail)) {
        return {
            allowed: true,
            isAdminOverride: true,
            reason: 'Admin override - full posting access',
        };
    }

    // Step 2: Check posting policy
    switch (postingPolicy) {
        case 'ADMIN_ONLY':
            return {
                allowed: false,
                reason: 'This channel is admin-only',
            };

        case 'READ_ONLY_ARCHIVE':
            return {
                allowed: false,
                reason: 'This channel is archived - no new posts allowed',
            };

        case 'STUDENT_ALLOWED':
            // Check additional constraints based on channel type
            if (channelType === 'branch' && options?.userBranch && options?.channelBranch) {
                if (options.userBranch !== options.channelBranch) {
                    return {
                        allowed: false,
                        reason: 'You can only post in your own branch community',
                    };
                }
            }

            if (channelType === 'course' && options?.userEnrolledCourses && options?.courseCode) {
                if (!options.userEnrolledCourses.includes(options.courseCode)) {
                    return {
                        allowed: false,
                        reason: 'You must be enrolled in this course to post',
                    };
                }
            }

            return {
                allowed: true,
                reason: 'Posting allowed',
            };

        default:
            return {
                allowed: false,
                reason: 'Unknown posting policy',
            };
    }
}

/**
 * Can user create a general channel?
 * ONLY admins can create general channels.
 */
export function canCreateGeneralChannel(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students CANNOT create general channels
        return false;
    });
}

/**
 * Can user manage channel (rename, delete, change policy)?
 * ONLY admins can manage channels.
 */
export function canManageChannel(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students CANNOT manage channels
        return false;
    });
}

/**
 * Can user view expired content?
 * (Admin only - bypasses TTL)
 */
export function canViewExpiredContent(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students cannot view expired content
        return false;
    });
}

/**
 * Can user delete any thread? (Moderation)
 */
export function canDeleteAnyThread(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students cannot delete others' threads
        return false;
    });
}

/**
 * Can user delete any reply? (Moderation)
 */
export function canDeleteAnyReply(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students cannot delete others' replies
        return false;
    });
}

/**
 * Can user pin/unpin threads? (Moderation)
 */
export function canPinThreads(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students cannot pin threads
        return false;
    });
}

/**
 * Can user bypass rate limits?
 */
export function canBypassRateLimit(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students must respect rate limits
        return false;
    });
}

/**
 * Can user access moderation panel?
 */
export function canAccessModerationPanel(ctx: PermissionContext): PermissionResult {
    return checkPermission(ctx, () => {
        // Students cannot access moderation
        return false;
    });
}

// ============================================
// RATE LIMITING (with admin bypass)
// ============================================

const RATE_LIMITS = {
    threadsPerHour: 5,
    repliesPerMinute: 10,
    upvotesPerMinute: 30,
};

interface RateLimitState {
    threadCount: number;
    replyCount: number;
    upvoteCount: number;
    lastThreadReset: number;
    lastReplyReset: number;
    lastUpvoteReset: number;
}

const userRateLimits = new Map<string, RateLimitState>();

export function checkRateLimit(
    ctx: PermissionContext,
    action: 'thread' | 'reply' | 'upvote'
): PermissionResult {
    // Admin bypasses rate limits
    if (isAdmin(ctx.userEmail)) {
        return { allowed: true, isAdminOverride: true };
    }

    const userId = ctx.userId || ctx.userEmail;
    if (!userId) return { allowed: false, reason: 'Not authenticated' };

    const now = Date.now();
    let state = userRateLimits.get(userId);

    if (!state) {
        state = {
            threadCount: 0,
            replyCount: 0,
            upvoteCount: 0,
            lastThreadReset: now,
            lastReplyReset: now,
            lastUpvoteReset: now,
        };
        userRateLimits.set(userId, state);
    }

    switch (action) {
        case 'thread':
            if (now - state.lastThreadReset > 3600000) {
                state.threadCount = 0;
                state.lastThreadReset = now;
            }
            if (state.threadCount >= RATE_LIMITS.threadsPerHour) {
                return { allowed: false, reason: 'Rate limit: max 5 threads per hour' };
            }
            state.threadCount++;
            break;

        case 'reply':
            if (now - state.lastReplyReset > 60000) {
                state.replyCount = 0;
                state.lastReplyReset = now;
            }
            if (state.replyCount >= RATE_LIMITS.repliesPerMinute) {
                return { allowed: false, reason: 'Rate limit: max 10 replies per minute' };
            }
            state.replyCount++;
            break;

        case 'upvote':
            if (now - state.lastUpvoteReset > 60000) {
                state.upvoteCount = 0;
                state.lastUpvoteReset = now;
            }
            if (state.upvoteCount >= RATE_LIMITS.upvotesPerMinute) {
                return { allowed: false, reason: 'Rate limit: max 30 upvotes per minute' };
            }
            state.upvoteCount++;
            break;
    }

    return { allowed: true };
}

// ============================================
// EXPORT ALL FOR TESTING
// ============================================

export const PERMISSIONS = {
    ADMIN_EMAIL,
    getUserRole,
    isAdmin,
    checkPermission,
    canPostInGeneralCommunity,
    canPostInBranchCommunity,
    canPostInCourseCommunity,
    canPostInChannel,
    canCreateGeneralChannel,
    canManageChannel,
    canViewExpiredContent,
    canDeleteAnyThread,
    canDeleteAnyReply,
    canPinThreads,
    canBypassRateLimit,
    canAccessModerationPanel,
    checkRateLimit,
};
