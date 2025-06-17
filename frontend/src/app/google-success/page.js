'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Get the token from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      // Decode token to get user info (optional)
      const decoded = parseJwt(token);
      const role = decoded?.role;

      // Save token
      localStorage.setItem('token', token);
      localStorage.setItem('userId', decoded?.sub);

      // Redirect based on role
      if (role === 'super-admin') {
        router.push('/dashboard/super-admin');
      } else if (role === 'admin') {
        router.push('/dashboard/admin');
      } else if (role === 'teacher') {
        router.push('/dashboard/teacher');
      } else {
        router.push('/dashboard/student');
      }
    } else {
      alert('Token not found in URL');
      router.push('/');
    }
  }, [router]);

  function parseJwt(token) {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      return null;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting after Google login...</p>
    </div>
  );
}
