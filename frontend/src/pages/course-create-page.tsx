/**
 * Course Create Page
 * Multi-step course creation wizard for instructors
 */

import { useState, useCallback, useMemo, useReducer, useEffect } from "react";
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
  IconCheck,
  IconCircleCheck,
  IconLoader2,
  IconPencil,
  IconList,
  IconQuestionMark,
  IconClipboardCheck,
  IconSettings,
  IconSparkles,
} from "@tabler/icons-react";
import { CourseDetailsStep } from "@/components/course-create/course-details-step";
import { CourseModulesStep } from "@/components/course-create/course-modules-step.tsx";
import { CourseQuizzesStep } from "@/components/course-create/course-quizzes-step.tsx";
import { CourseAssignmentsStep } from "@/components/course-create/course-assignments-step.tsx";
import { CourseSettingsStep } from "@/components/course-create/course-settings-step.tsx";

// Constants
const STEPS = [
  { id: 1, title: "Course Details", description: "Basic information", icon: IconBook },
  { id: 2, title: "Modules & Lessons", description: "Course structure", icon: IconList },
  { id: 3, title: "Quizzes", description: "Assessments", icon: IconQuestionMark },
  { id: 4, title: "Assignments", description: "Practical work", icon: IconClipboardCheck },
  { id: 5, title: "Settings", description: "Pricing & publish", icon: IconSettings },
] as const;

const API_TIMEOUTS = {
  SAVE_DRAFT: 1500,
  PUBLISH: 2000,
} as const;

const STORAGE_KEY = "course-create-draft";

// Pro Tips Data - Data-driven approach for composition patterns
const PRO_TIPS: Record<number, Array<{ text: string }>> = {
  1: [
    { text: "Use a descriptive title that clearly communicates the course value" },
    { text: "Add a compelling thumbnail to attract students" },
    { text: "Set clear learning objectives for better engagement" },
  ],
  2: [
    { text: "Structure modules in logical learning order" },
    { text: "Keep lessons focused on single concepts" },
    { text: "Mark preview lessons to attract enrollments" },
  ],
  3: [
    { text: "Add quizzes at the end of each module" },
    { text: "Keep questions clear and concise" },
    { text: "Set reasonable time limits for better completion rates" },
  ],
  4: [
    { text: "Provide detailed assignment instructions" },
    { text: "Set realistic deadlines for submissions" },
    { text: "Include grading rubrics for transparency" },
  ],
  5: [
    { text: "Enable certificates for higher perceived value" },
    { text: "Review all content before publishing" },
  ],
};

// Types
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

// Initial State
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
  hasCertificate: true,
  duration: "",
  maxStudents: null,
  published: false,
};

// Form Reducer - recommended pattern for complex form state
type FormAction =
  | { type: "UPDATE_FIELD"; field: keyof CourseFormData; value: CourseFormData[keyof CourseFormData] }
  | { type: "UPDATE_MULTIPLE"; data: Partial<CourseFormData> }
  | { type: "RESET_FORM" }
  | { type: "LOAD_DRAFT"; data: CourseFormData };

function formReducer(state: CourseFormData, action: FormAction): CourseFormData {
  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "UPDATE_MULTIPLE":
      return { ...state, ...action.data };
    case "RESET_FORM":
      return initialFormData;
    case "LOAD_DRAFT":
      return action.data;
    default:
      return state;
  }
}

// Validation function
interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

function validateStep(stepId: number, formData: CourseFormData): ValidationResult {
  const errors: string[] = [];

  switch (stepId) {
    case 1:
      if (!formData.title.trim()) errors.push("Course title is required");
      if (!formData.description.trim() || formData.description.length < 50) {
        errors.push("Description must be at least 50 characters");
      }
      if (!formData.category) errors.push("Category is required");
      if (!formData.level) errors.push("Level is required");
      break;
    case 2:
      if (formData.modules.length === 0) {
        errors.push("At least one module is required");
      } else if (!formData.modules.some(m => m.lessons.length > 0)) {
        errors.push("At least one lesson is required");
      }
      break;
    case 3:
      // Quizzes are optional, no validation required
      break;
    case 4:
      // Assignments are optional, no validation required
      break;
    case 5:
      if (!formData.duration) errors.push("Course duration is required");
      break;
  }

  return { isValid: errors.length === 0, errors };
}

