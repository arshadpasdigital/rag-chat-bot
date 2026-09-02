import { useNavigate } from "@tanstack/react-router"
import App, { type Page } from "@/App"

type WorkspacePage = Exclude<Page, "auth">

export function WorkspaceRoute({ page }: { page: WorkspacePage }) {
  const navigate = useNavigate()
  const go = (next: Page) => {
    if (next === "auth") return void navigate({ to: "/login" })
    if (next === "dashboard") return void navigate({ to: "/dashboard" })
    if (next === "builder")
      return void navigate({
        to: "/agents/$agentId/builder",
        params: { agentId: "inbound-qualifier" },
      })
    if (next === "knowledge")
      return void navigate({
        to: "/agents/$agentId/knowledge-base",
        params: { agentId: "inbound-qualifier" },
      })
    if (next === "playground")
      return void navigate({
        to: "/agents/$agentId/playground",
        params: { agentId: "inbound-qualifier" },
      })
    return void navigate({
      to: "/agents/$agentId/deploy",
      params: { agentId: "inbound-qualifier" },
    })
  }

  return <App initialPage={page} onNavigate={go} />
}
