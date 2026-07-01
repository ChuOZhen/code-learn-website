import Link from 'next/link';
import { getAllChapters } from '@/lib/chapters';

export default function HomePage() {
  const chapters = getAllChapters();

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-background border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-6">
            开启你的 C++ 学习之旅
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-10">
            从零开始系统学习 C++，覆盖基础语法、面向对象、STL、模板等核心知识。
            通过 AI 驱动的练习题与实时辅导，让每一步学习都更有效率。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/chapters/${chapters[0]?.id || '01-intro'}`}
              className="px-8 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors shadow-lg shadow-primary/20"
            >
              开始学习
            </Link>
            <Link
              href={`/chapters/${chapters[1]?.id || '02-setup'}`}
              className="px-8 py-3 bg-card border border-border hover:border-primary/50 text-foreground font-medium rounded-xl transition-colors"
            >
              环境配置
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            共 {chapters.length} 个章节，循序渐进掌握 C++
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-16 w-full">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">
          为什么学习 C++？
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 text-xl">
              🚀
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">高性能开发</h3>
            <p className="text-sm text-muted leading-relaxed">
              C++ 被广泛用于游戏引擎、操作系统、嵌入式系统、高频交易等对性能要求极高的领域。
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 text-xl">
              🧠
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">深入计算机原理</h3>
            <p className="text-sm text-muted leading-relaxed">
              学习 C++ 能让你深入理解内存管理、指针、编译原理等计算机核心概念，夯实编程基础。
            </p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card/50 hover:border-primary/30 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4 text-xl">
              🌐
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">广阔的职业前景</h3>
            <p className="text-sm text-muted leading-relaxed">
              从游戏开发到人工智能底层，从嵌入式到云计算，C++ 开发者始终是不可或缺的技术力量。
            </p>
          </div>
        </div>
      </section>

      {/* How to use */}
      <section className="max-w-5xl mx-auto px-6 pb-16 w-full">
        <h2 className="text-2xl font-bold text-foreground text-center mb-12">
          如何使用本网站
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                1
              </span>
              <div>
                <h4 className="font-medium text-foreground mb-1">按顺序阅读章节</h4>
                <p className="text-sm text-muted leading-relaxed">
                  左侧目录包含 40 个章节，建议按照顺序依次学习。点击任意章节即可进入详情页。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                2
              </span>
              <div>
                <h4 className="font-medium text-foreground mb-1">完成 AI 练习题</h4>
                <p className="text-sm text-muted leading-relaxed">
                  每个章节底部都提供 AI 生成的练习题。选择难度、生成题目，并尝试独立作答。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                3
              </span>
              <div>
                <h4 className="font-medium text-foreground mb-1">标记学习进度</h4>
                <p className="text-sm text-muted leading-relaxed">
                  学完一章后点击"标记完成"。如果后续想复习，也可以随时"标记未完成"重新学习。
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                4
              </span>
              <div>
                <h4 className="font-medium text-foreground mb-1">使用 AI 助教</h4>
                <p className="text-sm text-muted leading-relaxed">
                  点击右下角的 AI 助教按钮，随时提问。AI 会基于当前章节内容给出针对性解答。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                5
              </span>
              <div>
                <h4 className="font-medium text-foreground mb-1">配置 API Key</h4>
                <p className="text-sm text-muted leading-relaxed">
                  首次使用 AI 功能前，请点击右下角设置按钮，输入 DeepSeek API Key，即可体验全部功能。
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <span className="shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                6
              </span>
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
          <Link
            href={`/chapters/${chapters[0]?.id || '01-intro'}`}
            className="inline-block px-8 py-3 bg-primary hover:bg-primary-hover text-white font-medium rounded-xl transition-colors"
          >
            进入第一章：{chapters[0]?.title || 'C++ 简介'}
          </Link>
        </div>
      </section>
    </div>
  );
}
