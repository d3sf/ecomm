import axios from "axios";
import { CategoryType } from "./zodvalidation";
import { prisma } from "./prisma";

export async function getCategories(): Promise<CategoryType[]> {
  const response = await axios.get("api/categories");
  return response.data.categories;
}

export async function getData(categoryId: number) {
  console.log("getData called with categoryId:", categoryId);
  
  if (!categoryId || isNaN(categoryId)) {
    console.error("Invalid category ID:", categoryId);
    throw new Error("Invalid category ID");
  }

  // Fetch category
  console.log("Fetching category with ID:", categoryId);
  const category = await prisma.category.findUnique({
    where: { 
      id: categoryId 
    },
    include: {
      children: true,
    },
  });

  if (!category) {
    console.error("Category not found with ID:", categoryId);
    throw new Error("Category not found");
  }

  console.log("Category found:", category);

  // Fetch products for the category
  console.log("Fetching products for category ID:", categoryId);
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { defaultCategoryId: categoryId },
        { categories: { some: { categoryId: categoryId } } }
      ],
      published: true,
    },
    include: {
      categories: true,
    },
  });

  console.log("Products found:", products.length);

  // Transform the data to match expected types
  const transformedCategory = {
    ...category,
    image: category.image ? JSON.parse(JSON.stringify(category.image)) : undefined,
  };

  const transformedSubcategories = (category.children || []).map(child => ({
    ...child,
    image: child.image ? JSON.parse(JSON.stringify(child.image)) : undefined,
  }));

  const transformedProducts = products.map(product => ({
    ...product,
    images: product.images ? JSON.parse(JSON.stringify(product.images)) : [],
  }));

  return {
    category: transformedCategory,
    products: transformedProducts,
    subcategories: transformedSubcategories,
  };
}
