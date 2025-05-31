import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetails from "@/components/product/ProductDetails";
import { ProductType } from "@/lib/zodvalidation";

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

export default async function ProductPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const productId = Number(id);

  if (isNaN(productId)) {
    console.error("Invalid product ID:", id);
    return notFound();
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        categories: {
          include: {
            category: true
          }
        },
        defaultCategory: true,
        attributes: true
      },
    });
    
    if (!product) {
      console.error("Product not found:", productId);
      return notFound();
    }

    // Transform the data to match ProductType
    const transformedProduct: ProductType = {
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      slug: product.slug,
      price: product.price,
      quantity: product.quantity,
      stock: product.stock,
      published: product.published,
      images: product.images ? JSON.parse(JSON.stringify(product.images)) : [],
      categories: product.categories.map(cat => ({
        category: {
          id: cat.category.id,
          name: cat.category.name,
          slug: cat.category.slug,
          published: cat.category.published,
          parentId: cat.category.parentId,
          sortOrder: cat.category.sortOrder,
          image: cat.category.image ? {
            url: typeof cat.category.image === 'object' && cat.category.image !== null && 'url' in cat.category.image 
              ? String(cat.category.image.url)
              : '',
            publicId: typeof cat.category.image === 'object' && cat.category.image !== null && 'publicId' in cat.category.image
              ? String(cat.category.image.publicId)
              : ''
          } : null
        }
      })),
      defaultCategory: product.defaultCategory ? {
        id: product.defaultCategory.id,
        name: product.defaultCategory.name,
        slug: product.defaultCategory.slug,
        published: product.defaultCategory.published
      } : undefined,
      attributes: product.attributes.map(attr => ({
        name: attr.name,
        value: attr.value
      })),
      tags: product.tags || [],
      defaultImagePublicId: product.defaultImagePublicId || undefined
    };

    return <ProductDetails product={transformedProduct} />;
  } catch (error) {
    console.error("Error loading product:", error);
    return notFound();
  }
}