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
        ],
    },

    // ==========================================
    // Admin & Super Admin Routes
    // ==========================================
    {

        children: [
            {
                path: "/admin",
                element: <DashboardLayout />,
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
                path: "/vendor",
                element: <DashboardLayout />,
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
                path: "/customer",
                element: <DashboardLayout />,
                children: [{ index: true, element: <Navigate to="/customer/orders" /> }, ...generateRoutes(customerSidebarItems)],
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
