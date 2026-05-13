import express from "express";
import { PaymentControllers } from "./payment.controller.js";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { Role } from "../user/user.interface.js";

const router = express.Router();

router.post("/init/:orderId", checkAuth(Role.CUSTOMER), PaymentControllers.initPayment);

router.post("/success", PaymentControllers.successPayment);
router.post("/fail", PaymentControllers.failPayment);
router.post("/cancel", PaymentControllers.cancelPayment);

export const PaymentRoutes = router;
