import { createRoute } from "@tanstack/react-router"
import { WorkspaceRoute } from "@/features/workspace/routes/workspace-route"
import { agentRoute } from "@/routes/agents/$agentId"

export const agentBuilderRoute = createRoute({
  getParentRoute: () => agentRoute,
  path: "builder",
  component: () => <WorkspaceRoute page="builder" />,
})
