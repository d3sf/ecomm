"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import { ProductType } from "@/lib/zodvalidation";
import Image from "next/image";
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProductDetails() {
  const params = useParams();
  const [product, setProduct] = useState<ProductType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = useCallback(async () => {
    try {
      const { id } = params;
      const productRes = await axios.get(`/api/products/${id}`);
      setProduct(productRes.data);
    } catch (err) {
      setError("Failed to load product");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (params.id) {
      fetchProduct();
    }
  }, [params.id, fetchProduct]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-[400px]">
      <LoadingSpinner size="lg" color="primary" />
    </div>
  );
  if (error) return <div className="text-red-500">{error}</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-[1440px] mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square relative overflow-hidden rounded-lg border">
            <Image
              src={product.images?.[0]?.url || "/placeholder.png"}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {product.images?.slice(1).map((image, index) => (
              <div key={index} className="aspect-square relative overflow-hidden rounded-lg border">
                <Image
                  src={image.url || "/placeholder.png"}
                  alt={`${product.name} ${index + 2}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold">₹{product.price}</p>
          <p className="text-gray-600">{product.description}</p>
          <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
          <p className="text-sm text-gray-500">Stock: {product.stock}</p>
          
          {/* Product Attributes */}
          {product.attributes && product.attributes.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Attributes</h2>
              <div className="grid grid-cols-2 gap-2">
                {product.attributes.map((attr, index) => (
                  <div key={index} className="border p-2 rounded">
                    <p className="font-medium">{attr.name}</p>
                    <p className="text-gray-600">{attr.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 