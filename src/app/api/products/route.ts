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
          { slug: { contains: search, mode: 'insensitive' } },
          {
            categories: {
              some: {
                category: {
                  name: { contains: search, mode: 'insensitive' }
                }
              }
            }
          },
          {
            defaultCategory: {
              name: { contains: search, mode: 'insensitive' }
            }
          }
        ]
      };
    }

    // Use a single transaction for both queries
    const [products, totalCount] = await prisma.$transaction([
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
      { error: "Failed to fetch products", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    // Ensure connection is released
    await prisma.$disconnect();
  }
}

// ✅ POST - Create a new product
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received body in POST /api/products:", JSON.stringify(body, null, 2));
    console.log("Categories type:", typeof body.categories);
    console.log("Categories is array:", Array.isArray(body.categories));
    console.log("Categories value:", body.categories);
    
    // Transform categories if it's an array of numbers (categoryIds)
    if (Array.isArray(body.categories)) {
      // Check if it's not already in the correct format
      if (body.categories.length > 0 && typeof body.categories[0] === 'number') {
        console.log("Transforming categories from array of IDs to correct format");
        body.categories = body.categories.map((categoryId: number) => ({
          category: {
            id: categoryId
          }
        }));
      }
    }
    
    // Fix categories if null
    if (body.categories === null) {
      body.categories = [];
      console.log("Fixed null categories to empty array");
    }
    
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

    // console.log("Created product with defaultCategory:", product.defaultCategory);
    
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
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
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
