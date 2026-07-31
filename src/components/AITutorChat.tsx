'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { streamDeepChat } from '@/lib/deepseek-client';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AITutorChat({
  chapterTitle,
  chapterContext,
  language = 'cpp',
  onClose,
}: {
  chapterTitle: string;
  chapterContext: string;
  language?: string;
  onClose: () => void;
}) {
  const { apiKey } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const languageName = language === 'python' ? 'Python' : language === 'java' ? 'Java' : 'C++';

  const systemPrompt = `你是一个${languageName}自学网站里的助教。你的学生正在自学${languageName}，当前正在学习的章节是：
${chapterTitle}

章节要点如下：
${chapterContext}

回答原则：
1. 优先用启发式提问和提示引导学生自己想清楚，不要一上来就甩出完整答案代码。
2. 只有当学生明确说"直接给我答案/代码"时，才给出完整、可运行的代码，并附简短解释。
3. 解释概念时结合当前章节的知识点，避免跳跃到还没学到的内容（除非学生主动问）。
4. 学生代码报错时，先用自然语言描述错误可能的原因，再引导学生自己定位，而不是直接告诉他改哪一行。
5. 回答用中文，代码注释可以中英混用，保持简洁，不要长篇大论。`;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setLoading(true);

    try {
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ 请先在设置中配置 DeepSeek API Key' }]);
        setLoading(false);
        return;
      }

      let assistantContent = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      const chatMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...newMessages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];

      const stream = streamDeepChat(apiKey, chatMessages);
      for await (const delta of stream) {
        assistantContent += delta;
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
          return updated;
        });
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${err instanceof Error ? err.message : '网络错误，请重试'}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-background-soft border-l border-border flex flex-col z-40 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI 助教</h3>
          <p className="text-xs text-foreground-muted">正在学习：{chapterTitle}</p>
        </div>
        <button
          onClick={onClose}
          className="text-foreground-muted hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-background-elevated"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-foreground-muted text-sm py-10">
            <p className="mb-2">👋 你好！我是你的 {languageName} 助教。</p>
            <p>关于「{chapterTitle}」有什么不懂的，尽管问我！</p>
            <p className="mt-2 text-xs text-foreground-subtle">我会尽量引导你自己思考，而不是直接给答案哦。</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-primary to-primary-hover text-white shadow-md'
                  : 'bg-background border border-border text-foreground shadow-sm'
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? '思考中...' : '')}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入你的问题..."
            rows={1}
            className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none transition-all duration-200"
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-3 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
