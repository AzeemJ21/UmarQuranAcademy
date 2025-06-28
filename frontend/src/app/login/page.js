'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AiOutlineMail, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { RiLockPasswordLine } from 'react-icons/ri';
import { FcGoogle } from 'react-icons/fc';
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginUser = async () => {
    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user._id);

        // redirect by role
        switch (data.user.role) {
          case 'super-admin':
            router.push('/dashboard/super-admin');
            break;
          case 'admin':
            router.push('/dashboard/admin');
            break;
          case 'teacher':
            router.push('/dashboard/teacher');
            break;
          default:
            router.push('/dashboard/student');
        }
      } else {
        alert('Login failed: ' + (data.message || 'Invalid credentials'));
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => {
    // This triggers Google OAuth via NestJS backend
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#2E4D3B] flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/assets/logo.png" alt="Quran Academy Logo" width={160} height={60} priority />
        </div>  

        <p className="text-center text-sm text-gray-500 mb-6">Login to your account</p>

        {/* Email Input */}
        <div className="relative mb-4">
          <AiOutlineMail className="absolute left-3 top-3.5 text-gray-400 text-lg" />
          <input
            type="email"
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Password Input */}
        <div className="relative mb-6">
          <RiLockPasswordLine className="absolute left-3 top-3.5 text-gray-400 text-lg" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 text-black rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2E4D3B]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <button
            type="button"
            className="absolute right-3 top-3.5 text-gray-500 text-2xl"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            disabled={loading}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>

        {/* Login Button */}
        <button
          onClick={loginUser}
          disabled={loading}
          className={`w-full bg-[#2E4D3B] text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#3b6a50]'
          }`}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow h-px bg-gray-300" />
          <span className="mx-2 text-gray-500 text-sm">or</span>
          <div className="flex-grow h-px bg-gray-300" />
        </div>

        {/* Google Login Button */}
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-100 transition"
          disabled={loading}
        >
          <FcGoogle size={22} />
          <span className="text-sm font-medium text-gray-700">Sign in with Google</span>
        </button>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don’t have an account?{' '}
          <span className="text-[#2E4D3B] font-medium cursor-pointer hover:underline">
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
