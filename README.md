# Winter Tower Defence Game

A tower defense game built with Next.js and React Canvas. Deploy towers, defend against waves of enemies, and survive the ultimate gauntlet!

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation & Running

```bash
# Clone the repository
git clone https://github.com/Ezksk1/towerdefence-v4.git
cd towerdefence-v4

# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev

# Open in browser
# Navigate to http://localhost:9002
```

### Build for Production

```bash
npm run build
npm start
```

## Features

- **60+ Tower Types**: From basic guns to ultimate weapons (Tesla towers, plasma cannons, etc.)
- **Dynamic Enemy Waves**: 500+ waves with procedurally generated difficulty scaling
- **Realistic Weapon Visuals**: Detailed plane models, tank renderings, missile effects
- **Canvas-Based Rendering**: Smooth, performant 2D graphics
- **Mobile Responsive**: Plays on desktop and mobile devices
- **Multiple Game Modes**: Custom path drawing, game save/load, adjustable game speed

## Game Controls

- **Draw Path**: Click to set enemy route
- **Place Tower**: Select tower type and click to deploy
- **Pause/Resume**: Control game flow
- **Speed Control**: Adjust game speed (0.5x - 2x)
- **Save/Load**: Save and load game progress

## Project Structure

```
.
├── app/                    # Next.js App Router
├── src/
│   ├── components/         # React components
│   │   ├── GameBoard.tsx   # Canvas rendering engine
│   │   ├── GameClient.tsx  # Main game logic
│   │   └── ResponsiveGameWrapper.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useGameLoop.ts  # Game update loop
│   │   └── use-toast.ts    # Toast notifications
│   └── lib/                # Game configuration
│       ├── game-config.ts  # Tower & enemy definitions
│       └── types.ts        # TypeScript types
├── package.json
└── tsconfig.json
```

## Technologies

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas 2D API
- **Build Tool**: pnpm / npm

## Performance

- Supports 500+ simultaneous enemies
- 60 FPS canvas rendering
- Optimized collision detection
- Efficient projectile tracking

## License

MIT

---

Enjoy defending your tower! 🎮
