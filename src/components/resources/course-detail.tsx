"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Course, Chapter } from "@/lib/curriculumData";

// Mock resources data
const MOCK_RESOURCES = {
    videos: [
        { id: "v1", title: "NPTEL - Introduction to Electrical Machines", url: "https://nptel.ac.in", duration: "45 min" },
        { id: "v2", title: "Transformer Working Principle", url: "https://youtube.com", duration: "32 min" },
        { id: "v3", title: "DC Motor Construction & Working", url: "https://youtube.com", duration: "28 min" },
    ],
    notes: [
        { id: "n1", title: "Lecture 1-5 Handwritten Notes", updated: "2 days ago", author: "TA" },
        { id: "n2", title: "Unit 2 Summary Notes", updated: "1 week ago", author: "TA" },
        { id: "n3", title: "Formula Sheet (Complete)", updated: "3 days ago", author: "TA" },
    ],
    archives: [
        { id: "a1", title: "Complete Notes Package", batch: "2024", uploadedBy: "Rahul S." },
        { id: "a2", title: "Assignment Solutions", batch: "2024", uploadedBy: "Priya M." },
        { id: "a3", title: "Lab Reports Collection", batch: "2023", uploadedBy: "Amit K." },
    ],
    documents: [
        { id: "d1", title: "Unit 1 PPT - Prof. Sharma", type: "ppt" },
        { id: "d2", title: "Reference Book: Electric Machinery (Chapman)", type: "book" },
        { id: "d3", title: "Syllabus & Course Outline", type: "pdf" },
    ],
    pyp: [
        { id: "p1", title: "MTE 2024", year: "2024", examType: "MTE" },
        { id: "p2", title: "ETE 2024", year: "2024", examType: "ETE" },
        { id: "p3", title: "Quiz 1 2024", year: "2024", examType: "Quiz" },
        { id: "p4", title: "MTE 2023", year: "2023", examType: "MTE" },
        { id: "p5", title: "ETE 2023", year: "2023", examType: "ETE" },
    ],
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

    const chapters = course.chapters || [];

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

    const filteredPyp = MOCK_RESOURCES.pyp.filter((p) => {
        if (pypFilters.year !== "all" && p.year !== pypFilters.year) return false;
        if (pypFilters.examType !== "all" && p.examType !== pypFilters.examType) return false;
        return true;
    });

    const filteredArchives = MOCK_RESOURCES.archives.filter((a) => {
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
                <div>
                    <Badge className="mb-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                        {course.code}
                    </Badge>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {course.title}
                    </h2>
                    <p className="text-sm text-slate-500">{course.credits} Credits</p>
                </div>
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Course Overview</CardTitle>
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
                            {chapters.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium text-slate-500">Chapters</p>
                                    <div className="space-y-2">
                                        {chapters.map((ch) => (
                                            <div key={ch.id} className="rounded-lg border p-3">
                                                <p className="font-medium">{ch.title}</p>
                                                <p className="text-sm text-slate-500">{ch.topics.length} topics</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
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
                            <CardHeader className="pb-3">
                                <CardTitle className="text-lg">Resources</CardTitle>
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
                                                {MOCK_RESOURCES.videos.map((video) => (
                                                    <div key={video.id} className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Video className="h-4 w-4 text-red-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{video.title}</p>
                                                                <p className="text-xs text-slate-500">{video.duration}</p>
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
                                                {MOCK_RESOURCES.notes.map((note) => (
                                                    <div key={note.id} className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="h-4 w-4 text-blue-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{note.title}</p>
                                                                <p className="text-xs text-slate-500">Updated {note.updated} by {note.author}</p>
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
                                                {filteredArchives.map((archive) => (
                                                    <div key={archive.id} className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="flex items-center gap-3">
                                                            <Archive className="h-4 w-4 text-purple-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{archive.title}</p>
                                                                <p className="text-xs text-slate-500">Batch {archive.batch} • {archive.uploadedBy}</p>
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

                                    {/* Official Documents */}
                                    <TabsContent value="docs">
                                        <ScrollArea className="h-64">
                                            <div className="space-y-2">
                                                {MOCK_RESOURCES.documents.map((doc) => (
                                                    <div key={doc.id} className="flex items-center justify-between rounded-lg border p-3">
                                                        <div className="flex items-center gap-3">
                                                            <BookOpen className="h-4 w-4 text-green-500" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-900 dark:text-white">{doc.title}</p>
                                                                <Badge variant="outline" className="text-xs mt-1">{doc.type.toUpperCase()}</Badge>
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
                                                                    <Badge variant="secondary" className="text-xs">{paper.examType}</Badge>
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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <MessageCircle className="h-5 w-5 text-purple-600" />
                                {course.code} Community
                            </CardTitle>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                New Thread
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Mock community threads */}
                            <div className="space-y-3">
                                <div className="rounded-lg border p-4 hover:border-purple-300 transition-colors cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ThumbsUp className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium">12</span>
                                        </div>
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-2">Doubt</Badge>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                How to solve transformer efficiency problems?
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                                I'm struggling with calculating efficiency at different load conditions. Can someone explain the iron loss vs copper loss approach?
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                <span>by rahul_sharma</span>
                                                <span>3 hours ago</span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    5 replies
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4 hover:border-purple-300 transition-colors cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ThumbsUp className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium">8</span>
                                        </div>
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-2">Resource</Badge>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                Unit 2 complete notes - DC Machines
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                                Compiled notes covering all DC motor and generator topics with solved numericals from previous year papers.
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                <span>by priya_m</span>
                                                <span>1 day ago</span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    3 replies
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-lg border p-4 hover:border-purple-300 transition-colors cursor-pointer">
                                    <div className="flex items-start gap-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                <ThumbsUp className="h-4 w-4" />
                                            </Button>
                                            <span className="text-sm font-medium">15</span>
                                        </div>
                                        <div className="flex-1">
                                            <Badge variant="outline" className="mb-2">Discussion</Badge>
                                            <h4 className="font-semibold text-slate-900 dark:text-white">
                                                MTE preparation strategy
                                            </h4>
                                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                                                What chapters should we focus on for MTE? Prof mentioned transformers and DC machines will have more weightage.
                                            </p>
                                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                                <span>by amit_k</span>
                                                <span>2 days ago</span>
                                                <span className="flex items-center gap-1">
                                                    <MessageCircle className="h-3 w-3" />
                                                    12 replies
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="text-center py-4">
                                <p className="text-sm text-slate-500">
                                    Connect with classmates, ask doubts, and share resources for {course.code}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

