import type { ISidebarItem } from "@/types";

import CustomerOrders from "@/pages/customer/CustomerOrders";
import CustomerWishlist from "@/pages/customer/CustomerWishlist";
import CustomerProfile from "@/pages/customer/CustomerProfile";
import CustomerAddresses from "@/pages/customer/CustomerAddresses";

export const customerSidebarItems: ISidebarItem[] = [

    {
        title: "My Account",
        items: [
            { title: "My Orders", url: "/customer/orders", component: CustomerOrders },
            { title: "Wishlist", url: "/customer/wishlist", component: CustomerWishlist },
            { title: "Profile", url: "/customer/profile", component: CustomerProfile },
            { title: "Addresses", url: "/customer/addresses", component: CustomerAddresses },
        ],
    },
];
