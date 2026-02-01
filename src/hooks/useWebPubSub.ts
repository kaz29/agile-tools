'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClientMessage, ServerMessage } from '@/types';

interface UseWebPubSubOptions {
  roomId: string;
  userId: string;
  nickname: string;
  onMessage: (message: ServerMessage) => void;
  enabled?: boolean;
}

export function useWebPubSub({
  roomId,
  userId,
  nickname,
  onMessage,
  enabled = true,
}: UseWebPubSubOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = useCallback(async () => {
    if (!enabled || !userId) return;

    try {
      const res = await fetch(`/api/negotiate?roomId=${roomId}&userId=${userId}`);
      if (!res.ok) throw new Error('Failed to negotiate');
      const { url } = await res.json();

      const ws = new WebSocket(url, 'json.webpubsub.azure.v1');
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[WS] Connected');
        setIsConnected(true);
        // 明示的にグループに参加
        if (ws.readyState === WebSocket.OPEN) {
          const joinGroupMsg = {
            type: 'joinGroup',
            group: roomId,
            ackId: 1,
          };
          console.log('[WS] Sending joinGroup:', joinGroupMsg);
          ws.send(JSON.stringify(joinGroupMsg));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS] Received:', data);
          console.log('[WS] Message type:', data.type, 'from:', data.from);

          // joinGroupのackを受け取ったら、joinイベントをサーバーに送信
          if (data.type === 'ack' && data.ackId === 1) {
            console.log('[WS] joinGroup ack received, success:', data.success);
            if (data.success && ws.readyState === WebSocket.OPEN) {
              const joinEvent = {
                type: 'event',
                event: 'poker-event',
                dataType: 'json',
                data: { type: 'join', userId, nickname, roomId },
              };
              console.log('[WS] Sending join event to server:', joinEvent);
              ws.send(JSON.stringify(joinEvent));
            }
          }

          // Web PubSubプロトコルメッセージの処理
          if (data.type === 'message') {
            if (data.from === 'group') {
              console.log('[WS] Group message received:', data.data);
              onMessage(data.data);
            } else if (data.from === 'server') {
              console.log('[WS] Server message received:', data.data);
              onMessage(data.data);
            }
          } else if (data.type !== 'ack' && data.type !== 'system') {
            console.log('[WS] Message did not match message criteria');
          }
        } catch (e) {
          console.error('Failed to parse message:', e);
        }
      };

      ws.onerror = () => {
        setError(new Error('WebSocket error'));
      };

      ws.onclose = () => {
        setIsConnected(false);
      };
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    }
  }, [roomId, userId, nickname, onMessage, enabled]);

  const send = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'event',
        event: 'poker-event',
        dataType: 'json',
        data: { ...message, roomId },
      }));
    }
  }, [roomId]);

  const disconnect = useCallback(() => {
    if (userId && wsRef.current?.readyState === WebSocket.OPEN) {
      send({ type: 'leave', userId });
    }
    wsRef.current?.close();
  }, [send, userId]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { isConnected, error, send };
}
