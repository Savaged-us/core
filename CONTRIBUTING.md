# Contributing to @savaged/core

Thanks for your interest in contributing! This is the open-source character engine that powers [Savaged.us](https://savaged.us).

## Quick Start

```bash
# Clone the repo
git clone https://github.com/Savaged-us/core.git
cd core

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Watch mode (rebuilds on change)
npm run dev
```

## Try It Out

Run the examples to see the engine in action:

```bash
# Basic character creation
npx ts-node examples/basic-character.ts

# Full character with skills, edges, gear
npx ts-node examples/full-character.ts
```

## Project Structure

```
src/
├── classes/
│   ├── player_character/
│   │   ├── player_character.ts    # Main character class
│   │   └── modules/               # Modular features
│   │       ├── AttributeModule.ts
│   │       ├── SkillModule.ts
│   │       ├── EquipmentModule.ts
│   │       └── ...
│   └── ...                        # Edge, Hindrance, Skill, etc.
├── interfaces/                    # TypeScript interfaces
├── utils/                         # Dice, calculations, helpers
└── index.ts                       # Public exports
```

## Key Concepts

### PlayerCharacter

The main class uses a modular architecture. Each feature (attributes, skills, equipment, etc.) is handled by a dedicated module:

```typescript
import { PlayerCharacter } from '@savaged/core';

const pc = new PlayerCharacter();
pc.name = 'My Character';
pc.setAgility(3);  // d8 (uses AttributeModule)
```

### Export/Import

Characters can be serialized to JSON and restored:

```typescript
// Export
const data = character.exportObj();
const json = JSON.stringify(data);

// Import
const restored = new PlayerCharacter();
restored.importObj(JSON.parse(json));
```

## Development

### Running Tests

```bash
npm test                 # Run all tests
npm test -- --watch      # Watch mode
npm test -- --coverage   # With coverage report
```

### Code Style

- TypeScript strict mode is disabled (legacy codebase)
- Use meaningful variable names
- Add JSDoc comments for public methods
- Follow existing patterns in the codebase

### Making Changes

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Add tests for new functionality
5. Run `npm test` and `npm run build`
6. Submit a pull request

## What to Contribute

### Good First Issues

- Add unit tests for existing modules
- Improve TypeScript types (gradual strict mode adoption)
- Documentation improvements
- Bug fixes

### Feature Ideas

- Additional VTT export formats (Foundry, Roll20, etc.)
- Dice roller improvements
- Character sheet layout options
- Setting-specific rule modules

### Not in Scope (for core)

These belong in the main Savaged.us app, not the core engine:

- UI components
- Database/persistence
- User authentication
- Licensed content (book data)

## Questions?

- Open an issue for bugs or feature requests
- Join our [Discord](https://discord.gg/savaged) for discussion
- Check [Savaged.us](https://savaged.us) for the full app

## License

MIT — see [LICENSE](LICENSE)
