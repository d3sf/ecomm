import { getData } from "@/lib/fetchcategories";
import { notFound } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import Image from "next/image";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
    id: string;
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { id } = params;
  const categoryId = Number(id);

  if (isNaN(categoryId)) {
    console.error("Invalid category ID:", id);
    return notFound();
  }
  try {
    console.log("Fetching data for category ID:", categoryId);
    const { category, products, subcategories } = await getData(categoryId);
    console.log("Category data:", category);
    console.log("Products count:", products.length);

    return (
      <div className="max-w-[1440px] mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Top Bar */}
          <div className="bg-white-600 text-black p-4">
            <h1 className="text-2xl font-bold">Buy {category.name} Online</h1>
          </div>
          
          <div className="flex">
            {/* Subcategories Sidebar */}
            <div className="sm:w-[80px] lg:w-68 flex-shrink-0 border-r border-gray-200">
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
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
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