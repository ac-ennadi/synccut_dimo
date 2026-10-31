import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'dark' | 'light';
  className?: string;
  priority?: boolean;
}

export function BrandLogo({
  variant = 'dark',
  className = '',
  priority = false,
}: BrandLogoProps) {
  const src = variant === 'dark' ? '/logo-dark.svg' : '/logo-light.svg';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/synccut-mark.png"
        alt=""
        aria-hidden="true"
        width={40}
        height={40}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-black/10"
        unoptimized
      />
      <Image
        src={src}
        alt="SyncCut"
        width={200}
        height={52}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        className="h-full w-auto"
        unoptimized
      />
    </span>
  );
}
