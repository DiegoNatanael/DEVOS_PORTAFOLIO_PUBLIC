/**
 * Base Component class - small React-like lifecycle in vanilla JS
 */
class Component {
    constructor(selector) {
        this.element = typeof selector === 'string' ? document.querySelector(selector) : selector;
        this.isActive = false;
        this.triggers = [];
    }

    init() {
        if (!this.element) return;
        this.isActive = true;
        this.mount();
    }

    mount() {
        // Override in subclass
    }

    destroy() {
        this.triggers.forEach(t => t.kill());
        this.triggers = [];
        this.isActive = false;
    }

    addTrigger(trigger) {
        this.triggers.push(trigger);
    }
}
