/**
 * Instructor Dashboard Page
 * Dedicated dashboard for instructors with course management, 
 * student analytics, and teaching tools
 */

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
} from "@tabler/icons-react";
import { useAuth } from "@/hooks";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Mock data for the instructor dashboard
const mockCourses = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    students: 156,
    progress: 78,
    rating: 4.8,
    status: "Published",
    category: "Data Science",
    lastUpdated: "2 days ago",
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    students: 89,
    progress: 45,
    rating: 4.6,
    status: "Published",
    category: "Web Development",
    lastUpdated: "1 week ago",
  },
  {
    id: 3,
    title: "Python for Beginners",
    students: 234,
    progress: 92,
    rating: 4.9,
    status: "Published",
    category: "Programming",
    lastUpdated: "3 days ago",
  },
  {
    id: 4,
    title: "Data Structures & Algorithms",
    students: 0,
    progress: 23,
    rating: 0,
    status: "Draft",
    category: "Computer Science",
    lastUpdated: "5 days ago",
  },
];

const mockRecentStudents = [
  { id: 1, name: "Alex Johnson", email: "alex@example.com", course: "Machine Learning", progress: 85, avatar: undefined },
  { id: 2, name: "Sarah Smith", email: "sarah@example.com", course: "React Patterns", progress: 62, avatar: undefined },
  { id: 3, name: "Michael Chen", email: "michael@example.com", course: "Python Basics", progress: 94, avatar: undefined },
  { id: 4, name: "Emily Davis", email: "emily@example.com", course: "Machine Learning", progress: 47, avatar: undefined },
  { id: 5, name: "James Wilson", email: "james@example.com", course: "React Patterns", progress: 73, avatar: undefined },
];

const mockAnalytics = {
  totalStudents: 479,
  totalCourses: 4,
  totalRevenue: 12500,
  averageRating: 4.7,
  completionRate: 68,
  engagementRate: 82,
};

const mockNotifications = [
  { id: 1, type: "enrollment", message: "5 new students enrolled in Machine Learning course", time: "2 hours ago" },
  { id: 2, type: "review", message: "New 5-star review on Python for Beginners", time: "5 hours ago" },
  { id: 3, type: "question", message: "3 unanswered questions in React Patterns", time: "1 day ago" },
  { id: 4, type: "milestone", message: "Machine Learning course reached 150 students!", time: "2 days ago" },
];

