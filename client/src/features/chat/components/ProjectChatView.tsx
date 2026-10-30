import {
  Loader2,
  MessageCircleMore,
  Paperclip,
  RefreshCw,
  SendHorizonal,
  Smile,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useProjectChat } from '@/features/chat/hooks/useProjectChat';
import type { UseProjectChatOptions } from '@/features/chat/hooks/useProjectChat';
import ProjectChatMessages from './ProjectChatMessages';

const emojiOptions = ['😊', '👍', '🎉', '🔥', '💡', '✅', '🚀', '❤️', '👏', '😄'];

type ProjectChatViewProps = Omit<UseProjectChatOptions, 'open'> & { open?: boolean };

export default function ProjectChatView({
  projectId,
  currentUserId,
  currentUserName,
  open = false,
  onToggle,
}: ProjectChatViewProps) {
  const model = useProjectChat({
    projectId,
    currentUserId,
    currentUserName,
    open,
    onToggle,
  });
  const {
    connectionStatus,
    loading,
    projectMessages,
    currentUserId: chatUserId,
    currentUserName: chatUserName,
    activeError,
    retryChat,
    listRef,
    showEmojiPicker,
    setShowEmojiPicker,
    handleEmojiSelect,
    draft,
    setDraft,
    joinedProject,
    sending,
    uploading,
    fileInputRef,
    handleFileUpload,
    handleSubmit,
  } = model;
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
                <p className="text-[11px] uppercase tracking-[0.22em] text-purple-200/75">
                  Project conversation
                </p>
                <h3 className="mt-1 text-base font-semibold text-white">Team chat</h3>
                <div
                  className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400"
                  aria-live="polite"
                >
                  {connectionStatus === 'connected' ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Connected securely</span>
                    </>
                  ) : connectionStatus === 'connecting' ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-300" />
                      <span>Connecting…</span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3.5 w-3.5 text-rose-400" />
                      <span className="text-rose-300">Disconnected</span>
                    </>
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

            <div
              ref={listRef}
              aria-live="polite"
              className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-[#0b1220]/60 p-4"
            >
              {activeError ? (
                <div
                  role="alert"
                  className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-5 text-amber-100"
                >
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
                <div className="flex items-center justify-center gap-2 py-8 text-xs text-gray-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
                </div>
              ) : projectMessages.length === 0 ? (
                <div className="flex h-full min-h-48 flex-col items-center justify-center text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-purple-400/20 bg-purple-400/10">
                    <MessageCircleMore className="h-5 w-5 text-purple-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-200">Start the conversation</p>
                  <p className="mt-1 max-w-[220px] text-xs leading-5 text-gray-500">
                    Messages are shared with members of this project only.
                  </p>
                </div>
              ) : (
                <ProjectChatMessages
                  messages={projectMessages}
                  currentUserId={chatUserId}
                  currentUserName={chatUserName}
                />
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
                    {sending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SendHorizonal className="h-4 w-4" />
                    )}
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
