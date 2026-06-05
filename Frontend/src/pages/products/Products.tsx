// src/pages/products/Products.tsx

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { useGetAllProductsQuery } from "@/redux/features/product/product.api";
import ProductCard from "@/components/modules/products/ProductCard";
import type { IProduct } from "@/types/product.type";

import {
    useGetAllCategoriesQuery,
} from "@/redux/features/category/category.api";

import { useDebounce } from "@/hooks/useDebounce";

const Products = () => {

    // =========================================
    // STATES
    // =========================================
    const [searchTerm, setSearchTerm] =
        useState("");

    const [priceRange, setPriceRange] =
        useState([0, 10000]);

    const [selectedCategories, setSelectedCategories] =
        useState<string[]>([]);

    // =========================================
    // DEBOUNCE
    // =========================================
    const debouncedSearch =
        useDebounce(searchTerm, 500);

    const debouncedPrice =
        useDebounce(priceRange, 400);

    // =========================================
    // QUERY PARAMS
    // =========================================
    const queryParams: Record<string, unknown> = {};

    // SEARCH
    if (debouncedSearch) {
        queryParams.searchTerm = debouncedSearch;
    }

    // PRICE
    const isDefaultPrice =
        debouncedPrice[0] === 0 &&
        debouncedPrice[1] === 10000;

    if (!isDefaultPrice) {
        queryParams.minPrice =
            debouncedPrice[0];

        queryParams.maxPrice =
            debouncedPrice[1];
    }

    // CATEGORY
    if (selectedCategories.length > 0) {
        queryParams.category =
            selectedCategories.join(",");
    }

    // =========================================
    // API
    // =========================================
    const {
        data,
        isLoading,
    } = useGetAllProductsQuery(queryParams);

    const {
        data: categoriesData,
    } = useGetAllCategoriesQuery(undefined);

    // =========================================
    // DATA
    // =========================================
    const products =
        data?.data || [];

    const categories =
        categoriesData?.data || [];

    // =========================================
    // CATEGORY TOGGLE
    // =========================================
    const handleCategoryChange = (
        id: string
    ) => {
        setSelectedCategories((prev) =>
            prev.includes(id)
                ? prev.filter(
                    (item) => item !== id
                )
                : [...prev, id]
        );
    };

    // =========================================
    // CLEAR FILTERS
    // =========================================
    const clearFilters = () => {
        setSearchTerm("");
        setPriceRange([0, 10000]);
        setSelectedCategories([]);
    };

    return (
        <div className="container mx-auto px-4 py-8">

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

                {/* ========================================= */}
                {/* SIDEBAR */}
                {/* ========================================= */}
                <aside className="space-y-5">

                    {/* FILTER HEADER */}
                    <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5" />

                            <h2 className="text-xl font-bold">
                                Filters
                            </h2>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                        >
                            Clear
                        </Button>
                    </div>

                    {/* ACTIVE FILTERS */}
                    <div className="flex flex-wrap gap-2">

                        {/* SEARCH BADGE */}
                        {searchTerm && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() =>
                                    setSearchTerm("")
                                }
                            >
                                Search: {searchTerm} ✕
                            </Badge>
                        )}

                        {/* PRICE BADGE */}
                        {!isDefaultPrice && (
                            <Badge
                                variant="secondary"
                                className="cursor-pointer"
                                onClick={() =>
                                    setPriceRange([0, 10000])
                                }
                            >
                                ৳{priceRange[0]} -
                                ৳{priceRange[1]} ✕
                            </Badge>
                        )}

                        {/* CATEGORY BADGES */}
                        {selectedCategories.map(
                            (categoryId) => {
                                const cat = categories.find((c: any) => c._id === categoryId);
                                return (
                                    <Badge
                                        key={categoryId}
                                        variant="secondary"
                                        className="cursor-pointer"
                                        onClick={() =>
                                            handleCategoryChange(
                                                categoryId
                                            )
                                        }
                                    >
                                        {cat?.name || "Category"} ✕
                                    </Badge>
                                );
                            }
                        )}
                    </div>

                    {/* SEARCH */}
                    <Card>
                        <CardContent className="p-5">

                            <div className="relative">

                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                                <Input
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                    className="rounded-xl pl-10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* PRICE RANGE */}
                    <Card className="rounded-3xl">

                        <CardContent className="space-y-6 p-6">

                            <div className="space-y-1">

                                <h3 className="text-2xl font-semibold">
                                    Price Range
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    ৳{priceRange[0]} -
                                    ৳{priceRange[1]}
                                </p>
                            </div>

                            <Slider
                                value={priceRange}
                                onValueChange={setPriceRange}
                                min={0}
                                max={10000}
                                step={100}
                            />

                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>৳0</span>
                                <span>৳10,000</span>
                            </div>

                        </CardContent>
                    </Card>

                    {/* CATEGORIES */}
                    <Card className="rounded-3xl">

                        <Accordion
                            type="single"
                            collapsible
                            defaultValue="category"
                        >
                            <AccordionItem
                                value="category"
                                className="border-none"
                            >
                                <AccordionTrigger className="px-6 py-5 text-xl font-semibold hover:no-underline">
                                    Categories
                                </AccordionTrigger>

                                <AccordionContent className="px-6 pb-6">

                                    <div className="space-y-4">

                                        {categories.length > 0 ? (
                                            categories.map(
                                                (category: any) => (
                                                    <div
                                                        key={
                                                            category._id
                                                        }
                                                        className="flex items-center gap-3"
                                                    >
                                                        <Checkbox
                                                            id={
                                                                category._id
                                                            }
                                                            checked={selectedCategories.includes(
                                                                category._id
                                                            )}
                                                            onCheckedChange={() =>
                                                                handleCategoryChange(
                                                                    category._id
                                                                )
                                                            }
                                                        />

                                                        <label
                                                            htmlFor={
                                                                category._id
                                                            }
                                                            className="cursor-pointer text-base font-medium"
                                                        >
                                                            {category.name}
                                                        </label>
                                                    </div>
                                                )
                                            )
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                No categories found
                                            </p>
                                        )}

                                    </div>

                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </Card>

                </aside>

                {/* ========================================= */}
                {/* PRODUCTS */}
                {/* ========================================= */}
                <section className="space-y-6 lg:col-span-3">

                    {/* HEADER */}
                    <div>

                        <h1 className="text-4xl font-bold">
                            Products
                        </h1>

                        <p className="mt-2 text-muted-foreground">
                            {products.length} products found
                        </p>
                    </div>

                    {/* LOADING */}
                    {isLoading && (
                        <div className="grid place-items-center py-20">

                            <p className="text-muted-foreground">
                                Loading products...
                            </p>
                        </div>
                    )}

                    {/* EMPTY */}
                    {!isLoading &&
                        products.length === 0 && (
                            <div className="grid place-items-center rounded-3xl border py-24">

                                <div className="space-y-3 text-center">

                                    <h2 className="text-3xl font-bold">
                                        No Products Found
                                    </h2>

                                    <p className="text-muted-foreground">
                                        Try changing your filters
                                    </p>
                                </div>
                            </div>
                        )}

                    {/* PRODUCTS GRID */}
                    {!isLoading &&
                        products.length > 0 && (

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

                                {products.map(
                                    (product: IProduct) => (
                                        <ProductCard
                                            key={product._id}
                                            product={product}
                                        />
                                    )
                                )}

                            </div>
                        )}
                </section>
            </div>
        </div>
    );
};

export default Products;