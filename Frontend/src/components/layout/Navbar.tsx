import { Link } from "react-router";
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
import { authApi, useLogoutMutation, useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useAppDispatch } from "@/redux/hook";

const navigationLinks = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/shops", label: "Shops" },
];

export default function Navbar() {
    const { data } = useUserInfoQuery(undefined);
    const [logout] = useLogoutMutation();
    const dispatch = useAppDispatch();
    console.log("data from /me", data?.data?.email);

    const handleLogout = async () => {
        await logout(undefined);
        dispatch(authApi.util.resetApiState());
    }
    return (
        <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">

                {/* LEFT SIDE */}
                <div className="flex items-center gap-8">

                    {/* Mobile Menu */}
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
                            className="w-52 rounded-2xl border-border/50 bg-background/95 backdrop-blur-xl"
                        >
                            <nav className="flex flex-col gap-1">
                                {navigationLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        to={link.href}
                                        className="rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>
                        </PopoverContent>
                    </Popover>

                    {/* LOGO */}
                    <Link
                        to="/"
                        className="flex items-center gap-2"
                    >
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                            <ShoppingBag className="h-5 w-5" />
                        </div>

                        <span className="text-lg font-bold tracking-tight">
                            Shopnest
                        </span>
                    </Link>

                    {/* DESKTOP NAV */}
                    <NavigationMenu className="hidden md:flex">
                        <NavigationMenuList className="gap-2">
                            {navigationLinks.map((link) => (
                                <NavigationMenuItem key={link.href}>
                                    <NavigationMenuLink asChild>
                                        <Link
                                            to={link.href}
                                            className="group inline-flex h-10 w-max items-center justify-center rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                                        >
                                            {link.label}
                                        </Link>
                                    </NavigationMenuLink>
                                </NavigationMenuItem>
                            ))}
                        </NavigationMenuList>
                    </NavigationMenu>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-2">
                    <ModeToggler />
                    {data?.data?.email && (
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="text-sm"
                        >
                            Logout
                        </Button>
                    )}
                    {!data?.data?.email && (
                        <Button asChild className="text-sm">
                            <Link to="/login">Login</Link>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}