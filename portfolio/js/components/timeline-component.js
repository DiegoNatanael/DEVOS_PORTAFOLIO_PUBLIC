class TimelineComponent extends Component {
    constructor(selector) {
        super(selector);
        this.data = [
            { num: '01', title: 'Pradettisanti', role: 'IT Operations Intern', desc: 'Automating infrastructure and building internal tools.', year: '2024 – Present' },
            { num: '02', title: 'IT Operations', role: 'Infrastructure', desc: 'CPanel, DNS, Linux Shell, GSuite, API Integration.', year: 'Infrastructure' },
            { num: '03', title: 'Education', role: 'University', desc: 'B.S. Information Technology at Instituto Tecnológico de Aguascalientes.', year: 'Exp. 2027' },
            { num: '04', title: 'Team Leadership', role: 'Lead Developer', desc: 'Led 6 developers on Échame la Mano (LSM App).', year: '2024' },
            { num: '05', title: 'Tech Arsenal', role: 'Stack', desc: 'Python, React, Django, FastAPI, PyTorch, Docker, PostgreSQL.', year: 'Full Stack' },
            { num: '06', title: 'Certifications', role: 'Harvard CS50', desc: 'Computer Science fundamentals and Web Programming.', year: 'Verified' }
        ];
        this.landedSet = new Set();
        this.particles = [];
        this.shockwaves = [];
        this.lastSegIndex = -1;
    }

    mount() {
        this.card = this.element.querySelector('#timelineCard');
        this.planeWrapper = this.element.querySelector('.plane-wrapper');
        this.energyCore = this.element.querySelector('#energyCore');
        this.tlRiver = this.element.querySelector('.tl-river');

        // Text Elements
        this.titleEl = this.element.querySelector('#timelineTitle');
        this.roleEl = this.element.querySelector('#timelineRole');
        this.descEl = this.element.querySelector('#timelineDesc');
        this.yearEl = this.element.querySelector('#timelineYear');

        // FX Canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'timeline-fx-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.inset = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';
        this.element.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        if (!this.card) return;

        this._setText(this.data[0]);
        this._createTrigger();
        this._animateFX();
    }

    resizeCanvas() {
        this.canvas.width = this.element.offsetWidth;
        this.canvas.height = this.element.offsetHeight;
    }

    _createTrigger() {
        this.addTrigger(ScrollTrigger.create({
            trigger: this.element,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
            onUpdate: (self) => this._tick(self.progress)
        }));
    }

    _tick(progress) {
        const segments = this.data.length - 1;
        const segWidth = 1 / segments;

        const rawSeg = progress / segWidth;
        const segIndex = Math.min(segments - 1, Math.floor(rawSeg));
        const segProgress = rawSeg - segIndex;

        const fromData = this.data[segIndex];
        const toData = this.data[segIndex + 1];

        if (segIndex !== this.lastSegIndex && segIndex >= 0) {
            this._triggerSonicBoom();
            this.lastSegIndex = segIndex;
        }

        const startY = 10 + (segIndex * 16);
        const endY = 10 + ((segIndex + 1) * 16);
        const driftDir = segIndex % 2 === 0 ? 1 : -1;

        let x, y, scale, rotX, rotZ = 0;
        let isFlying = false;

        const velocity = window.lenis ? Math.abs(window.lenis.velocity) : 0;
        const stretch = 1 + Math.min(velocity * 0.05, 0.4);

        if (segProgress < 0.15) {
            y = startY; x = 50; scale = 1; rotX = 0; rotZ = 0;
            this._setText(fromData);
        } else if (segProgress < 0.25) {
            const p = (segProgress - 0.15) / 0.1;
            isFlying = true;
            y = startY; x = 50; scale = 1 - (p * 0.2);
            rotX = p * 20;
            rotZ = p * 10 * driftDir;
        } else if (segProgress < 0.75) {
            const p = (segProgress - 0.25) / 0.5;
            isFlying = true;
            y = startY + ((endY - startY) * p);
            const arc = Math.sin(p * Math.PI) * 35;
            x = 50 + (arc * driftDir);
            rotX = 20 * (1 - p);
            scale = 0.8;
        } else if (segProgress < 0.85) {
            const p = (segProgress - 0.75) / 0.1;
            isFlying = p < 0.5;
            y = endY; x = 50; scale = 0.8 + (p * 0.2);
            rotX = 0;
            rotZ = (1 - p) * 10 * driftDir;
        } else {
            y = endY; x = 50; scale = 1; rotX = 0; rotZ = 0;
            this._setText(toData);
        }

        let flipY = 1;
        if (this.lastPos) {
            const vx_raw = (x - this.lastPos.x);
            const vy_raw = (y - this.lastPos.y);

            // Only update heading if there's significant movement
            if (isFlying && (Math.abs(vx_raw) > 0.001 || Math.abs(vy_raw) > 0.001)) {
                const angle = Math.atan2(vy_raw, vx_raw) * (180 / Math.PI);
                rotZ = angle - 6.3;
                // Flip Y to keep plane 'upright' when moving left-ish
                if (vx_raw < 0) flipY = -1;
            }
        }

        if (isFlying) this.card.classList.add('flying');
        else this.card.classList.remove('flying');

        gsap.to(this.card, {
            left: `${x}%`,
            top: `${y}%`,
            xPercent: -50,
            yPercent: -50,
            scaleY: scale * stretch * flipY,
            scaleX: scale / Math.sqrt(stretch),
            rotation: rotZ,
            rotationX: rotX,
            duration: 0.1,
            ease: 'none',
            overwrite: 'auto'
        });

        if (isFlying && this.lastPos) {
            const dx = x - this.lastPos.x;
            const dy = y - this.lastPos.y;
            if (velocity > 0.5 && (Math.abs(dx) > 0.001 || Math.abs(dy) > 0.001)) {
                this._spawnVapor(x, y, dx, dy, velocity);
                this._drawFlightData(x, y, velocity, rotZ);
            }
        }
        this.lastPos = { x, y };

        this._applyWakePhysics(x, y, velocity);
        if (segProgress > 0.9) this._landCard(segIndex);
        this._updateEnergyCore(progress);
    }

    _spawnVapor(xPercent, yPercent, dx, dy, velocity) {
        const x = (xPercent / 100) * this.canvas.width;
        const y = (yPercent / 100) * this.canvas.height;
        const vx = (dx / 100) * this.canvas.width;
        const vy = (dy / 100) * this.canvas.height;

        // Subdued cloud: Fewer particles for a cleaner look
        const count = Math.min(Math.floor(velocity * 0.7), 5);

        for (let i = 0; i < count; i++) {
            // Reduced jitter/spread for a tighter, 'less strong' breeze
            const spread = velocity * 0.6;
            const jx = (Math.random() - 0.5) * spread;
            const jy = (Math.random() - 0.5) * spread;

            this.particles.push({
                x: x + jx,
                y: y + jy,
                vx: -vx * (0.5 + Math.random() * 0.5) + (Math.random() - 0.5) * 1.5,
                vy: -vy * (0.5 + Math.random() * 0.5) + (Math.random() - 0.5) * 1.5,
                life: 1.0 + Math.random() * 0.6,
                decay: 0.02 + Math.random() * 0.02,
                size: 1.5 + Math.random() * 4.0,
                color: 'rgba(100, 100, 100, 0.4)' // DARKENED: Ash-gray tone
            });
        }
    }

    _drawFlightData(xP, yP, vel, hdg) {
        const x = (xP / 100) * this.canvas.width;
        const y = (yP / 100) * this.canvas.height;

        this.ctx.font = '8px "Space Grotesk"';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        this.ctx.textAlign = 'left';

        const dataX = x + 40;
        const dataY = y - 20;

        this.ctx.beginPath();
        this.ctx.setLineDash([2, 4]);
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(dataX, dataY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        this.ctx.fillText(`VEL: ${vel.toFixed(1)} m/s`, dataX, dataY);
        this.ctx.fillText(`HDG: ${hdg.toFixed(0)}°`, dataX, dataY + 12);
        this.ctx.fillText(`ALT: ${(100 - yP).toFixed(1)}%`, dataX, dataY + 24);
    }

    _triggerSonicBoom() {
        const cardX = (50 / 100) * this.canvas.width;
        const cardY = (gsap.getProperty(this.card, 'top') / 100) * this.canvas.height;

        this.shockwaves.push({ x: cardX, y: cardY, progress: 0, maxRadius: 500 });
        window.dispatchEvent(new CustomEvent('sonic-boom', { detail: { x: cardX, y: cardY } }));
    }

    _applyWakePhysics(px, py, velocity) {
        if (velocity < 1) return;
        const ghosts = this.element.querySelectorAll('.tl-ghost');
        ghosts.forEach(ghost => {
            const gy = parseFloat(ghost.style.top);
            const dist = Math.abs(py - gy);
            if (dist < 15) {
                const impact = (1 - dist / 15) * velocity;
                gsap.to(ghost, {
                    rotationX: (Math.random() - 0.5) * impact * 10,
                    rotationY: (Math.random() - 0.5) * impact * 10,
                    z: impact * 20, duration: 0.4, ease: 'power2.out'
                });
            } else {
                gsap.to(ghost, { rotationX: 0, rotationY: 0, z: 0, duration: 1.2, ease: 'elastic.out(1, 0.5)' });
            }
        });
    }

    _animateFX() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((p, i) => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                return;
            }

            const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
            const stretchStr = 1 + speed * 1.2;

            this.ctx.globalAlpha = p.life * 0.8;
            this.ctx.fillStyle = p.color;
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(Math.atan2(p.vy, p.vx));
            this.ctx.scale(stretchStr, 1);
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });

        this.shockwaves.forEach((s, i) => {
            s.progress += 0.04;
            if (s.progress > 1) { this.shockwaves.splice(i, 1); return; }
            const opacity = 1 - s.progress;
            const radius = s.maxRadius * s.progress;
            this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
            this.ctx.lineWidth = 1 + (1 - s.progress) * 4;
            this.ctx.beginPath();
            this.ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
            this.ctx.stroke();
        });

        this.ctx.globalAlpha = 1;
        requestAnimationFrame(() => this._animateFX());
    }

    _updateEnergyCore(progress) {
        if (!this.energyCore) return;
        if (progress > 0.8) {
            this.energyCore.classList.add('visible', 'charging');
            const coreP = (progress - 0.8) / 0.2;
            const scale = 0.5 + (coreP * 1.5);
            const pulseSpeed = 2 - (coreP * 1.8);
            this.energyCore.style.setProperty('--pulse-speed', `${pulseSpeed}s`);
            gsap.set(this.energyCore, { scale, filter: `drop-shadow(0 0 ${coreP * 50}px #2E5BFF)` });
            if (this.tlRiver) this.tlRiver.style.opacity = 1 - coreP;
        } else {
            this.energyCore.classList.remove('visible', 'charging');
            if (this.tlRiver) this.tlRiver.style.opacity = 1;
        }
    }

    easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    _setText(d) {
        if (!this.titleEl || this.titleEl.textContent === d.title) return;
        this.titleEl.textContent = d.title;
        this.roleEl.textContent = d.role;
        this.descEl.textContent = d.desc;
        this.yearEl.textContent = d.year;
    }

    _landCard(index) {
        if (this.landedSet.has(index)) return;
        const d = this.data[index];
        const ghost = document.createElement('div');
        ghost.className = 'tl-ghost';
        ghost.style.top = `${10 + (index * 16)}%`;
        ghost.style.left = `50%`;
        ghost.style.transform = `translate(-50%, -50%)`;
        ghost.innerHTML = `<h3>${d.title}</h3><p>${d.desc}</p>`;
        this.element.querySelector('#landedCards').appendChild(ghost);
        this.landedSet.add(index);
        gsap.to(ghost, { opacity: 0.4, duration: 0.5 });
    }
}
