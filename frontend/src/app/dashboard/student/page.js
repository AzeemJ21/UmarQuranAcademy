'use client';
import { useEffect, useState } from 'react';
import { FaClipboardList, FaCalendarCheck, FaSignOutAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import UserGroupsList from '@/components/UserGroupsList';

export default function StudentDashboard() {
  const router = useRouter();
  const [active, setActive] = useState('homework');
  const [homework, setHomework] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get studentId and token from localStorage (assuming they are set on login)
  const studentId =
    typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    setLoading(true);
    setError('');
    // If "My Homework" view is active, fetch homework; if "My Attendance" is active, fetch attendance.
    if (active === 'homework' && studentId && token) {
      const fetchHomework = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/homework/student/${studentId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to fetch homework');
          setHomework(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchHomework();
    } else if (active === 'attendance' && studentId && token) {
      const fetchAttendance = async () => {
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance/student/${studentId}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          const data = await res.json();
          if (!res.ok) throw new Error(data.message || 'Failed to fetch attendance');
          setAttendance(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchAttendance();
    } else {
      setLoading(false);
    }
  }, [active, studentId, token]);

  const sidebarLinks = [
    { name: 'My Homework', key: 'homework', icon: <FaClipboardList /> },
    { name: 'My Attendance', key: 'attendance', icon: <FaCalendarCheck /> },
    { name: 'Group Chat', key: 'chat', icon: <FaClipboardList /> },
    {
      name: 'Logout',
      key: 'logout',
      icon: <FaSignOutAlt />,
      action: () => router.push('/logout'),
    },
  ];

  const renderContent = () => {
    if (active === 'homework') {
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-[#2E4D3B]">My Homework</h1>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              {homework.map((task) => (
                <div key={task._id} className="bg-white p-4 rounded shadow">
                  <p className="font-semibold">{task.sabaq}</p>
                  <p className="text-sm text-gray-600">{task.sabqi}</p>
                </div>
              ))}
              {homework.length === 0 && (
                <p className="text-gray-500 text-center">No homework assigned.</p>
              )}
            </div>
          )}
        </div>
      );
    } else if (active === 'attendance') {
      return (
        <div>
          <h1 className="text-3xl font-bold mb-6 text-[#2E4D3B]">My Attendance</h1>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <div className="space-y-4">
              {attendance.map((record) => (
                <div key={record._id} className="bg-white p-4 rounded shadow">
                  <p>
                    <strong>Date:</strong>{' '}
                    {new Date(record.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Status:</strong> {record.status}
                  </p>
                </div>
              ))}
              {attendance.length === 0 && (
                <p className="text-gray-500 text-center">
                  No attendance records found.
                </p>
              )}
            </div>
          )}
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
        <h2 className="text-2xl font-bold mb-8">Student Portal</h2>
        <nav className="flex flex-col space-y-4">
          {sidebarLinks.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActive(item.key);
                if (item.action) item.action();
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
