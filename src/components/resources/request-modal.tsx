"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRequestStore, REQUEST_TYPE_LABELS, type RequestType } from "@/stores/request-store";
import { useUserStore } from "@/stores/user-store";
import { Loader2, CheckCircle2, FileQuestion } from "lucide-react";

interface RequestModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseCode: string;
    courseName: string;
}

export function RequestResourceModal({
    isOpen,
    onClose,
    courseCode,
    courseName,
}: RequestModalProps) {
    const { submitRequest } = useRequestStore();
    const { profile } = useUserStore();

    const [requestType, setRequestType] = useState<RequestType>("notes");
    const [description, setDescription] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile || !description.trim()) return;

        setIsSubmitting(true);

        // Submit request
        submitRequest({
            courseCode,
            courseName,
            requestType,
            description: description.trim(),
            submittedBy: profile.id,
            submitterName: profile.username || profile.fullName || "Anonymous",
            isAnonymous,
        });

        setIsSuccess(true);
        setTimeout(() => {
            onClose();
            // Reset form
            setDescription("");
            setRequestType("notes");
            setIsAnonymous(false);
            setIsSuccess(false);
        }, 1500);

        setIsSubmitting(false);
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            setIsSuccess(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Request Submitted!
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            We&apos;ll review your request soon.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900">
                                <FileQuestion className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <DialogTitle className="text-center">
                                Request Resource
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Request materials for <strong>{courseName}</strong>
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Resource Type */}
                            <div className="space-y-2">
                                <Label htmlFor="type">What do you need?</Label>
                                <Select
                                    value={requestType}
                                    onValueChange={(v) => setRequestType(v as RequestType)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(REQUEST_TYPE_LABELS).map(([value, label]) => (
                                            <SelectItem key={value} value={value}>
                                                {label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe what you're looking for..."
                                    rows={3}
                                    required
                                />
                            </div>

                            {/* Anonymous Toggle */}
                            <div className="flex items-center justify-between rounded-lg border p-3">
                                <div>
                                    <Label htmlFor="anonymous" className="font-medium">
                                        Post anonymously
                                    </Label>
                                    <p className="text-xs text-slate-500">
                                        Your name won&apos;t be shown publicly
                                    </p>
                                </div>
                                <Switch
                                    id="anonymous"
                                    checked={isAnonymous}
                                    onCheckedChange={setIsAnonymous}
                                />
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleClose}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting || !description.trim()}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Request"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
