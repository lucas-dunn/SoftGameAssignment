import { Container, Text } from 'pixi.js';

export class FpsCounter extends Container {
    private fpsText: Text;
    private frames = 0;
    private lastTime = performance.now();
    private updateInterval: number | null = null;

    constructor() {
        super();

        this.fpsText = new Text({
            text: 'FPS: 0',
            style: {
                fontFamily: 'Arial',
                fontSize: 16,
                fill: 0x000000,
                align: 'left',
            },
        });

        this.addChild(this.fpsText);
        this.startCounter();
    }

    private startCounter(): void {
        // Update FPS display every second
        this.updateInterval = window.setInterval(() => {
            const currentTime = performance.now();
            const delta = currentTime - this.lastTime;
            const fps = Math.round((this.frames * 1000) / delta);

            this.fpsText.text = `FPS: ${fps}`;

            this.frames = 0;
            this.lastTime = currentTime;
        }, 1000);

        // Count frames
        const countFrame = () => {
            this.frames++;
            requestAnimationFrame(countFrame);
        };
        requestAnimationFrame(countFrame);
    }

    public destroy(): void {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        this.fpsText.destroy();
        super.destroy();
    }
}
