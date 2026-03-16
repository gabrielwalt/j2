export default function decorate(block) {
  // Pull the preceding section heading into the card
  const wrapper = block.parentElement;
  const prev = wrapper?.previousElementSibling;
  if (prev?.classList.contains('default-content-wrapper')) {
    const h2 = prev.querySelector('h2');
    if (h2) {
      block.prepend(h2);
      if (!prev.children.length) prev.remove();
    }
  }
}
