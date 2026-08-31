import type { Router } from "express";
import { loginUser, registerUser, verifiedEmailUser } from "../../grpc/gRPCAuthClient";


export function authRoutes(router:Router) {
    router.route('/register').post(registerUser);
    router.route('/verify-email').post(verifiedEmailUser);
    router.route("/login").post(loginUser)

    return router;
}