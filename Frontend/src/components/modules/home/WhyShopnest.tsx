import { ShieldCheck, Truck, Store, Headphones } from "lucide-react";

const features = [
    {
        icon: ShieldCheck,
        title: "Secure Payments",
        description: "SSLCommerz secured payment gateway for safe transactions",
        iconColor: "text-emerald-500",
        bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
        icon: Truck,
        title: "Fast Delivery",
        description: "Quick and reliable delivery across Bangladesh",
        iconColor: "text-primary",
        bgColor: "bg-primary/10 border-primary/20",
    },
    {
        icon: Store,
        title: "Verified Vendors",
        description: "All vendors are verified and approved by our team",
        iconColor: "text-blue-500",
        bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
        icon: Headphones,
        title: "24/7 Support",
        description: "Round-the-clock customer support for all your queries",
        iconColor: "text-purple-500",
        bgColor: "bg-purple-500/10 border-purple-500/20",
    },
];

const WhyShopnest = () => {
    return (
        <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 space-y-2">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                        Why Choose Shopnest?
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        We make shopping better, safer, and faster
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, idx) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={idx}
                                className="group flex flex-col items-center text-center p-8 border border-border bg-card rounded-3xl shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all duration-300"
                            >
                                {/* Animated Icon Wrapper */}
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center border mb-6 transition-all duration-300 group-hover:scale-110 ${feature.bgColor}`}>
                                    <Icon className={`h-7 w-7 ${feature.iconColor}`} />
                                </div>

                                <h3 className="text-lg font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                
                                <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default WhyShopnest;
