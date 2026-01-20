"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    Pencil,
    Trash2,
    Lock,
    Archive,
    ChevronRight,
    Shield,
} from "lucide-react";
import { useCommunityStore } from "@/stores/community-store";
import { useUserStore } from "@/stores/user-store";
import { isAdmin, canCreateGeneralChannel, canManageChannel } from "@/lib/permissions";
import type { PostingPolicy, Channel } from "@/lib/community/types";

export default function GeneralCommunityPage() {
    const router = useRouter();
    const { channels, initialize, threads } = useCommunityStore();
    const { profile } = useUserStore();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [newChannelName, setNewChannelName] = useState("");
    const [newChannelDescription, setNewChannelDescription] = useState("");
    const [newChannelPolicy, setNewChannelPolicy] = useState<PostingPolicy>("STUDENT_ALLOWED");

    // Initialize store
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Check if current user is admin
    const userEmail = profile?.email || null;
    const userIsAdmin = isAdmin(userEmail);
    const ctx = { userEmail };

    // Filter general channels only
    const generalChannels = channels.filter(c => c.channelType === 'general');

    // Get thread count per channel
    const getThreadCount = (channelId: string) => {
        return threads.filter(t => t.channelId === channelId).length;
    };

    // Get posting policy badge
    const getPolicyBadge = (policy: PostingPolicy) => {
        switch (policy) {
            case 'ADMIN_ONLY':
                return (
                    <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Admin Only
                    </Badge>
                );
            case 'READ_ONLY_ARCHIVE':
                return (
                    <Badge variant="outline" className="gap-1 text-amber-600">
                        <Archive className="h-3 w-3" />
                        Archived
                    </Badge>
                );
            case 'STUDENT_ALLOWED':
                return (
                    <Badge variant="default" className="gap-1 bg-green-600">
                        <Users className="h-3 w-3" />
                        Open
                    </Badge>
                );
        }
    };

    // Handle channel creation (admin only)
    const handleCreateChannel = () => {
        // In real implementation, would call store.createChannel()
        alert(`Creating channel: ${newChannelName} with policy: ${newChannelPolicy}`);
        setShowCreateDialog(false);
        setNewChannelName("");
        setNewChannelDescription("");
        setNewChannelPolicy("STUDENT_ALLOWED");
    };

    return (
        <div className="p-4 lg:p-8">
            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
                <Link href="/resources" className="hover:text-indigo-600">
                    Resources
                </Link>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-slate-900 dark:text-white">Community</span>
            </nav>

            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        General Community
                    </h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">
                        Connect with fellow students across all branches
                    </p>
                </div>

                {/* Admin: Create Channel Button */}
                {userIsAdmin && canCreateGeneralChannel(ctx).allowed && (
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Sub-Channel
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Sub-Channel</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div>
                                    <label className="text-sm font-medium">Channel Name</label>
                                    <Input
                                        value={newChannelName}
                                        onChange={(e) => setNewChannelName(e.target.value)}
                                        placeholder="e.g., Study Tips"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Description</label>
                                    <Textarea
                                        value={newChannelDescription}
                                        onChange={(e) => setNewChannelDescription(e.target.value)}
                                        placeholder="What is this channel for?"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Posting Policy</label>
                                    <Select
                                        value={newChannelPolicy}
                                        onValueChange={(v) => setNewChannelPolicy(v as PostingPolicy)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STUDENT_ALLOWED">
                                                Students can post
                                            </SelectItem>
                                            <SelectItem value="ADMIN_ONLY">
                                                Admin only (announcements)
                                            </SelectItem>
                                            <SelectItem value="READ_ONLY_ARCHIVE">
                                                Read-only archive
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleCreateChannel} disabled={!newChannelName.trim()}>
                                    Create Channel
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Admin indicator */}
                {userIsAdmin && (
                    <Badge variant="outline" className="ml-4 gap-1 border-amber-500 text-amber-600">
                        <Shield className="h-3 w-3" />
                        Admin
                    </Badge>
                )}
            </div>

            {/* Channel Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {generalChannels.map((channel) => (
                    <Card
                        key={channel.id}
                        className="group cursor-pointer transition-all hover:shadow-lg hover:border-indigo-300 dark:hover:border-indigo-700"
                        onClick={() => router.push(`/community/${channel.id}`)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900">
                                        <MessageSquare className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg group-hover:text-indigo-600">
                                            {channel.name}
                                        </CardTitle>
                                    </div>
                                </div>
                                {getPolicyBadge(channel.postingPolicy)}
                            </div>
                            <CardDescription className="mt-2">
                                {channel.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between text-sm text-slate-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <Users className="h-4 w-4" />
                                        {channel.membersCount}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <MessageSquare className="h-4 w-4" />
                                        {getThreadCount(channel.id)} threads
                                    </span>
                                </div>

                                {/* Admin: Edit/Delete buttons */}
                                {userIsAdmin && canManageChannel(ctx).allowed && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alert(`Edit channel: ${channel.name}`);
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alert(`Delete channel: ${channel.name}`);
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty state */}
            {generalChannels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <MessageSquare className="h-16 w-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300">
                        No channels yet
                    </h3>
                    <p className="text-slate-500 mt-2">
                        {userIsAdmin
                            ? "Create the first community channel to get started."
                            : "Community channels will appear here once created."}
                    </p>
                </div>
            )}
        </div>
    );
}
