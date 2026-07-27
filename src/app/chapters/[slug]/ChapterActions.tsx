'use client';

import { useEffect, useState } from 'react';
import AITutorChat from '@/components/AITutorChat';
import SettingsModal from '@/components/SettingsModal';
import { useAuth } from '@/components/AuthProvider';

export default function ChapterActions({
  chapterId,
  chapterTitle,
  chapterContext,
}: {
  chapterId: string;
  chapterTitle: string;
  chapterContext: string;
}) {
  const { progress, updateProgress } = useAuth();
  const status = progress[chapterId] || 'not_started';
  const [loading, setLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Mark as in_progress when first visiting
  useEffect(() => {
    if (status === 'not_started') {
      updateProgress(chapterId, 'in_progress').catch(() => {});
    }
  }, [chapterId, status]);

  const markComplete = async () => {
    setLoading(true);
    try {
      await updateProgress(chapterId, 'completed');
    } finally {
      setLoading(false);
    }
  };

  const markIncomplete = async () => {
    setLoading(true);
    try {
      await updateProgress(chapterId, 'in_progress');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mt-10 pt-6 border-t border-border">
        {/* Action buttons row */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-foreground-muted">
            {status === 'completed' && (
              <span className="text-success flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                已完成本章学习
              </span>
            )}
            {status === 'in_progress' && (
              <span>正在学习中...</span>
            )}
            {status === 'not_started' && (
              <span>尚未开始</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {status === 'completed' ? (
              <button
                onClick={markIncomplete}
                disabled={loading}
                className="px-4 py-2 bg-background border border-border hover:bg-background-elevated text-foreground text-sm font-medium rounded-lg transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : '标记未完成'}
              </button>
            ) : (
              <button
                onClick={markComplete}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : '标记完成'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating AI buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-30">
        <button
          onClick={() => setShowSettings(true)}
          className="w-12 h-12 bg-background-soft border border-border rounded-full flex items-center justify-center text-foreground-muted hover:text-foreground hover:border-primary/50 transition-all duration-200 shadow-lg hover:shadow-xl"
          title="API 设置"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <button
          onClick={() => setShowChat(true)}
          className="w-14 h-14 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary rounded-full flex items-center justify-center text-white transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-glow active:scale-95"
          title="AI 助教"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      </div>

      {/* AI Chat Panel */}
      {showChat && (
        <AITutorChat
          chapterTitle={chapterTitle}
          chapterContext={chapterContext}
          onClose={() => setShowChat(false)}
        />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal onClose={() => setShowSettings(false)} />
      )}
    </>
  );
}
