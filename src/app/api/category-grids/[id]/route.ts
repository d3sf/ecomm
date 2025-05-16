import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '../../admin-auth/[...nextauth]/route';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { order, isVisible } = body;

    const categoryGrid = await prisma.categoryGrid.update({
      where: {
        id,
      },
      data: {
        ...(order !== undefined && { order }),
        ...(isVisible !== undefined && { isVisible }),
      },
    });

    return NextResponse.json(categoryGrid);
  } catch (error) {
    console.error('Error updating category grid:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    await prisma.categoryGrid.delete({
      where: {
        id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting category grid:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 