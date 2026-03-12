"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ProductGallery({ name, images }: { name: string; images: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="space-y-4">
      <div className="relative h-[520px] overflow-hidden rounded-[34px] border border-black/10 bg-white/70">
        <Image
          src={activeImage}
          alt={`${name} preview`}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 60vw"
          priority
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            className={cn(
              "relative h-28 overflow-hidden rounded-2xl border transition",
              index === activeIndex ? "border-accent ring-2 ring-accent/30" : "border-black/10 hover:border-black/30"
            )}
            onClick={() => setActiveIndex(index)}
          >
            <Image src={image} alt={`${name} image ${index + 1}`} fill className="object-cover" sizes="33vw" />
          </button>
        ))}
      </div>
    </div>
  );
}
