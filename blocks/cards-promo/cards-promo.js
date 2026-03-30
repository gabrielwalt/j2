import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-promo-card-image';
      } else {
        div.className = 'cards-promo-card-body';
      }
    });

    // Wrap entire card in the link so image + heading are both clickable
    const link = li.querySelector('.cards-promo-card-body a');
    if (link) {
      const wrapper = document.createElement('a');
      wrapper.href = link.href;
      wrapper.className = 'cards-promo-card-link';
      // Replace the nested link with plain text to avoid <a> inside <a>
      const heading = link.closest('h3') || link.parentElement;
      heading.textContent = link.textContent;
      while (li.firstChild) wrapper.append(li.firstChild);
      li.append(wrapper);
    }

    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimized = createOptimizedPicture(img.src, img.alt, false, [{ width: '540' }]);
    img.closest('picture').replaceWith(optimized);
  });
  block.replaceChildren(ul);
}
