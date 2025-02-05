import { Container, Sprite, Assets } from 'pixi.js';

export class FlameAnimation extends Container {
    private sprites: Sprite[] = [];
    private currentFrame: number = 0;
    private animationSpeed: number = 60; // milliseconds between frames
    private animationInterval: number | null = null;

    constructor() {
        super();
        this.init();
    }

    private async init(): Promise<void> {
        try {
            // Wait for assets to be loaded
            //await Assets.load('flame.json');

            // Get the spritesheet
            const sheet = await Assets.load('flame.json');

            if (!sheet) {
                throw new Error('Failed to load flame spritesheet');
            }

            // Create sprites for each frame
            for (let i = 1; i <= 22; i++) {
                const frameName = `${i.toString().padStart(3, '0')}.png`;
                const texture = sheet.textures[frameName];

                if (!texture) {
                    console.warn(`Missing texture for frame: ${frameName}`);
                    continue;
                }

                const sprite = new Sprite(texture);
                sprite.anchor.set(0.5);
                sprite.visible = false;
                this.addChild(sprite);
                this.sprites.push(sprite);
            }

            // Show first frame
            if (this.sprites.length > 0) {
                this.sprites[0].visible = true;
            }

            // Start animation loop
            this.startAnimation();
        } catch (error) {
            console.error('Failed to load flame animation:', error);
        }
    }

    private startAnimation(): void {
        if (this.animationInterval) return;

        this.animationInterval = window.setInterval(() => {
            if (this.sprites.length === 0) return;

            // Hide current frame
            this.sprites[this.currentFrame].visible = false;

            // Move to next frame
            this.currentFrame = (this.currentFrame + 1) % this.sprites.length;
            //console.log(this.currentFrame);
            // Show new frame
            this.sprites[this.currentFrame].visible = true;
        }, this.animationSpeed);
    }

    public setScale(scale: number): void {
        this.sprites.forEach((sprite) => {
            sprite.scale.set(scale);
        });
    }

    public destroy(): void {
        if (this.animationInterval) {
            clearInterval(this.animationInterval);
            this.animationInterval = null;
        }
        this.sprites.forEach((sprite) => sprite.destroy());
        this.sprites = [];
        super.destroy();
    }
}
