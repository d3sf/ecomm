import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { CategoryUpdateSchema } from '@/lib/zodvalidation';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    
    // Validate ID
    if (isNaN(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);
    
    // Validate ID
    if (isNaN(categoryId) || categoryId <= 0) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log('Category update data received:', data);

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    console.log("Existing category:", existingCategory);

    // For partial updates with just 'published' field
    if (Object.keys(data).length === 1 && 'published' in data) {
      console.log("Processing partial update (published only)");
      try {
        const category = await prisma.category.update({
          where: { id: categoryId },
          data: { published: data.published }
        });
        
        console.log('Updated category (published only):', category);
        
        return NextResponse.json(category);
      } catch (err) {
        console.error('Prisma error updating published status:', err);
        throw err;
      }
    }

    // For regular full updates, validate with schema
    console.log("Processing full update with validation");
    const validationResult = CategoryUpdateSchema.safeParse(data);
    if (!validationResult.success) {
      console.error('Validation failed:', validationResult.error.flatten());
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Check if parent category exists
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

    // Check if the new parentId would create a circular reference
    if (data.parentId) {
      const potentialParent = await prisma.category.findUnique({
        where: { id: data.parentId },
        include: { children: true }
      });

      if (potentialParent) {
        // Check if the category is trying to be its own parent
        if (potentialParent.id === categoryId) {
          return NextResponse.json(
            { error: 'A category cannot be its own parent' },
            { status: 400 }
          );
        }

        // Check if the category is trying to be a parent of its parent
        const isCircular = potentialParent.children?.some((child: { id: number }) => child.id === categoryId);
        if (isCircular) {
          return NextResponse.json(
            { error: 'Circular reference detected in category hierarchy' },
            { status: 400 }
          );
        }
      }
    }

    console.log('Image data before update:', data.image);
    
    try {
      const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
          name: data.name ?? existingCategory.name,
          slug: data.slug ?? existingCategory.slug,
          parentId: data.parentId ?? existingCategory.parentId,
          sortOrder: data.sortOrder ?? existingCategory.sortOrder,
          published: data.published ?? existingCategory.published,
          image: data.image ?? existingCategory.image
        }
      });
      
      console.log('Updated category:', category);
      
      return NextResponse.json(category);
    } catch (err: unknown) {
      console.error('Prisma error updating category:', err);
      if (err instanceof PrismaClientKnownRequestError) {
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
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const categoryId = parseInt(id);

    // Check if category has children
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { children: true }
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    if (category.children && category.children.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with children. Please delete or move the children first.' },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    );
  }
} 