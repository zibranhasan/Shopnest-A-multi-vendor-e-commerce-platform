import * as React from "react";

import { Link, useLocation } from "react-router";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { getSidebarItems } from "@/utils/getSidebarItems";

export function AppSidebar({
    ...props
}: React.ComponentProps<typeof Sidebar>) {

    const location = useLocation();

    const { data: userData } = useUserInfoQuery(undefined);

    const data = {
        navMain: getSidebarItems(userData?.data?.role),
    };

    return (
        <Sidebar
            collapsible="offcanvas"
            className="border-r bg-background/80 backdrop-blur-xl"
            {...props}
        >
            <SidebarContent className="pt-6 mt-14">

                {data.navMain.map((group) => (
                    <SidebarGroup
                        key={group.title}
                        className="px-3"
                    >
                        <SidebarGroupLabel
                            className="
                                px-3
                                text-xs
                                font-semibold
                                uppercase
                                tracking-wider
                                text-muted-foreground
                            "
                        >
                            {group.title}
                        </SidebarGroupLabel>

                        <SidebarGroupContent>
                            <SidebarMenu className="gap-1">

                                {group.items.map((item) => {

                                    const isActive =
                                        location.pathname === item.url;

                                    return (
                                        <SidebarMenuItem key={item.title}>

                                            <SidebarMenuButton
                                                asChild
                                                isActive={isActive}
                                                className="
                                                    h-11
                                                    rounded-xl
                                                    px-4
                                                    text-sm
                                                    font-medium
                                                    transition-all
                                                    duration-200
                                                    hover:bg-primary/10
                                                    hover:text-primary
                                                    data-[active=true]:bg-primary
                                                    data-[active=true]:text-primary-foreground
                                                "
                                            >
                                                <Link to={item.url}>
                                                    {item.title}
                                                </Link>
                                            </SidebarMenuButton>

                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    );
}