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

## Usage

```typescript
import { PlayerCharacter } from '@savaged/core';
import type { IChargenData, IJSONPlayerCharacterExport } from '@savaged/core';

// Create a new character
const character = new PlayerCharacter(chargenData);

// Set attributes
character.setAttributeValue('agility', 2);  // d8

// Add edges and hindrances
character.edgeInstall(edgeId, options);
character.hindranceInstall(hindranceId, specify, isMajor);

// Export to JSON
const exportData: IJSONPlayerCharacterExport = character.exportObj();
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
