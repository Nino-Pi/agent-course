(() => {
  'use strict';
  const root = new URL(document.body.dataset.courseRoot, location.href);
  const sitePath = new URL('.', root).pathname;
  const internal = value => {
    if (!value) return false;
    try { const url = new URL(value, location.href); return url.origin === location.origin && url.pathname.startsWith(sitePath); }
    catch { return false; }
  };
  const storageKey = 'agent-course-pending-navigation';
  const getPending = () => { try { return JSON.parse(sessionStorage.getItem(storageKey)); } catch { return null; } };
  const pending = getPending();
  const hasArrival = pending && Date.now() - pending.at < 60000 && pending.to === location.href && internal(pending.from);
  if (hasArrival) { try { sessionStorage.removeItem(storageKey); } catch {} }
  const previousState = history.state && typeof history.state === 'object' ? history.state : {};
  try { history.replaceState({ ...previousState, courseHasPrevious: Boolean(previousState.courseHasPrevious || hasArrival || internal(document.referrer)) }, ''); } catch {}
  document.querySelectorAll('[data-course-back]').forEach(link => link.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (history.length > 1 && history.state?.courseHasPrevious) history.back();
    else location.assign(root.href);
  }));
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('data-course-back') || link.target || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || !internal(link.href)) return;
    try { sessionStorage.setItem(storageKey, JSON.stringify({ from: location.href, to: link.href, at: Date.now() })); } catch {}
  });
  addEventListener('hashchange', event => {
    if (event.oldURL === event.newURL) return;
    const intent = getPending();
    if (!intent || intent.to !== event.newURL || intent.from !== event.oldURL || Date.now() - intent.at >= 60000) return;
    try { sessionStorage.removeItem(storageKey); } catch {}
    const state = history.state && typeof history.state === 'object' ? history.state : {};
    try { history.replaceState({ ...state, courseHasPrevious: true }, ''); } catch {}
  });

  const contents = document.querySelector('[data-course-contents]');
  if (contents) {
    const wide = matchMedia('(min-width: 1101px)');
    const saveContentsState = () => {
      const state = history.state && typeof history.state === 'object' ? history.state : {};
      if (state.courseContentsOpen === contents.open) return;
      try { history.replaceState({ ...state, courseContentsOpen: contents.open }, ''); } catch {}
    };
    const restoreContentsState = () => {
      if (typeof history.state?.courseContentsOpen === 'boolean') contents.open = history.state.courseContentsOpen;
    };
    // Restore layout before native scroll restoration; a collapsed TOC must not
    // remove height from a reloaded or revisited reading position.
    contents.open = typeof history.state?.courseContentsOpen === 'boolean' ? history.state.courseContentsOpen : wide.matches;
    saveContentsState();
    contents.addEventListener('toggle', saveContentsState);
    addEventListener('popstate', restoreContentsState);
    // Native anchor navigation creates a new history entry. Give that entry
    // the current layout without replacing the browser's scroll behavior.
    addEventListener('hashchange', saveContentsState);
    wide.addEventListener('change', event => { contents.open = event.matches; });
  }
  const filter = document.querySelector('#chapter-filter');
  if (filter) {
    const normalize = value => value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
    const update = () => {
      const query = normalize(filter.value), words = query.split(' ').filter(Boolean);
      let count = 0;
      document.querySelectorAll('[data-chapter-item]').forEach(item => {
        item.hidden = !words.every(word => normalize(item.dataset.search).includes(word));
        if (!item.hidden) count++;
      });
      document.querySelectorAll('[data-chapter-group]').forEach(group => { group.hidden = !group.querySelector('[data-chapter-item]:not([hidden])'); });
      const status = document.querySelector('#filter-status');
      status.hidden = !query;
      status.textContent = count ? `找到 ${count} 个章节` : '没有找到匹配章节，请尝试其他关键词。';
    };
    filter.addEventListener('input', update);
    addEventListener('pageshow', update);
  }
})();
