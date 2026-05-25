import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function Navbar() {
    return (
        <header className="border-b">
            <div className="container mx-auto px-4 flex h-16 items-center justify-between">
                {/* Logo */}
                <Link to="/" className="text-xl font-bold text-primary">
                    Shopnest
                </Link>

                {/* Nav Links */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        to="/"
                        className="text-muted-foreground hover:text-primary font-medium"
                    >
                        Home
                    </Link>
                    <Link
                        to="/products"
                        className="text-muted-foreground hover:text-primary font-medium"
                    >
                        Products
                    </Link>
                    <Link
                        to="/shops"
                        className="text-muted-foreground hover:text-primary font-medium"
                    >
                        Shops
                    </Link>
                </nav>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                    <Button asChild variant="outline" className="text-sm">
                        <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="text-sm">
                        <Link to="/register">Register</Link>
                    </Button>
                </div>
            </div>
        </header>
    );
}