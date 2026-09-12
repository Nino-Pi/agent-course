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
  const outline = contents?.closest('.contents');
  const headerNav = document.querySelector('.site-header nav');
  if (contents && outline && headerNav && document.querySelector('.reading-layout')) {
    const wide = matchMedia('(min-width: 1101px)');
    const summary = contents.querySelector('summary');
    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.dataset.outlineToggle = '';
    outline.id = 'course-outline';
    toggle.setAttribute('aria-controls', outline.id);
    headerNav.append(toggle);
    document.body.classList.add('reader-enhanced');

    const entries = [...contents.querySelectorAll('nav a[href^="#"]')].map(link => {
      let id;
      try { id = decodeURIComponent(link.hash.slice(1)); } catch { return null; }
      const heading = document.getElementById(id);
      return heading ? { link, heading } : null;
    }).filter(Boolean);
    let activeEntry = null;
    let explicitlyChosen = history.state?.courseOutlineChosen === true;
    let isOpen = typeof history.state?.courseContentsOpen === 'boolean' ? history.state.courseContentsOpen : wide.matches;
    let updateFrame = 0;
    let layoutFrame = 0;
    let pendingPosition = null;
    const readingTop = () => Math.max(0, document.querySelector('.site-header')?.getBoundingClientRect().bottom || 0) + 12;
    const updateCurrent = () => {
      updateFrame = 0;
      // Native anchor jumps also honor scroll-padding; the heading can stop
      // below the header clearance, especially when the mobile header is short.
      const scrollPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      const top = Math.max(readingTop(), scrollPadding);
      let next = entries[0] || null;
      for (const entry of entries) {
        if (entry.heading.getBoundingClientRect().top <= top + 16) next = entry;
        else break;
      }
      if (next === activeEntry) return;
      activeEntry?.link.removeAttribute('aria-current');
      activeEntry = next;
      activeEntry?.link.setAttribute('aria-current', 'location');
    };
    const scheduleCurrent = () => {
      if (!updateFrame) updateFrame = requestAnimationFrame(updateCurrent);
    };
    const revealCurrent = () => {
      updateCurrent();
      if (!isOpen || !activeEntry) return;
      // Scroll only the outline's own scroll box; scrollIntoView would also
      // move the article when opening the floating outline on a narrow screen.
      const innerNav = contents.querySelector('nav');
      const scrollBox = innerNav && innerNav.scrollHeight > innerNav.clientHeight + 1 ? innerNav : outline;
      const box = scrollBox.getBoundingClientRect();
      const item = activeEntry.link.getBoundingClientRect();
      if (item.top < box.top + 12) scrollBox.scrollTop += item.top - box.top - 12;
      else if (item.bottom > box.bottom - 12) scrollBox.scrollTop += item.bottom - box.bottom + 12;
    };
    const saveOutlineState = () => {
      const state = history.state && typeof history.state === 'object' ? history.state : {};
      try { history.replaceState({ ...state, courseContentsOpen: isOpen, courseOutlineChosen: explicitlyChosen }, ''); } catch {}
    };
    const readingAnchor = () => {
      const top = readingTop();
      return [...document.querySelectorAll('#main-content h1, #main-content h2, #main-content h3, #main-content h4, #main-content p, #main-content li, #main-content pre, #main-content figure, #main-content table')].find(element => {
        const rect = element.getBoundingClientRect();
        return rect.height && rect.bottom > top && rect.top < innerHeight;
      });
    };
    const setOpen = (open, { explicit = false, preservePosition = false, focusToggle = false, reveal = true } = {}) => {
      if (preservePosition && wide.matches && open !== isOpen && !pendingPosition) {
        const anchor = readingAnchor();
        if (anchor) {
          // Coalesce rapid switches into one layout correction. Preserve the
          // first reading position and the original browser anchoring style.
          pendingPosition = {
            anchor,
            top: anchor.getBoundingClientRect().top,
            overflowAnchor: document.documentElement.style.overflowAnchor,
          };
          document.documentElement.style.overflowAnchor = 'none';
        }
      }
      if (layoutFrame) cancelAnimationFrame(layoutFrame);
      if (explicit) explicitlyChosen = true;
      isOpen = open;
      outline.hidden = !open;
      contents.open = open;
      document.body.classList.toggle('outline-hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '隐藏大纲' : '显示大纲';
      toggle.title = open ? '隐藏本页大纲，展开阅读宽度' : '显示本页大纲与当前阅读位置';
      saveOutlineState();
      if (focusToggle) toggle.focus({ preventScroll: true });
      layoutFrame = requestAnimationFrame(() => {
        layoutFrame = 0;
        const position = pendingPosition;
        pendingPosition = null;
        if (position) {
          try {
            if (position.anchor.isConnected) window.scrollBy(0, position.anchor.getBoundingClientRect().top - position.top);
          } finally {
            document.documentElement.style.overflowAnchor = position.overflowAnchor;
          }
        }
        if (reveal) revealCurrent();
        else scheduleCurrent();
      });
    };
    toggle.addEventListener('click', () => setOpen(!isOpen, { explicit: true, preservePosition: true }));
    summary?.addEventListener('click', event => {
      event.preventDefault();
      setOpen(false, { explicit: true, preservePosition: true, focusToggle: true });
    });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setOpen(false, { explicit: true, preservePosition: true, focusToggle: true });
      }
    });
    contents.addEventListener('click', event => {
      const link = event.target.closest('a[href^="#"]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!wide.matches) setOpen(false, { explicit: true, reveal: false });
    });
    wide.addEventListener('change', () => {
      if (!explicitlyChosen) setOpen(wide.matches);
      else scheduleCurrent();
    });
    addEventListener('popstate', () => {
      if (typeof history.state?.courseContentsOpen === 'boolean') {
        explicitlyChosen = history.state.courseOutlineChosen === true;
        setOpen(history.state.courseContentsOpen, { reveal: false });
      } else saveOutlineState();
    });
    // A native anchor jump creates a history entry. Keep this entry's layout
    // choice while leaving heading navigation and scroll restoration native.
    addEventListener('hashchange', saveOutlineState);
    addEventListener('pageshow', scheduleCurrent);
    addEventListener('scroll', scheduleCurrent, { passive: true });
    addEventListener('resize', scheduleCurrent, { passive: true });
    setOpen(isOpen);
    const header = headerNav.closest('.site-header');
    const measureHeader = () => {
      const height = `${header.getBoundingClientRect().height}px`;
      if (document.documentElement.style.getPropertyValue('--reader-header-height') !== height) {
        document.documentElement.style.setProperty('--reader-header-height', height);
        scheduleCurrent();
      }
    };
    if (typeof ResizeObserver === 'function') new ResizeObserver(measureHeader).observe(header);
    else addEventListener('resize', measureHeader, { passive: true });
    measureHeader();
  }

  document.querySelectorAll('pre > code').forEach((code, index) => {
    const pre = code.parentElement;
    if (pre.closest('.code-block')) return;
    const block = document.createElement('div');
    block.className = 'code-block';
    const toolbar = document.createElement('div');
    toolbar.className = 'code-toolbar';
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.codeWrapToggle = '';
    button.textContent = '自动换行';
    const status = document.createElement('span');
    status.className = 'code-wrap-status';
    status.setAttribute('aria-hidden', 'true');
    if (!pre.id) pre.id = `course-code-${index + 1}`;
    button.setAttribute('aria-controls', pre.id);
    const language = [...code.classList].find(name => name.startsWith('language-'))?.slice(9) || 'text';
    let wraps = !['text', 'plaintext', 'console', 'ascii'].includes(language.toLowerCase());
    const applyWrap = () => {
      pre.classList.toggle('code-wrap', wraps);
      button.setAttribute('aria-pressed', String(wraps));
      status.textContent = wraps ? '已开启' : '保留原行';
      button.title = wraps ? '切换为保留原始行宽，长行可左右滚动' : '按当前阅读宽度换行，不修改代码内容';
    };
    button.addEventListener('click', () => { wraps = !wraps; applyWrap(); });
    toolbar.append(status, button);
    pre.before(block);
    block.append(toolbar, pre);
    applyWrap();
  });

  const diagramUpdates = new Map();
  const updateDiagram = container => {
    const overflowing = container.scrollWidth > container.clientWidth + 1;
    container.classList.toggle('is-overflowing', overflowing);
    const figure = container.closest('figure');
    if (figure) figure.dataset.overflow = String(overflowing);
    const hint = figure?.querySelector('[data-diagram-overflow]');
    if (hint) hint.hidden = !overflowing;
    const baseLabel = diagramUpdates.get(container);
    container.setAttribute('aria-label', `${baseLabel}${overflowing ? '：可左右滚动查看完整示意图' : '：完整示意图'}`);
    if (overflowing) container.tabIndex = 0;
    else container.removeAttribute('tabindex');
  };
  const diagramObserver = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => {
    for (const entry of entries) updateDiagram(entry.target);
  }) : null;
  document.querySelectorAll('.diagram-scroll').forEach(container => {
    const label = (container.getAttribute('aria-label') || '课程示意图').replace(/：(?:可滚动示意图|可左右滚动查看完整示意图|完整示意图)$/, '');
    diagramUpdates.set(container, label);
    diagramObserver?.observe(container);
    container.querySelectorAll('img').forEach(img => img.addEventListener('load', () => updateDiagram(container)));
    updateDiagram(container);
  });
  if (!diagramObserver) addEventListener('resize', () => diagramUpdates.forEach((_, container) => updateDiagram(container)), { passive: true });

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
