'use strict';

/* =============================================
   MODULE 1: LOADING SCREEN
   ============================================= */
function initLoadingScreen() {
    const screen = document.getElementById('loading-screen');
    if (!screen) return;

    screen.addEventListener('animationend', function handler() {
        screen.classList.add('hidden');
        screen.removeEventListener('animationend', handler);
        setTimeout(() => { if (screen.parentNode) screen.parentNode.removeChild(screen); }, 200);
    });
}


/* =============================================
   MODULE 2: WEBGL NEURAL NETWORK (Three.js r134)
   ============================================= */
function initNeuralNetwork() {
    if (window.innerWidth < 769) return;
    if (typeof THREE === 'undefined') return;

    const canvas = document.getElementById('neural-canvas');
    if (!canvas) return;

    const aboutSection = canvas.parentElement;
    const w = aboutSection.clientWidth;
    const h = aboutSection.clientHeight;

    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);

    function getColors() {
        const dark = document.documentElement.getAttribute('data-theme') === 'dark';
        return {
            node:        dark ? 0x60a5fa : 0x3498db,
            edge:        dark ? 0x4a6fa5 : 0xb8d4f0,
            nodeOpacity: dark ? 0.85     : 0.7,
            edgeOpacity: dark ? 0.35     : 0.25,
        };
    }

    const NODE_COUNT  = 55;
    const EDGE_THRESH = 2.3;
    const MAX_EDGES   = 180;

    const nodeObjects   = [];
    const nodeVelocities = [];
    let colors = getColors();

    const nodeGeo = new THREE.SphereGeometry(0.045, 8, 8);

    for (let i = 0; i < NODE_COUNT; i++) {
        const mat = new THREE.MeshBasicMaterial({
            color: colors.node,
            transparent: true,
            opacity: colors.nodeOpacity,
        });
        const mesh = new THREE.Mesh(nodeGeo, mat);
        mesh.position.set(
            (Math.random() - 0.5) * 11,
            (Math.random() - 0.5) * 6.5,
            (Math.random() - 0.5) * 1.5
        );
        nodeVelocities.push(new THREE.Vector3(
            (Math.random() - 0.5) * 0.0018,
            (Math.random() - 0.5) * 0.0018,
            0
        ));
        scene.add(mesh);
        nodeObjects.push(mesh);
    }

    const edgePosArray = new Float32Array(MAX_EDGES * 2 * 3);
    const edgeGeo      = new THREE.BufferGeometry();
    edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePosArray, 3));
    const edgeMat = new THREE.LineBasicMaterial({
        color: colors.edge,
        transparent: true,
        opacity: colors.edgeOpacity,
    });
    const lines = new THREE.LineSegments(edgeGeo, edgeMat);
    scene.add(lines);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Theme-aware color update
    new MutationObserver(() => {
        colors = getColors();
        nodeObjects.forEach(n => {
            n.material.color.setHex(colors.node);
            n.material.opacity = colors.nodeOpacity;
        });
        edgeMat.color.setHex(colors.edge);
        edgeMat.opacity = colors.edgeOpacity;
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // Resize
    window.addEventListener('resize', () => {
        if (window.innerWidth < 769) { renderer.setSize(0, 0); return; }
        const aw = aboutSection.clientWidth;
        const ah = aboutSection.clientHeight;
        camera.aspect = aw / ah;
        camera.updateProjectionMatrix();
        renderer.setSize(aw, ah);
    });

    // Animation loop
    let edgeCount = 0;
    (function animate() {
        requestAnimationFrame(animate);

        camera.position.x += (mouseX * 0.35 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.22 - camera.position.y) * 0.04;
        camera.lookAt(scene.position);

        for (let i = 0; i < NODE_COUNT; i++) {
            const n = nodeObjects[i], v = nodeVelocities[i];
            n.position.add(v);
            if (Math.abs(n.position.x) > 5.5) v.x *= -1;
            if (Math.abs(n.position.y) > 3.25) v.y *= -1;
        }

        edgeCount = 0;
        for (let i = 0; i < NODE_COUNT && edgeCount < MAX_EDGES; i++) {
            for (let j = i + 1; j < NODE_COUNT && edgeCount < MAX_EDGES; j++) {
                if (nodeObjects[i].position.distanceTo(nodeObjects[j].position) < EDGE_THRESH) {
                    const b  = edgeCount * 6;
                    const p1 = nodeObjects[i].position;
                    const p2 = nodeObjects[j].position;
                    edgePosArray[b]   = p1.x; edgePosArray[b+1] = p1.y; edgePosArray[b+2] = p1.z;
                    edgePosArray[b+3] = p2.x; edgePosArray[b+4] = p2.y; edgePosArray[b+5] = p2.z;
                    edgeCount++;
                }
            }
        }

        edgeGeo.attributes.position.needsUpdate = true;
        edgeGeo.setDrawRange(0, edgeCount * 2);
        renderer.render(scene, camera);
    })();
}


/* =============================================
   MODULE 3: AURORA SPOTLIGHT MOUSE FOLLOW
   ============================================= */
function initSpotlight() {
    const aboutSection = document.getElementById('about');
    const spotlight    = aboutSection ? aboutSection.querySelector('.spotlight') : null;
    if (!spotlight) return;

    aboutSection.addEventListener('mousemove', (e) => {
        const rect = aboutSection.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width  * 100).toFixed(2) + '%';
        const y = ((e.clientY - rect.top)  / rect.height * 100).toFixed(2) + '%';
        spotlight.style.setProperty('--mx', x);
        spotlight.style.setProperty('--my', y);
        spotlight.classList.add('active');
    });

    aboutSection.addEventListener('mouseleave', () => {
        spotlight.classList.remove('active');
    });
}


