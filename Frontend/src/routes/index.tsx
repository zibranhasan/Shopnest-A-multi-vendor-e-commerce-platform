import { createBrowserRouter, Navigate } from "react-router";
import CommonLayout from "@/components/layout/CommonLayout";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { generateRoutes } from "@/utils/generateRoutes";
import { adminSidebarItems } from "./adminSidebarItems";
import { vendorSidebarItems } from "./vendorSidebarItems";
import { customerSidebarItems } from "./customerSidebarItems";

// Pages
import Home from "@/pages/home/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Verify from "@/pages/auth/verify";
import Unauthorized from "@/pages/Unauthorized";
import { withAuth } from "@/utils/withAuth";
import { role } from "@/constants/role";
import { TRole } from "@/types";
import Products from "@/pages/products/Products";
import ProductDetails from "@/pages/products/ProductDetails";
import Shops from "@/pages/shops/Shops";
import ShopDetails from "@/pages/shops/ShopDetails";
import Cart from "@/pages/cart/Cart";
import Wishlist from "@/pages/wishlist/Wishlist";
import Checkout from "@/pages/checkout/Checkout";
import PaymentSuccess from "@/pages/payment/PaymentSuccess";
import PaymentFail from "@/pages/payment/PaymentFail";
import OrderDetail from "@/pages/customer/OrderDetail";

export const router = createBrowserRouter([
    // ==========================================
    // Public Routes
    // ==========================================
    {
        element: <CommonLayout />,
        children: [
            { path: "/", element: <Home /> },
            { path: "/login", element: <Login /> },
            { path: "/register", element: <Register /> },
            { path: "/verify", element: <Verify /> },
            // PRODUCTS
            { path: "/products", element: <Products /> },
            { path: "/products/:slug", element: <ProductDetails /> },

            // SHOPS
            { path: "/shops", element: <Shops /> },
            { path: "/shops/:slug", element: <ShopDetails /> },

            // CART
            { path: "/cart", element: <Cart /> },

            // WISHLIST
            { path: "/wishlist", element: <Wishlist /> },

            // CHECKOUT & PAYMENT
            { path: "/checkout", element: <Checkout /> },
            { path: "/payment/success", element: <PaymentSuccess /> },
            { path: "/payment/fail", element: <PaymentFail /> },
            { path: "/payment/cancel", element: <PaymentFail /> },
        ],
    },


    // ==========================================
    // Admin & Super Admin Routes
    // ==========================================
    {

        children: [
            {
                Component: withAuth(DashboardLayout, role.admin as TRole),
                path: "/admin",
                children: [{ index: true, element: <Navigate to="/admin/products" /> }, ...generateRoutes(adminSidebarItems)],
            },
        ],
    },

    // ==========================================
    // Vendor Routes
    // ==========================================
    {

        children: [
            {
                Component: withAuth(DashboardLayout, role.vendor as TRole),
                path: "/vendor",
                children: [{ index: true, element: <Navigate to="/vendor/shop" /> }, ...generateRoutes(vendorSidebarItems)],
            },
        ],
    },

    // ==========================================
    // Customer Routes
    // ==========================================
    {

        children: [
            {
                Component: withAuth(DashboardLayout, role.customer as TRole),
                path: "/customer",
                children: [
                    { index: true, element: <Navigate to="/customer/orders" /> },
                    ...generateRoutes(customerSidebarItems),
                    { path: "/customer/orders/:id", element: <OrderDetail /> },
                ],
            },
        ],
    },

    // ==========================================
    // Other Routes
    // ==========================================
    {
        path: "/unauthorized",
        element: <Unauthorized />,
    },
]);
