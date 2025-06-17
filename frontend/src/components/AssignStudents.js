'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const AssignStudent = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Fetch teachers
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user?role=teacher`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTeachers(data);
        } else if (data.users && Array.isArray(data.users)) {
          setTeachers(data.users);
        } else {
          setTeachers([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching teachers:', err);
      });

    // Fetch students
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user?role=student`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setStudents(data);
        } else if (data.users && Array.isArray(data.users)) {
          setStudents(data.users);
        } else {
          setStudents([]);
        }
      })
      .catch((err) => {
        console.error('Error fetching students:', err);
      });
  }, []);

  const handleAssign = async () => {
    const token = localStorage.getItem('token');

    if (!selectedTeacher || selectedStudents.length === 0) {
      alert('Please select a teacher and at least one student.');
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/assign-students/${selectedTeacher}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ studentIds: selectedStudents }),
      }
    );

    const result = await res.json();

    if (res.ok) {
      alert('✅ Students assigned successfully!');
      setSelectedTeacher('');
      setSelectedStudents([]);
    } else {
      alert('❌ Error: ' + result.message);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white px-4 py-6 sm:p-8 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/logo.png"
            alt="Quran Academy Logo"
            width={160}
            height={60}
            priority
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-[#2E4D3B] text-center mb-2">
          Assign Students to Teacher
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Select a teacher and assign students
        </p>

        <div className="mb-4">
          <label className="block mb-1 font-medium text-gray-700 text-sm sm:text-base">
            Select Teacher
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B] text-sm"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">-- Select Teacher --</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700 text-sm sm:text-base">
            Select Students
          </label>
          <div className="max-h-52 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
            {students.map((student) => (
              <div key={student._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={student._id}
                  value={student._id}
                  checked={selectedStudents.includes(student._id)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.checked) {
                      setSelectedStudents((prev) => [...prev, value]);
                    } else {
                      setSelectedStudents((prev) =>
                        prev.filter((id) => id !== value)
                      );
                    }
                  }}
                  className="mr-2 accent-[#2E4D3B]"
                />
                <label
                  htmlFor={student._id}
                  className="text-gray-800 text-sm sm:text-base"
                >
                  {student.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleAssign}
          className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg transition text-sm sm:text-base"
        >
          Assign
        </button>
      </div>
    </div>
  );

};

export default AssignStudent;
