"use client";

import AddToCartButton from "@/components/cart/AddToCartButton";
import { ProductType } from "@/lib/zodvalidation";
import ProductImageGallery from "./ProductImageGallery";
import { useCart } from "@/contexts/CartContext";

interface ProductDetailsProps {
  product: ProductType;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  // Format product images for the gallery
  const formattedImages = product.images && product.images.length > 0
    ? product.images.map(img => {
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return { 
            url: img.url,
            publicId: img.publicId 
          };
        }
        return { url: '/placeholder.png' };
      })
    : [{ url: '/placeholder.png' }];
  
  // Get cart context
  const { addToCart } = useCart();
  
  const handleAddToCart = (id: string | number, quantity: number) => {
    addToCart(id, quantity);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Product Image Gallery */}
          <div className="md:w-1/2 p-4">
            <ProductImageGallery 
              images={formattedImages} 
              defaultImagePublicId={product.defaultImagePublicId}
            />
          </div>

          {/* Right side - Product Details */}
          <div className="md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            <div className="mb-6">
              <span className="text-2xl font-semibold text-gray-900">
                ₹{typeof product.price === 'string' ? parseFloat(product.price).toFixed(2) : product.price}
              </span>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Description</h2>
              <p className="text-gray-600">{product.description || 'No description available'}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Availability</h2>
              <p className="text-gray-600">
                {product.stock > 0 
                  ? `In Stock (${product.stock} available)` 
                  : 'Out of Stock'}
              </p>
            </div>

            <div className="mt-8">
              <AddToCartButton 
                productId={String(product.id)}
                onAddToCart={handleAddToCart}
                initialQuantity={0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 