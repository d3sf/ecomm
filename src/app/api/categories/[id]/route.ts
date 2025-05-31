import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { CategorySchema } from "@/lib/zodvalidation";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id);
  
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        children: true,
        parent: true,
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id);
  
  try {
    const body = await req.json();
    const { name, slug, parentId, sortOrder, published } = body;

    // Validate with Zod
    const validationResult = CategorySchema.safeParse({
      name,
      slug,
      parentId,
      sortOrder,
      published,
    });

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    // Check if parent exists if parentId is provided
    if (parentId) {
      const parent = await prisma.category.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        return NextResponse.json(
          { error: "Parent category not found" },
          { status: 404 }
        );
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        slug,
        parentId,
        sortOrder,
        published,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id);
  
  try {
    const body = await req.json();
    const category = await prisma.category.update({
      where: { id: categoryId },
      data: {
        published: body.published,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating category status:", error);
    return new NextResponse("Error updating category", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id);
  
  try {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check if category has children
    const children = await prisma.category.findMany({
      where: { parentId: categoryId },
    });

    if (children.length > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with subcategories" },
        { status: 400 }
      );
    }

    // Delete the category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
