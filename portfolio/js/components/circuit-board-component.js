/**
 * CircuitBoardComponent  
 * Handles the Circuit Board section with horizontal scroll projects, PCB green background, 
 * and cyberpunk-themed card animations
 */
class CircuitBoardComponent extends Component {
    mount() {
        this.section = this.element;
        this.canvas = this.section.querySelector('#circuitCanvas');
        this.track = this.section.querySelector('#circuitTrack');
        this.panels = gsap.utils.toArray('.circuit-panel', this.section);
        this.counterEl = this.section.querySelector('#counter');

        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            this.initPCB();
        });

        // Interactive states
        this.mouse = { x: -1000, y: -1000 };
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        this.initPCB();
        this.animate();

        this.impactGlow = 0;
        window.addEventListener('sonic-boom', (e) => {
            this.impactGlow = 1;
            this.shockwaveOrigin = e.detail;
            gsap.to(this, { impactGlow: 0, duration: 1.5, ease: 'power2.out' });
        });


        // Visibility Toggle
        ScrollTrigger.create({
            trigger: this.section,
            start: 'top top',
            end: 'bottom bottom',
            onEnter: () => this.canvas.classList.add('active'),
            onLeaveBack: () => this.canvas.classList.remove('active')
        });

        this.initHorizontalScroll();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    initPCB() {
        this.layers = 3;
        this.traces = [];
        this.dataPackets = [];
        this.vias = [];

        const w = this.canvas.width;
        const h = this.canvas.height;
        const gridSize = 60;

        // Generate procedural traces for each layer
        for (let l = 0; l < this.layers; l++) {
            const count = 10 + Math.floor(Math.random() * 5);
            const opacity = 0.05 + (l * 0.1); // Closer layers are brighter
            const parallax = 0.2 + (l * 0.3); // Closer layers move more (for future parallax if needed)

            for (let i = 0; i < count; i++) {
                const trace = this.generateTrace(w, h, gridSize);
                trace.layer = l;
                trace.opacity = opacity;
                this.traces.push(trace);

                // Add vias at start/end
                this.vias.push({ ...trace.points[0], layer: l });
                this.vias.push({ ...trace.points[trace.points.length - 1], layer: l });
            }
        }
    }

    generateTrace(w, h, gridSize) {
        const points = [];
        let curX = Math.round((Math.random() * w) / gridSize) * gridSize;
        let curY = Math.round((Math.random() * h) / gridSize) * gridSize;
        points.push({ x: curX, y: curY });

        const segmentCount = 3 + Math.floor(Math.random() * 5);
        for (let i = 0; i < segmentCount; i++) {
            const dir = Math.random() > 0.5 ? 'h' : 'v';
            const dist = (1 + Math.floor(Math.random() * 3)) * gridSize;

            if (dir === 'h') curX += (Math.random() > 0.5 ? 1 : -1) * dist;
            else curY += (Math.random() > 0.5 ? 1 : -1) * dist;

            // Optional 45 degree turn
            if (Math.random() > 0.7) {
                const angleDist = gridSize;
                curX += (Math.random() > 0.5 ? 1 : -1) * angleDist;
                curY += (Math.random() > 0.5 ? 1 : -1) * angleDist;
            }

            // Keep in bounds
            curX = Math.max(0, Math.min(w, curX));
            curY = Math.max(0, Math.min(h, curY));
            points.push({ x: curX, y: curY });
        }

        return { points, lastPacket: 0 };
    }

    animate() {
        const w = this.canvas.width;
        const h = this.canvas.height;

        // Architectural Blueprint Background (Technical Paper)
        this.ctx.fillStyle = '#f0f0ea'; // Bone white / Newsprint tone
        this.ctx.fillRect(0, 0, w, h);

        // Draw Patterned Grid (very subtle)
        this.ctx.strokeStyle = 'rgba(102, 102, 102, 0.05)';
        this.ctx.lineWidth = 0.5;
        const gridSize = 40;
        for (let x = 0; x < w; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, h);
            this.ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(w, y);
            this.ctx.stroke();
        }

        // Draw traces
        this.traces.forEach(trace => {
            this.drawTrace(trace);

            // Randomly spawn data packets
            if (Date.now() - trace.lastPacket > 3000 + Math.random() * 5000) {
                this.dataPackets.push(this.createPacket(trace));
                trace.lastPacket = Date.now();
            }
        });

        // Draw Drafting Annotations (Hex codes / Coordinates)
        this.drawAnnotations();

        // Draw Vias (as drafting points)
        this.vias.forEach(via => {
            const dist = Math.hypot(this.mouse.x - via.x, this.mouse.y - via.y);
            const focus = Math.max(0, 1 - dist / 150);

            this.ctx.fillStyle = focus > 0.5 ? 'rgba(46, 91, 255, 0.8)' : 'rgba(102, 102, 102, 0.3)';
            this.ctx.beginPath();
            this.ctx.arc(via.x, via.y, 1.5, 0, Math.PI * 2);
            this.ctx.fill();

            if (focus > 0.5) {
                this.ctx.strokeStyle = 'rgba(46, 91, 255, 0.4)';
                this.ctx.lineWidth = 0.5;
                this.ctx.beginPath();
                this.ctx.arc(via.x, via.y, 5, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });

        // Update and draw packets (as data flux)
        this.dataPackets = this.dataPackets.filter(packet => {
            packet.progress += packet.speed;
            if (packet.progress >= 1) return false;

            const pos = this.getPointAtProgress(packet.trace, packet.progress);
            this.ctx.fillStyle = '#2E5BFF';
            this.ctx.beginPath();
            this.ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
            this.ctx.fill();
            return true;
        });

        requestAnimationFrame(() => this.animate());
    }

    drawTrace(trace) {
        this.ctx.beginPath();
        this.ctx.moveTo(trace.points[0].x, trace.points[0].y);
        for (let i = 1; i < trace.points.length; i++) {
            this.ctx.lineTo(trace.points[i].x, trace.points[i].y);
        }

        // Drafting Style Line
        this.ctx.strokeStyle = `rgba(102, 102, 102, ${0.1 + trace.opacity * 0.5})`;
        this.ctx.lineWidth = 0.5;
        this.ctx.stroke();

        // Reactive Highlight (Blueprint glow)
        let maxGlow = 0;
        trace.points.forEach(p => {
            const d = Math.hypot(this.mouse.x - p.x, this.mouse.y - p.y);
            maxGlow = Math.max(maxGlow, Math.max(0, 1 - d / 200));
        });

        if (maxGlow > 0 || this.impactGlow > 0) {
            this.ctx.strokeStyle = `rgba(46, 91, 255, ${maxGlow * 0.4 + this.impactGlow * 0.5})`;
            this.ctx.lineWidth = 1 + this.impactGlow * 2;

            // "Push" effect: Offset trace drawing slightly if near shockwave origin
            if (this.impactGlow > 0 && this.shockwaveOrigin) {
                const dist = Math.hypot(trace.points[0].x - this.shockwaveOrigin.x, trace.points[0].y - this.shockwaveOrigin.y);
                if (dist < 300) {
                    const push = (1 - dist / 300) * this.impactGlow * 10;
                    this.ctx.translate(push, push);
                }
            }

            this.ctx.stroke();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        }
    }

    drawAnnotations() {
        this.ctx.font = '8px monospace';
        this.ctx.fillStyle = 'rgba(102, 102, 102, 0.4)';

        // Every few seconds/frames draw some labels near traces
        if (!this.annotations) {
            this.annotations = this.traces.slice(0, 5).map(t => ({
                x: t.points[0].x + 5,
                y: t.points[0].y - 5,
                text: `0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase()}`
            }));
        }

        this.annotations.forEach(ann => {
            this.ctx.fillText(ann.text, ann.text.x || ann.x, ann.text.y || ann.y);
        });
    }

    createPacket(trace) {
        return {
            trace,
            progress: 0,
            speed: 0.002 + Math.random() * 0.005
        };
    }

    getPointAtProgress(trace, progress) {
        const points = trace.points;
        const totalSegments = points.length - 1;
        const targetSeg = Math.floor(progress * totalSegments);
        const segProgress = (progress * totalSegments) % 1;

        const p1 = points[Math.min(totalSegments, targetSeg)];
        const p2 = points[Math.min(totalSegments, targetSeg + 1)];

        return {
            x: p1.x + (p2.x - p1.x) * segProgress,
            y: p1.y + (p2.y - p1.y) * segProgress
        };
    }

    /**
     * Initialize horizontal scroll with snap behavior
     */
    initHorizontalScroll() {
        const scrollTween = gsap.to(this.track, {
            xPercent: -100 * (this.panels.length - 1),
            ease: 'none',
            scrollTrigger: {
                trigger: this.section,
                pin: true,
                scrub: 1.5,
                end: () => '+=' + this.track.offsetWidth,
                anticipatePin: 1,
                snap: {
                    snapTo: 1 / (this.panels.length - 1),
                    duration: 0.4,
                    ease: 'power1.inOut'
                }
            }
        });

        // 2. Counter animation on first panel
        if (this.counterEl) {
            ScrollTrigger.create({
                trigger: this.panels[0],
                start: 'left 50%',
                onEnter: () => {
                    const obj = { v: 0 };
                    gsap.to(obj, {
                        v: 99,
                        duration: 1.5,
                        onUpdate: () => {
                            this.counterEl.textContent = Math.round(obj.v);
                        }
                    });
                },
                containerAnimation: scrollTween
            });
        }

        // 3. Tech card boot-up animations
        this.panels.forEach((panel, i) => {
            if (i === 0) return;

            const card = panel.querySelector('.tech-card');
            const inner = card ? card.querySelector('.card-inner') : null;

            if (!card) return;

            gsap.to(inner, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: panel,
                    containerAnimation: scrollTween,
                    start: 'left 75%',
                    end: 'left 50%',
                    scrub: 0.5
                }
            });

            const cardNum = card.querySelector('.card-number');
            if (cardNum) {
                gsap.to(cardNum, {
                    opacity: 1,
                    scale: 1,
                    duration: 0.4,
                    ease: 'back.out',
                    scrollTrigger: {
                        trigger: panel,
                        containerAnimation: scrollTween,
                        start: 'left 70%',
                        end: 'left 50%',
                        scrub: 0.3
                    }
                });
            }
        });
    }
}