/* =============================================
   MODULE 4: DOT PATTERN BACKGROUNDS
   ============================================= */
function initDotPatterns() {
    const sections = ['skills', 'timeline'];
    sections.forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;

        const ns  = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(ns, 'svg');
        svg.setAttribute('aria-hidden', 'true');
        svg.classList.add('dot-pattern-svg');

        const patId = 'dot-pattern-' + id;
        const defs  = document.createElementNS(ns, 'defs');
        const pat   = document.createElementNS(ns, 'pattern');
        pat.setAttribute('id', patId);
        pat.setAttribute('x', '0');
        pat.setAttribute('y', '0');
        pat.setAttribute('width', '20');
        pat.setAttribute('height', '20');
        pat.setAttribute('patternUnits', 'userSpaceOnUse');

        const circle = document.createElementNS(ns, 'circle');
        circle.setAttribute('cx', '1.5');
        circle.setAttribute('cy', '1.5');
        circle.setAttribute('r', '1.5');
        circle.setAttribute('fill', 'currentColor');
        pat.appendChild(circle);
        defs.appendChild(pat);
        svg.appendChild(defs);

        const rect = document.createElementNS(ns, 'rect');
        rect.setAttribute('width', '100%');
        rect.setAttribute('height', '100%');
        rect.setAttribute('fill', `url(#${patId})`);
        svg.appendChild(rect);

        section.insertBefore(svg, section.firstChild);
    });
}


/* =============================================
   MODULE 5: SCROLL ANIMATIONS
   Uses IntersectionObserver + CSS transitions (reliable everywhere).
   GSAP kept only for the section title word-reveal effect.
   ============================================= */
function initScrollAnimations() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    // --- 5a. CSS + IntersectionObserver for all cards/badges ---

    function addAnim(selector, cssClass, delayStep) {
        document.querySelectorAll(selector).forEach((el, i) => {
            el.classList.add(cssClass);
            if (delayStep) el.style.transitionDelay = (i * delayStep).toFixed(2) + 's';
        });
    }

    addAnim('.project-card',   'anim-fade-up',   0.07);
    addAnim('.paper-card',     'anim-fade-up',   0.09);
    addAnim('.writing-card',   'anim-fade-up',   0.12);
    addAnim('.beyond-card',    'anim-fade-up',   0.12);
    addAnim('.specialty-card', 'anim-fade-up',   0.07);
    addAnim('.education-card', 'anim-fade-up',   0.09);
    addAnim('.skill-badge',    'anim-scale-up',  0.03);

    document.querySelectorAll('.timeline-item').forEach((item) => {
        const content = item.querySelector('.timeline-content');
        const dot     = item.querySelector('.timeline-dot');
        if (content) content.classList.add(item.classList.contains('right') ? 'anim-slide-right' : 'anim-slide-left');
        if (dot)     { dot.classList.add('anim-scale-up'); dot.style.transitionDelay = '0.15s'; }
    });

    const ioEntries = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');
            ioEntries.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
        '.anim-fade-up, .anim-scale-up, .anim-slide-left, .anim-slide-right'
    ).forEach(el => ioEntries.observe(el));

    // --- 5b. Section title word-reveal (GSAP) ---
    if (typeof gsap === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Exclude .gradient-name — it has its own CSS animation and must stay visible
    document.querySelectorAll('section h2:not(.gradient-name)').forEach(title => {
        const words = title.textContent.trim().split(/\s+/);
        title.innerHTML = words.map(w =>
            `<span class="word-span">${w}</span>`
        ).join(' ');

        gsap.fromTo(
            title.querySelectorAll('.word-span'),
            { opacity: 0, filter: 'blur(8px)', y: 12 },
            {
                opacity: 1, filter: 'blur(0px)', y: 0,
                duration: 0.65, ease: 'power2.out', stagger: 0.1,
                scrollTrigger: { trigger: title, start: 'top 92%', toggleActions: 'play none none none' },
            }
        );
    });
}


