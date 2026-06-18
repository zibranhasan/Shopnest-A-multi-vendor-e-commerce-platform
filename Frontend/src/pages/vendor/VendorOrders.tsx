import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Eye,
  Package,
} from "lucide-react";
import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useGetAllOrdersAdminQuery } from "@/redux/features/order/order.api";
import type { IOrder, IOrderItem } from "@/types";
import { cn } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const formatDate = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatTime = (iso: string) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const formatCurrency = (amount: number) =>
  `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const getPageNumbers = (current: number, total: number) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2)
    return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
};

const getVendorIdString = (vendorField: any): string => {
  if (!vendorField) return "";
  if (typeof vendorField === "object") {
    return vendorField._id || "";
  }
  return String(vendorField);
};

// ─────────────────────────────────────────────
// Badge Helpers
// ─────────────────────────────────────────────

const getOrderStatusBadge = (status: string) => {
  switch (status) {
    case "CONFIRMED":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Confirmed
        </Badge>
      );
    case "PENDING":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap animate-pulse">
          Pending
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Cancelled
        </Badge>
      );
    default:
      return (
        <Badge className="font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          {status}
        </Badge>
      );
  }
};

const getPaymentStatusBadge = (status: string) => {
  switch (status) {
    case "PAID":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Paid
        </Badge>
      );
    case "UNPAID":
      return (
        <Badge className="bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Unpaid
        </Badge>
      );
    case "FAILED":
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Failed
        </Badge>
      );
    default:
      return (
        <Badge className="font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          {status}
        </Badge>
      );
  }
};

// ─────────────────────────────────────────────
// Vendor Orders Component
// ─────────────────────────────────────────────

const VendorOrders = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 1. Auth & Vendor Info Query
  const { data: userData } = useUserInfoQuery(undefined);
  const vendorId = userData?.data?._id;

  // Reset page to 1 on filter changes
  useEffect(() => {
    setPage(1);
  }, [statusFilter, paymentFilter]);

  // 2. Fetch Orders
  const queryParams = {
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(paymentFilter !== "all" && { paymentStatus: paymentFilter }),
    page,
    limit,
  };

  const { data, isLoading } = useGetAllOrdersAdminQuery(queryParams, {
    skip: !vendorId,
  });
  const allOrders = data?.data || [];
  const meta = data?.meta;

  // 3. Vendor Order & Item Filter Logic
  const getVendorItems = (order: any) => {
    if (!order || !order.items) return [];
    return order.items.filter((item: any) => getVendorIdString(item.vendor) === vendorId);
  };

  const getVendorEarnings = (order: any) => {
    return getVendorItems(order).reduce(
      (sum: number, item: any) => sum + item.price * item.quantity, 0
    );
  };

  const vendorOrders = allOrders.filter((order: any) =>
    order.items.some((item: any) => getVendorIdString(item.vendor) === vendorId)
  );

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            My Orders
          </h1>
          {!isLoading && (
            <Badge
              variant="secondary"
              className="rounded-full font-bold px-3 py-1 bg-primary/10 text-primary border border-primary/25 animate-in zoom-in duration-300"
            >
              {vendorOrders.length}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Orders containing your products
        </p>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-start bg-card/30 p-4 border border-border/40 rounded-2xl">
        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-10 border-input bg-background/50 font-medium">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
            <SelectItem value="all" className="cursor-pointer">
              All Status
            </SelectItem>
            <SelectItem value="CONFIRMED" className="cursor-pointer">
              Confirmed
            </SelectItem>
            <SelectItem value="PENDING" className="cursor-pointer text-amber-500 font-medium">
              Pending
            </SelectItem>
            <SelectItem value="CANCELLED" className="cursor-pointer">
              Cancelled
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Payment Status Filter */}
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-10 border-input bg-background/50 font-medium">
            <SelectValue placeholder="All Payments" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
            <SelectItem value="all" className="cursor-pointer">
              All Payments
            </SelectItem>
            <SelectItem value="PAID" className="cursor-pointer">
              Paid
            </SelectItem>
            <SelectItem value="UNPAID" className="cursor-pointer text-orange-500 font-medium">
              Unpaid
            </SelectItem>
            <SelectItem value="FAILED" className="cursor-pointer">
              Failed
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* ── Main Content ── */}
      {isLoading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Order ID</TableHead>
                  <TableHead className="font-bold text-foreground">Customer</TableHead>
                  <TableHead className="font-bold text-foreground">My Items</TableHead>
                  <TableHead className="font-bold text-foreground">Amount</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Date</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx} className="border-b border-border/30 hover:bg-transparent">
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded font-mono" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3 w-36 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-4 w-16 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-3.5 w-12 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-5.5 w-20 rounded-full" />
                        <Skeleton className="h-5.5 w-16 rounded-full" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-8 w-8 rounded-xl ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Skeleton */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Card key={idx} className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-20 rounded font-mono" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-24 rounded" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/40">
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : vendorOrders.length === 0 ? (
        /* ── Empty State ── */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
            <ShoppingBag className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-foreground">
              No orders yet
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Orders containing your products will appear here.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* ── Desktop Table ── */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Order ID</TableHead>
                  <TableHead className="font-bold text-foreground">Customer</TableHead>
                  <TableHead className="font-bold text-foreground">My Items</TableHead>
                  <TableHead className="font-bold text-foreground">Amount</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Date</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vendorOrders.map((order: IOrder) => {
                  const customer =
                    order.customer && typeof order.customer === "object"
                      ? order.customer
                      : null;
                  const vendorItems = getVendorItems(order);
                  const earnings = getVendorEarnings(order);

                  // Border styles based on order status
                  const statusBorders = ({
                    PENDING: "border-l-4 border-l-amber-500",
                    CONFIRMED: "border-l-4 border-l-emerald-500",
                    CANCELLED: "border-l-4 border-l-rose-500/40",
                  } as Record<string, string>)[order.status] || "";

                  return (
                    <TableRow
                      key={order._id}
                      className={cn(
                        "border-b border-border/30 hover:bg-muted/30 transition-colors duration-150",
                        statusBorders
                      )}
                    >
                      {/* Order ID */}
                      <TableCell className="font-mono text-sm font-semibold text-foreground py-4">
                        #{order._id.slice(-8).toUpperCase()}
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="py-4">
                        <div>
                          <div className="font-bold text-foreground tracking-tight leading-tight">
                            {customer?.name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {customer?.email ?? "—"}
                          </div>
                          {"phone" in (customer || {}) && customer?.phone && (
                            <div className="text-[11px] text-muted-foreground/85 mt-0.5 font-medium">
                              {customer.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* My Items */}
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex -space-x-2 overflow-hidden">
                            {vendorItems.slice(0, 3).map((item: IOrderItem, idx: number) => (
                              <div
                                key={idx}
                                className="inline-block h-8 w-8 rounded-full ring-2 ring-background overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0"
                              >
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            ))}
                            {vendorItems.length > 3 && (
                              <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted ring-2 ring-background text-xs font-bold text-muted-foreground border border-border shrink-0">
                                +{vendorItems.length - 3}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground font-medium">
                            {vendorItems.length} {vendorItems.length === 1 ? "item" : "items"}
                          </span>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="py-4">
                        <div>
                          <div className="font-extrabold text-foreground text-sm tracking-tight">
                            {formatCurrency(earnings)}
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium mt-0.5">
                            Your earnings
                          </p>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-4">
                        <div className="flex flex-col gap-1 items-start">
                          {getOrderStatusBadge(order.status)}
                          {getPaymentStatusBadge(order.paymentStatus)}
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-4">
                        <div>
                          <span className="text-sm font-semibold text-foreground block leading-none">
                            {formatDate(order.createdAt)}
                          </span>
                          <span className="text-xs text-muted-foreground block mt-1 leading-none">
                            {formatTime(order.createdAt)}
                          </span>
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsDetailOpen(true);
                          }}
                          className="h-8 w-8 rounded-xl hover:bg-muted cursor-pointer"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {vendorOrders.map((order: any) => {
              const customer =
                order.customer && typeof order.customer === "object"
                  ? order.customer
                  : null;
              const vendorItems = getVendorItems(order);
              const earnings = getVendorEarnings(order);

              // Border styles based on order status
              const statusBorders = ({
                PENDING: "border-l-4 border-l-amber-500",
                CONFIRMED: "border-l-4 border-l-emerald-500",
                CANCELLED: "border-l-4 border-l-rose-500/40",
              } as Record<string, string>)[order.status] || "";

              return (
                <Card
                  key={order._id}
                  className={cn(
                    "rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm hover:border-border/80 transition-all duration-300",
                    statusBorders
                  )}
                >
                  {/* Header Row */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-muted-foreground block">
                        #{order._id.slice(-8).toUpperCase()}
                      </span>
                      <span className="text-[11px] text-muted-foreground block mt-0.5">
                        {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsDetailOpen(true);
                      }}
                      className="h-8 w-8 rounded-xl hover:bg-muted cursor-pointer"
                    >
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>

                  {/* Customer Information */}
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Customer
                    </p>
                    <p className="font-bold text-sm text-foreground">
                      {customer?.name ?? "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer?.email ?? "—"}
                    </p>
                    {"phone" in (customer || {}) && customer?.phone && (
                      <p className="text-[11px] text-muted-foreground/85 font-medium mt-0.5">
                        {customer.phone}
                      </p>
                    )}
                  </div>

                  {/* Items Preview */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      My Items
                    </p>
                    <div className="flex items-center gap-2.5">
                      <div className="flex -space-x-2 overflow-hidden">
                        {vendorItems.slice(0, 3).map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="inline-block h-8 w-8 rounded-full ring-2 ring-background overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0"
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                        {vendorItems.length > 3 && (
                          <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted ring-2 ring-background text-xs font-bold text-muted-foreground border border-border shrink-0">
                            +{vendorItems.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground font-medium">
                        {vendorItems.length} {vendorItems.length === 1 ? "item" : "items"}
                      </span>
                    </div>
                  </div>

                  {/* Badges + Earnings row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/40">
                    <div className="flex gap-1.5">
                      {getOrderStatusBadge(order.status)}
                      {getPaymentStatusBadge(order.paymentStatus)}
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-base text-primary">
                        {formatCurrency(earnings)}
                      </span>
                      <p className="text-[9px] text-muted-foreground -mt-0.5">Your earnings</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          {meta && meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
              <span className="text-sm text-muted-foreground">
                Showing <strong>{(page - 1) * limit + 1}</strong> to{" "}
                <strong>{Math.min(page * limit, meta.total)}</strong> of{" "}
                <strong>{meta.total}</strong> orders
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="rounded-xl h-9 px-3 text-xs font-bold border-border/80 hover:bg-muted cursor-pointer"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1">
                  {getPageNumbers(page, meta.totalPage || 1).map((pNum) => (
                    <Button
                      key={pNum}
                      variant={page === pNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pNum)}
                      className={cn(
                        "rounded-xl h-9 w-9 p-0 text-xs font-bold transition-all duration-150 cursor-pointer",
                        page === pNum
                          ? "bg-primary text-primary-foreground shadow-md shadow-primary/10"
                          : "border-border/80 hover:bg-muted"
                      )}
                    >
                      {pNum}
                    </Button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === (meta.totalPage || 1)}
                  onClick={() =>
                    setPage((p) => Math.min(p + 1, meta.totalPage || 1))
                  }
                  className="rounded-xl h-9 px-3 text-xs font-bold border-border/80 hover:bg-muted cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Order Detail Dialog ── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md shadow-xl p-0">
          {selectedOrder && (
            <div className="p-6 space-y-5">
              <DialogHeader>
                <DialogTitle className="text-2xl font-extrabold tracking-tight">
                  Order #{selectedOrder._id.slice(-8).toUpperCase()}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  Order breakdown and payment information
                </DialogDescription>
              </DialogHeader>

              {/* 1. Order Status Row */}
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Date Placed
                  </p>
                  <p className="font-semibold text-sm text-foreground">
                    {formatDate(selectedOrder.createdAt)} at {formatTime(selectedOrder.createdAt)}
                  </p>
                  {selectedOrder.transactionId && (
                    <p className="font-mono text-xs text-muted-foreground break-all mt-0.5">
                      TXN: {selectedOrder.transactionId}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getOrderStatusBadge(selectedOrder.status)}
                  {getPaymentStatusBadge(selectedOrder.paymentStatus)}
                </div>
              </div>

              {/* 2. Customer Information */}
              <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Customer Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Name
                    </p>
                    <p className="font-bold text-sm text-foreground mt-0.5">
                      {selectedOrder.customer && typeof selectedOrder.customer === "object"
                        ? selectedOrder.customer.name
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Email
                    </p>
                    <p className="font-semibold text-sm text-foreground mt-0.5 break-all">
                      {selectedOrder.customer && typeof selectedOrder.customer === "object"
                        ? selectedOrder.customer.email
                        : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Phone
                    </p>
                    <p className="font-semibold text-sm text-foreground mt-0.5">
                      {(selectedOrder.customer &&
                        typeof selectedOrder.customer === "object" &&
                        selectedOrder.customer.phone) ||
                        "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. Your Items (vendor's items only) */}
              <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Your Items ({getVendorItems(selectedOrder).length})
                </p>
                <div className="space-y-2.5">
                  {getVendorItems(selectedOrder).map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      {/* Item Image */}
                      <div className="h-12 w-12 rounded-lg overflow-hidden border border-border/50 shadow-sm shrink-0 bg-muted flex items-center justify-center">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      {/* Item details */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground leading-tight line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.quantity} × {formatCurrency(item.price)}
                        </p>
                      </div>
                      {/* Item subtotal */}
                      <div className="shrink-0 text-right">
                        <p className="font-extrabold text-sm text-primary">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Your Earnings portion */}
                <div className="flex justify-between items-center pt-3 border-t border-border/30">
                  <span className="text-sm font-semibold text-muted-foreground">
                    Your Total Earnings
                  </span>
                  <span className="font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(getVendorEarnings(selectedOrder))}
                  </span>
                </div>
              </div>

              {/* 4. Order Summary (overall) */}
              <div className="rounded-2xl border border-border/40 bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Order Summary
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(selectedOrder.subTotal)}
                    </span>
                  </div>
                  {selectedOrder.discount !== undefined && selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        Discount
                        {selectedOrder.couponCode && (
                          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-[10px] font-bold px-1.5 py-0 rounded-md">
                            {selectedOrder.couponCode}
                          </Badge>
                        )}
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(selectedOrder.discount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border/40 pt-2 mt-1 flex justify-between">
                    <span className="font-extrabold text-base text-foreground">
                      Total Amount
                    </span>
                    <span className="font-extrabold text-base text-primary">
                      {formatCurrency(selectedOrder.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorOrders;
