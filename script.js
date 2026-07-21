const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = [...document.querySelectorAll('.nav a')];
const sections = [...document.querySelectorAll('main section[id]')];
const revealItems = document.querySelectorAll('.reveal');
const progressBar = document.querySelector('.scroll-progress');
const backToTop = document.querySelector('.back-to-top');
const filterButtons = document.querySelectorAll('.filter-chip');
const filterTriggers = document.querySelectorAll('.filter-trigger, .tag-button');
const projectCards = document.querySelectorAll('.project-card');
const copyButtons = document.querySelectorAll('.copy-button');
const toast = document.querySelector('.toast');

function setMenuState(isOpen) {
  header.classList.toggle('menu-open', isOpen);
  navToggle?.setAttribute('aria-expanded', String(isOpen));
}

navToggle?.addEventListener('click', () => {
  const next = !header.classList.contains('menu-open');
  setMenuState(next);
});

document.addEventListener('click', (event) => {
  if (!header.classList.contains('menu-open')) return;
  const clickedInsideHeader = header.contains(event.target);
  if (!clickedInsideHeader) setMenuState(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setMenuState(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 760) setMenuState(false);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => setMenuState(false));
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.14 });

revealItems.forEach((item) => revealObserver.observe(item));

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const id = entry.target.getAttribute('id');
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  });
}, {
  rootMargin: '-35% 0px -50% 0px',
  threshold: 0.01
});

sections.forEach((section) => activeObserver.observe(section));

function updateProgressBar() {
  const scrollTop = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = `${progress}%`;
  if (backToTop) backToTop.classList.toggle('is-visible', scrollTop > 450);
}

window.addEventListener('scroll', updateProgressBar, { passive: true });
updateProgressBar();

backToTop?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

async function copyText(value) {
  if (!value) {
    showToast('Nothing to copy');
    return;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      showToast('Copied to clipboard');
      return;
    } catch (error) {
      // Fallback to legacy copy method below.
    }
  }

  const fallback = document.createElement('textarea');
  fallback.value = value;
  fallback.setAttribute('readonly', '');
  fallback.style.position = 'fixed';
  fallback.style.opacity = '0';
  document.body.appendChild(fallback);
  fallback.select();

  if (document.queryCommandSupported?.('copy')) {
    document.execCommand('copy');
    showToast('Copied to clipboard');
  } else {
    showToast('Unable to copy');
  }

  fallback.remove();
}

copyButtons.forEach((button) => {
  button.addEventListener('click', () => copyText(button.dataset.copy || ''));
});

function activateFilter(filter) {
  filterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === filter);
  });

  projectCards.forEach((card) => {
    const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
    const isMatch = filter === 'all' || categories.includes(filter);
    card.hidden = !isMatch;
  });

  const projectsSection = document.querySelector('#projects');
  if (projectsSection && filter !== 'all') {
    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => activateFilter(button.dataset.filter || 'all'));
});

filterTriggers.forEach((button) => {
  button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';
    activateFilter(filter);
  });
});

function targetPulseFromHash(hashValue) {
  if (!hashValue) return;
  const target = document.querySelector(hashValue);
  if (!target) return;
  target.classList.add('is-targeted');
  clearTimeout(targetPulseFromHash._timer);
  targetPulseFromHash._timer = setTimeout(() => {
    target.classList.remove('is-targeted');
  }, 1400);
}

window.addEventListener('hashchange', () => targetPulseFromHash(window.location.hash));
if (window.location.hash) targetPulseFromHash(window.location.hash);
