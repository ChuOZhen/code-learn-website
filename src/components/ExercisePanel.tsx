'use client';

import { useState } from 'react';
import CodeBlock from './CodeBlock';
import { useAuth } from './AuthProvider';
import { generateExercises, checkAnswer } from '@/lib/deepseek-client';

interface Exercise {
  question: string;
  hint: string;
  answer: string;
  explanation: string;
}

interface CheckResult {
  feedback: string;
}

export default function ExercisePanel({
  chapterId,
  chapterTitle,
  chapterSummary,
}: {
  chapterId: string;
  chapterTitle: string;
  chapterSummary: string;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium'>('easy');
  const [count, setCount] = useState(3);
  const { apiKey } = useAuth();
  const [revealedAnswers, setRevealedAnswers] = useState<Set<number>>(new Set());
  const [revealedHints, setRevealedHints] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [checkResults, setCheckResults] = useState<Record<number, CheckResult>>({});
  const [checking, setChecking] = useState<Record<number, boolean>>({});

  const generate = async () => {
    setLoading(true);
    setError('');
    setExercises([]);
    setRevealedAnswers(new Set());
    setRevealedHints(new Set());
    setUserAnswers({});
    setCheckResults({});
    setChecking({});

    try {
      if (!apiKey) {
        setError('请先在设置中配置 DeepSeek API Key');
        return;
      }
      const data = await generateExercises(apiKey, chapterTitle, chapterSummary, difficulty, count);
      setExercises(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleHint = (index: number) => {
    setRevealedHints(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const toggleAnswer = (index: number) => {
    setRevealedAnswers(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleUserAnswerChange = (index: number, value: string) => {
    setUserAnswers(prev => ({ ...prev, [index]: value }));
  };

  const submitCheck = async (index: number) => {
    const exercise = exercises[index];
    const userAnswer = userAnswers[index]?.trim();
    if (!userAnswer) return;

    setChecking(prev => ({ ...prev, [index]: true }));
    try {
      if (!apiKey) {
        setCheckResults(prev => ({ ...prev, [index]: { feedback: '请先在设置中配置 DeepSeek API Key' } }));
        return;
      }
      const feedback = await checkAnswer(apiKey, exercise.question, userAnswer, exercise.answer);
      setCheckResults(prev => ({ ...prev, [index]: { feedback } }));
    } catch (err) {
      setCheckResults(prev => ({ ...prev, [index]: { feedback: err instanceof Error ? err.message : '检查失败，请重试' } }));
    } finally {
      setChecking(prev => ({ ...prev, [index]: false }));
    }
  };

  // Split question into description and code blocks.
  // Supports both fenced markdown code blocks (``` ... ```) and inline C++-like code lines.
  const parseQuestion = (question: string): { description: string; code: string } => {
    // 1. Try to extract fenced code blocks first.
    const fencedCode: string[] = [];
    const description = question.replace(/```[\s\S]*?```/g, match => {
      const inner = match
        .split('\n')
        .slice(1, -1)
        .join('\n')
        .trim();
      if (inner) fencedCode.push(inner);
      return '\n';
    });

    if (fencedCode.length > 0) {
      return {
        description: description.replace(/\n{2,}/g, '\n').trim(),
        code: fencedCode.join('\n\n'),
      };
    }

    // 2. Fallback: classify lines as code or description heuristically.
    const lines = question.split('\n');
    const codeLines: string[] = [];
    const descLines: string[] = [];
    let inCode = false;

    const isCodeLine = (line: string): boolean => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('#include')) return true;
      if (trimmed.startsWith('using namespace')) return true;
      if (trimmed.startsWith('#define')) return true;
      if (/^\s*#\s*\w+/.test(trimmed)) return true;
      if (trimmed.startsWith('int main')) return true;
      if (/^\s*(void|int|float|double|char|bool|string|auto|class|struct)\s+\w+/.test(trimmed)) return true;
      if (/^\s*(if|for|while|switch)\s*\(/.test(trimmed)) return true;
      if (/^\s*(return|cout|cin|printf|scanf)\b/.test(trimmed)) return true;
      if (/^\s*[{}]\s*$/.test(trimmed)) return true;
      if (/^\s*\w+\s*[+\-*/]?=\s*.+;?/.test(trimmed)) return true;
      if (/^\s*\w+\s*\(/.test(trimmed) && /[;{}]/.test(trimmed)) return true;
      if (/^\s*\/\//.test(trimmed)) return true; // C++ single-line comment
      if (trimmed.includes('____')) return true;
      if (trimmed.includes('{') && trimmed.includes('}')) return true;
      if (trimmed.includes('std::') || trimmed.includes('<<') || trimmed.includes('>>')) return true;
      return false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (isCodeLine(line)) {
        inCode = true;
        codeLines.push(line);
      } else if (trimmed === '') {
        if (inCode) {
          codeLines.push(line);
        }
      } else {
        inCode = false;
        descLines.push(line);
      }
    }

    // Remove leading/trailing blank lines from code
    while (codeLines.length > 0 && codeLines[0].trim() === '') {
      codeLines.shift();
    }
    while (codeLines.length > 0 && codeLines[codeLines.length - 1].trim() === '') {
      codeLines.pop();
    }

    return {
      description: descLines.join('\n').trim(),
      code: codeLines.join('\n').trim(),
    };
  };

  const isIntroOrSetup = chapterId === '01-intro' || chapterId === '02-setup';

  return (
    <div className="mt-10 border-t border-border pt-8">
      <h2 className="text-2xl font-bold text-foreground mb-6">练习题</h2>

      {isIntroOrSetup ? (
        <p className="text-sm text-muted bg-background rounded-lg px-4 py-3">
          本章节为导论/环境设置内容，暂不提供 AI 练习题。
        </p>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <label className="text-sm text-foreground-muted">难度：</label>
          <select
            value={difficulty}
            onChange={e => setDifficulty(e.target.value as 'easy' | 'medium')}
            className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            <option value="easy">简单</option>
            <option value="medium">中等</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-foreground-muted">数量：</label>
          <select
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="px-3 py-1.5 bg-background border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200"
          >
            <option value={2}>2 题</option>
            <option value={3}>3 题</option>
            <option value={5}>5 题</option>
          </select>
        </div>

        <button
          onClick={generate}
          disabled={loading}
          className="px-5 py-1.5 bg-gradient-to-r from-primary to-primary-hover hover:from-primary-hover hover:to-primary text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? '生成中...' : exercises.length > 0 ? '重新生成' : '生成练习题'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-danger bg-danger-soft border border-danger/20 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-foreground-muted">
          <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm">AI 正在出题，请稍候...</p>
        </div>
      )}

      {/* Exercises */}
      {exercises.length > 0 && (
        <div className="space-y-8">
          {exercises.map((ex, i) => {
            const { description, code } = parseQuestion(ex.question);

            return (
              <div key={i} className="bg-background-soft border border-border rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200">
                {/* Question */}
                <div className="flex items-start gap-3 mb-4">
                  <span className="shrink-0 w-7 h-7 bg-primary-soft text-primary rounded-full flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap mb-3">
                      {description}
                    </p>
                    {code && <CodeBlock code={code} language="cpp" />}
                  </div>
                </div>

                {/* Hint */}
                <div className="ml-10 space-y-3">
                  <button
                    onClick={() => toggleHint(i)}
                    className="text-xs text-primary hover:text-primary-hover transition-colors"
                  >
                    {revealedHints.has(i) ? '收起提示' : '💡 查看提示'}
                  </button>
                  {revealedHints.has(i) && (
                    <p className="text-sm text-foreground-muted bg-background rounded-lg px-3 py-2 border border-border">
                      {ex.hint}
                    </p>
                  )}

                  {/* User answer input */}
                  <div className="bg-background border border-border rounded-lg p-3">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      你的答案
                    </label>
                    <textarea
                      value={userAnswers[i] || ''}
                      onChange={e => handleUserAnswerChange(i, e.target.value)}
                      placeholder="在这里输入你的答案或代码..."
                      rows={4}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-foreground-subtle focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-y font-mono transition-all duration-200"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        onClick={() => submitCheck(i)}
                        disabled={checking[i] || !userAnswers[i]?.trim()}
                        className="px-4 py-1.5 bg-gradient-to-r from-success to-green-500 hover:from-green-500 hover:to-green-600 text-white text-xs font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                      >
                        {checking[i] ? '检查中...' : '提交检查'}
                      </button>
                      <span className="text-xs text-foreground-muted">
                        AI 会根据参考答案评价你的答案
                      </span>
                    </div>
                  </div>

                  {/* Check result */}
                  {checkResults[i] && (
                    <div className="bg-primary-soft border border-primary/20 rounded-lg p-3">
                      <p className="text-sm font-medium text-foreground mb-1">AI 评价</p>
                      <p className="text-sm text-foreground/90 whitespace-pre-wrap">
                        {checkResults[i].feedback}
                      </p>
                    </div>
                  )}

                  {/* Answer */}
                  <button
                    onClick={() => toggleAnswer(i)}
                    className="text-xs text-success hover:text-green-400 transition-colors block"
                  >
                    {revealedAnswers.has(i) ? '收起答案' : '✅ 查看答案'}
                  </button>
                  {revealedAnswers.has(i) && (
                    <div className="space-y-3">
                      <CodeBlock code={ex.answer} language="cpp" />
                      <p className="text-sm text-foreground-muted bg-background rounded-lg px-3 py-2 border border-border">
                        <span className="font-medium text-foreground">思路解析：</span>
                        {ex.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
        </>
      )}
    </div>
  );
}
