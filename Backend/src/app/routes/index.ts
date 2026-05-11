import express from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRoutes } from "../modules/auth/auth.route.js";
import { OtpRoutes } from "../modules/otp/otp.route.js";
import { ShopRoutes } from "../modules/shop/shop.route.js";
import { CategoryRoutes } from "../modules/category/category.route.js";
import { ProductRoutes } from "../modules/product/product.route.js";

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
    {
        path: "/categories",
        route: CategoryRoutes,
    },
    {
        path: "/products",
        route: ProductRoutes,
    },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));
