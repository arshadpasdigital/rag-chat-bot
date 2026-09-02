import { createRouter } from "@tanstack/react-router"
import { agentRoute } from "@/routes/agents/$agentId"
import { agentBuilderRoute } from "@/routes/agents/$agentId/builder"
import { agentDeployRoute } from "@/routes/agents/$agentId/deploy"
import { agentKnowledgeRoute } from "@/routes/agents/$agentId/knowledge-base"
import { agentPlaygroundRoute } from "@/routes/agents/$agentId/playground"
import { agentsRoute } from "@/routes/agents"
import { dashboardRoute } from "@/routes/dashboard"
import { indexRoute } from "@/routes"
import { loginRoute } from "@/routes/login"
import { rootRoute } from "@/routes/__root"
import { signupRoute } from "@/routes/signup"
import { newAgentRoute } from "@/routes/agents/new"

const routeTree = rootRoute.addChildren([
  indexRoute,
  dashboardRoute,
  loginRoute,
  signupRoute,
  agentsRoute.addChildren([
    newAgentRoute,
    agentRoute.addChildren([
      agentBuilderRoute,
      agentKnowledgeRoute,
      agentPlaygroundRoute,
      agentDeployRoute,
    ]),
  ]),
])

export const router = createRouter({ routeTree, defaultPreload: "intent" })

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
