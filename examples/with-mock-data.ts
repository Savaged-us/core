/**
 * Example: Building a character with mock chargen data
 * 
 * This shows how contributors can test the character engine
 * using the provided mock data (no licensed content needed).
 * 
 * Run with: npx ts-node examples/with-mock-data.ts
 */

import { 
  PlayerCharacter, 
  createMockChargenData,
  MOCK_SKILLS,
  MOCK_EDGES,
  MOCK_HINDRANCES,
} from '../src';

// Get mock chargen data
const chargenData = createMockChargenData();

console.log('=== MOCK CHARGEN DATA AVAILABLE ===\n');
console.log(`Skills: ${MOCK_SKILLS.map(s => s.name).join(', ')}`);
console.log(`\nEdges: ${MOCK_EDGES.map(e => e.name).join(', ')}`);
console.log(`\nHindrances: ${MOCK_HINDRANCES.map(h => h.name).join(', ')}`);

// Create a character with the mock data
// Note: Full chargen integration requires the real IChargenData structure
// This example shows basic character properties
console.log('\n\n=== CREATING CHARACTER ===\n');

const character = new PlayerCharacter(null);

// Basic info
character.name = 'Dax "Ironside" Mercer';
character.background = `Former soldier turned mercenary.
Lost his squad in an ambush, now works alone.
Quiet, methodical, always has an exit plan.`;
character.description = 'Tall, muscular, close-cropped grey hair. Missing two fingers on left hand.';
character.gender = 'Male';
character.age = '42';
character.playerName = 'Test Player';

// Export the character
const exported = character.exportObj();

console.log('Character created:');
console.log(`  Name: ${character.name}`);
console.log(`  Gender: ${character.gender}`);
console.log(`  Age: ${character.age}`);
console.log(`  Background: ${character.background.split('\n')[0]}...`);

// Show what contributors could work on
console.log('\n\n=== CONTRIBUTION OPPORTUNITIES ===\n');
console.log('1. VTT EXPORTS - Add export formats:');
console.log('   - Roll20 character sheet JSON');
console.log('   - Foundry VTT actor data');
console.log('   - Fantasy Grounds XML');
console.log('   - Owlbear Rodeo character');

console.log('\n2. CALCULATIONS - Improve/test:');
console.log('   - Derived stats (Pace, Parry, Toughness)');
console.log('   - Encumbrance calculations');
console.log('   - Wound penalties');
console.log('   - Skill modifiers from edges/hindrances');

console.log('\n3. VALIDATION - Add tests for:');
console.log('   - Edge requirement checking');
console.log('   - Point buy limits (attributes, skills, hindrances)');
console.log('   - Rank requirements');

console.log('\n4. IMPORT/EXPORT - Support more formats:');
console.log('   - Import from other character builders');
console.log('   - Export to PDF character sheets');
console.log('   - Markdown/text export for forums');

console.log('\n\nRun tests: npm test');
console.log('Build: npm run build');
