/**
 * Community Module Types
 * ======================
 * Mock schema definitions for the community feature
 */

// ============================================
// TTL CONSTANTS
// ============================================
export const THREAD_TTL_DAYS = 7;         // Regular threads expire after 7 days
export const PINNED_THREAD_TTL_DAYS = 30; // Pinned threads get extended TTL
export const REPLY_TTL_DAYS = 7;          // Replies expire with their threads

// ============================================
// CHANNEL
// ============================================

/** Channel Type - determines routing and implicit membership */
export type ChannelType = 'general' | 'branch' | 'course';

/** 
 * Posting Policy - per-channel permission control
 * - ADMIN_ONLY: Only admins can create threads/replies
 * - STUDENT_ALLOWED: Students may post (subject to moderation/rate limits)
 * - READ_ONLY_ARCHIVE: No new posts allowed, content visible until TTL
 */
export type PostingPolicy = 'ADMIN_ONLY' | 'STUDENT_ALLOWED' | 'READ_ONLY_ARCHIVE';

export interface Channel {
    id: string;
    name: string;
    description?: string;

    // Channel classification
    channelType: ChannelType;         // 'general' | 'branch' | 'course'
    postingPolicy: PostingPolicy;     // Per-channel posting rules

    // For branch/course channels
    branchCode?: string;              // e.g., 'ee', 'cse'
    courseCode?: string;              // e.g., 'EEC-206'
    isCourseChannel: boolean;         // Legacy compat

    // Metadata
    createdBy: string;                // userId (must be admin for general channels)
    createdAt: string;                // ISO timestamp
    lastActivityAt: string;           // ISO timestamp
    membersCount: number;
    isPrivate?: boolean;              // course channels = private to enrolled
    pinnedThreadId?: string;
    avatarUrl?: string;
}

// ============================================
// THREAD
// ============================================
export type ThreadTag = 'Doubt' | 'Resource' | 'Discussion' | 'Announcement';

export interface AttachmentMeta {
    id: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
    url: string;
    previewUrl?: string;
}

export interface Thread {
    id: string;
    channelId: string;
    title: string;
    body: string;
    tags: ThreadTag[];
    createdBy: string | null;  // null for anonymous
    isAnonymous: boolean;
    createdAt: string;
    updatedAt?: string;
    upvotesCount: number;
    replyCount: number;
    lastActivityAt: string;
    expiresAt: string;         // Auto-calculated based on lastActivityAt + TTL
    attachments?: AttachmentMeta[];
    isPinned?: boolean;
}

// ============================================
// REPLY
// ============================================
export interface Reply {
    id: string;
    threadId: string;
    parentReplyId?: string;    // for nested replies (one level max)
    body: string;
    createdBy: string | null;
    isAnonymous: boolean;
    createdAt: string;
    upvotesCount: number;
    expiresAt: string;         // Expires with the thread
    attachments?: AttachmentMeta[];
}

// ============================================
// UPVOTE
// ============================================
export interface Upvote {
    id: string;
    itemId: string;
    itemType: 'thread' | 'reply';
    userId: string;
    createdAt: string;
}

// ============================================
// MEMBERSHIP
// ============================================
export type MemberRole = 'member' | 'moderator' | 'admin';

export interface Membership {
    userId: string;
    channelId: string;
    role: MemberRole;
    joinedAt: string;
}

// ============================================
// NOTIFICATION
// ============================================
export type NotificationType =
    | 'new_thread'
    | 'reply'
    | 'mention'
    | 'upvote'
    | 'thread_pinned'
    | 'moderation';

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    payload: {
        channelId?: string;
        channelName?: string;
        threadId?: string;
        threadTitle?: string;
        replyId?: string;
        actorId?: string;
        actorUsername?: string;
        message?: string;
    };
    isRead: boolean;
    createdAt: string;
}

// ============================================
// REPORT
// ============================================
export type ReportReason =
    | 'spam'
    | 'harassment'
    | 'inappropriate'
    | 'misinformation'
    | 'other';

export interface Report {
    id: string;
    itemId: string;
    itemType: 'thread' | 'reply';
    reportedBy: string;
    reason: ReportReason;
    description?: string;
    status: 'pending' | 'reviewed' | 'dismissed' | 'actioned';
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
}

// ============================================
// PAGINATION
// ============================================
export interface PaginationCursor {
    cursor: string | null;
    hasMore: boolean;
}

export interface PaginatedResult<T> {
    data: T[];
    pagination: PaginationCursor;
}

// ============================================
// FILTER & SORT OPTIONS
// ============================================
export type ThreadSortOption = 'latest' | 'popular' | 'unanswered';

export interface ThreadFilters {
    tags?: ThreadTag[];
    search?: string;
    sort?: ThreadSortOption;
}

// ============================================
// API RESPONSE TYPES
// ============================================
export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

// ============================================
// DEMO USER FOR COMMUNITY
// ============================================
export interface CommunityUser {
    id: string;
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    branch: string | null;
    year: number | null;
}
