function addReadMore(textCol) {
  const paragraphs = textCol.querySelectorAll('p');
  if (paragraphs.length < 2) return;

  // Wrap paragraphs in a container for clamping
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-destination-text';
  [...paragraphs].forEach((p) => wrapper.append(p));
  textCol.append(wrapper);

  // Measure natural height, then clamp and compare with forced reflow
  requestAnimationFrame(() => {
    const naturalHeight = wrapper.scrollHeight;
    wrapper.classList.add('is-clamped');
    const clampedHeight = wrapper.offsetHeight; // force synchronous reflow

    if (clampedHeight >= naturalHeight) {
      wrapper.classList.remove('is-clamped');
      return;
    }

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
