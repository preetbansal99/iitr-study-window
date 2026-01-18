"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Users,
    Instagram,
    Globe,
    Calendar,
    ClipboardList,
    Zap,
    Music,
    Trophy,
    Building2,
    ExternalLink,
    ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
    ALL_CLUBS,
    CLUB_CATEGORIES,
    getClubsByCategory,
    type Club,
} from "@/lib/clubsData";

// Category icons
const categoryIcons = {
    Technical: Zap,
    Cultural: Music,
    Sports: Trophy,
    Others: Building2,
};

// Category colors
const categoryColors = {
    Technical: "from-indigo-500 to-violet-600",
    Cultural: "from-pink-500 to-rose-600",
    Sports: "from-emerald-500 to-teal-600",
    Others: "from-orange-500 to-amber-600",
};

interface ClubsGridProps {
    onBack: () => void;
}

export function ClubsGrid({ onBack }: ClubsGridProps) {
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);

    return (
        <div className="p-4 lg:p-8">
            {/* Header */}
            <div className="mb-8">
                <Button variant="ghost" onClick={onBack} className="mb-4 gap-2">
                    <ChevronLeft className="h-4 w-4" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">
                    Campus Clubs
                </h1>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                    {ALL_CLUBS.length} active student organizations
                </p>
            </div>

            {/* Categorized Sections */}
            {CLUB_CATEGORIES.map((category) => {
                const clubs = getClubsByCategory(category.id as Club["category"]);
                const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
                const gradient = categoryColors[category.id as keyof typeof categoryColors];

                return (
                    <section key={category.id} className="mb-10">
                        <div className="mb-4 flex items-center gap-3">
                            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br", gradient)}>
                                <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                    {category.label}
                                </h2>
                                <p className="text-sm text-slate-500">{category.count} clubs</p>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            {clubs.map((club) => (
                                <Card
                                    key={club.id}
                                    className="group cursor-pointer border-2 border-transparent transition-all hover:scale-[1.02] hover:border-indigo-300 hover:shadow-lg"
                                    onClick={() => setSelectedClub(club)}
                                >
                                    <CardContent className="p-4">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                                            <Users className="h-6 w-6 text-slate-600 dark:text-slate-300" />
                                        </div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                                            {club.name}
                                        </h3>
                                        <a
                                            href={`https://instagram.com/${club.handle.replace("@", "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Instagram className="h-3.5 w-3.5" />
                                            {club.handle}
                                            <ExternalLink className="h-3 w-3" />
                                        </a>
                                        <div className="mt-2">
                                            <Badge
                                                className={cn(
                                                    "text-xs",
                                                    club.recruitmentStatus === "Open"
                                                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                                )}
                                            >
                                                {club.recruitmentStatus === "Open" ? "🟢 Open" : "🔴 Closed"}
                                            </Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </section>
                );
            })}

            {/* Club Detail Modal */}
            <Dialog open={!!selectedClub} onOpenChange={() => setSelectedClub(null)}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <div className="flex items-start gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900 dark:to-violet-900">
                                <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <DialogTitle className="text-xl">{selectedClub?.name}</DialogTitle>
                                <div className="mt-1 flex items-center gap-2">
                                    <a
                                        href={`https://instagram.com/${selectedClub?.handle.replace("@", "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-sm text-indigo-600 hover:underline"
                                    >
                                        <Instagram className="h-4 w-4" />
                                        {selectedClub?.handle}
                                    </a>
                                    {selectedClub?.website && (
                                        <a
                                            href={selectedClub.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-sm text-slate-600 hover:underline"
                                        >
                                            <Globe className="h-4 w-4" />
                                            Website
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Recruitment Status */}
                        <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Recruitment Status
                                </span>
                                <Badge
                                    className={cn(
                                        selectedClub?.recruitmentStatus === "Open"
                                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                            : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                                    )}
                                >
                                    {selectedClub?.recruitmentStatus === "Open" ? "🟢 Open" : "🔴 Closed"}
                                </Badge>
                            </div>
                        </div>

                        {/* About Section */}
                        <div>
                            <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">About Us</h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                {selectedClub?.description || "No description available."}
                            </p>
                        </div>

                        {/* Live Updates */}
                        <div>
                            <h4 className="mb-2 font-semibold text-slate-900 dark:text-white">Live Updates</h4>

                            {/* Ongoing Events */}
                            {selectedClub?.events && selectedClub.events.length > 0 && (
                                <div className="mb-3 rounded-lg bg-blue-50 p-3 dark:bg-blue-950">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                                        <Calendar className="h-4 w-4" />
                                        Ongoing Events
                                    </div>
                                    <div className="space-y-1">
                                        {selectedClub.events.map((event, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-700 dark:text-slate-300">{event.title}</span>
                                                <Badge variant="secondary" className="text-xs">{event.date}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recruitment Tasks */}
                            {selectedClub?.tasks && selectedClub.tasks.length > 0 && (
                                <div className="rounded-lg bg-orange-50 p-3 dark:bg-orange-950">
                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-orange-700 dark:text-orange-300">
                                        <ClipboardList className="h-4 w-4" />
                                        Recruitment Tasks
                                    </div>
                                    <div className="space-y-1">
                                        {selectedClub.tasks.map((task, i) => (
                                            <div key={i} className="flex items-center justify-between text-sm">
                                                <span className="text-slate-700 dark:text-slate-300">{task.title}</span>
                                                <Badge variant="outline" className="text-xs">{task.deadline}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!selectedClub?.events?.length && !selectedClub?.tasks?.length && (
                                <p className="text-sm text-slate-500">No current updates available.</p>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
