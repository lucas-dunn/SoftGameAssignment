import { Container, Sprite, Assets } from 'pixi.js';

interface Particle {
    sprite: Sprite;
    velocity: { x: number; y: number };
    life: number;
    maxLife: number;
    alpha: number;
    scale: number;
}

export class FlameParticle extends Container {
    private particles: Particle[] = [];
    private maxParticles: number = 10;
    private emissionRate: number = 200;
    private emitterInterval: number | null = null;
    private updateInterval: number | null = null;

    constructor() {
        super();
        this.init();
    }

    private async init(): Promise<void> {
        try {
            await Assets.load('flame');
            this.startEmitter();
            this.startUpdate();
        } catch (error) {
            console.error('Failed to initialize flame particles:', error);
        }
    }

    private startEmitter(): void {
        if (this.emitterInterval) return;

        this.emitterInterval = window.setInterval(() => {
            if (this.particles.length < this.maxParticles) {
                this.emitParticle();
            }
        }, this.emissionRate);
    }

    private startUpdate(): void {
        if (this.updateInterval) return;

        this.updateInterval = window.setInterval(() => {
            this.updateParticles();
        }, 16); // ~60fps
    }

    private async emitParticle(): Promise<void> {
        if (this.particles.length >= this.maxParticles) return;

        const sheet = await Assets.load('flame.json');
        if (!sheet) return;

        // Use a random frame from the flame spritesheet
        const frameNumber = Math.floor(Math.random() * 22) + 1;
        const frameName = `${frameNumber.toString().padStart(3, '0')}.png`;
        const texture = sheet.textures[frameName];

        if (!texture) return;

        const sprite = new Sprite(texture);
        sprite.anchor.set(0.5);
        sprite.scale.set(0.3); // Start smaller than main flame

        // Random initial position within a small circle
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 10;
        sprite.x = Math.cos(angle) * radius;
        sprite.y = Math.sin(angle) * radius;

        // Random velocity
        const speed = Math.random() * 2 + 1;
        const velocityAngle = -Math.PI / 2 + ((Math.random() - 0.5) * Math.PI) / 4; // Mostly upward

        const particle: Particle = {
            sprite,
            velocity: {
                x: Math.cos(velocityAngle) * speed,
                y: Math.sin(velocityAngle) * speed,
            },
            life: 0,
            maxLife: Math.random() * 1000 + 500, // 0.5 to 1.5 seconds
            alpha: 1,
            scale: sprite.scale.x,
        };

        this.addChild(sprite);
        this.particles.push(particle);
    }

    private updateParticles(): void {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.life += 16;

            // Update position
            particle.sprite.x += particle.velocity.x;
            particle.sprite.y += particle.velocity.y;

            // Update scale and alpha based on life
            const lifeRatio = particle.life / particle.maxLife;
            particle.sprite.alpha = 1 - lifeRatio;
            particle.sprite.scale.set(particle.scale * (1 + lifeRatio * 0.5));

            // Remove dead particles
            if (particle.life >= particle.maxLife) {
                this.removeChild(particle.sprite);
                particle.sprite.destroy();
                this.particles.splice(i, 1);
            }
        }
    }

    public setScale(scale: number): void {
        this.scale.set(scale);
    }

    public destroy(): void {
        if (this.emitterInterval) {
            clearInterval(this.emitterInterval);
            this.emitterInterval = null;
        }
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }

        this.particles.forEach((particle) => {
            particle.sprite.destroy();
        });
        this.particles = [];

        super.destroy();
    }
}
