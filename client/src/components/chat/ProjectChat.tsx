'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { MessageCircleMore, SendHorizonal, X, Smile, Paperclip, Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '@/lib/axios';
import { BACKEND_URL } from '@/lib/config';
import { getApiErrorMessage } from '@/lib/apiError';

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
type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]) => {
  const unique = new Map([...current, ...incoming].map((message) => [message.id, message]));
  return [...unique.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );
};

export default function ProjectChat({
  projectId,
  currentUserId,
  currentUserName = 'You',
  open = false,
  onToggle,
}: ProjectChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('connecting');
  const [joinedProject, setJoinedProject] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [chatError, setChatError] = useState<string | null>(null);
  const [socketError, setSocketError] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open || !projectId || !currentUserId) return;

    let cancelled = false;

    const socket = io(BACKEND_URL, { withCredentials: true });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnectionStatus('connecting');
      setJoinedProject(false);
      socket.emit('joinChat', projectId, (result: { ok?: boolean; error?: string }) => {
        if (cancelled) return;
        if (result?.error) {
          setConnectionStatus('error');
          setSocketError('You no longer have access to this project chat.');
          return;
        }
        setJoinedProject(true);
        setConnectionStatus('connected');
        setSocketError(null);
      });
    });
    socket.on('disconnect', () => {
      setJoinedProject(false);
      setConnectionStatus('disconnected');
      if (!cancelled) setSocketError('Connection lost. Chat will try to reconnect automatically.');
    });
    socket.on('connect_error', (error) => {
      setJoinedProject(false);
      setConnectionStatus('error');
      setSocketError(
        error.message.toLowerCase().includes('auth')
          ? 'Your session could not be verified. Sign in again to use project chat.'
          : 'Cannot connect to chat. Check your connection and backend configuration, then retry.'
      );
    });
    socket.on('messageReceived', (message: ChatMessage) => {
      if (message.projectId !== projectId) return;
      setMessages((prev) => mergeMessages(prev, [message]));
    });

    const fetchMessages = async () => {
      try {
        const response = await api.get<ChatMessage[]>(`/chats/project/${projectId}/messages`);
        if (!cancelled) {
          setChatError(null);
          setMessages((current) => mergeMessages(
            current.filter((message) => message.projectId === projectId),
            response.data || []
          ));
        }
      } catch (error) {
        if (!cancelled) setChatError(getApiErrorMessage(error, 'Unable to load chat messages right now.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchMessages();

    return () => {
      cancelled = true;
      socket.disconnect();
      socketRef.current = null;
    };
  }, [projectId, currentUserId, open, retryCount]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const projectMessages = messages.filter((message) => message.projectId === projectId);
  const retryChat = () => {
    setLoading(true);
    setChatError(null);
    setSocketError(null);
    setConnectionStatus('connecting');
    setJoinedProject(false);
    setRetryCount((count) => count + 1);
  };
  const activeError = chatError || socketError;

  const emitMessage = (content: string) => new Promise<void>((resolve, reject) => {
    const socket = socketRef.current;
    if (!socket?.connected || !joinedProject) {
      reject(new Error('Chat is not connected to this project.'));
      return;
    }

    socket.timeout(10_000).emit(
      'sendMessage',
      { projectId, content },
      (timeoutError: Error | null, result?: { ok?: boolean; error?: string }) => {
        if (timeoutError) {
          reject(new Error('Message could not be sent. Check your connection and try again.'));
        } else if (result?.error || !result?.ok) {
          reject(new Error(result?.error || 'Message could not be sent.'));
        } else {
          resolve();
        }
      }
    );
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;
    setSending(true);
    setChatError(null);
    try {
      await emitMessage(content);
      setDraft('');
      setShowEmojiPicker(false);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : 'Message could not be sent.');
    } finally {
      setSending(false);
    }
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
      setUploading(true);
      setChatError(null);
      const formData = new FormData();
      formData.append('file', file);

      const res = await api.post(`/uploads/project/${projectId}`, formData);
      const uploadUrl = res.data?.fileUrl ? `${BACKEND_URL}${res.data.fileUrl}` : '';
      const friendlyText = uploadUrl ? `📎 ${file.name}\n${uploadUrl}` : `📎 ${file.name}`;

      await emitMessage(friendlyText);
    } catch (error) {
      setChatError(getApiErrorMessage(error, error instanceof Error ? error.message : 'File upload failed.'));
    } finally {
      setUploading(false);
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
        <div
          className="fixed inset-0 z-40 flex items-end justify-end bg-black/50 p-0 backdrop-blur-sm sm:p-4"
          onClick={onToggle}
        >
          <section
            aria-label="Project team chat"
            aria-modal="true"
            role="dialog"
            className="relative flex h-[100dvh] w-full flex-col overflow-hidden border border-white/10 bg-[#0d1220] shadow-[0_30px_80px_rgba(76,29,149,0.45)] sm:h-[min(720px,calc(100dvh-2rem))] sm:max-w-md sm:rounded-[28px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-purple-600/20 via-indigo-500/10 to-transparent px-4 py-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-purple-200/75">Project conversation</p>
                <h3 className="mt-1 text-base font-semibold text-white">Team chat</h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400" aria-live="polite">
                  {connectionStatus === 'connected' ? (
                    <><Wifi className="h-3.5 w-3.5 text-emerald-400" /><span className="text-emerald-300">Connected securely</span></>
                  ) : connectionStatus === 'connecting' ? (
                    <><Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" /><span>Connecting…</span></>
                  ) : (
                    <><WifiOff className="h-3.5 w-3.5 text-rose-400" /><span className="text-rose-300">Disconnected</span></>
                  )}
                </div>
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

            <div ref={listRef} aria-live="polite" className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#0b1220]/60 p-4">
              {activeError ? (
                <div role="alert" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100">
                  <p>{activeError}</p>
                  <button
                    type="button"
                    onClick={retryChat}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-amber-200/20 px-2.5 py-1.5 font-medium text-amber-50 transition hover:bg-amber-100/10"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Retry chat
                  </button>
                </div>
              ) : loading && projectMessages.length === 0 ? (
                <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-400"><Loader2 className="h-4 w-4 animate-spin" /> Loading messages…</div>
              ) : projectMessages.length === 0 ? (
                <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10"><MessageCircleMore className="h-5 w-5 text-purple-300" /></div>
                  <p className="text-sm font-medium text-gray-200">Start the conversation</p>
                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-gray-500">Messages are shared with members of this project only.</p>
                </div>
              ) : (
                projectMessages.map((message) => {
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
                              {line.startsWith('http://') || line.startsWith('https://') || line.startsWith('/api/uploads/') ? (
                                <a href={line.startsWith('/api/uploads/') ? `${BACKEND_URL}${line}` : line} target="_blank" rel="noreferrer" className="text-blue-300 underline underline-offset-2">
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
                    placeholder={joinedProject ? 'Write a message…' : 'Connecting to project…'}
                    disabled={!joinedProject || sending || uploading}
                    rows={1}
                    className="max-h-28 min-h-[40px] w-full resize-none bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    disabled={!joinedProject || sending || uploading}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-purple-200 transition hover:bg-white/10"
                    aria-label="Add emoji"
                  >
                    <Smile className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!joinedProject || sending || uploading}
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
                    disabled={!draft.trim() || !joinedProject || sending || uploading}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Send message"
                  >
                    {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizonal className="h-4 w-4" />}
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
