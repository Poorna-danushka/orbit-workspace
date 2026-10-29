import { BACKEND_URL } from '@/lib/config';

export function getAvatarUrl(avatarPath?: string | null): string {
  if (!avatarPath) return '';
  if (/^https?:\/\//.test(avatarPath)) return avatarPath;
  if (!BACKEND_URL) return avatarPath;
  return `${BACKEND_URL}${avatarPath}`;
}
