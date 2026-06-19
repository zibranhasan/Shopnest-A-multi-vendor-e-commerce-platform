import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { uploadArray } from "../../middlewares/upload.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { Role } from "../user/user.interface.js";
import { ReviewControllers } from "./review.controller.js";
import { ReviewValidations } from "./review.validation.js";

const router = Router();

// === CRITICAL ROUTE ORDER ===

// 1. GET /reviews/admin/all (before /:id)
router.get(
    "/admin/all",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ReviewControllers.getAllReviewsAdmin
);

// 2. GET /reviews/can-review/:productId
router.get(
    "/can-review/:productId",
    checkAuth(Role.CUSTOMER),
    ReviewControllers.checkCanReview
);

// 3. GET /reviews/product/:productId
router.get(
    "/product/:productId",
    ReviewControllers.getProductReviews
);

// 4. POST /reviews
router.post(
    "/",
    checkAuth(Role.CUSTOMER),
    uploadArray("images", 3),
    validateRequest(ReviewValidations.createReviewZodSchema),
    ReviewControllers.createReview
);

// 5. PATCH /reviews/:id
router.patch(
    "/:id",
    checkAuth(Role.CUSTOMER),
    validateRequest(ReviewValidations.updateReviewZodSchema),
    ReviewControllers.updateReview
);

// 6. DELETE /reviews/:id
router.delete(
    "/:id",
    checkAuth(Role.CUSTOMER, Role.ADMIN, Role.SUPER_ADMIN),
    ReviewControllers.deleteReview
);

export const ReviewRoutes = router;
