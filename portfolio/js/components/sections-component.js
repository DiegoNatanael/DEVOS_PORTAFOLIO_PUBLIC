class SectionsComponent extends Component {
    mount() {
        this._initOdometer();
        this._initDossierReveal();
        this._initPlaneExit();
        this._initDataBackground();
    }

    _initDataBackground() {
        const section = document.getElementById('metricSection');
        if (!section) return;

        // Spawn a packet every 800ms
        setInterval(() => {
            if (ScrollTrigger.isInViewport(section)) {
                this._createDataPacket(section);
            }
        }, 800);
    }

    _createDataPacket(container) {
        const packet = document.createElement('div');
        packet.className = 'data-packet';
        const x = Math.random() * 100;
        packet.style.left = `${x}%`;
        packet.style.top = `-50px`;
        container.appendChild(packet);

        gsap.to(packet, {
            y: container.offsetHeight + 100,
            duration: 3 + Math.random() * 4,
            ease: 'none',
            opacity: Math.random() * 0.5,
            onComplete: () => packet.remove()
        });
    }

    _initOdometer() {
        const big = document.getElementById('odoBig');
        const before = document.getElementById('odoBefore');
        const after = document.getElementById('odoAfter');

        if (!big || !before || !after) return;

        let triggered = false;

        ScrollTrigger.create({
            trigger: '#metricSection',
            start: 'top 80%',
            onEnter: () => {
                if (triggered) return;
                triggered = true;

                // Animate all three metrics
                this._runOdometer(big, 0, 99, 2500);
                this._runOdometer(before, 0, 180, 2500);
                this._runOdometer(after, 0, 1, 2500);
            }
        });
    }

    _runOdometer(el, from, to, duration) {
        const terminalChars = '0123456789%#!?';
        const finalStr = to.toString();
        const start = performance.now();
        const section = document.getElementById('metricSection');

        const tick = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4); // Quartic ease out

            if (progress < 0.95) {
                // Chaotic scrambling phase
                // Use the length of the final string or current count
                const currentLen = Math.max(finalStr.length, Math.floor(progress * 5));
                let scramble = '';
                for (let i = 0; i < currentLen; i++) {
                    scramble += terminalChars[Math.floor(Math.random() * terminalChars.length)];
                }
                el.textContent = scramble;
                el.style.opacity = Math.random() > 0.3 ? 1 : 0.4; // Glitchy flicker
            } else {
                // Settlement phase
                el.textContent = finalStr;
                el.style.opacity = 1;
            }

            if (progress === 1 && el.id === 'odoBig') {
                // Flash white on the big one's completion
                gsap.to(section, {
                    backgroundColor: '#fafafa',
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(section, { backgroundColor: '#0a0a0a', duration: 0.6 });
                        this._playIndustrialClick();
                    }
                });
            }

            if (progress < 1) requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }

    _playIndustrialClick() {
        // Concept: Aesthetic haptic feedback (visual or auditory if requested, here visual)
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed; inset: 0; background: white; 
            z-index: 1000; pointer-events: none; opacity: 0;
        `;
        document.body.appendChild(flash);
        gsap.to(flash, { opacity: 0.2, duration: 0.05, yoyo: true, repeat: 1, onComplete: () => flash.remove() });
    }

    // ── 2. DOSSIER CARDS — staggered reveal on scroll ─────────────────
    _initDossierReveal() {
        const cards = document.querySelectorAll('.dossier-card');
        if (!cards.length) return;

        cards.forEach((card, i) => {
            gsap.from(card, {
                y: 60,
                opacity: 0,
                duration: 0.9,
                ease: 'power3.out',
                delay: (i % 2) * 0.15,
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            });
        });
    }

    // ── 3. PLANE EXIT — flies into the email and becomes a cursor ─────
    // ── 3. PLANE EXIT ────────────────────────────────────────────────
    _initPlaneExit() {
        const planeCard = document.getElementById('timelineCard');
        const emailLink = document.getElementById('contactEmail');
        if (!planeCard || !emailLink) return;

        ScrollTrigger.create({
            trigger: '#contactSection',
            start: 'top 60%',
            onEnter: () => {
                const rect = emailLink.getBoundingClientRect();
                const targetX = rect.left + rect.width * 0.5;
                const targetY = rect.top + rect.height * 0.5;

                gsap.to(planeCard, {
                    duration: 1.2,
                    ease: 'power4.in',
                    x: targetX - window.innerWidth * 0.5,
                    y: targetY - window.innerHeight * 0.5,
                    scale: 0.15,
                    rotation: 45,
                    opacity: 0,
                    onComplete: () => {
                        emailLink.classList.add('plane-landed');
                    }
                });
            },
            onLeaveBack: () => {
                // Reset plane when scrolling back up
                gsap.to(planeCard, {
                    duration: 0.8,
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    y: 0,
                    ease: 'power2.out',
                    onStart: () => {
                        emailLink.classList.remove('plane-landed');
                    }
                });
            }
        });
    }
}
