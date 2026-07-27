'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { getChapterIndex, urlToChapterId } from '@/lib/chapters';

interface Chapter {
  order: number;
  title: string;
  url: string;
}



export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, logout, progress } = useAuth();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setChapters(getChapterIndex());
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const completedCount = Object.values(progress).filter(s => s === 'completed').length;

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-md bg-background-soft border border-border text-foreground shadow-lg hover:bg-background-elevated transition-all duration-200"
        aria-label={isOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={isOpen}
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-40 h-full
          bg-background-soft border-r border-border flex flex-col shrink-0
          transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-0 md:w-16 overflow-hidden' : 'w-72'}
        `}
      >
        {/* Header */}
        <div className="p-5 border-b border-border flex items-start justify-between">
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <Link href="/" className="block group" onClick={() => setIsOpen(false)}>
              <h1 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                C++ 自学平台
              </h1>
            </Link>
            <p className="text-xs text-foreground-muted mt-1.5">
              学习进度 {completedCount}/{chapters.length}
            </p>
            {/* Progress bar */}
            <div className="mt-2.5 h-2 bg-background rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary-hover rounded-full transition-all duration-500"
                style={{
                  width: `${chapters.length > 0 ? (completedCount / chapters.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          {/* Collapse / expand button (desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-elevated transition-colors shrink-0"
            title={isCollapsed ? '展开目录' : '收起目录'}
            aria-label={isCollapsed ? '展开目录' : '收起目录'}
          >
            <svg
              className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Current user */}
        {!isCollapsed && currentUser && (
          <div className="px-5 py-3 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground-muted">当前用户</p>
                <p className="text-sm font-medium text-foreground">{currentUser}</p>
              </div>
              <button
                onClick={() => logout()}
                className="text-xs text-danger hover:text-red-300 transition-colors">
                退出
              </button>
            </div>
          </div>
        )}

        {/* Chapter list */}
        <nav className={`flex-1 overflow-y-auto py-2 ${isCollapsed ? 'hidden md:hidden' : 'block'}`}>
          {chapters.map(chapter => {
            const id = urlToChapterId(chapter.url);
            const status = progress[id] || 'not_started';
            const isActive = pathname === `/chapters/${id}`;

            return (
              <Link
                key={chapter.order}
                href={`/chapters/${id}`}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all duration-200 border-l-2 ${
                  isActive
                    ? 'bg-primary-soft text-primary border-primary font-medium'
                    : 'text-foreground-muted hover:text-foreground hover:bg-white/5 border-transparent'
                }`}
              >
                <span className="text-xs font-mono w-6 text-right opacity-60 shrink-0">
                  {String(chapter.order).padStart(2, '0')}
                </span>
                <span className="truncate flex-1">{chapter.title}</span>
                {status === 'completed' && (
                  <span className="text-success text-xs shrink-0">&#10003;</span>
                )}
                {isActive && status === 'in_progress' && (
                  <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
