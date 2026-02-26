import { Routes, Route, Navigate } from "react-router-dom"

import { LandingPage, LoginPage, SignupPage, ForgotPasswordPage } from "@/pages"
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
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
