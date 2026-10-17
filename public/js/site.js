// Hallowed Drafts — small, dependency-free browser script.
// Theme toggle · search overlay (Pagefind) · read counts (Netlify Function).
(function () {
  'use strict';
  var POST_THRESHOLD = 50;
  var TOTAL_THRESHOLD = 1000;
  var root = document.documentElement;

  /* ---------- Theme ---------- */
  function currentTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function syncThemeButton() {
    var btn = document.querySelector('[data-theme-toggle]');
    if (!btn) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    btn.setAttribute('aria-label', 'Switch to ' + next + ' theme');
  }
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-theme-toggle]');
    if (!t) return;
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (err) {}
    syncThemeButton();
  });

  /* ---------- Search ---------- */
  var dialog, input, statusEl, resultsEl, opener, pagefind, timer;
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  async function loadPagefind() {
    if (pagefind) return pagefind;
    var url = '/pagefind/pagefind.js';
    pagefind = await import(url);
    await pagefind.init();
    return pagefind;
  }
  function openSearch(query) {
    if (!dialog) return;
    opener = document.activeElement;
    if (!dialog.open) dialog.showModal();
    if (typeof query === 'string') input.value = query;
    input.focus();
    if (input.value) runSearch(input.value);
    loadPagefind().catch(function () {});
  }
  function closeSearch() {
    if (dialog && dialog.open) dialog.close();
  }
  async function runSearch(q) {
    q = q.trim();
    if (q.length < 2) {
      resultsEl.innerHTML = '';
      statusEl.textContent = 'Type a word or phrase.';
      return;
    }
    statusEl.textContent = 'Searching…';
    try {
      var pf = await loadPagefind();
      var res = await pf.search(q);
      if (input.value.trim() !== q) return; // a newer search is running
      var items = await Promise.all(res.results.slice(0, 10).map(function (r) { return r.data(); }));
      if (!items.length) {
        resultsEl.innerHTML = '';
        statusEl.textContent = 'Nothing matches “' + q + '”. Try one word, like prayer.';
        return;
      }
      statusEl.textContent = items.length + (items.length === 1 ? ' result' : ' results');
      resultsEl.innerHTML = items.map(function (d) {
        var date = d.meta && d.meta.date ? ' · ' + esc(d.meta.date) : '';
        // Pagefind excerpts are escaped text with <mark> highlights.
        return '<li><a href="' + esc(d.url.replace(/\.html$/, '')) + '"><strong>' + esc((d.meta && d.meta.title) || '') +
          '</strong><span class="meta">' + date + '</span><p>' + d.excerpt + '</p></a></li>';
      }).join('');
    } catch (err) {
      resultsEl.innerHTML = '';
      statusEl.innerHTML = 'Search isn’t available right now. <a href="/">Browse the latest writing instead.</a>';
    }
  }

  /* ---------- Read counts ---------- */
  var nf = new Intl.NumberFormat('en-GB');
  function fmtTotal(n) { return n >= 10000 ? Math.round(n / 1000) + 'K' : nf.format(n); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function looksLikeBot() {
    return navigator.webdriver || /bot|crawl|spider|preview|headless/i.test(navigator.userAgent);
  }
  function recordView(slug) {
    if (looksLikeBot()) return Promise.resolve();
    var key = 'viewed:' + slug + ':' + today();
    try { if (localStorage.getItem(key)) return Promise.resolve(); } catch (e) {}
    return fetch('/api/views', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ slug: slug }),
      keepalive: true,
    }).then(function (r) {
      if (r.ok) { try { localStorage.setItem(key, '1'); } catch (e) {} }
    }).catch(function () {});
  }
  function showCounts(data) {
    var counts = (data && data.counts) || {};
    document.querySelectorAll('[data-reads]').forEach(function (el) {
      var n = counts[el.getAttribute('data-reads')] || 0;
      if (n >= POST_THRESHOLD) { el.textContent = ' · ' + nf.format(n) + ' reads'; el.hidden = false; }
    });
    var total = document.querySelector('[data-total-reads]');
    if (total && data && data.total >= TOTAL_THRESHOLD) {
      total.querySelector('dd').textContent = fmtTotal(data.total);
      total.hidden = false;
    }
    var list = document.querySelector('[data-post-list="popular"]');
    if (list) {
      var note = document.querySelector('[data-list-note]');
      var items = Array.prototype.slice.call(list.children);
      var ranked = items.some(function (li) { return (counts[li.dataset.post] || 0) >= POST_THRESHOLD; });
      if (!ranked) {
        if (note) note.textContent = 'Not enough reading yet to rank. Here’s everything, newest first.';
        return;
      }
      items.sort(function (a, b) {
        return (counts[b.dataset.post] || 0) - (counts[a.dataset.post] || 0) ||
          (b.dataset.date > a.dataset.date ? 1 : -1);
      });
      items.forEach(function (li, i) {
        list.appendChild(li);
        var num = li.querySelector('.post-num');
        if (num) num.textContent = String(i + 1).padStart(2, '0');
      });
      if (note) note.textContent = 'Most read, updated as people read.';
    }
  }
  function loadCounts() {
    return fetch('/api/views', { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
      .then(showCounts)
      .catch(function () {
        var note = document.querySelector('[data-post-list="popular"]') && document.querySelector('[data-list-note]');
        if (note) note.textContent = 'Read counts couldn’t load, so these are in date order for now.';
      });
  }

  /* ---------- Boot ---------- */
  function init() {
    syncThemeButton();
    dialog = document.querySelector('[data-search-dialog]');
    input = document.querySelector('[data-search-input]');
    statusEl = document.querySelector('[data-search-status]');
    resultsEl = document.querySelector('[data-search-results]');

    document.addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('[data-search-open]')) { e.preventDefault(); openSearch(); }
      if (e.target.closest && e.target.closest('[data-search-close]')) closeSearch();
      if (e.target === dialog) closeSearch(); // click on backdrop
    });
    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      if (e.key === '/' && !e.metaKey && !e.ctrlKey && tag !== 'input' && tag !== 'textarea') {
        e.preventDefault(); openSearch();
      }
    });
    if (dialog) {
      dialog.addEventListener('close', function () { if (opener && opener.focus) opener.focus(); });
      input.addEventListener('input', function () {
        clearTimeout(timer);
        timer = setTimeout(function () { runSearch(input.value); }, 150);
      });
    }
    if (document.querySelector('[data-search-page]')) {
      var q = new URLSearchParams(location.search).get('q') || '';
      openSearch(q);
    }

    var article = document.querySelector('[data-view-slug]');
    var needCounts = document.querySelector('[data-reads], [data-total-reads], [data-post-list="popular"]');
    var p = article ? recordView(article.getAttribute('data-view-slug')) : Promise.resolve();
    if (needCounts) p.then(loadCounts);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
