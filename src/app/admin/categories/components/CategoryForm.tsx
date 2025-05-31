"use client";

import { useState } from "react";
import ImageUpload from "@/components/ImageUpload";
import { CategorySchema } from "@/lib/zodvalidation";
import { z } from "zod";
// import type { CloudinaryImage } from "@/components/ImageUpload";

type FormCategoryType = z.infer<typeof CategorySchema>;

interface CategoryFormProps {
  initialData?: FormCategoryType;
  onSubmit: (data: Partial<FormCategoryType>) => void;
  isSubmitting?: boolean;
  categories?: FormCategoryType[];
}

const CategoryForm = ({
  initialData,
  onSubmit,
  isSubmitting = false,
  categories = [],
}: CategoryFormProps) => {
  const [form, setForm] = useState<Partial<FormCategoryType>>(
    initialData || {
      name: "",
      slug: "",
      parentId: undefined,
      image: undefined,
      sortOrder: 0,
      published: true,
    }
  );

  const handleChange = <K extends keyof FormCategoryType>(
    field: K,
    value: FormCategoryType[K]
  ) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="fixed top-0 right-0 h-full w-3/4 bg-white p-6 shadow-lg overflow-y-auto">
      <h3 className="text-xl font-semibold mb-4">
        {initialData ? 'Edit Category' : 'Add New Category'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Category Name</label>
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={form.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        {/* Slug */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Slug</label>
          <input
            type="text"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={form.slug || ""}
            onChange={(e) => handleChange("slug", e.target.value)}
            required
          />
        </div>

        {/* Parent Category */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Parent Category</label>
          <select
            className="flex-1 p-2 border border-gray-300 rounded"
            value={form.parentId ?? ""}
            onChange={(e) =>
              handleChange(
                "parentId",
                e.target.value ? parseInt(e.target.value) : undefined
              )
            }
          >
            <option value="">Select Parent Category (optional)</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-4">
          <label className="w-40 font-medium">Sort Order</label>
          <input
            type="number"
            className="flex-1 p-2 border border-gray-300 rounded"
            value={form.sortOrder || 0}
            onChange={(e) =>
              handleChange("sortOrder", parseInt(e.target.value))
            }
          />
        </div>

        {/* Image Upload */}
        <div className="flex items-start gap-4">
          <label className="w-40 font-medium mt-2">Category Image</label>
          <div className="flex-1">
            <ImageUpload
              images={form.image ? [form.image] : []}
              onChange={async (images) => {
                // If images array is empty, it means the image was deleted
                if (images.length === 0 && form.image?.publicId) {
                  try {
                    // Delete the image from Cloudinary
                    const response = await fetch(`/api/cloudinary/delete-image?publicId=${encodeURIComponent(form.image.publicId)}`, {
                      method: 'DELETE',
                    });
                    
                    if (!response.ok) {
                      console.error('Failed to delete image from Cloudinary');
                    }
                  } catch (error) {
                    console.error('Error deleting image:', error);
                  }
                }
                handleChange("image", images[0] || undefined);
              }}
              label="Category Image"
              multiple={false}
              maxFiles={1}
              folder="merugo/categories"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            {isSubmitting ? "Saving..." : initialData ? "Update Category" : "Add Category"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CategoryForm;