export function InstructorDashboardPage() {
  const { user, role } = useAuth();

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
            <div className="text-3xl font-bold">{mockAnalytics.totalStudents}</div>
            <div className="flex items-center gap-1 mt-1">
              <IconTrendingUp className="size-3.5 text-green-500" />
              <p className="text-xs text-green-600 dark:text-green-400">+12% from last month</p>
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
            <div className="text-3xl font-bold">{mockAnalytics.totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {mockCourses.filter(c => c.status === "Published").length} published
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
            <div className="text-3xl font-bold">{mockAnalytics.averageRating}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on 89 reviews
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
            <div className="text-3xl font-bold">{mockAnalytics.completionRate}%</div>
            <Progress value={mockAnalytics.completionRate} className="mt-2 h-1.5" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview" className="gap-2">
            <IconChartBar className="size-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="courses" className="gap-2">
            <IconBook className="size-4" />
            <span className="hidden sm:inline">Courses</span>
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <IconUsers className="size-4" />
            <span className="hidden sm:inline">Students</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <IconTrendingUp className="size-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconClock className="size-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest updates from your courses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                    >
                      <div className={`p-2 rounded-full ${notification.type === "enrollment" ? "bg-blue-500/10 text-blue-500" :
                          notification.type === "review" ? "bg-amber-500/10 text-amber-500" :
                            notification.type === "question" ? "bg-orange-500/10 text-orange-500" :
                              "bg-green-500/10 text-green-500"
                        }`}>
                        {notification.type === "enrollment" && <IconUsers className="size-4" />}
                        {notification.type === "review" && <IconStar className="size-4" />}
                        {notification.type === "question" && <IconMessage className="size-4" />}
                        {notification.type === "milestone" && <IconTrendingUp className="size-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common instructor tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start h-auto py-3" asChild>
                  <Link to="/courses/create">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <IconPlus className="size-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">Create Course</p>
                        <p className="text-xs text-muted-foreground">Build a new course</p>
                      </div>
                    </div>
                  </Link>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/10">
                      <IconVideo className="size-4 text-blue-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Upload Video</p>
                      <p className="text-xs text-muted-foreground">Add new content</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <IconFileText className="size-4 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Create Quiz</p>
                      <p className="text-xs text-muted-foreground">Test student knowledge</p>
                    </div>
                  </div>
                </Button>

                <Button variant="outline" className="w-full justify-start h-auto py-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <IconMessage className="size-4 text-green-500" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Q&A Dashboard</p>
                      <p className="text-xs text-muted-foreground">Answer questions</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Courses */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Performing Courses</CardTitle>
                  <CardDescription>Your most popular courses this month</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/courses">
                    View All <IconArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {mockCourses.filter(c => c.status === "Published").slice(0, 3).map((course, index) => (
                  <div
                    key={course.id}
                    className="relative p-4 rounded-xl border border-border/50 hover:border-border transition-colors group"
                  >
                    <div className="absolute top-3 right-3">
                      <Badge variant="outline" className="font-mono">#{index + 1}</Badge>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-3">
                      <IconBook className="size-5 text-primary" />
                    </div>
                    <h3 className="font-semibold line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">{course.students} students</p>
                    <div className="flex items-center gap-2 mt-3">
                      <Badge variant="secondary" className="text-xs">
                        <IconStar className="size-3 mr-1 text-amber-500" />
                        {course.rating}
                      </Badge>
                      <Badge variant="outline" className="text-xs">{course.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Your Courses</h2>
              <p className="text-sm text-muted-foreground">Manage and create courses</p>
            </div>
            <Button asChild>
              <Link to="/courses/create">
                <IconPlus className="size-4 mr-2" />
                Create Course
              </Link>
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-75">Course</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="w-12.5"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCourses.map((course) => (
                    <TableRow key={course.id}>
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
                        <Badge variant={course.status === "Published" ? "default" : "secondary"}>
                          {course.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <IconUsers className="size-4 text-muted-foreground" />
                          {course.students}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{course.progress}%</span>
                          </div>
                          <Progress value={course.progress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        {course.rating > 0 ? (
                          <div className="flex items-center gap-1">
                            <IconStar className="size-4 text-amber-500 fill-amber-500" />
                            {course.rating}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {course.lastUpdated}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8">
                              <IconDotsVertical className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <IconEye className="size-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <IconEdit className="size-4 mr-2" />
                              Edit
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
        </TabsContent>

        {/* Students Tab */}
        <TabsContent value="students" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Student Management</h2>
              <p className="text-sm text-muted-foreground">Track and manage your students</p>
            </div>
            <Button variant="outline">
              <IconCalendar className="size-4 mr-2" />
              Export Report
            </Button>
          </div>

          {/* Student Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">312</div>
                <p className="text-xs text-muted-foreground">Currently enrolled</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed Courses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">167</div>
                <p className="text-xs text-muted-foreground">Total completions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.2 weeks</div>
                <p className="text-xs text-muted-foreground">Per course</p>
              </CardContent>
            </Card>
          </div>

          {/* Students Table */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Students</CardTitle>
              <CardDescription>Students enrolled in your courses</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockRecentStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            <AvatarImage src={student.avatar} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                              {student.name.split(" ").map(n => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{student.course}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>{student.progress}%</span>
                          </div>
                          <Progress
                            value={student.progress}
                            className={`h-1.5 ${student.progress >= 80 ? "[&>div]:bg-green-500" : student.progress >= 50 ? "[&>div]:bg-amber-500" : "[&>div]:bg-blue-500"}`}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        2 hours ago
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Button variant="default" size="sm">Last 90 days</Button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{mockAnalytics.engagementRate}%</div>
                <Progress value={mockAnalytics.engagementRate} className="mt-2 h-2" />
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">+5% from last period</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Video Watch Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">1,247h</div>
                <p className="text-xs text-muted-foreground mt-2">Total hours watched</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Quiz Pass Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">76%</div>
                <Progress value={76} className="mt-2 h-2" />
                <p className="text-xs text-muted-foreground mt-2">Average across all quizzes</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">234</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-2">+28 this month</p>
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
                <div className="space-y-4">
                  {mockCourses.filter(c => c.status === "Published").map((course) => (
                    <div key={course.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium line-clamp-1">{course.title}</span>
                        <span className="text-sm text-muted-foreground">{course.students} students</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Student Progress Distribution</CardTitle>
                <CardDescription>How far students have progressed</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground">0-25%</div>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-red-400" style={{ width: "15%" }}></div>
                    </div>
                    <div className="w-12 text-sm text-right">15%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground">26-50%</div>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-amber-400" style={{ width: "22%" }}></div>
                    </div>
                    <div className="w-12 text-sm text-right">22%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground">51-75%</div>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-blue-400" style={{ width: "28%" }}></div>
                    </div>
                    <div className="w-12 text-sm text-right">28%</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 text-sm text-muted-foreground">76-100%</div>
                    <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden">
                      <div className="h-full bg-green-400" style={{ width: "35%" }}></div>
                    </div>
                    <div className="w-12 text-sm text-right">35%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}