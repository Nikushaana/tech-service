"use client";

import React, { useRef } from "react";
import { Trash2Icon } from "lucide-react";
import { LuImagePlus } from "react-icons/lu";
import { Button } from "../ui/button";

interface OrderImagesSelectorProps {
  newImages: File[]; // newly added but not uploaded
  setNewImages: {
    add: (files: File[]) => void;
    remove: (file: File) => void;
  };
}

export default function OrderImagesSelector({
  newImages,
  setNewImages,
}: OrderImagesSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    setNewImages.add(fileArray);
  };

  return (
    <div className="flex flex-col">
      <p
        onClick={() => inputRef.current?.click()}
        className="text-myGray text-sm self-start cursor-pointer hover:underline underline md:no-underline"
      >
        დაამატე მაქსიმუმ 3 სურათი
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-[5px]">
        {/* New images preview */}
        {newImages.map((file, index) => (
          <div
            key={index}
            className="h-[100px] rounded relative overflow-hidden shadow border-[1px]"
          >
            <Button
              onClick={() => setNewImages.remove(file)}
              className="absolute top-[5px] right-[5px] h-[40px] w-[40px] p-0! rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            >
              <Trash2Icon className="w-[16px]"/>
            </Button>
            <img
              src={URL.createObjectURL(file)}
              alt="preview"
              className="w-full h-full object-cover"
            />
          </div>
        ))}

        {/* Add new images */}
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