/* =============================================
   MODULE 6: ANIMATED COUNTERS
   ============================================= */
function initCounters() {
    const counters = document.querySelectorAll('.counter-number');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            observer.unobserve(entry.target);

            const el       = entry.target;
            const target   = parseFloat(el.dataset.target);
            const suffix   = el.dataset.suffix || '';
            const decimals = parseInt(el.dataset.decimals) || 0;
            const duration = 1800;
            const start    = performance.now();

            function tick(now) {
                const elapsed  = now - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased    = 1 - Math.pow(1 - progress, 3);
                const value    = target * eased;
                el.textContent = value.toFixed(decimals) + suffix;
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = target.toFixed(decimals) + suffix;
            }

            requestAnimationFrame(tick);
        });
    }, { threshold: 0.6, rootMargin: '0px 0px -30px 0px' });

    counters.forEach(c => observer.observe(c));
}


/* =============================================
   MODULE 7: 3D TILT CARDS
   ============================================= */
function initTiltCards() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('.project-card, .paper-card').forEach(card => {
        const glint = document.createElement('div');
        glint.classList.add('card-glint');
        card.appendChild(glint);

        let rafId    = null;
        let targetX  = 0, targetY  = 0;
        let currentX = 0, currentY = 0;

        function lerp(a, b, t) { return a + (b - a) * t; }

        function loop() {
            currentX = lerp(currentX, targetX, 0.11);
            currentY = lerp(currentY, targetY, 0.11);

            card.style.transform =
                `perspective(1000px) rotateX(${currentX}deg) rotateY(${currentY}deg) translateZ(6px)`;

            const done = Math.abs(currentX - targetX) < 0.01 && Math.abs(currentY - targetY) < 0.01;
            if (done) {
                card.style.transform = targetX === 0
                    ? ''
                    : `perspective(1000px) rotateX(${targetX}deg) rotateY(${targetY}deg) translateZ(6px)`;
                rafId = null;
                return;
            }
            rafId = requestAnimationFrame(loop);
        }

        card.addEventListener('mousemove', (e) => {
            const r  = card.getBoundingClientRect();
            const cx = (e.clientX - r.left) / r.width  * 2 - 1;
            const cy = (e.clientY - r.top)  / r.height * 2 - 1;
            targetX  = -cy * 9;
            targetY  =  cx * 9;

            const px = ((e.clientX - r.left) / r.width  * 100).toFixed(1) + '%';
            const py = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
            glint.style.setProperty('--mx', px);
            glint.style.setProperty('--my', py);

            if (!rafId) loop();
        });

        card.addEventListener('mouseleave', () => {
            targetX = 0;
            targetY = 0;
            if (!rafId) loop();
        });
    });
}


/* =============================================
   MODULE 8: CUSTOM CURSOR
   ============================================= */
