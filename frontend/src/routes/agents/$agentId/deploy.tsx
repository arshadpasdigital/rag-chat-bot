import { createRoute } from "@tanstack/react-router"
import { WorkspaceRoute } from "@/features/workspace/routes/workspace-route"
import { agentRoute } from "@/routes/agents/$agentId"

export const agentDeployRoute = createRoute({
  getParentRoute: () => agentRoute,
  path: "deploy",
  component: () => <WorkspaceRoute page="deploy" />,
})
