import { Container, Sprite, Texture } from 'pixi.js';
import gsap from 'gsap';

export class AceOfShadow extends Container {
    private readonly cards: Sprite[] = [];
    private readonly bottomStack: Sprite[] = [];
    private readonly CARDS_COUNT = 144;
    private readonly CARD_SCALE = 0.5;
    private readonly cardAngles: number[] = [];
    private readonly cardOriginalPositions: { x: number; y: number }[] = [];
    private readonly bottomStackPositions: { x: number; y: number }[] = [];
    private readonly BASE_Z_INDEX = 1000; // Base z-index for original cards
    private readonly BOTTOM_STACK_Z_INDEX = 2000; // Base z-index for bottom stack
    private cardWidth = 0;
    private cardHeight = 0;
    private moveInterval: number | null = null;

    constructor() {
        super();

        // Create all cards and assign random angles
        for (let i = 0; i < this.CARDS_COUNT; i++) {
            const card = new Sprite(Texture.from('card-back.png'));
            card.anchor.set(0.5);
            card.scale.set(this.CARD_SCALE);
            card.interactive = true;
            card.cursor = 'pointer';
            card.zIndex = this.BASE_Z_INDEX + (this.CARDS_COUNT - i); // Set initial z-index

            card.on('pointerdown', () => this.onCardClick(card));

            this.addChild(card);
            this.cards.push(card);

            const randomAngle = (Math.random() * 20 - 10) * (Math.PI / 180);
            this.cardAngles.push(randomAngle);

            if (i === 0) {
                this.cardWidth = card.width;
                this.cardHeight = card.height;
            }
        }

        this.sortableChildren = true; // Enable z-index sorting
        this.updateCardPositions();
        this.startAutoMove();
    }

    private startAutoMove(): void {
        // Clear any existing interval
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
        }

        // Start new interval
        this.moveInterval = window.setInterval(() => {
            this.moveTopCard();
        }, 1000);
    }

    private moveTopCard(): void {
        if (this.cards.length === 0) return;

        const topCard = this.cards.reduce((prev, current) => (current.zIndex > prev.zIndex ? current : prev));

        const cardIndex = this.cards.indexOf(topCard);
        this.cards.splice(cardIndex, 1);
        this.bottomStack.push(topCard);

        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isHorizontal = screenWidth > screenHeight;
        const stackOffset = isHorizontal ? this.cardHeight * 2 : this.cardWidth * 2;

        const targetPos = this.calculateStackPosition(this.bottomStack.length - 1, stackOffset);
        const newZIndex = this.BOTTOM_STACK_Z_INDEX + this.bottomStack.length;
        topCard.zIndex = newZIndex;
        gsap.to(topCard, {
            x: targetPos.x,
            y: targetPos.y,
            rotation: (Math.random() * 20 - 10) * (Math.PI / 180),
            zIndex: newZIndex,
            duration: 2,
            ease: 'power2.inOut',
        });
    }

    private calculateStackPosition(index: number, baseX: number): { x: number; y: number } {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isHorizontal = screenWidth > screenHeight;

        if (isHorizontal) {
            // Horizontal layout
            const spacing = Math.min(
                this.cardWidth * 0.3,
                Math.max(1, (screenWidth - this.cardWidth) / (this.CARDS_COUNT - 1)),
            );

            return {
                x: spacing * index - (spacing * (this.CARDS_COUNT - 1)) / 2,
                y: baseX, // In horizontal mode, baseX is actually used as Y offset
            };
        } else {
            // Vertical layout - stack cards vertically with horizontal offset
            const spacing = Math.min(
                this.cardHeight * 0.3,
                Math.max(1, (screenHeight - this.cardHeight) / (this.CARDS_COUNT - 1)),
            );

            return {
                x: baseX, // Horizontal offset for different stacks
                y: spacing * index - (spacing * (this.CARDS_COUNT - 1)) / 2,
            };
        }
    }

    private updateCardPositions(): void {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const isHorizontal = screenWidth > screenHeight;

        // Position original stack
        this.cards.forEach((card, index) => {
            const position = this.calculateStackPosition(index, 0);
            this.cardOriginalPositions[index] = position;

            card.x = position.x;
            card.y = position.y;
            card.rotation = this.cardAngles[index];
            card.zIndex = this.BASE_Z_INDEX + (this.cards.length - index);
        });

        // Position bottom stack
        const stackOffset = isHorizontal
            ? this.cardHeight * 2 // Vertical offset in horizontal mode
            : this.cardWidth * 2; // Horizontal offset in vertical mode

        this.bottomStack.forEach((card, index) => {
            const position = this.calculateStackPosition(index, stackOffset);
            this.bottomStackPositions[index] = position;

            card.x = position.x;
            card.y = position.y;
            card.rotation = this.cardAngles[index];
            card.zIndex = this.BOTTOM_STACK_Z_INDEX + (index + 1);
        });
    }

    private onCardClick(card: Sprite): void {
        const cardIndex = this.cards.indexOf(card);
        console.log(cardIndex);
    }

    public resize(w: number, h: number): void {
        const isHorizontal = w > h;

        if (isHorizontal) {
            // Center horizontally
            this.x = w / 2;
            this.y = h * 0.2;
        } else {
            // Center vertically
            this.x = w * 0.3; // Move left to make room for second stack
            this.y = h / 2;
        }

        this.updateCardPositions();
    }

    public destroy(): void {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
        }

        [...this.cards, ...this.bottomStack].forEach((card) => {
            card.removeAllListeners();
            card.destroy();
        });

        this.cards.length = 0;
        this.bottomStack.length = 0;
        this.cardAngles.length = 0;
        this.cardOriginalPositions.length = 0;
        this.bottomStackPositions.length = 0;

        super.destroy();
    }
}
