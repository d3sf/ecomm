import React, { useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { CloudUpload } from 'lucide-react';
import { getCloudinaryFolder } from '@/app/admin/dashboard/actions';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export interface CloudinaryImage {
  url: string;
  publicId: string;
  isDefault?: boolean;
}

interface ImageUploadProps {
  images: CloudinaryImage[];
  onChange: (images: CloudinaryImage[]) => void;
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
  defaultImagePublicId?: string;
  onDefaultImageChange?: (publicId: string) => void;
}

interface SortableImageProps {
  image: CloudinaryImage;
  index: number;
  isDefault: boolean;
  onRemove: () => void;
}

const SortableImage = ({ image, index, isDefault, onRemove }: SortableImageProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: image.publicId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Remove button clicked');
    onRemove();
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="relative group mt-3">
      <div className={`border p-2  rounded ${isDefault ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
        <Image
          src={image.url}
          alt={`Uploaded image ${index + 1}`}
          width={150}
          height={150}
          className="object-cover rounded cursor-move"
        />
        {isDefault && (
          <div className="absolute -top-4 -left-4 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Default
          </div>
        )}
      </div>
      <button
        onClick={handleRemove}
        type="button"
        className="absolute -top-3.5 start-9/10 bg-red-500 text-white rounded-full p-1 z-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  label = 'Upload Images',
  multiple = true,
  maxFiles = 5,
  folder = 'merugo',
  onDefaultImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudinaryUploadPreset || !cloudName) {
      console.error('Missing Cloudinary credentials in .env');
      return;
    }

    const uploadFolder = getCloudinaryFolder(folder);
    console.log('Uploading to folder:', uploadFolder);

    try {
      await fetch('/api/cloudinary/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ folder: uploadFolder }),
      });

      for (const file of Array.from(files)) {
        if (images.length >= maxFiles) break;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', cloudinaryUploadPreset);
        formData.append('folder', uploadFolder);

        try {
          const { data } = await axios.post(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, formData);

          if (data.secure_url && data.public_id) {
            const newImage = {
              url: data.secure_url,
              publicId: data.public_id,
              isDefault: images.length === 0, // Make first image default if no images exist
            };

            const updatedImages = [...images, newImage];
            onChange(updatedImages);

            // If this is the first image, set it as default
            if (images.length === 0 && onDefaultImageChange) {
              onDefaultImageChange(data.public_id);
            }
          }
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleRemoveImage = async (indexToRemove: number) => {
    const imageToRemove = images[indexToRemove];
    console.log('Removing image:', imageToRemove);
    
    try {
      // Delete the image from Cloudinary first
      console.log('Sending delete request to Cloudinary...');
      const response = await fetch(`/api/cloudinary/delete-image?publicId=${encodeURIComponent(imageToRemove.publicId)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Delete response:', response);
      const result = await response.json();
      console.log('Delete result:', result);
      
      if (!response.ok) {
        console.error('Failed to delete image from Cloudinary:', result.error);
        // Continue with UI removal even if server deletion fails
      }
      
      // Then remove from local state
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onChange(newImages);

      // If the removed image was the default and we still have images, set the first one as default
      if (indexToRemove === 0 && newImages.length > 0 && onDefaultImageChange) {
        onDefaultImageChange(newImages[0].publicId);
      }
    } catch (error) {
      console.error('Error removing image:', error);
      // Continue with UI removal even if server deletion fails
      const newImages = images.filter((_, index) => index !== indexToRemove);
      onChange(newImages);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img: CloudinaryImage) => img.publicId === active.id);
      const newIndex = images.findIndex((img: CloudinaryImage) => img.publicId === over.id);
      
      const newImages = arrayMove(images, oldIndex, newIndex);
      onChange(newImages);

      // If the order changed and we have a default image callback, update the default
      if (onDefaultImageChange && newIndex === 0) {
        onDefaultImageChange(newImages[0].publicId);
      }
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>

      <input
        type="file"
        ref={fileInputRef}
        multiple={multiple}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer text-center"
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="flex flex-col justify-center items-center">
          <CloudUpload className="text-green-500 size-10" />
          <p className="text-gray-500">Click to select images</p>
          <p className="text-gray-400 text-sm">(Only JPEG, PNG, WEBP images allowed)</p>
        </div>
      </div>

      {images.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mt-4 mb-2">Uploaded images:</p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={images.map((img) => img.publicId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <SortableImage
                    key={image.publicId}
                    image={image}
                    index={index}
                    isDefault={index === 0}
                    onRemove={() => handleRemoveImage(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
