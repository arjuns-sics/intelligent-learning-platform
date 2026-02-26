/**
 * Course Details Step
 * First step of course creation - basic course information
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import {
  IconPhoto,
  IconPlus,
  IconX,
  IconCloudUpload,
  IconBook,
  IconTarget,
  IconListCheck,
} from "@tabler/icons-react";
import type { CourseFormData } from "@/pages/course-create-page";

interface CourseDetailsStepProps {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
}

const CATEGORIES = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Artificial Intelligence",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "UI/UX Design",
  "Digital Marketing",
  "Business",
  "Photography",
  "Music",
  "Language Learning",
  "Other",
];

const LEVELS = [
  { value: "beginner", label: "Beginner", description: "No prior knowledge required" },
  { value: "intermediate", label: "Intermediate", description: "Basic understanding needed" },
  { value: "advanced", label: "Advanced", description: "Strong foundation required" },
  { value: "all-levels", label: "All Levels", description: "Suitable for everyone" },
];

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Portuguese",
  "Hindi",
  "Chinese",
  "Japanese",
  "Korean",
];

export function CourseDetailsStep({
  formData,
  updateFormData,
}: CourseDetailsStepProps) {
  const [newPrerequisite, setNewPrerequisite] = useState("");
  const [newObjective, setNewObjective] = useState("");

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim()) {
      updateFormData({
        prerequisites: [...formData.prerequisites, newPrerequisite.trim()],
      });
      setNewPrerequisite("");
    }
  };

  const handleRemovePrerequisite = (index: number) => {
    updateFormData({
      prerequisites: formData.prerequisites.filter((_, i) => i !== index),
    });
  };

  const handleAddObjective = () => {
    if (newObjective.trim()) {
      updateFormData({
        learningObjectives: [...formData.learningObjectives, newObjective.trim()],
      });
      setNewObjective("");
    }
  };

  const handleRemoveObjective = (index: number) => {
    updateFormData({
      learningObjectives: formData.learningObjectives.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
          <IconBook className="size-6 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Course Details</h2>
          <p className="text-sm text-muted-foreground">
            Provide the basic information about your course
          </p>
        </div>
      </div>

      {/* Course Title & Subtitle */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base font-medium">
            Course Title <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g., Complete Web Development Bootcamp"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            Choose a clear, descriptive title that stands out
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle" className="text-base font-medium">
            Subtitle
          </Label>
          <Input
            id="subtitle"
            placeholder="e.g., Learn web development from scratch to advanced"
            value={formData.subtitle}
            onChange={(e) => updateFormData({ subtitle: e.target.value })}
            className="h-11"
          />
          <p className="text-xs text-muted-foreground">
            A brief tagline to complement your title
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-base font-medium">
          Course Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="description"
          placeholder="Describe what students will learn, who this course is for, and what makes it unique..."
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={5}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          {formData.description.length}/2000 characters (min 100 characters recommended)
        </p>
      </div>

      {/* Category, Level, Language */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-2">
          <Label className="text-base font-medium">
            Category <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(value) => updateFormData({ category: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((category) => (
                <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">
            Level <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.level}
            onValueChange={(value) => updateFormData({ level: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  <div className="flex flex-col items-start">
                    <span>{level.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-base font-medium">Language</Label>
          <Select
            value={formData.language}
            onValueChange={(value) => updateFormData({ language: value })}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((language) => (
                <SelectItem key={language} value={language.toLowerCase()}>
                  {language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Course Thumbnail */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Course Thumbnail</Label>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Upload Area */}
          <div
            className="relative border-2 border-dashed rounded-xl p-8 text-center hover:border-primary/50 hover:bg-muted/50 transition-all cursor-pointer group"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    updateFormData({ thumbnail: reader.result as string });
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <IconCloudUpload className="size-7 text-primary" />
              </div>
              <div>
                <p className="font-medium">Click to upload</p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG or WebP (max 2MB)
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                Recommended: 1280x720px
              </p>
            </div>
          </div>

          {/* Preview Area */}
          <div className="border rounded-xl overflow-hidden bg-muted/30">
            {formData.thumbnail ? (
              <div className="relative aspect-video">
                <img
                  src={formData.thumbnail}
                  alt="Course thumbnail"
                  className="w-full h-full object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateFormData({ thumbnail: null });
                  }}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="aspect-video flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <IconPhoto className="size-10" />
                <p className="text-sm">No image selected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconTarget className="size-5 text-primary" />
          <Label className="text-base font-medium">Learning Objectives</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          What will students learn from this course?
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Build responsive websites from scratch"
            value={newObjective}
            onChange={(e) => setNewObjective(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddObjective();
              }
            }}
            className="h-10"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddObjective}
            disabled={!newObjective.trim()}
          >
            <IconPlus className="size-4" />
          </Button>
        </div>

        {formData.learningObjectives.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.learningObjectives.map((objective, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-3 py-1.5 text-sm gap-1.5"
              >
                <IconListCheck className="size-3.5 mr-1 text-primary" />
                {objective}
                <button
                  type="button"
                  onClick={() => handleRemoveObjective(index)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <IconX className="size-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Prerequisites */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconListCheck className="size-5 text-primary" />
          <Label className="text-base font-medium">Prerequisites</Label>
        </div>
        <p className="text-sm text-muted-foreground">
          What should students know before taking this course?
        </p>
        
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Basic understanding of HTML"
            value={newPrerequisite}
            onChange={(e) => setNewPrerequisite(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddPrerequisite();
              }
            }}
            className="h-10"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPrerequisite}
            disabled={!newPrerequisite.trim()}
          >
            <IconPlus className="size-4" />
          </Button>
        </div>

        {formData.prerequisites.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {formData.prerequisites.map((prereq, index) => (
              <Badge
                key={index}
                variant="outline"
                className="px-3 py-1.5 text-sm gap-1.5"
              >
                {prereq}
                <button
                  type="button"
                  onClick={() => handleRemovePrerequisite(index)}
                  className="ml-1 hover:text-destructive transition-colors"
                >
                  <IconX className="size-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}