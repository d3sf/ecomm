import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch all products with their categories
    const products = await prisma.product.findMany({
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
    });

    // Convert products to CSV format
    const headers = [
      'ID',
      'Name',
      'Description',
      'Price',
      'Quantity',
      'Stock',
      'Published',
      'Slug',
      'Categories',
      'Default Category',
      'Default Category ID',
      'Tags',
      'Attributes',
      'Image URLs',
      'Default Image Public ID'
    ].join(',');

    const rows = products.map(product => {
      const categories = product.categories
        .map(c => c.category.name)
        .join('; ');
      
      const defaultCategory = product.defaultCategory?.name || '';
      const defaultCategoryId = product.defaultCategory?.id || '';
      
      const tags = (product.tags as string[] || []).join('; ');
      
      const attributes = product.attributes
        .map(attr => `${attr.name}:${attr.value}`)
        .join('; ');

      const imageUrls = (product.images as { url: string; publicId: string }[] || [])
        .map(img => img.url)
        .join('; ');

      return [
        product.id,
        `"${product.name.replace(/"/g, '""')}"`,
        `"${(product.description || '').replace(/"/g, '""')}"`,
        product.price,
        `"${product.quantity}"`,
        product.stock,
        product.published,
        `"${product.slug}"`,
        `"${categories}"`,
        `"${defaultCategory}"`,
        defaultCategoryId,
        `"${tags}"`,
        `"${attributes}"`,
        `"${imageUrls}"`,
        `"${product.defaultImagePublicId || ''}"`
      ].join(',');
    });

    const csv = [headers, ...rows].join('\n');

    // Set response headers for CSV download
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv');
    responseHeaders.set('Content-Disposition', 'attachment; filename="products.csv"');

    return new NextResponse(csv, {
      status: 200,
      headers: responseHeaders
    });
  } catch (error) {
    console.error("Error exporting products:", error);
    return NextResponse.json(
      { error: "Failed to export products" },
      { status: 500 }
    );
  }
} 

