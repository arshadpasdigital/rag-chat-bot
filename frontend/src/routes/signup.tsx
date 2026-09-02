import { createRoute } from "@tanstack/react-router"
import { AuthRoute } from "@/features/auth/routes/auth-route"
import { rootRoute } from "@/routes/__root"

export const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "signup",
  component: () => <AuthRoute mode="signup" />,
})
