import Image from "next/image";
import Link from "next/link";
import React from "react";

interface CategoryCardProps {
  name: string;
  imageUrl: string;
  slug: string;
  id: number;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, imageUrl, slug, id }) => {
  // Use the format /cn/{slug}/cid/{id} which matches the new route structure
  const url = `/cn/${slug}/cid/${id}`;

  return (
    <Link href={url}>
      <div className="flex flex-col items-center justify-center cursor-pointer hover:shadow-lg transition p-2">
        <div className="w-24 h-24 rounded-md overflow-hidden border border-gray-300">
          <Image
            src={imageUrl || "/placeholder.png"}
            alt={name}
            width={96}
            height={96}
            className="object-cover w-full h-full"
          />
        </div>
        <span className="mt-2 text-sm text-center font-medium text-gray-700">{name}</span>
      </div>
    </Link>
  );
};

export default CategoryCard;
