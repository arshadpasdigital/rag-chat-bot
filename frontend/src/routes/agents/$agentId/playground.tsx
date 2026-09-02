import { createRoute } from "@tanstack/react-router"
import { WorkspaceRoute } from "@/features/workspace/routes/workspace-route"
import { agentRoute } from "@/routes/agents/$agentId"

export const agentPlaygroundRoute = createRoute({
  getParentRoute: () => agentRoute,
  path: "playground",
  component: () => <WorkspaceRoute page="playground" />,
})
