import { Routes, Route, Navigate } from "react-router-dom"

import { LandingPage, LoginPage, SignupPage, ForgotPasswordPage, CourseCreatePage, CourseBrowsePage, CourseDetailPage, CourseEnrollPage, CourseEditPage, InstructorCourseViewPage } from "@/pages"
import { Layout } from "./components/layout"
import { ProtectedRoute } from "./components/protected-route"
import { DashboardRouter } from "./components/dashboard-router"
import { applyTheme, useTheme } from "./lib/theme"

export function App() {
  const { theme } = useTheme()
  applyTheme(theme)

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* Public routes */}
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* Course routes */}
        <Route
          path="/courses/browse"
          element={
            <ProtectedRoute>
              <CourseBrowsePage />
            </ProtectedRoute>
          }
        />

        {/* Course detail - accessible to all authenticated users */}
        <Route
          path="/courses/:courseId"
          element={
            <ProtectedRoute>
              <CourseDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Course enrollment - accessible to students */}
        <Route
          path="/courses/:courseId/enroll"
          element={
            <ProtectedRoute requiredRole="Student">
              <CourseEnrollPage />
            </ProtectedRoute>
          }
        />

        {/* Instructor routes - specific routes before dynamic routes */}
        <Route
          path="/courses/create"
          element={
            <ProtectedRoute requiredRole="Instructor">
              <CourseCreatePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId/edit"
          element={
            <ProtectedRoute requiredRole="Instructor">
              <CourseEditPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/courses/:courseId/instructor"
          element={
            <ProtectedRoute requiredRole="Instructor">
              <InstructorCourseViewPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
