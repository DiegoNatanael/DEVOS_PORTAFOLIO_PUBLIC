class AboutComponent extends Component {
    mount() {
        const card = this.element.querySelector('#aboutCard');
        if (!card) return;

        // Mouse tilt effect
        if (!prefersReducedMotion) {
            this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
            this.element.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
        }

        this.scrollProgress = 0;

        // Scroll grow effect
        this.addTrigger(ScrollTrigger.create({
            trigger: this.element.parentElement,
            start: 'top top',
            end: '+=150%',
            scrub: 1.2,
            pin: true,
            anticipatePin: 1,
            onUpdate: (self) => {
                const isMobile = window.innerWidth <= 768;
                this.scrollProgress = self.progress;
                const progress = self.progress;

                // Responsive sizing
                const startWidth = isMobile ? 90 : 42;
                const startHeight = isMobile ? 75 : 60;

                const currentWidth = startWidth + progress * (100 - startWidth);
                const currentHeight = startHeight + progress * (100 - startHeight);

                gsap.set(card, {
                    width: `${currentWidth}vw`,
                    maxWidth: isMobile ? '100vw' : `${420 + progress * (window.innerWidth - 420)}px`,
                    height: `${currentHeight}vh`,
                    minHeight: isMobile ? '450px' : 'auto', // Ensure it doesn't get too short on mobile
                    borderRadius: `${12 * (1 - progress)}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                });
            }
        }));
    }

    handleMouseMove(e) {
        const card = this.element.querySelector('#aboutCard');
        const rect = card.getBoundingClientRect();

        // Intensity decreases as scrollProgress increases. At 1.0, intensity is 0.
        const intensity = 1 - this.scrollProgress;

        const mx = ((e.clientX - rect.left - rect.width / 2) / 25) * intensity;
        const my = ((e.clientY - rect.top - rect.height / 2) / 25) * intensity;

        gsap.to(card, {
            x: mx, y: my, rotateY: mx * 0.4, rotateX: -my * 0.4,
            duration: 0.5, ease: 'power2.out', overwrite: 'auto'
        });
    }

    handleMouseLeave() {
        const card = this.element.querySelector('#aboutCard');
        gsap.to(card, {
            x: 0, y: 0, rotateY: 0, rotateX: 0,
            duration: 0.8, ease: 'elastic.out(1, 0.5)', overwrite: 'auto'
        });
    }
}
