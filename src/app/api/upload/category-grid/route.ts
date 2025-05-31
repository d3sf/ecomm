import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminAuthOptions } from '../../admin-auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';
import axios from 'axios';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(adminAuthOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const categoryId = formData.get('categoryId') as string;

    if (!file || !categoryId) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudinaryUploadPreset || !cloudName) {
      return new NextResponse('Missing Cloudinary credentials', { status: 500 });
    }

    // Create upload form data
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    uploadFormData.append('upload_preset', cloudinaryUploadPreset);
    uploadFormData.append('folder', 'merugo/categorygrid');

    // Upload to Cloudinary
    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      uploadFormData
    );

    // Get the highest order number
    const highestOrder = await prisma.categoryGrid.findFirst({
      orderBy: {
        order: 'desc',
      },
      select: {
        order: true,
      },
    });

    const newOrder = (highestOrder?.order || 0) + 1;

    // Create category grid
    const categoryGrid = await prisma.categoryGrid.create({
      data: {
        categoryId: parseInt(categoryId),
        imageUrl: data.secure_url,
        order: newOrder,
      },
    });

    return NextResponse.json(categoryGrid);
  } catch (error) {
    console.error('Error uploading category grid image:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 