// src/components/modules/products/ProductTabs.tsx

import { FileText, Settings2, Truck } from "lucide-react";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { IProduct } from "@/types/product.type";

interface ProductTabsProps {
    product: IProduct;
}

const ProductTabs = ({ product }: ProductTabsProps) => {
    const specs = [
        { label: "Category", value: product.category?.name ?? "—" },
        { label: "Stock", value: product.stock > 0 ? `${product.stock} units` : "Out of stock" },
        { label: "Status", value: product.status ?? "—" },
        { label: "Sold", value: product.sold !== undefined ? `${product.sold} units` : "—" },
        ...(product.variants?.length
            ? [{ label: "Variants", value: product.variants.length + " options" }]
            : []),
        ...(product.tags?.length
            ? [{ label: "Tags", value: product.tags.join(", ") }]
            : []),
        {
            label: "Listed",
            value: product.createdAt
                ? new Date(product.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                  })
                : "—",
        },
    ];

    return (
        <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
            <Tabs defaultValue="description">
                <div className="px-6 pt-6">
                    <TabsList className="w-full justify-start gap-1 bg-muted/60 p-1.5 rounded-2xl h-auto">
                        <TabsTrigger
                            value="description"
                            className="flex-1 gap-2 rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <FileText className="h-4 w-4" />
                            Description
                        </TabsTrigger>
                        <TabsTrigger
                            value="specifications"
                            className="flex-1 gap-2 rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <Settings2 className="h-4 w-4" />
                            Specifications
                        </TabsTrigger>
                        <TabsTrigger
                            value="shipping"
                            className="flex-1 gap-2 rounded-xl py-2.5 text-sm font-semibold data-[state=active]:bg-background data-[state=active]:shadow-sm"
                        >
                            <Truck className="h-4 w-4" />
                            Shipping
                        </TabsTrigger>
                    </TabsList>
                </div>

                {/* Description Tab */}
                <TabsContent value="description" className="p-6 pt-5">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground">
                            About this product
                        </h3>
                        <p className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
                            {product.description || "No description available for this product."}
                        </p>

                        {product.tags && product.tags.length > 0 && (
                            <>
                                <Separator />
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-foreground">Tags</p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border"
                                            >
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </TabsContent>

                {/* Specifications Tab */}
                <TabsContent value="specifications" className="p-6 pt-5">
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-foreground">
                            Product Specifications
                        </h3>
                        <div className="rounded-2xl border border-border overflow-hidden">
                            {specs.map((spec, index) => (
                                <div
                                    key={spec.label}
                                    className={`flex items-start gap-4 px-5 py-3.5 ${
                                        index % 2 === 0 ? "bg-muted/30" : "bg-background"
                                    } ${index !== 0 ? "border-t border-border" : ""}`}
                                >
                                    <span className="text-sm font-semibold text-muted-foreground w-32 shrink-0">
                                        {spec.label}
                                    </span>
                                    <span className="text-sm text-foreground font-medium">
                                        {spec.value}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Variants Table */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="space-y-3">
                                <h4 className="text-base font-bold text-foreground">
                                    Available Variants
                                </h4>
                                <div className="rounded-2xl border border-border overflow-hidden">
                                    <div className="grid grid-cols-4 bg-muted px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                        <span>Size</span>
                                        <span>Color</span>
                                        <span>Stock</span>
                                        <span>Price</span>
                                    </div>
                                    {product.variants.map((v, i) => (
                                        <div
                                            key={i}
                                            className="grid grid-cols-4 px-5 py-3 text-sm border-t border-border"
                                        >
                                            <span>{v.size ?? "—"}</span>
                                            <span>{v.color ?? "—"}</span>
                                            <span>{v.stock}</span>
                                            <span>{v.price ? `৳${v.price}` : "—"}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Shipping Tab */}
                <TabsContent value="shipping" className="p-6 pt-5">
                    <div className="space-y-5">
                        <h3 className="text-lg font-bold text-foreground">
                            Shipping & Returns
                        </h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                {
                                    emoji: "🚚",
                                    title: "Standard Delivery",
                                    desc: "Delivered within 3–7 business days across Bangladesh.",
                                },
                                {
                                    emoji: "⚡",
                                    title: "Express Delivery",
                                    desc: "Same-day delivery available in Dhaka for orders before 12 PM.",
                                },
                                {
                                    emoji: "🔄",
                                    title: "Easy Returns",
                                    desc: "7-day return policy. Items must be unused and in original packaging.",
                                },
                                {
                                    emoji: "🔒",
                                    title: "Secure Checkout",
                                    desc: "All payments are encrypted and processed securely via SSL.",
                                },
                            ].map(({ emoji, title, desc }) => (
                                <div
                                    key={title}
                                    className="flex gap-4 p-4 rounded-2xl bg-muted/40 border border-border"
                                >
                                    <span className="text-2xl shrink-0">{emoji}</span>
                                    <div>
                                        <p className="text-sm font-bold text-foreground mb-1">
                                            {title}
                                        </p>
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default ProductTabs;
