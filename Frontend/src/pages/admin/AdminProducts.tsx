import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  Check,
  X,
  ShieldAlert,
  AlertTriangle,
  Package,
} from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
  useGetAllProductsAdminQuery,
  useUpdateProductStatusMutation,
} from "@/redux/features/product/product.api";
import type { IAdminProduct } from "@/types";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router";

const getPlaceholderBg = (name: string) => {
  const charCode = name.charCodeAt(0) || 0;
  const colors = [
    "bg-red-500/10 text-red-600 dark:bg-red-500/25 dark:text-red-400",
    "bg-orange-500/10 text-orange-600 dark:bg-orange-500/25 dark:text-orange-400",
    "bg-amber-500/10 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400",
    "bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/25 dark:text-yellow-400",
    "bg-lime-500/10 text-lime-600 dark:bg-lime-500/25 dark:text-lime-400",
    "bg-green-500/10 text-green-600 dark:bg-green-500/25 dark:text-green-400",
    "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/25 dark:text-emerald-400",
    "bg-teal-500/10 text-teal-600 dark:bg-teal-500/25 dark:text-teal-400",
    "bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/25 dark:text-cyan-400",
    "bg-sky-500/10 text-sky-600 dark:bg-sky-500/25 dark:text-sky-400",
    "bg-blue-500/10 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400",
    "bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/25 dark:text-indigo-400",
    "bg-violet-500/10 text-violet-600 dark:bg-violet-500/25 dark:text-violet-400",
    "bg-purple-500/10 text-purple-600 dark:bg-purple-500/25 dark:text-purple-400",
    "bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/25 dark:text-fuchsia-400",
    "bg-pink-500/10 text-pink-600 dark:bg-pink-500/25 dark:text-pink-400",
    "bg-rose-500/10 text-rose-600 dark:bg-rose-500/25 dark:text-rose-400",
  ];
  return colors[charCode % colors.length];
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Active
        </Badge>
      );
    case "DRAFT":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Draft
        </Badge>
      );
    case "OUT_OF_STOCK":
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold rounded-full px-2.5 py-0.5 whitespace-nowrap">
          Out of Stock
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

const getPageNumbers = (current: number, total: number) => {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, 4, 5];
  }
  if (current >= total - 2) {
    return [total - 4, total - 3, total - 2, total - 1, total];
  }
  return [current - 2, current - 1, current, current + 1, current + 2];
};

const getDialogConfig = (action: "publish" | "draft" | "out_of_stock" | undefined) => {
  switch (action) {
    case "publish":
      return {
        title: "Publish Product",
        description: (name: string) => `'${name}' will become visible to all customers.`,
        btnText: "Publish",
        btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10",
        icon: <Check className="h-5 w-5 text-emerald-600" />,
        iconContainer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      };
    case "draft":
      return {
        title: "Set Product to Draft",
        description: (name: string) => `'${name}' will be hidden from customers and moved to draft.`,
        btnText: "Set to Draft",
        btnClass: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/10",
        icon: <AlertTriangle className="h-5 w-5 text-amber-600" />,
        iconContainer: "bg-amber-500/10 border-amber-500/20 text-amber-600",
      };
    case "out_of_stock":
      return {
        title: "Mark as Out of Stock",
        description: (name: string) => `'${name}' will be marked as out of stock and hidden from customers.`,
        btnText: "Mark Out of Stock",
        btnClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20",
        icon: <X className="h-5 w-5 text-destructive" />,
        iconContainer: "bg-destructive/10 border-destructive/20 text-destructive",
      };
    default:
      return null;
  }
};

