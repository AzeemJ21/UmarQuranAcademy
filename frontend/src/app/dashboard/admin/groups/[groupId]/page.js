'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { connectSocket, getSocket, disconnectSocket } from '@/lib/socket';
import Image from 'next/image';

export default function AdminGroupChat() {
  const { groupId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const chatRef = useRef(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }
    }, 100);
  };
  useEffect(scrollToBottom, [messages]);

  const currentUserId = (() => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload._id || payload.sub || payload.userId;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Fetch messages
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/messages`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sorted);
      });

    // Socket setup
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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const sendMessage = async () => {
    const socket = getSocket();
    const token = localStorage.getItem('token');
    if (!socket || (!input.trim() && !file)) return;

    let fileData = {};

    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/messages/upload`,
        {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await res.json();
      fileData = {
        fileUrl: result.url,
        fileName: result.originalName,
        fileType: result.type,
      };
    }

    socket.emit('sendGroupMessage', {
      groupId,
      text: input.trim(),
      ...fileData,
    });

    setInput('');
    setFile(null);
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderMessageContent = (msg) => {
    if (msg.fileUrl) {
      if (msg.fileType?.startsWith('image/')) {
        return <Image
          src={msg.fileUrl}
          alt={msg.fileName}
          width={200}
          height={200}
          className="max-w-xs rounded" />;
      } else if (msg.fileType?.startsWith('audio/')) {
        return <audio controls src={msg.fileUrl} className="mt-2 w-full" />;
      } else {
        return (
          <a
            href={msg.fileUrl}
            download={msg.fileName}
            className="text-blue-600 underline break-words"
          >
            📎 {msg.fileName}
          </a>
        );
      }
    }
    return <div className="text-sm">{msg.text}</div>;
  };

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-xl shadow">
      <button
        onClick={() => router.back()}
        className="mb-4 inline-flex items-center gap-2 text-sm px-4 py-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition"
      >
        ← Back
      </button>

      <h2 className="text-xl font-bold mb-4 text-center text-black">Group Chat</h2>

      <div ref={chatRef} className="h-[400px] overflow-y-auto bg-gray-100 rounded-lg p-4 space-y-4">
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
                    className={`px-4 py-2 rounded-lg shadow-sm max-w-xs break-words ${isMe ? 'bg-green-600 text-white' : 'bg-white border text-gray-800'
                      }`}
                  >
                    <div className="font-semibold">{msg.sender?.name || 'Unknown'}</div>
                    {renderMessageContent(msg)}
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

      <div className="mt-4 flex gap-2 items-center">
        {/* Attachment Icon */}
        <label className="cursor-pointer text-gray-600 hover:text-green-700">
          <input type="file" onChange={handleFileChange} className="hidden" />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16.88 3.549a5.5 5.5 0 00-7.78 0L3.551 9.1a5.5 5.5 0 007.778 7.778l6.36-6.36a2.5 2.5 0 00-3.535-3.535L9.1 10.465"
            />
          </svg>
        </label>

        {/* Text Input */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border rounded-xl text-black"
        />

        {/* Mic Icon (future voice message feature) */}
        <button
          type="button"
          className="text-gray-600 hover:text-green-700"
          title="Voice message (coming soon)"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 1v14m0 0c2.21 0 4-1.79 4-4h-4m0 4c-2.21 0-4-1.79-4-4h4m0 4v4"
            />
          </svg>
        </button>

        {/* Send Button */}
        <button
          onClick={sendMessage}
          className="bg-green-700 hover:bg-green-800 text-white px-4 py-3 rounded-full"
        >
          ➤
        </button>
      </div>

    </div>
  );
}
