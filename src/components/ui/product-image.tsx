"use client";
import Image, { type ImageProps } from "next/image";
import { useState } from "react";

export function ProductImage({ src, alt, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(
    null,
  );
  return (
    <Image
      {...props}
      alt={alt}
      src={failedSource === src ? "/product-placeholder.svg" : src}
      onError={() => setFailedSource(src)}
    />
  );
}
