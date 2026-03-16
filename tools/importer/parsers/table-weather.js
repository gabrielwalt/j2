/* eslint-disable */
/* global WebImporter */

/**
 * Parser: table-weather
 * Base block: table
 * Source: https://www.jet2holidays.com/destinations/portugal/algarve
 * Instance: .climate-bar-chart.block
 *
 * Table block library format: First row = headers, subsequent rows = data.
 * Converts bar chart DOM into a simple months/temperatures table.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Extract heading as default content (placed before the block)
  const heading = element.querySelector('h2, .header-title');
  if (heading) {
    element.before(heading);
  }

  // Extract month labels and temperature values from bar chart
  const barWrappers = element.querySelectorAll('.bar-wrapper');
  const months = [];
  const temps = [];

  barWrappers.forEach((wrapper) => {
    const monthLabel = wrapper.querySelector('.month-label');
    const tempLabel = wrapper.querySelector('.bar-label');
    if (monthLabel) months.push(monthLabel.textContent.trim());
    if (tempLabel) temps.push(tempLabel.textContent.trim());
  });

  // Build table: Row 1 = month headers, Row 2 = temperatures
  if (months.length > 0) {
    // Header row (months)
    const headerRow = months.map((month) => {
      const p = document.createElement('p');
      p.textContent = month;
      return p;
    });
    cells.push(headerRow);

    // Data row (temperatures)
    const dataRow = temps.map((temp) => {
      const p = document.createElement('p');
      p.textContent = temp;
      return p;
    });
    cells.push(dataRow);
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'table-weather',
    cells,
  });
  element.replaceWith(block);
}
