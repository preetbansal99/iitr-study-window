"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
    ChevronLeft,
    ChevronRight,
    Video,
    FileText,
    Archive,
    BookOpen,
    ClipboardList,
    ExternalLink,
    CheckCircle2,
    Clock,
    MessageCircle,
    Users,
    ThumbsUp,
    Plus,
    Loader2,
    Pin,
    Trash2,
    AlertCircle,
    Timer,
    Send,
    Pencil,
    Save,
    X,
    Upload,
    FileQuestion,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Chapter } from "@/lib/curriculumData";
import { useCommunityStore } from "@/stores/community-store";
import { useUserStore } from "@/stores/user-store";
import { useCourseStore, type CourseResource } from "@/stores/course-store";
import { isAdmin, canPostInChannel } from "@/lib/permissions";
import type { Thread, ThreadTag } from "@/lib/community/types";
import { RequestResourceModal } from "./request-modal";

// Mock resources removed - now fetching from Supabase

// Helper function to calculate expiry status
function getExpiryStatus(expiresAt: string): { text: string; color: string; urgent: boolean } {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return { text: 'Expired', color: 'text-red-500', urgent: true };
    if (diffDays === 1) return { text: '1 day left', color: 'text-red-500', urgent: true };
    if (diffDays <= 3) return { text: `${diffDays} days left`, color: 'text-amber-500', urgent: true };
    return { text: `${diffDays} days left`, color: 'text-slate-400', urgent: false };
}

// Helper to format relative time
function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

