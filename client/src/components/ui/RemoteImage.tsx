import type { ImgHTMLAttributes } from 'react';

interface RemoteImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  alt: string;
}

export default function RemoteImage({ alt, ...props }: RemoteImageProps) {
  // Remote files are served from the API host, so Next Image optimization is unavailable.
  // eslint-disable-next-line @next/next/no-img-element
  return <img alt={alt} {...props} />;
}
