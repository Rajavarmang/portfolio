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

  function canShow(allowIntro) {
    return Date.now() - startedAt >= 2500 &&
      !ball.classList.contains('nb-open') &&
      !ball.classList.contains('nav-ball--dragging') &&
      !isLightboxOpen() &&
      (!document.body.classList.contains('intro-playing') || allowIntro);
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
    if (!text || !canShow(true)) return;

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

  (function () {
    const ball = document.getElementById('navBall');
    if (!ball) return;
    const BALL_NAME = 'M_Handler';
    let seen = false;
    try { seen = sessionStorage.getItem('introSeen') === '1'; } catch (_) {}
    if (seen) return;

    const limbs = document.createElementNS('http://www.w3.org/2000/svg','svg');
    limbs.className = 'ball-limb-svg ball-legs intro-limbs';
    limbs.setAttribute('aria-hidden','true');
    limbs.innerHTML = '<path class="leg-left" d="M18 49v10"/><path class="leg-right" d="M34 49v10"/>';
    const arms = document.createElementNS('http://www.w3.org/2000/svg','svg');
    arms.className = 'ball-limb-svg ball-arms intro-limbs';
    arms.setAttribute('aria-hidden','true');
    arms.innerHTML = '<path d="M8 28l-10 8"/><path class="arm-right" d="M44 28l10 8"/>';
    ball.append(limbs, arms);

    let walk, timers = [], running = false;
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function bubbleHide() { document.querySelectorAll('.ball-bubble').forEach(el => el.classList.remove('is-visible')); }
    function clearIntro() {
      timers.forEach(clearTimeout); timers = [];
      if (walk) walk.cancel();
      ball.classList.remove('walking','intro-arms','intro-snap','intro-wave');
      document.body.classList.remove('intro-playing');
    }
    function finish() { clearIntro(); ball.style.translate = ''; }
    function skip() {
      if (!running) return;
      finish();
      if (typeof window.nbClose_menu === 'function') window.nbClose_menu();
      bubbleHide();
      try { sessionStorage.setItem('introSeen','1'); } catch (_) {}
    }

    ['pointerdown','keydown','wheel','touchstart'].forEach(type =>
      document.addEventListener(type, skip, {passive:true}));

    function run() {
      if (running) return;
      running = true;
      try { sessionStorage.setItem('introSeen','1'); } catch (_) {}
      const lightbox = document.querySelector('#portfolioLightbox.active,#certLightbox.active,#storyOverlay.is-open');
      if (lightbox || ball.classList.contains('nav-ball--dragging')) return finish();

      document.body.classList.add('intro-playing');
      const rect = ball.getBoundingClientRect();
      const from = window.innerWidth - rect.left + 52;
      const frames = [{translate:'0px 0px',rotate:'0deg'}];
      if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ball.classList.add('walking','intro-arms');
        for (let i=1;i<=5;i++) frames.push({translate:`-${from*(1-i/5)}px 0px`,rotate:i%2?'2deg':'-2deg',offset:i/5});
        frames[0].translate = `${from}px 0px`;
        frames.push({translate:'0px 0px',rotate:'0deg'});
        walk = ball.animate(frames,{duration:2500,easing:'steps(10,end)',fill:'forwards'});
        ball.classList.remove('intro-arms');
      }

      later(() => {
        ball.classList.remove('walking');
        ball.classList.add('intro-arms','intro-snap');
        later(() => {
          ball.classList.remove('intro-snap');
          ball.dispatchEvent(new MouseEvent('click',{bubbles:true}));
          later(() => {
            if (typeof window.nbClose_menu === 'function') window.nbClose_menu();
            ball.classList.remove('intro-arms');
            ball.classList.add('intro-arms','intro-wave');
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches) window.ballMood('happy',1500);
            window.ballSay(`Hii! I'm ${BALL_NAME} 👋 Welcome to my dad's portfolio.`,2800);
            later(() => {
              window.ballSay('I know all his secrets. Want them? Drag me onto the notebook ✏️',4500);
              const notebook = document.getElementById('storyNotebook');
              if (notebook) { notebook.classList.add('hint-pulse'); later(() => notebook.classList.remove('hint-pulse'),3000); }
              later(finish,4500);
            },2800);
          },3000);
        },400);
      },2500);
    }

    window.addEventListener('load', () => setTimeout(run,800));
  })();

