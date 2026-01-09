document.querySelectorAll("form").forEach(form => {
  form.addEventListener("submit", e => {
    e.preventDefault();

    const name = form.querySelector('input[name="name"]');
    const email = form.querySelector('input[name="email"]');
    const message = form.querySelector('textarea[name="message"]');
    const status = form.querySelector('.form-status');

    let valid = true;
    status.textContent = '';
    [name, email, message].forEach(input => {
      if (input && !input.value.trim()) {
        valid = false;
        input.classList.add('invalid');
      } else if (input) {
        input.classList.remove('invalid');
      }
    });

    if (!valid) {
      status.textContent = 'Please complete the required fields.';
      status.classList.add('error');
      status.setAttribute('role','alert');
      return;
    }

    // Simulate submission success
    status.textContent = 'Inquiry submitted successfully!';
    status.classList.remove('error');
    status.classList.add('success');
    status.setAttribute('role','status');

    form.reset();
    setTimeout(() => {
      status.textContent = '';
      status.classList.remove('success');
    }, 3500);
  });
});

// Mobile hamburger menu toggle + keyboard & aria support
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("nav-menu");

if (hamburger && navMenu) {
  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    navMenu.classList.toggle("show");
  });

  hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hamburger.click();
    }
  });

  // Highlight current nav link
  const navLinks = document.querySelectorAll('nav#nav-menu a');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
      link.setAttribute('aria-current','page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

  // Hide .html extensions in the visible URL (client-side only) — verify the candidate path exists first
  (function cleanUrl() {
    try {
      const path = window.location.pathname;
      let newPath = path;
      if (path.endsWith('index.html')) newPath = '/';
      else if (path.endsWith('.html')) newPath = path.replace(/\.html$/, '');
      const qs = window.location.search || '';
      const hash = window.location.hash || '';
      const candidatePath = newPath + qs;
      const candidateFull = newPath + qs + hash;
      const currentFull = window.location.pathname + window.location.search + window.location.hash;
      if (candidateFull === currentFull) return;

      // Only replace the URL if the server actually serves the candidate (avoids 404s on hosts without rewrites)
      fetch(candidatePath, { method: 'HEAD', cache: 'no-store' })
        .then(resp => {
          if (resp && resp.ok) {
            history.replaceState(null, '', candidateFull);
          } else if (resp && resp.status === 405) {
            // HEAD not allowed on some hosts — try GET as a fallback
            return fetch(candidatePath, { method: 'GET', cache: 'no-store' })
              .then(r2 => { if (r2 && r2.ok) history.replaceState(null, '', candidateFull); })
              .catch(() => {});
          }
        })
        .catch(() => { /* ignore network errors */ });

    } catch (e) { /* ignore */ }
  })();
}

// Fade-in sections on scroll
const fades = document.querySelectorAll('.fade-up');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('show');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

fades.forEach(el => observer.observe(el));

// Branch link press feedback + keyboard space behavior (accessibility)
document.querySelectorAll('.box a').forEach(link => {
  // Ensure pointer cursor for clarity
  link.style.cursor = 'pointer';

  // Visual pressed state for mouse/touch
  link.addEventListener('mousedown', () => link.classList.add('pressed'));
  link.addEventListener('mouseup', () => link.classList.remove('pressed'));
  link.addEventListener('mouseleave', () => link.classList.remove('pressed'));
  link.addEventListener('touchstart', () => link.classList.add('pressed'), { passive: true });
  link.addEventListener('touchend', () => link.classList.remove('pressed'));

  // Support spacebar to activate link (anchors respond to Enter by default)
  link.addEventListener('keydown', (e) => {
    if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      link.classList.add('pressed');
      const onKeyUp = (ev) => {
        if (ev.key === ' ' || ev.key === 'Spacebar') {
          link.classList.remove('pressed');
          link.click();
          window.removeEventListener('keyup', onKeyUp);
        }
      };
      window.addEventListener('keyup', onKeyUp);
    }
  });
});

// Gallery filtering (cards with data-category) + mobile select
const filterButtons = document.querySelectorAll(".gallery-filters button");
const galleryCards = document.querySelectorAll(".gallery-card");
const filterSelect = document.getElementById('gallery-select');

function applyFilter(filter) {
  // Update buttons
  filterButtons.forEach(b => {
    b.classList.toggle('active', b.dataset.filter === filter);
    b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
  });

  // Update select (if present)
  if (filterSelect) filterSelect.value = filter;

  // Show/hide cards
  galleryCards.forEach(card => {
    const cat = card.dataset.category;
    if (filter === 'all' || cat === filter) {
      card.classList.remove('hide');
    } else {
      card.classList.add('hide');
    }
  });

  // On small screens, collapse hidden items and scroll the first visible card into view
  if (window.innerWidth <= 480) {
    setTimeout(() => {
      const firstVisible = Array.from(galleryCards).find(c => !c.classList.contains('hide'));
      if (firstVisible) firstVisible.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    applyFilter(btn.dataset.filter);
  });
});

if (filterSelect) {
  filterSelect.addEventListener('change', (e) => {
    applyFilter(e.target.value);
    // On mobile the select replaces the buttons visually; we still keep buttons in sync
  });
}

