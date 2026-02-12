import { Routes, Route } from "react-router-dom"

import { LandingPage } from "@/components/landing-page"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App