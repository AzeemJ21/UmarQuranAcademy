'use client';

import { useEffect, useState } from 'react';

export default function TeacherDashboardAttendance() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState({});

  useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/teacher/${userId}/students`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) throw new Error('Failed to fetch students');
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        alert('Error loading students: ' + err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStudents();
  }, []);

  const markAttendance = async (studentId, status) => {
    try {
      const token = localStorage.getItem('token');
      const teacherId = localStorage.getItem('userId');

      setAttendanceStatus((prev) => ({
        ...prev,
        [studentId]: status,
      }));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          student: studentId,
          teacher: teacherId,
          status: status.charAt(0).toUpperCase() + status.slice(1),
        }),
      });

      if (!res.ok) throw new Error('Failed to mark attendance');
    } catch (err) {
      alert('Error: ' + err.message);
      setAttendanceStatus((prev) => ({ ...prev, [studentId]: undefined }));
    }
  };

  if (loading) return <p>Loading students...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold mb-6 text-[#2E4D3B]">Attendance Dashboard</h2>

      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#2E4D3B] text-white">
            <th className="p-3 text-left">Student Name</th>
            <th className="p-3 text-center">Present</th>
            <th className="p-3 text-center">Absent</th>
            <th className="p-3 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {students.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center py-6 text-gray-500">
                No students found.
              </td>
            </tr>
          )}

          {students.map((student) => (
            <tr key={student._id} className="border-b hover:bg-gray-50">
              <td className="p-3">{student.name}</td>
              <td className="p-3 text-center">
                <button
                  className={`px-4 py-1 rounded ${
                    attendanceStatus[student._id] === 'present'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => markAttendance(student._id, 'present')}
                >
                  Present
                </button>
              </td>
              <td className="p-3 text-center">
                <button
                  className={`px-4 py-1 rounded ${
                    attendanceStatus[student._id] === 'absent'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                  onClick={() => markAttendance(student._id, 'absent')}
                >
                  Absent
                </button>
              </td>
              <td className="p-3 text-center capitalize text-sm text-gray-700">
                {attendanceStatus[student._id] || 'Not Marked'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}













































// 'use client';

// import { useEffect, useState } from 'react';

// export default function TeacherDashboardAttendance() {
//   const [students, setStudents] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [attendanceStatus, setAttendanceStatus] = useState({});
//   const [isLocked, setIsLocked] = useState(false);

//   // Check and unlock attendance after midnight
//   const checkUnlockTime = () => {
//     const lastMarkedDate = localStorage.getItem('attendanceDate');
//     const today = new Date().toISOString().split('T')[0];

//     if (lastMarkedDate !== today) {
//       setAttendanceStatus({});
//       localStorage.removeItem('attendanceDate');
//       setIsLocked(false);
//     } else {
//       setIsLocked(true);
//     }
//   };

//   useEffect(() => {
//     checkUnlockTime();

//     async function fetchStudents() {
//       setLoading(true);
//       try {
//         const userId = localStorage.getItem('userId');
//         const token = localStorage.getItem('token');

//         const res = await fetch(
//           `${process.env.NEXT_PUBLIC_API_BASE_URL}/user/teacher/${userId}/students`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         if (!res.ok) throw new Error('Failed to fetch students');
//         const data = await res.json();
//         setStudents(data);
//       } catch (err) {
//         alert('Error loading students: ' + err.message);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchStudents();
//   }, []);

//   const markAttendance = async (studentId, status) => {
//     try {
//       const token = localStorage.getItem('token');
//       const teacherId = localStorage.getItem('userId');

//       // Optimistic UI update
//       const updatedStatus = {
//         ...attendanceStatus,
//         [studentId]: status,
//       };

//       setAttendanceStatus(updatedStatus);

//       const res = await fetch(`http://localhost:3001/attendance`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({
//           student: studentId,
//           teacher: teacherId,
//           status: status.charAt(0).toUpperCase() + status.slice(1),
//         }),
//       });

//       if (!res.ok) throw new Error('Failed to mark attendance');

//       // ✅ Only lock if ALL students are marked
//       const allMarked =
//         students.length > 0 &&
//         students.every((s) => updatedStatus[s._id] === 'present' || updatedStatus[s._id] === 'absent');

//       if (allMarked) {
//         const today = new Date().toISOString().split('T')[0];
//         localStorage.setItem('attendanceDate', today);
//         setIsLocked(true);
//       }
//     } catch (err) {
//       alert('Error: ' + err.message);
//       setAttendanceStatus((prev) => ({ ...prev, [studentId]: undefined }));
//     }
//   };

//   if (loading) return <p>Loading students...</p>;

//   return (
//     <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-lg">
//       <h2 className="text-3xl font-bold mb-6 text-[#2E4D3B]">Attendance Dashboard</h2>

//       <table className="w-full border-collapse">
//         <thead>
//           <tr className="bg-[#2E4D3B] text-white">
//             <th className="p-3 text-left">Student Name</th>
//             <th className="p-3 text-center">Present</th>
//             <th className="p-3 text-center">Absent</th>
//             <th className="p-3 text-center">Status</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.length === 0 && (
//             <tr>
//               <td colSpan="4" className="text-center py-6 text-gray-500">
//                 No students found.
//               </td>
//             </tr>
//           )}

//           {students.map((student) => (
//             <tr key={student._id} className="border-b hover:bg-gray-50">
//               <td className="p-3">{student.name}</td>
//               <td className="p-3 text-center">
//                 <button
//                   className={`px-4 py-1 rounded ${
//                     attendanceStatus[student._id] === 'present'
//                       ? 'bg-green-600 text-white'
//                       : 'bg-gray-200 text-gray-700'
//                   }`}
//                   disabled={isLocked || attendanceStatus[student._id]}
//                   onClick={() => markAttendance(student._id, 'present')}
//                 >
//                   Present
//                 </button>
//               </td>
//               <td className="p-3 text-center">
//                 <button
//                   className={`px-4 py-1 rounded ${
//                     attendanceStatus[student._id] === 'absent'
//                       ? 'bg-red-600 text-white'
//                       : 'bg-gray-200 text-gray-700'
//                   }`}
//                   disabled={isLocked || attendanceStatus[student._id]}
//                   onClick={() => markAttendance(student._id, 'absent')}
//                 >
//                   Absent
//                 </button>
//               </td>
//               <td className="p-3 text-center capitalize text-sm text-gray-700">
//                 {attendanceStatus[student._id] || 'Not Marked'}
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {isLocked && (
//         <p className="mt-6 text-center text-yellow-600 font-semibold">
//           Attendance has been locked for today. It will reset after midnight.
//         </p>
//       )}
//     </div>
//   );
// }