// Tag color mapping
const TAG_COLORS: Record<ThreadTag, { bg: string; text: string; border: string }> = {
    'Doubt': { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    'Resource': { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
    'Discussion': { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    'Announcement': { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
};

interface CourseDetailProps {
    course: Course;
    onBack: () => void;
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [checkedTopics, setCheckedTopics] = useState<Set<string>>(new Set());
    const [pypFilters, setPypFilters] = useState({ year: "all", examType: "all" });
    const [archiveBatch, setArchiveBatch] = useState("all");

    // Community tab state
    const [newThreadOpen, setNewThreadOpen] = useState(false);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadBody, setNewThreadBody] = useState('');
    const [newThreadTag, setNewThreadTag] = useState<ThreadTag>('Doubt');
    const [isCreatingThread, setIsCreatingThread] = useState(false);

    // Request modal state
    const [requestModalOpen, setRequestModalOpen] = useState(false);

    // Admin editing states
    const [isEditingOverview, setIsEditingOverview] = useState(false);
    const [overviewDraft, setOverviewDraft] = useState('');
    const [isAddingChapter, setIsAddingChapter] = useState(false);
    const [newChapterTitle, setNewChapterTitle] = useState('');
    const [newChapterTopics, setNewChapterTopics] = useState('');
    const [isUploadingResource, setIsUploadingResource] = useState(false);
    const [newResourceTitle, setNewResourceTitle] = useState('');
    const [newResourceUrl, setNewResourceUrl] = useState('');
    const [newResourceCategory, setNewResourceCategory] = useState<CourseResource['category']>('notes');
    const [newResourceYear, setNewResourceYear] = useState('');
    const [newResourceExamType, setNewResourceExamType] = useState<'MTE' | 'ETE' | 'Quiz'>('MTE');

    // Store hooks
    const { profile } = useUserStore();
    const {
        threads,
        initialize,
        getThreadsForChannel,
        fetchThreads,
        createThread,
        toggleUpvote,
        hasUpvoted,
        pinThread,
        unpinThread,
        deleteThread,
    } = useCommunityStore();

    const {
        currentCourse,
        fetchCourseData,
        updateOverview,
        addChapter,
        deleteChapter,
        addResource,
        deleteResource,
    } = useCourseStore();

    const userEmail = profile?.email || null;
    const userId = profile?.id || 'anonymous';
    const userIsAdmin = isAdmin(userEmail);

    // Generate course channel ID
    const courseChannelId = `course-${course.code.toLowerCase().replace(/\s+/g, '-')}`;

    // Initialize stores
    useEffect(() => {
        initialize(); // Community store channels
        fetchCourseData(course.code); // Course store
        fetchThreads(courseChannelId); // Course threads
    }, [initialize, fetchCourseData, fetchThreads, course.code, courseChannelId]);

    // Get threads for this course channel
    const courseThreads = useMemo(() => {
        return getThreadsForChannel(courseChannelId);
    }, [getThreadsForChannel, courseChannelId, threads]);

    // Get current course data
    const chapters = currentCourse?.chapters || [];
    const overview = currentCourse?.overview || '';

    const toggleTopic = (chapterId: string, topic: string) => {
        const key = `${chapterId}-${topic}`;
        const newChecked = new Set(checkedTopics);
        if (newChecked.has(key)) {
            newChecked.delete(key);
        } else {
            newChecked.add(key);
        }
        setCheckedTopics(newChecked);
    };

    // Handle new thread creation
    const handleCreateThread = async () => {
        if (!newThreadTitle.trim() || !newThreadBody.trim()) return;

        setIsCreatingThread(true);
        try {
            await createThread({
                channelId: courseChannelId,
                title: newThreadTitle.trim(),
                body: newThreadBody.trim(),
                tags: [newThreadTag],
                createdBy: userId,
                isAnonymous: false,
            });

            // Reset form and close dialog
            setNewThreadTitle('');
            setNewThreadBody('');
            setNewThreadTag('Doubt');
            setNewThreadOpen(false);
        } finally {
            setIsCreatingThread(false);
        }
    };

    // Handle upvote
    const handleUpvote = (threadId: string) => {
        toggleUpvote(threadId, 'thread', userId);
    };

    // Admin: Save overview
    const handleSaveOverview = () => {
        updateOverview(course.code, overviewDraft);
        setIsEditingOverview(false);
    };

    // Admin: Start editing overview
    const handleStartEditOverview = () => {
        setOverviewDraft(overview || '');
        setIsEditingOverview(true);
    };

    // Admin: Add new chapter
    const handleAddChapter = () => {
        if (!newChapterTitle.trim()) return;
        const topics = newChapterTopics.split('\n').filter(t => t.trim());
        addChapter(course.code, newChapterTitle.trim(), topics);
        setNewChapterTitle('');
        setNewChapterTopics('');
        setIsAddingChapter(false);
    };

    // Admin: Delete chapter
    const handleDeleteChapter = (chapterId: string) => {
        if (confirm('Are you sure you want to delete this chapter?')) {
            deleteChapter(chapterId);
        }
    };

    // Admin: Upload resource
    const handleUploadResource = () => {
        if (!newResourceTitle.trim() || !newResourceUrl.trim()) return;
        addResource(course.code, {
            title: newResourceTitle.trim(),
            url: newResourceUrl.trim(),
            category: newResourceCategory,
            // added_by is handled by store
            year: newResourceCategory === 'pyp' ? newResourceYear : undefined,
            exam_type: newResourceCategory === 'pyp' ? newResourceExamType : undefined,
        });
        setNewResourceTitle('');
        setNewResourceUrl('');
        setNewResourceYear('');
        setIsUploadingResource(false);
    };

    // Admin: Delete resource
    const handleDeleteResource = (resourceId: string) => {
        if (confirm('Are you sure you want to delete this resource?')) {
            deleteResource(resourceId);
        }
    };

    // Get resources from store by category
    const storeResources = (category: CourseResource['category']) => {
        return (currentCourse?.resources || []).filter(r => r.category === category);
    };

    // Filter PYPs from store
    const filteredPyp = storeResources('pyp').filter((p) => {
        if (pypFilters.year !== "all" && p.year !== pypFilters.year) return false;
        if (pypFilters.examType !== "all" && p.exam_type !== pypFilters.examType) return false;
        return true;
    });

    // Filter Archives from store
    const filteredArchives = storeResources('archive').filter((a) => {
        if (archiveBatch !== "all" && a.batch !== archiveBatch) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
                <div className="flex-1">
                    <Badge className="mb-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {course.code}
                    </Badge>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {course.title}
                    </h2>
                    <p className="text-sm text-slate-500">{course.credits} Credits</p>
                </div>
                {/* Request Resource Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRequestModalOpen(true)}
                    className="gap-2"
                >
                    <FileQuestion className="h-4 w-4" />
                    Request
                </Button>
            </div>

            {/* Top-Level Tabs: Overview | Resources | Community */}
            <Tabs defaultValue="resources" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="overview" className="gap-2">
                        <BookOpen className="h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="resources" className="gap-2">
                        <FileText className="h-4 w-4" />
                        Resources
                    </TabsTrigger>
                    <TabsTrigger value="community" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Community
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview">
                    <div className="space-y-6">
                        {/* Course Info Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Course Overview</CardTitle>
                                {userIsAdmin && !isEditingOverview && (
                                    <Button variant="outline" size="sm" onClick={handleStartEditOverview} className="gap-2">
                                        <Pencil className="h-4 w-4" />
                                        Edit
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500">Course Code</p>
                                        <p className="text-lg font-semibold">{course.code}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500">Credits</p>
                                        <p className="text-lg font-semibold">{course.credits}</p>
                                    </div>
                                </div>

                                {/* Editable Overview Description */}
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-500">Description</p>
                                    {isEditingOverview ? (
                                        <div className="space-y-3">
                                            <Textarea
                                                value={overviewDraft}
                                                onChange={(e) => setOverviewDraft(e.target.value)}
                                                placeholder="Enter course description, objectives, and key information..."
                                                className="min-h-[120px]"
                                            />
                                            <div className="flex gap-2">
                                                <Button onClick={handleSaveOverview} size="sm" className="gap-2">
                                                    <Save className="h-4 w-4" />
                                                    Save
                                                </Button>
                                                <Button variant="outline" size="sm" onClick={() => setIsEditingOverview(false)} className="gap-2">
                                                    <X className="h-4 w-4" />
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                                            {overview || 'No description available yet.'}
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Syllabus / Chapters Card */}
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle>Syllabus</CardTitle>
                                {userIsAdmin && (
                                    <Button variant="outline" size="sm" onClick={() => setIsAddingChapter(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Add Chapter
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {chapters.length > 0 ? (
                                    chapters.map((ch) => (
                                        <div key={ch.id} className="rounded-lg border p-3 group relative">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="font-medium text-slate-900 dark:text-white">{ch.title}</p>
                                                    <p className="text-sm text-slate-500">{ch.topics.length} topics</p>
                                                    {ch.topics.length > 0 && (
                                                        <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside">
                                                            {ch.topics.slice(0, 3).map((topic, idx) => (
                                                                <li key={idx}>{topic}</li>
                                                            ))}
                                                            {ch.topics.length > 3 && (
                                                                <li className="text-slate-400">...and {ch.topics.length - 3} more</li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                                {userIsAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => handleDeleteChapter(ch.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No syllabus defined yet.
                                        {userIsAdmin && ' Click "Add Chapter" to create one.'}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Chapter Dialog */}
                    <Dialog open={isAddingChapter} onOpenChange={setIsAddingChapter}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add New Chapter</DialogTitle>
                                <DialogDescription>
                                    Add a chapter to the course syllabus
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label>Chapter Title</Label>
                                    <Input
                                        value={newChapterTitle}
                                        onChange={(e) => setNewChapterTitle(e.target.value)}
                                        placeholder="e.g., Introduction to Electrical Machines"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Topics (one per line)</Label>
                                    <Textarea
                                        value={newChapterTopics}
                                        onChange={(e) => setNewChapterTopics(e.target.value)}
                                        placeholder={"DC Motors\nAC Motors\nTransformers"}
                                        className="min-h-[100px]"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsAddingChapter(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleAddChapter} disabled={!newChapterTitle.trim()}>
                                    Add Chapter
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources">
                    <div className="grid gap-6 lg:grid-cols-3">
                        {/* Chapter Index */}
                        <Card className="lg:col-span-1">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Chapters</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {chapters.length > 0 ? (
                                    chapters.map((chapter) => {
                                        const completedTopics = chapter.topics.filter((t) =>
                                            checkedTopics.has(`${chapter.id}-${t}`)
                                        ).length;
                                        const progress = (completedTopics / chapter.topics.length) * 100;

                                        return (
                                            <button
                                                key={chapter.id}
                                                onClick={() => setSelectedChapter(chapter)}
                                                className={cn(
                                                    "flex w-full items-center justify-between rounded-lg border p-3 text-left transition-all hover:border-indigo-300 hover:bg-indigo-50 dark:hover:border-indigo-700 dark:hover:bg-indigo-950",
                                                    selectedChapter?.id === chapter.id && "border-indigo-500 bg-indigo-50 dark:bg-indigo-950"
                                                )}
                                            >
                                                <div className="flex-1">
                                                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                                                        {chapter.title}
                                                    </p>
                                                    <p className="text-xs text-slate-500">
                                                        {completedTopics}/{chapter.topics.length} topics
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-16 rounded-full bg-slate-200 dark:bg-slate-700">
                                                        <div
                                                            className="h-2 rounded-full bg-indigo-500 transition-all"
                                                            style={{ width: `${progress}%` }}
                                                        />
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-slate-400" />
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">
                                        No chapters available for this course yet.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Resources Tabs */}
                        <Card className="lg:col-span-2">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Resources</CardTitle>
                                {userIsAdmin && (
                                    <Button variant="outline" size="sm" onClick={() => setIsUploadingResource(true)} className="gap-2">
                                        <Upload className="h-4 w-4" />
                                        Upload
                                    </Button>
                                )}
                            </CardHeader>
                            <CardContent>
                                <Tabs defaultValue="videos" className="w-full">
                                    <TabsList className="grid w-full grid-cols-5 mb-4">
                                        <TabsTrigger value="videos" className="text-xs gap-1">
                                            <Video className="h-3 w-3" />
                                            Videos
                                        </TabsTrigger>
                                        <TabsTrigger value="notes" className="text-xs gap-1">
                                            <FileText className="h-3 w-3" />
                                            Notes
                                        </TabsTrigger>
                                        <TabsTrigger value="archives" className="text-xs gap-1">
                                            <Archive className="h-3 w-3" />
                                            Archives
                                        </TabsTrigger>
                                        <TabsTrigger value="docs" className="text-xs gap-1">
                                            <BookOpen className="h-3 w-3" />
                                            Docs
                                        </TabsTrigger>
                                        <TabsTrigger value="pyp" className="text-xs gap-1">
                                            <ClipboardList className="h-3 w-3" />
                                            PYP
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* Video Lectures */}
                                    <TabsContent value="videos">
                                        <ScrollArea className="h-64">
                                            <div className="space-y-2">
                                                {/* Admin-uploaded videos */}
                                                {storeResources('video').map((video) => (
                                                    <div key={video.id} className="flex items-center justify-between rounded-lg border p-3 bg-indigo-50/50 dark:bg-indigo-950/30 group">
                                                        <div className="flex items-center gap-3">
                                                            <Video className="h-4 w-4 text-red-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{video.title}</p>
                                                                <p className="text-xs text-indigo-600">Added by admin</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <a href={video.url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" className="gap-1">
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </a>
                                                            {userIsAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 opacity-0 group-hover:opacity-100"
                                                                    onClick={() => handleDeleteResource(video.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Videos */}
                                                {storeResources('video').map((video) => (
                                                    <div key={video.id} className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-slate-900 group">
                                                        <div className="flex items-center gap-3">
                                                            <Video className="h-4 w-4 text-red-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{video.title}</p>
                                                                <p className="text-xs text-indigo-600">Added by {video.added_by}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <a href={video.url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" className="gap-1">
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </a>
                                                            {userIsAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 opacity-0 group-hover:opacity-100"
                                                                    onClick={() => handleDeleteResource(video.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    {/* Live Notes */}
                                    <TabsContent value="notes">
                                        <div className="mb-3">
                                            <Badge variant="secondary" className="text-xs">
                                                <Clock className="h-3 w-3 mr-1" />
                                                Updated Regularly
                                            </Badge>
                                        </div>
                                        <ScrollArea className="h-56">
                                            <div className="space-y-2">
                                                {/* Notes */}
                                                {storeResources('notes').map((note) => (
                                                    <div key={note.id} className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-slate-900 group">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-4 w-4 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{note.title}</p>
                                                                <p className="text-xs text-indigo-600">Added by {note.added_by}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <a href={note.url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" className="gap-1">
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </a>
                                                            {userIsAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 opacity-0 group-hover:opacity-100"
                                                                    onClick={() => handleDeleteResource(note.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    {/* Senior Archives */}
                                    <TabsContent value="archives">
                                        <div className="mb-3">
                                            <Select value={archiveBatch} onValueChange={setArchiveBatch}>
                                                <SelectTrigger className="w-32">
                                                    <SelectValue placeholder="Batch" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Batches</SelectItem>
                                                    <SelectItem value="2024">Batch 2024</SelectItem>
                                                    <SelectItem value="2023">Batch 2023</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <ScrollArea className="h-52">
                                            <div className="space-y-2">
                                                {/* Unified Archives Loop */}
                                                {filteredArchives.map((archive) => (
                                                    <div key={archive.id} className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-slate-900 group">
                                                        <div className="flex items-center gap-3">
                                                            <Archive className="h-4 w-4 text-purple-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{archive.title}</p>
                                                                <p className="text-xs text-slate-500">Batch {archive.batch || 'N/A'} • {archive.added_by}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <a href={archive.url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" className="gap-1">
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </a>
                                                            {userIsAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 opacity-0 group-hover:opacity-100"
                                                                    onClick={() => handleDeleteResource(archive.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    {/* Official Documents */}
                                    <TabsContent value="docs">
                                        <ScrollArea className="h-64">
                                            <div className="space-y-2">
                                                {/* Documents */}
                                                {storeResources('document').map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3 bg-white dark:bg-slate-900 group">
                                                        <div className="flex items-center gap-3">
                                                            <BookOpen className="h-4 w-4 text-green-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.title}</p>
                                                                <p className="text-xs text-indigo-600">Added by {doc.added_by}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="sm" className="gap-1">
                                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </a>
                                                            {userIsAdmin && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-red-500 opacity-0 group-hover:opacity-100"
                                                                    onClick={() => handleDeleteResource(doc.id)}
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>

                                    {/* Previous Year Papers */}
                                    <TabsContent value="pyp">
                                        <div className="mb-3 flex gap-2">
                                            <Select value={pypFilters.year} onValueChange={(v) => setPypFilters({ ...pypFilters, year: v })}>
                                                <SelectTrigger className="w-28">
                                                    <SelectValue placeholder="Year" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Years</SelectItem>
                                                    <SelectItem value="2024">2024</SelectItem>
                                                    <SelectItem value="2023">2023</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <Select value={pypFilters.examType} onValueChange={(v) => setPypFilters({ ...pypFilters, examType: v })}>
                                                <SelectTrigger className="w-28">
                                                    <SelectValue placeholder="Exam" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All Exams</SelectItem>
                                                    <SelectItem value="MTE">MTE</SelectItem>
                                                    <SelectItem value="ETE">ETE</SelectItem>
                                                    <SelectItem value="Quiz">Quiz</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <ScrollArea className="h-52">
                                            <div className="space-y-2">
                                                {filteredPyp.map((paper) => (
                                                    <div key={paper.id} className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="flex items-center gap-3">
                                                            <ClipboardList className="h-4 w-4 text-orange-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{paper.title}</p>
                                                                <div className="flex gap-1 mt-1">
                                                                    <Badge variant="outline" className="text-xs">{paper.year}</Badge>
                                                                    <Badge variant="secondary" className="text-xs">{paper.exam_type}</Badge>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <Button variant="ghost" size="sm" className="gap-1">
                                                            <ExternalLink className="h-3.5 w-3.5" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Chapter Progress Dialog */}
                    <Dialog open={!!selectedChapter} onOpenChange={() => setSelectedChapter(null)}>
                        <DialogContent className="max-w-md">
                            <DialogHeader>
                                <DialogTitle>{selectedChapter?.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-3">
                                <p className="text-sm text-slate-500">Track your progress through these topics:</p>
                                {selectedChapter?.topics.map((topic) => {
                                    const key = `${selectedChapter.id}-${topic}`;
                                    const isChecked = checkedTopics.has(key);
                                    return (
                                        <label
                                            key={topic}
                                            className={cn(
                                                "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-all",
                                                isChecked ? "bg-green-50 border-green-300 dark:bg-green-950 dark:border-green-700" : "hover:bg-slate-50 dark:hover:bg-slate-800"
                                            )}
                                        >
                                            <Checkbox
                                                checked={isChecked}
                                                onCheckedChange={() => toggleTopic(selectedChapter.id, topic)}
                                            />
                                            <span className={cn(
                                                "text-sm",
                                                isChecked ? "text-green-700 dark:text-green-300" : "text-slate-700 dark:text-slate-300"
                                            )}>
                                                {topic}
                                            </span>
                                            {isChecked && <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto" />}
                                        </label>
                                    );
                                })}
                            </div>
                        </DialogContent>
                    </Dialog>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community">
                    <Card className="border-purple-100 dark:border-purple-900/30">
                        <CardHeader className="flex flex-row items-center justify-between pb-4">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600">
                                        <MessageCircle className="h-4 w-4 text-white" />
                                    </div>
                                    {course.code} Community
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {courseThreads.length} active threads • Auto-expires after 7 days
                                </CardDescription>
                            </div>
                            <Button
                                className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                                onClick={() => setNewThreadOpen(true)}
                            >
                                <Plus className="h-4 w-4" />
                                New Thread
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Thread list */}
                            {courseThreads.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950">
                                        <MessageCircle className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
                                        No discussions yet
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 max-w-sm">
                                        Be the first to start a discussion! Ask a doubt, share resources, or start a conversation about {course.code}.
                                    </p>
                                    <Button
                                        className="mt-4 gap-2"
                                        onClick={() => setNewThreadOpen(true)}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Start First Discussion
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {courseThreads.map((thread) => {
                                        const expiry = getExpiryStatus(thread.expiresAt);
                                        const isUpvoted = hasUpvoted(thread.id, 'thread', userId);
                                        const tagColor = TAG_COLORS[thread.tags[0] as ThreadTag] || TAG_COLORS['Discussion'];

                                        return (
                                            <div
                                                key={thread.id}
                                                className={cn(
                                                    "group rounded-xl border p-4 transition-all duration-200 cursor-pointer",
                                                    "hover:border-purple-300 hover:shadow-md hover:shadow-purple-100/50",
                                                    "dark:hover:border-purple-700 dark:hover:shadow-purple-900/20",
                                                    thread.isPinned && "border-amber-200 bg-amber-50/30 dark:border-amber-800 dark:bg-amber-950/20"
                                                )}
                                            >
                                                <div className="flex items-start gap-3">
                                                    {/* Upvote button */}
                                                    <div className="flex flex-col items-center gap-1">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className={cn(
                                                                "h-9 w-9 p-0 transition-all",
                                                                isUpvoted
                                                                    ? "bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-400"
                                                                    : "hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-950"
                                                            )}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpvote(thread.id);
                                                            }}
                                                        >
                                                            <ThumbsUp className={cn("h-4 w-4", isUpvoted && "fill-current")} />
                                                        </Button>
                                                        <span className={cn(
                                                            "text-sm font-medium",
                                                            isUpvoted ? "text-purple-600 dark:text-purple-400" : "text-slate-600 dark:text-slate-400"
                                                        )}>
                                                            {thread.upvotesCount}
                                                        </span>
                                                    </div>

                                                    {/* Thread content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            {thread.isPinned && (
                                                                <Badge className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 border-0">
                                                                    <Pin className="h-3 w-3" />
                                                                    Pinned
                                                                </Badge>
                                                            )}
                                                            <Badge className={cn("border", tagColor.bg, tagColor.text, tagColor.border)}>
                                                                {thread.tags[0]}
                                                            </Badge>
                                                            <span className={cn("flex items-center gap-1 text-xs", expiry.color)}>
                                                                <Timer className="h-3 w-3" />
                                                                {expiry.text}
                                                            </span>
                                                        </div>

                                                        <h4 className="mt-2 font-semibold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                                            {thread.title}
                                                        </h4>

                                                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                                                            {thread.body}
                                                        </p>

                                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                            <span>
                                                                by {thread.isAnonymous ? 'Anonymous' : (thread.createdBy || 'Unknown')}
                                                            </span>
                                                            <span>{formatRelativeTime(thread.createdAt)}</span>
                                                            <span className="flex items-center gap-1">
                                                                <MessageCircle className="h-3 w-3" />
                                                                {thread.replyCount} {thread.replyCount === 1 ? 'reply' : 'replies'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Admin actions */}
                                                    {userIsAdmin && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    thread.isPinned ? unpinThread(thread.id) : pinThread(thread.id);
                                                                }}
                                                            >
                                                                <Pin className={cn("h-4 w-4", thread.isPinned && "fill-current")} />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    deleteThread(thread.id);
                                                                }}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="text-center py-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                                <p className="text-xs text-slate-400">
                                    💡 All threads auto-expire 7 days after last activity to keep discussions fresh
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* New Thread Dialog */}
                    <Dialog open={newThreadOpen} onOpenChange={setNewThreadOpen}>
                        <DialogContent className="sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <MessageCircle className="h-5 w-5 text-purple-600" />
                                    New Discussion in {course.code}
                                </DialogTitle>
                                <DialogDescription>
                                    Start a new discussion. Your post will be visible to all students enrolled in this course.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="thread-tag">Category</Label>
                                    <Select value={newThreadTag} onValueChange={(v) => setNewThreadTag(v as ThreadTag)}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Doubt">🤔 Doubt</SelectItem>
                                            <SelectItem value="Resource">📚 Resource</SelectItem>
                                            <SelectItem value="Discussion">💬 Discussion</SelectItem>
                                            {userIsAdmin && <SelectItem value="Announcement">📢 Announcement</SelectItem>}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="thread-title">Title</Label>
                                    <Input
                                        id="thread-title"
                                        placeholder="What's your question or topic?"
                                        value={newThreadTitle}
                                        onChange={(e) => setNewThreadTitle(e.target.value)}
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-slate-400 text-right">{newThreadTitle.length}/100</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="thread-body">Description</Label>
                                    <Textarea
                                        id="thread-body"
                                        placeholder="Add more details, context, or your thoughts..."
                                        value={newThreadBody}
                                        onChange={(e) => setNewThreadBody(e.target.value)}
                                        rows={4}
                                        maxLength={2000}
                                    />
                                    <p className="text-xs text-slate-400 text-right">{newThreadBody.length}/2000</p>
                                </div>

                                <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-3 text-xs text-slate-500">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="h-4 w-4 mt-0.5 text-slate-400" />
                                        <div>
                                            <p>Your post will expire automatically after 7 days of inactivity.</p>
                                            <p className="mt-1">Be respectful and helpful to your classmates.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button variant="outline" onClick={() => setNewThreadOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCreateThread}
                                    disabled={!newThreadTitle.trim() || !newThreadBody.trim() || isCreatingThread}
                                    className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600"
                                >
                                    {isCreatingThread ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Posting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4" />
                                            Post Discussion
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </TabsContent>
            </Tabs>

            {/* Upload Resource Dialog (Admin Only) */}
            <Dialog open={isUploadingResource} onOpenChange={setIsUploadingResource}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Upload Resource</DialogTitle>
                        <DialogDescription>
                            Add a new resource to {course.title}. This will be visible to all students.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Category</Label>
                            <Select
                                value={newResourceCategory}
                                onValueChange={(v) => setNewResourceCategory(v as CourseResource['category'])}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="video">Video Lecture</SelectItem>
                                    <SelectItem value="notes">Notes</SelectItem>
                                    <SelectItem value="document">Document</SelectItem>
                                    <SelectItem value="archive">Archive</SelectItem>
                                    <SelectItem value="pyp">Previous Year Paper</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={newResourceTitle}
                                onChange={(e) => setNewResourceTitle(e.target.value)}
                                placeholder="e.g., Lecture 5 - Transformers"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>URL</Label>
                            <Input
                                value={newResourceUrl}
                                onChange={(e) => setNewResourceUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>

                        {/* PYP-specific fields */}
                        {newResourceCategory === 'pyp' && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Input
                                        value={newResourceYear}
                                        onChange={(e) => setNewResourceYear(e.target.value)}
                                        placeholder="2024"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Exam Type</Label>
                                    <Select
                                        value={newResourceExamType}
                                        onValueChange={(v) => setNewResourceExamType(v as 'MTE' | 'ETE' | 'Quiz')}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="MTE">MTE</SelectItem>
                                            <SelectItem value="ETE">ETE</SelectItem>
                                            <SelectItem value="Quiz">Quiz</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsUploadingResource(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUploadResource}
                            disabled={!newResourceTitle.trim() || !newResourceUrl.trim()}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            Upload Resource
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Request Resource Modal */}
            <RequestResourceModal
                isOpen={requestModalOpen}
                onClose={() => setRequestModalOpen(false)}
                courseCode={course.code}
                courseName={course.title}
            />
        </div>
    );
}

