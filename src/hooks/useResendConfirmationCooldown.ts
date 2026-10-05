import { useCallback, useEffect, useState } from 'react';

export function formatResendCountdown(totalSeconds: number): string {
  const seconds = Math.max(0, Math.ceil(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }

  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

export function useResendConfirmationCooldown() {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const startCooldown = useCallback((retryAfterSeconds: unknown) => {
    if (
      typeof retryAfterSeconds !== 'number' ||
      !Number.isFinite(retryAfterSeconds) ||
      retryAfterSeconds <= 0
    ) {
      return;
    }

    setDeadline(Date.now() + retryAfterSeconds * 1000);
  }, []);

  useEffect(() => {
    if (deadline === null) {
      setRemainingSeconds(0);
      return;
    }

    const updateRemainingTime = () => {
      const nextRemainingSeconds = Math.max(
        0,
        Math.ceil((deadline - Date.now()) / 1000),
      );
      setRemainingSeconds(nextRemainingSeconds);

      if (nextRemainingSeconds === 0) {
        setDeadline(null);
      }
    };

    updateRemainingTime();
    const intervalId = window.setInterval(updateRemainingTime, 1000);

    return () => window.clearInterval(intervalId);
  }, [deadline]);

  return {
    remainingSeconds,
    startCooldown,
  };
}
