# @savaged/core

The core character building engine for Savage Worlds RPG, extracted from [Savaged.us](https://savaged.us).

## Features

- **PlayerCharacter class** — Full character state management with modular architecture
- **Character sheet generation** — SVG/PDF export utilities  
- **Dice utilities** — Die step calculations, damage parsing
- **Type definitions** — Complete TypeScript interfaces for Savage Worlds data

## Installation

```bash
npm install @savaged/core
```

## Quick Start

```typescript
import { PlayerCharacter } from '@savaged/core';

// Create a character (pass null for empty chargen data)
const character = new PlayerCharacter(null);

// Set basic info
character.name = 'Rex Steele';
character.background = 'Hard-boiled detective, seen too much.';
character.gender = 'Male';
character.age = '45';

// Export to JSON
const exported = character.exportObj();

// Import into a new character
const restored = new PlayerCharacter(null);
restored.importObj(exported, null);
```

## Try the Examples

```bash
git clone https://github.com/Savaged-us/core.git
cd core && npm install
npx ts-node examples/basic-character.ts
```

## Architecture

The PlayerCharacter class uses a modular architecture:

```
PlayerCharacter
├── ImportExportModule    — Save/load character data
├── ValidationModule      — Character validity checks
├── AttributeModule       — Attribute management
├── SkillModule           — Skill assignments
├── EdgeHindranceModule   — Edge/hindrance selection
├── ArcaneModule          — Arcane backgrounds & powers
├── EquipmentModule       — Gear, weapons, armor
└── DerivedStatsModule    — Calculated values (Pace, Parry, Toughness)
```

## License

MIT — See [LICENSE](./LICENSE) for details.

## Contributing

Contributions welcome! Please read our [contributing guidelines](./CONTRIBUTING.md) first.

## Related

- [Savaged.us](https://savaged.us) — The full character builder application
- [Savage Worlds](https://peginc.com) — The RPG system by Pinnacle Entertainment Group

## Community

- [Discord](https://discord.gg/savaged) — Join our community
- [Issues](https://github.com/Savaged-us/core/issues) — Report bugs or request features
