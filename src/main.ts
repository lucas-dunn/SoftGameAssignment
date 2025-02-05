import { Application } from 'pixi.js';

export const app = new Application();


/** Setup app and initialise assets */
async function init() {
    // Initialize the app
    await app.init({
        resolution: Math.max(window.devicePixelRatio, 2),
        backgroundColor: 0xffffff,
    });

    // Add pixi canvas element to the document's body
    document.body.appendChild(app.canvas);

}

// Init everything
init();
