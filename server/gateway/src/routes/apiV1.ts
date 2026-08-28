import type { Router,Express } from "express"
import { authRoutes } from "./auth/authRoutes"

export function apiV1(app:Express,routes:Router){
    const auth = authRoutes(routes)

    app.use("/api/v1",auth)
    return app;
}