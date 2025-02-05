# Game Developer Assignment

A modern interactive application built with PixiJS 8, featuring multiple interactive screens and animations.

## Features

- 🎮 Multiple Interactive Screens
  - **Title Screen with Navigation**
    - Each task should be accessed via an in-game menu.
  - **Ace of Shadow Card Animation**
    - Create 144 sprites (NOT graphic objects) that are stacked on top of each other like cards in a deck.
    - The top card must cover the bottom card, but not completely.
    - Every 1 second, the top card should move to a different stack - the animation of the movement should take 2 seconds.
  - **Magic Words Dialogue System**
    - Create a system that allows you to combine text and images like custom emojis.
    - Use it to render a dialogue between characters with the data taken from this endpoint: [Magic Words API](https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords)
  - **Phoenix Flame Animation**
    - Make a particle-effect demo showing a great fire effect.
    - Keep the number of images at max 10 sprites on the screen at the same time.
- 🎨 Smooth Animations with GSAP
- 🔊 Audio Support
- 📱 Responsive Design
- 🎯 FPS Counter
- 🌐 i18n Support

## Getting Started

### Prerequisites

- Node.js (Latest LTS version recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/lucas-dunn/SoftGameAssignment.git
   cd interactive-pixijs-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run types` - Run TypeScript type checking

## Technology Stack

- [PixiJS](https://pixijs.com/) - 2D WebGL renderer
- [GSAP](https://greensock.com/gsap/) - Animation library
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Vite](https://vitejs.dev/) - Build tool and dev server
- [@pixi/sound](https://github.com/pixijs/sound) - Audio support
- [@pixi/ui](https://github.com/pixijs/ui) - UI components

## Project Structure

- `src/`
  - `screens/` - Different application screens
  - `game/` - Game-specific components and entities
  - `ui/` - Reusable UI components
  - `services/` - Application services
  - `utils/` - Utility functions
  - `assets/` - Asset management
  - `audio/` - Audio management
  - `navigation/` - Screen navigation system

## Contribution Guidelines

Contributions are welcome! Please follow these steps:
1. Fork the repository.
2. Create a new branch (`feature-branch` or `bugfix-branch`).
3. Commit your changes with clear messages.
4. Push the changes and create a pull request.

## License

This project is licensed under the MIT License.

## Author

Edward Guerrero

