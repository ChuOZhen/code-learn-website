import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getChapter, getChapterIndex } from '@/lib/db';
import { isLanguage, type Language } from '@/lib/chapters';
import { getIdFromUrl as getSlugIdFromUrl } from '@/lib/slugs';
import ChapterViewer from '@/components/ChapterViewer';
import ExercisePanel from '@/components/ExercisePanel';
import ChapterActions from './ChapterActions';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string; slug: string }>;
}): Promise<Metadata> {
  const { language: langParam, slug } = await params;
  if (!isLanguage(langParam)) return { title: '编程自学平台' };
  const language = langParam as Language;
  const chapter = getChapter(slug, language);
  if (!chapter) {
    const langLabel = language === 'cpp' ? 'C++' : language === 'python' ? 'Python' : 'Java';
    return { title: `${langLabel} 自学平台` };
  }
  const langLabel = language === 'cpp' ? 'C++' : language === 'python' ? 'Python' : 'Java';
  const title = chapter ? `${chapter.title} - ${langLabel} 教程` : `${langLabel} 自学平台`;
  return { title };
}

export async function generateStaticParams() {
  const languages: Language[] = ['cpp', 'python', 'java'];
  const params: { language: string; slug: string }[] = [];

  for (const lang of languages) {
    const chapters = getChapterIndex(lang);
    for (const ch of chapters) {
      const slug = urlToChapterId(ch.url, lang);
      params.push({ language: lang, slug });
    }
  }
  return params;
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ language: string; slug: string }>;
}) {
  const { language: langParam, slug } = await params;

  if (!isLanguage(langParam)) {
    notFound();
  }
  const language = langParam as Language;

  const chapter = getChapter(slug, language);
  if (!chapter) {
    notFound();
  }

  const index = getChapterIndex(language);
  const currentOrder = chapter.order;
  const prevChapter = index.find(ch => ch.order === currentOrder - 1);
  const nextChapter = index.find(ch => ch.order === currentOrder + 1);

  // Build chapter context for AI tutor
  const contextParts: string[] = [];
  let contextLen = 0;
  for (const s of chapter.sections) {
    if (s.type === 'text' && contextLen < 2000) {
      const remaining = 2000 - contextLen;
      const text = s.content.length > remaining ? s.content.slice(0, remaining) + '...' : s.content;
      contextParts.push(text);
      contextLen += text.length;
    }
  }
  const chapterContext = contextParts.join('\n');

  // Build chapter summary for exercise generation
  const summaryParts: string[] = [];
  let summaryLen = 0;
  for (const s of chapter.sections) {
    if (s.type === 'text' && summaryLen < 800) {
      const remaining = 800 - summaryLen;
      const text = s.content.length > remaining ? s.content.slice(0, remaining) + '...' : s.content;
      summaryParts.push(text);
      summaryLen += text.length;
    }
  }
  const chapterSummary = summaryParts.join('\n');

  const langLabel = language === 'cpp' ? 'C++' : language === 'python' ? 'Python' : 'Java';

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          首页
        </Link>
        <span>/</span>
        <Link href={`/chapters/${language}/${getSlugIdFromUrl(index[0]?.url || '', language)}`} className="hover:text-foreground transition-colors">
          {langLabel}
        </Link>
        <span>/</span>
        <span className="text-foreground">{chapter.title}</span>
      </div>

      {/* Title */}
      <h1 className="text-3xl font-bold text-foreground mb-2">{chapter.title}</h1>
      <div className="flex items-center gap-4 mb-8">
        <span className="text-xs text-foreground-muted font-mono">
          第 {chapter.order}/{index.length} 章
        </span>
        <a
          href={chapter.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          内容来源：菜鸟教程
        </a>
      </div>

      {/* Chapter content */}
      <ChapterViewer sections={chapter.sections} />

      {/* Actions: mark complete + AI buttons */}
      <ChapterActions
        chapterId={chapter.id}
        chapterTitle={chapter.title}
        chapterContext={chapterContext}
        language={language}
      />

      {/* Exercise Panel */}
      <ExercisePanel
        chapterId={chapter.id}
        chapterTitle={chapter.title}
        chapterSummary={chapterSummary}
      />

      {/* Previous / Next navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
        {prevChapter ? (
          <Link
            href={`/chapters/${language}/${getSlugIdFromUrl(prevChapter.url, language)}`}
            className="text-sm text-foreground-muted hover:text-primary transition-colors"
          >
            &larr; {prevChapter.title}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/chapters/${language}/${getSlugIdFromUrl(nextChapter.url, language)}`}
            className="text-sm text-foreground-muted hover:text-primary transition-colors"
          >
            {nextChapter.title} &rarr;
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}

// ─── Helpers ────────────────────────────────────────────────

function urlToChapterId(url: string, language: Language): string {
  return getSlugIdFromUrl(url, language);
}
