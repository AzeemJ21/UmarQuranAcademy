'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaClipboardList,
  FaCalendarCheck,
  FaSignOutAlt,
  FaComments,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import UserGroupsList from '@/components/UserGroupsList';
import useAuthRedirect from '@/hooks/useAuthRedirect';
 


export default function StudentDashboard() {
   useAuthRedirect();
  const router = useRouter();
  const [active, setActive] = useState('homework');
  const [homework, setHomework] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const studentId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    setLoading(true);
    setError('');

    const fetchData = async () => {
      try {
        let url = '';
        if (active === 'homework') {
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/homework/student/${studentId}`;
        } else if (active === 'attendance') {
          url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance/student/${studentId}`;
        }

        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch data');

        if (active === 'homework') setHomework(data);
        else if (active === 'attendance') setAttendance(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (studentId && token && (active === 'homework' || active === 'attendance')) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [active, studentId, token]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const sidebarLinks = [
    { name: 'My Homework', icon: <FaClipboardList />, key: 'homework' },
    { name: 'My Attendance', icon: <FaCalendarCheck />, key: 'attendance' },
    { name: 'Group Chat', icon: <FaComments />, key: 'chat' },
    { name: 'Logout', icon: <FaSignOutAlt />, key: 'logout' },
  ];

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Hamburger for mobile */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 left-4 z-50 md:hidden text-white bg-[#2E4D3B] p-2 rounded-md shadow"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-40 bg-[#2E4D3B] text-white shadow-xl flex flex-col p-6 overflow-y-auto transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:relative md:translate-x-0 md:w-68
        `}
      >
        <motion.h2
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-extrabold mb-10 tracking-wide"
        >
          <div className="flex justify-center mb-6">
            <div className="hover:scale-110 transition-transform duration-300 ease-in-out filter drop-shadow-white animate-fadeIn">
              <Image src="/assets/logo.png" alt="Logo" width={200} height={80} priority />
            </div>
          </div>
        </motion.h2>

        <nav className="flex flex-col space-y-4">
          {sidebarLinks.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => {
                if (item.key === 'logout') {
                  handleLogout();
                } else {
                  setActive(item.key);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200 ${active === item.key
                ? 'bg-white text-[#2E4D3B] font-semibold shadow'
                : 'hover:bg-[#3b624e] hover:text-white'
                }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </motion.button>
          ))}
        </nav>
      </aside>

      {/* Backdrop */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black bg-opacity-40 z-30 md:hidden"
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-10 bg-white text-[#2E4D3B]">
        <AnimatePresence mode="wait">
         
        {active === 'homework' && (
                <motion.div
                  key="homework"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                >
                  <h1 className="text-3xl font-bold mb-6 text-[#2E4D3B]">My Homework</h1>

                  {loading ? (
                    <p>Loading...</p>
                  ) : error ? (
                    <p className="text-red-500">{error}</p>
                  ) : homework.length === 0 ? (
                    <p className="text-gray-500">No homework assigned.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border rounded shadow">
                        <thead className="bg-[#2E4D3B] text-white">
                          <tr>
                            
                            <th className="text-left py-3 px-4">📘 Sabaq</th>
                            <th className="text-left py-3 px-4">📗 Sabqi</th>
                            <th className="text-left py-3 px-4">📕 Manzil</th>
                            <th className="text-left py-3 px-4">📝 Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {homework.map((task) => {
                            let formattedDate = 'Invalid Date';
                            if (task.createdAt && !isNaN(Date.parse(task.createdAt))) {
                              formattedDate = new Date(task.createdAt).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              });
                            }

                            return (
                              <tr key={task._id} className="border-t hover:bg-gray-50">
                                
                                <td className="py-3 px-4 prose prose-sm max-w-xs">
                                  <div dangerouslySetInnerHTML={{ __html: task.sabaq }} />
                                </td>
                                <td className="py-3 px-4 prose prose-sm max-w-xs">
                                  <div dangerouslySetInnerHTML={{ __html: task.sabqi }} />
                                </td>
                                <td className="py-3 px-4 prose prose-sm max-w-xs">
                                  {task.manzil ? (
                                    <div dangerouslySetInnerHTML={{ __html: task.manzil }} />
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="py-3 px-4 prose prose-sm max-w-xs">
                                  {task.comment ? (
                                    <div dangerouslySetInnerHTML={{ __html: task.comment }} />
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}
              
              
              {active === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl font-bold mb-6">My Attendance</h1>
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p className="text-red-500">{error}</p>
              ) : attendance.length === 0 ? (
                <p className="text-gray-500">No attendance records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
                    <thead className="bg-[#2E4D3B] text-white">
                      <tr>
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-700">
                      {attendance.map((record, index) => (
                        <tr key={record._id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-4">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 font-semibold">{record.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {active === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h1 className="text-3xl font-bold mb-6">Group Chat</h1>
              <UserGroupsList />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}
