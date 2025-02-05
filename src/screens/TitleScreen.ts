import gsap from 'gsap';
import { Container, Graphics, Rectangle, Texture, TilingSprite } from 'pixi.js';

import type { AppScreen } from '../navigation';
import { navigation } from '../navigation';
import { storage } from '../storage';
import { AudioButton } from '../ui/buttons/AudioButton';
import { PrimaryButton } from '../ui/buttons/PrimaryButton';
import { Title } from '../ui/Title';
import { i18n } from '../utils/i18n';
import { AceOfShadowScreen } from './AceOfShadowScreen';
import { MagicWordsScreen } from './MagicWordsScreen';
import { PhoenixFlameScreen } from './PhoenixFlameScreen';
import { FpsCounter } from '../ui/FpsCounter';

/** The screen presented at the start, after loading. */
export class TitleScreen extends Container implements AppScreen {
    /** A unique identifier for the screen */
    public static SCREEN_ID = 'title';
    /** An array of bundle IDs for dynamic asset loading. */
    public static assetBundles = ['title-screen'];

    /** A container to assign user interaction to */
    private readonly _hitContainer = new Container();
    /** The hit area to be used by the cannon */
    private readonly _hitArea: Rectangle;
    /** A background visual element */
    private readonly _background: TilingSprite;

    private _title!: Title;
    private _footer!: Graphics;

    private _playBtn!: PrimaryButton;
    private _audioBtn!: AudioButton;

    /** A container to group visual elements for easier animation */
    private _topAnimContainer = new Container();
    /** A container to group visual elements for easier animation */
    private _midAnimContainer = new Container();
    /** A container to group visual elements for easier animation */
    private _bottomAnimContainer = new Container();

    // Add these properties after other private properties
    private _chatBtn!: PrimaryButton;
    private _flameBtn!: PrimaryButton;
    private _fpsCounter!: FpsCounter;

    constructor() {
        super();

        // Add FPS counter first so it's on top
        this._fpsCounter = new FpsCounter();
        this._fpsCounter.zIndex = 200;
        this.addChild(this._fpsCounter);

        // Create the background
        this._background = new TilingSprite({
            texture: Texture.from('background-tile'),
            width: 64,
            height: 64,
            tileScale: {
                x: 2,
                y: 2,
            },
            interactive: true,
        });
        this.addChild(this._background);

        // Create the hit area
        this._hitArea = new Rectangle();

        // Prepare the container for interaction
        this._hitContainer.interactive = true;
        this._hitContainer.hitArea = this._hitArea;
        this.addChild(this._hitContainer);

        // Add visual details like footer, cannon, portholes
        this._buildDetails();

        // Add buttons like the play button and audio button
        this._buildButtons();

        // Add all parent containers to screen
        this.addChild(this._topAnimContainer, this._midAnimContainer, this._bottomAnimContainer);
    }

    /** Called before `show` function, can receive `data` */
    public prepare() {
        // Reset the positions of the group containers
        gsap.set(this._topAnimContainer, { y: -350 });
        gsap.set(this._midAnimContainer, { x: 200 });
        gsap.set(this._bottomAnimContainer, { y: 350 });
    }

    /** Called when the screen is being shown. */
    public async show() {
        // Kill tweens of the screen container
        gsap.killTweensOf(this);

        // Reset screen data
        this.alpha = 0;

        // Force the audio button to change icon based on audio mute state
        this._audioBtn.forceSwitch(storage.getStorageItem('muted'));

        // Tween screen into being visible
        await gsap.to(this, { alpha: 1, duration: 0.2, ease: 'linear' });

        // The data to be used in the upcoming tweens
        const endData = {
            x: 0,
            y: 0,
            duration: 0.75,
            ease: 'elastic.out(1, 0.5)',
        };

        // Tween the containers back to their original position
        gsap.to(this._topAnimContainer, endData);
        gsap.to(this._midAnimContainer, endData);
        gsap.to(this._bottomAnimContainer, endData);
    }

    /** Called when the screen is being hidden. */
    public async hide() {
        // Remove all listeners on the hit container so they don't get triggered outside of the title screen
        this._hitContainer.removeAllListeners();

        // Kill tweens of the screen container
        gsap.killTweensOf(this);

        // Tween screen into being invisible
        await gsap.to(this, { alpha: 0, duration: 0.2, ease: 'linear' });
    }

    /**
     * Gets called every time the screen resizes.
     * @param w - width of the screen.
     * @param h - height of the screen.
     */
    public resize(w: number, h: number) {
        // Position FPS counter in top-left corner
        this._fpsCounter.x = 10;
        this._fpsCounter.y = 10;

        // Fit background to screen
        this._background.width = w;
        this._background.height = h;

        // Set visuals to their respective locations

        this._title.view.x = w * 0.5;
        this._title.view.y = 145;

        this._footer.width = w * 1.2;
        this._footer.x = w * 0.5;
        this._footer.y = h;

        this._audioBtn.x = w - 40;
        this._audioBtn.y = 40;

        // Position play button
        this._playBtn.x = w * 0.5;
        this._playBtn.y = h * 0.7;

        // Position chat button above play button
        this._chatBtn.x = w * 0.5;
        this._chatBtn.y = this._playBtn.y - this._playBtn.height - 10; // 10px spacing between buttons

        // Position flame button above chat button
        this._flameBtn.x = w * 0.5;
        this._flameBtn.y = this._chatBtn.y - this._chatBtn.height - 10; // 10px spacing between buttons

        // Set hit area of hit container to fit screen
        // Leave a little room to prevent interaction bellow the cannon
        this._hitArea.width = w;
        this._hitArea.height = h;

        // Add these lines after the _playBtn positioning
        this._chatBtn.x = w * 0.3; // Position at 30% of screen width
        this._chatBtn.y = this._playBtn.y;

        this._flameBtn.x = w * 0.7; // Position at 70% of screen width
        this._flameBtn.y = this._playBtn.y;
    }

    /**
     * Calculate the angle between the cannon and the user's pointer position.
     * @param e - The event data sent from the event listener.
     */

    /** Add visual details to title screen. */
    private _buildDetails() {
        // Add the title card
        this._title = new Title();
        this._topAnimContainer.addChild(this._title.view);

        // Get random type of bubble

        // Use the type to assign a colour
        this._footer = new Graphics().ellipse(0, 0, 300, 125).fill({ color: 0x767676 });
        this._bottomAnimContainer.addChild(this._footer);
    }

    /** Add buttons to screen. */
    private _buildButtons() {
        this._audioBtn = new AudioButton();
        this._topAnimContainer.addChild(this._audioBtn);

        this._playBtn = new PrimaryButton({
            text: i18n.t('titlePlay'),
        });

        this._chatBtn = new PrimaryButton({
            text: i18n.t('Chat'),
        });

        this._flameBtn = new PrimaryButton({
            text: i18n.t('Flame'),
        });

        // Add button handlers
        this._playBtn.onPress.connect(() => navigation.goToScreen(AceOfShadowScreen));
        this._chatBtn.onPress.connect(() => navigation.goToScreen(MagicWordsScreen));
        this._flameBtn.onPress.connect(() => navigation.goToScreen(PhoenixFlameScreen));

        // Add all buttons to container
        this._bottomAnimContainer.addChild(this._playBtn);
        this._bottomAnimContainer.addChild(this._chatBtn);
        this._bottomAnimContainer.addChild(this._flameBtn);
    }

    public cleanup(): void {
        // Clean up resources
        this._fpsCounter.destroy();
        // ... rest of cleanup code ...
    }
}
