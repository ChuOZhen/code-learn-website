'use client';

import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';

export default function AuthModal() {
  const { currentUser, users, loading, login, register, logout, removeUser } = useAuth();
  const [mode, setMode] = useState<'select' | 'login' | 'register'>('select');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Reset state when current user changes
  useEffect(() => {
    if (!currentUser) {
      setMode(users.length > 0 ? 'select' : 'register');
      setUsername('');
      setPassword('');
      setError('');
    }
  }, [currentUser, users.length]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="text-muted">加载中...</div>
      </div>
    );
  }

  if (currentUser) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await login(username, password);
    if (!res.success) setError(res.error || '登录失败');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await register(username, password);
    if (!res.success) setError(res.error || '注册失败');
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`确定要删除账号 "${name}" 吗？该账号下的所有学习进度将丢失。`)) return;
    const pwd = prompt(`请输入账号 "${name}" 的密码以确认删除：`);
    if (!pwd) return;
    const res = await removeUser(name, pwd);
    if (!res.success) setError(res.error || '删除失败');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">C++ 自学平台</h1>
          <p className="text-sm text-muted">数据完全存储在本地，保护你的隐私</p>
        </div>

        {mode === 'select' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">选择账号</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map(u => (
                <div
                  key={u.username}
                  className="flex items-center justify-between p-3 rounded-lg bg-background border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-foreground">{u.username}</p>
                    <p className="text-xs text-muted">
                      创建于 {new Date(u.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setUsername(u.username); setMode('login'); }}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-sm rounded-lg transition-colors"
                    >
                      登录
                    </button>
                    <button
                      onClick={() => handleDelete(u.username)}
                      className="px-3 py-1.5 text-red-400 hover:text-red-300 text-sm transition-colors"
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setUsername(''); setPassword(''); setMode('register'); }}
              className="w-full py-2.5 border border-border hover:border-primary/50 text-foreground rounded-lg transition-colors text-sm"
            >
              创建新账号
            </button>
          </div>
        )}

        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">登录账号</h2>
            <div>
              <label className="block text-sm text-muted mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => setMode('select')}
              className="w-full py-2.5 text-sm text-muted hover:text-foreground transition-colors"
            >
              返回选择账号
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">创建新账号</h2>
            <div>
              <label className="block text-sm text-muted mb-1.5">用户名</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-muted mb-1.5">密码</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-primary"
                required
              />
            </div>
            <p className="text-xs text-muted leading-relaxed">
              密码将用于加密你的学习进度和 API Key。请牢记密码，丢失后将无法恢复数据。
            </p>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors"
            >
              创建账号
            </button>
            {users.length > 0 && (
              <button
                type="button"
                onClick={() => setMode('select')}
                className="w-full py-2.5 text-sm text-muted hover:text-foreground transition-colors"
              >
                返回选择账号
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
