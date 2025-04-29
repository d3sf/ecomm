import { prisma } from "@/lib/prisma";
import { ProductSchema } from "@/lib/zodvalidation";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

// ✅ GET all products
// ?page=1&limit=20 -> in api params 
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const search = searchParams.get("search") || "";
  const skip = (page - 1) * limit;

  try {
    // Build the where clause based on search term
    let where = {};
    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } }
        ]
      };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        skip: skip,
        take: limit,
        include: {
          categories: {
            select: {
              category: true
            }
          },
          defaultCategory: true,
          attributes: true
        },
        orderBy: {
          id: 'desc'
        }
      }),
      prisma.product.count({ where })
    ]);

    return NextResponse.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

// ✅ POST - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parsed = ProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      name,
      description,
      price,
      quantity,
      stock,
      categories,
      images,
      tags,
      published,
      slug,
      attributes,
      defaultCategoryId,
    } = parsed.data;

    const slugFromName = name.toLowerCase().replace(/\s+/g, "-");

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        quantity,
        stock,
        images: images || [],
        tags,
        published,
        slug: slug || slugFromName,
        defaultCategory: defaultCategoryId ? {
          connect: { id: defaultCategoryId }
        } : undefined,
        categories: {
          createMany: {
            data: categories?.map(cat => ({
              categoryId: cat.category.id
            })) || []
          }
        },
        attributes: {
          create: (attributes || []).map(attr => ({
            name: attr.name || '',
            value: attr.value || ''
          }))
        }
      },
      include: {
        defaultCategory: true,
        categories: {
          select: {
            category: true
          }
        },
        attributes: true
      }
    });

    console.log("Created product with defaultCategory:", product.defaultCategory);
    
    return NextResponse.json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}

// ✅ PUT - Update a product
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id: idStr } = await params;
    const id = parseInt(idStr);

    // Validate ID
    if (isNaN(id) || id <= 0) {
      return NextResponse.json(
        { error: 'Invalid product ID' },
        { status: 400 }
      );
    }

    const data = await request.json();
    console.log("Update data received:", data);
    
    const { categories, defaultCategoryId, ...productData } = data;

    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // First, update the product
    const updateData: Prisma.ProductUpdateInput = { ...productData };
    
    // Handle defaultCategoryId explicitly
    if (defaultCategoryId !== undefined) {
      if (defaultCategoryId === null) {
        // If null, disconnect default category
        updateData.defaultCategory = { disconnect: true };
      } else {
        // Otherwise connect to the specified category
        updateData.defaultCategory = { connect: { id: defaultCategoryId } };
      }
    }
    
    console.log("Product update data:", updateData);
    
    await prisma.product.update({
      where: { id },
      data: updateData
    });

    // Then, update the categories if provided
    if (categories && Array.isArray(categories)) {
      // First, remove all existing category associations
      await prisma.productCategory.deleteMany({
        where: { productId: id }
      });

      // Then, create new category associations
      await prisma.productCategory.createMany({
        data: categories.map((categoryId: number) => ({
          productId: id,
          categoryId
        }))
      });
    }

    // Fetch the updated product with categories
    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        categories: {
          select: {
            category: true
          }
        }
      }
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}
