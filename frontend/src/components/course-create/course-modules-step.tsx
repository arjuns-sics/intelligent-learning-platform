/**
 * Course Modules Step
 * Second step - manage course structure with modules and lessons
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconPlus,
  IconGripVertical,
  IconChevronDown,
  IconChevronUp,
  IconVideo,
  IconFileText,
  IconLink,
  IconBook,
  IconEye,
  IconTrash,
  IconPencil,
  IconCheck,
  IconFolder,
  IconClock,
} from "@tabler/icons-react";
import type { CourseFormData, Module, Lesson } from "@/pages/course-create-page";

interface CourseModulesStepProps {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export function CourseModulesStep({
  formData,
  updateFormData,
}: CourseModulesStepProps) {
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [lessonFormData, setLessonFormData] = useState<Partial<Lesson>>({});

  const handleAddModule = () => {
    if (newModuleTitle.trim()) {
      const newModule: Module = {
        id: generateId(),
        title: newModuleTitle.trim(),
        description: "",
        lessons: [],
        isExpanded: true,
      };
      updateFormData({
        modules: [...formData.modules, newModule],
      });
      setNewModuleTitle("");
    }
  };

  const handleRemoveModule = (moduleId: string) => {
    updateFormData({
      modules: formData.modules.filter((m) => m.id !== moduleId),
    });
  };

  const toggleModuleExpand = (moduleId: string) => {
    updateFormData({
      modules: formData.modules.map((m) =>
        m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
      ),
    });
  };

  const handleAddLesson = (moduleId: string) => {
    const newLesson: Lesson = {
      id: generateId(),
      title: "New Lesson",
      type: "video",
      duration: "10:00",
      content: "",
      videoUrl: "",
      isPreview: false,
    };
    updateFormData({
      modules: formData.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: [...m.lessons, newLesson], isExpanded: true }
          : m
      ),
    });
    setEditingLessonId(newLesson.id);
    setLessonFormData(newLesson);
  };

  const handleUpdateLesson = (moduleId: string, lessonId: string, data: Partial<Lesson>) => {
    updateFormData({
      modules: formData.modules.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: m.lessons.map((l) =>
                l.id === lessonId ? { ...l, ...data } : l
              ),
            }
          : m
      ),
    });
  };

  const handleRemoveLesson = (moduleId: string, lessonId: string) => {
    updateFormData({
      modules: formData.modules.map((m) =>
        m.id === moduleId
          ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
          : m
      ),
    });
  };

  const handleSaveLesson = () => {
    setEditingLessonId(null);
    setLessonFormData({});
  };

  const getLessonTypeIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "video":
        return <IconVideo className="size-4" />;
      case "article":
        return <IconFileText className="size-4" />;
      case "resource":
        return <IconLink className="size-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
          <IconFolder className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Modules & Lessons</h2>
          <p className="text-sm text-muted-foreground">
            Structure your course content into modules and lessons
          </p>
        </div>
      </div>

      {/* Add Module */}
      <div className="flex gap-2">
        <Input
          placeholder="Enter module title (e.g., Introduction to Web Development)"
          value={newModuleTitle}
          onChange={(e) => setNewModuleTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddModule();
            }
          }}
          className="h-11"
        />
        <Button onClick={handleAddModule} disabled={!newModuleTitle.trim()}>
          <IconPlus className="size-4 mr-2" />
          Add Module
        </Button>
      </div>

      {/* Modules List */}
      {formData.modules.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
          <IconFolder className="size-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-2">No modules yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Add your first module to start structuring your course
          </p>
          <p className="text-xs text-muted-foreground">
            Modules help organize your content into logical sections
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.modules.map((module, moduleIndex) => (
            <div
              key={module.id}
              className="border rounded-xl overflow-hidden bg-card shadow-sm"
            >
              {/* Module Header */}
              <div className="flex items-center gap-3 p-4 bg-muted/30 border-b">
                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                  <IconGripVertical className="size-5" />
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Module {moduleIndex + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  {editingModuleId === module.id ? (
                    <Input
                      value={module.title}
                      onChange={(e) =>
                        updateFormData({
                          modules: formData.modules.map((m) =>
                            m.id === module.id
                              ? { ...m, title: e.target.value }
                              : m
                          ),
                        })
                      }
                      className="h-8"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-medium truncate">{module.title}</h3>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs">
                    {module.lessons.length} lessons
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() =>
                      setEditingModuleId(
                        editingModuleId === module.id ? null : module.id
                      )
                    }
                  >
                    <IconPencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleModuleExpand(module.id)}
                  >
                    {module.isExpanded ? (
                      <IconChevronUp className="size-4" />
                    ) : (
                      <IconChevronDown className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveModule(module.id)}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Module Content (Lessons) */}
              {module.isExpanded && (
                <div className="p-4 space-y-3">
                  {/* Lessons List */}
                  {module.lessons.length > 0 ? (
                    <div className="space-y-2">
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="border rounded-lg overflow-hidden"
                        >
                          {editingLessonId === lesson.id ? (
                            // Edit Mode
                            <div className="p-4 bg-muted/20 space-y-4">
                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Lesson Title</Label>
                                  <Input
                                    value={lessonFormData.title || lesson.title}
                                    onChange={(e) =>
                                      setLessonFormData({
                                        ...lessonFormData,
                                        title: e.target.value,
                                      })
                                    }
                                    placeholder="Lesson title"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Lesson Type</Label>
                                  <Select
                                    value={lessonFormData.type || lesson.type}
                                    onValueChange={(value: "video" | "article" | "resource") =>
                                      setLessonFormData({ ...lessonFormData, type: value })
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="video">
                                        <div className="flex items-center gap-2">
                                          <IconVideo className="size-4" />
                                          Video
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="article">
                                        <div className="flex items-center gap-2">
                                          <IconFileText className="size-4" />
                                          Article
                                        </div>
                                      </SelectItem>
                                      <SelectItem value="resource">
                                        <div className="flex items-center gap-2">
                                          <IconLink className="size-4" />
                                          Resource
                                        </div>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              {(lessonFormData.type || lesson.type) === "video" && (
                                <div className="space-y-2">
                                  <Label>Video URL</Label>
                                  <Input
                                    value={lessonFormData.videoUrl || lesson.videoUrl}
                                    onChange={(e) =>
                                      setLessonFormData({
                                        ...lessonFormData,
                                        videoUrl: e.target.value,
                                      })
                                    }
                                    placeholder="https://youtube.com/..."
                                  />
                                </div>
                              )}

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Duration</Label>
                                  <Input
                                    value={lessonFormData.duration || lesson.duration}
                                    onChange={(e) =>
                                      setLessonFormData({
                                        ...lessonFormData,
                                        duration: e.target.value,
                                      })
                                    }
                                    placeholder="10:00"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={lessonFormData.isPreview ?? lesson.isPreview}
                                      onChange={(e) =>
                                        setLessonFormData({
                                          ...lessonFormData,
                                          isPreview: e.target.checked,
                                        })
                                      }
                                      className="rounded"
                                    />
                                    Free Preview
                                  </Label>
                                  <p className="text-xs text-muted-foreground">
                                    Allow students to preview this lesson for free
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditingLessonId(null);
                                    setLessonFormData({});
                                  }}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleUpdateLesson(
                                      module.id,
                                      lesson.id,
                                      lessonFormData
                                    );
                                    handleSaveLesson();
                                  }}
                                >
                                  <IconCheck className="size-4 mr-1" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // View Mode
                            <div className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors">
                              <div className="text-muted-foreground cursor-grab">
                                <IconGripVertical className="size-4" />
                              </div>
                              <Badge variant="outline" className="shrink-0 text-xs">
                                {lessonIndex + 1}
                              </Badge>
                              <div
                                className={`p-1.5 rounded-lg ${
                                  lesson.type === "video"
                                    ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                    : lesson.type === "article"
                                    ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                                    : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                                }`}
                              >
                                {getLessonTypeIcon(lesson.type)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <IconClock className="size-3" />
                                  <span>{lesson.duration}</span>
                                  {lesson.isPreview && (
                                    <Badge variant="secondary" className="text-xs py-0 h-4">
                                      <IconEye className="size-3 mr-1" />
                                      Preview
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7"
                                  onClick={() => {
                                    setEditingLessonId(lesson.id);
                                    setLessonFormData(lesson);
                                  }}
                                >
                                  <IconPencil className="size-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-destructive hover:text-destructive"
                                  onClick={() => handleRemoveLesson(module.id, lesson.id)}
                                >
                                  <IconTrash className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <IconBook className="size-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No lessons in this module yet</p>
                    </div>
                  )}

                  {/* Add Lesson Button */}
                  <Button
                    variant="outline"
                    className="w-full border-dashed"
                    onClick={() => handleAddLesson(module.id)}
                  >
                    <IconPlus className="size-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Quick Stats */}
      {formData.modules.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-center gap-2">
            <IconFolder className="size-4 text-primary" />
            <span>{formData.modules.length} Modules</span>
          </div>
          <div className="flex items-center gap-2">
            <IconBook className="size-4 text-blue-500" />
            <span>{formData.modules.reduce((acc, m) => acc + m.lessons.length, 0)} Lessons</span>
          </div>
          <div className="flex items-center gap-2">
            <IconEye className="size-4 text-green-500" />
            <span>{formData.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.isPreview).length, 0)} Free Previews</span>
          </div>
        </div>
      )}
    </div>
  );
}