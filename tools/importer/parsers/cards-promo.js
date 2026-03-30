/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-promo
 * Base block: cards
 * Source: https://www.jet2holidays.com/destinations
 * Instances: .content-scrollable
 *
 * Promo card scrollable carousels on landing pages.
 * Each card = image + label + link to destination.
 * Cards are inside .promo-card-wrapper > .promo-card-item > a
 *
 * Output: cards-promo block with one row per card.
 * Column 1: image. Column 2: destination name as linked heading.
 */
export default function parse(element, { document }) {
  const cells = [];

  const cards = element.querySelectorAll('.promo-card-item');

  cards.forEach((card) => {
    const link = card.querySelector('a');
    if (!link) return;

    const col1 = [];
    const col2 = [];

    // Image — prefer getAttribute over DOM property to avoid browser-resolved
    // "about:error" from failed lazy loads. Also check data-src as fallback.
    const img = card.querySelector('img');
    if (img) {
      let src = img.getAttribute('data-src') || img.getAttribute('src') || '';
      if (src && src !== 'about:error') {
        // Clean Scene7 URLs: strip preset suffix, add ?fmt=jpg
        if (src.includes('media.jet2.com/is/image/')) {
          try {
            const u = new URL(src);
            u.pathname = u.pathname.replace(/:[\w-]+$/, '');
            if (!u.searchParams.has('fmt')) u.searchParams.set('fmt', 'jpg');
            src = u.toString();
          } catch { /* keep original */ }
        }
        const newImg = document.createElement('img');
        newImg.src = src;
        col1.push(newImg);
      }
    }

    // Destination name as linked heading
    const line1 = card.querySelector('.promo-card-copy__line1');
    const copyEl = card.querySelector('.promo-card-copy');
    const label = line1?.textContent?.trim() || copyEl?.textContent?.trim() || '';

    if (label) {
      const h3 = document.createElement('h3');
      const a = document.createElement('a');
      a.href = link.href;
      a.textContent = label;
      h3.append(a);
      col2.push(h3);
    }

    if (col1.length > 0 || col2.length > 0) {
      cells.push([col1, col2]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-promo',
    cells,
  });
  element.replaceWith(block);
}
