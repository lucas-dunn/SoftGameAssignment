import gsap from 'gsap';
import { Container } from 'pixi.js';
import type { AppScreen } from '../navigation';
import { PrimaryButton } from '../ui/buttons/PrimaryButton';
import { navigation } from '../navigation';
import { TitleScreen } from './TitleScreen';
import { AceOfShadow } from '../game/entities/AceOfShadow';
import { FpsCounter } from '../ui/FpsCounter';

export class AceOfShadowScreen extends Container implements AppScreen {
    public static SCREEN_ID = 'ace-of-shadow';
    public static assetBundles = ['game-screen'];

    private readonly _aceOfShadow: AceOfShadow;
    private readonly _backButton: PrimaryButton;
    private readonly _fpsCounter: FpsCounter;

    constructor() {
        super();

        // Create and add the AceOfShadow component
        this._aceOfShadow = new AceOfShadow();
        this.addChild(this._aceOfShadow);

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

        // Position the AceOfShadow component
        this._aceOfShadow.resize(w, h);

        // Position back button in top-left corner
        this._backButton.x = 100;
        this._backButton.y = 80;
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
        // Clean up any resources
        this._aceOfShadow.destroy();
        this._fpsCounter.destroy();
    }
}
