class ContactComponent extends Component {
    mount() {
        this.link = this.element.querySelector('#contactEmail');
        this.sub = this.element.querySelector('.contact-sub');
        if (!this.link) return;

        // Innovation: Laser Scanner
        const laser = document.createElement('div');
        laser.className = 'contact-laser';
        this.link.appendChild(laser);

        this.link.addEventListener('mouseenter', () => {
            gsap.to(this.element, {
                duration: 0.4,
                backgroundColor: "#fafafa",
                color: "#1a1a1a",
                ease: "expo.out"
            });

            gsap.to(this.link, {
                duration: 0.6,
                letterSpacing: "4px",
                color: "#1a1a1a",
                fontWeight: "900",
                ease: "expo.out"
            });

            gsap.fromTo(laser,
                { left: '-10%', opacity: 1 },
                { left: '110%', opacity: 0, duration: 1.2, ease: "power4.inOut" }
            );
        });

        this.link.addEventListener('mouseleave', () => {
            gsap.to(this.element, {
                duration: 0.4,
                backgroundColor: "#0a0a0a",
                color: "#fafafa",
                ease: "power2.inOut"
            });

            gsap.to(this.link, {
                duration: 0.4,
                letterSpacing: "0px",
                color: "#fafafa",
                fontWeight: "700",
                ease: "expo.out"
            });
        });
    }
}
