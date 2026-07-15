import { useEffect, useState } from "react";
import { logSecurityEvent } from "../security/utils";
import { SECURITY_CONFIG } from "../security/constants";

// Rate limiting untuk mencegah brute force attacks
const useRateLimit = () => {
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState<number | null>(null);

  useEffect(() => {
    // Restore rate limit state from localStorage
    const stored = localStorage.getItem('login_attempts');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setAttempts(data.attempts || 0);
        if (data.lockUntil && Date.now() < data.lockUntil) {
          setLockUntil(data.lockUntil);
        } else {
          // Lock expired, reset attempts
          localStorage.removeItem('login_attempts');
          setAttempts(0);
          setLockUntil(null);
        }
      } catch (error) {
        console.error('Error parsing rate limit data:', error);
        localStorage.removeItem('login_attempts');
      }
    }
  }, []);

  const isLocked = lockUntil && Date.now() < lockUntil;
  const remainingTime = isLocked ? Math.ceil((lockUntil - Date.now()) / 1000) : 0;

  const recordFailedAttempt = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    // Log security event
    logSecurityEvent({
      type: 'login_failure',
      identifier: 'current_session',
      details: { attemptCount: newAttempts }
    });

    // Lock setelah mencapai max attempts
    if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      const lockTime = Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION;
      setLockUntil(lockTime);
      localStorage.setItem('login_attempts', JSON.stringify({
        attempts: newAttempts,
        lockUntil: lockTime
      }));

      // Log rate limit event
      logSecurityEvent({
        type: 'rate_limit',
        identifier: 'current_session',
        details: { lockoutDuration: SECURITY_CONFIG.LOCKOUT_DURATION }
      });
    } else {
      localStorage.setItem('login_attempts', JSON.stringify({
        attempts: newAttempts
      }));
    }
  };

  const resetAttempts = () => {
    setAttempts(0);
    setLockUntil(null);
    localStorage.removeItem('login_attempts');
    
    // Log successful login
    logSecurityEvent({
      type: 'login_success',
      identifier: 'current_session'
    });
  };

  return {
    attempts,
    isLocked,
    remainingTime,
    recordFailedAttempt,
    resetAttempts
  };
};

export default useRateLimit;