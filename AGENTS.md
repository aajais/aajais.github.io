# AGENTS.md

## Overview
Static personal portfolio for Aayush Jaiswal, published with GitHub Pages from `main`. There is no build step or package manager.

## Files
- `index.html`: homepage content, navigation, case studies, career history, talks, research, skills, writing, resume, and contact; Person JSON-LD is in the head.
- `about.html`: readable biography with a small page-specific style block.
- `styles.css`: shared styling, responsive grids, image framing, and reduced-motion rules. The active site uses a dark theme; there is no light/dark toggle.
- `background.js`: shared full-viewport interactive particle background on homepage and About; pauses in hidden tabs and respects reduced motion.
- `site.js`: terminal typing, navigation, photo crossfades, scroll progress, and a deterministic profile FAQ. FAQ answers read visible page content rather than maintaining separate career facts.
- `images/`: original event photos, official event artwork, and project diagrams. SVG diagrams are illustrations, not product screenshots.
- `AAYUSH_JAISWAL_RESUME.pdf`: deployed resume download.
- `docs/CONTENT.md`: source references and publishing checklist.

## Local preview
Run `python3 -m http.server 8000` and open `http://localhost:8000`.

## Verification
Run `node --check site.js` and `git diff --check`. Check local asset/anchor targets and inspect homepage/About at 390px and desktop widths. Verify menu close/Escape behavior, no horizontal page overflow, wrapped tags, and no console errors.
Photo galleries autoplay with crossfades, without visible arrow/pause buttons. They pause when offscreen, in a hidden tab, hovered, keyboard-focused, or when reduced motion is requested. Keyboard arrow navigation remains available. Never reintroduce duplicate cloned cards.

## Content and deployment
Use the approved resume and current LinkedIn/public artifacts as sources. Do not invent metrics, citations, job dates, publication status, adoption counts, or customer endorsements. Keep source context in `docs/CONTENT.md`. Update sitemap dates with substantive content changes.
Pushes to `main` deploy automatically. Stage only relevant changes; local `output/`, `tmp/`, and unrelated untracked files are not deployment inputs.
