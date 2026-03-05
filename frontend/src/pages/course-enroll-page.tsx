/**
 * Course Enrollment Page
 * Allows students to enroll in a course and view enrollment details
 */

import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconArrowLeft,
  IconCheck,
  IconAlertCircle,
  IconBook,
  IconUsers,
  IconClock,
  IconAward,
} from "@tabler/icons-react";
import { useCourse, useCheckEnrollment, useEnrollInCourse } from "@/hooks";
import type { Course } from "@/services/course.service";

export function CourseEnrollPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  // Fetch course details
  const { data: courseResponse, isLoading: isLoadingCourse } = useCourse(courseId || null);
  const course = courseResponse?.data as Course | undefined;

  // Check enrollment status
  const { data: enrollmentData, isLoading: isLoadingEnrollment } = useCheckEnrollment(courseId || null);

  // Enroll mutation
  const enrollMutation = useEnrollInCourse();

  const isLoading = isLoadingCourse || isLoadingEnrollment;
  const isEnrolled = enrollmentData?.data?.isEnrolled ?? false;
  const enrollment = enrollmentData?.data?.enrollment;

  const handleEnroll = async () => {
    if (!courseId) return;

    try {
      await enrollMutation.mutateAsync(courseId);
      // Navigate to course detail or dashboard after successful enrollment
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error("Enrollment failed:", error);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading enrollment details...</p>
        </div>
      </div>
    );
  }

  // Error state - course not found
  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <IconAlertCircle className="size-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Course not found</h3>
          <p className="text-muted-foreground mb-4">
            This course may not be published or doesn't exist.
          </p>
          <Button onClick={() => navigate("/courses/browse")}>
            <IconArrowLeft className="size-4 mr-2" />
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8 px-4 md:px-6 max-w-3xl">
        <Button variant="ghost" onClick={() => navigate(`/courses/${courseId}`)} className="mb-6">
          <IconArrowLeft className="size-4 mr-2" />
          Back to Course
        </Button>

        <div className="space-y-6">
          {/* Course Info Card */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted shrink-0 border">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                      <IconBook className="size-8 text-primary/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{course.title}</CardTitle>
                  <CardDescription className="text-base">{course.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <IconUsers className="size-4 text-muted-foreground" />
                  <span>{course.enrolledStudents.toLocaleString()} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconClock className="size-4 text-muted-foreground" />
                  <span>{course.duration || "Self-paced"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <IconAward className="size-4 text-muted-foreground" />
                  <span>{course.hasCertificate ? "Certificate included" : "No certificate"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enrollment Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Status</CardTitle>
              <CardDescription>
                {isEnrolled ? "You're already enrolled in this course" : "Ready to start learning?"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEnrolled && enrollment ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <IconCheck className="size-5" />
                    <span className="font-medium">You are enrolled in this course</span>
                  </div>

                  <div className="p-4 bg-muted rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <Badge variant="outline" className="capitalize">
                        {enrollment.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{enrollment.progress}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Enrolled on</span>
                      <span className="font-medium">
                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={() => navigate(`/dashboard`)}>
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Enroll now to get unlimited access to all course content including videos,
                    articles, quizzes, and assignments.
                  </div>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <IconCheck className="size-4 text-green-500" />
                      <span>Full access to all course materials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck className="size-4 text-green-500" />
                      <span>Track your progress</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck className="size-4 text-green-500" />
                      <span>
                        {course.hasCertificate
                          ? "Earn a certificate upon completion"
                          : "Complete all modules and quizzes"}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <IconCheck className="size-4 text-green-500" />
                      <span>Learn at your own pace</span>
                    </li>
                  </ul>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleEnroll}
                    disabled={enrollMutation.isPending}
                  >
                    {enrollMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                        Enrolling...
                      </>
                    ) : (
                      <>
                        <IconCheck className="size-4 mr-2" />
                        Enroll in Course
                      </>
                    )}
                  </Button>

                  {enrollMutation.isError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm text-destructive">
                      {enrollMutation.error instanceof Error
                        ? enrollMutation.error.message
                        : "Failed to enroll. Please try again."}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CourseEnrollPage;
