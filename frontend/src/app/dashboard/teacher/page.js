'use client';
import { useEffect, useState } from 'react';
import { FaChalkboardTeacher, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import TeacherDashboardAttendance from '@/components/TeacherDashboardAttendance';
import TeacherAttendanceForm from '@/components/TeacherHomeWorkForm';
import { useRouter } from 'next/navigation';
import UserGroupsList from '@/components/UserGroupsList';

export default function TeacherDashboard() {
  const router = useRouter();
  const [active, setActive] = useState('assigned-students');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      const token = localStorage.getItem('token');
      const teacherId = localStorage.getItem('userId');

      if (!token || !teacherId) {
        setError('Login required');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/teacher/${teacherId}/students`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to fetch');
        }

        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const sidebarLinks = [
    { name: 'Assigned Students', key: 'assigned-students', icon: <FaChalkboardTeacher /> },
    { name: 'Attendance Sheet', key: 'attendance', icon: <FaClipboardList /> },
    { name: 'Assign Homework', key: 'form', icon: <FaClipboardList /> },
    { name: 'Group Chat', key: 'chat', icon: <FaClipboardList /> },
    { name: 'Logout', key: 'logout', icon: <FaSignOutAlt />, action: () => router.push('/logout') },
  ];

  const renderContent = () => {
    if (active === 'assigned-students') {
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-[#2E4D3B]">Assigned Students</h1>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="grid gap-4">
              {students.map((student) => (
                <div key={student._id} className="bg-white p-4 rounded shadow">
                  <p className="font-semibold">{student.name}</p>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              ))}
              {students.length === 0 && (
                <p className="text-gray-500 text-center">No assigned students found.</p>
              )}
            </div>
          )}
        </div>
      );
    } else if (active === 'attendance') {
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-[#2E4D3B]">Attendance Records</h1>
          <TeacherDashboardAttendance />
        </div>
      );
    } else if (active === 'form') {
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-[#2E4D3B]">Mark Attendance</h1>
          <TeacherAttendanceForm />
        </div>
      );
    } else if (active === 'chat') {
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-[#2E4D3B]">Chat</h1>
          <UserGroupsList/>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#f0f4f3] to-[#e6ebe9] text-gray-800">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2E4D3B] text-white shadow-lg flex flex-col p-6 sticky top-0 min-h-screen">
        <h2 className="text-2xl font-bold mb-8">Quran Academy</h2>
        <nav className="flex flex-col space-y-4">
          {sidebarLinks.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActive(item.key);
                item.action && item.action();
              }}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${
                active === item.key
                  ? 'bg-white text-[#2E4D3B] font-semibold'
                  : 'hover:bg-[#3b624e] hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">{renderContent()}</main>
    </div>
  );
}
