/**
 * Hero block decoration.
 *
 * The auto-block (buildHeroBlock in scripts.js) creates:
 *   .hero > div > div > picture, h1, [h2], [p]
 *
 * Note: aem.js wrapTextNodes() may wrap all cell children inside a <p>
 * when the first element is <picture> with siblings. This decorate
 * function searches the entire block to avoid relying on cell structure.
 *
 * This decorate function restructures into:
 *   .hero > .hero-title    (h1 with background-image from the picture)
 *   .hero > .hero-intro    (h2 + p intro band — only on landing page)
 *
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const picture = block.querySelector('picture');
  const h1 = block.querySelector('h1');
  const h2 = block.querySelector('h2');
  const p = [...block.querySelectorAll('p')].find(
    (el) => !el.querySelector('picture') && el.textContent.trim(),
  );

  // Extract image URL before clearing
  const img = picture?.querySelector('img');
  const imgSrc = img?.src || '';

  // Clear the original row/column wrapper
  block.textContent = '';

  // Title with background image
  if (h1) {
    const titleDiv = document.createElement('div');
    titleDiv.className = 'hero-title';
    if (imgSrc) {
      titleDiv.style.backgroundImage = `url('${imgSrc}')`;
    }
    titleDiv.append(h1);
    block.append(titleDiv);
  }

  // Optional intro band (h2 + paragraph)
  if (h2 || p) {
    const introDiv = document.createElement('div');
    introDiv.className = 'hero-intro';
    if (h2) introDiv.append(h2);
    if (p) introDiv.append(p);
    block.append(introDiv);
  }
}
