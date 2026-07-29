'use client';

import { openDB } from 'idb';

const DB_NAME = 'cpp-learn-db';
const DB_VERSION = 1;
const STORE_USERS = 'users';
const STORE_SESSION = 'session';

export interface UserProgress {
  [chapterId: string]: 'not_started' | 'in_progress' | 'completed';
}

export interface UserData {
  progress: UserProgress;
  apiKey: string;
}

export interface UserRecord {
  username: string;
  passwordHash: string; // base64
  salt: string; // base64
  encryptedProgress: string; // base64
  encryptedApiKey: string; // base64
  createdAt: string;
}

export interface PublicUser {
  username: string;
  createdAt: string;
}

// ─── Crypto helpers ───────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
  }

function stringToArrayBuffer(str: string): ArrayBuffer {
  return new TextEncoder().encode(str).buffer;
}

function arrayBufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

async function getCryptoKey(password: string, salt: ArrayBuffer, usage: KeyUsage[]): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits', 'deriveKey']);
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    usage
  );
}

async function hashPassword(password: string, salt: ArrayBuffer): Promise<ArrayBuffer> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  return crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
}

async function encryptData(data: string, key: CryptoKey): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, stringToArrayBuffer(data));
  return {
    iv: arrayBufferToBase64(iv.buffer),
    ciphertext: arrayBufferToBase64(encrypted),
  };
}

async function decryptData(ciphertext: string, iv: string, key: CryptoKey): Promise<string> {
  const encrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(base64ToArrayBuffer(iv)) },
    key,
    base64ToArrayBuffer(ciphertext)
  );
  return arrayBufferToString(encrypted);
}

// ─── IndexedDB helpers ────────────────────────────────────────────

async function getDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_USERS)) {
        db.createObjectStore(STORE_USERS, { keyPath: 'username' });
      }
      if (!db.objectStoreNames.contains(STORE_SESSION)) {
        db.createObjectStore(STORE_SESSION, { keyPath: 'id' });
      }
    },
  });
}

// ─── User management ──────────────────────────────────────────────

export async function listUsers(): Promise<PublicUser[]> {
  const db = await getDB();
  const users = (await db.getAll(STORE_USERS)) as UserRecord[];
  return users.map(u => ({ username: u.username, createdAt: u.createdAt }));
}

export async function createUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!username.trim() || !password) {
    return { success: false, error: '用户名和密码不能为空' };
  }

  const db = await getDB();
  const existing = await db.get(STORE_USERS, username);
  if (existing) {
    return { success: false, error: '用户名已存在' };
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordHash = await hashPassword(password, salt.buffer);
  const key = await getCryptoKey(password, salt.buffer, ['encrypt']);

  const initialData: UserData = { progress: {}, apiKey: '' };
  const encryptedProgress = await encryptData(JSON.stringify(initialData.progress), key);
  const encryptedApiKey = await encryptData(initialData.apiKey, key);

  const record: UserRecord = {
    username: username.trim(),
    passwordHash: arrayBufferToBase64(passwordHash),
    salt: arrayBufferToBase64(salt.buffer),
    encryptedProgress: JSON.stringify(encryptedProgress),
    encryptedApiKey: JSON.stringify(encryptedApiKey),
    createdAt: new Date().toISOString(),
  };

  await db.put(STORE_USERS, record);
  return { success: true };
}

export async function verifyUser(username: string, password: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDB();
  const record = (await db.get(STORE_USERS, username)) as UserRecord | undefined;
  if (!record) {
    return { success: false, error: '用户不存在' };
  }

  const salt = base64ToArrayBuffer(record.salt);
  const passwordHash = await hashPassword(password, salt);
  const storedHash = base64ToArrayBuffer(record.passwordHash);

  if (passwordHash.byteLength !== storedHash.byteLength) {
    return { success: false, error: '密码错误' };
  }

  const a = new Uint8Array(passwordHash);
  const b = new Uint8Array(storedHash);
  let equal = true;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) equal = false;
  }

  if (!equal) {
    return { success: false, error: '密码错误' };
  }

  // Verify by decrypting to make sure password is correct
  try {
    const key = await getCryptoKey(password, salt, ['decrypt']);
    const progressData = JSON.parse(record.encryptedProgress);
    await decryptData(progressData.ciphertext, progressData.iv, key);
  } catch {
    return { success: false, error: '密码错误' };
  }

  return { success: true };
}

