'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AttendanceForm() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [attendanceType, setAttendanceType] = useState('teacher');
  const [status, setStatus] = useState('Present');
  const [arrivalTime, setArrivalTime] = useState('');
  const [isLate, setIsLate] = useState(false);
  const [lateByMinutes, setLateByMinutes] = useState(0);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');

  // On component mount, load token and userId from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (storedToken) setToken(storedToken);
    if (storedUserId) setUserId(storedUserId);

    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user?role=teacher`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = await res.json();
        setTeachers(Array.isArray(data) ? data : data.users || []);
      } catch (err) {
        console.error('Error fetching teachers:', err);
      }
    };

    fetchTeachers();
  }, []);

  const fetchAssignedStudents = async (teacherId) => {
    if (!teacherId) return setStudents([]);

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

    if (attendanceType === 'teacher' && !selectedTeacher) {
      return setMessage('Please select a teacher.');
    }

    if (attendanceType === 'student' && selectedStudents.length === 0) {
      return setMessage('Please select a student.');
    }

    const payload = { status };

    if (attendanceType === 'teacher') {
      payload.teacher = selectedTeacher;
      if (status === 'Present') {
        payload.arrivalTime = arrivalTime;
        payload.late = isLate;
        payload.lateByMinutes = isLate ? parseInt(lateByMinutes) : 0;
      }
    } else {
      payload.student = selectedStudents[0];
      payload.teacher = selectedTeacher; // link student attendance to teacher
    }

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
    <div className="max-w-lg mx-auto mt-10 bg-white p-8 rounded-2xl shadow-xl text-black">
      <div className="flex justify-center mb-6">
        <Image src="/assets/logo.png" alt="Quram Academy Logo" width={160} height={60} priority />
      </div>

      <h2 className="text-2xl font-bold text-[#2E4D3B] text-center mb-6">
        Mark Attendance
      </h2>

      {message && <p className="mb-4 text-center text-blue-600">{message}</p>}

      {/* Attendance Type */}
      <label className="block mb-1 font-medium text-black">Attendance Type:</label>
      <select
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-black"
        value={attendanceType}
        onChange={(e) => {
          setAttendanceType(e.target.value);
          if (e.target.value === 'student' && selectedTeacher) {
            fetchAssignedStudents(selectedTeacher);
          } else {
            setStudents([]);
          }
        }}
      >
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
      </select>

      {/* Select Teacher */}
      <label className="block mb-1 font-medium text-black">Select Teacher:</label>
      <select
        className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-black"
        value={selectedTeacher}
        onChange={(e) => {
          setSelectedTeacher(e.target.value);
          if (attendanceType === 'student') {
            fetchAssignedStudents(e.target.value);
          }
        }}
      >
        <option value="">-- Select Teacher --</option>
        {teachers.map((t) => (
          <option key={t._id} value={t._id}>
            {t.name}
          </option>
        ))}
      </select>

      {/* Select Student (only for student attendance) */}
      {attendanceType === 'student' && selectedTeacher && (
        <>
          <label className="block mb-1 font-medium text-black">Select Student:</label>
          <select
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-black"
            value={selectedStudents[0] || ''}
            onChange={(e) => setSelectedStudents([e.target.value])}
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Teacher-specific fields */}
      {attendanceType === 'teacher' && status === 'Present' && (
        <>
          <label className="block mb-1 font-medium text-black">Arrival Time:</label>
          <input
            type="time"
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-black"
            value={arrivalTime}
            onChange={(e) => setArrivalTime(e.target.value)}
          />

          <label className="inline-flex items-center mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={isLate}
              onChange={(e) => setIsLate(e.target.checked)}
              className="mr-2"
            />
            <span className="text-black">Mark as Late</span>
          </label>

          {isLate && (
            <>
              <label className="block mb-1 font-medium text-black">Late By Minutes:</label>
              <input
                type="number"
                min="0"
                className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-black"
                value={lateByMinutes}
                onChange={(e) => setLateByMinutes(e.target.value)}
              />
            </>
          )}
        </>
      )}

      {/* Status */}
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
