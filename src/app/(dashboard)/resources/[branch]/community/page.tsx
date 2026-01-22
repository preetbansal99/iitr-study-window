"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    MessageSquare,
    Users,
    Plus,
    ChevronRight,
    ThumbsUp,
    MessageCircle,
    Pin,
    Trash2,
    Clock,
    Shield,
    Send,
} from "lucide-react";
import { useCommunityStore } from "@/stores/community-store";
import { useUserStore } from "@/stores/user-store";
import { isAdmin, canPostInChannel, canPinThreads, canDeleteAnyThread } from "@/lib/permissions";
import type { ThreadTag } from "@/lib/community/types";

// Branch name mapping
const BRANCH_NAMES: Record<string, string> = {
    ee: "Electrical Engineering",
    cse: "Computer Science",
    ece: "Electronics & Communication",
    me: "Mechanical Engineering",
    ce: "Civil Engineering",
    che: "Chemical Engineering",
    bt: "Biotechnology",
    arch: "Architecture",
};

export default function BranchCommunityPage() {
    const params = useParams();
    const router = useRouter();
    const branch = (params.branch as string)?.toLowerCase() || "";
    const branchName = BRANCH_NAMES[branch] || branch.toUpperCase();

    const { channels, threads, initialize, createThread, getUser, toggleUpvote, hasUpvoted, fetchThreads } = useCommunityStore();
    const { profile } = useUserStore();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [newBody, setNewBody] = useState("");
    const [newTag, setNewTag] = useState<ThreadTag>("Discussion");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize store
    useEffect(() => {
        initialize();
    }, [initialize]);



    // Check if current user is admin
    const userEmail = profile?.email || null;
    const userIsAdmin = isAdmin(userEmail);
    const userId = profile?.id || "demo-user-123";
    const ctx = { userEmail, userId };

    // Get or create branch channel (for demo, use general channel)
    // In production, would have proper branch channels
    const branchChannel = channels.find(c => c.branchCode === branch) || channels.find(c => c.id === 'channel-general');
    const channelId = branchChannel?.id || 'channel-general';
    const postingPolicy = branchChannel?.postingPolicy || 'STUDENT_ALLOWED';
    const channelType = branchChannel?.channelType || 'branch';

    // Fetch threads when channel is determined
    useEffect(() => {
        if (channelId) {
            fetchThreads(channelId);
        }
    }, [fetchThreads, channelId]);

    // Check posting permission
    const canPost = canPostInChannel(ctx, postingPolicy, channelType, {
        userBranch: profile?.branchName || null,
        channelBranch: branch,
    });

    // Get threads for this channel
    const channelThreads = threads
        .filter(t => t.channelId === channelId)
        .sort((a, b) => {
            // Pinned first
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            // Then by activity
            return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
        });

    // Handle thread creation
    const handleCreateThread = async () => {
        if (!newTitle.trim() || !newBody.trim()) return;
        setIsSubmitting(true);

        try {
            await createThread({
                channelId,
                title: newTitle.trim(),
                body: newBody.trim(),
                tags: [newTag],
                createdBy: isAnonymous ? null : userId,
                isAnonymous,
            });

            setNewTitle("");
            setNewBody("");
            setIsAnonymous(false);
            setShowCreateDialog(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Format time ago
    const formatTimeAgo = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return "Just now";
    };

    return (
        <div className="p-4 lg:p-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                <Link href="/resources" className="hover:text-indigo-600">
                    Resources
                </Link>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/resources?branch=${branch.toUpperCase()}`} className="hover:text-indigo-600">
                    {branchName}
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-slate-900 dark:text-white">Community</span>
            </nav>

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        {branchName} Community
                    </h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Discuss courses, share resources, and connect with peers
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Admin badge */}
                    {userIsAdmin && (
                        <Badge variant="outline" className="gap-1 border-amber-500 text-amber-600">
                            <Shield className="h-3 w-3" />
                            Admin
                        </Badge>
                    )}

                    {/* Create Thread Button */}
                    {canPost.allowed && (
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button className="gap-2">
                                    <Plus className="h-4 w-4" />
                                    Create Thread
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg">
                                <DialogHeader>
                                    <DialogTitle>Create New Thread</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div>
                                        <label className="text-sm font-medium">Title</label>
                                        <Input
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="What's your question or topic?"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium">Content</label>
                                        <Textarea
                                            value={newBody}
                                            onChange={(e) => setNewBody(e.target.value)}
                                            placeholder="Share details, context, or your thoughts..."
                                            rows={5}
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-sm font-medium">Tag</label>
                                            <Select value={newTag} onValueChange={(v) => setNewTag(v as ThreadTag)}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Doubt">Doubt</SelectItem>
                                                    <SelectItem value="Discussion">Discussion</SelectItem>
                                                    <SelectItem value="Resource">Resource</SelectItem>
                                                    <SelectItem value="Announcement">Announcement</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={isAnonymous}
                                                    onChange={(e) => setIsAnonymous(e.target.checked)}
                                                    className="rounded"
                                                />
                                                <span className="text-sm">Post anonymously</span>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreateThread}
                                        disabled={!newTitle.trim() || !newBody.trim() || isSubmitting}
                                        className="gap-2"
                                    >
                                        <Send className="h-4 w-4" />
                                        Post Thread
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}

                    {/* Show reason if can't post */}
                    {!canPost.allowed && !userIsAdmin && (
                        <Badge variant="outline" className="text-slate-500">
                            {canPost.reason}
                        </Badge>
                    )}
                </div>
            </div>

            {/* Thread List */}
            <div className="space-y-4">
                {channelThreads.map((thread) => {
                    const author = thread.createdBy ? getUser(thread.createdBy) : null;
                    const authorName = thread.isAnonymous ? "Anonymous" : (author?.username || "Unknown");
                    const isUpvoted = hasUpvoted(thread.id, 'thread', userId);

                    return (
                        <Card
                            key={thread.id}
                            className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-200"
                            onClick={() => router.push(`/community/${channelId}?thread=${thread.id}`)}
                        >
                            <CardHeader className="pb-2">
                                <div className="flex items-start gap-4">
                                    {/* Upvote button */}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`flex flex-col h-auto py-2 ${isUpvoted ? 'text-indigo-600' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleUpvote(thread.id, 'thread', userId);
                                        }}
                                    >
                                        <ThumbsUp className={`h-5 w-5 ${isUpvoted ? 'fill-current' : ''}`} />
                                        <span className="text-sm font-medium">{thread.upvotesCount}</span>
                                    </Button>

                                    {/* Thread content */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            {thread.isPinned && (
                                                <Badge variant="secondary" className="gap-1 text-amber-600">
                                                    <Pin className="h-3 w-3" />
                                                    Pinned
                                                </Badge>
                                            )}
                                            {thread.tags.map((tag) => (
                                                <Badge key={tag} variant="outline" className="text-xs">
                                                    {tag}
                                                </Badge>
                                            ))}
                                        </div>
                                        <CardTitle className="text-lg hover:text-indigo-600">
                                            {thread.title}
                                        </CardTitle>
                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                            {thread.body}
                                        </p>
                                        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                                            <span>by {authorName}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatTimeAgo(thread.lastActivityAt)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <MessageCircle className="h-3 w-3" />
                                                {thread.replyCount} replies
                                            </span>
                                        </div>
                                    </div>

                                    {/* Admin actions */}
                                    {userIsAdmin && (
                                        <div className="flex gap-1">
                                            {canPinThreads(ctx).allowed && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        alert(`Pin/Unpin: ${thread.title}`);
                                                    }}
                                                >
                                                    <Pin className={`h-4 w-4 ${thread.isPinned ? 'text-amber-600' : ''}`} />
                                                </Button>
                                            )}
                                            {canDeleteAnyThread(ctx).allowed && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="h-8 w-8 p-0 text-red-500"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        alert(`Delete: ${thread.title}`);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>

            {/* Empty state */}
            {channelThreads.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare className="h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                        No discussions yet
                    </h3>
                    <p className="text-slate-500 mt-2">
                        Be the first to start a conversation in your branch community!
                    </p>
                    {canPost.allowed && (
                        <Button className="mt-4 gap-2" onClick={() => setShowCreateDialog(true)}>
                            <Plus className="h-4 w-4" />
                            Start Discussion
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
