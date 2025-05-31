import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '../../admin-auth/[...nextauth]/auth';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { grids } = body;

    if (!Array.isArray(grids)) {
      return new NextResponse('Invalid request body', { status: 400 });
    }

    // Update all grids in a transaction
    await prisma.$transaction(
      grids.map((grid) =>
        prisma.categoryGrid.update({
          where: { id: grid.id },
          data: { order: grid.order },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reordering category grids:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 