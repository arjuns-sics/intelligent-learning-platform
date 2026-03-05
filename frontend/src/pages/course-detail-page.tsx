/**
 * Course Detail Page
 * Displays detailed information about a course for students
 */

import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  IconBook,
  IconClock,
  IconUsers,
  IconStar,
  IconAward,
  IconLanguage,
  IconArrowLeft,
  IconPlayerPlay,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useCourse, useFavorites, useCheckEnrollment } from "@/hooks";
import type { Course } from "@/services/course.service";
import { useAuth } from "@/hooks";

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { favorites, toggleFavorite } = useFavorites();
  const { role, isAuthenticated } = useAuth();

  // Fetch course details
  const { data: courseResponse, isLoading, error } = useCourse(courseId || null);
  const course = courseResponse?.data as Course | undefined;

  // Check enrollment status (only for authenticated students)
  const shouldCheckEnrollment = isAuthenticated && role === "Student" && !!courseId;
  const { data: enrollmentData, isLoading: isLoadingEnrollment, error: enrollmentError } = useCheckEnrollment(
    shouldCheckEnrollment ? courseId : null
  );
  // enrollmentData is already the inner data object (isEnrolled, enrollment)
  const isEnrolled = enrollmentData?.isEnrolled ?? false;
  const isCheckingEnrollment = isLoadingEnrollment;

  // Debug logging
  useEffect(() => {
    if (shouldCheckEnrollment) {
      console.log("Checking enrollment:", { courseId, role, isAuthenticated, shouldCheckEnrollment });
      console.log("Enrollment data:", enrollmentData);
      console.log("Is enrolled:", isEnrolled);
    }
    if (shouldCheckEnrollment && enrollmentError) {
      console.error("Enrollment check failed:", enrollmentError);
    }
  }, [enrollmentData, enrollmentError, shouldCheckEnrollment, courseId, role, isAuthenticated, isEnrolled]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading course details...</p>
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
          <h3 className="text-lg font-semibold mb-2">Course not found</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "This course may not be published or doesn't exist."}
          </p>
          <Button onClick={() => navigate("/courses/browse")}>
            <IconArrowLeft className="size-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const isFavorite = favorites.includes(course._id);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-primary/5 via-background to-background border-b">
        <div className="container py-8 px-4 md:px-6 max-w-7xl">
          <Button variant="ghost" onClick={() => navigate("/courses/browse")} className="mb-4">
            <IconArrowLeft className="size-4 mr-2" />
            Back to Browse
          </Button>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Course Thumbnail */}
              <div className="w-full h-64 rounded-xl overflow-hidden bg-muted mb-6 border">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                    <IconBook className="size-20 text-primary/30" />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="outline">{course.category}</Badge>
                <Badge
                  variant="secondary"
                  className={
                    course.level === "Beginner" ? "text-green-600 dark:text-green-400" :
                      course.level === "Intermediate" ? "text-blue-600 dark:text-blue-400" :
                        "text-red-600 dark:text-red-400"
                  }
                >
                  {course.level}
                </Badge>
                {course.enrolledStudents >= 10000 && (
                  <Badge className="bg-amber-500 hover:bg-amber-500">
                    <IconStar className="size-3 mr-1" />
                    Bestseller
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-muted-foreground mb-6">{course.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <IconStar className="size-4 text-amber-500 fill-amber-500" />
                  <span className="font-medium">{course.rating.average}</span>
                  <span className="text-muted-foreground">({course.rating.count} reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconUsers className="size-4" />
                  <span>{course.enrolledStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconBook className="size-4" />
                  <span>{course.totalLessons || course.modules.length} lessons</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex items-center gap-4 mb-6">
                <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {course.instructor?.name?.charAt(0).toUpperCase() || "I"}
                </div>
                <div>
                  <p className="font-medium">Created by {course.instructor?.name || "Unknown Instructor"}</p>
                  <p className="text-sm text-muted-foreground">Instructor</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Enrollment Options</CardTitle>
                  <CardDescription>Start learning today</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconStar className="size-4 text-amber-500 fill-amber-500" />
                      <span className="text-2xl font-bold">{course.rating.average}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{course.rating.count} reviews</span>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <IconUsers className="size-4 text-muted-foreground" />
                      <span>{course.enrolledStudents.toLocaleString()} students enrolled</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconClock className="size-4 text-muted-foreground" />
                      <span>{course.duration || "Self-paced"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IconBook className="size-4 text-muted-foreground" />
                      <span>{course.modules.length} modules</span>
                    </div>
                    {course.hasCertificate && (
                      <div className="flex items-center gap-2">
                        <IconAward className="size-4 text-muted-foreground" />
                        <span>Certificate of completion</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <IconLanguage className="size-4 text-muted-foreground" />
                      <span>{course.language}</span>
                    </div>
                  </div>

                  <Separator />

                  {isCheckingEnrollment ? (
                    <Button className="w-full" size="lg" disabled>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      Checking...
                    </Button>
                  ) : isEnrolled ? (
                    <Button className="w-full" size="lg" asChild>
                      <Link to={`/learn/${courseId}`}>
                        <IconPlayerPlay className="size-4 mr-2" />
                        Start Learning
                      </Link>
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" asChild>
                      <Link to={`/courses/${course._id}/enroll`}>
                        <IconPlayerPlay className="size-4 mr-2" />
                        Enroll Now
                      </Link>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleFavorite(course._id)}
                  >
                    {isFavorite ? (
                      <>
                        <IconStar className="size-4 mr-2 fill-amber-500 text-amber-500" />
                        Remove from Favorites
                      </>
                    ) : (
                      <>
                        <IconStar className="size-4 mr-2" />
                        Add to Favorites
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="container px-4 md:px-6 max-w-7xl">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* What You'll Learn */}
              <Card>
                <CardHeader>
                  <CardTitle>What you'll learn</CardTitle>
                </CardHeader>
                <CardContent>
                  {course.learningObjectives && course.learningObjectives.length > 0 ? (
                    <ul className="grid sm:grid-cols-2 gap-3">
                      {course.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <IconCheck className="size-5 text-green-500 shrink-0 mt-0.5" />
                          <span className="text-sm">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted-foreground">Learning objectives will be added soon.</p>
                  )}
                </CardContent>
              </Card>

              {/* Prerequisites */}
              {course.prerequisites && course.prerequisites.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Prerequisites</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.prerequisites.map((prereq, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <IconBook className="size-4 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-sm">{prereq}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Course Content */}
              <Card>
                <CardHeader>
                  <CardTitle>Course Content</CardTitle>
                  <CardDescription>{course.modules.length} modules</CardDescription>
                </CardHeader>
                <CardContent>
                  {course.modules.length > 0 ? (
                    <div className="space-y-4">
                      {course.modules.map((module, index) => (
                        <div key={module.id || index} className="border rounded-lg p-4">
                          <h4 className="font-medium mb-2">Module {index + 1}: {module.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                          {module.lessons && module.lessons.length > 0 && (
                            <ul className="space-y-1">
                              {module.lessons.map((lesson, lessonIndex) => (
                                <li key={lesson.id || lessonIndex} className="text-sm flex items-center gap-2">
                                  <IconBook className="size-3 text-muted-foreground" />
                                  {lesson.title}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      Course modules and lessons will be displayed here.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>This course includes:</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <IconClock className="size-4 text-muted-foreground" />
                    <span>{course.duration || "Self-paced"} of content</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconBook className="size-4 text-muted-foreground" />
                    <span>{course.modules.length} modules</span>
                  </div>
                  {course.hasCertificate && (
                    <div className="flex items-center gap-2">
                      <IconAward className="size-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <IconLanguage className="size-4 text-muted-foreground" />
                    <span>{course.language}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
