"use client";

import { useState } from "react";
import Image from "next/image";

/**
 * next/image wrapper that swaps to a fallback source if the primary one fails.
 * State is keyed to the failed src, so changing the `src` prop retries cleanly.
 */
export default function SafeImage({ src, fallback, alt, ...props }) {
  const [failedSrc, setFailedSrc] = useState(null);
  const finalSrc = failedSrc === src && fallback ? fallback : src;

  return (
    <Image
      {...props}
      src={finalSrc}
      alt={alt}
      onError={() => setFailedSrc(src)}
    />
  );
}
