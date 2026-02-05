import { PlayerCharacter } from '../index';

describe('PlayerCharacter', () => {
  let character: PlayerCharacter;

  beforeEach(() => {
    // Constructor accepts null for chargen data
    character = new PlayerCharacter(null);
  });

  describe('basic info', () => {
    it('should set and get name', () => {
      character.name = 'Test Character';
      expect(character.name).toBe('Test Character');
    });

    it('should set and get background', () => {
      character.background = 'Once a soldier, now a wanderer.';
      expect(character.background).toBe('Once a soldier, now a wanderer.');
    });

    it('should set and get description', () => {
      character.description = 'Tall, scarred, weathered face.';
      expect(character.description).toBe('Tall, scarred, weathered face.');
    });

    it('should set and get gender', () => {
      character.gender = 'Male';
      expect(character.gender).toBe('Male');
    });
  });

  describe('export/import', () => {
    it('should export to JSON object', () => {
      character.name = 'Export Test';
      character.background = 'Test Background';
      
      const exported = character.exportObj();
      
      expect(exported).toBeDefined();
      expect(exported.name).toBe('Export Test');
      expect(exported.background).toBe('Test Background');
    });

    it('should import from JSON object', () => {
      const data = {
        name: 'Imported Character',
        background: 'Imported Background',
        description: 'Imported Description',
      };
      
      character.importObj(data as any, null);
      
      expect(character.name).toBe('Imported Character');
      expect(character.background).toBe('Imported Background');
    });

    it('should round-trip export/import', () => {
      character.name = 'Round Trip';
      character.background = 'Should survive the journey';
      character.description = 'Testing persistence';
      
      const exported = character.exportObj();
      
      const newCharacter = new PlayerCharacter(null);
      newCharacter.importObj(exported, null);
      
      expect(newCharacter.name).toBe(character.name);
      expect(newCharacter.background).toBe(character.background);
      expect(newCharacter.description).toBe(character.description);
    });
  });
});
