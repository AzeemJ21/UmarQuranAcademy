'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FaTachometerAlt,
  FaUserPlus,
  FaUserCheck,
  FaBookOpen,
  FaClipboardCheck,
  FaCalendarCheck,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '@/components/StatCard';
import RegisterForm from '@/components/RegistrationForm';
import EditUserModal from '@/components/EditUser';
import AssignStudent from '@/components/AssignStudents';
import Image from 'next/image';
import AssignHomeworkForm from '@/components/AssignHomework';
import HomeworkDashboard from '@/components/AssignedHomework';
import AttendanceForm from '@/components/Attendanceform';
import AttendancePage from '@/components/CheckAttendance';
import CreateGroupForm from '@/components/CreateGroup';

export default function SuperAdminDashboard() {
  const router = useRouter();
  const [active, setActive] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [filterRole, setFilterRole] = useState('all');
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUserId, setEditUserId] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getFilteredUsers = () => {
    return users.filter((u) => {
      const matchRole = filterRole === 'all' || u.role === filterRole;
      const matchSearch =
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase());
      return matchRole && matchSearch;
    });
  };

  const totalUsers = users.length;
  const totalAdmins = users.filter((u) => u.role === 'admin').length;
  const totalStudents = users.filter((u) => u.role === 'student').length;
  const totalTeachers = users.filter((u) => u.role === 'teacher').length;

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (res.ok) fetchUsers();
  };

  const openEditModal = (id) => {
    setEditUserId(id);
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditUserId(null);
  };

  const sidebarLinks = [
    { name: 'Dashboard', icon: <FaTachometerAlt color="#4CAF50" />, key: 'dashboard' },  
    { name: 'Register User', icon: <FaUserPlus color="#2196F3" />, key: 'register' },    
    { name: 'Assign Students', icon: <FaUserCheck color="#FF9800" />, key: 'assignStudents' },
    { name: 'Assign Homework', icon: <FaBookOpen color="#9C27B0" />, key: 'assignHomework' }, 
    { name: 'Check Homework', icon: <FaClipboardCheck color="#3F51B5" />, key: 'assignedHomework' },
    { name: 'Mark Attendance', icon: <FaCalendarCheck color="#E91E63" />, key: 'mark-attendance' }, 
    { name: 'Check Attendance', icon: <FaCalendarAlt color="#00BCD4" />, key: 'check-attendance' }, 
    { name: 'Create Group', icon: <FaCog color="#795548" />, key: 'craete-group' },   
    { name: 'Settings', icon: <FaCog color="#795548" />, key: 'settings' },         
    { name: 'Logout', icon: <FaSignOutAlt color="#F44336" />, key: 'logout' },           
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2E4D3B] text-white shadow-xl flex flex-col p-6 h-full">
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
                alt="Quram Academy Logo"
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
                  router.push('/logout');
                } else {
                  setActive(item.key);
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

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-10 bg-gradient-to-br from-[#f0f4f3] to-[#e6ebe9] text-[#2E4D3B]">
        <AnimatePresence mode="wait">
          {active === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-10">
                <h1 className="text-4xl font-bold text-[#2E4D3B] mb-2">Welcome, Super Admin!</h1>
                <p className="text-gray-600">Manage your platform from here.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <StatCard title="Total Users" value={totalUsers.toString()} />
                <StatCard title="Admins" value={totalAdmins.toString()} />
                <StatCard title="Students" value={totalStudents.toString()} />
                <StatCard title="Teachers" value={totalTeachers.toString()} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-gray-700 font-medium">Filter by Role:</label>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="border rounded-md px-3 py-2 text-sm shadow-sm"
                  >
                    <option value="all">All</option>
                    <option value="admin">Admin</option>
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="border px-4 py-2 rounded-md w-full sm:w-64 shadow-sm"
                />
              </div>

              <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-[#2E4D3B] text-white">
                    <tr>
                      <th className="p-4">Name</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getFilteredUsers().map((u) => (
                      <motion.tr
                        key={u._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-100 border-b"
                      >
                        <td className="p-4">{u.name}</td>
                        <td className="p-4">{u.email}</td>
                        <td className="p-4 capitalize">{u.role}</td>
                        <td className="p-4 space-x-2">
                          <button
                            onClick={() => openEditModal(u._id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded shadow"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded shadow"
                          >
                            Delete
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                    {getFilteredUsers().length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <EditUserModal
                isOpen={showEditModal}
                onClose={closeEditModal}
                userId={editUserId}
                onUserUpdated={fetchUsers}
              />
            </motion.div>
          )}

          {active === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="grid md:grid-cols-2 gap-8"
            >
              <RegisterForm />
            </motion.div>
          )}

          {active === 'assignStudents' && (
            <motion.div key="assignStudents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-lg shadow-lg">
              <AssignStudent />
            </motion.div>
          )}

          {active === 'assignHomework' && (
            <motion.div key="assignHomework" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-lg shadow-lg">
              <AssignHomeworkForm />
            </motion.div>
          )}

          {active === 'assignedHomework' && (
            <motion.div key="assignedHomework" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-lg shadow-lg">
              <HomeworkDashboard />
            </motion.div>
          )}

          {active === 'mark-attendance' && (
            <motion.div key="mark-attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-lg shadow-lg">
              <AttendanceForm />
            </motion.div>
          )}

          {active === 'check-attendance' && (
            <motion.div key="check-attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-lg shadow-lg">
              <AttendancePage />
            </motion.div>
          )}

          {active === 'craete-group' && (
           <motion.div key="craete-group" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }} className="bg-white p-6 rounded-lg shadow-lg">
              <CreateGroupForm />
            </motion.div>
          )}

          {active === 'settings' && (
            <motion.p key="settings" className="text-xl text-[#2E4D3B]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              Settings Coming Soon...
            </motion.p>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
