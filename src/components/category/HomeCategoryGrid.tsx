import React from "react";
import CategoryCard from "./CategoryCard";
import type { CategoryType } from "@/lib/zodvalidation";

interface Props {
    categories: CategoryType[];
}

const HomeCategoryGrid: React.FC<Props> = ({ categories }) => {
    // Filter to show only parent categories (categories without parentId)
    const parentCategories = categories.filter(category => !category.parentId);
    const visibleCategories = parentCategories.slice(0, 20); // Show only first 20

    console.log("Parent categories:", visibleCategories.map(cat => ({ id: cat.id, name: cat.name })));

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {visibleCategories.map((category) => (
                <CategoryCard
                    key={category.id}
                    id={category.id ?? 0}
                    name={category.name}
                    slug={category.slug}
                    imageUrl={category.image?.url || "/placeholder.png"}
                />
            ))}
        </div>
    );
};

export default HomeCategoryGrid;
