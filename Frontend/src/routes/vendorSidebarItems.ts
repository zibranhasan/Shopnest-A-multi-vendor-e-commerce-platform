import type { ISidebarItem } from "@/types";

import VendorShop from "@/pages/vendor/VendorShop";
import VendorProducts from "@/pages/vendor/VendorProducts";
import VendorOrders from "@/pages/vendor/VendorOrders";

export const vendorSidebarItems: ISidebarItem[] = [

    {
        title: "My Store",
        items: [
            { title: "My Shop", url: "/vendor/shop", component: VendorShop },
            { title: "Products", url: "/vendor/products", component: VendorProducts },
            { title: "Orders", url: "/vendor/orders", component: VendorOrders },
        ],
    },
];
