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
      !document.body.classList.contains('intro-playing') &&
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
  window.ballHide = hideBubble;

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

// Extended story sketchbook: handwriting and guestbook.
(function () {
  'use strict';

  const ball = document.getElementById('navBall');
  if (!ball) return;

  document.querySelectorAll('.story-notebook-wrap, .story-overlay').forEach(function (node) { node.remove(); });

  // EDIT THESE CHAPTERS TO PERSONALIZE THE STORY SKETCHBOOK.
  const CHAPTERS = [
    { title: 'Chapter 01 - PROMPT LAB', text: 'My First Project - Where the Journey Began', doodle: 'ti-book' },
    { title: 'Chapter 2: Code', text: 'PLACEHOLDER', doodle: 'ti-code' },
    { title: 'Chapter 3: Solve', text: 'PLACEHOLDER', doodle: 'ti-bulb' },
    { title: 'Chapter 4: Build', text: 'PLACEHOLDER', doodle: 'ti-tools' }
  ];
  const CLOSING_LINE = 'Learn. Code. Solve. Build. Grow.';
  const PAGE_COUNT = CHAPTERS.length + 3;
  const PROMPT_LAB_SPREAD_PAGE = 1;
  const CLOSING_PAGE = CHAPTERS.length + 1;
  const NOTEBOOKLM_SPREAD_PAGE = 2;
  const IPL_SPREAD_PAGE = 3;
  const DELOITTE_SPREAD_PAGE = 4;
  const PROMPT_BEGINNING = [
    ['01. The Idea', 'Prompt Lab was my first project and an important milestone in my developer journey.\n\nThe idea was to explore prompt engineering and understand how effectively communicating with AI can influence the quality of its responses.'],
    ['02. The Vision', 'My vision was to explore how users could interact with AI through structured and effective prompts.\n\nI wanted to transform the concept of prompt engineering into an interactive learning experience rather than just learning it theoretically.\n\nThis project gave me an opportunity to explore AI-powered applications and practical development.'],
    ['03. The Struggle', 'Building my first project was not an easy experience.\n\nUnderstanding how different components work together, translating ideas into working features, and handling unexpected development challenges required patience and experimentation.\n\nThere were moments when things did not work as expected, but each challenge became an opportunity to learn something new.']
  ];
  const PROMPT_JOURNEY = [
    ['04. The Breakthrough', 'Through continuous testing and experimentation, I overcame challenges and moved closer to completing my project. I learned that problem-solving is just as important as coding.'],
    ['05. The People Behind It', 'I am grateful to the people, mentors, resources, and AI tools that supported me. Every piece of guidance helped me move forward.'],
    ['06. The Lessons I Carry', 'Prompt Lab taught me the value of curiosity, patience, problem-solving, and continuous learning. It was my first step towards turning ideas into reality.']
  ];
  const NOTEBOOKLM_BEGINNING = [
    ['01. The Idea', 'Inspired by Google NotebookLM, I wanted to build an AI-powered platform that allows users to upload PDFs, ask questions, and interact with their documents intelligently.'],
    ['02. The Vision', 'My goal was to recreate the NotebookLM experience using Generative AI, RAG, and Agentic AI while keeping everything running locally.'],
    ['03. The Struggle', 'Integrating multiple technologies like LangChain, Ollama, ChromaDB, and LangGraph was challenging. Connecting document retrieval, AI responses, and agent workflows required continuous debugging.']
  ];
  const NOTEBOOKLM_JOURNEY = [
    ['04. The Breakthrough', 'By building the application step by step, I integrated PDF processing, vector search, RAG, tool calling, and LangGraph workflows into one functional application.'],
    ['05. The People Behind It', 'The Nunnari Academy Generative AI and Agentic AI Bootcamp, its learning resources, and AI tools guided me throughout this capstone project.'],
    ['06. The Lessons I Carry', 'This project strengthened my understanding of RAG, vector databases, AI agents, and workflow orchestration. It taught me how to transform multiple AI concepts into a practical application.']
  ];
  const IPL_BEGINNING = [
  ['01. The Idea', 'I wanted to explore IPL data to discover patterns in team performances, player statistics, and match outcomes.'],
  ['02. The Vision', 'My goal was to turn raw IPL data into meaningful insights using Python, Pandas, NumPy, and visualization techniques.'],
  ['03. The Struggle', 'Cleaning data, handling missing values, and identifying meaningful patterns challenged my analytical and problem-solving skills.']
  ];
  const IPL_JOURNEY = [
    ['04. The Breakthrough', 'Through univariate and bivariate analysis, I explored season-wise trends, team performance, toss decisions, player statistics, and venue records. Visualizations using Matplotlib and Seaborn helped turn complex datasets into understandable patterns.'],
    ['05. The People Behind It', 'This project was driven by my curiosity about cricket, my learning journey in data science, and the support of Python libraries and learning resources that helped me explore and visualize the data.'],
    ['06. The Lessons I Carry', 'This project strengthened my understanding of data cleaning, exploratory data analysis, statistical thinking, and visualization. It taught me how to investigate raw data, identify meaningful patterns, and communicate insights through visual storytelling.']
  ];
  const DELOITTE_BEGINNING = [
    ['01. The Idea', "I joined Deloitte's Data Analytics Job Simulation through Forage to experience how data analytics is used to solve business problems. The project involved exploring simulated operational and HR data from Daikibo Manufacturing."],
    ['02. The Vision', 'My goal was to transform raw data into meaningful business insights using Tableau and Microsoft Excel. I wanted to understand how data visualization and analytical logic could support better decision-making.'],
    ['03. The Struggle', 'Working with approximately 160,000 machine telemetry records required careful data preparation and analytical thinking. Understanding downtime calculations, creating Tableau visualizations, and developing accurate Excel classification formulas challenged my problem-solving skills.']
  ];
  const DELOITTE_JOURNEY = [
    ['04. The Breakthrough', 'I built an interactive Tableau downtime dashboard using calculated fields, bar charts, and filter actions to explore factory and device-level breakdowns. In Excel, I used nested IF, AND, and OR logic to classify pay equality scores into Fair, Unfair, and Highly Discriminative categories.'],
    ['05. The People Behind It', "This experience was made possible through Deloitte's Data Analytics Job Simulation on Forage. The practical tasks and simulated business scenarios gave me an opportunity to explore professional data analytics workflows."],
    ['06. The Lessons I Carry', 'This project strengthened my skills in Tableau, Excel, data visualization, conditional logic, and business analysis. I learned how to turn raw operational and HR data into structured insights that support better decisions.']
  ];

  function escapeStoryHtml(value) {
    return value.replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[character];
    });
  }

  function promptLabPage(sections, heading) {
    const sectionHtml = sections.map(function (section) {
      return '<section class="story-project-section"><h3><span>' + escapeStoryHtml(section[0].split('.')[0]) + '</span>' + escapeStoryHtml(section[0].replace(/^\d+\.\s*/, '')) + '</h3><p>' + escapeStoryHtml(section[1]).replace(/\n\n/g, '</p><p>') + '</p></section>';
    }).join('');
    return '<article class="story-project-page"><div class="story-project-heading">' + heading + '</div>' + sectionHtml + '</article>';
  }

  function projectSpread(sections, heading, terms, subtitle) {
    const escapedTerms = terms.map(function (term) {
      return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).sort(function (a, b) { return b.length - a.length; });
    const headingHtml = heading ? '<p class="story-project-chapter">' + escapeStoryHtml(heading) + '</p><p class="story-project-subtitle">' + escapeStoryHtml(subtitle) + '</p>' : '';
    const sectionHtml = sections.map(function (section) {
      let text = escapeStoryHtml(section[1]);
      if (escapedTerms.length) {
        text = text.replace(new RegExp('(' + escapedTerms.join('|') + ')', 'gi'), '<strong>$1</strong>');
      }
      text = text.replace(/\n\n/g, '</p><p>');
      return '<section class="story-project-section"><h3><span>' + escapeStoryHtml(section[0].split('.')[0]) + '</span>' + escapeStoryHtml(section[0].replace(/^\d+\.\s*/, '')) + '</h3><p>' + text + '</p></section>';
    }).join('');
    return '<article class="story-project-page"><div class="story-project-heading">' + headingHtml + '</div>' + sectionHtml + '</article>';
  }

  if (!document.querySelector('link[href*="fonts.googleapis.com/css2?family=Caveat"]')) {
    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500&display=swap';
    document.head.appendChild(font);
  }

  const notebookWrap = document.createElement('div');
  notebookWrap.className = 'story-notebook-wrap';
  notebookWrap.innerHTML = '<button id="storyNotebook" class="story-notebook" type="button" aria-label="Open my story sketchbook"><svg viewBox="0 0 64 80" aria-hidden="true"><path d="M17 7h38v66H17z" fill="#c0c1ff" stroke="#4cd7f6" stroke-width="2"/><path d="M17 7v66M22 4v72M27 4v72" fill="none" stroke="#0b1326" stroke-width="3"/><path d="M25 18c11-7 19 8 29 1M25 34c8-5 17 5 29-1M25 50c11-7 18 7 29 1" fill="none" stroke="#0b1326" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 4"/><path d="M54 66l7-18 4 2-7 18z" fill="#ffd700" stroke="#0b1326" stroke-width="1.5"/></svg></button><button class="story-notebook-hint-button" type="button" aria-label="Show notebook hint">Hint</button><span class="story-notebook-hint">Drag MR_Handler here ✏️</span>';
  document.body.appendChild(notebookWrap);
  const notebook = notebookWrap.querySelector('#storyNotebook');
  const notebookHintButton = notebookWrap.querySelector('.story-notebook-hint-button');
  notebookHintButton.addEventListener('click', function () {
    if (typeof window.ballSay === 'function') {
      window.ballSay('Drag the MR_Handler on the notebook ✏️', 4500);
    }
  });

  const homeSection = document.getElementById('home');
  function updateNotebookVisibility() {
    if (!homeSection) {
      notebookWrap.classList.add('is-hidden');
      return;
    }
    const rect = homeSection.getBoundingClientRect();
    notebookWrap.classList.toggle('is-hidden', rect.bottom <= 0 || rect.top >= window.innerHeight);
  }
  updateNotebookVisibility();
  window.addEventListener('scroll', updateNotebookVisibility, { passive: true });
  window.addEventListener('resize', updateNotebookVisibility);

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
    if (currentPage >= PROMPT_LAB_SPREAD_PAGE + 1 && currentPage <= CLOSING_PAGE - 1) {
      return CHAPTERS[currentPage - 1].text;
    }
    if (currentPage === CLOSING_PAGE) return CLOSING_LINE;
    return '';
  }

  function renderPage() {
    clearReveal();
    const guestbookPage = currentPage === PAGE_COUNT - 1;
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
      if (currentPage === PROMPT_LAB_SPREAD_PAGE) {
        storyContent.hidden = true;
        doodle.hidden = true;
        const heading = '<p class="story-project-chapter">Chapter 01</p><h2>PROMPT LAB</h2><p class="story-project-subtitle">My First Project - Where the Journey Began</p>';
        leftPage.innerHTML = promptLabPage(PROMPT_BEGINNING, heading);
        if (window.matchMedia('(max-width: 768px)').matches) {
          storyContent.hidden = false;
          title.innerHTML = '';
          animatedCopy.className = 'story-project-mobile-copy';
          animatedCopy.innerHTML = promptLabPage(PROMPT_BEGINNING, heading) + promptLabPage(PROMPT_JOURNEY, '');
        } else {
          storyContent.hidden = false;
          title.innerHTML = '';
          animatedCopy.className = 'story-project-copy';
          animatedCopy.innerHTML = promptLabPage(PROMPT_JOURNEY, '') + '<blockquote class="story-project-quote">&ldquo;Every great journey begins with a single step. This was mine.&rdquo;</blockquote>';
        }
        copySr.textContent = '';
        shownPages.add(currentPage);
      } else if (currentPage === NOTEBOOKLM_SPREAD_PAGE || currentPage === IPL_SPREAD_PAGE || currentPage === DELOITTE_SPREAD_PAGE) {
        const isNotebook = currentPage === NOTEBOOKLM_SPREAD_PAGE;
        const isDeloitte = currentPage === DELOITTE_SPREAD_PAGE;
        const heading = isNotebook ? 'CHAPTER 02 - NOTEBOOKLM REPLICA' : isDeloitte ? 'CHAPTER 04 - DELOITTE DATA ANALYTICS JOB SIMULATION' : 'CHAPTER 03 - IPL EXPLORATORY DATA ANALYSIS';
        const subtitle = isNotebook ? 'From Documents to Intelligent Conversations' : isDeloitte ? 'From Raw Data to Business Insights' : 'Discovering the Stories Behind the Game';
        const beginning = isNotebook ? NOTEBOOKLM_BEGINNING : isDeloitte ? DELOITTE_BEGINNING : IPL_BEGINNING;
        const journey = isNotebook ? NOTEBOOKLM_JOURNEY : isDeloitte ? DELOITTE_JOURNEY : IPL_JOURNEY;
        const terms = isNotebook ? ['Streamlit', 'LangChain', 'Ollama', 'ChromaDB', 'RAG', 'LangGraph'] : isDeloitte ? ['Deloitte', 'Forage', 'Tableau', 'Excel', 'Data Analytics', 'Daikibo Manufacturing'] : ['IPL', 'Python', 'Pandas', 'NumPy', 'Matplotlib', 'Seaborn', 'EDA'];
        storyContent.hidden = window.matchMedia('(max-width: 768px)').matches;
        doodle.hidden = true;
        leftPage.innerHTML = projectSpread(beginning, heading, terms, subtitle);
        if (window.matchMedia('(max-width: 768px)').matches) {
          storyContent.hidden = false;
          title.innerHTML = '';
          animatedCopy.className = 'story-project-mobile-copy';
          animatedCopy.innerHTML = projectSpread(beginning, heading, terms, subtitle) + projectSpread(journey, '', [], '');
        } else {
          storyContent.hidden = false;
          title.innerHTML = '';
          animatedCopy.className = 'story-project-copy';
          animatedCopy.innerHTML = projectSpread(journey, '', terms, '') ;
        }
        copySr.textContent = '';
        shownPages.add(currentPage);
      } else {
      if (currentPage >= PROMPT_LAB_SPREAD_PAGE + 1 && currentPage <= CLOSING_PAGE - 1) {
        title.textContent = CHAPTERS[currentPage - 1].title;
        doodle.className = 'story-doodle ti ' + CHAPTERS[currentPage - 1].doodle;
      } else {
        title.textContent = 'The journey continues';
        doodle.className = 'story-doodle ti ti-sparkles';
      }
      if (currentPage === 0) {
        clearReveal();
        storyContent.classList.add('story-kural-opening');
        title.innerHTML = '<span>Those who strive without wavering,</span><span>Shall overcome even the power of fate.</span>';
        animatedCopy.className = 'story-copy story-kural-copy';
        animatedCopy.innerHTML = '<p class="story-kural-author">&mdash; Thiruvalluvar</p><p class="story-kural-meaning">This Thirukkural teaches us that people who work continuously with determination, patience, and unwavering effort can overcome even the greatest obstacles. No matter how difficult the journey becomes, never give up. Consistency and dedication are the keys to achieving success.</p>';
        copySr.textContent = '';
        doodle.hidden = true;
        shownPages.add(currentPage);
      } else {
        storyContent.classList.remove('story-kural-opening');
        animatedCopy.className = 'story-copy';
        doodle.hidden = false;
        revealText(currentText(), shownPages.has(currentPage));
      }
      }
      if (currentPage === CLOSING_PAGE && typeof window.ballSay === 'function') {
        window.ballSay('That\'s my story so far 🙂', 3000);
      }
      if (!window.matchMedia('(max-width: 768px)').matches && currentPage !== PROMPT_LAB_SPREAD_PAGE && currentPage !== NOTEBOOKLM_SPREAD_PAGE && currentPage !== IPL_SPREAD_PAGE && currentPage !== DELOITTE_SPREAD_PAGE && currentPage > 0 && currentPage <= CHAPTERS.length) {
        const previous = CHAPTERS[currentPage - 2];
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
    if (currentPage !== 0 && !event.target.closest('input, textarea, button, a') && currentText()) {
      revealText(currentText(), true);
    }
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

// BALL_NAME is the only editable identity in the intro.
(function () {
  'use strict';
  const BALL_NAME = 'MR_Handler';
  // true = play on every page load (skippable); false = only once per browser tab session.
  const PLAY_EVERY_VISIT = true;
  // true = every visitor sees the full walking intro, even if their device has "reduce motion" turned on.
  const ALWAYS_PLAY_FULL_INTRO = true;
  const ball = document.getElementById('navBall');
  const notebook = document.getElementById('storyNotebook');
  if (!ball) return;
  const timers = [];
  let walk;
  let cancelled = false;
  let userClick = false;

  ball.insertAdjacentHTML('afterbegin', '<span class="ball-limbs" aria-hidden="true">' +
    '<span class="ball-limb ball-leg ball-leg-left"><span class="ball-shoe"></span></span>' +
    '<span class="ball-limb ball-leg ball-leg-right"><span class="ball-shoe"></span></span>' +
    '<span class="ball-limb ball-arm ball-arm-left"><span class="ball-hand"></span></span>' +
    '<span class="ball-limb ball-arm ball-arm-right"><span class="ball-hand"></span></span>' +
    '</span>');

  function seen() {
    if (PLAY_EVERY_VISIT || /[?&]intro=1/.test(location.search)) return false;
    try { return sessionStorage.getItem('introSeen') === '1'; } catch (error) { return false; }
  }
  function markSeen() {
    try { sessionStorage.setItem('introSeen', '1'); } catch (error) {}
  }
  function clearTimers() { timers.forEach(clearTimeout); }
  function arms(active) { ball.classList.toggle('ball-arms-show', active); }
  function finish() {
    clearTimers();
    if (walk) { walk.cancel(); walk = null; }
    ball.style.translate = '';
    ball.classList.remove('ball-walking', 'ball-snapping', 'intro-playing');
    document.body.classList.remove('intro-playing');
    arms(false);
  }
  function cancel() {
    cancelled = true;
    markSeen();
    if (typeof window.nbClose_menu === 'function') window.nbClose_menu();
    const bubble = document.getElementById('ballBubble');
    if (bubble) bubble.classList.remove('is-visible');
    finish();
  }

  ball.addEventListener('click', function (event) {
    if (userClick && event.isTrusted) { event.stopImmediatePropagation(); event.preventDefault(); }
  }, true);

  ['pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(function (type) {
    document.addEventListener(type, function () {
      if (!document.body.classList.contains('intro-playing')) return;
      userClick = type === 'pointerdown';
      cancel();
      setTimeout(function () { userClick = false; }, 0);
    }, { passive: type === 'wheel' || type === 'touchstart', once: false });
  });

  function later(fn, delay) {
    timers.push(setTimeout(function () { if (!cancelled) fn(); }, delay));
  }

  function start() {
    if (seen() || cancelled || ball.classList.contains('nav-ball--dragging')) return;
    if (document.querySelector('#portfolioLightbox.active, #certLightbox.active, .story-overlay.is-open')) return;
    document.body.classList.add('intro-playing');
    ball.classList.add('ball-walking');
    const rect = ball.getBoundingClientRect();
    const startX = window.innerWidth + 40 - rect.left;
    if ((ALWAYS_PLAY_FULL_INTRO || !window.matchMedia('(prefers-reduced-motion: reduce)').matches) && ball.animate) {
      const hops = [];
      for (let i = 0; i <= 10; i++) {
        hops.push({ translate: Math.round(startX * (1 - i / 10)) + 'px ' + (i % 2 ? '-6px' : '0px') });
      }
      walk = ball.animate(hops, { duration: 2500, easing: 'linear', fill: 'forwards' });
      later(function () {
        walk.cancel();
        ball.classList.remove('ball-walking');
        document.body.classList.remove('intro-playing');
        if (typeof window.ballMood === 'function') window.ballMood('happy', 1500);
        ball.classList.add('ball-waving');
        if (typeof window.ballSay === 'function') window.ballSay("Hii! I'm " + BALL_NAME + " 👋 Welcome to my dad's portfolio.", 3200);

        later(function () {
          if (typeof window.ballSay === 'function') window.ballSay('I know all his secrets. Want them? Drag me onto the notebook ✏️', 6500);
          ball.classList.remove('ball-waving');
        }, 3200);

        later(function () {
          window.ballHide();
          later(function () {
            ball.classList.add('ball-snapping');
            arms(true);
            later(function () {
              if (typeof window.nbOpen_menu === 'function') window.nbOpen_menu();
              else ball.dispatchEvent(new MouseEvent('click', { bubbles: true }));
              ball.classList.remove('ball-snapping');
              arms(true);
              later(function () {
                later(function () {
                  arms(true);
                  document.body.classList.remove('intro-playing');
                }, 700);
                if (window.nbClose_menu) window.nbClose_menu();
                if (notebook) { notebook.classList.add('hint-pulse'); setTimeout(function () { notebook.classList.remove('hint-pulse'); }, 1800); }
                arms(false);
                markSeen();
              }, 1500);
            }, 1880);
          }, 100);
        }, 6200);
      }, 2500);
    } else {
      later(function () {
        window.ballHide();
        ball.classList.remove('ball-walking');
        document.body.classList.remove('intro-playing');
        arms(true);
        if (typeof window.ballSay === 'function') window.ballSay("Hii! I'm " + BALL_NAME + " 👋 Welcome to my dad's portfolio.", 3200);
        later(function () {
          if (typeof window.ballSay === 'function') window.ballSay('I know all his secrets. Want them? Drag me onto the notebook ✏️', 6500);
          arms(false);
          markSeen();
        }, 3200);
      }, 1800);
    }
  }

  if (document.readyState === 'complete') setTimeout(start, 800);
  else window.addEventListener('load', function () { setTimeout(start, 800); }, { once: true });
})();