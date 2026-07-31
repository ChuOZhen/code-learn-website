'use client';

import type { Language } from './chapters';

export interface Exercise {
  question: string;
  hint: string;
  answer: string;
  explanation: string;
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
// DeepSeek 官方模型 ID（见 https://api-docs.deepseek.com/quick_start/pricing）
const MODEL = 'deepseek-v4-flash';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export function languageName(language: Language): string {
  if (language === 'python') return 'Python';
  if (language === 'java') return 'Java';
  return 'C++';
}

function buildAuthHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
}

// ─── Stream chat (for AI tutor) ───────────────────────────────────

export async function* streamDeepChat(
  apiKey: string,
  messages: ChatMessage[],
  signal?: AbortSignal
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: buildAuthHeaders(apiKey),
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: true,
    }),
    signal,
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`DeepSeek API 错误: ${response.status} - ${err}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) {
    throw new Error('无法读取流式响应');
  }

  // 用缓冲区按 SSE 事件（\n\n）切分，避免单条 data 被 TCP 分包拆散
  let buffer = '';

  const processEvent = (event: string): string | null => {
    let delta: string | null = null;
    for (const line of event.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') continue;
      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (typeof content === 'string' && content) delta = (delta || '') + content;
      } catch {
        // 跳过单条损坏的 SSE 数据，不影响整体流
      }
    }
    return delta;
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split('\n\n');
    // 最后一段可能是半截事件，留到下一轮
    buffer = events.pop() || '';

    for (const event of events) {
      const delta = processEvent(event);
      if (delta) yield delta;
    }
  }

  // flush 残余缓冲区
  if (buffer.trim()) {
    const delta = processEvent(buffer);
    if (delta) yield delta;
  }
}

// ─── Non-streaming chat (for exercises and check) ──────────────────

async function chatComplete(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: buildAuthHeaders(apiKey),
    body: JSON.stringify({
      model: MODEL,
      messages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const err = await response.text().catch(() => 'Unknown error');
    throw new Error(`DeepSeek API 错误: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

// ─── Exercise generation ───────────────────────────────────────────

export async function generateExercises(
  apiKey: string,
  language: Language,
  chapterTitle: string,
  chapterSummary: string,
  difficulty: string,
  count: number
): Promise<Exercise[]> {
  const langName = languageName(language);
  const systemPrompt = `你是 ${langName} 教学练习题生成器。根据给定的章节知识点，生成练习题。

输入：
- 章节标题：${chapterTitle}
- 章节知识点摘要：${chapterSummary}
- 难度：${difficulty || 'easy'}
- 题目数量：${count || 3}

要求：
1. 所有题目必须使用 ${langName} 语言，参考答案代码必须是可运行的 ${langName} 代码。
2. 题目必须只涉及该章节及之前章节已学过的知识点，不能用到更后面的内容。
3. 每道题包含：题目描述、一个简短提示（不直接透题）、完整参考答案代码、答案思路解析（2-3句话）。
4. 题目类型可以是填空、改错、补全代码或独立编程小题，难度要循序渐进。

严格按以下 JSON 格式输出，不要输出任何 JSON 之外的文字：

[
  {
    "question": "题目描述",
    "hint": "提示",
    "answer": "完整代码",
    "explanation": "思路解析"
  }
]`;

  const userPrompt = `请为"${chapterTitle}"章节生成 ${count || 3} 道${difficulty === 'medium' ? '中等' : '简单'}难度的 ${langName} 练习题。`;

  const content = await chatComplete(apiKey, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);

  return parseExercises(content);
}

function parseExercises(raw: string): Exercise[] {
  // 1. Direct parse
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Exercise[];
  } catch {}

  // 2. Parse from markdown code block
  const codeBlockMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    try {
      const parsed = JSON.parse(codeBlockMatch[1].trim());
      if (Array.isArray(parsed)) return parsed as Exercise[];
    } catch {}
  }

  // 3. Find the first top-level JSON array in the text
  const arrayMatch = raw.match(/(\[[\s\S]*\])/);
  if (arrayMatch) {
    try {
      const parsed = JSON.parse(arrayMatch[1]);
      if (Array.isArray(parsed)) return parsed as Exercise[];
    } catch {}
  }

  throw new Error('AI 返回格式异常，请重试');
}

// ─── Answer check ────────────────────────────────────────────────

export async function checkAnswer(
  apiKey: string,
  language: Language,
  question: string,
  userAnswer: string,
  referenceAnswer: string
): Promise<string> {
  const langName = languageName(language);
  const systemPrompt = `你是 ${langName} 自学网站的助教。请客观、耐心地检查学生的 ${langName} 答案，并给出评价。

评价要求：
1. 先判断学生的答案是否正确（或基本正确），注意使用 ${langName} 语法和习惯。
2. 如果正确，给予肯定，并简要说明优点。
3. 如果有错误或不完善，指出具体问题，并给出改进方向，但不要直接给出完整答案（引导学生自己修正）。
4. 保持简洁，用中文回答，语气鼓励。`;

  const userPrompt = `题目：
${question}

参考答案：
${referenceAnswer}

学生答案：
${userAnswer}

请评价学生答案。`;

  return chatComplete(apiKey, [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}
