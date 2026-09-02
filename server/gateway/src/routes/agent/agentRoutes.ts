import type { Router } from "express";


export function agentRoutes(router:Router) {
    router.route('/register').post();
    router.route('/verify-email').post();
    router.route("/login").post()

    return router;
}