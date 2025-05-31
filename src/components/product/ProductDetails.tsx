"use client";

import AddToCartButton from "@/components/cart/AddToCartButton";
import { ProductType } from "@/lib/zodvalidation";
import ProductImageGallery from "./ProductImageGallery";
import { useCart } from "@/contexts/CartContext";
import { Share2, Heart } from "lucide-react";
import Link from "next/link";
import RelatedProducts from "./RelatedProducts";

interface ProductDetailsProps {
  product: ProductType;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  // Format product images for the gallery
  const formattedImages = product.images && product.images.length > 0
    ? product.images.map(img => {
        if (typeof img === 'object' && img !== null && 'url' in img) {
          return { 
            url: img.url || '/placeholder.png',
            publicId: img.publicId 
          };
        }
        return { url: '/placeholder.png' };
      })
    : [{ url: '/placeholder.png' }];
  
  // Get cart context
  const { addItem } = useCart();
  
  const handleAddToCart = (id: string | number, quantity: number) => {
    try {
      const item = {
        id: String(id),
        name: product.name,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        quantity: quantity,
        image: product.images?.[0]?.url || "/placeholder.png"
      };
      
      // Add item directly to Redux store
      addItem(item);
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  // Format price with commas
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Product Image Gallery */}
          <div className="md:w-1/2 p-6 bg-gray-50">
            <ProductImageGallery 
              images={formattedImages} 
              defaultImagePublicId={product.defaultImagePublicId}
            />
          </div>

          {/* Right side - Product Details */}
          <div className="md:w-1/2 p-8">
            {/* Breadcrumb */}
            <div className="text-sm text-gray-500 mb-6">
              <Link href="/" className="hover:text-blue-600">Home</Link>
              <span className="mx-2">/</span>
              {product.categories && product.categories.length > 0 && product.categories[0].category && (
                <>
                  <Link 
                    href={`/cn/${product.categories[0].category.slug}/cid/${product.categories[0].category.id}`}
                    className="hover:text-blue-600"
                  >
                    {product.categories[0].category.name}
                  </Link>
                  <span className="mx-2">/</span>
                </>
              )}
              <span className="text-gray-900">{product.name}</span>
            </div>

            <h1 className="text-3xl font-bold mb-2 text-gray-900">{product.name}</h1>
            
            {/* Quantity */}
            <div className="mb-4">
              <span className="text-lg text-gray-600">
                Quantity: {product.quantity}
              </span>
            </div>

            {/* Price and Add to Cart */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-semibold text-gray-900">
                  {formatPrice(product.price)}
                </span>
                <div className="flex items-center gap-4">
                  <AddToCartButton 
                    productId={String(product.id)}
                    onAddToCart={handleAddToCart}
                    initialQuantity={0}
                  />
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Heart className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-8">
              <span className={`inline-block px-4 py-2 rounded-lg text-sm font-medium ${
                product.stock > 0 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {product.stock > 0 
                  ? `In Stock (${product.stock} available)` 
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Product Information */}
            <div className="space-y-8">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3 text-gray-900">Description</h2>
                <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                  {product.description || 'No description available'}
                </p>
              </div>

              {/* Specifications */}
              {product.attributes && product.attributes.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">Specifications</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {product.attributes.map((attr, index) => (
                      <div key={index} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{attr.name}:</span>
                        <span className="text-gray-600">{attr.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3 text-gray-900">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.categories && product.categories.length > 0 && product.categories[0].category?.id && typeof product.id === 'number' && (
        <RelatedProducts 
          currentProductId={product.id} 
          categoryId={product.categories[0].category.id} 
        />
      )}
    </div>
  );
} 