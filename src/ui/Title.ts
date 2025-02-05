import { Container, Text } from 'pixi.js';

import { i18n } from '../utils/i18n';

/**
 * Class to render the game's title
 */
export class Title {
    /* The container instance that is the root of all visuals in this class */
    public view = new Container();

    constructor() {
        // Create main header

        // Add top part of the title
        const bubboText = i18n.t('gameTitle');

        const topWrapper = new Container();
        const titleTop = new Text({
            text: bubboText,
            style: {
                fontSize: 90,
                fontWeight: '900',
                fontFamily: 'Bungee Regular',
            },
        });

        titleTop.anchor.set(0.5);
        topWrapper.addChild(titleTop);
        this.view.addChild(topWrapper);

        const bottomWrapper = new Container();

        bottomWrapper.y = titleTop.height + 20;

        // Create sub header
        const subtitle = new Text({
            text: i18n.t('gameSubtitle'),
            style: {
                fontSize: 32,
                fontWeight: '900',
                fontFamily: 'Bungee Regular',
            },
        });

        subtitle.anchor.set(0.5);
        subtitle.y = bottomWrapper.y + bottomWrapper.height - 30;
        this.view.addChild(subtitle);
    }
}
