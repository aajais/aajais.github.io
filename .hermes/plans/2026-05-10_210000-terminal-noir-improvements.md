# Terminal Noir — Improvement Audit & Plan

**Goal**: Take the Terminal Noir portfolio from "good prototype" to "production-polished" by fixing structural, visual, SEO, and accessibility gaps.

---

## CATEGORY 1: VISUAL GAPS (the site feels text-heavy)

### 1.1 Project cards need screenshots/thumbnails
Right now every project card is pure text — no visual differentiation. The repo already has images:
- `images/covid.png` → COVID-19 Detection, 3D Brain Tumor Segmentation
- `images/rag.png` → RAG Code Assistant
- `images/tfrs.png` → Multi-Lingual RecSys
- `images/prometheus.png` → Cloud-Native Observability Stack

**Fix**: Add a thumbnail strip or small image to each project card. In the Terminal Noir aesthetic, these should be displayed with a subtle border and maybe a slight desaturation/green tint filter (like a terminal screenshot). Not all projects have images — that's fine, the ones that do should show them.

### 1.2 Company logos in Trusted By section
Currently just plain text names ("Google", "Snap Inc"). Actual logos would be much more impactful — even in grayscale/monochrome to match the aesthetic. Logo bars are one of the highest-signal sections on any portfolio.

**Fix**: Either source monochrome SVG logos (most companies provide press kits) or use a CSS filter (grayscale + brightness) on colored logos. Text fallback for companies without logos is fine.

### 1.3 Beyond Code needs visual content
The Photography card literally talks about photography but shows zero photos. The Guitar card has no image either.

**Fix**: Add 1-2 photography samples (pull from @all_bout_aj Instagram or ask user for favorites). For guitar, even a subtle background texture or instrument icon would help. Photography section especially should be image-forward — it's the whole point.

### 1.4 Education cards could use university logos
The repo has `images/manipal.png` and `images/indiana-university-logo.png`.

**Fix**: Small logo beside each education entry. Adds visual recognition.

### 1.5 Journey timeline — company logos
The repo has `images/trell.png` and `images/airtel.png`. CoreWeave, W&B, Spotle.ai logos should be sourced too.

**Fix**: Small company logo/icon next to each timeline entry. Even 24x24 monochrome icons add visual rhythm to the timeline.

### 1.6 No favicon
The site has no favicon configured. This means browser tabs show a generic icon.

**Fix**: Generate a simple favicon — "AJ" in IBM Plex Mono on black background with orange text, matching the nav logo. Need favicon.ico + apple-touch-icon.png + manifest for PWA.

### 1.7 OG image missing (placeholder URL)
The og:image meta tag points to `https://aajais.github.io/og-image.png` which doesn't exist.

**Fix**: Create an actual OG image (1200x630px) — the Terminal Noir aesthetic with "AAYUSH JAISWAL / AI Solutions Engineer / CoreWeave" in IBM Plex Mono on black. This is what shows when the link is shared on LinkedIn, Slack, Twitter, etc.

---

## CATEGORY 2: HEADING & SEMANTIC STRUCTURE

### 2.1 Missing H2 section headings
The page jumps from H1 → H3/H4 with no H2s. Every section (Journey, Skills, Projects, etc.) should have an H2 heading. The `section-label` divs are styled like section headers but are just plain divs — screen readers and SEO crawlers skip them.

**Fix**: Add proper H2 elements for each section. The monospace section labels ("02 // JOURNEY") can remain as decorative eyebrows above the H2.

### 2.2 Skills specialties use H4 without parent H2/H3
Deep Learning, NLP & LLMs etc. are H4 but there's no H2 or H3 above them in the skills section.

**Fix**: Add "Skills" as H2, "Specialties" as H3, then specialties as H4 (or just H3).

---

## CATEGORY 3: ACCESSIBILITY

### 3.1 No skip-to-content link
Users navigating with keyboard have to tab through the entire nav before reaching content.

**Fix**: Add a visually-hidden "Skip to content" link as the first focusable element.

### 3.2 No prefers-reduced-motion support
The particle canvas, marquee, and pulse animations run unconditionally. Users with vestibular disorders or motion sensitivity get no relief.

**Fix**: Add `@media (prefers-reduced-motion: reduce)` — pause the canvas, stop the marquee scroll, disable the pulse animation.

### 3.3 Timeline items lack ARIA
The expandable timeline items are just divs with onclick. Screen readers don't know they're expandable.

**Fix**: Add `role="button"`, `tabindex="0"`, `aria-expanded="false/true"`, and keyboard Enter/Space handlers.

### 3.4 Chat widget accessibility
The chat panel has no aria-live region for new messages, no focus trap when open.

**Fix**: Add `aria-live="polite"` to chat messages container, trap focus when panel is open, add Escape to close.

### 3.5 Images should have loading="lazy"
Only 1 image right now, but as more are added (project screenshots, photos), they should all be lazy-loaded.

