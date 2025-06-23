'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

export default function AttendancePage() {
  const [attendanceType, setAttendanceType] = useState('teacher');
  const [teacherAttendance, setTeacherAttendance] = useState([]);
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/attendance`);
        const data = await res.json();
        setTeacherAttendance(data.filter((a) => a.teacher));
        setStudentAttendance(data.filter((a) => a.student));
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      }
    };

    fetchAttendance();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [attendanceType]);

  const paginate = (data) => {
    const start = (currentPage - 1) * rowsPerPage;
    return data.slice(start, start + rowsPerPage);
  };

  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / rowsPerPage);
    return (
      <div className="flex justify-between items-center mt-4 text-sm text-gray-700">
        <p>
          Page {currentPage} of {totalPages}
        </p>
        <div className="space-x-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1 bg-[#2E4D3B] text-white rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1 bg-[#2E4D3B] text-white rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    );
  };

 const handleDownloadPDF = () => {
  if (!selectedTeacher || !fromDate || !toDate) {
    alert('Please select all fields');
    return;
  }

  const filteredData = teacherAttendance.filter((record) => {
    const recordDate = new Date(record.date);
    return (
      record.teacher?.name === selectedTeacher &&
      new Date(fromDate) <= recordDate &&
      recordDate <= new Date(toDate)
    );
  });

  if (filteredData.length === 0) {
    alert('No records found for the selected teacher and date range.');
    return;
  }

  const doc = new jsPDF();
  doc.text(`Attendance Report for ${selectedTeacher}`, 14, 15);
  doc.text(`From ${fromDate} To ${toDate}`, 14, 25);

  const tableData = filteredData.map((att, index) => [
    index + 1,
    att.teacher?.name || 'N/A',
    att.status,
    new Date(att.date).toLocaleDateString(),
    att.arrivalTime || '-',
    att.late ? 'Yes' : 'No',
    att.lateByMinutes || 0,
  ]);

  autoTable(doc, {
    head: [['#', 'Teacher Name', 'Status', 'Date', 'Arrival Time', 'Late', 'Late By (mins)']],
    body: tableData,
    startY: 30,
  });

  doc.save(`Attendance_${selectedTeacher}_${fromDate}_to_${toDate}.pdf`);
};

  const renderTable = (data, type) => {
    const paginatedData = paginate(data);
    return (
      <div className="overflow-x-auto mt-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-[#2E4D3B] text-white">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">
                  {type === 'teacher' ? 'Teacher Name' : 'Student Name'}
                </th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Arrival Time</th>
                <th className="py-3 px-4 text-left">Late</th>
                <th className="py-3 px-4 text-left">Late By (mins)</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((att, index) => (
                <tr
                  key={att._id}
                  className="odd:bg-gray-50 even:bg-white hover:bg-gray-100 transition"
                >
                  <td className="py-3 px-4">{(currentPage - 1) * rowsPerPage + index + 1}</td>
                  <td className="py-3 px-4">{att[type]?.name || 'N/A'}</td>
                  <td className="py-3 px-4">{att.status}</td>
                  <td className="py-3 px-4">
                    {new Date(att.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">{att.arrivalTime || '-'}</td>
                  <td className="py-3 px-4">{att.late ? 'Yes' : 'No'}</td>
                  <td className="py-3 px-4">{att.lateByMinutes || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination(data.length)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center mb-6">
          <Image
            src="/assets/logo.png"
            alt="Quram Academy Logo"
            width={160}
            height={60}
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-center text-[#2E4D3B] mb-8">
          Attendance Records
        </h1>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-6">
          <div className="flex relative bg-gray-200 rounded-full w-fit p-1">
            <div
              className={`absolute top-1 bottom-1 left-1 w-1/2 bg-[#2E4D3B] rounded-full transition-all duration-300 ${
                attendanceType === 'student' ? 'translate-x-full' : ''
              }`}
            ></div>
            <button
              onClick={() => setAttendanceType('teacher')}
              className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                attendanceType === 'teacher' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => setAttendanceType('student')}
              className={`relative z-10 px-6 py-2 text-sm font-semibold rounded-full transition-colors duration-300 ${
                attendanceType === 'student' ? 'text-white' : 'text-gray-700'
              }`}
            >
              Student
            </button>
          </div>
        </div>

        {/* PDF Filter Form for Teacher */}
        {attendanceType === 'teacher' && (
          <div className="bg-white p-4 rounded shadow-md mb-6 flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Teacher Name</label>
              <select
                className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded"
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">Select</option>
                {[...new Set(teacherAttendance.map((t) => t.teacher?.name))].map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">From Date</label>
              <input
                type="date"
                className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded"
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">To Date</label>
              <input
                type="date"
                className="mt-1 block w-48 px-3 py-2 border border-gray-300 rounded"
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>
            <button
              onClick={handleDownloadPDF}
              className="bg-[#2E4D3B] text-white px-6 py-2 rounded mt-4"
            >
              Download PDF
            </button>
          </div>
        )}

        {/* Attendance Table */}
        {attendanceType === 'teacher'
          ? renderTable(teacherAttendance, 'teacher')
          : renderTable(studentAttendance, 'student')}
      </div>
    </div>
  );
}