export function CourseCreatePage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, dispatch] = useReducer(formReducer, initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load draft from localStorage on mount
  useEffect(() => {
    try {
      const savedDraft = localStorage.getItem(STORAGE_KEY);
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft) as CourseFormData;
        dispatch({ type: "LOAD_DRAFT", data: parsedDraft });
      }
    } catch (error) {
      console.error("Failed to load draft:", error);
    }
  }, []);

  // Auto-save draft to localStorage
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
      } catch (error) {
        console.error("Failed to save draft:", error);
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Memoized computed values - performance optimization
  const progress = useMemo(() =>
    ((currentStep - 1) / (STEPS.length - 1)) * 100,
    [currentStep]
  );

  const totalLessons = useMemo(() =>
    formData.modules.reduce((acc, m) => acc + m.lessons.length, 0),
    [formData.modules]
  );

  // const totalQuestions = useMemo(() =>
  //   formData.quizzes.reduce((acc, q) => acc + q.questions.length, 0),
  //   [formData.quizzes]
  // );

  const currentStepTips = useMemo(() =>
    PRO_TIPS[currentStep] || [],
    [currentStep]
  );

  // Memoized handlers - prevent unnecessary re-renders
  const updateFormData = useCallback((data: Partial<CourseFormData>) => {
    dispatch({ type: "UPDATE_MULTIPLE", data });
    setValidationErrors([]);
  }, []);

  const handleNext = useCallback(() => {
    const validation = validateStep(currentStep, formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, formData]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      setValidationErrors([]);
    }
  }, [currentStep]);

  const handleStepClick = useCallback((stepId: number) => {
    // Allow going back to any previous step without validation
    if (stepId < currentStep) {
      setCurrentStep(stepId);
      setValidationErrors([]);
    }
    // For forward navigation, validate current step first
    if (stepId > currentStep) {
      const validation = validateStep(currentStep, formData);
      if (validation.isValid) {
        setCurrentStep(stepId);
      } else {
        setValidationErrors(validation.errors);
      }
    }
  }, [currentStep, formData]);

  const handleSaveDraft = useCallback(async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call with constant
      await new Promise((resolve) => setTimeout(resolve, API_TIMEOUTS.SAVE_DRAFT));
      localStorage.removeItem(STORAGE_KEY); // Clear saved draft after successful save
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to save draft:", error);
      // In production, show error toast to user
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate]);

  const handlePublish = useCallback(async () => {
    // Validate all steps before publishing
    const allErrors: string[] = [];
    STEPS.forEach((step) => {
      const result = validateStep(step.id, formData);
      allErrors.push(...result.errors);
    });

    if (allErrors.length > 0) {
      setValidationErrors(allErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call with constant
      await new Promise((resolve) => setTimeout(resolve, API_TIMEOUTS.PUBLISH));
      localStorage.removeItem(STORAGE_KEY);
      dispatch({ type: "RESET_FORM" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to publish course:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [navigate, formData]);

  // Render step content based on current step
  const renderStepContent = useCallback(() => {
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
  }, [currentStep, formData, updateFormData]);

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
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
        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <ul className="list-disc list-inside text-sm text-destructive">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => handleStepClick(step.id)}
                  className={`flex items-center gap-3 group ${currentStep === step.id
                    ? "text-primary"
                    : currentStep > step.id
                      ? "text-primary"
                      : "text-muted-foreground"
                    }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${currentStep === step.id
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
                    className={`flex-1 h-0.5 mx-4 ${currentStep > step.id
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

            {/* Tips Card - Data-driven approach */}
            <Card className="border-0 shadow-lg bg-linear-to-br from-primary/5 to-primary/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <IconSparkles className="size-4 text-primary" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {currentStepTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <IconCheck className="size-4 text-primary mt-0.5 shrink-0" />
                      <span>{tip.text}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Quick Stats - Memoized */}
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
                      {totalLessons}
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