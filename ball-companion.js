(function () {
  'use strict';

  const ball = document.getElementById('navBall');
  if (!ball) return;

  const projectLines = {
    'PromptLab': 'Prompts about prompts. Very meta 🤯',
    'NotebookLM Replica': 'Your notebook just learned to talk 🤖',
    'Personal Blog': 'Ideas, learning, and a little lore ✍️',
    'IPL Data Analysis': 'Cricket numbers, decoded by data 📊',
    'Data Analyst job simulation': 'Practice now, perform like a pro 📈'
  };

  const sectionLines = {
    home: 'Ready for takeoff 🏠',
    about: 'Now I know the person behind the pixels 👋',
    skills: 'Okay, flex time 💪',
    portfolio: 'These projects mean business 🚀',
    certificates: 'Proof that I kept learning 🎓',
    contact: 'Let us make something together ✉️'
  };

  const sectionIds = ['home', 'about', 'skills', 'portfolio', 'certificates', 'contact'];
  const startedAt = Date.now();
  const bubble = document.createElement('div');
  let hideTimer = 0;
  let followFrame = 0;
  let bubbleVisible = false;

  bubble.id = 'ballBubble';
  bubble.className = 'ball-bubble';
  bubble.setAttribute('role', 'status');
  bubble.setAttribute('aria-live', 'polite');
  document.body.appendChild(bubble);

  function isLightboxOpen() {
    return document.querySelector('#portfolioLightbox.active, #certLightbox.active') ||
      document.querySelector('#portfolioLightbox[aria-hidden="false"], #certLightbox[aria-hidden="false"]');
  }

  function canShow() {
    return Date.now() - startedAt >= 2500 &&
      !ball.classList.contains('nb-open') &&
      !ball.classList.contains('nav-ball--dragging') &&
      !isLightboxOpen();
  }

  function positionBubble() {
    if (!bubbleVisible) return;

    const rect = ball.getBoundingClientRect();
    const bubbleRect = bubble.getBoundingClientRect();
    const gap = 12;
    let left = rect.left + (rect.width / 2) - (bubbleRect.width / 2);
    left = Math.max(12, Math.min(left, window.innerWidth - bubbleRect.width - 12));

    let top = rect.top - bubbleRect.height - gap;
    bubble.classList.toggle('is-below', top < 12);
    if (top < 12) top = rect.bottom + gap;

    bubble.style.left = `${left}px`;
    bubble.style.top = `${Math.min(top, window.innerHeight - bubbleRect.height - 12)}px`;
    bubble.style.setProperty('--ball-tail-x', `${Math.max(12, Math.min(rect.left + rect.width / 2 - left, bubbleRect.width - 12))}px`);
    followFrame = window.requestAnimationFrame(positionBubble);
  }

  function hideBubble() {
    bubbleVisible = false;
    window.cancelAnimationFrame(followFrame);
    window.clearTimeout(hideTimer);
    bubble.classList.remove('is-visible');
  }

  function ballSay(text, ms) {
    if (!text || !canShow()) return;

    window.clearTimeout(hideTimer);
    bubble.textContent = text;
    bubble.classList.add('is-visible');
    bubbleVisible = true;
    window.cancelAnimationFrame(followFrame);
    positionBubble();
    hideTimer = window.setTimeout(hideBubble, typeof ms === 'number' ? ms : 3000);
  }

  window.ballSay = ballSay;

  function hop() {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && ball.animate) {
      ball.animate([
        { translate: '0 0' },
        { translate: '0 -14px', offset: 0.45 },
        { translate: '0 0' }
      ], {
        duration: 450,
        easing: 'ease-out'
      });
    }
  }

  function reactWith(text) {
    if (!canShow()) return;
    hop();
    ballSay(text);
  }

  document.querySelectorAll('.portfolio-card').forEach(function (card) {
    const title = card.dataset.title;
    const line = projectLines[title];
    if (!line) return;

    card.addEventListener('pointerenter', function (event) {
      if (event.pointerType === 'mouse') reactWith(line);
    });

    card.addEventListener('focusin', function () {
      reactWith(line);
    });
  });

  let currentSection = null;
  function activateSection(id) {
    if (id === currentSection) return;

    const isInitialHome = currentSection === null && id === 'home';
    currentSection = id;
    if (isInitialHome) return;

    const index = sectionIds.indexOf(id);
    if (typeof window.nbSwitchIcon === 'function') window.nbSwitchIcon(index);

    if (id !== 'home') reactWith(sectionLines[id]);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      const visible = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visible.length) return;

      visible.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      activateSection(visible[0].target.id);
    }, {
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    });

    sectionIds.forEach(function (id) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) hideBubble();
  });

    const face = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    face.setAttribute('class', 'ball-face');
    face.setAttribute('viewBox', '0 0 40 40');
    face.setAttribute('aria-hidden', 'true');
    face.style.pointerEvents = 'none';
    face.innerHTML = `
      <circle class="ball-eye" cx="13" cy="16" r="5" fill="#fff"/>
      <circle class="ball-eye" cx="27" cy="16" r="5" fill="#fff"/>
      <circle class="ball-pupil" cx="13" cy="16" r="2.4" fill="#1000a9"/>
      <circle class="ball-pupil" cx="27" cy="16" r="2.4" fill="#1000a9"/>
      <path class="ball-mouth-default" d="M14 27 Q20 32 26 27" fill="none" stroke="#1000a9" stroke-width="2.2" stroke-linecap="round"/>
      <path class="ball-mouth-happy" d="M12 26 Q20 35 28 26" fill="none" stroke="#1000a9" stroke-width="2.5" stroke-linecap="round"/>
      <circle class="ball-mouth-wow" cx="20" cy="29" r="4" fill="#1000a9"/>`;
    ball.prepend(face);

    const pupils = face.querySelectorAll('.ball-pupil');
    let pointerFrame = 0;
    let pointerX = 0;
    let pointerY = 0;
    let centered = true;

    function moveEyes() {
      pointerFrame = 0;
      if (centered) {
        pupils.forEach(function (pupil) { pupil.style.transform = ''; });
        return;
      }
      const rect = ball.getBoundingClientRect();
      const dx = pointerX - (rect.left + rect.width / 2);
      const dy = pointerY - (rect.top + rect.height / 2);
      const length = Math.hypot(dx, dy) || 1;
      const x = dx / length * 2;
      const y = dy / length * 2;
      pupils.forEach(function (pupil) { pupil.style.transform = `translate(${x}px, ${y}px)`; });
    }

    document.addEventListener('pointermove', function (event) {
      pointerX = event.clientX;
      pointerY = event.clientY;
      centered = false;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(moveEyes);
    }, { passive: true });

    document.documentElement.addEventListener('mouseleave', function () {
      centered = true;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(moveEyes);
    });
    window.addEventListener('blur', function () {
      centered = true;
      if (!pointerFrame) pointerFrame = requestAnimationFrame(moveEyes);
    });

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function blink() {
      if (!reduceMotion.matches) {
        face.classList.add('is-blinking');
        setTimeout(function () { face.classList.remove('is-blinking'); }, 120);
      }
      setTimeout(blink, 2500 + Math.random() * 2500);
    }
    setTimeout(blink, 2500 + Math.random() * 2500);

    let moodTimer = 0;
    window.ballMood = function (name, ms) {
      ball.classList.remove('happy', 'wow');
      if (name === 'happy' || name === 'wow') ball.classList.add(name);
      clearTimeout(moodTimer);
      moodTimer = setTimeout(function () { ball.classList.remove('happy', 'wow'); }, typeof ms === 'number' ? ms : 1500);
    };
  })();
