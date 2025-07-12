'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaTrash, FaEdit } from 'react-icons/fa';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

function EditModal({ homework, onClose, onSave }) {
  const [form, setForm] = useState({
    sabaq: homework.sabaq || '',
    sabqi: homework.sabqi || '',
    manzil: homework.manzil || '',
    comment: homework.comment || '',
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(homework._id, form);
  };

  return createPortal(
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl relative animate-fadeIn">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-[#2E4D3B]">✏️ Edit Homework</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-[#2E4D3B] text-2xl font-bold focus:outline-none"
          >
            &times;
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {['sabaq', 'sabqi', 'manzil', 'comment'].map((field) => (
            <div key={field}>
              <label className="block font-medium text-gray-700 capitalize mb-1">{field}</label>
              <RichTextEditor value={form[field]} onChange={(val) => handleChange(field, val)} />
            </div>
          ))}

          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white rounded-lg"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}


function HomeworkTable({ teacherId }) {
  const [homeworks, setHomeworks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editHomework, setEditHomework] = useState(null);
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  useEffect(() => {
    if (!teacherId || !token) return;

    const fetchHomeworks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/homework/teacher/${teacherId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error('Failed to fetch homeworks');
        const data = await res.json();
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHomeworks(sorted);
      } catch (error) {
        console.error(error);
        setHomeworks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeworks();
  }, [teacherId]);

  const handleToggle = () => {
    setExpanded(!expanded);
    setVisibleCount(expanded ? 3 : homeworks.length);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this homework?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/homework/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete');
      setHomeworks(homeworks.filter((hw) => hw._id !== id));
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleSaveUpdate = async (id, updatedFields) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/homework/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) throw new Error('Update failed');
      setHomeworks((prev) =>
        prev.map((hw) => (hw._id === id ? { ...hw, ...updatedFields } : hw))
      );
      setEditHomework(null);
    } catch (err) {
      alert('Failed to update homework.');
    }
  };

  const filteredHomeworks = homeworks.filter((hw) =>
    hw.student?.name?.toLowerCase().includes(search.toLowerCase())
  );
  const visibleHomeworks = filteredHomeworks.slice(0, visibleCount);

  return (
    <div className="mt-8 bg-white shadow-md rounded-xl overflow-hidden border">
      <h2 className="text-2xl font-bold text-[#2E4D3B] px-6 py-4 border-b">📘 Assigned Homeworks</h2>

      <div className="p-4">
        <input
          type="text"
          placeholder="🔍 Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] shadow-sm"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2E4D3B] text-white">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Sabaq</th>
              <th className="px-4 py-3">Sabqi</th>
              <th className="px-4 py-3">Manzil</th>
              <th className="px-4 py-3">Comment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleHomeworks.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center text-gray-500 py-6">
                  No homework found.
                </td>
              </tr>
            ) : (
              visibleHomeworks.map((hw) => {
                const formattedDate = new Date(hw.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                });

                return (
                  <tr key={hw._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-[#2E4D3B]">{hw.student?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{formattedDate}</td>
                    <td className="px-4 py-3 prose prose-sm max-w-xs">
                      <div dangerouslySetInnerHTML={{ __html: hw.sabaq }} />
                    </td>
                    <td className="px-4 py-3 prose prose-sm max-w-xs">
                      <div dangerouslySetInnerHTML={{ __html: hw.sabqi }} />
                    </td>
                    <td className="px-4 py-3 prose prose-sm max-w-xs">
                      <div dangerouslySetInnerHTML={{ __html: hw.manzil }} />
                    </td>
                    <td className="px-4 py-3">
                      {hw.comment ? (
                        <details>
                          <summary className="cursor-pointer text-green-600 hover:underline">View</summary>
                          <div dangerouslySetInnerHTML={{ __html: hw.comment }} className="mt-1 text-sm" />
                        </details>
                      ) : (
                        <span className="text-red-500">No comment</span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-3 items-center">
                      <button
                        onClick={() => setEditHomework(hw)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(hw._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {filteredHomeworks.length > 3 && (
          <div className="text-center py-4">
            <button
              onClick={handleToggle}
              className="text-[#2E4D3B] font-semibold hover:underline hover:scale-105 transition"
            >
              {expanded ? '▲ Show Less' : '▼ Show More'}
            </button>
          </div>
        )}
      </div>

      {editHomework && (
        <EditModal
          homework={editHomework}
          onClose={() => setEditHomework(null)}
          onSave={handleSaveUpdate}
        />
      )}
    </div>
  );
}

export default function HomeworkDashboard() {
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setTeacherId(payload?.sub || payload?.userId || payload?._id);
    } catch (e) {
      console.error('Invalid token payload');
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-center mb-6">
        <Image src="/assets/logo.png" alt="Quran Academy Logo" width={160} height={60} priority />
      </div>
      <HomeworkTable teacherId={teacherId} />
    </div>
  );
}
