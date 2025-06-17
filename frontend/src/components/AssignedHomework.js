'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

function HomeworkTable({ teacherId }) {
  const [homeworks, setHomeworks] = useState([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!teacherId) return;

    const fetchHomeworks = async () => {
      try {
        const res = await fetch(`http://localhost:3001/homework/teacher/${teacherId}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error('Failed to fetch homeworks');
        const data = await res.json();
        setHomeworks(data);
      } catch (error) {
        console.error(error);
        setHomeworks([]);
      }
    };

    fetchHomeworks();
  }, [teacherId]);

  const handleToggle = () => {
    setExpanded(!expanded);
    setVisibleCount(expanded ? 3 : homeworks.length);
  };

  const filteredHomeworks = homeworks.filter((hw) =>
    hw.student?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const visibleHomeworks = filteredHomeworks.slice(0, visibleCount);

  if (!teacherId) {
    return (
      <div className="text-center text-gray-500 mt-4">
        Please select a teacher to view assigned homeworks.
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
      <h2 className="text-xl font-semibold text-[#2E4D3B] px-6 py-4 border-b">
        📘 Assigned Homeworks
      </h2>

      <div className="p-4">
        <input
          type="text"
          placeholder="🔍 Search by student name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-4 w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#2E4D3B] text-white sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3">Student</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Sabaq</th>
              <th className="px-4 py-3">Sabqi</th>
              <th className="px-4 py-3">Manzil</th>
              <th className="px-4 py-3">Comment</th>
            </tr>
          </thead>
          <tbody>
            {visibleHomeworks.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-gray-500 py-6">
                  No homework assigned yet.
                </td>
              </tr>
            ) : (
              visibleHomeworks.map((hw) => (
                <tr
                  key={hw._id}
                  className="hover:bg-gray-50 transition border-b"
                >
                  <td className="px-4 py-2">{hw.student?.name || 'Unknown'}</td>
                  <td className="px-4 py-2">{new Date(hw.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: hw.sabaq }}></td>
                  <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: hw.sabqi }}></td>
                  <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: hw.manzil }}></td>
                  <td className="px-4 py-2">
                    {hw.comment ? (
                      <span
                        className="text-green-600 hover:underline cursor-pointer"
                        title="Click to view full comment"
                        dangerouslySetInnerHTML={{
                          __html:
                            hw.comment.length > 80
                              ? hw.comment.slice(0, 80) + '...'
                              : hw.comment,
                        }}
                      ></span>
                    ) : (
                      <span className="text-red-500">No comment</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filteredHomeworks.length > 3 && (
          <div className="text-center py-4">
            <button
              onClick={handleToggle}
              className="text-[#2E4D3B] font-medium hover:underline hover:scale-105 transition-all"
            >
              {expanded ? 'Show Less' : 'Show More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function HomeworkDashboard() {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

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
      } catch (error) {
        console.error('Failed to fetch teachers', error);
      }
    };
    fetchTeachers();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-center mb-6">
        <Image
          src="/assets/logo.png"
          alt="Quram Academy Logo"
          width={160}
          height={60}
          priority
        />
      </div>

      <div className="mb-6">
        <label className="block mb-2 font-medium text-gray-700">Select Teacher</label>
        <select
          value={selectedTeacherId}
          onChange={(e) => setSelectedTeacherId(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
        >
          <option value="">-- Select Teacher --</option>
          {teachers.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <HomeworkTable teacherId={selectedTeacherId} />
    </div>
  );
}











// 'use client';
// import Image from 'next/image';
// import { useEffect, useState } from 'react';

// function HomeworkTable({ teacherId }) {
//   const [homeworks, setHomeworks] = useState([]);
//   const [visibleCount, setVisibleCount] = useState(3); // 👈 Show first 3 by default
//   const [expanded, setExpanded] = useState(false);

//   useEffect(() => {
//     const token = localStorage.getItem('token');
//     if (!teacherId) return;

//     const fetchHomeworks = async () => {
//       try {
//         const res = await fetch(`http://localhost:3001/homework/teacher/${teacherId}`, {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         if (!res.ok) throw new Error('Failed to fetch homeworks');
//         const data = await res.json();
//         setHomeworks(data);
//       } catch (error) {
//         console.error(error);
//         setHomeworks([]);
//       }
//     };

//     fetchHomeworks();
//   }, [teacherId]);

//   if (!teacherId) {
//     return (
//       <div className="text-center text-gray-500 mt-4">
//         Please select a teacher to view assigned homeworks.
//       </div>
//     );
//   }

//   const handleToggle = () => {
//     setExpanded(!expanded);
//     setVisibleCount(expanded ? 3 : homeworks.length);
//   };

//   const visibleHomeworks = homeworks.slice(0, visibleCount);

//   return (
//     <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
//       <h2 className="text-xl font-semibold text-[#2E4D3B] px-6 py-4 border-b">Assigned Homeworks</h2>
//       <div className="overflow-x-auto">
//         <table className="w-full text-sm text-left">
//           <thead className="bg-[#2E4D3B] text-white">
//             <tr>
//               <th className="px-4 py-3">Student</th>
//               <th className="px-4 py-3">Date</th>
//               <th className="px-4 py-3">Sabaq</th>
//               <th className="px-4 py-3">Sabqi</th>
//               <th className="px-4 py-3">Manzil</th>
//               <th className="px-4 py-3">Comment</th>
//             </tr>
//           </thead>
//           <tbody>
//             {visibleHomeworks.length === 0 ? (
//               <tr>
//                 <td colSpan="6" className="text-center text-gray-500 py-6">
//                   No homework assigned yet.
//                 </td>
//               </tr>
//             ) : (
//               visibleHomeworks.map((hw) => (
//                 <tr
//                   key={hw._id}
//                   className="hover:bg-gray-50 transition border-b"
//                 >
//                   <td className="px-4 py-2">{hw.student?.name || 'Unknown'}</td>
//                   <td className="px-4 py-2">{new Date(hw.date).toLocaleDateString()}</td>
//                   <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: hw.sabaq }}></td>
//                   <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: hw.sabqi }}></td>
//                   <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: hw.manzil }}></td>
//                   <td className="px-4 py-2" dangerouslySetInnerHTML={{ __html: hw.comment }}></td>

//                 </tr>
//               ))
//             )}
//           </tbody>
//         </table>

//         {homeworks.length > 3 && (
//           <div className="text-center py-4">
//             <button
//               onClick={handleToggle}
//               className="text-[#2E4D3B] font-medium hover:underline"
//             >
//               {expanded ? 'Show Less' : 'Show More'}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }



// export default function HomeworkDashboard() {
//   const [teachers, setTeachers] = useState([]);
//   const [selectedTeacherId, setSelectedTeacherId] = useState('');

//   useEffect(() => {
//     const token = localStorage.getItem('token');

//     const fetchTeachers = async () => {
//       try {
//         const res = await fetch('http://localhost:3001/user', {
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${token}`, // ✅ Add this line
//           },

//         });
//         const data = await res.json();
//         const onlyTeachers = data.filter((u) => u.role === 'teacher');
//         setTeachers(onlyTeachers);
//       } catch (error) {
//         console.error('Failed to fetch teachers', error);
//       }
//     };
//     fetchTeachers();
//   }, []);

//   return (
//     <div className="max-w-5xl mx-auto p-6">
//       <div className="flex justify-center mb-6">
//         <Image
//           src="/assets/logo.png"
//           alt="Quram Academy Logo"
//           width={160}
//           height={60}
//           priority
//         />
//       </div>

//       {/* Teacher Select Dropdown */}
//       <div className="mb-6">
//         <label className="block mb-2 font-medium text-gray-700">Select Teacher</label>
//         <select
//           value={selectedTeacherId}
//           onChange={(e) => setSelectedTeacherId(e.target.value)}
//           className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
//         >
//           <option value="">-- Select Teacher --</option>
//           {teachers.map((t) => (
//             <option key={t._id} value={t._id}>
//               {t.name}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Homework Table */}
//       <HomeworkTable teacherId={selectedTeacherId} />
//     </div>
//   );
// }
