"use client";

import { useEffect, useState, use } from "react";
import { useCommunityStore } from "@/stores/community-store";
import { useUserStore } from "@/stores/user-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    ArrowLeft,
    Plus,
    Search,
    ThumbsUp,
    MessageSquare,
    Pin,
    User,
    Clock,
    Filter,
    ChevronDown,
    Eye,
    Loader2,
    Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Thread, ThreadTag, ThreadSortOption } from "@/lib/community/types";

export default function ChannelPage({ params }: { params: Promise<{ channelId: string }> }) {
    const resolvedParams = use(params);
    const channelId = resolvedParams.channelId;

    const {
        channels,
        threads,
        replies,
        initialize,
        getChannel,
        getThreadsForChannel,
        getRepliesForThread,
        getUser,
        createThread,
        createReply,
        toggleUpvote,
        hasUpvoted,
        fetchThreads,
        fetchReplies,
        threadSort,
        threadSearch,
        threadTagFilter,
        setThreadSort,
        setThreadSearch,
        setThreadTagFilter,
    } = useCommunityStore();

    const { profile } = useUserStore();

    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Composer form
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [newTags, setNewTags] = useState<ThreadTag[]>([]);
    const [isAnonymous, setIsAnonymous] = useState(false);

    // Reply form
    const [replyBody, setReplyBody] = useState("");

    useEffect(() => {
        initialize();
    }, [initialize]);

    useEffect(() => {
        if (channelId) {
            fetchThreads(channelId);
        }
    }, [fetchThreads, channelId]);

    useEffect(() => {
        if (selectedThreadId) {
            // Fetch replies when thread is selected
            fetchReplies(selectedThreadId);
        }
    }, [fetchReplies, selectedThreadId]);

    const channel = getChannel(channelId);
    const channelThreads = getThreadsForChannel(channelId);
    const selectedThread = selectedThreadId ? threads.find(t => t.id === selectedThreadId) || null : null;
    const userId = profile?.id || null;

    if (!channel) {
        return (
            <div className="flex h-full items-center justify-center p-8">
                <div className="text-center">
                    <p className="text-lg text-slate-600 dark:text-slate-400">Channel not found</p>
                    <Link href="/community">
                        <Button variant="link" className="mt-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Community
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleCreateThread = async () => {
        if (!newTitle.trim() || !newBody.trim()) return;

        setIsSubmitting(true);

        setIsSubmitting(true);

        await createThread({
            channelId,
            title: newTitle.trim(),
            body: newBody.trim(),
            tags: newTags.length > 0 ? newTags : ['Discussion'],
            createdBy: isAnonymous ? null : userId,
            isAnonymous,
        });

        setNewTitle("");
        setNewBody("");
        setNewTags([]);
        setIsAnonymous(false);
        setIsComposerOpen(false);
        setIsSubmitting(false);
    };

    const handleCreateReply = async () => {
        if (!replyBody.trim() || !selectedThread) return;

        setIsSubmitting(true);

        await createReply({
            threadId: selectedThread.id,
            body: replyBody.trim(),
            createdBy: userId!,
            isAnonymous: false,
        });

        setReplyBody("");
        setIsSubmitting(false);

        setReplyBody("");
        setIsSubmitting(false);
    };

    const threadReplies = selectedThread ? getRepliesForThread(selectedThread.id) : [];

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col p-4 lg:p-8">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/community">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-bold text-slate-900 lg:text-2xl dark:text-white">
                                {channel.name}
                            </h1>
                            {channel.courseCode && (
                                <Badge variant="secondary">{channel.courseCode}</Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-500">{channel.membersCount} members</p>
                    </div>
                </div>
                <Button onClick={() => setIsComposerOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Thread
                </Button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Search threads..."
                        value={threadSearch}
                        onChange={(e) => setThreadSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={threadSort} onValueChange={(v) => setThreadSort(v as ThreadSortOption)}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="latest">Latest</SelectItem>
                        <SelectItem value="popular">Popular</SelectItem>
                        <SelectItem value="unanswered">Unanswered</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={threadTagFilter || "all"}
                    onValueChange={(v) => setThreadTagFilter(v === "all" ? null : v as ThreadTag)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Filter by tag" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Tags</SelectItem>
                        <SelectItem value="Doubt">Doubt</SelectItem>
                        <SelectItem value="Resource">Resource</SelectItem>
                        <SelectItem value="Discussion">Discussion</SelectItem>
                        <SelectItem value="Announcement">Announcement</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Content */}
            <div className="flex-1 grid gap-4 lg:grid-cols-2 overflow-hidden">
                {/* Thread List */}
                <Card className="flex flex-col overflow-hidden">
                    <CardHeader className="py-3 border-b">
                        <CardTitle className="text-base">
                            {channelThreads.length} {channelThreads.length === 1 ? 'Thread' : 'Threads'}
                        </CardTitle>
                    </CardHeader>
                    <ScrollArea className="flex-1">
                        <div className="divide-y">
                            {channelThreads.map((thread) => {
                                const author = thread.createdBy ? getUser(thread.createdBy) : null;
                                const isSelected = selectedThreadId === thread.id;

                                return (
                                    <button
                                        key={thread.id}
                                        onClick={() => setSelectedThreadId(thread.id)}
                                        className={cn(
                                            "w-full text-left p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800",
                                            isSelected && "bg-indigo-50 dark:bg-indigo-950"
                                        )}
                                    >
                                        <div className="flex items-start gap-3">
                                            {thread.isPinned && (
                                                <Pin className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">
                                                    {thread.title}
                                                </h3>
                                                <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                                                    {thread.body}
                                                </p>
                                                <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                                                    <span className="flex items-center gap-1">
                                                        <User className="h-3 w-3" />
                                                        {thread.isAnonymous ? 'Anonymous' : author?.username || 'Unknown'}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ThumbsUp className="h-3 w-3" />
                                                        {thread.upvotesCount}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        {thread.replyCount}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {formatDistanceToNow(new Date(thread.lastActivityAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex gap-1">
                                                    {thread.tags.map((tag) => (
                                                        <Badge key={tag} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                            {channelThreads.length === 0 && (
                                <div className="p-8 text-center text-slate-500">
                                    No threads yet. Be the first to start a discussion!
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </Card>

                {/* Thread Detail */}
                <Card className="flex flex-col overflow-hidden">
                    {selectedThread ? (
                        <>
                            <CardHeader className="py-3 border-b">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <CardTitle className="text-base line-clamp-2">
                                            {selectedThread.title}
                                        </CardTitle>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                                            <span>
                                                {selectedThread.isAnonymous
                                                    ? 'Anonymous'
                                                    : getUser(selectedThread.createdBy!)?.username || 'Unknown'}
                                            </span>
                                            <span>•</span>
                                            <span>{formatDistanceToNow(new Date(selectedThread.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                            "gap-1",
                                            userId && hasUpvoted(selectedThread.id, 'thread', userId) && "text-indigo-600"
                                        )}
                                        onClick={() => userId && toggleUpvote(selectedThread.id, 'thread', userId)}
                                    >
                                        <ThumbsUp className="h-4 w-4" />
                                        {selectedThread.upvotesCount}
                                    </Button>
                                </div>
                            </CardHeader>
                            <ScrollArea className="flex-1">
                                <div className="p-4">
                                    {/* Thread Body */}
                                    <div className="prose prose-slate dark:prose-invert max-w-none">
                                        <p className="whitespace-pre-wrap">{selectedThread.body}</p>
                                    </div>

                                    {/* Replies */}
                                    <div className="mt-6 border-t pt-4">
                                        <h4 className="mb-4 font-medium text-slate-900 dark:text-white">
                                            {threadReplies.length} {threadReplies.length === 1 ? 'Reply' : 'Replies'}
                                        </h4>
                                        <div className="space-y-4">
                                            {threadReplies.map((reply) => {
                                                const replyAuthor = reply.createdBy ? getUser(reply.createdBy) : null;
                                                return (
                                                    <div key={reply.id} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                                {reply.isAnonymous ? 'Anonymous' : replyAuthor?.username || 'Unknown'}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                                            {reply.body}
                                                        </p>
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className={cn(
                                                                    "h-7 gap-1 text-xs",
                                                                    userId && hasUpvoted(reply.id, 'reply', userId) && "text-indigo-600"
                                                                )}
                                                                onClick={() => userId && toggleUpvote(reply.id, 'reply', userId)}
                                                            >
                                                                <ThumbsUp className="h-3 w-3" />
                                                                {reply.upvotesCount}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </ScrollArea>
                            {/* Reply Composer */}
                            <div className="border-t p-3">
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="Write a reply..."
                                        value={replyBody}
                                        onChange={(e) => setReplyBody(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleCreateReply();
                                            }
                                        }}
                                    />
                                    <Button
                                        size="icon"
                                        onClick={handleCreateReply}
                                        disabled={!replyBody.trim() || isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Send className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex h-full items-center justify-center text-slate-500">
                            <div className="text-center">
                                <Eye className="mx-auto h-12 w-12 text-slate-300" />
                                <p className="mt-2">Select a thread to view details</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* New Thread Dialog */}
            <Dialog open={isComposerOpen} onOpenChange={setIsComposerOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Create New Thread</DialogTitle>
                        <DialogDescription>
                            Start a new discussion in {channel.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="What's your question or topic?"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="body">Content</Label>
                            <textarea
                                id="body"
                                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Provide more details..."
                                value={newBody}
                                onChange={(e) => setNewBody(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tag</Label>
                            <Select
                                value={newTags[0] || ""}
                                onValueChange={(v) => setNewTags(v ? [v as ThreadTag] : [])}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a tag" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Doubt">Doubt</SelectItem>
                                    <SelectItem value="Resource">Resource</SelectItem>
                                    <SelectItem value="Discussion">Discussion</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="anonymous" className="text-sm font-normal">
                                Post anonymously
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsComposerOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateThread}
                            disabled={!newTitle.trim() || !newBody.trim() || isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post Thread'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
