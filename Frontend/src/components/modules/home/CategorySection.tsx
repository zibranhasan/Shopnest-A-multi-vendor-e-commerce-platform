import { Link } from "react-router";
import { useGetAllCategoriesQuery } from "@/redux/features/category/category.api";
import { Skeleton } from "@/components/ui/skeleton";
import type { ICategory } from "@/types";

// Helper to generate a background color based on name string
const getFallbackBgColor = (name: string) => {
    const colors = [
        "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
        "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
        "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
        "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20",
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
        "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
        "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
    ];
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
        sum += name.charCodeAt(i);
    }
    return colors[sum % colors.length];
};

const CategorySection = () => {
    const { data: categoriesData, isLoading } = useGetAllCategoriesQuery({ limit: 8 });
    const categories = categoriesData?.data || [];

    return (
        <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center md:text-left mb-10 space-y-2">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                        Shop by Category
                    </h2>
                    <p className="text-muted-foreground text-sm md:text-base font-medium">
                        Find exactly what you're looking for
                    </p>
                </div>

                {/* Loading Skeleton */}
                {isLoading ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 lg:grid-cols-8 custom-scrollbar">
                        {[...Array(8)].map((_, i) => (
                            <div
                                key={i}
                                className="flex-shrink-0 w-28 md:w-auto flex flex-col items-center gap-3 p-5 rounded-2xl border border-border"
                            >
                                <Skeleton className="h-16 w-16 rounded-2xl" />
                                <Skeleton className="h-4 w-16 rounded-md" />
                            </div>
                        ))}
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground text-sm">
                        No categories available yet.
                    </div>
                ) : (
                    /* Content Grid */
                    <div className="flex gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-4 lg:grid-cols-8 custom-scrollbar scroll-smooth">
                        {categories.map((category: ICategory) => {
                            const fallbackStyle = getFallbackBgColor(category.name);
                            return (
                                <Link
                                    key={category._id}
                                    to={`/products?category=${category._id}`}
                                    className="flex-shrink-0 w-28 md:w-auto flex flex-col items-center gap-3 p-5 rounded-2xl border border-border bg-card shadow-sm hover:border-primary hover:bg-primary/5 hover:scale-105 active:scale-[0.98] transition-all duration-300 group cursor-pointer"
                                >
                                    {category.image ? (
                                        <div className="h-16 w-16 rounded-2xl overflow-hidden bg-muted border border-border/55 flex items-center justify-center shrink-0">
                                            <img
                                                src={category.image}
                                                alt={category.name}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                                onError={(e) => {
                                                    // Hide image and fall back to text initials
                                                    (e.target as HTMLImageElement).style.display = "none";
                                                    const parent = (e.target as HTMLImageElement).parentElement;
                                                    if (parent) {
                                                        const fallbackDiv = document.createElement("div");
                                                        fallbackDiv.className = `w-full h-full flex items-center justify-center font-bold text-xl rounded-2xl ${fallbackStyle}`;
                                                        fallbackDiv.innerText = category.name[0].toUpperCase();
                                                        parent.appendChild(fallbackDiv);
                                                    }
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center font-bold text-xl shrink-0 ${fallbackStyle}`}>
                                            {category.name[0].toUpperCase()}
                                        </div>
                                    )}
                                    <span className="text-xs md:text-sm font-bold text-foreground text-center truncate w-full group-hover:text-primary transition-colors">
                                        {category.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
};

export default CategorySection;
