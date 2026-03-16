/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: jet2holidays sections.
 * Adds section breaks and section-metadata blocks based on template sections.
 * Runs in afterTransform only (after block parsing).
 * Selectors from captured DOM of https://www.jet2holidays.com/destinations/portugal/algarve
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    const { document } = element.ownerDocument ? { document: element.ownerDocument } : { document };
    const template = payload && payload.template;
    if (!template || !template.sections || template.sections.length < 2) return;

    // Process sections in reverse order to preserve DOM positions
    const sections = [...template.sections].reverse();

    sections.forEach((section) => {
      // Try to find the section element using selector(s)
      const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
      let sectionEl = null;
      for (const sel of selectors) {
        sectionEl = element.querySelector(sel);
        if (sectionEl) break;
      }
      if (!sectionEl) return;

      // Add section-metadata block if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        sectionEl.after(sectionMetadata);
      }

      // Add section break (hr) before section if not the first section
      // and there is content before it
      if (section.id !== template.sections[0].id) {
        const hr = document.createElement('hr');
        sectionEl.before(hr);
      }
    });
  }
}
