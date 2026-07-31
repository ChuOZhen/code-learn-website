'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  clearCurrentUser,
  createUser,
  deleteUser,
  deriveSessionKey,
  getCurrentUser,
  importSessionKey,
  listUsers,
  loadUserDataWithKey,
  saveUserDataWithKey,
  setCurrentUser,
  type PublicUser,
  type UserProgress,
} from '@/lib/localUser';
import type { Language } from '@/lib/chapters';

const SESSION_KEY_STORAGE = 'cpp_learn_session_key';

interface AuthContextType {
  currentUser: string | null;
  users: PublicUser[];
  loading: boolean;
  progress: UserProgress;
  apiKey: string;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUsers: () => void;
  removeUser: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateProgress: (language: Language, chapterId: string, status: UserProgress[string]) => Promise<void>;
  updateApiKey: (apiKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

/**
 * 进度 key 约定：`${language}:${chapterId}`，防止 C++/Python/Java
 * 相同章节 ID 互相串号。
 */
export function progressKey(language: Language, chapterId: string): string {
  return `${language}:${chapterId}`;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<string | null>(null);
  // 密码从不持久化；sessionStorage 只存派生 AES 密钥（base64），
  // 攻击者无法从密钥反推密码。
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [progress, setProgress] = useState<UserProgress>({});
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    const u = await listUsers();
    setUsers(u);
  };

  // On init: restore session (IndexedDB) + derived key (sessionStorage)
  useEffect(() => {
    const init = async () => {
      const session = await getCurrentUser();
      if (session) {
        setCurrentUserState(session.username);
        const savedToken = sessionStorage.getItem(SESSION_KEY_STORAGE);
        if (savedToken) {
          try {
            const key = await importSessionKey(savedToken);
            const { data, error } = await loadUserDataWithKey(session.username, key);
            if (!error) {
              setSessionToken(savedToken);
              setProgress(data.progress);
              setApiKey(data.apiKey);
            } else {
              // 会话密钥失效，清理存储，需要重新登录
              sessionStorage.removeItem(SESSION_KEY_STORAGE);
              await clearCurrentUser();
              setCurrentUserState(null);
            }
          } catch {
            sessionStorage.removeItem(SESSION_KEY_STORAGE);
            await clearCurrentUser();
            setCurrentUserState(null);
          }
        }
      }
      await refreshUsers();
      setLoading(false);
    };
    init();
  }, []);

  const persistData = async (newProgress: UserProgress, newApiKey: string) => {
    if (!currentUser || !sessionToken) return;
    try {
      const key = await importSessionKey(sessionToken);
      await saveUserDataWithKey(currentUser, key, { progress: newProgress, apiKey: newApiKey });
    } catch {
      // 保存失败（如密钥失效）静默处理，内存状态保留
    }
  };

  const login = async (username: string, pwd: string) => {
    const res = await deriveSessionKey(username, pwd);
    if ('error' in res) return { success: false, error: res.error };
    await setCurrentUser(username);
    setCurrentUserState(username);
    setSessionToken(res.token);
    sessionStorage.setItem(SESSION_KEY_STORAGE, res.token);
    const key = await importSessionKey(res.token);
    const { data } = await loadUserDataWithKey(username, key);
    setProgress(data.progress);
    setApiKey(data.apiKey);
    return { success: true };
  };

  const register = async (username: string, pwd: string) => {
    const res = await createUser(username, pwd);
    if (!res.success) return res;
    const keyRes = await deriveSessionKey(username, pwd);
    if ('error' in keyRes) return { success: false, error: keyRes.error };
    await setCurrentUser(username);
    setCurrentUserState(username);
    setSessionToken(keyRes.token);
    sessionStorage.setItem(SESSION_KEY_STORAGE, keyRes.token);
    setProgress({});
    setApiKey('');
    await refreshUsers();
    return { success: true };
  };

  const logout = async () => {
    await clearCurrentUser();
    sessionStorage.removeItem(SESSION_KEY_STORAGE);
    setCurrentUserState(null);
    setSessionToken(null);
    setProgress({});
    setApiKey('');
  };

  const removeUser = async (username: string, pwd: string) => {
    const res = await deriveSessionKey(username, pwd);
    if ('error' in res) return { success: false, error: res.error };
    await deleteUser(username);
    if (currentUser === username) {
      sessionStorage.removeItem(SESSION_KEY_STORAGE);
      setCurrentUserState(null);
      setSessionToken(null);
      setProgress({});
      setApiKey('');
    }
    await refreshUsers();
    return { success: true };
  };

  const updateProgress = async (language: Language, chapterId: string, status: UserProgress[string]) => {
    const key = progressKey(language, chapterId);
    const next = { ...progress, [key]: status };
    setProgress(next);
    await persistData(next, apiKey);
  };

  const updateApiKey = async (newApiKey: string) => {
    setApiKey(newApiKey);
    await persistData(progress, newApiKey);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        users,
        loading,
        progress,
        apiKey,
        login,
        register,
        logout,
        refreshUsers,
        removeUser,
        updateProgress,
        updateApiKey,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
