/**
 * Mock Data for Community Module
 * ===============================
 * Seed data for demo/development mode
 */

import {
    THREAD_TTL_DAYS,
    PINNED_THREAD_TTL_DAYS,
    REPLY_TTL_DAYS,
    type Channel,
    type Thread,
    type Reply,
    type CommunityUser,
    type Membership,
    type Notification,
    type ThreadTag,
} from './types';

// ============================================
// TTL HELPER FUNCTIONS
// ============================================

/**
 * Calculate expiry date based on lastActivityAt and TTL
 */
export function calculateExpiresAt(lastActivityAt: string, isPinned: boolean = false): string {
    const ttlDays = isPinned ? PINNED_THREAD_TTL_DAYS : THREAD_TTL_DAYS;
    const date = new Date(lastActivityAt);
    date.setDate(date.getDate() + ttlDays);
    return date.toISOString();
}

/**
 * Calculate reply expiry based on thread expiry
 */
export function calculateReplyExpiresAt(createdAt: string): string {
    const date = new Date(createdAt);
    date.setDate(date.getDate() + REPLY_TTL_DAYS);
    return date.toISOString();
}

/**
 * Check if content has expired
 */
export function isExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
}

/**
 * Get days until expiry
 */
export function getDaysUntilExpiry(expiresAt: string): number {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
}

// ============================================
// DEMO USERS
// ============================================
export const DEMO_USERS: CommunityUser[] = [
    { id: 'user-1', username: 'preet_bansal', fullName: 'Preet Bansal', avatarUrl: null, branch: 'ee', year: 3 },
    { id: 'user-2', username: 'rahul_sharma', fullName: 'Rahul Sharma', avatarUrl: null, branch: 'cse', year: 2 },
    { id: 'user-3', username: 'ananya_singh', fullName: 'Ananya Singh', avatarUrl: null, branch: 'ece', year: 4 },
    { id: 'user-4', username: 'vikram_patel', fullName: 'Vikram Patel', avatarUrl: null, branch: 'me', year: 3 },
    { id: 'user-5', username: 'sneha_gupta', fullName: 'Sneha Gupta', avatarUrl: null, branch: 'ee', year: 2 },
    { id: 'user-6', username: 'arjun_verma', fullName: 'Arjun Verma', avatarUrl: null, branch: 'cse', year: 3 },
    { id: 'user-7', username: 'pooja_reddy', fullName: 'Pooja Reddy', avatarUrl: null, branch: 'bt', year: 4 },
    { id: 'user-8', username: 'karan_mehta', fullName: 'Karan Mehta', avatarUrl: null, branch: 'ce', year: 2 },
    { id: 'demo-user-123', username: 'demo_user', fullName: 'Demo User', avatarUrl: null, branch: 'ee', year: 3 },
];

