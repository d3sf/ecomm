import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: {
        isActive: true,
      },
      include: {
        category: {
          include: {
            products: {
              include: {
                product: true,
              },
              take: 12,
            },
          },
        },
      },
      orderBy: {
        sortOrder: 'asc',
      },
    });

    // Transform the data to match the expected format
    const transformedSections = sections.map(section => {
      if (!section.category) {
        return section;
      }

      return {
        ...section,
        category: {
          ...section.category,
          products: section.category.products
            .map(pc => pc.product)
            .filter(product => product?.published)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
        },
      };
    });

    return NextResponse.json(transformedSections);
  } catch (error) {
    console.error('Error fetching homepage sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch homepage sections' },
      { status: 500 }
    );
  }
} 