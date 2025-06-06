"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import AddToCartButton from "@/components/cart/AddToCartButton";
import { useCart } from "@/contexts/CartContext";

interface ProductImage {
  url: string;
  publicId?: string;
}

interface Product {
  id: string | number;
  name: string;
  price: string | number;
  quantity: string | number;
  images?: ProductImage[] | { url: string; publicId?: string }[] | null;
  slug?: string;
  defaultImagePublicId?: string;
}

interface ProductCardProps {
  id?: string | number;
  name?: string;
  price?: string | number;
  quantity?: string | number;
  images?: ProductImage[] | { url: string; publicId?: string }[] | null;
  defaultImagePublicId?: string;
  product?: Product;
}

const ProductCard: React.FC<ProductCardProps> = (props) => {
  const { product, ...individualProps } = props;

  // Use either individual props or extract from product object
  const id = product?.id || individualProps.id;
  const name = product?.name || individualProps.name || '';
  const price = product?.price || individualProps.price || 0;
  const quantity = product?.quantity || individualProps.quantity || '';
  const images = product?.images || individualProps.images || null;
  const slug = product?.slug || id;
  const defaultImagePublicId = product?.defaultImagePublicId || individualProps.defaultImagePublicId;

  const { addItem, getItemQuantity } = useCart();
  // Add a safety check when calling getItemQuantity
  const currentQuantity = id && typeof getItemQuantity === 'function' ? getItemQuantity(id) : 0;

  // Default to placeholder image
  let imageUrl = "/placeholder.png";

  // Try to extract image URL from the product images
  try {
    if (images) {
      // Handle different possible formats of images
      if (Array.isArray(images) && images.length > 0) {
        // If there's a default image ID, try to find that image
        if (defaultImagePublicId && images.length > 1) {
          // Find the default image
          const defaultImage = images.find(img =>
            typeof img === 'object' &&
            img !== null &&
            'publicId' in img &&
            img.publicId === defaultImagePublicId
          );

          // Use the default image if found
          if (defaultImage && 'url' in defaultImage && defaultImage.url) {
            imageUrl = defaultImage.url;
          } else {
            // Fallback to first image if default not found
            const firstImage = images[0];
            if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
              const url = firstImage.url;
              if (url && typeof url === 'string' && url.trim() !== '') {
                imageUrl = url;
              }
            }
          }
        } else {
          // No default image specified, use the first image
          const firstImage = images[0];
          if (typeof firstImage === 'object' && firstImage !== null && 'url' in firstImage) {
            const url = firstImage.url;
            if (url && typeof url === 'string' && url.trim() !== '') {
              imageUrl = url;
            }
          }
        }
      } else if (typeof images === 'object' && images !== null) {
        const imageValues = Object.values(images);
        if (imageValues.length > 0 && typeof imageValues[0] === 'object' && imageValues[0] !== null && 'url' in imageValues[0]) {
          const url = imageValues[0].url;
          if (url && typeof url === 'string' && url.trim() !== '') {
            imageUrl = url;
          }
        }
      }
    }
  } catch (error) {
    console.error("Error processing product image:", error);
  }

  // Ensure imageUrl is not empty
  if (!imageUrl || imageUrl.trim() === '') {
    imageUrl = "/placeholder.png";
  }

  // Format price and quantity
  const formattedPrice = typeof price === 'string' ? parseFloat(price) : price;

  const handleAddToCart = (productId: string | number, quantity: number) => {
    try {
      if (typeof addItem === 'function') {
        const item = {
          id: String(productId),
          name: name,
          price: formattedPrice,
          quantity: quantity,
          image: imageUrl
        };
        
        // Add item directly to Redux store
        addItem(item);
      }
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  };

  if (!id) {
    return null; // Don't render if no id is available
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow w-48">
      {/* Image Section */}
      <div className="relative h-[140px] w-[140px] mx-auto mt-4">
        <Link href={`/prdn/${slug}/prid/${id}`}>
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-contain p-2"
            sizes="(max-width: 140px) 100vw, 140px"
          />
        </Link>
      </div>

      {/* Product Details Section */}
      <div className="p-4">
        <Link href={`/prdn/${slug}/prid/${id}`}>
          <h3 className="font-semibold text-sm mb-1 h-[3rem] line-clamp-2">{name}</h3>
          <p className="text-gray-600 text-sm mb-1">{quantity}</p>
        </Link>

        <div className="flex justify-between items-center mt-2">
          <p className="text-sm font-semibold">₹{formattedPrice}</p>
          <div className="cursor-pointer">
            <AddToCartButton
              productId={id}
              onAddToCart={handleAddToCart}
              initialQuantity={currentQuantity}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
  
export default ProductCard;
