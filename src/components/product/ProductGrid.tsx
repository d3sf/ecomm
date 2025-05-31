import { ProductType } from "@/lib/zodvalidation";
import ProductCard from "./ProductCard";

export default function ProductGrid({ products }: { products: ProductType[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={{
            id: product.id || 0,
            name: product.name,
            price: product.price,
            quantity: product.quantity,
            images: product.images as { url: string; publicId?: string }[] || [],
            slug: product.slug
          }}
        />
      ))}
    </div>
  );
}
