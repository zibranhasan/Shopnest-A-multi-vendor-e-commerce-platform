import { useState, useEffect } from "react";
import {
  Search,
  MoreHorizontal,
  Eye,
  Loader2,
  Check,
  X,
  ShieldAlert,
  Users,
  Shield,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
  useGetAllUsersQuery,
  useChangeUserRoleMutation,
  useChangeUserStatusMutation,
} from "@/redux/features/user/admin.user.api";
import type { IAdminUser } from "@/types";
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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import { useGetUserByIdQuery } from "@/redux/features/user/user.api";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

const getRoleBadge = (role: string) => {
  switch (role) {
    case "SUPER_ADMIN":
      return (
        <Badge className="bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/25 font-bold rounded-full px-2.5 py-0.5">
          Super Admin
        </Badge>
      );
    case "ADMIN":
      return (
        <Badge className="bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25 font-bold rounded-full px-2.5 py-0.5">
          Admin
        </Badge>
      );
    case "VENDOR":
      return (
        <Badge className="bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/25 font-bold rounded-full px-2.5 py-0.5">
          Vendor
        </Badge>
      );
    case "CUSTOMER":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold rounded-full px-2.5 py-0.5">
          Customer
        </Badge>
      );
    default:
      return (
        <Badge className="font-bold rounded-full px-2.5 py-0.5">{role}</Badge>
      );
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 font-bold rounded-full px-2.5 py-0.5">
          Active
        </Badge>
      );
    case "INACTIVE":
      return (
        <Badge className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25 font-bold rounded-full px-2.5 py-0.5">
          Inactive
        </Badge>
      );
    case "BLOCKED":
      return (
        <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25 font-bold rounded-full px-2.5 py-0.5">
          Blocked
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

const AdminUsers = () => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { data: userData } = useUserInfoQuery(undefined);
  const { data: userProfile, isLoading: isProfileLoading } =
    useGetUserByIdQuery(selectedUserId!, {
      skip: !selectedUserId,
    });
  const currentUserId = userData?.data?._id;

  const [changeUserRole, { isLoading: isChangingRole }] =
    useChangeUserRoleMutation();
  const [changeUserStatus, { isLoading: isChangingStatus }] =
    useChangeUserStatusMutation();


  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [mutatingId, setMutatingId] = useState<string | null>(null);

  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "role" | "status";
    userId: string;
    userName: string;
    value: string;
  } | null>(null);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter, statusFilter]);

  const queryParams = {
    ...(debouncedSearch && { searchTerm: debouncedSearch }),
    ...(roleFilter && roleFilter !== "all" && { role: roleFilter }),
    ...(statusFilter && statusFilter !== "all" && { isActive: statusFilter }),
    page,
    limit,
  };

  const { data, isLoading } = useGetAllUsersQuery(queryParams);
  const users = data?.data || [];
  const meta = data?.meta;

  const handleRoleSelect = (user: IAdminUser, newRole: string) => {
    if (user.role === newRole) return;
    setConfirmDialog({
      open: true,
      type: "role",
      userId: user._id,
      userName: user.name,
      value: newRole,
    });
  };

  const handleStatusSelect = async (user: IAdminUser, newStatus: string) => {
    if (user.isActive === newStatus) return;
    if (newStatus === "BLOCKED") {
      setConfirmDialog({
        open: true,
        type: "status",
        userId: user._id,
        userName: user.name,
        value: newStatus,
      });
    } else {
      setMutatingId(user._id);
      try {
        await changeUserStatus({ id: user._id, isActive: newStatus }).unwrap();
        toast.success(`${user.name}'s status changed to ${newStatus}`);
      } catch (err: any) {
        toast.error(
          err?.data?.message || `Failed to change status to ${newStatus}`,
        );
      } finally {
        setMutatingId(null);
      }
    }
  };

  const handleRoleConfirm = async () => {
    if (!confirmDialog) return;
    const { userId, value, userName } = confirmDialog;
    setMutatingId(userId);
    setConfirmDialog(null);
    try {
      await changeUserRole({ id: userId, role: value }).unwrap();
      toast.success(`${userName}'s role changed to ${value}`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to change role to ${value}`);
    } finally {
      setMutatingId(null);
    }
  };

  const handleStatusConfirm = async () => {
    if (!confirmDialog) return;
    const { userId, value, userName } = confirmDialog;
    setMutatingId(userId);
    setConfirmDialog(null);
    try {
      await changeUserStatus({ id: userId, isActive: value }).unwrap();
      toast.success(`${userName} has been BLOCKED`);
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to block ${userName}`);
    } finally {
      setMutatingId(null);
    }
  };

  const renderActionsDropdown = (user: IAdminUser) => {
    const isSelf = user._id === currentUserId;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-xl hover:bg-muted cursor-pointer relative"
            disabled={mutatingId === user._id}
          >
            {mutatingId === user._id ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={8}
          className="z-[99999] w-56 rounded-xl border border-border/40 bg-card shadow-xl"
        >
          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={isSelf}
              className="cursor-pointer gap-2"
            >
              <Shield className="h-4 w-4 text-muted-foreground" />
              Change Role
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44 rounded-xl border border-border/40 bg-card/95 backdrop-blur-md">
              <DropdownMenuItem
                disabled={user.role === "CUSTOMER"}
                onClick={() => handleRoleSelect(user, "CUSTOMER")}
                className="cursor-pointer"
              >
                Customer
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role === "VENDOR"}
                onClick={() => handleRoleSelect(user, "VENDOR")}
                className="cursor-pointer"
              >
                Vendor
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role === "ADMIN"}
                onClick={() => handleRoleSelect(user, "ADMIN")}
                className="cursor-pointer"
              >
                Admin
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.role === "SUPER_ADMIN"}
                onClick={() => handleRoleSelect(user, "SUPER_ADMIN")}
                className="cursor-pointer"
              >
                Super Admin
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger
              disabled={isSelf}
              className="cursor-pointer gap-2"
            >
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              Change Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-44 rounded-xl border border-border/40 bg-card/95 backdrop-blur-md">
              <DropdownMenuItem
                disabled={user.isActive === "ACTIVE"}
                onClick={() => handleStatusSelect(user, "ACTIVE")}
                className="cursor-pointer"
              >
                Active
              </DropdownMenuItem>
              <DropdownMenuItem
                disabled={user.isActive === "INACTIVE"}
                onClick={() => handleStatusSelect(user, "INACTIVE")}
                className="cursor-pointer"
              >
                Inactive
              </DropdownMenuItem>
              {user.role !== "SUPER_ADMIN" && (
                <DropdownMenuItem
                  disabled={user.isActive === "BLOCKED"}
                  onClick={() => handleStatusSelect(user, "BLOCKED")}
                  className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                >
                  Block User
                </DropdownMenuItem>
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSeparator className="bg-border/40" />

          <DropdownMenuItem
            onClick={() => {
              setSelectedUserId(user._id);
              setIsProfileOpen(true);
            }}
            className="cursor-pointer gap-2"
          >
            <Eye className="h-4 w-4 text-muted-foreground" />
            View Profile
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
            Users
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
          Manage all platform users
        </p>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl h-10 border-input focus-visible:ring-primary w-full"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Role Filter */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-10 border-input">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
              <SelectItem value="all" className="cursor-pointer">
                All Roles
              </SelectItem>
              <SelectItem value="CUSTOMER" className="cursor-pointer">
                Customer
              </SelectItem>
              <SelectItem value="VENDOR" className="cursor-pointer">
                Vendor
              </SelectItem>
              <SelectItem value="ADMIN" className="cursor-pointer">
                Admin
              </SelectItem>
              <SelectItem value="SUPER_ADMIN" className="cursor-pointer">
                Super Admin
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[160px] rounded-xl h-10 border-input">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/40 bg-card/95 backdrop-blur-md">
              <SelectItem value="all" className="cursor-pointer">
                All Status
              </SelectItem>
              <SelectItem value="ACTIVE" className="cursor-pointer">
                Active
              </SelectItem>
              <SelectItem value="INACTIVE" className="cursor-pointer">
                Inactive
              </SelectItem>
              <SelectItem value="BLOCKED" className="cursor-pointer">
                Blocked
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
                  <TableHead className="font-bold text-foreground">
                    User
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Role
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Verified
                  </TableHead>
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
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1.5">
                          <Skeleton className="h-4 w-28 rounded" />
                          <Skeleton className="h-3.5 w-40 rounded" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-5 rounded-full" />
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
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-28 rounded" />
                      <Skeleton className="h-3.5 w-36 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-border/45">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              </Card>
            ))}
          </div>
        </>
      ) : users.length === 0 ? (
        /* Empty State */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
            <Users className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">
              No users found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Users Table */}
          <div className="hidden md:block rounded-2xl border border-border/40 bg-card overflow-hidden shadow-sm">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="font-bold text-foreground">
                    User
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Role
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Status
                  </TableHead>
                  <TableHead className="font-bold text-foreground">
                    Verified
                  </TableHead>
                  <TableHead className="w-[80px] font-bold text-foreground text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user: IAdminUser) => (
                  <TableRow
                    key={user._id}
                    className="border-b border-border/30 hover:bg-muted/30 transition-colors duration-150"
                  >
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border/50 shadow-sm">
                          {user.picture ? (
                            <AvatarImage src={user.picture} alt={user.name} />
                          ) : null}
                          <AvatarFallback
                            className={cn(
                              "font-bold text-sm select-none",
                              getPlaceholderBg(user.name),
                            )}
                          >
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-bold text-foreground tracking-tight leading-tight line-clamp-1 flex items-center gap-1.5">
                            {user.name}
                            {user._id === currentUserId && (
                              <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md border border-primary/20">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5">
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className="py-3.5">
                      {getStatusBadge(user.isActive)}
                    </TableCell>
                    <TableCell className="py-3.5">
                      {user.isVerified ? (
                        <span className="inline-flex items-center justify-center text-emerald-500">
                          <Check className="h-5 w-5 stroke-[3]" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-destructive">
                          <X className="h-5 w-5 stroke-[3]" />
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 text-right">
                      {renderActionsDropdown(user)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Users Cards List */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {users.map((user: IAdminUser) => (
              <Card
                key={user._id}
                className="rounded-2xl border border-border/40 bg-card p-5 space-y-4 shadow-sm hover:border-border/80 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border/50">
                      {user.picture ? (
                        <AvatarImage src={user.picture} alt={user.name} />
                      ) : null}
                      <AvatarFallback
                        className={cn(
                          "font-bold text-sm select-none",
                          getPlaceholderBg(user.name),
                        )}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm text-foreground leading-tight flex items-center gap-1.5">
                        {user.name}
                        {user.isVerified ? (
                          <Check className="h-4 w-4 text-emerald-500 stroke-[3]" />
                        ) : (
                          <X className="h-4 w-4 text-destructive stroke-[3]" />
                        )}
                        {user._id === currentUserId && (
                          <span className="text-[10px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded-md border border-primary/20">
                            You
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  {renderActionsDropdown(user)}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border/40 text-xs">
                  <div className="flex gap-2">
                    {getRoleBadge(user.role)}
                    {getStatusBadge(user.isActive)}
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
                <strong>{meta.total}</strong> users
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

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-2xl rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              User Profile
            </DialogTitle>

            <DialogDescription>
              Detailed information about the selected user
            </DialogDescription>
          </DialogHeader>

          {isProfileLoading ? (
            <div className="space-y-4 py-4">
              <Skeleton className="h-16 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          ) : (
            <>
              {/* User Header */}
              <div className="flex items-center gap-4 rounded-2xl border border-border/40 bg-muted/30 p-5">
                <Avatar className="h-16 w-16 border border-border shadow-sm">
                  <AvatarImage src={userProfile?.data?.picture} />
                  <AvatarFallback className="text-lg font-bold">
                    {userProfile?.data?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <h3 className="text-lg font-bold text-foreground">
                    {userProfile?.data?.name}
                  </h3>

                  <p className="text-sm text-muted-foreground break-all">
                    {userProfile?.data?.email}
                  </p>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-4 md:grid-cols-2 mt-4">

                <div className="rounded-2xl border border-border/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </p>

                  <p className="mt-2 font-bold">
                    {userProfile?.data?.role}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </p>

                  <p className="mt-2 font-bold">
                    {userProfile?.data?.isActive}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Verified
                  </p>

                  <p className="mt-2 font-bold">
                    {userProfile?.data?.isVerified ? "Yes" : "No"}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/40 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </p>

                  <p className="mt-2 font-bold">
                    {userProfile?.data?.phone || "N/A"}
                  </p>
                </div>

              </div>

            </>
          )}

          <DialogFooter className="pt-4">
            <Button
              variant="outline"
              onClick={() => setIsProfileOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>



      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog?.open || false}
        onOpenChange={(open) => !open && setConfirmDialog(null)}
      >
        <AlertDialogContent className="max-w-md rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md p-6 shadow-xl animate-in zoom-in-95 duration-200">
          <AlertDialogHeader className="space-y-3">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner shrink-0",
                confirmDialog?.type === "status"
                  ? "bg-destructive/10 text-destructive border-destructive/20"
                  : "bg-primary/10 text-primary border-primary/20",
              )}
            >
              {confirmDialog?.type === "status" ? (
                <ShieldAlert className="h-5 w-5" />
              ) : (
                <Shield className="h-5 w-5" />
              )}
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                {confirmDialog?.type === "status"
                  ? "Block User"
                  : "Change User Role"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                {confirmDialog?.type === "status" ? (
                  <>
                    Are you sure you want to <strong>BLOCK</strong>{" "}
                    {confirmDialog?.userName}? They will not be able to login.
                  </>
                ) : (
                  <>
                    Are you sure you want to change{" "}
                    <strong>{confirmDialog?.userName}</strong>'s role to{" "}
                    <strong>
                      {confirmDialog?.value === "SUPER_ADMIN"
                        ? "Super Admin"
                        : confirmDialog?.value === "ADMIN"
                          ? "Admin"
                          : confirmDialog?.value === "VENDOR"
                            ? "Vendor"
                            : "Customer"}
                    </strong>
                    ?
                  </>
                )}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="flex flex-row justify-end gap-3 pt-4">
            <AlertDialogCancel
              disabled={isChangingRole || isChangingStatus}
              className="rounded-xl font-semibold border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (confirmDialog?.type === "role") {
                  handleRoleConfirm();
                } else {
                  handleStatusConfirm();
                }
              }}
              disabled={isChangingRole || isChangingStatus}
              className={cn(
                "min-w-[120px] rounded-xl font-bold transition-all duration-150 active:scale-95 shadow-lg cursor-pointer",
                confirmDialog?.type === "status"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20"
                  : "bg-primary text-primary-foreground hover:bg-primary/95 shadow-primary/20",
              )}
            >
              {isChangingRole || isChangingStatus ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
