import { notFound } from "next/navigation";
import { getProducts } from "@/lib/fetchproducts";
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
    const products = await getProducts();
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return notFound();
    }

    return <ProductDetails product={product} />;
  } catch (error) {
    console.error("Error loading product:", error);
    return notFound();
  }
}