import { Routes, Route, Navigate } from "react-router-dom"

import { LandingPage } from "@/components/landing-page"
import { LoginPage } from "./components/login-page"
import { SignupPage } from "./components/signup-page"
import { ForgotPasswordPage } from "./components/forgot-password-page"
import { Layout } from "./components/layout"
import { applyTheme, useTheme } from "./lib/theme"

export function App() {
  const { theme } = useTheme()
  applyTheme(theme)

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* <Route path="/settings" element={<SettingsPage />} /> */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
