'use client';

import { useEffect, useState } from 'react';
import { initiateSocket, getSocket } from '../lib/socket';

export default function ChatBox({ groupId, token, currentUser }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    initiateSocket(token);
    const socket = getSocket();

    socket.emit('joinGroup', groupId);

    socket.on('groupMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('error', (err) => {
      alert(err);
    });

    return () => {
      socket.emit('leaveGroup', groupId);
    };
  }, [groupId, token]);

  const handleSend = () => {
    const socket = getSocket();
    if (message.trim() !== '') {
      socket.emit('sendGroupMessage', {
        groupId,
        text: message,
      });
      setMessage('');
    }
  };

  return (
    <div className="border p-4 max-w-md mx-auto mt-5">
      <div className="mb-4 h-64 overflow-y-auto border p-2 bg-gray-100">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-2 ${msg.sender._id === currentUser ? 'text-right' : 'text-left'}`}>
            <strong>{msg.sender.name}</strong>: {msg.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={handleSend} className="bg-blue-500 text-white px-4 py-2">
          Send
        </button>
      </div>
    </div>
  );
}
