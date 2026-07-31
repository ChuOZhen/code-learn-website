/**
 * Python 教程抓取脚本
 * 从菜鸟教程抓取 Python 2.x 教程，生成与 C++ 一致的章节 JSON 格式。
 * 
 * 用法: node scripts/scrape-python.js [--all | --chapter N]
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DATA_DIR = path.join(__dirname, '..', 'data', 'python');
const INDEX_FILE = path.join(DATA_DIR, '00-index.json');
const DELAY_MS = 1500; // 抓取间隔，避免触发反爬

// ─── Helpers ──────────────────────────────────────────────────

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/** Extract clean text from an hl-main code block by stripping all spans */
function extractCodeFromHL(hlDiv) {
  // Return the text content (strips all HTML tags)
  return hlDiv.textContent.trim();
}

/** Get title from URL (last segment without .html) */
function urlToSlug(url) {
  const segments = url.replace('https://www.runoob.com', '').split('/');
  const last = segments[segments.length - 1];
  return last.replace('.html', '');
}

/** Map URL slug to numeric chapter ID */
const SLUG_TO_ID = {
  'python-intro': '01-intro',
  'python-install': '02-install',
  'python-chinese-encoding': '03-encoding',
  'python2-vscode-setup': '04-vscode',
  'python-basic-syntax': '05-basic-syntax',
  'python-variable-types': '06-variable-types',
  'python-operators': '07-operators',
  'python-if-statement': '08-if-statement',
  'python-loops': '09-loops',
  'python-while-loop': '10-while-loop',
  'python-for-loop': '11-for-loop',
  'python-nested-loops': '12-nested-loops',
  'python-break-statement': '13-break-statement',
  'python-continue-statement': '14-continue-statement',
  'python-pass-statement': '15-pass-statement',
  'python-numbers': '16-numbers',
  'python-strings': '17-strings',
  'python-lists': '18-lists',
  'python-tuples': '19-tuples',
  'python-dictionary': '20-dictionary',
  'python-date-time': '21-date-time',
  'python-functions': '22-functions',
  'python-modules': '23-modules',
  'python-files-io': '24-files-io',
  'file-methods': '25-file-methods',
  'python-exceptions': '26-exceptions',
  'os-file-methods': '27-os-file-methods',
  'python-built-in-functions': '28-built-in-functions',
  'python-object': '29-object',
  'python-reg-expressions': '30-reg-expressions',
  'python-cgi': '31-cgi',
  'python-mysql': '32-mysql',
  'python-socket': '33-socket',
  'python-email': '34-email',
  'python-multithreading': '35-multithreading',
  'python-xml': '36-xml',
  'python-gui-tkinter': '37-gui-tkinter',
  'python-2x-3x': '38-2x-3x',
  'python-ide': '39-ide',
  'python-json': '40-json',
  'python-ai-draw': '41-ai-draw',
  'python-100-examples': '42-100-examples',
  'python-quiz': '43-quiz',
};

// ─── Scrape Single Chapter ────────────────────────────────────

