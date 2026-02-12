import { Routes, Route } from "react-router-dom"

import { ComponentExample } from "@/components/component-example"
import { Layout } from "@/components/layout"

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ComponentExample />} />
      </Route>
    </Routes>
  )
}

export default App