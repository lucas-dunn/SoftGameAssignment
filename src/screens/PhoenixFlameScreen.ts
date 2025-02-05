import { Container } from 'pixi.js';
import gsap from 'gsap';
import type { AppScreen } from '../navigation';
import { PrimaryButton } from '../ui/buttons/PrimaryButton';
import { navigation } from '../navigation';
import { TitleScreen } from './TitleScreen';
import { FlameAnimation } from '../game/entities/FlameAnimation';
import { FlameParticle } from '../game/entities/FlameParticle';
import { FpsCounter } from '../ui/FpsCounter';

export class PhoenixFlameScreen extends Container implements AppScreen {
    public static SCREEN_ID = 'phoenix-flame';
    public static assetBundles = ['game-screen'];

    private readonly _backButton: PrimaryButton;
    private readonly _flameAnimation: FlameAnimation;
    private readonly _flameParticles: FlameParticle;
    private readonly _fpsCounter: FpsCounter;

    constructor() {
        super();

        // Add flame animation
        this._flameAnimation = new FlameAnimation();
        this.addChild(this._flameAnimation);

        // Add flame particles
        this._flameParticles = new FlameParticle();
        this.addChild(this._flameParticles);

        // Add FPS counter
        this._fpsCounter = new FpsCounter();
        this.addChild(this._fpsCounter);

        // Add back button
        this._backButton = new PrimaryButton({
            text: 'Back',
            textStyle: {
                fill: 0xe91e63,
                fontFamily: 'Opensans Semibold',
                fontWeight: 'bold',
                align: 'center',
                fontSize: 16,
            },
            buttonOptions: {
                defaultView: 'pixi-btn-up',
                pressedView: 'pixi-btn-down',
                textOffset: {
                    default: {
                        y: -13,
                    },
                    pressed: {
                        y: -8,
                    },
                },
            },
        });

        this._backButton.onPress.connect(() => {
            navigation.goToScreen(TitleScreen);
        });

        this.addChild(this._backButton);
    }

    public resize(w: number, h: number): void {
        // Position FPS counter in top-left corner
        this._fpsCounter.x = 10;
        this._fpsCounter.y = 10;

        // Position back button in top-left corner
        this._backButton.x = 100;
        this._backButton.y = 80;

        // Center flame animation
        this._flameAnimation.x = w / 2;
        this._flameAnimation.y = h / 3;

        // Position particles at same position as flame
        this._flameParticles.x = w / 2;
        this._flameParticles.y = (2 * h) / 3;

        // Scale flame animation based on screen size
        const scale = Math.min(w, h) * 0.001; // Adjust this multiplier to change size
        this._flameAnimation.setScale(scale);
        this._flameParticles.setScale(scale); // Particles slightly smaller
    }

    public async show(): Promise<void> {
        this.alpha = 0;
        await gsap.to(this, {
            alpha: 1,
            duration: 0.3,
            ease: 'linear',
        });
    }

    public async hide(): Promise<void> {
        await gsap.to(this, {
            alpha: 0,
            duration: 0.3,
            ease: 'linear',
        });
    }

    public prepare(): void {
        // Reset any necessary state
    }

    public cleanup(): void {
        // Clean up animations and particles
        this._flameAnimation.destroy();
        this._flameParticles.destroy();
        this._fpsCounter.destroy();
    }
}
