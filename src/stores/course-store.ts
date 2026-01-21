"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";

// ============================================
// TYPES
// ============================================

export interface CourseResource {
    id: string;
    course_code: string;
    title: string;
    url: string;
    category: 'video' | 'notes' | 'archive' | 'document' | 'pyp';
    description?: string;
    added_by: string; // email
    created_at: string;
    // JSONB or specific columns for metadata
    year?: string;
    exam_type?: 'MTE' | 'ETE' | 'Quiz';
    batch?: string;
}

export interface CourseChapter {
    id: string;
    course_code: string;
    title: string;
    topics: string[]; // Stored as array in Supabase (text[])
}

export interface CourseData {
    code: string;
    overview: string;
    chapters: CourseChapter[];
    resources: CourseResource[];
}

interface CourseStoreState {
    // Current active course data
    currentCourse: CourseData | null;
    isLoading: boolean;
    error: string | null;

    // Actions
    fetchCourseData: (courseCode: string) => Promise<void>;

    // Overview
    updateOverview: (courseCode: string, overview: string) => Promise<void>;

    // Chapters
    addChapter: (courseCode: string, title: string, topics: string[]) => Promise<void>;
    deleteChapter: (chapterId: string) => Promise<void>;

    // Resources
    addResource: (courseCode: string, resource: Omit<CourseResource, 'id' | 'course_code' | 'created_at' | 'added_by'>) => Promise<void>;
    deleteResource: (resourceId: string) => Promise<void>;
}

export const useCourseStore = create<CourseStoreState>((set, get) => ({
    currentCourse: null,
    isLoading: false,
    error: null,

    fetchCourseData: async (courseCode: string) => {
        set({ isLoading: true, error: null });
        const supabase = createClient();

        try {
            // 1. Fetch Course Info (Overview)
            // Assuming 'courses' table exists: code (PK), overview
            const { data: course, error: courseError } = await supabase
                .from('courses')
                .select('overview')
                .eq('code', courseCode)
                .single();

            if (courseError && courseError.code !== 'PGRST116') { // Ignore not found, treat as empty
                throw courseError;
            }

            // 2. Fetch Chapters
            const { data: chapters, error: chaptersError } = await supabase
                .from('chapters')
                .select('*')
                .eq('course_code', courseCode)
                .order('created_at', { ascending: true });

            if (chaptersError) throw chaptersError;

            // 3. Fetch Resources
            const { data: resources, error: resourcesError } = await supabase
                .from('resources')
                .select('*')
                .eq('course_code', courseCode)
                .order('created_at', { ascending: false });

            if (resourcesError) throw resourcesError;

            set({
                currentCourse: {
                    code: courseCode,
                    overview: course?.overview || '',
                    chapters: chapters || [],
                    resources: resources || [],
                },
                isLoading: false
            });

        } catch (error: any) {
            console.error('Error fetching course data:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    updateOverview: async (courseCode: string, overview: string) => {
        const supabase = createClient();
        // Optimistic update
        const prev = get().currentCourse;
        if (prev) {
            set({ currentCourse: { ...prev, overview } });
        }

        const { error } = await supabase
            .from('courses')
            .upsert({ code: courseCode, overview }, { onConflict: 'code' });

        if (error) {
            console.error('Error updating overview:', error);
            if (prev) set({ currentCourse: prev }); // Revert
        }
    },

    addChapter: async (courseCode: string, title: string, topics: string[]) => {
        const supabase = createClient();

        // Optimistic update? No, let's wait for ID from DB for cleaner state
        const { data, error } = await supabase
            .from('chapters')
            .insert({
                course_code: courseCode,
                title,
                topics
            })
            .select()
            .single();

        if (error) {
            console.error('Error adding chapter:', error);
            return;
        }

        const current = get().currentCourse;
        if (current && data) {
            set({
                currentCourse: {
                    ...current,
                    chapters: [...current.chapters, data]
                }
            });
        }
    },

    deleteChapter: async (chapterId: string) => {
        const supabase = createClient();
        const { error } = await supabase.from('chapters').delete().eq('id', chapterId);

        if (error) {
            console.error('Error deleting chapter:', error);
            return;
        }

        const current = get().currentCourse;
        if (current) {
            set({
                currentCourse: {
                    ...current,
                    chapters: current.chapters.filter(c => c.id !== chapterId)
                }
            });
        }
    },

    addResource: async (courseCode: string, resourceData) => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser(); // Get current user email for added_by

        const payload = {
            course_code: courseCode,
            ...resourceData,
            added_by: user?.email || 'anonymous',
        };

        const { data, error } = await supabase
            .from('resources')
            .insert(payload)
            .select()
            .single();

        if (error) {
            console.error('Error adding resource:', error);
            return;
        }

        const current = get().currentCourse;
        if (current && data) {
            set({
                currentCourse: {
                    ...current,
                    resources: [data, ...current.resources]
                }
            });
        }
    },

    deleteResource: async (resourceId: string) => {
        const supabase = createClient();
        const { error } = await supabase.from('resources').delete().eq('id', resourceId);

        if (error) {
            console.error('Error deleting resource:', error);
            return;
        }

        const current = get().currentCourse;
        if (current) {
            set({
                currentCourse: {
                    ...current,
                    resources: current.resources.filter(r => r.id !== resourceId)
                }
            });
        }
    }
}));
