import { ImgHTMLAttributes } from 'react';

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  /** Image src - .jpg/.png paths are auto-converted to .webp */
  src: string;
}

/**
 * Optimized image component that serves WebP format.
 * Automatically converts .jpg/.jpeg/.png extensions to .webp in the src.
 */
export default function OptimizedImage({ src, ...props }: OptimizedImageProps) {
  const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');

  // eslint-disable-next-line @next/next/no-img-element
  return <img src={webpSrc} {...props} />;
}
