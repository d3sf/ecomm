import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from "../admin-auth/[...nextauth]/auth";

export async function GET() {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const categoryGrids = await prisma.categoryGrid.findMany({
      orderBy: {
        order: 'asc',
      },
    });

    return NextResponse.json(categoryGrids);
  } catch (error) {
    console.error('Error fetching category grids:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { categoryId, imageUrl, order } = body;

    const categoryGrid = await prisma.categoryGrid.create({
      data: {
        categoryId,
        imageUrl,
        order,
      },
    });

    return NextResponse.json(categoryGrid);
  } catch (error) {
    console.error('Error creating category grid:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 