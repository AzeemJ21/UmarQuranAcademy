'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaTachometerAlt,
  FaClipboardCheck,
  FaCalendarCheck,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import TeacherDashboardAttendance from '@/components/TeacherDashboardAttendance';
import AssignHomeworkForm from '@/components/TeacherHomeWorkForm';
import UserGroupsList from '@/components/UserGroupsList';
import HomeworkDashboard from '@/components/TeacherAssignedHomework';
import useAuthRedirect from '@/hooks/useAuthRedirect';

export default function TeacherDashboard() {
   useAuthRedirect();
  const router = useRouter();
  const [active, setActive] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState('assigned-students');
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    router.push('/login');
  };

  const sidebarLinks = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, key: 'dashboard' },
    { name: 'Assign Homework', icon: <FaClipboardCheck />, key: 'homework' },
    { name: 'Assigned Homework', icon: <FaClipboardCheck />, key: 'homeworktable' },
    { name: 'Attendance', icon: <FaCalendarCheck />, key: 'attendance' },
    { name: 'Group Chats', icon: <FaCalendarCheck />, key: 'group' },
    { name: 'Logout', icon: <FaSignOutAlt />, key: 'logout' },
  ];

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Hamburger */}
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
              <Image
                src="/assets/logo.png"
                alt="Logo"
                width={200}
                height={80}
                priority
              />
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-10 bg-white text-[#2E4D3B]">
        <AnimatePresence mode="wait">
          {active === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-3xl font-bold mb-4">Welcome, Teacher!</h1>
              <h2 className="text-3xl font-extrabold text-[#2E4D3B] mb-6 tracking-wide">
                Assigned Students
              </h2>

              {loading ? (
                <p className="text-gray-500">Loading students...</p>
              ) : students.length === 0 ? (
                <p className="text-gray-500">No students assigned.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm sm:text-base border-collapse">
                    <thead>
                      <tr className="bg-[#2E4D3B] text-white uppercase text-sm tracking-wider">
                        <th className="px-6 py-4 text-left rounded-tl-xl">Name</th>
                        <th className="px-6 py-4 text-left rounded-tr-xl">Email</th>
                      </tr>
                    </thead>
                    <tbody className="text-[#2E4D3B]">
                      {students.map((student, index) => (
                        <tr
                          key={student._id}
                          className={`transition duration-200 ${index % 2 === 0 ? 'bg-[#f9f9f9]' : 'bg-white'
                            } hover:bg-[#eef3f0]`}
                        >
                          <td className="px-6 py-4 font-medium border-t border-gray-200">
                            {student.name}
                          </td>
                          <td className="px-6 py-4 border-t border-gray-200">
                            {student.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}

          {active === 'homework' && (
            <motion.div
              key="homework"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <AssignHomeworkForm />
            </motion.div>
          )}

          {active === 'homeworktable' && (
            <motion.div
              key="homeworktable"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <HomeworkDashboard/>
            </motion.div>
          )}

          {active === 'group' && (
            <motion.div
              key="group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-xl shadow-md p-8"
            >
              <UserGroupsList />
            </motion.div>
          )}



          {active === 'attendance' && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-lg shadow-lg p-6"
            >
              <TeacherDashboardAttendance />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}





