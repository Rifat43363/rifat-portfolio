const pageRoot = document.documentElement;
const siteHeader = document.querySelector('.site-header');
const navigationToggle = document.querySelector('.nav-toggle');
const navigationLinks = [...document.querySelectorAll('.nav a')];
const pageSections = [...document.querySelectorAll('main section[id]')];
const revealItems = document.querySelectorAll('.reveal');
const scrollProgressBar = document.querySelector('.scroll-progress');
const backToTopButton = document.querySelector('.back-to-top');
const projectFilterButtons = document.querySelectorAll('.filter-chip');
const projectFilterTriggers = document.querySelectorAll('.filter-trigger, .tag-button');
const projectCards = document.querySelectorAll('.project-card');
const copyButtons = document.querySelectorAll('.copy-button');
const toastMessage = document.querySelector('.toast');
const themeToggleButton = document.querySelector('.theme-toggle');
const themeToggleIcon = document.querySelector('.theme-toggle-icon');
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

const colorThemeStorageKey = 'rifat-portfolio-theme';

function readStoredTheme() {
  try {
    return localStorage.getItem(colorThemeStorageKey);
  } catch (error) {
    return null;
  }
}

function writeStoredTheme(themeName) {
  try {
    localStorage.setItem(colorThemeStorageKey, themeName);
  } catch (error) {
    // Continue without persistence when storage is unavailable.
  }
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getActiveTheme() {
  return pageRoot.dataset.theme || getSystemTheme();
}

function applyColorTheme(themeName, persistTheme = false) {
  const normalizedTheme = themeName === 'dark' ? 'dark' : 'light';
  pageRoot.dataset.theme = normalizedTheme;

  if (persistTheme) {
    writeStoredTheme(normalizedTheme);
  }

  if (themeToggleButton) {
    const nextTheme = normalizedTheme === 'dark' ? 'light' : 'dark';
    themeToggleButton.setAttribute('aria-label', `Switch to ${nextTheme} mode`);
    themeToggleButton.setAttribute('title', `Switch to ${nextTheme} mode`);
  }

  if (themeToggleIcon) {
    themeToggleIcon.textContent = normalizedTheme === 'dark' ? '☀' : '☾';
  }

  if (themeColorMeta) {
    themeColorMeta.setAttribute('content', normalizedTheme === 'dark' ? '#070b14' : '#0f172a');
  }
}

const savedTheme = readStoredTheme();
applyColorTheme(savedTheme || getSystemTheme());

themeToggleButton?.addEventListener('click', () => {
  const nextTheme = getActiveTheme() === 'dark' ? 'light' : 'dark';
  applyColorTheme(nextTheme, true);
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  if (!readStoredTheme()) {
    applyColorTheme(event.matches ? 'dark' : 'light');
  }
});

function setNavigationMenuState(isOpen) {
  siteHeader?.classList.toggle('menu-open', isOpen);
  navigationToggle?.setAttribute('aria-expanded', String(isOpen));
}

navigationToggle?.addEventListener('click', () => {
  const nextState = !siteHeader?.classList.contains('menu-open');
  setNavigationMenuState(nextState);
});

document.addEventListener('click', (event) => {
  if (!siteHeader?.classList.contains('menu-open')) return;
  if (!siteHeader.contains(event.target)) setNavigationMenuState(false);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') setNavigationMenuState(false);
});

window.addEventListener('resize', () => {
  if (window.innerWidth > 920) setNavigationMenuState(false);
});

navigationLinks.forEach((link) => {
  link.addEventListener('click', () => setNavigationMenuState(false));
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealItems.forEach((item) => revealObserver.observe(item));

  const activeNavigationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const sectionId = entry.target.getAttribute('id');
      navigationLinks.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('href') === `#${sectionId}`);
      });
    });
  }, {
    rootMargin: '-35% 0px -50% 0px',
    threshold: 0.01
  });

  pageSections.forEach((section) => activeNavigationObserver.observe(section));
} else {
  revealItems.forEach((item) => item.classList.add('is-visible'));
}

function updateScrollIndicators() {
  const scrollTop = window.scrollY;
  const documentScrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
  const scrollPercentage = documentScrollableHeight > 0 ? (scrollTop / documentScrollableHeight) * 100 : 0;

  if (scrollProgressBar) scrollProgressBar.style.width = `${scrollPercentage}%`;
  if (backToTopButton) backToTopButton.classList.toggle('is-visible', scrollTop > 450);
}

window.addEventListener('scroll', updateScrollIndicators, { passive: true });
updateScrollIndicators();

backToTopButton?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function showToast(message) {
  if (!toastMessage) return;
  toastMessage.textContent = message;
  toastMessage.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toastMessage.classList.remove('show'), 1800);
}

async function copyTextToClipboard(value) {
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
      // Continue to the fallback method below.
    }
  }

  const fallbackTextArea = document.createElement('textarea');
  fallbackTextArea.value = value;
  fallbackTextArea.setAttribute('readonly', '');
  fallbackTextArea.style.position = 'fixed';
  fallbackTextArea.style.opacity = '0';
  document.body.appendChild(fallbackTextArea);
  fallbackTextArea.select();

  try {
    const copySucceeded = document.execCommand('copy');
    showToast(copySucceeded ? 'Copied to clipboard' : 'Unable to copy');
  } catch (error) {
    showToast('Unable to copy');
  }

  fallbackTextArea.remove();
}

copyButtons.forEach((button) => {
  button.addEventListener('click', () => copyTextToClipboard(button.dataset.copy || ''));
});

function activateProjectFilter(filterName) {
  projectFilterButtons.forEach((button) => {
    button.classList.toggle('is-active', button.dataset.filter === filterName);
  });

  projectCards.forEach((card) => {
    const categories = (card.dataset.category || '').split(/\s+/).filter(Boolean);
    const isMatch = filterName === 'all' || categories.includes(filterName);
    card.hidden = !isMatch;
  });

  const projectsSection = document.querySelector('#projects');
  if (projectsSection && filterName !== 'all') {
    projectsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

projectFilterButtons.forEach((button) => {
  button.addEventListener('click', () => activateProjectFilter(button.dataset.filter || 'all'));
});

projectFilterTriggers.forEach((button) => {
  button.addEventListener('click', () => {
    activateProjectFilter(button.dataset.filter || 'all');
  });
});

function pulseTargetFromHash(hashValue) {
  if (!hashValue) return;
  const targetElement = document.querySelector(hashValue);
  if (!targetElement) return;

  targetElement.classList.add('is-targeted');
  clearTimeout(pulseTargetFromHash.timer);
  pulseTargetFromHash.timer = setTimeout(() => {
    targetElement.classList.remove('is-targeted');
  }, 1400);
}

window.addEventListener('hashchange', () => pulseTargetFromHash(window.location.hash));
if (window.location.hash) pulseTargetFromHash(window.location.hash);
