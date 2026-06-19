import { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGetAllCouponsQuery } from "@/redux/features/coupon/coupon.api";
import type { ICoupon } from "@/types";

const fallbackCoupons: ICoupon[] = [
    {
        _id: "1",
        code: "EID20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 1000,
        maxDiscount: 500,
        expiryDate: "2026-12-31",
        isActive: true,
        usedCount: 0,
        isDeleted: false,
        createdAt: "2026-01-01"
    },
    {
        _id: "2",
        code: "SAVE500",
        discountType: "FIXED",
        discountValue: 500,
        minOrderAmount: 2000,
        expiryDate: "2026-12-31",
        isActive: true,
        usedCount: 0,
        isDeleted: false,
        createdAt: "2026-01-01"
    },
    {
        _id: "3",
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 500,
        expiryDate: "2026-12-31",
        isActive: true,
        usedCount: 0,
        isDeleted: false,
        createdAt: "2026-01-01"
    },
];

const PromoBanner = () => {
    // Try retrieving coupons from API
    const { data: couponsData } = useGetAllCouponsQuery({ limit: 20 });
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            toast.success(`'${code}' copied to clipboard!`);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            toast.error("Failed to copy code");
        }
    };

    // Filter coupons: must be active and not expired
    const rawCoupons = couponsData?.data;
    let coupons = fallbackCoupons;
    if (rawCoupons && Array.isArray(rawCoupons)) {
        const activeCoupons = rawCoupons.filter(
            (c: any) => c.isActive && new Date(c.expiryDate) > new Date()
        );
        if (activeCoupons.length > 0) {
            coupons = activeCoupons;
        }
    }

    // Multiply the list to ensure infinite scroll fills the track width and scrolls infinitely
    const displayCoupons = [...coupons, ...coupons, ...coupons, ...coupons];

    const formatDate = (dateStr: string) => {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
        return new Date(dateStr).toLocaleDateString("en-US", options);
    };

    return (
        <section className="py-16 bg-muted/20 overflow-hidden relative">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12 space-y-2 animate-in fade-in duration-750">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
                        <Tag className="h-7 w-7 text-primary animate-pulse" />
                        Exclusive Offers
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Use these codes at checkout for instant savings
                    </p>
                </div>

                {/* Carousel wrapper with fade gradients */}
                <div
                    className="relative w-full overflow-hidden py-6"
                    style={{
                        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
                    }}
                >
                    <div className="flex gap-6 animate-marquee w-max py-2 select-none">
                        {displayCoupons.map((coupon, idx) => (
                            <div
                                key={`${coupon._id}-${idx}`}
                                className={`flex-shrink-0 w-[280px] bg-card border border-border/40 rounded-3xl shadow-xl border-t-4 border-primary p-6 space-y-4 hover:scale-105 hover:shadow-2xl transition-all duration-300 animate-float-${idx % 4}`}
                            >
                                {/* Coupon header */}
                                <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5 uppercase tracking-wider bg-muted px-2.5 py-0.5 rounded-full">
                                        🏷️ {coupon.discountType === "PERCENTAGE" ? "Percentage" : "Fixed"}
                                    </span>
                                </div>

                                {/* Monospace code display */}
                                <div className="bg-muted/70 rounded-2xl p-3.5 text-center border border-border/30">
                                    <span className="font-mono text-2xl font-black tracking-widest text-foreground">
                                        {coupon.code}
                                    </span>
                                </div>

                                {/* Discount details */}
                                <div className="text-center space-y-1 py-1">
                                    <div className="text-primary text-3xl font-black tracking-tight">
                                        {coupon.discountType === "PERCENTAGE"
                                            ? `${coupon.discountValue}% OFF`
                                            : `৳${coupon.discountValue.toLocaleString()} OFF`}
                                    </div>
                                    {coupon.discountType === "PERCENTAGE" && coupon.maxDiscount && (
                                        <div className="text-xs text-muted-foreground font-semibold">
                                            Up to ৳{coupon.maxDiscount.toLocaleString()} savings
                                        </div>
                                    )}
                                </div>

                                {/* Limits and Expiry */}
                                <div className="text-xs text-muted-foreground space-y-1 text-center border-t border-border/40 pt-3">
                                    <div>
                                        Min. order:{" "}
                                        <span className="font-bold text-foreground">
                                            ৳{coupon.minOrderAmount.toLocaleString()}
                                        </span>
                                    </div>
                                    <div>
                                        Expires:{" "}
                                        <span className="font-bold text-foreground">
                                            {formatDate(coupon.expiryDate)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action button */}
                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopy(coupon.code)}
                                        className="w-full rounded-2xl h-10 font-bold transition-all duration-300 hover:bg-primary hover:text-primary-foreground border-primary/30 text-primary cursor-pointer"
                                    >
                                        {copiedCode === coupon.code ? (
                                            <>
                                                <Check className="h-4 w-4 mr-1.5 text-emerald-500" />
                                                Copied! ✓
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-1.5" />
                                                Copy Code
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PromoBanner;
