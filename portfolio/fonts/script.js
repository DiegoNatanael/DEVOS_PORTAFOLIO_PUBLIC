(function () {
    'use strict';

    // Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        smooth: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // GSAP Register
    gsap.registerPlugin(ScrollTrigger);

    // Hero Reveal
    const heroTl = gsap.timeline();
    heroTl.from('.hero-title span', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        stagger: 0.2,
        ease: 'power4.out',
        delay: 0.5
    }).from('.hero-tagline', {
        opacity: 0,
        y: 20,
        duration: 1,
        ease: 'power3.out'
    }, '-=0.8');

    // Scroll Reveals
    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach(el => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: 'play none none none'
            },
            y: 40,
            opacity: 0,
            duration: 1.2,
            ease: 'power3.out'
        });
    });

    // Image Parallax / Reveal
    const projectItems = gsap.utils.toArray('.project-item');
    projectItems.forEach(item => {
        const img = item.querySelector('.project-visual img');
        gsap.from(img, {
            scrollTrigger: {
                trigger: item,
                start: 'top 80%',
                end: 'bottom 20%',
                scrub: true
            },
            scale: 1.2,
            ease: 'none'
        });
    });

    // Logo magnetic effect (subtle)
    const logo = document.querySelector('.logo');
    logo.addEventListener('mousemove', (e) => {
        const { clientX: x, clientY: y } = e;
        const { left, top, width, height } = logo.getBoundingClientRect();
        const mX = (x - (left + width / 2)) * 0.2;
        const mY = (y - (top + height / 2)) * 0.2;
        gsap.to(logo, { x: mX, y: mY, duration: 0.4, ease: 'power2.out' });
    });
    logo.addEventListener('mouseleave', () => {
        gsap.to(logo, { x: 0, y: 0, duration: 0.6, ease: 'power2.out' });
    });

})();
