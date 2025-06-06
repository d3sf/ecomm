import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      include: {
        category: true,
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage sections' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { type, categoryId, sortOrder } = data;

    // Validate required fields
    if (!type || !categoryId) {
      return NextResponse.json(
        { error: 'Type and categoryId are required' },
        { status: 400 }
      );
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    const section = await prisma.homepageSection.create({
      data: {
        name: category.name,
        type,
        categoryId,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(section, { status: 201 });
  } catch (error) {
    console.error('Error creating homepage section:', error);
    return NextResponse.json(
      { error: 'Failed to create homepage section' },
      { status: 500 }
    );
  }
} 