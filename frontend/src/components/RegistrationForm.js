// components/RegisterForm.tsx
'use client';
import Image from 'next/image';
import { useState } from 'react';
import { AiOutlineMail, AiOutlineUser, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { RiLockPasswordLine } from 'react-icons/ri';

export default function RegisterForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });

  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Something went wrong');

    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/mail/send-welcome`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
         Authorization: `Bearer ${token}`,

      },
      body: JSON.stringify({
        email: formData.email,
        name: formData.name,
      }),
    });

    setMessage('✅ User registered successfully and email sent!');
  } catch (err) {
    setMessage(`❌ ${err.message}`);
  }
};


  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const token = localStorage.getItem('token');

  //   try {
  //     const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         Authorization: `Bearer ${token}`,
  //       },
  //       body: JSON.stringify(formData),
  //     });

  //     const data = await res.json();
  //     if (!res.ok) throw new Error(data.message || 'Something went wrong');
  //     setMessage('✅ User registered successfully!');
  //   } catch (err) {
  //     setMessage(`❌ ${err.message}`);
  //   }
  // };

  return (
    <div className='flex items-center justify-center'>
    <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md mx-auto text-black">
      <div className="flex justify-center mb-6">
                <Image
                  src="/assets/logo.png"
                  alt="Quram Academy Logo"
                  width={160}
                  height={60}
                  priority
                />
              </div>
      <h2 className="text-2xl font-bold text-center text-[#2E4D3B] mb-2">Register New User</h2>
      <p className="text-center text-sm text-gray-500 mb-4">Create a new account</p>

      {message && (
        <div
          className={`mb-4 px-4 py-2 text-sm text-center rounded ${
            message.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <AiOutlineUser className="absolute top-3 left-3 text-gray-500" />
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
          />
        </div>

        <div className="relative">
          <AiOutlineMail className="absolute top-3 left-3 text-gray-500" />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
          />
        </div>

        <div className="relative">
          <RiLockPasswordLine className="absolute top-3 left-3 text-gray-500" />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Create Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-3 right-3 text-2xl text-gray-500 cursor-pointer"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </div>
        </div>

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
        >
          <option value="student">Student</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
        </select>

        <button
          type="submit"
          className="w-full bg-[#2E4D3B] hover:bg-[#3f6b4a] text-white font-semibold py-2 rounded-lg"
        >
          Register
        </button>
      </form>
    </div></div>
  );
}
