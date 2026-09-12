(() => {
  'use strict';
  const article = document.querySelector('.extra-guide-article');
  if (!article) return;

  function revealTarget(hash) {
    let id;
    try { id = decodeURIComponent(hash.slice(1)); } catch { return null; }
    const target = id && document.getElementById(id);
    if (!target || !article.contains(target)) return null;
    let opened = false;
    for (let parent = target.parentElement; parent && parent !== article; parent = parent.parentElement) {
      if (parent.tagName === 'DETAILS' && !parent.open) {
        parent.open = true;
        opened = true;
      }
    }
    return { target, opened };
  }

  // Reveal folded explanations before the browser performs normal anchor navigation.
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.target || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(link.href, location.href);
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) revealTarget(url.hash);
  });

  addEventListener('hashchange', () => {
    const result = revealTarget(location.hash);
    // Only correct a hidden target that required unfolding. Ordinary back/forward
    // navigation keeps the browser's own reading-position restoration.
    if (result?.opened) requestAnimationFrame(() => result.target.scrollIntoView({ block: 'start' }));
  });

  const initial = revealTarget(location.hash);
  if (initial?.opened) {
    if (document.readyState === 'complete') initial.target.scrollIntoView({ block: 'start' });
    else addEventListener('load', () => initial.target.scrollIntoView({ block: 'start' }), { once: true });
  }
})();
