import { role } from "@/constants/role";
import { adminSidebarItems } from "@/routes/adminSidebarItems";
import { vendorSidebarItems } from "@/routes/vendorSidebarItems";
import { customerSidebarItems } from "@/routes/customerSidebarItems";
import type { TRole } from "@/types";

export const getSidebarItems = (userRole: TRole) => {
    switch (userRole) {
        case role.superAdmin:
        case role.admin:
            return adminSidebarItems;
        case role.vendor:
            return vendorSidebarItems;
        case role.customer:
            return customerSidebarItems;
        default:
            return [];
    }
};
