import { describe, it, expect } from 'vitest';
import 'fake-indexeddb/auto';
import { webcrypto } from 'node:crypto';

// Polyfill Web Crypto for Node.js environment
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', { value: webcrypto });
}

// Polyfill btoa/atob for Node.js environment
if (!globalThis.btoa) {
  Object.defineProperty(globalThis, 'btoa', {
    value: (str: string) => Buffer.from(str, 'binary').toString('base64'),
  });
}
if (!globalThis.atob) {
  Object.defineProperty(globalThis, 'atob', {
    value: (str: string) => Buffer.from(str, 'base64').toString('binary'),
  });
}

import {
  clearCurrentUser,
  createUser,
  deleteUser,
  getCurrentUser,
  listUsers,
  loadUserData,
  saveUserData,
  setCurrentUser,
  verifyUser,
} from './localUser';

let counter = 0;
function unique(prefix: string) {
  return `${prefix}-${Date.now()}-${++counter}`;
}

describe('localUser', () => {
  describe('用户生命周期', () => {
    it('创建用户后应能加载初始数据', async () => {
      const username = unique('alice');
      const res = await createUser(username, 'password123');
      expect(res.success).toBe(true);

      const data = await loadUserData(username, 'password123');
      expect(data.error).toBeUndefined();
      expect(data.data.progress).toEqual({});
      expect(data.data.apiKey).toBe('');
    });

    it('重复用户名应创建失败', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      const res = await createUser(username, 'anotherpass');
      expect(res.success).toBe(false);
      expect(res.error).toContain('用户名已存在');
    });

    it('删除用户后应无法加载数据', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      await deleteUser(username);

      const data = await loadUserData(username, 'password123');
      expect(data.error).toContain('用户不存在');
    });

    it('列出用户应包含已创建用户', async () => {
      const username1 = unique('alice');
      const username2 = unique('bob');
      await createUser(username1, 'password123');
      await createUser(username2, 'password456');

      const users = await listUsers();
      expect(users.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('密码验证', () => {
    it('正确密码应验证通过', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      const res = await verifyUser(username, 'password123');
      expect(res.success).toBe(true);
    });

    it('错误密码应验证失败', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      const res = await verifyUser(username, 'wrongpassword');
      expect(res.success).toBe(false);
      expect(res.error).toContain('密码错误');
    });

    it('错误密码不应能解密数据', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      const data = await loadUserData(username, 'wrongpassword');
      expect(data.error).toContain('解密失败');
    });
  });

  describe('数据读写', () => {
    it('保存进度后应能读取', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');

      const saveRes = await saveUserData(username, 'password123', {
        progress: { '01-intro': 'completed', '02-setup': 'in_progress' },
        apiKey: 'sk-test-key',
      });
      expect(saveRes.success).toBe(true);

      const data = await loadUserData(username, 'password123');
      expect(data.error).toBeUndefined();
      expect(data.data.progress).toEqual({
        '01-intro': 'completed',
        '02-setup': 'in_progress',
      });
      expect(data.data.apiKey).toBe('sk-test-key');
    });

    it('用错误密码保存数据应失败', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      const saveRes = await saveUserData(username, 'wrongpassword', {
        progress: {},
        apiKey: '',
      });
      expect(saveRes.success).toBe(false);
      expect(saveRes.error).toContain('解密失败');
    });

    it('特殊字符的 API Key 应正确保存', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      const apiKey = 'sk-中文测试!@#$%^&*()_+-=[]{}|;\':",./<>?';

      await saveUserData(username, 'password123', {
        progress: {},
        apiKey,
      });

      const data = await loadUserData(username, 'password123');
      expect(data.data.apiKey).toBe(apiKey);
    });
  });

  describe('会话管理', () => {
    it('设置当前用户后应能获取', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      await setCurrentUser(username);

      const session = await getCurrentUser();
      expect(session?.username).toBe(username);
    });

    it('清除当前用户后应为空', async () => {
      const username = unique('alice');
      await createUser(username, 'password123');
      await setCurrentUser(username);
      await clearCurrentUser();

      const session = await getCurrentUser();
      expect(session).toBeNull();
    });
  });
});