(function () {
  const ball = document.getElementById('navBall');
  if (!ball) return;

  // CHAPTERS: Edit the four chapter entries here.
  const CHAPTERS = [
    {title:'Chapter 1: Learn', text:'PLACEHOLDER', doodle:'ti-book'},
    {title:'Chapter 2: Code', text:'PLACEHOLDER', doodle:'ti-code'},
    {title:'Chapter 3: Solve', text:'PLACEHOLDER', doodle:'ti-puzzle'},
    {title:'Chapter 4: Build', text:'PLACEHOLDER', doodle:'ti-tools'}
  ];
  const PAGES = CHAPTERS.concat([{title:'Keep Growing', text:'Learn. Code. Solve. Build. Grow.', doodle:'ti-sparkles'}]);

  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Caveat"]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap';
    document.head.appendChild(font);
  }

  const notebook = document.createElement('button');
  notebook.id = 'storyNotebook';
  notebook.setAttribute('aria-label', 'Open my story sketchbook');
  notebook.innerHTML = '<svg viewBox="0 0 64 80" aria-hidden="true"><rect x="10" y="9" width="46" height="64" rx="6" fill="#172e4f" stroke="#c0c1ff"/><path d="M18 10v62" stroke="#4cd7f6"/><g stroke="#ffd700"><path d="M4 18h12M4 28h12M4 38h12M4 48h12"/></g><path d="M52 67l7 6v-18z" fill="#ffd700"/></svg><span id="storyNotebookLabel">Drag Doodle here ✏️</span>';
  document.body.appendChild(notebook);

  const overlay = document.createElement('div');
  overlay.id = 'storyOverlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','My story sketchbook');
  overlay.innerHTML = '<div class="story-backdrop"></div><div class="story-book" tabindex="-1"><div class="story-spine"></div><button class="story-close" aria-label="Close story">×</button><article class="story-page"></article><button class="story-nav story-prev" aria-label="Previous page">‹</button><span class="story-count"></span><button class="story-nav story-next" aria-label="Next page">›</button></div>';
  document.body.appendChild(overlay);

  const book = overlay.querySelector('.story-book');
  const page = overlay.querySelector('.story-page');
  const count = overlay.querySelector('.story-count');
  const closeButton = overlay.querySelector('.story-close');
  const previousOverflow = document.body.style.overflow;
  let index = 0;
  let timers = [];
  let shown = new Set();
  let lastFocused = null;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function cancelTyping() {
    timers.forEach(clearTimeout);
    timers = [];
  }
  function escapeHtml(value) {
    const node = document.createElement('span');
    node.textContent = value;
    return node.innerHTML;
  }
  function guestbook() {
    return '<div class="story-guest"><h2 class="story-title">Leave a note for me ✏️</h2><p>Say hi, ask a question, or tell me what you liked.</p><form><label>Name<input name="name" required maxlength="60"></label><label>Message <span class="story-counter">0/500</span><textarea name="message" required maxlength="500"></textarea></label><label style="display:none"><input type="checkbox" name="botcheck">Bot</label><button class="story-send" type="submit">Send note</button><p class="story-result" role="status" aria-live="polite"></p></form></div>';
  }
  function renderPage() {
    cancelTyping();
    const chapter = PAGES[index];
    const guest = index === PAGES.length;
    page.innerHTML = guest ? guestbook() : `<i class="ti ${chapter.doodle} story-doodle" aria-hidden="true"></i><h2 class="story-title">${escapeHtml(chapter.title)}</h2><div class="story-sr">${escapeHtml(chapter.text)}</div><div class="story-hand" aria-hidden="true"></div>`;
    count.textContent = `Page ${index + 1} of ${PAGES.length + 1}`;
    overlay.querySelector('.story-prev').disabled = index === 0;
    if (guest) bindGuest();
    else typeText(chapter.text);
    if (!guest && index === PAGES.length - 1 && window.ballSay) window.ballSay("That's my story so far 🙂", 3000);
  }

  function typeText(text) {
    const output = page.querySelector('.story-hand');
    const lines = text.split(/(?<=[.!?])\s+/);
    if (reduced.matches || shown.has(index)) {
      output.textContent = lines.join('\n');
      return;
    }
    shown.add(index);
    let line = 0, char = 0;
    output.classList.add('typing');
    function tick() {
      output.textContent = lines.slice(0,line).join('\n') + (line ? '\n' : '') + lines[line].slice(0,char);
      output.textContent += '▍';
      if (char < lines[line].length) { char++; timers.push(setTimeout(tick,25)); }
      else if (line < lines.length - 1) { line++; char = 0; timers.push(setTimeout(tick,300)); }
      else output.textContent = output.textContent.slice(0,-1);
    }
    tick();
  }
  function skipTyping() {
    const sr = page.querySelector('.story-sr');
    const output = page.querySelector('.story-hand');
    if (sr && output && output.textContent !== sr.textContent) {
      cancelTyping();
      output.textContent = sr.textContent;
    }
  }

  function flip(direction) {
    if (index + direction < 0 || index + direction > PAGES.length) return;
    page.classList.add('flipping');
    setTimeout(function () {
      index += direction;
      page.classList.remove('flipping');
      renderPage();
    }, reduced.matches ? 0 : 600);
  }
  function openStory() {
    if (overlay.classList.contains('is-open')) return;
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    document.body.classList.add('story-open');
    document.body.style.overflow = 'hidden';
    renderPage();
    book.focus();
  }
  function closeStory() {
    cancelTyping();
    overlay.classList.remove('is-open');
    document.body.classList.remove('story-open');
    document.body.style.overflow = previousOverflow;
    (lastFocused || notebook).focus();
  }

  notebook.addEventListener('click', function () {
    if (window.ballSay) window.ballSay('Drag me onto the notebook!', 3000);
  });
  notebook.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' || event.key === ' ') openStory();
  });
  closeButton.addEventListener('click', closeStory);
  overlay.querySelector('.story-backdrop').addEventListener('click', closeStory);
  overlay.querySelector('.story-prev').addEventListener('click', function () { flip(-1); });
  overlay.querySelector('.story-next').addEventListener('click', function () { flip(1); });
  page.addEventListener('click', function () { skipTyping(); });

  document.addEventListener('keydown', function(event) {
    if (!overlay.classList.contains('is-open')) return;
    if (event.key === 'Escape') { closeStory(); return; }
    const typing = event.target.matches('input,textarea,[contenteditable="true"]');
    if (typing) return;
    if (event.key === 'ArrowLeft') { flip(-1); }
    if (event.key === 'ArrowRight') { flip(1); }
    if (event.key === 'Enter' || event.key === ' ') event.preventDefault();
  });

  let storyWasDragging = false;
  document.addEventListener('pointerup', function () {
    storyWasDragging = ball.classList.contains('nav-ball--dragging');
    setTimeout(function () { storyWasDragging = false; }, 0);
  }, true);
  document.addEventListener('pointermove', function () {
    const br = ball.getBoundingClientRect();
    const nr = notebook.getBoundingClientRect();
    const near = br.left < nr.right + 120 && br.right > nr.left - 120 && br.top < nr.bottom + 120 && br.bottom > nr.top - 120;
    notebook.classList.toggle('near', near && ball.classList.contains('nav-ball--dragging'));
  }, {passive:true});
  document.addEventListener('pointerup', function () {
    const br = ball.getBoundingClientRect();
    const nr = notebook.getBoundingClientRect();
    const hit = br.left < nr.right + 20 && br.right > nr.left - 20 && br.top < nr.bottom + 20 && br.bottom > nr.top - 20;
    notebook.classList.remove('near','wiggle');
    if (hit && storyWasDragging) {
      notebook.classList.add('wiggle');
      openStory();
      if (window.ballMood) window.ballMood('happy',1500);
    }
  });

  function bindGuest() {
    const form = page.querySelector('form');
    const message = form.querySelector('textarea');
    const counter = page.querySelector('.story-counter');
    const button = form.querySelector('button');
    const result = page.querySelector('.story-result');
    message.addEventListener('input', function () { counter.textContent = message.value.length + '/500'; });
    form.addEventListener('submit', function(event) {
      event.preventDefault();
      const keyInput = document.querySelector('#contactForm input[name="access_key"]');
      if (!keyInput || !keyInput.value) {
        result.textContent = 'Could not send. Please try again or email me directly.';
        return;
      }
      const data = new FormData(form);
      data.append('access_key', keyInput.value);
      data.append('subject', 'New guestbook note from portfolio');
      button.disabled = true;
      button.textContent = 'Sending...';
      fetch('https://api.web3forms.com/submit', {method:'POST', body:data, headers:{Accept:'application/json'}})
        .then(function(response){ return response.json().then(function(json){ return {ok:response.ok, json:json}; }); })
        .then(function(response){
          if (!response.ok || response.json.success === false) throw new Error('send failed');
          result.textContent = 'Thanks! Your note landed in my inbox 💌';
          form.reset();
          counter.textContent = '0/500';
          if (window.ballMood) window.ballMood('happy',1500);
          if (window.ballSay) window.ballSay('Note delivered!',2500);
        })
        .catch(function(){ result.textContent = "Couldn't send. Please email me directly."; })
        .finally(function(){ button.disabled = false; button.textContent = 'Send note'; });
    });
  }
})();
