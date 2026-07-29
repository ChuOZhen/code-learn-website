/**
 * Data access layer for C++ learning platform.
 * Reads chapter data from JSON files and tracks progress in a JSON file.
 */
import fs from 'fs';
import path from 'path';
import { getIdFromUrl } from './slugs';

const DATA_BASE_DIR = path.join(process.cwd(), 'data');
const PROGRESS_FILE = path.join(process.cwd(), 'data', 'progress.json');

// ─── Types ───────────────────────────────────────────────────────

export interface ChapterIndex {
  order: number;
  title: string;
  url: string;
}

export interface ChapterSection {
  type: 'text' | 'code';
  content: string;
  lang?: string;
}

export interface Chapter {
  id: string;
  title: string;
  order: number;
  source_url: string;
  sections: ChapterSection[];
}

export interface ChapterWithProgress extends ChapterIndex {
  id: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface Progress {
  chapter_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  scroll_percent: number;
  updated_at: string;
}

export type Language = 'cpp' | 'python' | 'java';

const LANGUAGE_DIRS: Record<Language, string> = {
  cpp: 'chapters',
  python: 'python',
  java: 'java',
};

// ─── Chapter Data ────────────────────────────────────────────────

function getDataDir(language: Language): string {
  return path.join(DATA_BASE_DIR, LANGUAGE_DIRS[language]);
}

export function getChapterIndex(language: Language = 'cpp'): ChapterIndex[] {
  const indexPath = path.join(getDataDir(language), '00-index.json');
  const data = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(data);
}

export function getChapter(slug: string, language: Language = 'cpp'): Chapter | null {
  const dir = getDataDir(language);
  const files = fs.readdirSync(dir);
  const file = files.find(f => f.startsWith(slug) && f.endsWith('.json') && f !== '00-index.json');
  if (!file) return null;

  const data = fs.readFileSync(path.join(dir, file), 'utf-8');
  return JSON.parse(data);
}

export function getAllChapters(language: Language = 'cpp') {
  const index = getChapterIndex(language);
  return index.map(ch => ({
    ...ch,
    id: getIdFromUrl(ch.url, language),
  }));
}

export function getAllChaptersWithProgress(language: Language = 'cpp'): ChapterWithProgress[] {
  const index = getAllChapters(language);
  const progress = getAllProgress();
  const progressMap = new Map(progress.map(p => [p.chapter_id, p]));

  return index.map(ch => {
    const p = progressMap.get(ch.id);
    return {
      ...ch,
      status: p?.status || 'not_started',
    };
  });
}

// ─── Progress ────────────────────────────────────────────────────

function readProgress(): Progress[] {
  if (!fs.existsSync(PROGRESS_FILE)) return [];
  try {
    const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeProgress(progress: Progress[]) {
  fs.mkdirSync(path.dirname(PROGRESS_FILE), { recursive: true });
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

export function getAllProgress(): Progress[] {
  return readProgress();
}

export function getProgress(chapterId: string): Progress | null {
  const all = readProgress();
  return all.find(p => p.chapter_id === chapterId) || null;
}

export function updateProgress(
  chapterId: string,
  status: 'not_started' | 'in_progress' | 'completed',
  scrollPercent: number = 0
): Progress {
  const all = readProgress();
  const idx = all.findIndex(p => p.chapter_id === chapterId);
  const entry: Progress = {
    chapter_id: chapterId,
    status,
    scroll_percent: scrollPercent,
    updated_at: new Date().toISOString(),
  };

  if (idx >= 0) {
    all[idx] = entry;
  } else {
    all.push(entry);
  }

  writeProgress(all);
  return entry;
}
