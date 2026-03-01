class PendulumComponent extends Component {
    constructor(selector) {
        super(selector);

        // Core lengths & masses
        this.r1 = 100;
        this.r2 = 100;
        this.m1 = 10;
        this.m2 = 10;

        // Start NEAR THE TOP (upright unstable equilibrium) — this is what generates chaos
        // When a double pendulum starts near PI it has max potential energy and flips chaotically
        this.a1 = Math.PI + 0.1;
        this.a2 = Math.PI + 0.05;
        this.a1_v = 0;
        this.a2_v = 0;

        this.g = 2.0;       // Real gravity is required for the nonlinear interactions that cause chaos
        this.damping = 1.0; // No damping — infinite energy

        this.dots = [];
        this.isActive = false;
        this.isHovered = false;

        // Target pivot (smoothly interpolated to mouse)
        this.targetCx = 0;
        this.targetCy = 0;
        this.cx = 0;
        this.cy = 0;

        this.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";
        this.stableHash = "a7b7c5e2d1f9g0h3";
    }

    mount() {
        this.canvas = document.getElementById('pendulumCanvasOverlay');
        this.passwordEl = document.getElementById('chaoticPassword');
        this.card = document.getElementById('pendulumProject');
        this.copyBtn = document.getElementById('copyPasswordBtn');

        if (!this.canvas || !this.passwordEl) return;

        this.ctx = this.canvas.getContext('2d');
        this.isLocked = false;
        this.frameCounter = 0;

        this.canvas.style.position = 'absolute';
        this.canvas.style.inset = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '1';

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this._initScrollTrigger();
        this._initInteractions();
        this._animate();
    }

    _initInteractions() {
        this.copyBtn?.addEventListener('click', () => {
            if (this.isLocked) {
                this.isLocked = false;
                this.copyBtn.textContent = "Lock & Copy Hash";
            } else {
                this.isLocked = true;
                const pass = this.passwordEl.textContent;
                navigator.clipboard.writeText(pass);
                this.copyBtn.textContent = "COPIED TO CLIPBOARD";
                setTimeout(() => {
                    if (this.isLocked) this.copyBtn.textContent = "Unlock Stream";
                }, 2000);
            }
        });

        this.card.addEventListener('mouseenter', () => {
            this.isHovered = true;
            this.dots = []; // Clear trail on re-entry
        });

        this.card.addEventListener('mouseleave', () => {
            this.isHovered = false;
            setTimeout(() => {
                if (!this.isHovered && !this.isLocked) {
                    this.passwordEl.textContent = this.stableHash;
                }
            }, 300);
        });
    }

    resize() {
        if (!this.card || !this.canvas) return;
        const rect = this.card.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
        this.targetCx = this.cx;
        this.targetCy = this.cy;
    }

    _initScrollTrigger() {
        ScrollTrigger.create({
            trigger: this.card,
            start: "top 80%",
            end: "bottom 20%",
            onToggle: self => {
                this.isActive = self.isActive;
                if (this.isActive) this.resize();
            }
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isActive || !this.isHovered) return;
            const rect = this.card.getBoundingClientRect();
            // Only update target — the actual pivot follows smoothly in the render loop
            this.targetCx = e.clientX - rect.left;
            this.targetCy = e.clientY - rect.top;
        });
    }

    _animate() {
        if (this.isActive) {
            // Smooth pivot follow — fast enough to feel responsive, slow enough to not jerk
            this.cx += (this.targetCx - this.cx) * 0.12;
            this.cy += (this.targetCy - this.cy) * 0.12;

            // 2 substeps per frame — slower, more readable chaos
            for (let s = 0; s < 2; s++) {
                this._updatePhysics();
            }
            this._draw();

            this.frameCounter++;
            if (!this.isLocked && this.isHovered && this.frameCounter % 5 === 0) {
                this._generatePassword();
            }
        }
        requestAnimationFrame(() => this._animate());
    }

    _updatePhysics() {
        // Standard double pendulum equations (Lagrangian mechanics)
        // dt = 1/4 per substep
        const dt = 0.15;
        const { m1, m2, r1, r2, g } = this;
        const { a1, a2, a1_v, a2_v } = this;

        const dA = a1 - a2;

        const den1 = r1 * (2 * m1 + m2 - m2 * Math.cos(2 * dA));
        const den2 = r2 * (2 * m1 + m2 - m2 * Math.cos(2 * dA));

        if (Math.abs(den1) < 0.0001 || Math.abs(den2) < 0.0001) return;

        const a1_a = (
            -g * (2 * m1 + m2) * Math.sin(a1)
            - m2 * g * Math.sin(a1 - 2 * a2)
            - 2 * Math.sin(dA) * m2 * (a2_v * a2_v * r2 + a1_v * a1_v * r1 * Math.cos(dA))
        ) / den1;

        const a2_a = (
            2 * Math.sin(dA) * (
                a1_v * a1_v * r1 * (m1 + m2)
                + g * (m1 + m2) * Math.cos(a1)
                + a2_v * a2_v * r2 * m2 * Math.cos(dA)
            )
        ) / den2;

        // Verlet-style integration with dt scaling
        const new_a1_v = a1_v + a1_a * dt;
        const new_a2_v = a2_v + a2_a * dt;
        const new_a1 = a1 + new_a1_v * dt;
        const new_a2 = a2 + new_a2_v * dt;

        if (isNaN(new_a1) || isNaN(new_a2)) return;

        this.a1 = new_a1;
        this.a2 = new_a2;
        this.a1_v = new_a1_v * this.damping;
        this.a2_v = new_a2_v * this.damping;
    }

    _draw() {
        if (!this.ctx || isNaN(this.cx)) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const x1 = this.cx + this.r1 * Math.sin(this.a1);
        const y1 = this.cy + this.r1 * Math.cos(this.a1);
        const x2 = x1 + this.r2 * Math.sin(this.a2);
        const y2 = y1 + this.r2 * Math.cos(this.a2);

        // Rod 1
        this.ctx.strokeStyle = "rgba(0,0,0,0.9)";
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.cx, this.cy);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        // Rod 2
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Chaotic trace of the second bob
        this.dots.push({ x: x2, y: y2 });
        if (this.dots.length > 120) this.dots.shift();

        if (this.dots.length > 1) {
            this.ctx.beginPath();
            this.ctx.lineWidth = 1.5;
            this.dots.forEach((dot, i) => {
                const alpha = (i / this.dots.length) * 0.7;
                this.ctx.strokeStyle = `rgba(0,0,0,${alpha})`;
                if (i === 0) this.ctx.moveTo(dot.x, dot.y);
                else this.ctx.lineTo(dot.x, dot.y);
            });
            this.ctx.stroke();
        }

        // Bob 1 — pivot joint
        this.ctx.fillStyle = "rgba(0,0,0,0.9)";
        this.ctx.beginPath();
        this.ctx.arc(x1, y1, 7, 0, Math.PI * 2);
        this.ctx.fill();

        // Bob 2 — tip (slightly larger/darker)
        this.ctx.fillStyle = "rgba(0,0,0,1)";
        this.ctx.beginPath();
        this.ctx.arc(x2, y2, 9, 0, Math.PI * 2);
        this.ctx.fill();

        // Pivot origin marker
        this.ctx.fillStyle = "rgba(0,0,0,0.4)";
        this.ctx.beginPath();
        this.ctx.arc(this.cx, this.cy, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    _generatePassword() {
        const entropy = Math.abs(this.a1 % (Math.PI * 2)) * 10000 + Math.abs(this.a2 % (Math.PI * 2)) * 10000;
        const seed = Math.floor(entropy + Date.now());
        let pass = "";

        for (let i = 0; i < 16; i++) {
            const charIndex = Math.abs(Math.floor((seed * (i + 7) * 3141) % this.chars.length));
            pass += this.chars[charIndex] ?? "X";
        }
        this.passwordEl.textContent = pass;
    }
}
