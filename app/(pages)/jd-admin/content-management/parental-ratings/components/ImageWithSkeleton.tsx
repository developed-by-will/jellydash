import { Skeleton } from '@/components/ui/skeleton';
import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src?: string;
  alt?: string;
};

export default function ImageWithSkeleton(props: Readonly<Props>) {
  const { src, alt } = props;
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-[220px] h-[330px]">
      {isLoading && <Skeleton className="absolute inset-0 w-full h-full" />}

      {src && (
        <div className="relative w-full h-full overflow-hidden rounded-lg">
          <Image
            src={src}
            alt={alt || 'Loading...'}
            fill
            priority
            sizes="(max-width: 220px) 100vw, (max-width: 220px) 50vw, 33vw"
            className={`max-w-xs transition duration-300 ease-in-out hover:scale-105 bg-black rounded-lg ${
              isLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      )}
    </div>
  );
}
