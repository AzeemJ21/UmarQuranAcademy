'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AttendanceForm() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [status, setStatus] = useState('Present');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [teacherId, setTeacherId] = useState('');

  // Load token and teacherId from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId'); // this is the teacher

    if (storedToken) setToken(storedToken);
    if (storedUserId) {
      setTeacherId(storedUserId);
      fetchAssignedStudents(storedToken, storedUserId);
    }
  }, []);

  const fetchAssignedStudents = async (token, teacherId) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/teacher/${teacherId}/students`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      const studentList = Array.isArray(data)
        ? data
        : Array.isArray(data.students)
        ? data.students
        : [];

      setStudents(studentList);
    } catch (err) {
      console.error('Failed to fetch assigned students', err);
      setStudents([]);
    }
  };

  const handleSubmit = async () => {
    setMessage('');

    if (!selectedStudent) {
      return setMessage('Please select a student.');
    }

    const payload = {
      status,
      student: selectedStudent,
      teacher: teacherId, // link student attendance to the teacher
    };

    try {
      setIsLoading(true);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      setIsLoading(false);

      if (!res.ok) return setMessage(result.message || 'Failed to mark attendance.');

      setMessage('✅ Attendance marked successfully!');
    } catch (err) {
      setIsLoading(false);
      console.error('Error:', err);
      setMessage('An unexpected error occurred.');
    }
  };

  return (
    <div className="mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl text-black">
      <div className="flex justify-center mb-6">
        <Image src="/assets/logo.png" alt="Quran Academy Logo" width={160} height={60} priority />
      </div>

      <h2 className="text-2xl font-bold text-[#2E4D3B] text-center mb-6">
        Mark Student Attendance
      </h2>

      {message && <p className="mb-4 text-center text-blue-600">{message}</p>}

      {/* Select Student */}
      <label className="block mb-1 font-medium text-black">Select Student:</label>
      <select
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-black"
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
      >
        <option value="">-- Select Student --</option>
        {students.map((s) => (
          <option key={s._id} value={s._id}>
            {s.name}
          </option>
        ))}
      </select>

      {/* Attendance Status */}
      <label className="block mb-1 font-medium text-black">Status:</label>
      <select
        className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-black"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="Present">Present</option>
        <option value="Absent">Absent</option>
        <option value="Late">Late</option>
        <option value="Excused">Excused</option>
      </select>

      <button
        onClick={handleSubmit}
        disabled={isLoading}
        className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg flex justify-center items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
        )}
        {isLoading ? 'Marking...' : 'Mark Attendance'}
      </button>
    </div>
  );
}
