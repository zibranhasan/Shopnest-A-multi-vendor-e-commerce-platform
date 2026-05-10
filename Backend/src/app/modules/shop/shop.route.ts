import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { uploadFields } from "../../middlewares/upload.middleware.js";
import { Role } from "../user/user.interface.js";
import { ShopControllers } from "./shop.controller.js";
import {
    createShopZodSchema,
    updateShopStatusZodSchema,
    updateShopZodSchema,
} from "./shop.validation.js";

const router = Router();

// ==========================================
// Admin & Super Admin Routes (Must be before /:slug)
// ==========================================
router.get(
    "/admin/all",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ShopControllers.getAllShopsAdmin
);

router.get(
    "/admin/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ShopControllers.getShopByIdAdmin
);

router.patch(
    "/admin/:id/status",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(updateShopStatusZodSchema),
    ShopControllers.updateShopStatus
);

// ==========================================
// Vendor Specific Routes
// ==========================================
router.get(
    "/my-shop",
    checkAuth(Role.VENDOR),
    ShopControllers.getMyShop
);

router.post(
    "/",
    checkAuth(Role.VENDOR),
    uploadFields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    validateRequest(createShopZodSchema),
    ShopControllers.createShop
);

router.patch(
    "/my-shop",
    checkAuth(Role.VENDOR),
    uploadFields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 1 },
    ]),
    validateRequest(updateShopZodSchema),
    ShopControllers.updateMyShop
);

router.delete(
    "/my-shop",
    checkAuth(Role.VENDOR),
    ShopControllers.deleteMyShop
);

// ==========================================
// Public Routes
// ==========================================
router.get("/", ShopControllers.getAllShopsPublic);

router.get("/:slug", ShopControllers.getShopBySlug);

export const ShopRoutes = router;
