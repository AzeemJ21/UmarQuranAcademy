'use client';

import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

export default function OnlineUsers() {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [userNames, setUserNames] = useState([]);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const socket = io(process.env.NEXT_PUBLIC_API_BASE_URL, {
      query: { userId },
    });

    socket.on('online-users', (users) => {
      setOnlineUsers(users); // This is an array of userIds
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');

    const fetchUserNames = async () => {
      if (onlineUsers.length === 0) {
        setUserNames([]);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/online-names`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: onlineUsers }),
        });

        const data = await res.json();
        setUserNames(data); // expecting array of { _id, name }
      } catch (err) {
        console.error('❌ Error fetching names:', err);
      }
    };

    fetchUserNames();
  }, [onlineUsers]);

  return (
    <div className="bg-white shadow-md p-4 rounded-lg max-w-md w-full">
      <h3 className="text-lg font-semibold mb-2">🟢 Online Users ({userNames.length})</h3>
      <ul className="space-y-1 text-sm">
        {userNames.map((user) => (
          <li key={user._id} className="text-gray-700">
            • {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
