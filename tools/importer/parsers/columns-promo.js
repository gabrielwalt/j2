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
export default function parse(element, { document }) {
  const cells = [];
  const col1 = [];
  const col2 = [];

  // Image
  const img = element.querySelector('.media-block__media img');
  if (img) {
    const src = img.dataset?.src || img.src || '';
    if (src) {
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
    a.href = cta.href || cta.getAttribute('href') || '';
    a.textContent = cta.textContent.trim();
    p.append(a);
    col2.push(p);
  }

  if (col1.length > 0 || col2.length > 0) {
    cells.push([col1, col2]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-promo',
    cells,
  });
  element.replaceWith(block);
}
