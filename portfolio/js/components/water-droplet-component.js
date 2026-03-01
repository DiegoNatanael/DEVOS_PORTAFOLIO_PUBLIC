class LaserComponent extends Component {
    mount() {
        this.canvas = this.element.querySelector('#laserCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.beamWrapper = this.element.querySelector('.beam-wrapper');
        
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        this.addTrigger(ScrollTrigger.create({
            trigger: this.element,
            start: 'top top',
            end: '+=200%',
            scrub: 1.2,
            pin: true,
            onUpdate: (self) => this.updateAnimation(self.progress)
        }));
    }

    updateAnimation(p) {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // 1. Draw Background (Static for now, maybe noise later)
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, w, h);

        // 2. Laser Logic
        // Phase 1: Charge (0 -> 0.3)
        // Phase 2: Fire (0.3 -> 0.6)
        // Phase 3: Impact (0.6 -> 1.0)

        if (p < 0.6) {
            // Growing the beam
            const beamProgress = Math.min(1, p / 0.5);
            gsap.set(this.beamWrapper, { height: `${beamProgress * 150}%`, top: '0' }); 
            // Shoots from top down
        } else {
            // Impact Explosion
            gsap.set(this.beamWrapper, { opacity: 0 });
            const impactP = (p - 0.6) / 0.4;
            
            // Draw shockwave
            ctx.strokeStyle = `rgba(0, 255, 204, ${1 - impactP})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(w/2, h/2, impactP * Math.max(w, h), 0, Math.PI * 2);
            ctx.stroke();
        }
    }
}