// src/pages/customer/CustomerOrders.tsx

import { Link } from "react-router";
import { ShoppingBag, Calendar, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
    useGetMyOrdersQuery,
    useCancelOrderMutation,
} from "@/redux/features/order/order.api";
import { useInitPaymentMutation } from "@/redux/features/payment/payment.api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import type { IOrder, IOrderItem } from "@/types";

const FALLBACK_IMAGE = "https://placehold.co/150x150/f5f5f5/a3a3a3?text=No+Image";

export default function CustomerOrders() {
    const { data: ordersResponse, isLoading, isError } = useGetMyOrdersQuery({});
    const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();
    const [initPayment, { isLoading: isPaying }] = useInitPaymentMutation();

    const orders: IOrder[] = ordersResponse?.data || [];

    const handleCancelOrder = async (orderId: string) => {
        const confirmCancel = window.confirm("Are you sure you want to cancel this order?");
        if (!confirmCancel) return;

        try {
            await cancelOrder(orderId).unwrap();
            toast.success("Order cancelled successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to cancel order");
        }
    };

    const handlePayNow = async (orderId: string) => {
        try {
            const res = await initPayment(orderId).unwrap();
            const paymentUrl = res?.data?.paymentUrl || res?.paymentUrl;
            if (!paymentUrl) {
                throw new Error("Payment initialization failed");
            }
            toast.success("Redirecting to payment gateway...");
            window.location.href = paymentUrl;
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to initialize payment");
        }
    };

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    // Helper functions for badge colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case "PENDING":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            case "CONFIRMED":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "CANCELLED":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "UNPAID":
                return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
            case "PAID":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "FAILED":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
            default:
                return "bg-muted text-muted-foreground";
        }
    };

    const isActionLoading = isCancelling || isPaying;

    // Loading Skeletons
    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-40 rounded-xl" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                </div>
                <div className="space-y-4">
                    <Skeleton className="h-44 w-full rounded-3xl" />
                    <Skeleton className="h-44 w-full rounded-3xl" />
                </div>
            </div>
        );
    }

    // Empty state
    if (orders.length === 0 || isError) {
        return (
            <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
                <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner animate-pulse">
                    <ShoppingBag className="h-9 w-9 text-primary" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-extrabold text-foreground">
                        No orders yet
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                        You haven't placed any orders yet. Start exploring our premium marketplace selection.
                    </p>
                </div>
                <Button asChild className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95">
                    <Link to="/products">
                        Start Shopping
                    </Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Title with Badge */}
            <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">My Orders</h1>
                <Badge variant="secondary" className="rounded-full font-bold px-3 py-1 bg-primary/10 text-primary border-primary/25">
                    {orders.length}
                </Badge>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {orders.map((order: IOrder) => {
                    const shortId = order._id.substring(order._id.length - 8).toUpperCase();
                    const totalItems = order.items.length;
                    const displayItems = order.items.slice(0, 3);
                    const remainingItems = totalItems - displayItems.length;

                    return (
                        <Card key={order._id} className="rounded-3xl border border-border bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/60">
                            <CardContent className="p-5 md:p-6 space-y-5">
                                
                                {/* Card Header */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/40 pb-4">
                                    <div className="space-y-1">
                                        <div className="text-lg font-extrabold text-foreground">
                                            Order #{shortId}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(order.createdAt)}
                                        </div>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="outline" className={`rounded-full font-extrabold px-3 py-0.5 text-xs border ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </Badge>
                                        <Badge variant="outline" className={`rounded-full font-extrabold px-3 py-0.5 text-xs border ${getPaymentStatusColor(order.paymentStatus)}`}>
                                            {order.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Items Preview Section */}
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-1">
                                    <div className="flex items-center -space-x-3 overflow-hidden">
                                        {displayItems.map((item: IOrderItem, idx: number) => (
                                            <div
                                                key={idx}
                                                className="relative h-14 w-14 rounded-xl overflow-hidden bg-muted border border-border/60 shadow-sm transition-transform duration-200 hover:scale-105"
                                            >
                                                <img
                                                    src={item.image || FALLBACK_IMAGE}
                                                    alt={item.name}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                                    }}
                                                />
                                            </div>
                                        ))}

                                        {remainingItems > 0 && (
                                            <div className="h-14 w-14 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-xs font-bold text-muted-foreground shadow-sm">
                                                +{remainingItems}
                                            </div>
                                        )}
                                        
                                        <div className="pl-5 text-sm font-semibold text-muted-foreground">
                                            {totalItems} item(s) total
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="text-left sm:text-right shrink-0">
                                        <div className="text-xs text-muted-foreground font-semibold">Total Amount</div>
                                        <div className="text-xl font-black text-primary">
                                            ৳{order.totalAmount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <Separator className="bg-border/60" />

                                {/* Action Buttons */}
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div className="flex flex-wrap gap-2">
                                        {order.status === "PENDING" && order.paymentStatus === "UNPAID" && (
                                            <Button
                                                onClick={() => handlePayNow(order._id)}
                                                disabled={isActionLoading}
                                                className="rounded-xl h-9 px-4 font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center gap-1.5"
                                            >
                                                {isPaying ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Pay Now"
                                                )}
                                            </Button>
                                        )}

                                        {order.status === "PENDING" && (
                                            <Button
                                                variant="outline"
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={isActionLoading}
                                                className="rounded-xl h-9 px-4 font-bold hover:bg-destructive/10 text-muted-foreground hover:text-destructive hover:border-destructive/25 transition-all duration-200"
                                            >
                                                {isCancelling ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Cancel"
                                                )}
                                            </Button>
                                        )}
                                    </div>

                                    <Button
                                        asChild
                                        variant="ghost"
                                        className="rounded-xl h-9 px-4 font-bold hover:bg-muted text-muted-foreground hover:text-foreground flex items-center gap-1 group"
                                    >
                                        <Link to={`/customer/orders/${order._id}`}>
                                            View Details
                                            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                                        </Link>
                                    </Button>
                                </div>

                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
