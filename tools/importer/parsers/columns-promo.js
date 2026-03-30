/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-promo
 * Base block: columns
 * Source: https://www.jet2holidays.com/destinations
 * Instances: .media-block (not .media-block--reverse)
 *
 * Media blocks on landing pages: two-column promo layout.
 * Left = image, Right = heading + description + CTA button.
 *
 * Output: columns-promo block with one row, two columns.
 * Column 1: image. Column 2: heading + paragraph + CTA link.
 */
// Convert absolute jet2holidays.com URLs to relative paths
function toRelativePath(url) {
  try {
    const u = new URL(url);
    if (u.hostname === 'www.jet2holidays.com') {
      return u.pathname + u.search + u.hash;
    }
  } catch { /* ignore */ }
  return url;
}

export default function parse(element, { document }) {
  const cells = [];
  const col1 = [];
  const col2 = [];

  // Image — prefer getAttribute over DOM property to avoid browser-resolved
  // "about:error" from failed lazy loads. Also check data-src as fallback.
  const img = element.querySelector('.media-block__media img');
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

  // Heading
  const heading = element.querySelector('.media-block__heading, h2');
  if (heading) {
    const text = heading.textContent.trim();
    if (text) {
      const h2 = document.createElement('h2');
      h2.textContent = text;
      col2.push(h2);
    }
  }

  // Description
  const content = element.querySelector('.media-block__content p');
  if (content) {
    const p = document.createElement('p');
    p.textContent = content.textContent.trim();
    col2.push(p);
  }

  // CTA button/link
  const cta = element.querySelector('.media-block__button, a.bttn');
  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = toRelativePath(cta.href || cta.getAttribute('href') || '');
    a.textContent = cta.textContent.trim();
    p.append(a);
    col2.push(p);
  }

  if (col1.length > 0 || col2.length > 0) {
    cells.push([col1, col2]);
  }

  // Detect brand--beach variant (blue background with white text, e.g. Sicily promo)
  const isBrand = element.classList.contains('brand--beach')
    || element.closest('.brand--beach') !== null;

  const block = WebImporter.Blocks.createBlock(document, {
    name: isBrand ? 'columns-promo (brand)' : 'columns-promo',
    cells,
  });
  element.replaceWith(block);
}
