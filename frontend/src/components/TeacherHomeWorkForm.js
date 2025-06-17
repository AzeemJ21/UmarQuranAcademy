'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function AssignHomeworkForm() {
  const [students, setStudents] = useState([]);
  const [homework, setHomework] = useState({
    teacher: '',   // teacher id from localStorage
    student: '',
    date: '',
    sabaq: '',
    sabqi: '',
    manzil: '',
    comment: '',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const teacherId = localStorage.getItem('userId'); // assuming teacherId stored here after login

  console.log('Token:', token);
  console.log('TeacherId:', teacherId);

    if (!token || !teacherId) {
      alert('Login required or invalid teacher data.');
      return;
    }

    setHomework((prev) => ({ ...prev, teacher: teacherId }));

    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `http://localhost:3001/user/teacher/${teacherId}/students`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (Array.isArray(data)) {
          setStudents(data);
        } else {
          setStudents([]);
          console.error('Expected array but got:', data);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudents([]);
      }
    };

    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setHomework({ ...homework, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token');

    const res = await fetch('http://localhost:3001/homework', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(homework),
    });

    if (res.ok) {
      alert('✅ Homework assigned successfully!');
      setHomework({
        teacher: homework.teacher, // keep teacher ID intact
        student: '',
        date: '',
        sabaq: '',
        sabqi: '',
        manzil: '',
        comment: '',
      });
      setStudents([]);
    } else {
      alert('❌ Failed to assign homework');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
      <div className="flex justify-center mb-6">
        <Image
          src="/assets/logo.png"
          alt="Quram Academy Logo"
          width={160}
          height={60}
          priority
        />
      </div>

      <h2 className="text-2xl font-bold text-[#2E4D3B] text-center mb-2">
        Assign Homework
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Assign Quran homework to your students
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Student Dropdown */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Select Student</label>
          <select
            name="student"
            value={homework.student}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
          >
            <option value="">-- Select Student --</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            value={homework.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
          />
        </div>

        {/* Textareas */}
        {['sabaq', 'sabqi', 'manzil', 'comment'].map((field) => (
          <div key={field}>
            <label className="block mb-1 font-medium capitalize text-gray-700">
              {field}
            </label>
            <textarea
              name={field}
              placeholder={`Enter ${field}`}
              value={homework[field]}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg transition"
        >
          Assign Homework
        </button>
      </form>
    </div>
  );
}
