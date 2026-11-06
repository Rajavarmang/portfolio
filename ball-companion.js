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

// Story sketchbook
(function () {
  'use strict';

  // EDIT THESE CHAPTERS TO PERSONALIZE THE STORY SKETCHBOOK.
  const CHAPTERS = [
    { title: 'Chapter 1: Learn', text: 'PLACEHOLDER', doodle: 'ti-book' },
    { title: 'Chapter 2: Code', text: 'PLACEHOLDER', doodle: 'ti-code' },
    { title: 'Chapter 3: Solve', text: 'PLACEHOLDER', doodle: 'ti-bulb' },
    { title: 'Chapter 4: Build', text: 'PLACEHOLDER', doodle: 'ti-tools' }
  ];
  const CLOSING_LINE = 'Learn. Code. Solve. Build. Grow.';

  const ball = document.getElementById('navBall');
  if (!ball) return;

  const notebookWrap = document.createElement('div');
  notebookWrap.className = 'story-notebook-wrap';
  notebookWrap.innerHTML = `
    <button id="storyNotebook" class="story-notebook" type="button" aria-label="Open my story sketchbook">
      <svg viewBox="0 0 64 80" aria-hidden="true">
        <path d="M17 7h38v66H17z" fill="#c0c1ff" stroke="#4cd7f6" stroke-width="2"/>
        <path d="M17 7v66M22 4v72M27 4v72" fill="none" stroke="#0b1326" stroke-width="3"/>
        <path d="M25 18c11-7 19 8 29 1M25 34c8-5 17 5 29-1M25 50c11-7 18 7 29 1" fill="none" stroke="#0b1326" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/>
        <path d="M54 66l7-18 4 2-7 18z" fill="#ffd700" stroke="#0b1326" stroke-width="1.5"/>
        <path d="M58 68l-3 4 1-6" fill="#dae2fd"/>
      </svg>
    </button>
    <span class="story-notebook-hint">Drag Doodle here ✏️</span>`;
  document.body.appendChild(notebookWrap);

  const notebook = notebookWrap.querySelector('#storyNotebook');
  const overlay = document.createElement('div');
  overlay.className = 'story-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'story-title');
  overlay.hidden = true;
  overlay.innerHTML = `
    <div class="story-book" tabindex="-1">
      <button class="story-close" type="button" aria-label="Close story sketchbook">×</button>
      <div class="story-pages">
        <section class="story-page story-page-left" aria-hidden="true"></section>
        <section class="story-page story-page-right">
          <h2 id="story-title" class="story-chapter-title"></h2>
          <p class="story-chapter-text"></p>
          <i class="story-doodle ti" aria-hidden="true"></i>
          <p class="story-closing" hidden>${CLOSING_LINE}</p>
        </section>
      </div>
      <div class="story-controls">
        <button class="story-prev" type="button">← Prev</button>
        <span class="story-page-count" aria-live="polite"></span>
        <button class="story-next" type="button">Next →</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const book = overlay.querySelector('.story-book');
  const leftPage = overlay.querySelector('.story-page-left');
  const rightPage = overlay.querySelector('.story-page-right');
  const title = overlay.querySelector('.story-chapter-title');
  const text = overlay.querySelector('.story-chapter-text');
  const doodle = overlay.querySelector('.story-doodle');
  const closing = overlay.querySelector('.story-closing');
  const pageCount = overlay.querySelector('.story-page-count');
  const prevButton = overlay.querySelector('.story-prev');
  const nextButton = overlay.querySelector('.story-next');
  let currentPage = 0;
  let isOpen = false;
  let previousOverflow = '';

  function renderPage() {
    const chapter = CHAPTERS[currentPage] || CHAPTERS[0];
    title.textContent = chapter.title;
    text.textContent = chapter.text;
    doodle.className = `story-doodle ti ${chapter.doodle}`;
    closing.hidden = currentPage !== CHAPTERS.length - 1;

    if (!window.matchMedia('(max-width: 768px)').matches && currentPage > 0) {
      const previous = CHAPTERS[currentPage - 1];
      leftPage.innerHTML = `<h2 class="story-chapter-title">${previous.title}</h2><p class="story-chapter-text">${previous.text}</p><i class="story-doodle ti ${previous.doodle}" aria-hidden="true"></i>`;
    } else {
      leftPage.innerHTML = '';
    }

    pageCount.textContent = `Page ${currentPage + 1} of ${CHAPTERS.length}`;
    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === CHAPTERS.length - 1;

    if (currentPage === CHAPTERS.length - 1 && typeof window.ballSay === 'function') {
      window.ballSay('That\'s my story so far 🙂', 3000);
    }
  }

  function openStory() {
    if (isOpen) return;
    currentPage = 0;
    renderPage();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('story-open');
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      book.focus();
    });
    isOpen = true;
  }

  function closeStory() {
    if (!isOpen) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('story-open');
    document.body.style.overflow = previousOverflow;
    isOpen = false;
    window.setTimeout(function () { overlay.hidden = true; }, 180);
    notebook.focus();
  }

  function turnPage(direction) {
    const nextPage = currentPage + direction;
    if (nextPage < 0 || nextPage >= CHAPTERS.length) return;

    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rightPage.classList.add(direction > 0 ? 'is-turning' : 'is-turning-back');
      window.setTimeout(function () {
        currentPage = nextPage;
        renderPage();
        rightPage.classList.remove('is-turning', 'is-turning-back');
      }, 300);
    } else {
      rightPage.classList.add('is-turning');
      window.setTimeout(function () {
        currentPage = nextPage;
        renderPage();
        rightPage.classList.remove('is-turning');
      }, 90);
    }
  }

  notebook.addEventListener('click', function (event) {
    if (event.detail === 0) return;
    if (typeof window.ballSay === 'function') window.ballSay('Drag me onto the notebook!');
  });

  notebook.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openStory();
    }
  });

  overlay.querySelector('.story-close').addEventListener('click', closeStory);
  overlay.addEventListener('click', function (event) {
    if (event.target === overlay) closeStory();
  });
  prevButton.addEventListener('click', function () { turnPage(-1); });
  nextButton.addEventListener('click', function () { turnPage(1); });

  document.addEventListener('keydown', function (event) {
    if (!isOpen || !document.body.contains(overlay)) return;
    if (event.key === 'Escape') closeStory();
    if (event.key === 'ArrowLeft') turnPage(-1);
    if (event.key === 'ArrowRight') turnPage(1);
  });

  document.addEventListener('pointermove', function (event) {
    if (!ball.classList.contains('nav-ball--dragging') || !notebook) return;

    const ballRect = ball.getBoundingClientRect();
    const notebookRect = notebook.getBoundingClientRect();
    const distanceX = Math.max(notebookRect.left - ballRect.right, ballRect.left - notebookRect.right, 0);
    const distanceY = Math.max(notebookRect.top - ballRect.bottom, ballRect.top - notebookRect.bottom, 0);
    notebookWrap.classList.toggle('is-near', Math.hypot(distanceX, distanceY) <= 120);
  }, { passive: true });

  document.addEventListener('pointerup', function () {
    if (!document.body.contains(notebook) || !ball.classList.contains('nav-ball--dragging')) return;

    const ballRect = ball.getBoundingClientRect();
    const notebookRect = notebook.getBoundingClientRect();
    const expanded = {
      left: notebookRect.left - 20,
      right: notebookRect.right + 20,
      top: notebookRect.top - 20,
      bottom: notebookRect.bottom + 20
    };
    const overlaps = ballRect.left < expanded.right &&
      ballRect.right > expanded.left &&
      ballRect.top < expanded.bottom &&
      ballRect.bottom > expanded.top;

    notebookWrap.classList.remove('is-near');
    if (overlaps) {
      if (typeof window.ballMood === 'function') window.ballMood('happy', 1500);
      openStory();
    }
  }, true);
})();

// Extended story sketchbook: handwriting and guestbook.
(function () {
  'use strict';

  const ball = document.getElementById('navBall');
  if (!ball) return;

  document.querySelectorAll('.story-notebook-wrap, .story-overlay').forEach(function (node) { node.remove(); });

  // EDIT THESE CHAPTERS TO PERSONALIZE THE STORY SKETCHBOOK.
  const CHAPTERS = [
    { title: 'Chapter 1: Learn', text: 'PLACEHOLDER', doodle: 'ti-book' },
    { title: 'Chapter 2: Code', text: 'PLACEHOLDER', doodle: 'ti-code' },
    { title: 'Chapter 3: Solve', text: 'PLACEHOLDER', doodle: 'ti-bulb' },
    { title: 'Chapter 4: Build', text: 'PLACEHOLDER', doodle: 'ti-tools' }
  ];
  const CLOSING_LINE = 'Learn. Code. Solve. Build. Grow.';
  const PAGE_COUNT = CHAPTERS.length + 2;

  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Caveat"]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap';
    document.head.appendChild(font);
  }

  const notebookWrap = document.createElement('div');
  notebookWrap.className = 'story-notebook-wrap';
  notebookWrap.innerHTML = '<button id="storyNotebook" class="story-notebook" type="button" aria-label="Open my story sketchbook"><svg viewBox="0 0 64 80" aria-hidden="true"><path d="M17 7h38v66H17z" fill="#c0c1ff" stroke="#4cd7f6" stroke-width="2"/><path d="M17 7v66M22 4v72M27 4v72" fill="none" stroke="#0b1326" stroke-width="3"/><path d="M25 18c11-7 19 8 29 1M25 34c8-5 17 5 29-1M25 50c11-7 18 7 29 1" fill="none" stroke="#0b1326" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/><path d="M54 66l7-18 4 2-7 18z" fill="#ffd700" stroke="#0b1326" stroke-width="1.5"/></svg></button><span class="story-notebook-hint">Drag Doodle here ✏️</span>';
  document.body.appendChild(notebookWrap);
  const notebook = notebookWrap.querySelector('#storyNotebook');

  const overlay = document.createElement('div');
  overlay.className = 'story-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'story-title');
  overlay.hidden = true;
  overlay.innerHTML = '<div class="story-book" tabindex="-1"><button class="story-close" type="button" aria-label="Close story sketchbook">×</button><div class="story-pages"><section class="story-page story-page-left" aria-hidden="true"></section><section class="story-page story-page-right"><div class="story-story-content"><h2 id="story-title" class="story-chapter-title"></h2><span class="story-copy-sr sr-only"></span><div class="story-copy" aria-hidden="true"></div><i class="story-doodle ti" aria-hidden="true"></i></div><form class="story-guestbook" hidden novalidate><h2 class="story-chapter-title">Leave a note for me ✏️</h2><p class="story-guestbook-intro">Say hi, ask a question, or tell me what you liked.</p><label>Name<input name="name" type="text" maxlength="60" required></label><label>Message<textarea name="message" maxlength="500" required></textarea><span class="story-char-count">0/500</span></label><label class="story-honeypot"><input type="checkbox" name="botcheck"> Do not check this box</label><button class="story-send" type="submit">Send note</button><div class="story-form-status" role="status" aria-live="polite"></div></form></section></div><div class="story-controls"><button class="story-prev" type="button">← Prev</button><span class="story-page-count" aria-live="polite"></span><button class="story-next" type="button">Next →</button></div></div>';
  document.body.appendChild(overlay);

  const book = overlay.querySelector('.story-book');
  const leftPage = overlay.querySelector('.story-page-left');
  const rightPage = overlay.querySelector('.story-page-right');
  const storyContent = overlay.querySelector('.story-story-content');
  const title = overlay.querySelector('.story-chapter-title');
  const copySr = overlay.querySelector('.story-copy-sr');
  const animatedCopy = overlay.querySelector('.story-copy');
  const doodle = overlay.querySelector('.story-doodle');
  const guestbook = overlay.querySelector('.story-guestbook');
  const guestbookTitle = guestbook.querySelector('.story-chapter-title');
  const messageInput = guestbook.querySelector('[name="message"]');
  const charCount = overlay.querySelector('.story-char-count');
  const sendButton = overlay.querySelector('.story-send');
  const status = overlay.querySelector('.story-form-status');
  const pageCount = overlay.querySelector('.story-page-count');
  const prevButton = overlay.querySelector('.story-prev');
  const nextButton = overlay.querySelector('.story-next');
  const shownPages = new Set();
  let currentPage = 0;
  let isOpen = false;
  let previousOverflow = '';
  let revealTimers = [];

  function clearReveal() {
    revealTimers.forEach(clearTimeout);
    revealTimers = [];
  }

  function revealText(fullText, instant) {
    clearReveal();
    copySr.textContent = fullText;
    if (instant || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animatedCopy.innerHTML = '<span class="story-reveal-line">' + fullText.replace(/[&<>]/g, function (char) { return char === '&' ? '&amp;' : char === '<' ? '&lt;' : '&gt;'; }) + '</span>';
      shownPages.add(currentPage);
      return;
    }
    animatedCopy.textContent = '';
    const lines = fullText.split(/\n|(?<=[.!?])\s+/);
    let line = 0;
    let character = 0;

    function typeNext() {
      if (line >= lines.length) {
        shownPages.add(currentPage);
        return;
      }
      while (animatedCopy.children.length <= line) {
        const node = document.createElement('span');
        node.className = 'story-reveal-line';
        node.style.display = 'block';
        animatedCopy.appendChild(node);
      }
      if (character < lines[line].length) {
        animatedCopy.children[line].textContent += lines[line].charAt(character);
        character += 1;
        revealTimers.push(setTimeout(typeNext, 25));
      } else {
        line += 1;
        character = 0;
        revealTimers.push(setTimeout(typeNext, 300));
      }
    }
    typeNext();
  }

  function currentText() {
    if (currentPage < CHAPTERS.length) return CHAPTERS[currentPage].text;
    if (currentPage === CHAPTERS.length) return CLOSING_LINE;
    return '';
  }

  function renderPage() {
    clearReveal();
    const guestbookPage = currentPage === CHAPTERS.length + 1;
    storyContent.hidden = guestbookPage;
    guestbook.hidden = !guestbookPage;
    guestbookTitle.removeAttribute('id');
    title.removeAttribute('id');
    if (guestbookPage) {
      guestbookTitle.id = 'story-title';
    } else {
      title.id = 'story-title';
    }
    leftPage.innerHTML = '';

    if (!guestbookPage) {
      if (currentPage < CHAPTERS.length) {
        title.textContent = CHAPTERS[currentPage].title;
        doodle.className = 'story-doodle ti ' + CHAPTERS[currentPage].doodle;
      } else {
        title.textContent = 'The journey continues';
        doodle.className = 'story-doodle ti ti-sparkles';
      }
      revealText(currentText(), shownPages.has(currentPage));
      if (currentPage === CHAPTERS.length && typeof window.ballSay === 'function') {
        window.ballSay('That\'s my story so far 🙂', 3000);
      }
      if (!window.matchMedia('(max-width: 768px)').matches && currentPage > 0 && currentPage <= CHAPTERS.length) {
        const previous = CHAPTERS[currentPage - 1];
        if (previous) leftPage.innerHTML = '<h2 class="story-chapter-title">' + previous.title + '</h2><p class="story-chapter-text">' + previous.text + '</p><i class="story-doodle ti ' + previous.doodle + '" aria-hidden="true"></i>';
      }
    }
    pageCount.textContent = 'Page ' + (currentPage + 1) + ' of ' + PAGE_COUNT;
    prevButton.disabled = currentPage === 0;
    nextButton.disabled = currentPage === PAGE_COUNT - 1;
  }

  function openStory() {
    if (isOpen) return;
    currentPage = 0;
    renderPage();
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.classList.add('story-open');
    overlay.hidden = false;
    requestAnimationFrame(function () {
      overlay.classList.add('is-open');
      book.focus();
    });
    isOpen = true;
  }

  function closeStory() {
    if (!isOpen) return;
    clearReveal();
    overlay.classList.remove('is-open');
    document.body.classList.remove('story-open');
    document.body.style.overflow = previousOverflow;
    isOpen = false;
    setTimeout(function () { overlay.hidden = true; }, 180);
    notebook.focus();
  }

  function turnPage(direction) {
    const nextPage = currentPage + direction;
    if (nextPage < 0 || nextPage >= PAGE_COUNT) return;
    clearReveal();
    rightPage.classList.add(direction > 0 ? 'is-turning' : 'is-turning-back');
    const delay = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 90 : 300;
    setTimeout(function () {
      currentPage = nextPage;
      renderPage();
      rightPage.classList.remove('is-turning', 'is-turning-back');
    }, delay);
  }

  notebook.addEventListener('click', function (event) {
    if (event.detail === 0) return;
    if (typeof window.ballSay === 'function') window.ballSay('Drag me onto the notebook!');
  });
  notebook.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openStory();
    }
  });
  overlay.querySelector('.story-close').addEventListener('click', closeStory);
  overlay.addEventListener('click', function (event) { if (event.target === overlay) closeStory(); });
  rightPage.addEventListener('pointerdown', function (event) {
    if (!event.target.closest('input, textarea, button, a') && currentText()) revealText(currentText(), true);
  });
  prevButton.addEventListener('click', function () { turnPage(-1); });
  nextButton.addEventListener('click', function () { turnPage(1); });

  document.addEventListener('keydown', function (event) {
    if (!isOpen) return;
    if (event.key === 'Escape') {
      closeStory();
      return;
    }
    if (event.target.closest('input, textarea, [contenteditable="true"]')) return;
    if (event.key === 'ArrowLeft') turnPage(-1);
    if (event.key === 'ArrowRight') turnPage(1);
  });

  messageInput.addEventListener('input', function () {
    charCount.textContent = messageInput.value.length + '/500';
  });

  guestbook.addEventListener('submit', async function (event) {
    event.preventDefault();
    if (!guestbook.checkValidity()) {
      guestbook.reportValidity();
      return;
    }
    status.className = 'story-form-status';
    status.textContent = '';
    sendButton.disabled = true;
    sendButton.textContent = 'Sending...';
    try {
      const keyInput = document.querySelector('#contactForm input[name="access_key"]');
      const key = keyInput ? keyInput.value.trim() : '';
      if (!keyInput || !key) throw new Error('missing-key');
      const data = new FormData(guestbook);
      data.append('access_key', key);
      data.append('subject', 'New guestbook note from portfolio');
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      });
      if (!response.ok) throw new Error('request-failed');
      const result = await response.json();
      if (!result.success) throw new Error('submission-failed');
      guestbook.reset();
      charCount.textContent = '0/500';
      status.classList.add('is-success');
      status.textContent = 'Thanks! Your note landed in my inbox 💌';
      if (typeof window.ballMood === 'function') window.ballMood('happy', 1500);
      if (typeof window.ballSay === 'function') window.ballSay('Note delivered!', 2500);
    } catch (error) {
      status.classList.add('is-error');
      status.textContent = "Couldn't send. Please email me directly.";
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = 'Send note';
    }
  });

  document.addEventListener('pointermove', function (event) {
    if (!ball.classList.contains('nav-ball--dragging')) return;
    const ballRect = ball.getBoundingClientRect();
    const notebookRect = notebook.getBoundingClientRect();
    const x = Math.max(notebookRect.left - ballRect.right, ballRect.left - notebookRect.right, 0);
    const y = Math.max(notebookRect.top - ballRect.bottom, ballRect.top - notebookRect.bottom, 0);
    notebookWrap.classList.toggle('is-near', Math.hypot(x, y) <= 120);
  }, { passive: true });

  document.addEventListener('pointerup', function () {
    if (!ball.classList.contains('nav-ball--dragging')) return;
    const ballRect = ball.getBoundingClientRect();
    const notebookRect = notebook.getBoundingClientRect();
    const expanded = { left: notebookRect.left - 20, right: notebookRect.right + 20, top: notebookRect.top - 20, bottom: notebookRect.bottom + 20 };
    if (ballRect.left < expanded.right && ballRect.right > expanded.left && ballRect.top < expanded.bottom && ballRect.bottom > expanded.top) {
      notebookWrap.classList.remove('is-near');
      if (typeof window.ballMood === 'function') window.ballMood('happy', 1500);
      openStory();
    }
  }, true);
})();
