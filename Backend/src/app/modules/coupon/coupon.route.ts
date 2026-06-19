import express from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { Role } from "../user/user.interface.js";
import { CouponControllers } from "./coupon.controller.js";
import { CouponValidations } from "./coupon.validation.js";

const router = express.Router();

// 1. POST /coupons/apply (Customer only)
router.post(
    "/apply",
    checkAuth(Role.CUSTOMER),
    validateRequest(CouponValidations.applyCouponZodSchema),
    CouponControllers.applyCoupon
);

// Admin & Super Admin only routes
// 2. POST /coupons
router.post(
    "/",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(CouponValidations.createCouponZodSchema),
    CouponControllers.createCoupon
);

// 3. GET /coupons
router.get(
    "/",
    CouponControllers.getAllCoupons
);

// 4. GET /coupons/:id
router.get(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponControllers.getCouponById
);

// 5. PATCH /coupons/:id
router.patch(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(CouponValidations.updateCouponZodSchema),
    CouponControllers.updateCoupon
);

// 6. DELETE /coupons/:id
router.delete(
    "/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    CouponControllers.deleteCoupon
);

export const CouponRoutes = router;
