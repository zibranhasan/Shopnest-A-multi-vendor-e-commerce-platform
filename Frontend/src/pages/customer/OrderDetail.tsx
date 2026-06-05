// src/pages/customer/OrderDetail.tsx

import { useNavigate, useParams, Link } from "react-router";
import { ArrowLeft, CreditCard, Tag, Store, ShoppingBag, Loader2, Hash } from "lucide-react";
import { toast } from "sonner";

import { useGetMyOrderByIdQuery } from "@/redux/features/order/order.api";
import { useInitPaymentMutation } from "@/redux/features/payment/payment.api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { IOrderItem, IOrderShop } from "@/types";

const FALLBACK_IMAGE = "https://placehold.co/150x150/f5f5f5/a3a3a3?text=No+Image";

export default function OrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { data: orderResponse, isLoading, isError } = useGetMyOrderByIdQuery(id || "", {
        skip: !id,
    });
    const [initPayment, { isLoading: isPaying }] = useInitPaymentMutation();

    const order = orderResponse?.data;

    const handlePayNow = async () => {
        if (!order?._id) return;
        try {
            const res = await initPayment(order._id).unwrap();
            const paymentUrl = res?.data?.paymentUrl || res?.paymentUrl;
            if (!paymentUrl) {
                throw new Error("Payment URL not found");
            }
            toast.success("Redirecting to payment gateway...");
            window.location.href = paymentUrl;
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to initialize payment");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "N/A";
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const getStatusColor = (status?: string) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "CONFIRMED":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "CANCELLED":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
            default:
                return "bg-muted text-muted-foreground border-transparent";
        }
    };

    const getPaymentStatusColor = (status?: string) => {
        switch (status) {
            case "UNPAID":
                return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
            case "PAID":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "FAILED":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
            default:
                return "bg-muted text-muted-foreground border-transparent";
        }
    };

    // Loading Skeletons
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-60" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                    <Skeleton className="h-24 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-64 w-full rounded-3xl" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
                <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10 border border-destructive/20 text-destructive mx-auto shadow-inner">
                    <ShoppingBag className="h-9 w-9" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-foreground">Order not found</h2>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        We couldn't retrieve the details for this order. It may have been deleted or doesn't exist.
                    </p>
                </div>
                <Button onClick={() => navigate("/customer/orders")} className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95">
                    Back to Orders
                </Button>
            </div>
        );
    }

    const shortId = order._id.substring(order._id.length - 8).toUpperCase();
    const showPayNow = order.status === "PENDING" && order.paymentStatus === "UNPAID";

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header section with back button */}
            <div className="flex items-start gap-4">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigate(-1)}
                    className="rounded-xl h-10 w-10 shrink-0 border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="space-y-1">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2">
                        Order #{shortId}
                    </h1>
                    <p className="text-xs text-muted-foreground font-semibold">
                        System ID: {order._id}
                    </p>
                </div>
            </div>

            {/* Status Summary Grid (4 Cards) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="rounded-2xl border border-border bg-card/30 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center h-full space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground">Order Status</span>
                        <div className="pt-1">
                            <Badge variant="outline" className={`rounded-full font-extrabold px-2.5 py-0.5 text-xs border ${getStatusColor(order.status)}`}>
                                {order.status}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border bg-card/30 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center h-full space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground">Payment Status</span>
                        <div className="pt-1">
                            <Badge variant="outline" className={`rounded-full font-extrabold px-2.5 py-0.5 text-xs border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                {order.paymentStatus}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border bg-card/30 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center h-full space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground">Total Amount</span>
                        <span className="text-lg font-black text-primary">
                            ৳{order.totalAmount.toLocaleString()}
                        </span>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl border border-border bg-card/30 shadow-sm">
                    <CardContent className="p-4 flex flex-col justify-center h-full space-y-1">
                        <span className="text-xs font-semibold text-muted-foreground">Order Date</span>
                        <span className="text-xs font-bold text-foreground/90 leading-tight">
                            {formatDate(order.createdAt)}
                        </span>
                    </CardContent>
                </Card>
            </div>

            {/* Pay Now Call-to-action */}
            {showPayNow && (
                <Card className="rounded-3xl border border-orange-500/20 bg-orange-500/5 animate-in slide-in-from-top-4 duration-300">
                    <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment Required
                            </h3>
                            <p className="text-xs text-muted-foreground font-semibold">
                                Your order is currently unpaid. Please complete payment to confirm your purchase.
                            </p>
                        </div>
                        <Button
                            onClick={handlePayNow}
                            disabled={isPaying}
                            className="rounded-2xl h-11 px-8 font-black tracking-wide uppercase bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-md shadow-primary/20 shrink-0 flex items-center justify-center gap-2"
                        >
                            {isPaying ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Redirecting...
                                </>
                            ) : (
                                "Pay Now"
                            )}
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left: Order Items list */}
                <div className="lg:col-span-8 space-y-4">
                    <Card className="rounded-3xl border border-border bg-card/45 backdrop-blur-md shadow-sm">
                        <CardContent className="p-6 space-y-4">
                            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5 text-primary" />
                                Order Items
                            </h3>
                            <Separator className="bg-border/60" />

                            <div className="divide-y divide-border/40 space-y-4">
                                {order.items.map((item: IOrderItem, idx: number) => {
                                    const itemSubtotal = item.price * item.quantity;
                                    const itemShop = item.shop as IOrderShop | undefined;
                                    const shopName = itemShop?.name || "Merchant";
                                    const itemSlug = (item.product as any)?.slug || "";

                                    return (
                                        <div key={idx} className="flex flex-row items-center gap-4 pt-4 first:pt-0">
                                            {/* Item Image */}
                                            <div className="relative h-16 w-16 rounded-xl overflow-hidden shrink-0 bg-muted border border-border/30">
                                                <img
                                                    src={item.image || FALLBACK_IMAGE}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                                    }}
                                                />
                                            </div>

                                            {/* Item Details */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h4 className="text-sm font-bold text-foreground line-clamp-1 leading-tight">
                                                    {itemSlug ? (
                                                        <Link to={`/products/${itemSlug}`} className="hover:text-primary transition-colors">
                                                            {item.name}
                                                        </Link>
                                                    ) : (
                                                        item.name
                                                    )}
                                                </h4>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <Store className="h-3.5 w-3.5 text-primary/70 shrink-0" />
                                                    <span className="font-semibold text-foreground/80">{shopName}</span>
                                                </div>
                                                <div className="text-xs font-semibold text-primary pt-0.5 md:hidden">
                                                    ৳{item.price.toLocaleString()} × {item.quantity}
                                                </div>
                                            </div>

                                            {/* Pricing (Desktop only) */}
                                            <div className="hidden md:block text-right min-w-24 shrink-0">
                                                <div className="text-sm font-extrabold text-foreground">
                                                    ৳{itemSubtotal.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-muted-foreground font-semibold pt-0.5">
                                                    ৳{item.price.toLocaleString()} each
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Payment Detail summary */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="rounded-3xl border border-border bg-card/45 backdrop-blur-md shadow-sm">
                        <CardContent className="p-6 space-y-6">
                            <h3 className="text-base font-extrabold text-foreground flex items-center gap-2">
                                <CreditCard className="h-5 w-5 text-primary" />
                                Payment & Totals
                            </h3>
                            <Separator className="bg-border/60" />

                            {/* Subtotals breakdown */}
                            <div className="space-y-4 text-xs font-semibold text-muted-foreground">
                                <div className="flex justify-between items-center">
                                    <span>Subtotal</span>
                                    <span className="text-foreground font-bold text-sm">
                                        ৳{order.subTotal.toLocaleString()}
                                    </span>
                                </div>

                                {order.couponCode && (
                                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400">
                                        <span className="flex items-center gap-1">
                                            <Tag className="h-3.5 w-3.5" />
                                            Coupon ({order.couponCode})
                                        </span>
                                        <span className="font-bold text-sm">
                                            -৳{(order.discount || 0).toLocaleString()}
                                        </span>
                                    </div>
                                )}

                                <div className="flex justify-between items-center">
                                    <span>Shipping</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                                        Free
                                    </span>
                                </div>
                            </div>

                            <Separator className="bg-border/60" />

                            {/* Grand Total */}
                            <div className="flex justify-between items-baseline">
                                <span className="text-sm font-extrabold text-foreground">Total</span>
                                <span className="text-xl font-black text-primary">
                                    ৳{order.totalAmount.toLocaleString()}
                                </span>
                            </div>

                            {/* Transaction ID if payment succeeded */}
                            {order.transactionId && (
                                <>
                                    <Separator className="bg-border/60" />
                                    <div className="space-y-2">
                                        <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                            <Hash className="h-3.5 w-3.5" />
                                            Transaction Details
                                        </span>
                                        <div className="bg-muted/50 dark:bg-muted/20 border border-border/60 rounded-xl py-2 px-3 text-[11px] font-mono text-muted-foreground break-all select-all">
                                            {order.transactionId}
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
