import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_BASE_URL } from '../config/devConfig';

// Converts the backend's WebSocket payload shape into the shape
// MessageBubble already expects.
function normalizeMessage(payload) {
  return {
    id: payload.id,
    senderId: payload.senderId,
    senderName: payload.senderName,
    text: payload.text,
    originalLang: payload.originalLanguage,
    translations: payload.translations,
    confidence: payload.confidence,
    timestamp: new Date(payload.timestamp),
  };
}

export function useChatSocket(roomId, userId) {
  const [messages, setMessages] = useState([]);
  const [connectionState, setConnectionState] = useState('connecting'); // connecting | open | closed | error
  const [prevRoomId, setPrevRoomId] = useState(roomId);
  const socketRef = useRef(null);

  // Idiomatic React: Reset state immediately during render if the room changes.
  // This satisfies ESLint AND prevents old room messages from flashing on screen.
  if (roomId !== prevRoomId) {
    setPrevRoomId(roomId);
    setConnectionState('connecting');
    setMessages([]); 
  }

  useEffect(() => {
    if (!roomId || !userId) return;

    const url = `${WS_BASE_URL}/ws/chat/${roomId}/?user_id=${userId}`;
    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.onopen = () => setConnectionState('open');

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setMessages((prev) => [...prev, normalizeMessage(payload)]);
    };

    socket.onerror = () => setConnectionState('error');
    socket.onclose = () => setConnectionState('closed');

    return () => {
      socket.close();
    };
  }, [roomId, userId]);

  const sendMessage = useCallback((text) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ text }));
    }
  }, []);

  return { messages, connectionState, sendMessage };
}

/*import { useEffect, useRef, useState, useCallback } from 'react';
import { WS_BASE_URL } from '../config/devConfig';

// Converts the backend's WebSocket payload shape into the shape
// MessageBubble already expects (Date object for timestamp, same
// translations/confidence maps it's used since Milestone 2's mockData).
function normalizeMessage(payload) {
  return {
    id: payload.id,
    senderId: payload.senderId,
    senderName: payload.senderName,
    text: payload.text,
    originalLang: payload.originalLanguage,
    translations: payload.translations,
    confidence: payload.confidence,
    timestamp: new Date(payload.timestamp),
  };
}

export function useChatSocket(roomId, userId) {
  const [messages, setMessages] = useState([]);
  const [connectionState, setConnectionState] = useState('connecting'); // connecting | open | closed | error
  const socketRef = useRef(null);

  useEffect(() => {
    if (!roomId || !userId) return;

    const url = `${WS_BASE_URL}/ws/chat/${roomId}/?user_id=${userId}`;
    const socket = new WebSocket(url);
    socketRef.current = socket;
    setConnectionState('connecting');

    socket.onopen = () => setConnectionState('open');

    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      setMessages((prev) => [...prev, normalizeMessage(payload)]);
    };

    socket.onerror = () => setConnectionState('error');
    socket.onclose = () => setConnectionState('closed');

    return () => {
      socket.close();
    };
  }, [roomId, userId]);

  const sendMessage = useCallback((text) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ text }));
    }
  }, []);

  return { messages, connectionState, sendMessage };
}*/
