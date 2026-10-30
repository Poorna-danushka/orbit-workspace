import { AlertTriangle, Calendar, Check, Info, Megaphone, Shield, UserCheck } from 'lucide-react';
import type { NotificationItem } from '@/features/notifications/types';

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function detectType(message: string) {
  const value = message.toLowerCase();
  if (value.includes('[admin]')) {
    return {
      icon: Megaphone,
      color: 'text-orange-400',
      bg: 'bg-orange-400/10',
      label: 'Announcement',
    };
  }
  if (value.includes('assigned')) {
    return { icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-400/10', label: 'Assignment' };
  }
  if (value.includes('due') || value.includes('deadline') || value.includes('overdue')) {
    return { icon: Calendar, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Deadline' };
  }
  if (value.includes('admin') || value.includes('role')) {
    return { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10', label: 'System' };
  }
  if (value.includes('warning') || value.includes('alert')) {
    return {
      icon: AlertTriangle,
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/10',
      label: 'Alert',
    };
  }
  return { icon: Info, color: 'text-gray-400', bg: 'bg-gray-400/10', label: 'Info' };
}

export default function NotificationCard({
  notification,
  onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  const type = detectType(notification.message);
  const Icon = type.icon;
  return (
    <div
      onClick={() => !notification.isRead && onMarkRead(notification.id)}
      className={`flex items-start gap-4 p-4 rounded-2xl border shadow-lg shadow-black/10 transition-all ${
        notification.isRead
          ? 'bg-[#11131b]/60 border-white/[0.06] opacity-60 cursor-default'
          : 'bg-[#11131b] border-purple-500/30 hover:border-purple-500/50 cursor-pointer'
      }`}
    >
      <div
        className={`w-9 h-9 rounded-xl ${type.bg} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className={`w-4 h-4 ${type.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${type.bg} ${type.color}`}
          >
            {type.label}
          </span>
          {!notification.isRead && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
          )}
        </div>
        <p
          className={`text-sm leading-relaxed ${notification.isRead ? 'text-gray-500' : 'text-white'}`}
        >
          {notification.message.replace('[Admin] ', '')}
        </p>
        <p className="text-xs text-gray-600 mt-1.5">{timeAgo(notification.createdAt)}</p>
      </div>
      {!notification.isRead && (
        <button
          onClick={(event) => {
            event.stopPropagation();
            onMarkRead(notification.id);
          }}
          className="p-1.5 text-gray-600 hover:text-purple-400 transition-colors rounded-lg hover:bg-purple-500/10 flex-shrink-0"
          title="Mark as read"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
