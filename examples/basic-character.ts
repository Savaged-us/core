/**
 * Basic example: Create a character and export it
 * 
 * Run with: npx ts-node examples/basic-character.ts
 */

import { PlayerCharacter } from '../src';

// Create a new character (pass null for empty chargen data)
const character = new PlayerCharacter(null);

// Set basic info
character.name = 'Rex Steele';
character.background = 'Hard-boiled detective. Former cop turned private eye. Seen too much.';
character.description = 'Weathered face, trench coat, always has a cigarette.';
character.gender = 'Male';
character.age = '45';

// Export to JSON
const exported = character.exportObj();

console.log('=== CHARACTER CREATED ===\n');
console.log(`Name: ${character.name}`);
console.log(`Gender: ${character.gender}`);
console.log(`Age: ${character.age}`);
console.log(`\nBackground:\n${character.background}`);
console.log(`\nDescription:\n${character.description}`);

console.log('\n=== JSON EXPORT (partial) ===');
console.log(JSON.stringify({
  name: exported.name,
  gender: exported.gender,
  age: exported.age,
  background: exported.background,
  description: exported.description,
}, null, 2));
