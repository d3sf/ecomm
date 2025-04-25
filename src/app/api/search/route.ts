import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

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
      },
      orderBy: {
        id: 'asc', // Ensure consistent ordering by ID
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Transform the images field to match the ProductCard interface
    const transformedProducts = products.map(product => {
      let imageData = product.images;
      // Ensure imageData is valid or use null
      if (!imageData || (typeof imageData === 'string' && imageData.trim() === '')) {
        imageData = null;
      }
      
      return {
        ...product,
        images: imageData ? [{ url: imageData }] : [],
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