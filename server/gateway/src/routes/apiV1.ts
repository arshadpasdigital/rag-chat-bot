import type { Router,Express } from "express"
import { authRoutes } from "./auth/authRoutes"
import { taskRoutes } from "./task/taskRoutes"

export function apiV1(app:Express,routes:Router){
    const auth = authRoutes(routes)
    const task = taskRoutes(routes)

    app.use("/api/v1",auth)
    app.use('/api/v1/tasks',task)
    return app;
}