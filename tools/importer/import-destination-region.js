/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsDestinationParser from './parsers/columns-destination.js';
import destinationMapParser from './parsers/destination-map.js';
import cardsDestinationParser from './parsers/cards-destination.js';
import tableWeatherParser from './parsers/table-weather.js';
import accordionFaqParser from './parsers/accordion-faq.js';

// TRANSFORMER IMPORTS
import jet2CleanupTransformer from './transformers/jet2-cleanup.js';
import jet2SectionsTransformer from './transformers/jet2-sections.js';

// PARSER REGISTRY - Map parser names to functions
const parsers = {
  'columns-destination': columnsDestinationParser,
  'destination-map': destinationMapParser,
  'cards-destination': cardsDestinationParser,
  'table-weather': tableWeatherParser,
  'accordion-faq': accordionFaqParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'destination-region',
  description: 'Destination region page showing a specific area within a country (e.g., Algarve within Portugal), with hero imagery, destination details, and holiday offerings',
  urls: [
    'https://www.jet2holidays.com/destinations/portugal/algarve'
  ],
  blocks: [
    {
      name: 'columns-destination',
      instances: [
        '.destination-description',
        '.icon-grid-v2',
        '.email-sign-up-v2'
      ]
    },
    {
      name: 'destination-map',
      instances: [
        '.title-links'
      ]
    },
    {
      name: 'cards-destination',
      instances: [
        '.accommodation-teaser',
        '.resorts-teaser',
        '.blog-teaser',
        '.poi-teaser'
      ]
    },
    {
      name: 'table-weather',
      instances: [
        '.climate-bar-chart'
      ]
    },
    {
      name: 'accordion-faq',
      instances: [
        '.accordion'
      ]
    }
  ],
  sections: [
    {
      id: 'section-1-destination-description',
      name: 'Destination Description',
      selector: '.section.destination-description-container',
      style: null,
      blocks: ['columns-destination'],
      defaultContent: []
    },
    {
      id: 'section-2-popular-resorts-links',
      name: 'Popular Resorts Links',
      selector: [
        '.section.mobile-full-width.title-links-container',
        '.section.title-links-container.map-container'
      ],
      style: null,
      blocks: ['destination-map'],
      defaultContent: []
    },
    {
      id: 'section-3-hotels',
      name: 'Hotels in Algarve',
      selector: '.section.accommodation-teaser-container',
      style: null,
      blocks: ['cards-destination'],
      defaultContent: []
    },
    {
      id: 'section-4-information',
      name: 'Destination Information',
      selector: '.section.icon-grid-v2-container',
      style: null,
      blocks: ['columns-destination'],
      defaultContent: ['h2']
    },
    {
      id: 'section-5-content-highlights',
      name: 'Content Highlights',
      selector: '.section.background-grey.centered',
      style: 'grey',
      blocks: [],
      defaultContent: ['h2', 'p']
    },
    {
      id: 'section-6-resorts',
      name: 'Algarve Resorts',
      selector: '.section.resorts-teaser-container',
      style: null,
      blocks: ['cards-destination'],
      defaultContent: []
    },
    {
      id: 'section-7-blog',
      name: 'Blog Teaser',
      selector: '.section.blog-teaser-container',
      style: null,
      blocks: ['cards-destination'],
      defaultContent: ['h2', 'p', 'a']
    },
    {
      id: 'section-8-things-to-do',
      name: 'Things to Do',
      selector: '.section.poi-teaser-container',
      style: null,
      blocks: ['cards-destination'],
      defaultContent: []
    },
    {
      id: 'section-9-weather',
      name: 'Local Weather',
      selector: '.section.climate-bar-chart-container',
      style: null,
      blocks: ['table-weather'],
      defaultContent: []
    },
    {
      id: 'section-10-faqs',
      name: 'FAQs',
      selector: '.section.accordion-container',
      style: null,
      blocks: ['accordion-faq'],
      defaultContent: ['h2']
    },
    {
      id: 'section-11-email-signup',
      name: 'Email Sign Up',
      selector: '.section.email-sign-up-v2-container',
      style: null,
      blocks: ['columns-destination'],
      defaultContent: []
    }
  ]
};

