// src/components/modules/wishlist/RemoveWishlistDialog.tsx

import { HeartOff, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RemoveWishlistDialogProps {
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function RemoveWishlistDialog({
    isLoading = false,
    onConfirm,
    open,
    onOpenChange,
}: RemoveWishlistDialogProps) {
    const handleConfirm = async () => {
        try {
            await onConfirm();
        } finally {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-3xl border border-border/50 bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <DialogHeader className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 shadow-inner shrink-0">
                        <HeartOff className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                            Remove from Wishlist
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                            Are you sure you want to remove this item from your wishlist? You can always add it back later from the products list.
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className="flex sm:justify-end gap-2 pt-4">
                    <Button
                        variant="outline"
                        className="rounded-xl font-semibold border-border/80 text-muted-foreground hover:text-foreground"
                        disabled={isLoading}
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        className="rounded-xl font-bold bg-rose-600 hover:bg-rose-500 text-white transition-all duration-150 active:scale-95 shadow-lg shadow-rose-500/20"
                        disabled={isLoading}
                        onClick={handleConfirm}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Removing...
                            </>
                        ) : (
                            "Yes, Remove"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
