import puppeteer from '../frontend/node_modules/puppeteer-core/lib/puppeteer/puppeteer-core.js';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\Akuthota\\.gemini\\antigravity\\brain\\626448c4-17ea-4aad-a80f-0c3d9af051c5\\scratch';

async function runScreenshots() {
  console.log('Launching headless Chrome for full-page verification...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();

  // 1. Mobile (iPhone 14)
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true
  });

  console.log('Testing mobile home (dark)...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Top viewport screenshot
  await page.screenshot({ path: path.join(screenshotDir, '01_mobile_top_dark.png') });
  console.log('Saved 01_mobile_top_dark.png');

  // Full page screenshot mobile dark
  await page.screenshot({ path: path.join(screenshotDir, '02_mobile_full_home_dark.png'), fullPage: true });
  console.log('Saved 02_mobile_full_home_dark.png');

  // Switch to light mode
  const themeBtn = await page.$('button[title="Toggle Theme"]');
  if (themeBtn) {
    console.log('Switching to light mode...');
    await themeBtn.click();
    await new Promise(r => setTimeout(r, 600));

    await page.screenshot({ path: path.join(screenshotDir, '03_mobile_top_light.png') });
    console.log('Saved 03_mobile_top_light.png');

    await page.screenshot({ path: path.join(screenshotDir, '04_mobile_full_home_light.png'), fullPage: true });
    console.log('Saved 04_mobile_full_home_light.png');
  }

  // 2. Desktop (1280x800)
  console.log('Testing desktop view...');
  await page.setViewport({
    width: 1280,
    height: 800,
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false
  });

  // Reload for dark mode
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(screenshotDir, '05_desktop_home_top.png') });
  console.log('Saved 05_desktop_home_top.png');

  await page.screenshot({ path: path.join(screenshotDir, '06_desktop_full_home.png'), fullPage: true });
  console.log('Saved 06_desktop_full_home.png');

  await browser.close();
  console.log('Verification screenshots captured successfully!');
}

runScreenshots().catch(err => {
  console.error('Screenshot script error:', err);
  process.exit(1);
});
