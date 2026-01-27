import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { Course, CourseResource } from '@/lib/courses/types';

interface CourseState {
    courses: Course[];
    resources: Record<string, CourseResource[]>; // Map courseId -> resources
    isLoading: boolean;
    error: string | null;

    fetchCourses: (branch: string) => Promise<void>;
    fetchResources: (courseCode: string) => Promise<void>;
    uploadResource: (
        courseId: string, // Keep for audit/lineage
        courseCode: string, // Primary link
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

        // Map branch ID to Database Branch Name
        let dbBranchName = branch;
        if (branch === 'ee' || !branch) dbBranchName = 'Electrical Engineering';
        else if (branch === 'ece') dbBranchName = 'Electronics & Communication Engineering';
        else if (branch === 'cse') dbBranchName = 'Computer Science & Engineering';

        // Join courses (curriculum) with master_courses (metadata)
        const { data, error } = await supabase
            .from('courses')
            .select(`
                id,
                course_code,
                semester,
                course_type,
                branch,
                created_at,
                master_courses (
                    course_name,
                    credits_min,
                    credits_max,
                    lecture_hours,
                    tutorial_hours,
                    practical_hours,
                    cws_weightage,
                    mte_weightage,
                    ete_weightage,
                    practical_weightage,
                    pre_weightage
                )
            `)
            .eq('branch', dbBranchName)
            .order('semester', { ascending: true });

        if (error) {
            console.error('Error fetching courses:', error);
            set({ isLoading: false, error: error.message });
            return;
        }

        // Flatten the data to match the Course Interface
        const flattenedCourses: Course[] = data.map((item: any) => ({
            id: item.id,
            course_code: item.course_code,
            semester: item.semester,
            course_type: item.course_type,
            branch: item.branch,
            created_at: item.created_at,
            // Master Data
            course_name: item.master_courses?.course_name || 'Unknown Course',
            credits_min: item.master_courses?.credits_min || 0,
            credits_max: item.master_courses?.credits_max || 0,
            lecture_hours: item.master_courses?.lecture_hours,
            tutorial_hours: item.master_courses?.tutorial_hours,
            practical_hours: item.master_courses?.practical_hours,
            cws_weightage: item.master_courses?.cws_weightage,
            mte_weightage: item.master_courses?.mte_weightage,
            ete_weightage: item.master_courses?.ete_weightage,
            practical_weightage: item.master_courses?.practical_weightage,
            pre_weightage: item.master_courses?.pre_weightage,
        }));

        set({ courses: flattenedCourses, isLoading: false });
    },

    // FETCH BY COURSE CODE (Shared Resources)
    fetchResources: async (courseCode) => {
        const supabase = createClient();

        const { data, error } = await supabase
            .from('course_resources')
            .select('*')
            .eq('course_code', courseCode) // Changed from course_id check
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching resources:', error);
            return;
        }

        set((state) => ({
            resources: {
                ...state.resources,
                [courseCode]: data as CourseResource[], // Keyed by Code
            },
        }));
    },

    uploadResource: async (courseId, courseCode, resourceType, title, content) => {
        set({ isLoading: true, error: null });
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            set({ isLoading: false, error: "Must be logged in" });
            return false;
        }

        const payload = {
            course_id: courseId,
            course_code: courseCode, // Added
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

        // Refresh resources for this course code
        await get().fetchResources(courseCode);
        set({ isLoading: false });
        return true;
    }
}));
