import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { uploadSingle } from "../../middlewares/upload.middleware.js";
import { Role } from "../user/user.interface.js";
import { CategoryControllers } from "./category.controller.js";
import {
    createCategoryZodSchema,
    updateCategoryZodSchema,
} from "./category.validation.js";

const router = Router();

// ==========================================
// Admin & Super Admin Routes
// ==========================================
router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    uploadSingle("image"),
    validateRequest(createCategoryZodSchema),
    CategoryControllers.createCategory
);

// ==========================================
// Public Routes
// ==========================================
router.get("/", CategoryControllers.getAllCategories);

// ==========================================
// Admin Specific Update & Delete
// ==========================================
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    uploadSingle("image"),
    validateRequest(updateCategoryZodSchema),
    CategoryControllers.updateCategory
);

router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CategoryControllers.deleteCategory
);

// ==========================================
// Public Specific Get By Slug (Must be last)
// ==========================================
router.get("/:slug", CategoryControllers.getCategoryBySlug);

export const CategoryRoutes = router;
