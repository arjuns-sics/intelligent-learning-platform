/**
 * Student Dashboard Page
 * Dedicated dashboard for students with course progress and learning analytics
 */

import { useSearchParams, Link } from "react-router-dom";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import {
  IconBook,
  IconTrophy,
  IconTarget,
  IconChartBar,
  IconClock,
  IconCertificate,
  IconStar,
  IconTrendingUp,
  IconCalendar,
  IconPlayerPlay,
  IconCheck,
  IconArrowRight,
  IconFlame,
  IconBrain,
  IconMedal,
  IconAward,
  IconSchool,
  IconChevronRight,
  IconPlaylist,
  IconClipboardCheck,
  IconBulb,
  IconLogout,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks";
import { useDashboardStats, useMyEnrollments } from "@/hooks";

// Helper function to format relative time
const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
};

// Helper function to get next lesson from course
const getNextLesson = (course: any, enrollment: any) => {
  const modules = course.modules || [];
  for (const module of modules) {
    for (const lesson of module.lessons || []) {
      if (!enrollment.completedLessons?.includes(lesson._id)) {
        return lesson.title;
      }
    }
  }
  return "Course Complete";
};

export function StudentDashboardPage() {
  const { user, role, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Fetch dashboard stats and enrollments
  const { data: statsData, isLoading: statsLoading, error: statsError } = useDashboardStats();
  const { data: enrollmentsData, isLoading: enrollmentsLoading, error: enrollmentsError } = useMyEnrollments({ limit: 100 });

  // Extract data
  const enrolledCourses = enrollmentsData?.enrollments?.map((enrollment) => ({
    _id: enrollment._id,
    id: enrollment.course._id,
    title: enrollment.course.title,
    instructor: "Instructor", // Would need to populate instructor data
    progress: enrollment.progress,
    totalModules: enrollment.course.modules?.length || 0,
    completedModules: enrollment.completedModules?.length || 0,
    totalHours: parseInt(enrollment.course.duration) || 0,
    hoursSpent: Math.round((enrollment.progress / 100) * (parseInt(enrollment.course.duration) || 0)),
    nextLesson: getNextLesson(enrollment.course, enrollment),
    category: enrollment.course.category,
    difficulty: enrollment.course.level,
    image: enrollment.course.thumbnail,
    lastAccessed: formatRelativeTime(enrollment.lastAccessedAt),
    quizScore: Math.min(enrollment.progress + 10, 100), // Estimated
    status: enrollment.status,
  })) || [];

  const activeCourses = enrolledCourses.filter(c => c.status === "active");

  // Get stats or use defaults
  const stats = statsData || {
    totalEnrolled: enrolledCourses.length,
    activeCourses: activeCourses.length,
    completedCourses: 0,
    totalHours: 0,
    overallProgress: 0,
    avgQuizScore: 0,
    masteryScore: 0,
    currentStreak: 0,
    longestStreak: 0,
    justStarted: 0,
    inProgress: 0,
    almostDone: 0,
    weeklyActivity: [],
    recentCourses: [],
    certificates: [],
  };

  // Calculate weekly goal (default 10 hours)
  const weeklyGoal = 10;
  const weeklyProgress = stats.weeklyActivity?.reduce((sum, day) => sum + day.hours, 0) || 0;

  // Get tab from URL query params, default to "overview"
  const getInitialTab = () => {
    const tab = searchParams.get("tab");
    if (tab === "courses" || tab === "analytics" || tab === "certificates") {
      return tab;
    }
    return "overview";
  };

  // Calculate total progress percentage
  const overallProgress = activeCourses.length > 0
    ? Math.round(activeCourses.reduce((sum, course) => sum + course.progress, 0) / activeCourses.length)
    : 0;

  // Average quiz score
  const avgQuizScore = activeCourses.length > 0
    ? Math.round(activeCourses.reduce((sum, course) => sum + course.quizScore, 0) / activeCourses.length)
    : 0;

  // Show loading state
  if (statsLoading || enrollmentsLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (statsError || enrollmentsError) {
    return (
      <div className="container py-8 px-4 md:px-6 max-w-7xl mx-auto">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            <CardDescription>
              {statsError?.message || enrollmentsError?.message || "Failed to load your dashboard data"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              Welcome back, {user?.name?.split(" ")[0] || "Student"}!
            </h1>
            <p className="text-muted-foreground mt-1">
              {stats.currentStreak > 0
                ? `🔥 You're on a ${stats.currentStreak}-day learning streak! Keep it up!`
                : "Ready to continue your learning journey?"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {role}
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link to="/settings">
              <IconSettings className="size-4 mr-2" />
              Settings
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={logout}>
            <IconLogout className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Learning Hours</CardTitle>
            <div className="p-2 rounded-lg bg-primary/10">
              <IconClock className="size-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalHours}h</div>
            <div className="flex items-center gap-1 mt-1">
              <IconTrendingUp className="size-3.5 text-green-500" />
              <p className="text-xs text-green-600 dark:text-green-400">+{weeklyProgress.toFixed(1)}h this week</p>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Enrolled</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10">
              <IconBook className="size-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.completedCourses} completed
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mastery Score</CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10">
              <IconTrophy className="size-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.masteryScore}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.masteryScore > 500 ? "Top 20% of learners" : "Keep learning to improve"}
            </p>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -translate-y-8 translate-x-8" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Certificates</CardTitle>
            <div className="p-2 rounded-lg bg-green-500/10">
              <IconCertificate className="size-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.certificates.length}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {stats.certificates.length > 0 ? "Credentials earned" : "Complete courses to earn"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goal Progress */}
      <Card className="mb-8">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <IconTarget className="size-5 text-amber-500" />
              </div>
              <div>
                <p className="font-medium">Weekly Learning Goal</p>
                <p className="text-sm text-muted-foreground">
                  {weeklyProgress.toFixed(1)} of {weeklyGoal} hours completed
                </p>
              </div>
            </div>
            <div className="flex-1 md:max-w-xs md:ml-auto">
              <Progress
                value={(weeklyProgress / weeklyGoal) * 100}
                className="h-2"
              />
            </div>
            <Badge variant={weeklyProgress >= weeklyGoal ? "default" : "outline"}>
              {Math.round((weeklyProgress / weeklyGoal) * 100)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Main Content with Tabs */}
      <Tabs value={getInitialTab()} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2" onClick={() => setSearchParams({ tab: "overview" })}>
            <IconChartBar className="size-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2" onClick={() => setSearchParams({ tab: "courses" })}>
            <IconBook className="size-4" />
            <span className="hidden sm:inline">My Courses</span>
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
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Continue Learning */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <IconPlayerPlay className="size-5" />
                      Continue Learning
                    </CardTitle>
                    <CardDescription>Pick up where you left off</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="?tab=courses">
                      View All <IconArrowRight className="size-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCourses.length > 0 ? (
                    activeCourses.slice(0, 3).map((course) => (
                      <div
                        key={course._id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/30 transition-all group cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            <IconBook className="size-7 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                                {course.title}
                              </h3>
                              <p className="text-sm text-muted-foreground">{course.instructor}</p>
                            </div>
                            <Badge variant="outline" className="shrink-0">
                              {course.progress}%
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <Progress value={course.progress} className="h-1.5" />
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <IconClock className="size-3" />
                              {course.hoursSpent}/{course.totalHours}h
                            </span>
                            <span className="flex items-center gap-1">
                              <IconPlaylist className="size-3" />
                              {course.completedModules}/{course.totalModules} modules
                            </span>
                          </div>
                        </div>
                        <Button size="sm" className="shrink-0" asChild>
                          <Link to={`/learn/${course.id}`}>Continue</Link>
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <IconBook className="size-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">You're not enrolled in any courses yet</p>
                      <Button variant="link" asChild>
                        <Link to="/courses">Browse Courses</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines & Quick Actions */}
            <div className="space-y-6">
              {/* Upcoming Deadlines - Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconCalendar className="size-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activeCourses.length > 0 ? (
                    <div className="space-y-3">
                      {activeCourses.slice(0, 2).map((course) => (
                        <div
                          key={course._id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                        >
                          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-500">
                            <IconClipboardCheck className="size-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{course.nextLesson}</p>
                            <p className="text-xs text-muted-foreground">{course.title}</p>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                              {course.lastAccessed}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming deadlines. Enroll in a course to get started!
                    </p>
                  )}
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Learning Streak */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFlame className="size-5 text-orange-500" />
                Learning Streak
              </CardTitle>
              <CardDescription>Keep your momentum going!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500">{stats.currentStreak}</div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{stats.longestStreak}</div>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                </div>
                <div className="flex-1 flex justify-center gap-2">
                  {stats.weeklyActivity?.slice(0, 7).map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${day.hours > 0
                            ? day.hours >= 2
                              ? "bg-green-500 text-white"
                              : "bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300"
                            : "bg-muted"
                          }`}
                      >
                        {day.hours > 0 && <IconCheck className="size-4" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{day.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">My Enrolled Courses</h2>
              <p className="text-sm text-muted-foreground">Track your progress across all courses</p>
            </div>
            <Button asChild>
              <Link to="/courses">
                <IconBook className="size-4 mr-2" />
                Explore Courses
              </Link>
            </Button>
          </div>

          {/* Course Progress Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">
                  {stats.almostDone}
                </div>
                <p className="text-sm text-muted-foreground">Almost Done</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-amber-600">
                  {stats.inProgress}
                </div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.justStarted}
                </div>
                <p className="text-sm text-muted-foreground">Just Started</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {enrolledCourses.length > 0 ? (
              enrolledCourses.map((course) => (
                <Card key={course._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-2 bg-linear-to-r from-primary to-primary/50" style={{ width: `${course.progress}%` }} />
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                        <CardDescription>{course.instructor}</CardDescription>
                      </div>
                      <Badge variant={
                        course.difficulty === "Beginner" ? "secondary" :
                          course.difficulty === "Intermediate" ? "default" : "destructive"
                      }>
                        {course.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <IconPlaylist className="size-4 text-muted-foreground" />
                        <span>{course.completedModules}/{course.totalModules} modules</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClock className="size-4 text-muted-foreground" />
                        <span>{course.hoursSpent}/{course.totalHours} hours</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconClipboardCheck className="size-4 text-muted-foreground" />
                        <span>Quiz: {course.quizScore}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IconCalendar className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{course.lastAccessed}</span>
                      </div>
                    </div>

                    {/* Next Lesson */}
                    <div className="p-3 rounded-lg bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">Next Lesson</p>
                      <p className="text-sm font-medium">{course.nextLesson}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="flex-1" asChild>
                        <Link to={`/learn/${course.id}`}>
                          <IconPlayerPlay className="size-4 mr-2" />
                          Continue
                        </Link>
                      </Button>
                      <Button variant="outline" size="icon" asChild>
                        <Link to={`/learn/${course.id}`}>
                          <IconChevronRight className="size-4" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <IconBook className="size-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses enrolled yet</h3>
                <p className="text-muted-foreground mb-4">Start your learning journey by exploring our courses</p>
                <Button asChild>
                  <Link to="/courses">
                    <IconBook className="size-4 mr-2" />
                    Browse Courses
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Learning Analytics</h2>
              <p className="text-sm text-muted-foreground">Track your learning progress and performance</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Last 7 days</Button>
              <Button variant="default" size="sm">Last 30 days</Button>
              <Button variant="outline" size="sm">All Time</Button>
            </div>
          </div>

          {/* Performance Overview */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{overallProgress}%</div>
                <Progress value={overallProgress} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-2">Across all courses</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{avgQuizScore}%</div>
                <div className="flex items-center gap-1 mt-2">
                  <IconTrendingUp className="size-3.5 text-green-500" />
                  <p className="text-xs text-green-600 dark:text-green-400">Keep improving!</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {weeklyProgress.toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground mt-2">{weeklyGoal} hours goal</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {stats.weeklyActivity?.reduce((sum, d) => sum + d.lessons, 0) || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-2">This week</p>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity Chart */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Learning Activity</CardTitle>
                <CardDescription>Hours spent learning each day</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.weeklyActivity && stats.weeklyActivity.length > 0 ? (
                  <div className="space-y-4">
                    {stats.weeklyActivity.map((day, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <div className="w-12 text-sm font-medium">{day.day}</div>
                        <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-primary to-primary/70 rounded-lg transition-all"
                            style={{ width: `${(day.hours / 4) * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-right">
                          <span className="text-sm font-medium">{day.hours.toFixed(1)}h</span>
                          <span className="text-xs text-muted-foreground ml-1">({day.lessons})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IconChartBar className="size-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No activity this week. Start learning!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Course Progress Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress Distribution</CardTitle>
                <CardDescription>How far you've progressed in each course</CardDescription>
              </CardHeader>
              <CardContent>
                {activeCourses.length > 0 ? (
                  <div className="space-y-4">
                    {activeCourses.map((course) => (
                      <div key={course._id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium line-clamp-1">{course.title}</span>
                          <span className="text-sm text-muted-foreground">{course.progress}%</span>
                        </div>
                        <Progress
                          value={course.progress}
                          className={`h-2 ${course.progress >= 75 ? "[&>div]:bg-green-500" :
                              course.progress >= 50 ? "[&>div]:bg-blue-500" :
                                course.progress >= 25 ? "[&>div]:bg-amber-500" : ""
                            }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <IconBook className="size-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No active courses to show</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Quiz Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconClipboardCheck className="size-5" />
                Quiz Performance
              </CardTitle>
              <CardDescription>Your scores across course quizzes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {activeCourses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Modules Completed</TableHead>
                      <TableHead>Estimated Score</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCourses.map((course) => (
                      <TableRow key={course._id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.completedModules}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={course.quizScore} className="w-16 h-2" />
                            <span>{course.quizScore}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={course.progress >= 75 ? "default" : course.progress >= 50 ? "secondary" : "outline"}>
                            {course.progress}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-green-600">
                            <IconTrendingUp className="size-4" />
                            <span className="text-sm">Active</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <IconClipboardCheck className="size-12 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No quiz data available. Enroll in a course to get started!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">My Certificates</h2>
              <p className="text-sm text-muted-foreground">Your earned credentials and achievements</p>
            </div>
            <Button variant="outline">
              <IconCertificate className="size-4 mr-2" />
              Share Profile
            </Button>
          </div>

          {/* Certificate Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.certificates.length}</div>
                <p className="text-xs text-muted-foreground">Credentials earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.almostDone}</div>
                <p className="text-xs text-muted-foreground">Courses close to completion</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shareable</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.certificates.length}</div>
                <p className="text-xs text-muted-foreground">Verified credentials</p>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Grid */}
          {stats.certificates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {stats.certificates.map((cert) => (
                <Card key={cert._id} className="overflow-hidden group">
                  <div className="h-2 bg-linear-to-r from-green-500 to-emerald-500" />
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                        <IconCertificate className="size-8 text-green-500" />
                      </div>
                      <h3 className="font-semibold line-clamp-1">{cert.course.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Completed on {new Date(cert.completedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="secondary" className="text-xs">
                          {cert.progress}%
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-mono">
                        ID: {cert._id.slice(-8).toUpperCase()}
                      </p>
                      <div className="flex gap-2 mt-4 w-full">
                        <Button variant="outline" size="sm" className="flex-1">
                          View
                        </Button>
                        <Button variant="default" size="sm" className="flex-1">
                          Share
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <IconCertificate className="size-12 text-muted-foreground mx-auto mb-2" />
                  <h3 className="text-lg font-semibold mb-2">No certificates yet</h3>
                  <p className="text-muted-foreground mb-4">Complete courses to earn certificates</p>
                  <Button asChild>
                    <Link to="/courses">
                      <IconBook className="size-4 mr-2" />
                      Browse Courses
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Certificates */}
          {activeCourses.filter(c => c.progress >= 75 && c.progress < 100).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>In Progress</CardTitle>
                <CardDescription>Courses close to completion</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeCourses.filter(c => c.progress >= 75 && c.progress < 100).map((course) => (
                    <div
                      key={course._id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border/50"
                    >
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <IconBook className="size-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{course.title}</h4>
                        <p className="text-sm text-muted-foreground">{course.progress}% complete</p>
                        <Progress value={course.progress} className="h-1.5 mt-2" />
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/learn/${course.id}`}>Continue</Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}