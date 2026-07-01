import CodeBlock from './CodeBlock';
import type { ChapterSection } from '@/lib/db';

export default function ChapterViewer({ sections }: { sections: ChapterSection[] }) {
  if (!sections || sections.length === 0) {
    return (
      <div className="text-muted text-center py-20">
        <p className="text-lg">暂无内容</p>
        <p className="text-sm mt-2">本章节内容正在准备中</p>
      </div>
    );
  }

  return (
    <div className="prose-custom max-w-none">
      {sections.map((section, index) => {
        if (section.type === 'code') {
          return <CodeBlock key={index} code={section.content} language={section.lang || 'cpp'} />;
        }

        // Text section: split by newlines to render separate paragraphs
        const paragraphs = section.content.split('\n').filter(p => p.trim());

        return (
          <div key={index} className="mb-4">
            {paragraphs.map((para, pi) => (
              <p key={pi} className="text-foreground/90 leading-7 mb-3">
                {para}
              </p>
            ))}
          </div>
        );
      })}
    </div>
  );
}