function initCustomCursor() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot  = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    if (!dot || !ring) return;

    let targetX = -100, targetY = -100;
    let ringX   = -100, ringY   = -100;
    let visible = false;

    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        dot.style.left = targetX + 'px';
        dot.style.top  = targetY + 'px';
        if (!visible) {
            dot.style.opacity  = '1';
            ring.style.opacity = '0.5';
            visible = true;
        }
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity  = '0';
        ring.style.opacity = '0';
        visible = false;
    });

    (function animateRing() {
        ringX += (targetX - ringX) * 0.11;
        ringY += (targetY - ringY) * 0.11;
        ring.style.left = ringX + 'px';
        ring.style.top  = ringY + 'px';
        requestAnimationFrame(animateRing);
    })();

    const interactors = 'a, button, .project-card, .paper-card, .writing-card, .skill-badge, .beyond-card, label, .social-link, .download-btn';
    document.querySelectorAll(interactors).forEach(el => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
}


/* =============================================
   MODULE 9: METEORS IN RESUME SECTION
   ============================================= */
function initMeteors() {
    const section = document.getElementById('resume');
    if (!section) return;

    const count = 14;
    for (let i = 0; i < count; i++) {
        const m = document.createElement('span');
        m.classList.add('meteor');
        m.setAttribute('aria-hidden', 'true');
        m.style.setProperty('--meteor-left',     Math.random() * 120 - 10 + '%');
        m.style.setProperty('--meteor-duration', (3 + Math.random() * 7).toFixed(1) + 's');
        m.style.setProperty('--meteor-delay',    (Math.random() * 10).toFixed(1) + 's');
        section.appendChild(m);
    }
}


/* =============================================
   MODULE 10: TYPING ANIMATION ON TITLE BADGE
   (inspired by magicui/typing-animation)
   ============================================= */
function initTypingAnimation() {
    const badge = document.getElementById('typing-badge');
    if (!badge) return;

    const text     = badge.textContent.trim();
    const speed    = 48;    // ms per character
    const startDelay = 2000; // wait for loading screen to clear

    badge.textContent = '';
    const cursor = document.createElement('span');
    cursor.classList.add('typing-cursor');
    badge.appendChild(cursor);

    setTimeout(() => {
        let i = 0;
        function typeChar() {
            if (i < text.length) {
                badge.insertBefore(document.createTextNode(text[i]), cursor);
                i++;
                setTimeout(typeChar, speed);
            } else {
                // Remove blinking cursor after a pause
                setTimeout(() => {
                    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
                }, 1400);
            }
        }
        typeChar();
    }, startDelay);
}


/* =============================================
   MODULE 11: MOBILE NAV TOGGLE
   ============================================= */
function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const navUl  = document.querySelector('nav ul');
    if (!toggle || !navUl) return;

    toggle.addEventListener('click', () => {
        const open = navUl.classList.toggle('active');
        toggle.setAttribute('aria-expanded', String(open));
    });

    // Close on any nav link click
    navUl.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navUl.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !navUl.contains(e.target)) {
            navUl.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}


/* =============================================
   MODULE 12: MAGNETIC SOCIAL LINKS
   ============================================= */
function initMagneticLinks() {
    if (!window.matchMedia('(pointer: fine)').matches) return;

    document.querySelectorAll('.social-link').forEach(el => {
        let rafId = null;
        let tx = 0, ty = 0, cx = 0, cy = 0;

        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width  / 2);
            const dy = e.clientY - (r.top  + r.height / 2);
            tx = dx * 0.35;
            ty = dy * 0.35;
            if (!rafId) loop();
        });

        el.addEventListener('mouseleave', () => {
            tx = 0;
            ty = 0;
            if (!rafId) loop();
        });

        function loop() {
            cx += (tx - cx) * 0.15;
            cy += (ty - cy) * 0.15;
            el.style.transform = `translate(${cx.toFixed(2)}px, ${cy.toFixed(2)}px)`;
            const done = Math.abs(cx - tx) < 0.05 && Math.abs(cy - ty) < 0.05;
            if (done) { rafId = null; return; }
            rafId = requestAnimationFrame(loop);
        }
    });
}


/* =============================================
   INITIALIZATION
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
    initLoadingScreen();
    initMobileNav();
    initCustomCursor();
    initCounters();
    initMeteors();
    initDotPatterns();
    initTypingAnimation();

    // Defer heavier inits to avoid blocking first paint
    requestAnimationFrame(() => {
        initNeuralNetwork();
        initSpotlight();
        initScrollAnimations();
        initMagneticLinks();

        // Tilt after GSAP has had time to set initial states
        setTimeout(initTiltCards, 600);
    });
});
