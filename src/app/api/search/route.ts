import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface ImageObject {
  url?: string;
  publicId?: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 24; // 6 products per row * 4 rows

    if (!query) {
      return NextResponse.json({ products: [] });
    }

    const products = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        price: true,
        quantity: true,
        images: true,
        slug: true,
        defaultImagePublicId: true,
      },
      orderBy: {
        id: 'asc', // Ensure consistent ordering by ID
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform the products to match the expected format
    const transformedProducts = products.map(product => {
      // Parse the images JSON if it's a string
      let imageData = product.images;
      if (typeof imageData === 'string') {
        try {
          imageData = JSON.parse(imageData);
        } catch {
          imageData = null;
        }
      }

      // Ensure images is an array of objects with url property
      const images = Array.isArray(imageData) 
        ? imageData.map(img => {
            if (typeof img === 'string') {
              return { url: img };
            }
            if (typeof img === 'object' && img !== null) {
              const imageObj = img as ImageObject;
              return {
                url: imageObj.url || '',
                publicId: imageObj.publicId
              };
            }
            return { url: '' };
          })
        : [];

      return {
        ...product,
        images: images.filter(img => img.url && img.url.trim() !== ''),
      };
    });

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Failed to search products' },
      { status: 500 }
    );
  }
} 