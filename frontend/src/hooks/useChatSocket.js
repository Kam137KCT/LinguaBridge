import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_BASE_URL } from '../config/devConfig';
import { getMessageHistory } from '../api/client';

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

export function useChatSocket(roomId, userId) {
  const [messages, setMessages] = useState([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [connectionState, setConnectionState] = useState('connecting');
  const socketRef = useRef(null);
  const messageMapRef = useRef(new Map()); // id -> message, prevents duplicates

  const rebuildMessagesArray = useCallback(() => {
    const sorted = Array.from(messageMapRef.current.values()).sort(
      (a, b) => a.timestamp - b.timestamp
    );
    setMessages(sorted);
  }, []);

  // Load history whenever the room changes.
  useEffect(() => {
    if (!roomId || !userId) return;
    setHistoryLoaded(false);
    messageMapRef.current = new Map();

    getMessageHistory(roomId, userId)
      .then((data) => {
        for (const raw of data.results) {
          const msg = normalizeMessage(raw);
          messageMapRef.current.set(msg.id, msg);
        }
        rebuildMessagesArray();
        setHistoryLoaded(true);
      })
      .catch(() => {
        setHistoryLoaded(true); // fail open — show empty history rather than block chat entirely
      });
  }, [roomId, userId, rebuildMessagesArray]);

  // Live WebSocket connection — appends on top of whatever history loaded.
  useEffect(() => {
    if (!roomId || !userId) return;

    const url = `${WS_BASE_URL}/ws/chat/${roomId}/?user_id=${userId}`;
    const socket = new WebSocket(url);
    socketRef.current = socket;
    setConnectionState('connecting');

    socket.onopen = () => setConnectionState('open');

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      const msg = normalizeMessage(payload);
      messageMapRef.current.set(msg.id, msg); // overwrites if id already present — no dupes
      rebuildMessagesArray();
    };

    socket.onerror = () => setConnectionState('error');
    socket.onclose = () => setConnectionState('closed');

    return () => socket.close();
  }, [roomId, userId, rebuildMessagesArray]);

  const sendMessage = useCallback((text) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ text }));
    }
  }, []);

  return { messages, historyLoaded, connectionState, sendMessage };
}