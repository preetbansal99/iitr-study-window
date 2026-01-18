"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  ChevronLeft,
  Zap,
  Monitor,
  Radio,
  Cog,
  GraduationCap,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { BRANCHES, getSemesterCourses, getTotalCredits, type Branch, type Course } from "@/lib/curriculumData";
import { CourseDetail } from "@/components/resources/course-detail";
import { ClubsGrid } from "@/components/resources/clubs-grid";

// Dynamic icon component
const BranchIcon = ({ iconName, className }: { iconName: string; className?: string }) => {
  const icons: Record<string, React.ReactNode> = {
    Zap: <Zap className={className} />,
    Monitor: <Monitor className={className} />,
    Radio: <Radio className={className} />,
    Cog: <Cog className={className} />,
  };
  return icons[iconName] || <GraduationCap className={className} />;
};

type ViewState = "gateway" | "academic" | "clubs";

export default function ResourcesPage() {
  const [view, setView] = useState<ViewState>("gateway");
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Get current branch data
  const currentBranch = selectedBranch
    ? BRANCHES.find((b) => b.id === selectedBranch)
    : null;

  // Get current courses
  const currentCourses = selectedBranch && selectedSemester
    ? getSemesterCourses(selectedBranch, selectedSemester)
    : [];

  // Navigation handlers
  const goToGateway = () => {
    setView("gateway");
    setSelectedBranch(null);
    setSelectedSemester(null);
  };

  const goToAcademic = () => {
    setView("academic");
    setSelectedBranch(null);
    setSelectedSemester(null);
  };

  const selectBranch = (branchId: string) => {
    setSelectedBranch(branchId);
    setSelectedSemester(null);
  };

  const goBack = () => {
    if (selectedSemester) {
      setSelectedSemester(null);
    } else if (selectedBranch) {
      setSelectedBranch(null);
    } else {
      goToGateway();
    }
  };

  // Breadcrumb with click handlers
  const getBreadcrumbItems = () => {
    const items: { label: string; onClick?: () => void }[] = [];

    if (view === "academic") {
      items.push({
        label: "Resources",
        onClick: goToGateway,
      });
    }

    if (selectedBranch && currentBranch) {
      items.push({
        label: currentBranch.shortName,
        onClick: () => {
          setSelectedSemester(null);
          setSelectedCourse(null);
        },
      });
    }

    if (selectedSemester) {
      items.push({
        label: `Semester ${selectedSemester}`,
        onClick: () => setSelectedCourse(null),
      });
    }

    if (selectedCourse) {
      items.push({
        label: selectedCourse.title,
      });
    }

    return items;
  };

  // ============================================
  // GATEWAY VIEW
  // ============================================
  if (view === "gateway") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 lg:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white lg:text-4xl">
            Resource Hub
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Choose your path
          </p>
        </div>

        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
          {/* Academic Materials Card */}
          <Card
            className="group cursor-pointer border-2 border-transparent transition-all hover:border-indigo-500 hover:shadow-xl"
            onClick={goToAcademic}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg transition-transform group-hover:scale-110">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Academic Materials
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Course-wise notes, papers & resources
              </p>
              <Badge className="mt-4 bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                {BRANCHES.length} Branches Available
              </Badge>
            </CardContent>
          </Card>

          {/* Campus Clubs Card */}
          <Card
            className="group cursor-pointer border-2 border-transparent transition-all hover:border-emerald-500 hover:shadow-xl"
            onClick={() => setView("clubs")}
          >
            <CardContent className="flex flex-col items-center p-8 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg transition-transform group-hover:scale-110">
                <Users className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Campus Clubs
              </h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Student groups & activities
              </p>
              <Badge className="mt-4 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                Coming Soon
              </Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ============================================
  // CLUBS VIEW
  // ============================================
  if (view === "clubs") {
    return <ClubsGrid onBack={goToGateway} />;
  }

  // ============================================
  // ACADEMIC VIEW
  // ============================================
  return (
    <div className="p-4 lg:p-8">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <Button variant="ghost" onClick={goBack} className="mb-4 gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Breadcrumb */}
        <div className="mb-2 flex items-center gap-1 text-sm text-slate-500">
          {getBreadcrumbItems().map((item, i) => (
            <span key={i} className="flex items-center gap-1">
              {i > 0 && <span>/</span>}
              {item.onClick ? (
                <button
                  onClick={item.onClick}
                  className="hover:text-indigo-600 hover:underline"
                >
                  {item.label}
                </button>
              ) : (
                <span className="font-medium text-slate-900 dark:text-white">
                  {item.label}
                </span>
              )}
            </span>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white lg:text-3xl">
          {selectedSemester
            ? `${currentBranch?.shortName} - Semester ${selectedSemester}`
            : selectedBranch
              ? currentBranch?.name
              : "Academic Materials"}
        </h1>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {selectedSemester
            ? `${currentCourses.length} courses • ${getTotalCredits(currentCourses)} credits`
            : selectedBranch
              ? "Select your semester"
              : "Select your branch"}
        </p>
      </div>

      {/* Branch Selection */}
      {!selectedBranch && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BRANCHES.map((branch) => (
            <Card
              key={branch.id}
              className="group cursor-pointer border-2 border-transparent transition-all hover:border-indigo-500 hover:shadow-lg"
              onClick={() => selectBranch(branch.id)}
            >
              <CardContent className="flex flex-col items-center p-6 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md transition-transform group-hover:scale-110">
                  <BranchIcon iconName={branch.icon} className="h-7 w-7 text-white" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {branch.shortName}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {branch.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Semester Selection */}
      {selectedBranch && !selectedSemester && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((sem) => {
            const courses = getSemesterCourses(selectedBranch, sem);
            const credits = getTotalCredits(courses);
            return (
              <Card
                key={sem}
                className="group cursor-pointer border-2 border-transparent transition-all hover:border-indigo-500 hover:shadow-lg"
                onClick={() => setSelectedSemester(sem)}
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    <span className="text-xl font-bold">{sem}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    Semester {sem}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {courses.length} courses
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {credits} credits
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Course Cards */}
      {selectedSemester && !selectedCourse && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentCourses.map((course) => (
            <Card
              key={course.code}
              className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-300"
              onClick={() => setSelectedCourse(course)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                    {course.code}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {course.credits} Credits
                  </Badge>
                </div>
                <CardTitle className="mt-2 text-lg leading-tight">
                  {course.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <GraduationCap className="h-4 w-4" />
                    <span>{course.type === "core" ? "Core Course" : "Elective"}</span>
                  </div>
                  {course.chapters && course.chapters.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {course.chapters.length} Chapters
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Detail View */}
      {selectedCourse && (
        <CourseDetail
          course={selectedCourse}
          onBack={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
