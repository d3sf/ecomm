import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetails from "@/components/product/ProductDetails";

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    console.error("Invalid product ID:", id);
    return notFound();
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: true,
        defaultCategory: true,
      },
    });
    
    if (!product) {
      return notFound();
    }

    // Transform the data to match expected types
    const transformedProduct = {
      ...product,
      images: product.images ? JSON.parse(JSON.stringify(product.images)) : [],
      categories: product.categories.map(cat => ({
        ...cat,
        image: cat.image ? JSON.parse(JSON.stringify(cat.image)) : undefined,
      })),
      defaultCategory: product.defaultCategory ? {
        ...product.defaultCategory,
        image: product.defaultCategory.image ? JSON.parse(JSON.stringify(product.defaultCategory.image)) : undefined,
      } : null,
    };

    return <ProductDetails product={transformedProduct} />;
  } catch (error) {
    console.error("Error loading product:", error);
    return notFound();
  }
}