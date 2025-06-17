'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminGroupList() {
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setGroups)
      .catch((err) => console.error('❌ Failed to fetch groups:', err));
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-6 mt-8 bg-white rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6 text-center">All Chat Groups</h2>

      {groups.length === 0 ? (
        <p className="text-center text-gray-400">No groups found.</p>
      ) : (
        <ul className="space-y-4">
          {groups.map((group) => (
            <li key={group._id} className="flex justify-between items-center p-4 bg-gray-100 rounded-lg">
              <div>
                <div className="text-lg font-semibold">{group.name}</div>
                <div className="text-sm text-gray-500">Teacher: {group.teacher?.name || 'N/A'}</div>
              </div>
              <Link
                href={`/dashboard/super-admin/groups/${group._id}`}
                className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800"
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
