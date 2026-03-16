/* eslint-disable */
/* global WebImporter */

/**
 * Parser: destination-map
 * Base block: columns
 * Source: https://www.jet2holidays.com/destinations/portugal/algarve
 * Instance: .title-links.block
 *
 * Extracts only the heading and list of destination links.
 * Map image and "Launch map" text are omitted - handled via CSS/JS.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract heading as default content before the block
  const heading = element.querySelector('h2');
  if (heading) {
    element.before(heading);
  }

  // Single column: list of destination links
  const linkList = element.querySelector('ul');
  if (linkList) {
    cells.push([linkList]);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'destination-map',
    cells,
  });

  // Replace the title-links element
  element.replaceWith(block);

  // Also remove the sibling map block if it exists (in layout-wrapper)
  const layoutWrapper = block.closest && block.closest('.layout-wrapper');
  if (layoutWrapper) {
    const mapBlock = layoutWrapper.querySelector('.map-wrapper, .map.block');
    if (mapBlock) {
      mapBlock.remove();
    }
  }
}
