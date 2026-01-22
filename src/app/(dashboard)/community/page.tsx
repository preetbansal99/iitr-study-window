"use client";

import { useEffect } from "react";
import { useCommunityStore } from "@/stores/community-store";
import { useUserStore } from "@/stores/user-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    MessageSquare,
    Users,
    BookOpen,
    Hash,
    ChevronRight,
    TrendingUp,
    Clock,
    Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function CommunityPage() {
    const {
        channels,
        threads,
        notifications,
        initialize,
        getUnreadCount,
    } = useCommunityStore();

    // Initialize community store
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Get recent activity
    const recentThreads = [...threads]
        .sort((a, b) => new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime())
        .slice(0, 5);

    const popularThreads = [...threads]
        .sort((a, b) => b.upvotesCount - a.upvotesCount)
        .slice(0, 5);

    const { profile } = useUserStore();

    const unreadCount = profile?.id ? getUnreadCount(profile.id) : 0;

    return (
        <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
                        Community
                    </h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Connect with fellow students, ask questions, and share resources
                    </p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Bell className="h-4 w-4" />
                    Notifications
                    {unreadCount > 0 && (
                        <Badge className="ml-1 bg-red-500 text-white">{unreadCount}</Badge>
                    )}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Channels List */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Hash className="h-5 w-5 text-indigo-600" />
                                Channels
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {channels.map((channel) => {
                                    const channelThreads = threads.filter(t => t.channelId === channel.id);
                                    const latestThread = channelThreads[0];

                                    return (
                                        <Link
                                            key={channel.id}
                                            href={`/community/${channel.id}`}
                                            className="group flex items-center gap-4 rounded-lg border border-slate-200 p-4 transition-all hover:border-indigo-300 hover:bg-indigo-50/50 dark:border-slate-700 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                                        >
                                            <div className={cn(
                                                "flex h-12 w-12 items-center justify-center rounded-lg",
                                                channel.isCourseChannel
                                                    ? "bg-violet-100 text-violet-600 dark:bg-violet-900 dark:text-violet-400"
                                                    : "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400"
                                            )}>
                                                {channel.isCourseChannel ? (
                                                    <BookOpen className="h-6 w-6" />
                                                ) : (
                                                    <MessageSquare className="h-6 w-6" />
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold text-slate-900 dark:text-white">
                                                        {channel.name}
                                                    </h3>
                                                    {channel.isCourseChannel && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {channel.courseCode}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="mt-0.5 truncate text-sm text-slate-500">
                                                    {channel.description || `${channelThreads.length} threads`}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-4 w-4" />
                                                    {channel.membersCount}
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Clock className="h-5 w-5 text-green-600" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-3">
                                    {recentThreads.map((thread) => {
                                        const channel = channels.find(c => c.id === thread.channelId);
                                        return (
                                            <Link
                                                key={thread.id}
                                                href={`/community/${thread.channelId}?thread=${thread.id}`}
                                                className="block rounded-md p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                            >
                                                <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-white">
                                                    {thread.title}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    in {channel?.name}
                                                </p>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    {/* Trending */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <TrendingUp className="h-5 w-5 text-orange-600" />
                                Trending
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[200px]">
                                <div className="space-y-3">
                                    {popularThreads.map((thread, index) => (
                                        <Link
                                            key={thread.id}
                                            href={`/community/${thread.channelId}?thread=${thread.id}`}
                                            className="flex items-start gap-3 rounded-md p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                                        >
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600 dark:bg-orange-900 dark:text-orange-400">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="line-clamp-1 text-sm font-medium text-slate-900 dark:text-white">
                                                    {thread.title}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {thread.upvotesCount} upvotes · {thread.replyCount} replies
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
