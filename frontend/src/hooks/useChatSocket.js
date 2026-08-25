import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_BASE_URL } from '../config/wsConfig';
import { getMessageHistory, getAccessToken } from '../api/client';

function normalizeMessage(payload) {
  return {
    id: payload.id,
    senderId: payload.senderId,
    senderName: payload.senderName,
    text: payload.text,
    originalLang: payload.originalLanguage,
    translations: payload.translations,
    confidence: payload.confidence,
    timestamp: new Date(payload.created_at ?? payload.timestamp),
  };
}

export function useChatSocket(roomId) {
  const [messages, setMessages] = useState([]);
  const [historyLoadedRoomId, setHistoryLoadedRoomId] = useState(null);
  const [connectionState, setConnectionState] = useState('connecting');
  const socketRef = useRef(null);
  const messageMapRef = useRef(new Map());

  const rebuildMessagesArray = useCallback(() => {
    const sorted = Array.from(messageMapRef.current.values()).sort((a, b) => a.timestamp - b.timestamp);
    setMessages(sorted);
  }, []);

  useEffect(() => {
    if (!roomId) return;
    messageMapRef.current = new Map();

    // Use queueMicrotask to defer state update out of the immediate synchronous effect execution tick
    queueMicrotask(() => {
      setHistoryLoadedRoomId(null);
    });

    getMessageHistory(roomId)
      .then((data) => {
        if (data?.results) {
          for (const raw of data.results) {
            const msg = normalizeMessage(raw);
            messageMapRef.current.set(msg.id, msg);
          }
          rebuildMessagesArray();
        }
        setHistoryLoadedRoomId(roomId);
      })
      .catch(() => setHistoryLoadedRoomId(roomId));
  }, [roomId, rebuildMessagesArray]);

  useEffect(() => {
    if (!roomId) return;

    const token = getAccessToken() || '';
    const wsProtocol = WS_BASE_URL.startsWith('https') ? 'wss://' : WS_BASE_URL.startsWith('http') ? 'ws://' : '';
    const cleanBase = WS_BASE_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const url = `${wsProtocol || 'ws://'}${cleanBase}/ws/chat/${roomId}/?token=${token}`;
    
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => setConnectionState('open');
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const msg = normalizeMessage(payload);
        messageMapRef.current.set(msg.id, msg);
        rebuildMessagesArray();
      } catch (err) {
        console.error('Failed to parse incoming WS message', err);
      }
    };
    socket.onerror = () => setConnectionState('error');
    socket.onclose = () => setConnectionState('closed');

    return () => {
      if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
        socket.close();
      }
    };
  }, [roomId, rebuildMessagesArray]);

  const sendMessage = useCallback((text) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ text }));
    }
  }, []);

  return {
    messages,
    historyLoaded: historyLoadedRoomId === roomId,
    connectionState,
    sendMessage,
  };
}