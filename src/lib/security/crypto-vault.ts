import crypto from 'crypto';

/**
 * PRODUCTION-GRADE AES-256-GCM CRYPTOGRAPHIC VAULT
 *
 * Implements authenticated symmetric encryption for server-side secrets (API keys,
 * payment secrets, webhook signing keys) stored in the database.
 *
 * Ciphertext format:
 * enc:v1:<iv_hex>:<auth_tag_hex>:<ciphertext_hex>
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits for GCM
const AUTH_TAG_LENGTH = 16; // 128 bits authentication tag

/**
 * Derives a consistent 256-bit (32 byte) master key from environment secrets.
 */
function getMasterKey(): Buffer {
  const rawKey =
    process.env.ENCRYPTION_MASTER_KEY ||
    process.env.AUTH_SECRET ||
    'dokind-master-crypto-secret-key-32bytes-min-2026';

  // Use SHA-256 to guarantee exact 32 bytes for AES-256
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypts a plaintext secret using AES-256-GCM with authenticated tag.
 */
export function encryptSecret(plaintext: string): string {
  if (!plaintext || typeof plaintext !== 'string') {
    return '';
  }

  // If already encrypted, return as-is
  if (plaintext.startsWith('enc:v1:')) {
    return plaintext;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getMasterKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `enc:v1:${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts an AES-256-GCM encrypted secret. Returns plaintext.
 * If the value is not encrypted (e.g. legacy or development plaintext), returns it safely.
 */
export function decryptSecret(ciphertext: string): string {
  if (!ciphertext || typeof ciphertext !== 'string') {
    return '';
  }

  if (!ciphertext.startsWith('enc:v1:')) {
    return ciphertext;
  }

  try {
    const parts = ciphertext.split(':');
    if (parts.length !== 5) {
      throw new Error('Malformed encrypted secret token');
    }

    const iv = Buffer.from(parts[2], 'hex');
    const authTag = Buffer.from(parts[3], 'hex');
    const encryptedHex = parts[4];

    const key = getMasterKey();
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('Failed to decrypt secret with master key:', err.message);
    return '';
  }
}

/**
 * Produces a safe, non-revealing display mask for an API key or secret.
 * e.g., '••••••••••••1a8f' or 'Unconfigured'
 */
export function maskSecret(secret?: string, visibleChars = 4): string {
  if (!secret) return 'Not Configured';

  const plain = decryptSecret(secret);
  if (!plain || plain.length <= visibleChars) {
    return '••••••••';
  }

  const lastChars = plain.slice(-visibleChars);
  return `••••••••••••${lastChars}`;
}

/**
 * Checks if a candidate secret is newly provided or unchanged.
 */
export function isNewSecretCandidate(candidate?: string): boolean {
  if (!candidate || typeof candidate !== 'string') return false;
  const trimmed = candidate.trim();
  if (trimmed === '' || trimmed.includes('••••')) return false;
  return true;
}
