import type { ComfyUiOutputImageRef, ComfyUiWebSocketMessage } from './types';

export interface ProgressSocketHandlers {
  onProgress: (percent: number) => void;
  onCompleted: (images: ComfyUiOutputImageRef[]) => void;
  onError: (message: string) => void;
}

export function buildWebSocketUrl(baseUrl: string, clientId: string): string {
  const url = new URL(`${baseUrl}/ws`, window.location.origin);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('clientId', clientId);
  return url.toString();
}

/** Returns an unsubscribe function that closes the socket. */
export function watchComfyUiExecution(
  baseUrl: string,
  clientId: string,
  promptId: string,
  handlers: ProgressSocketHandlers,
): () => void {
  const socket = new WebSocket(buildWebSocketUrl(baseUrl, clientId));

  socket.onmessage = (event) => {
    if (typeof event.data !== 'string') {
      return;
    }

    let message: ComfyUiWebSocketMessage;

    try {
      message = JSON.parse(event.data) as ComfyUiWebSocketMessage;
    } catch {
      return;
    }

    if (message.type === 'progress') {
      if (message.data.prompt_id !== undefined && message.data.prompt_id !== promptId) {
        return;
      }

      const percent = message.data.max > 0 ? Math.round((message.data.value / message.data.max) * 100) : 0;
      handlers.onProgress(percent);
      return;
    }

    if (message.type === 'executed' && message.data.prompt_id === promptId) {
      const images = message.data.output.images;

      if (images !== undefined && images.length > 0) {
        handlers.onCompleted(images);
      }

      return;
    }

    if (message.type === 'execution_error' && message.data.prompt_id === promptId) {
      handlers.onError(message.data.exception_message ?? 'ComfyUI reported an execution error.');
    }
  };

  socket.onerror = () => {
    handlers.onError('Lost connection to the ComfyUI websocket.');
  };

  return () => {
    socket.close();
  };
}
