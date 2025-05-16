import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

interface CategoryRow {
  name: string;
  slug: string;
  parentName: string | null;
  sortOrder: number;
  published: boolean;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const rows = text.split('\n');
    const headers = rows[0].split(',').map(h => h.trim());
    
    console.log('CSV Headers:', headers);

    // Validate headers
    const requiredHeaders = ['Name', 'Slug', 'Parent Name'];
    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json(
        { error: `Missing required headers: ${missingHeaders.join(', ')}` },
        { status: 400 }
      );
    }

    const results = {
      total: 0,
      created: 0,
      updated: 0,
      errors: [] as string[]
    };

    // Parse all rows first
    const categories: CategoryRow[] = [];
    const slugSet = new Set<string>();
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      
      // Parse CSV row properly handling quoted values
      const values: string[] = [];
      let currentValue = '';
      let insideQuotes = false;
      
      for (const char of rows[i]) {
        if (char === '"') {
          insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim()); // Add the last value
      
      const rowData: Record<string, string> = {};
      headers.forEach((header, index) => {
        rowData[header.toLowerCase()] = values[index]?.replace(/^"|"$/g, '') || '';
      });

      console.log(`Row ${i} data:`, rowData);

      try {
        // Validate sort order
        const sortOrder = parseInt(rowData['sort order']);
        if (isNaN(sortOrder) || sortOrder < 0) {
          results.errors.push(`Row ${i + 1}: Invalid sort order "${rowData['sort order']}"`);
          continue;
        }

        // Check for duplicate slugs
        const slug = rowData.slug;
        if (slugSet.has(slug)) {
          results.errors.push(`Row ${i + 1}: Duplicate slug "${slug}"`);
          continue;
        }
        slugSet.add(slug);

        categories.push({
          name: rowData.name,
          slug: slug,
          parentName: rowData['parent name'] || null,
          sortOrder: sortOrder,
          published: rowData.published ? rowData.published.toLowerCase() === 'true' : true
        });
      } catch (error) {
        results.errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('Parsed categories:', categories);

    // Check for circular references
    const checkCircularReference = (category: CategoryRow, visited = new Set<string>()): boolean => {
      if (!category.parentName) return false;
      if (visited.has(category.name)) return true;
      
      visited.add(category.name);
      const parent = categories.find(c => c.name === category.parentName);
      if (!parent) return false;
      
      return checkCircularReference(parent, visited);
    };

    for (const category of categories) {
      if (checkCircularReference(category)) {
        results.errors.push(`Circular reference detected for category "${category.name}"`);
      }
    }

    // If there are validation errors, return early
    if (results.errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: results.errors },
        { status: 400 }
      );
    }

    // First pass: Create parent categories
    const parentMap = new Map<string, number>(); // Maps category name to its ID
    const parentCategories = categories.filter(cat => !cat.parentName);

    console.log('Parent categories:', parentCategories); // Debug log

    for (const category of parentCategories) {
      try {
        const existingCategory = await prisma.category.findFirst({
          where: { slug: category.slug }
        });

        if (existingCategory) {
          // Update existing category
          await prisma.category.update({
            where: { id: existingCategory.id },
            data: {
              name: category.name,
              slug: category.slug,
              sortOrder: category.sortOrder,
              published: category.published
            }
          });
          parentMap.set(category.name, existingCategory.id);
          results.updated++;
        } else {
          // Create new category
          const newCategory = await prisma.category.create({
            data: {
              name: category.name,
              slug: category.slug,
              sortOrder: category.sortOrder,
              published: category.published
            }
          });
          parentMap.set(category.name, newCategory.id);
          results.created++;
        }
        results.total++;
      } catch (error) {
        results.errors.push(`Error processing parent category "${category.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    console.log('Parent map after first pass:', Object.fromEntries(parentMap)); // Debug log

    // Second pass: Create subcategories
    const subCategories = categories.filter(cat => cat.parentName);
    
    console.log('Subcategories:', subCategories); // Debug log

    for (const category of subCategories) {
      try {
        const parentId = parentMap.get(category.parentName!);
        if (!parentId) {
          results.errors.push(`Parent category "${category.parentName}" not found for "${category.name}"`);
          continue;
        }

        const existingCategory = await prisma.category.findFirst({
          where: { slug: category.slug }
        });

        if (existingCategory) {
          // Update existing category
          await prisma.category.update({
            where: { id: existingCategory.id },
            data: {
              name: category.name,
              slug: category.slug,
              sortOrder: category.sortOrder,
              published: category.published,
              parent: {
                connect: { id: parentId }
              }
            }
          });
          results.updated++;
        } else {
          // Create new category
          await prisma.category.create({
            data: {
              name: category.name,
              slug: category.slug,
              sortOrder: category.sortOrder,
              published: category.published,
              parent: {
                connect: { id: parentId }
              }
            }
          });
          results.created++;
        }
        results.total++;
      } catch (error) {
        results.errors.push(`Error processing subcategory "${category.name}": ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      message: 'Import completed',
      results
    });
  } catch (error) {
    console.error('Error importing categories:', error);
    return NextResponse.json(
      { error: 'Failed to import categories' },
      { status: 500 }
    );
  }
} 