import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Set cache headers for the response
function setCacheHeaders(response: NextResponse) {
  // Cache for 5 minutes on the client side
  response.headers.set('Cache-Control', 'private, max-age=300');
  return response;
}

// Fetch products by their IDs (for cart and checkout)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productIds } = body;
    
    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: "Product IDs are required" },
        { status: 400 }
      );
    }

    // Convert string IDs to numbers
    const numericIds = productIds.map(id => {
      return typeof id === 'string' && !isNaN(Number(id)) ? Number(id) : id;
    });

    // Only look for numeric IDs in the database
    const validNumericIds = numericIds.filter(id => typeof id === 'number');

    if (validNumericIds.length === 0) {
      return NextResponse.json(
        { error: "No valid product IDs provided" },
        { status: 400 }
      );
    }

    // Only fetch the minimal fields needed for cart display
    // This makes the query more efficient
    const products = await prisma.product.findMany({
      where: {
        id: {
          in: validNumericIds
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        images: true,
        slug: true
      }
    });

    // Format the products for the cart
    const formattedProducts = products.map(product => {
      // Parse the images field (assuming it's stored as JSON string)
      let images = [];
      try {
        if (product.images) {
          if (typeof product.images === 'string') {
            images = JSON.parse(product.images);
          } else if (Array.isArray(product.images)) {
            images = product.images;
          } else {
            images = [product.images];
          }
        }
      } catch (error) {
        console.error('Error parsing product images:', error);
        images = [];
      }

      // Ensure we have at least an empty image placeholder
      if (images.length === 0) {
        images = [{ url: '/placeholder.png' }];
      }

      // Format the response
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        images: images,
        slug: product.slug,
      };
    });

    // Create the response with the products
    const response = NextResponse.json({ products: formattedProducts });
    
    // Add cache headers
    return setCacheHeaders(response);
  } catch (error) {
    console.error("Error fetching cart products:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart products" },
      { status: 500 }
    );
  }
} 