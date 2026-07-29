'use client';

import { useEffect } from 'react';

export default function ChapterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="max-w-4xl mx-auto px-8 py-20 text-center">
      <h2 className="text-2xl font-bold text-foreground mb-4">加载失败</h2>
      <p className="text-foreground-muted mb-6">
        {error.message || '加载章节时出现问题，请稍后重试。'}
      </p>
      <button
        onClick={reset}
        className="px-5 py-2.5 bg-gradient-to-r from-primary to-primary-hover text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg active:scale-95"
      >
        重试
      </button>
    </div>
  );
}
