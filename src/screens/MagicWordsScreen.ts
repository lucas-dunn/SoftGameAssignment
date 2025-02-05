import { Container } from 'pixi.js';
import gsap from 'gsap';
import type { AppScreen } from '../navigation';
import { PrimaryButton } from '../ui/buttons/PrimaryButton';
import { navigation } from '../navigation';
import { TitleScreen } from './TitleScreen';
import { DialogueRenderer } from '../game/entities/DialogueRenderer';
import { DialogueService } from '../services/DialogueService';
import { FpsCounter } from '../ui/FpsCounter';

export class MagicWordsScreen extends Container implements AppScreen {
    public static SCREEN_ID = 'magic-words';
    public static assetBundles = ['game-screen'];

    private readonly _backButton: PrimaryButton;
    private readonly _dialogueRenderer: DialogueRenderer;
    private readonly _fpsCounter: FpsCounter;

    constructor() {
        super();

        // Add dialogue renderer
        this._dialogueRenderer = new DialogueRenderer();
        this.addChild(this._dialogueRenderer);

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
        this._backButton.scale.set(0.75);
        this._backButton.onPress.connect(() => {
            navigation.goToScreen(TitleScreen);
        });

        this.addChild(this._backButton);
    }

    public async prepare(): Promise<void> {
        // Fetch dialogue when screen is prepared
        const messages = await DialogueService.getDialogue();
        await this._dialogueRenderer.setMessages(messages);
    }

    public resize(w: number, h: number): void {
        // Position FPS counter in top-left corner
        this._fpsCounter.x = 10;
        this._fpsCounter.y = 10;

        // Position back button in top-left corner
        this._backButton.x = 100;
        this._backButton.y = 80;

        // Resize dialogue renderer
        this._dialogueRenderer.resize(w, h);
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

    public cleanup(): void {
        // Clean up resources
        this._fpsCounter.destroy();
    }
}
