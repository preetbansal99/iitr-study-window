export type CourseType = 'core' | 'elective' | 'OEC' | 'PEC' | 'MSC' | 'DHC';
export type ResourceType = 'notes' | 'youtube' | 'code';
export type BranchName = 'Electrical Engineering' | 'Electronics & Communication Engineering' | 'Computer Science & Engineering';

export interface Course {
    id: string;
    course_code: string | null;
    course_name: string;
    semester: number;
    credits_min: number;
    credits_max: number;
    course_type: CourseType;
    branch: string;
    // New Academic Metadata
    lecture_hours?: number;
    tutorial_hours?: number;
    practical_hours?: number;
    cws_weightage?: string;
    mte_weightage?: string;
    ete_weightage?: string;
    practical_weightage?: string;
    pre_weightage?: string;
    created_at: string;
}

export interface CourseResource {
    id: string;
    course_id: string;
    resource_type: ResourceType;
    title: string;
    description: string | null;
    file_url: string | null;
    youtube_url: string | null;
    code_content: string | null;
    uploaded_by: string | null;
    created_at: string;
}

export interface Branch {
    id: string;
    name: string;
    shortName: string;
    icon: string;
}
