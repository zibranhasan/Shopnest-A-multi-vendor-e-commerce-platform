import express from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { OrderValidations } from "./order.validation.js";
import { OrderControllers } from "./order.controller.js";

const router = express.Router();

// Admin only routes
router.get(
    "/admin/all",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    OrderControllers.getAllOrdersAdmin
);

router.get(
    "/admin/:id",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    OrderControllers.getOrderByIdAdmin
);

// Customer only routes
router.get(
    "/my-orders",
    checkAuth(Role.CUSTOMER),
    OrderControllers.getMyOrders
);

router.get(
    "/my-orders/:id",
    checkAuth(Role.CUSTOMER),
    OrderControllers.getMyOrderById
);

router.post(
    "/",
    checkAuth(Role.CUSTOMER),
    validateRequest(OrderValidations.placeOrderZodSchema),
    OrderControllers.placeOrder
);

router.patch(
    "/:id/cancel",
    checkAuth(Role.CUSTOMER),
    OrderControllers.cancelOrder
);

export const OrderRoutes = router;
