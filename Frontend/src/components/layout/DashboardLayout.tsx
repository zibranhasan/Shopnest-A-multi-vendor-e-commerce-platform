import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "./Navbar";

import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import { Outlet } from "react-router";

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-muted/20">

            {/* NAVBAR */}
            <Navbar />

            {/* DASHBOARD */}
            <SidebarProvider defaultOpen>

                {/* SIDEBAR */}
                <AppSidebar />

                {/* MAIN CONTENT */}
                <SidebarInset className="bg-muted/20">

                    {/* MOBILE TRIGGER */}
                    <div className="flex h-14 items-center border-b bg-background px-4 md:hidden">
                        <SidebarTrigger />
                    </div>

                    {/* PAGE CONTENT */}
                    <main className="p-4 md:p-8">
                        <div className="mx-auto rounded-3xl border bg-background p-6 shadow-sm">
                            <Outlet />
                        </div>
                    </main>

                </SidebarInset>
            </SidebarProvider>
        </div>
    );
}