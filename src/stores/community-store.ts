import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
    THREAD_TTL_DAYS,
    PINNED_THREAD_TTL_DAYS,
    REPLY_TTL_DAYS,
    type Channel,
    type Thread,
    type Reply,
    type Notification,
    type CommunityUser,
    type Membership,
    type Upvote,
    type ThreadTag,
    type ThreadSortOption,
} from '@/lib/community/types';
import {
    DEMO_CHANNELS,
    DEMO_THREADS,
    DEMO_REPLIES,
    DEMO_NOTIFICATIONS,
    DEMO_MEMBERSHIPS,
    DEMO_USERS,
    isExpired,
    calculateExpiresAt,
    calculateReplyExpiresAt,
} from '@/lib/community/mockData';
import { isAdmin } from '@/lib/permissions';

/**
 * Community Store
 * ================
 * Manages all community data in mock mode with persistence
 */

interface CommunityState {
    // Data
    channels: Channel[];
    threads: Thread[];
    replies: Reply[];
    notifications: Notification[];
    memberships: Membership[];
    users: CommunityUser[];
    upvotes: Upvote[];

    // UI State
    activeChannelId: string | null;
    activeThreadId: string | null;
    isLoading: boolean;
    error: string | null;

    // Filters
    threadSort: ThreadSortOption;
    threadSearch: string;
    threadTagFilter: ThreadTag | null;

    // Actions - Channels
    setActiveChannel: (channelId: string | null) => void;
    getChannel: (channelId: string) => Channel | undefined;
    getChannelsForUser: (userId: string) => Channel[];
    joinChannel: (userId: string, channelId: string) => void;
    leaveChannel: (userId: string, channelId: string) => void;

    // Actions - Threads
    setActiveThread: (threadId: string | null) => void;
    getThread: (threadId: string) => Thread | undefined;
    getThreadsForChannel: (channelId: string) => Thread[];
    createThread: (thread: Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'upvotesCount' | 'replyCount' | 'lastActivityAt' | 'expiresAt'>) => Thread;
    updateThread: (threadId: string, updates: Partial<Thread>) => void;
    deleteThread: (threadId: string) => void;
    pinThread: (threadId: string) => void;
    unpinThread: (threadId: string) => void;

    // Actions - Replies
    getRepliesForThread: (threadId: string) => Reply[];
    createReply: (reply: Omit<Reply, 'id' | 'createdAt' | 'upvotesCount' | 'expiresAt'>) => Reply;
    deleteReply: (replyId: string) => void;

    // Actions - Upvotes
    toggleUpvote: (itemId: string, itemType: 'thread' | 'reply', userId: string) => void;
    hasUpvoted: (itemId: string, itemType: 'thread' | 'reply', userId: string) => boolean;

    // Actions - Notifications
    getUnreadCount: (userId: string) => number;
    markNotificationRead: (notificationId: string) => void;
    markAllNotificationsRead: (userId: string) => void;

    // Actions - Filters
    setThreadSort: (sort: ThreadSortOption) => void;
    setThreadSearch: (search: string) => void;
    setThreadTagFilter: (tag: ThreadTag | null) => void;

    // Actions - Users
    getUser: (userId: string) => CommunityUser | undefined;

    // Initialize
    initialize: () => void;
}

