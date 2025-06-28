'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminGroupList() {
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.groups || [];
        setGroups(list);
        setFilteredGroups(list);
      })
      .catch((err) => console.error('❌ Failed to fetch groups:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const query = search.toLowerCase();
    const filtered = groups.filter(
      (g) =>
        g.name?.toLowerCase().includes(query) ||
        g.teacher?.name?.toLowerCase().includes(query)
    );
    setFilteredGroups(filtered);
  }, [search, groups]);

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 mt-6 bg-white rounded-xl shadow">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center text-[#2E4D3B]">All Chat Groups</h2>

      {/* 🔍 Search Input */}
      <input
        type="text"
        placeholder="Search by group or teacher name..."
        className="w-full mb-4 p-2 border border-gray-300 rounded-md"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-center text-gray-500">Loading groups...</p>
      ) : filteredGroups.length === 0 ? (
        <p className="text-center text-gray-400">No groups found.</p>
      ) : (
        <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {filteredGroups.map((group) => (
            <li
              key={group._id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 bg-gray-100 rounded-lg"
            >
              <div className="w-full sm:w-auto">
                <div className="text-base sm:text-lg font-semibold text-gray-800">{group.name}</div>
                {/* <div className="text-sm text-gray-500">
                  Teacher: {group.teacher?.name || 'N/A'}
                </div>
                <div className="text-xs text-gray-400 break-all">ID: {group._id}</div> */}
              </div>

              <Link
                href={`/chat/${group._id}`}
                className="w-full sm:w-auto text-center bg-[#2E4D3B] text-white px-4 py-2 rounded-lg hover:bg-[#3e6e4a] text-sm"
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
