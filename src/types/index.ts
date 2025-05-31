export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string | null;
  published: boolean;
  sortOrder: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

export interface PageProps {
  params: {
    slug: string[];
  };
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  images: Record<string, { url: string; publicId: string }>;
  published: boolean;
  price: number;
  quantity: string;
  stock: number;
  tags: string[];
  createdAt: Date;
  defaultCategoryId: number | null;
} 