import { z } from "zod";

// 🗂️ Category Schema
const CategorySchemaBase = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  parentId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  image: z
    .object({
      url: z.string().url(),
      publicId: z.string(),
    })
    .nullable()
    .optional(),
  published: z.boolean().default(true),
});

interface CategorySchemaType {
  id?: number;
  name: string;
  slug: string;
  parentId?: number | null;
  sortOrder?: number;
  image?: {
    url: string;
    publicId: string;
  } | null;
  published?: boolean;
  children?: CategorySchemaType[];
  productCount?: number;
}

export const CategorySchema: z.ZodType<CategorySchemaType> = CategorySchemaBase.extend({
  children: z.lazy(() => z.array(CategorySchema)).optional(),
});

// 🗂️ Category Update Schema (for partial updates)
export const CategoryUpdateSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Category name is required").optional(),
  slug: z.string().min(1, "Slug is required").optional(),
  parentId: z.number().int().positive().nullable().optional(),
  sortOrder: z.number().int().nonnegative().optional(),
  image: z
    .object({
      url: z.string().url(),
      publicId: z.string(),
    })
    .optional(),
  published: z.boolean().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided for update"
});

// 📦 Product Schema
export const ProductSchema = z.object({
  id: z.number().int().positive().optional(),
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string().url().optional(),
        publicId: z.string().optional(),
        isDefault: z.boolean().optional()
      })
    )
    .optional(),
  categoryId: z.number().int().positive().optional(),
  categories: z.array(
    z.object({
      category: z.object({
        id: z.number().int().positive(),
        name: z.string(),
        slug: z.string(),
        parentId: z.number().int().positive().nullable().optional(),
        sortOrder: z.number().int().nonnegative().optional(),
        image: z
          .object({
            url: z.string().url(),
            publicId: z.string(),
          })
          .nullable()
          .optional(),
        published: z.boolean().default(true),
      })
    })
  ).optional().nullable().default([]),
  price: z.number().positive("Price must be greater than 0"),
  quantity: z.string().min(1, "Quantity is required"),
  slug: z.string().min(1, "Slug is required"),
  stock: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(true),
  attributes: z
    .array(
      z.object({
        name: z.string().min(1, "Attribute name is required").optional(),
        value: z.string().min(1, "Attribute value is required").optional(),
      })
    )
    .optional(),
  createdAt: z.date().optional(),
  defaultCategory: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    slug: z.string(),
    published: z.boolean().default(true)
  }).optional(),
  defaultCategoryId: z.number().int().positive().optional(),
  defaultImagePublicId: z.string().optional(),
});

// ⚙️ Product Attribute Schema
export const ProductAttributeSchema = z.object({
  id: z.number().int().positive().optional(),
  productId: z.number().int().positive(),
  name: z.string().min(1, "Attribute name is required"),
  value: z.string().min(1, "Attribute value is required"),
});

// 🧠 Inferred Types
export type CategoryType = z.infer<typeof CategorySchema>;
export type ProductType = z.infer<typeof ProductSchema>;
export type ProductAttributeType = z.infer<typeof ProductAttributeSchema>;
