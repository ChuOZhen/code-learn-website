const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  await page.goto('http://localhost:3000/chapters/03-basic-syntax', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  // Screenshot before generating exercises
  await page.screenshot({ path: path.join(__dirname, 'exercise-before.png'), fullPage: false });
  console.log('Screenshot saved: exercise-before.png');

  // Scroll to exercise panel and click generate
  await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('h2'));
    const el = els.find(e => e.textContent?.includes('练习题'));
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(500);

  const generateButton = await page.locator('button:has-text("生成练习题")').first();
  if (generateButton) {
    await generateButton.click();
    await page.waitForTimeout(20000); // Wait for API response

    await page.screenshot({ path: path.join(__dirname, 'exercise-after.png'), fullPage: false });
    console.log('Screenshot saved: exercise-after.png');

    // Try to click "查看答案" buttons
    try {
      const answerButtons = await page.locator('button:has-text("查看答案")').all();
      for (const btn of answerButtons.slice(0, 2)) {
        await btn.click();
        await page.waitForTimeout(300);
      }
      await page.screenshot({ path: path.join(__dirname, 'exercise-answers.png'), fullPage: false });
      console.log('Screenshot saved: exercise-answers.png');
    } catch (e) {
      console.log('Answer buttons not found or click failed:', e.message);
    }
  }

  await browser.close();
})();
