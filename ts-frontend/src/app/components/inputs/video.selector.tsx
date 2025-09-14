"use client";

import React, { useRef } from "react";
import { Trash2Icon } from "lucide-react";
import { Button } from "../ui/button";
import { AiOutlineVideoCameraAdd } from "react-icons/ai";

interface VideoSelectorProps {
  videos?: string[]; // already uploaded videos (URLs)
  setVideos?: (url: string) => void;

  newVideos: File[]; // newly added but not uploaded
  setNewVideos: {
    add: (files: File[]) => void;
    remove: (file: File) => void;
  };
}

export default function VideoSelector({
  videos,
  setVideos,
  newVideos,
  setNewVideos,
}: VideoSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAddFiles = (files: FileList) => {
    const fileArray = Array.from(files);
    setNewVideos.add(fileArray);
  };

  return (
    <div className="flex flex-wrap justify-center gap-3">
      {/* Existing videos */}
      {videos?.map((url) => (
        <div
          key={url}
          className="w-[200px] h-[130px] rounded relative overflow-hidden shadow border-[1px]"
        >
          {setVideos && (
            <Button
              onClick={() => setVideos(url)}
              className="absolute bottom-[5px] left-[5%] w-[90%] h-[40px] flex items-center justify-center bg-red-500 text-white hover:bg-red-600 text-[30px] cursor-pointer"
            >
              <Trash2Icon />
            </Button>
          )}
          <video src={url} controls className="w-full h-full object-contain" />
        </div>
      ))}

      {/* New videos preview */}
      {newVideos.map((file) => (
        <div
          key={file.name}
          className="w-[200px] h-[130px] rounded relative overflow-hidden shadow border-[1px]"
        >
          <Button
            onClick={() => setNewVideos.remove(file)}
            className="absolute z-10 bottom-[5px] left-[5%] w-[90%] h-[40px] flex items-center justify-center bg-red-500 text-white hover:bg-red-600 text-[30px] cursor-pointer"
          >
            <Trash2Icon />
          </Button>
          <video
            src={URL.createObjectURL(file)}
            className="w-full h-full object-contain"
          />
        </div>
      ))}

      {/* Add new videos */}
      <div className="w-[200px] h-[130px] relative">
        <Button
          onClick={() => inputRef.current?.click()}
          className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[30px] cursor-pointer rounded bg-green-500 text-white hover:bg-green-600 duration-100"
        >
          <AiOutlineVideoCameraAdd />
        </Button>
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
    </div>
  );
}