// TRANSFORMER REGISTRY - Array of transformer functions
// Section transformer included since template has 11 sections
const transformers = [
  jet2CleanupTransformer,
  jet2SectionsTransformer,
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - The payload containing { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Array of block instances found on the page
 */
function findBlocksOnPage(root, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = root.querySelectorAll(selector);
      if (elements.length === 0) {
        console.log(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  /**
   * Main transformation function (one input / multiple outputs pattern)
   */
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 1b. OVERVIEW TAB ONLY: Truncate content after the email-sign-up section.
    // The Jet2 page has 4 tabs (Overview, Resorts, Places to stay, Things to do).
    // Full-page scrolling reveals content from all tabs. We only want the Overview tab
    // (sections 1-11, ending with email-sign-up). Everything after must be removed.
    const emailSignupBlock = main.querySelector('.email-sign-up-v2');
    if (emailSignupBlock) {
      const sectionContainer = emailSignupBlock.closest('.section') || emailSignupBlock.parentElement;
      if (sectionContainer && sectionContainer !== main) {
        // Remove all sibling sections after the email-sign-up section container
        let next = sectionContainer.nextElementSibling;
        while (next) {
          const toRemove = next;
          next = next.nextElementSibling;
          toRemove.remove();
        }
        // Walk up from emailSignupBlock to find the direct child of sectionContainer
        // (the block may be nested in wrapper divs within the section)
        let directChild = emailSignupBlock;
        while (directChild.parentElement && directChild.parentElement !== sectionContainer) {
          directChild = directChild.parentElement;
        }
        // Remove all children of the section container that come AFTER the one containing the block
        let nextChild = directChild.nextElementSibling;
        while (nextChild) {
          const toRemove = nextChild;
          nextChild = nextChild.nextElementSibling;
          toRemove.remove();
        }
        // Also clean up within the direct child - remove siblings of the block itself
        let nextInWrapper = emailSignupBlock.nextElementSibling;
        while (nextInWrapper) {
          const toRemove = nextInWrapper;
          nextInWrapper = nextInWrapper.nextElementSibling;
          toRemove.remove();
        }
      }
    }
    // Fallback: remove known tab panel content by heading text
    main.querySelectorAll('h2').forEach((h2) => {
      const text = h2.textContent.trim();
      if (/resorts\s*\(\d+\)/i.test(text)
        || (/^things to do$/i.test(text) && h2.id && h2.id.endsWith('-1'))
        || /accommodation\s+options?\s+found/i.test(text)
        || /explore.*destinations/i.test(text)) {
        let next = h2.nextElementSibling;
        while (next) {
          const toRemove = next;
          next = next.nextElementSibling;
          toRemove.remove();
        }
        h2.remove();
      }
    });

    // Remove skip-link that may survive the transformer cleanup
    main.querySelectorAll('a.skip-link, a[href="#main-content"]').forEach((el) => {
      const parent = el.closest('p') || el.parentElement;
      if (parent && parent !== main && !parent.querySelector('.columns-destination, .cards-destination, .destination-map')) {
        parent.remove();
      } else {
        el.remove();
      }
    });

    // 2. Find blocks on page using main element (not document, which may lack a body in the importer pipeline)
    const pageBlocks = findBlocksOnPage(main, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 4b. Post-parse safety net: remove duplicate tab content that leaked through.
    // IDs are empty at this stage (generated later by html2md), so match by text.
    // Track seen heading texts - first occurrence is legitimate, duplicates are tab panel leaks.
    const seenH2Texts = new Set();
    const parsedBlockClasses = ['columns-destination', 'cards-destination', 'destination-map', 'table-weather', 'accordion-faq', 'section-metadata', 'metadata'];
    Array.from(main.querySelectorAll('h2')).forEach((h2) => {
      const text = h2.textContent.trim().toLowerCase();
      if (seenH2Texts.has(text)) {
        // Duplicate heading found - walk up from h2 to the nearest section-level ancestor
        // to remove the entire tab panel structure, not just the h2 itself
        let target = h2;
        while (target.parentElement && target.parentElement !== main) {
          const parent = target.parentElement;
          // Stop at section containers or parsed EDS block tables
          if (parent.classList.contains('section')
            || parsedBlockClasses.some((c) => parent.classList.contains(c))) break;
          target = parent;
        }
        // Remove target and all following siblings at this level
        let node = target.nextSibling;
        while (node) {
          const toRemove = node;
          node = node.nextSibling;
          toRemove.remove();
        }
        target.remove();
      } else {
        seenH2Texts.add(text);
      }
    });
    // Remove "Show more things to do" and "Back to top" remnants
    main.querySelectorAll('p, a').forEach((el) => {
      const text = el.textContent.trim().toLowerCase();
      if (text === 'show more things to do' || text === 'back to top') {
        el.remove();
      }
    });

    // 5. Constrain image sizes - add width attribute to prevent oversized images
    main.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      // Extract width from URL params if available
      let width = 0;
      const widMatch = src.match(/[?&]wid=(\d+)/);
      const widthMatch = src.match(/[?&]width=(\d+)/);
      if (widMatch) {
        width = parseInt(widMatch[1], 10);
      } else if (widthMatch) {
        width = parseInt(widthMatch[1], 10);
      }
      // Cap at reasonable max width for content images
      if (width > 0 && width <= 1200) {
        img.setAttribute('width', String(width));
      } else if (!img.getAttribute('width')) {
        // Default max width for content images without explicit sizing
        img.setAttribute('width', '400');
      }
    });

    // 6. Final cleanup: remove any remaining tracking pixels before metadata extraction
    main.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (
        src.includes('bat.bing.com')
        || src.includes('adnxs.com')
        || src.includes('doubleclick.net')
        || src.includes('setuid?')
        || src.includes('facebook.com/tr')
        || (src.includes('action/0?') && src.includes('ti='))
      ) {
        const parent = img.closest('p');
        if (parent && parent.children.length <= 1 && !parent.textContent.trim()) {
          parent.remove();
        } else {
          img.remove();
        }
      }
    });

    // 7. Final text cleanup - remove site navigation remnants that survived all transforms
    main.querySelectorAll('p').forEach((p) => {
      const text = p.textContent.trim().toLowerCase();
      if (text === 'back to top' || text === 'show more things to do') {
        p.remove();
      }
    });

    // 8. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 9. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
