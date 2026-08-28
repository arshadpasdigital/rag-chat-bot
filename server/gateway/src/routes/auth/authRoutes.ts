import type { Router } from "express";
import { registerUser } from "../../grpc/gRPCAuthClient";


export function authRoutes(router:Router) {
    router.route('/register').post(registerUser)

    return router;
}