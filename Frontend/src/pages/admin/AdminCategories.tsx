import { useState, useEffect } from "react";
import { Search, Plus, Pencil, Trash2, Tag, Image as ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
  useGetAllCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/redux/features/category/category.api";
import type { ICategory } from "@/types";
import { cn } from "@/lib/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

const FALLBACK_IMAGE = "https://placehold.co/400x250/f5f5f5/a3a3a3?text=No+Image";

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

const AdminCategories = () => {
  // Auth Check (using request standard)
  const { data: userData } = useUserInfoQuery(undefined);
  const isLoggedIn = !!userData?.data?.email;

  // RTK Query hooks
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Modal open states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ICategory | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({ name: "", description: "" });
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [editIsActive, setEditIsActive] = useState(true);

  // Image files & preview state
  const [addImageFile, setAddImageFile] = useState<File | null>(null);
  const [addImagePreview, setAddImagePreview] = useState<string>("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string>("");

  // Search Debouncing
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Fetch categories
  const {
    data: categoriesData,
    isLoading,
    isError,
  } = useGetAllCategoriesQuery(
    debouncedSearch ? { searchTerm: debouncedSearch } : undefined
  );

  // Image Preview URL cleanups to avoid memory leaks
  useEffect(() => {
    return () => {
      if (addImagePreview) {
        URL.revokeObjectURL(addImagePreview);
      }
    };
  }, [addImagePreview]);

  useEffect(() => {
    return () => {
      if (editImagePreview && editImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(editImagePreview);
      }
    };
  }, [editImagePreview]);

  // Form resets
  const resetAddForm = () => {
    setAddForm({ name: "", description: "" });
    setAddImageFile(null);
    if (addImagePreview) {
      URL.revokeObjectURL(addImagePreview);
    }
    setAddImagePreview("");
  };

  const resetEditForm = () => {
    setEditForm({ name: "", description: "" });
    setEditIsActive(true);
    setEditImageFile(null);
    if (editImagePreview && editImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(editImagePreview);
    }
    setEditImagePreview("");
    setSelectedCategory(null);
  };

  // Add Dialog handlers
  const handleAddOpenChange = (open: boolean) => {
    setIsAddOpen(open);
    if (!open) {
      resetAddForm();
    }
  };

  const handleAddImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (addImagePreview) {
        URL.revokeObjectURL(addImagePreview);
      }
      setAddImageFile(file);
      setAddImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (addForm.name.trim().length < 3) {
      toast.error("Category name must be at least 3 characters");
      return;
    }
    if (addForm.description.trim().length > 200) {
      toast.error("Description must not exceed 200 characters");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", addForm.name.trim());
      if (addForm.description.trim()) {
        fd.append("description", addForm.description.trim());
      }
      if (addImageFile) {
        fd.append("image", addImageFile);
      }

      await createCategory(fd).unwrap();
      toast.success("Category created successfully!");
      setIsAddOpen(false);
      resetAddForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category");
    }
  };

  // Edit Dialog handlers
  const handleEditOpenChange = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      resetEditForm();
    }
  };

  const handleEditImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (editImagePreview && editImagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(editImagePreview);
      }
      setEditImageFile(file);
      setEditImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    if (editForm.name.trim().length < 3) {
      toast.error("Category name must be at least 3 characters");
      return;
    }
    if (editForm.description.trim().length > 200) {
      toast.error("Description must not exceed 200 characters");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("name", editForm.name.trim());
      fd.append("description", editForm.description.trim());
      fd.append("isActive", editIsActive ? "true" : "false");
      if (editImageFile) {
        fd.append("image", editImageFile);
      }

      await updateCategory({ id: selectedCategory._id, data: fd }).unwrap();
      toast.success("Category updated successfully!");
      setIsEditOpen(false);
      resetEditForm();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update category");
    }
  };

  // Delete Dialog handlers
  const handleDeleteOpenChange = (open: boolean) => {
    setIsDeleteOpen(open);
    if (!open) {
      setSelectedCategory(null);
    }
  };

  const handleDeleteConfirm = async (e: React.MouseEvent) => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory._id).unwrap();
      toast.success("Category deleted");
      setIsDeleteOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      e.preventDefault(); // Keep alert open if it failed
      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  const categories = isLoggedIn ? (categoriesData?.data || []) : [];
  const hasCategories = categories.length > 0;

  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">Categories</h1>
          {!isLoading && (
            <Badge variant="secondary" className="rounded-full font-bold px-3 py-1 bg-primary/10 text-primary border-primary/25">
              {categories.length}
            </Badge>
          )}
        </div>
        <Button
          onClick={() => setIsAddOpen(true)}
          className="rounded-xl h-10 font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-primary/10 w-full sm:w-auto cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center max-w-md relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-xl h-10 border-input focus-visible:ring-primary w-full"
        />
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        /* Loading skeleton state */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Card key={idx} className="rounded-2xl border border-border/40 bg-card/60 p-0 overflow-hidden space-y-4 shadow-sm">
              <Skeleton className="aspect-video w-full" />
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-28 rounded-md" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-4 w-20 rounded-md" />
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-2/3 rounded-md" />
                <div className="flex gap-2 pt-2 justify-end">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : isError ? (
        /* Error state */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-4">
          <div className="text-destructive text-xl font-bold">Failed to load categories</div>
          <p className="text-muted-foreground text-sm">Please reload the page or try again later.</p>
        </div>
      ) : !hasCategories ? (
        /* Empty State */
        <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
          <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
            <Tag className="h-9 w-9 text-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-foreground">
              No categories found
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
              {searchTerm ? "No categories matched your search term. Try searching for something else." : "Add your first category to get started with the catalog."}
            </p>
          </div>
          {!searchTerm && (
            <Button
              onClick={() => setIsAddOpen(true)}
              className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
            >
              Add Your First Category
            </Button>
          )}
        </div>
      ) : (
        /* Categories Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category: ICategory) => (
            <Card
              key={category._id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:border-border/80 animate-in fade-in-5 duration-300"
            >
              {/* Image / Icon Section */}
              <div className="relative aspect-video w-full overflow-hidden bg-muted/30 flex items-center justify-center border-b border-border/30">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                  />
                ) : null}
                <div
                  className={cn(
                    "w-full h-full flex items-center justify-center text-4xl font-extrabold capitalize select-none",
                    getPlaceholderBg(category.name)
                  )}
                  style={{ display: category.image ? "none" : "flex" }}
                >
                  {category.name.charAt(0)}
                </div>

                {/* Active/Inactive Badge overlay */}
                <div className="absolute top-3 right-3">
                  {category.isActive ? (
                    <Badge variant="outline" className="rounded-full font-bold px-2.5 py-0.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-sm">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full font-bold px-2.5 py-0.5 text-xs bg-destructive/10 text-destructive border-destructive/20 shadow-sm">
                      Inactive
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content Section */}
              <CardContent className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-lg text-foreground tracking-tight leading-tight line-clamp-1">
                    {category.name}
                  </h3>
                  <p className="text-xs font-semibold text-muted-foreground/85">
                    /{category.slug}
                  </p>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                </div>

                {/* Actions Section */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/40 mt-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(category);
                      setEditForm({ name: category.name, description: category.description || "" });
                      setEditImagePreview(category.image || "");
                      setEditImageFile(null);
                      setEditIsActive(category.isActive);
                      setIsEditOpen(true);
                    }}
                    className="rounded-xl h-8 px-3 text-xs font-bold gap-1 border-border/80 hover:bg-muted cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedCategory(category);
                      setIsDeleteOpen(true);
                    }}
                    className="rounded-xl h-8 px-3 text-xs font-bold gap-1 border-destructive/30 hover:border-destructive text-muted-foreground hover:text-destructive hover:bg-destructive/5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ADD CATEGORY DIALOG */}
      <Dialog open={isAddOpen} onOpenChange={handleAddOpenChange}>
        <DialogContent className="overflow-y-auto max-h-[75vh] custom-scrollbar border border-border/40 bg-card/95 backdrop-blur-md max-w-md animate-in zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Add New Category</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create a new category for the e-commerce catalog.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddSubmit} className="space-y-4 pt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-foreground">Name *</Label>
              <Input
                id="name"
                placeholder="e.g. Electronics, Home Decor"
                value={addForm.name}
                onChange={(e) => setAddForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                minLength={3}
                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-bold text-foreground">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Brief description of products in this category..."
                value={addForm.description}
                onChange={(e) => setAddForm((prev) => ({ ...prev, description: e.target.value }))}
                maxLength={200}
                className="rounded-xl border border-input p-3 text-sm focus-visible:ring-primary min-h-[80px] resize-none w-full"
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Category Image (Optional)</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl transition-colors cursor-pointer relative bg-muted/10">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="add-image-input"
                />
                <div className="space-y-2 text-center pointer-events-none w-full">
                  {addImagePreview ? (
                    <div className="relative aspect-video max-h-36 mx-auto rounded-lg overflow-hidden border border-border/50">
                      <img
                        src={addImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/80" />
                      <div className="text-xs text-muted-foreground">
                        <span className="text-primary font-bold">Click to upload</span> or drag and drop
                      </div>
                      <p className="text-[10px] text-muted-foreground/70">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              {addImagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (addImagePreview) {
                      URL.revokeObjectURL(addImagePreview);
                    }
                    setAddImageFile(null);
                    setAddImagePreview("");
                  }}
                  className="mt-1 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/5 font-bold cursor-pointer"
                >
                  Remove selected image
                </Button>
              )}
            </div>

            <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsAddOpen(false)}
                className="rounded-xl font-bold flex-1 h-10 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
                className="rounded-xl font-bold flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer"
              >
                {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT CATEGORY DIALOG */}
      <Dialog open={isEditOpen} onOpenChange={handleEditOpenChange}>
        <DialogContent className="overflow-y-auto max-h-[75vh] custom-scrollbar rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md max-w-md animate-in zoom-in-95 duration-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Edit Category</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the selected category's details.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="space-y-4 pt-2">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-xs font-bold text-foreground">Name *</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                minLength={3}
                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary w-full"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-description" className="text-xs font-bold text-foreground">Description (Optional)</Label>
              <Textarea
                id="edit-description"
                value={editForm.description}
                onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                maxLength={200}
                className="rounded-xl border border-input p-3 text-sm focus-visible:ring-primary min-h-[80px] resize-none w-full"
              />
            </div>

            {/* Is Active Status Switch */}
            <div className="flex items-center space-x-2.5 py-1">
              <Checkbox
                id="edit-active"
                checked={editIsActive}
                onCheckedChange={(checked) => setEditIsActive(checked === true)}
                className="cursor-pointer"
              />
              <Label htmlFor="edit-active" className="text-xs font-semibold text-muted-foreground select-none cursor-pointer">
                Category is active and visible to customers
              </Label>
            </div>

            {/* Image Upload */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Category Image (Optional)</Label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-border/60 hover:border-primary/50 rounded-2xl transition-colors cursor-pointer relative bg-muted/10">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  id="edit-image-input"
                />
                <div className="space-y-2 text-center pointer-events-none w-full">
                  {editImagePreview ? (
                    <div className="relative aspect-video max-h-36 mx-auto rounded-lg overflow-hidden border border-border/50">
                      <img
                        src={editImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <>
                      <ImageIcon className="mx-auto h-8 w-8 text-muted-foreground/80" />
                      <div className="text-xs text-muted-foreground">
                        <span className="text-primary font-bold">Click to upload new image</span> or drag and drop
                      </div>
                      <p className="text-[10px] text-muted-foreground/70">PNG, JPG, GIF up to 5MB</p>
                    </>
                  )}
                </div>
              </div>
              {editImagePreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (editImagePreview && editImagePreview.startsWith("blob:")) {
                      URL.revokeObjectURL(editImagePreview);
                    }
                    setEditImageFile(null);
                    setEditImagePreview("");
                  }}
                  className="mt-1 h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/5 font-bold cursor-pointer"
                >
                  Remove image
                </Button>
              )}
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
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM DIALOG */}
      <AlertDialog open={isDeleteOpen} onOpenChange={handleDeleteOpenChange}>
        <AlertDialogContent className="max-w-md rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md p-6 shadow-xl">
          <AlertDialogHeader className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner shrink-0">
              <Trash2 className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                Delete Category
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm leading-relaxed">
                Are you sure you want to delete '{selectedCategory?.name}'? This action cannot be undone.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {selectedCategory && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/30 text-xs text-muted-foreground space-y-1 my-2">
              <span className="font-extrabold text-foreground text-xs uppercase tracking-wider block mb-1">
                Category details
              </span>
              <p className="font-semibold text-foreground/95">{selectedCategory.name}</p>
              <p className="line-clamp-1">/{selectedCategory.slug}</p>
              {selectedCategory.description && (
                <p className="line-clamp-2 italic">"{selectedCategory.description}"</p>
              )}
            </div>
          )}

          <AlertDialogFooter className="flex flex-row justify-end gap-3 pt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="rounded-xl font-semibold border-border/80 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="min-w-[120px] rounded-xl font-bold hover:bg-destructive/50 transition-all duration-150 active:scale-95 shadow-lg shadow-destructive/20 cursor-pointer"
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

export default AdminCategories;