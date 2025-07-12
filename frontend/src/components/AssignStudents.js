'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

const AssignStudent = () => {
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [alreadyAssigned, setAlreadyAssigned] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  // ✅ Fetch teachers and students once
  useEffect(() => {
    if (!token) return;

    const fetchData = async () => {
      try {
        const [teacherRes, studentRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user?role=teacher`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user?role=student`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const teacherData = await teacherRes.json();
        const studentData = await studentRes.json();

        setTeachers(teacherData.users || teacherData || []);
        setStudents(studentData.users || studentData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, [token]);

  // ✅ When teacher changes, fetch already assigned students
  useEffect(() => {
    if (!selectedTeacher || !token) return;

    const fetchAssigned = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${selectedTeacher}/students`,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        const assignedIds = Array.isArray(data) ? data.map((s) => s._id) : [];

        setAlreadyAssigned(assignedIds);
        setSelectedStudents([]); // clear fresh selections
      } catch (err) {
        console.error('Error fetching assigned:', err);
      }
    };

    fetchAssigned();
  }, [selectedTeacher]);

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = async () => {
    if (!selectedTeacher || selectedStudents.length === 0) {
      alert('Please select a teacher and at least one new student.');
      return;
    }

    const allStudentIds = [...new Set([...alreadyAssigned, ...selectedStudents])];

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/assign-students/${selectedTeacher}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ studentIds: allStudentIds }),
        }
      );

      const result = await res.json();

      if (res.ok) {
        alert('✅ Students assigned successfully!');
        setAlreadyAssigned(allStudentIds);
        setSelectedStudents([]);
      } else {
        alert('❌ Error: ' + result.message);
      }
    } catch (err) {
      console.error('Error assigning students:', err);
    }
  };

  const filteredStudents = students.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white px-4 py-6 sm:p-8 rounded-xl shadow-lg">
      <div className="flex justify-center mb-6">
        <Image src="/assets/logo.png" alt="Logo" width={160} height={60} priority />
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-[#2E4D3B] text-center mb-2">
        Assign Students to Teacher
      </h2>
      <p className="text-center text-sm text-gray-500 mb-6">
        Already assigned students are locked. You can assign new students multiple times.
      </p>

      {/* Teacher Dropdown */}
      <div className="mb-4">
        <label className="block mb-1 font-medium text-gray-700">Select Teacher</label>
        <select
          value={selectedTeacher}
          onChange={(e) => setSelectedTeacher(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
        >
          <option value="">-- Select Teacher --</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search & Student Checkboxes */}
      <div className="mb-6">
        <label className="block mb-1 font-medium text-gray-700">Select Students</label>
        <input
          type="text"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-3 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
        />

        <div className="max-h-52 overflow-y-auto border border-gray-300 rounded-lg p-4 space-y-2">
          {filteredStudents.map((student) => {
            const isAssigned = alreadyAssigned.includes(student._id);
            const isSelected = selectedStudents.includes(student._id);

            return (
              <div key={student._id} className="flex items-center">
                <input
                  type="checkbox"
                  id={student._id}
                  value={student._id}
                  checked={isAssigned || isSelected}
                  disabled={isAssigned}
                  onChange={() => handleCheckboxChange(student._id)}
                  className="mr-2 accent-[#2E4D3B]"
                />
                <label
                  htmlFor={student._id}
                  className={`text-sm ${isAssigned ? 'text-gray-400 line-through' : 'text-gray-800'}`}
                >
                  {student.name} {isAssigned && <span>(already assigned)</span>}
                </label>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={handleAssign}
        className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg transition"
      >
        Assign Students
      </button>
    </div>
  );
};

export default AssignStudent;
