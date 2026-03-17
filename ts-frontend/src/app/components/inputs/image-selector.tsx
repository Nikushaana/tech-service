"use client";

import { useRef } from "react";
import { User } from "lucide-react";

interface ImageSelectorProps {
  images?: string[];
  setImages?: (url: string) => void;

  newImages: File[];
  setNewImages: {
    add: (files: File[]) => void;
    remove: (file: File) => void;
  };
}

export default function ImageSelector({
  images,
  setImages,
  newImages,
  setNewImages,
}: ImageSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const preview =
    newImages?.[0]
      ? URL.createObjectURL(newImages[0])
      : images?.[0] || null;

  const handleFileChange = (file: File) => {
    if (images?.[0] && setImages) {
      setImages(images[0]);
    }

    setNewImages.add([file]);
  };

  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="flex items-center gap-3 cursor-pointer group"
    >
      <div className="w-[60px] h-[60px] rounded-full overflow-hidden border flex items-center justify-center bg-gray-100">
        {preview ? (
          <img
            src={preview}
            alt="profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <User size={24} className="text-gray-500" />
        )}
      </div>

      <p className="text-sm text-myLightBlue group-hover:text-myBlue group-hover:underline">
        შეცვალე სურათი
      </p>

      <input
        type="file"
        accept="image/*"
        hidden
        ref={inputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileChange(file);
        }}
      />
    </div>
  );
}