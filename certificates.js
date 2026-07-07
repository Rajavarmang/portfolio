/* Certificates rendering and lightbox (vanilla JS) */
const certs = [
  {
    issuer: "ANTROPIC",
    title: "CLAUDE CODE IN ACTION",
    date: "MAR 31, 2026",
    tag: "GenAI",
    tagClass: "tag--teal",
    emoji: "🎓",
    image: "certificates/claude_page-0001.jpg",
    link: "certificates/claude_page-0001.jpg"
  },
  {
    issuer: "Infosys",
    title: "Infosys Certificate",
    date: "",
    tag: "Professional",
    tagClass: "tag--orange",
    emoji: "🏢",
    image: "certificates/infosy certificate_page-0001.jpg",
    link: "certificates/infosy certificate_page-0001.jpg"
  },
  {
    issuer: "NM Institute",
    title: "English Proficiency — NM",
    date: "",
    tag: "Communication",
    tagClass: "tag--yellow",
    emoji: "🗣️",
    image: "certificates/NM_english_page-0001.jpg",
    link: "certificates/NM_english_page-0001.jpg"
  },
  {
    issuer: "NM Institute",
    title: "HTML Fundamentals — NM",
    date: "",
    tag: "HTML",
    tagClass: "tag--orange",
    emoji: "🌐",
    image: "certificates/NM_html_page-0001.jpg",
    link: "certificates/NM_html_page-0001.jpg"
  },
  {
    issuer: "NM Institute",
    title: "Python Programming — NM",
    date: "",
    tag: "Python",
    tagClass: "tag--teal",
    emoji: "🐍",
    image: "certificates/NM_python_page-0001.jpg",
    link: "certificates/NM_python_page-0001.jpg"
  },
  {
    issuer: "RAJAVARMAN G",
    title: "GENAI Certificate",
    date: "",
    tag: "GenAI",
    tagClass: "tag--orange",
    emoji: "🎓",
    image: "certificates/RAJAVARMAN G - GENAI Certificate_page-0001.jpg",
    link: "certificates/RAJAVARMAN G - GENAI Certificate_page-0001.jpg"
  }
];

const certGrid = document.getElementById('certGrid');
const lightbox = document.getElementById('certLightbox');
const lightboxBackdrop = lightbox && lightbox.querySelector('.cert-lightbox__backdrop');
const lightboxClose = lightbox && lightbox.querySelector('.cert-lightbox__close');
const lightboxIssuer = lightbox && lightbox.querySelector('.cert-lightbox__issuer');
const lightboxTitle = lightbox && lightbox.querySelector('.cert-lightbox__title');
const lightboxDate = lightbox && lightbox.querySelector('.cert-lightbox__date');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxViewBtn = document.getElementById('lightboxViewBtn');

let lastFocused = null;

function createCard(cert, idx) {
  const card = document.createElement('article');
  card.className = 'cert-card doodle-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');
  card.dataset.index = idx;

  const thumb = document.createElement('div');
  thumb.className = `cert-thumb tag-${cert.tagClass.replace('tag--', '')}`;

  if (cert.image) {
    const img = document.createElement('img');
    img.src = cert.image;
    img.alt = `${cert.title} thumbnail`;
    thumb.appendChild(img);
  } else {
    thumb.textContent = cert.emoji || '📜';
  }

  const expand = document.createElement('span');
  expand.className = 'expand-badge';
  expand.textContent = 'Expand';

  const body = document.createElement('div');
  body.className = 'cert-body';

  const title = document.createElement('div');
  title.className = 'cert-title';
  title.textContent = cert.title;

  const issuer = document.createElement('div');
  issuer.className = 'cert-issuer';
  issuer.textContent = cert.issuer;

  const meta = document.createElement('div');
  meta.className = 'cert-meta';

  const date = document.createElement('div');
  date.className = 'cert-date';
  date.textContent = cert.date;

  const tag = document.createElement('span');
  tag.className = `cert-tag ${cert.tagClass}`;
  tag.textContent = cert.tag;

  meta.appendChild(tag);
  meta.appendChild(date);
  body.appendChild(title);
  body.appendChild(issuer);
  body.appendChild(meta);

  card.appendChild(thumb);
  card.appendChild(expand);
  card.appendChild(body);

  card.addEventListener('click', () => openLightbox(idx));
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openLightbox(idx);
    }
  });

  return card;
}

function renderCerts() {
  if (!certGrid) return;
  certGrid.innerHTML = '';
  certs.forEach((c, i) => {
    const card = createCard(c, i);
    certGrid.appendChild(card);
  });
}

function openLightbox(index) {
  const cert = certs[index];
  if (!cert || !lightbox) return;
  lastFocused = document.activeElement;

  lightboxIssuer.textContent = cert.issuer;
  lightboxTitle.textContent = cert.title;
  lightboxDate.textContent = cert.date;
  lightboxViewBtn.href = cert.link || '#';

  lightboxImage.innerHTML = '';
  if (cert.image) {
    const img = document.createElement('img');
    img.src = cert.image;
    img.alt = cert.title;
    lightboxImage.appendChild(img);
  } else {
    const span = document.createElement('div');
    span.style.fontSize = '4rem';
    span.textContent = cert.emoji || '📜';
    lightboxImage.appendChild(span);
  }

  lightbox.classList.add('active');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (lightboxClose) lightboxClose.focus();

  document.addEventListener('keydown', handleKeyDown);
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.remove('active');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', handleKeyDown);
  if (lastFocused) lastFocused.focus();
}

function handleKeyDown(e) {
  if (e.key === 'Escape') closeLightbox();
}

if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
if (lightboxBackdrop) {
  lightboxBackdrop.addEventListener('click', closeLightbox);
}

if (lightbox) {
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightboxBackdrop) closeLightbox();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderCerts();
});

window._certs = certs;
