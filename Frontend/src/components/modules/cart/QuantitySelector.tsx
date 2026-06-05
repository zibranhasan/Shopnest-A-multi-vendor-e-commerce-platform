// src/components/modules/cart/QuantitySelector.tsx

import { Minus, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
    quantity: number;
    stock: number;
    isLoading?: boolean;
    onIncrement: () => void;
    onDecrement: () => void;
}

export default function QuantitySelector({
    quantity,
    stock,
    isLoading = false,
    onIncrement,
    onDecrement,
}: QuantitySelectorProps) {
    return (
        <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/30 w-fit">
            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-150 active:scale-95"
                disabled={quantity <= 1 || isLoading}
                onClick={onDecrement}
                aria-label="Decrease quantity"
            >
                <Minus className="h-3.5 w-3.5" />
            </Button>

            <div className="w-9 text-center text-sm font-bold text-foreground flex items-center justify-center min-h-8">
                {isLoading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                ) : (
                    quantity
                )}
            </div>

            <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-background/80 hover:text-foreground text-muted-foreground transition-all duration-150 active:scale-95"
                disabled={quantity >= stock || isLoading}
                onClick={onIncrement}
                aria-label="Increase quantity"
            >
                <Plus className="h-3.5 w-3.5" />
            </Button>
        </div>
    );
}
