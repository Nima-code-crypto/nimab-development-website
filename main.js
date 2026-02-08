if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const scrollToTopOnLoad = () => {
  window.scrollTo(0, 0);
};
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scrollToTopOnLoad);
} else {
  scrollToTopOnLoad();
}

const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('[data-nav]');
const navLogo = document.querySelector('.navbar .logo');
const sections = [...document.querySelectorAll('main section')];
const navItems = [...document.querySelectorAll('.nav-links a')];
const modal = document.getElementById('serviceModal');
const modalTitle = document.getElementById('modalTitle');
const modalDescription = document.getElementById('modalDescription');
const modalDeliveriesWrap = document.getElementById('modalDeliveriesWrap');
const modalList = document.getElementById('modalList');
const modalClose = document.querySelector('.modal-close');
const toast = document.getElementById('toast');
const form = document.getElementById('contactForm');
const year = document.getElementById('year');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (navLogo) {
  navLogo.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  });
}

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navItems.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
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

const openModal = (card) => {
  modalTitle.textContent = card.dataset.modalTitle || card.dataset.title;
  modalDescription.textContent = card.dataset.expanded || '';
  modalList.innerHTML = '';
  const deliveries = card.dataset.deliveries;
  if (deliveries && deliveries.trim()) {
    deliveries.split('|').forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item.trim();
      modalList.appendChild(li);
    });
    modalDeliveriesWrap.hidden = false;
  } else {
    modalDeliveriesWrap.hidden = true;
  }
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
  modalClose.focus();
};

const closeModal = () => {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
};

document.querySelectorAll('.service-card').forEach((card) => {
  card.addEventListener('click', () => openModal(card));
});

modal.addEventListener('click', (event) => {
  if (event.target === modal || event.target === modalClose) {
    closeModal();
  }
});
//TEstetst
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
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
  document.querySelectorAll('.section, .service-card, .process-card, .case-card, .tech-cluster, .about-card').forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
}

year.textContent = new Date().getFullYear();
