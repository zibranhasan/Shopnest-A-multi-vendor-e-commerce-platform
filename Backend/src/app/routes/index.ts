import express from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";

export const router = express.Router();

const moduleRoutes = [
    {
        path: "/users",
        route: UserRoutes,
    },
    {
        path: "/auth",
        route: AuthRoutes,
    },
    // Add other module routes here
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
