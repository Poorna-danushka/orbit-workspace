'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import type { Socket } from 'socket.io-client';
import { BACKEND_URL } from '@/lib/config';
import { getErrorMessage } from '@/lib/errors';
import { acquireSocket, releaseSocket } from '@/lib/realtime/socket';
import {
  getProjectChatMessages,
  uploadProjectChatFile,
} from '@/features/chat/services/chatService';
import type { ChatMessage } from '@/features/chat/types';
import ProjectChatView from './ProjectChatView';

interface ProjectChatProps {
  projectId: string;
  currentUserId: string;
  currentUserName?: string;
  open?: boolean;
  onToggle?: () => void;
}

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

const mergeMessages = (current: ChatMessage[], incoming: ChatMessage[]) => {
  const unique = new Map([...current, ...incoming].map((message) => [message.id, message]));
  return [...unique.values()].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
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

    const socket = acquireSocket();
    socketRef.current = socket;
    const onConnect = () => {
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
    };
    const onDisconnect = () => {
      setJoinedProject(false);
      setConnectionStatus('disconnected');
      if (!cancelled) setSocketError('Connection lost. Chat will try to reconnect automatically.');
    };
    const onConnectError = () => {
      setJoinedProject(false);
      setConnectionStatus('error');
      setSocketError(
        'Cannot connect to chat. Check your connection and backend configuration, then retry.',
      );
    };
    const onMessageReceived = (message: ChatMessage) => {
      if (message.projectId !== projectId) return;
      setMessages((prev) => mergeMessages(prev, [message]));
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('messageReceived', onMessageReceived);
    if (socket.connected) onConnect();

    const fetchMessages = async () => {
      try {
        const response = await getProjectChatMessages(projectId);
        if (!cancelled) {
          setChatError(null);
          setMessages((current) =>
            mergeMessages(
              current.filter((message) => message.projectId === projectId),
              response.data || [],
            ),
          );
        }
      } catch (error) {
        if (!cancelled)
          setChatError(getErrorMessage(error, 'Unable to load chat messages right now.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void fetchMessages();

    return () => {
      cancelled = true;
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('messageReceived', onMessageReceived);
      socketRef.current = null;
      releaseSocket();
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

  const emitMessage = (content: string) =>
    new Promise<void>((resolve, reject) => {
      const socket = socketRef.current;
      if (!socket?.connected || !joinedProject) {
        reject(new Error('Chat is not connected to this project.'));
        return;
      }

      socket
        .timeout(10_000)
        .emit(
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
          },
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

      const res = await uploadProjectChatFile(projectId, formData);
      const uploadUrl = res.data?.fileUrl ? `${BACKEND_URL}${res.data.fileUrl}` : '';
      const friendlyText = uploadUrl ? `📎 ${file.name}\n${uploadUrl}` : `📎 ${file.name}`;

      await emitMessage(friendlyText);
    } catch (error) {
      setChatError(getErrorMessage(error, 'File upload failed.'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <ProjectChatView
      open={open}
      onToggle={onToggle}
      connectionStatus={connectionStatus}
      loading={loading}
      projectMessages={projectMessages}
      currentUserId={currentUserId}
      currentUserName={currentUserName}
      activeError={activeError}
      retryChat={retryChat}
      listRef={listRef}
      showEmojiPicker={showEmojiPicker}
      setShowEmojiPicker={setShowEmojiPicker}
      handleEmojiSelect={handleEmojiSelect}
      draft={draft}
      setDraft={setDraft}
      joinedProject={joinedProject}
      sending={sending}
      uploading={uploading}
      fileInputRef={fileInputRef}
      handleFileUpload={handleFileUpload}
      handleSubmit={handleSubmit}
    />
  );
}
