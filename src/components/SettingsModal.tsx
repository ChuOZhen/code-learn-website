'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const { apiKey: storedApiKey, updateApiKey } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, [storedApiKey]);

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    setSaving(true);
    try {
      await updateApiKey(apiKey.trim());
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      // Silently fail
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-sidebar border border-border rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        <h2 className="text-xl font-bold text-foreground mb-1">DeepSeek 设置</h2>
        <p className="text-sm text-muted mb-5">
          输入你的 DeepSeek API Key，仅存储在本地当前账号下，不会上传到任何第三方服务器。
        </p>

        <label className="block text-sm font-medium text-foreground mb-2">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={e => { setApiKey(e.target.value); setSaved(false); }}
          placeholder={storedApiKey ? 'sk-****（已配置，输入新 Key 可覆盖）' : 'sk-xxxxxxxxxxxxxxxx'}
          className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted/50 focus:outline-none focus:border-primary transition-colors text-sm font-mono"
        />

        <p className="text-xs text-muted mt-2">
          从 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">platform.deepseek.com</a> 获取 API Key
        </p>

        <div className="flex flex-col gap-3 mt-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-background border border-border text-muted hover:text-foreground rounded-lg transition-colors text-sm"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !apiKey.trim()}
              className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : saved ? '已保存 ✓' : '保存'}
            </button>
          </div>
          {storedApiKey && (
            <button
              onClick={async () => {
                if (!confirm('确定要删除当前账号保存的 API Key 吗？删除后需要重新输入才能使用 AI 功能。')) return;
                setApiKey('');
                await updateApiKey('');
                setSaved(true);
                setTimeout(() => onClose(), 1000);
              }}
              className="w-full px-4 py-2.5 text-red-400 hover:text-red-300 border border-red-400/30 hover:border-red-400/60 rounded-lg transition-colors text-sm"
            >
              删除当前账号的 API Key
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
