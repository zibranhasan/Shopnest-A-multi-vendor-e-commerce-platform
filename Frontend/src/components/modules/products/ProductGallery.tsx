// src/components/modules/products/ProductGallery.tsx

import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
    images: string[];
    productName: string;
}

const FALLBACK_IMAGE = "https://placehold.co/800x800/f5f5f5/a3a3a3?text=No+Image";

const ProductGallery = ({ images, productName }: ProductGalleryProps) => {
    const imageList = images?.length > 0 ? images : [FALLBACK_IMAGE];
    const [selectedIndex, setSelectedIndex] = useState(0);

    const selectedImage = imageList[selectedIndex] || FALLBACK_IMAGE;

    const prev = () =>
        setSelectedIndex((i) => (i === 0 ? imageList.length - 1 : i - 1));

    const next = () =>
        setSelectedIndex((i) => (i === imageList.length - 1 ? 0 : i + 1));

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative group aspect-square overflow-hidden rounded-3xl bg-muted border border-border shadow-sm">
                <img
                    src={selectedImage}
                    alt={`${productName} — image ${selectedIndex + 1}`}
                    className="h-full w-full object-cover transition-transform duration-500 md:group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                />

                {/* Zoom hint — desktop only */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none hidden md:flex">
                    <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md border border-border">
                        <ZoomIn className="h-4 w-4 text-muted-foreground" />
                    </div>
                </div>

                {/* Navigation Arrows — only when multiple images */}
                {imageList.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            aria-label="Previous image"
                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background border border-border rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            onClick={next}
                            aria-label="Next image"
                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background border border-border rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </>
                )}

                {/* Dot Indicator */}
                {imageList.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {imageList.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setSelectedIndex(i)}
                                aria-label={`Go to image ${i + 1}`}
                                className={cn(
                                    "rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    i === selectedIndex
                                        ? "w-5 h-2 bg-primary"
                                        : "w-2 h-2 bg-background/60 hover:bg-background/90"
                                )}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {imageList.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
                    {imageList.map((img, i) => (
                        <button
                            key={i}
                            onClick={() => setSelectedIndex(i)}
                            aria-label={`Select image ${i + 1}`}
                            className={cn(
                                "shrink-0 relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                i === selectedIndex
                                    ? "border-primary shadow-md scale-[1.04]"
                                    : "border-border hover:border-primary/50 hover:scale-[1.02]"
                            )}
                        >
                            <img
                                src={img || FALLBACK_IMAGE}
                                alt={`${productName} thumbnail ${i + 1}`}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                                }}
                            />
                            {i === selectedIndex && (
                                <div className="absolute inset-0 bg-primary/10 rounded-xl" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