**Fix**: Add `loading="lazy"` to all images below the fold.

---

## CATEGORY 4: SEO & PERFORMANCE

### 4.1 No analytics
Zero visibility into who visits, which sections they read, where they drop off.

**Fix**: Add Plausible Analytics (privacy-respecting, no cookies, GDPR-compliant, lightweight 1KB script). Or Google Analytics 4 if you prefer.

### 4.2 Font Awesome is heavy
Loading the entire Font Awesome library (6.5.1) for ~15 icons. That's ~300KB of CSS + fonts for a handful of icons.

**Fix**: Either switch to inline SVG icons (copy just the 15 paths you need) or use Font Awesome's subsetting/kit feature. This would significantly improve First Contentful Paint.

### 4.3 Two Google Font families loaded
IBM Plex Mono (4 weights) + Inter (4 weights) = 8 font files.

**Fix**: Consider using `font-display: swap` (already in the URL via `display=swap` ✓), but also preload the most critical weight (IBM Plex Mono 700 for headings). Add `<link rel="preload" as="font">` for the primary font file.

### 4.4 No critical CSS inlining
The entire CSS is in one `<style>` block (good — no external CSS file), but the canvas JS blocks rendering.

**Fix**: Move the particle canvas script to defer or load it after DOMContentLoaded. The hero text should render before the particles appear.

### 4.5 Canvas performance on mobile
60 particles with connection-line calculations every frame could drain battery on mobile.

**Fix**: Reduce particles to 30 on mobile (check window.innerWidth), or disable canvas entirely on screens < 768px.

---

## CATEGORY 5: CONTENT & UX PRINCIPLES

### 5.1 Section ordering
Current order: Trusted By → Education → Journey → Skills → Projects → Papers → Writing → Beyond → Resume → Contact

**Better order based on portfolio best practices** (lead with impact, end with call-to-action):
1. Hero (current ✓)
2. Trusted By (current ✓ — social proof first)
3. **Journey** (move up — your career story is your strongest asset)
4. **Projects** (move up — show don't tell)
5. **Papers** (research credibility)
6. **Skills** (move down — skills are boring unless contextualized by projects/journey first)
7. Education (move down — least interesting for someone at your career level)
8. Writing
9. Beyond Code
10. Resume
11. Contact

The marquee can stay between Trusted By and Journey.

### 5.2 No section descriptions/intros
Most sections jump straight into content with no contextual intro. The old site had great one-liners:
- "Things I built that I'm proud of."
- "My toolkit. I actually use all of these."
- "Because sometimes 500 words beats 500 lines of code."
- "The things that keep me human (and sane)."

**Fix**: Add a 1-line subtitle after each section label in muted text.

### 5.3 No "back to top" affordance
On a 13K+ pixel page, there's no way to get back to the top quickly.

**Fix**: Add a subtle "↑" button that appears after scrolling past the hero, or make the nav logo ("AJ_") scroll to top on click.

### 5.4 Resume section is too minimal
Just a download button. The old site showed the filename and "Updated April 2026".

**Fix**: Show filename, date, page count. Maybe a terminal-styled file listing: `$ ls -la AAYUSH_JAISWAL_RESUME.pdf  117K  Apr 2026`

---

## CATEGORY 6: MISSING ASSETS TO CREATE

| Asset | Purpose | Specs |
|-------|---------|-------|
| favicon.ico | Browser tab icon | 32x32, "AJ" in mono on black |
| apple-touch-icon.png | iOS home screen | 180x180 |
| og-image.png | Social sharing preview | 1200x630, Terminal Noir styled |
| favicon-16x16.png | Small favicon | 16x16 |
| site.webmanifest | PWA manifest | JSON file |

---

## IMPLEMENTATION PRIORITY

### Must-fix (do now):
1. Add H2 headings to all sections (SEO/accessibility)
2. Add project thumbnails from existing images
3. Create favicon + OG image
4. Add section subtitles/intros
5. Add prefers-reduced-motion support
6. Fix canvas performance on mobile
7. Reorder sections (Journey before Skills)
8. Add skip-to-content link
9. ARIA on timeline items

### Should-fix (next iteration):
10. Company logos in Trusted By (need to source SVGs)
11. University logos in Education
12. Company logos in Journey timeline
13. Photography images in Beyond Code
14. Replace Font Awesome with inline SVGs
15. Add analytics (Plausible)
16. Back-to-top button
17. Enhance resume section

### Nice-to-have:
18. Focus trap in chat widget
19. Font preloading
20. PWA manifest
21. 404.html page

---

## Files to change
- `index.html` — all HTML/CSS/JS changes
- `images/og-image.png` — new (generate)
- `images/favicon.ico` — new (generate)
- `images/apple-touch-icon.png` — new (generate)
- `site.webmanifest` — new
- `404.html` — new (optional)
