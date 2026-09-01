import type { Router } from "express";
import { getAllTask, postChat } from "../../grpc/gRPCTaskClient";


export function taskRoutes(router:Router) {
    router.route('/').get(getAllTask);
    router.route('/chats').post(postChat)
    return router;
}