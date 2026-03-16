/**
 * Custom import runner with thorough page scrolling for Jet2 site.
 * Uses the same Playwright from the content-import plugin.
 */
const PLUGIN_ROOT = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts';

const { chromium } = require(`${PLUGIN_ROOT}/node_modules/playwright`);
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { dirname, join } = require('path');

const IMPORT_SCRIPT = 'tools/importer/import-destination-region.bundle.js';
const URLS_FILE = 'tools/importer/urls-destination-region.txt';
const OUTPUT_DIR = 'content';
const HELIX_IMPORTER_PATH = `${PLUGIN_ROOT}/static/inject/helix-importer.js`;

function sanitizePath(path, url) {
  let p = path.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.html$/, '');
  if (!p) {
    try { p = new URL(url).pathname.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.html$/, '') || 'index'; }
    catch { p = 'index'; }
  }
  return p;
}

async function fullPageScroll(page) {
  console.log('  Scrolling full page...');
  await page.evaluate(async () => {
    const delay = ms => new Promise(r => setTimeout(r, ms));
    const step = Math.floor(window.innerHeight * 0.7);
    let pos = 0;
    const maxHeight = Math.max(document.body.scrollHeight, 20000);
    while (pos < maxHeight) {
      pos += step;
      window.scrollTo(0, pos);
      await delay(400);
    }
    window.scrollTo(0, 0);
    await delay(500);
  });
  await page.waitForTimeout(5000);
  console.log('  Scroll done, content settling...');
}

(async () => {
  const urls = readFileSync(URLS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
  const importScript = readFileSync(IMPORT_SCRIPT, 'utf-8');

  console.log(`[Import] ${urls.length} URL(s)`);

  const helixScript = readFileSync(HELIX_IMPORTER_PATH, 'utf-8');

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].trim();
    console.log(`[${i+1}/${urls.length}] ${url}`);

    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await ctx.newPage();
    page.on('console', m => {
      const type = m.type();
      if (type === 'log' || type === 'warning' || type === 'error') {
        console.log(`  [Browser:${type}] ${m.text()}`);
      }
    });

    try {
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      } catch {
        console.log('  Fallback: domcontentloaded');
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);
      }

      // Wait for AEM block decoration to complete (the .block class is added by JS)
      try {
        await page.waitForSelector('.block', { timeout: 15000 });
        console.log('  AEM blocks decorated');
      } catch {
        console.log('  Warning: .block class not found, proceeding anyway');
      }

      // Dismiss cookie banners
      try {
        const btn = await page.$('#onetrust-accept-btn-handler');
        if (btn) { await btn.click(); await page.waitForTimeout(1000); }
      } catch {}

      // Thorough scroll
      await fullPageScroll(page);

      // Extra wait for dynamic content
      await page.waitForTimeout(5000);

      // Verify blocks are present
      const blockCount = await page.evaluate(() => document.querySelectorAll('.block').length);
      console.log(`  Found ${blockCount} .block elements on page`);

      // Inject helix importer
      await page.evaluate(s => {
        const orig = window.define;
        if (typeof window.define !== 'undefined') delete window.define;
        const el = document.createElement('script');
        el.textContent = s;
        document.head.appendChild(el);
        if (orig) window.define = orig;
      }, helixScript);

      // Inject import script
      await page.evaluate(s => {
        const el = document.createElement('script');
        el.textContent = s;
        document.head.appendChild(el);
      }, importScript);

      await page.waitForFunction(
        () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
        { timeout: 10000 }
      );

      const result = await page.evaluate(async u => {
        const cfg = window.CustomImportScript?.default;
        if (!cfg) throw new Error('No CustomImportScript');
        const r = await window.WebImporter.html2md(u, document, cfg, {
          toDocx: false, toMd: true, originalURL: u
        });
        r.html = window.WebImporter.md2da(r.md);
        return r;
      }, url);

      const rel = sanitizePath(result.path, url);
      const out = join(OUTPUT_DIR, `${rel}.plain.html`);
      mkdirSync(dirname(out), { recursive: true });
      writeFileSync(out, result.html, 'utf-8');
      console.log(`  ✅ Saved ${rel}`);
    } catch (e) {
      console.error(`  ❌ ${e.message}`);
    } finally {
      await ctx.close();
    }
  }

  await browser.close();
  console.log('[Import] Done');
})();