// Auto-filter from URL (?category=wedding) and scroll to filters
const params = new URLSearchParams(window.location.search);
const category = params.get('category');

if (category) {
  applyFilter(category);
  const filtersEl = document.querySelector('.gallery-filters');
  if (filtersEl) filtersEl.scrollIntoView({behavior: 'smooth', block: 'center'});
}

// Ensure initial state is applied
const initial = document.querySelector('.gallery-filters button.active')?.dataset.filter || 'all';
applyFilter(initial);

/* ---------- LIGHTBOX FUNCTIONALITY ---------- */
(function(){
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;

  const lbImg = lightbox.querySelector('.lightbox-img');
  const lbCaption = lightbox.querySelector('.lightbox-caption');
  const lbClose = lightbox.querySelector('.lightbox-close');
  const lbPrev = lightbox.querySelector('.lightbox-prev');
  const lbNext = lightbox.querySelector('.lightbox-next');

  const cards = Array.from(document.querySelectorAll('.gallery-card'));
  let currentIndex = -1;
  let prevFocus = null;
  let touchStartX = 0;

  function getFullSrc(src) {
    try {
      const w = window.innerWidth || document.documentElement.clientWidth;
      if (w <= 480) return src.replace(/\/\d+\/\d+/, '/800/600');
      if (w <= 900) return src.replace(/\/\d+\/\d+/, '/1200/800');
      return src.replace(/\/\d+\/\d+/, '/1600/1000');
    } catch(e) { return src; }
  }

  function openLightbox(index){
    if (index < 0 || index >= cards.length) return;
    currentIndex = index;
    const img = cards[index].querySelector('img');
    lbImg.src = getFullSrc(img.src);
    lbImg.alt = img.alt || '';
    lbCaption.textContent = cards[index].querySelector('.caption') ? cards[index].querySelector('.caption').textContent : '';

    prevFocus = document.activeElement;
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.classList.add('lightbox-open');
    lbClose.focus();
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden','true');
    lbImg.src = '';
    document.body.classList.remove('lightbox-open');
    if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
    currentIndex = -1;
  }

  function showPrev(){
    const idx = (currentIndex <= 0) ? cards.length - 1 : currentIndex - 1;
    openLightbox(idx);
  }

  function showNext(){
    const idx = (currentIndex >= cards.length - 1) ? 0 : currentIndex + 1;
    openLightbox(idx);
  }

  // Open when clicking a card
  cards.forEach((card, idx) => {
    card.addEventListener('click', (e) => {
      // ignore clicks on internal controls
      if (e.target.closest('button')) return;
      openLightbox(idx);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') openLightbox(idx);
    });
    // make cards focusable for keyboard users
    card.setAttribute('tabindex', '0');
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', (e)=>{ e.stopPropagation(); showPrev(); });
  lbNext.addEventListener('click', (e)=>{ e.stopPropagation(); showNext(); });

  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Touch / swipe support
  lightbox.addEventListener('touchstart', (e) => { touchStartX = e.changedTouches[0].clientX; }, {passive:true});
  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) showPrev(); else showNext();
    }
  }, {passive:true});
})();

/* PRELOADER: robust handling for load / pageshow / DOMContentLoaded and fallback */
(function(){
  const preloader = document.getElementById('preloader');
  if (!preloader) return;
  const minShow = 600; // ms
  const maxWait = 5000; // fail-safe max wait if load doesn't fire
  const start = Date.now();
  let hideScheduled = false;

  let fallbackTimer = setTimeout(() => {
    if (!hideScheduled) hide();
  }, maxWait);

  function hide() {
    if (!preloader || preloader.classList.contains('fade-out')) return;
    hideScheduled = true;
    clearTimeout(fallbackTimer);
    preloader.classList.add('fade-out');
    preloader.setAttribute('aria-hidden','true');
    document.body.classList.remove('preload-active');
    preloader.addEventListener('transitionend', () => {
      try { preloader.remove(); } catch(e) {}
    }, { once: true });
  }

  function scheduleHide() {
    const elapsed = Date.now() - start;
    const wait = Math.max(0, minShow - elapsed);
    setTimeout(hide, wait);
  }

  if (document.readyState === 'complete') {
    scheduleHide();
  } else {
    window.addEventListener('load', scheduleHide, { once: true });
    window.addEventListener('pageshow', scheduleHide, { once: true });
    document.addEventListener('DOMContentLoaded', scheduleHide, { once: true });
  }

  // Allow the user to dismiss early with Escape for accessibility
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && preloader && preloader.parentNode) hide();
  });

  // If the page becomes visible again (bfcache/back/forward), ensure it's hidden
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') scheduleHide();
  });

  // When navigation occurs via the nav menu, briefly show preloader to indicate navigation
  document.querySelectorAll('nav#nav-menu a').forEach(a => {
    a.addEventListener('click', () => {
      if (!preloader.parentNode) return;
      preloader.classList.remove('fade-out');
      preloader.setAttribute('aria-hidden','false');
      document.body.classList.add('preload-active');
    });
  });
})();

