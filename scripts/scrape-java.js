/**
 * Java 教程抓取脚本
 * 从菜鸟教程抓取 Java 教程，生成章节 JSON。
 * 
 * 用法: node scripts/scrape-java.js [--all | --chapter N]
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

const DATA_DIR = path.join(__dirname, '..', 'data', 'java');
const INDEX_FILE = path.join(DATA_DIR, '00-index.json');
const DELAY_MS = 1500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extractCodeFromHL(hlDiv) {
  return hlDiv.textContent.trim();
}

function urlToSlug(url) {
  const segments = url.replace('https://www.runoob.com', '').split('/');
  const last = segments[segments.length - 1];
  return last.replace('.html', '');
}

const SLUG_TO_ID = {
  'java-intro': '01-intro',
  'java-environment-setup': '02-env-setup',
  'java-basic-syntax': '03-basic-syntax',
  'java-comments': '04-comments',
  'java-object-classes': '05-object-classes',
  'java-basic-datatypes': '06-basic-datatypes',
  'java-variable-types': '07-variable-types',
  'java-variable-naming-rules': '08-naming-rules',
  'java-modifier-types': '09-modifier-types',
  'java-operators': '10-operators',
  'java-loop': '11-loop',
  'java-if-else-switch': '12-if-else-switch',
  'java-switch-case': '13-switch-case',
  'java-number': '14-number',
  'java-character': '15-character',
  'java-string': '16-string',
  'java-stringbuffer': '17-stringbuffer',
  'java-array': '18-array',
  'java-date-time': '19-date-time',
  'java-regular-expressions': '20-regex',
  'java-methods': '21-methods',
  'java-constructor': '22-constructor',
  'java-files-io': '23-files-io',
  'java-scanner-class': '24-scanner',
  'java-exceptions': '25-exceptions',
  'java-inheritance': '26-inheritance',
  'java-override-overload': '27-override-overload',
  'java-polymorphism': '28-polymorphism',
  'java-abstraction': '29-abstraction',
  'java-encapsulation': '30-encapsulation',
  'java-interfaces': '31-interfaces',
  'java-enum': '32-enum',
  'java-package': '33-package',
  'java-reflection': '34-reflection',
  'java-data-structures': '35-data-structures',
  'java-collections': '36-collections',
  'java-arraylist': '37-arraylist',
  'java-linkedlist': '38-linkedlist',
  'java-hashset': '39-hashset',
  'java-hashmap': '40-hashmap',
  'java-iterator': '41-iterator',
  'java-object-class': '42-object-class',
  'java-nio-file': '43-nio-file',
  'java-generics': '44-generics',
  'java-serialization': '45-serialization',
  'java-networking': '46-networking',
  'java-sending-email': '47-email',
  'java-multithreading': '48-multithreading',
  'java-applet-basics': '49-applet',
  'java-documentation': '50-documentation',
  'java-examples': '51-examples',
  'java8-new-features': '52-java8',
  'java-mysql-connect': '53-mysql',
  'java9-new-features': '54-java9',
  'java-quiz': '55-quiz',
  'java-libs': '56-libs',
};

async function scrapeChapter(url) {
  console.log(`  抓取: ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
  const html = await response.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const contentDiv = doc.querySelector('.article-intro#content');
  if (!contentDiv) throw new Error('未找到内容区域 (.article-intro#content)');

  const h1 = contentDiv.querySelector('h1');
  const title = h1 ? h1.textContent.trim().replace(/\s+/g, ' ') : '未知标题';
  const sections = [];

  const children = contentDiv.children;
  for (let i = 0; i < children.length; i++) {
    const el = children[i];
    const tag = el.tagName.toLowerCase();
    const cls = el.className || '';

    if (el.style?.display === 'none') continue;
    if (cls.includes('tutintro')) {
      const text = el.textContent.trim();
      if (text) sections.push({ type: 'text', content: text });
      continue;
    }

    // Code block: <div class="example">
    if (tag === 'div' && cls.includes('example')) {
      const codeDiv = el.querySelector('.example_code');
      if (codeDiv) {
        const hlMain = codeDiv.querySelector('.hl-main');
        if (hlMain) {
          const code = extractCodeFromHL(hlMain);
          if (code) {
            const heading = el.querySelector('h2, h3, h4');
            const desc = heading ? heading.textContent.trim() : '';
            const finalCode = desc ? `// ${desc}\n${code}` : code;
            sections.push({ type: 'code', lang: 'java', content: finalCode });
          }
        }
      }
      continue;
    }

    // <pre> block
    if (tag === 'pre') {
      const code = el.textContent.trim();
      if (code) sections.push({ type: 'code', lang: 'java', content: code });
      continue;
    }

    // Text blocks
    if (['p', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'blockquote', 'div', 'br', 'hr'].includes(tag)) {
      if (tag === 'div' && (cls.includes('ad') || cls.includes('example') || cls.includes('code'))) continue;
      if (tag === 'br' || tag === 'hr') {
        if (sections.length > 0 && sections[sections.length - 1].type === 'text') {
          sections[sections.length - 1].content += '\n';
        }
        continue;
      }
      const text = el.textContent.trim();
      if (!text || text.length < 2 || text.startsWith('AI 思')) continue;

      const last = sections[sections.length - 1];
      if (last && last.type === 'text') {
        last.content += '\n\n' + text;
      } else {
        sections.push({ type: 'text', content: text });
      }
      continue;
    }

    // <table>
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

  // Post-process
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
      section.content = section.content.replace(/\r\n/g, '\n').trim();
    }
    merged.push(section);
  }

  const cleanTitle = title.replace(/^\d+[\.\s]*/, '').replace(/\s+/g, ' ').trim();
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

async function main() {
  const args = process.argv.slice(2);
  const scrapeAll = args.includes('--all');
  const specificChapter = args.find(a => /^\d+$/.test(a));

  const index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  const toScrape = specificChapter
    ? index.filter(ch => ch.order === parseInt(specificChapter, 10))
    : index;

  if (toScrape.length === 0) {
    console.log('没有匹配的章节');
    return;
  }

  console.log(`准备抓取 ${toScrape.length} 个 Java 章节${specificChapter ? '' : '（全部）'}...\n`);

  for (const [i, ch] of toScrape.entries()) {
    const slug = urlToSlug(ch.url);
    const chapterId = SLUG_TO_ID[slug] || slug;
    const outFile = path.join(DATA_DIR, `${chapterId}.json`);

    if (fs.existsSync(outFile) && !scrapeAll) {
      console.log(`  跳过: ${ch.title} (${outFile} 已存在)`);
      continue;
    }

    try {
      console.log(`[${i + 1}/${toScrape.length}] ${ch.title}`);
      const chapter = await scrapeChapter(ch.url);
      fs.writeFileSync(outFile, JSON.stringify(chapter, null, 2), 'utf-8');
      console.log(`  ✓ 已保存 -> ${chapterId}.json (${chapter.sections.length} 个区块)`);
      if (i < toScrape.length - 1) await sleep(DELAY_MS);
    } catch (err) {
      console.error(`  ✗ 失败: ${err.message}`);
    }
  }

  console.log('\n抓取完成！');
}

main().catch(console.error);
