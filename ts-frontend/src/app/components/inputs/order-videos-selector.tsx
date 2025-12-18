"use client";

import React, { useRef } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderVideosSelectorProps {
  newVideos: File[]; // newly added but not uploaded
  videos?: string[];
  setNewVideos: {
    add: (files: File[]) => void;
    remove: (file: File) => void;
  };
  setVideos?: {
    remove: (url: string) => void;
  };
}

export default function OrderVideosSelector({
  newVideos,
  videos,
  setNewVideos,
  setVideos,
}: OrderVideosSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    setNewVideos.add(fileArray);
  };

  return (
    <div className="flex flex-col">
      <p
        onClick={() => inputRef.current?.click()}
        className="text-myGray text-sm self-start cursor-pointer hover:underline underline md:no-underline"
      >
        დაამატე მაქსიმუმ 1 ვიდეო
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-[5px]">
        {/* Uploaded videos */}
        {videos?.map((url, index) => (
          <div
            key={index}
            className="h-[100px] rounded relative overflow-hidden shadow border-[1px]"
          >
            <Button
              onClick={() => setVideos?.remove(url)}
              className="absolute z-1 top-[5px] right-[5px] h-[40px] w-[40px] p-0! rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            >
              <Trash2Icon className="w-[16px]" />
            </Button>
            <video
              src={url}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
        {/* New videos preview */}
        {newVideos.map((file) => (
          <div
            key={file.name}
            className="h-[100px] rounded relative overflow-hidden shadow border-[1px]"
          >
            <Button
              onClick={() => setNewVideos.remove(file)}
              className="absolute z-1 top-[5px] right-[5px] h-[40px] w-[40px] p-0! rounded-full flex items-center justify-center bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            >
              <Trash2Icon className="w-[16px]" />
            </Button>
            <video
              src={URL.createObjectURL(file)}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {/* Add new videos */}
      <input
        type="file"
        multiple
        accept="video/*"
        style={{ display: "none" }}
        ref={inputRef}
        onChange={(e) => {
          if (e.target.files) handleAddFiles(e.target.files);
        }}
      />
    </div>
  );
}
