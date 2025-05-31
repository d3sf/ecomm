import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from "../../admin-auth/[...nextauth]/auth";
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get the category grid to get the image URL
    const categoryGrid = await prisma.categoryGrid.findUnique({
      where: { id },
    });

    if (!categoryGrid) {
      return new NextResponse('Category grid not found', { status: 404 });
    }

    // Extract public ID from the image URL
    const imageUrl = categoryGrid.imageUrl;
    console.log('Image URL:', imageUrl);
    
    // Extract the full path from the URL
    const urlParts = imageUrl.split('/');
    const uploadIndex = urlParts.findIndex((part: string) => part === 'upload');
    if (uploadIndex === -1) {
      console.error('Invalid Cloudinary URL format');
      return new NextResponse('Invalid image URL format', { status: 400 });
    }

    // Get everything after 'upload' and before the file extension, excluding the version
    const pathParts = urlParts.slice(uploadIndex + 1);
    const publicId = pathParts.slice(1).join('/').split('.')[0]; // Skip the version number
    console.log('Extracted public ID:', publicId);

    // Delete from Cloudinary
    try {
      console.log('Attempting to delete from Cloudinary...');
      const result = await cloudinary.uploader.destroy(publicId);
      console.log('Cloudinary deletion result:', result);
      
      if (result.result !== 'ok') {
        console.error('Cloudinary deletion failed:', result);
      }
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await prisma.categoryGrid.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting category grid:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 