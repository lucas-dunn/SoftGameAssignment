import { Container, Sprite, Text, Graphics, Texture, Assets } from 'pixi.js';
import gsap from 'gsap';
import { DialogueService } from '../../services/DialogueService';

export class DialogueRenderer extends Container {
    private readonly messageContainer: Container;
    private readonly avatarLeft: Container;
    private readonly avatarRight: Container;
    private readonly TEXT_BOX_PADDING = 20;
    private readonly MESSAGE_SPACING = 20;
    private readonly SCROLL_CONTAINER: Container;
    private readonly scrollBar: Graphics;
    private readonly scrollBarBg: Graphics;
    private readonly SCROLL_BAR_WIDTH = 8;
    private isDragging = false;
    private dragStartY = 0;
    private startScrollY = 0;
    private TEXT_BOX_WIDTH: number;
    private VISIBLE_HEIGHT: number;
    private static readonly textureCache: Map<string, Texture> = new Map();

    constructor() {
        super();

        this.TEXT_BOX_WIDTH = window.innerWidth * 0.8; // 80% of window width
        this.VISIBLE_HEIGHT = window.innerHeight * 0.9; // 90% of window height

        // Create mask for scrolling
        this.SCROLL_CONTAINER = new Container();
        const mask = new Graphics();
        this.addChild(mask);
        this.addChild(this.SCROLL_CONTAINER);

        this.messageContainer = new Container();
        this.avatarLeft = new Container();
        this.avatarRight = new Container();

        this.SCROLL_CONTAINER.addChild(this.messageContainer);
        this.SCROLL_CONTAINER.addChild(this.avatarLeft);
        this.SCROLL_CONTAINER.addChild(this.avatarRight);

        // Create scroll bar background
        this.scrollBarBg = new Graphics();
        this.addChild(this.scrollBarBg);

        // Create scroll bar
        this.scrollBar = new Graphics();
        this.scrollBar.interactive = true;
        this.scrollBar.cursor = 'pointer';
        this.addChild(this.scrollBar);

        // Setup scroll bar events
        this.scrollBar.on('pointerdown', this.onScrollBarDown.bind(this));
        window.addEventListener('mousemove', this.onScrollBarMove.bind(this));
        window.addEventListener('mouseup', this.onScrollBarUp.bind(this));

        // Setup mouse wheel scrolling
        this.on('wheel', this.onWheel.bind(this));

        // Add window resize listener
        window.addEventListener('resize', () => {
            this.updateLayout(window.innerWidth, window.innerHeight);
        });
    }
    private async loadTextureFromURL(url: string) {
        return new Promise<Texture>((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Ensure CORS compatibility if needed
            img.onload = () => {
                const texture = Texture.from(img);
                resolve(texture);
            };
            img.onerror = (err) => reject(err);
            img.src = url;
        });
    }

    private async loadTexture(url: string): Promise<Texture> {
        return await this.loadTextureFromURL(url);
    }

    public async setMessages(messages: any[]): Promise<void> {
        // Clear existing messages
        this.messageContainer.removeChildren();
        this.avatarLeft.removeChildren();
        this.avatarRight.removeChildren();

        let currentY = 0;

        // Create all messages at once
        for (const message of messages) {
            const messageDisplay = await this.createMessageDisplay(message);
            const avatar = DialogueService.getAvatarForCharacter(message.name);

            if (avatar) {
                try {
                    const texture = await this.loadTexture(avatar.url);
                    const avatarSprite = new Sprite(texture);
                    avatarSprite.width = 80;
                    avatarSprite.height = 80;

                    if (avatar.position === 'left') {
                        messageDisplay.x = 100;
                        avatarSprite.x = 10;
                        avatarSprite.y = currentY;
                        this.avatarLeft.addChild(avatarSprite);
                    } else {
                        messageDisplay.x = this.TEXT_BOX_WIDTH - messageDisplay.width - 100;
                        avatarSprite.x = this.TEXT_BOX_WIDTH - 90;
                        avatarSprite.y = currentY;
                        this.avatarRight.addChild(avatarSprite);
                    }
                } catch (error) {
                    console.error(`Failed to load avatar for ${message.name}:`, error);
                }
            }

            messageDisplay.y = currentY;
            messageDisplay.alpha = 0;
            this.messageContainer.addChild(messageDisplay);

            gsap.to(messageDisplay, {
                alpha: 1,
                duration: 0.3,
                ease: 'power2.out',
                delay: 0.1 * this.messageContainer.children.length,
            });

            currentY += messageDisplay.height + this.MESSAGE_SPACING;
        }

        this.scrollToBottom();
    }

