/**
 * Shared types for PlayerCharacter modules
 *
 * These types are used across multiple modules and are extracted here
 * to avoid circular dependencies and provide a single source of truth.
 */

import { ValidityLevel } from '../../../enums/ValidityLevel';

/**
 * Validation count tracking by severity level
 */
export interface IValidationCounts {
    errors: number;
    warnings: number;
    information: number;
}

/**
 * Options for validation behavior
 */
export interface IValidationOptions {
    /** Skip certain validation checks (for performance) */
    skipEquipmentValidation?: boolean;
    /** Skip power/arcane validation */
    skipPowerValidation?: boolean;
    /** Only validate core traits (attributes, skills) */
    coreTraitsOnly?: boolean;
}

/**
 * Result of a validation run
 */
export interface IValidationResult {
    isValid: boolean;
    validLevel: ValidityLevel;
    counts: IValidationCounts;
}

/**
 * Module initialization options
 */
export interface IModuleInitOptions {
    /** Skip initial reset */
    skipReset?: boolean;
    /** Debug mode - extra logging */
    debug?: boolean;
}
