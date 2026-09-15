(() => {
  'use strict';
  const article = document.querySelector('.extra-guide-article');
  if (!article) return;

  const outline = document.querySelector('.contents');
  const outlineNav = outline?.querySelector('.guide-outline-nav');
  const routeNav = article.querySelector('.guide-route-nav');
  const routes = [...(routeNav?.querySelectorAll('a') || [])].map(link => ({
    link, target: document.getElementById(decodeURIComponent(link.hash.slice(1))),
  }));

  // Only the site header stays above the article. Native anchor positioning and
  // the shared reader's current-section calculation use the same clearance.
  const measureClearance = () => {
    const headerHeight = document.querySelector('.site-header')?.getBoundingClientRect().height || 72;
    document.documentElement.style.scrollPaddingTop = `${headerHeight + 12}px`;
  };
  measureClearance();
  if (typeof ResizeObserver === 'function') {
    const observer = new ResizeObserver(measureClearance);
    const header = document.querySelector('.site-header');
    if (header) observer.observe(header);
  } else addEventListener('resize', measureClearance, { passive: true });

  function setExpanded(module, expanded) {
    const button = module.querySelector('[data-guide-expand]');
    if (!button) return;
    const children = document.getElementById(button.getAttribute('aria-controls'));
    if (!children) return;
    children.hidden = !expanded;
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', `${expanded ? '收起' : '展开'}${module.querySelector('a').textContent}子目录`);
  }
  outlineNav?.querySelectorAll('.guide-outline-module').forEach(module => {
    const button = module.querySelector('[data-guide-expand]');
    if (!button) return;
    button.hidden = false;
    setExpanded(module, false);
    button.addEventListener('click', () => setExpanded(module, button.getAttribute('aria-expanded') !== 'true'));
  });

  function focusOutlineRoute(id) {
    outlineNav?.querySelectorAll('[data-guide-route]').forEach(group => {
      group.open = group.dataset.guideRoute === id;
    });
  }

  // A route change focuses its directory; manual expansion remains available.
  routeNav?.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = decodeURIComponent(link.hash.slice(1));
    focusOutlineRoute(id);
  });

  function syncLocation() {
    const top = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    let current = null;
    for (const route of routes) {
      if (route.target?.getBoundingClientRect().top <= top + 16) current = route;
      else break;
    }
    routes.forEach(route => {
      if (route === current) route.link.setAttribute('aria-current', 'location');
      else route.link.removeAttribute('aria-current');
    });
    const active = outlineNav?.querySelector('a[aria-current="location"]');
    outlineNav?.querySelectorAll('.guide-outline-group, .guide-outline-module').forEach(parent => {
      parent.classList.toggle('guide-current-parent', !!active && parent.contains(active));
    });
  }
  let locationFrame = 0;
  function scheduleLocation() {
    if (locationFrame) return;
    locationFrame = requestAnimationFrame(() => { locationFrame = 0; syncLocation(); });
  }
  addEventListener('scroll', scheduleLocation, { passive: true });
  addEventListener('resize', scheduleLocation, { passive: true });

  function revealOutlineLocation() {
    const active = outlineNav?.querySelector('a[aria-current="location"]');
    if (!active) return;
    const group = active.closest('.guide-outline-group');
    if (group) group.open = true;
    const module = active.closest('.guide-outline-module');
    if (module) setExpanded(module, true);
    if (outline.hidden) return;
    // Do not scroll the article when revealing a nested current item.
    const box = outlineNav.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (item.top < box.top + 12) outlineNav.scrollTop += item.top - box.top - 12;
    else if (item.bottom > box.bottom - 12) outlineNav.scrollTop += item.bottom - box.bottom + 12;
  }
  if (outlineNav) {
    // Normal scrolling marks the parent without reopening a group the reader
    // deliberately collapsed. Explicit navigation and showing the outline do open it.
    new MutationObserver(scheduleLocation).observe(outlineNav, { subtree: true, attributes: true, attributeFilter: ['aria-current'] });
    new MutationObserver(() => {
      if (!outline.hidden) requestAnimationFrame(revealOutlineLocation);
    }).observe(outline, { attributes: true, attributeFilter: ['hidden'] });
  }

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
    if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) {
      revealTarget(url.hash);
      // Clicking the same hash does not fire hashchange. Wait for the native
      // jump and the shared reader's next frame before exposing its current item.
      requestAnimationFrame(() => requestAnimationFrame(() => { syncLocation(); revealOutlineLocation(); }));
    }
  });

  addEventListener('hashchange', () => {
    const result = revealTarget(location.hash);
    // Only correct a hidden target that required unfolding. Ordinary back/forward
    // navigation keeps the browser's own reading-position restoration.
    if (result?.opened) requestAnimationFrame(() => result.target.scrollIntoView({ block: 'start' }));
    requestAnimationFrame(() => { syncLocation(); revealOutlineLocation(); });
  });

  const initial = revealTarget(location.hash);
  if (initial && routes.length) {
    const route = routes.filter(entry => entry.target && (entry.target === initial.target || (entry.target.compareDocumentPosition(initial.target) & Node.DOCUMENT_POSITION_FOLLOWING))).at(-1);
    if (route) focusOutlineRoute(route.target.id);
  }
  const initializeLocation = () => {
    measureClearance();
    // A deep link may have been positioned before the site header was measured.
    const navigation = performance.getEntriesByType('navigation')[0];
    if (initial && navigation?.type === 'navigate') initial.target.scrollIntoView({ block: 'start' });
    requestAnimationFrame(() => { syncLocation(); revealOutlineLocation(); });
  };
  if (document.readyState === 'complete') initializeLocation();
  else addEventListener('load', initializeLocation, { once: true });
})();
