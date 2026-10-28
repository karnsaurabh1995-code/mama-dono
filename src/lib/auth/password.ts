import crypto from 'crypto';

const SALT_BYTE_LENGTH = 16;
const KEY_BYTE_LENGTH = 64;

/**
 * Safely resolves the native Node.js crypto module on the server,
 * falling back gracefully if running in a client/browser environment
 * where Turbopack polyfills with crypto-browserify.
 */
function getNativeCrypto(): any {
  if (typeof window === 'undefined') {
    try {
      const nodeRequire = (globalThis as any)['require'] || eval('require');
      return nodeRequire('crypto');
    } catch {
      return crypto;
    }
  }
  return crypto;
}

/**
 * Derives a secure password hash using native Node.js crypto.scrypt.
 * Output format: scrypt:<saltHex>:<keyHex>
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string.');
  }

  const c = getNativeCrypto();
  if (typeof c?.scrypt !== 'function') {
    throw new Error('scrypt password hashing is only available in a server-side Node.js environment.');
  }

  const salt = c.randomBytes(SALT_BYTE_LENGTH);

  return new Promise((resolve, reject) => {
    c.scrypt(password, salt, KEY_BYTE_LENGTH, (err: any, derivedKey: any) => {
      if (err) return reject(err);
      resolve(`scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Synchronous version of hashPassword for bootstrap/initialization.
 * Isomorphic-safe: if called in an environment without scryptSync (such as a browser bundle),
 * returns an empty string instead of throwing a runtime TypeError.
 */
export function hashPasswordSync(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string.');
  }
  const c = getNativeCrypto();
  if (typeof c?.scryptSync !== 'function' || typeof c?.randomBytes !== 'function') {
    return '';
  }
  try {
    const salt = c.randomBytes(SALT_BYTE_LENGTH);
    const derivedKey = c.scryptSync(password, salt, KEY_BYTE_LENGTH);
    return `scrypt:${salt.toString('hex')}:${derivedKey.toString('hex')}`;
  } catch {
    return '';
  }
}

/**
 * Verifies a candidate password against a stored scrypt hash using timingSafeEqual
 * to eliminate timing-attack vulnerabilities.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!password || !storedHash || typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  const parts = storedHash.split(':');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const [, saltHex, expectedKeyHex] = parts;
  if (!saltHex || !expectedKeyHex) {
    return false;
  }

  try {
    const c = getNativeCrypto();
    if (typeof c?.scrypt !== 'function' || typeof c?.timingSafeEqual !== 'function') {
      return false;
    }

    const salt = Buffer.from(saltHex, 'hex');
    const expectedKey = Buffer.from(expectedKeyHex, 'hex');

    return new Promise((resolve) => {
      c.scrypt(password, salt, expectedKey.length, (err: any, derivedKey: any) => {
        if (err) return resolve(false);
        try {
          if (derivedKey.length !== expectedKey.length) {
            return resolve(false);
          }
          const matches = c.timingSafeEqual(derivedKey, expectedKey);
          resolve(matches);
        } catch {
          resolve(false);
        }
      });
    });
  } catch {
    return false;
  }
}

/**
 * Validates new password requirements according to OWASP / platform guidelines.
 * Requires minimum 8 characters, at least one letter and at least one number.
 */
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: 'Password is required.' };
  }
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }
  return { valid: true };
}
