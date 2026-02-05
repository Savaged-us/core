/**
 * @savaged/core
 * 
 * Core character building engine for Savage Worlds RPG
 */

// ============================================================================
// Main Classes
// ============================================================================
export { PlayerCharacter } from './classes/player_character/player_character';
export { PlayerCharacterRace } from './classes/player_character/player_character_race';
export { PlayerCharacterSetting } from './classes/player_character/player_character_setting';
export { PlayerCharacterFramework } from './classes/player_character/player_character_framework';
export { PlayerCharacterAdvancement } from './classes/player_character/player_character_advancement';

// Character components
export { Edge } from './classes/player_character/edge';
export { Hindrance } from './classes/player_character/hindrance';
export { Skill } from './classes/player_character/skill';
export { Power } from './classes/player_character/power';
export { ArcaneBackground } from './classes/player_character/arcane_background';
export { Armor } from './classes/player_character/armor';
export { Weapon } from './classes/player_character/weapon';
export { Gear } from './classes/player_character/gear';
export { Cyberware } from './classes/player_character/cyberware';

// Support classes
export { Book } from './classes/book';
export { BestiaryEntry } from './classes/bestiary_entry';
export { VehicleEntry } from './classes/vehicle_entry';

// ============================================================================
// Interfaces
// ============================================================================
export type { IBaseAttributes } from './interfaces/IBaseAttributes';
export type { IChargenData } from './interfaces/IChargenData';
export type { ICharacterState } from './interfaces/ICharacterState';
export type { IDerivedAttributes } from './interfaces/IDerivedAttributes';
export type { 
    IJSONPlayerCharacterExport,
    IJSONArmorExport,
    IJSONWeaponExport,
    IJSONGearExport,
    IEdgeExport,
    IHindranceExport,
} from './interfaces/IJSONPlayerCharacterExport';
export type { IJSONSettingExport } from './interfaces/IJSONSettingExport';
export type { ISkillAssignmentExport } from './interfaces/ISkillExport';
export type { IExportStatsOutput } from './interfaces/IExportStatsOutput';
export type { IPeoplePlacesThings } from './interfaces/IPeoplePlacesThings';
export type { IJournalEntry } from './interfaces/IJournalEntry';
export type { IValidationMessage } from './interfaces/IValidationMessage';
export type { IPromptSpecification } from './interfaces/IPromptSpecification';
export type { ISkillListImport } from './interfaces/ISkillListImport';

// Class interfaces
export type { IChargenEdge, IChargenEdgeObjectVars } from './classes/player_character/edge';
export type { IChargenHindrance, IChargenHindranceOptions } from './classes/player_character/hindrance';
export type { IChargenArmor, IArmorObjectVars } from './classes/player_character/armor';
export type { IChargenWeapon, IWeaponObjectVars } from './classes/player_character/weapon';
export type { IChargenGear, IGearObjectVars } from './classes/player_character/gear';
export type { IChargenPowers, IChargenPowerVars } from './classes/player_character/power';
export type { IChargenArcaneBackground } from './classes/player_character/arcane_background';
export type { IChargenRace, IRaceOptions } from './classes/player_character/player_character_race';
export type { IChargenFramework } from './classes/player_character/player_character_framework';
export type { IBook } from './classes/book';
export type { IBestiaryEntry } from './classes/bestiary_entry';
export type { IVehicleEntry, IVehicleObjectVars } from './classes/vehicle_entry';

// ============================================================================
// Utilities
// ============================================================================
export { 
    getDieIndexFromLabel,
    getDieLabelFromIndex,
    getDieValueFromIndex,
} from './utils/Dice';

export { generateUUID } from './utils/generateUUID';
export { ParseDamageString } from './utils/ParseDamageString';
export { getSizeName, getSizeScaleModifier, getSizeExtraWounds } from './utils/getSizeName';
export { simplifyDice } from './utils/simplifyDice';
export { simplifyDamage } from './utils/simplifyDamage';
export { getDisplayText } from './utils/parseEscapedString';
export { sortByObjectName } from './utils/sortByObjectName';

export {
    replaceAll,
    capitalCase,
    fixFloat,
    FormatMoney,
    getRankName,
} from './utils/CommonFunctions';

// ============================================================================
// Enums
// ============================================================================
export { ValidityLevel } from './enums/ValidityLevel';

// ============================================================================
// Mock data for testing (no licensed content)
// ============================================================================
export { 
  createMockChargenData, 
  MOCK_SKILLS, 
  MOCK_EDGES, 
  MOCK_HINDRANCES,
  MOCK_WEAPONS,
  MOCK_ARMOR,
} from './mock/chargenData';
