"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, FileText, Youtube, Code } from "lucide-react";
import { useCourseStore } from "@/stores/course-store";
import { useUserStore } from "@/stores/user-store";
import { toast } from "sonner";
import { ADMIN_EMAIL } from "@/lib/supabase/client";

interface AdminResourceUploadProps {
    courseId: string;
}

export function AdminResourceUpload({ courseId }: AdminResourceUploadProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [type, setType] = useState<"notes" | "youtube" | "code">("notes");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [fileUrl, setFileUrl] = useState("");
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [codeContent, setCodeContent] = useState("");

    const { uploadResource } = useCourseStore();
    const { profile } = useUserStore();

    // STRICT ADMIN CHECK - Only explicitly allowed admin can see this button
    if (profile?.email !== ADMIN_EMAIL) {
        return null;
    }

    const handleSubmit = async () => {
        if (!title) {
            toast.error("Title is required");
            return;
        }

        setIsSubmitting(true);

        // Prepare content object based on type
        const content = {
            description: description || undefined,
            fileUrl: type === 'notes' ? fileUrl : undefined,
            youtubeUrl: type === 'youtube' ? youtubeUrl : undefined,
            codeContent: type === 'code' ? codeContent : undefined
        };

        const success = await uploadResource(courseId, type, title, content);

        if (success) {
            toast.success("Resource uploaded successfully");
            setOpen(false);
            // Reset form
            setTitle("");
            setDescription("");
            setFileUrl("");
            setYoutubeUrl("");
            setCodeContent("");
        } else {
            toast.error("Failed to upload resource");
        }

        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="h-4 w-4" />
                    Add Resource
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Add Course Resource</DialogTitle>
                    <DialogDescription>
                        Upload study material. Visible to all students immediately.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Resource Type */}
                    <div className="grid gap-2">
                        <Label>Resource Type</Label>
                        <Select value={type} onValueChange={(v: any) => setType(v)}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="notes">
                                    <div className="flex items-center gap-2"><FileText className="h-4 w-4" /> Notes (PDF/Link)</div>
                                </SelectItem>
                                <SelectItem value="youtube">
                                    <div className="flex items-center gap-2"><Youtube className="h-4 w-4" /> YouTube Video</div>
                                </SelectItem>
                                <SelectItem value="code">
                                    <div className="flex items-center gap-2"><Code className="h-4 w-4" /> Code Snippet</div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Title */}
                    <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Unit 1 Lecture Notes"
                        />
                    </div>

                    {/* Description */}
                    <div className="grid gap-2">
                        <Label htmlFor="desc">Description (Optional)</Label>
                        <Textarea
                            id="desc"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Brief context about this resource..."
                            className="resize-none"
                            rows={2}
                        />
                    </div>

                    {/* Dynamic Fields based on Type */}
                    {type === 'notes' && (
                        <div className="grid gap-2">
                            <Label htmlFor="file">File URL</Label>
                            <Input
                                id="file"
                                value={fileUrl}
                                onChange={(e) => setFileUrl(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                    )}

                    {type === 'youtube' && (
                        <div className="grid gap-2">
                            <Label htmlFor="yt">YouTube URL</Label>
                            <Input
                                id="yt"
                                value={youtubeUrl}
                                onChange={(e) => setYoutubeUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..."
                            />
                        </div>
                    )}

                    {type === 'code' && (
                        <div className="grid gap-2">
                            <Label htmlFor="code">Python Code</Label>
                            <Textarea
                                id="code"
                                value={codeContent}
                                onChange={(e) => setCodeContent(e.target.value)}
                                placeholder="def solution(): ..."
                                className="font-mono text-xs h-32"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting || !title}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Upload Resource
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
