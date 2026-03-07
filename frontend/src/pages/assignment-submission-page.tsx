/**
 * Assignment Submission Page
 * Student interface for submitting assignments
 */

import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  IconArrowLeft,
  IconUpload,
  IconLink,
  IconAlertCircle,
  IconLoader2,
  IconClock,
  IconAward,
} from "@tabler/icons-react";
import { useMyEnrollments, useSubmitAssignment } from "@/hooks";
import { toast } from "sonner";

interface Assignment {
  _id?: string;
  title: string;
  description: string;
  instructions: string;
  dueDate?: string;
  maxScore?: number;
  fileTypes?: string[];
  maxFileSize?: number;
}

interface Module {
  id?: string;
  title: string;
  assignments?: Assignment[];
}

interface Course {
  _id: string;
  title: string;
  modules: Module[];
}

interface Enrollment {
  _id: string;
  course: Course;
  progress: number;
  status: "active" | "completed" | "dropped";
}

export function AssignmentSubmissionPage() {
  const { courseId, assignmentId } = useParams<{ courseId: string; assignmentId: string }>();
  const navigate = useNavigate();

  // Fetch enrollments
  const { data: enrollmentsData } = useMyEnrollments({ limit: 100 });
  const enrollment = enrollmentsData?.enrollments?.find(
    (e) => e.course._id === courseId
  ) as Enrollment | undefined;

  // Assignment mutation
  const submitAssignmentMutation = useSubmitAssignment();

  // Find the assignment
  const course = enrollment?.course;
  const allAssignments = course?.modules.flatMap((m) => m.assignments || []) || [];
  const assignment = allAssignments.find((a) => a._id === assignmentId || a.title === assignmentId);

  // Form state
  const [submissionText, setSubmissionText] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if assignment is overdue
  const isOverdue = assignment?.dueDate ? new Date() > new Date(assignment.dueDate) : false;
  const daysUntilDue = assignment?.dueDate
    ? Math.ceil((new Date(assignment.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  // Handle link change
  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  // Add link field
  const addLink = () => {
    setLinks([...links, ""]);
  };

  // Remove link field
  const removeLink = (index: number) => {
    const newLinks = links.filter((_, i) => i !== index);
    setLinks(newLinks.length > 0 ? newLinks : [""]);
  };

  // Submit assignment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!assignment || !enrollment) return;

    if (!submissionText.trim() && links.every((l) => !l.trim())) {
      toast.error("Please provide a submission text or at least one link");
      return;
    }

    try {
      setIsSubmitting(true);

      await submitAssignmentMutation.mutateAsync({
        courseId: courseId!,
        enrollmentId: enrollment._id,
        assignmentId: assignment._id || assignmentId!,
        submission: {
          text: submissionText,
          links: links.filter((l) => l.trim()),
        },
        files: [],
      });

      toast.success("Assignment submitted successfully!");
      navigate(`/learn/${courseId}`);
    } catch (error) {
      console.error("Failed to submit assignment:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to submit assignment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (!enrollment || !course || !assignment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading assignment...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container max-w-5xl px-4 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(`/learn/${courseId}`)}>
              <IconArrowLeft className="size-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm">{assignment.title}</h1>
              <p className="text-xs text-muted-foreground">{course.title}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Assignment Details */}
          <div className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Assignment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div className="flex items-center gap-2 mt-1">
                    <IconClock className="size-4" />
                    <span className={isOverdue ? "text-red-500" : "text-foreground"}>
                      {assignment.dueDate
                        ? new Date(assignment.dueDate).toLocaleDateString()
                        : "No deadline"}
                    </span>
                  </div>
                  {daysUntilDue !== null && !isOverdue && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {daysUntilDue === 0
                        ? "Due today"
                        : daysUntilDue === 1
                        ? "Due tomorrow"
                        : `Due in ${daysUntilDue} days`}
                    </div>
                  )}
                  {isOverdue && (
                    <div className="text-xs text-red-500 mt-1">
                      This assignment is overdue
                    </div>
                  )}
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Max Score</div>
                  <div className="flex items-center gap-2 mt-1">
                    <IconAward className="size-4" />
                    <span>{assignment.maxScore || 100} points</span>
                  </div>
                </div>

                {assignment.fileTypes && assignment.fileTypes.length > 0 && (
                  <div>
                    <div className="text-sm text-muted-foreground">Accepted Files</div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {assignment.fileTypes.map((type) => (
                        <Badge key={type} variant="secondary" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {isOverdue && (
              <Alert variant="destructive">
                <IconAlertCircle className="size-4" />
                <AlertDescription>
                  This assignment is past the due date. You can still submit, but it may be marked as late.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Submission Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
                <CardDescription>
                  Provide your solution to the assignment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Instructions */}
                  {assignment.instructions && (
                    <div className="p-4 rounded-lg bg-muted/50">
                      <h4 className="font-medium text-sm mb-2">Instructions</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {assignment.instructions}
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {assignment.description && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {assignment.description}
                      </p>
                    </div>
                  )}

                  {/* Submission Text */}
                  <div className="space-y-2">
                    <Label htmlFor="submission">Your Solution</Label>
                    <Textarea
                      id="submission"
                      placeholder="Describe your approach, explain your solution, or provide any other relevant information..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      rows={8}
                      className="resize-none"
                    />
                  </div>

                  {/* Links */}
                  <div className="space-y-2">
                    <Label>Repository or Demo Links (optional)</Label>
                    <div className="space-y-2">
                      {links.map((link, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            placeholder="https://github.com/your-repo or https://your-demo.com"
                            value={link}
                            onChange={(e) => handleLinkChange(index, e.target.value)}
                            className="flex-1"
                          />
                          {links.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => removeLink(index)}
                            >
                              <IconLink className="size-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addLink}
                      className="mt-2"
                    >
                      <IconLink className="size-3 mr-2" />
                      Add Link
                    </Button>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/learn/${courseId}`)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || submitAssignmentMutation.isPending}
                      className="flex-1"
                    >
                      {isSubmitting || submitAssignmentMutation.isPending ? (
                        <>
                          <IconLoader2 className="size-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <IconUpload className="size-4 mr-2" />
                          Submit Assignment
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