// ─── Session management ───────────────────────────────────────────

export interface Session {
  username: string;
}

export async function setCurrentUser(username: string): Promise<void> {
  const db = await getDB();
  await db.put(STORE_SESSION, { id: 'current', username });
}

export async function getCurrentUser(): Promise<Session | null> {
  const db = await getDB();
  const session = (await db.get(STORE_SESSION, 'current')) as { username: string } | undefined;
  return session ? { username: session.username } : null;
}

export async function clearCurrentUser(): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_SESSION, 'current');
}

export async function deleteUser(username: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_USERS, username);
  const current = await getCurrentUser();
  if (current?.username === username) {
    await clearCurrentUser();
  }
}

// ─── Data access ────────────────────────────────────────────────

async function getUserKey(username: string, password: string, usage: KeyUsage[]): Promise<CryptoKey | null> {
  const db = await getDB();
  const record = (await db.get(STORE_USERS, username)) as UserRecord | undefined;
  if (!record) return null;
  const salt = base64ToArrayBuffer(record.salt);
  return getCryptoKey(password, salt, usage);
}

export async function loadUserData(username: string, password: string): Promise<{ data: UserData; error?: string }> {
  const db = await getDB();
  const record = (await db.get(STORE_USERS, username)) as UserRecord | undefined;
  if (!record) return { data: { progress: {}, apiKey: '' }, error: '用户不存在' };

  const key = await getUserKey(username, password, ['decrypt']);
  if (!key) return { data: { progress: {}, apiKey: '' }, error: '无法获取密钥' };

  try {
    const progressPayload = JSON.parse(record.encryptedProgress);
    const progressStr = await decryptData(progressPayload.ciphertext, progressPayload.iv, key);
    const apiKeyPayload = JSON.parse(record.encryptedApiKey);
    const apiKey = await decryptData(apiKeyPayload.ciphertext, apiKeyPayload.iv, key);

    return {
      data: {
        progress: JSON.parse(progressStr) as UserProgress,
        apiKey,
      },
    };
  } catch {
    return { data: { progress: {}, apiKey: '' }, error: '解密失败，密码可能不正确' };
  }
}

export async function saveUserData(username: string, password: string, data: UserData): Promise<{ success: boolean; error?: string }> {
  // Verify password by attempting to decrypt existing data before overwriting
  const existing = await loadUserData(username, password);
  if (existing.error) {
    return { success: false, error: existing.error };
  }

  const db = await getDB();
  const record = (await db.get(STORE_USERS, username)) as UserRecord | undefined;
  if (!record) return { success: false, error: '用户不存在' };

  const key = await getUserKey(username, password, ['encrypt']);
  if (!key) return { success: false, error: '无法获取密钥' };

  const encryptedProgress = await encryptData(JSON.stringify(data.progress), key);
  const encryptedApiKey = await encryptData(data.apiKey, key);

  await db.put(STORE_USERS, {
    ...record,
    encryptedProgress: JSON.stringify(encryptedProgress),
    encryptedApiKey: JSON.stringify(encryptedApiKey),
  });

  return { success: true };
}

// ─── Export / Import ────────────────────────────────────────────

export async function exportUserData(username: string): Promise<{ success: boolean; data?: UserRecord; error?: string }> {
  const db = await getDB();
  const record = (await db.get(STORE_USERS, username)) as UserRecord | undefined;
  if (!record) return { success: false, error: '用户不存在' };
  return { success: true, data: record };
}

export async function importUserData(record: UserRecord): Promise<{ success: boolean; error?: string }> {
  const db = await getDB();
  const existing = await db.get(STORE_USERS, record.username);
  if (existing) return { success: false, error: '用户名已存在，请先删除原账号' };
  await db.put(STORE_USERS, record);
  return { success: true };
}
