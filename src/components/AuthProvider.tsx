'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import {
  clearCurrentUser,
  createUser,
  deleteUser,
  getCurrentUser,
  listUsers,
  loadUserData,
  saveUserData,
  setCurrentUser,
  type PublicUser,
  type UserData,
  type UserProgress,
} from '@/lib/localUser';

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
  updateProgress: (chapterId: string, status: UserProgress[string]) => Promise<void>;
  updateApiKey: (apiKey: string) => Promise<void>;
  getCurrentPassword: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<string | null>(null);
  const [password, setPassword] = useState<string>('');
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [progress, setProgress] = useState<UserProgress>({});
  const [apiKey, setApiKey] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const refreshUsers = async () => {
    const u = await listUsers();
    setUsers(u);
  };

  // On init: restore both session (IndexedDB) and password (sessionStorage)
  useEffect(() => {
    const init = async () => {
      const session = await getCurrentUser();
      if (session) {
        setCurrentUserState(session.username);
        // Restore password from sessionStorage so we can decrypt data on reload
        const savedPwd = sessionStorage.getItem('cpp_learn_pwd');
        if (savedPwd) {
          setPassword(savedPwd);
        }
      }
      await refreshUsers();
      setLoading(false);
    };
    init();
  }, []);

  // Load user data when currentUser or password changes
  useEffect(() => {
    const load = async () => {
      if (!currentUser || !password) {
        setProgress({});
        setApiKey('');
        return;
      }
      const { data, error } = await loadUserData(currentUser, password);
      if (error) {
        setProgress({});
        setApiKey('');
        return;
      }
      setProgress(data.progress);
      setApiKey(data.apiKey);
    };
    load();
  }, [currentUser, password]);

  const persistData = async (newProgress: UserProgress, newApiKey: string) => {
    if (!currentUser || !password) return;
    await saveUserData(currentUser, password, { progress: newProgress, apiKey: newApiKey });
  };

  const login = async (username: string, pwd: string) => {
    const { data, error } = await loadUserData(username, pwd);
    if (error) return { success: false, error };
    await setCurrentUser(username);
    setCurrentUserState(username);
    setPassword(pwd);
    sessionStorage.setItem('cpp_learn_pwd', pwd);
    setProgress(data.progress);
    setApiKey(data.apiKey);
    return { success: true };
  };

  const register = async (username: string, pwd: string) => {
    const res = await createUser(username, pwd);
    if (!res.success) return res;
    await setCurrentUser(username);
    setCurrentUserState(username);
    setPassword(pwd);
    sessionStorage.setItem('cpp_learn_pwd', pwd);
    setProgress({});
    setApiKey('');
    await refreshUsers();
    return { success: true };
  };

  const logout = async () => {
    await clearCurrentUser();
    sessionStorage.removeItem('cpp_learn_pwd');
    setCurrentUserState(null);
    setPassword('');
    setProgress({});
    setApiKey('');
  };

  const removeUser = async (username: string, pwd: string) => {
    const { error } = await loadUserData(username, pwd);
    if (error) return { success: false, error };
    await deleteUser(username);
    if (currentUser === username) {
      setCurrentUserState(null);
      setPassword('');
      setProgress({});
      setApiKey('');
    }
    await refreshUsers();
    return { success: true };
  };

  const updateProgress = async (chapterId: string, status: UserProgress[string]) => {
    const next = { ...progress, [chapterId]: status };
    setProgress(next);
    await persistData(next, apiKey);
  };

  const updateApiKey = async (newApiKey: string) => {
    setApiKey(newApiKey);
    await persistData(progress, newApiKey);
  };

  const getCurrentPassword = () => password;

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
        getCurrentPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
