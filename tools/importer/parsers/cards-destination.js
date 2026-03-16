/* eslint-disable */
/* global WebImporter */

/**
 * Parser: cards-destination
 * Base block: cards
 * Source: https://www.jet2holidays.com/destinations/portugal/algarve
 * Instances: .accommodation-teaser.block, .resorts-teaser.block, .blog-teaser.block, .poi-teaser.block
 *
 * Cards block library format: Each row = one card.
 * Column 1: image. Column 2: heading + description + CTA links.
 *
 * Handles four different source structures:
 * - accommodation-teaser: ul.cards > li.card (with ratings, features)
 * - resorts-teaser: ul.cards > li.card (with description)
 * - blog-teaser: .blog-card-container > .blog-card (with blog-card-title, blog-card-desc)
 * - poi-teaser: .card-container .poi-card (with poi-image-wrapper, poi-card-body)
 */
export default function parse(element, { document }) {
  const cells = [];

  const isBlogTeaser = element.classList.contains('blog-teaser');
  const isPoiTeaser = element.classList.contains('poi-teaser');

  if (isBlogTeaser) {
    // --- Blog teaser: extract header as default content ---
    const blogTitle = element.querySelector('.blog-header .blog-title, .blog-header h2');
    const blogSubtitle = element.querySelector('.blog-header .blog-subtitle, .blog-header p');
    if (blogTitle) element.before(blogTitle);
    if (blogSubtitle) element.before(blogSubtitle);

    // Blog cards use .blog-card structure
    const blogCards = element.querySelectorAll('.blog-card-container .blog-card, .blog-card');
    blogCards.forEach((card) => {
      const col1 = [];
      const picture = card.querySelector('picture');
      if (picture) col1.push(picture);

      const col2 = [];
      const titleEl = card.querySelector('.blog-card-title a, h3 a');
      if (titleEl) {
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.href = titleEl.href;
        a.textContent = titleEl.textContent.trim();
        h3.append(a);
        col2.push(h3);
      }
      const desc = card.querySelector('.blog-card-desc, p:not(.blog-card-title)');
      if (desc) {
        const p = document.createElement('p');
        p.textContent = desc.textContent.trim();
        col2.push(p);
      }

      if (col1.length > 0 || col2.length > 0) {
        cells.push([col1, col2]);
      }
    });

    // Blog CTA as default content after block
    const blogCta = element.querySelector('.blog-cta a, .blog-cta .button');
    if (blogCta) {
      const ctaP = document.createElement('p');
      const ctaA = document.createElement('a');
      ctaA.href = blogCta.href;
      ctaA.textContent = blogCta.textContent.trim();
      ctaP.append(ctaA);
      // Will be placed after block via DOM insertion
      element.after(ctaP);
    }
  } else if (isPoiTeaser) {
    // --- POI teaser: extract heading, blurbs, and POI cards ---
    const poiHeading = element.querySelector('.block-header h2, :scope > h2');
    if (poiHeading) element.before(poiHeading);

    // Extract active category blurb as description
    const activeBlurb = element.querySelector('.poi-blurb.active p, .poi-blurb p');
    if (activeBlurb) {
      const p = document.createElement('p');
      p.textContent = activeBlurb.textContent.trim();
      element.before(p);
    }

    // POI cards - limit to first 3 (matches the Overview tab teaser on the original page)
    const allPoiCards = element.querySelectorAll('.poi-card');
    const poiCards = Array.from(allPoiCards).slice(0, 3);
    poiCards.forEach((card) => {
      const col1 = [];
      const picture = card.querySelector('.poi-image-wrapper picture, picture');
      if (picture) col1.push(picture);

      const col2 = [];
      const titleEl = card.querySelector('.poi-card-body h3 a, .poi-card-body h3, h3 a, h3');
      if (titleEl) {
        if (titleEl.tagName === 'A') {
          const h3 = document.createElement('h3');
          const a = document.createElement('a');
          a.href = titleEl.href;
          a.textContent = titleEl.textContent.trim();
          h3.append(a);
          col2.push(h3);
        } else {
          const h3 = document.createElement('h3');
          h3.textContent = titleEl.textContent.trim();
          col2.push(h3);
        }
      }

      const location = card.querySelector('.poi-card-body .poi-location, .poi-card-body p');
      if (location) {
        const p = document.createElement('p');
        p.textContent = location.textContent.trim();
        col2.push(p);
      }

      if (col1.length > 0 || col2.length > 0) {
        cells.push([col1, col2]);
      }
    });
  } else {
    // --- Standard cards: accommodation-teaser and resorts-teaser ---
    // Both use ul.cards > li.card structure

    const heading = element.querySelector(':scope > h2, .block-header h2');
    if (heading) element.before(heading);

    const cardItems = element.querySelectorAll('ul.cards > li.card, li.card');
    cardItems.forEach((card) => {
      const col1 = [];
      const picture = card.querySelector('.cards-card-image picture, picture');
      if (picture) col1.push(picture);

      const col2 = [];

      // Card title (h3 with link)
      const titleLink = card.querySelector('.cards-card-body h3 a, .cards-card-body-header h3 a');
      const titleH3 = card.querySelector('.cards-card-body h3, .cards-card-body-header h3');
      if (titleLink) {
        const h3 = document.createElement('h3');
        const a = document.createElement('a');
        a.href = titleLink.href;
        a.textContent = titleLink.textContent.trim();
        h3.append(a);
        col2.push(h3);
      } else if (titleH3) {
        col2.push(titleH3);
      }

      // Location text (from map button)
      const mapBtn = card.querySelector('.card-map-btn');
      if (mapBtn) {
        // Get text content excluding icon spans
        const iconSpans = mapBtn.querySelectorAll('.icon');
        iconSpans.forEach((s) => s.remove());
        const locationText = mapBtn.textContent.trim();
        if (locationText) {
          const p = document.createElement('p');
          p.textContent = locationText;
          col2.push(p);
        }
      }

      // Description paragraph
      const description = card.querySelector('.cards-card-body-header > p');
      if (description) {
        col2.push(description);
      }

      // Feature list (for accommodation-teaser)
      const featureList = card.querySelector('.accommodation-features, .cards-card-body-footer ul');
      if (featureList) {
        const ul = document.createElement('ul');
        featureList.querySelectorAll('li').forEach((li) => {
          const newLi = document.createElement('li');
          newLi.textContent = li.textContent.trim();
          ul.append(newLi);
        });
        col2.push(ul);
      }

      if (col1.length > 0 || col2.length > 0) {
        cells.push([col1, col2]);
      }
    });
  }

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'cards-destination',
    cells,
  });
  element.replaceWith(block);
}
