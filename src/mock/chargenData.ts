/**
 * Mock chargen data for testing and development
 * 
 * This provides sample edges, hindrances, skills, etc. so contributors
 * can test the character engine without needing the real (licensed) book data.
 * 
 * All content here is generic/made-up and not from any published book.
 */

// Note: We don't use the full IChargenData interface here because it's
// tightly coupled to the database schema. This mock data is for reference.

export const MOCK_SKILLS = [
  { id: 1, name: 'Fighting', attribute: 'agility', core: true, description: 'Hand-to-hand combat' },
  { id: 2, name: 'Shooting', attribute: 'agility', core: true, description: 'Ranged weapons' },
  { id: 3, name: 'Athletics', attribute: 'agility', core: true, description: 'Running, climbing, swimming' },
  { id: 4, name: 'Stealth', attribute: 'agility', core: true, description: 'Sneaking and hiding' },
  { id: 5, name: 'Thievery', attribute: 'agility', core: false, description: 'Lockpicking, pickpocketing' },
  { id: 6, name: 'Notice', attribute: 'smarts', core: true, description: 'Perception and awareness' },
  { id: 7, name: 'Research', attribute: 'smarts', core: false, description: 'Finding information' },
  { id: 8, name: 'Repair', attribute: 'smarts', core: false, description: 'Fixing things' },
  { id: 9, name: 'Survival', attribute: 'smarts', core: false, description: 'Wilderness survival' },
  { id: 10, name: 'Persuasion', attribute: 'spirit', core: true, description: 'Convincing others' },
  { id: 11, name: 'Intimidation', attribute: 'spirit', core: false, description: 'Scaring others' },
  { id: 12, name: 'Taunt', attribute: 'smarts', core: false, description: 'Provoking enemies' },
];

export const MOCK_EDGES = [
  { 
    id: 1, 
    name: 'Alertness', 
    type: 'background',
    requirements: '',
    summary: '+2 to Notice rolls',
    effects: 'skill_bonus:notice:2',
  },
  { 
    id: 2, 
    name: 'Ambidextrous', 
    type: 'background',
    requirements: 'agility:d8',
    summary: 'Ignore -2 penalty for using off-hand',
    effects: '',
  },
  { 
    id: 3, 
    name: 'Brawny', 
    type: 'background',
    requirements: 'strength:d6,vigor:d6',
    summary: '+1 Size, +1 Toughness',
    effects: 'size:1,toughness:1',
  },
  { 
    id: 4, 
    name: 'Quick', 
    type: 'background',
    requirements: 'agility:d8',
    summary: 'Redraw initiative cards of 5 or lower',
    effects: '',
  },
  { 
    id: 5, 
    name: 'Combat Reflexes', 
    type: 'combat',
    requirements: 'seasoned',
    summary: '+2 to recover from Shaken',
    effects: 'shaken_recovery:2',
  },
  { 
    id: 6, 
    name: 'First Strike', 
    type: 'combat',
    requirements: 'agility:d8',
    summary: 'Free attack when foe moves into reach',
    effects: '',
  },
  { 
    id: 7, 
    name: 'Sweep', 
    type: 'combat',
    requirements: 'strength:d8,fighting:d8',
    summary: 'Attack all adjacent foes at -2',
    effects: '',
  },
  { 
    id: 8, 
    name: 'Marksman', 
    type: 'combat',
    requirements: 'seasoned,shooting:d8',
    summary: '+1 to Shooting if no movement',
    effects: '',
  },
];

export const MOCK_HINDRANCES = [
  { 
    id: 1, 
    name: 'All Thumbs', 
    type: 'minor',
    summary: '-2 to use mechanical/electrical devices',
  },
  { 
    id: 2, 
    name: 'Bad Eyes', 
    type: 'minor',
    summary: '-2 to sight-based tasks without glasses',
  },
  { 
    id: 3, 
    name: 'Cautious', 
    type: 'minor',
    summary: 'Always plans, never takes unnecessary risks',
  },
  { 
    id: 4, 
    name: 'Code of Honor', 
    type: 'major',
    summary: 'Keeps word, never betrays allies',
  },
  { 
    id: 5, 
    name: 'Greedy', 
    type: 'minor',
    summary: 'Argues over loot, takes extra share',
  },
  { 
    id: 6, 
    name: 'Heroic', 
    type: 'major',
    summary: 'Always helps those in need',
  },
  { 
    id: 7, 
    name: 'Loyal', 
    type: 'minor',
    summary: 'Never abandons allies',
  },
  { 
    id: 8, 
    name: 'Overconfident', 
    type: 'major',
    summary: 'Believes they can do anything',
  },
  { 
    id: 9, 
    name: 'Wanted', 
    type: 'major',
    summary: 'Hunted by authorities or criminals',
  },
  { 
    id: 10, 
    name: 'Yellow', 
    type: 'major',
    summary: '-2 to Fear checks, flees from danger',
  },
];

export const MOCK_WEAPONS = [
  { id: 1, name: 'Knife', damage: 'Str+d4', weight: 1, cost: 25, notes: '' },
  { id: 2, name: 'Short Sword', damage: 'Str+d6', weight: 2, cost: 100, notes: '' },
  { id: 3, name: 'Long Sword', damage: 'Str+d8', weight: 3, cost: 200, notes: '' },
  { id: 4, name: 'Great Axe', damage: 'Str+d10', weight: 7, cost: 300, notes: 'AP 2, Two hands' },
  { id: 5, name: 'Pistol', damage: '2d6', range: '12/24/48', weight: 2, cost: 150, notes: 'AP 1' },
  { id: 6, name: 'Rifle', damage: '2d8', range: '24/48/96', weight: 8, cost: 300, notes: 'AP 2' },
  { id: 7, name: 'Shotgun', damage: '3d6', range: '12/24/48', weight: 6, cost: 200, notes: '+2 Shooting' },
  { id: 8, name: 'Bow', damage: '2d6', range: '12/24/48', weight: 2, cost: 75, notes: '' },
];

export const MOCK_ARMOR = [
  { id: 1, name: 'Leather Jacket', armor: 1, weight: 5, cost: 50, notes: 'Torso, arms' },
  { id: 2, name: 'Chain Mail', armor: 3, weight: 20, cost: 250, notes: 'Torso, arms, legs' },
  { id: 3, name: 'Plate Armor', armor: 4, weight: 35, cost: 500, notes: 'Full body, -2 pace' },
  { id: 4, name: 'Kevlar Vest', armor: 2, weight: 5, cost: 200, notes: 'Torso only' },
  { id: 5, name: 'Combat Helmet', armor: 3, weight: 2, cost: 100, notes: 'Head only' },
  { id: 6, name: 'Small Shield', armor: 1, weight: 4, cost: 50, notes: '+1 Parry' },
  { id: 7, name: 'Large Shield', armor: 2, weight: 8, cost: 100, notes: '+2 Parry, -1 to attack' },
];

/**
 * Create a minimal chargen data object for testing
 * 
 * Note: The full IChargenData is complex and tied to the database schema.
 * This provides reference data that contributors can use for testing
 * without needing the full chargen infrastructure.
 */
export function createMockChargenData() {
  return {
    skills: MOCK_SKILLS,
    edges: MOCK_EDGES,
    hindrances: MOCK_HINDRANCES,
    weapons: MOCK_WEAPONS,
    armor: MOCK_ARMOR,
  };
}
