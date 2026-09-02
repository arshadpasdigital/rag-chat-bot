import { createRoute, Outlet } from "@tanstack/react-router"
import { agentsRoute } from "@/routes/agents"

export const agentRoute = createRoute({
  getParentRoute: () => agentsRoute,
  path: "$agentId",
  component: () => <Outlet />,
})
