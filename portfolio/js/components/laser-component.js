class LaserComponent extends Component {
    mount() {
        this.section = this.element;
        this.canvas = this.section.querySelector('#laserCanvas');
        this.beamEl = this.section.querySelector('#laserBeam');

        if (!this.canvas || !this.beamEl) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.particles = [];
        this.shockwaves = [];
        this.isAnimating = false;

        this.animate();
        this.initScrollTrigger();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    animate() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, w, h);

        // Draw Shockwaves
        this.shockwaves.forEach((wave, i) => {
            const p = wave.progress;
            const radius = 800 * p;
            const opacity = 1 - p;

            this.ctx.strokeStyle = `rgba(0, 255, 204, ${opacity})`;
            this.ctx.lineWidth = 2 + (1 - p) * 10;
            this.ctx.beginPath();
            this.ctx.arc(w / 2, h / 2, radius, 0, Math.PI * 2);
            this.ctx.stroke();

            wave.progress += 0.02;
            if (wave.progress > 1) this.shockwaves.splice(i, 1);
        });

        // Draw Particles
        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                return;
            }

            this.ctx.fillStyle = `rgba(0, 255, 204, ${p.life})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }

    triggerDischarge() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // 1. Chromatic Aberration Surge
        document.body.classList.add('power-surge');
        window.dispatchEvent(new CustomEvent('laser-impact'));
        setTimeout(() => document.body.classList.remove('power-surge'), 500);


        // 2. Beam Animation (Intense Flash)
        gsap.fromTo(this.beamEl,
            { scaleX: 0, opacity: 1, filter: 'blur(0px) brightness(1)' },
            {
                scaleX: 1,
                duration: 0.1,
                ease: 'power4.out',
                onComplete: () => {
                    this.shockwaves.push({ progress: 0 });
                    this.createParticles(window.innerWidth / 2, window.innerHeight / 2);

                    gsap.to(this.beamEl, {
                        opacity: 0,
                        scaleX: 2,
                        filter: 'blur(20px) brightness(2)',
                        duration: 0.5,
                        ease: 'power2.in'
                    });
                }
            }
        );
    }

    createParticles(x, y) {
        for (let i = 0; i < 50; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 8;
            this.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1 + Math.random() * 3,
                life: 1,
                decay: 0.02 + Math.random() * 0.03
            });
        }
    }

    initScrollTrigger() {
        ScrollTrigger.create({
            trigger: this.section,
            start: 'top center',
            onEnter: () => this.triggerDischarge()
        });
    }
}
