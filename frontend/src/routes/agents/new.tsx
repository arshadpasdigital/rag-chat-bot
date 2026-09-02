import { createRoute } from "@tanstack/react-router"
import { WorkspaceRoute } from "@/features/workspace/routes/workspace-route"
import { agentsRoute } from "@/routes/agents"

export const newAgentRoute = createRoute({
  getParentRoute: () => agentsRoute,
  path: "new",
  component: () => <WorkspaceRoute page="builder" />,
})
