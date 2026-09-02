import { createRoute } from "@tanstack/react-router"
import { WorkspaceRoute } from "@/features/workspace/routes/workspace-route"
import { agentRoute } from "@/routes/agents/$agentId"

export const agentKnowledgeRoute = createRoute({
  getParentRoute: () => agentRoute,
  path: "knowledge-base",
  component: () => <WorkspaceRoute page="knowledge" />,
})
