/**
 * Single-page import runner for the destinations landing page.
 * Uses the destinations-landing bundle instead of destination-region.
 */
const PLUGIN_ROOT = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts';

const { chromium } = require(`${PLUGIN_ROOT}/node_modules/playwright`);
const { readFileSync, writeFileSync, mkdirSync } = require('fs');
const { dirname, join } = require('path');

const IMPORT_SCRIPT = 'tools/importer/import-destinations-landing.bundle.js';
const URL_TO_IMPORT = 'https://www.jet2holidays.com/destinations';
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
  const importScript = readFileSync(IMPORT_SCRIPT, 'utf-8');
  const helixScript = readFileSync(HELIX_IMPORTER_PATH, 'utf-8');

  console.log(`[Import] Importing: ${URL_TO_IMPORT}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

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

  // Add CORS headers to cross-origin media.jet2.com images so the browser
  // can load them without CORS restrictions during import.
  await page.route('**/media.jet2.com/**', async (route) => {
    try {
      const response = await route.fetch();
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          'access-control-allow-origin': '*',
        },
      });
    } catch {
      await route.continue();
    }
  });

  try {
    try {
      await page.goto(URL_TO_IMPORT, { waitUntil: 'networkidle', timeout: 60000 });
    } catch {
      console.log('  Fallback: domcontentloaded');
      await page.goto(URL_TO_IMPORT, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(5000);
    }

    // Dismiss cookie banners
    try {
      const btn = await page.$('#onetrust-accept-btn-handler');
      if (btn) { await btn.click(); await page.waitForTimeout(1000); }
    } catch {}

    // Set crossOrigin="anonymous" on all lazy images BEFORE scroll triggers
    // Jet2's lazy loader. This ensures the browser makes CORS requests so
    // canvas can read pixel data later for media_xxx hash generation.
    await page.evaluate(() => {
      document.querySelectorAll('img[data-src]').forEach((img) => {
        img.crossOrigin = 'anonymous';
      });
    });

    // Thorough scroll to trigger lazy loading
    await fullPageScroll(page);

    // Extra wait for dynamic content
    await page.waitForTimeout(5000);

    // Activate any remaining lazy images not triggered by scroll.
    // Clean Scene7 URLs: strip preset suffix, add ?fmt=jpg so the browser
    // caches the exact URL that the import transform will later request.
    const lazyCount = await page.evaluate(() => {
      let count = 0;
      document.querySelectorAll('img[data-src]').forEach((img) => {
        let dataSrc = img.getAttribute('data-src');
        if (dataSrc && (!img.src || img.naturalWidth === 0)) {
          // Clean Scene7 URLs before setting src
          if (dataSrc.includes('media.jet2.com/is/image/')) {
            try {
              const u = new URL(dataSrc);
              u.pathname = u.pathname.replace(/:[\w-]+$/, '');
              if (!u.searchParams.has('fmt')) u.searchParams.set('fmt', 'jpg');
              dataSrc = u.toString();
            } catch { /* keep original */ }
          }
          img.crossOrigin = 'anonymous';
          img.src = dataSrc;
          count++;
        }
      });
      return count;
    });
    if (lazyCount > 0) {
      console.log(`  Activated ${lazyCount} lazy images, waiting for load...`);
      // Wait for all images to finish loading (or timeout after 15s)
      await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img[data-src]'));
        return Promise.all(imgs.map((img) => {
          if (img.complete && img.naturalWidth > 0) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true });
            img.addEventListener('error', resolve, { once: true });
            setTimeout(resolve, 15000);
          });
        }));
      });
      console.log('  All lazy images loaded.');
    }

    // Verify image state — log any that are still broken
    const imgStatus = await page.evaluate(() => {
      const results = { loaded: 0, failed: 0, failedUrls: [] };
      document.querySelectorAll('img[data-src]').forEach((img) => {
        if (img.naturalWidth > 0) {
          results.loaded++;
        } else {
          results.failed++;
          results.failedUrls.push(img.getAttribute('data-src') || img.getAttribute('src') || '(empty)');
        }
      });
      return results;
    });
    console.log(`  Image status: ${imgStatus.loaded} loaded, ${imgStatus.failed} failed`);
    if (imgStatus.failedUrls.length > 0) {
      console.log(`  Failed URLs: ${imgStatus.failedUrls.join(', ')}`);
    }

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
    }, URL_TO_IMPORT);

    const rel = sanitizePath(result.path, URL_TO_IMPORT);
    const out = join(OUTPUT_DIR, `${rel}.plain.html`);
    mkdirSync(dirname(out), { recursive: true });
    writeFileSync(out, result.html, 'utf-8');

    const lineCount = result.html.split('\n').filter(l => l.trim()).length;
    console.log(`  ✅ Saved ${rel} (${lineCount} lines)`);
  } catch (e) {
    console.error(`  ❌ ${e.message}`);
  } finally {
    await ctx.close();
  }

  await browser.close();
  console.log('[Import] Done');
})();
