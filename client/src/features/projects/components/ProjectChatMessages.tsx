import type { ChatMessage } from '../types';
import { getUploadUrl } from '@/lib/config';

interface ProjectChatMessagesProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
}

export default function ProjectChatMessages({
  messages,
  currentUserId,
  currentUserName,
}: ProjectChatMessagesProps) {
  return messages.map((message) => {
    const isOwn = message.senderId === currentUserId;
    const lines = message.content.split('\n');
    return (
      <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[85%] rounded-2xl border px-3 py-2 ${isOwn ? 'border-purple-500/40 bg-purple-500/15 text-purple-50' : 'border-white/10 bg-white/5 text-gray-100'}`}
        >
          <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-gray-300/80">
            <span>{isOwn ? currentUserName : message.sender?.username || 'Member'}</span>
            <span className="text-gray-500">•</span>
            <span>
              {new Date(message.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <p className="whitespace-pre-wrap break-words text-sm leading-6">
            {lines.map((line, index) => {
              const uploadUrl = getUploadUrl(line);
              return (
                <span key={`${message.id}-${index}`}>
                  {line.startsWith('http://') ||
                  line.startsWith('https://') ||
                  uploadUrl !== line ? (
                    <a
                      href={uploadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-300 underline underline-offset-2"
                    >
                      {line}
                    </a>
                  ) : (
                    line
                  )}
                  {index < lines.length - 1 && <br />}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    );
  });
}
