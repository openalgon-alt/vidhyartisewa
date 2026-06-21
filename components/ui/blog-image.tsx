"use client";

import { useState } from "react";
import { FileText } from "lucide-react";

interface BlogImageProps {
  src: string;
  alt: string;
}

export function BlogFeaturedImage({ src, alt }: BlogImageProps) {
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-[300px] sm:h-[400px] mb-10 rounded-2xl overflow-hidden bg-slate-100 group border border-slate-100">
      {!error ? (
        <img
          src={src}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          onError={() => setError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <FileText className="w-20 h-20 text-slate-300" />
        </div>
      )}
    </div>
  );
}