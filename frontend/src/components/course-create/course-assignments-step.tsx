/**
 * Course Assignments Step
 * Fourth step - create and manage assignments for the course
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  IconTrash,
  IconPencil,
  IconClipboardCheck,
  IconCalendar,
  IconFile,
  IconGripVertical,
  IconChevronDown,
  IconChevronUp,
  IconScoreboard,
} from "@tabler/icons-react";
import type { CourseFormData, Assignment } from "@/pages/course-create-page";

interface CourseAssignmentsStepProps {
  formData: CourseFormData;
  updateFormData: (data: Partial<CourseFormData>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const FILE_TYPES = [
  { value: "pdf", label: "PDF" },
  { value: "doc", label: "Word Document" },
  { value: "docx", label: "Word Document (DOCX)" },
  { value: "ppt", label: "PowerPoint" },
  { value: "xls", label: "Excel" },
  { value: "zip", label: "ZIP Archive" },
  { value: "jpg", label: "Image (JPG)" },
  { value: "png", label: "Image (PNG)" },
  { value: "mp4", label: "Video (MP4)" },
  { value: "mp3", label: "Audio (MP3)" },
  { value: "txt", label: "Text File" },
  { value: "code", label: "Code File" },
];

export function CourseAssignmentsStep({
  formData,
  updateFormData,
}: CourseAssignmentsStepProps) {
  const [expandedAssignmentId, setExpandedAssignmentId] = useState<string | null>(null);
  const [editingAssignmentId, setEditingAssignmentId] = useState<string | null>(null);
  const [assignmentFormData, setAssignmentFormData] = useState<Partial<Assignment>>({});

  const handleAddAssignment = () => {
    const newAssignment: Assignment = {
      id: generateId(),
      title: "New Assignment",
      description: "",
      moduleId: formData.modules[0]?.id || null,
      dueDate: "",
      maxScore: 100,
      fileTypes: ["pdf", "doc", "docx"],
      maxFileSize: 10,
      instructions: "",
    };
    updateFormData({
      assignments: [...formData.assignments, newAssignment],
    });
    setExpandedAssignmentId(newAssignment.id);
    setEditingAssignmentId(newAssignment.id);
    setAssignmentFormData(newAssignment);
  };

  const handleUpdateAssignment = (assignmentId: string, data: Partial<Assignment>) => {
    updateFormData({
      assignments: formData.assignments.map((a) =>
        a.id === assignmentId ? { ...a, ...data } : a
      ),
    });
  };

  const handleRemoveAssignment = (assignmentId: string) => {
    updateFormData({
      assignments: formData.assignments.filter((a) => a.id !== assignmentId),
    });
  };

  const handleToggleFileType = (assignmentId: string, fileType: string) => {
    const assignment = formData.assignments.find((a) => a.id === assignmentId);
    if (assignment) {
      const newFileTypes = assignment.fileTypes.includes(fileType)
        ? assignment.fileTypes.filter((t) => t !== fileType)
        : [...assignment.fileTypes, fileType];
      handleUpdateAssignment(assignmentId, { fileTypes: newFileTypes });
    }
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-4 pb-4 border-b">
        <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
          <IconClipboardCheck className="size-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Assignments</h2>
          <p className="text-sm text-muted-foreground">
            Create practical assignments for students
          </p>
        </div>
      </div>

      {/* Add Assignment Button */}
      <Button onClick={handleAddAssignment} className="gap-2">
        <IconPlus className="size-4" />
        Create Assignment
      </Button>

      {/* Assignments List */}
      {formData.assignments.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl bg-muted/30">
          <IconClipboardCheck className="size-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="font-medium text-lg mb-2">No assignments yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create assignments to give students practical work
          </p>
          <p className="text-xs text-muted-foreground">
            Assignments help students apply what they've learned
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {formData.assignments.map((assignment, assignmentIndex) => (
            <div
              key={assignment.id}
              className="border rounded-xl overflow-hidden bg-card shadow-sm"
            >
              {/* Assignment Header */}
              <div
                className="flex items-center gap-3 p-4 bg-muted/30 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() =>
                  setExpandedAssignmentId(
                    expandedAssignmentId === assignment.id ? null : assignment.id
                  )
                }
              >
                <div className="cursor-grab text-muted-foreground hover:text-foreground">
                  <IconGripVertical className="size-5" />
                </div>
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    assignment.description
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <IconClipboardCheck className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  {editingAssignmentId === assignment.id ? (
                    <Input
                      value={assignmentFormData.title || assignment.title}
                      onChange={(e) =>
                        setAssignmentFormData({ ...assignmentFormData, title: e.target.value })
                      }
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 max-w-xs"
                      autoFocus
                    />
                  ) : (
                    <>
                      <h3 className="font-medium truncate">{assignment.title}</h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <IconScoreboard className="size-3" />
                          {assignment.maxScore} points
                        </span>
                        {assignment.dueDate && (
                          <span className="flex items-center gap-1">
                            <IconCalendar className="size-3" />
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {assignment.fileTypes.length} file types
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => {
                      setEditingAssignmentId(
                        editingAssignmentId === assignment.id ? null : assignment.id
                      );
                      setAssignmentFormData(assignment);
                    }}
                  >
                    <IconPencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="size-8">
                    {expandedAssignmentId === assignment.id ? (
                      <IconChevronUp className="size-4" />
                    ) : (
                      <IconChevronDown className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemoveAssignment(assignment.id)}
                  >
                    <IconTrash className="size-4" />
                  </Button>
                </div>
              </div>

              {/* Assignment Content */}
              {expandedAssignmentId === assignment.id && (
                <div className="p-4 space-y-4">
                  {/* Basic Settings */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Max Score</Label>
                      <Input
                        type="number"
                        value={assignment.maxScore}
                        onChange={(e) =>
                          handleUpdateAssignment(assignment.id, {
                            maxScore: parseInt(e.target.value) || 0,
                          })
                        }
                        className="h-9"
                        min={0}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Due Date</Label>
                      <Input
                        type="date"
                        value={assignment.dueDate}
                        onChange={(e) =>
                          handleUpdateAssignment(assignment.id, {
                            dueDate: e.target.value,
                          })
                        }
                        className="h-9"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-sm">Module</Label>
                      <Select
                        value={assignment.moduleId || "none"}
                        onValueChange={(value) =>
                          handleUpdateAssignment(assignment.id, {
                            moduleId: value === "none" ? null : value,
                          })
                        }
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select module" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No module</SelectItem>
                          {formData.modules.map((module) => (
                            <SelectItem key={module.id} value={module.id}>
                              {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm">Max File Size (MB)</Label>
                      <Input
                        type="number"
                        value={assignment.maxFileSize}
                        onChange={(e) =>
                          handleUpdateAssignment(assignment.id, {
                            maxFileSize: parseInt(e.target.value) || 10,
                          })
                        }
                        className="h-9"
                        min={1}
                        max={100}
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label className="text-sm">Description</Label>
                    <Textarea
                      placeholder="Describe the assignment objectives and requirements..."
                      value={assignment.description}
                      onChange={(e) =>
                        handleUpdateAssignment(assignment.id, {
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="space-y-2">
                    <Label className="text-sm">Detailed Instructions</Label>
                    <Textarea
                      placeholder="Provide step-by-step instructions for students..."
                      value={assignment.instructions}
                      onChange={(e) =>
                        handleUpdateAssignment(assignment.id, {
                          instructions: e.target.value,
                        })
                      }
                      rows={5}
                      className="resize-none"
                    />
                  </div>

                  {/* Allowed File Types */}
                  <div className="space-y-3">
                    <Label className="text-sm">Allowed File Types</Label>
                    <div className="flex flex-wrap gap-2">
                      {FILE_TYPES.map((fileType) => (
                        <Badge
                          key={fileType.value}
                          variant={
                            assignment.fileTypes.includes(fileType.value)
                              ? "default"
                              : "outline"
                          }
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() =>
                            handleToggleFileType(assignment.id, fileType.value)
                          }
                        >
                          <IconFile className="size-3 mr-1" />
                          {fileType.label}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click on file types to allow or disallow them
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {formData.assignments.length > 0 && (
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 text-sm">
          <div className="flex items-center gap-2">
            <IconClipboardCheck className="size-4 text-green-500" />
            <span>{formData.assignments.length} Assignments</span>
          </div>
          <div className="flex items-center gap-2">
            <IconScoreboard className="size-4 text-blue-500" />
            <span>
              {formData.assignments.reduce((acc, a) => acc + a.maxScore, 0)} Total Points
            </span>
          </div>
        </div>
      )}
    </div>
  );
}