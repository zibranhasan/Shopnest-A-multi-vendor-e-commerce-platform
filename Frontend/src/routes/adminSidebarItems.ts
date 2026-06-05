import type { ISidebarItem } from "@/types";

import AdminUsers from "@/pages/admin/AdminUsers";
import AdminShops from "@/pages/admin/AdminShops";
import AdminProducts from "@/pages/admin/AdminProducts";
import AdminCategories from "@/pages/admin/AdminCategories";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminCoupons from "@/pages/admin/AdminCoupons";

export const adminSidebarItems: ISidebarItem[] = [
    {
        title: "Management",
        items: [
            { title: "Products", url: "/admin/products", component: AdminProducts },
            { title: "Categories", url: "/admin/categories", component: AdminCategories },
            { title: "Shops", url: "/admin/shops", component: AdminShops },
            { title: "Users", url: "/admin/users", component: AdminUsers },


        ],
    },
    {
        title: "Sales",
        items: [
            { title: "Orders", url: "/admin/orders", component: AdminOrders },
            { title: "Coupons", url: "/admin/coupons", component: AdminCoupons },
        ],
    },
];
