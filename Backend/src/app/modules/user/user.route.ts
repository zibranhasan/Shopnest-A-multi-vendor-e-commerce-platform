import { Router } from "express";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "./user.interface.js";
import { uploadSingle } from "../../middlewares/upload.middleware.js";
import { UserControllers } from "./user.controller.js";
import { addAddressZodSchema, changeRoleZodSchema, changeStatusZodSchema, createUserZodSchema, updateAddressZodSchema, updateUserZodSchema } from "./user.validation.js";

const router = Router();

// ==========================================
// Public Routes
// ==========================================
router.post(
    "/register",
    validateRequest(createUserZodSchema),
    UserControllers.createUser,
);

// ==========================================
// Protected Routes (Any logged in user)
// ==========================================
const anyRole = Object.values(Role);

router.get("/me", checkAuth(...anyRole), UserControllers.getMyProfile);

router.patch(
    "/me",
    checkAuth(...anyRole),
    uploadSingle("picture"),
    validateRequest(updateUserZodSchema),
    UserControllers.updateUser,
);

router.delete("/me", checkAuth(...anyRole), UserControllers.deleteUser);

// ==========================================
// Customer Specific Routes
// ==========================================
// Address
router.post(
    "/me/addresses",
    checkAuth(Role.CUSTOMER),
    validateRequest(addAddressZodSchema),
    UserControllers.addAddress,
);

router.patch(
    "/me/addresses/:addressId",
    checkAuth(Role.CUSTOMER),
    validateRequest(updateAddressZodSchema),
    UserControllers.updateAddress,
);

router.delete(
    "/me/addresses/:addressId",
    checkAuth(Role.CUSTOMER),
    UserControllers.deleteAddress,
);

// Wishlist
router.post(
    "/me/wishlist",
    checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR),
    UserControllers.addToWishlist,
);

router.delete(
    "/me/wishlist/:productId",
    checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR),
    UserControllers.removeFromWishlist,
);

router.get(
    "/me/wishlist",
    checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR),
    UserControllers.getWishlist,
);

// ==========================================
// Admin & Super Admin Routes
// ==========================================
const adminRoles = [Role.ADMIN, Role.SUPER_ADMIN];

router.get("/", checkAuth(...adminRoles), UserControllers.getAllUsers);

router.get("/:id", checkAuth(...adminRoles), UserControllers.getUserById);

router.patch(
    "/:id/role",
    checkAuth(...adminRoles),
    validateRequest(changeRoleZodSchema),
    UserControllers.changeUserRole,
);

router.patch(
    "/:id/status",
    checkAuth(...adminRoles),
    validateRequest(changeStatusZodSchema),
    UserControllers.changeUserStatus,
);

export const UserRoutes = router;
