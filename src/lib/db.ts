/**
 * 服务端数据访问层：读取章节正文 JSON。
 * 章节目录（索引）由 src/lib/chapters.ts 静态导入提供；
 * 学习进度由客户端 localUser（IndexedDB，按语言隔离）管理。
 */
import fs from 'fs';
import path from 'path';

export type Language = 'cpp' | 'python' | 'java';

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

const DATA_BASE_DIR = path.join(process.cwd(), 'data');

const LANGUAGE_DIRS: Record<Language, string> = {
  cpp: 'cpp',
  python: 'python',
  java: 'java',
};

function getDataDir(language: Language): string {
  return path.join(DATA_BASE_DIR, LANGUAGE_DIRS[language]);
}

export function getChapter(slug: string, language: Language = 'cpp'): Chapter | null {
  const dir = getDataDir(language);
  const file = path.join(dir, `${slug}.json`);
  if (!fs.existsSync(file)) return null;

  try {
    const data = fs.readFileSync(file, 'utf-8');
    return JSON.parse(data) as Chapter;
  } catch {
    return null;
  }
}
