import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllChapters, LANGUAGES } from '@/lib/chapters';
import type { Language } from '@/lib/chapters';

export const metadata: Metadata = {
  title: '编程自学平台 - C++ / Python / Java 教程',
};

function LanguageSection({ langKey, langLabel, langIcon }: { langKey: Language; langLabel: string; langIcon: string }) {
  const chapters = getAllChapters(langKey);
  const firstChapterId = chapters[0]?.id || '01-intro';

  return (
    <section className="bg-gradient-to-b from-background-soft/60 to-background/40 border border-border rounded-xl p-6 shadow-md hover:shadow-lg hover:border-primary/30 transition-all duration-200 flex flex-col h-full">
      <div className="w-12 h-12 rounded-lg bg-primary-soft flex items-center justify-center text-primary mb-4 text-2xl">
        {langIcon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{langLabel} 教程</h3>
      <p className="text-sm text-muted leading-relaxed mb-4 flex-1">
        共 {chapters.length} 个章节，系统学习 {langLabel} 编程语言。
      </p>
      <div className="flex gap-2 mt-auto">
        <Link
          href={`/chapters/${langKey}/${firstChapterId}`}
          className="px-4 py-2 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white text-sm font-medium rounded-lg transition-all duration-200 active:scale-95"
        >
          开始学习
        </Link>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            开启你的编程学习之旅
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-10">
            从零开始系统学习编程语言，覆盖基础语法、面向对象、高级特性等核心知识。
            通过 AI 驱动的练习题与实时辅导，让每一步学习都更有效率。
          </p>
          <p className="text-sm text-foreground-muted">
            请选择一门语言开始学习
          </p>
        </div>
      </section>

      {/* Language selection */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">
          选择编程语言
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {LANGUAGES.map(lang => (
            <LanguageSection
              key={lang.key}
              langKey={lang.key}
              langLabel={lang.label}
              langIcon={lang.icon}
            />
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 pb-16 w-full">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">
          如何使用本网站
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">1</span>
              <div>
                <h4 className="font-medium text-foreground mb-1">选择语言，按顺序阅读</h4>
                <p className="text-sm text-muted leading-relaxed">
                  左侧目录可选择 C++、Python 或 Java，章节建议按顺序学习。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">2</span>
              <div>
                <h4 className="font-medium text-foreground mb-1">完成 AI 练习题</h4>
                <p className="text-sm text-muted leading-relaxed">
                  每个章节底部都提供 AI 生成的练习题。选择难度、生成题目，并尝试独立作答。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">3</span>
              <div>
                <h4 className="font-medium text-foreground mb-1">标记学习进度</h4>
                <p className="text-sm text-muted leading-relaxed">
                  学完一章后点击「标记完成」。如果后续想复习，也可以随时「标记未完成」重新学习。
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">4</span>
              <div>
                <h4 className="font-medium text-foreground mb-1">使用 AI 助教</h4>
                <p className="text-sm text-muted leading-relaxed">
                  点击右下角的 AI 助教按钮，随时提问。AI 会基于当前章节内容给出针对性解答。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">5</span>
              <div>
                <h4 className="font-medium text-foreground mb-1">配置 API Key</h4>
                <p className="text-sm text-muted leading-relaxed">
                  首次使用 AI 功能前，请点击右下角设置按钮，输入 DeepSeek API Key，即可体验全部功能。
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-sm">6</span>
              <div>
                <h4 className="font-medium text-foreground mb-1">随时随地复习</h4>
                <p className="text-sm text-muted leading-relaxed">
                  网站会自动保存你的学习进度，刷新页面或重新打开后可以继续上次的学习。
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mt-auto border-t border-border bg-card/30">
        <div className="max-w-4xl mx-auto px-6 py-10 text-center">
          <p className="text-foreground font-medium mb-4">准备好开始了吗？</p>
          <p className="text-sm text-foreground-muted">
            选择一门语言，开启你的学习之旅
          </p>
        </div>
      </section>
    </div>
  );
}