    private async createMessageDisplay(message: any): Promise<Container> {
        const container = new Container();

        // Create text box background
        const background = new Graphics();
        background.lineStyle(1, 0x000000);
        background.beginFill(0xffffff, 0.9);

        // Create content container
        const content = new Container();

        // Add character name
        const nameText = new Text(message.name, {
            fontSize: 16,
            fontWeight: 'bold',
            fill: 0x4caf50,
        });
        content.addChild(nameText);

        // Process message text and emojis
        let currentX = 0;
        let currentY = 25;
        const lineHeight = 25;
        let maxY = currentY;
        let maxLineWidth = 0;

        const parts = message.text.split(/(\{[^}]+\})/);

        for (const part of parts) {
            if (part.startsWith('{') && part.endsWith('}')) {
                const emojiName = part.slice(1, -1);
                const emoji = DialogueService.getEmojiByName(emojiName);
                if (emoji) {
                    try {
                        const texture = await this.loadTexture(emoji.url);
                        const emojiSprite = new Sprite(texture);
                        emojiSprite.width = 20;
                        emojiSprite.height = 20;
                        emojiSprite.x = currentX;
                        emojiSprite.y = currentY;
                        content.addChild(emojiSprite);
                        currentX += 25;
                        maxLineWidth = Math.max(maxLineWidth, currentX);
                    } catch (error) {
                        console.error(`Failed to load emoji ${emojiName}:`, error);
                    }
                }
            } else if (part.trim()) {
                const words = part.split(' ');
                for (const word of words) {
                    if (!word.trim()) continue;

                    const wordText = new Text(word + ' ', {
                        fontSize: 16,
                        fill: 0x000000,
                    });

                    if (currentX + wordText.width > this.TEXT_BOX_WIDTH * 0.4) {
                        // Max width for text
                        currentX = 0;
                        currentY += lineHeight;
                        maxY = currentY;
                    }

                    wordText.x = currentX;
                    wordText.y = currentY;
                    content.addChild(wordText);
                    currentX += wordText.width;
                    maxLineWidth = Math.max(maxLineWidth, currentX);
                }
            }
        }

        // Draw background with proper dimensions
        background.drawRoundedRect(
            0,
            0,
            maxLineWidth + this.TEXT_BOX_PADDING * 2,
            maxY + lineHeight + this.TEXT_BOX_PADDING,
            10,
        );
        background.endFill();

        container.addChild(background);
        content.x = this.TEXT_BOX_PADDING;
        content.y = this.TEXT_BOX_PADDING / 2;
        container.addChild(content);

