'use client';

import { useEffect, useMemo, useState } from 'react';

export const useCountdown = (expiresAt: string) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const remainingMs = Math.max(new Date(expiresAt).getTime() - now, 0);
  return useMemo(() => {
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return {
      expired: remainingMs <= 0,
      text: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
    };
  }, [remainingMs]);
};
