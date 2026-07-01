/**
 * Data access layer for C++ learning platform.
 * Reads chapter data from JSON files and tracks progress in a JSON file.
 */
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'chapters');
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

// ─── Chapter Data ────────────────────────────────────────────────

export function getChapterIndex(): ChapterIndex[] {
  const indexPath = path.join(DATA_DIR, '00-index.json');
  const data = fs.readFileSync(indexPath, 'utf-8');
  return JSON.parse(data);
}

export function getChapter(slug: string): Chapter | null {
  const files = fs.readdirSync(DATA_DIR);
  const file = files.find(f => f.startsWith(slug) && f.endsWith('.json') && f !== '00-index.json');
  if (!file) return null;

  const data = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
  return JSON.parse(data);
}

// Map runoob url slug to chapter id used in this app.
const SLUG_TO_ID: Record<string, string> = {
  'cpp-intro': '01-intro',
  'cpp-environment-setup': '02-setup',
  'cpp-basic-syntax': '03-basic-syntax',
  'cpp-comments': '04-comments',
  'cpp-data-types': '05-data-types',
  'cpp-variable-types': '06-variable-types',
  'cpp-variable-scope': '07-variable-scope',
  'cpp-constants-literals': '08-constants-literals',
  'cpp-modifier-types': '09-modifier-types',
  'cpp-storage-classes': '10-storage-classes',
  'cpp-operators': '11-operators',
  'cpp-loops': '12-loops',
  'cpp-decision': '13-decision',
  'cpp-functions': '14-functions',
  'cpp-numbers': '15-numbers',
  'cpp-arrays': '16-arrays',
  'cpp-strings': '17-strings',
  'cpp-pointers': '18-pointers',
  'cpp-references': '19-references',
  'cpp-date-time': '20-date-time',
  'cpp-basic-input-output': '21-io',
  'cpp-struct': '22-struct',
  'cpp-vector': '23-vector',
  'cpp-data-structures': '24-data-structures',
  'cpp-classes-objects': '25-classes-objects',
  'cpp-inheritance': '26-inheritance',
  'cpp-overloading': '27-overloading',
  'cpp-polymorphism': '28-polymorphism',
  'cpp-data-abstraction': '29-data-abstraction',
  'cpp-data-encapsulation': '30-data-encapsulation',
  'cpp-interfaces': '31-interfaces',
  'cpp-files-streams': '32-files-streams',
  'cpp-exceptions-handling': '33-exceptions',
  'cpp-dynamic-memory': '34-dynamic-memory',
  'cpp-namespaces': '35-namespaces',
  'cpp-templates': '36-templates',
  'cpp-preprocessor': '37-preprocessor',
  'cpp-signal-handling': '38-signal-handling',
  'cpp-multithreading': '39-multithreading',
  'cpp-web-programming': '40-web-programming',
};

function getIdFromUrl(url: string): string {
  const slug = url.split('/').pop()?.replace('.html', '') || '';
  return SLUG_TO_ID[slug] || slug;
}

export function getAllChapters() {
  const index = getChapterIndex();
  return index.map(ch => ({
    ...ch,
    id: getIdFromUrl(ch.url),
  }));
}

export function getAllChaptersWithProgress(): ChapterWithProgress[] {
  const index = getAllChapters();
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
