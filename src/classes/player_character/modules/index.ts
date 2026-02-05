/**
 * PlayerCharacter Modules
 *
 * This directory contains extracted functionality from the PlayerCharacter class.
 * Each module handles a specific domain of character management.
 *
 * Pattern: Delegation - PlayerCharacter instantiates modules and delegates
 * method calls to them, preserving the public API.
 */

// Base infrastructure
export { BaseModule } from './BaseModule';
export * from './types';

// Modules
export { ValidationModule, IValidationCount, IValidationCounts } from './ValidationModule';
export { ImportExportModule } from './ImportExportModule';
export { AttributeModule } from './AttributeModule';
export { SkillModule } from './SkillModule';
export { EquipmentModule } from './EquipmentModule';
export { ArmorToughnessModule } from './ArmorToughnessModule';
export { EdgeHindranceModule } from './EdgeHindranceModule';
export { ArcaneModule } from './ArcaneModule';
export { SuperPowerModule, ISPCPowerSetTable } from './SuperPowerModule';
export { AdvancementModule } from './AdvancementModule';
export { PowerModule } from './PowerModule';
export { SpecialAbilityModule, ISpecialAbilitySimple } from './SpecialAbilityModule';
export { ContainerStorageModule } from './ContainerStorageModule';
export { DisplayModule } from './DisplayModule';
export { DerivedStatsModule } from './DerivedStatsModule';
export { FactionModule } from './FactionModule';
export { LanguageModule } from './LanguageModule';
export { CharacterInfoModule } from './CharacterInfoModule';
export { InnateWeaponModule } from './InnateWeaponModule';
export { CalcOrchestratorModule } from './CalcOrchestratorModule';
export { GenericExportModule } from './GenericExportModule';
export { EdgeDataModule, IEdgeData } from './EdgeDataModule';
export { HindranceDataModule, IHindranceData } from './HindranceDataModule';
export { LegacyPurchaseModule } from './LegacyPurchaseModule';
export { PurchaseModule } from './PurchaseModule';
export { CombatModule } from './CombatModule';
export { FrameworkModule } from './FrameworkModule';
export { GearEnhancementModule } from './GearEnhancementModule';
