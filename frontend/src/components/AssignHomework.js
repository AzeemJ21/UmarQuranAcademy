'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false });

export default function AssignHomeworkForm() {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);

  const [homework, setHomework] = useState({
    teacher: '',
    student: [],
    date: '',
    sabaq: '',
    sabqi: '',
    manzil: '',
    comment: '',
  });

  // ✅ On mount: prefill teacher from localStorage (if logged-in teacher)
  useEffect(() => {
    const id = localStorage.getItem('userId');
    if (id) {
      setHomework((prev) => ({ ...prev, teacher: id }));
    }
  }, []);

  // ✅ Fetch all teachers
  useEffect(() => {
    const token = localStorage.getItem('token');
    const fetchTeachers = async () => {
      try {
        const res = await fetch('http://localhost:3001/user', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        const onlyTeachers = data.filter((u) => u.role === 'teacher');
        setTeachers(onlyTeachers);
      } catch (err) {
        console.error('Error fetching teachers:', err);
      }
    };
    fetchTeachers();
  }, []);

  // ✅ Fetch students when teacher is selected
  useEffect(() => {
    const token = localStorage.getItem('token');
    const teacherId = homework.teacher;

    if (!teacherId) return;

    const fetchStudents = async () => {
      try {
        const res = await fetch(`http://localhost:3001/user/students/${teacherId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        console.log('Student fetch response:', data);

        if (Array.isArray(data)) {
          setStudents(data);
        } else if (Array.isArray(data.students)) {
          setStudents(data.students);
        } else {
          console.error('❌ Expected an array of students but got:', data);
          setStudents([]);
        }
      } catch (err) {
        console.error('Error fetching students:', err);
        setStudents([]);
      }
    };

    // ✅ Reset student selection before fetching new list
    setHomework((prev) => ({ ...prev, student: '' }));
    fetchStudents();
  }, [homework.teacher]);

  // ✅ Input change handler
  const handleChange = (e) => {
    setHomework({ ...homework, [e.target.name]: e.target.value });
  };

  // ✅ Submit form
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
        teacher: homework.teacher,
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
        Choose a teacher and assign Quran homework to students
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Teacher Dropdown */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Select Teacher</label>
          <select
            name="teacher"
            value={homework.teacher}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>


        {/* Student Checkboxes */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">Select Students</label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-2">
            {students.map((s) => (
              <label key={s._id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={s._id}
                  checked={homework.student.includes(s._id)}
                  onChange={(e) => {
                    const { checked, value } = e.target;
                    setHomework((prev) => ({
                      ...prev,
                      student: checked
                        ? [...prev.student, value]
                        : prev.student.filter((id) => id !== value),
                    }));
                  }}
                />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
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

        {/* Rich Text Fields */}
        {['sabaq', 'sabqi', 'manzil', 'comment'].map((field) => (
          <div key={field}>
            <label className="block mb-1 font-medium capitalize text-gray-700">
              {field}
            </label>
            <RichTextEditor
              value={homework[field]}
              onChange={(val) => setHomework((prev) => ({ ...prev, [field]: val }))}
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
