const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('[data-nav]');
const themeToggle = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const themeIcon = document.querySelector('.theme-icon');
const sections = [...document.querySelectorAll('main section')];
const navItems = [...document.querySelectorAll('.nav-links a')];
const modal = document.getElementById('serviceModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalListLabel = document.getElementById('modalListLabel');
const modalList = document.getElementById('modalList');
const modalClose = document.querySelector('.modal-close');
const modalContent = document.querySelector('.modal-content');
const toast = document.getElementById('toast');
const form = document.getElementById('contactForm');
const year = document.getElementById('year');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const focusableSelectors = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
let lastFocusedElement = null;
let trapHandler = null;

const updateTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const isLight = theme === 'light';
  themeLabel.textContent = isLight ? 'Light' : 'Dark';
  themeIcon.textContent = isLight ? '☀' : '☾';
  themeToggle.setAttribute('aria-pressed', String(isLight));
  localStorage.setItem('theme', theme);
};

const storedTheme = localStorage.getItem('theme');
updateTheme(storedTheme || 'dark');

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  updateTheme(current === 'light' ? 'dark' : 'light');
});

const setNavState = (isOpen) => {
  navLinks.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
  navToggle.setAttribute('aria-label', isOpen ? 'Stäng meny' : 'Öppna meny');
};

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.contains('open');
  setNavState(!isOpen);
});

navItems.forEach((link) => {
  link.addEventListener('click', () => {
    setNavState(false);
  });
});

const setActiveLink = () => {
  let current = sections[0].id;
  sections.forEach((section) => {
    const top = section.getBoundingClientRect().top;
    if (top <= 120) {
      current = section.id;
    }
  });
  navItems.forEach((link) => {
    const id = link.getAttribute('href').slice(1);
    link.classList.toggle('active', id === current);
  });
};

window.addEventListener('scroll', setActiveLink, { passive: true });
setActiveLink();

const isModalOpen = () => modal.classList.contains('open');

const getFocusableElements = () => {
  if (!modalContent) {
    return [];
  }
  return [...modalContent.querySelectorAll(focusableSelectors)].filter((el) => !el.hasAttribute('disabled'));
};

const trapFocus = (event) => {
  if (event.key !== 'Tab') {
    return;
  }
  const focusable = getFocusableElements();
  if (focusable.length === 0) {
    return;
  }
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const openModal = (card) => {
  lastFocusedElement = document.activeElement;
  const detailTitle = card.dataset.detailsTitle || card.dataset.title;
  const detailBody = card.dataset.detailsBody || card.dataset.description;
  const detailList = (card.dataset.detailsList || card.dataset.bullets || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
  modalTitle.textContent = detailTitle;
  modalDescription.textContent = detailBody;
  modalList.innerHTML = '';
  detailList.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    modalList.appendChild(li);
  });
  if (modalListLabel) {
    modalListLabel.hidden = detailList.length === 0;
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  const focusable = getFocusableElements();
  if (trapHandler) {
    modal.removeEventListener('keydown', trapHandler);
  }
  trapHandler = trapFocus;
  modal.addEventListener('keydown', trapHandler);
  (focusable[0] || modalClose).focus();
};

const closeModal = () => {
  if (!isModalOpen()) {
    return;
  }
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  if (trapHandler) {
    modal.removeEventListener('keydown', trapHandler);
    trapHandler = null;
  }
  if (lastFocusedElement && document.body.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
};

document.querySelectorAll('.service-card').forEach((card) => {
  card.addEventListener('click', () => openModal(card));
});

modal.addEventListener('click', (event) => {
  if (event.target === modal || event.target === modalClose) {
    closeModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && isModalOpen()) {
    closeModal();
  }
});

const showToast = (message) => {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
};

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const subject = encodeURIComponent('Projektförfrågan: Nimab Development');
  const body = encodeURIComponent(
    `Namn: ${data.get('name')}\nE-post: ${data.get('email')}\nTyp: ${data.get('type')}\n\nMeddelande:\n${data.get('message')}`
  );
  window.location.href = `mailto:hello@nimab.dev?subject=${subject}&body=${body}`;
  showToast('Tack! Jag återkommer inom 24–48h.');
  form.reset();
});

if (!prefersReducedMotion) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll('.section, .service-card, .process-card, .case-card, .tech-card, .about-card').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

year.textContent = new Date().getFullYear();
