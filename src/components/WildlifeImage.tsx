import { useState } from 'react';
import { Camera } from 'lucide-react';

interface WildlifeImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function WildlifeImage({ src, alt, className = '' }: WildlifeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#E8ECE0] text-[#547A50] ${className}`}
        role="img"
        aria-label={alt}
      >
        <Camera className="h-6 w-6 opacity-70" aria-hidden="true" />
        <span className="mt-1 px-2 text-center text-[11px] font-medium text-[#547A50]">
          Camera Frame
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
