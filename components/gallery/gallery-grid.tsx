"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "./lightbox";
import { cn } from "@/lib/utils";

interface GalleryGridProps {
  images: { id: string; src: string; alt?: string }[];
  className?: string;
}

export function GalleryGrid({ images, className }: GalleryGridProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const navigateLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center py-24 text-text-muted">
        <p className="text-lg">No images in this gallery yet.</p>
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4",
          className
        )}
      >
        {images.map((image, index) => (
          <button
            key={image.id}
            onClick={() => openLightbox(index)}
            className={cn(
              "relative aspect-[4/3] overflow-hidden rounded-sm",
              "focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            )}
          >
            <Image
              src={image.src}
              alt={image.alt || `Gallery image ${index + 1}`}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={cn(
                "object-cover transition-transform duration-500",
                "group-hover:scale-[1.03]"
              )}
              loading="lazy"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors duration-300" />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images.map((img) => ({ src: img.src, alt: img.alt }))}
          currentIndex={lightboxIndex}
          onClose={closeLightbox}
          onNavigate={navigateLightbox}
        />
      )}
    </>
  );
}
