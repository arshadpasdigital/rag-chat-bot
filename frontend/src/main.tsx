import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"

import "./index.css"
import { AppProviders } from "@/app/providers"
import { router } from "@/app/router"
import { ThemeProvider } from "@/components/theme-provider.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </AppProviders>
  </StrictMode>
)
