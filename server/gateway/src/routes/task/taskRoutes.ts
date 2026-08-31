import type { Router } from "express";
import { getAllTask } from "../../grpc/gRPCTaskClient";


export function taskRoutes(router:Router) {
    router.route('/').get(getAllTask);

    return router;
}