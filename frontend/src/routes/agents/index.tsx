import { createRoute, Outlet } from "@tanstack/react-router"
import { rootRoute } from "@/routes/__root"

export const agentsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "agents",
  component: () => <Outlet />,
})
