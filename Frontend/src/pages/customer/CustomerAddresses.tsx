// src/pages/customer/CustomerAddresses.tsx

import { useState, useEffect } from "react";
import { MapPin, Plus, Edit2, Trash2, Check, Loader2, Home, Briefcase, Building } from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import {
    useAddAddressMutation,
    useUpdateAddressMutation,
    useDeleteAddressMutation,
} from "@/redux/features/user/user.api";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { IAddress } from "@/types/user.type";

const CustomerAddresses = () => {
    // Auth Check
    const { data: userData, isLoading: isUserLoading } = useUserInfoQuery(undefined);
    const addresses: IAddress[] = userData?.data?.addresses || [];

    // Mutations
    const [addAddress, { isLoading: isAdding }] = useAddAddressMutation();
    const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
    const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();

    // Dialog state
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<IAddress | null>(null);

    // Form fields state
    const [label, setLabel] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [district, setDistrict] = useState("");
    const [postalCode, setPostalCode] = useState("");
    const [isDefault, setIsDefault] = useState(false);

    // Sync form inputs when editing or adding
    useEffect(() => {
        if (selectedAddress) {
            setLabel(selectedAddress.label || "");
            setStreet(selectedAddress.street || "");
            setCity(selectedAddress.city || "");
            setDistrict(selectedAddress.district || "");
            setPostalCode(selectedAddress.postalCode || "");
            setIsDefault(selectedAddress.isDefault || false);
        } else {
            setLabel("");
            setStreet("");
            setCity("");
            setDistrict("");
            setPostalCode("");
            setIsDefault(false);
        }
    }, [selectedAddress]);

    // Icon helper based on label
    const getLabelIcon = (labelString?: string) => {
        const l = labelString?.toLowerCase() || "";
        if (l.includes("home")) return <Home className="h-4 w-4 text-primary shrink-0" />;
        if (l.includes("office") || l.includes("work")) return <Briefcase className="h-4 w-4 text-primary shrink-0" />;
        return <Building className="h-4 w-4 text-primary shrink-0" />;
    };

    // Add address handler
    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!street.trim() || !city.trim() || !district.trim()) {
            toast.error("Please fill in all required fields (Street, City, District)");
            return;
        }

        try {
            await addAddress({
                label: label.trim() || undefined,
                street: street.trim(),
                city: city.trim(),
                district: district.trim(),
                postalCode: postalCode.trim() || undefined,
                isDefault,
            }).unwrap();

            toast.success("Address added successfully");
            setIsAddDialogOpen(false);
            resetForm();
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to add address");
        }
    };

    // Edit address handler
    const handleEditAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAddress) return;

        if (!street.trim() || !city.trim() || !district.trim()) {
            toast.error("Please fill in all required fields (Street, City, District)");
            return;
        }

        try {
            await updateAddress({
                addressId: selectedAddress._id,
                data: {
                    label: label.trim() || undefined,
                    street: street.trim(),
                    city: city.trim(),
                    district: district.trim(),
                    postalCode: postalCode.trim() || undefined,
                    isDefault,
                },
            }).unwrap();

            toast.success("Address updated successfully");
            setIsEditDialogOpen(false);
            setSelectedAddress(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update address");
        }
    };

    // Set Default address handler
    const handleSetDefault = async (address: IAddress) => {
        try {
            await updateAddress({
                addressId: address._id,
                data: { isDefault: true },
            }).unwrap();
            toast.success("Default address updated successfully");
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update default address");
        }
    };

    // Delete address handler
    const handleDeleteAddress = async () => {
        if (!selectedAddress) return;

        try {
            await deleteAddress(selectedAddress._id).unwrap();
            toast.success("Address deleted successfully");
            setIsDeleteDialogOpen(false);
            setSelectedAddress(null);
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to delete address");
        }
    };

    const resetForm = () => {
        setLabel("");
        setStreet("");
        setCity("");
        setDistrict("");
        setPostalCode("");
        setIsDefault(false);
        setSelectedAddress(null);
    };

    // Loading Skeletons
    if (isUserLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-44 rounded-xl" />
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </div>
                    <Skeleton className="h-10 w-36 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Array.from({ length: 2 }).map((_, idx) => (
                        <Card key={idx} className="rounded-3xl border border-border/40 bg-card/60 p-6 space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-3/4 animate-pulse" />
                                <Skeleton className="h-4 w-1/2 animate-pulse" />
                            </div>
                            <div className="flex gap-2 pt-2 justify-end">
                                <Skeleton className="h-8 w-24 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">My Addresses</h1>
                    <Badge variant="secondary" className="rounded-full font-bold px-3 py-1 bg-primary/10 text-primary border-primary/25">
                        {addresses.length}
                    </Badge>
                </div>
                <Button
                    onClick={() => {
                        resetForm();
                        setIsAddDialogOpen(true);
                    }}
                    className="rounded-xl h-10 font-bold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 flex items-center gap-1.5 shadow-md shadow-primary/10 w-full sm:w-auto"
                >
                    <Plus className="h-4 w-4" />
                    Add New Address
                </Button>
            </div>

            {/* Empty State */}
            {addresses.length === 0 ? (
                <div className="max-w-md mx-auto my-12 p-8 text-center border border-border/40 rounded-3xl bg-card/45 backdrop-blur-md shadow-sm space-y-6">
                    <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 border border-primary/20 text-primary mx-auto shadow-inner">
                        <MapPin className="h-9 w-9 text-primary" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-extrabold text-foreground">
                            No addresses saved yet
                        </h2>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
                            Add shipping and billing addresses for a quicker and smoother checkout experience.
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            resetForm();
                            setIsAddDialogOpen(true);
                        }}
                        className="rounded-xl h-11 w-full font-bold shadow-lg shadow-primary/25 bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                        Add Your First Address
                    </Button>
                </div>
            ) : (
                /* Address Cards Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <Card
                            key={address._id}
                            className={`group relative flex flex-col justify-between rounded-3xl border bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md ${
                                address.isDefault ? "border-primary/50 shadow-sm shadow-primary/5" : "border-border/40 hover:border-border/60"
                            }`}
                        >
                            <CardContent className="p-6 space-y-4">
                                {/* Top row badges */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {address.label && (
                                            <Badge variant="secondary" className="rounded-full font-bold px-3 py-0.5 text-xs bg-muted border border-border/40 flex items-center gap-1.5 capitalize text-foreground/80">
                                                {getLabelIcon(address.label)}
                                                {address.label}
                                            </Badge>
                                        )}
                                    </div>
                                    {address.isDefault && (
                                        <Badge variant="outline" className="rounded-full font-bold px-3 py-0.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                            Default
                                        </Badge>
                                    )}
                                </div>

                                {/* Address Details */}
                                <div className="space-y-1.5 pt-1">
                                    <p className="text-sm font-extrabold text-foreground leading-snug">
                                        {address.street}
                                    </p>
                                    <p className="text-xs font-semibold text-muted-foreground">
                                        {address.city}, {address.district}
                                    </p>
                                    {address.postalCode && (
                                        <p className="text-xs font-semibold text-muted-foreground/85">
                                            Postal Code: {address.postalCode}
                                        </p>
                                    )}
                                </div>

                                <Separator className="bg-border/60" />

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between pt-1">
                                    <div>
                                        {!address.isDefault ? (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSetDefault(address)}
                                                className="rounded-lg h-8 px-2.5 text-xs font-extrabold text-primary hover:text-primary hover:bg-primary/10 transition-colors"
                                            >
                                                Set as Default
                                            </Button>
                                        ) : (
                                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                                <Check className="h-3.5 w-3.5" />
                                                Primary shipping address
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        {/* Edit Button */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAddress(address);
                                                setIsEditDialogOpen(true);
                                            }}
                                            className="h-8 w-8 rounded-lg hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground border border-border/30 transition-all"
                                            aria-label="Edit address"
                                        >
                                            <Edit2 className="h-3.5 w-3.5" />
                                        </Button>

                                        {/* Delete Button */}
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedAddress(address);
                                                setIsDeleteDialogOpen(true);
                                            }}
                                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive border border-border/30 transition-all"
                                            aria-label="Delete address"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* ADD ADDRESS DIALOG */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Add New Address</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Save a new address to checkout faster next time.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddAddress} className="space-y-4 pt-2">
                        {/* Label */}
                        <div className="space-y-1.5">
                            <Label htmlFor="add-label" className="text-xs font-bold text-foreground">Label</Label>
                            <Input
                                id="add-label"
                                placeholder="e.g. Home, Office"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                            />
                        </div>

                        {/* Street */}
                        <div className="space-y-1.5">
                            <Label htmlFor="add-street" className="text-xs font-bold text-foreground">Street Address *</Label>
                            <Input
                                id="add-street"
                                placeholder="e.g. 12/A, Dhanmondi"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                required
                                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* City */}
                            <div className="space-y-1.5">
                                <Label htmlFor="add-city" className="text-xs font-bold text-foreground">City *</Label>
                                <Input
                                    id="add-city"
                                    placeholder="Dhaka"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                                />
                            </div>

                            {/* District */}
                            <div className="space-y-1.5">
                                <Label htmlFor="add-district" className="text-xs font-bold text-foreground">District *</Label>
                                <Input
                                    id="add-district"
                                    placeholder="Dhaka"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    required
                                    className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Postal Code */}
                        <div className="space-y-1.5">
                            <Label htmlFor="add-postalCode" className="text-xs font-bold text-foreground">Postal Code (Optional)</Label>
                            <Input
                                id="add-postalCode"
                                placeholder="e.g. 1209"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                            />
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="add-isDefault"
                                checked={isDefault}
                                onCheckedChange={(checked) => setIsDefault(checked === true)}
                            />
                            <Label htmlFor="add-isDefault" className="text-xs font-semibold text-muted-foreground select-none cursor-pointer">
                                Set as default shipping address
                            </Label>
                        </div>

                        <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsAddDialogOpen(false)}
                                className="rounded-xl font-bold flex-1 h-10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isAdding}
                                className="rounded-xl font-bold flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/95"
                            >
                                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Address"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* EDIT ADDRESS DIALOG */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Edit Address</DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Update details of your saved address.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleEditAddress} className="space-y-4 pt-2">
                        {/* Label */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-label" className="text-xs font-bold text-foreground">Label</Label>
                            <Input
                                id="edit-label"
                                placeholder="e.g. Home, Office"
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                            />
                        </div>

                        {/* Street */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-street" className="text-xs font-bold text-foreground">Street Address *</Label>
                            <Input
                                id="edit-street"
                                placeholder="e.g. 12/A, Dhanmondi"
                                value={street}
                                onChange={(e) => setStreet(e.target.value)}
                                required
                                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* City */}
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-city" className="text-xs font-bold text-foreground">City *</Label>
                                <Input
                                    id="edit-city"
                                    placeholder="Dhaka"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    required
                                    className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                                />
                            </div>

                            {/* District */}
                            <div className="space-y-1.5">
                                <Label htmlFor="edit-district" className="text-xs font-bold text-foreground">District *</Label>
                                <Input
                                    id="edit-district"
                                    placeholder="Dhaka"
                                    value={district}
                                    onChange={(e) => setDistrict(e.target.value)}
                                    required
                                    className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Postal Code */}
                        <div className="space-y-1.5">
                            <Label htmlFor="edit-postalCode" className="text-xs font-bold text-foreground">Postal Code (Optional)</Label>
                            <Input
                                id="edit-postalCode"
                                placeholder="e.g. 1209"
                                value={postalCode}
                                onChange={(e) => setPostalCode(e.target.value)}
                                className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                            />
                        </div>

                        {/* Set as Default */}
                        <div className="flex items-center space-x-2 pt-2">
                            <Checkbox
                                id="edit-isDefault"
                                checked={isDefault}
                                onCheckedChange={(checked) => setIsDefault(checked === true)}
                                disabled={selectedAddress?.isDefault}
                            />
                            <Label htmlFor="edit-isDefault" className="text-xs font-semibold text-muted-foreground select-none cursor-pointer">
                                Set as default shipping address
                            </Label>
                        </div>

                        <DialogFooter className="flex gap-2 sm:gap-0 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setIsEditDialogOpen(false)}
                                className="rounded-xl font-bold flex-1 h-10"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isUpdating}
                                className="rounded-xl font-bold flex-1 h-10 bg-primary text-primary-foreground hover:bg-primary/95"
                            >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DELETE CONFIRM DIALOG */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="rounded-3xl border border-border/40 bg-card/95 backdrop-blur-md max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Delete Address</DialogTitle>
                        <DialogDescription className="text-sm text-muted-foreground">
                            Are you sure you want to delete this address? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedAddress && (
                        <div className="p-3.5 rounded-2xl bg-muted/40 border border-border/30 text-xs text-muted-foreground space-y-1 my-2">
                            {selectedAddress.label && (
                                <span className="font-extrabold text-foreground text-xs uppercase tracking-wider block mb-1">
                                    {selectedAddress.label}
                                </span>
                            )}
                            <p className="font-semibold text-foreground/95">{selectedAddress.street}</p>
                            <p>{selectedAddress.city}, {selectedAddress.district}</p>
                        </div>
                    )}

                    <DialogFooter className="flex gap-2 sm:gap-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsDeleteDialogOpen(false)}
                            className="rounded-xl font-bold flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteAddress}
                            disabled={isDeleting}
                            className="rounded-xl font-bold flex-1"
                        >
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CustomerAddresses;
