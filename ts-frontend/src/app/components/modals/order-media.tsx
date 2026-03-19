"use client";

import { useOrderMediaStore } from "@/app/store/useOrderMediaStore";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";
import { BsXLg } from "react-icons/bs";

export default function OrderMedia() {
  const { media, currentIndex, closeMedia, next, prev } = useOrderMediaStore();
  const isOpen = currentIndex !== null;
  const item = isOpen ? media[currentIndex] : null;

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!isOpen && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0; // optional: reset video
    }
  }, [isOpen]);

  return (
    <div
      className={`${
        isOpen && item ? "" : "opacity-0 pointer-events-none"
      } fixed inset-0 z-30 flex items-center justify-center duration-200`}
    >
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity ${
          isOpen && item ? "opacity-50" : "opacity-0"
        }`}
        onClick={closeMedia}
      />

      {/* Modal container */}
      <div className="relative max-w-[90vw] max-h-[90vh] shadow-lg flex items-center justify-center overflow-visible">
        {/* Left button */}
        {media.length > 1 && (
          <button
            onClick={prev}
            className="absolute left-4 text-white text-5xl z-50 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 cursor-pointer"
          >
            ‹
          </button>
        )}

        {/* Media wrapper */}
        {item?.type === "image" ? (
          <img
            src={item?.url}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        ) : (
          <video
            ref={videoRef}
            src={item?.url}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />
        )}

        {/* Right button */}
        {media.length > 1 && (
          <button
            onClick={next}
            className="absolute right-4 text-white text-5xl z-50 bg-black/50 rounded-full w-12 h-12 flex items-center justify-center hover:bg-black/70 cursor-pointer"
          >
            ›
          </button>
        )}

        {/* Close button */}
        <Button
          onClick={closeMedia}
          size="icon"
          variant="secondary"
          className="absolute top-4 right-4 z-50 rounded-lg bg-myLightBlue hover:bg-myBlue text-white cursor-pointer"
        >
          <BsXLg className="size-4" />
        </Button>

        {/* Counter */}
        <div className="absolute bottom-4 text-white text-sm z-50">
          {(currentIndex ?? 0) + 1} / {media.length}
        </div>
      </div>
    </div>
  );
}
