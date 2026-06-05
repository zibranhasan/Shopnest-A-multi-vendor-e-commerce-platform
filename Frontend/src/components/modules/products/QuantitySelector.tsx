// src/components/modules/products/QuantitySelector.tsx

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuantitySelectorProps {
    quantity: number;
    maxStock: number;
    onChange: (value: number) => void;
}

const QuantitySelector = ({ quantity, maxStock, onChange }: QuantitySelectorProps) => {
    const decrement = () => onChange(Math.max(1, quantity - 1));
    const increment = () => onChange(Math.min(maxStock, quantity + 1));

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-muted-foreground">Quantity</span>

            <div className="flex items-center rounded-2xl border border-border bg-muted/50 overflow-hidden">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none rounded-l-2xl hover:bg-muted disabled:opacity-40"
                    onClick={decrement}
                    disabled={quantity <= 1}
                    aria-label="Decrease quantity"
                >
                    <Minus className="h-4 w-4" />
                </Button>

                <div
                    className="h-10 w-14 flex items-center justify-center text-base font-bold select-none border-x border-border"
                    aria-label={`Quantity: ${quantity}`}
                    aria-live="polite"
                >
                    {quantity}
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-none rounded-r-2xl hover:bg-muted disabled:opacity-40"
                    onClick={increment}
                    disabled={quantity >= maxStock}
                    aria-label="Increase quantity"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            <span className="text-sm text-muted-foreground">
                {maxStock} available
            </span>
        </div>
    );
};

export default QuantitySelector;
