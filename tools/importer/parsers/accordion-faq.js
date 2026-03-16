/* eslint-disable */
/* global WebImporter */

/**
 * Parser: accordion-faq
 * Base block: accordion
 * Source: https://www.jet2holidays.com/destinations/portugal/algarve
 * Instance: .accordion.block
 *
 * Accordion block library format: Each row = one accordion item.
 * Column 1: question/title. Column 2: answer/body content.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract heading as default content (placed before the block)
  const heading = element.querySelector(':scope > h2, .accordion-block-title');
  if (heading) {
    element.before(heading);
  }

  // Find accordion items - source uses <details> elements
  const items = element.querySelectorAll('details.accordion-item, details');

  items.forEach((item) => {
    // Column 1: Question title
    const col1 = [];
    const title = item.querySelector('.accordion-item-title, summary h3, summary');
    if (title) {
      const titleText = title.textContent.trim();
      const p = document.createElement('p');
      p.textContent = titleText;
      col1.push(p);
    }

    // Column 2: Answer body
    const col2 = [];
    const body = item.querySelector('.accordion-item-body');
    if (body) {
      const paragraphs = body.querySelectorAll('p');
      paragraphs.forEach((p) => col2.push(p));
      // If no paragraphs, use body content directly
      if (paragraphs.length === 0 && body.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = body.textContent.trim();
        col2.push(p);
      }
    }

    if (col1.length > 0 || col2.length > 0) {
      cells.push([col1, col2]);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'accordion-faq',
    cells,
  });
  element.replaceWith(block);
}
