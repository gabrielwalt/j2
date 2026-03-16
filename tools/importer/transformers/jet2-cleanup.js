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
      '.section.ribbon-banner-container',
    ]);

    // Remove "Skip to main content" link
    element.querySelectorAll('a[href="#main-content"]').forEach((a) => {
      const parent = a.closest('p') || a.parentElement;
      if (parent) parent.remove();
    });

    // Remove page-level tab controls and navigation
    WebImporter.DOMUtils.remove(element, [
      '.tab-controls',
      '.tab-controls-wrapper',
      '.section.tab-controls-container',
      '.page-tabs',
      '.page-tabs-wrapper',
    ]);

    // Remove tab navigation links (Overview/Resorts/Places to stay/Things to do)
    element.querySelectorAll('a[href*="tabs|main:"], a[href*="tabs%7Cmain:"]').forEach((a) => {
      const li = a.closest('li');
      if (li) li.remove();
    });
    // Clean up empty ULs left behind after removing tab links
    element.querySelectorAll('ul').forEach((ul) => {
      if (ul.children.length === 0 && !ul.closest('.destination-description, .title-links, .icon-grid-v2, .accommodation-teaser, .resorts-teaser, .blog-teaser, .poi-teaser')) {
        ul.remove();
      }
    });

    // ---------------------------------------------------------------
    // OVERVIEW TAB ONLY: Remove everything after the email-sign-up section.
    // The Jet2 page uses tabs. When scrolling the full page, hidden tab panels
    // become visible. These contain:
    //   - "Resorts" tab: "Algarve Resorts (33)" with 33 resort cards
    //   - "Places to stay" tab: "464 accommodation options found"
    //   - "Things to do" tab: duplicate POI listings
    //   - "Explore destinations" footer navigation
    //   - Tracking pixels
    // All of this is after section 11 (email signup) and must be removed.
    // ---------------------------------------------------------------
    const emailSignupSection = element.querySelector('.section.email-sign-up-v2-container');
    if (emailSignupSection) {
      let next = emailSignupSection.nextElementSibling;
      while (next) {
        const toRemove = next;
        next = next.nextElementSibling;
        toRemove.remove();
      }
    }

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
        if (parent && parent.children.length === 1) {
          parent.remove();
        } else {
          img.remove();
        }
      }
    });
  }

  if (hookName === TransformHook.afterTransform) {
    // Remove non-authorable global chrome
    WebImporter.DOMUtils.remove(element, [
      // Header and navigation
      'header.header-v2-wrapper',
      '.header-v2',
      // Footer
      'footer.footer-v2-wrapper',
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
