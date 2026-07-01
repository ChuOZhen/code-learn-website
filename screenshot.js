const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true });

  const shots = [
    { name: 'home', url: 'http://localhost:3000', width: 1440, height: 900 },
    { name: 'chapter-intro', url: 'http://localhost:3000/chapters/01-intro', width: 1440, height: 900 },
    { name: 'chapter-basic-syntax', url: 'http://localhost:3000/chapters/03-basic-syntax', width: 1440, height: 900 },
    { name: 'mobile-home', url: 'http://localhost:3000', width: 375, height: 812 },
    { name: 'mobile-menu-open', url: 'http://localhost:3000', width: 375, height: 812, click: 'button[aria-label="打开菜单"]' },
  ];

  for (const shot of shots) {
    const context = await browser.newContext({ viewport: { width: shot.width, height: shot.height } });
    const page = await context.newPage();
    await page.goto(shot.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    if (shot.click) {
      try {
        await page.click(shot.click);
        await page.waitForTimeout(500);
      } catch {
        console.log(`Click skipped for ${shot.name}`);
      }
    }

    await page.screenshot({
      path: path.join(__dirname, `${shot.name}.png`),
      fullPage: true,
    });
    console.log(`Screenshot saved: ${shot.name}.png`);
    await context.close();
  }

  await browser.close();
})();
