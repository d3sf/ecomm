import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const { sortOrder } = data;

    const section = await prisma.homepageSection.update({
      where: { id: parseInt(id) },
      data: { sortOrder },
      include: {
        category: true,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating homepage section:', error);
    return NextResponse.json(
      { error: 'Failed to update homepage section' },
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

    await prisma.homepageSection.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Section deleted successfully' });
  } catch (error) {
    console.error('Error deleting homepage section:', error);
    return NextResponse.json(
      { error: 'Failed to delete homepage section' },
      { status: 500 }
    );
  }
} 