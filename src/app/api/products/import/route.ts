import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface ImportProductData {
  id?: number;
  name: string;
  description: string;
  price: number;
  quantity: string;
  stock: number;
  published: boolean;
  slug: string;
  categories: string[];
  defaultCategory: string;
  defaultCategoryId: number | null;
  tags: string[];
  attributes: Array<{ name: string; value: string }>;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',');
    const totalRows = rows.length - 1; // Subtract 1 for header row
    
    // Validate required headers
    const requiredHeaders = ['Name', 'Price', 'Quantity', 'Stock'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    const results = {
      total: totalRows,
      success: 0,
      failed: 0,
      errors: [] as string[],
      processedRows: 0
    };

    // Process each row
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue; // Skip empty rows

      results.processedRows = i; // Update processed rows count

      const row = rows[i].split(',').map(cell => {
        // Remove quotes and trim
        const value = cell.trim().replace(/^"|"$/g, '');
        // Handle escaped quotes
        return value.replace(/""/g, '"');
      });

      const productData: ImportProductData = {
        name: '',
        description: '',
        price: 0,
        quantity: '',
        stock: 0,
        published: true,
        slug: '',
        categories: [],
        defaultCategory: '',
        defaultCategoryId: null,
        tags: [],
        attributes: []
      };

      // Map CSV columns to product data
      headers.forEach((header, index) => {
        const value = row[index] || '';
        switch (header) {
          case 'ID':
            productData.id = value ? parseInt(value) : undefined;
            break;
          case 'Name':
            productData.name = value;
            break;
          case 'Description':
            productData.description = value;
            break;
          case 'Price':
            productData.price = parseFloat(value) || 0;
            break;
          case 'Quantity':
            productData.quantity = value;
            break;
          case 'Stock':
            productData.stock = parseInt(value) || 0;
            break;
          case 'Published':
            productData.published = value.toLowerCase() === 'true';
            break;
          case 'Slug':
            productData.slug = value;
            break;
          case 'Categories':
            productData.categories = value ? value.split(';').map(c => c.trim()) : [];
            break;
          case 'Default Category':
            productData.defaultCategory = value;
            break;
          case 'Default Category ID':
            productData.defaultCategoryId = value ? parseInt(value) : null;
            break;
          case 'Tags':
            productData.tags = value ? value.split(';').map(t => t.trim()) : [];
            break;
          case 'Attributes':
            productData.attributes = value ? value.split(';').map(attr => {
              const [name, value] = attr.split(':').map(s => s.trim());
              return { name: name || '', value: value || '' };
            }) : [];
            break;
        }
      });

      try {
        // Handle categories
        const categoryIds: number[] = [];
        if (productData.categories.length) {
          for (const categoryName of productData.categories) {
            let category = await prisma.category.findFirst({
              where: { name: categoryName }
            });

            if (!category) {
              category = await prisma.category.create({
                data: {
                  name: categoryName,
                  slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
                  published: true
                }
              });
            }
            categoryIds.push(category.id);
          }
        }

        // Handle default category
        let defaultCategoryId = productData.defaultCategoryId;
        
        // If we have a default category ID from CSV, verify it exists
        if (defaultCategoryId) {
          const categoryExists = await prisma.category.findUnique({
            where: { id: defaultCategoryId }
          });
          if (!categoryExists) {
            defaultCategoryId = null;
          }
        }
        
        // If no valid default category ID but we have a default category name
        if (!defaultCategoryId && productData.defaultCategory) {
          const defaultCategory = await prisma.category.findFirst({
            where: { name: productData.defaultCategory }
          });
          if (defaultCategory) {
            defaultCategoryId = defaultCategory.id;
          }
        }
        
        // If still no default category, use the first category as default
        if (!defaultCategoryId && categoryIds.length > 0) {
          defaultCategoryId = categoryIds[0];
        }

        // Create or update product
        const productDataToSave = {
          name: productData.name,
          description: productData.description,
          price: productData.price,
          quantity: productData.quantity,
          stock: productData.stock,
          published: productData.published,
          slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
          images: [],
          tags: productData.tags,
          defaultCategoryId: defaultCategoryId,
          categories: {
            create: categoryIds.map(categoryId => ({
              category: {
                connect: { id: categoryId }
              }
            }))
          },
          attributes: {
            create: productData.attributes.map(attr => ({
              name: attr.name,
              value: attr.value
            }))
          }
        };

        if (productData.id) {
          // Update existing product
          // First, delete existing relationships
          await prisma.productCategory.deleteMany({
            where: { productId: productData.id }
          });
          await prisma.productAttribute.deleteMany({
            where: { productId: productData.id }
          });

          // Then update the product with new relationships
          await prisma.product.update({
            where: { id: productData.id },
            data: productDataToSave
          });
        } else {
          // Create new product
          await prisma.product.create({
            data: productDataToSave
          });
        }

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: `Import completed. Success: ${results.success}, Failed: ${results.failed}`,
      totalRows: totalRows,
      processedRows: results.processedRows,
      success: results.success,
      failed: results.failed,
      errors: results.errors
    });
  } catch (error) {
    console.error('Error importing products:', error);
    return NextResponse.json(
      { error: 'Failed to import products' },
      { status: 500 }
    );
  }
} 