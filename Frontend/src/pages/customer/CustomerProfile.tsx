// src/pages/customer/CustomerProfile.tsx

import { useState, useEffect, useRef } from "react";
import { Camera, Mail, Phone, User as UserIcon, Calendar, ShieldCheck, UserCheck, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useUserInfoQuery } from "@/redux/features/auth/auth.api";
import { useUpdateProfileMutation } from "@/redux/features/user/user.api";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

const CustomerProfile = () => {
    // Auth Check
    const { data: userData, isLoading: isUserLoading } = useUserInfoQuery(undefined);
    const profile = userData?.data;

    // Mutation
    const [updateProfile, { isLoading: isUpdating }] = useUpdateProfileMutation();

    // Form state
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Synchronize form with profile data
    useEffect(() => {
        if (profile) {
            setName(profile.name || "");
            setPhone(profile.phone || "");
        }
    }, [profile]);

    // Handle avatar file preview & revocation
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("image/")) {
                toast.error("Please select an image file only");
                return;
            }
            setSelectedFile(file);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            const newUrl = URL.createObjectURL(file);
            setPreviewUrl(newUrl);
        }
    };

    // Clean up preview URL on unmount
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            toast.error("Full Name cannot be empty");
            return;
        }

        try {
            const fd = new FormData();
            fd.append("name", name.trim());
            if (phone.trim()) {
                fd.append("phone", phone.trim());
            }
            if (selectedFile) {
                fd.append("picture", selectedFile);
            }

            await updateProfile(fd).unwrap();
            toast.success("Profile updated successfully");
            setSelectedFile(null);
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl("");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || "Failed to update profile");
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return "";
        const options: Intl.DateTimeFormatOptions = { month: "long", day: "numeric", year: "numeric" };
        return new Date(dateString).toLocaleDateString("en-US", options);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case "ADMIN":
            case "SUPER_ADMIN":
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
            case "VENDOR":
                return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
            case "CUSTOMER":
            default:
                return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
        }
    };

    const getStatusBadgeColor = (isActive: string) => {
        switch (isActive) {
            case "ACTIVE":
            case "true":
                return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
            case "INACTIVE":
                return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
            default:
                return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
        }
    };

    // Skeletons
    if (isUserLoading) {
        return (
            <div className="space-y-6 animate-in fade-in duration-300">
                <Skeleton className="h-9 w-48 rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <Card className="rounded-3xl border border-border/40 bg-card/60 p-6 md:p-8">
                            <CardContent className="space-y-6 flex flex-col items-center">
                                <Skeleton className="h-28 w-28 rounded-full" />
                                <div className="w-full space-y-4">
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-10 w-full rounded-xl" />
                                    <Skeleton className="h-11 w-32 rounded-xl" />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="lg:col-span-4">
                        <Card className="rounded-3xl border border-border/40 bg-card/60 p-6">
                            <CardContent className="space-y-4">
                                <Skeleton className="h-6 w-1/2 rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                                <Skeleton className="h-12 w-full rounded-xl" />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    const avatarSrc = previewUrl || profile?.picture;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">My Profile</h1>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* SECTION 1 — Edit Profile */}
                <div className="lg:col-span-8">
                    <Card className="rounded-3xl border border-border bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md">
                        <CardContent className="p-6 md:p-8">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="text-center">
                                    {/* Avatar Area */}
                                    <div className="relative group w-28 h-28 mx-auto mb-4 cursor-pointer" onClick={handleAvatarClick}>
                                        <div className="w-full h-full rounded-full overflow-hidden border-2 border-primary/20 bg-muted flex items-center justify-center shadow-inner">
                                            {avatarSrc ? (
                                                <img
                                                    src={avatarSrc}
                                                    alt={name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-4xl font-extrabold text-muted-foreground uppercase">
                                                    {name ? name.charAt(0) : "U"}
                                                </span>
                                            )}
                                        </div>
                                        {/* Camera overlay on hover */}
                                        <div className="absolute inset-0 rounded-full bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <Camera className="h-7 w-7 text-white" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-semibold">Click to change picture</p>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>

                                <div className="space-y-4">
                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <Label htmlFor="fullName" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                                            Full Name
                                        </Label>
                                        <Input
                                            id="fullName"
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            Email Address
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={profile?.email || ""}
                                            disabled
                                            className="rounded-xl border border-input h-10 px-3 text-sm bg-muted/50 cursor-not-allowed opacity-80"
                                        />
                                        <p className="text-[11px] text-muted-foreground font-semibold pl-1">
                                            Email cannot be changed
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <Label htmlFor="phone" className="text-sm font-bold text-foreground flex items-center gap-1.5">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            Phone Number
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="Enter your phone number"
                                            className="rounded-xl border border-input h-10 px-3 text-sm focus-visible:ring-primary"
                                        />
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="rounded-xl font-bold h-11 px-6 bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-200 shadow-md shadow-primary/10"
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
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* SECTION 2 — Account Information */}
                <div className="lg:col-span-4">
                    <Card className="rounded-3xl border border-border bg-card/45 backdrop-blur-md shadow-sm transition-all duration-300 hover:shadow-md">
                        <CardContent className="p-6 space-y-6">
                            <h3 className="text-base font-extrabold text-foreground">Account Information</h3>
                            
                            <Separator className="bg-border/60" />

                            <div className="space-y-5">
                                {/* Role */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <UserCheck className="h-4 w-4" />
                                        Role
                                    </span>
                                    <Badge variant="outline" className={`rounded-full font-bold px-3 py-0.5 text-xs ${getRoleBadgeColor(profile?.role || "")}`}>
                                        {profile?.role || "CUSTOMER"}
                                    </Badge>
                                </div>

                                {/* Verification */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        Verification
                                    </span>
                                    {profile?.isVerified ? (
                                        <Badge variant="outline" className="rounded-full font-bold px-3 py-0.5 text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                                            Verified ✅
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="rounded-full font-bold px-3 py-0.5 text-xs bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                            Not Verified
                                        </Badge>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                                        <Activity className="h-4 w-4" />
                                        Status
                                    </span>
                                    <Badge variant="outline" className={`rounded-full font-bold px-3 py-0.5 text-xs ${getStatusBadgeColor(profile?.isActive?.toString() || "ACTIVE")}`}>
                                        {profile?.isActive?.toString().toUpperCase() || "ACTIVE"}
                                    </Badge>
                                </div>

                                <Separator className="bg-border/60" />

                                {/* Member Since */}
                                <div className="space-y-1.5">
                                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5" />
                                        Member Since
                                    </span>
                                    <p className="text-sm font-bold text-foreground">
                                        {formatDate(profile?.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CustomerProfile;
