/**
 * Course Settings Step
 * Final step - pricing, certificates, and publishing options
 */

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    IconSettings,
    IconCertificate,
    IconUsers,
    IconClock,
    IconEye,
    IconCheck,
    IconAlertCircle
} from "@tabler/icons-react";
import type { CourseFormData } from "@/pages/course-create-page";

interface CourseSettingsStepProps {
    formData: CourseFormData;
    updateFormData: (data: Partial<CourseFormData>) => void;
}

const DURATIONS = [
    { value: "1-2-weeks", label: "1-2 Weeks", description: "Short course" },
    { value: "3-4-weeks", label: "3-4 Weeks", description: "Medium course" },
    { value: "1-2-months", label: "1-2 Months", description: "Standard course" },
    { value: "3-6-months", label: "3-6 Months", description: "Comprehensive course" },
    { value: "self-paced", label: "Self-Paced", description: "No time limit" },
];

export function CourseSettingsStep({
    formData,
    updateFormData,
}: CourseSettingsStepProps) {

    const completionScore = calculateCompletionScore(formData);

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <div className="flex items-center gap-4 pb-4 border-b">
                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-violet-500 flex items-center justify-center shadow-lg">
                    <IconSettings className="size-6 text-white" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Settings & Publishing</h2>
                    <p className="text-sm text-muted-foreground">
                        Set pricing, certificates, and publishing options
                    </p>
                </div>
            </div>

            {/* Course Completion Status */}
            <div className={`p-4 rounded-xl ${completionScore === 100 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'}`}>
                <div className="flex items-start gap-3">
                    {completionScore === 100 ? (
                        <IconCheck className="size-5 text-green-600 dark:text-green-400 mt-0.5" />
                    ) : (
                        <IconAlertCircle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    )}
                    <div>
                        <h3 className={`font-medium ${completionScore === 100 ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
                            {completionScore === 100 ? 'Course Ready to Publish!' : 'Course Incomplete'}
                        </h3>
                        <p className={`text-sm mt-1 ${completionScore === 100 ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {completionScore === 100
                                ? 'All required sections are complete. You can publish your course.'
                                : `Complete the remaining sections before publishing (${completionScore}% complete)`}
                        </p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* Course Duration */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <IconClock className="size-5 text-primary" />
                    <h3 className="font-semibold">Course Duration</h3>
                </div>

                <Select
                    value={formData.duration}
                    onValueChange={(value) => updateFormData({ duration: value })}
                >
                    <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select expected course duration" />
                    </SelectTrigger>
                    <SelectContent>
                        {DURATIONS.map((duration) => (
                            <SelectItem key={duration.value} value={duration.value}>
                                <div className="flex items-center gap-2">
                                    <span>{duration.label}</span>
                                    <span className="text-muted-foreground">({duration.description})</span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Separator />

            {/* Certificate Options */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <IconCertificate className="size-5 text-primary" />
                    <h3 className="font-semibold">Certificate</h3>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                    <div>
                        <p className="font-medium">Completion Certificate</p>
                        <p className="text-sm text-muted-foreground">
                            Issue certificates to students who complete the course
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => updateFormData({ hasCertificate: !formData.hasCertificate })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hasCertificate ? "bg-primary" : "bg-muted-foreground/30"
                            }`}
                    >
                        <span
                            className={`inline-block size-4 transform rounded-full bg-white transition-transform ${formData.hasCertificate ? "translate-x-6" : "translate-x-1"
                                }`}
                        />
                    </button>
                </div>
            </div>

            <Separator />

            {/* Student Limits */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <IconUsers className="size-5 text-primary" />
                    <h3 className="font-semibold">Student Enrollment</h3>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Limit Enrollments</p>
                            <p className="text-sm text-muted-foreground">
                                Set a maximum number of students
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                updateFormData({
                                    maxStudents: formData.maxStudents === null ? 100 : null,
                                })
                            }
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.maxStudents !== null ? "bg-primary" : "bg-muted-foreground/30"
                                }`}
                        >
                            <span
                                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${formData.maxStudents !== null ? "translate-x-6" : "translate-x-1"
                                    }`}
                            />
                        </button>
                    </div>

                    {formData.maxStudents !== null && (
                        <div className="space-y-2">
                            <Label>Maximum Students</Label>
                            <Input
                                type="number"
                                value={formData.maxStudents}
                                onChange={(e) =>
                                    updateFormData({ maxStudents: parseInt(e.target.value) || 0 })
                                }
                                placeholder="100"
                                className="h-11"
                                min={1}
                            />
                        </div>
                    )}
                </div>
            </div>

            <Separator />

            {/* Publish Preview */}
            <div className="space-y-4">
                <div className="flex items-center gap-2">
                    <IconEye className="size-5 text-primary" />
                    <h3 className="font-semibold">Course Preview</h3>
                </div>

                <div className="p-4 rounded-lg border bg-muted/30">
                    <div className="grid gap-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Title</span>
                            <span className="font-medium">{formData.title || "Not set"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Category</span>
                            <span className="font-medium capitalize">
                                {formData.category?.replace(/-/g, " ") || "Not set"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Level</span>
                            <span className="font-medium capitalize">
                                {formData.level || "Not set"}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Modules</span>
                            <span className="font-medium">{formData.modules.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Lessons</span>
                            <span className="font-medium">
                                {formData.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Quizzes</span>
                            <span className="font-medium">{formData.quizzes.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Assignments</span>
                            <span className="font-medium">{formData.assignments.length}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Certificate</span>
                            <span className="font-medium">
                                {formData.hasCertificate ? (
                                    <Badge variant="default" className="bg-green-500">
                                        <IconCheck className="size-3 mr-1" />
                                        Included
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Not included</Badge>
                                )}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper function to calculate completion score
function calculateCompletionScore(formData: CourseFormData): number {
    let score = 0;
    const weights = {
        title: 10,
        description: 10,
        category: 10,
        level: 10,
        modules: 20,
        lessons: 20,
        pricing: 10,
        duration: 10,
    };

    if (formData.title) score += weights.title;
    if (formData.description && formData.description.length >= 50) score += weights.description;
    if (formData.category) score += weights.category;
    if (formData.level) score += weights.level;
    if (formData.modules.length > 0) score += weights.modules;
    if (formData.modules.some((m) => m.lessons.length > 0)) score += weights.lessons;
    if (formData.duration) score += weights.duration;

    return score;
}