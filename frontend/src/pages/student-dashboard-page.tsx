/**
 * Student Dashboard Page
 * Dedicated dashboard for students with course progress, 
 * learning analytics, and personalized recommendations
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
  IconSparkles,
  IconSchool,
  IconSettings,
  IconLogout,
  IconChevronRight,
  IconPlaylist,
  IconClipboardCheck,
  IconBulb,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks";

// Mock data for the student dashboard
const mockEnrolledCourses = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    instructor: "Dr. Sarah Chen",
    progress: 72,
    totalModules: 12,
    completedModules: 9,
    totalHours: 24,
    hoursSpent: 17,
    nextLesson: "Neural Networks Basics",
    category: "Data Science",
    difficulty: "Intermediate",
    image: undefined,
    lastAccessed: "2 hours ago",
    quizScore: 85,
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    instructor: "Michael Torres",
    progress: 45,
    totalModules: 8,
    completedModules: 4,
    totalHours: 16,
    hoursSpent: 7,
    nextLesson: "Compound Components",
    category: "Web Development",
    difficulty: "Advanced",
    image: undefined,
    lastAccessed: "1 day ago",
    quizScore: 78,
  },
  {
    id: 3,
    title: "Python for Data Analysis",
    instructor: "Dr. Emily Watson",
    progress: 94,
    totalModules: 10,
    completedModules: 9,
    totalHours: 20,
    hoursSpent: 19,
    nextLesson: "Final Project",
    category: "Programming",
    difficulty: "Beginner",
    image: undefined,
    lastAccessed: "3 hours ago",
    quizScore: 92,
  },
  {
    id: 4,
    title: "UI/UX Design Fundamentals",
    instructor: "Alex Rivera",
    progress: 28,
    totalModules: 15,
    completedModules: 4,
    totalHours: 30,
    hoursSpent: 8,
    nextLesson: "Color Theory",
    category: "Design",
    difficulty: "Beginner",
    image: undefined,
    lastAccessed: "5 days ago",
    quizScore: 88,
  },
];

const mockRecommendedCourses = [
  {
    id: 101,
    title: "Deep Learning Specialization",
    instructor: "Dr. Andrew Ng",
    rating: 4.9,
    students: 45280,
    category: "Data Science",
    matchScore: 95,
    reason: "Based on your ML progress",
  },
  {
    id: 102,
    title: "TypeScript Masterclass",
    instructor: "Matt Pocock",
    rating: 4.8,
    students: 12340,
    category: "Web Development",
    matchScore: 88,
    reason: "Complements your React skills",
  },
  {
    id: 103,
    title: "Data Visualization with D3.js",
    instructor: "Shirley Wu",
    rating: 4.7,
    students: 8900,
    category: "Data Science",
    matchScore: 82,
    reason: "Enhance your data analysis",
  },
];

const mockLearningStats = {
  totalHours: 51,
  coursesCompleted: 7,
  certificatesEarned: 5,
  currentStreak: 12,
  longestStreak: 28,
  masteryScore: 847,
  weeklyGoal: 10,
  weeklyProgress: 7,
};

const mockWeeklyActivity = [
  { day: "Mon", hours: 2.5, lessons: 3 },
  { day: "Tue", hours: 1.5, lessons: 2 },
  { day: "Wed", hours: 3.0, lessons: 4 },
  { day: "Thu", hours: 0.5, lessons: 1 },
  { day: "Fri", hours: 2.0, lessons: 3 },
  { day: "Sat", hours: 4.0, lessons: 5 },
  { day: "Sun", hours: 1.5, lessons: 2 },
];

const mockAchievements = [
  { id: 1, title: "First Steps", description: "Complete your first lesson", icon: "🎯", unlocked: true, date: "Jan 15, 2026" },
  { id: 2, title: "Quick Learner", description: "Complete 5 lessons in one day", icon: "⚡", unlocked: true, date: "Jan 22, 2026" },
  { id: 3, title: "Streak Master", description: "Maintain a 7-day streak", icon: "🔥", unlocked: true, date: "Feb 5, 2026" },
  { id: 4, title: "Quiz Champion", description: "Score 100% on 5 quizzes", icon: "🏆", unlocked: true, date: "Feb 12, 2026" },
  { id: 5, title: "Knowledge Seeker", description: "Complete 10 courses", icon: "📚", unlocked: false, progress: 70 },
  { id: 6, title: "Perfect Month", description: "30-day learning streak", icon: "💎", unlocked: false, progress: 40 },
];

const mockCertificates = [
  { id: 1, course: "JavaScript Fundamentals", issueDate: "Jan 10, 2026", credentialId: "JS-2026-001" },
  { id: 2, course: "Web Development Bootcamp", issueDate: "Jan 25, 2026", credentialId: "WD-2026-042" },
  { id: 3, course: "Data Structures Basics", issueDate: "Feb 8, 2026", credentialId: "DS-2026-089" },
  { id: 4, course: "SQL Fundamentals", issueDate: "Feb 15, 2026", credentialId: "SQL-2026-124" },
  { id: 5, course: "Git & GitHub Mastery", issueDate: "Feb 20, 2026", credentialId: "GIT-2026-156" },
];

const mockUpcomingDeadlines = [
  { id: 1, type: "quiz", title: "ML Mid-term Quiz", course: "Machine Learning", dueDate: "Tomorrow, 11:59 PM" },
  { id: 2, type: "assignment", title: "React Project Submission", course: "Advanced React", dueDate: "In 3 days" },
  { id: 3, type: "quiz", title: "Python Final Assessment", course: "Python for Data Analysis", dueDate: "In 5 days" },
];

export function StudentDashboardPage() {
  const { user, role, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Get tab from URL query params, default to "overview"
  const getInitialTab = () => {
    const tab = searchParams.get("tab");
    if (tab === "courses" || tab === "analytics" || tab === "achievements" || tab === "certificates") {
      return tab;
    }
    return "overview";
  };

  // Calculate total progress percentage
  const overallProgress = Math.round(
    mockEnrolledCourses.reduce((sum, course) => sum + course.progress, 0) / mockEnrolledCourses.length
  );

  // Average quiz score
  const avgQuizScore = Math.round(
    mockEnrolledCourses.reduce((sum, course) => sum + course.quizScore, 0) / mockEnrolledCourses.length
  );

  return (
    <div className="container py-8 px-4 md:px-6 max-w-7xl">
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
              {mockLearningStats.currentStreak > 0
                ? `🔥 You're on a ${mockLearningStats.currentStreak}-day learning streak! Keep it up!`
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
            <div className="text-3xl font-bold">{mockLearningStats.totalHours}h</div>
            <div className="flex items-center gap-1 mt-1">
              <IconTrendingUp className="size-3.5 text-green-500" />
              <p className="text-xs text-green-600 dark:text-green-400">+8h this week</p>
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
            <div className="text-3xl font-bold">{mockEnrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockEnrolledCourses.filter(c => c.progress === 100).length} completed
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
            <div className="text-3xl font-bold">{mockLearningStats.masteryScore}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Top 15% of learners
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
            <div className="text-3xl font-bold">{mockLearningStats.certificatesEarned}</div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              +2 this month
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
                  {mockLearningStats.weeklyProgress} of {mockLearningStats.weeklyGoal} hours completed
                </p>
              </div>
            </div>
            <div className="flex-1 md:max-w-xs md:ml-auto">
              <Progress 
                value={(mockLearningStats.weeklyProgress / mockLearningStats.weeklyGoal) * 100} 
                className="h-2" 
              />
            </div>
            <Badge variant={mockLearningStats.weeklyProgress >= mockLearningStats.weeklyGoal ? "default" : "outline"}>
              {Math.round((mockLearningStats.weeklyProgress / mockLearningStats.weeklyGoal) * 100)}%
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
          <TabsTrigger value="achievements" className="gap-2" onClick={() => setSearchParams({ tab: "achievements" })}>
            <IconMedal className="size-4" />
            <span className="hidden sm:inline">Achievements</span>
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
                  {mockEnrolledCourses.slice(0, 3).map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/30 transition-all group cursor-pointer"
                    >
                      <div className="w-16 h-16 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                        <IconBook className="size-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          </div>
                          <Badge variant="outline" className="flex-shrink-0">
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
                      <Button size="sm" className="flex-shrink-0">
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Deadlines & Quick Actions */}
            <div className="space-y-6">
              {/* Upcoming Deadlines */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <IconCalendar className="size-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockUpcomingDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                      >
                        <div className={`p-1.5 rounded-md ${
                          deadline.type === "quiz" 
                            ? "bg-blue-500/10 text-blue-500" 
                            : "bg-amber-500/10 text-amber-500"
                        }`}>
                          {deadline.type === "quiz" ? (
                            <IconClipboardCheck className="size-4" />
                          ) : (
                            <IconBook className="size-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium line-clamp-1">{deadline.title}</p>
                          <p className="text-xs text-muted-foreground">{deadline.course}</p>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            {deadline.dueDate}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconBulb className="size-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Browse Courses</p>
                        <p className="text-xs text-muted-foreground">Explore new topics</p>
                      </div>
                    </div>
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-auto py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/10">
                        <IconTarget className="size-4 text-amber-500" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Take Quiz</p>
                        <p className="text-xs text-muted-foreground">Test your knowledge</p>
                      </div>
                    </div>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recommended Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <IconSparkles className="size-5 text-amber-500" />
                    Recommended for You
                  </CardTitle>
                  <CardDescription>Personalized course suggestions based on your learning</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {mockRecommendedCourses.map((course) => (
                  <div
                    key={course.id}
                    className="relative p-4 rounded-xl border border-border/50 hover:border-primary/50 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-600 dark:text-green-400">
                        {course.matchScore}% match
                      </Badge>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                      <IconBook className="size-6 text-primary" />
                    </div>
                    <h3 className="font-semibold line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{course.instructor}</p>
                    <p className="text-xs text-muted-foreground mb-3">{course.reason}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <IconStar className="size-4 text-amber-500 fill-amber-500" />
                        <span className="text-sm font-medium">{course.rating}</span>
                        <span className="text-xs text-muted-foreground">({course.students.toLocaleString()})</span>
                      </div>
                      <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

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
                  <div className="text-4xl font-bold text-orange-500">{mockLearningStats.currentStreak}</div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                </div>
                <Separator orientation="vertical" className="h-16" />
                <div className="text-center">
                  <div className="text-2xl font-bold">{mockLearningStats.longestStreak}</div>
                  <p className="text-sm text-muted-foreground">Best Streak</p>
                </div>
                <div className="flex-1 flex justify-center gap-2">
                  {mockWeeklyActivity.map((day, index) => (
                    <div key={index} className="flex flex-col items-center gap-1">
                      <div 
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          day.hours > 0 
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
            <Button>
              <IconBook className="size-4 mr-2" />
              Explore Courses
            </Button>
          </div>

          {/* Course Progress Summary */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{mockEnrolledCourses.length}</div>
                <p className="text-sm text-muted-foreground">Total Enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-green-600">
                  {mockEnrolledCourses.filter(c => c.progress >= 75).length}
                </div>
                <p className="text-sm text-muted-foreground">Almost Done</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-amber-600">
                  {mockEnrolledCourses.filter(c => c.progress >= 25 && c.progress < 75).length}
                </div>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">
                  {mockEnrolledCourses.filter(c => c.progress < 25).length}
                </div>
                <p className="text-sm text-muted-foreground">Just Started</p>
              </CardContent>
            </Card>
          </div>

          {/* Course Cards Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            {mockEnrolledCourses.map((course) => (
              <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-2 bg-gradient-to-r from-primary to-primary/50" style={{ width: `${course.progress}%` }} />
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
                    <Button className="flex-1">
                      <IconPlayerPlay className="size-4 mr-2" />
                      Continue
                    </Button>
                    <Button variant="outline" size="icon">
                      <IconChevronRight className="size-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                  <p className="text-xs text-green-600 dark:text-green-400">+5% improvement</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Time This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {mockWeeklyActivity.reduce((sum, d) => sum + d.hours, 0).toFixed(1)}h
                </div>
                <p className="text-xs text-muted-foreground mt-2">15 hours goal</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Lessons Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {mockWeeklyActivity.reduce((sum, d) => sum + d.lessons, 0)}
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
                <div className="space-y-4">
                  {mockWeeklyActivity.map((day, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 text-sm font-medium">{day.day}</div>
                      <div className="flex-1 h-6 bg-muted rounded-lg overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-lg transition-all"
                          style={{ width: `${(day.hours / 4) * 100}%` }}
                        />
                      </div>
                      <div className="w-16 text-right">
                        <span className="text-sm font-medium">{day.hours}h</span>
                        <span className="text-xs text-muted-foreground ml-1">({day.lessons})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Progress Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Course Progress Distribution</CardTitle>
                <CardDescription>How far you've progressed in each course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEnrolledCourses.map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium line-clamp-1">{course.title}</span>
                        <span className="text-sm text-muted-foreground">{course.progress}%</span>
                      </div>
                      <Progress 
                        value={course.progress} 
                        className={`h-2 ${
                          course.progress >= 75 ? "[&>div]:bg-green-500" :
                          course.progress >= 50 ? "[&>div]:bg-blue-500" :
                          course.progress >= 25 ? "[&>div]:bg-amber-500" : ""
                        }`}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skills Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconBrain className="size-5" />
                Skills Progress
              </CardTitle>
              <CardDescription>Your proficiency in different areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Data Science</span>
                    <Badge variant="secondary">Advanced</Badge>
                  </div>
                  <Progress value={82} className="h-2" />
                  <p className="text-xs text-muted-foreground">Based on 3 courses</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Web Development</span>
                    <Badge variant="secondary">Intermediate</Badge>
                  </div>
                  <Progress value={65} className="h-2" />
                  <p className="text-xs text-muted-foreground">Based on 2 courses</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Programming</span>
                    <Badge variant="secondary">Advanced</Badge>
                  </div>
                  <Progress value={78} className="h-2" />
                  <p className="text-xs text-muted-foreground">Based on 4 courses</p>
                </div>
              </div>
            </CardContent>
          </Card>

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Quizzes Taken</TableHead>
                    <TableHead>Average Score</TableHead>
                    <TableHead>Best Score</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEnrolledCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.completedModules}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={course.quizScore} className="w-16 h-2" />
                          <span>{course.quizScore}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={course.quizScore >= 90 ? "default" : "secondary"}>
                          {Math.min(course.quizScore + 10, 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-green-600">
                          <IconTrendingUp className="size-4" />
                          <span className="text-sm">Improving</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Achievements</h2>
            <p className="text-sm text-muted-foreground">Your learning milestones and badges</p>
          </div>

          {/* Achievement Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10">
                    <IconMedal className="size-8 text-amber-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">
                      {mockAchievements.filter(a => a.unlocked).length}
                    </div>
                    <p className="text-sm text-muted-foreground">Badges Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-green-500/10">
                    <IconAward className="size-8 text-green-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{mockLearningStats.coursesCompleted}</div>
                    <p className="text-sm text-muted-foreground">Courses Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-blue-500/10">
                    <IconTrophy className="size-8 text-blue-500" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold">{mockLearningStats.masteryScore}</div>
                    <p className="text-sm text-muted-foreground">Mastery Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievement Badges Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockAchievements.map((achievement) => (
              <Card 
                key={achievement.id} 
                className={`relative overflow-hidden ${!achievement.unlocked ? "opacity-70" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`text-4xl ${!achievement.unlocked ? "grayscale" : ""}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{achievement.title}</h3>
                        {achievement.unlocked && (
                          <IconCheck className="size-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked ? (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                          Unlocked on {achievement.date}
                        </p>
                      ) : (
                        <div className="mt-2">
                          <Progress value={achievement.progress} className="h-1.5" />
                          <p className="text-xs text-muted-foreground mt-1">{achievement.progress}% complete</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Next Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Next Achievements to Unlock</CardTitle>
              <CardDescription>Keep learning to earn these badges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockAchievements.filter(a => !a.unlocked).map((achievement) => (
                  <div 
                    key={achievement.id}
                    className="flex items-center gap-4 p-4 rounded-lg border border-border/50"
                  >
                    <div className="text-3xl grayscale">{achievement.icon}</div>
                    <div className="flex-1">
                      <h4 className="font-medium">{achievement.title}</h4>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <Progress value={achievement.progress} className="w-24 h-2" />
                      <p className="text-xs text-muted-foreground mt-1">{achievement.progress}%</p>
                    </div>
                  </div>
                ))}
              </div>
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
                <div className="text-3xl font-bold">{mockLearningStats.certificatesEarned}</div>
                <p className="text-xs text-muted-foreground">Credentials earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">2</div>
                <p className="text-xs text-green-600 dark:text-green-400">+1 from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shareable Links</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mockLearningStats.certificatesEarned}</div>
                <p className="text-xs text-muted-foreground">Verified credentials</p>
              </CardContent>
            </Card>
          </div>

          {/* Certificates Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {mockCertificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden group">
                <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                      <IconCertificate className="size-8 text-green-500" />
                    </div>
                    <h3 className="font-semibold line-clamp-1">{cert.course}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Completed</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {cert.issueDate}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">
                      ID: {cert.credentialId}
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

          {/* Pending Certificates */}
          <Card>
            <CardHeader>
              <CardTitle>In Progress</CardTitle>
              <CardDescription>Courses close to completion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockEnrolledCourses.filter(c => c.progress >= 75 && c.progress < 100).map((course) => (
                  <div 
                    key={course.id}
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
                    <Button size="sm">
                      Complete
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}