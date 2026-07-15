import { EMAIL_REGEX, PASSWORD_REGEX, XSS_DANGEROUS_CHARS, SQL_INJECTION_PATTERNS, SECURITY_CONFIG } from './constants';

/**
 * Sanitize input untuk mencegah XSS attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  
  return input
    .replace(XSS_DANGEROUS_CHARS, '') // Remove dangerous characters
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Validate email dengan regex yang ketat
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email harus diisi' };
  }
  
  const sanitizedEmail = sanitizeInput(email).toLowerCase();
  
  if (sanitizedEmail.length > SECURITY_CONFIG.MAX_EMAIL_LENGTH) {
    return { isValid: false, error: 'Email terlalu panjang' };
  }
  
  if (!EMAIL_REGEX.test(sanitizedEmail)) {
    return { isValid: false, error: 'Format email tidak valid' };
  }
  
  // Check for common malicious patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(sanitizedEmail)) {
      return { isValid: false, error: 'Email mengandung karakter tidak valid' };
    }
  }
  
  return { isValid: true };
}

/**
 * Validate password dengan berbagai kriteria keamanan
 */
export function validatePassword(password: string): { isValid: boolean; error?: string; strength?: string } {
  if (!password) {
    return { isValid: false, error: 'Password harus diisi' };
  }
  
  if (password.length < SECURITY_CONFIG.MIN_PASSWORD_LENGTH) {
    return { isValid: false, error: `Password minimal ${SECURITY_CONFIG.MIN_PASSWORD_LENGTH} karakter` };
  }
  
  if (password.length > SECURITY_CONFIG.MAX_PASSWORD_LENGTH) {
    return { isValid: false, error: 'Password terlalu panjang' };
  }
  
  // Check for common weak passwords
  // if (!PASSWORD_REGEX.noCommonPasswords.test(password)) {
  //   return { isValid: false, error: 'Password terlalu umum, gunakan password yang lebih kuat' };
  // }
  
  // Calculate password strength
  let strength = 'Lemah';
  let strengthPoints = 0;
  
  if (PASSWORD_REGEX.hasLowerCase.test(password)) strengthPoints++;
  if (PASSWORD_REGEX.hasUpperCase.test(password)) strengthPoints++;
  if (PASSWORD_REGEX.hasNumber.test(password)) strengthPoints++;
  if (PASSWORD_REGEX.hasSpecialChar.test(password)) strengthPoints++;
  if (password.length >= 8) strengthPoints++;
  
  if (strengthPoints >= 4) strength = 'Kuat';
  else if (strengthPoints >= 3) strength = 'Sedang';
  
  return { isValid: true, strength };
}

/**
 * Generate secure random token untuk CSRF protection
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(SECURITY_CONFIG.CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Rate limiting helper
 */
export class RateLimiter {
  private attempts: Map<string, { count: number; lockUntil?: number }> = new Map();
  
  constructor(
    private maxAttempts: number = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    private lockoutDuration: number = SECURITY_CONFIG.LOCKOUT_DURATION
  ) {}
  
  /**
   * Check if an identifier (IP, email) is rate limited
   */
  isRateLimited(identifier: string): { isLimited: boolean; remainingTime?: number } {
    const record = this.attempts.get(identifier);
    
    if (!record) {
      return { isLimited: false };
    }
    
    if (record.lockUntil && Date.now() < record.lockUntil) {
      const remainingTime = Math.ceil((record.lockUntil - Date.now()) / 1000);
      return { isLimited: true, remainingTime };
    }
    
    // Lock expired, reset
    if (record.lockUntil && Date.now() >= record.lockUntil) {
      this.attempts.delete(identifier);
      return { isLimited: false };
    }
    
    return { isLimited: false };
  }
  
  /**
   * Record a failed attempt
   */
  recordFailedAttempt(identifier: string): void {
    const record = this.attempts.get(identifier) || { count: 0 };
    record.count++;
    
    if (record.count >= this.maxAttempts) {
      record.lockUntil = Date.now() + this.lockoutDuration;
    }
    
    this.attempts.set(identifier, record);
  }
  
  /**
   * Reset attempts for successful login
   */
  resetAttempts(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  /**
   * Get current attempt count
   */
  getAttemptCount(identifier: string): number {
    const record = this.attempts.get(identifier);
    return record?.count || 0;
  }
}

/**
 * Security headers untuk response
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    ...SECURITY_CONFIG.SECURITY_HEADERS,
    'Content-Security-Policy': [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval'${process.env.NODE_ENV === 'development' ? ' http://localhost:8400' : ''}`, // Perlu 'unsafe-inline' untuk Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      `connect-src 'self' https://*.supabase.co${process.env.NODE_ENV === 'development' ? ' http://localhost:8400' : ''}`,
      "frame-ancestors 'none'"
    ].join('; ')
  };
}

/**
 * Validate dan sanitize semua input dalam object
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeInput(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * Check jika request berasal dari origin yang valid
 */
export function validateOrigin(origin: string, allowedOrigins: string[]): boolean {
  return allowedOrigins.includes(origin);
}

/**
 * Log security events untuk monitoring
 */
export function logSecurityEvent(event: {
  type: 'login_attempt' | 'login_success' | 'login_failure' | 'rate_limit' | 'suspicious_activity';
  identifier: string;
  details?: any;
  timestamp?: Date;
}): void {
  const logEntry = {
    ...event,
    timestamp: event.timestamp || new Date(),
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
  };
  
  // Optionally store in localStorage for client-side tracking
  if (typeof window !== 'undefined') {
    const logs = JSON.parse(localStorage.getItem('security_logs') || '[]');
    logs.push(logEntry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.shift();
    }
    
    localStorage.setItem('security_logs', JSON.stringify(logs));
  }
}
