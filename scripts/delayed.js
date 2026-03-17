// Disable links to pages that haven't been imported yet
const SKIP_PATHS = new Set(['/', '']);
const ASSET_EXT = /\.(js|css|json|svg|png|jpg|jpeg|webp|gif|ico|woff2?|ttf|pdf)$/i;

async function disableUnimportedLinks() {
  try {
    const resp = await fetch('/PAGES.txt');
    if (!resp.ok) return;
    const text = await resp.text();
    const importedPaths = new Set(
      text.trim().split('\n')
        .map((line) => `/${line.trim().replace(/^content\//, '')}`)
        .filter(Boolean),
    );

    document.querySelectorAll('a[href]').forEach((a) => {
      try {
        const url = new URL(a.href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        const pathname = url.pathname.replace(/\/$/, '').replace(/\.html$/, '');
        if (SKIP_PATHS.has(pathname)) return;
        if (ASSET_EXT.test(pathname)) return;
        if (pathname.startsWith('#')) return;
        if (importedPaths.has(pathname)) return;

        a.style.cursor = 'not-allowed';
        a.title = 'Content not imported yet';
        a.style.opacity = '0.5';
        a.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      } catch { /* skip malformed URLs */ }
    });
  } catch { /* silently fail if PAGES.txt unavailable */ }
}

disableUnimportedLinks();
