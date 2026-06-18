import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Package,
    MoreHorizontal,
    Plus,
    Search,
    Edit,
    Trash2,
    Upload,
    X,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Sparkles,
    Eye,
    Loader2
} from "lucide-react";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useGetMyShopQuery } from "@/redux/features/shop/vendor.shop.api";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import {
    useGetMyProductsQuery,
    useCreateProductMutation,
    useUpdateProductMutation,
    useDeleteProductMutation,
} from "@/redux/features/product/vendor.product.api";
import type { IVendorProduct } from "@/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
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

const VendorProducts = () => {
    // 1. Auth check
    const { data: userData } = useUserInfoQuery(undefined);
    const isLoggedIn = !!userData?.data?.email;

    // 2. Shop Status Check
    const { data: shopData, isLoading: isShopLoading } = useGetMyShopQuery(undefined, {
        skip: !isLoggedIn,
    });
    const shop = shopData?.data;
    const hasActiveShop = shop && shop.status === "ACTIVE";

    // 3. State Management
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 10;

    // Dialog states
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IVendorProduct | null>(null);

    // Form States
    const [form, setForm] = useState({
        name: "",
        description: "",
        categoryId: "",
        price: "",
        discountPrice: "",
        stock: "",
        tags: [] as string[],
    });
    const [tagInput, setTagInput] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [currentImages, setCurrentImages] = useState<string[]>([]);

    // 4. Debounce Search Term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // reset to page 1 on search change
        }, 300);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // Cleanup object URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            imagePreviews.forEach(url => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [imagePreviews]);

    // 5. Query Products
    const {
        data: productsData,
        isLoading: isProductsLoading,
        isFetching: isProductsFetching,
    } = useGetMyProductsQuery(
        {
            searchTerm: debouncedSearch || undefined,
            status: statusFilter === "all" ? undefined : statusFilter.toUpperCase(),
            page,
            limit,
        },
        {
            skip: !hasActiveShop,
        }
    );

    const products: IVendorProduct[] = productsData?.data || [];
    const meta = productsData?.meta || { page: 1, limit: 10, total: 0, totalPage: 1 };

    // Query Categories for select dropdown
    const { data: categoriesData } = useGetAllCategoriesQuery(undefined);
    const categories = categoriesData?.data || [];

    // Mutations
    const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
    const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

    // Reset all form states
    const resetForm = () => {
        setForm({
            name: "",
            description: "",
            categoryId: "",
            price: "",
            discountPrice: "",
            stock: "",
            tags: [],
        });
        setTagInput("");
        imagePreviews.forEach(url => {
            if (url.startsWith("blob:")) {
                URL.revokeObjectURL(url);
            }
        });
        setImageFiles([]);
        setImagePreviews([]);
        setCurrentImages([]);
        setSelectedProduct(null);
    };

    // Open Edit Dialog and Pre-populate fields
    const handleOpenEdit = (product: IVendorProduct) => {
        setForm({
            name: product.name,
            description: product.description || "",
            categoryId: product.category?._id || "",
            price: String(product.price),
            discountPrice: String(product.discountPrice || ""),
            stock: String(product.stock),
            tags: product.tags || [],
        });
        setCurrentImages(product.images || []);
        setImageFiles([]);
        setImagePreviews([]);
        setSelectedProduct(product);
        setIsEditOpen(true);
    };

    // Open Delete Dialog with setTimeout to avoid Radix dialog focus conflicts
    const handleOpenDelete = (product: IVendorProduct) => {
        setSelectedProduct(product);
        setTimeout(() => {
            setIsDeleteOpen(true);
        }, 100);
    };

    // Tag Operations
    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = tagInput.trim().toLowerCase().replace(/,/g, "");
            if (!value) return;

            if (form.tags.includes(value)) {
                toast.error("Tag already exists");
                return;
            }

            if (form.tags.length >= 10) {
                toast.error("Maximum of 10 tags allowed");
                return;
            }

            setForm(prev => ({
                ...prev,
                tags: [...prev.tags, value],
            }));
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setForm(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tagToRemove),
        }));
    };

    // Image Upload Handling
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const invalidFiles = files.filter(f => !f.type.startsWith("image/"));
        if (invalidFiles.length > 0) {
            toast.error("Please select image files only");
            return;
        }

        if (imageFiles.length + files.length > 5) {
            toast.error("You can upload a maximum of 5 images");
            return;
        }

        setImageFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...newPreviews]);
    };

    const handleRemovePreview = (index: number) => {
        const url = imagePreviews[index];
        if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
        }
        setImageFiles(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // Fallback colored square with first letter
    const getFallbackColor = (name: string) => {
        const colors = [
            "bg-red-500/10 text-red-500 border-red-500/20",
            "bg-orange-500/10 text-orange-500 border-orange-500/20",
            "bg-amber-500/10 text-amber-500 border-amber-500/20",
            "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
            "bg-teal-500/10 text-teal-500 border-teal-500/20",
            "bg-blue-500/10 text-blue-500 border-blue-500/20",
            "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
            "bg-purple-500/10 text-purple-500 border-purple-500/20",
            "bg-pink-500/10 text-pink-500 border-pink-500/20",
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) {
            hash = name.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    };

    // Submissions
    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (form.name.trim().length < 3 || form.name.trim().length > 100) {
            toast.error("Product name must be between 3 and 100 characters");
            return;
        }
        if (form.description.trim().length < 10) {
            toast.error("Description must be at least 10 characters");
            return;
        }
        if (!form.categoryId) {
            toast.error("Please select a category");
            return;
        }

        const priceNum = Number(form.price);
        const stockNum = Number(form.stock);
        if (isNaN(priceNum) || priceNum < 0) {
            toast.error("Please enter a valid price");
            return;
        }
        if (isNaN(stockNum) || stockNum < 0) {
            toast.error("Please enter a valid stock amount");
            return;
        }

        if (form.discountPrice) {
            const discountNum = Number(form.discountPrice);
            if (isNaN(discountNum) || discountNum < 0) {
                toast.error("Please enter a valid discount price");
                return;
            }
            if (discountNum >= priceNum) {
                toast.error("Discount price must be less than regular price");
                return;
            }
        }

        if (imageFiles.length === 0) {
            toast.error("At least one product image is required");
            return;
        }

        // Build FormData
        try {
            const fd = new FormData();
            fd.append("name", form.name.trim());
            fd.append("description", form.description.trim());
            fd.append("category", form.categoryId);
            fd.append("price", String(form.price));
            if (form.discountPrice) {
                fd.append("discountPrice", String(form.discountPrice));
            }
            fd.append("stock", String(form.stock));
            form.tags.forEach(tag => fd.append("tags", tag));
            imageFiles.forEach(file => fd.append("images", file));

            await createProduct(fd).unwrap();
            toast.success("Product created!");
            setIsCreateOpen(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to create product");
        }
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;

        // Validations
        if (form.name.trim().length < 3 || form.name.trim().length > 100) {
            toast.error("Product name must be between 3 and 100 characters");
            return;
        }
        if (form.description.trim().length < 10) {
            toast.error("Description must be at least 10 characters");
            return;
        }
        if (!form.categoryId) {
            toast.error("Please select a category");
            return;
        }

        const priceNum = Number(form.price);
        const stockNum = Number(form.stock);
        if (isNaN(priceNum) || priceNum < 0) {
            toast.error("Please enter a valid price");
            return;
        }
        if (isNaN(stockNum) || stockNum < 0) {
            toast.error("Please enter a valid stock amount");
            return;
        }

        if (form.discountPrice) {
            const discountNum = Number(form.discountPrice);
            if (isNaN(discountNum) || discountNum < 0) {
                toast.error("Please enter a valid discount price");
                return;
            }
            if (discountNum >= priceNum) {
                toast.error("Discount price must be less than regular price");
                return;
            }
        }

        // Build FormData
        try {
            const fd = new FormData();
            fd.append("name", form.name.trim());
            fd.append("description", form.description.trim());
            fd.append("category", form.categoryId);
            fd.append("price", String(form.price));
            
            // Handle clearing discount price explicitly
            if (form.discountPrice) {
                fd.append("discountPrice", String(form.discountPrice));
            } else {
                fd.append("discountPrice", "");
            }
            
            fd.append("stock", String(form.stock));
            
            // Re-append tags. We clear and re-append them or append all
            form.tags.forEach(tag => fd.append("tags", tag));
            if (form.tags.length === 0) {
                fd.append("tags", ""); // If empty, tell backend
            }

            // If new images selected, they replace old ones
            if (imageFiles.length > 0) {
                imageFiles.forEach(file => fd.append("images", file));
            }

            await updateProduct({ id: selectedProduct._id, data: fd }).unwrap();
            toast.success("Product updated!");
            setIsEditOpen(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update product");
        }
    };

    const handleDeleteSubmit = async () => {
        if (!selectedProduct) return;
        try {
            await deleteProduct(selectedProduct._id).unwrap();
            toast.success("Product deleted successfully!");
            setIsDeleteOpen(false);
            setSelectedProduct(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete product");
        }
    };

    // Render loading skeletons
    const renderSkeletons = () => (
        <div className="space-y-6">
            {/* Filter Skeletons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <Skeleton className="h-10 w-full sm:w-72 rounded-xl" />
                <Skeleton className="h-10 w-full sm:w-48 rounded-xl" />
            </div>

            {/* Desktop Table Skeletons */}
            <div className="hidden md:block border border-border/40 rounded-2xl overflow-hidden bg-card/30">
                <div className="p-4 bg-muted/40 border-b border-border/40">
                    <div className="grid grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-5 rounded w-20" />
                        ))}
                    </div>
                </div>
                <div className="divide-y divide-border/30">
                    {Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="p-4 grid grid-cols-6 gap-4 items-center">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-xl" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-28 rounded" />
                                    <Skeleton className="h-3 w-20 rounded" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-16 rounded" />
                                <Skeleton className="h-3 w-10 rounded" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-12 rounded" />
                                <Skeleton className="h-3 w-16 rounded" />
                            </div>
                            <Skeleton className="h-6 w-16 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full justify-self-end" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Mobile Card Skeletons */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {Array.from({ length: 6 }).map((_, idx) => (
                    <Card key={idx} className="rounded-2xl border border-border/45 bg-card/45 p-5 space-y-4">
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-5 w-3/4 rounded" />
                                <Skeleton className="h-3.5 w-1/2 rounded" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/30">
                            <div>
                                <Skeleton className="h-3 w-12 rounded mb-1.5" />
                                <Skeleton className="h-5 w-20 rounded" />
                            </div>
                            <div>
                                <Skeleton className="h-3 w-12 rounded mb-1.5" />
                                <Skeleton className="h-5 w-16 rounded" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-3 border-t border-border/30">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );

    // 1. Loading State (Initial page load)
    if (isShopLoading) {
        return (
            <div className="p-6 space-y-6 animate-pulse">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-48 rounded-xl" />
                        <Skeleton className="h-4 w-60 rounded" />
                    </div>
                    <Skeleton className="h-11 w-32 rounded-xl" />
                </div>
                {renderSkeletons()}
            </div>
        );
    }

    // 2. Shop check failed
    if (!shop || shop.status !== "ACTIVE") {
        const shopStatus = shop?.status || "NONE";
        return (
            <div className="p-6 space-y-6 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                            My Products
                        </h1>
                        <p className="text-muted-foreground text-sm">
                            Manage your product listings
                        </p>
                    </div>
                </div>

                <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
                    <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-destructive/10 border border-destructive/20 text-destructive mx-auto shadow-inner">
                        <AlertTriangle className="h-9 w-9 text-destructive" />
                    </div>
                    <div className="space-y-2.5">
                        <h2 className="text-2xl font-extrabold text-foreground leading-tight">
                            Products Locked
                        </h2>
                        {shopStatus === "NONE" ? (
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                                You need an active shop to manage products. Create a shop first.
                            </p>
                        ) : (
                            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                                Your shop is currently <span className="font-bold uppercase text-destructive">{shopStatus}</span>. Products are unavailable until the shop is approved or reactivated.
                            </p>
                        )}
                    </div>
                    {shopStatus === "NONE" ? (
                        <Button
                            asChild
                            className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
                        >
                            <a href="/vendor/shop">Create Shop</a>
                        </Button>
                    ) : (
                        <Button
                            asChild
                            variant="outline"
                            className="rounded-xl h-11 w-full font-bold border-border/50 cursor-pointer"
                        >
                            <a href="/vendor/shop">View Shop Status</a>
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    // 3. Normal Dashboard View (Shop is Active)
    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                            My Products
                        </h1>
                        {productsData?.meta?.total !== undefined && (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/10 font-bold px-2.5 py-0.5 rounded-full text-xs">
                                {meta.total} {meta.total === 1 ? "Product" : "Products"}
                            </Badge>
                        )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Manage your product listings and inventory details.
                    </p>
                </div>

                <Button
                    onClick={() => {
                        resetForm();
                        setIsCreateOpen(true);
                    }}
                    className="rounded-xl h-11 font-bold shadow-lg shadow-primary/20 bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
                >
                    <Plus className="h-4.5 w-4.5" />
                    Add Product
                </Button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/30 p-4 border border-border/40 rounded-2xl">
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search your products..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="pl-10 rounded-xl focus-visible:ring-primary border-border/60 h-10 bg-background/50"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="rounded-xl focus:ring-primary border-border/60 h-10 bg-background/50 font-medium">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* List State */}
            {isProductsLoading ? (
                renderSkeletons()
            ) : products.length === 0 ? (
                <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
                    <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
                        <Package className="h-9 w-9 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-xl font-extrabold text-foreground">
                            No products yet
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                            Add your first product to start selling on Shopnest.
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateOpen(true)}
                        className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
                    >
                        Add Product
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop Table */}
                    <div className="hidden md:block border border-border/40 rounded-2xl overflow-hidden bg-card/35 backdrop-blur-md shadow-sm relative">
                        {isProductsFetching && (
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-10 animate-in fade-in">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        )}
                        <Table>
                            <TableHeader className="bg-muted/40 border-b border-border/40">
                                <TableRow>
                                    <TableHead className="font-bold text-foreground">Product</TableHead>
                                    <TableHead className="font-bold text-foreground">Category</TableHead>
                                    <TableHead className="font-bold text-foreground">Price</TableHead>
                                    <TableHead className="font-bold text-foreground">Stock</TableHead>
                                    <TableHead className="font-bold text-foreground">Status</TableHead>
                                    <TableHead className="w-[80px] font-bold text-foreground text-right"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody className="divide-y divide-border/30">
                                {products.map((product) => {
                                    const isDiscounted = product.discountPrice !== undefined && product.discountPrice > 0;
                                    const isOut = product.stock === 0 || product.status === "OUT_OF_STOCK";
                                    const isDraft = product.status === "DRAFT";

                                    return (
                                        <TableRow
                                            key={product._id}
                                            className={`hover:bg-muted/30 transition-colors border-b border-border/25 ${
                                                isDraft ? "border-l-4 border-l-amber-500" : isOut ? "border-l-4 border-l-destructive" : ""
                                            }`}
                                        >
                                            {/* Product Column */}
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-xl border border-border/40 overflow-hidden shrink-0 flex items-center justify-center bg-muted">
                                                        {product.images?.[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className={`h-full w-full font-extrabold text-lg flex items-center justify-center uppercase ${getFallbackColor(product.name)}`}>
                                                                {product.name.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="space-y-0.5 max-w-[280px]">
                                                        <h3 className="font-bold text-foreground leading-tight truncate">
                                                            {product.name}
                                                        </h3>
                                                        <p className="text-[11px] text-muted-foreground truncate">
                                                            {product.slug}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>

                                            {/* Category Column */}
                                            <TableCell>
                                                <Badge variant="outline" className="rounded-lg border-border/60 text-muted-foreground px-2 py-0.5 text-xs font-semibold">
                                                    {product.category?.name || "Uncategorized"}
                                                </Badge>
                                            </TableCell>

                                            {/* Price Column */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    {isDiscounted ? (
                                                        <div className="space-y-0.5">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="font-extrabold text-primary text-sm">
                                                                    ৳{product.discountPrice}
                                                                </span>
                                                                {product.discountPercent !== undefined && product.discountPercent > 0 && (
                                                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 px-1 py-0 rounded text-[9px] font-bold">
                                                                        -{product.discountPercent}% OFF
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <span className="text-[11px] text-muted-foreground line-through opacity-80">
                                                                ৳{product.price}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="font-bold text-foreground text-sm">
                                                            ৳{product.price}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>

                                            {/* Stock Column */}
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className={`font-extrabold text-sm ${product.stock === 0 ? "text-destructive" : "text-foreground"}`}>
                                                        {product.stock}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground">
                                                        Sold: {product.sold || 0}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Status Badge */}
                                            <TableCell>
                                                {product.status === "ACTIVE" && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                                        Active
                                                    </Badge>
                                                )}
                                                {product.status === "DRAFT" && (
                                                    <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                                        Draft
                                                    </Badge>
                                                )}
                                                {product.status === "OUT_OF_STOCK" && (
                                                    <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                                        Out of Stock
                                                    </Badge>
                                                )}
                                            </TableCell>

                                            {/* Actions Column */}
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted cursor-pointer">
                                                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="rounded-xl w-36">
                                                        <DropdownMenuItem onClick={() => handleOpenEdit(product)} className="font-semibold text-xs py-2 gap-2 cursor-pointer">
                                                            <Edit className="h-3.5 w-3.5" />
                                                            Edit
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => window.open(`/products/${product.slug}`, "_blank")} className="font-semibold text-xs py-2 gap-2 cursor-pointer">
                                                            <Eye className="h-3.5 w-3.5" />
                                                            View
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="border-border/30" />
                                                        <DropdownMenuItem onClick={() => handleOpenDelete(product)} className="font-semibold text-xs py-2 gap-2 text-destructive focus:text-destructive cursor-pointer">
                                                            <Trash2 className="h-3.5 w-3.5" />
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

                    {/* Mobile Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden relative">
                        {isProductsFetching && (
                            <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-2xl">
                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                            </div>
                        )}
                        {products.map((product) => {
                            const isDiscounted = product.discountPrice !== undefined && product.discountPrice > 0;
                            const isOut = product.stock === 0 || product.status === "OUT_OF_STOCK";
                            const isDraft = product.status === "DRAFT";

                            return (
                                <Card
                                    key={product._id}
                                    className={`rounded-2xl border border-border/45 bg-card/45 p-5 space-y-4 hover:border-border/60 transition-all ${
                                        isDraft ? "border-l-4 border-l-amber-500" : isOut ? "border-l-4 border-l-destructive" : ""
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3.5">
                                            {/* Image */}
                                            <div className="h-16 w-16 rounded-2xl border border-border/40 overflow-hidden shrink-0 flex items-center justify-center bg-muted">
                                                {product.images?.[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className={`h-full w-full font-extrabold text-xl flex items-center justify-center uppercase ${getFallbackColor(product.name)}`}>
                                                        {product.name.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            {/* Details */}
                                            <div className="space-y-1">
                                                <h3 className="font-extrabold text-foreground text-sm leading-snug line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-[10px] text-muted-foreground leading-none">
                                                    {product.slug}
                                                </p>
                                                <Badge variant="outline" className="rounded-md border-border/60 text-muted-foreground px-1.5 py-0.5 text-[9px] font-semibold mt-1">
                                                    {product.category?.name || "Uncategorized"}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Actions Button */}
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted cursor-pointer shrink-0">
                                                    <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl w-36">
                                                <DropdownMenuItem onClick={() => handleOpenEdit(product)} className="font-semibold text-xs py-2 gap-2 cursor-pointer">
                                                    <Edit className="h-3.5 w-3.5" />
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => window.open(`/products/${product.slug}`, "_blank")} className="font-semibold text-xs py-2 gap-2 cursor-pointer">
                                                    <Eye className="h-3.5 w-3.5" />
                                                    View
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="border-border/30" />
                                                <DropdownMenuItem onClick={() => handleOpenDelete(product)} className="font-semibold text-xs py-2 gap-2 text-destructive focus:text-destructive cursor-pointer">
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/30 text-xs">
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                Price
                                            </p>
                                            {isDiscounted ? (
                                                <div className="flex flex-wrap items-baseline gap-1.5">
                                                    <span className="font-extrabold text-primary text-sm">
                                                        ৳{product.discountPrice}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground line-through opacity-80">
                                                        ৳{product.price}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="font-bold text-foreground">
                                                    ৳{product.price}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                Inventory
                                            </p>
                                            <p className="font-bold text-foreground">
                                                <span className={product.stock === 0 ? "text-destructive" : ""}>
                                                    {product.stock}
                                                </span>
                                                <span className="text-[10px] text-muted-foreground font-normal ml-1">
                                                    (sold: {product.sold || 0})
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Bottom badges */}
                                    <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                        {product.status === "ACTIVE" && (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                                Active
                                            </Badge>
                                        )}
                                        {product.status === "DRAFT" && (
                                            <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                                Draft
                                            </Badge>
                                        )}
                                        {product.status === "OUT_OF_STOCK" && (
                                            <Badge className="bg-destructive/10 text-destructive border border-destructive/20 font-bold px-2.5 py-0.5 rounded-full text-[10px]">
                                                Out of Stock
                                            </Badge>
                                        )}

                                        {isDiscounted && product.discountPercent !== undefined && product.discountPercent > 0 && (
                                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/10 px-2 py-0.5 rounded-md text-[9px] font-bold">
                                                -{product.discountPercent}% OFF
                                            </Badge>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Pagination */}
                    {meta.totalPage > 1 && (
                        <div className="flex items-center justify-between border-t border-border/40 pt-4 px-2">
                            <span className="text-xs text-muted-foreground font-medium">
                                Showing page {meta.page} of {meta.totalPage}
                            </span>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                    disabled={page === 1}
                                    className="rounded-xl font-bold border-border/60 cursor-pointer h-9 px-3"
                                >
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(prev => Math.min(prev + 1, meta.totalPage))}
                                    disabled={page === meta.totalPage}
                                    className="rounded-xl font-bold border-border/60 cursor-pointer h-9 px-3"
                                >
                                    Next
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CREATE PRODUCT DIALOG */}
            <Dialog open={isCreateOpen} onOpenChange={(open) => {
                setIsCreateOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Add New Product
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Fill in all the required details to publish a new product listing.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleCreateSubmit} className="space-y-5 py-2">
                        {/* BASIC INFO SECTION */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30 pb-1">
                                Basic Information
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-bold text-foreground">
                                    Product Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="name"
                                    placeholder="Nike Air Max 2024"
                                    value={form.name}
                                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    minLength={3}
                                    maxLength={100}
                                    className="rounded-xl focus-visible:ring-primary border-border/60 h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-bold text-foreground">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Describe your product, its features, and details..."
                                    value={form.description}
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                    minLength={10}
                                    rows={4}
                                    className="rounded-xl focus-visible:ring-primary border-border/60 min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category" className="text-sm font-bold text-foreground">
                                    Category <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={form.categoryId}
                                    onValueChange={val => setForm(prev => ({ ...prev, categoryId: val }))}
                                >
                                    <SelectTrigger id="category" className="rounded-xl focus:ring-primary border-border/60 h-10">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {categories.map((category) => (
                                            <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* PRICING & INVENTORY */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price" className="text-sm font-bold text-foreground">
                                    Price (৳) <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">৳</span>
                                    <Input
                                        id="price"
                                        type="number"
                                        placeholder="5000"
                                        min="0"
                                        value={form.price}
                                        onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                                        required
                                        className="rounded-xl focus-visible:ring-primary border-border/60 h-10 pl-7"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discountPrice" className="text-sm font-bold text-foreground">
                                    Discount Price (৳)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">৳</span>
                                    <Input
                                        id="discountPrice"
                                        type="number"
                                        placeholder="4000"
                                        min="0"
                                        value={form.discountPrice}
                                        onChange={e => setForm(prev => ({ ...prev, discountPrice: e.target.value }))}
                                        className="rounded-xl focus-visible:ring-primary border-border/60 h-10 pl-7"
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground leading-none">
                                    Leave empty for no discount
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="stock" className="text-sm font-bold text-foreground">
                                    Stock <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="stock"
                                    type="number"
                                    placeholder="50"
                                    min="0"
                                    value={form.stock}
                                    onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                                    required
                                    className="rounded-xl focus-visible:ring-primary border-border/60 h-10"
                                />
                            </div>
                        </div>

                        {/* TAGS */}
                        <div className="space-y-2">
                            <Label htmlFor="tags" className="text-sm font-bold text-foreground">
                                Tags (Optional)
                            </Label>
                            <Input
                                id="tags"
                                placeholder="Type tag and press Enter or comma"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                className="rounded-xl focus-visible:ring-primary border-border/60 h-10"
                            />
                            <p className="text-[10px] text-muted-foreground leading-none">
                                Max 10 tags, comma or enter to separate.
                            </p>
                            {form.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {form.tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            className="rounded-lg font-semibold bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border/40 gap-1 pl-2.5 pr-1.5 py-1 text-xs"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-muted-foreground hover:text-foreground hover:bg-muted-foreground/15 rounded-md p-0.5 shrink-0 cursor-pointer"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* IMAGES */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-sm font-bold text-foreground">
                                Product Images <span className="text-destructive">*</span>
                            </Label>

                            {/* Dropzone */}
                            <div className="relative border border-dashed border-border/60 hover:border-primary/50 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center gap-2.5 p-6">
                                <Label
                                    htmlFor="images"
                                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4"
                                >
                                    <Upload className="h-6 w-6 text-muted-foreground mb-1 animate-bounce" />
                                    <span className="text-xs font-bold text-foreground">
                                        Click to upload or drag & drop
                                    </span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                        Accepts image files (Max 5, min 1)
                                    </span>
                                </Label>
                                <input
                                    id="images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <div className="h-12" /> {/* spacing to prevent label overlapping input */}
                            </div>

                            {/* Previews Grid */}
                            {imagePreviews.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
                                    {imagePreviews.map((url, index) => (
                                        <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border/40 group">
                                            <img
                                                src={url}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleRemovePreview(index)}
                                                className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-destructive transition-colors cursor-pointer"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
                                    "Create Product"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT PRODUCT DIALOG */}
            <Dialog open={isEditOpen} onOpenChange={(open) => {
                setIsEditOpen(open);
                if (!open) resetForm();
            }}>
                <DialogContent className="rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold text-foreground flex items-center gap-1.5">
                            <Edit className="h-5 w-5 text-primary" />
                            Edit Product
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm">
                            Modify product listing details and submit update.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditSubmit} className="space-y-5 py-2">
                        {/* BASIC INFO SECTION */}
                        <div className="space-y-4">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border/30 pb-1">
                                Basic Information
                            </h3>
                            <div className="space-y-2">
                                <Label htmlFor="edit-name" className="text-sm font-bold text-foreground">
                                    Product Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit-name"
                                    placeholder="Nike Air Max 2024"
                                    value={form.name}
                                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    required
                                    minLength={3}
                                    maxLength={100}
                                    className="rounded-xl focus-visible:ring-primary border-border/60 h-10"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-description" className="text-sm font-bold text-foreground">
                                    Description <span className="text-destructive">*</span>
                                </Label>
                                <Textarea
                                    id="edit-description"
                                    placeholder="Describe your product..."
                                    value={form.description}
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    required
                                    minLength={10}
                                    rows={4}
                                    className="rounded-xl focus-visible:ring-primary border-border/60 min-h-[100px]"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-category" className="text-sm font-bold text-foreground">
                                    Category <span className="text-destructive">*</span>
                                </Label>
                                <Select
                                    value={form.categoryId}
                                    onValueChange={val => setForm(prev => ({ ...prev, categoryId: val }))}
                                >
                                    <SelectTrigger id="edit-category" className="rounded-xl focus:ring-primary border-border/60 h-10">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {categories.map((category) => (
                                            <SelectItem key={category._id} value={category._id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* PRICING & INVENTORY */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-price" className="text-sm font-bold text-foreground">
                                    Price (৳) <span className="text-destructive">*</span>
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">৳</span>
                                    <Input
                                        id="edit-price"
                                        type="number"
                                        placeholder="5000"
                                        min="0"
                                        value={form.price}
                                        onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                                        required
                                        className="rounded-xl focus-visible:ring-primary border-border/60 h-10 pl-7"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-discountPrice" className="text-sm font-bold text-foreground">
                                    Discount Price (৳)
                                </Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-semibold">৳</span>
                                    <Input
                                        id="edit-discountPrice"
                                        type="number"
                                        placeholder="4000"
                                        min="0"
                                        value={form.discountPrice}
                                        onChange={e => setForm(prev => ({ ...prev, discountPrice: e.target.value }))}
                                        className="rounded-xl focus-visible:ring-primary border-border/60 h-10 pl-7"
                                    />
                                </div>
                                <span className="text-[10px] text-muted-foreground leading-none">
                                    Leave empty for no discount
                                </span>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="edit-stock" className="text-sm font-bold text-foreground">
                                    Stock <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="edit-stock"
                                    type="number"
                                    placeholder="50"
                                    min="0"
                                    value={form.stock}
                                    onChange={e => setForm(prev => ({ ...prev, stock: e.target.value }))}
                                    required
                                    className="rounded-xl focus-visible:ring-primary border-border/60 h-10"
                                />
                            </div>
                        </div>

                        {/* TAGS */}
                        <div className="space-y-2">
                            <Label htmlFor="edit-tags" className="text-sm font-bold text-foreground">
                                Tags (Optional)
                            </Label>
                            <Input
                                id="edit-tags"
                                placeholder="Type tag and press Enter or comma"
                                value={tagInput}
                                onChange={e => setTagInput(e.target.value)}
                                onKeyDown={handleTagKeyDown}
                                className="rounded-xl focus-visible:ring-primary border-border/60 h-10"
                            />
                            <p className="text-[10px] text-muted-foreground leading-none">
                                Max 10 tags, comma or enter to separate.
                            </p>
                            {form.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {form.tags.map(tag => (
                                        <Badge
                                            key={tag}
                                            className="rounded-lg font-semibold bg-secondary/80 text-secondary-foreground hover:bg-secondary border border-border/40 gap-1 pl-2.5 pr-1.5 py-1 text-xs"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="text-muted-foreground hover:text-foreground hover:bg-muted-foreground/15 rounded-md p-0.5 shrink-0 cursor-pointer"
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* IMAGES */}
                        <div className="space-y-3 pt-2">
                            <Label className="text-sm font-bold text-foreground">
                                Product Images
                            </Label>

                            {/* Warning Banner */}
                            {currentImages.length > 0 && (
                                <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-start gap-2">
                                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
                                    <span>
                                        Uploading new images will replace all existing images. If you do not choose any new images, the existing ones will remain unchanged.
                                    </span>
                                </div>
                            )}

                            {/* Dropzone */}
                            <div className="relative border border-dashed border-border/60 hover:border-primary/50 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors flex flex-col items-center justify-center gap-2.5 p-6">
                                <Label
                                    htmlFor="edit-images"
                                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer p-4"
                                >
                                    <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                                    <span className="text-xs font-bold text-foreground">
                                        Click to upload new images
                                    </span>
                                    <span className="text-[10px] text-muted-foreground mt-0.5">
                                        Replaces old images (Max 5, min 1)
                                    </span>
                                </Label>
                                <input
                                    id="edit-images"
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                                <div className="h-12" />
                            </div>

                            {/* Previews Grid: Shows imagePreviews if any new files uploaded, otherwise shows currentImages */}
                            {imagePreviews.length > 0 ? (
                                <div className="space-y-1.5">
                                    <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
                                        New Images Selected (Will overwrite old ones):
                                    </p>
                                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                        {imagePreviews.map((url, index) => (
                                            <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border/40">
                                                <img
                                                    src={url}
                                                    alt={`New Preview ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePreview(index)}
                                                    className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full hover:bg-destructive transition-colors cursor-pointer"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                currentImages.length > 0 && (
                                    <div className="space-y-1.5">
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                                            Current Active Images:
                                        </p>
                                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                                            {currentImages.map((url, index) => (
                                                <div key={url} className="relative aspect-square rounded-xl overflow-hidden border border-border/40 bg-muted/40">
                                                    <img
                                                        src={url}
                                                        alt={`Current ${index + 1}`}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            )}
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
                                        Updating...
                                    </>
                                ) : (
                                    "Save Changes"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE ALERT DIALOG */}
            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-bold text-foreground">
                            Delete Product
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                            Are you sure you want to delete <span className="font-bold text-foreground">'{selectedProduct?.name}'</span>? This listing will be archived, and customers won't be able to buy it. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel
                            onClick={() => {
                                setIsDeleteOpen(false);
                                setSelectedProduct(null);
                            }}
                            className="rounded-xl font-bold border-border/50 h-11 cursor-pointer"
                        >
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteSubmit}
                            disabled={isDeleting}
                            className="rounded-xl font-bold bg-destructive text-destructive-foreground hover:bg-destructive/95 shadow-md shadow-destructive/15 h-11 cursor-pointer"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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

export default VendorProducts;
