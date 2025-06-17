import { io } from 'socket.io-client';

let socket;

export const connectSocket = (token) => {
  if (!socket || !socket.connected) {
    socket = io(`${process.env.NEXT_PUBLIC_API_BASE_URL}`, {
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
