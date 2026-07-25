'use client';

export interface Exercise {
  question: string;
  hint: string;
  answer: string;
  explanation: string;
}

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
      model: 'deepseek-v4-flash',
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

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6).trim();
        if (data === '[DONE]') continue;
        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // Skip malformed SSE data
        }
      }
    }
  }
}

// ─── Non-streaming chat (for exercises and check) ──────────────────

async function chatComplete(apiKey: string, messages: ChatMessage[]): Promise<string> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: buildAuthHeaders(apiKey),
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
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
  chapterTitle: string,
  chapterSummary: string,
  difficulty: string,
  count: number
): Promise<Exercise[]> {
  const systemPrompt = `你是 C++ 教学练习题生成器。根据给定的章节知识点，生成练习题。

输入：
- 章节标题：${chapterTitle}
- 章节知识点摘要：${chapterSummary}
- 难度：${difficulty || 'easy'}
- 题目数量：${count || 3}

要求：
1. 题目必须只涉及该章节及之前章节已学过的知识点，不能用到更后面的内容。
2. 每道题包含：题目描述、一个简短提示（不直接透题）、完整参考答案代码、答案思路解析（2-3句话）。
3. 题目类型可以是填空、改错、补全代码或独立编程小题，难度要循序渐进。

严格按以下 JSON 格式输出，不要输出任何 JSON 之外的文字：

[
  {
    "question": "题目描述",
    "hint": "提示",
    "answer": "完整代码",
    "explanation": "思路解析"
  }
]`;

  const userPrompt = `请为"${chapterTitle}"章节生成 ${count || 3} 道${difficulty === 'medium' ? '中等' : '简单'}难度的练习题。`;

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
  question: string,
  userAnswer: string,
  referenceAnswer: string
): Promise<string> {
  const systemPrompt = `你是 C++ 自学网站的助教。请客观、耐心地检查学生的答案，并给出评价。

评价要求：
1. 先判断学生的答案是否正确（或基本正确）。
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
