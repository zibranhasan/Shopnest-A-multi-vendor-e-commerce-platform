import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  ShoppingBag,
  DollarSign,
  CheckCircle2,
  Clock3,
  Package,
} from "lucide-react";

import {
  useGetAllOrdersAdminQuery,
  useGetOrderByIdAdminQuery,
} from "@/redux/features/order/order.api";
import type { IOrder, IOrderItem } from "@/types";
import { cn } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

const formatCurrency = (amount: number) =>
  `৳${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const getPageNumbers = (current: number, total: number) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2)
    return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
};

// ─────────────────────────────────────────────
// Badge helpers
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
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
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
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
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
// Order Details Dialog
// ─────────────────────────────────────────────

interface OrderDetailsDialogProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OrderDetailsDialog = ({
  orderId,
  open,
  onOpenChange,
}: OrderDetailsDialogProps) => {
  const { data: orderData, isLoading } = useGetOrderByIdAdminQuery(
    orderId as string,
    { skip: !orderId },
  );

  const order = orderData?.data as IOrder | undefined;

  const customer =
    order?.customer && typeof order.customer === "object"
      ? order.customer
      : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md shadow-xl p-0">
        <div className="p-6 space-y-5">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              Order Details
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Full order breakdown and payment information
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full rounded-2xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-28 w-full rounded-2xl" />
              <Skeleton className="h-20 w-full rounded-2xl" />
            </div>
          ) : order ? (
            <div className="space-y-4">
              {/* ── 1. Order Header ── */}
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                    Order ID
                  </p>
                  <p className="font-mono text-sm font-bold text-foreground break-all">
                    {order._id}
                  </p>
                  {order.transactionId && (
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      TXN: {order.transactionId}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getOrderStatusBadge(order.status)}
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>

              {/* ── 2. Customer Information ── */}
              <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Customer Information
                </p>
                {customer ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Name
                      </p>
                      <p className="font-bold text-sm text-foreground mt-0.5">
                        {customer.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Email
                      </p>
                      <p className="font-semibold text-sm text-foreground mt-0.5 break-all">
                        {customer.email}
                      </p>
                    </div>
                    {"phone" in customer && customer.phone && (
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Phone
                        </p>
                        <p className="font-semibold text-sm text-foreground mt-0.5">
                          {customer.phone as string}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Customer details unavailable
                  </p>
                )}
              </div>

              {/* ── 3. Order Items ── */}
              <div className="rounded-2xl border border-border/40 bg-card p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Order Items ({order.items.length})
                </p>
                <div className="space-y-2.5">
                  {order.items.map((item: IOrderItem, idx: number) => {
                    const vendor =
                      item.vendor && typeof item.vendor === "object"
                        ? item.vendor
                        : null;
                    const shop =
                      item.shop && typeof item.shop === "object"
                        ? item.shop
                        : null;
                    return (
                      <div
                        key={idx}
                        className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-muted/20 hover:bg-muted/40 transition-colors"
                      >
                        {/* Product image */}
                        <div className="h-14 w-14 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0 bg-muted flex items-center justify-center">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-6 w-6 text-muted-foreground" />
                          )}
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-foreground leading-tight line-clamp-1">
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                            <span className="text-xs text-muted-foreground">
                              Qty:{" "}
                              <span className="font-semibold text-foreground">
                                {item.quantity}
                              </span>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Unit:{" "}
                              <span className="font-semibold text-foreground">
                                {formatCurrency(item.price)}
                              </span>
                            </span>
                            {shop && (
                              <span className="text-xs text-muted-foreground">
                                Shop:{" "}
                                <span className="font-semibold text-foreground">
                                  {shop.name}
                                </span>
                              </span>
                            )}
                            {vendor && (
                              <span className="text-xs text-muted-foreground">
                                Vendor:{" "}
                                <span className="font-semibold text-foreground">
                                  {vendor.name}
                                </span>
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Line total */}
                        <div className="shrink-0 text-right">
                          <p className="font-extrabold text-sm text-primary">
                            {formatCurrency(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ── 4. Order Summary ── */}
              <div className="rounded-2xl border border-border/40 bg-card p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Order Summary
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(order.subTotal)}
                    </span>
                  </div>
                  {order.discount !== undefined && order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        Discount
                        {order.couponCode && (
                          <Badge className="bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-[10px] font-bold px-1.5 py-0 rounded-md">
                            {order.couponCode}
                          </Badge>
                        )}
                      </span>
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        -{formatCurrency(order.discount)}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-border/40 pt-2 mt-1 flex justify-between">
                    <span className="font-extrabold text-base text-foreground">
                      Total Amount
                    </span>
                    <span className="font-extrabold text-base text-primary">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── 5. System Information ── */}
              <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  System Information
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Created At
                    </p>
                    <p className="font-semibold text-sm text-foreground mt-0.5">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                      Updated At
                    </p>
                    <p className="font-semibold text-sm text-foreground mt-0.5">
                      {formatDate(order.updatedAt)}
                    </p>
                  </div>
                  {order.transactionId && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        Transaction ID
                      </p>
                      <p className="font-mono font-semibold text-xs text-foreground mt-0.5 break-all">
                        {order.transactionId}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              Order not found.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────

const AdminOrders = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // ── Debounce search ───────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // ── Reset page on filter change ───────────
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, paymentFilter]);

  // ── Query params ──────────────────────────
  const queryParams = {
    page,
    limit,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter !== "all" && { status: statusFilter }),
    ...(paymentFilter !== "all" && { paymentStatus: paymentFilter }),
  };

  const { data: ordersData, isLoading } = useGetAllOrdersAdminQuery(queryParams);

  const orders: IOrder[] = ordersData?.data ?? [];
  const meta = ordersData?.meta;
  const statistics = (ordersData as any)?.statistics as {
    totalOrders: number;
    totalRevenue: number;
    paidOrders: number;
    pendingOrders: number;
  } | undefined;

  // ─────────────────────────────────────────────
  // Render Actions Dropdown
  // ─────────────────────────────────────────────

  const renderActionsDropdown = (order: IOrder) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-muted cursor-pointer"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="z-[99999] w-56 rounded-xl border border-border/40 bg-card shadow-xl"
      >
        <DropdownMenuItem
          onClick={() => {
            setSelectedOrderId(order._id);
            setIsDetailsOpen(true);
          }}
          className="cursor-pointer gap-2"
        >
          <Eye className="h-4 w-4 text-muted-foreground" />
          View Details
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // ─────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* ── Page Header ── */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Orders
          </h1>
          {!isLoading && (
            <Badge
              variant="secondary"
              className="rounded-full font-bold px-3 py-1 bg-primary/10 text-primary border-primary/25 animate-in zoom-in duration-300"
            >
              {meta?.total ?? 0}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage customer orders and payment records
        </p>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Orders */}
        <Card className="rounded-2xl border border-border/40 bg-card p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Orders
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {isLoading ? (
                <Skeleton className="h-8 w-16 rounded" />
              ) : (
                (statistics?.totalOrders ?? 0)
              )}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </Card>

        {/* Total Revenue */}
        <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Total Revenue
            </p>
            <h3 className="text-xl md:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {isLoading ? (
                <Skeleton className="h-8 w-20 rounded" />
              ) : (
                formatCurrency(statistics?.totalRevenue ?? 0)
              )}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-6 w-6" />
          </div>
        </Card>

        {/* Paid Orders */}
        <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Paid Orders
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded" />
              ) : (
                (statistics?.paidOrders ?? 0)
              )}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </Card>

        {/* Pending Orders */}
        <Card className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] p-5 flex items-center justify-between shadow-sm hover:bg-amber-500/[0.06] transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Orders
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {isLoading ? (
                <Skeleton className="h-8 w-12 rounded" />
              ) : (
                (statistics?.pendingOrders ?? 0)
              )}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Clock3 className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* ── Filters Row ── */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, email or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl h-10 border-input focus-visible:ring-primary w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-10 border-input">
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

          {/* Payment Filter */}
          <Select value={paymentFilter} onValueChange={setPaymentFilter}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-10 border-input">
              <SelectValue placeholder="All Payments" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
              <SelectItem value="all" className="cursor-pointer">
                All Payments
              </SelectItem>
              <SelectItem value="PAID" className="cursor-pointer">
                Paid
              </SelectItem>
              <SelectItem value="UNPAID" className="cursor-pointer text-amber-500 font-medium">
                Unpaid
              </SelectItem>
              <SelectItem value="FAILED" className="cursor-pointer">
                Failed
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Main Content ── */}
      {isLoading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Customer</TableHead>
                  <TableHead className="font-bold text-foreground">Products</TableHead>
                  <TableHead className="font-bold text-foreground">Amount</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Payment</TableHead>
                  <TableHead className="font-bold text-foreground">Date</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow key={idx} className="border-b border-border/30 hover:bg-transparent">
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-28 rounded" />
                        <Skeleton className="h-3.5 w-40 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-24 rounded" />
                          <Skeleton className="h-3 w-16 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24 rounded" />
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
            {Array.from({ length: 5 }).map((_, idx) => (
              <Card
                key={idx}
                className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28 rounded" />
                    <Skeleton className="h-3.5 w-40 rounded" />
                  </div>
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/45">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-4 w-16 rounded ml-auto" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : orders.length === 0 ? (
        /* ── Empty State ── */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
            <ShoppingBag className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">
              No orders found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              No orders match the current filters.
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
                  <TableHead className="font-bold text-foreground">Customer</TableHead>
                  <TableHead className="font-bold text-foreground">Products</TableHead>
                  <TableHead className="font-bold text-foreground">Amount</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Payment</TableHead>
                  <TableHead className="font-bold text-foreground">Date</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: IOrder) => {
                  const customer =
                    order.customer && typeof order.customer === "object"
                      ? order.customer
                      : null;
                  const firstItem = order.items[0];
                  const extraCount = order.items.length - 1;

                  return (
                    <TableRow
                      key={order._id}
                      className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-150"
                    >
                      {/* Customer */}
                      <TableCell className="py-3.5">
                        <div>
                          <div className="font-bold text-foreground tracking-tight leading-tight">
                            {customer?.name ?? "—"}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {customer?.email ?? "—"}
                          </div>
                        </div>
                      </TableCell>

                      {/* Products */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0 bg-muted flex items-center justify-center">
                            {firstItem?.image ? (
                              <img
                                src={firstItem.image}
                                alt={firstItem.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground line-clamp-1 max-w-[150px]">
                              {firstItem?.name ?? "—"}
                            </div>
                            {extraCount > 0 && (
                              <div className="text-[11px] text-muted-foreground mt-0.5">
                                +{extraCount} more item{extraCount > 1 ? "s" : ""}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Amount */}
                      <TableCell className="py-3.5">
                        <div>
                          <div className="font-bold text-foreground text-sm">
                            {formatCurrency(order.totalAmount)}
                          </div>
                          {order.couponCode && (
                            <Badge className="mt-0.5 bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 text-[10px] font-bold px-1.5 py-0 rounded-md">
                              {order.couponCode}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        {getOrderStatusBadge(order.status)}
                      </TableCell>

                      {/* Payment */}
                      <TableCell className="py-3.5">
                        {getPaymentStatusBadge(order.paymentStatus)}
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3.5">
                        <span className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right">
                        {renderActionsDropdown(order)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {orders.map((order: IOrder) => {
              const customer =
                order.customer && typeof order.customer === "object"
                  ? order.customer
                  : null;

              return (
                <Card
                  key={order._id}
                  className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm hover:border-border/80 transition-all duration-300"
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-foreground leading-tight truncate">
                        {customer?.name ?? "Unknown Customer"}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {customer?.email ?? "—"}
                      </p>
                    </div>
                    {renderActionsDropdown(order)}
                  </div>

                  {/* Badges + amount + date row */}
                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-border/40">
                    {getOrderStatusBadge(order.status)}
                    {getPaymentStatusBadge(order.paymentStatus)}
                    <span className="ml-auto font-extrabold text-sm text-primary">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-[11px] text-muted-foreground -mt-2">
                    {formatDate(order.createdAt)}
                  </div>
                </Card>
              );
            })}
          </div>

          {/* ── Pagination ── */}
          {meta && meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
              <span className="text-sm text-muted-foreground">
                Showing{" "}
                <strong>{(page - 1) * limit + 1}</strong> to{" "}
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
                          : "border-border/80 hover:bg-muted",
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

      {/* ── Order Details Dialog ── */}
      <OrderDetailsDialog
        orderId={selectedOrderId}
        open={isDetailsOpen}
        onOpenChange={(open) => {
          setIsDetailsOpen(open);
          if (!open) setSelectedOrderId(null);
        }}
      />
    </div>
  );
};

export default AdminOrders;
