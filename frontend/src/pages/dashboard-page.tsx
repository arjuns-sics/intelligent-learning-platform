/**
 * Dashboard Page
 * Protected page shown after successful login
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
import {
  IconBook,
  IconTrophy,
  IconTarget,
  IconLogout,
  IconUser,
  IconSettings,
  IconChartBar,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks";
import { Link } from "react-router-dom";

export function DashboardPage() {
  const { user, role, logout } = useAuth();

  // Get role-specific styling
  const getRoleBadgeVariant = () => {
    switch (role) {
      case "Admin":
        return "destructive";
      case "Instructor":
        return "default";
      case "Student":
      default:
        return "secondary";
    }
  };

  return (
    <div className="container py-8 px-4 md:px-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.name || "User"}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's an overview of your learning progress
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={getRoleBadgeVariant()} className="text-sm">
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mastery Score
            </CardTitle>
            <IconTrophy className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.masteryScore?.toFixed(1) || "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Keep learning to improve
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Courses Enrolled
            </CardTitle>
            <IconBook className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Start exploring courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Weakness Tags
            </CardTitle>
            <IconTarget className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user?.weaknessTags?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Areas to focus on
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Learning Streak
            </CardTitle>
            <IconChartBar className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 days</div>
            <p className="text-xs text-muted-foreground">
              Start your streak today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUser className="size-5" />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {user?.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {user?.preferredMedia && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground">Preferred Media:</p>
                <Badge variant="outline" className="mt-1">
                  {user.preferredMedia}
                </Badge>
              </div>
            )}

            {user?.weaknessTags && user.weaknessTags.length > 0 && (
              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-2">
                  Weakness Tags:
                </p>
                <div className="flex flex-wrap gap-1">
                  {user.weaknessTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <Button variant="outline" className="h-auto py-4 justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconBook className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Browse Courses</p>
                    <p className="text-xs text-muted-foreground">
                      Explore available courses
                    </p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconTarget className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Take Assessment</p>
                    <p className="text-xs text-muted-foreground">
                      Test your knowledge
                    </p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconChartBar className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">View Progress</p>
                    <p className="text-xs text-muted-foreground">
                      Track your learning
                    </p>
                  </div>
                </div>
              </Button>

              <Button variant="outline" className="h-auto py-4 justify-start">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <IconTrophy className="size-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Achievements</p>
                    <p className="text-xs text-muted-foreground">
                      View your badges
                    </p>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}