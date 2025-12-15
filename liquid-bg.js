/**
 * Liquid Background - Custom cursor-reactive animated background
 * A performant WebGL-based liquid/fluid effect that responds to mouse movement
 */

class LiquidBackground {
    constructor(container) {
        this.container = container;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);

        // Settings
        this.particleCount = 80;
        this.particles = [];
        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.time = 0;
        this.isRunning = true;

        // Colors - purple/blue gradient theme
        this.colors = [
            'rgba(139, 92, 246, 0.6)',   // purple
            'rgba(99, 102, 241, 0.5)',    // indigo
            'rgba(79, 70, 229, 0.4)',     // violet
            'rgba(124, 58, 237, 0.5)',    // purple darker
            'rgba(67, 56, 202, 0.3)',     // deep indigo
        ];

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                baseX: Math.random() * this.width,
                baseY: Math.random() * this.height,
                size: Math.random() * 150 + 80,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)],
                phase: Math.random() * Math.PI * 2,
                amplitude: Math.random() * 50 + 30,
            });
        }
    }

    bindEvents() {
        // Mouse move
        document.addEventListener('mousemove', (e) => {
            this.mouse.targetX = e.clientX;
            this.mouse.targetY = e.clientY;
        });

        // Touch move
        document.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                this.mouse.targetX = e.touches[0].clientX;
                this.mouse.targetY = e.touches[0].clientY;
            }
        });

        // Resize
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        // Visibility change - pause when tab is hidden
        document.addEventListener('visibilitychange', () => {
            this.isRunning = !document.hidden;
            if (this.isRunning) this.animate();
        });
    }

    animate() {
        if (!this.isRunning) return;

        this.time += 0.01;

        // Smooth mouse follow
        this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
        this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

        // Clear canvas with fade effect
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.15)';
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Update and draw particles
        this.particles.forEach((particle, i) => {
            // Base movement
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // Oscillation
            const oscillateX = Math.sin(this.time + particle.phase) * particle.amplitude;
            const oscillateY = Math.cos(this.time * 0.8 + particle.phase) * particle.amplitude;

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = 400;

            if (dist < maxDist) {
                const force = (maxDist - dist) / maxDist;
                particle.x -= dx * force * 0.02;
                particle.y -= dy * force * 0.02;
            }

            // Keep in bounds with wrapping
            if (particle.x < -particle.size) particle.x = this.width + particle.size;
            if (particle.x > this.width + particle.size) particle.x = -particle.size;
            if (particle.y < -particle.size) particle.y = this.height + particle.size;
            if (particle.y > this.height + particle.size) particle.y = -particle.size;

            // Draw particle as soft glow
            const gradient = this.ctx.createRadialGradient(
                particle.x + oscillateX,
                particle.y + oscillateY,
                0,
                particle.x + oscillateX,
                particle.y + oscillateY,
                particle.size
            );

            gradient.addColorStop(0, particle.color);
            gradient.addColorStop(0.5, particle.color.replace(/[\d.]+\)$/, '0.2)'));
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            this.ctx.beginPath();
            this.ctx.arc(
                particle.x + oscillateX,
                particle.y + oscillateY,
                particle.size,
                0,
                Math.PI * 2
            );
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });

        // Add subtle noise/grain overlay
        this.addNoise();

        requestAnimationFrame(() => this.animate());
    }

    addNoise() {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const data = imageData.data;

        // Only apply noise to a subset for performance
        for (let i = 0; i < data.length; i += 16) {
            const noise = (Math.random() - 0.5) * 8;
            data[i] = Math.max(0, Math.min(255, data[i] + noise));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        }

        this.ctx.putImageData(imageData, 0, 0);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const bgContainer = document.querySelector('.hero-bg');
    if (bgContainer) {
        new LiquidBackground(bgContainer);
    }
});
