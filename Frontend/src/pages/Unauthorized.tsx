import { Link } from "react-router";
import { Button } from "@/components/ui/button";

const Unauthorized = () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="text-xl text-muted-foreground">You don't have permission to access this page</p>
        <Button asChild><Link to="/">Go Home</Link></Button>
    </div>
);

export default Unauthorized;
