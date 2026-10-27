export interface AuthUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLogin: string;
  role: 'Institutional Trader' | 'Demo Analyst';
}

export interface PasswordResetRequest {
  email: string;
  token: string;
  expiresAt: number;
}

const USERS_STORAGE_KEY = 'nexora_auth_users_v1';
const SESSION_STORAGE_KEY = 'nexora_auth_session_v1';
const RESET_TOKENS_KEY = 'nexora_auth_resets_v1';

// Fallback pure JS SHA-256 implementation if window.crypto.subtle is unavailable
function sha256Fallback(data: Uint8Array): string {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const length = data.length;
  const bitLength = length * 8;
  const newLength = ((length + 9 + 63) >> 6) << 6;
  const buffer = new Uint8Array(newLength);
  buffer.set(data);
  buffer[length] = 0x80;

  const view = new DataView(buffer.buffer);
  view.setUint32(newLength - 4, bitLength, false);

  const w = new Uint32Array(64);

  for (let i = 0; i < newLength; i += 64) {
    for (let t = 0; t < 16; t++) {
      w[t] = view.getUint32(i + t * 4, false);
    }
    for (let t = 16; t < 64; t++) {
      const s0 = ((w[t - 15] >>> 7) | (w[t - 15] << 25)) ^ ((w[t - 15] >>> 18) | (w[t - 15] << 14)) ^ (w[t - 15] >>> 3);
      const s1 = ((w[t - 2] >>> 17) | (w[t - 2] << 15)) ^ ((w[t - 2] >>> 19) | (w[t - 2] << 13)) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }

    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

    for (let t = 0; t < 64; t++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + K[t] + w[t]) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }

  const toHex = (n: number) => n.toString(16).padStart(8, '0');
  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(h6)}${toHex(h7)}`;
}

// Web Crypto API salted SHA-256 password hashing (Zero plaintext password storage)
export async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}:nexora_crypto_secret_pepper`);

  const cryptoObj = typeof window !== 'undefined' ? (window.crypto || (window as any).msCrypto) : (globalThis as any).crypto;
  if (cryptoObj?.subtle?.digest) {
    try {
      const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fall through to fallback
    }
  }

  return sha256Fallback(data);
}

