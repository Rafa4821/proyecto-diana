import { useState } from 'react';

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  aspectRatio,
  sizes = '(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw',
  ...props
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const style = {};
  if (aspectRatio) style.aspectRatio = aspectRatio;

  return (
    <img
      src={error ? 'https://placehold.co/400x500/f5f5f5/a3a3a3?text=Error' : src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      width={width}
      height={height}
      sizes={sizes}
      style={style}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      {...props}
    />
  );
}
