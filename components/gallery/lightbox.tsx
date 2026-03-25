"use client";

import { useEffect, useCallback, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LightboxProps {
  images: { src: string; alt?: string }[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isZoomed, setIsZoomed] = useState(false);

  const goToPrevious = useCallback(() => {
    setIsZoomed(false);
    setIsLoading(true);
    onNavigate(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  }, [currentIndex, images.length, onNavigate]);

  const goToNext = useCallback(() => {
    setIsZoomed(false);
    setIsLoading(true);
    onNavigate(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  }, [currentIndex, images.length, onNavigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goToPrevious();
      if (e.key === "ArrowRight") goToNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose, goToPrevious, goToNext]);

  useEffect(() => {
    setIsLoading(true);
    setIsZoomed(false);
  }, [currentIndex]);

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/98 flex flex-col animate-in fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
        <div className="text-white/50 text-sm font-mono">
          <span>{currentIndex + 1}</span>
          <span className="mx-2">/</span>
          <span>{images.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsZoomed(!isZoomed)}
            className="p-2.5 text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/10"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? (
              <ZoomOut className="w-5 h-5" />
            ) : (
              <ZoomIn className="w-5 h-5" />
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2.5 text-white/50 hover:text-white transition-colors rounded-sm hover:bg-white/10"
            aria-label="Close lightbox"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Image Area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-12 md:px-20">
        {/* Previous Button */}
        {images.length > 1 && (
          <button
            onClick={goToPrevious}
            className="absolute left-4 md:left-8 z-10 p-3 text-white/30 hover:text-white transition-all rounded-full hover:bg-white/10"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-10 h-10" />
          </button>
        )}

        {/* Image Container */}
        <div
          className={cn(
            "relative w-full h-full flex items-center justify-center",
            isZoomed && "cursor-zoom-out overflow-auto"
          )}
          onClick={() => isZoomed && setIsZoomed(false)}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
            </div>
          )}
          <Image
            src={currentImage.src}
            alt={currentImage.alt || ""}
            width={isZoomed ? 3200 : 1920}
            height={isZoomed ? 2400 : 1080}
            className={cn(
              "object-contain transition-all duration-300",
              isLoading ? "opacity-0 scale-[0.98]" : "opacity-100 scale-100",
              isZoomed && "scale-[1.8]"
            )}
            onLoad={() => setIsLoading(false)}
            priority
          />
        </div>

        {/* Next Button */}
        {images.length > 1 && (
          <button
            onClick={goToNext}
            className="absolute right-4 md:right-8 z-10 p-3 text-white/30 hover:text-white transition-all rounded-full hover:bg-white/10"
            aria-label="Next image"
          >
            <ChevronRight className="w-10 h-10" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex-shrink-0 border-t border-white/5 py-4 px-6">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsLoading(true);
                  setIsZoomed(false);
                  onNavigate(index);
                }}
                className={cn(
                  "relative flex-shrink-0 w-14 h-14 rounded-sm overflow-hidden transition-all flex-shrink-0",
                  index === currentIndex
                    ? "ring-2 ring-white scale-105 opacity-100"
                    : "opacity-40 hover:opacity-70"
                )}
              >
                <Image
                  src={image.src}
                  alt={image.alt || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
