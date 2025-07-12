'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function InactivityHandler({ children }) {
  const router = useRouter();

  useEffect(() => {
    let timeout;

    const logout = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      alert('Session expired due to inactivity.');
      router.push('/login');
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logout, 20 * 60 * 1000); // 20 minutes
    };

    const events = ['mousemove', 'keydown', 'scroll', 'click'];

    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer(); // Start timer on mount

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timeout);
    };
  }, [router]);

  return <>{children}</>;
}
