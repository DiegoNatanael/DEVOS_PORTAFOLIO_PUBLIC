class HeroComponent extends Component {
    mount() {
        if (prefersReducedMotion) return;
        
        const heroName = this.element.querySelector('.hero-name');
        const fadeOverlay = this.element.querySelector('.hero-fade-overlay');
        
        // Scroll shrink effect
        this.addTrigger(ScrollTrigger.create({
            trigger: this.element,
            start: 'top top',
            end: 'bottom top',
            scrub: 1.2,
            onUpdate: (self) => {
                const progress = self.progress;
                gsap.set(heroName, {
                    scale: 1 - progress * 0.88,
                    y: -window.innerHeight * 0.38 * progress,
                    opacity: 1 - progress * 0.7
                });
            }
        }));

        // Fade overlay
        if (fadeOverlay) {
            this.addTrigger(ScrollTrigger.create({
                trigger: this.element,
                start: '60% top',
                end: 'bottom top',
                scrub: 1,
                onUpdate: (self) => {
                    fadeOverlay.style.height = `${self.progress * 100}%`;
                }
            }));
        }

        // Entrance animations
        gsap.from(heroName, { opacity: 0, scale: 0.85, duration: 1.2, ease: 'power3.out', delay: 0.2 });
        gsap.from('.hero-nav', { opacity: 0, y: -15, duration: 0.7, stagger: 0.08, delay: 0.6, ease: 'power2.out' });
        gsap.from('.hero-role', { opacity: 0, y: 15, duration: 0.7, delay: 0.9, ease: 'power2.out' });
    }
}
