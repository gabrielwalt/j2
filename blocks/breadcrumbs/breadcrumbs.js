const CHEVRON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="m14.192 10.442-6.25 6.25a.624.624 0 1 1-.884-.884L12.866 10 7.058 4.192a.625.625 0 1 1 .884-.884l6.25 6.25a.624.624 0 0 1 0 .884Z"/></svg>';

/**
 * Converts a URL path segment to a display label.
 * "algarve" → "Algarve holidays", "destinations" → "Destinations"
 * @param {string} segment - hyphenated path segment
 * @param {boolean} isFirst - whether this is the first path segment
 * @returns {string} display label
 */
function segmentToLabel(segment, isFirst) {
  const label = segment.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  return isFirst ? label : `${label} holidays`;
}

/**
 * Builds breadcrumb trail and h1 from the URL path.
 * Auto-built by scripts.js — no authored content required.
 * @param {Element} block The breadcrumbs block element
 */
export default function decorate(block) {
  const { pathname } = window.location;
  const segments = pathname.replace(/\.html$/, '').split('/').filter(Boolean);
  if (segments.length === 0) return;

  const ol = document.createElement('ol');
  ol.setAttribute('itemscope', '');
  ol.setAttribute('itemtype', 'http://schema.org/BreadcrumbList');

  let path = '';
  segments.forEach((segment, i) => {
    path += `/${segment}`;
    const isLast = i === segments.length - 1;
    const label = segmentToLabel(segment, i === 0);

    const li = document.createElement('li');
    li.setAttribute('itemprop', 'itemListElement');
    li.setAttribute('itemscope', '');
    li.setAttribute('itemtype', 'http://schema.org/ListItem');

    if (isLast) {
      const span = document.createElement('span');
      span.setAttribute('itemprop', 'item');
      span.setAttribute('aria-current', 'page');
      span.textContent = label;
      li.append(span);
    } else {
      const a = document.createElement('a');
      a.href = path;
      a.setAttribute('itemprop', 'item');
      a.textContent = label;
      li.append(a);

      const chevron = document.createElement('span');
      chevron.className = 'breadcrumbs-separator';
      chevron.innerHTML = CHEVRON_SVG;
      li.append(chevron);
    }

    const meta = document.createElement('meta');
    meta.setAttribute('itemprop', 'position');
    meta.content = String(i + 1);
    li.append(meta);

    ol.append(li);
  });

  block.textContent = '';

  // Skip h1 on top-level /destinations page (hero provides the heading)
  const isTopDestinations = segments.length === 1 && segments[0] === 'destinations';
  if (isTopDestinations) {
    block.append(ol);
  } else {
    const title = segmentToLabel(segments[segments.length - 1], segments.length === 1);
    const h1 = document.createElement('h1');
    h1.textContent = title;
    block.append(ol, h1);
  }
}
