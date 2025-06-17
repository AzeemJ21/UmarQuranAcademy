'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

function HomeworkTable({ teacherId }) {
  const [homeworks, setHomeworks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!teacherId || !token) return;

    const fetchHomeworks = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/homework/teacher/${teacherId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error('Failed to fetch homeworks');
        const data = await res.json();
        setHomeworks(data);
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

  const filteredHomeworks = homeworks.filter((hw) =>
    hw.student?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const visibleHomeworks = filteredHomeworks.slice(0, visibleCount);

  if (!teacherId) {
    return (
      <div className="text-center text-gray-500 mt-4">
        No teacher ID found.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center text-gray-500 py-6">Loading assigned homeworks...</div>
    );
  }

  return (
    <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <h2 className="text-xl font-semibold text-[#2E4D3B] px-6 py-4 border-b">
        📘 Assigned Homeworks
      </h2>

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
          <thead className="bg-[#2E4D3B] text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Sabaq</th>
              <th className="px-4 py-3">Sabqi</th>
              <th className="px-4 py-3">Manzil</th>
              <th className="px-4 py-3">Comment</th>
            </tr>
          </thead>
          <tbody>
            {visibleHomeworks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6">
                  No homework assigned yet.
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
                  <tr key={hw._id} className="hover:bg-gray-50 transition border-b">
                    <td className="px-4 py-3 font-semibold text-[#2E4D3B]">
                      {hw.student?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formattedDate}</td>
                    <td className="px-4 py-3 whitespace-pre-wrap">
                      <div dangerouslySetInnerHTML={{ __html: hw.sabaq }} />
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap">
                      <div dangerouslySetInnerHTML={{ __html: hw.sabqi }} />
                    </td>
                    <td className="px-4 py-3 whitespace-pre-wrap">
                      <div dangerouslySetInnerHTML={{ __html: hw.manzil }} />
                    </td>
                    <td className="px-4 py-3">
                      {hw.comment ? (
                        <details>
                          <summary className="cursor-pointer text-green-600 hover:underline">
                            View
                          </summary>
                          <div
                            className="mt-2 text-sm text-gray-700"
                            dangerouslySetInnerHTML={{ __html: hw.comment }}
                          />
                        </details>
                      ) : (
                        <span className="text-red-500">No comment</span>
                      )}
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
    </div>
  );
}

export default function HomeworkDashboard() {
  const [teacherId, setTeacherId] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = JSON.parse(atob(token.split('.')[1]));
    const idFromToken = payload?.sub || payload?.userId || payload?._id;
    setTeacherId(idFromToken);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-center mb-6">
        <Image
          src="/assets/logo.png"
          alt="Quram Academy Logo"
          width={160}
          height={60}
          priority
        />
      </div>

      <HomeworkTable teacherId={teacherId} />
    </div>
  );
}
