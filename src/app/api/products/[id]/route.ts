import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";
import { ProductSchema } from "@/lib/zodvalidation";
import { Prisma } from "@prisma/client";


// Setup Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// GET single product
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Try to parse as number first
    let parsedId: number | string = id;
    if (!isNaN(Number(id))) {
      parsedId = Number(id);
    }
    
    // Get the basic product data
    const product = await prisma.product.findUnique({
      where: {
        id: typeof parsedId === 'number' ? parsedId : undefined,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Format the response with the necessary fields for cart
    return NextResponse.json({
      id: product.id,
      name: product.name,
      price: product.price,
      images: Array.isArray(product.images) 
        ? product.images 
        : (typeof product.images === 'string' 
            ? JSON.parse(product.images) 
            : [{ url: '/placeholder.png' }])
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);
  
  try {
    const body = await req.json();
    console.log("Update product data:", body);

    // Extract categories from body
    const { categories, ...otherData } = body;
    
    // Remove timestamp fields from validation
    const { createdAt: _createdAt, updatedAt: _updatedAt, ...validatedData } = otherData;
    
    const _ = { _createdAt, _updatedAt };

    // Create a validation schema for updates
    const UpdateSchema = ProductSchema.pick({
      name: true,
      description: true,
      images: true,
      categoryId: true,
      price: true,
      quantity: true,
      slug: true,
      stock: true,
      tags: true,
      published: true,
      attributes: true,
      defaultCategoryId: true,
    }).partial();

    // Validate the request body
    const validationResult = UpdateSchema.safeParse(validatedData);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Extract validated fields
    const {
      name,
      description,
      images,
      categoryId,
      price,
      quantity,
      slug,
      stock,
      tags,
      published,
      attributes,
      defaultCategoryId,
    } = validationResult.data;

    // Prepare update data
    const prismaUpdateData: Prisma.ProductUpdateInput = {};
    if (name !== undefined) prismaUpdateData.name = name;
    if (description !== undefined) prismaUpdateData.description = description;
    if (images !== undefined) prismaUpdateData.images = images;
    if (categoryId !== undefined) prismaUpdateData.defaultCategory = { connect: { id: categoryId } };
    if (price !== undefined) prismaUpdateData.price = price;
    if (quantity !== undefined) prismaUpdateData.quantity = quantity;
    if (slug !== undefined) prismaUpdateData.slug = slug;
    if (stock !== undefined) prismaUpdateData.stock = stock;
    if (tags !== undefined) prismaUpdateData.tags = tags;
    if (published !== undefined) prismaUpdateData.published = published;

    // Explicitly handle defaultCategoryId
    if (defaultCategoryId !== undefined) {
      if (defaultCategoryId === null) {
        prismaUpdateData.defaultCategory = { disconnect: true };
      } else {
        prismaUpdateData.defaultCategory = { connect: { id: defaultCategoryId } };
      }
    }

    // First, update the product
    await prisma.product.update({
      where: { id: productId },
      data: prismaUpdateData,
    });

    // Handle attributes separately if provided
    if (attributes !== undefined) {
      // First, delete all existing attributes
      await prisma.productAttribute.deleteMany({
        where: { productId },
      });

      // Then create new ones
      if (attributes && attributes.length > 0) {
        await Promise.all(
          attributes.map((attr) =>
            prisma.productAttribute.create({
              data: {
                productId,
                name: attr.name || "",
                value: attr.value || "",
              },
            })
          )
        );
      }
    }

    // Handle categories separately
    if (categories && Array.isArray(categories)) {
      console.log("Updating categories:", categories);
      
      // First, delete all existing category associations
      await prisma.productCategory.deleteMany({
        where: { productId }
      });

      // Then create new category associations if any are provided
      if (categories.length > 0) {
        await prisma.productCategory.createMany({
          data: categories.map(cat => ({
            productId,
            categoryId: cat.category.id
          }))
        });
      }
    }

    // Fetch the updated product with all related data
    const finalProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        defaultCategory: true,
        categories: {
          include: {
            category: true
          }
        },
        attributes: true
      }
    });

    return NextResponse.json(finalProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// PATCH - Update product status
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);
  
  try {
    const body = await req.json();
    console.log("PATCH request body:", body);

    // Validate that productId is a valid number
    if (isNaN(productId) || productId <= 0) {
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Update the product with the provided data
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: body,
      include: {
        defaultCategory: true,
        categories: {
          include: {
            category: true
          }
        },
        attributes: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = Number(id);

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Delete Cloudinary images (based on stored publicId)
    const images = product.images as unknown as {
      url: string;
      publicId: string;
    }[];
    for (const img of images) {
      if (img.publicId) {
        try {
          await cloudinary.uploader.destroy(img.publicId);
        } catch (error) {
          console.error("Error deleting image from Cloudinary:", error);
          // Continue with product deletion even if image deletion fails
        }
      }
    }

    // Delete product from DB
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    console.error("DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to delete product", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
