import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getChapter, getChapterIndex } from '@/lib/db';
import { urlToChapterId } from '@/lib/chapters';
import ChapterViewer from '@/components/ChapterViewer';
import ExercisePanel from '@/components/ExercisePanel';
import ChapterActions from './ChapterActions';

export async function generateStaticParams() {
  const chapters = getChapterIndex();
  return chapters.map(ch => ({ slug: urlToChapterId(ch.url) }));
}


export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapter = getChapter(slug);

  if (!chapter) {
    notFound();
  }

  const index = getChapterIndex();
  const currentOrder = chapter.order;
  const prevChapter = index.find(ch => ch.order === currentOrder - 1);
  const nextChapter = index.find(ch => ch.order === currentOrder + 1);

  // Build chapter context for AI tutor (text summary, limited to ~2000 chars)
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

  // Build chapter summary for exercise generation (shorter)
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

  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-foreground-muted mb-6">
        <Link href="/" className="hover:text-foreground transition-colors">
          首页
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
            href={`/chapters/${getIdFromUrl(prevChapter.url)}`}
            className="text-sm text-foreground-muted hover:text-primary transition-colors"
          >
            &larr; {prevChapter.title}
          </Link>
        ) : (
          <div />
        )}
        {nextChapter ? (
          <Link
            href={`/chapters/${getIdFromUrl(nextChapter.url)}`}
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

// Helper: derive chapter ID from URL
function getIdFromUrl(url: string): string {
  const slugMap: Record<string, string> = {
    'cpp-intro': '01-intro', 'cpp-environment-setup': '02-setup',
    'cpp-basic-syntax': '03-basic-syntax', 'cpp-comments': '04-comments',
    'cpp-data-types': '05-data-types', 'cpp-variable-types': '06-variable-types',
    'cpp-variable-scope': '07-variable-scope', 'cpp-constants-literals': '08-constants-literals',
    'cpp-modifier-types': '09-modifier-types', 'cpp-storage-classes': '10-storage-classes',
    'cpp-operators': '11-operators', 'cpp-loops': '12-loops',
    'cpp-decision': '13-decision', 'cpp-functions': '14-functions',
    'cpp-numbers': '15-numbers', 'cpp-arrays': '16-arrays',
    'cpp-strings': '17-strings', 'cpp-pointers': '18-pointers',
    'cpp-references': '19-references', 'cpp-date-time': '20-date-time',
    'cpp-basic-input-output': '21-io', 'cpp-struct': '22-struct',
    'cpp-vector': '23-vector', 'cpp-data-structures': '24-data-structures',
    'cpp-classes-objects': '25-classes-objects', 'cpp-inheritance': '26-inheritance',
    'cpp-overloading': '27-overloading', 'cpp-polymorphism': '28-polymorphism',
    'cpp-data-abstraction': '29-data-abstraction', 'cpp-data-encapsulation': '30-data-encapsulation',
    'cpp-interfaces': '31-interfaces', 'cpp-files-streams': '32-files-streams',
    'cpp-exceptions-handling': '33-exceptions', 'cpp-dynamic-memory': '34-dynamic-memory',
    'cpp-namespaces': '35-namespaces', 'cpp-templates': '36-templates',
    'cpp-preprocessor': '37-preprocessor', 'cpp-signal-handling': '38-signal-handling',
    'cpp-multithreading': '39-multithreading', 'cpp-web-programming': '40-web-programming',
  };
  const slug = url.split('/').pop()?.replace('.html', '') || '';
  return slugMap[slug] || slug;
}
