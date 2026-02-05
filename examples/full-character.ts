/**
 * Full example: Create and export a complete character
 * 
 * Run with: npx ts-node examples/full-character.ts
 * 
 * Note: This is a library for character data manipulation.
 * The full Savaged.us app provides the UI and chargen data (edges, skills, etc.)
 * This example shows the core export/import functionality.
 */

import { PlayerCharacter } from '../src';

// Create character (null = no chargen data, good for import/export testing)
const character = new PlayerCharacter(null);

// === BASIC INFO ===
character.name = 'Zara "Spark" Chen';
character.background = `Former corporate security, now freelance.
Augmented reflexes and a conscience that won't quit.
Left Mishima Corp after discovering their human trafficking operation.`;
character.description = `Athletic build, short black hair with a streak of electric blue.
Mirrorshades hide cybernetic eyes. Moves like a predator.`;
character.gender = 'Female';
character.age = '28';
character.playerName = 'Demo Player';

// === EXPORT ===
const exported = character.exportObj();

console.log('=== ZARA "SPARK" CHEN ===\n');
console.log(`Name: ${character.name}`);
console.log(`Player: ${character.playerName}`);
console.log(`Gender: ${character.gender}, Age: ${character.age}`);
console.log(`\nBackground:\n${character.background}`);
console.log(`\nDescription:\n${character.description}`);

// === IMPORT TEST ===
console.log('\n=== IMPORT/EXPORT TEST ===');

// Create a new character and import the exported data
const restored = new PlayerCharacter(null);
restored.importObj(exported, null);

console.log(`\nRestored name: ${restored.name}`);
console.log(`Restored background: ${restored.background.substring(0, 50)}...`);
console.log(`Match: ${restored.name === character.name && restored.background === character.background ? '✓ PASS' : '✗ FAIL'}`);

// === FULL JSON ===
console.log('\n=== FULL JSON EXPORT ===');
console.log(JSON.stringify(exported, null, 2).substring(0, 1000) + '\n...(truncated)');
