import { createRoute } from "@tanstack/react-router"
import { LandingPage } from "@/features/landing/components/LandingPage"
import { rootRoute } from "@/routes/__root"

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
})
