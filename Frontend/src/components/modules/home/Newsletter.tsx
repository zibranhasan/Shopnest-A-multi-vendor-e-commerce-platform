import { useState } from "react";
import { Mail, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Newsletter = () => {
    const [email, setEmail] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        // Basic email regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            toast.error("Please enter a valid email address");
            return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Thank you for subscribing! Check your inbox for exclusive deals.");
            setEmail("");
        }, 1200);
    };

    return (
        <section className="py-16 bg-muted/40 relative overflow-hidden">
            {/* Background Accent Gradients */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-2xl mx-auto text-center space-y-6">
                    {/* Icon */}
                    <div className="mx-auto h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                        <Mail className="h-6 w-6" />
                    </div>

                    {/* Titles */}
                    <div className="space-y-2">
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            Stay Updated
                        </h2>
                        <p className="text-muted-foreground text-sm md:text-base font-medium max-w-md mx-auto">
                            Subscribe to our newsletter and get the latest deals, offers, and store updates straight to your inbox.
                        </p>
                    </div>

                    {/* Subscription Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="Enter your email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-12 pr-4 h-12 bg-card border-border rounded-2xl focus-visible:ring-primary w-full"
                                disabled={isSubmitting}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-6 h-12 rounded-2xl shrink-0 flex items-center justify-center gap-2 transition-all duration-300 active:scale-[0.98] cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Subscribing...
                                </>
                            ) : (
                                <>
                                    Subscribe
                                    <Send className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Newsletter;
