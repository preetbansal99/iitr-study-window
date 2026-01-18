"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { useTimerStore } from "@/stores/timer-store";
import { Settings, User, Clock, Bell, Loader2, CheckCircle2 } from "lucide-react";
import type { User as UserProfile } from "@/lib/types";

const BRANCHES = [
  "Computer Science",
  "Electronics & Communication",
  "Electrical",
  "Mechanical",
  "Civil",
  "Chemical",
  "Biotechnology",
  "Architecture",
  "Metallurgical",
  "Applied Science",
  "Other",
];

const YEARS = [1, 2, 3, 4, 5];

export default function SettingsPage() {
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    updateSettings,
  } = useTimerStore();

  const [timerSettings, setTimerSettings] = useState({
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setProfile(data);
      } else {
        setProfile({ email: user.email });
      }
    }
    setIsLoading(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("users")
        .upsert({
          id: user.id,
          email: user.email,
          full_name: profile.full_name,
          branch: profile.branch,
          year: profile.year,
        });

      if (!error) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    }
    setIsSaving(false);
  };

  const handleSaveTimerSettings = () => {
    updateSettings(timerSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          Manage your profile and preferences
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Profile
            </CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email || ""}
                disabled
                className="bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={profile.full_name || ""}
                onChange={(e) =>
                  setProfile({ ...profile, full_name: e.target.value })
                }
                placeholder="Your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select
                  value={profile.branch || ""}
                  onValueChange={(value) =>
                    setProfile({ ...profile, branch: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select
                  value={profile.year?.toString() || ""}
                  onValueChange={(value) =>
                    setProfile({ ...profile, year: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        Year {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveProfile} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : saveSuccess ? (
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
              ) : null}
              {saveSuccess ? "Saved!" : "Save Profile"}
            </Button>
          </CardContent>
        </Card>

        {/* Timer Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              Focus Timer
            </CardTitle>
            <CardDescription>
              Customize your Pomodoro timer settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="focusDuration">Focus Duration (min)</Label>
                <Input
                  id="focusDuration"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="25"
                  value={timerSettings.focusDuration === 0 ? "" : timerSettings.focusDuration}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setTimerSettings({
                      ...timerSettings,
                      focusDuration: val === "" ? 0 : Math.min(120, parseInt(val)),
                    });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) < 1) {
                      setTimerSettings({ ...timerSettings, focusDuration: 25 });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!timerSettings.focusDuration || timerSettings.focusDuration < 1) {
                        setTimerSettings({ ...timerSettings, focusDuration: 25 });
                      }
                      handleSaveTimerSettings();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortBreakDuration">Short Break (min)</Label>
                <Input
                  id="shortBreakDuration"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="5"
                  value={timerSettings.shortBreakDuration === 0 ? "" : timerSettings.shortBreakDuration}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setTimerSettings({
                      ...timerSettings,
                      shortBreakDuration: val === "" ? 0 : Math.min(30, parseInt(val)),
                    });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) < 1) {
                      setTimerSettings({ ...timerSettings, shortBreakDuration: 5 });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!timerSettings.shortBreakDuration || timerSettings.shortBreakDuration < 1) {
                        setTimerSettings({ ...timerSettings, shortBreakDuration: 5 });
                      }
                      handleSaveTimerSettings();
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="longBreakDuration">Long Break (min)</Label>
                <Input
                  id="longBreakDuration"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="15"
                  value={timerSettings.longBreakDuration === 0 ? "" : timerSettings.longBreakDuration}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setTimerSettings({
                      ...timerSettings,
                      longBreakDuration: val === "" ? 0 : Math.min(60, parseInt(val)),
                    });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) < 1) {
                      setTimerSettings({ ...timerSettings, longBreakDuration: 15 });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!timerSettings.longBreakDuration || timerSettings.longBreakDuration < 1) {
                        setTimerSettings({ ...timerSettings, longBreakDuration: 15 });
                      }
                      handleSaveTimerSettings();
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionsUntilLongBreak">
                  Sessions until long break
                </Label>
                <Input
                  id="sessionsUntilLongBreak"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="4"
                  value={timerSettings.sessionsUntilLongBreak === 0 ? "" : timerSettings.sessionsUntilLongBreak}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setTimerSettings({
                      ...timerSettings,
                      sessionsUntilLongBreak: val === "" ? 0 : Math.min(10, parseInt(val)),
                    });
                  }}
                  onBlur={(e) => {
                    if (!e.target.value || parseInt(e.target.value) < 1) {
                      setTimerSettings({ ...timerSettings, sessionsUntilLongBreak: 4 });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (!timerSettings.sessionsUntilLongBreak || timerSettings.sessionsUntilLongBreak < 1) {
                        setTimerSettings({ ...timerSettings, sessionsUntilLongBreak: 4 });
                      }
                      handleSaveTimerSettings();
                    }
                  }}
                />
              </div>
            </div>

            <Button onClick={handleSaveTimerSettings}>
              Save Timer Settings
            </Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-green-600" />
              Notifications
            </CardTitle>
            <CardDescription>
              Manage notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              onClick={() => {
                if ("Notification" in window) {
                  Notification.requestPermission().then((permission) => {
                    if (permission === "granted") {
                      new Notification("Notifications enabled!", {
                        body: "You will now receive timer notifications.",
                      });
                    }
                  });
                }
              }}
            >
              Enable Timer Notifications
            </Button>
            <p className="mt-2 text-sm text-slate-500">
              Get notified when your focus session or break ends.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
