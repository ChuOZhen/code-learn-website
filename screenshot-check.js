const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/chapters/03-basic-syntax', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Generate exercises
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('h2'));
    const el = els.find(e => e.textContent?.includes('练习题'));
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  const generateButton = await page.locator('button:has-text("生成练习题")').first();
  if (generateButton) {
    await generateButton.click();
    await page.waitForTimeout(20000);
  }

  // Find first textarea and fill in answer
  const textarea = await page.locator('textarea[placeholder*="输入你的答案"]').first();
  if (textarea) {
    await textarea.fill('#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello C++" << endl;\n    return 0;\n}');
  }

  // Click submit check
  const submitButton = await page.locator('button:has-text("提交检查")').first();
  if (submitButton) {
    await submitButton.click();
    await page.waitForTimeout(15000);
  }

  // Scroll to the first exercise and screenshot
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('h2'));
    const el = els.find(e => e.textContent?.includes('练习题'));
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  await page.screenshot({ path: path.join(__dirname, 'exercise-check.png'), fullPage: false });
  console.log('Screenshot saved: exercise-check.png');

  await browser.close();
})();
