import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Plus,
  Loader2,
  Trash2,
  Edit2,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
  useGetAllCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} from "@/redux/features/coupon/coupon.api";
import type { ICoupon } from "@/types";
import { cn } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  DropdownMenuSeparator,
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

const isExpired = (date: string) => {
  return new Date(date) < new Date();
};

const isExpiringSoon = (date: string) => {
  const diff = new Date(date).getTime() - new Date().getTime();
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000;
};

const formatExpiryDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return `৳${amount.toLocaleString("en-US")}`;
};

const getPageNumbers = (current: number, total: number) => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2)
    return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
};

const AdminCoupons = () => {
  // Auth query (critical pattern)
  const { data: userData } = useUserInfoQuery(undefined);
  const isLoggedIn = !!userData?.data?.email;

  // Search & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Dialog / AlertDialog open states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selected entities & mutations
  const [selectedCoupon, setSelectedCoupon] = useState<ICoupon | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  // Form state (both create & edit)
  const [formData, setFormData] = useState({
    code: "",
    discountType: "PERCENTAGE" as "PERCENTAGE" | "FIXED",
    discountValue: "",
    maxDiscount: "",
    minOrderAmount: "",
    usageLimit: "",
    expiryDate: "",
    isActive: true,
  });

  // RTK Mutations
  const [createCoupon, { isLoading: isCreating }] = useCreateCouponMutation();
  const [updateCoupon, { isLoading: isUpdating }] = useUpdateCouponMutation();
  const [deleteCoupon, { isLoading: isDeleting }] = useDeleteCouponMutation();

  // Debouncing Search (300ms)
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Reset page to 1 on search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Query Params
  const queryParams = {
    page,
    limit,
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
  };

  // Fetch Coupons
  const { data, isLoading } = useGetAllCouponsQuery(queryParams, {
    skip: !isLoggedIn,
  });
  const coupons: ICoupon[] = data?.data || [];
  const meta = data?.meta;

  // Min date for expiry date inputs (today's date)
  const todayString = new Date().toISOString().split("T")[0];

  // Reset Form State
  const resetForm = () => {
    setFormData({
      code: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      maxDiscount: "",
      minOrderAmount: "",
      usageLimit: "",
      expiryDate: "",
      isActive: true,
    });
  };

  // Handle Dialog closes
  const handleCreateOpenChange = (open: boolean) => {
    setIsCreateOpen(open);
    if (!open) resetForm();
  };

  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      resetForm();
      setSelectedCoupon(null);
    }
  };

  // Edit action trigger
  const handleEditClick = (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      maxDiscount: String(coupon.maxDiscount || ""),
      minOrderAmount: String(coupon.minOrderAmount || ""),
      usageLimit: String(coupon.usageLimit || ""),
      expiryDate: coupon.expiryDate.split("T")[0],
      isActive: coupon.isActive,
    });
    setIsEditOpen(true);
  };

  // Delete click from actions dropdown
  const handleDeleteClick = (coupon: ICoupon) => {
    setSelectedCoupon(coupon);
    // Timeout fix for dropdown/dialog conflict
    setTimeout(() => {
      setIsDeleteOpen(true);
    }, 100);
  };

  // Active / Inactive Status Toggle (no confirmation dialog)
  const handleToggleActive = async (coupon: ICoupon) => {
    setMutatingId(coupon._id);
    try {
      await updateCoupon({
        id: coupon._id,
        data: { isActive: !coupon.isActive },
      }).unwrap();
      toast.success(
        `Coupon ${coupon.code} ${!coupon.isActive ? "activated" : "deactivated"}`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update coupon status");
    } finally {
      setMutatingId(null);
    }
  };

  // Form submit for creation
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.code.trim().length < 3) {
      toast.error("Coupon code must be at least 3 characters");
      return;
    }

    try {
      const body = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        ...(formData.minOrderAmount && {
          minOrderAmount: Number(formData.minOrderAmount),
        }),
        ...(formData.maxDiscount &&
          formData.discountType === "PERCENTAGE" && {
          maxDiscount: Number(formData.maxDiscount),
        }),
        ...(formData.usageLimit && { usageLimit: Number(formData.usageLimit) }),
        expiryDate: new Date(formData.expiryDate).toISOString(),
        isActive: formData.isActive,
      };

      await createCoupon(body).unwrap();
      toast.success("Coupon created successfully!");
      setIsCreateOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create coupon");
    }
  };

  // Form submit for edits
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCoupon) return;
    if (formData.code.trim().length < 3) {
      toast.error("Coupon code must be at least 3 characters");
      return;
    }

    try {
      const dataPayload = {
        code: formData.code.toUpperCase().trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderAmount: formData.minOrderAmount
          ? Number(formData.minOrderAmount)
          : 0,
        maxDiscount:
          formData.discountType === "PERCENTAGE" && formData.maxDiscount
            ? Number(formData.maxDiscount)
            : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        expiryDate: new Date(formData.expiryDate).toISOString(),
        isActive: formData.isActive,
      };

      await updateCoupon({
        id: selectedCoupon._id,
        data: dataPayload,
      }).unwrap();
      toast.success("Coupon updated successfully!");
      setIsEditOpen(false);
      resetForm();
      setSelectedCoupon(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update coupon");
    }
  };

  // Delete execution
  const handleDeleteConfirm = async () => {
    if (!selectedCoupon) return;
    try {
      await deleteCoupon(selectedCoupon._id).unwrap();
      toast.success(`Coupon ${selectedCoupon.code} deleted successfully`);
      setIsDeleteOpen(false);
      setSelectedCoupon(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete coupon");
    }
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Coupons
            </h1>
            {!isLoading && (
              <Badge
                variant="secondary"
                className="rounded-full font-bold px-3 py-1 bg-primary/10 text-primary border-primary/25 animate-in zoom-in duration-300"
              >
                {meta?.total || 0}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Manage discount coupons
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="rounded-xl h-10 font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-primary/10 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Coupon
        </Button>
      </div>

      {/* Filters Row */}
      <div className="flex items-center max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by coupon code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl h-10 border-input focus-visible:ring-primary w-full"
        />
      </div>

      {/* Main Content */}
      {isLoading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Code</TableHead>
                  <TableHead className="font-bold text-foreground">Type</TableHead>
                  <TableHead className="font-bold text-foreground">Value</TableHead>
                  <TableHead className="font-bold text-foreground">Min Order</TableHead>
                  <TableHead className="font-bold text-foreground">Usage</TableHead>
                  <TableHead className="font-bold text-foreground">Expiry</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-border/30 hover:bg-transparent"
                  >
                    <TableCell>
                      <Skeleton className="h-5 w-20 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12 rounded" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16 rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-12 rounded" />
                        <Skeleton className="h-1.5 w-20 rounded-full" />
                      </div>
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
            {Array.from({ length: 4 }).map((_, idx) => (
              <Card
                key={idx}
                className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-24 rounded" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
                <div className="space-y-2 pt-2 border-t border-border/40">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-4 w-28 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : coupons.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
            <Ticket className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">
              No coupons found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              {searchTerm
                ? "Try adjusting your search by entering a different code."
                : "Create discount codes to offer promotions for platform products."}
            </p>
          </div>
          {!searchTerm && (
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
            >
              Add Your First Coupon
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Code</TableHead>
                  <TableHead className="font-bold text-foreground">Type</TableHead>
                  <TableHead className="font-bold text-foreground">Value</TableHead>
                  <TableHead className="font-bold text-foreground">Min Order</TableHead>
                  <TableHead className="font-bold text-foreground">Usage</TableHead>
                  <TableHead className="font-bold text-foreground">Expiry</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => {
                  const expired = isExpired(coupon.expiryDate);
                  const soon = isExpiringSoon(coupon.expiryDate);
                  const limitReached =
                    !!coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

                  return (
                    <TableRow
                      key={coupon._id}
                      className={cn(
                        "border-b border-border/30 hover:bg-muted/30 transition-colors duration-150 relative",
                        expired && "border-l-4 border-l-destructive/70 bg-destructive/[0.01]"
                      )}
                    >
                      {/* Code */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-foreground tracking-wider uppercase text-sm">
                            {coupon.code}
                          </span>
                          {coupon.isActive ? (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold text-[10px] rounded-md px-1.5 py-0.5">
                              Active
                            </Badge>
                          ) : (
                            <Badge className="bg-muted text-muted-foreground border border-border/40 font-bold text-[10px] rounded-md px-1.5 py-0.5">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Type */}
                      <TableCell className="py-3.5">
                        {coupon.discountType === "PERCENTAGE" ? (
                          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-bold text-[10px] rounded-md px-2 py-0.5">
                            % Off
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold text-[10px] rounded-md px-2 py-0.5">
                            Fixed
                          </Badge>
                        )}
                      </TableCell>

                      {/* Value */}
                      <TableCell className="py-3.5 font-semibold text-foreground text-sm">
                        {coupon.discountType === "PERCENTAGE" ? (
                          <div className="space-y-0.5">
                            <div>{coupon.discountValue}%</div>
                            {coupon.maxDiscount && (
                              <div className="text-[10px] text-muted-foreground font-medium">
                                max {formatCurrency(coupon.maxDiscount)}
                              </div>
                            )}
                          </div>
                        ) : (
                          formatCurrency(coupon.discountValue)
                        )}
                      </TableCell>

                      {/* Min Order */}
                      <TableCell className="py-3.5 font-semibold text-foreground text-sm">
                        {coupon.minOrderAmount > 0
                          ? formatCurrency(coupon.minOrderAmount)
                          : "No minimum"}
                      </TableCell>

                      {/* Usage */}
                      <TableCell className="py-3.5">
                        <div className="space-y-1 w-32">
                          <div className="text-xs font-semibold text-foreground flex items-center justify-between">
                            <span>
                              {coupon.usedCount} /{" "}
                              {coupon.usageLimit || "∞"}
                            </span>
                            {limitReached && (
                              <span className="text-[9px] font-bold text-destructive">
                                Full
                              </span>
                            )}
                          </div>
                          {coupon.usageLimit && (
                            <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all",
                                  limitReached ? "bg-destructive" : "bg-primary"
                                )}
                                style={{
                                  width: `${Math.min(
                                    (coupon.usedCount / coupon.usageLimit) * 100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Expiry */}
                      <TableCell className="py-3.5 text-sm">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "font-medium",
                              expired
                                ? "text-destructive font-bold"
                                : soon
                                  ? "text-amber-500 font-bold"
                                  : "text-muted-foreground"
                            )}
                          >
                            {formatExpiryDate(coupon.expiryDate)}
                          </span>
                          {expired ? (
                            <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[9px] rounded-md px-1 py-0 w-fit">
                              Expired
                            </Badge>
                          ) : soon ? (
                            <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] rounded-md px-1 py-0 w-fit animate-pulse">
                              Expiring Soon
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-3.5 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 rounded-xl hover:bg-muted cursor-pointer relative"
                              disabled={mutatingId === coupon._id}
                            >
                              {mutatingId === coupon._id ? (
                                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                              ) : (
                                <MoreHorizontal className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            sideOffset={8}
                            className="z-[99999] w-48 rounded-xl border border-border/40 bg-card shadow-xl"
                          >
                            <DropdownMenuItem
                              onClick={() => handleEditClick(coupon)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                              Edit Coupon
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(coupon)}
                              className="cursor-pointer gap-2"
                            >
                              <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                              {coupon.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border/40" />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(coupon)}
                              className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {coupons.map((coupon) => {
              const expired = isExpired(coupon.expiryDate);
              const soon = isExpiringSoon(coupon.expiryDate);
              const limitReached =
                !!coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

              return (
                <Card
                  key={coupon._id}
                  className={cn(
                    "rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm hover:border-border/80 transition-all duration-300 relative overflow-hidden",
                    expired && "border-l-4 border-l-destructive/70 bg-destructive/[0.01]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-base text-foreground tracking-wider uppercase">
                        {coupon.code}
                      </span>
                      {coupon.isActive ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-bold text-[9px] rounded-md px-1.5 py-0">
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-muted text-muted-foreground border border-border/40 font-bold text-[9px] rounded-md px-1.5 py-0">
                          Inactive
                        </Badge>
                      )}
                    </div>

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
                        className="z-[99999] w-48 rounded-xl border border-border/40 bg-card shadow-xl"
                      >
                        <DropdownMenuItem
                          onClick={() => handleEditClick(coupon)}
                          className="cursor-pointer gap-2"
                        >
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                          Edit Coupon
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleActive(coupon)}
                          className="cursor-pointer gap-2"
                        >
                          <Ticket className="h-3.5 w-3.5 text-muted-foreground" />
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/40" />
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(coupon)}
                          className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    {coupon.discountType === "PERCENTAGE" ? (
                      <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 font-bold text-[9px] rounded-md">
                        % Off
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 font-bold text-[9px] rounded-md">
                        Fixed
                      </Badge>
                    )}
                    <span className="font-extrabold text-foreground">
                      {coupon.discountType === "PERCENTAGE" ? (
                        <>
                          {coupon.discountValue}%
                          {coupon.maxDiscount && (
                            <span className="text-[10px] font-normal text-muted-foreground ml-1">
                              (max {formatCurrency(coupon.maxDiscount)})
                            </span>
                          )}
                        </>
                      ) : (
                        formatCurrency(coupon.discountValue)
                      )}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-border/40 text-xs space-y-2">
                    <div className="flex justify-between items-center text-muted-foreground">
                      <span>Min Order:</span>
                      <span className="font-semibold text-foreground">
                        {coupon.minOrderAmount > 0
                          ? formatCurrency(coupon.minOrderAmount)
                          : "No minimum"}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-muted-foreground">
                        <span>Usage:</span>
                        <span className="font-semibold text-foreground">
                          {coupon.usedCount} / {coupon.usageLimit || "∞"}
                        </span>
                      </div>
                      {coupon.usageLimit && (
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              limitReached ? "bg-destructive" : "bg-primary"
                            )}
                            style={{
                              width: `${Math.min(
                                (coupon.usedCount / coupon.usageLimit) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-muted-foreground">Expires:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "font-bold",
                            expired
                              ? "text-destructive"
                              : soon
                                ? "text-amber-500"
                                : "text-foreground"
                          )}
                        >
                          {formatExpiryDate(coupon.expiryDate)}
                        </span>
                        {expired ? (
                          <Badge className="bg-destructive/10 text-destructive border border-destructive/20 text-[8px] rounded px-1 py-0">
                            Expired
                          </Badge>
                        ) : soon ? (
                          <Badge className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[8px] rounded px-1 py-0 animate-pulse">
                            Expiring
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Pagination */}
          {meta && meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
              <span className="text-sm text-muted-foreground">
                Showing <strong>{(page - 1) * limit + 1}</strong> to{" "}
                <strong>{Math.min(page * limit, meta.total)}</strong> of{" "}
                <strong>{meta.total}</strong> coupons
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

      {/* CREATE NEW COUPON DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
        <DialogContent className="overflow-y-auto max-h-[90vh] custom-scrollbar border border-border/40 bg-card/95 backdrop-blur-md max-w-md animate-in zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Create New Coupon
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a new promotional coupon code to the system.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateSubmit} className="space-y-4 pt-2">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <Label htmlFor="code" className="text-xs font-bold text-foreground">
                Coupon Code *
              </Label>
              <Input
                id="code"
                required
                minLength={3}
                maxLength={20}
                placeholder="e.g. EID20"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
              />
            </div>

            {/* Discount Type & Value Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Discount Type */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="discountType"
                  className="text-xs font-bold text-foreground"
                >
                  Discount Type *
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountType: val as "PERCENTAGE" | "FIXED",
                    }))
                  }
                >
                  <SelectTrigger className="w-full rounded-xl h-10 border-input">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
                    <SelectItem value="PERCENTAGE" className="cursor-pointer">
                      Percentage (%)
                    </SelectItem>
                    <SelectItem value="FIXED" className="cursor-pointer">
                      Fixed (৳)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="discountValue"
                  className="text-xs font-bold text-foreground"
                >
                  {formData.discountType === "PERCENTAGE"
                    ? "Discount (%) *"
                    : "Discount Amount (৳) *"}
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  required
                  placeholder={
                    formData.discountType === "PERCENTAGE" ? "20" : "500"
                  }
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountValue: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
              </div>
            </div>

            {/* Max Discount Cap (only for PERCENTAGE) */}
            {formData.discountType === "PERCENTAGE" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="maxDiscount"
                  className="text-xs font-bold text-foreground"
                >
                  Max Discount Cap (৳)
                </Label>
                <Input
                  id="maxDiscount"
                  type="number"
                  min="0"
                  placeholder="500"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxDiscount: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
                <p className="text-[10px] text-muted-foreground/80">
                  Maximum discount regardless of percentage
                </p>
              </div>
            )}

            {/* Minimum Order Amount & Usage Limit Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Min Order */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="minOrderAmount"
                  className="text-xs font-bold text-foreground"
                >
                  Min Order Amount (৳)
                </Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minOrderAmount: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="usageLimit"
                  className="text-xs font-bold text-foreground"
                >
                  Usage Limit
                </Label>
                <Input
                  id="usageLimit"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usageLimit: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label
                htmlFor="expiryDate"
                className="text-xs font-bold text-foreground"
              >
                Expiry Date *
              </Label>
              <div className="relative">
                <Input
                  id="expiryDate"
                  type="date"
                  required
                  min={todayString}
                  value={formData.expiryDate}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expiryDate: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
              </div>
            </div>

            {/* Status (checkbox) */}
            <div className="flex items-center space-x-2.5 py-1">
              <Checkbox
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked === true,
                  }))
                }
                className="cursor-pointer"
              />
              <Label
                htmlFor="isActive"
                className="text-xs font-semibold text-muted-foreground select-none cursor-pointer"
              >
                Active immediately
              </Label>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsCreateOpen(false)}
                className="rounded-xl font-bold flex-1 h-10 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="rounded-xl font-bold flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
              >
                {isCreating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Coupon"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT COUPON DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="overflow-y-auto max-h-[90vh] custom-scrollbar border border-border/40 bg-card/95 backdrop-blur-md max-w-md animate-in zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Coupon</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the details of coupon '{selectedCoupon?.code}'.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            {/* Coupon Code */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-code"
                className="text-xs font-bold text-foreground"
              >
                Coupon Code *
              </Label>
              <Input
                id="edit-code"
                required
                minLength={3}
                maxLength={20}
                placeholder="e.g. EID20"
                value={formData.code}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    code: e.target.value.toUpperCase(),
                  }))
                }
                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
              />
            </div>

            {/* Discount Type & Value Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Discount Type */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-discountType"
                  className="text-xs font-bold text-foreground"
                >
                  Discount Type *
                </Label>
                <Select
                  value={formData.discountType}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountType: val as "PERCENTAGE" | "FIXED",
                    }))
                  }
                >
                  <SelectTrigger className="w-full rounded-xl h-10 border-input">
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
                    <SelectItem value="PERCENTAGE" className="cursor-pointer">
                      Percentage (%)
                    </SelectItem>
                    <SelectItem value="FIXED" className="cursor-pointer">
                      Fixed (৳)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-discountValue"
                  className="text-xs font-bold text-foreground"
                >
                  {formData.discountType === "PERCENTAGE"
                    ? "Discount (%) *"
                    : "Discount Amount (৳) *"}
                </Label>
                <Input
                  id="edit-discountValue"
                  type="number"
                  min="0"
                  required
                  placeholder={
                    formData.discountType === "PERCENTAGE" ? "20" : "500"
                  }
                  value={formData.discountValue}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      discountValue: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
              </div>
            </div>

            {/* Max Discount Cap (only for PERCENTAGE) */}
            {formData.discountType === "PERCENTAGE" && (
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-maxDiscount"
                  className="text-xs font-bold text-foreground"
                >
                  Max Discount Cap (৳)
                </Label>
                <Input
                  id="edit-maxDiscount"
                  type="number"
                  min="0"
                  placeholder="500"
                  value={formData.maxDiscount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      maxDiscount: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
                <p className="text-[10px] text-muted-foreground/85">
                  Maximum discount regardless of percentage
                </p>
              </div>
            )}

            {/* Minimum Order Amount & Usage Limit Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Min Order */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-minOrderAmount"
                  className="text-xs font-bold text-foreground"
                >
                  Min Order Amount (৳)
                </Label>
                <Input
                  id="edit-minOrderAmount"
                  type="number"
                  min="0"
                  placeholder="1000"
                  value={formData.minOrderAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      minOrderAmount: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
              </div>

              {/* Usage Limit */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="edit-usageLimit"
                  className="text-xs font-bold text-foreground"
                >
                  Usage Limit
                </Label>
                <Input
                  id="edit-usageLimit"
                  type="number"
                  min="1"
                  placeholder="100"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      usageLimit: e.target.value,
                    }))
                  }
                  className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
                />
              </div>
            </div>

            {/* Expiry Date */}
            <div className="space-y-1.5">
              <Label
                htmlFor="edit-expiryDate"
                className="text-xs font-bold text-foreground"
              >
                Expiry Date *
              </Label>
              <Input
                id="edit-expiryDate"
                type="date"
                required
                min={todayString}
                value={formData.expiryDate}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    expiryDate: e.target.value,
                  }))
                }
                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
              />
            </div>

            {/* Status (checkbox) */}
            <div className="flex items-center space-x-2.5 py-1">
              <Checkbox
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: checked === true,
                  }))
                }
                className="cursor-pointer"
              />
              <Label
                htmlFor="edit-isActive"
                className="text-xs font-semibold text-muted-foreground select-none cursor-pointer"
              >
                Active
              </Label>
            </div>

            <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditOpen(false)}
                className="rounded-xl font-bold flex-1 h-10 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isUpdating}
                className="rounded-xl font-bold flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM ALERT DIALOG */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent className="max-w-md rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
          <AlertDialogHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner shrink-0">
              <Trash2 className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                Delete Coupon
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Are you sure you want to delete coupon '
                <span className="font-mono font-bold text-foreground">
                  {selectedCoupon?.code}
                </span>
                '? This action cannot be undone. Existing orders using this
                coupon are not affected.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row justify-end gap-3 pt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl font-semibold border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="min-w-[120px] rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-lg hover:shadow-destructive/20 transition-all duration-150 active:scale-95 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminCoupons;
