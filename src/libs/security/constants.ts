// Security constants untuk aplikasi
export const SECURITY_CONFIG = {
  // Rate limiting
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 menit dalam ms
  
  // Input validation
  MAX_EMAIL_LENGTH: 254,
  MAX_PASSWORD_LENGTH: 128,
  MIN_PASSWORD_LENGTH: 6,
  
  // Session
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 jam dalam ms
  
  // CSRF Protection
  CSRF_TOKEN_LENGTH: 32,
  
  // Headers security
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  }
} as const;

// Email validation regex yang lebih ketat
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password validation regex
export const PASSWORD_REGEX = {
  minLength: /^.{6,}$/,
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/,
  noCommonPasswords: /^(?!.*(?:password|123456|qwerty|abc123|admin|user)).*$/i
};

// XSS protection - karakter yang tidak diizinkan
export const XSS_DANGEROUS_CHARS = /[<>'"&]/g;

// SQL injection protection
export const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
  /(--|\*\/|\/\*)/g,
  /([';]|\b(OR|AND)\b.*[=<>])/gi
];

export const TEAM_REQUIREMENTS = {
  MAX_MEMBERS: 3, // Maksimal anggota tim
  MIN_MEMBERS: 1, // Minimal anggota tim untuk membuat tim
}