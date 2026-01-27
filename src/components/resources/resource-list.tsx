"use client";

import { CourseResource } from "@/lib/courses/types";
import { FileText, Youtube, Code, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ResourceListProps {
    resources: CourseResource[];
}

export function ResourceList({ resources }: ResourceListProps) {
    if (!resources || resources.length === 0) {
        return (
            <div className="py-8 text-center text-slate-500">
                No resources uploaded yet.
            </div>
        );
    }

    const notes = resources.filter(r => r.resource_type === 'notes');
    const videos = resources.filter(r => r.resource_type === 'youtube');
    const code = resources.filter(r => r.resource_type === 'code');

    return (
        <div className="space-y-6">
            {/* NOTES SECTION */}
            {notes.length > 0 && (
                <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-indigo-500">
                        <FileText className="h-4 w-4" /> Notes & Documents
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {notes.map(resource => (
                            <Card key={resource.id} className="overflow-hidden transition-all hover:border-indigo-300 hover:shadow-sm">
                                <CardContent className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <h4 className="truncate font-medium text-slate-900 dark:text-white" title={resource.title}>
                                                {resource.title}
                                            </h4>
                                            {resource.description && (
                                                <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                                                    {resource.description}
                                                </p>
                                            )}
                                            <p className="mt-2 text-[10px] text-slate-400">
                                                Uploaded {formatDistanceToNow(new Date(resource.created_at))} ago
                                            </p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600" asChild>
                                            <a href={resource.file_url || '#'} target="_blank" rel="noopener noreferrer">
                                                <Download className="h-4 w-4" />
                                            </a>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* YOUTUBE SECTION */}
            {videos.length > 0 && (
                <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-red-500">
                        <Youtube className="h-4 w-4" /> Video Lectures
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {videos.map(resource => (
                            <Card key={resource.id} className="overflow-hidden transition-all hover:border-red-300 hover:shadow-sm">
                                <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 relative group">
                                    {/* Simple thumbnail logic if standard youtube url */}
                                    {getYouTubeThumbnail(resource.youtube_url) ? (
                                        <img
                                            src={getYouTubeThumbnail(resource.youtube_url)!}
                                            className="h-full w-full object-cover"
                                            alt={resource.title}
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center">
                                            <Youtube className="h-10 w-10 text-slate-300" />
                                        </div>
                                    )}
                                    <a
                                        href={resource.youtube_url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <div className="bg-red-600 text-white rounded-full p-2 shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                            <Youtube className="h-6 w-6 fill-current" />
                                        </div>
                                    </a>
                                </div>
                                <CardContent className="p-3">
                                    <h4 className="truncate font-medium text-slate-900 dark:text-white" title={resource.title}>
                                        {resource.title}
                                    </h4>
                                    {resource.description && (
                                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                                            {resource.description}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* CODE SECTION */}
            {code.length > 0 && (
                <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold uppercase text-emerald-500">
                        <Code className="h-4 w-4" /> Code Examples
                    </h3>
                    <div className="grid gap-3">
                        {code.map(resource => (
                            <Card key={resource.id} className="overflow-hidden border-l-4 border-l-emerald-500 transition-all hover:shadow-sm">
                                <CardHeader className="py-3 bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-medium">{resource.title}</CardTitle>
                                        <Badge variant="outline" className="text-[10px] font-mono">Python</Badge>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="bg-slate-950 p-4 overflow-x-auto">
                                        <pre className="text-xs font-mono text-emerald-400">
                                            <code>{resource.code_content || '# No content'}</code>
                                        </pre>
                                    </div>
                                    {resource.description && (
                                        <div className="p-3 bg-white dark:bg-slate-950 border-t text-xs text-slate-500">
                                            {resource.description}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function getYouTubeThumbnail(url: string | null) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11)
        ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
        : null;
}
