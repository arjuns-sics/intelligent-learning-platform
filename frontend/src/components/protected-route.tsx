/**
 * Protected Route Component
 * Redirects unauthenticated users to login page
 */

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks"
import { IconLoader2 } from "@tabler/icons-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "Student" | "Instructor" | "Admin"
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, role, isLoading } = useAuth()
  const location = useLocation()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-navpage flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <IconLoader2 className="size-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role-based access
  if (requiredRole && role !== requiredRole) {
    // User doesn't have the required role
    return (
      <div className="min-h-navpage flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
          <p className="text-muted-foreground mt-2">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute