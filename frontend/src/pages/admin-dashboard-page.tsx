/**
 * Admin Dashboard Page
 * Main dashboard for administrators with overview statistics and quick actions
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUsers,
  IconBook,
  IconUserCheck,
  IconLogout,
  IconSettings,
  IconTrendingUp,
  IconClock,
  IconChevronRight,
  IconDatabase,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks";
import { getDashboardStats, type AdminDashboardStats } from "@/services/admin.service";

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await getDashboardStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || "Failed to load dashboard statistics");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error("Dashboard stats error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <div className="flex items-center justify-center min-h-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage users, courses, and view platform statistics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="destructive" className="text-sm">
            Administrator
          </Badge>
          <Button variant="outline" size="sm" onClick={() => navigate("/settings")}>
            <IconSettings className="size-4 mr-2" />
            Settings
          </Button>
          <Button variant="destructive" size="sm" onClick={logout}>
            <IconLogout className="size-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {/* Welcome Card */}
      <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconDatabase className="size-5 text-primary" />
            Welcome back, {user?.name || "Administrator"}!
          </CardTitle>
          <CardDescription>
            You have full access to manage users and courses on the platform
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Overview Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <IconUsers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.usersByRole.students || 0} students, {stats?.usersByRole.instructors || 0} instructors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Courses
            </CardTitle>
            <IconBook className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.totalCourses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.overview.publishedCourses || 0} published, {stats?.overview.draftCourses || 0} drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Enrollments
            </CardTitle>
            <IconUserCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.overview.totalEnrollments || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active course enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Platform Health
            </CardTitle>
            <IconTrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              Healthy
            </div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Management Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        {/* User Management Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/users")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="size-5 text-primary" />
              User Management
            </CardTitle>
            <CardDescription>
              Manage user accounts, roles, and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats?.usersByRole.students || 0}</Badge>
                  <span className="text-sm text-muted-foreground">Students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{stats?.usersByRole.instructors || 0}</Badge>
                  <span className="text-sm text-muted-foreground">Instructors</span>
                </div>
              </div>
              <IconChevronRight className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Course Management Card */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/admin/courses")}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconBook className="size-5 text-primary" />
              Course Management
            </CardTitle>
            <CardDescription>
              Manage courses, content, and publications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="grid gap-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    {stats?.overview.publishedCourses || 0}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Published</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    {stats?.overview.draftCourses || 0}
                  </Badge>
                  <span className="text-sm text-muted-foreground">Drafts</span>
                </div>
              </div>
              <IconChevronRight className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconClock className="size-5 text-primary" />
              Recent Courses
            </CardTitle>
            <CardDescription>
              Latest courses added to the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.recentCourses && stats.recentCourses.length > 0 ? (
              <div className="space-y-3">
                {stats.recentCourses.slice(0, 5).map((course) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="text-xs"
                        >
                          {course.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {course.enrolledStudents} students
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/courses`);
                      }}
                    >
                      <IconChevronRight className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent courses
              </p>
            )}
          </CardContent>
        </Card>

        {/* Top Courses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTrendingUp className="size-5 text-primary" />
              Top Courses
            </CardTitle>
            <CardDescription>
              Most popular courses by enrollment
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats?.topCourses && stats.topCourses.length > 0 ? (
              <div className="space-y-3">
                {stats.topCourses.slice(0, 5).map((course, index) => (
                  <div
                    key={course._id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm truncate">{course.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {course.enrolledStudents} students
                          </span>
                          {course.rating > 0 && (
                            <span className="text-xs text-yellow-600">
                              ★ {course.rating.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/courses`);
                      }}
                    >
                      <IconChevronRight className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No top courses yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-destructive text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={loadDashboardStats}
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
