import { getData } from "@/lib/fetchcategories";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface PageProps {
  params: Promise<{
    slug: string;
    id: string;
  }>;
}

async function getCategoryBreadcrumb(categoryId: number) {
  const breadcrumb = [];
  let currentCategory = await prisma.category.findUnique({
    where: { id: categoryId }
  });

  while (currentCategory) {
    breadcrumb.unshift({
      id: currentCategory.id,
      name: currentCategory.name,
      slug: currentCategory.slug
    });

    if (currentCategory.parentId) {
      currentCategory = await prisma.category.findUnique({
        where: { id: currentCategory.parentId }
      });
    } else {
      currentCategory = null;
    }
  }

  return breadcrumb;
}

export default async function CategoryPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { id } = resolvedParams;
  const categoryId = Number(id);

  if (isNaN(categoryId)) {
    console.error("Invalid category ID:", id);
    return notFound();
  }
  try {
    console.log("Fetching data for category ID:", categoryId);
    const { category, products, subcategories } = await getData(categoryId);
    const breadcrumb = await getCategoryBreadcrumb(categoryId);
    console.log("Category data:", category);
    console.log("Products count:", products.length);

    return (
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 flex items-center text-sm text-gray-600">
          <Link href="/" className="hover:text-indigo-600">Home</Link>
          {breadcrumb.map((item, index) => (
            <span key={item.id} className="flex items-center">
              <span className="mx-2">/</span>
              {index === breadcrumb.length - 1 ? (
                <span className="text-gray-900 font-medium">{item.name}</span>
              ) : (
                <Link 
                  href={`/cn/${item.slug}/cid/${item.id}`}
                  className="hover:text-indigo-600"
                >
                  {item.name}
                </Link>
              )}
            </span>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Top Bar */}
          <div className="bg-white-600 text-black p-4">
            <h1 className="text-2xl font-bold">Buy {category.name} Online</h1>
          </div>
          
          <div className="flex">
            {/* Subcategories Sidebar */}
            <div className="sm:w-[80px] lg:w-48 flex-shrink-0 border-r border-gray-200">
              <div className="p-4">
                {/* <h2 className="text-lg font-semibold mb-4">Subcategories</h2> */}
                <div className="max-h-[600px] overflow-y-auto">
                  {subcategories.length > 0 ? (
                    <ul className="space-y-2">
                      {subcategories.map((subcategory) => (
                        <li key={subcategory.id}>
                          <Link
                            href={`/cn/${subcategory.slug}/cid/${subcategory.id}`}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            {subcategory.image && typeof subcategory.image === 'object' && 'url' in subcategory.image && (
                              <div className="w-8 h-8 relative flex-shrink-0">
                                <Image
                                  src={subcategory.image.url}
                                  alt={subcategory.name}
                                  fill
                                  className="object-cover rounded"
                                />
                              </div>
                            )}
                            <span className="text-sm text-gray-700">{subcategory.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No subcategories available</p>
                  )}
                </div>
              </div>
            </div>

            {/* Products Grid */}
            <div className="flex-1 p-4">
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-y-4 gap-x-4">
                {products.map((product) => (
                  <div key={product.id} className="w-full">
                    <ProductCard
                      id={product.id}
                      name={product.name}
                      price={product.price}
                      quantity={product.quantity}
                      images={product.images}
                    />
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <p className="text-center text-gray-500 mt-8">No products found in this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading category:", error);
    return notFound();
  }
} 