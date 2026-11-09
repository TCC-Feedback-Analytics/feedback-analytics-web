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
  // Relógio da contagem: anda a cada segundo enquanto há prazo.
  const [now, setNow] = useState(() => Date.now());

  const startCooldown = useCallback((retryAfterSeconds: unknown) => {
    if (
      typeof retryAfterSeconds !== 'number' ||
      !Number.isFinite(retryAfterSeconds) ||
      retryAfterSeconds <= 0
    ) {
      return;
    }

    const startedAt = Date.now();
    setNow(startedAt);
    setDeadline(startedAt + retryAfterSeconds * 1000);
  }, []);

  useEffect(() => {
    if (deadline === null) return;

    const intervalId = window.setInterval(() => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= deadline) setDeadline(null);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [deadline]);

  const remainingSeconds = deadline === null ? 0 : Math.max(0, Math.ceil((deadline - now) / 1000));

  return {
    remainingSeconds,
    startCooldown,
  };
}
