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
    <Image
      src={src}
      alt="SyncCut"
      width={200}
      height={52}
      priority={priority}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      className={className}
      unoptimized
    />
  );
}
