'use client';

import Avatar from './Avatar';
import { Users } from 'lucide-react';

interface AvatarUser {
  id?: string;
  username?: string;
  avatar?: string | null;
}

interface AvatarStackProps {
  members: AvatarUser[];
  max?: number;
}

export default function AvatarStack({ members, max = 5 }: AvatarStackProps) {
  if (!members || members.length === 0) {
    return (
      <span className="text-[11px] text-gray-600 flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5" /> No members yet
      </span>
    );
  }

  const shown = members.slice(0, max);
  const overflow = members.length - max;

  return (
    <div className="flex items-center">
      {shown.map((u, i) => (
        <div key={u.id || i} className={i > 0 ? '-ml-2' : ''}>
          <Avatar user={u} size="sm" ring />
        </div>
      ))}
      {overflow > 0 && (
        <div className="-ml-2 w-7 h-7 rounded-full bg-white/10 ring-2 ring-[#0d0d14] flex items-center justify-center text-[9px] font-bold text-gray-400">
          +{overflow}
        </div>
      )}
    </div>
  );
}
