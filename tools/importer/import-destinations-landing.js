/* eslint-disable */
/* global WebImporter */

/**
 * Import script for the destinations landing page:
 * https://www.jet2holidays.com/destinations
 *
 * This page has a completely different DOM structure from the
 * destination region/country/resort pages. It uses:
 * - .image-banner (hero with h1)
 * - .title-and-text (intro paragraph)
 * - .content-scrollable with .promo-card-item (destination card carousels)
 * - .media-block (promo columns with image + text + CTA)
 *
 * Rules from user:
 * - IGNORE the media-block containing "Get more with a free myJet2 account!" (empty heading, myJet2 signup)
 * - IGNORE everything after the 2nd media-block "Discover a different side of Sicily"
 *   (but include that media-block itself)
 */

// PARSER IMPORTS
import cardsPromoParser from './parsers/cards-promo.js';
import columnsPromoParser from './parsers/columns-promo.js';

// TRANSFORMER IMPORTS
import jet2CleanupTransformer from './transformers/jet2-cleanup.js';

// PARSER REGISTRY
const parsers = {
  'cards-promo': cardsPromoParser,
  'columns-promo': columnsPromoParser,
};

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'destinations-landing',
  description: 'Destinations landing page showing curated destination collections with promo cards and promotional media blocks',
  urls: ['https://www.jet2holidays.com/destinations'],
  blocks: [
    {
      name: 'cards-promo',
      instances: ['.content-scrollable'],
    },
    {
      name: 'columns-promo',
      instances: ['.media-block'],
    },
  ],
  sections: [],
};

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    // The page content lives inside .site-content > section.
    // Use the <section> as the content root to strip all surrounding chrome.
    const siteContent = document.querySelector('.site-content');
    const contentSection = siteContent
      ? siteContent.querySelector('section')
      : null;
    if (contentSection) {
      document.body.innerHTML = '';
      document.body.appendChild(contentSection);
    } else if (siteContent) {
      document.body.innerHTML = '';
      document.body.appendChild(siteContent);
    }
    const main = document.body;

    // 1. Run beforeTransform cleanup (cookie banners, tracking pixels, image sanitization)
    try {
      jet2CleanupTransformer('beforeTransform', main, { ...payload, template: PAGE_TEMPLATE });
    } catch (e) {
      console.error('Cleanup beforeTransform failed:', e);
    }

    // 2. Aggressive chrome removal — strip ALL non-content elements
    WebImporter.DOMUtils.remove(main, [
      // Headers & navigation
      'header', 'nav', '.header-v2', '.header-mobile-v2',
      '.nav-bar-mobile', '.close-menu-overlay',
      // Footers
      'footer', '.footer-v2', '.footer-links', '.back-to-top',
      // Search UI
      '.search-nav-input', '.edit-search', '.search-box',
      '[class*="search-box-wrapper"]', '#search-bar-section',
      '.search-bar-v2', '.search-bar-v2-wrapper',
      // Shortlists / dealfinder / modals
      '[class*="shortlists"]', '.dealfinder-container',
      '.modal', '.overlay',
      // Destination tabs & footer links
      '.dest-tabs',
      // Email signup
      '.email-signup', '[class*="email-signup"]', '.js-email-signup-form-content',
      // Breadcrumbs
      '#breadcrumbs-section', '[class*="breadcrumbs"]',
      // Contact / chat
      '[class*="contact-bar"]', '[class*="chat-widget"]',
      // Misc chrome
      '.fragment', '.banner-message',
      'input', 'iframe', 'link', 'noscript', 'script', 'style',
    ]);

    // 3. Landing-page-specific cleanup: remove unwanted media blocks
    // Remove myJet2 media-block (the one with empty heading / "Get more with a free myJet2 account!")
    main.querySelectorAll('.media-block-table, .media-block--reverse').forEach((el) => {
      el.remove();
    });

    // Also check for myJet2 by content (in case class names change)
    main.querySelectorAll('.media-block').forEach((mb) => {
      const heading = mb.querySelector('.media-block__heading, h2');
      const text = heading?.textContent?.trim() || '';
      if (!text || /myjet2/i.test(mb.textContent)) {
        const loginLink = mb.querySelector('a[href*="login"], a[href*="myjet2"]');
        if (!text || loginLink) {
          mb.remove();
        }
      }
    });

    // Remove "Recently viewed" section
    main.querySelectorAll('.section-recent-hotel').forEach((el) => el.remove());

    // 4. Content cutoff: remove everything after "Discover a different side of Sicily" media-block
    let sicilyBlock = null;
    main.querySelectorAll('.media-block').forEach((mb) => {
      const heading = mb.querySelector('.media-block__heading, h2');
      if (heading && /sicily/i.test(heading.textContent)) {
        sicilyBlock = mb;
      }
    });

    if (sicilyBlock) {
      const cutoffContainer = sicilyBlock.closest('.padding--bottom') || sicilyBlock.parentElement;

      // Remove all siblings after the Sicily block's container
      let next = cutoffContainer.nextElementSibling;
      while (next) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }

      // Also remove siblings after the Sicily block itself within its container
      let nextInner = sicilyBlock.nextElementSibling;
      while (nextInner) {
        const toRemove = nextInner;
        nextInner = nextInner.nextElementSibling;
        toRemove.remove();
      }
    }

    // 5. Build content in document order by walking the cleaned DOM

    // Section 1: Hero block from .image-banner + .title-and-text
    // Row 1 = image, Row 2 = h1, Row 3 = h2 + intro paragraph
    const banner = main.querySelector('.image-banner');
    const titleAndText = main.querySelector('.title-and-text');
    if (banner) {
      const img = banner.querySelector('img');
      const h1 = banner.querySelector('h1');
      const cells = [];
      if (img) {
        const src = img.dataset?.src || img.src || '';
        const newImg = document.createElement('img');
        newImg.src = src;
        newImg.alt = h1?.textContent?.trim() || '';
        cells.push([[newImg]]);
      }
      if (h1) {
        const newH1 = document.createElement('h1');
        newH1.textContent = h1.textContent.trim();
        cells.push([[newH1]]);
      }
      if (titleAndText) {
        const h2 = titleAndText.querySelector('h2');
        const p = titleAndText.querySelector('p');
        const introContent = [];
        if (h2) {
          const newH2 = document.createElement('h2');
          newH2.textContent = h2.textContent.trim();
          introContent.push(newH2);
        }
        if (p) {
          const newP = document.createElement('p');
          newP.textContent = p.textContent.trim();
          introContent.push(newP);
        }
        if (introContent.length > 0) {
          cells.push([introContent]);
        }
        titleAndText.remove();
      }
      const heroBlock = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
      banner.replaceWith(heroBlock);
    }

    // 6. Extract section headings from .section > .wrapper > h2 elements
    // These appear before each content-scrollable carousel
    main.querySelectorAll('.section .section-head__title, .section .section-head').forEach((heading) => {
      const text = heading.textContent.trim();
      if (text) {
        const h2 = document.createElement('h2');
        h2.textContent = text;
        // Replace the .section container with just the h2
        const sectionDiv = heading.closest('.section');
        if (sectionDiv) {
          sectionDiv.replaceWith(h2);
        }
      }
    });

    // 7. Parse blocks: find and process content-scrollable and media-block elements
    // Process cards-promo (content-scrollable)
    main.querySelectorAll('.content-scrollable').forEach((el) => {
      try {
        cardsPromoParser(el, { document, url, params });
      } catch (e) {
        console.error('cards-promo parser failed:', e);
      }
    });

    // Process columns-promo (media-block)
    main.querySelectorAll('.media-block').forEach((el) => {
      try {
        columnsPromoParser(el, { document, url, params });
      } catch (e) {
        console.error('columns-promo parser failed:', e);
      }
    });

    // 8. Run afterTransform cleanup
    try {
      jet2CleanupTransformer('afterTransform', main, { ...payload, template: PAGE_TEMPLATE });
    } catch (e) {
      console.error('Cleanup afterTransform failed:', e);
    }

    // 9. Add section breaks between major content areas
    // Strategy: insert <hr> before each h2 that follows a block table
    const allChildren = Array.from(main.children);
    for (let i = 1; i < allChildren.length; i++) {
      const child = allChildren[i];
      const prev = allChildren[i - 1];
      // Insert section break before h2 that follows a cards-promo or columns-promo block table
      if (child.tagName === 'H2'
        && prev.tagName === 'TABLE'
        && prev.querySelector('th')) {
        const hr = document.createElement('hr');
        child.before(hr);
      }
    }

    // 10. Remove empty containers and wrappers left behind
    main.querySelectorAll('.padding--bottom, .wrapper, .section').forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, table')) {
        el.remove();
      }
    });

    // Unwrap remaining wrapper divs that only contain content
    main.querySelectorAll('.padding--bottom').forEach((pad) => {
      // Move children out and remove the wrapper
      while (pad.firstChild) {
        pad.before(pad.firstChild);
      }
      pad.remove();
    });

    // 11. Clean up tracking attributes and empty elements
    main.querySelectorAll('[data-track]').forEach((el) => el.removeAttribute('data-track'));
    main.querySelectorAll('[onclick]').forEach((el) => el.removeAttribute('onclick'));
    main.querySelectorAll('[data-component]').forEach((el) => el.removeAttribute('data-component'));

    // Remove empty divs, sections, etc.
    main.querySelectorAll('div, section').forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, table, hr')) {
        el.remove();
      }
    });

    // 12. Constrain image sizes
    main.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      let width = 0;
      const widMatch = src.match(/[?&]wid=(\d+)/);
      if (widMatch) width = parseInt(widMatch[1], 10);
      if (width > 0 && width <= 1200) {
        img.setAttribute('width', String(width));
      } else if (!img.getAttribute('width')) {
        img.setAttribute('width', '400');
      }
    });

    // 13. Remove tracking pixels, SVG placeholders, and broken images
    main.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (
        src.includes('bat.bing.com')
        || src.includes('adnxs.com')
        || src.includes('doubleclick.net')
        || src.includes('setuid?')
        || src.includes('facebook.com/tr')
        || (src.includes('action/0?') && src.includes('ti='))
        || src.startsWith('data:image/svg')
        || src === ''
      ) {
        const parent = img.closest('p');
        if (parent && parent.children.length <= 1 && !parent.textContent.trim()) {
          parent.remove();
        } else {
          img.remove();
        }
      }
    });

    // 14. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 15. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
      },
    }];
  },
};
