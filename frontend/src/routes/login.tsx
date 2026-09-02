import { createRoute } from "@tanstack/react-router"
import { AuthRoute } from "@/features/auth/routes/auth-route"
import { rootRoute } from "@/routes/__root"

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "login",
  component: () => <AuthRoute mode="login" />,
})
