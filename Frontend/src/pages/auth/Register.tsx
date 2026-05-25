// pages/auth/Register.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
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
import { useRegisterMutation } from "@/redux/features/auth/auth.api";

const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        phone: z
            .string()
            .min(11, "Phone must be at least 11 digits")
            .max(15, "Phone number is too long")
            .regex(/^[0-9]+$/, "Phone must contain only numbers"),
        password: z.string().min(6, "Password must be at least 6 characters"),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterFormData = z.infer<typeof registerSchema>;

const Register = () => {
    const navigate = useNavigate();
    const [registerUser] = useRegisterMutation();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        // Strip confirmPassword — API doesn't need it
        const { confirmPassword, ...payload } = data;

        try {
            await registerUser(payload).unwrap();
            toast.success("Account created! Please log in.");
            navigate("/login");
        } catch (err: any) {
            const message =
                err?.data?.message || "Registration failed. Please try again.";
            toast.error(message);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
            <div className="w-full max-w-md">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Create an account</CardTitle>
                        <CardDescription>
                            Fill in your details to get started
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            {/* Name */}
                            <div className="space-y-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Rahim Uddin"
                                    {...register("name")}
                                />
                                {errors.name && (
                                    <p className="text-sm text-destructive">
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Email */}
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

                            {/* Phone */}
                            <div className="space-y-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    type="tel"
                                    placeholder="01XXXXXXXXX"
                                    {...register("phone")}
                                />
                                {errors.phone && (
                                    <p className="text-sm text-destructive">
                                        {errors.phone.message}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
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

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-destructive">
                                        {errors.confirmPassword.message}
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
                                {isSubmitting ? "Creating account..." : "Register"}
                            </Button>

                            <p className="text-sm text-muted-foreground text-center">
                                Already have an account?{" "}
                                <Link
                                    to="/login"
                                    className="text-primary hover:underline font-medium"
                                >
                                    Login
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
};

export default Register;