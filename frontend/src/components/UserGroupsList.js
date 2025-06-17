'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function UserGroupsList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('No token found');
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log("Fetched groups:", data); // 🔍 check this in browser console
        if (Array.isArray(data)) {
          setGroups(data);
        } else if (Array.isArray(data.groups)) {
          setGroups(data.groups); // adjust if API response is { groups: [...] }
        } else {
          console.warn("Unexpected group format:", data);
        }
      })
      .catch(err => console.error('Error fetching groups:', err));
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-[#2E4D3B]">My Groups</h2>
      {!Array.isArray(groups) || groups.length === 0 ? (
        <p>No groups assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li
              key={group._id}
              className="border border-gray-300 p-4 rounded-lg flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-semibold">{group.name}</h3>
                <p className="text-sm text-gray-600">Group ID: {group._id}</p>
              </div>
              <Link
                href={`/chat/${group._id}`}
                className="px-4 py-2 bg-[#2E4D3B] text-white rounded hover:bg-[#3e6e4a]"
              >
                Open Chat
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
