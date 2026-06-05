// pages/auth/Login.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { toast } from "sonner";
import { useLoginMutation } from "@/redux/features/auth/auth.api";
import config from "@/config";

const loginSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [login] = useLoginMutation();

    const redirect = searchParams.get("redirect") || "/";

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            const res = await login(data).unwrap();
            // console.log("Data From Form", data);
            // console.log("Data From Response", res);
            if (res.success) {
                toast.success("Logged in successfully");
                navigate(redirect);
            }
        } catch (err: any) {
            console.error(err);

            if (err?.data?.message === "Password does not match") {
                toast.error("Invalid credentials");
            }

            if (err?.data?.message === "User is not verified") {
                toast.error("Your account is not verified");
                navigate("/verify", {
                    state: { email: data.email }
                });
            }
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Welcome back</CardTitle>
                        <CardDescription>
                            Enter your credentials to login to your account
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="rahim@gmail.com"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-sm text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Logging in..." : "Login"}
                            </Button>
                            {/* Social Logins */}
                            <div className="grid grid-cols-2 gap-3 mb-6">

                                <Button
                                    onClick={() => window.location.href = `${config.API_URL}/auth/google?redirect=${encodeURIComponent(redirect)}`}
                                    type="button"
                                    variant="outline"
                                    className="h-11 rounded-xl font-medium border border-border/60 bg-background/40 hover:bg-muted/70 hover:text-foreground hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                                    aria-label="Register with Google"
                                >
                                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    <span className="text-sm">Google</span>
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="h-11 rounded-xl font-medium border border-border/60 bg-background/40 hover:bg-muted/70 hover:text-foreground hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
                                    aria-label="Register with GitHub"
                                >
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    <span className="text-sm">GitHub</span>
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground text-center">
                                Don't have an account?{" "}
                                <Link
                                    to="/register"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Register
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Login;