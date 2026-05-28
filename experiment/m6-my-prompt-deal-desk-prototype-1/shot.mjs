import { chromium } from 'playwright';

const tabs = process.argv.slice(2);
const targets = tabs.length ? tabs : ['simulate', 'permissions', 'rollout', 'diff'];
const labels = { simulate: 'Simulate', permissions: 'Permissions', rollout: 'Rollout', diff: 'Technical diff' };

const unclip = `
  .app { height: auto !important; overflow: visible !important; }
  .app-main { overflow: visible !important; }
  .page-scroll { overflow: visible !important; height: auto !important; padding-bottom: 24px !important; }
  .sticky-footer { display: none !important; }
  html, body, #root { height: auto !important; overflow: visible !important; }
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900, deviceScaleFactor: 2 } });
await page.goto('http://localhost:59159/', { waitUntil: 'networkidle' });

for (const t of targets) {
  if (t !== 'simulate') {
    await page.getByText(labels[t], { exact: false }).first().click();
    await page.waitForTimeout(250);
  }
  // top-fold viewport shot (full composition incl. sidebars + footer)
  await page.screenshot({ path: `/tmp/cur-${t}.png` });
  // full content shot
  const style = await page.addStyleTag({ content: unclip });
  await page.waitForTimeout(120);
  await page.screenshot({ path: `/tmp/full-${t}.png`, fullPage: true });
  await style.evaluate((el) => el.remove());
  await page.waitForTimeout(120);
  console.log(`shot ${t}`);
}
await browser.close();
