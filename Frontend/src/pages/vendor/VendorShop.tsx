import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    Store,
    Package,
    ShoppingCart,
    Star,
    MapPin,
    Phone,
    Mail,
    Link as LinkIcon,
    Upload,
    Loader2,
    X,
    Edit2,
} from "lucide-react";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
    useGetMyShopQuery,
    useCreateShopMutation,
    useUpdateMyShopMutation,
    useDeleteMyShopMutation,
} from "@/redux/features/shop/vendor.shop.api";
import type { IVendorShop } from "@/types";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

const VendorShop = () => {
    // Auth query (critical pattern)
    const { data: userData } = useUserInfoQuery(undefined);
    const isLoggedIn = !!userData?.data?.email;

    // RTK Query & Mutations
    const { data, isLoading, isError } = useGetMyShopQuery(undefined, {
        skip: !isLoggedIn,
    });
    const shop: IVendorShop | undefined = data?.data;
    const hasNoShop = isError || !shop;

    // console.log("my shop", shop)

    const [createShop, { isLoading: isCreating }] = useCreateShopMutation();
    const [updateMyShop, { isLoading: isUpdating }] = useUpdateMyShopMutation();
    const [deleteMyShop, { isLoading: isDeleting }] = useDeleteMyShopMutation();

    // Dialog / AlertDialog open states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);

    // File Upload State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState("");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState("");

    //Form State
    const [form, setForm] = useState({
        name: "",
        description: "",
        address: "",
        phone: "",
        email: ""
    })

    // Previews cleanup effect for logo

    useEffect(() => {
        return () => {
            if (logoPreview && logoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }
        }
    }, [logoPreview]);

    //Previews cleanup effect for banner
    useEffect(() => {
        return () => {
            if (bannerPreview && bannerPreview.startsWith("blob:")) {
                URL.revokeObjectURL(bannerPreview);
            }
        }
    }, [bannerPreview])

    // Reset all dialog form states
    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            address: "",
            phone: "",
            email: ""
        });
        setLogoPreview("");
        setBannerPreview("");
        setLogoFile(null);
        setBannerFile(null);
    }

    // Open Edit Dialog and Pre-Populate fields
    const handleOpenEditDialog = () => {
        if (!shop) return;
        setForm({
            name: shop.name,
            description: shop.description || "",
            address: shop.address || "",
            phone: shop.phone || "",
            email: shop.email || "",
        });
        setLogoPreview(shop.logo || "");
        setBannerPreview(shop.banner || "");
        setLogoFile(null);
        setBannerFile(null);
        setIsEditOpen(true);
    }

    const handleEditOpenChange = (open: boolean) => {
        setIsEditOpen(open);
        if (!open) resetForm();
    }




    // Handle Dialog closes
    const handleCreateOpenChange = (open: boolean) => {
        setIsCreateOpen(open);
        if (!open) resetForm();
    };



    //Handle logo file selection
    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file only");
                return;
            }
            setLogoFile(file);
            if (logoPreview && logoPreview.startsWith("blob:")) {
                URL.revokeObjectURL(logoPreview);
            }
            setLogoPreview(URL.createObjectURL(file));
        }
    }
    // Handle banner file selection
    const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file only");
                return;
            }
            setBannerFile(file);
            if (bannerPreview && bannerPreview.startsWith("blob:")) {
                URL.revokeObjectURL(bannerPreview);
            }
            setBannerPreview(URL.createObjectURL(file));
        }
    };

    // Remove logo preview (restores existing shop logo if any)
    const handleRemoveLogo = () => {
        if (logoPreview && logoPreview.startsWith("blob:")) {
            URL.revokeObjectURL(logoPreview);
        }
        setLogoFile(null);
        setLogoPreview(shop?.logo || "");
    };
    // Remove banner preview (restores existing shop banner if any)
    const handleRemoveBanner = () => {
        if (bannerPreview && bannerPreview.startsWith("blob:")) {
            URL.revokeObjectURL(bannerPreview);
        }
        setBannerFile(null);
        setBannerPreview(shop?.banner || "");
    };

    // Handle form submission for creating a shop
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.name.trim().length < 3) {
            toast.error("Shop name must be at least 3 characters");
            return;
        }
        if (form.name.trim().length > 50) {
            toast.error("Shop name must be at most 50 characters");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("name", form.name.trim());
            if (form.description.trim()) {
                fd.append("description", form.description.trim());
            }
            if (form.address.trim()) {
                fd.append("address", form.address.trim());
            }
            if (form.phone.trim()) {
                fd.append("phone", form.phone.trim());
            }
            if (form.email.trim()) {
                fd.append("email", form.email.trim());
            }
            if (logoFile) {
                fd.append("logo", logoFile);
            }
            if (bannerFile) {
                fd.append("banner", bannerFile);
            }

            await createShop(fd).unwrap();
            toast.success("Shop created! Pending approval.");
            setIsCreateOpen(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to create shop");
        }
    };

    // Handle form submission for updating a shop
    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.name.trim().length < 3) {
            toast.error("Shop name must be at least 3 characters");
            return;
        }
        if (form.name.trim().length > 50) {
            toast.error("Shop name must be at most 50 characters");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("name", form.name.trim());
            fd.append("description", form.description.trim());
            fd.append("address", form.address.trim());
            fd.append("phone", form.phone.trim());
            fd.append("email", form.email.trim());

            if (logoFile) {
                fd.append("logo", logoFile);
            }
            if (bannerFile) {
                fd.append("banner", bannerFile);
            }

            await updateMyShop(fd).unwrap();
            toast.success("Shop updated!");
            setIsEditOpen(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update shop");
        }
    };

    // Handle shop soft delete
    const handleDeleteShop = async () => {
        try {
            await deleteMyShop(undefined).unwrap();
            toast.success("Shop deleted successfully!");
            setIsDeleteOpen(false);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete shop");
        }
    };

    // 1. Loading State (Full Page Skeleton)
    if (isLoading || isDeleting) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                {/* Banner Skeleton */}
                <Skeleton className="h-48 w-full rounded-b-2xl" />

                {/* Logo & Name Skeleton */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 px-4 -mt-10 sm:-mt-12 relative z-10">
                    <Skeleton className="h-20 w-20 rounded-2xl border-4 border-background" />
                    <div className="flex-1 space-y-2 text-center sm:text-left pb-2">
                        <Skeleton className="h-8 w-48 mx-auto sm:mx-0 rounded" />
                        <Skeleton className="h-5 w-24 mx-auto sm:mx-0 rounded-full" />
                    </div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <Card key={idx} className="rounded-2xl border border-border/40 p-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-24 rounded" />
                                    <Skeleton className="h-8 w-16 rounded" />
                                </div>
                                <Skeleton className="h-10 w-10 rounded-xl" />
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Details Card Skeleton */}
                <Card className="rounded-2xl border border-border/40 p-6 space-y-6">
                    <div className="space-y-2">
                        <Skeleton className="h-6 w-36 rounded" />
                        <Skeleton className="h-4 w-full rounded" />
                        <Skeleton className="h-4 w-2/3 rounded" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/45">
                        <Skeleton className="h-5 w-40 rounded" />
                        <Skeleton className="h-5 w-32 rounded" />
                        <Skeleton className="h-5 w-48 rounded" />
                        <Skeleton className="h-5 w-36 rounded" />
                    </div>
                </Card>
            </div>
        );
    }

    // 2. State 1 (No Shop empty state)
    if (hasNoShop) {
        return (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                        My Shop
                    </h1>
                </div>

                <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
                    <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
                        <Store className="h-9 w-9 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">
                            You don't have a shop yet
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                            Create your shop to start selling on Shopnest
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
                    >
                        Create My Shop
                    </Button>
                </div>

                {/* CREATE SHOP DIALOG */}
                <Dialog open={isCreateOpen} onOpenChange={handleCreateOpenChange}>
                    <DialogContent className="rounded-2xl max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-extrabold text-foreground">
                                Create Your Shop
                            </DialogTitle>
                            <DialogDescription className="text-muted-foreground text-sm">
                                Fill in your shop details to get started
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleCreateSubmit} className="space-y-5 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-bold text-foreground">
                                    Shop Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="My Awesome Store"
                                    required
                                    minLength={3}
                                    maxLength={50}
                                    className="rounded-xl focus-visible:ring-primary h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-bold text-foreground">
                                    Description
                                </Label>
                                <Textarea
                                    id="description"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Tell customers about your shop..."
                                    maxLength={500}
                                    className="rounded-xl focus-visible:ring-primary min-h-[100px]"
                                />
                                <p className="text-[10px] text-muted-foreground text-right">
                                    {form.description.length}/500 characters
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-bold text-foreground">
                                        Phone
                                    </Label>
                                    <Input
                                        id="phone"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="01712345678"
                                        className="rounded-xl focus-visible:ring-primary h-10"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-bold text-foreground">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="shop@example.com"
                                        className="rounded-xl focus-visible:ring-primary h-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-bold text-foreground">
                                    Address
                                </Label>
                                <Input
                                    id="address"
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="123 Main St, Dhaka"
                                    className="rounded-xl focus-visible:ring-primary h-10"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                                {/* Logo Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground">Shop Logo</Label>
                                    <div className="flex items-center gap-4">
                                        <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border border-border/40 bg-muted flex items-center justify-center shrink-0 shadow-inner">
                                            {logoPreview ? (
                                                <img
                                                    src={logoPreview}
                                                    alt="Logo preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <Store className="h-6 w-6 text-muted-foreground" />
                                            )}
                                            {logoPreview && (
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveLogo}
                                                    className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 cursor-pointer"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <Label
                                                htmlFor="logo-upload"
                                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-input hover:bg-muted cursor-pointer transition-colors"
                                            >
                                                <Upload className="h-3.5 w-3.5" />
                                                Upload Logo
                                            </Label>
                                            <input
                                                id="logo-upload"
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={handleLogoChange}
                                            />
                                            <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                                Image file only
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Banner Upload */}
                                <div className="space-y-2">
                                    <Label className="text-sm font-bold text-foreground">Shop Banner</Label>
                                    <div className="relative border border-dashed border-border/60 rounded-2xl aspect-[16/9] w-full overflow-hidden bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center gap-2 p-3">
                                        {bannerPreview ? (
                                            <>
                                                <img
                                                    src={bannerPreview}
                                                    alt="Banner preview"
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleRemoveBanner}
                                                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/85 transition-colors z-20 cursor-pointer"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <Label
                                                htmlFor="banner-upload"
                                                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4"
                                            >
                                                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                                                <span className="text-[11px] font-bold text-foreground">Upload Banner</span>
                                                <span className="text-[9px] text-muted-foreground mt-0.5">
                                                    16:9 aspect ratio
                                                </span>
                                            </Label>
                                        )}
                                        <input
                                            id="banner-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleBannerChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 border-t border-border/40 gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsCreateOpen(false)}
                                    className="rounded-xl font-bold h-11 px-5 border-border/50 cursor-pointer"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isCreating}
                                    className="rounded-xl font-bold h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-md shadow-primary/15 cursor-pointer"
                                >
                                    {isCreating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Shop"
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }

    // 3. State 2 (Shop Exists Dashboard)
    const isSuspendedOrRejected = shop.status === "SUSPENDED" || shop.status === "REJECTED";

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300">
            {/* Page Title */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    My Shop
                </h1>
            </div>

            {/* SECTION 4 — Status Alerts (Pending / Suspended / Rejected) */}
            {shop.status === "PENDING" && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 text-amber-800 dark:text-amber-300">
                    <span className="text-xl leading-none">⏳</span>
                    <div>
                        <p className="text-sm font-semibold">Your shop is pending approval.</p>
                        <p className="text-xs opacity-90 mt-0.5">
                            Our team will review and approve your shop within 24 hours.
                        </p>
                    </div>
                </div>
            )}

            {shop.status === "SUSPENDED" && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3 text-destructive">
                    <span className="text-xl leading-none">🚫</span>
                    <div>
                        <p className="text-sm font-semibold">Your shop has been suspended.</p>
                        <p className="text-xs opacity-90 mt-0.5">Please contact admin for more information.</p>
                    </div>
                </div>
            )}

            {shop.status === "REJECTED" && (
                <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 flex items-start gap-3 text-destructive">
                    <span className="text-xl leading-none">❌</span>
                    <div>
                        <p className="text-sm font-semibold">Your shop has been rejected.</p>
                        <p className="text-xs opacity-90 mt-0.5">Please contact admin for more information.</p>
                    </div>
                </div>
            )}

            {/* SECTION 1 — Banner & Logo */}
            <div className="relative rounded-2xl border border-border/40 bg-card overflow-hidden">
                {/* Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-muted">
                    {shop.banner ? (
                        <img
                            src={shop.banner}
                            alt={`${shop.name} Banner`}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full bg-gradient-to-r from-primary/20 to-primary/5" />
                    )}
                </div>

                {/* Overlapping Logo, Name, Badge, and Edit Action */}
                <div className="px-6 pb-6 pt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-14 relative z-10">
                        {/* Logo */}
                        <div className="h-20 w-20 rounded-2xl border-4 border-card bg-card shadow-md flex items-center justify-center overflow-hidden shrink-0">
                            {shop.logo ? (
                                <img
                                    src={shop.logo}
                                    alt={`${shop.name} Logo`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="h-full w-full bg-primary text-primary-foreground font-extrabold text-2xl uppercase flex items-center justify-center">
                                    {shop.name.charAt(0)}
                                </div>
                            )}
                        </div>

                        <div className="text-center sm:text-left space-y-1">
                            <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                                {shop.name}
                            </h2>
                            <div>
                                {shop.status === "PENDING" && (
                                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                        Pending Approval
                                    </Badge>
                                )}
                                {shop.status === "ACTIVE" && (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                        Active
                                    </Badge>
                                )}
                                {shop.status === "SUSPENDED" && (
                                    <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                        Suspended
                                    </Badge>
                                )}
                                {shop.status === "REJECTED" && (
                                    <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                        Rejected
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Edit Shop Action (Hidden if Suspended or Rejected) */}
                    {/* {!isSuspendedOrRejected && (
                        <Button
                            onClick={handleOpenEditDialog}
                            className="rounded-xl h-10 font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer self-center sm:self-end"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Shop
                        </Button>
                    )} */}
                    {!isSuspendedOrRejected && (
                        <Button
                            onClick={handleOpenEditDialog}
                            className="rounded-xl h-10 font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-primary/10 cursor-pointer self-center sm:self-end"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit Shop
                        </Button>
                    )}
                </div>
            </div>

            {/* SECTION 2 — Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Products Card */}
                <Card className="rounded-2xl border border-border/45 bg-card/45 backdrop-blur-md shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Products
                            </p>
                            <p className="text-2xl font-extrabold text-foreground">{shop.totalProducts || 0}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20">
                            <Package className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                {/* Sales Card */}
                <Card className="rounded-2xl border border-border/45 bg-card/45 backdrop-blur-md shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Sales
                            </p>
                            <p className="text-2xl font-extrabold text-foreground">{shop.totalSales || 0}</p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                            <ShoppingCart className="h-6 w-6" />
                        </div>
                    </CardContent>
                </Card>

                {/* Revenue Card */}
                <Card className="rounded-2xl border border-border/45 bg-card/45 backdrop-blur-md shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Revenue
                            </p>
                            <p className="text-2xl font-extrabold text-foreground">
                                ৳{(shop.totalRevenue || 0).toLocaleString()}
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                            <span className="text-xl font-black">৳</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Rating Card */}
                <Card className="rounded-2xl border border-border/45 bg-card/45 backdrop-blur-md shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Rating
                            </p>
                            <p className="text-2xl font-extrabold text-foreground">
                                {(shop.rating || 0).toFixed(1)}/5
                            </p>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20">
                            <Star className="h-6 w-6 fill-amber-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* SECTION 3 — Shop Details Card */}
            <Card className="rounded-2xl border border-border/45 bg-card/45 backdrop-blur-md shadow-sm">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground">Shop Details</h3>
                        {!isSuspendedOrRejected && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleOpenEditDialog}
                                className="rounded-xl font-bold border-border/50 hover:bg-muted cursor-pointer"
                            >
                                Edit Details
                            </Button>
                        )}
                    </div>

                    {shop.description && (
                        <div className="space-y-1.5">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Description
                            </p>
                            <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                                {shop.description}
                            </p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border/30 text-sm">
                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-semibold text-foreground">Address:</span>
                            <span className="truncate">{shop.address || "Not specified"}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-semibold text-foreground">Phone:</span>
                            <span className="truncate">{shop.phone || "Not specified"}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-semibold text-foreground">Email:</span>
                            <span className="truncate">{shop.email || "Not specified"}</span>
                        </div>

                        <div className="flex items-center gap-2.5 text-muted-foreground">
                            <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-semibold text-foreground">Shop Link:</span>
                            <Link
                                to={`/shops/${shop.slug}`}
                                className="text-primary hover:underline font-bold truncate"
                            >
                                shopnest.com/shops/{shop.slug}
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* SECTION 5 — Delete Shop (Hidden if Suspended or Rejected) */}
            {!isSuspendedOrRejected && (
                <div className="flex justify-center pt-8 border-t border-border/20">
                    <button
                        onClick={() => setIsDeleteOpen(true)}
                        className="text-xs font-bold text-destructive hover:underline cursor-pointer transition-all duration-200"
                    >
                        Delete Shop
                    </button>
                </div>
            )}

            {/* EDIT SHOP DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
                <DialogContent className="rounded-2xl max-w-xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold text-foreground">Edit Shop</DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Update your shop profile information
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-5 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-bold text-foreground">
                                Shop Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="My Awesome Store"
                                required
                                minLength={3}
                                maxLength={50}
                                className="rounded-xl focus-visible:ring-primary h-10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-sm font-bold text-foreground">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Tell customers about your shop..."
                                maxLength={500}
                                className="rounded-xl focus-visible:ring-primary min-h-[100px]"
                            />
                            <p className="text-[10px] text-muted-foreground text-right">
                                {form.description.length}/500 characters
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-bold text-foreground">
                                    Phone
                                </Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="01712345678"
                                    className="rounded-xl focus-visible:ring-primary h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-bold text-foreground">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="shop@example.com"
                                    className="rounded-xl focus-visible:ring-primary h-10"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-sm font-bold text-foreground">
                                Address
                            </Label>
                            <Input
                                id="address"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="123 Main St, Dhaka"
                                className="rounded-xl focus-visible:ring-primary h-10"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            {/* Logo Upload */}
                            <div className="space-y-2">
                                <Label className="text-sm font-bold text-foreground">Shop Logo</Label>
                                <div className="flex items-center gap-4">
                                    <div className="relative group w-16 h-16 rounded-2xl overflow-hidden border border-border/40 bg-muted flex items-center justify-center shrink-0 shadow-inner">
                                        {logoPreview ? (
                                            <img
                                                src={logoPreview}
                                                alt="Logo preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <Store className="h-6 w-6 text-muted-foreground" />
                                        )}
                                        {logoPreview && (
                                            <button
                                                type="button"
                                                onClick={handleRemoveLogo}
                                                className="absolute -top-1 -right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 cursor-pointer"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <Label
                                            htmlFor="logo-upload-edit"
                                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-input hover:bg-muted cursor-pointer transition-colors"
                                        >
                                            <Upload className="h-3.5 w-3.5" />
                                            Upload Logo
                                        </Label>
                                        <input
                                            id="logo-upload-edit"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleLogoChange}
                                        />
                                        <p className="text-[10px] text-muted-foreground mt-1 font-medium">
                                            Image file only
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Banner Upload */}
                            <div className="relative border border-dashed border-border/60 rounded-2xl aspect-[16/9] w-full overflow-hidden">

                                {bannerPreview && (
                                    <img
                                        src={bannerPreview}
                                        alt="Banner preview"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                )}

                                <Label
                                    htmlFor="banner-upload-edit"
                                    className="absolute inset-0 cursor-pointer z-10"
                                >
                                    {!bannerPreview && (
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <Upload className="h-5 w-5 mb-1" />
                                            <span>Upload Banner</span>
                                        </div>
                                    )}
                                </Label>

                                {bannerPreview && (
                                    <button
                                        type="button"
                                        onClick={handleRemoveBanner}
                                        className="absolute top-2 right-2 z-20"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}

                                <input
                                    id="banner-upload-edit"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleBannerChange}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 border-t border-border/40 gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsEditOpen(false)}
                                className="rounded-xl font-bold h-11 px-5 border-border/50 cursor-pointer"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isUpdating}
                                className="rounded-xl font-bold h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-md shadow-primary/15 cursor-pointer"
                            >
                                {isUpdating ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE SHOP ALERTDIALOG */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="rounded-2xl max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-extrabold text-foreground">
                            Are you sure you want to delete your shop?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                            All your products will be hidden. This soft-deletes the shop, and the action is irreversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="rounded-xl font-bold border-border/50 cursor-pointer">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteShop}
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                        >
                            Delete Shop
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default VendorShop;
