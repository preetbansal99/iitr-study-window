"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ChevronLeft,
    User,
    Mail,
    Phone,
    Shield,
    GraduationCap,
    Clock,
    Check,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useUserStore } from "@/stores/user-store";
import { isAdmin, getUserRole } from "@/lib/permissions";
import { validateUsernameFormat, BRANCH_OPTIONS, type BranchValue } from "@/lib/validation/username";

// Branch options
const BRANCHES = [
    { value: "ee", label: "Electrical Engineering" },
    { value: "cse", label: "Computer Science" },
    { value: "ece", label: "Electronics & Communication" },
    { value: "me", label: "Mechanical Engineering" },
    { value: "ce", label: "Civil Engineering" },
    { value: "che", label: "Chemical Engineering" },
    { value: "bt", label: "Biotechnology" },
    { value: "arch", label: "Architecture" },
];

// Year options
const YEARS = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year (Dual Degree)" },
];

export default function ProfileSettingsPage() {
    const { profile, updateProfile, isLoading: storeLoading } = useUserStore();

    // Form state
    const [username, setUsername] = useState("");
    const [branch, setBranch] = useState("");
    const [year, setYear] = useState("");
    const [phone, setPhone] = useState("");
    const [bio, setBio] = useState("");
    const [anonymousDefault, setAnonymousDefault] = useState(false);

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [cooldownRemaining, setCooldownRemaining] = useState<number | null>(null);

    // Initialize form from profile
    useEffect(() => {
        if (profile) {
            setUsername(profile.username || "");
            setBranch(profile.branch || "");
            setYear(profile.year?.toString() || "");
            setPhone(profile.phone || "");
            setBio(profile.bio || "");
            setAnonymousDefault(profile.anonymousPostingDefault || false);

            // Calculate username change cooldown
            if (profile.usernameLastChangedAt) {
                const lastChange = new Date(profile.usernameLastChangedAt);
                const cooldownEnd = new Date(lastChange.getTime() + 30 * 24 * 60 * 60 * 1000);
                const now = new Date();
                if (cooldownEnd > now) {
                    const daysRemaining = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                    setCooldownRemaining(daysRemaining);
                }
            }
        }
    }, [profile]);

    // Validate username on change
    const handleUsernameChange = (value: string) => {
        setUsername(value);
        if (value && value !== profile?.username) {
            const validation = validateUsernameFormat(value);
            if (!validation.isValid) {
                setUsernameError(validation.error || "Invalid username");
            } else {
                setUsernameError(null);
            }
        } else {
            setUsernameError(null);
        }
    };

    // Handle save
    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);

        try {
            // Validate username if changed
            if (username !== profile?.username) {
                const validation = validateUsernameFormat(username);
                if (!validation.isValid) {
                    setUsernameError(validation.error || "Invalid username");
                    setIsSaving(false);
                    return;
                }
            }

            // Update profile
            await updateProfile({
                username: username || undefined,
                branch: branch as "ee" | "cse" | "ece" | "me" | "ce" | "che" | "bt" | "arch" | "meta" | "phy" | "other" | undefined,
                year: year ? parseInt(year) as 1 | 2 | 3 | 4 | 5 : undefined,
                phone: phone || undefined,
                bio: bio || undefined,
                anonymousPostingDefault: anonymousDefault,
            });

            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
            console.error("Failed to save profile:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // User role
    const userEmail = profile?.email || null;
    const userRole = getUserRole(userEmail);
    const userIsAdmin = isAdmin(userEmail);

    return (
        <div className="p-4 lg:p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href="/settings">
                    <Button variant="ghost" className="mb-4 gap-2">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Settings
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Profile Settings
                </h1>
                <p className="mt-1 text-slate-600 dark:text-slate-400">
                    Manage your account information and preferences
                </p>
            </div>

            {/* Read-only Info Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Account Information
                    </CardTitle>
                    <CardDescription>
                        These fields cannot be changed
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Email - Read Only */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-500">
                            <Mail className="h-4 w-4" />
                            Email
                        </Label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={profile?.email || "Not set"}
                                disabled
                                className="bg-slate-50 dark:bg-slate-900"
                            />
                            <Badge variant="secondary">Read-only</Badge>
                        </div>
                    </div>

                    {/* Role - Read Only */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2 text-slate-500">
                            <Shield className="h-4 w-4" />
                            Role
                        </Label>
                        <div className="flex items-center gap-2">
                            <Badge
                                className={userIsAdmin
                                    ? "bg-amber-100 text-amber-700 border-amber-300"
                                    : "bg-slate-100 text-slate-700"
                                }
                            >
                                {userRole}
                            </Badge>
                            {userIsAdmin && (
                                <span className="text-sm text-amber-600">
                                    Full platform access
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Editable Profile Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <GraduationCap className="h-5 w-5" />
                        Profile Details
                    </CardTitle>
                    <CardDescription>
                        Update your profile information
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Username */}
                    <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <Input
                            id="username"
                            value={username}
                            onChange={(e) => handleUsernameChange(e.target.value)}
                            placeholder="Choose a username"
                            className={usernameError ? "border-red-500" : ""}
                            disabled={cooldownRemaining !== null && cooldownRemaining > 0}
                        />
                        {usernameError && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                                <AlertCircle className="h-4 w-4" />
                                {usernameError}
                            </p>
                        )}
                        {cooldownRemaining !== null && cooldownRemaining > 0 && (
                            <p className="text-sm text-amber-600 flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                Username can be changed in {cooldownRemaining} days
                            </p>
                        )}
                        <p className="text-xs text-slate-500">
                            3-30 characters, letters, numbers, dash (-) and underscore (_) only
                        </p>
                    </div>

                    {/* Branch */}
                    <div className="space-y-2">
                        <Label htmlFor="branch">Branch</Label>
                        <Select value={branch} onValueChange={setBranch}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your branch" />
                            </SelectTrigger>
                            <SelectContent>
                                {BRANCHES.map((b) => (
                                    <SelectItem key={b.value} value={b.value}>
                                        {b.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Year */}
                    <div className="space-y-2">
                        <Label htmlFor="year">Year</Label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select your year" />
                            </SelectTrigger>
                            <SelectContent>
                                {YEARS.map((y) => (
                                    <SelectItem key={y.value} value={y.value}>
                                        {y.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Phone (optional)
                        </Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 XXXXXXXXXX"
                            type="tel"
                        />
                    </div>

                    {/* Bio */}
                    <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                            id="bio"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Short academic bio (e.g., research interests, projects)"
                            rows={3}
                            maxLength={500}
                        />
                        <p className="text-xs text-slate-500 text-right">
                            {bio.length}/500
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Preferences Card */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle className="text-lg">Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="anonymous">Default Anonymous Posting</Label>
                            <p className="text-sm text-slate-500">
                                When enabled, new posts will be anonymous by default
                            </p>
                        </div>
                        <Switch
                            id="anonymous"
                            checked={anonymousDefault}
                            onCheckedChange={setAnonymousDefault}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex items-center justify-between">
                <div>
                    {saveSuccess && (
                        <p className="text-green-600 flex items-center gap-2">
                            <Check className="h-4 w-4" />
                            Profile saved successfully!
                        </p>
                    )}
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !!usernameError}
                    className="min-w-[120px]"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </Button>
            </div>
        </div>
    );
}
