import React, { useRef } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { CloudUpload } from 'lucide-react';
import { getCloudinaryFolder } from '@/app/admin/dashboard/actions';

export interface CloudinaryImage {
  url: string;
  publicId: string;
}

interface ImageUploadProps {
  images: CloudinaryImage[];
  onChange: (images: CloudinaryImage[]) => void;
  label?: string;
  multiple?: boolean;
  maxFiles?: number;
  folder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onChange,
  label = 'Upload Images',
  multiple = true,
  maxFiles = 5,
  folder = 'quickshop',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const cloudinaryUploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    if (!cloudinaryUploadPreset || !cloudName) {
      console.error('Missing Cloudinary credentials in .env');
      return;
    }

    // Get the proper folder path
    const uploadFolder = getCloudinaryFolder(folder);
    console.log('Uploading to folder:', uploadFolder);

    try {
      // Create folder structure if it doesn't exist
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
            };
            onChange([...images, newImage]);
          }
        } catch (error) {
          console.error('Upload error:', error);
        }
      }
    } catch (error) {
      console.error('Error creating folder:', error);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onChange(newImages);
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
        <div className="grid grid-cols-5 mt-2 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group mt-3">
              <Image
                src={image.url}
                alt={`Uploaded image ${index + 1}`}
                width={100}
                height={100}
                className="object-cover rounded border border-black p-2"
              />
              <button
                onClick={() => handleRemoveImage(index)}
                className="absolute -top-3.5 start-4/5 bg-red-500 text-white rounded-full p-1"
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
