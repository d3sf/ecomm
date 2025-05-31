'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface ProductImage {
  url: string;
  publicId?: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  defaultImagePublicId?: string;
}

export default function ProductImageGallery({ images, defaultImagePublicId }: ProductImageGalleryProps) {
  const findDefaultImageIndex = useCallback(() => {
    if (!defaultImagePublicId || !images?.length) return 0;
    return images.findIndex((img: ProductImage) => img.publicId === defaultImagePublicId) || 0;
  }, [defaultImagePublicId, images]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(findDefaultImageIndex());
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [windowWidth, setWindowWidth] = useState(0);
  const mainImageRef = useRef<HTMLDivElement>(null);
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Set initial width
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update selected image index when defaultImagePublicId changes
  useEffect(() => {
    setSelectedImageIndex(findDefaultImageIndex());
  }, [findDefaultImageIndex]);
  
  // If no images are provided, use a placeholder
  const displayImages = images.length > 0 
    ? images 
    : [{ url: '/placeholder.png' }];
  
  const selectedImage = displayImages[selectedImageIndex];
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainImageRef.current) return;
    
    const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };
  
  return (
    <div className="flex flex-col gap-4 items-center">
      {/* Main Image Container */}
      <div 
        ref={mainImageRef}
        className="relative w-full aspect-square max-w-md mx-auto rounded-lg overflow-hidden bg-white border border-gray-200"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        {/* Main Image */}
        <Image 
          src={selectedImage.url}
          alt="Product image"
          fill
          priority
          className="object-contain"
        />
        
        {/* Zoom indicator square */}
        {isZoomed && (
          <div 
            className="absolute border-2 border-blue-500 pointer-events-none z-10 bg-blue-500/10 w-64 h-64"
            style={{
              left: `calc(${zoomPosition.x}% - 8rem)`,
              top: `calc(${zoomPosition.y}% - 8rem)`,
            }}
          />
        )}
      </div>
      
      {/* Thumbnails Container - Simple horizontal list */}
      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto py-2 justify-center max-w-md mx-auto">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedImageIndex(index)}
              className={`relative w-16 h-16 flex-shrink-0 rounded border-2 overflow-hidden transition-all ${
                selectedImageIndex === index 
                  ? 'border-blue-500 opacity-100' 
                  : 'border-gray-200 opacity-80 hover:opacity-100'
              }${image.publicId === defaultImagePublicId ? ' ring-2 ring-green-400' : ''}`}
              aria-label={`View image ${index + 1}${image.publicId === defaultImagePublicId ? ' (Default)' : ''}`}
            >
              <Image 
                src={image.url}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
              {image.publicId === defaultImagePublicId && (
                <span className="absolute bottom-0 right-0 bg-green-500 text-white text-xs px-1 z-10">
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Large Zoom Preview - Floating more toward center-right */}
      {isZoomed && (
        <div 
          className="fixed z-50 top-1/2 -translate-y-1/2 right-[10%] bg-white border-2 border-gray-300 shadow-xl rounded-lg overflow-hidden"
          style={{
            width: windowWidth > 1280 ? '500px' : '400px',
            height: windowWidth > 1280 ? '500px' : '400px',
          }}
        >
          <div 
            className="w-full h-full bg-no-repeat" 
            style={{
              backgroundImage: `url(${selectedImage.url})`,
              backgroundSize: '300%',
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
            }}
          />
        </div>
      )}
    </div>
  );
} 