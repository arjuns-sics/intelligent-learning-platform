/**
 * Course Create Page
 * Multi-step course creation wizard for instructors
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Separator } from "@/components/ui/separator";
import {
  IconBook,
  IconArrowLeft,
  IconArrowRight,
  IconCloudUpload,
  IconPhoto,
  IconVideo,
  IconFileText,
  IconPlus,
  IconTrash,
  IconGripVertical,
  IconCheck,
  IconCircleCheck,
  IconLoader2,
  IconEye,
  IconPencil,
  IconList,
  IconQuestionMark,
  IconClipboardCheck,
  IconSettings,
  IconCoin,
  IconClock,
  IconUsers,
  IconSparkles,
} from "@tabler/icons-react";
import { CourseDetailsStep } from "@/components/course-create/course-details-step";
import { CourseModulesStep } from "@/components/course-create/course-modules-step";
import { CourseQuizzesStep } from "@/components/course-create/course-quizzes-step";
import { CourseAssignmentsStep } from "@/components/course-create/course-assignments-step";
import { CourseSettingsStep } from "@/components/course-create/course-settings-step";

const STEPS = [
  { id: 1, title: "Course Details", description: "Basic information", icon: IconBook },
  { id: 2, title: "Modules & Lessons", description: "Course structure", icon: IconList },
  { id: 3, title: "Quizzes", description: "Assessments", icon: IconQuestionMark },
  { id: 4, title: "Assignments", description: "Practical work", icon: IconClipboardCheck },
  { id: 5, title: "Settings", description: "Pricing & publish", icon: IconSettings },
];

export interface CourseFormData {
  // Step 1: Details
  title: string;
  subtitle: string;
  description: string;
  category: string;
  level: string;
  language: string;
  thumbnail: string | null;
  prerequisites: string[];
  learningObjectives: string[];
  
  // Step 2: Modules
  modules: Module[];
  
  // Step 3: Quizzes
  quizzes: Quiz[];
  
  // Step 4: Assignments
  assignments: Assignment[];
  
  // Step 5: Settings
  price: number;
  discountPrice: number | null;
  isFree: boolean;
  hasCertificate: boolean;
  duration: string;
  maxStudents: number | null;
  published: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

export interface Lesson {
  id: string;
  title: string;
  type: "video" | "article" | "resource";
  duration: string;
  content: string;
  videoUrl: string;
  isPreview: boolean;
}

export interface Quiz {
  id: string;
  title: string;
  moduleId: string | null;
  timeLimit: number;
  passingScore: number;
  questions: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: "multiple-choice" | "true-false" | "short-answer";
  options: string[];
  correctAnswer: string | number;
  points: number;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  moduleId: string | null;
  dueDate: string;
  maxScore: number;
  fileTypes: string[];
  maxFileSize: number;
  instructions: string;
}

const initialFormData: CourseFormData = {
  title: "",
  subtitle: "",
  description: "",
  category: "",
  level: "",
  language: "English",
  thumbnail: null,
  prerequisites: [],
  learningObjectives: [],
  modules: [],
  quizzes: [],
  assignments: [],
  price: 0,
  discountPrice: null,
  isFree: true,
  hasCertificate: true,
  duration: "",
  maxStudents: null,
  published: false,
};

export function CourseCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<CourseFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  const updateFormData = (data: Partial<CourseFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    navigate("/dashboard");
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    navigate("/dashboard");
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CourseDetailsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 2:
        return (
          <CourseModulesStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 3:
        return (
          <CourseQuizzesStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 4:
        return (
          <CourseAssignmentsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 5:
        return (
          <CourseSettingsStep
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl">
        <div className="container max-w-7xl py-4 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="gap-2"
              >
                <IconArrowLeft className="size-4" />
                Back
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold">Create New Course</h1>
                <p className="text-sm text-muted-foreground">
                  {formData.title || "Untitled Course"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <IconLoader2 className="size-4 mr-2 animate-spin" />
                ) : null}
                Save Draft
              </Button>
              {currentStep === STEPS.length && (
                <Button onClick={handlePublish} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <IconLoader2 className="size-4 mr-2 animate-spin" />
                  ) : (
                    <IconSparkles className="size-4 mr-2" />
                  )}
                  Publish Course
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl py-8 px-4 md:px-6">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-3 group ${
                    currentStep === step.id
                      ? "text-primary"
                      : currentStep > step.id
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                      currentStep === step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-muted-foreground/30 bg-background group-hover:border-muted-foreground/50"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <IconCheck className="size-5" />
                    ) : (
                      <step.icon className="size-5" />
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </button>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id
                        ? "bg-primary"
                        : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-1" />
        </div>

        {/* Step Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                {renderStepContent()}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Completion Status */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  
                  <div className="pt-4 space-y-2">
                    {STEPS.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        {currentStep > step.id ? (
                          <IconCircleCheck className="size-4 text-primary" />
                        ) : currentStep === step.id ? (
                          <IconPencil className="size-4 text-amber-500" />
                        ) : (
                          <IconCircleCheck className="size-4 text-muted-foreground/30" />
                        )}
                        <span
                          className={
                            currentStep >= step.id ? "" : "text-muted-foreground"
                          }
                        >
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconSparkles className="size-4 text-primary" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {currentStep === 1 && (
                    <>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Use a descriptive title that clearly communicates the course value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Add a compelling thumbnail to attract students</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Set clear learning objectives for better engagement</span>
                      </li>
                    </>
                  )}
                  {currentStep === 2 && (
                    <>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Structure modules in logical learning order</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Keep lessons focused on single concepts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Mark preview lessons to attract enrollments</span>
                      </li>
                    </>
                  )}
                  {currentStep === 3 && (
                    <>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Add quizzes at the end of each module</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Keep questions clear and concise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Set reasonable time limits for better completion rates</span>
                      </li>
                    </>
                  )}
                  {currentStep === 4 && (
                    <>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Provide detailed assignment instructions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Set realistic deadlines for submissions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Include grading rubrics for transparency</span>
                      </li>
                    </>
                  )}
                  {currentStep === 5 && (
                    <>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Price your course competitively</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Enable certificates for higher perceived value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                        <span>Review all content before publishing</span>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-primary">
                      {formData.modules.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Modules</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-blue-500">
                      {formData.modules.reduce(
                        (acc, m) => acc + m.lessons.length,
                        0
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">Lessons</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-amber-500">
                      {formData.quizzes.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Quizzes</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl font-bold text-green-500">
                      {formData.assignments.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Assignments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <IconArrowLeft className="size-4" />
            Previous
          </Button>
          {currentStep < STEPS.length ? (
            <Button onClick={handleNext} className="gap-2">
              Continue
              <IconArrowRight className="size-4" />
            </Button>
          ) : (
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleSaveDraft}>
                Save Draft
              </Button>
              <Button onClick={handlePublish} className="gap-2">
                <IconSparkles className="size-4" />
                Publish Course
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}