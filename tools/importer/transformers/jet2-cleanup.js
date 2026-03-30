/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: jet2holidays cleanup.
 * Removes non-authorable content from Jet2 Holidays destination pages.
 * Only imports the "Overview" tab content; removes Resorts, Places to stay,
 * and Things to do tab panels.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Remove cookie/consent banners and overlays
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="cookie"]',
      '.ribbon-banner',
      '.ribbon-banner-wrapper',
    ]);

    // Activate lazy-loaded images: copy data-src → src, data-srcset → srcset
    // Jet2 uses a custom lazy loader that keeps real URLs in data-src/data-srcset
    // and leaves src empty or absent. Without this, images import as "about:error".
    element.querySelectorAll('img[data-src]').forEach((img) => {
      const dataSrc = img.getAttribute('data-src');
      const currentSrc = img.getAttribute('src') || '';
      if (dataSrc && (!currentSrc || currentSrc === 'about:error')) {
        // Clean Scene7 URLs: strip Dynamic Media preset suffix (":PresetName")
        // and add ?fmt=jpg for DA format detection — do this early so the browser
        // caches the exact URL that adjustImageUrls will later request.
        let cleanSrc = dataSrc;
        if (cleanSrc.includes('media.jet2.com/is/image/')) {
          try {
            const u = new URL(cleanSrc);
            u.pathname = u.pathname.replace(/:[\w-]+$/, '');
            if (!u.searchParams.has('fmt')) u.searchParams.set('fmt', 'jpg');
            cleanSrc = u.toString();
          } catch { /* keep original */ }
        }
        img.setAttribute('src', cleanSrc);
      } else if (currentSrc === 'about:error' && dataSrc) {
        // Fix images that the browser marked as errored
        img.setAttribute('src', dataSrc);
      }
      img.removeAttribute('data-src');
      const dataSrcset = img.getAttribute('data-srcset');
      if (dataSrcset && !img.getAttribute('srcset')) {
        img.setAttribute('srcset', dataSrcset);
      }
      if (dataSrcset) img.removeAttribute('data-srcset');
    });

    // Also fix any images that ended up as about:error (browser error state)
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src === 'about:error') {
        img.remove();
      }
    });

    // Sanitize image URLs containing $Web$ or other Adobe Dynamic Media tokens
    // These contain $ which breaks helix-importer regex construction
    element.querySelectorAll('img[src*="$"], source[srcset*="$"]').forEach((el) => {
      if (el.tagName === 'IMG' && el.src) {
        el.src = el.src.replace(/\?\$[^$]*\$/, '');
      }
      if (el.srcset) {
        el.srcset = el.srcset.replace(/\?\$[^$]*\$/g, '');
      }
    });

    // Remove "Skip to main content" link
    element.querySelectorAll('a[href="#main-content"]').forEach((a) => {
      const parent = a.closest('p') || a.parentElement;
      if (parent && parent.tagName !== 'BODY') parent.remove();
    });
    // Also remove the skip-link anchor element itself
    element.querySelectorAll('a.skip-link, .skip-link').forEach((el) => el.remove());

    // Remove page-level tab controls and navigation
    WebImporter.DOMUtils.remove(element, [
      '.tab-controls',
      '.tab-controls-wrapper',
      '.page-tabs',
      '.page-tabs-wrapper',
    ]);

    // Remove video/YouTube embeds (not authorable content for this template)
    WebImporter.DOMUtils.remove(element, [
      '.video',
      '.video-v2',
    ]);

    // Remove non-Overview tab panels entirely (Regions, Places to stay, Things to do)
    // These are separate tab panel sections at the <main> level that contain
    // non-authorable content (dynamic search, category filters, region lists)
    element.querySelectorAll('section[role="tabpanel"]').forEach((panel) => {
      const id = panel.id || '';
      if (!id.includes('overview')) {
        panel.remove();
      }
    });

    // Safety net: Remove individual non-authorable dynamic/navigation blocks
    // in case they appear outside tab panel structure
    WebImporter.DOMUtils.remove(element, [
      '.regions-teaser',
      '.things-to-do-teaser',
      '.things-to-do',
      '.region-teaser-list',
      '.accommodation-search',
    ]);

    // Remove tab navigation links (Overview/Resorts/Places to stay/Things to do)
    element.querySelectorAll('a[href*="tabs|main:"], a[href*="tabs%7Cmain:"]').forEach((a) => {
      const li = a.closest('li');
      if (li) li.remove();
    });

    // ---------------------------------------------------------------
    // OVERVIEW TAB ONLY: Remove all content after the last known section.
    // Strategy 1: Find the email-sign-up section container
    // Strategy 2: Find the email-sign-up block and truncate from its parent
    // Strategy 3: Find known tab panel headings and remove from there
    // ---------------------------------------------------------------

    // Strategy 1: Try section container selector
    let cutoffElement = element.querySelector('.section.email-sign-up-v2-container');

    // Strategy 2: Find the block itself and go up to its section container
    if (!cutoffElement) {
      const emailBlock = element.querySelector('.email-sign-up-v2');
      if (emailBlock) {
        cutoffElement = emailBlock.closest('.section') || emailBlock.parentElement;
      }
    }

    if (cutoffElement) {
      let next = cutoffElement.nextElementSibling;
      while (next) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    }

    // Strategy 3: Content-based removal as fallback
    // Remove duplicate tab panel content that starts with known headings
    const allHeadings = element.querySelectorAll('h2');
    allHeadings.forEach((h2) => {
      const text = h2.textContent.trim();
      // "Algarve Resorts (33)" or similar numbered resort list from Resorts tab
      if (/resorts\s*\(\d+\)/i.test(text)) {
        // Remove from this heading to end of its container or all following siblings
        const container = h2.closest('.section') || h2.parentElement;
        if (container && container.tagName !== 'BODY') {
          container.remove();
        } else {
          // Remove heading and everything after it within parent
          let next = h2.nextElementSibling;
          while (next) {
            const toRemove = next;
            next = next.nextElementSibling;
            toRemove.remove();
          }
          h2.remove();
        }
      }
      // "accommodation options found" - Places to stay tab
      if (/accommodation\s+options?\s+found/i.test(text)) {
        const container = h2.closest('.section') || h2.parentElement;
        if (container && container.tagName !== 'BODY') container.remove();
      }
    });

    // Remove "Explore some of our great destinations" navigation section
    element.querySelectorAll('h2, h3').forEach((heading) => {
      if (/explore.*destinations/i.test(heading.textContent)) {
        const container = heading.closest('.section') || heading.parentElement;
        if (container && container.tagName !== 'BODY') container.remove();
      }
    });

    // Remove tracking pixels (Bing, AdNexus, DoubleClick, etc.)
    element.querySelectorAll('img').forEach((img) => {
      const src = img.src || img.getAttribute('src') || '';
      if (
        src.includes('bat.bing.com')
        || src.includes('adnxs.com')
        || src.includes('doubleclick.net')
        || src.includes('facebook.com/tr')
        || src.includes('google-analytics.com')
        || src.includes('googletagmanager.com')
        || src.includes('setuid?')
        || (src.includes('action/0?') && src.includes('ti='))
      ) {
        const parent = img.closest('p') || img.parentElement;
        if (parent && parent.children.length === 1 && parent.tagName !== 'BODY') {
          parent.remove();
        } else {
          img.remove();
        }
      }
    });

    // Remove "Back to top" links and "Show more" buttons
    element.querySelectorAll('a, button, p').forEach((el) => {
      const text = el.textContent.trim().toLowerCase();
      if (text === 'back to top' || text === 'show more things to do') {
        const parent = el.closest('p') || el.parentElement;
        if (parent && parent !== element && parent.children.length <= 1 && parent.textContent.trim().toLowerCase() === text) {
          parent.remove();
        } else {
          el.remove();
        }
      }
    });

    // Clean up empty ULs left behind (but not inside content blocks)
    element.querySelectorAll('ul').forEach((ul) => {
      if (
        ul.children.length === 0
        && !ul.closest('.destination-description, .title-links, .icon-grid-v2, .accommodation-teaser, .resorts-teaser, .blog-teaser, .poi-teaser, .email-sign-up-v2')
      ) {
        ul.remove();
      }
    });

    // Proxy Sitecore media images to enforce max dimensions.
    // Sitecore's /-/media/ CDN ignores resize query params (height, format, etc.)
    // for large stock images, returning originals up to 22MB+. DA has a 20MB
    // per-image upload limit. Route these through wsrv.nl proxy which enforces
    // max 2000px width — keeps images well under 1MB while preserving quality.
    // AEM's own CDN (createOptimizedPicture) handles further optimization at
    // delivery time. Only targets /-/media/ paths; Scene7 and AEM media_xxx
    // URLs are already correctly sized.
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('/-/media/')) {
        try {
          const imgUrl = new URL(src, 'https://www.jet2holidays.com');
          const baseUrl = `${imgUrl.origin}${imgUrl.pathname}`;
          img.setAttribute('src', `https://wsrv.nl/?url=${encodeURIComponent(baseUrl)}&w=2000&fit=inside&output=jpg&q=85`);
        } catch { /* ignore malformed URLs */ }
      }
    });

    // Ensure Scene7 URLs have an explicit format declaration.
    // Scene7 (media.jet2.com) serves images without file extensions in the URL
    // path, e.g. /is/image/jet2/524678-beach_getty. DA requires a recognizable
    // format indicator. Adding ?fmt=jpg (or &fmt=jpg if params exist) tells
    // Scene7 to serve JPEG explicitly — the image is byte-identical. Do NOT add
    // a .jpg extension to the path: Scene7 treats extensions as part of the
    // asset name and returns a default placeholder.
    element.querySelectorAll('img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      if (src.includes('media.jet2.com/is/image/') && !src.includes('fmt=')) {
        try {
          const imgUrl = new URL(src);
          imgUrl.searchParams.set('fmt', 'jpg');
          img.setAttribute('src', imgUrl.toString());
        } catch { /* ignore malformed URLs */ }
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable global chrome
    WebImporter.DOMUtils.remove(element, [
      // Header and navigation
      'header',
      '.header-v2',
      // Footer
      'footer',
      '.footer-v2',
      // Breadcrumbs
      '#breadcrumbs-section',
      '[class*="breadcrumbs"]',
      // Search bar
      '#search-bar-section',
      '.search-bar-v2',
      '.search-bar-v2-wrapper',
      // Fragment blocks (navigation fragments)
      '.fragment',
      // Safe elements to remove
      'iframe',
      'link',
      'noscript',
      'script',
    ]);

    // Remove empty sections (sections with no meaningful content)
    element.querySelectorAll('.section').forEach((section) => {
      if (!section.textContent.trim() && !section.querySelector('img')) {
        section.remove();
      }
    });

    // Clean tracking attributes
    element.querySelectorAll('[data-track]').forEach((el) => el.removeAttribute('data-track'));
    element.querySelectorAll('[onclick]').forEach((el) => el.removeAttribute('onclick'));

    // Final pass: remove any remaining tracking pixel images
    element.querySelectorAll('img').forEach((img) => {
      const src = img.src || img.getAttribute('src') || '';
      if (
        src.includes('bat.bing.com')
        || src.includes('adnxs.com')
        || src.includes('doubleclick.net')
        || src.includes('setuid?')
      ) {
        const parent = img.closest('p');
        if (parent && parent.children.length <= 1 && !parent.textContent.trim()) {
          parent.remove();
        } else {
          img.remove();
        }
      }
    });
  }
}
