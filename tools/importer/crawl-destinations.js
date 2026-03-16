/**
 * Crawl Jet2 destination pages to discover all category, region, and resort URLs.
 * Uses the same Playwright from the content-import plugin.
 */
const PLUGIN_ROOT = '/home/node/.claude/plugins/cache/excat-marketplace/excat/2.1.1/skills/excat-content-import/scripts';

const { chromium } = require(`${PLUGIN_ROOT}/node_modules/playwright`);
const { writeFileSync } = require('fs');

const CATEGORIES = [
  'https://www.jet2holidays.com/destinations/balearics',
  'https://www.jet2holidays.com/destinations/bulgaria',
  'https://www.jet2holidays.com/destinations/canary-islands',
  'https://www.jet2holidays.com/destinations/croatia',
  'https://www.jet2holidays.com/destinations/cyprus',
  'https://www.jet2holidays.com/destinations/egypt',
  'https://www.jet2holidays.com/destinations/greece',
  'https://www.jet2holidays.com/destinations/italy',
  'https://www.jet2holidays.com/destinations/malta/malta-and-gozo',
  'https://www.jet2holidays.com/destinations/montenegro',
  'https://www.jet2holidays.com/destinations/morocco',
  'https://www.jet2holidays.com/destinations/portugal',
  'https://www.jet2holidays.com/destinations/spain',
  'https://www.jet2holidays.com/destinations/turkey',
];

async function getDestinationLinks(page, url) {
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);
  } catch (e) {
    console.error(`  Navigation error: ${e.message.substring(0, 80)}`);
  }

  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href*="/destinations/"]'))
      .map((a) => {
        try {
          const u = new URL(a.href, window.location.origin);
          return (u.origin + u.pathname).replace(/\/+$/, '');
        } catch { return null; }
      })
      .filter((href) => href && href.startsWith('https://www.jet2holidays.com/destinations/'));
  });
}

function isChildOf(child, parent) {
  return child.startsWith(parent + '/');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await context.newPage();

  const urlSet = new Set();
  const regionUrls = [];

  // Phase 1: Crawl category pages
  console.log('Phase 1: Crawling 14 category pages\n');

  for (const catUrl of CATEGORIES) {
    urlSet.add(catUrl);
    console.log(`[Category] ${catUrl}`);

    const links = await getDestinationLinks(page, catUrl);
    const children = [...new Set(links)].filter((l) => isChildOf(l, catUrl));

    for (const child of children) {
      urlSet.add(child);
      // Mark single-segment children as regions for phase 2
      const rel = child.substring(catUrl.length + 1);
      if (rel.split('/').length === 1) {
        regionUrls.push(child);
      }
    }
    console.log(`  → ${children.length} children found (${urlSet.size} total)`);
    await page.waitForTimeout(500);
  }

  // Phase 2: Crawl region pages for additional resorts
  console.log(`\nPhase 2: Crawling ${regionUrls.length} region pages\n`);

  for (const regionUrl of regionUrls) {
    console.log(`[Region] ${regionUrl}`);

    const links = await getDestinationLinks(page, regionUrl);
    const children = [...new Set(links)].filter((l) => isChildOf(l, regionUrl));
    const newChildren = children.filter((l) => !urlSet.has(l));

    for (const child of newChildren) {
      urlSet.add(child);
    }
    if (newChildren.length > 0) {
      console.log(`  → +${newChildren.length} new resorts (${urlSet.size} total)`);
    }
    await page.waitForTimeout(500);
  }

  await browser.close();

  // Sort and save
  const sorted = [...urlSet].sort();
  writeFileSync('/workspace/tools/importer/urls-all-destinations.txt', sorted.join('\n') + '\n');

  // Summary by category
  console.log('\n=== Inventory ===');
  for (const catUrl of CATEGORIES) {
    const children = sorted.filter((u) => u !== catUrl && isChildOf(u, catUrl));
    const catName = catUrl.split('/destinations/')[1];
    console.log(`${catName}: 1 country + ${children.length} children = ${children.length + 1}`);
  }
  console.log(`\nTotal: ${sorted.length} pages`);
  console.log('Saved to tools/importer/urls-all-destinations.txt');
})();
