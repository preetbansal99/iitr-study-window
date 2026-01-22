"use client";

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import {
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

// Supabase constants - inferred from component usage
// We assume tables: channels, threads, replies, upvotes, memberships

interface CommunityState {
    // Data
    channels: Channel[];
    threads: Thread[]; // Cache of fetched threads
    replies: Reply[]; // Cache of fetched replies
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

    // Actions - Fetching
    initialize: () => Promise<void>; // Fetches channels and user memberships
    fetchThreads: (channelId: string) => Promise<void>;
    fetchReplies: (threadId: string) => Promise<void>;

    // Actions - Channels
    setActiveChannel: (channelId: string | null) => void;
    getChannel: (channelId: string) => Channel | undefined;
    getUser: (userId: string) => CommunityUser | undefined;
    getChannelsForUser: (userId: string) => Channel[];
    joinChannel: (userId: string, channelId: string) => Promise<void>;
    leaveChannel: (userId: string, channelId: string) => Promise<void>;

    // Actions - Threads
    setActiveThread: (threadId: string | null) => void;
    getThread: (threadId: string) => Thread | undefined;
    getThreadsForChannel: (channelId: string) => Thread[]; // Returns from cache
    createThread: (thread: Omit<Thread, 'id' | 'createdAt' | 'updatedAt' | 'upvotesCount' | 'replyCount' | 'lastActivityAt' | 'expiresAt'>) => Promise<Thread | null>;
    updateThread: (threadId: string, updates: Partial<Thread>) => Promise<void>;
    deleteThread: (threadId: string) => Promise<void>;
    pinThread: (threadId: string) => Promise<void>;
    unpinThread: (threadId: string) => Promise<void>;

    // Actions - Replies
    getRepliesForThread: (threadId: string) => Reply[]; // Returns from cache
    createReply: (reply: Omit<Reply, 'id' | 'createdAt' | 'upvotesCount' | 'expiresAt'>) => Promise<Reply | null>;
    deleteReply: (replyId: string) => Promise<void>;

    // Actions - Upvotes
    toggleUpvote: (itemId: string, itemType: 'thread' | 'reply', userId: string) => Promise<void>;
    hasUpvoted: (itemId: string, itemType: 'thread' | 'reply', userId: string) => boolean;

    // Actions - Notifications
    getUnreadCount: (userId: string) => number;

    // Actions - Filters
    setThreadSort: (sort: ThreadSortOption) => void;
    setThreadSearch: (search: string) => void;
    setThreadTagFilter: (tag: ThreadTag | null) => void;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
    channels: [],
    threads: [],
    replies: [],
    notifications: [],
    memberships: [],
    users: [],
    upvotes: [],

    activeChannelId: null,
    activeThreadId: null,
    isLoading: false,
    error: null,

    threadSort: 'latest',
    threadSearch: '',
    threadTagFilter: null,

    initialize: async () => {
        set({ isLoading: true });
        const supabase = createClient();

        // Fetch public channels with counts
        const { data: channelsData, error: channelsError } = await supabase
            .from('channels')
            .select('*, threads(count), memberships(count)');

        if (channelsError) {
            console.error('Error fetching channels:', channelsError);
        }

        const channels = (channelsData || []).map((c: any) => ({
            ...c,
            // Map Supabase count response which comes as [{ count: n }]
            threadCount: c.threads?.[0]?.count || 0,
            membersCount: c.memberships?.[0]?.count || c.members_count || 0,
            // Ensure camelCase keys if DB is snake_case (Supabase JS client might auto-convert if configured, but explicit is safer or assuming DB matches types)
            channelType: c.channel_type || c.channelType,
            postingPolicy: c.posting_policy || c.postingPolicy,
            createdAt: c.created_at || c.createdAt,
            createdBy: c.created_by || c.createdBy,
        }));

        // Fetch user memberships if logged in
        const { data: { user } } = await supabase.auth.getUser();
        let memberships: Membership[] = [];
        let upvotes: Upvote[] = [];

        if (user) {
            const { data: members } = await supabase
                .from('memberships')
                .select('*')
                .eq('user_id', user.id);
            memberships = members || [];

            const { data: votes } = await supabase
                .from('upvotes')
                .select('*')
                .eq('user_id', user.id);
            upvotes = votes || [];
        }

        set({
            channels: channels || [],
            memberships: memberships,
            upvotes: upvotes,
            isLoading: false
        });
    },

    fetchThreads: async (channelId: string) => {
        set({ isLoading: true });
        const supabase = createClient();

        const { data: threads, error } = await supabase
            .from('threads')
            .select('*')
            .eq('channel_id', channelId)
            .order('last_activity_at', { ascending: false });

        if (error) {
            console.error('Error fetching threads:', error);
            set({ isLoading: false });
            return;
        }

        // Merge with existing threads (replace ones for this channel)
        set(state => ({
            threads: [
                ...state.threads.filter(t => t.channelId !== channelId),
                ...(threads || []).map(t => ({ ...t, channelId: t.channel_id, createdAt: t.created_at, updatedAt: t.updated_at, lastActivityAt: t.last_activity_at, upvotesCount: t.upvotes_count, replyCount: t.reply_count, isPinned: t.is_pinned })) // Map snake_case to camelCase if needed, assuming Supabase returns snake
            ],
            isLoading: false
        }));
    },

    fetchReplies: async (threadId: string) => {
        const supabase = createClient();
        const { data: replies, error } = await supabase
            .from('replies')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching replies:', error);
            return;
        }

        set(state => ({
            replies: [
                ...state.replies.filter(r => r.threadId !== threadId),
                ...(replies || []).map(r => ({ ...r, threadId: r.thread_id, createdAt: r.created_at, upvotesCount: r.upvotes_count }))
            ]
        }));
    },

    setActiveChannel: (channelId) => set({ activeChannelId: channelId, activeThreadId: null }),

    getChannel: (channelId) => get().channels.find(c => c.id === channelId),

    getUser: (userId) => get().users.find(u => u.id === userId),

    getChannelsForUser: (userId) => {
        return get().channels; // Simplified for now, verify private implementation later
    },

    joinChannel: async (userId, channelId) => {
        // Implementation TODO
    },
    leaveChannel: async (userId, channelId) => {
        // Implementation TODO
    },

    setActiveThread: (threadId) => set({ activeThreadId: threadId }),

    getThread: (threadId) => get().threads.find(t => t.id === threadId),

    getThreadsForChannel: (channelId) => {
        const { threads, threadSort, threadSearch, threadTagFilter } = get();
        // Client-side filtering of cached threads
        let filtered = threads.filter(t => t.channelId === channelId);

        if (threadSearch) {
            const search = threadSearch.toLowerCase();
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(search) ||
                t.body.toLowerCase().includes(search)
            );
        }

        if (threadTagFilter) {
            filtered = filtered.filter(t => t.tags && t.tags.includes(threadTagFilter));
        }

        // Sort logic similar to before...
        return filtered;
    },

    createThread: async (threadData) => {
        const supabase = createClient();
        const { data: user } = await supabase.auth.getUser();

        const payload = {
            channel_id: threadData.channelId,
            title: threadData.title,
            body: threadData.body,
            tags: threadData.tags,
            created_by: user.user?.id || 'anonymous',
            is_anonymous: threadData.isAnonymous,
        };

        const { data, error } = await supabase
            .from('threads')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error creating thread:', error);
            return null;
        }

        // Map snake_case to camelCase for consistency
        const mappedThread = {
            ...data,
            channelId: data.channel_id,
            createdBy: data.created_by,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            lastActivityAt: data.last_activity_at || data.created_at,
            upvotesCount: data.upvotes_count || 0,
            replyCount: data.reply_count || 0,
            isPinned: data.is_pinned || false,
            isAnonymous: data.is_anonymous || false,
        };

        // Optimistic update: prepend to threads array
        set(state => ({
            threads: [mappedThread, ...state.threads]
        }));

        // Refetch to ensure consistency and visibility for all users
        // This ensures DB-generated fields are synced and RLS is respected
        setTimeout(() => {
            get().fetchThreads(threadData.channelId);
        }, 100);

        return mappedThread;
    },

    updateThread: async (threadId, updates) => {
        // TODO implementation
    },

    deleteThread: async (threadId) => {
        const supabase = createClient();
        await supabase.from('threads').delete().eq('id', threadId);
        set(state => ({
            threads: state.threads.filter(t => t.id !== threadId)
        }));
    },

    pinThread: async (threadId) => {
        const supabase = createClient();
        await supabase.from('threads').update({ is_pinned: true }).eq('id', threadId);
        set(state => ({
            threads: state.threads.map(t => t.id === threadId ? { ...t, isPinned: true } : t)
        }));
    },

    unpinThread: async (threadId) => {
        const supabase = createClient();
        await supabase.from('threads').update({ is_pinned: false }).eq('id', threadId);
        set(state => ({
            threads: state.threads.map(t => t.id === threadId ? { ...t, isPinned: false } : t)
        }));
    },

    getRepliesForThread: (threadId) => {
        return get().replies.filter(r => r.threadId === threadId);
    },

    createReply: async (replyData) => {
        const supabase = createClient();
        const { data: user } = await supabase.auth.getUser();

        const payload = {
            thread_id: replyData.threadId,
            body: replyData.body,
            created_by: user.user?.id || 'anonymous',
            is_anonymous: replyData.isAnonymous
        };

        const { data, error } = await supabase
            .from('replies')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error creating reply:', error);
            return null;
        }

        const mappedReply = {
            ...data,
            threadId: data.thread_id,
            createdAt: data.created_at,
            upvotesCount: data.upvotes_count
        };

        set(state => ({
            replies: [...state.replies, mappedReply]
        }));
        return mappedReply;
    },

    deleteReply: async (replyId) => {
        const supabase = createClient();
        await supabase.from('replies').delete().eq('id', replyId);
        set(state => ({
            replies: state.replies.filter(r => r.id !== replyId)
        }));
    },

    toggleUpvote: async (itemId, itemType, userId) => {
        const supabase = createClient();
        const hasUpvoted = get().hasUpvoted(itemId, itemType, userId);

        if (hasUpvoted) {
            // Delete
            await supabase.from('upvotes').delete().match({ item_id: itemId, item_type: itemType, user_id: userId });
            set(state => ({
                upvotes: state.upvotes.filter(u => !(u.itemId === itemId && u.itemType === itemType && u.userId === userId))
            }));
        } else {
            // Create
            const { data } = await supabase.from('upvotes').insert({ item_id: itemId, item_type: itemType, user_id: userId }).select().single();
            if (data) {
                set(state => ({
                    upvotes: [...state.upvotes, { ...data, itemId: data.item_id, itemType: data.item_type, userId: data.user_id }]
                }));
            }
        }
    },

    hasUpvoted: (itemId, itemType, userId) => {
        return get().upvotes.some(u => u.itemId === itemId && u.itemType === itemType && u.userId === userId);
    },

    // Notifications - stub for now, returns 0 until notifications are fetched from Supabase
    getUnreadCount: (userId) => {
        return get().notifications.filter(n => n.userId === userId && !n.isRead).length;
    },

    setThreadSort: (sort) => set({ threadSort: sort }),
    setThreadSearch: (search) => set({ threadSearch: search }),
    setThreadTagFilter: (tag) => set({ threadTagFilter: tag }),
}));
