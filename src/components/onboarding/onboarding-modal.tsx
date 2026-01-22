"use client";

import { useState, useEffect } from "react";
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
import { useUserStore } from "@/stores/user-store";
import { createClient } from "@/lib/supabase/client";
import {
    validateUsernameFormat,
    normalizeUsername,
} from "@/lib/validation/username";
import {
    parseEnrollmentNumber,
    getBranchName,
    getBranchFromEmail,
    getBranchCodeFromEmail,
    deriveSemester,
    extractFullName,
} from "@/lib/academic-identity";
import {
    Loader2,
    User,
    CheckCircle2,
    AlertCircle,
    GraduationCap,
    Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function OnboardingModal() {
    const {
        profile,
        initializeUser,
        updateProfile,
        isOnboardingRequired,
        checkUsernameAvailable,
    } = useUserStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form state
    const [username, setUsername] = useState("");
    const [enrollmentNumber, setEnrollmentNumber] = useState("");

    // Derived identity (computed from Google + enrollment)
    const [fullName, setFullName] = useState<string | null>(null);
    const [email, setEmail] = useState<string | null>(null);
    const [branchName, setBranchName] = useState<string | null>(null);
    const [academicYear, setAcademicYear] = useState<string | null>(null);
    const [semester, setSemester] = useState<number | null>(null);
    const [enrollmentError, setEnrollmentError] = useState<string | null>(null);

    // Validation state
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameValid, setUsernameValid] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Initialize user and extract identity from Google
    useEffect(() => {
        const initUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                initializeUser(user.email || "", user.id);

                // Extract identity from Google metadata
                const name = extractFullName(user);
                setFullName(name);
                setEmail(user.email || null);

                // Try to get branch from email domain
                if (user.email) {
                    const branch = getBranchFromEmail(user.email);
                    if (branch) {
                        setBranchName(branch);
                    }
                }
            }
        };
        initUser();
    }, [initializeUser]);

    // Check if onboarding is required
    useEffect(() => {
        setIsOpen(isOnboardingRequired());
    }, [profile, isOnboardingRequired]);

    // Validate username on change (debounced)
    useEffect(() => {
        if (!username) {
            setUsernameError(null);
            setUsernameValid(false);
            return;
        }

        const normalized = normalizeUsername(username);
        const timer = setTimeout(() => {
            setIsCheckingUsername(true);

            const validation = validateUsernameFormat(normalized);
            if (!validation.isValid) {
                setUsernameError(validation.error || "Invalid username");
                setUsernameValid(false);
            } else if (!checkUsernameAvailable(normalized)) {
                setUsernameError("Username is already taken");
                setUsernameValid(false);
            } else {
                setUsernameError(null);
                setUsernameValid(true);
            }

            setIsCheckingUsername(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [username, checkUsernameAvailable]);

    // Validate and derive identity from enrollment number
    useEffect(() => {
        if (!enrollmentNumber) {
            setEnrollmentError(null);
            return;
        }

        const parsed = parseEnrollmentNumber(enrollmentNumber);
        if (!parsed) {
            setEnrollmentError("Invalid format. Expected 8 digits (e.g., 25115109)");
            setAcademicYear(null);
            setSemester(null);
            return;
        }

        setEnrollmentError(null);

        // Get branch name from enrollment code
        const enrollmentBranch = getBranchName(parsed.branchCode);
        if (enrollmentBranch) {
            setBranchName(enrollmentBranch);
        }

        // Derive semester from enrollment year
        const semesterInfo = deriveSemester(parsed.enrollmentYear);
        setAcademicYear(semesterInfo.yearLabel);
        setSemester(semesterInfo.semester);
    }, [enrollmentNumber]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!usernameValid || !enrollmentNumber || enrollmentError) {
            return;
        }

        setIsSubmitting(true);

        const parsed = parseEnrollmentNumber(enrollmentNumber);
        if (!parsed) {
            setIsSubmitting(false);
            return;
        }

        const semesterInfo = deriveSemester(parsed.enrollmentYear);
        const branchCode = parsed.branchCode || getBranchCodeFromEmail(email || "");

        const result = await updateProfile({
            username: normalizeUsername(username),
            fullName: fullName,
            enrollmentNumber: enrollmentNumber,
            enrollmentYear: parsed.enrollmentYear,
            branchCode: branchCode,
            branchName: getBranchName(parsed.branchCode) || getBranchFromEmail(email || ""),
            rollNumber: parsed.rollNumber,
            currentAcademicYear: semesterInfo.academicYear,
            currentSemester: semesterInfo.semester,
            identityLocked: true, // Lock identity after first save
        });

        if (result.success) {
            setIsSuccess(true);
            setTimeout(() => {
                setIsOpen(false);
            }, 1500);
        } else {
            setUsernameError(result.error || "Failed to save profile");
        }

        setIsSubmitting(false);
    };

    // Don't render if no profile
    if (!profile) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={() => { }}>
            <DialogContent
                className="sm:max-w-md"
                showCloseButton={false}
                onPointerDownOutside={(e) => e.preventDefault()}
                onEscapeKeyDown={(e) => e.preventDefault()}
            >
                {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                            Welcome, @{normalizeUsername(username)}!
                        </h3>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Your profile is all set.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 dark:bg-white">
                                <GraduationCap className="h-6 w-6 text-white dark:text-slate-900" />
                            </div>
                            <DialogTitle className="text-center text-xl">
                                Complete Your Profile
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Verify your academic identity to get started.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Read-Only Identity Fields */}
                            <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <Lock className="h-3 w-3" />
                                    Academic Identity (Auto-filled)
                                </div>

                                <div className="grid gap-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Name</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {fullName || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Email</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {email || "—"}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Branch</span>
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {branchName || "—"}
                                        </span>
                                    </div>
                                    {academicYear && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Year</span>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                {academicYear}
                                            </span>
                                        </div>
                                    )}
                                    {semester && (
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">Current Semester</span>
                                            <span className="font-medium text-slate-900 dark:text-white">
                                                Semester {semester}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Enrollment Number Input */}
                            <div className="space-y-2">
                                <Label htmlFor="enrollment" className="flex items-center gap-1">
                                    Enrollment Number <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="enrollment"
                                    value={enrollmentNumber}
                                    onChange={(e) => setEnrollmentNumber(e.target.value.replace(/\D/g, "").slice(0, 8))}
                                    placeholder="e.g., 25115109"
                                    className={cn(
                                        enrollmentError && "border-red-500 focus-visible:ring-red-500"
                                    )}
                                    maxLength={8}
                                />
                                {enrollmentError ? (
                                    <p className="text-xs text-red-500">{enrollmentError}</p>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        8 digits: YY (year) + BBB (branch) + XXX (roll)
                                    </p>
                                )}
                            </div>

                            {/* Username Field */}
                            <div className="space-y-2">
                                <Label htmlFor="username" className="flex items-center gap-1">
                                    <User className="h-3.5 w-3.5" />
                                    Username <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        placeholder="e.g., preet_123"
                                        className={cn(
                                            "pr-10",
                                            usernameError && "border-red-500 focus-visible:ring-red-500",
                                            usernameValid && "border-green-500 focus-visible:ring-green-500"
                                        )}
                                        autoComplete="off"
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {isCheckingUsername && (
                                            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                                        )}
                                        {!isCheckingUsername && usernameValid && (
                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        )}
                                        {!isCheckingUsername && usernameError && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}
                                    </div>
                                </div>
                                {usernameError ? (
                                    <p className="text-xs text-red-500">{usernameError}</p>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        3-30 characters. Letters, numbers, dash, underscore only.
                                    </p>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !usernameValid || !enrollmentNumber || !!enrollmentError}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        "Complete Setup"
                                    )}
                                </Button>
                            </DialogFooter>

                            <p className="text-center text-xs text-slate-400">
                                Academic identity fields cannot be changed after setup.
                            </p>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
