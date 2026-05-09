import express from "express";
import { UserRoutes } from "../modules/user/user.route.js";

export const router = express.Router();

const moduleRoutes = [
    {
        path: "/users",
        route: UserRoutes,
    },
    // Add other module routes here
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
