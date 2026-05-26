// pages/auth/Register.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRegisterMutation } from "@/redux/features/auth/auth.api";
import { User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import config from "@/config";

// ============= SCHEMA ==============
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

// ============ INPUT FIELD COMPONENT ============
const FormField = ({
    id,
    label,
    type = "text",
    placeholder,
    icon: Icon,
    error,
    register,
    rightElement,
}: {
    id: string;
    label: string;
    type?: string;
    placeholder: string;
    icon: any;
    error?: string;
    register: any;
    rightElement?: React.ReactNode;
}) => (
    <div className="space-y-1.5 w-full">
        <Label htmlFor={id} className="text-sm font-medium text-foreground/90 select-none">
            {label}
        </Label>
        <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors duration-200 pointer-events-none">
                <Icon className="h-4 w-4" />
            </div>
            <Input
                id={id}
                type={type}
                placeholder={placeholder}
                className="pl-11 pr-11 h-11 rounded-xl bg-background/50 border border-border/50 focus-visible:border-primary/45 focus-visible:ring-4 focus-visible:ring-primary/10 transition-all duration-200 font-normal shadow-sm placeholder:text-muted-foreground/40 focus:bg-background/80 w-full"
                {...register}
            />
            {rightElement && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                    {rightElement}
                </div>
            )}
        </div>
        {error && (
            <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                <span className="text-[10px]">⚠</span> {error}
            </p>
        )}
    </div>
);

// ============ REGISTER PAGE ============
const Register = () => {
    const navigate = useNavigate();
    const [registerUser] = useRegisterMutation();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        const { confirmPassword, ...payload } = data;
        try {
            await registerUser(payload).unwrap();
            toast.success("Account created! Please verify your email.");
            navigate("/login");
        } catch (err: any) {
            const message = err?.data?.message || "Registration failed.";
            toast.error(message);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] w-full flex flex-col justify-center items-center pt-28 pb-16 px-4 relative overflow-hidden bg-background text-foreground">
            {/* Stripe-like atmospheric gradient background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
                {/* Top-right blob: warm violet/indigo light source */}
                <div className="absolute top-[-15%] right-[-15%] w-[650px] h-[650px] rounded-full bg-gradient-to-br from-violet-500/10 via-indigo-500/5 to-transparent blur-[130px] opacity-60 dark:opacity-40" />
                {/* Bottom-left blob: cooler ambient glow */}
                <div className="absolute bottom-[-20%] left-[-15%] w-[750px] h-[750px] rounded-full bg-gradient-to-tr from-sky-400/10 via-pink-500/5 to-transparent blur-[150px] opacity-70 dark:opacity-40" />
                {/* Stripe-style diagonal light sweep beam */}
                <div className="absolute top-[20%] left-[-15%] right-[-15%] h-[120px] bg-gradient-to-r from-violet-500/5 via-sky-400/10 to-amber-400/5 -rotate-12 blur-[100px] opacity-60 dark:opacity-40 pointer-events-none transform origin-center" />
                {/* Layered radial mask for soft fintech depth */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_30%,var(--background))] pointer-events-none" />
            </div>
            {/* Centered Auth Card */}
            <div className="w-full max-w-md bg-background/80 backdrop-blur-xl border border-border/40 rounded-3xl p-8 sm:p-10 transition-all duration-300 relative z-10 shadow-[0_20px_80px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_80px_rgba(0,0,0,0.3)] hover:-translate-y-[2px] hover:shadow-[0_30px_100px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_30px_100px_rgba(0,0,0,0.45)] hover:border-border/60 animate-fade-in">
                {/* Header */}
                <div className="space-y-2 mb-8 text-center sm:text-left">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        Create account
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary hover:underline hover:text-primary/80 transition-colors font-semibold"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <FormField
                        id="name"
                        label="Full Name"
                        placeholder="Rahim Uddin"
                        icon={User}
                        error={errors.name?.message}
                        register={register("name")}
                    />

                    {/* Email */}
                    <FormField
                        id="email"
                        label="Email Address"
                        type="email"
                        placeholder="rahim@gmail.com"
                        icon={Mail}
                        error={errors.email?.message}
                        register={register("email")}
                    />

                    {/* Phone */}
                    <FormField
                        id="phone"
                        label="Phone Number"
                        type="tel"
                        placeholder="01712345678"
                        icon={Phone}
                        error={errors.phone?.message}
                        register={register("phone")}
                    />

                    {/* Password */}
                    <FormField
                        id="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        icon={Lock}
                        error={errors.password?.message}
                        register={register("password")}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="text-muted-foreground/75 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        }
                    />

                    {/* Confirm Password */}
                    <FormField
                        id="confirmPassword"
                        label="Confirm Password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Repeat your password"
                        icon={Lock}
                        error={errors.confirmPassword?.message}
                        register={register("confirmPassword")}
                        rightElement={
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="text-muted-foreground/75 hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        }
                    />

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        className="w-full h-11 text-sm font-semibold mt-6 rounded-xl bg-primary text-primary-foreground shadow-sm hover:bg-primary/95 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 flex items-center justify-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-current" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Creating account...</span>
                            </>
                        ) : (
                            <span>Create Account</span>
                        )}
                    </Button>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-border/50" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background/95 backdrop-blur-xl px-3 text-muted-foreground/70 font-semibold tracking-wider">
                                Or continue with
                            </span>
                        </div>
                    </div>

                    {/* Social Logins */}
                    <div className="grid grid-cols-2 gap-3 mb-6">

                        <Button
                            onClick={() => window.open(`${config.API_URL}/auth/google`)}
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

                    {/* Terms */}
                    <p className="text-xs text-center text-muted-foreground mt-4 leading-relaxed">
                        By creating an account, you agree to our{" "}
                        <a href="#" className="text-primary hover:underline hover:text-primary/80 transition-colors font-medium">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-primary hover:underline hover:text-primary/80 transition-colors font-medium">
                            Privacy Policy
                        </a>.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Register;