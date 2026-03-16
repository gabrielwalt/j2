/* eslint-disable */
/* global WebImporter */

/**
 * Parser: columns-destination
 * Base block: columns
 * Source: https://www.jet2holidays.com/destinations/portugal/algarve
 * Instances: .destination-description.block, .icon-grid-v2.block, .email-sign-up-v2.block
 *
 * Note: .title-links.block is now handled by destination-map parser.
 *
 * Columns block library format: Each row = one row of N columns.
 * Each cell contains text, images, or links.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which instance type we're parsing based on class
  const isDestinationDesc = element.classList.contains('destination-description');
  const isIconGrid = element.classList.contains('icon-grid-v2');
  const isEmailSignup = element.classList.contains('email-sign-up-v2');

  if (isDestinationDesc) {
    // Two-column: text content (left) + image (right)
    const textContainer = element.querySelector('.text-container');
    const imageContainer = element.querySelector('.image-container');
    const col1 = [];
    if (textContainer) {
      const heading = textContainer.querySelector('h2');
      if (heading) col1.push(heading);
      const paragraphs = textContainer.querySelectorAll('.paragraph-wrapper p, :scope > p');
      paragraphs.forEach((p) => col1.push(p));
    }
    const col2 = [];
    if (imageContainer) {
      const picture = imageContainer.querySelector('picture');
      if (picture) col2.push(picture);
    }
    cells.push([col1, col2]);
  } else if (isIconGrid) {
    // Icon grid: 6 items each with icon, title, description
    // DOM: ul.icon-grid-list > li.icon-grid-item > .icon-grid-icon + h3.icon-grid-title + p.icon-grid-desc
    const heading = element.querySelector('h2.icon-grid-heading, h2');
    if (heading) {
      element.before(heading);
    }

    const items = element.querySelectorAll('ul.icon-grid-list > li.icon-grid-item, li.icon-grid-item');
    items.forEach((item) => {
      const row = [];

      // Extract icon name from span.icon class (e.g., icon-language -> :language:)
      const iconSpan = item.querySelector('.icon-grid-icon span.icon');
      if (iconSpan) {
        const iconClass = Array.from(iconSpan.classList).find((c) => c !== 'icon' && c.startsWith('icon-'));
        if (iconClass) {
          const iconName = iconClass.replace('icon-', '');
          const iconP = document.createElement('p');
          iconP.textContent = `:${iconName}:`;
          row.push(iconP);
        }
      }

      // Title
      const title = item.querySelector('h3.icon-grid-title, h3');
      if (title) {
        const h3 = document.createElement('h3');
        h3.textContent = title.textContent.trim();
        row.push(h3);
      }

      // Description
      const desc = item.querySelector('p.icon-grid-desc, p');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        row.push(p);
      }

      if (row.length > 0) {
        cells.push([row]);
      }
    });
  } else if (isEmailSignup) {
    // Two-column: signup content (left) + decorative image (right)
    const col1 = [];
    const heading = element.querySelector('h2');
    if (heading) col1.push(heading);
    const subtext = element.querySelector('.sign-up-subtext p');
    if (subtext) col1.push(subtext);
    const signupBtn = document.createElement('p');
    const signupLink = document.createElement('a');
    signupLink.href = '#signup';
    signupLink.textContent = 'Sign up';
    signupBtn.append(signupLink);
    col1.push(signupBtn);
    const col2 = [];
    const picture = element.querySelector('.sign-up-image picture');
    if (picture) col2.push(picture);
    cells.push([col1, col2]);
  } else {
    // Generic fallback: treat direct children as columns
    const children = element.querySelectorAll(':scope > div');
    const row = [];
    children.forEach((child) => row.push(child));
    if (row.length > 0) cells.push(row);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns-destination',
    cells,
  });
  element.replaceWith(block);
}
