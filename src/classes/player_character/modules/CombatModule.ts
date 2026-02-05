/**
 * CombatModule - Handles combat-related calculations and bonuses
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Unarmed combat bonuses (stepUnarmedToHit, stepUnarmedDamage, incrementUnarmedAP)
 * - Wound/Fatigue penalties (getWoundPenalty, getFatiguePenalty)
 */

import type { PlayerCharacter } from '../player_character';
import { BaseModule } from './BaseModule';

export class CombatModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Combat state is managed by PlayerCharacter's reset()
    }

    // ========================================
    // PENALTY METHODS
    // ========================================

    /**
     * Get fatigue penalty (same as wound penalty)
     */
    getFatiguePenalty(numberFatigue: number): number {
        return this.getWoundPenalty(numberFatigue);
    }

    /**
     * Get wound penalty (capped at 3)
     */
    getWoundPenalty(numberWounds: number): number {
        let woundPenalty = numberWounds;
        if (woundPenalty > 3) {
            woundPenalty = 3;
        }
        return woundPenalty;
    }

    // ========================================
    // UNARMED COMBAT METHODS
    // ========================================

    /**
     * Step up to-hit bonus for unarmed/natural attacks
     * Excludes bite, horns, tail lash, and breath attacks
     */
    stepUnarmedToHit(): void {
        const char = this._char as any;

        for (const attack of char._innateAttacks) {
            if (
                attack.addsStrength
                && attack.dontStepUnarmedDamage === false
                && attack.name.trim().toLowerCase().indexOf("bite") === -1
                && attack.name.trim().toLowerCase().indexOf("horns") === -1
                && attack.name.trim().toLowerCase().indexOf("tail lash") === -1
                && attack.name.trim().toLowerCase().indexOf("breath") === -1
            ) {
                attack.tempToHit += 1;
            }
        }

        for (const weapon of char._weaponsPurchased) {
            for (const attack of weapon.profiles) {
                if (
                    attack.add_strength_to_damage
                    && weapon.dontStepUnarmedDamage === false
                    && attack.name.trim().toLowerCase().indexOf("bite") === -1
                    && attack.name.trim().toLowerCase().indexOf("horns") === -1
                    && attack.name.trim().toLowerCase().indexOf("tail lash") === -1
                    && attack.name.trim().toLowerCase().indexOf("breath") === -1
                ) {
                    weapon.tempToHitModifier += 1;
                }
            }
        }
    }

    /**
     * Step up unarmed damage bonus
     */
    stepUnarmedDamage(): void {
        (this._char as any)._unarmedDamageStepBonus++;
    }

    /**
     * Increment unarmed AP bonus
     */
    incrementUnarmedAP(apBonus: number = 0): void {
        (this._char as any)._unarmedDamageAPBonus += apBonus;
    }
}
