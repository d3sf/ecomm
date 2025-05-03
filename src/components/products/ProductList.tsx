"use client";

import { useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductType } from "@/lib/zodvalidation";
import AddToCartButton from "../cart/AddToCartButton";
import { useCart } from "@/contexts/CartContext";

interface ProductListProps {
  products: ProductType[];
}

export default function ProductList({ products }: ProductListProps) {
  const router = useRouter();
  const { addToCart } = useCart();

  const handleProductClick = useCallback((productId: string | number) => {
    router.push(`/products/${productId}`);
  }, [router]);

  const handleAddToCart = useCallback((productId: string | number, quantity: number) => {
    addToCart(productId, quantity);
  }, [addToCart]);

  return (
    <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      {products.map((product) => (
        <div
          key={product.id}
          className="group relative"
          onClick={() => product.id && handleProductClick(product.id)}
        >
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-w-7 xl:aspect-h-8">
            <Image
              src={product.images?.[0]?.url || "/placeholder.png"}
              alt={product.name}
              width={500}
              height={500}
              className="h-full w-full object-cover object-center group-hover:opacity-75"
            />
          </div>
          <div className="mt-4 flex justify-between">
            <div>
              <h3 className="text-sm text-gray-700">{product.name}</h3>
              <p className="mt-1 text-lg font-medium text-gray-900">
                ₹{typeof product.price === 'string'
                  ? parseFloat(product.price).toFixed(2)
                  : product.price}
              </p>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              {product.id && (
                <AddToCartButton
                  productId={product.id}
                  onAddToCart={handleAddToCart}
                />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 