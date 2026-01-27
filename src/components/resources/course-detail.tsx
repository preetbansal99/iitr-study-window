"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    ChevronLeft,
    FileText,
    BookOpen,
    MessageCircle,
    FileQuestion,
    Pencil,
    Save,
    X,
} from "lucide-react";
import type { Course } from "@/lib/courses/types";
import { useCommunityStore } from "@/stores/community-store";
import { useUserStore } from "@/stores/user-store";
import { useCourseStore } from "@/stores/course-store";
import { isAdmin } from "@/lib/permissions";
import { ResourceList } from "@/components/resources/resource-list";
import { AdminResourceUpload } from "@/components/resources/admin-resource-upload";
import { RequestResourceModal } from "./request-modal";
import { Textarea } from "@/components/ui/textarea";

interface CourseDetailProps {
    course: Course;
    onBack: () => void;
}

export function CourseDetail({ course, onBack }: CourseDetailProps) {
    // Community tab state
    const [requestModalOpen, setRequestModalOpen] = useState(false);

    // Store hooks
    const { profile } = useUserStore();
    const {
        initialize,
        fetchThreads,
    } = useCommunityStore();

    const {
        resources,
        fetchResources,
    } = useCourseStore();

    const userEmail = profile?.email || null;
    const userIsAdmin = isAdmin(userEmail);

    // Generate course channel ID (e.g. EEC-101 -> course-eec-101)
    const courseChannelId = `course-${course.course_code?.toLowerCase().replace(/\s+/g, '-')}`;

    // Initialize stores
    useEffect(() => {
        initialize(); // Community store channels
        fetchThreads(courseChannelId); // Course threads
        if (course.course_code) {
            fetchResources(course.course_code); // Course resources from Supabase by CODE
        }
    }, [initialize, fetchThreads, fetchResources, course.course_code, courseChannelId]);

    // Get resources for this course
    const courseCode = course.course_code || "";
    const courseResources = resources[courseCode] || [];

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
                        {course.course_code}
                    </Badge>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {course.course_name}
                    </h2>
                    <p className="text-sm text-slate-500">
                        {course.credits_min === course.credits_max
                            ? `${course.credits_min} Credits`
                            : `${course.credits_min}-${course.credits_max} Credits`
                        }
                    </p>
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
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500">Course Code</p>
                                        <p className="text-lg font-semibold">{course.course_code}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500">Type</p>
                                        <p className="text-lg font-semibold capitalize">{course.course_type}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500">Semester</p>
                                        <p className="text-lg font-semibold">{course.semester}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500">Credits</p>
                                        <p className="text-lg font-semibold">
                                            {course.credits_min === course.credits_max
                                                ? course.credits_min
                                                : `${course.credits_min} - ${course.credits_max}`
                                            }
                                        </p>
                                    </div>
                                </div>

                                {/* Academic Structure Section */}
                                <div className="rounded-lg border bg-white p-4 dark:bg-slate-900">
                                    <h3 className="mb-4 text-base font-semibold">Academic Structure & Evaluation</h3>

                                    {/* L-T-P Breakdown */}
                                    <div className="mb-6 grid grid-cols-3 gap-4 text-center">
                                        <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/30">
                                            <p className="text-xs text-slate-500 uppercase">Lecture</p>
                                            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                                                {course.lecture_hours || 0}h
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/30">
                                            <p className="text-xs text-slate-500 uppercase">Tutorial</p>
                                            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                                                {course.tutorial_hours || 0}h
                                            </p>
                                        </div>
                                        <div className="rounded-lg bg-indigo-50 p-2 dark:bg-indigo-950/30">
                                            <p className="text-xs text-slate-500 uppercase">Practical</p>
                                            <p className="text-xl font-bold text-indigo-700 dark:text-indigo-300">
                                                {course.practical_hours || 0}h
                                            </p>
                                        </div>
                                    </div>

                                    {/* Evaluation Weightage Table */}
                                    <div className="overflow-hidden rounded-md border">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50 dark:bg-slate-800">
                                                <tr>
                                                    <th className="px-3 py-2 text-left font-medium text-slate-500">Component</th>
                                                    <th className="px-3 py-2 text-right font-medium text-slate-500">Weightage</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {course.cws_weightage && (
                                                    <tr>
                                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">Class Work (CWS)</td>
                                                        <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-white">{course.cws_weightage}</td>
                                                    </tr>
                                                )}
                                                {course.mte_weightage && (
                                                    <tr>
                                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">Mid Term Exam (MTE)</td>
                                                        <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-white">{course.mte_weightage}</td>
                                                    </tr>
                                                )}
                                                {course.ete_weightage && (
                                                    <tr>
                                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">End Term Exam (ETE)</td>
                                                        <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-white">{course.ete_weightage}</td>
                                                    </tr>
                                                )}
                                                {course.practical_weightage && (
                                                    <tr>
                                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">Practical (PRS)</td>
                                                        <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-white">{course.practical_weightage}</td>
                                                    </tr>
                                                )}
                                                {course.pre_weightage && (
                                                    <tr>
                                                        <td className="px-3 py-2 text-slate-700 dark:text-slate-300">Project Eval (PRE)</td>
                                                        <td className="px-3 py-2 text-right font-mono text-slate-900 dark:text-white">{course.pre_weightage}</td>
                                                    </tr>
                                                )}
                                                {/* Fallback if no weightage data */}
                                                {!course.cws_weightage && !course.mte_weightage && !course.ete_weightage && !course.practical_weightage && !course.pre_weightage && (
                                                    <tr>
                                                        <td colSpan={2} className="px-3 py-4 text-center text-slate-400 italic">
                                                            Evaluation schema not available
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="rounded-md bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-400">
                                    Full syllabus details are available in the official curriculum document.
                                    {/* TODO: Add link later if available */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* Resources Tab */}
                <TabsContent value="resources">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Study Materials</h3>
                            <div className="flex gap-2">
                                {/* Only show upload if admin - Permission check handled inside component too, but good to check here */}
                                {userIsAdmin && (
                                    <AdminResourceUpload courseId={course.id} courseCode={courseCode} />
                                )}
                            </div>
                        </div>

                        <ResourceList resources={courseResources} />
                    </div>
                </TabsContent>

                {/* Community Tab */}
                <TabsContent value="community">
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="h-12 w-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-semibold">Course Discussion</h3>
                        <p className="text-slate-500 max-w-sm mb-6">
                            Join the discussion, ask questions, and share insights about {course.course_name}.
                        </p>
                        <Button onClick={() => window.location.href = `/community/${courseChannelId}`}>
                            Go to Discussion Channel
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>

            <RequestResourceModal
                open={requestModalOpen}
                onOpenChange={setRequestModalOpen}
                courseId={course.course_code || course.id}
                courseName={course.course_name}
            />
        </div>
    );
}
