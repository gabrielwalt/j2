import { createOptimizedPicture } from '../../scripts/aem.js';

const PIN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-destination-card-image';
      else div.className = 'cards-destination-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Add pin icon to the first paragraph (location) in each card body
  ul.querySelectorAll('.cards-destination-card-body').forEach((body) => {
    const h3 = body.querySelector('h3');
    if (!h3) return;
    const loc = h3.nextElementSibling;
    if (loc && loc.tagName === 'P') {
      loc.classList.add('cards-destination-location');
      loc.insertAdjacentHTML('afterbegin', PIN_SVG);
    }
  });

  block.textContent = '';
  block.append(ul);
}
