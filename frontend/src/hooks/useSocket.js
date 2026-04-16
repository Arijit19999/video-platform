import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const SOCKET_URL = import.meta.env.VITE_API_URL || '';

export const useSocket = (handlers) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);

  handlersRef.current = handlers;

  useEffect(() => {
    if (!token) return;

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const socket = socketRef.current;

    socket.on('processing:start', (data) => handlersRef.current?.onStart?.(data));
    socket.on('processing:progress', (data) => handlersRef.current?.onProgress?.(data));
    socket.on('processing:complete', (data) => handlersRef.current?.onComplete?.(data));
    socket.on('processing:error', (data) => handlersRef.current?.onError?.(data));

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  return socketRef;
};
