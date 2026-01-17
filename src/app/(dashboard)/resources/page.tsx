"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  FileText,
  Link as LinkIcon,
  Video,
  User,
  Plus,
  ExternalLink,
  Loader2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import type { Resource } from "@/lib/types";
import { RESOURCE_CATEGORIES, RESOURCE_TYPES } from "@/lib/types";

const categoryIcons = {
  Notes: FileText,
  Papers: FileText,
  Video: Video,
  Contact: User,
  Other: BookOpen,
};

const categoryColors = {
  Notes: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Papers: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Video: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  Contact: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  Other: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [newResource, setNewResource] = useState({
    title: "",
    description: "",
    type: "Link" as Resource["type"],
    category: "Notes" as Resource["category"],
    subject_name: "",
    subject_code: "",
    professor_name: "",
    url: "",
  });

  const supabase = createClient();

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setResources(data);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("resources").insert([
      {
        ...newResource,
        uploaded_by: user?.id,
      },
    ]);

    if (!error) {
      setIsAddDialogOpen(false);
      setNewResource({
        title: "",
        description: "",
        type: "Link",
        category: "Notes",
        subject_name: "",
        subject_code: "",
        professor_name: "",
        url: "",
      });
      fetchResources();
    }
    setIsSubmitting(false);
  };

  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.subject_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.professor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.subject_code?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      activeCategory === "all" || resource.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl dark:text-white">
            Resource Hub
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            Find and share academic resources with your peers
          </p>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Resource</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={newResource.title}
                  onChange={(e) =>
                    setNewResource({ ...newResource, title: e.target.value })
                  }
                  placeholder="e.g., Data Structures Notes"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type *</Label>
                  <Select
                    value={newResource.type}
                    onValueChange={(value: Resource["type"]) =>
                      setNewResource({ ...newResource, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={newResource.category}
                    onValueChange={(value: Resource["category"]) =>
                      setNewResource({ ...newResource, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESOURCE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject_name">Subject Name</Label>
                  <Input
                    id="subject_name"
                    value={newResource.subject_name}
                    onChange={(e) =>
                      setNewResource({ ...newResource, subject_name: e.target.value })
                    }
                    placeholder="e.g., Data Structures"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject_code">Subject Code</Label>
                  <Input
                    id="subject_code"
                    value={newResource.subject_code}
                    onChange={(e) =>
                      setNewResource({ ...newResource, subject_code: e.target.value })
                    }
                    placeholder="e.g., CS201"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professor_name">Professor Name</Label>
                <Input
                  id="professor_name"
                  value={newResource.professor_name}
                  onChange={(e) =>
                    setNewResource({ ...newResource, professor_name: e.target.value })
                  }
                  placeholder="e.g., Dr. John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL / Link *</Label>
                <Input
                  id="url"
                  value={newResource.url}
                  onChange={(e) =>
                    setNewResource({ ...newResource, url: e.target.value })
                  }
                  placeholder="https://..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newResource.description}
                  onChange={(e) =>
                    setNewResource({ ...newResource, description: e.target.value })
                  }
                  placeholder="Brief description of the resource"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Add Resource"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search by subject, professor, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
        <TabsList className="h-auto flex-wrap gap-2 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-full border data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950"
          >
            All Resources
          </TabsTrigger>
          {RESOURCE_CATEGORIES.map((category) => {
            const Icon = categoryIcons[category];
            return (
              <TabsTrigger
                key={category}
                value={category}
                className="gap-2 rounded-full border data-[state=active]:border-blue-500 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-950"
              >
                <Icon className="h-4 w-4" />
                {category}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredResources.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <GraduationCap className="mb-4 h-12 w-12 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  No resources found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {searchQuery
                    ? "Try adjusting your search terms"
                    : "Be the first to add a resource!"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredResources.map((resource) => {
                const Icon = categoryIcons[resource.category];
                return (
                  <Card
                    key={resource.id}
                    className="group transition-all hover:shadow-md"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge
                          variant="secondary"
                          className={categoryColors[resource.category]}
                        >
                          <Icon className="mr-1 h-3 w-3" />
                          {resource.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {resource.type}
                        </Badge>
                      </div>
                      <CardTitle className="mt-2 text-lg leading-tight">
                        {resource.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {resource.description && (
                        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                          {resource.description}
                        </p>
                      )}

                      <div className="space-y-1 text-sm text-slate-500">
                        {resource.subject_name && (
                          <p>
                            <span className="font-medium">Subject:</span>{" "}
                            {resource.subject_name}
                            {resource.subject_code && ` (${resource.subject_code})`}
                          </p>
                        )}
                        {resource.professor_name && (
                          <p>
                            <span className="font-medium">Professor:</span>{" "}
                            {resource.professor_name}
                          </p>
                        )}
                      </div>

                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Open Resource
                        </a>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