// ============================================
// CHANNELS
// ============================================
// ADMIN controls general channels, postingPolicy per-channel
export const DEMO_CHANNELS: Channel[] = [
    // ==========================================
    // GENERAL CHANNELS (Admin-created only)
    // ==========================================
    {
        id: 'channel-general',
        name: 'General Lounge',
        description: 'Casual discussions, announcements, and general chat',
        channelType: 'general',
        postingPolicy: 'STUDENT_ALLOWED',  // Students CAN post here
        isCourseChannel: false,
        createdBy: 'user-1',  // Admin
        createdAt: '2024-08-01T10:00:00.000Z',
        lastActivityAt: new Date().toISOString(),
        membersCount: 156,
        isPrivate: false,
    },
    {
        id: 'channel-announcements',
        name: 'Announcements',
        description: 'Official announcements from admin - read only for students',
        channelType: 'general',
        postingPolicy: 'ADMIN_ONLY',  // Only admin can post
        isCourseChannel: false,
        createdBy: 'user-1',  // Admin
        createdAt: '2024-08-01T10:00:00.000Z',
        lastActivityAt: new Date().toISOString(),
        membersCount: 200,
        isPrivate: false,
    },
    {
        id: 'channel-resources',
        name: 'Resource Sharing',
        description: 'Share notes, papers, and study materials',
        channelType: 'general',
        postingPolicy: 'STUDENT_ALLOWED',  // Students CAN post here
        isCourseChannel: false,
        createdBy: 'user-1',  // Admin
        createdAt: '2024-09-01T10:00:00.000Z',
        lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        membersCount: 120,
        isPrivate: false,
    },
    {
        id: 'channel-placement',
        name: 'Placement Prep',
        description: 'Interview prep, company experiences, and tips',
        channelType: 'general',
        postingPolicy: 'STUDENT_ALLOWED',  // Students CAN post here
        isCourseChannel: false,
        createdBy: 'user-1',  // Admin
        createdAt: '2024-09-10T10:00:00.000Z',
        lastActivityAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        membersCount: 210,
        isPrivate: false,
    },
    {
        id: 'channel-archived',
        name: 'Old Announcements (Archive)',
        description: 'Archived announcements - no new posts',
        channelType: 'general',
        postingPolicy: 'READ_ONLY_ARCHIVE',  // No new posts
        isCourseChannel: false,
        createdBy: 'user-1',  // Admin
        createdAt: '2024-06-01T10:00:00.000Z',
        lastActivityAt: '2024-07-01T10:00:00.000Z',
        membersCount: 150,
        isPrivate: false,
    },
    // ==========================================
    // COURSE CHANNELS (Auto-created per course)
    // ==========================================
    {
        id: 'channel-eec206',
        name: 'EEC-206 Doubts',
        description: 'Electrical Machines - Ask questions and share resources',
        channelType: 'course',
        postingPolicy: 'STUDENT_ALLOWED',
        courseCode: 'EEC-206',
        branchCode: 'ee',
        isCourseChannel: true,
        createdBy: 'user-1',
        createdAt: '2024-08-15T10:00:00.000Z',
        lastActivityAt: new Date().toISOString(),
        membersCount: 42,
        isPrivate: true,
    },
    {
        id: 'channel-eec204',
        name: 'EEC-204 Control Systems',
        description: 'Control Systems discussions and problem solving',
        channelType: 'course',
        postingPolicy: 'STUDENT_ALLOWED',
        courseCode: 'EEC-204',
        branchCode: 'ee',
        isCourseChannel: true,
        createdBy: 'user-1',
        createdAt: '2024-08-15T10:00:00.000Z',
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        membersCount: 38,
        isPrivate: true,
    },
    {
        id: 'channel-cse101',
        name: 'CSE-101 Programming',
        description: 'Data Structures & Algorithms help',
        channelType: 'course',
        postingPolicy: 'STUDENT_ALLOWED',
        courseCode: 'CSE-101',
        branchCode: 'cse',
        isCourseChannel: true,
        createdBy: 'user-1',
        createdAt: '2024-08-20T10:00:00.000Z',
        lastActivityAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        membersCount: 85,
        isPrivate: true,
    },
];

// ============================================
// THREADS
// ============================================
// Raw thread data without expiresAt (computed at runtime)
type RawThread = Omit<Thread, 'expiresAt'>;

