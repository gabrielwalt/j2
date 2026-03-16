/**
 * Parallel import runner for large-scale Jet2 destination imports.
 * Processes N pages concurrently with resume support (skips existing outputs).
 *
 * Usage:
 *   node tools/importer/run-import-parallel.js [concurrency]
 *   URLS_FILE=path/to/urls.txt node tools/importer/run-import-parallel.js 5
 */
const PLUGIN_ROOT = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts';

const { chromium } = require(`${PLUGIN_ROOT}/node_modules/playwright`);
const { readFileSync, writeFileSync, mkdirSync, existsSync } = require('fs');
const { dirname, join } = require('path');

const IMPORT_SCRIPT = 'tools/importer/import-destination-region.bundle.js';
const URLS_FILE = process.env.URLS_FILE || 'tools/importer/urls-all-destinations.txt';
const OUTPUT_DIR = 'content';
const HELIX_IMPORTER_PATH = `${PLUGIN_ROOT}/static/inject/helix-importer.js`;
const CONCURRENCY = parseInt(process.argv[2] || '4', 10);
const PROGRESS_FILE = 'tools/importer/import-progress.json';

function urlToOutputPath(url) {
  try {
    const p = new URL(url).pathname.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.html$/, '');
    return p || 'index';
  } catch { return 'index'; }
}

function sanitizePath(path, url) {
  let p = path.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.html$/, '');
  if (!p) p = urlToOutputPath(url);
  return p;
}

async function scrollPage(page) {
  await page.evaluate(async () => {
    const delay = (ms) => new Promise((r) => setTimeout(r, ms));
    const step = Math.floor(window.innerHeight * 0.7);
    let pos = 0;
    const maxHeight = Math.max(document.body.scrollHeight, 20000);
    while (pos < maxHeight) {
      pos += step;
      window.scrollTo(0, pos);
      await delay(300);
    }
    window.scrollTo(0, 0);
    await delay(300);
  });
  await page.waitForTimeout(3000);
}

async function processPage(page, url, importScript, helixScript) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
  } catch {
    // Retry once
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(3000);
    } catch (e) {
      throw new Error(`Navigation failed: ${e.message.substring(0, 60)}`);
    }
  }

  // Wait for AEM block decoration
  try { await page.waitForSelector('.block', { timeout: 10000 }); } catch {}

  // Dismiss cookie banners
  try {
    const btn = await page.$('#onetrust-accept-btn-handler');
    if (btn) { await btn.click(); await page.waitForTimeout(500); }
  } catch {}

  // Scroll to trigger lazy loading
  await scrollPage(page);

  // Extra settle time
  await page.waitForTimeout(3000);

  // Inject helix importer
  await page.evaluate((s) => {
    const orig = window.define;
    if (typeof window.define !== 'undefined') delete window.define;
    const el = document.createElement('script');
    el.textContent = s;
    document.head.appendChild(el);
    if (orig) window.define = orig;
  }, helixScript);

  // Inject import script
  await page.evaluate((s) => {
    const el = document.createElement('script');
    el.textContent = s;
    document.head.appendChild(el);
  }, importScript);

  await page.waitForFunction(
    () => typeof window.CustomImportScript !== 'undefined' && window.CustomImportScript?.default,
    { timeout: 10000 },
  );

  const result = await page.evaluate(async (u) => {
    const cfg = window.CustomImportScript?.default;
    if (!cfg) throw new Error('No CustomImportScript');
    const r = await window.WebImporter.html2md(u, document, cfg, {
      toDocx: false, toMd: true, originalURL: u,
    });
    r.html = window.WebImporter.md2da(r.md);
    return r;
  }, url);

  const rel = sanitizePath(result.path, url);
  const out = join(OUTPUT_DIR, `${rel}.plain.html`);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, result.html, 'utf-8');

  // Return info for tracking
  const lineCount = result.html.split('\n').filter((l) => l.trim()).length;
  return { rel, lineCount };
}

