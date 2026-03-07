/**
 * Course Learning Player Page
 * Main learning interface where students consume course content
 * Features: Video/content player, curriculum sidebar, progress tracking, navigation
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import {
  IconArrowLeft,
  IconArrowRight,
  IconBook,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconClock,
  IconFileText,
  IconPlayerPlay,
  IconRefresh,
  IconFile,
  IconDownload,
  IconExternalLink,
  IconAward,
  IconTrophy,
  IconFlame,
  IconAlertCircle,
  IconQuestionMark,
  IconClipboardCheck,
} from "@tabler/icons-react";
import { useMyEnrollments, useUpdateProgress } from "@/hooks";
import { cn } from "@/lib/utils";

// Helper function to get YouTube embed URL
const getYouTubeEmbedUrl = (url: string): string => {
  if (!url) return "";
  
  // Check if already an embed URL
  if (url.includes("youtube.com/embed/")) {
    return url;
  }
  
  // Extract video ID from various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/ // Just the video ID
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`;
    }
  }
  
  return url;
};

// Helper function to get lesson unique identifier
const getLessonId = (lesson: Lesson, index: number): string => {
  return lesson.id || `lesson-${index}`;
};

// Types
interface Lesson {
  id?: string;
  title: string;
  type: "video" | "article" | "resource";
  duration?: string;
  content?: string;
  videoUrl?: string;
  order?: number;
}

interface Module {
  id?: string;
  title: string;
  description?: string;
  lessons: Lesson[];
  order?: number;
  quizzes?: Quiz[];
  assignments?: Assignment[];
}

interface Quiz {
  _id?: string;
  title: string;
  description?: string;
  questions?: Array<{
    question: string;
    options: string[];
    correctAnswer: number;
  }>;
  passingScore?: number;
  timeLimit?: number;
}

interface Assignment {
  _id?: string;
  title: string;
  description?: string;
  instructions?: string;
  dueDate?: string;
  maxScore?: number;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  modules: Module[];
  hasCertificate?: boolean;
}

interface Enrollment {
  _id: string;
  course: Course;
  progress: number;
  status: "active" | "completed" | "dropped";
  completedLessons: string[];
  completedModules: string[];
  lastAccessedAt: string;
}

export function CourseLearnPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const navigate = useNavigate();

  // Fetch enrollments with refetch on mount
  const { data: enrollmentsData, isLoading, error, refetch } = useMyEnrollments({ limit: 100 });
  const updateProgressMutation = useUpdateProgress();

  // Find the enrollment for this course
  const enrollment = enrollmentsData?.enrollments?.find(
    (e) => e.course._id === courseId
  );

  const course = enrollment?.course;
  const modules = course?.modules || [];

  // Simple debug - log on every render
  console.log("=== COURSE LEARN PAGE RENDER ===", {
    hasEnrollmentData: !!enrollmentsData,
    enrollmentCount: enrollmentsData?.enrollments?.length,
    foundEnrollment: !!enrollment,
    courseTitle: course?.title,
    hasQuizzes: !!(course as any)?.quizzes,
    quizzesCount: (course as any)?.quizzes?.length,
    modulesCount: modules.length,
  });

  // Distribute course-level quizzes to their respective modules based on moduleId
  const getProcessedModules = () => {
    const courseQuizzes = (course as any)?.quizzes || [];
    const courseAssignments = (course as any)?.assignments || [];
    
    console.log("Processing modules with quizzes:", {
      modulesCount: modules.length,
      courseQuizzesCount: courseQuizzes.length,
      courseAssignmentsCount: courseAssignments.length,
      modules: modules.map(m => ({ id: m.id, _id: m._id, title: m.title })),
      quizzes: courseQuizzes.map(q => ({ title: q.title, moduleId: q.moduleId })),
    });
    
    // Create a map of moduleId to quizzes/assignments
    const quizzesByModule = {};
    const assignmentsByModule = {};
    
    // Distribute quizzes to their modules
    courseQuizzes.forEach((quiz) => {
      const moduleId = quiz.moduleId;
      console.log("Processing quiz:", quiz.title, "moduleId:", moduleId);
      if (moduleId) {
        if (!quizzesByModule[moduleId]) {
          quizzesByModule[moduleId] = [];
        }
        quizzesByModule[moduleId].push(quiz);
      }
    });
    
    // Distribute assignments to their modules
    courseAssignments.forEach((assignment) => {
      const moduleId = assignment.moduleId;
      if (moduleId) {
        if (!assignmentsByModule[moduleId]) {
          assignmentsByModule[moduleId] = [];
        }
        assignmentsByModule[moduleId].push(assignment);
      }
    });
    
    console.log("Quizzes by module:", quizzesByModule);
    
    // Map modules with their quizzes and assignments
    return modules.map((module, moduleIndex) => {
      // Try multiple ID fields since modules might have id, _id, or neither
      const moduleId = module.id || module._id;
      const moduleIds = [module.id, module._id].filter(Boolean);
      
      console.log("Processing module:", module.title, "moduleId:", moduleId, "allIds:", moduleIds, "index:", moduleIndex);
      
      // Find quizzes that match any of the module's IDs
      let moduleQuizzes = module.quizzes || [];
      let moduleAssignments = module.assignments || [];
      
      // If no quizzes in module, check if any course-level quizzes match this module
      if (moduleQuizzes.length === 0 && courseQuizzes.length > 0) {
        // First try to match by moduleId
        if (moduleIds.length > 0) {
          moduleQuizzes = courseQuizzes.filter(q => {
            const quizModuleId = q.moduleId;
            const matches = moduleIds.includes(quizModuleId);
            if (matches) {
              console.log("✓ Matched quiz by ID:", q.title, "->", module.title);
            }
            return matches;
          });
        }
        
        // Fallback: If still no quizzes and this is the first module, assign quizzes that don't have a matching module
        if (moduleQuizzes.length === 0 && moduleIndex === 0) {
          // Find quizzes whose moduleId doesn't match any module
          const allModuleIds = modules.flatMap(m => [m.id, m._id].filter(Boolean));
          const unmatchedQuizzes = courseQuizzes.filter(q => {
            const hasMatch = allModuleIds.includes(q.moduleId);
            return !hasMatch;
          });
          if (unmatchedQuizzes.length > 0) {
            console.log("✓ Assigning unmatched quizzes to first module:", unmatchedQuizzes.map(q => q.title));
            moduleQuizzes = unmatchedQuizzes;
          }
        }
      }
      
      // If no assignments in module, apply same logic
      if (moduleAssignments.length === 0 && courseAssignments.length > 0) {
        if (moduleIds.length > 0) {
          moduleAssignments = courseAssignments.filter(a => moduleIds.includes(a.moduleId));
        }
        if (moduleAssignments.length === 0 && moduleIndex === 0) {
          const allModuleIds = modules.flatMap(m => [m.id, m._id].filter(Boolean));
          const unmatchedAssignments = courseAssignments.filter(a => !allModuleIds.includes(a.moduleId));
          moduleAssignments = unmatchedAssignments;
        }
      }
      
      console.log("Module result:", module.title, "quizzes:", moduleQuizzes.length, "assignments:", moduleAssignments.length);
      
      return {
        ...module,
        quizzes: moduleQuizzes,
        assignments: moduleAssignments,
      };
    });
  };
  
  const processedModules = course ? getProcessedModules() : [];

  // Debug logging
  useEffect(() => {
    console.log("Course Learn Page Debug:", {
      courseId,
      lessonId,
      hasEnrollments: !!enrollmentsData?.enrollments,
      enrollmentsCount: enrollmentsData?.enrollments?.length,
      foundEnrollment: !!enrollment,
      courseTitle: course?.title,
      modulesCount: processedModules.length,
      allLessonsCount: processedModules.flatMap((m) => m.lessons).length,
      modulesWithQuizzes: processedModules.filter(m => m.quizzes && m.quizzes.length > 0).length,
      modulesWithAssignments: processedModules.filter(m => m.assignments && m.assignments.length > 0).length,
      courseLevelQuizzes: (course as any)?.quizzes?.length || 0,
      courseLevelAssignments: (course as any)?.assignments?.length || 0,
      allModules: processedModules.map(m => ({
        moduleId: m.id || m._id,
        title: m.title,
        lessonsCount: m.lessons?.length || 0,
        quizzesCount: m.quizzes?.length || 0,
        assignmentsCount: m.assignments?.length || 0,
        quizTitles: m.quizzes?.map(q => q.title) || [],
        assignmentTitles: m.assignments?.map(a => a.title) || [],
      })),
      rawCourse: course ? {
        hasQuizzes: !!(course as any)?.quizzes,
        hasAssignments: !!(course as any)?.assignments,
        modulesCount: course.modules?.length,
      } : null,
    });
  }, [courseId, lessonId, enrollmentsData, enrollment, course, processedModules]);

  // Redirect to first lesson if no lessonId
  useEffect(() => {
    if (course && processedModules.length > 0 && !lessonId) {
      const firstLessonIndex = 0;
      navigate(`/learn/${courseId}/${firstLessonIndex}`, { replace: true });
    }
  }, [course, processedModules.length, lessonId, courseId, navigate]);

  // Flatten all lessons for navigation
  const allLessons = processedModules.flatMap((module) => module.lessons);
  const currentLessonIndex = allLessons.findIndex((l, idx) => `${idx}` === lessonId);
  const currentLesson = currentLessonIndex >= 0 ? allLessons[currentLessonIndex] : (allLessons.length > 0 ? allLessons[0] : null);

  // State
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Calculate course progress
  const totalLessons = allLessons.length;
  const completedLessonsCount = enrollment?.completedLessons?.length || 0;
  const courseProgress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // Toggle module expansion
  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  // Mark lesson as complete
  const handleCompleteLesson = async () => {
    if (!enrollment || !currentLesson) {
      console.error("Cannot complete: missing enrollment or lesson", { enrollment, currentLesson });
      return;
    }

    try {
      // Use a unique identifier for the lesson (global index)
      const lessonIdentifier = `${currentLessonIndex}`;
      console.log("Completing lesson:", {
        enrollmentId: enrollment._id,
        currentLessonIndex,
        lessonIdentifier,
        currentCompletedLessons: enrollment.completedLessons,
      });

      const result = await updateProgressMutation.mutateAsync({
        enrollmentId: enrollment._id,
        lessonId: lessonIdentifier,
        moduleId: undefined,
      });
      
      console.log("Progress update result:", result);
      
      // Wait a bit for the backend to process, then refetch
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: newData } = await refetch();
      
      console.log("Refetched enrollment data:", newData);
      console.log("New completed lessons:", newData?.enrollments?.find(e => e.course._id === courseId)?.completedLessons);
      
    } catch (error) {
      console.error("Failed to update progress:", error);
    }
  };

  // Navigate to next/previous lesson
  const navigateToLesson = (index: number) => {
    console.log("Navigating to lesson index:", index);
    if (index >= 0 && index < allLessons.length) {
      const lesson = allLessons[index];
      const lessonIdentifier = `${index}`;
      console.log("Navigating to:", `/learn/${courseId}/${lessonIdentifier}`);
      navigate(`/learn/${courseId}/${lessonIdentifier}`);
    }
  };

  // Check if lesson is completed
  const isLessonCompleted = (lessonIndex?: number) => {
    if (lessonIndex === undefined || !enrollment) return false;
    const lessonIdentifier = `${lessonIndex}`;
    const isCompleted = enrollment.completedLessons?.includes(lessonIdentifier);
    console.log(`Checking lesson ${lessonIndex}:`, { lessonIdentifier, isCompleted, completedLessons: enrollment.completedLessons });
    return isCompleted;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course content...</p>
          <p className="text-sm text-muted-foreground mt-2">
            Course ID: {courseId}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <IconAlertCircle className="size-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Error Loading Course</h2>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "You may not be enrolled in this course"}
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <IconArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Check if course has modules/lessons
  if (!course.modules || course.modules.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <IconBook className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Course Content Yet</h2>
          <p className="text-muted-foreground mb-4">
            This course doesn't have any lessons available.
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            <IconArrowLeft className="size-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col transition-all duration-300",
        sidebarOpen ? "mr-0" : "mr-0"
      )}>
        {/* Top Navigation Bar */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden"
              >
                <IconBook className="size-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
                <IconArrowLeft className="size-5" />
              </Button>
              <div>
                <h1 className="font-semibold text-sm line-clamp-1">{course.title}</h1>
                {currentLesson && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{currentLesson.title}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Progress Indicator */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-32">
                  <Progress value={courseProgress} className="h-2" />
                </div>
                <span className="text-xs text-muted-foreground">{courseProgress}%</span>
              </div>

              {/* Course Complete Badge */}
              {courseProgress === 100 && (
                <Badge className="bg-green-500 hover:bg-green-500">
                  <IconAward className="size-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
            {/* Video/Lesson Player */}
            <Card className="mb-6 overflow-hidden">
              <CardContent className="p-0">
                {currentLesson?.type === "video" ? (
                  <div className="relative">
                    <div className="relative aspect-video bg-black">
                      {currentLesson.videoUrl ? (
                        <iframe
                          src={getYouTubeEmbedUrl(currentLesson.videoUrl)}
                          title={currentLesson.title}
                          className="w-full h-full"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          frameBorder="0"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-linear-to-br from-slate-900 to-slate-800">
                          <div className="text-center space-y-4">
                            <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center mx-auto">
                              <IconPlayerPlay className="size-10 text-white" />
                            </div>
                            <p className="text-white/80 text-sm">Video not available</p>
                            <p className="text-white/60 text-xs">This lesson has no video URL</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Completion Button */}
                    <div className="p-4 bg-background border-t">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <IconPlayerPlay className="size-4" />
                          <span>Watch the video to complete this lesson</span>
                        </div>
                        <Button onClick={handleCompleteLesson} variant={isLessonCompleted(currentLessonIndex) ? "default" : "outline"}>
                          <IconCheck className="size-4 mr-2" />
                          {isLessonCompleted(currentLessonIndex) ? "Completed" : "Mark as Complete"}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : currentLesson?.type === "article" ? (
                  <div className="p-6 md:p-8">
                    <MarkdownViewer content={currentLesson.content || ""} />
                  </div>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <IconFile className="size-5" />
                        Resource Materials
                      </CardTitle>
                      <CardDescription>
                        Download or access the resource files for this lesson
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {currentLesson?.content ? (
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          <MarkdownViewer content={currentLesson.content} />
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          No additional resources available for this lesson.
                        </p>
                      )}
                      
                      {currentLesson?.videoUrl && (
                        <div className="p-4 rounded-lg bg-muted/50 border">
                          <h4 className="font-medium mb-2 text-sm">External Resource</h4>
                          <a
                            href={currentLesson.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                          >
                            <IconExternalLink className="size-4" />
                            Open Resource Link
                          </a>
                        </div>
                      )}
                      
                      <Button className="w-full" onClick={handleCompleteLesson}>
                        <IconCheck className="size-4 mr-2" />
                        Mark as Complete
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Lesson Navigation */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => navigateToLesson(currentLessonIndex - 1)}
                disabled={currentLessonIndex <= 0}
              >
                <IconArrowLeft className="size-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={() => {
                  handleCompleteLesson();
                  if (currentLessonIndex < allLessons.length - 1) {
                    navigateToLesson(currentLessonIndex + 1);
                  }
                }}
                disabled={currentLessonIndex >= allLessons.length - 1}
              >
                {currentLessonIndex >= allLessons.length - 1 ? (
                  <>
                    <IconAward className="size-4 mr-2" />
                    Complete Course
                  </>
                ) : (
                  <>
                    Next Lesson
                    <IconArrowRight className="size-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Lesson Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentLesson?.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconClock className="size-4" />
                        {currentLesson?.duration || "Self-paced"}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconFileText className="size-4" />
                        {currentLesson?.type === "video" ? "Video Lesson" :
                          currentLesson?.type === "article" ? "Reading Material" : "Resource"}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant={isLessonCompleted(currentLessonIndex) ? "default" : "outline"}
                    size="sm"
                    onClick={handleCompleteLesson}
                  >
                    <IconCheck className="size-4 mr-2" />
                    {isLessonCompleted(currentLessonIndex) ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">About this lesson</h4>
                    <p className="text-sm text-muted-foreground">
                      This lesson is part of the course curriculum. Complete all lessons to earn your certificate.
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold text-primary">{completedLessonsCount}</div>
                      <div className="text-xs text-muted-foreground">Completed</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">{totalLessons - completedLessonsCount}</div>
                      <div className="text-xs text-muted-foreground">Remaining</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold">{courseProgress}%</div>
                      <div className="text-xs text-muted-foreground">Progress</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Curriculum Sidebar */}
      <aside className={cn(
        "fixed right-0 top-0 h-full w-80 bg-background border-l shadow-xl transition-transform duration-300 z-50 lg:static lg:shadow-none",
        sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden"
      )}>
        <div className="h-full flex flex-col w-80">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Course Content</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden"
              >
                <IconArrowRight className="size-5" />
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{courseProgress}%</span>
              </div>
              <Progress value={courseProgress} className="h-1.5" />
            </div>
          </div>

          {/* Module List */}
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {processedModules.map((module, moduleIndex) => (
                <div key={module.id || moduleIndex} className="border rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(moduleIndex)}
                    className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">Module {moduleIndex + 1}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{module.title}</div>
                    </div>
                    {expandedModules.has(moduleIndex) ? (
                      <IconChevronDown className="size-4 text-muted-foreground" />
                    ) : (
                      <IconChevronRight className="size-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Module Lessons */}
                  {expandedModules.has(moduleIndex) && (
                    <div className="divide-y">
                      {/* Lessons */}
                      {module.lessons.map((lesson, lessonIndex) => {
                        // Calculate global lesson index
                        const lessonsBeforeThisModule = modules
                          .slice(0, moduleIndex)
                          .reduce((sum, m) => sum + m.lessons.length, 0);
                        const globalLessonIndex = lessonsBeforeThisModule + lessonIndex;
                        const lessonIdentifier = `${globalLessonIndex}`;

                        const isCompleted = isLessonCompleted(globalLessonIndex);
                        const isCurrent = currentLessonIndex === globalLessonIndex;

                        return (
                          <Link
                            key={lessonIdentifier}
                            to={`/learn/${courseId}/${lessonIdentifier}`}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 text-left transition-colors",
                              isCurrent
                                ? "bg-primary/10 border-l-2 border-primary"
                                : "hover:bg-muted/50 border-l-2 border-transparent"
                            )}
                          >
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center shrink-0",
                              isCompleted
                                ? "bg-green-500 text-white"
                                : isCurrent
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted text-muted-foreground"
                            )}>
                              {isCompleted ? (
                                <IconCheck className="size-3" />
                              ) : lesson.type === "video" ? (
                                <IconPlayerPlay className="size-3" />
                              ) : lesson.type === "article" ? (
                                <IconFileText className="size-3" />
                              ) : (
                                <IconFile className="size-3" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={cn(
                                "text-sm truncate",
                                isCurrent ? "font-medium text-primary" : ""
                              )}>
                                {lesson.title}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {lesson.duration || "Self-paced"}
                              </div>
                            </div>
                          </Link>
                        );
                      })}

                      {/* Quizzes */}
                      {module.quizzes && module.quizzes.length > 0 && (
                        <div className="pt-2 mt-2 border-t">
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Quizzes
                          </div>
                          {module.quizzes.map((quiz, quizIndex) => (
                            <Link
                              key={quiz._id || quizIndex}
                              to={`/learn/${courseId}/quiz/${quiz._id || encodeURIComponent(quiz.title)}`}
                              className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-l-2 border-transparent"
                            >
                              <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                                <IconQuestionMark className="size-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm truncate">{quiz.title}</div>
                                <div className="text-xs text-muted-foreground flex items-center gap-2">
                                  {quiz.questions?.length && (
                                    <span>{quiz.questions.length} questions</span>
                                  )}
                                  {quiz.timeLimit && (
                                    <span className="flex items-center gap-1">
                                      <IconClock className="size-3" />
                                      {quiz.timeLimit}m
                                    </span>
                                  )}
                                </div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Assignments */}
                      {module.assignments && module.assignments.length > 0 && (
                        <div className="pt-2 mt-2 border-t">
                          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Assignments
                          </div>
                          {module.assignments.map((assignment, assignmentIndex) => {
                            const isOverdue = assignment.dueDate && new Date() > new Date(assignment.dueDate);
                            return (
                              <Link
                                key={assignment._id || assignmentIndex}
                                to={`/learn/${courseId}/assignment/${assignment._id || encodeURIComponent(assignment.title)}`}
                                className="w-full flex items-center gap-3 p-3 text-left hover:bg-muted/50 transition-colors border-l-2 border-transparent"
                              >
                                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                  <IconClipboardCheck className="size-3" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm truncate">{assignment.title}</div>
                                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                                    {assignment.maxScore && (
                                      <span className="flex items-center gap-1">
                                        <IconAward className="size-3" />
                                        {assignment.maxScore} pts
                                      </span>
                                    )}
                                    {assignment.dueDate && (
                                      <span className={cn(
                                        "flex items-center gap-1",
                                        isOverdue ? "text-red-500" : ""
                                      )}>
                                        <IconClock className="size-3" />
                                        {new Date(assignment.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Sidebar Footer */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <IconFlame className="size-5 text-orange-500" />
              </div>
              <div>
                <div className="text-sm font-medium">Keep it up!</div>
                <div className="text-xs text-muted-foreground">
                  {totalLessons - completedLessonsCount} lessons remaining
                </div>
              </div>
            </div>
            <Button className="w-full" variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <IconArrowLeft className="size-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
