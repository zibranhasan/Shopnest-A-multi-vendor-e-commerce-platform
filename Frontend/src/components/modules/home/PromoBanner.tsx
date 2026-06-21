import { useState } from "react";
import { Tag, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useGetAllCouponsQuery } from "@/redux/features/coupon/coupon.api";
import type { ICoupon } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";

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
        <section className="relative py-20 overflow-hidden">
            <div className="container mx-auto max-w-7xl px-6">

                {/* Section Header */}
                <div className="text-center mb-12 space-y-2 animate-in fade-in duration-750">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground flex items-center justify-center gap-2">
                        <Tag className="h-8 w-8 text-primary" />
                        Exclusive Offers
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Use these codes at checkout for instant savings
                    </p>
                </div>

                {/* Carousel wrapper with fade gradients */}
                <Carousel
                    opts={{
                        align: "start",
                        loop: true,
                    }}
                    plugins={[
                        Autoplay({
                            delay: 3500,
                            stopOnInteraction: true,
                            stopOnMouseEnter: true,
                        }),
                    ]}
                    className="w-full"
                >
                    <CarouselContent className="-ml-4">
                        {coupons.map((coupon) => (
                            <CarouselItem
                                key={coupon._id}
                                className="
                                pl-4
          basis-full
          md:basis-1/2
          xl:basis-1/2
        "
                            >
                                <div
                                    className="
            bg-card
            border
            border-border/50
            rounded-3xl
            shadow-sm
            hover:shadow-xl
            transition-all
            duration-300
            p-6
            space-y-4
            h-full
          "
                                >
                                    <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                                        Limited Time Deals
                                    </div>
                                    {/* Coupon header */}
                                    <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                                        <span className="inline-flex items-center gap-1.5 uppercase tracking-wider bg-muted px-2.5 py-0.5 rounded-full">
                                            🏷️{" "}
                                            {coupon.discountType === "PERCENTAGE"
                                                ? "Percentage"
                                                : "Fixed"}
                                        </span>
                                    </div>

                                    {/* Code */}
                                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-center">
                                        <span className="font-mono text-2xl font-black tracking-widest">
                                            {coupon.code}
                                        </span>
                                    </div>

                                    {/* Discount */}
                                    <div className="text-center space-y-1">
                                        <div className="text-primary text-4xl lg:text-5xl font-black">
                                            {coupon.discountType === "PERCENTAGE"
                                                ? `${coupon.discountValue}% OFF`
                                                : `৳${coupon.discountValue.toLocaleString()} OFF`}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="text-xs text-muted-foreground space-y-1 text-center border-t pt-3">
                                        <div>
                                            Min. order:
                                            <span className="font-bold text-foreground ml-1">
                                                ৳{coupon.minOrderAmount.toLocaleString()}
                                            </span>
                                        </div>

                                        <div className="text-red-500 font-semibold">
                                            Expires:
                                            <span className="font-bold text-foreground ml-1">
                                                {formatDate(coupon.expiryDate)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Button */}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopy(coupon.code)}
                                        className="w-full rounded-2xl"
                                    >
                                        {copiedCode === coupon.code ? (
                                            <>
                                                <Check className="h-4 w-4 mr-2" />
                                                Copied!
                                            </>
                                        ) : (
                                            <>
                                                <Copy className="h-4 w-4 mr-2" />
                                                Copy Code
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious className="hidden md:flex" />
                    <CarouselNext className="hidden md:flex" />
                </Carousel>
            </div>
        </section>
    );
};

export default PromoBanner;
