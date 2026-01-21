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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useUserStore } from "@/stores/user-store";
import { createClient } from "@/lib/supabase/client";
import {
    validateUsernameFormat,
    normalizeUsername,
    BRANCH_OPTIONS,
    YEAR_OPTIONS,
} from "@/lib/validation/username";
import { Loader2, User, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingModalProps {
    forceOpen?: boolean; // For testing
}

export function OnboardingModal({ forceOpen }: OnboardingModalProps) {
    const {
        profile,
        initializeUser,
        updateProfile,
        skipOnboarding,
        isOnboardingRequired,
        checkUsernameAvailable,
    } = useUserStore();

    const [isOpen, setIsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Form state
    const [username, setUsername] = useState("");
    const [branch, setBranch] = useState<string>("");
    const [year, setYear] = useState<string>("");
    const [phone, setPhone] = useState("");

    // Validation state
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameValid, setUsernameValid] = useState(false);
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // Initialize user on mount
    useEffect(() => {
        const initUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                initializeUser(user.email || "", user.id);
            }
        };
        initUser();
    }, [initializeUser]);

    // Check if onboarding is required
    useEffect(() => {
        if (forceOpen !== undefined) {
            setIsOpen(forceOpen);
        } else {
            setIsOpen(isOnboardingRequired());
        }
    }, [profile, isOnboardingRequired, forceOpen]);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!usernameValid) {
            return;
        }

        setIsSubmitting(true);

        const result = await updateProfile({
            username: normalizeUsername(username),
            branch: branch as typeof BRANCH_OPTIONS[number]['value'] || null,
            year: year ? parseInt(year) as typeof YEAR_OPTIONS[number]['value'] : null,
            phone: phone || null,
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

    const handleSkip = () => {
        skipOnboarding();
        setIsOpen(false);
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
                            Your profile is all set up.
                        </p>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                                <Sparkles className="h-6 w-6 text-white" />
                            </div>
                            <DialogTitle className="text-center text-xl">
                                Complete Your Profile
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Choose a username to get started. You can update this later in settings.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                        autoFocus
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
                                {usernameError && (
                                    <p className="text-xs text-red-500">{usernameError}</p>
                                )}
                                <p className="text-xs text-slate-500">
                                    3-30 characters. Letters, numbers, dash, underscore only.
                                </p>
                            </div>

                            {/* Branch & Year */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="branch">Branch</Label>
                                    <Select value={branch} onValueChange={setBranch}>
                                        <SelectTrigger id="branch">
                                            <SelectValue placeholder="Select branch" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {BRANCH_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="year">Year</Label>
                                    <Select value={year} onValueChange={setYear}>
                                        <SelectTrigger id="year">
                                            <SelectValue placeholder="Select year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {YEAR_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Phone (Optional) */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone <span className="text-slate-400">(optional)</span>
                                </Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+91 XXXXXXXXXX"
                                />
                            </div>

                            <DialogFooter className="flex-col gap-2 sm:flex-col">
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={isSubmitting || !usernameValid}
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
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full text-slate-500"
                                    onClick={handleSkip}
                                >
                                    Skip for now
                                </Button>
                            </DialogFooter>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
