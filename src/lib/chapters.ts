import chapterIndexCpp from '../../data/chapters/00-index.json';
import chapterIndexPython from '../../data/python/00-index.json';
import chapterIndexJava from '../../data/java/00-index.json';
import { getIdFromUrl, SLUG_TO_ID_MAP } from './slugs';

export type Language = 'cpp' | 'python' | 'java';

export interface ChapterIndex {
  order: number;
  title: string;
  url: string;
}

export interface ChapterWithId extends ChapterIndex {
  id: string;
}

export const LANGUAGES: { key: Language; label: string; icon: string }[] = [
  { key: 'cpp', label: 'C++', icon: 'C++' },
  { key: 'python', label: 'Python', icon: '🐍' },
  { key: 'java', label: 'Java', icon: '☕' },
];

const LANGUAGE_INDEX: Record<Language, ChapterIndex[]> = {
  cpp: chapterIndexCpp as ChapterIndex[],
  python: chapterIndexPython as ChapterIndex[],
  java: chapterIndexJava as ChapterIndex[],
};

// ─── Public API ──────────────────────────────────────────────

export function getChapterIndex(language: Language = 'cpp'): ChapterIndex[] {
  return LANGUAGE_INDEX[language] || [];
}

export function getAllChapters(language: Language = 'cpp'): ChapterWithId[] {
  return getChapterIndex(language).map(ch => ({
    ...ch,
    id: getIdFromUrl(ch.url, language),
  }));
}

export function urlToChapterId(url: string, language: Language = 'cpp'): string {
  const slug = url.split('/').pop()?.replace('.html', '') || '';
  const map = SLUG_TO_ID_MAP[language];
  return map?.[slug] || slug;
}

/** Validate that a language string is one we support */
export function isLanguage(lang: string): lang is Language {
  return lang === 'cpp' || lang === 'python' || lang === 'java';
}
