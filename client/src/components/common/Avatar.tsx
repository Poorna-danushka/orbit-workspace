'use client';

import { getAvatarUrl } from '@/lib/config';

interface AvatarUser {
  username?: string;
  name?: string;
  avatar?: string | null;
}

interface AvatarProps {
  user: AvatarUser | undefined | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  ring?: boolean;
  className?: string;
}

const SIZE_MAP = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

export default function Avatar({ user, size = 'sm', ring = false, className = '' }: AvatarProps) {
  if (!user) return null;

  const displayName = user.username || user.name || 'User';
  const sizeClass = SIZE_MAP[size];
  const ringClass = ring ? 'ring-2 ring-[#0d0d14]' : '';
  const src = getAvatarUrl(user.avatar);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={displayName}
        title={displayName}
        className={`${sizeClass} ${ringClass} rounded-full object-cover flex-shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      title={displayName}
      className={`${sizeClass} ${ringClass} rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white flex-shrink-0 ${className}`}
    >
      {displayName[0]?.toUpperCase() ?? '?'}
    </div>
  );
}
