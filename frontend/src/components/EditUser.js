'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  AiOutlineUser,
  AiOutlineMail,
  AiOutlineEye,
  AiOutlineEyeInvisible,
} from 'react-icons/ai';
import { RiLockPasswordLine } from 'react-icons/ri';

export default function EditUserModal({ isOpen, onClose, userId, onUserUpdated }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser({ ...data.user, password: '' }); // Prefill values
        } else {
          alert('User not found');
        }
      })
      .catch(() => alert('Failed to fetch user'))
      .finally(() => setLoading(false));
  }, [isOpen, userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const payload = { ...user };
      if (!payload.password) delete payload.password;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Update failed');

      onUserUpdated?.();
      onClose();
    } catch (err) {
      alert('Error updating user');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md relative">
          <div className="flex justify-center mb-4">
            <Image src="/assets/logo.png" alt="Logo" width={160} height={60} priority />
          </div>

          <h2 className="text-2xl font-bold text-center text-[#2E4D3B]">Edit User</h2>
          <p className="text-center text-sm text-gray-500 mb-4">Update user details</p>

          {loading ? (
            <p className="text-center">Loading...</p>
          ) : user ? (
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <AiOutlineUser className="absolute top-3 left-3 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  value={user.name ?? ''}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  required
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                />
              </div>

              {/* Email */}
              <div className="relative">
                <AiOutlineMail className="absolute top-3 left-3 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  value={user.email ?? ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                  placeholder="Email Address"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <RiLockPasswordLine className="absolute top-3 left-3 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={user.password ?? ''}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  placeholder="Change password (optional)"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-xl text-gray-500 cursor-pointer"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </div>
              </div>

              {/* Role */}
              <select
                name="role"
                value={user.role ?? ''}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
                <option value="super-admin">Super Admin</option>
              </select>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg"
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <p className="text-red-500 text-center">User not found</p>
          )}

          {/* Close button top right */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 text-xl font-bold"
            aria-label="Close Modal"
          >
            &times;
          </button>
        </div>
      </div>
    </>
  );
}
