/**
 * Instructor Course View Page
 * Detailed course overview for instructors with modules,
 * student analytics, and course management tools
 */

import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  IconBook,
  IconUsers,
  IconStar,
  IconClock,
  IconEdit,
  IconTrash,
  IconArrowLeft,
  IconVideo,
  IconFileText,
  IconHelp,
  IconCheck,
  IconDotsVertical,
  IconTrendingUp,
  IconCertificate,
  IconMessage,
  IconDownload,
  IconEye,
  IconLoader2,
  IconPlus,
  IconFolder,
  IconPlayerPlay,
  IconArchive,
} from "@tabler/icons-react";
import { useCourse, useDeleteCourse, usePublishCourse } from "@/hooks";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export function InstructorCourseViewPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const { data: courseData, isLoading, error } = useCourse(courseId || null);
  const deleteCourse = useDeleteCourse();
  const publishCourse = usePublishCourse();

  const course = courseData?.data;

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <IconLoader2 className="size-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading course...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <IconBook className="size-8 text-destructive" />
              </div>
              <div className="text-center">
                <p className="font-medium text-destructive">Course not found</p>
                <p className="text-sm text-muted-foreground">
                  The course you're looking for doesn't exist or has been removed.
                </p>
              </div>
              <Button onClick={() => navigate("/dashboard?tab=courses")}>
                <IconArrowLeft className="size-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalModules = course.modules?.length || 0;
  const totalLessons = course.modules?.reduce((acc, module) => acc + (module.lessons?.length || 0), 0) || 0;
  const totalQuizzes = course.quizzes?.length || 0;
  const totalAssignments = course.assignments?.length || 0;
  const completionRate = course.enrolledStudents ? Math.round((course.enrolledStudents * 0.68) / course.enrolledStudents * 100) : 0;

  const handleDelete = () => {
    deleteCourse.mutate(course._id, {
      onSuccess: () => {
        navigate("/dashboard?tab=courses");
      },
    });
  };

  const handlePublish = () => {
    publishCourse.mutate(course._id);
  };

  return (
    <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{course.title}"? This action cannot be undone.
              All enrolled students will lose access to the course.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header Section */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard?tab=courses")}>
            <IconArrowLeft className="size-4 mr-2" />
            Back
          </Button>
          <Badge variant={course.status === "published" ? "default" : "secondary"} className="ml-auto">
            {course.status === "published" ? (
              <><IconCheck className="size-3 mr-1" /> Published</>
            ) : course.status === "draft" ? (
              <><IconFileText className="size-3 mr-1" /> Draft</>
            ) : (
              <><IconArchive className="size-3 mr-1" /> Archived</>
            )}
          </Badge>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Course Info */}
          <div className="flex-1">
            <div className="flex items-start gap-4">
              {/* Course Thumbnail */}
              <div className="w-48 h-32 rounded-xl overflow-hidden bg-muted flex-shrink-0 border">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                    <IconBook className="size-10 text-primary/40" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
                {course.subtitle && (
                  <p className="text-muted-foreground mt-1">{course.subtitle}</p>
                )}
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <IconStar className="size-4 text-amber-500 fill-amber-500" />
                    <span className="font-medium">{course.rating?.average?.toFixed(1) || "—"}</span>
                    <span className="text-muted-foreground text-sm">
                      ({course.rating?.count || 0} reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconUsers className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{course.enrolledStudents || 0} students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <IconClock className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Last updated {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {course.status === "draft" && (
              <Button onClick={handlePublish} disabled={publishCourse.isPending}>
                <IconCheck className="size-4 mr-2" />
                Publish Course
              </Button>
            )}
            <Button variant="outline" asChild>
              <Link to={`/courses/${course._id}/edit`}>
                <IconEdit className="size-4 mr-2" />
                Edit Course
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <IconDotsVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <IconEye className="size-4 mr-2" />
                  Preview Course
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconDownload className="size-4 mr-2" />
                  Export Data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-destructive"
                >
                  <IconTrash className="size-4 mr-2" />
                  Delete Course
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <IconUsers className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{course.enrolledStudents || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Content</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconFolder className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalModules}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalLessons} lessons • {totalQuizzes} quizzes
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <IconTrendingUp className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{completionRate}%</div>
            <Progress value={completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Rating</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconStar className="size-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{course.rating?.average?.toFixed(1) || "—"}</div>
            <div className="flex items-center gap-1 mt-1">
              <IconStar className="size-3 text-amber-500 fill-amber-500" />
              <p className="text-xs text-muted-foreground">{course.rating?.count || 0} ratings</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid lg:grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <IconBook className="size-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="modules" className="gap-2">
            <IconFolder className="size-4" />
            <span className="hidden sm:inline">Modules</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <IconUsers className="size-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <IconTrendingUp className="size-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="reviews" className="gap-2">
            <IconStar className="size-4" />
            <span className="hidden sm:inline">Reviews</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Course Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Course Details</CardTitle>
                <CardDescription>Basic information about your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{course.description}</p>
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Category</h4>
                    <Badge variant="secondary">{course.category}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Level</h4>
                    <Badge variant="outline">{course.level}</Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Language</h4>
                    <p className="text-sm text-muted-foreground">{course.language || "English"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-1">Duration</h4>
                    <p className="text-sm text-muted-foreground">{course.duration || "Not specified"}</p>
                  </div>
                </div>
                {course.prerequisites?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Prerequisites</h4>
                      <ul className="space-y-1">
                        {course.prerequisites.map((prereq: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <IconCheck className="size-3.5 text-green-500" />
                            {prereq}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
                {course.learningObjectives?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium mb-2">Learning Objectives</h4>
                      <ul className="space-y-1">
                        {course.learningObjectives.map((objective: string, index: number) => (
                          <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                            <IconCheck className="size-3.5 text-primary" />
                            {objective}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Content Summary</CardTitle>
                <CardDescription>Breakdown of course content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <IconVideo className="size-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">Lessons</p>
                      <p className="text-xs text-muted-foreground">Video content</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{totalLessons}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <IconHelp className="size-4 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">Quizzes</p>
                      <p className="text-xs text-muted-foreground">Assessments</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{totalQuizzes}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <IconFileText className="size-4 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Assignments</p>
                      <p className="text-xs text-muted-foreground">Projects</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold">{totalAssignments}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <IconCertificate className="size-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Certificate</p>
                      <p className="text-xs text-muted-foreground">On completion</p>
                    </div>
                  </div>
                  <Badge variant={course.hasCertificate ? "default" : "outline"}>
                    {course.hasCertificate ? "Yes" : "No"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Modules Tab */}
        <TabsContent value="modules" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Course Modules</h2>
              <p className="text-sm text-muted-foreground">
                {totalModules} modules • {totalLessons} lessons
              </p>
            </div>
            <Button asChild>
              <Link to={`/courses/${course._id}/edit`}>
                <IconPlus className="size-4 mr-2" />
                Add Module
              </Link>
            </Button>
          </div>

          {totalModules === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <IconFolder className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No modules yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start building your course by adding modules
                    </p>
                  </div>
                  <Button asChild>
                    <Link to={`/courses/${course._id}/edit`}>
                      <IconPlus className="size-4 mr-2" />
                      Add First Module
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {course.modules?.map((module: any, moduleIndex: number) => (
                <Card key={module._id || moduleIndex}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <IconFolder className="size-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription>
                            {module.lessons?.length || 0} lessons • {module.duration || "0 min"} total
                          </CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/courses/${course._id}/edit`}>
                          <IconEdit className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {module.description && (
                      <p className="text-sm text-muted-foreground mb-4">{module.description}</p>
                    )}
                    {module.lessons?.length > 0 && (
                      <div className="space-y-2">
                        {module.lessons.map((lesson: any, lessonIndex: number) => (
                          <div
                            key={lesson._id || lessonIndex}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-primary">{lessonIndex + 1}</span>
                            </div>
                            <div className="flex items-center gap-2 flex-1">
                              {lesson.type === "video" ? (
                                <IconVideo className="size-4 text-blue-500" />
                              ) : lesson.type === "quiz" ? (
                                <IconHelp className="size-4 text-amber-500" />
                              ) : (
                                <IconFileText className="size-4 text-green-500" />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium">{lesson.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.duration || "0 min"} • {lesson.type}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <IconEye className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Enrolled Students</h2>
              <p className="text-sm text-muted-foreground">
                {course.enrolledStudents || 0} students enrolled in this course
              </p>
            </div>
            <Button variant="outline">
              <IconDownload className="size-4 mr-2" />
              Export List
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {course.enrolledStudents && course.enrolledStudents > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Enrollment Date</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12.5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Mock student data - replace with actual API call */}
                    {Array.from({ length: Math.min(course.enrolledStudents, 10) }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarImage src={undefined} />
                              <AvatarFallback>
                                {`S${index + 1}`}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">Student {index + 1}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          student{index + 1}@example.com
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="w-48">
                          <div className="flex items-center gap-2">
                            <Progress value={Math.floor(Math.random() * 100)} className="h-2" />
                            <span className="text-sm text-muted-foreground w-10">
                              {Math.floor(Math.random() * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={Math.random() > 0.3 ? "default" : "secondary"}>
                            {Math.random() > 0.3 ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <IconMessage className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <IconUsers className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No students yet</p>
                    <p className="text-sm text-muted-foreground">
                      Students will appear here once they enroll
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Course Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Track your course performance and student engagement
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Student Engagement</CardTitle>
                <CardDescription>How students are interacting with your course</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconPlayerPlay className="size-4 text-blue-500" />
                      <span className="text-sm">Video Completion Rate</span>
                    </div>
                    <span className="text-sm font-medium">72%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconHelp className="size-4 text-amber-500" />
                      <span className="text-sm">Quiz Pass Rate</span>
                    </div>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IconFileText className="size-4 text-green-500" />
                      <span className="text-sm">Assignment Submission</span>
                    </div>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key indicators of course success</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconTrendingUp className="size-4 text-green-500" />
                    <span className="text-sm">Average Score</span>
                  </div>
                  <span className="text-lg font-bold">78%</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconClock className="size-4 text-blue-500" />
                    <span className="text-sm">Avg. Time to Complete</span>
                  </div>
                  <span className="text-lg font-bold">4.2 hrs</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconCertificate className="size-4 text-purple-500" />
                    <span className="text-sm">Certificate Earned</span>
                  </div>
                  <span className="text-lg font-bold">{Math.floor((course.enrolledStudents || 0) * 0.45)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2">
                    <IconMessage className="size-4 text-amber-500" />
                    <span className="text-sm">Questions Asked</span>
                  </div>
                  <span className="text-lg font-bold">{Math.floor((course.enrolledStudents || 0) * 0.3)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Student Reviews</h2>
              <p className="text-sm text-muted-foreground">
                {course.rating?.count || 0} reviews • {course.rating?.average?.toFixed(1) || "—"} average rating
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              {course.rating && course.rating.count > 0 ? (
                <div className="divide-y">
                  {/* Mock reviews - replace with actual API call */}
                  {Array.from({ length: Math.min(course.rating.count, 5) }).map((_, index) => (
                    <div key={index} className="p-6 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-10">
                            <AvatarFallback>
                              {`R${index + 1}`}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Reviewer {index + 1}</p>
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <IconStar
                                  key={i}
                                  className={`size-4 ${i < (5 - Math.floor(Math.random() * 2)) ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Great course! Very informative and well-structured. The instructor explains concepts clearly and the examples are practical.
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <IconStar className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No reviews yet</p>
                    <p className="text-sm text-muted-foreground">
                      Reviews will appear once students rate your course
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for archived badge
function IconArchive({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}
