'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function useAuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
      }
    }, 1000); // 1s delay to allow Google login token to be set

    return () => clearTimeout(timeout);
  }, [router]);
}
