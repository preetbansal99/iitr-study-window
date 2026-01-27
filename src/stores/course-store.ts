import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Course, CourseResource } from '@/lib/courses/types';

interface CourseState {
    courses: Course[];
    resources: Record<string, CourseResource[]>; // Map courseId -> resources
    isLoading: boolean;
    error: string | null;

    fetchCourses: (branch: string) => Promise<void>;
    fetchResources: (courseId: string) => Promise<void>;
    uploadResource: (
        courseId: string,
        resourceType: 'notes' | 'youtube' | 'code',
        title: string,
        content: { description?: string; fileUrl?: string; youtubeUrl?: string; codeContent?: string }
    ) => Promise<boolean>;
}

export const useCourseStore = create<CourseState>((set, get) => ({
    courses: [],
    resources: {},
    isLoading: false,
    error: null,

    fetchCourses: async (branch) => {
        set({ isLoading: true, error: null });
        const supabase = createClient();

        // Default to Electrical Engineering if branch is generic 'EE' or undefined
        // Ideally this mapping belongs in a util, but fine here for now
        const dbBranchName = branch === 'ee' || !branch ? 'Electrical Engineering' : branch;

        const { data, error } = await supabase
            .from('courses')
            .select('*')
            .eq('branch', dbBranchName)
            .order('semester', { ascending: true })
            .order('course_code', { ascending: true });

        if (error) {
            console.error('Error fetching courses:', error);
            set({ isLoading: false, error: error.message });
            return;
        }

        set({ courses: data as Course[], isLoading: false });
    },

    fetchResources: async (courseId) => {
        // specific loading state for resources? for now global isLoading
        // set({ isLoading: true, error: null }); 
        const supabase = createClient();

        const { data, error } = await supabase
            .from('course_resources')
            .select('*')
            .eq('course_id', courseId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching resources:', error);
            // Don't block whole UI on resource fetch fail
            return;
        }

        set((state) => ({
            resources: {
                ...state.resources,
                [courseId]: data as CourseResource[],
            },
        }));
    },

    uploadResource: async (courseId, resourceType, title, content) => {
        set({ isLoading: true, error: null });
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            set({ isLoading: false, error: "Must be logged in" });
            return false;
        }

        // Explicit admin check is done by RLS, but we can fail early if we want.
        // Relying on RLS is safer single source of truth.

        const payload = {
            course_id: courseId,
            resource_type: resourceType,
            title: title,
            description: content.description,
            file_url: content.fileUrl,
            youtube_url: content.youtubeUrl,
            code_content: content.codeContent,
            uploaded_by: user.id
        };

        const { error } = await supabase
            .from('course_resources')
            .insert(payload);

        if (error) {
            console.error('Error uploading resource:', error);
            set({ isLoading: false, error: error.message });
            return false;
        }

        // Refresh resources for this course
        await get().fetchResources(courseId);
        set({ isLoading: false });
        return true;
    }
}));
