'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { AiOutlineUser, AiOutlineMail, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { RiLockPasswordLine } from 'react-icons/ri';

export default function EditUserModal({ isOpen, onClose, userId, onUserUpdated }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) return;

    setLoading(true);
    setUser(null); // reset user before fetch

    fetch(`http://localhost:3001/user/${userId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser({ ...data, password: '' }); // prefill with empty password
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        alert('Failed to load user data.');
      });
  }, [isOpen, userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const payload = { ...user };
      if (!payload.password) delete payload.password;

      const res = await fetch(`http://localhost:3001/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onUserUpdated();
        onClose();
      } else {
        alert('Update failed!');
      }
    } catch {
      alert('Error while updating');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-opacity-40 backdrop-blur-sm z-40"></div>

      <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-black relative">
          <div className="flex justify-center mb-6">
            <Image src="/assets/logo.png" alt="Quram Academy Logo" width={160} height={60} priority />
          </div>
          <h2 className="text-2xl font-bold text-center text-[#2E4D3B] mb-2">Edit User</h2>
          <p className="text-center text-sm text-gray-500 mb-4">Update user details below</p>

          {loading && <p className="text-center">Loading user data...</p>}

          {!loading && user && (
            <form onSubmit={handleUpdate} className="space-y-4" key={userId}>
              <div className="relative">
                <AiOutlineUser className="absolute top-3 left-3 text-gray-500" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={user.name ?? ''}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                />
              </div>

              <div className="relative">
                <AiOutlineMail className="absolute top-3 left-3 text-gray-500" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={user.email ?? ''}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                />
              </div>

              <div className="relative">
                <RiLockPasswordLine className="absolute top-3 left-3 text-gray-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Change Password (leave blank to keep)"
                  value={user.password ?? ''}
                  onChange={(e) => setUser({ ...user, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-3 right-3 text-2xl text-gray-500 cursor-pointer"
                >
                  {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                </div>
              </div>

              <select
                name="role"
                value={user.role ?? ''}
                onChange={(e) => setUser({ ...user, role: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                required
              >
                <option value="">Select Role</option>
                <option value="student">Student</option>
                <option value="super-admin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
              </select>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {!loading && !user && <p className="text-red-400 text-center">User not found</p>}

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
