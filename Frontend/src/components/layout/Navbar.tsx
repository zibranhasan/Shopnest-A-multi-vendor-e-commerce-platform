import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Menu,
    ShoppingBag,
} from "lucide-react";

import ModeToggler from "./ModeToggler";
import {
    authApi,
    useLogoutMutation,
    useUserInfoQuery,
} from "@/redux/features/auth/auth.api";
import { useAppDispatch } from "@/redux/hook";
import { role } from "@/constants/role";

// ============ PUBLIC NAV LINKS ============
const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/shops", label: "Shops" },
];

export default function Navbar() {
    const location = useLocation();

    const { data } = useUserInfoQuery(undefined);
    const [logout] = useLogoutMutation();
    const dispatch = useAppDispatch();

    // ============ DASHBOARD LINK ============
    const dashboardLink =
        data?.data?.role === role.admin ||
            data?.data?.role === role.superAdmin
            ? "/admin"
            : data?.data?.role === role.vendor
                ? "/vendor"
                : data?.data?.role === role.customer
                    ? "/customer"
                    : null;

    // ============ CHECK IF INSIDE DASHBOARD ============
    const isDashboardRoute =
        location.pathname.startsWith("/admin") ||
        location.pathname.startsWith("/vendor") ||
        location.pathname.startsWith("/customer");

    // ============ LOGOUT ============
    const handleLogout = async () => {
        await logout(undefined);
        dispatch(authApi.util.resetApiState());
    };

    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-6">

                    {/* MOBILE MENU */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent
                            align="start"
                            className="w-52 rounded-2xl border-border/50 bg-background/95 p-2 backdrop-blur-xl"
                        >
                            <nav className="flex flex-col gap-1">

                                {/* PUBLIC LINKS */}
                                {navigationLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                {/* DASHBOARD LINK */}
                                {dashboardLink && !isDashboardRoute && (
                                    <Link
                                        to={dashboardLink}
                                        className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        Dashboard
                                    </Link>
                                )}
                            </nav>
                        </PopoverContent>
                    </Popover>

                    {/* LOGO */}
                    <Link
                        to="/"
                        className="flex items-center gap-3"
                    >
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <ShoppingBag className="h-5 w-5" />
                        </div>

                        <span className="text-xl font-bold tracking-tight">
                            Shopnest
                        </span>
                    </Link>

                    {/* DESKTOP NAV */}
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList className="gap-2">

                            {/* PUBLIC LINKS */}
                            {navigationLinks.map((link) => (
                                <NavigationMenuItem key={link.href}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to={link.href}
                                            className="group inline-flex h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}

                            {/* DASHBOARD LINK */}
                            {dashboardLink && !isDashboardRoute && (
                                <NavigationMenuItem>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to={dashboardLink}
                                            className="group inline-flex h-10 items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                                        >
                                            Dashboard
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            )}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-2">

                    {/* THEME TOGGLER */}
                    <ModeToggler />

                    {/* AUTH BUTTONS */}
                    {data?.data?.email ? (
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="rounded-xl text-sm"
                        >
                            Logout
                        </Button>
                    ) : (
                        <>
                            <Button
                                asChild
                                variant="ghost"
                                className="hidden sm:inline-flex rounded-xl"
                            >
                                <Link to="/login">Login</Link>
                            </Button>

                            <Button
                                asChild
                                className="rounded-xl shadow-lg shadow-primary/20"
                            >
                                <Link to="/register">Register</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}