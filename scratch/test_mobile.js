import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const screenshotDir = 'C:\\Users\\Akuthota\\.gemini\\antigravity\\brain\\626448c4-17ea-4aad-a80f-0c3d9af051c5\\scratch';

async function runMobileTest() {
  console.log('Launching headless Chrome with mobile emulation...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--window-size=390,844'
    ]
  });

  const page = await browser.newPage();
  
  // Emulate iPhone 14
  await page.setViewport({
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true
  });

  // Track console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
      console.log('PAGE ERROR:', msg.text());
    } else {
      console.log('PAGE LOG:', msg.text());
    }
  });

  page.on('pageerror', err => {
    errors.push(err.message);
    console.log('PAGE UNCAUGHT ERROR:', err.message);
  });

  console.log('Navigating to http://localhost:5173/ ...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });

  // Take screenshot 1: initial mobile view
  await page.screenshot({ path: path.join(screenshotDir, '01_mobile_home.png') });
  console.log('Saved 01_mobile_home.png');

  // Check top buttons
  const panelLeftBtn = await page.$('button[aria-label="Toggle Portal Sidebar"]');
  const hamburgerBtn = await page.$('button[aria-label="Toggle mobile menu"]');

  console.log('PanelLeft button found:', !!panelLeftBtn);
  console.log('Hamburger button found:', !!hamburgerBtn);

  if (!panelLeftBtn && !hamburgerBtn) {
    throw new Error('Neither sidebar toggle button was found in Navbar!');
  }

  // Check drawer before click
  let drawer = await page.$('div[role="dialog"]');
  console.log('Drawer visible before click:', !!drawer);

  // Click the left sidebar toggle button
  console.log('Clicking PanelLeft button...');
  await panelLeftBtn.click();
  await new Promise(r => setTimeout(r, 600));

  // Check drawer after click
  drawer = await page.$('div[role="dialog"]');
  console.log('Drawer rendered after clicking PanelLeft:', !!drawer);

  if (drawer) {
    const box = await drawer.boundingBox();
    console.log('Drawer bounding box:', box);
    await page.screenshot({ path: path.join(screenshotDir, '02_mobile_drawer_open.png') });
    console.log('Saved 02_mobile_drawer_open.png');

    // Test clicking a link inside the drawer: "Elections" or "Verify"
    const electionsLink = await page.$('a[href="/elections"]');
    console.log('Found elections link in drawer:', !!electionsLink);

    if (electionsLink) {
      console.log('Clicking Elections link in mobile drawer...');
      await electionsLink.click();
      await new Promise(r => setTimeout(r, 800));

      const currentUrl = page.url();
      console.log('Current URL after link click:', currentUrl);

      // Check if drawer is closed after navigation
      const drawerAfterNav = await page.$('div[role="dialog"]');
      console.log('Drawer closed after navigation:', !drawerAfterNav);

      await page.screenshot({ path: path.join(screenshotDir, '03_mobile_elections_page.png') });
      console.log('Saved 03_mobile_elections_page.png');
    }
  } else {
    console.log('FAILED to open drawer with PanelLeft button!');
  }

  // Now test Hamburger button
  console.log('Now testing right hamburger button...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  const hamburgerBtn2 = await page.$('button[aria-label="Toggle mobile menu"]');
  if (hamburgerBtn2) {
    await hamburgerBtn2.click();
    await new Promise(r => setTimeout(r, 600));
    const drawer2 = await page.$('div[role="dialog"]');
    console.log('Drawer rendered after clicking Hamburger:', !!drawer2);
    await page.screenshot({ path: path.join(screenshotDir, '04_mobile_drawer_from_hamburger.png') });
    console.log('Saved 04_mobile_drawer_from_hamburger.png');
  }

  await browser.close();
  console.log('Mobile test complete. Total console errors:', errors.length);
}

runMobileTest().catch(err => {
  console.error('Test crashed:', err);
  process.exit(1);
});
