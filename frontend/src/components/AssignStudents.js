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
    fetch(`http://localhost:3001/user?role=teacher`, {
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
    fetch(`http://localhost:3001/user?role=student`, {
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
      `http://localhost:3001/user/assign-students/${selectedTeacher}`,
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
        Assign Students to Teacher
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Select a teacher and assign students
      </p>

      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Select Teacher</label>
        <select
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
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
        <label className="block mb-2 font-medium text-gray-700">Select Students</label>
        <div className="max-h-52 overflow-y-auto border border-gray-300 rounded-lg p-4">
          {students.map((student) => (
            <div key={student._id} className="flex items-center mb-2">
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
                    setSelectedStudents((prev) => prev.filter((id) => id !== value));
                  }
                }}
                className="mr-2"
              />
              <label htmlFor={student._id} className="text-gray-800">
                {student.name}
              </label>
            </div>
          ))}
        </div>
      </div>


      {/* <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Select Students</label>
        <select
          multiple
          value={selectedStudents}
          onChange={(e) =>
            setSelectedStudents(
              Array.from(e.target.selectedOptions, (opt) => opt.value)
            )
          }
          className="w-full h-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
        >
          {students.map((student) => (
            <option key={student._id} value={student._id}>
              {student.name}
            </option>
          ))}
        </select>
      </div> */}

      <button
        onClick={handleAssign}
        className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg transition"
      >
        Assign
      </button>
    </div>
  );
};

export default AssignStudent;
