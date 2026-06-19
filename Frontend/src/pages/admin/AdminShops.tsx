import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  Check,
  X,
  ShieldAlert,
  Store,
  AlertTriangle,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
  useGetAllShopsAdminQuery,
  useGetShopByIdAdminQuery,
  useUpdateShopStatusMutation,
} from "@/redux/features/shop/shop.api";
import type { IAdminShop } from "@/types";
import { cn } from "@/lib/utils";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";

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
    case "PENDING":
      return (
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold rounded-full px-2.5 py-0.5">
            Pending
          </Badge>
          <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-1.5 py-0.5 rounded-md border border-amber-500/20 animate-pulse whitespace-nowrap">
            Needs Review
          </span>
        </div>
      );
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold rounded-full px-2.5 py-0.5">
          Active
        </Badge>
      );
    case "SUSPENDED":
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold rounded-full px-2.5 py-0.5">
          Suspended
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-slate-500/15 text-slate-600 dark:text-slate-400 border border-slate-500/25 font-bold rounded-full px-2.5 py-0.5">
          Rejected
        </Badge>
      );
    default:
      return (
        <Badge className="font-bold rounded-full px-2.5 py-0.5">{status}</Badge>
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

const getDialogConfig = (action: string | undefined) => {
  switch (action) {
    case "approve":
      return {
        title: "Approve Shop",
        description: (shopName: string) =>
          `Are you sure you want to approve '${shopName}'? The vendor will be notified and the shop will become visible to customers.`,
        btnText: "Approve",
        btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10",
        icon: <Check className="h-5 w-5 text-emerald-600" />,
        iconContainer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      };
    case "reactivate":
      return {
        title: "Reactivate Shop",
        description: (shopName: string) =>
          `Are you sure you want to reactivate '${shopName}'? The shop will become visible to customers again.`,
        btnText: "Reactivate",
        btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/10",
        icon: <Check className="h-5 w-5 text-emerald-600" />,
        iconContainer: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600",
      };
    case "reject":
      return {
        title: "Reject Shop",
        description: (shopName: string) =>
          `Are you sure you want to reject '${shopName}'? The vendor will not be able to sell on the platform.`,
        btnText: "Reject",
        btnClass: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20",
        icon: <X className="h-5 w-5 text-destructive" />,
        iconContainer: "bg-destructive/10 border-destructive/20 text-destructive",
      };
    case "suspend":
      return {
        title: "Suspend Shop",
        description: (shopName: string) =>
          `Are you sure you want to suspend '${shopName}'? All products will be hidden from customers.`,
        btnText: "Suspend",
        btnClass: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-500/10",
        icon: <ShieldAlert className="h-5 w-5 text-orange-600" />,
        iconContainer: "bg-orange-500/10 border-orange-500/20 text-orange-600",
      };
    default:
      return {
        title: "Confirm Action",
        description: (shopName: string) => `Are you sure you want to proceed with '${shopName}'?`,
        btnText: "Confirm",
        btnClass: "bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/20",
        icon: <ShieldAlert className="h-5 w-5" />,
        iconContainer: "bg-primary/10 border-primary/20 text-primary",
      };
  }
};

const AdminShops = () => {
  // critical auth pattern
  // States
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: "approve" | "reject" | "suspend" | "reactivate";
    shopId: string;
    shopName: string;
  } | null>(null);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const limit = 10;

  // Query HOOKS

  const { data: userData, isLoading: isAuthLoading } = useUserInfoQuery(undefined);
  const { data: shopData, isLoading: isShopLoading } =
    useGetShopByIdAdminQuery(selectedShopId!, {
      skip: !selectedShopId,
    });
  const [updateShopStatus, { isLoading: isUpdating }] = useUpdateShopStatusMutation();
  // Stats Counters (RTK Query Cache Invalidates all of these because they use providesTags: ["Shop"])
  const { data: allShopsCountData } = useGetAllShopsAdminQuery({ limit: 1 });
  const { data: pendingCountData } = useGetAllShopsAdminQuery({ status: "PENDING", limit: 1 });
  const { data: activeCountData } = useGetAllShopsAdminQuery({ status: "ACTIVE", limit: 1 });
  const { data: suspendedCountData } = useGetAllShopsAdminQuery({ status: "SUSPENDED", limit: 1 });


  //EFFECTS
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  //DERIVED VALUES

  const isLoggedIn = !!userData?.data?.email;

  const queryParams = {
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
    page,
    limit,
  };

  const { data: shopsData, isLoading } = useGetAllShopsAdminQuery(queryParams);

  const totalShops = allShopsCountData?.meta?.total || 0;
  const pendingCount = pendingCountData?.meta?.total || 0;
  const activeCount = activeCountData?.meta?.total || 0;
  const suspendedCount = suspendedCountData?.meta?.total || 0;

  //Handlers 

  const handleActionClick = (
    action: "approve" | "reject" | "suspend" | "reactivate",
    shopId: string,
    shopName: string
  ) => {
    // 100ms timeout prevents dropdown vs dialog focus conflict
    setTimeout(() => {
      setConfirmDialog({
        open: true,
        action,
        shopId,
        shopName,
      });
    }, 100);
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;
    const { action, shopId, shopName } = confirmDialog;
    setMutatingId(shopId);
    setConfirmDialog(null);

    const statusMap = {
      approve: "ACTIVE",
      reject: "REJECTED",
      suspend: "SUSPENDED",
      reactivate: "ACTIVE",
    };

    try {
      await updateShopStatus({
        id: shopId,
        status: statusMap[action],
      }).unwrap();

      const successMsg = {
        approve: `Approved shop "${shopName}" successfully.`,
        reject: `Rejected shop "${shopName}".`,
        suspend: `Suspended shop "${shopName}".`,
        reactivate: `Reactivated shop "${shopName}".`,
      }[action];

      toast.success(successMsg);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to ${action} shop "${shopName}"`);
    } finally {
      setMutatingId(null);
    }
  };

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


  const rawShops = shopsData?.data || [];
  // Sort PENDING shops first by default
  const shops = [...rawShops].sort((a, b) => {
    if (a.status === "PENDING" && b.status !== "PENDING") return -1;
    if (a.status !== "PENDING" && b.status === "PENDING") return 1;
    return 0;
  });

  const meta = shopsData?.meta;



  const dialogConfig = getDialogConfig(confirmDialog?.action);

  const renderActionsDropdown = (shop: IAdminShop) => {
    const isPending = shop.status === "PENDING";
    const isActive = shop.status === "ACTIVE";
    const isSuspended = shop.status === "SUSPENDED";
    const isRejected = shop.status === "REJECTED";

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-muted cursor-pointer relative"
            disabled={mutatingId === shop._id}
          >
            {mutatingId === shop._id ? (
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
          {isPending && (
            <>
              <DropdownMenuItem
                onClick={() => handleActionClick("approve", shop._id, shop.name)}
                className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/5 font-semibold"
              >
                <Check className="h-4 w-4" />
                Approve Shop
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick("reject", shop._id, shop.name)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5 font-semibold"
              >
                <X className="h-4 w-4" />
                Reject Shop
              </DropdownMenuItem>
            </>
          )}

          {isActive && (
            <DropdownMenuItem
              onClick={() => handleActionClick("suspend", shop._id, shop.name)}
              className="cursor-pointer gap-2 text-orange-500 focus:text-orange-500 focus:bg-orange-500/5 font-semibold"
            >
              <Ban className="h-4 w-4" />
              Suspend Shop
            </DropdownMenuItem>
          )}

          {isSuspended && (
            <>
              <DropdownMenuItem
                onClick={() => handleActionClick("reactivate", shop._id, shop.name)}
                className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/5 font-semibold"
              >
                <Check className="h-4 w-4" />
                Reactivate Shop
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleActionClick("reject", shop._id, shop.name)}
                className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/5 font-semibold"
              >
                <X className="h-4 w-4" />
                Reject Shop
              </DropdownMenuItem>
            </>
          )}

          {isRejected && (
            <DropdownMenuItem
              onClick={() => handleActionClick("approve", shop._id, shop.name)}
              className="cursor-pointer gap-2 text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-500/5 font-semibold"
            >
              <Check className="h-4 w-4" />
              Approve Shop
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator className="bg-border/40" />

          <DropdownMenuItem
            onClick={() => {
              setSelectedShopId(shop._id);
              setIsDetailsOpen(true);
            }}
            className="cursor-pointer gap-2"
          >
            <Eye className="h-4 w-4" />
            View Details
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
            Shops
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
          Manage and approve vendor shops
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Shops Card */}
        <Card className="rounded-2xl border border-border/40 bg-card p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Shops
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              {totalShops}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-center text-muted-foreground">
            <Store className="h-6 w-6" />
          </div>
        </Card>

        {/* Pending Shops Card (Most Important) */}
        <Card className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.03] dark:bg-amber-500/[0.05] p-5 flex items-center justify-between shadow-sm hover:bg-amber-500/[0.06] transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Pending Review
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
              {pendingCount}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </Card>

        {/* Active Shops Card */}
        <Card className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.05] p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Active Shops
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {activeCount}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </Card>

        {/* Suspended Shops Card */}
        <Card className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] dark:bg-rose-500/[0.05] p-5 flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Suspended
            </p>
            <h3 className="text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">
              {suspendedCount}
            </h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-600 dark:text-rose-400">
            <Ban className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search shops..."
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
              <SelectItem value="PENDING" className="cursor-pointer text-amber-500 font-medium">
                Pending Review
              </SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer">
                Active
              </SelectItem>
              <SelectItem value="SUSPENDED" className="cursor-pointer">
                Suspended
              </SelectItem>
              <SelectItem value="REJECTED" className="cursor-pointer">
                Rejected
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
                  <TableHead className="font-bold text-foreground">Shop</TableHead>
                  <TableHead className="font-bold text-foreground">Vendor</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Products</TableHead>
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
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-28 rounded" />
                          <Skeleton className="h-3.5 w-20 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-3.5 w-20 rounded" />
                          <Skeleton className="h-3 w-28 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-12 rounded" />
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
                    <Skeleton className="h-10 w-10 rounded-xl" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3.5 w-20 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-border/45 justify-between">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-12 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : shops.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
            <Store className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">No shops found</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Shops Table */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">Shop</TableHead>
                  <TableHead className="font-bold text-foreground">Vendor</TableHead>
                  <TableHead className="font-bold text-foreground">Status</TableHead>
                  <TableHead className="font-bold text-foreground">Products</TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shops.map((shop: IAdminShop) => (
                  <TableRow
                    key={shop._id}
                    className={cn(
                      "border-b border-border/30 hover:bg-muted/30 transition-colors duration-150",
                      shop.status === "PENDING" &&
                      "bg-amber-500/[0.015] hover:bg-amber-500/[0.03] border-l-2 border-l-amber-500"
                    )}
                  >
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/50 shadow-sm rounded-xl">
                          {shop.logo ? (
                            <AvatarImage src={shop.logo} alt={shop.name} className="rounded-xl object-cover" />
                          ) : null}
                          <AvatarFallback
                            className={cn(
                              "font-bold text-sm select-none rounded-xl",
                              getPlaceholderBg(shop.name)
                            )}
                          >
                            {shop.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-foreground tracking-tight leading-tight line-clamp-1">
                            {shop.name}
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                            {shop.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border border-border/50 shadow-sm">
                          {shop.vendor?.picture ? (
                            <AvatarImage src={shop.vendor.picture} alt={shop.vendor.name} />
                          ) : null}
                          <AvatarFallback
                            className={cn(
                              "font-bold text-xs select-none",
                              getPlaceholderBg(shop.vendor?.name || "Vendor")
                            )}
                          >
                            {(shop.vendor?.name || "V").charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="leading-tight">
                          <div className="font-semibold text-xs text-foreground">
                            {shop.vendor?.name || "Unknown Vendor"}
                          </div>
                          <div className="text-[10px] text-muted-foreground font-medium">
                            {shop.vendor?.email || ""}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      {getStatusBadge(shop.status)}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                          {shop.totalProducts}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium">
                          products
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      {renderActionsDropdown(shop)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Shops Cards List */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {shops.map((shop: IAdminShop) => (
              <Card
                key={shop._id}
                className={cn(
                  "rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm hover:border-border/80 transition-all duration-300",
                  shop.status === "PENDING" &&
                  "border-l-4 border-l-amber-500 bg-amber-500/[0.015]"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/50 rounded-xl shadow-sm">
                      {shop.logo ? (
                        <AvatarImage src={shop.logo} alt={shop.name} className="rounded-xl object-cover" />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          "font-bold text-sm select-none rounded-xl",
                          getPlaceholderBg(shop.name)
                        )}
                      >
                        {shop.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm text-foreground leading-tight">
                        {shop.name}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {shop.slug}
                      </p>
                    </div>
                  </div>

                  {renderActionsDropdown(shop)}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border/40 justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 border border-border/50">
                      {shop.vendor?.picture ? (
                        <AvatarImage src={shop.vendor.picture} alt={shop.vendor.name} />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          "font-bold text-[10px] select-none",
                          getPlaceholderBg(shop.vendor?.name || "Vendor")
                        )}
                      >
                        {(shop.vendor?.name || "V").charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-semibold text-[11px] text-foreground">
                      {shop.vendor?.name || "Unknown"}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-foreground">
                    {shop.totalProducts} <span className="text-muted-foreground font-normal">products</span>
                  </div>
                </div>

                <div className="flex items-center pt-1">
                  {getStatusBadge(shop.status)}
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
                <strong>{meta.total}</strong> shops
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
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-h-[90vh] p-8 rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md shadow-xl overflow-y-auto custom-scrollbar">

          {isShopLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-48 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* Banner */}
                <div className="relative h-72 overflow-hidden rounded-2xl border border-border/40">
                  <img
                    src={shopData?.data?.banner}
                    alt={shopData?.data?.name}
                    className="h-full w-full object-cover"
                  />

                  <div className="absolute bottom-4 left-4 flex items-center gap-4">
                    <img
                      src={shopData?.data?.logo}
                      alt={shopData?.data?.name}
                      className="h-20 w-20 rounded-2xl border-4 border-background bg-background object-cover shadow-lg"
                    />

                    <div>
                      <h2 className="text-2xl font-extrabold text-white drop-shadow">
                        {shopData?.data?.name}
                      </h2>

                      <p className="text-sm text-white/90">
                        /{shopData?.data?.slug}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="rounded-2xl border border-border/40 p-5">
                  <h3 className="font-bold mb-2">Description</h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {shopData?.data?.description || "No description available"}
                  </p>
                </div>

                {/* Statistics */}
                <div className="grid gap-2 md:grid-cols-4">

                  <div className="rounded-2xl border border-border/40 p-1 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Products
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {shopData?.data?.totalProducts}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/40 p-1 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Sales
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {shopData?.data?.totalSales}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/40 p-1 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Revenue
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      ৳{shopData?.data?.totalRevenue}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-border/40 p-1 text-center">
                    <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                      Rating
                    </p>
                    <p className="mt-2 text-2xl font-bold">
                      {shopData?.data?.rating}
                    </p>
                  </div>

                </div>

                {/* Vendor & Contact */}
                <div className="grid gap-4 md:grid-cols-2">

                  <div className="rounded-2xl border border-border/40 p-5">
                    <h3 className="font-bold mb-4">Vendor Information</h3>

                    <div className="space-y-3">

                      <div>
                        <p className="text-xs text-muted-foreground">Vendor Name</p>
                        <p className="font-semibold">
                          {shopData?.data?.vendor?.name}
                        </p>
                      </div>

                      <div >
                        <p className="text-xs text-muted-foreground">Vendor Email</p>
                        <p className="font-semibold break-words">
                          {shopData?.data?.vendor?.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Role</p>
                        <p className="font-semibold">
                          {shopData?.data?.vendor?.role}
                        </p>
                      </div>

                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/40 p-5">
                    <h3 className="font-bold mb-4">Contact Information</h3>

                    <div className="space-y-3">

                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-semibold">
                          {shopData?.data?.email}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="font-semibold">
                          {shopData?.data?.phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground">Address</p>
                        <p className="font-semibold">
                          {shopData?.data?.address}
                        </p>
                      </div>

                    </div>
                  </div>

                </div>

                {/* Footer Information */}
                <div className="rounded-2xl border border-border/40 p-5">
                  <h3 className="font-bold mb-4">System Information</h3>

                  <div className="grid gap-4 md:grid-cols-3">

                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <p className="font-semibold">
                        {shopData?.data?.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Created At</p>
                      <p className="font-semibold">
                        {new Date(shopData?.data?.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">Updated At</p>
                      <p className="font-semibold">
                        {new Date(shopData?.data?.updatedAt).toLocaleDateString()}
                      </p>
                    </div>

                  </div>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDetailsOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

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
                {confirmDialog && dialogConfig?.description(confirmDialog.shopName)}
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

export default AdminShops;
