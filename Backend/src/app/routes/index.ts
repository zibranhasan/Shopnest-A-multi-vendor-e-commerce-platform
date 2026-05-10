import express from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { OtpRoutes } from "../modules/otp/otp.route.js";
import { ShopRoutes } from "../modules/shop/shop.route.js";

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
    {
        path: "/otp",
        route: OtpRoutes,
    },
    {
        path: "/shops",
        route: ShopRoutes,
    },
    // Add other module routes here
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
