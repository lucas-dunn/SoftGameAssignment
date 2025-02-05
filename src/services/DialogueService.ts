interface DialogueMessage {
    name: string;
    text: string;
}

interface Emoji {
    name: string;
    url: string;
}

interface Avatar {
    name: string;
    url: string;
    position: 'left' | 'right';
}

interface DialogueData {
    dialogue: DialogueMessage[];
    emojies: Emoji[];
    avatars: Avatar[];
}

export class DialogueService {
    private static data: DialogueData | null = null;
    private static readonly JSON_URL = 'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords';

    private static async loadData(): Promise<void> {
        if (this.data) return;

        try {
            const response = await fetch(this.JSON_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.data = await response.json();
        } catch (error) {
            console.error('Error loading dialogue data:', error);
            // Provide empty default data if load fails
            this.data = {
                dialogue: [],
                emojies: [],
                avatars: [],
            };
        }
    }

    public static async getDialogue(): Promise<DialogueMessage[]> {
        await this.loadData();
        return this.data?.dialogue || [];
    }

    public static async getEmojis(): Promise<Emoji[]> {
        await this.loadData();
        return this.data?.emojies || [];
    }

    public static async getAvatars(): Promise<Avatar[]> {
        await this.loadData();
        return this.data?.avatars || [];
    }

    public static getAvatarForCharacter(name: string): Avatar | undefined {
        return this.data?.avatars.find((avatar) => avatar.name === name);
    }

    public static getEmojiByName(name: string): Emoji | undefined {
        return this.data?.emojies.find((emoji) => emoji.name === name);
    }
}
