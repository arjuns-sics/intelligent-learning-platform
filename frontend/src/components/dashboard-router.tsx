/**
 * Dashboard Router Component
 * Renders the appropriate dashboard based on user role
 */

import { useAuth } from "@/hooks";
import { StudentDashboardPage } from "@/pages/student-dashboard-page";
import { InstructorDashboardPage } from "@/pages/instructor-dashboard-page";

export function DashboardRouter() {
  const { role, isLoading } = useAuth();

  // Show loading state while checking authentication
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

  // Route to appropriate dashboard based on role
  switch (role) {
    case "Instructor":
      return <InstructorDashboardPage />;
    case "Admin":
      // For now, admins see the instructor dashboard
      // This can be changed to an AdminDashboardPage when created
      return <InstructorDashboardPage />;
    case "Student":
    default:
      return <StudentDashboardPage />;
  }
}