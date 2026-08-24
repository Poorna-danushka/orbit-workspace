'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircleMore, SendHorizonal, X, Smile, Paperclip, ImageIcon } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/axios';
import { BACKEND_URL } from '@/lib/config';

interface ChatUser {
  id: string;
  username: string;
  avatar: string | null;
}

interface ChatMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender?: ChatUser;
}

interface ProjectChatProps {
  projectId: string;
  currentUserId: string;
  currentUserName?: string;
  open?: boolean;
  onToggle?: () => void;
}

const emojiOptions = ['😊', '👍', '🎉', '🔥', '💡', '✅', '🚀', '❤️', '👏', '😄'];

export default function ProjectChat({
  projectId,
  currentUserId,
  currentUserName = 'You',
  open = false,
  onToggle,
}: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setChatError(null);
      const response = await api.get(`/chats/project/${projectId}/messages`);
      setMessages(response.data || []);
    } catch (error: any) {
      console.error('Failed to load project chat messages:', error);
      setChatError(
        error?.response?.status === 500
          ? 'Chat is unavailable until the project chat schema is synced to the database.'
          : 'Unable to load chat messages right now.'
      );
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!open || !projectId || !currentUserId) return;

    fetchMessages();

    const socket = io(BACKEND_URL);
    socketRef.current = socket;
    socket.emit('joinProject', projectId);
    socket.emit('joinChat', projectId);
    socket.on('messageReceived', (message: ChatMessage) => {
      setMessages((prev) => {
        if (prev.some((item) => item.id === message.id)) {
          return prev;
        }
        return [...prev, message];
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, currentUserId, open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || !projectId || !currentUserId) return;

    socketRef.current?.emit('sendMessage', {
      projectId,
      senderId: currentUserId,
      content,
    });

    setDraft('');
    setShowEmojiPicker(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setDraft((prev) => `${prev}${emoji}`);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !projectId || !currentUserId) {
      event.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/uploads/project/${projectId}`, formData);
      const uploadUrl = res.data?.fileUrl || '';
      const friendlyText = uploadUrl ? `📎 ${file.name}\n${uploadUrl}` : `📎 ${file.name}`;

      socketRef.current?.emit('sendMessage', {
        projectId,
        senderId: currentUserId,
        content: friendlyText,
      });
    } catch (error) {
      console.error('Failed to upload chat file:', error);
      setChatError('File upload failed. Please try again or check your Cloudinary configuration.');
    } finally {
      event.target.value = '';
    }
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={onToggle}
          aria-label="Open project chat"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-purple-200 transition-colors hover:bg-white/10 shadow-[0_0_20px_rgba(168,85,247,0.15)]"
          title="Project chat"
        >
          <MessageCircleMore className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 flex items-end justify-end bg-black/30 p-4 backdrop-blur-sm sm:items-end sm:justify-end">
          <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-[#111827]/95 shadow-[0_30px_80px_rgba(76,29,149,0.45)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-purple-600/20 via-indigo-500/10 to-transparent px-4 py-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-purple-200/75">Project chat</p>
                <h3 className="text-sm font-semibold text-white">Team discussions</h3>
              </div>
              <button
                type="button"
                onClick={onToggle}
                aria-label="Close project chat"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div ref={listRef} className="max-h-[420px] min-h-[260px] space-y-3 overflow-y-auto bg-[#0b1220]/60 p-4">
              {chatError ? (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100">
                  {chatError}
                </div>
              ) : loading && messages.length === 0 ? (
                <div className="text-center text-xs text-gray-400">Loading messages…</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-xs text-gray-400">No messages yet — start the team conversation.</div>
              ) : (
                messages.map((message) => {
                  const isOwn = message.senderId === currentUserId;
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl border px-3 py-2 ${isOwn ? 'border-purple-500/40 bg-purple-500/15 text-purple-50' : 'border-white/10 bg-white/5 text-gray-100'}`}>
                        <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-gray-300/80">
                          <span>{isOwn ? currentUserName : message.sender?.username || 'Member'}</span>
                          <span className="text-gray-500">•</span>
                          <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6">
                          {message.content.split('\n').map((line, index) => (
                            <span key={`${message.id}-${index}`}>
                              {line.startsWith('http://') || line.startsWith('https://') ? (
                                <a href={line} target="_blank" rel="noreferrer" className="text-blue-300 underline underline-offset-2">
                                  {line}
                                </a>
                              ) : (
                                line
                              )}
                              {index < message.content.split('\n').length - 1 && <br />}
                            </span>
                          ))}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="border-t border-white/10 bg-black/20 p-3">
              {showEmojiPicker && (
                <div className="mb-3 flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-[#0f172a] p-2">
                  {emojiOptions.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiSelect(emoji)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-lg transition hover:bg-white/10"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex-1 rounded-2xl border border-white/10 bg-[#0f172a] px-3 py-2">
                  <textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message…"
                    rows={1}
                    className="max-h-28 min-h-[40px] w-full resize-none bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-purple-200 transition hover:bg-white/10"
                    aria-label="Add emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-purple-200 transition hover:bg-white/10"
                    aria-label="Upload file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileUpload}
                    className="hidden"
                    accept="image/*,.pdf,.txt,.doc,.docx,.xls,.xlsx"
                  />

                  <button
                    type="submit"
                    disabled={!draft.trim()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                  >
                    <SendHorizonal className="h-4 w-4" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
