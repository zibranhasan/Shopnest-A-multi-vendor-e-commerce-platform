import { Router } from "express";
import { checkAuth } from "../../middlewares/checkAuth.js";
import { uploadArray } from "../../middlewares/upload.middleware.js";
import { validateRequest } from "../../middlewares/validateRequest.js";
import { Role } from "../user/user.interface.js";
import { ProductControllers } from "./product.controller.js";
import { ProductValidations } from "./product.validation.js";

const router = Router();

// 1. GET /products/admin/all (before /:slug)
router.get(
    "/admin/all",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    ProductControllers.getAllProductsAdmin
);

// 2. PATCH /products/admin/:id/status
router.patch(
    "/admin/:id/status",
    checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
    validateRequest(ProductValidations.updateProductStatusZodSchema),
    ProductControllers.updateProductStatus
);

// 3. GET /products/my-products (before /:slug)
router.get(
    "/my-products",
    checkAuth(Role.VENDOR),
    ProductControllers.getMyProducts
);

// 4. POST /products
router.post(
    "/",
    checkAuth(Role.VENDOR),
    uploadArray("images", 5),
    validateRequest(ProductValidations.createProductZodSchema),
    ProductControllers.createProduct
);

// 5. PATCH /products/:id
router.patch(
    "/:id",
    checkAuth(Role.VENDOR),
    uploadArray("images", 5),
    validateRequest(ProductValidations.updateProductZodSchema),
    ProductControllers.updateProduct
);

// 6. DELETE /products/:id
router.delete(
    "/:id",
    checkAuth(Role.VENDOR),
    ProductControllers.deleteProduct
);

// 7. GET /products (public)
router.get(
    "/",
    ProductControllers.getAllProductsPublic
);

// 8. GET /products/:slug (last)
router.get(
    "/:slug",
    ProductControllers.getProductBySlug
);

export const ProductRoutes = router;