// Helper to generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const useCommunityStore = create<CommunityState>()(
    persist(
        (set, get) => ({
            // Initial data
            channels: [],
            threads: [],
            replies: [],
            notifications: [],
            memberships: [],
            users: [],
            upvotes: [],

            // UI State
            activeChannelId: null,
            activeThreadId: null,
            isLoading: false,
            error: null,

            // Filters
            threadSort: 'latest',
            threadSearch: '',
            threadTagFilter: null,

            // Initialize with demo data
            initialize: () => {
                const state = get();
                if (state.channels.length === 0) {
                    set({
                        channels: [...DEMO_CHANNELS],
                        threads: [...DEMO_THREADS],
                        replies: [...DEMO_REPLIES],
                        notifications: [...DEMO_NOTIFICATIONS],
                        memberships: [...DEMO_MEMBERSHIPS],
                        users: [...DEMO_USERS],
                    });
                }
            },

            // Channel Actions
            setActiveChannel: (channelId) => set({ activeChannelId: channelId, activeThreadId: null }),

            getChannel: (channelId) => get().channels.find(c => c.id === channelId),

            getChannelsForUser: (userId) => {
                const { channels, memberships } = get();
                const userMemberships = memberships.filter(m => m.userId === userId);
                return channels.filter(c =>
                    !c.isPrivate || userMemberships.some(m => m.channelId === c.id)
                );
            },

            joinChannel: (userId, channelId) => {
                set((state) => {
                    const exists = state.memberships.some(
                        m => m.userId === userId && m.channelId === channelId
                    );
                    if (exists) return state;

                    const channel = state.channels.find(c => c.id === channelId);

                    return {
                        memberships: [
                            ...state.memberships,
                            { userId, channelId, role: 'member', joinedAt: new Date().toISOString() },
                        ],
                        channels: state.channels.map(c =>
                            c.id === channelId
                                ? { ...c, membersCount: c.membersCount + 1 }
                                : c
                        ),
                    };
                });
            },

            leaveChannel: (userId, channelId) => {
                set((state) => ({
                    memberships: state.memberships.filter(
                        m => !(m.userId === userId && m.channelId === channelId)
                    ),
                    channels: state.channels.map(c =>
                        c.id === channelId
                            ? { ...c, membersCount: Math.max(0, c.membersCount - 1) }
                            : c
                    ),
                }));
            },

            // Thread Actions
            setActiveThread: (threadId) => set({ activeThreadId: threadId }),

            getThread: (threadId) => get().threads.find(t => t.id === threadId),

            getThreadsForChannel: (channelId) => {
                const { threads, threadSort, threadSearch, threadTagFilter } = get();

                // Filter by channel and exclude expired threads
                let filtered = threads.filter(t =>
                    t.channelId === channelId && !isExpired(t.expiresAt)
                );

                // Apply search filter
                if (threadSearch) {
                    const search = threadSearch.toLowerCase();
                    filtered = filtered.filter(t =>
                        t.title.toLowerCase().includes(search) ||
                        t.body.toLowerCase().includes(search)
                    );
                }

                // Apply tag filter
                if (threadTagFilter) {
                    filtered = filtered.filter(t => t.tags.includes(threadTagFilter));
                }

                // Sort
                switch (threadSort) {
                    case 'popular':
                        filtered.sort((a, b) => b.upvotesCount - a.upvotesCount);
                        break;
                    case 'unanswered':
                        filtered = filtered.filter(t => t.replyCount === 0);
                        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                        break;
                    case 'latest':
                    default:
                        filtered.sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime());
                }

                // Pinned threads always at top
                const pinned = filtered.filter(t => t.isPinned);
                const unpinned = filtered.filter(t => !t.isPinned);

                return [...pinned, ...unpinned];
            },

            createThread: (threadData) => {
                const now = new Date().toISOString();
                const isPinned = threadData.isPinned || false;
                const newThread: Thread = {
                    ...threadData,
                    id: generateId('thread'),
                    createdAt: now,
                    updatedAt: now,
                    upvotesCount: 0,
                    replyCount: 0,
                    lastActivityAt: now,
                    expiresAt: calculateExpiresAt(now, isPinned),
                };

                set((state) => ({
                    threads: [newThread, ...state.threads],
                    channels: state.channels.map(c =>
                        c.id === threadData.channelId
                            ? { ...c, lastActivityAt: now }
                            : c
                    ),
                }));

                return newThread;
            },

            updateThread: (threadId, updates) => {
                set((state) => ({
                    threads: state.threads.map(t =>
                        t.id === threadId
                            ? { ...t, ...updates, updatedAt: new Date().toISOString() }
                            : t
                    ),
                }));
            },

            deleteThread: (threadId) => {
                set((state) => ({
                    threads: state.threads.filter(t => t.id !== threadId),
                    replies: state.replies.filter(r => r.threadId !== threadId),
                }));
            },

            pinThread: (threadId) => {
                get().updateThread(threadId, { isPinned: true });
            },

            unpinThread: (threadId) => {
                get().updateThread(threadId, { isPinned: false });
            },

            // Reply Actions
            getRepliesForThread: (threadId) => {
                // Filter out expired replies
                return get().replies.filter(r =>
                    r.threadId === threadId && !isExpired(r.expiresAt)
                );
            },

            createReply: (replyData) => {
                const now = new Date().toISOString();
                const newReply: Reply = {
                    ...replyData,
                    id: generateId('reply'),
                    createdAt: now,
                    upvotesCount: 0,
                    expiresAt: calculateReplyExpiresAt(now),
                };

                set((state) => ({
                    replies: [...state.replies, newReply],
                    threads: state.threads.map(t =>
                        t.id === replyData.threadId
                            ? { ...t, replyCount: t.replyCount + 1, lastActivityAt: now }
                            : t
                    ),
                }));

                return newReply;
            },

            deleteReply: (replyId) => {
                const reply = get().replies.find(r => r.id === replyId);
                if (!reply) return;

                set((state) => ({
                    replies: state.replies.filter(r => r.id !== replyId),
                    threads: state.threads.map(t =>
                        t.id === reply.threadId
                            ? { ...t, replyCount: Math.max(0, t.replyCount - 1) }
                            : t
                    ),
                }));
            },

            // Upvote Actions
            toggleUpvote: (itemId, itemType, userId) => {
                const { upvotes } = get();
                const existingUpvote = upvotes.find(
                    u => u.itemId === itemId && u.itemType === itemType && u.userId === userId
                );

                if (existingUpvote) {
                    // Remove upvote
                    set((state) => ({
                        upvotes: state.upvotes.filter(u => u.id !== existingUpvote.id),
                        threads: itemType === 'thread'
                            ? state.threads.map(t => t.id === itemId ? { ...t, upvotesCount: Math.max(0, t.upvotesCount - 1) } : t)
                            : state.threads,
                        replies: itemType === 'reply'
                            ? state.replies.map(r => r.id === itemId ? { ...r, upvotesCount: Math.max(0, r.upvotesCount - 1) } : r)
                            : state.replies,
                    }));
                } else {
                    // Add upvote
                    const newUpvote: Upvote = {
                        id: generateId('upvote'),
                        itemId,
                        itemType,
                        userId,
                        createdAt: new Date().toISOString(),
                    };

                    set((state) => ({
                        upvotes: [...state.upvotes, newUpvote],
                        threads: itemType === 'thread'
                            ? state.threads.map(t => t.id === itemId ? { ...t, upvotesCount: t.upvotesCount + 1 } : t)
                            : state.threads,
                        replies: itemType === 'reply'
                            ? state.replies.map(r => r.id === itemId ? { ...r, upvotesCount: r.upvotesCount + 1 } : r)
                            : state.replies,
                    }));
                }
            },

            hasUpvoted: (itemId, itemType, userId) => {
                return get().upvotes.some(
                    u => u.itemId === itemId && u.itemType === itemType && u.userId === userId
                );
            },

            // Notification Actions
            getUnreadCount: (userId) => {
                return get().notifications.filter(n => n.userId === userId && !n.isRead).length;
            },

            markNotificationRead: (notificationId) => {
                set((state) => ({
                    notifications: state.notifications.map(n =>
                        n.id === notificationId ? { ...n, isRead: true } : n
                    ),
                }));
            },

            markAllNotificationsRead: (userId) => {
                set((state) => ({
                    notifications: state.notifications.map(n =>
                        n.userId === userId ? { ...n, isRead: true } : n
                    ),
                }));
            },

            // Filter Actions
            setThreadSort: (sort) => set({ threadSort: sort }),
            setThreadSearch: (search) => set({ threadSearch: search }),
            setThreadTagFilter: (tag) => set({ threadTagFilter: tag }),

            // User Actions
            getUser: (userId) => get().users.find(u => u.id === userId),
        }),
        {
            name: 'community-storage',
            partialize: (state) => ({
                channels: state.channels,
                threads: state.threads,
                replies: state.replies,
                notifications: state.notifications,
                memberships: state.memberships,
                users: state.users,
                upvotes: state.upvotes,
            }),
        }
    )
);
