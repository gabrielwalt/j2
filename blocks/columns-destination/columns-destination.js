/**
 * Wait for the block's own CSS <link> to finish loading.
 * In EDS, loadBlock() loads CSS and JS in parallel, so decorate()
 * can run before the stylesheet is applied.
 */
function waitForBlockCSS() {
  const link = document.querySelector('link[href*="columns-destination"]');
  if (!link) return Promise.resolve();
  if (link.sheet) return Promise.resolve();
  return new Promise((resolve) => {
    link.addEventListener('load', resolve);
    link.addEventListener('error', resolve);
  });
}

function addReadMore(textCol) {
  const paragraphs = textCol.querySelectorAll('p');
  if (paragraphs.length < 2) return;

  // Wrap paragraphs in a container for clamping
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-destination-text is-clamped';
  [...paragraphs].forEach((p) => wrapper.append(p));
  textCol.append(wrapper);

  const heading = textCol.querySelector('h2');
  const label = heading ? heading.textContent : '';

  const btn = document.createElement('button');
  btn.className = 'columns-destination-toggle';
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-label', `Read more about "${label}"`);
  btn.textContent = 'Read more';
  textCol.append(btn);

  btn.addEventListener('click', () => {
    const expanded = wrapper.classList.toggle('is-clamped');
    btn.setAttribute('aria-expanded', String(!expanded));
    btn.textContent = expanded ? 'Read more' : 'Read less';
  });

  // Remove clamp + button if content is short enough.
  // Wait for block CSS (so -webkit-line-clamp is applied) and fonts (so text reflows).
  Promise.all([waitForBlockCSS(), document.fonts.ready]).then(() => {
    requestAnimationFrame(() => {
      wrapper.classList.remove('is-clamped');
      const naturalHeight = wrapper.scrollHeight;
      wrapper.classList.add('is-clamped');
      const clampedHeight = wrapper.offsetHeight;
      if (clampedHeight >= naturalHeight) {
        wrapper.classList.remove('is-clamped');
        btn.remove();
      }
    });
  });
}

export default function decorate(block) {
  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-destination-${cols.length}-cols`);

  // setup image columns & read-more for text columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-destination-img-col');
        }
      } else if (cols.length > 1) {
        addReadMore(col);
      }
    });
  });
}
