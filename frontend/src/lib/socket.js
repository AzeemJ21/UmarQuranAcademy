import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  if (!socket || !socket.connected) {
    socket = io('http://localhost:3001', {
      auth: { token },
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
