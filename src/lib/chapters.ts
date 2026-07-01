import chapterIndex from '../../data/chapters/00-index.json';

export interface ChapterIndex {
  order: number;
  title: string;
  url: string;
}

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

export function getChapterIndex(): ChapterIndex[] {
  return chapterIndex as ChapterIndex[];
}

export function getAllChapters() {
  return getChapterIndex().map(ch => ({
    ...ch,
    id: urlToChapterId(ch.url),
  }));
}

export function urlToChapterId(url: string): string {
  const slug = url.split('/').pop()?.replace('.html', '') || '';
  return SLUG_TO_ID[slug] || slug;
}