const RAW_THREADS: RawThread[] = [
    // General Lounge threads
    {
        id: 'thread-1',
        channelId: 'channel-general',
        title: 'Welcome to StudyWindow Community! 🎉',
        body: 'Hey everyone! This is the official community space for IITR students. Feel free to ask questions, share resources, and help each other out. Remember to be respectful and follow the community guidelines.',
        tags: ['Announcement'] as ThreadTag[],
        createdBy: 'user-1',
        isAnonymous: false,
        createdAt: '2024-08-01T10:00:00.000Z',
        upvotesCount: 45,
        replyCount: 12,
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isPinned: true,
    },
    {
        id: 'thread-2',
        channelId: 'channel-general',
        title: 'Best places to study on campus?',
        body: 'Looking for quiet spots to study during exam season. The library gets too crowded. Any suggestions?',
        tags: ['Discussion'] as ThreadTag[],
        createdBy: 'user-4',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 23,
        replyCount: 8,
        lastActivityAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    // EEC-206 threads
    {
        id: 'thread-3',
        channelId: 'channel-eec206',
        title: 'Doubt: Transformer equivalent circuit derivation',
        body: 'Can someone explain how we derive the equivalent circuit of a transformer from the actual winding arrangement? I\'m confused about the referred quantities.',
        tags: ['Doubt'] as ThreadTag[],
        createdBy: 'user-5',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 15,
        replyCount: 6,
        lastActivityAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'thread-4',
        channelId: 'channel-eec206',
        title: 'Sharing: Complete notes for Induction Motors unit',
        body: 'Hey everyone! I\'ve compiled detailed notes covering the entire Induction Motors unit. Includes diagrams, derivations, and solved examples from previous years.',
        tags: ['Resource'] as ThreadTag[],
        createdBy: 'user-1',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 67,
        replyCount: 14,
        lastActivityAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        attachments: [
            {
                id: 'att-1',
                filename: 'Induction_Motors_Complete.pdf',
                mimeType: 'application/pdf',
                sizeBytes: 2500000,
                url: '/mock/induction_motors.pdf',
            },
        ],
    },
    {
        id: 'thread-5',
        channelId: 'channel-eec206',
        title: 'Anonymous: Struggling with this course',
        body: 'I\'m finding it really hard to keep up with the pace of this course. Are there any recommendations for supplementary materials or YouTube channels that explain concepts better?',
        tags: ['Doubt'] as ThreadTag[],
        createdBy: null,
        isAnonymous: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 28,
        replyCount: 11,
        lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
    // EEC-204 threads
    {
        id: 'thread-6',
        channelId: 'channel-eec204',
        title: 'Bode Plot construction - step by step guide',
        body: 'Here\'s a step-by-step approach to constructing Bode plots that I found helpful:\n\n1. Factor the transfer function\n2. Find corner frequencies\n3. Draw asymptotes\n4. Add corrections near corner frequencies',
        tags: ['Resource'] as ThreadTag[],
        createdBy: 'user-3',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 89,
        replyCount: 7,
        lastActivityAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    // CSE-101 threads
    {
        id: 'thread-7',
        channelId: 'channel-cse101',
        title: 'Dynamic Programming patterns you must know',
        body: 'After solving 200+ DP problems, I\'ve identified the key patterns:\n\n1. Linear DP\n2. Knapsack variants\n3. LCS/LIS\n4. Matrix chain\n5. Digit DP\n6. DP on trees\n\nLet me know if you want detailed explanations for any!',
        tags: ['Resource'] as ThreadTag[],
        createdBy: 'user-2',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 156,
        replyCount: 32,
        lastActivityAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        isPinned: true,
    },
    // Placement Prep threads
    {
        id: 'thread-8',
        channelId: 'channel-placement',
        title: 'Google interview experience - SDE Intern 2024',
        body: 'Just had my Google interview! Here\'s my experience:\n\n**Round 1 (DSA):** Array problem, medium difficulty\n**Round 2 (DSA):** Graph + DP combination\n**Round 3 (HR):** Behavioral questions\n\nTips: Focus on communication and think aloud!',
        tags: ['Discussion'] as ThreadTag[],
        createdBy: 'user-6',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 234,
        replyCount: 45,
        lastActivityAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    // Resource Sharing threads
    {
        id: 'thread-9',
        channelId: 'channel-resources',
        title: 'All PYQs for EE 3rd year (2020-2024)',
        body: 'Compiled all previous year question papers for EE 3rd year courses. Includes mid-sems, end-sems, and quizzes where available.',
        tags: ['Resource'] as ThreadTag[],
        createdBy: 'user-5',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 312,
        replyCount: 28,
        lastActivityAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    },
];

// Factory export: add expiresAt to each thread
export const DEMO_THREADS: Thread[] = RAW_THREADS.map(t => ({
    ...t,
    expiresAt: calculateExpiresAt(t.lastActivityAt, t.isPinned),
}));

// ============================================
// REPLIES
// ============================================
// Raw reply data without expiresAt (computed at runtime)
type RawReply = Omit<Reply, 'expiresAt'>;

const RAW_REPLIES: RawReply[] = [
    // Replies for thread-3 (Transformer doubt)
    {
        id: 'reply-1',
        threadId: 'thread-3',
        body: 'Great question! The key is to understand that we "refer" quantities from one side to the other using the turns ratio. When you refer the secondary to the primary, you multiply impedances by (N1/N2)².',
        createdBy: 'user-1',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 3600000).toISOString(),
        upvotesCount: 12,
    },
    {
        id: 'reply-2',
        threadId: 'thread-3',
        parentReplyId: 'reply-1',
        body: 'Thanks! That makes sense. But why do we square the turns ratio for impedance?',
        createdBy: 'user-5',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 7200000).toISOString(),
        upvotesCount: 3,
    },
    {
        id: 'reply-3',
        threadId: 'thread-3',
        parentReplyId: 'reply-2',
        body: 'Because impedance = V/I. When you refer, V scales by N1/N2 and I scales by N2/N1. So Z scales by (N1/N2) × (N1/N2) = (N1/N2)²',
        createdBy: 'user-1',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 10800000).toISOString(),
        upvotesCount: 18,
    },
    // Replies for thread-2 (Study spots)
    {
        id: 'reply-4',
        threadId: 'thread-2',
        body: 'The rooftop of Civil department building is pretty quiet and has a great view! Just don\'t go during peak sun hours.',
        createdBy: 'user-7',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 15,
    },
    {
        id: 'reply-5',
        threadId: 'thread-2',
        body: 'Architecture building has some nice corners. Very aesthetic and usually empty on weekends.',
        createdBy: 'user-8',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 22,
    },
    // Replies for thread-5 (Anonymous struggling)
    {
        id: 'reply-6',
        threadId: 'thread-5',
        body: 'Don\'t worry, you\'re not alone! Try NPTEL lectures by Prof. from IIT Kharagpur - they explain things really well.',
        createdBy: 'user-3',
        isAnonymous: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 19,
    },
    {
        id: 'reply-7',
        threadId: 'thread-5',
        body: 'I was in the same boat last year. Form a study group - it really helps to discuss concepts with peers.',
        createdBy: null,
        isAnonymous: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        upvotesCount: 14,
    },
];

// ============================================
// MEMBERSHIPS
// ============================================
export const DEMO_MEMBERSHIPS: Membership[] = [
    // Demo user memberships
    { userId: 'demo-user-123', channelId: 'channel-general', role: 'member', joinedAt: '2024-08-01T10:00:00.000Z' },
    { userId: 'demo-user-123', channelId: 'channel-eec206', role: 'member', joinedAt: '2024-08-15T10:00:00.000Z' },
    { userId: 'demo-user-123', channelId: 'channel-eec204', role: 'member', joinedAt: '2024-08-15T10:00:00.000Z' },
    { userId: 'demo-user-123', channelId: 'channel-resources', role: 'member', joinedAt: '2024-09-01T10:00:00.000Z' },
    { userId: 'demo-user-123', channelId: 'channel-placement', role: 'member', joinedAt: '2024-09-10T10:00:00.000Z' },
    // User-1 is admin of some channels
    { userId: 'user-1', channelId: 'channel-general', role: 'admin', joinedAt: '2024-08-01T10:00:00.000Z' },
    { userId: 'user-1', channelId: 'channel-eec206', role: 'admin', joinedAt: '2024-08-15T10:00:00.000Z' },
];

// ============================================
// NOTIFICATIONS
// ============================================
export const DEMO_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif-1',
        userId: 'demo-user-123',
        type: 'reply',
        payload: {
            channelId: 'channel-eec206',
            channelName: 'EEC-206 Doubts',
            threadId: 'thread-4',
            threadTitle: 'Sharing: Complete notes for Induction Motors unit',
            actorUsername: 'sneha_gupta',
            message: 'replied to your thread',
        },
        isRead: false,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'notif-2',
        userId: 'demo-user-123',
        type: 'upvote',
        payload: {
            threadId: 'thread-4',
            threadTitle: 'Sharing: Complete notes for Induction Motors unit',
            message: 'Your thread received 5 new upvotes',
        },
        isRead: false,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 'notif-3',
        userId: 'demo-user-123',
        type: 'new_thread',
        payload: {
            channelId: 'channel-placement',
            channelName: 'Placement Prep',
            threadId: 'thread-8',
            threadTitle: 'Google interview experience - SDE Intern 2024',
            actorUsername: 'arjun_verma',
        },
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
];

// Factory export: add expiresAt to each reply
export const DEMO_REPLIES: Reply[] = RAW_REPLIES.map(r => ({
    ...r,
    expiresAt: calculateReplyExpiresAt(r.createdAt),
}));

// ============================================
// HELPER FUNCTIONS
// ============================================
export function getUserById(userId: string): CommunityUser | undefined {
    return DEMO_USERS.find(u => u.id === userId);
}

export function getUserByUsername(username: string): CommunityUser | undefined {
    return DEMO_USERS.find(u => u.username === username);
}

export function getChannelById(channelId: string): Channel | undefined {
    return DEMO_CHANNELS.find(c => c.id === channelId);
}

export function getThreadsByChannel(channelId: string): Thread[] {
    return DEMO_THREADS.filter(t => t.channelId === channelId);
}

export function getRepliesByThread(threadId: string): Reply[] {
    return DEMO_REPLIES.filter(r => r.threadId === threadId);
}