export function generateSalt(length = 16): string {
  const array = new Uint8Array(length);
  const cryptoObj = typeof window !== 'undefined' ? window.crypto : (globalThis as any).crypto;
  if (cryptoObj?.getRandomValues) {
    cryptoObj.getRandomValues(array);
  } else {
    for (let i = 0; i < length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

import { DEMO_AUTH_CONFIG } from './demoAuthConfig';

// Default Seed Demo Account
const SEED_SALT = 'e48a1c90f23b7e61';

export async function initAuthDatabase(): Promise<void> {
  try {
    const users = getAllUsers();

    // Securely hash requested demo password with unique cryptographic salt
    const velqorinHash = await hashPassword(
      DEMO_AUTH_CONFIG.demoPassword,
      DEMO_AUTH_CONFIG.seedSalt
    );
    const existingVelqorin = users.find((u) => u.email === DEMO_AUTH_CONFIG.email);

    if (!existingVelqorin) {
      users.push({
        id: 'usr_demo_velqorin73',
        email: DEMO_AUTH_CONFIG.email,
        name: DEMO_AUTH_CONFIG.name,
        passwordHash: velqorinHash,
        salt: DEMO_AUTH_CONFIG.seedSalt,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: DEMO_AUTH_CONFIG.role
      });
    } else {
      // Ensure hash and salt match the configured demo credentials
      existingVelqorin.passwordHash = velqorinHash;
      existingVelqorin.salt = DEMO_AUTH_CONFIG.seedSalt;
    }

    // Secondary demo trader
    if (!users.some((u) => u.email === 'demo@nexora.io')) {
      const demoHash = await hashPassword('NexoraPass2026!', SEED_SALT);
      users.push({
        id: 'usr_demo_institutional_1',
        email: 'demo@nexora.io',
        name: 'Institutional Demo Trader',
        passwordHash: demoHash,
        salt: SEED_SALT,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        role: 'Institutional Trader'
      });
    }

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to init auth database:', err);
  }
}

export function getAllUsers(): AuthUser[] {
  try {
    const data = localStorage.getItem(USERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function registerUser({
  email,
  password,
  name
}: {
  email: string;
  password: string;
  name: string;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  await initAuthDatabase();

  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();

  if (users.some((u) => u.email === cleanEmail)) {
    return { success: false, error: 'An account with this email address already exists.' };
  }

  const salt = generateSalt();
  const passwordHash = await hashPassword(password, salt);

  const newUser: AuthUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    email: cleanEmail,
    name: name.trim() || cleanEmail.split('@')[0],
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    role: 'Institutional Trader'
  };

  users.push(newUser);
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  return { success: true, user: newUser };
}

export async function loginUser({
  email,
  password,
  rememberMe
}: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  await initAuthDatabase();

  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  const targetUser = users.find((u) => u.email === cleanEmail);

  if (!targetUser) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  const computedHash = await hashPassword(password, targetUser.salt);
  if (computedHash !== targetUser.passwordHash) {
    return { success: false, error: 'Invalid email address or password.' };
  }

  // Update lastLogin
  targetUser.lastLogin = new Date().toISOString();
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

  // Store Session
  const sessionData = {
    userId: targetUser.id,
    email: targetUser.email,
    name: targetUser.name,
    role: targetUser.role,
    loggedInAt: new Date().toISOString()
  };

  if (rememberMe) {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
  } else {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    localStorage.removeItem(SESSION_STORAGE_KEY);
  }

  return { success: true, user: targetUser };
}

export function getCurrentSession(): AuthUser | null {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY) || localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    const users = getAllUsers();
    return users.find((u) => u.id === session.userId) || null;
  } catch {
    return null;
  }
}

export function logoutUser(): void {
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignore
  }
}

// Password Reset Simulation Flow
export async function createPasswordResetRequest(email: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  await initAuthDatabase();
  const cleanEmail = email.trim().toLowerCase();
  const users = getAllUsers();
  const user = users.find((u) => u.email === cleanEmail);

  if (!user) {
    return { success: false, error: 'No account found with this email address.' };
  }

  // Generate 6-digit verification code token
  const token = `NX-${Math.floor(100000 + Math.random() * 900000)}`;
  const expiresAt = Date.now() + 15 * 60 * 1000; // 15 mins

  try {
    const existing = localStorage.getItem(RESET_TOKENS_KEY);
    const resets: PasswordResetRequest[] = existing ? JSON.parse(existing) : [];
    const filtered = resets.filter((r) => r.email !== cleanEmail);
    filtered.push({ email: cleanEmail, token, expiresAt });
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore
  }

  return { success: true, token };
}

export async function resetPasswordWithToken({
  email,
  token,
  newPassword
}: {
  email: string;
  token: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim().toUpperCase();

  try {
    const raw = localStorage.getItem(RESET_TOKENS_KEY);
    if (!raw) return { success: false, error: 'Invalid or expired recovery code.' };
    const resets: PasswordResetRequest[] = JSON.parse(raw);
    const match = resets.find((r) => r.email === cleanEmail && r.token === cleanToken);

    if (!match) {
      return { success: false, error: 'The recovery code entered is incorrect.' };
    }

    if (Date.now() > match.expiresAt) {
      return { success: false, error: 'This recovery code has expired. Please request a new one.' };
    }

    // Update user password
    const users = getAllUsers();
    const userIndex = users.findIndex((u) => u.email === cleanEmail);
    if (userIndex === -1) {
      return { success: false, error: 'Account not found.' };
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);
    users[userIndex].salt = salt;
    users[userIndex].passwordHash = passwordHash;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // Clear reset token
    const remaining = resets.filter((r) => r.email !== cleanEmail);
    localStorage.setItem(RESET_TOKENS_KEY, JSON.stringify(remaining));

    return { success: true };
  } catch {
    return { success: false, error: 'Failed to reset password.' };
  }
}
