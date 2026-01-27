export type CourseType = 'core' | 'elective';
export type ResourceType = 'notes' | 'youtube' | 'code';
export type BranchName = 'Electrical Engineering'; // Expandable later

export interface Course {
    id: string;
    course_code: string | null;
    course_name: string;
    semester: number;
    credits_min: number;
    credits_max: number;
    course_type: CourseType;
    branch: string;
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
