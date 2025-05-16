import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categoryGrids = await prisma.categoryGrid.findMany({
      where: {
        isVisible: true,
      },
      orderBy: {
        order: 'asc',
      },
      include: {
        category: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
    });

    return NextResponse.json(categoryGrids);
  } catch (error) {
    console.error('Error fetching category grids:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 