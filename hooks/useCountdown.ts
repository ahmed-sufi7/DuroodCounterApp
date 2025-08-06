import { useEffect, useMemo, useState } from 'react';
import { formatCountdown, getCountdownToMilad } from '../utils/helpers';

export function useCountdown() {
  const [countdown, setCountdown] = useState(getCountdownToMilad());

  const formattedCountdown = useMemo(() => formatCountdown(countdown), [countdown]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getCountdownToMilad());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return {
    countdown,
    formattedCountdown,
  };
} 