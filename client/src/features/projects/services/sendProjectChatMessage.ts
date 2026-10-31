import type { Socket } from 'socket.io-client';

export function sendProjectChatMessage(
  socket: Socket | null,
  projectId: string,
  joinedProject: boolean,
  content: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
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
}
