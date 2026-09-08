/* ============================================
   Stackly - Dashboard Shared JavaScript
   Common behavior for user & admin dashboards
   ============================================ */
document.addEventListener('DOMContentLoaded', function () {

  // --- Sidebar navigation: switch pages ---
  var navLinks = document.querySelectorAll('[data-page]');
  var burger = document.querySelector('.dash-burger');
  var sidebar = document.querySelector('.dash-sidebar');

  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      var page = link.getAttribute('data-page');
      switchPage(page);

      if (sidebar) closeSidebar();
      // Reset scroll to top of content
      var content = document.querySelector('.dash-content');
      if (content) { content.scrollTop = 0; window.scrollTo(0, 0); }
      if (typeof window.onPageChange === 'function') window.onPageChange(page);
    });
  });

  function switchPage(page) {
    document.querySelectorAll('.dash-page').forEach(function (p) {
      p.classList.toggle('active', p.id === page);
    });
    navLinks.forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-page') === page);
    });
    document.title = (page.charAt(0).toUpperCase() + page.slice(1)) + ' - Stackly';
    // Update page heading
    var heads = document.querySelectorAll('.dash-page-head');
    heads.forEach(function (h) { h.style.display = h.closest('.dash-page') && h.closest('.dash-page').classList.contains('active') ? '' : 'none'; });
  }

  // --- Mobile sidebar open/close ---
  function openSidebar() {
    if (!sidebar) return;
    sidebar.classList.add('open');
    document.body.classList.add('dash-open');
    document.documentElement.classList.add('dash-open');
  }

  function closeSidebar() {
    if (!sidebar) return;
    sidebar.classList.remove('open');
    document.body.classList.remove('dash-open');
    document.documentElement.classList.remove('dash-open');
  }

  if (burger && sidebar) {
    burger.addEventListener('click', function () {
      if (sidebar.classList.contains('open')) { closeSidebar(); } else { openSidebar(); }
    });
  }

  var sidebarClose = document.querySelector('.dash-sidebar-close');
  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  // Safety: release scroll lock if resized back to desktop
  window.addEventListener('resize', function () {
    if (window.innerWidth > 900) {
      document.body.classList.remove('dash-open');
      document.documentElement.classList.remove('dash-open');
      if (sidebar) sidebar.classList.remove('open');
    }
  });

  // --- Toast helper exposed globally ---
  window.showToast = function (msg, gold) {
    var wrap = document.querySelector('.toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    var t = document.createElement('div');
    t.className = 'toast' + (gold ? ' gold' : '');
    t.innerHTML = '<i class="' + (gold ? 'fas fa-crown' : 'fas fa-check-circle') + '"></i>' + msg;
    wrap.appendChild(t);
    setTimeout(function () { t.style.opacity = '0'; t.style.transition = 'opacity 0.4s'; }, 2600);
    setTimeout(function () { t.remove(); }, 3100);
  };

  // --- Validate a dash form: required fields -> error message; valid -> 404 page ---
  window.validateDashForm = function (form) {
    var firstInvalid = null;
    form.querySelectorAll('[required]').forEach(function (field) {
      var v = field.value ? field.value.trim() : '';
      if (!v) {
        showFieldError(field, 'This field is required.');
        if (!firstInvalid) firstInvalid = field;
      }
    });
    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }
    setTimeout(function () {
      window.location.href = '404.html';
    }, 600);
    return false;
  };

  // --- Live search in tables (data-search attr on input, data-search-row on tbody) ---
  var searchInputs = document.querySelectorAll('input[data-search]');
  searchInputs.forEach(function (inp) {
    inp.addEventListener('input', function () {
      var q = inp.value.toLowerCase();
      var rowSel = inp.getAttribute('data-search'); // e.g. "tbody tr"
      var rows = inp.closest('.dash-card, .table-wrap') ? inp.closest('.dash-card, .table-wrap').querySelectorAll(rowSel) : document.querySelectorAll(rowSel);
      rows.forEach(function (row) {
        row.style.display = row.textContent.toLowerCase().indexOf(q) !== -1 ? '' : 'none';
      });
    });

    // Pressing Enter in the search bar redirects to the 404 page
    inp.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        window.location.href = '404.html';
      }
    });
  });

  // --- Generic confirm before destructive buttons (data-confirm) ---
  document.querySelectorAll('[data-confirm]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      if (!confirm(btn.getAttribute('data-confirm'))) e.preventDefault();
    });
  });

  // --- Filter table rows when a tab-chip is clicked (e.g. All/Landlords/Tenants/Admins) ---
  function normalizeFilter(term) {
    term = term.toLowerCase().trim();
    if (term !== 'all' && /s$/.test(term) && !/ss$/.test(term)) term = term.slice(0, -1);
    return term;
  }

  function filterTableByChip(chip) {
    var tabs = chip.closest('.tabs-row');
    if (tabs) {
      tabs.querySelectorAll('.tab-chip').forEach(function (c) {
        c.classList.toggle('active', c === chip);
      });
    }
    var card = chip.closest('.dash-card');
    if (!card) return;
    var table = card.querySelector('table');
    if (!table || !table.tBodies || !table.tBodies[0]) return;
    var term = normalizeFilter(chip.textContent);
    table.tBodies[0].querySelectorAll('tr').forEach(function (row) {
      if (term === 'all') {
        row.style.display = '';
      } else {
        row.style.display = row.textContent.toLowerCase().indexOf(term) !== -1 ? '' : 'none';
      }
    });
  }

  // --- Non-sidebar buttons, top-user avatar & "more" links redirect to 404 page; tab-chips filter ---
  document.addEventListener('click', function (e) {
    var el = e.target.closest ? e.target.closest('button, a[href], .tab-chip, .dash-top-user, .more') : null;
    if (!el) return;
    // Sidebar section (nav, close, foot links) and the hamburger stay functional
    if (el.closest('.dash-sidebar')) return;
    if (el.classList.contains('dash-burger')) return;
    // Let form submit buttons run their onsubmit validation first
    if (el.type === 'submit' && el.form) return;
    // Capture phase: swallow demo handlers (toast / switchTo / confirm) and navigate
    e.stopPropagation();
    e.preventDefault();
    // Filter chips filter their table instead of navigating away
    if (el.classList.contains('tab-chip')) {
      filterTableByChip(el);
      return;
    }
    window.location.href = '404.html';
  }, true);

});
