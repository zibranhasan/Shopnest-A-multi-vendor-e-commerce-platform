// src/components/modules/cart/ClearCartDialog.tsx

import { Trash2, Loader2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ClearCartDialogProps {
    isLoading?: boolean;
    onConfirm: () => Promise<void>;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ClearCartDialog({
    isLoading = false,
    onConfirm,
    open,
    onOpenChange,
}: ClearCartDialogProps) {
    const handleConfirm = async () => {
        await onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="rounded-xl gap-2 border-destructive/30 hover:border-destructive text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all duration-200"
                    disabled={isLoading}
                >
                    <Trash2 className="h-4 w-4" />
                    Clear Cart
                </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md rounded-3xl border border-border/50 bg-background p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <DialogHeader className="space-y-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 shadow-inner shrink-0">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                        <DialogTitle className="text-xl font-extrabold tracking-tight text-foreground">
                            Clear Shopping Cart
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                            Are you sure you want to remove all items from your cart? This action cannot be undone.
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
                        className="rounded-xl font-bold bg-destructive hover:bg-destructive/90 transition-all duration-150 active:scale-95 shadow-lg shadow-destructive/20"
                        disabled={isLoading}
                        onClick={handleConfirm}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Clearing...
                            </>
                        ) : (
                            "Yes, Clear All"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
