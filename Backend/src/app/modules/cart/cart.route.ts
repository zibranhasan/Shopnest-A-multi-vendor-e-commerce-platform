import express from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";
import { CartControllers } from "./cart.controller.js";

const router = express.Router();

// 1. GET /cart (Customer only)
router.get("/", checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR), CartControllers.getCart);

// 2. POST /cart (Customer only)
router.post("/", checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR), CartControllers.addToCart);

// 3. DELETE /cart (Customer only)
router.delete("/", checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR), CartControllers.clearCart);

// 4. PATCH /cart/:productId (Customer only)
router.patch("/:productId", checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR), CartControllers.updateQuantity);

// 5. DELETE /cart/:productId (Customer only)
router.delete("/:productId", checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN, Role.VENDOR), CartControllers.removeFromCart);

export const CartRoutes = router;
