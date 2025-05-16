import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform the data for export
    const exportData = categories.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      parentName: category.parent?.name || '',
      sortOrder: category.sortOrder,
      published: category.published
    }));

    // Convert to CSV
    const csvHeaders = [
      'ID',
      'Name',
      'Slug',
      'Parent Name',
      'Sort Order',
      'Published'
    ];

    const csvRows = [
      csvHeaders.join(','),
      ...exportData.map(row => [
        row.id,
        `"${row.name.replace(/"/g, '""')}"`,
        `"${row.slug}"`,
        `"${row.parentName.replace(/"/g, '""')}"`,
        row.sortOrder,
        row.published
      ].join(','))
    ];

    const csv = csvRows.join('\n');

    // Set response headers for CSV download
    const responseHeaders = new Headers();
    responseHeaders.set('Content-Type', 'text/csv');
    responseHeaders.set('Content-Disposition', 'attachment; filename="categories-export.csv"');

    return new NextResponse(csv, {
      status: 200,
      headers: responseHeaders
    });
  } catch (error) {
    console.error('Error exporting categories:', error);
    return NextResponse.json(
      { error: 'Failed to export categories' },
      { status: 500 }
    );
  }
} 