(async () => {
  const allUrls = readFileSync(URLS_FILE, 'utf-8').trim().split('\n').filter(Boolean);
  const importScript = readFileSync(IMPORT_SCRIPT, 'utf-8');
  const helixScript = readFileSync(HELIX_IMPORTER_PATH, 'utf-8');

  // Resume support: skip already-imported pages
  const pending = [];
  const skipped = [];
  for (const url of allUrls) {
    const rel = urlToOutputPath(url);
    const out = join(OUTPUT_DIR, `${rel}.plain.html`);
    if (existsSync(out)) {
      skipped.push(url);
    } else {
      pending.push(url);
    }
  }

  console.log(`[Import] Total: ${allUrls.length} | Already imported: ${skipped.length} | Pending: ${pending.length}`);
  console.log(`[Import] Concurrency: ${CONCURRENCY}\n`);

  if (pending.length === 0) {
    console.log('[Import] Nothing to import - all pages already exist.');
    return;
  }

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const stats = {
    completed: 0, failed: 0, errors: [], startTime: Date.now(), outliers: [],
  };

  let queueIndex = 0;

  function getProgress() {
    const elapsed = (Date.now() - stats.startTime) / 1000;
    const done = stats.completed + stats.failed;
    const rate = done > 0 ? elapsed / done : 0;
    const remaining = (pending.length - done) * rate;
    return {
      done, total: pending.length, elapsed: Math.round(elapsed),
      eta: Math.round(remaining), rate: rate.toFixed(1),
    };
  }

  async function worker(workerId) {
    const ctx = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });
    const page = await ctx.newPage();

    while (queueIndex < pending.length) {
      const idx = queueIndex++;
      const url = pending[idx];
      const p = getProgress();

      try {
        const result = await processPage(page, url, importScript, helixScript);
        stats.completed++;

        // Flag outliers: unusual line counts
        if (result.lineCount < 3) {
          stats.outliers.push({ url, reason: `only ${result.lineCount} lines`, path: result.rel });
        } else if (result.lineCount > 20) {
          stats.outliers.push({ url, reason: `${result.lineCount} lines (large)`, path: result.rel });
        }

        console.log(`  ✅ [${p.done + 1}/${p.total}] ${result.rel} (${result.lineCount} lines) [ETA: ${Math.round(p.eta / 60)}m]`);
      } catch (e) {
        stats.failed++;
        stats.errors.push({ url, error: e.message.substring(0, 100) });
        console.log(`  ❌ [${p.done + 1}/${p.total}] ${url} - ${e.message.substring(0, 80)}`);
      }

      // Small stagger between requests to avoid rate limiting
      await page.waitForTimeout(200);
    }

    await ctx.close();
  }

  // Launch workers
  const workers = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(worker(i));
    // Stagger worker starts
    await new Promise((r) => setTimeout(r, 1000));
  }

  await Promise.all(workers);
  await browser.close();

  // Save progress report
  const report = {
    timestamp: new Date().toISOString(),
    total: allUrls.length,
    skipped: skipped.length,
    completed: stats.completed,
    failed: stats.failed,
    duration: Math.round((Date.now() - stats.startTime) / 1000),
    errors: stats.errors,
    outliers: stats.outliers,
  };
  writeFileSync(PROGRESS_FILE, JSON.stringify(report, null, 2));

  console.log(`\n[Import] === COMPLETE ===`);
  console.log(`  Completed: ${stats.completed}`);
  console.log(`  Failed: ${stats.failed}`);
  console.log(`  Duration: ${Math.round((Date.now() - stats.startTime) / 60000)}m`);

  if (stats.outliers.length > 0) {
    console.log(`\n  ⚠️  Outliers (${stats.outliers.length}):`);
    for (const o of stats.outliers) {
      console.log(`    ${o.path}: ${o.reason}`);
    }
  }

  if (stats.errors.length > 0) {
    console.log(`\n  ❌ Errors (${stats.errors.length}):`);
    for (const e of stats.errors) {
      console.log(`    ${e.url}: ${e.error}`);
    }
  }

  console.log(`\nReport saved to ${PROGRESS_FILE}`);
})();
