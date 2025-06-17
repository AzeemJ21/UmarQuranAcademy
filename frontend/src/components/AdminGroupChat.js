'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { connectSocket, getSocket, disconnectSocket } from '@/lib/socket';

export default function AdminGroupChat() {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`http://localhost:3001/groups/${groupId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sorted);
      })
      .catch((err) => console.error('❌ Failed to fetch messages:', err));

    const socket = connectSocket(token);
    socket.emit('joinGroup', { groupId });

    socket.on('groupMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.emit('leaveGroup', groupId);
      disconnectSocket();
    };
  }, [groupId]);

  const sendMessage = () => {
    const socket = getSocket();
    if (socket && input.trim()) {
      socket.emit('sendGroupMessage', { groupId, text: input });
      setInput('');
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const currentUserId = (() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || payload.sub;
    } catch {
      return null;
    }
  })();

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Group Chat</h2>

      <div
        ref={chatRef}
        className="h-[400px] overflow-y-auto bg-gray-100 rounded-lg p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <p className="text-center text-gray-400 italic">No messages yet.</p>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender?._id === currentUserId;
            return (
              <div
                key={msg._id}
                className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {msg.sender?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div
                    className={`px-4 py-2 rounded-lg shadow-sm ${
                      isMe ? 'bg-green-600 text-white' : 'bg-white border text-gray-800'
                    }`}
                  >
                    <div className="font-semibold">{msg.sender?.name || 'Unknown'}</div>
                    <div className="text-sm">{msg.text}</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {formatTime(msg.createdAt)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border rounded-xl"
        />
        <button
          onClick={sendMessage}
          className="bg-green-700 hover:bg-green-800 text-white px-5 py-3 rounded-xl"
        >
          ➤
        </button>
      </div>
    </div>
  );
}
