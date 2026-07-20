# Rajavarman | Full Stack Developer — Portfolio

My personal portfolio site — a doodle/sketchbook-styled single-page site built with vanilla HTML, CSS, and JavaScript.

🔗 **Live site:** _add deployed URL here_

## Overview

This is a single-page portfolio that introduces me, showcases my skills, selected projects, and certificates, and provides a way to get in touch. It's built without any frontend framework — plain HTML/CSS/JS — with a few small libraries pulled in via CDN for animation, icons, and fonts.

## Features

- **Animated hero section** — typewriter intro text, rotating role titles, and a scroll-down prompt
- **Draggable floating nav ball** — a circular nav button that can be dragged anywhere on screen; tap to burst open a radial menu that scrolls to each section, with an auto-preview animation on first load
- **About section** — bio, current focus, and social links, styled as glass-panel cards
- **Skills section** — grouped into Programming, Tools & DevOps, and Database
- **Certificates gallery** — card grid rendered dynamically from `certificates.js`, opens into a lightbox with the full certificate image
- **Portfolio gallery** — project cards with a details lightbox (title, summary, description, and a link to the project)
- **Contact form** — submits via [Web3Forms](https://web3forms.com/) with inline success/error status, no page reload
- **Scroll reveal animations** via [ScrollReveal](https://scrollrevealjs.org/)
- **Responsive layout** with a mobile hamburger nav

## Tech stack

- HTML5, CSS3, vanilla JavaScript (no build step, no framework)
- [ScrollReveal](https://unpkg.com/scrollreveal) — scroll-triggered animations
- [Boxicons](https://boxicons.com/) — UI icons
- [Tabler Icons](https://tabler.io/icons) (webfont) — doodle overlay + nav ball icons
- Google Fonts — Outfit & Inter
- [Web3Forms](https://web3forms.com/) — contact form backend (no server needed)

## Project structure

```
.
├── index.html          # Page markup — hero, about, skills, portfolio, certificates, contact
├── style.css           # All styling (~1,170 lines)
├── certificates.js      # Certificate data + gallery rendering + lightbox logic
├── img/                 # Profile photos, project thumbnails
└── certificates/         # Certificate image files + resume PDF
```

## Running locally

No build tools or dependencies required. Either:

- Open `index.html` directly in a browser, or
- Serve it locally for accurate relative-path behavior:

```bash
# Python
python -m http.server 8000

# Node
npx serve .
```

Then visit `http://localhost:8000`.

## Editing content

- **Certificates** — add or edit entries in the `certs` array at the top of `certificates.js`. Each entry needs `issuer`, `title`, `date`, `tag`, `tagClass`, and `image`.
- **Portfolio projects** — edit the `.portfolio-card` articles in `index.html` (`data-title`, `data-summary`, `data-description`, `data-link`, and thumbnail `img`).
- **Skills** — edit the `.skills__list` spans inside the Skills section.
- **Colors/theme** — tweak the color values in `style.css` (accent colors currently: `#c0c1ff`, `#ffb783`, `#4cd7f6`).

## Known issues / to do

- Fix "ANTROPIC" → "Anthropic" typo in the Claude Code certificate entry (`certificates.js`)
- Resume link uses a Windows-style backslash path (`certificates\Rajavarman_G_Resume.pdf`) — should be `certificates/Rajavarman_G_Resume.pdf`
- One project thumbnail path also uses a backslash (`img\work4.jpg`) — should be `img/work4.jpg`
- Footer social links (LinkedIn/GitHub/Twitter) currently point to `#` instead of real profile URLs
- Skills section could be expanded to reflect the full stack (e.g. LangChain, Groq AI integration)

## License

Personal project — all rights reserved unless noted otherwise.
