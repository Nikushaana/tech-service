"use client";

import React, { useRef } from "react";
import { Trash2Icon } from "lucide-react";
import { LuImagePlus } from "react-icons/lu";
import { Button } from "../ui/button";

interface ImageSelectorProps {
  images?: string[]; // already uploaded images (URLs)
  setImages?: (url: string) => void;

  newImages: File[]; // newly added but not uploaded
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

  const handleAddFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    setNewImages.add(fileArray);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {/* Existing images */}
      {images?.map((url) => (
        <div
          key={url}
          className="w-[200px] h-[130px] rounded relative overflow-hidden shadow border-[1px]"
        >
          <Button
            onClick={() => {
              if (setImages) setImages(url);
            }}
            className="absolute bottom-[5px] left-[5%] w-[90%] h-[40px] flex items-center justify-center bg-red-500 text-white hover:bg-red-600 text-[30px] cursor-pointer"
          >
            <Trash2Icon />
          </Button>
          <img
            src={url}
            alt="uploaded"
            className="w-full h-full object-contain"
          />
        </div>
      ))}

      {/* New images preview */}
      {newImages.map((file, index) => (
        <div
          key={index}
          className="w-[200px] h-[130px] rounded relative overflow-hidden shadow border-[1px]"
        >
          <Button
            onClick={() => setNewImages.remove(file)}
            className="absolute bottom-[5px] left-[5%] w-[90%] h-[40px] flex items-center justify-center bg-red-500 text-white hover:bg-red-600 text-[30px] cursor-pointer"
          >
            <Trash2Icon />
          </Button>
          <img
            src={URL.createObjectURL(file)}
            alt="preview"
            className="w-full h-full object-contain"
          />
        </div>
      ))}

      {/* Add new images */}
      <div className="w-[200px] h-[130px] relative ">
        <Button
          onClick={() => inputRef.current?.click()}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[30px] cursor-pointer rounded bg-green-500 text-white hover:bg-green-600 duration-100"
        >
          <LuImagePlus />
        </Button>
        <input
          type="file"
          multiple
          accept="image/*"
          style={{ display: "none" }}
          ref={inputRef}
          onChange={(e) => {
            if (e.target.files) handleAddFiles(e.target.files);
          }}
        />
      </div>
    </div>
  );
}
