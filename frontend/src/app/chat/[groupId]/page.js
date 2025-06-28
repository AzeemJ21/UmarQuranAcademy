'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { connectSocket, getSocket, disconnectSocket } from '@/lib/socket';
import Image from 'next/image';

function MessageContent({ msg }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setIsPlaying(true);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const current = audioRef.current;
    if (!current) return;
    const handleEnded = () => setIsPlaying(false);
    current.addEventListener('ended', handleEnded);
    return () => current.removeEventListener('ended', handleEnded);
  }, []);

  if (msg.fileUrl && msg.fileType?.startsWith('image/')) {
    return <Image src={msg.fileUrl} alt={msg.fileName} width={200} height={200} className="rounded shadow" />;
  }

  if (msg.fileUrl && msg.fileType?.startsWith('audio/')) {
    return (
      <div
        onClick={togglePlay}
        className="cursor-pointer flex items-center gap-3 px-3 py-2 bg-green-100 rounded-md hover:bg-green-200"
      >
        <button className="bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">
          {isPlaying ? '⏸' : '▶️'}
        </button>
        <span className="text-sm text-gray-800 font-medium">Voice Message</span>
        <audio ref={audioRef} src={msg.fileUrl} className="hidden" />
      </div>
    );
  }

  if (msg.fileUrl) {
    return (
      <a href={msg.fileUrl} download={msg.fileName} className="text-blue-600 underline break-words">
        📎 {msg.fileName}
      </a>
    );
  }

  return <div className="text-sm">{msg.text}</div>;
}

export default function AdminGroupChat() {
  const { groupId } = useParams();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [file, setFile] = useState(null);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
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

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/messages`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setMessages(sorted);
      });

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
    setAudioBlob(null);
  };

  const handleStartRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    let chunks = [];

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const audio = new Blob(chunks, { type: 'audio/webm' });
      setAudioBlob(audio);
      setFile(null);
    };

    recorder.start();
    setMediaRecorder(recorder);
    setRecording(true);
  };

  const handleStopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const sendMessage = async () => {
    const socket = getSocket();
    const token = localStorage.getItem('token');
    if (!socket || (!input.trim() && !file && !audioBlob)) return;

    let fileData = {};
    const payload = file || audioBlob;

    try {
      setUploading(true);
      if (payload) {
        const formData = new FormData();
        formData.append('file', payload);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups/${groupId}/messages/upload`, {
          method: 'POST',
          body: formData,
          headers: { Authorization: `Bearer ${token}` },
        });

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
      setAudioBlob(null);
    } catch (err) {
      console.error('Send failed', err);
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (iso) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-2xl mx-auto p-6 mt-8 bg-white rounded-xl shadow">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm px-4 py-2 bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition"
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
              <div key={msg._id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                {!isMe && (
                  <div className="bg-green-700 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                    {msg.sender?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div className={`px-4 py-2 rounded-lg shadow-sm max-w-xs break-words ${isMe ? 'bg-green-600 text-white' : 'bg-white border text-gray-800'}`}>
                    <div className="font-semibold">{msg.sender?.name || 'Unknown'}</div>
                    <MessageContent msg={msg} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">{formatTime(msg.createdAt)}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 space-y-3">
        {file && file.type.startsWith('image/') && (
          <div className="relative w-fit">
            <Image src={URL.createObjectURL(file)} alt="Preview" width={180} height={180} className="rounded-lg shadow border" />
            <button onClick={() => setFile(null)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full px-2 py-1 text-xs">✕</button>
          </div>
        )}

        {audioBlob && (
          <div className="relative bg-gray-100 border rounded-lg p-3 flex items-center gap-3">
            <audio controls src={URL.createObjectURL(audioBlob)} />
            <button onClick={() => setAudioBlob(null)} className="bg-red-600 text-white rounded-full px-2 py-1 text-xs">✕</button>
          </div>
        )}

        {uploading && (
          <div className="text-yellow-700 font-medium flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-yellow-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Uploading...
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-2 items-center">
        <label className="cursor-pointer text-gray-600 hover:text-green-700">
          <input type="file" onChange={handleFileChange} className="hidden" />
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.88 3.55a5.5 5.5 0 00-7.78 0L3.55 9.1a5.5 5.5 0 007.78 7.78l6.36-6.36a2.5 2.5 0 00-3.54-3.54L9.1 10.46" />
          </svg>
        </label>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-4 py-3 border rounded-xl text-black"
        />

        <button
          onClick={recording ? handleStopRecording : handleStartRecording}
          className={`text-white px-3 py-2 rounded-full ${recording ? 'bg-red-600' : 'bg-green-700 hover:bg-green-800'}`}
        >
          🎙
        </button>

        <button
          onClick={sendMessage}
          disabled={uploading}
          className={`px-4 py-3 rounded-full text-white ${uploading ? 'bg-gray-400' : 'bg-green-700 hover:bg-green-800'}`}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