        return container;
    }

    private async updateLayout(w: number, h: number): Promise<void> {
        // Update dimensions
        this.TEXT_BOX_WIDTH = w * 0.8;
        this.VISIBLE_HEIGHT = h * 0.9;

        this.x = w * 0.1;
        this.y = h * 0.05;

        // Reposition all existing messages and avatars
        let currentY = 0;
        for (let i = 0; i < this.messageContainer.children.length; i++) {
            const messageDisplay = this.messageContainer.children[i];
            const leftAvatar = this.avatarLeft.children[i];
            const rightAvatar = this.avatarRight.children[i];

            messageDisplay.y = currentY;

            if (leftAvatar) {
                leftAvatar.x = 10;
                leftAvatar.y = currentY;
                messageDisplay.x = 100;
            } else if (rightAvatar) {
                rightAvatar.x = this.TEXT_BOX_WIDTH - 90;
                rightAvatar.y = currentY;
                messageDisplay.x = this.TEXT_BOX_WIDTH - messageDisplay.width - 100;
            }

            currentY += messageDisplay.height + this.MESSAGE_SPACING;
        }

        // Update scroll position
        this.scrollToBottom();

        // Update scroll bar position
        this.updateScrollBarPosition();
    }

    public resize(w: number, h: number): void {
        this.updateLayout(w, h);
    }

    private scrollToBottom(): void {
        const totalHeight = this.messageContainer.height;
        if (totalHeight > this.VISIBLE_HEIGHT) {
            gsap.to(this.SCROLL_CONTAINER, {
                y: this.VISIBLE_HEIGHT - totalHeight,
                duration: 0.3,
                ease: 'power2.out',
                onUpdate: () => this.updateScrollBarPosition(),
            });
        }
    }

    private onWheel(event: WheelEvent): void {
        event.preventDefault();
        const scrollAmount = event.deltaY;
        this.scrollContent(scrollAmount);
    }

    private onScrollBarDown(event: any): void {
        this.isDragging = true;
        this.dragStartY = event.global.y;
        this.startScrollY = this.SCROLL_CONTAINER.y;
    }

    private onScrollBarMove(event: MouseEvent): void {
        if (!this.isDragging) return;

        const deltaY = event.clientY - this.dragStartY;
        const scrollRatio = deltaY / (this.VISIBLE_HEIGHT - this.getScrollBarHeight());
        const maxScroll = this.VISIBLE_HEIGHT - this.messageContainer.height;

        const newY = Math.max(maxScroll, Math.min(0, this.startScrollY + scrollRatio * this.messageContainer.height));

        this.SCROLL_CONTAINER.y = newY;
        this.updateScrollBarPosition();
    }

    private onScrollBarUp(): void {
        this.isDragging = false;
    }

    private getScrollBarHeight(): number {
        const contentRatio = this.VISIBLE_HEIGHT / this.messageContainer.height;
        return Math.max(30, this.VISIBLE_HEIGHT * contentRatio);
    }

    private updateScrollBarPosition(): void {
        const scrollRatio = -this.SCROLL_CONTAINER.y / (this.messageContainer.height - this.VISIBLE_HEIGHT);
        const scrollBarY = scrollRatio * (this.VISIBLE_HEIGHT - this.getScrollBarHeight());

        // Update scroll bar background
        this.scrollBarBg
            .clear()
            .beginFill(0x000000, 0.1)
            .drawRoundedRect(this.TEXT_BOX_WIDTH + 10, 0, this.SCROLL_BAR_WIDTH, this.VISIBLE_HEIGHT, 4);

        // Update scroll bar
        this.scrollBar
            .clear()
            .beginFill(0x000000, 0.3)
            .drawRoundedRect(this.TEXT_BOX_WIDTH + 10, scrollBarY, this.SCROLL_BAR_WIDTH, this.getScrollBarHeight(), 4);
    }

    private scrollContent(deltaY: number): void {
        const maxScroll = this.VISIBLE_HEIGHT - this.messageContainer.height;
        const newY = Math.max(maxScroll, Math.min(0, this.SCROLL_CONTAINER.y - deltaY * 0.5));

        gsap.to(this.SCROLL_CONTAINER, {
            y: newY,
            duration: 0.3,
            ease: 'power2.out',
            onUpdate: () => this.updateScrollBarPosition(),
        });
    }

    public destroy() {
        window.removeEventListener('mousemove', this.onScrollBarMove.bind(this));
        window.removeEventListener('mouseup', this.onScrollBarUp.bind(this));
        window.removeEventListener('resize', () => {
            this.updateLayout(window.innerWidth, window.innerHeight);
        });

        for (const texture of DialogueRenderer.textureCache.values()) {
            texture.destroy(true);
        }
        DialogueRenderer.textureCache.clear();

        super.destroy();
    }
}