const AdminProducts = () => {
  // Critical Auth Pattern
  const { data: userData, isLoading: isAuthLoading } = useUserInfoQuery(undefined);
  const isLoggedIn = !!userData?.data?.email;

  const [updateProductStatus, { isLoading: isUpdating }] = useUpdateProductStatusMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;
  const navigate = useNavigate();

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "publish" | "draft" | "out_of_stock";
    productId: string;
    productName: string;
  } | null>(null);

  const [mutatingId, setMutatingId] = useState<string | null>(null);

  // Statistics counters
  const { data: totalCountData } = useGetAllProductsAdminQuery({ limit: 1 });
  const { data: activeCountData } = useGetAllProductsAdminQuery({ status: "ACTIVE", limit: 1 });
  const { data: draftCountData } = useGetAllProductsAdminQuery({ status: "DRAFT", limit: 1 });

  const totalProducts = totalCountData?.meta?.total ?? 0;
  const activeCount = activeCountData?.meta?.total ?? 0;
  const draftCount = draftCountData?.meta?.total ?? 0;

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const queryParams = {
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
    page,
    limit,
  };

  const { data: productsData, isLoading } = useGetAllProductsAdminQuery(queryParams);

  if (isAuthLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex h-[50vh] items-center justify-center flex-col gap-2">
        <ShieldAlert className="h-8 w-8 text-destructive" />
        <p className="text-sm font-semibold text-muted-foreground">Access Denied</p>
      </div>
    );
  }

  const rawProducts = productsData?.data || [];
  // Sort DRAFT products first by default to make review process easier
  const products = [...rawProducts].sort((a, b) => {
    if (a.status === "DRAFT" && b.status !== "DRAFT") return -1;
    if (a.status !== "DRAFT" && b.status === "DRAFT") return 1;
    return 0;
  });

  const meta = productsData?.meta;

  const handleActionClick = (
    action: "publish" | "draft" | "out_of_stock",
    productId: string,
    productName: string
  ) => {
    // 100ms timeout prevents dropdown vs dialog focus conflict
    setTimeout(() => {
      setConfirmDialog({
        open: true,
        action,
        productId,
        productName,
      });
    }, 100);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    const { action, productId, productName } = confirmDialog;
    setMutatingId(productId);
    setConfirmDialog(null);

    const statusMap = {
      publish: "ACTIVE",
      draft: "DRAFT",
      out_of_stock: "OUT_OF_STOCK",
    };

    try {
      await updateProductStatus({
        id: productId,
        status: statusMap[action],
      }).unwrap();

      const successMsg = {
        publish: `Product "${productName}" published successfully.`,
        draft: `Product "${productName}" set to draft.`,
        out_of_stock: `Product "${productName}" marked as out of stock.`,
      }[action];

      toast.success(successMsg);
    } catch (err: any) {
      toast.error(
        err?.data?.message || `Failed to update status for "${productName}"`
      );
    } finally {
      setMutatingId(null);
    }
  };

  const dialogConfig = getDialogConfig(confirmDialog?.action);

  const renderActionsDropdown = (product: IAdminProduct) => {
    const isActive = product.status === "ACTIVE";
    const isDraft = product.status === "DRAFT";
    const isOutOfStock = product.status === "OUT_OF_STOCK";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-muted cursor-pointer relative"
            disabled={mutatingId === product._id}
          >
            {mutatingId === product._id ? (
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
          {isActive && (
            <>
              <DropdownMenuItem
                onClick={() => handleActionClick("draft", product._id, product.name)}
                className="cursor-pointer gap-2 text-amber-600 dark:text-amber-400 focus:text-amber-600 focus:bg-amber-500/5 font-semibold"
              >
                <AlertTriangle className="h-4 w-4" />
                Set to Draft
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick("out_of_stock", product._id, product.name)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5 font-semibold"
              >
                <X className="h-4 w-4" />
                Mark Out of Stock
              </DropdownMenuItem>
            </>
          )}

          {isDraft && (
            <>
              <DropdownMenuItem
                onClick={() => handleActionClick("publish", product._id, product.name)}
                className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/5 font-semibold"
              >
                <Check className="h-4 w-4" />
                Publish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick("out_of_stock", product._id, product.name)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5 font-semibold"
              >
                <X className="h-4 w-4" />
                Mark Out of Stock
              </DropdownMenuItem>
            </>
          )}

          {isOutOfStock && (
            <>
              <DropdownMenuItem
                onClick={() => handleActionClick("publish", product._id, product.name)}
                className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/5 font-semibold"
              >
                <Check className="h-4 w-4" />
                Publish
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick("draft", product._id, product.name)}
                className="cursor-pointer gap-2 text-amber-600 dark:text-amber-400 focus:text-amber-600 focus:bg-amber-500/5 font-semibold"
              >
                <AlertTriangle className="h-4 w-4" />
                Set to Draft
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator className="bg-border/40" />

          <DropdownMenuItem
            onClick={() => navigate(`/products/${product.slug}`)}
            className="cursor-pointer gap-2 text-muted-foreground"
          >
            <Eye className="h-4 w-4" />
            View Product
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
            Products
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
          Manage all platform products
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Products Card */}
        <Card className="rounded-2xl border border-border/40 bg-card p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Products
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {totalProducts}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground">
            <Package className="h-6 w-6" />
          </div>
        </Card>

        {/* Active Products Card */}
        <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Active Products
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {activeCount}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Check className="h-6 w-6" />
          </div>
        </Card>

        {/* Draft Products Card */}
        <Card className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] p-5 flex items-center justify-between shadow-sm hover:bg-amber-500/[0.06] transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Draft (Needs Attention)
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {draftCount}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6 animate-pulse" />
          </div>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl h-10 border-input focus-visible:ring-primary w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] rounded-xl h-10 border-input">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
              <SelectItem value="all" className="cursor-pointer">
                All Status
              </SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer">
                Active
              </SelectItem>
              <SelectItem value="DRAFT" className="cursor-pointer text-amber-500 font-medium">
                Draft
              </SelectItem>
              <SelectItem value="OUT_OF_STOCK" className="cursor-pointer">
                Out of Stock
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <>
          {/* Desktop Skeleton */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Product</TableHead>
                  <TableHead className="font-bold text-foreground">Shop</TableHead>
                  <TableHead className="font-bold text-foreground">Category</TableHead>
                  <TableHead className="font-bold text-foreground">Price</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 6 }).map((_, idx) => (
                  <TableRow
                    key={idx}
                    className="border-b border-border/30 hover:bg-transparent"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-28 rounded" />
                          <Skeleton className="h-3.5 w-40 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-24 rounded" />
                        <Skeleton className="h-3 w-16 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-20 rounded" />
                        <Skeleton className="h-3 w-14 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-16 rounded" />
                        <Skeleton className="h-3 w-12 rounded" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
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
              <Card
                key={idx}
                className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3.5 w-32 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border/45">
                  <div className="space-y-1.5">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
            <Package className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">
              No products found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Product</TableHead>
                  <TableHead className="font-bold text-foreground">Shop</TableHead>
                  <TableHead className="font-bold text-foreground">Category</TableHead>
                  <TableHead className="font-bold text-foreground">Price</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: IAdminProduct) => (
                  <TableRow
                    key={product._id}
                    className={cn(
                      "border-b border-border/30 hover:bg-muted/30 transition-colors duration-150",
                      product.status === "DRAFT" &&
                      "bg-amber-500/[0.015] hover:bg-amber-500/[0.03] border-l-2 border-l-amber-500"
                    )}
                  >
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0 bg-muted flex items-center justify-center">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className={cn(
                                "h-full w-full flex items-center justify-center font-bold text-sm select-none",
                                getPlaceholderBg(product.name)
                              )}
                            >
                              {product.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-foreground tracking-tight leading-tight line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono line-clamp-1">
                            {product.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div>
                        <div className="font-bold text-sm text-foreground leading-tight line-clamp-1">
                          {product.shop?.name}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span
                            className={cn(
                              "h-1.5 w-1.5 rounded-full inline-block",
                              product.shop?.status === "ACTIVE"
                                ? "bg-emerald-500"
                                : "bg-rose-500"
                            )}
                          ></span>
                          <span className="text-[10px] text-muted-foreground font-medium uppercase">
                            {product.shop?.status || "UNKNOWN"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div>
                        <div className="font-semibold text-sm text-foreground">
                          {product.category?.name}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          Category
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div>
                        <div className="font-bold text-sm text-primary flex items-center gap-1">
                          <span>৳{product.discountPrice ?? product.price}</span>
                          {product.discountPrice && (
                            <span className="text-xs text-muted-foreground line-through font-normal">
                              ৳{product.price}
                            </span>
                          )}
                        </div>
                        <div className="mt-0.5">
                          {product.stock === 0 ? (
                            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                              Out of stock
                            </span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground font-medium">
                              Stock: {product.stock}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      {getStatusBadge(product.status)}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      {renderActionsDropdown(product)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {products.map((product: IAdminProduct) => (
              <Card
                key={product._id}
                className={cn(
                  "rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm hover:border-border/80 transition-all duration-300",
                  product.status === "DRAFT" &&
                  "border-l-4 border-l-amber-500 bg-amber-500/[0.015]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl overflow-hidden border border-border/50 shadow-sm shrink-0 bg-muted flex items-center justify-center">
                      {product.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div
                          className={cn(
                            "h-full w-full flex items-center justify-center font-bold text-sm select-none",
                            getPlaceholderBg(product.name)
                          )}
                        >
                          {product.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground leading-tight line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5 line-clamp-1">
                        {product.slug}
                      </p>
                    </div>
                  </div>

                  {renderActionsDropdown(product)}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/40 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Shop</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full inline-block",
                          product.shop?.status === "ACTIVE"
                            ? "bg-emerald-500"
                            : "bg-rose-500"
                        )}
                      ></span>
                      {product.shop?.name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block font-medium">Category</span>
                    <span className="font-semibold text-foreground">{product.category?.name}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <div className="font-bold text-sm text-primary flex items-center gap-1">
                      <span>৳{product.discountPrice ?? product.price}</span>
                      {product.discountPrice && (
                        <span className="text-xs text-muted-foreground line-through font-normal">
                          ৳{product.price}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {product.stock === 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">Out of stock</span>
                      ) : (
                        <span>Stock: {product.stock}</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {getStatusBadge(product.status)}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {meta && meta.total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/40">
              <span className="text-sm text-muted-foreground">
                Showing <strong>{(page - 1) * limit + 1}</strong> to{" "}
                <strong>{Math.min(page * limit, meta.total)}</strong> of{" "}
                <strong>{meta.total}</strong> products
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

      {/* Confirmation Alert Dialog */}
      <AlertDialog
        open={confirmDialog?.open || false}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="max-w-md rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
          <AlertDialogHeader className="space-y-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner shrink-0",
                dialogConfig?.iconContainer
              )}
            >
              {dialogConfig?.icon}
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                {dialogConfig?.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                {confirmDialog && dialogConfig?.description(confirmDialog.productName)}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row justify-end gap-3 pt-4">
            <AlertDialogCancel
              disabled={isUpdating}
              className="rounded-xl font-semibold border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmAction();
              }}
              disabled={isUpdating}
              className={cn(
                "min-w-[120px] rounded-xl font-bold transition-all duration-150 active:scale-95 shadow-lg cursor-pointer",
                dialogConfig?.btnClass
              )}
            >
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                dialogConfig?.btnText
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
