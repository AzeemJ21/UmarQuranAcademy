'use client';

import { useEffect, useState } from 'react';

export default function CreateGroupForm() {
    const [teachers, setTeachers] = useState([]);
    const [students, setStudents] = useState([]);
    const [groupName, setGroupName] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedStudents, setSelectedStudents] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Fetch all teachers
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
                } else if (data.data && Array.isArray(data.data)) {
                    setTeachers(data.data);
                } else {
                    setTeachers([]);
                }
            })
            .catch((err) => console.error('Error fetching teachers:', err));
    }, []);

    const handleTeacherSelect = async (teacherId) => {
        setSelectedTeacher(teacherId);
        setSelectedStudents([]); // Reset students
        const token = localStorage.getItem('token');
        if (!teacherId || !token) return;

        try {
            const res = await fetch(`http://localhost:3001/user/students/${teacherId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setSelectedStudents(data.map(student => student._id));
                setStudents(data); // So we can show their names
            } else {
                setSelectedStudents([]);
                setStudents([]);
            }
        } catch (err) {
            console.error('Error fetching assigned students:', err);
        }
    };

    const handleCreateGroup = async () => {
        const token = localStorage.getItem('token');

        if (!groupName || !selectedTeacher || selectedStudents.length === 0) {
            alert('Please fill all fields.');
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: groupName,
                    teacherId: selectedTeacher,
                    studentIds: selectedStudents,
                })
            });

            const result = await res.json();
            if (res.ok) {
                alert('✅ Group created successfully!');
                setGroupName('');
                setSelectedTeacher('');
                setSelectedStudents([]);
                setStudents([]);
            } else {
                alert('❌ Error: ' + result.message);
            }
        } catch (err) {
            console.error('Error creating group:', err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-[#2E4D3B] text-center mb-6">Create Group</h2>

            <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Group Name</label>
                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                    placeholder="Enter Group Name"
                />
            </div>

            <div className="mb-4">
                <label className="block mb-1 font-medium text-gray-700">Select Teacher</label>
                <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
                    value={selectedTeacher}
                    onChange={(e) => handleTeacherSelect(e.target.value)}
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
                <label className="block mb-1 font-medium text-gray-700">Assigned Students</label>
                <select
                    multiple
                    value={selectedStudents}
                    disabled
                    className="w-full h-40 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                >
                    {students.map((student) => (
                        <option key={student._id} value={student._id}>
                            {student.name}
                        </option>
                    ))}
                </select>
            </div>

            <button
                onClick={handleCreateGroup}
                className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg transition"
            >
                Create Group
            </button>
        </div>
    );
}


// 'use client';

// import { useEffect, useState } from 'react';

// export default function CreateGroupForm() {
//     const [teachers, setTeachers] = useState([]);
//     const [students, setStudents] = useState([]);
//     const [groupName, setGroupName] = useState('');
//     const [selectedTeacher, setSelectedTeacher] = useState('');
//     const [selectedStudents, setSelectedStudents] = useState([]);

//     useEffect(() => {
//         const token = localStorage.getItem('token');
//         if (!token) return;

//         // Fetch Teachers
//         fetch(`http://localhost:3001/user?role=teacher`, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//             },
//         })
//             .then((res) => res.json())
//             .then((data) => {
//                 if (Array.isArray(data)) {
//                     setTeachers(data);
//                 } else if (data.users && Array.isArray(data.users)) {
//                     setTeachers(data.users);
//                 } else if (data.data && Array.isArray(data.data)) {
//                     setTeachers(data.data);
//                 } else {
//                     setTeachers([]);
//                 }
//             })
//             .catch((err) => console.error('Error fetching teachers:', err));

//         // Fetch Students
//         fetch(`http://localhost:3001/user?role=student`, {
//             headers: {
//                 'Content-Type': 'application/json',
//                 Authorization: `Bearer ${token}`,
//             },
//         })
//             .then((res) => res.json())
//             .then((data) => {
//                 if (Array.isArray(data)) {
//                     setStudents(data);
//                 } else if (data.users && Array.isArray(data.users)) {
//                     setStudents(data.users);
//                 } else if (data.data && Array.isArray(data.data)) {
//                     setStudents(data.data);
//                 } else {
//                     setStudents([]);
//                 }
//             })
//             .catch((err) => console.error('Error fetching students:', err));
//     }, []);

//     const handleCreateGroup = async () => {
//         const token = localStorage.getItem('token');

//         if (!groupName || !selectedTeacher || selectedStudents.length === 0) {
//             alert('Please fill all fields.');
//             return;
//         }

//         try {
//             const res = await fetch(`http://localhost:3001/groups`, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${token}`,
//                 },
//                 body: JSON.stringify({
//                     name: groupName,
//                     teacherId: selectedTeacher,
//                     studentIds: selectedStudents,
//                 })
//             });

//             const result = await res.json();
//             if (res.ok) {
//                 alert('✅ Group created successfully!');
//                 setGroupName('');
//                 setSelectedTeacher('');
//                 setSelectedStudents([]);
//             } else {
//                 alert('❌ Error: ' + result.message);
//             }
//         } catch (err) {
//             console.error('Error creating group:', err);
//         }
//     };

//     return (
//         <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-lg">
//             <h2 className="text-2xl font-bold text-[#2E4D3B] text-center mb-6">Create Group</h2>

//             <div className="mb-4">
//                 <label className="block mb-1 font-medium text-gray-700">Group Name</label>
//                 <input
//                     type="text"
//                     value={groupName}
//                     onChange={(e) => setGroupName(e.target.value)}
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
//                     placeholder="Enter Group Name"
//                 />
//             </div>

//             <div className="mb-4">
//                 <label className="block mb-1 font-medium text-gray-700">Select Teacher</label>
//                 <select
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
//                     value={selectedTeacher}
//                     onChange={(e) => setSelectedTeacher(e.target.value)}
//                 >
//                     <option value="">-- Select Teacher --</option>
//                     {teachers.map((teacher) => (
//                         <option key={teacher._id} value={teacher._id}>
//                             {teacher.name}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             <div className="mb-6">
//                 <label className="block mb-1 font-medium text-gray-700">Select Students</label>
//                 <select
//                     multiple
//                     value={selectedStudents}
//                     onChange={(e) =>
//                         setSelectedStudents(Array.from(e.target.selectedOptions, (opt) => opt.value))
//                     }
//                     className="w-full h-40 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
//                 >
//                     {students.map((student) => (
//                         <option key={student._id} value={student._id}>
//                             {student.name}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             <button
//                 onClick={handleCreateGroup}
//                 className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg transition"
//             >
//                 Create Group
//             </button>
//         </div>
//     );
// }