async function scrapeChapter(url) {
  console.log(`  抓取: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${url}`);
  }
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  // Find article-intro content div
  const contentDiv = doc.querySelector('.article-intro#content');
  if (!contentDiv) {
    throw new Error('未找到内容区域 (.article-intro#content)');
  }

  // Get title from h1 inside content
  const h1 = contentDiv.querySelector('h1');
  const title = h1 ? h1.textContent.trim().replace(/\s+/g, ' ') : '未知标题';

  const sections = [];

  // Walk child nodes
  const children = contentDiv.children;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const tag = el.tagName.toLowerCase();
    const cls = el.className || '';

    // Skip hidden / irrelevant elements
    if (el.style?.display === 'none') continue;
    if (cls.includes('tutintro') || cls.includes('archive-list') || cls.includes('example_code')) {
      // tutintro is part of the text — handle its children
      if (cls.includes('tutintro')) {
        const text = el.textContent.trim();
        if (text) sections.push({ type: 'text', content: text });
      }
      continue;
    }

    // ── Code block: <div class="example"> ──
    if (tag === 'div' && cls.includes('example')) {
      const codeDiv = el.querySelector('.example_code');
      if (codeDiv) {
        const hlMain = codeDiv.querySelector('.hl-main');
        if (hlMain) {
          const code = extractCodeFromHL(hlMain);
          if (code) {
            // Add a brief description if there's an h2 heading
            const heading = el.querySelector('h2, h3, h4');
            const desc = heading ? heading.textContent.trim() : '';
            const finalCode = desc ? `# ${desc}\n${code}` : code;
            sections.push({ type: 'code', lang: 'python', content: finalCode });
          }
        }
      }
      continue;
    }

    // ── <pre> block ──
    if (tag === 'pre') {
      const code = el.textContent.trim();
      if (code) {
        sections.push({ type: 'code', lang: 'python', content: code });
      }
      continue;
    }

    // ── Text blocks: <p>, <h2>, <h3>, <ul>, <ol>, <blockquote>, <hr>, <br> ──
    if (['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'div', 'br', 'hr'].includes(tag)) {
      // For <div>, only process plain divs (skip example, ad, etc.)
      if (tag === 'div' && (cls.includes('ad') || cls.includes('example') || cls.includes('code'))) {
        continue;
      }

      // For <br> and <hr>, add a paragraph break
      if (tag === 'br' || tag === 'hr') {
        if (sections.length > 0 && sections[sections.length - 1].type === 'text') {
          sections[sections.length - 1].content += '\n';
        }
        continue;
      }

      const text = el.textContent.trim();
      if (!text) continue;

      // Skip empty-looking or nav-related text
      if (text.length < 2) continue;
      if (text.startsWith('AI 思')) continue; // Skip AI thinking section

      // Merge consecutive text sections
      const last = sections[sections.length - 1];
      if (last && last.type === 'text') {
        last.content += '\n\n' + text;
      } else {
        sections.push({ type: 'text', content: text });
      }
      continue;
    }

    // ── <table> ──
    if (tag === 'table') {
      const text = el.textContent.trim();
      if (text) {
        const last = sections[sections.length - 1];
        if (last && last.type === 'text') {
          last.content += '\n\n' + text;
        } else {
          sections.push({ type: 'text', content: text });
        }
      }
      continue;
    }
  }

  // Post-process: merge consecutive text sections, clean whitespace
  const merged = [];
  for (const section of sections) {
    if (section.type === 'text') {
      section.content = section.content
        .replace(/\n{4,}/g, '\n\n')
        .replace(/\s+\n/g, '\n')
        .trim();
      if (!section.content) continue;
    }
    if (section.type === 'code' && section.content) {
      // Clean up the code content
      section.content = section.content.replace(/\r\n/g, '\n').trim();
    }
    merged.push(section);
  }

  // Extract the heading from first text section for clean title
  const cleanTitle = title
    .replace(/^\d+[\.\s]*/, '')
    .replace(/\s+/g, ' ')
    .trim();

  const slug = urlToSlug(url);
  const chapterId = SLUG_TO_ID[slug] || slug;

  return {
    id: chapterId,
    title: cleanTitle,
    order: parseInt(chapterId.split('-')[0], 10),
    source_url: url,
    sections: merged,
  };
}

// ─── Main ─────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const scrapeAll = args.includes('--all');
  const specificChapter = args.find(a => /^\d+$/.test(a));

  // Read index
  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));

  const toScrape = specificChapter
    ? index.filter(ch => ch.order === parseInt(specificChapter, 10))
    : index;

  if (toScrape.length === 0) {
    console.log('没有匹配的章节');
    return;
  }

  console.log(`准备抓取 ${toScrape.length} 个章节${specificChapter ? '' : '（全部）'}...\n`);

  for (const [i, ch] of toScrape.entries()) {
    const slug = urlToSlug(ch.url);
    const chapterId = SLUG_TO_ID[slug] || slug;
    const outFile = path.join(DATA_DIR, `${chapterId}.json`);

    // Skip if already exists (unless --all is explicitly passed)
    if (fs.existsSync(outFile) && !scrapeAll) {
      console.log(`  跳过: ${ch.title} (${outFile} 已存在)`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${toScrape.length}] ${ch.title}`);
      const chapter = await scrapeChapter(ch.url);
      fs.writeFileSync(outFile, JSON.stringify(chapter, null, 2), 'utf-8');
      console.log(`  ✓ 已保存 -> ${chapterId}.json (${chapter.sections.length} 个区块)`);

      // Delay between requests
      if (i < toScrape.length - 1) {
        await sleep(DELAY_MS);
      }
    } catch (err) {
      console.error(`  ✗ 失败: ${err.message}`);
    }
  }

  console.log('\n抓取完成！');
}

main().catch(console.error);
