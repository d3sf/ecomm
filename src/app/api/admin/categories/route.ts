import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { CategorySchema } from '@/lib/zodvalidation';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
      include: {
        children: true
      }
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Category create data received:', data);
    
    // Validate with Zod
    const validationResult = CategorySchema.safeParse(data);
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.flatten());
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!data.name || !data.slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug is already taken
    const existingCategory = await prisma.category.findUnique({
      where: { slug: data.slug }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this slug already exists' },
        { status: 400 }
      );
    }

    // Validate parentId if provided
    if (data.parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: data.parentId }
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: `Parent category with ID ${data.parentId} not found` },
          { status: 400 }
        );
      }
    }

    // Ensure sortOrder is a number
    const sortOrder = typeof data.sortOrder === 'string' 
      ? parseInt(data.sortOrder) || 0 
      : data.sortOrder || 0;
    
    console.log('Image data before creation:', data.image);
    
    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          slug: data.slug,
          parentId: data.parentId || null,
          sortOrder: sortOrder,
          published: data.published ?? true,
          image: data.image || Prisma.JsonNull
        }
      });
      
      console.log('Created category:', category);

      return NextResponse.json(category);
    } catch (err) {
      console.error('Prisma error creating category:', err);
      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Handle known Prisma errors
        if (err.code === 'P2002') {
          return NextResponse.json(
            { error: 'A category with this slug already exists' },
            { status: 400 }
          );
        }
      }
      throw err; // Re-throw for the outer catch
    }
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 