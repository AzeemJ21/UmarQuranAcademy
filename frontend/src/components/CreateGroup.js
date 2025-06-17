'use client';

import { useEffect, useState } from 'react';

export default function CreateGroupForm() {
  const [groupType, setGroupType] = useState('');
  const [groupName, setGroupName] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    if (!token) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        const allUsers = Array.isArray(data.data || data.users || data) ? (data.data || data.users || data) : [];
        setUsers(allUsers);
      });
  }, [token]);

  const handleCreateGroup = async () => {
    if (!groupName || selectedMemberIds.length < 2) {
      alert('❌ Please select at least 2 members.');
      return;
    }

    const payload = {
      name: groupName,
      memberIds: selectedMemberIds,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.ok) {
        alert('✅ Group created successfully!');
        setGroupName('');
        setSelectedMemberIds([]);
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (err) {
      console.error('Error creating group:', err);
    }
  };

  const getFilteredUsers = () => {
    let filtered = [];

    if (groupType === 'teacher-student') {
      filtered = users.filter(u => u.role === 'teacher' || u.role === 'student');
    } else if (groupType === 'teacher-teacher') {
      filtered = users.filter(u => u.role === 'teacher');
    } else if (groupType === 'admin-admin') {
      filtered = users.filter(u => u.role === 'admin');
    } else if (groupType === 'admin-student') {
      filtered = users.filter(u => u.role === 'admin' || u.role === 'student');
    }

    return filtered.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-[#2E4D3B] text-center mb-6">Create Group</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Select Group Type</label>
        <select
          className="w-full p-2 border border-gray-300 rounded-lg"
          value={groupType}
          onChange={(e) => {
            setGroupType(e.target.value);
            setSelectedMemberIds([]);
            setSearchTerm('');
          }}
        >
          <option value="">-- Select Type --</option>
          <option value="teacher-student">Teacher ➝ Student</option>
          <option value="teacher-teacher">Teacher ➝ Teacher</option>
          <option value="admin-admin">Admin ➝ Admin</option>
          <option value="admin-student">Admin ➝ Student</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Group Name</label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {groupType && (
        <div className="mb-6">
          <label className="block mb-2 font-medium">Search Members</label>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full mb-3 p-2 border border-gray-300 rounded-md"
          />

          <label className="block mb-1 font-medium">Select Members</label>
          <div className="grid grid-cols-2 gap-2 max-h-52 overflow-y-auto">
            {getFilteredUsers().map(user => (
              <label key={user._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={user._id}
                  checked={selectedMemberIds.includes(user._id)}
                  onChange={(e) => {
                    const id = e.target.value;
                    setSelectedMemberIds(prev =>
                      e.target.checked ? [...prev, id] : prev.filter(i => i !== id)
                    );
                  }}
                />
                <span>{user.name} ({user.role})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleCreateGroup}
        className="w-full bg-[#2E4D3B] text-white p-2 rounded-lg font-semibold hover:bg-[#3c6145]"
      >
        Create Group
      </button>
    </div>
  );
}
