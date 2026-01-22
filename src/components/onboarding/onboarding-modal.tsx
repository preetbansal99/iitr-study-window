"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
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
    extractEnrollmentFromName,
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
    const router = useRouter();
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
    const [usernameWarning, setUsernameWarning] = useState<string | null>(null); // Non-blocking
    const [usernameValid, setUsernameValid] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);
    const [confirmed, setConfirmed] = useState(false);  // User confirmation

    // Initialize user and extract identity from Google
    useEffect(() => {
        const initUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                initializeUser(user.email || "", user.id);

                // Extract CLEAN name (without enrollment suffix)
                const name = extractFullName(user);
                setFullName(name);
                setEmail(user.email || null);

                // Auto-populate enrollment if found in name suffix
                const enrollmentFromName = extractEnrollmentFromName(user);
                if (enrollmentFromName) {
                    setEnrollmentNumber(enrollmentFromName);
                    // Trigger derivation
                    const parsed = parseEnrollmentNumber(enrollmentFromName);
                    if (parsed) {
                        setBranchName(getBranchName(parsed.branchCode));
                        const semesterInfo = deriveSemester(parsed.enrollmentYear);
                        setAcademicYear(semesterInfo.yearLabel);
                        setSemester(semesterInfo.semester);
                    }
                }

                // Try to get branch from email domain (fallback)
                if (user.email && !branchName) {
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

        if (!usernameValid || !enrollmentNumber || enrollmentError || !confirmed) {
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
        const derivedBranchName = getBranchName(parsed.branchCode) || getBranchFromEmail(email || "");

        // Prepare identity data for Supabase
        const identityData = {
            username: normalizeUsername(username),
            full_name: fullName,
            enrollment_number: enrollmentNumber,
            enrollment_year: parsed.enrollmentYear,
            branch_code: branchCode,
            branch_name: derivedBranchName,
            roll_number: parsed.rollNumber,
            current_academic_year: semesterInfo.academicYear,
            current_semester: semesterInfo.semester,
            identity_locked: true, // Lock identity after this save
        };

        try {
            // Atomic write to Supabase
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setUsernameError("Not authenticated. Please refresh and try again.");
                setIsSubmitting(false);
                return;
            }

            const { error: dbError } = await supabase
                .from('users')
                .update(identityData)
                .eq('id', user.id);

            if (dbError) {
                console.error('Failed to save identity:', dbError);
                setUsernameError(`Failed to save: ${dbError.message}. Please try again.`);
                setIsSubmitting(false);
                return;
            }

            // Update local store after successful DB write
            await updateProfile({
                username: normalizeUsername(username),
                fullName: fullName,
                enrollmentNumber: enrollmentNumber,
                enrollmentYear: parsed.enrollmentYear,
                branchCode: branchCode,
                branchName: derivedBranchName,
                rollNumber: parsed.rollNumber,
                currentAcademicYear: semesterInfo.academicYear,
                currentSemester: semesterInfo.semester,
                identityLocked: true,
            });

            setIsSuccess(true);

            // Step 6: Navigate to resources based on derived branch and semester
            const branchSlug = derivedBranchName?.toLowerCase().split(' ')[0] || 'ee';
            setTimeout(() => {
                setIsOpen(false);
                // Navigate to: Dashboard → Resources → Branch → Semester
                router.push(`/resources/${branchSlug}/semester/${semesterInfo.semester}`);
            }, 1500);
        } catch (err) {
            console.error('Identity save error:', err);
            setUsernameError('An unexpected error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
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

                            {/* Confirmation Checkbox */}
                            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-900/20">
                                <Checkbox
                                    id="confirm"
                                    checked={confirmed}
                                    onCheckedChange={(checked) => setConfirmed(checked === true)}
                                    className="mt-0.5"
                                />
                                <div className="grid gap-1.5 leading-none">
                                    <Label
                                        htmlFor="confirm"
                                        className="text-sm font-medium text-amber-800 dark:text-amber-200"
                                    >
                                        I confirm these details are correct
                                    </Label>
                                    <p className="text-xs text-amber-700 dark:text-amber-300">
                                        Academic identity cannot be changed after setup.
                                    </p>
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !usernameValid || !enrollmentNumber || !!enrollmentError || !confirmed}
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
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
