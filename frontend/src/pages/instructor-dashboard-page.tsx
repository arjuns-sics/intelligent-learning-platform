/**
 * Instructor Dashboard Page
 * Dedicated dashboard for instructors with course management, 
 * student analytics, and teaching tools
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  IconBook,
  IconUsers,
  IconChartBar,
  IconClock,
  IconPlus,
  IconCalendar,
  IconFileText,
  IconVideo,
  IconMessage,
  IconStar,
  IconTrendingUp,
  IconSchool,
  IconCertificate,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
  IconSettings,
  IconArrowRight,
  IconLoader2,
  IconCheck,
} from "@tabler/icons-react";
import { useAuth, useInstructorCourses, useCourseStudents } from "@/hooks";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

export function InstructorDashboardPage() {
  const { user, role } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // Fetch instructor's courses from API
  const { data: coursesData, isLoading: isLoadingCourses, error } = useInstructorCourses({
    limit: 50,
    page: 1,
  });

  // Get the first published course by default for student view
  const courses = coursesData?.data?.courses || [];
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      const publishedCourse = courses.find(c => c.status === "published");
      if (publishedCourse) {
        setSelectedCourseId(publishedCourse._id);
      }
    }
  }, [courses, selectedCourseId]);

  // Fetch students for selected course
  const { data: studentsData, isLoading: isLoadingStudents } = useCourseStudents(selectedCourseId);

  // Get tab from URL query params, default to "overview"
  const getInitialTab = () => {
    const tab = searchParams.get("tab");
    if (tab === "courses" || tab === "students" || tab === "analytics" || tab === "certificates") {
      return tab;
    }
    return "overview";
  };

  const totalCourses = coursesData?.data?.pagination?.total || 0;
  const publishedCourses = courses.filter(c => c.status === "published").length;

  return (
    <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
            <IconSchool className="size-7 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Instructor Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name || "Instructor"}! Manage your courses and track student progress.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="default" className="text-sm px-3 py-1 bg-primary">
            <IconStar className="size-3.5 mr-1.5" />
            {role}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <IconSettings className="size-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button size="sm" className="gap-2" asChild>
            <Link to="/courses/create">
              <IconPlus className="size-4" />
              New Course
            </Link>
          </Button>
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
            <div className="text-3xl font-bold">
              {courses.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0)}
            </div>
            <div className="flex items-center gap-1 mt-1">
              <IconTrendingUp className="size-3.5 text-green-500" />
              <p className="text-xs text-green-600 dark:text-green-400">Total enrolled</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconBook className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {publishedCourses} published
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <IconStar className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {courses.length > 0
                ? (courses.reduce((acc, c) => acc + (c.rating?.average || 0), 0) / courses.length).toFixed(1)
                : "—"
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {courses.reduce((acc, c) => acc + (c.rating?.count || 0), 0)} reviews
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconCertificate className="size-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{studentsData?.stats?.averageProgress || 0}%</div>
            <Progress value={studentsData?.stats?.averageProgress || 0} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs value={getInitialTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2" onClick={() => setSearchParams({ tab: "overview" })}>
            <IconChartBar className="size-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2" onClick={() => setSearchParams({ tab: "courses" })}>
            <IconBook className="size-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2" onClick={() => setSearchParams({ tab: "students" })}>
            <IconUsers className="size-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2" onClick={() => setSearchParams({ tab: "analytics" })}>
            <IconTrendingUp className="size-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="certificates" className="gap-2" onClick={() => setSearchParams({ tab: "certificates" })}>
            <IconCertificate className="size-4" />
            <span className="hidden sm:inline">Certificates</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 ">
            {/* Recent Activity - Show recent student enrollments */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconClock className="size-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your courses</CardDescription>
              </CardHeader>
              <CardContent>
                {studentsData?.enrollments && studentsData.enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {studentsData.enrollments.slice(0, 5).map((enrollment, index) => (
                      <div
                        key={enrollment._id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                      >
                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-500">
                          <IconUsers className="size-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">
                            {enrollment.status === "completed"
                              ? `${enrollment.student.name} completed the course`
                              : `${enrollment.student.name} enrolled in the course`
                            }
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {enrollment.progress}%
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IconClock className="size-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No recent activity</p>
                  </div>
                )}
              </CardContent>
            </Card>

          </div>

          {/* Top Performing Courses */}
          {courses.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Top Performing Courses</CardTitle>
                    <CardDescription>Your most popular courses this month</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/dashboard?tab=courses">
                      View All <IconArrowRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  {courses
                    .filter(c => c.status === "published")
                    .sort((a, b) => (b.enrolledStudents || 0) - (a.enrolledStudents || 0))
                    .slice(0, 3)
                    .map((course, index) => (
                      <div
                        key={course._id}
                        className="relative p-4 rounded-xl border border-border/50 hover:border-border transition-colors group"
                      >
                        <div className="absolute top-3 right-3">
                          <Badge variant="outline" className="font-mono">#{index + 1}</Badge>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                          <IconBook className="size-5 text-primary" />
                        </div>
                        <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">{course.enrolledStudents || 0} students</p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            <IconStar className="size-3 mr-1 text-amber-500" />
                            {course.rating?.average?.toFixed(1) || "—"}
                          </Badge>
                          <Badge variant="outline" className="text-xs">{course.category}</Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Courses</h2>
              <p className="text-sm text-muted-foreground">
                Manage and create courses
              </p>
            </div>
            <Button asChild>
              <Link to="/courses/create">
                <IconPlus className="size-4 mr-2" />
                Create Course
              </Link>
            </Button>
          </div>

          {isLoadingCourses ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <IconLoader2 className="size-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Loading your courses...</p>
                </div>
              </CardContent>
            </Card>
          ) : error ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <p className="text-destructive">Failed to load courses</p>
                  <Button variant="outline" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : courses.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <IconBook className="size-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">No courses yet</p>
                    <p className="text-sm text-muted-foreground">
                      Create your first course to get started
                    </p>
                  </div>
                  <Button asChild>
                    <Link to="/courses/create">
                      <IconPlus className="size-4 mr-2" />
                      Create Course
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-75">Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Students</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead className="w-12.5"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <IconBook className="size-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium line-clamp-1">{course.title}</p>
                              <p className="text-xs text-muted-foreground">{course.category}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.status === "published" ? "default" : "secondary"}>
                            {course.status === "published" ? "Published" : course.status === "draft" ? "Draft" : course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <IconUsers className="size-4 text-muted-foreground" />
                            {course.enrolledStudents || 0}
                          </div>
                        </TableCell>
                        <TableCell>
                          {course.rating?.average && course.rating.average > 0 ? (
                            <div className="flex items-center gap-1">
                              <IconStar className="size-4 text-amber-500 fill-amber-500" />
                              {course.rating.average.toFixed(1)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(course.updatedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8">
                                <IconDotsVertical className="size-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link to={`/courses/${course._id}/instructor`} className="flex items-center">
                                  <IconEye className="size-4 mr-2" />
                                  View
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/courses/${course._id}/edit`} className="flex items-center">
                                  <IconEdit className="size-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                <IconTrash className="size-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Student Management</h2>
              <p className="text-sm text-muted-foreground">Track and manage your students</p>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={selectedCourseId || ""}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="text-sm border rounded-md px-3 py-2 bg-background"
              >
                <option value="">Select a course</option>
                {courses.filter(c => c.status === "published").map(course => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
              <Button variant="outline">
                <IconCalendar className="size-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Student Stats */}
          {studentsData && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentsData.stats.activeStudents}</div>
                  <p className="text-xs text-muted-foreground">Currently enrolled</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentsData.stats.completedStudents}</div>
                  <p className="text-xs text-muted-foreground">Total completions</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{studentsData.stats.averageProgress}%</div>
                  <p className="text-xs text-muted-foreground">Per student</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Enrolled Students</CardTitle>
              <CardDescription>
                {selectedCourseId
                  ? `Students enrolled in ${courses.find(c => c._id === selectedCourseId)?.title || "selected course"}`
                  : "Select a course to view students"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingStudents ? (
                <div className="flex items-center justify-center py-12">
                  <IconLoader2 className="size-8 animate-spin text-primary" />
                </div>
              ) : !selectedCourseId ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconUsers className="size-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a course to view enrolled students</p>
                </div>
              ) : studentsData?.enrollments?.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconUsers className="size-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No students enrolled in this course yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Active</TableHead>
                      <TableHead>Enrolled</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData?.enrollments?.map((enrollment) => (
                      <TableRow key={enrollment._id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                {enrollment.student.name.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{enrollment.student.name}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">{enrollment.student.email}</TableCell>
                        <TableCell>
                          <div className="w-32">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span>{enrollment.progress}%</span>
                            </div>
                            <Progress
                              value={enrollment.progress}
                              className={`h-1.5 ${enrollment.progress >= 80 ? "[&>div]:bg-green-500" : enrollment.progress >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-blue-500"}`}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={enrollment.status === "completed" ? "default" : enrollment.status === "active" ? "secondary" : "outline"}>
                            {enrollment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(enrollment.lastAccessedAt), { addSuffix: true })}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(enrollment.enrolledAt), { addSuffix: true })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Analytics & Insights</h2>
              <p className="text-sm text-muted-foreground">Understand your teaching impact</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Last 7 days</Button>
              <Button variant="outline" size="sm">Last 30 days</Button>
              <Button variant="default" size="sm">All Time</Button>
            </div>
          </div>

          {/* Analytics Cards - Calculated from real data */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{courses.reduce((acc, c) => acc + (c.enrolledStudents || 0), 0)}</div>
                <p className="text-xs text-muted-foreground mt-2">Across all courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {courses.length > 0
                    ? (courses.reduce((acc, c) => acc + (c.rating?.average || 0), 0) / courses.length).toFixed(1)
                    : "—"
                  }
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {courses.reduce((acc, c) => acc + (c.rating?.count || 0), 0)} total reviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {studentsData?.stats?.averageProgress ? `${studentsData.stats.averageProgress}%` : "—"}
                </div>
                <Progress value={studentsData?.stats?.averageProgress || 0} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-2">Average across courses</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{studentsData?.stats?.completedStudents || 0}</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                  {studentsData?.stats?.activeStudents ? `${studentsData.stats.activeStudents} currently active` : "No active students"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
                <CardDescription>Compare your courses side by side</CardDescription>
              </CardHeader>
              <CardContent>
                {courses.filter(c => c.status === "published").length > 0 ? (
                  <div className="space-y-4">
                    {courses.filter(c => c.status === "published").map((course) => (
                      <div key={course._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium line-clamp-1">{course.title}</span>
                          <span className="text-sm text-muted-foreground">{course.enrolledStudents || 0} students</span>
                        </div>
                        <Progress value={studentsData?.stats?.averageProgress || 0} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IconBook className="size-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No published courses yet</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Progress Distribution</CardTitle>
                <CardDescription>How far students have progressed</CardDescription>
              </CardHeader>
              <CardContent>
                {studentsData?.enrollments && studentsData.enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {(() => {
                      const total = studentsData.enrollments.length;
                      const ranges = [
                        { label: "0-25%", min: 0, max: 25, color: "bg-red-400" },
                        { label: "26-50%", min: 26, max: 50, color: "bg-amber-400" },
                        { label: "51-75%", min: 51, max: 75, color: "bg-blue-400" },
                        { label: "76-100%", min: 76, max: 100, color: "bg-green-400" },
                      ];
                      return ranges.map((range) => {
                        const count = studentsData.enrollments.filter(
                          (e) => e.progress >= range.min && e.progress <= range.max
                        ).length;
                        const percentage = Math.round((count / total) * 100);
                        return (
                          <div key={range.label} className="flex items-center gap-4">
                            <div className="w-20 text-sm text-muted-foreground">{range.label}</div>
                            <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                              <div className={`h-full ${range.color}`} style={{ width: `${percentage}%` }}></div>
                            </div>
                            <div className="w-12 text-sm text-right">{percentage}%</div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IconUsers className="size-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No student data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Certificates</h2>
              <p className="text-sm text-muted-foreground">Track course completion certificates</p>
            </div>
            <Button variant="outline" disabled>
              <IconCertificate className="size-4 mr-2" />
              Create Template
            </Button>
          </div>

          {/* Certificate Stats - Calculated from completed students */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentsData?.stats?.completedStudents || 0}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentsData?.stats?.activeStudents || 0}</div>
                <p className="text-xs text-muted-foreground">Working towards certificate</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Eligible Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.filter(c => c.hasCertificate).length}</div>
                <p className="text-xs text-muted-foreground">With certificates</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Completions (students who completed) */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Completions</CardTitle>
              <CardDescription>Students who completed courses and earned certificates</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {studentsData?.enrollments?.filter(e => e.status === "completed").length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Completed At</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentsData.enrollments
                      .filter(e => e.status === "completed")
                      .slice(0, 10)
                      .map((enrollment) => (
                        <TableRow key={enrollment._id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9">
                                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                                  {enrollment.student.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{enrollment.student.name}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">{enrollment.student.email}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {enrollment.completedAt ? formatDistanceToNow(new Date(enrollment.completedAt), { addSuffix: true }) : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="default" className="bg-green-500">
                              <IconCheck className="size-3 mr-1" />
                              100%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" disabled>
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <IconCertificate className="size-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No certificates issued yet</p>
                  <p className="text-sm text-muted-foreground">Students will receive certificates upon course completion</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
