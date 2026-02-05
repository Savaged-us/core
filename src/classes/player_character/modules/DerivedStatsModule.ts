/**
 * DerivedStatsModule - Handles character derived statistics
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Size calculations (getSize, getSizeHR)
 * - Derived boost accessor (getDerivedBoost)
 * - Load/Encumbrance (getLoadLimit, getBaseLoadLimit, getCurrentLoad, getMaxWeight, etc.)
 * - Wealth (getCurrentWealth, getCurrentWealthHR, getWealthDie)
 * - Bennies (getStartingBennies)
 * - Charisma/Social (getCharisma, getRippersReason, getRippersStatus)
 * - Movement (getPace, getPaceFlying, getPaceSwimming, getRunningDie)
 * - Combat stats (getParry, getParryHR, getShieldParryBonus)
 * - Sanity/Strain (getSanity, getCurrentStrain, getMaxStrain, getTotalStrain)
 * - Wounds (getWoundsMax)
 */

import type { PlayerCharacter } from '../player_character';
import { getDieValueFromIndex, getDieLabelFromIndex } from '../../../utils/Dice';
import { getSizeScaleModifier, getSizeName, getSizeExtraWounds } from '../../../utils/getSizeName';
import { fixFloat, FormatMoney } from '../../../utils/CommonFunctions';
import { BaseModule } from './BaseModule';

export class DerivedStatsModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Derived stats state is managed by PlayerCharacter's reset()
    }

    // ========================================
    // SIZE METHODS
    // ========================================

    /**
     * Get character's size value
     */
    getSize(): number {
        const char = this._char as any;
        let size = 0 + this.getDerivedBoost("size");

        for (const armor of char._armorPurchased) {
            if (armor.equippedArmor && armor.size > size) {
                size = armor.size;
            }
        }
        return size;
    }

    /**
     * Get human-readable size string with scale modifier
     */
    getSizeHR(): string {
        const size = this.getSize();
        const scaleModifier = getSizeScaleModifier(this.getSize());
        let scaleModifierString = "";
        if (scaleModifier != 0) {
            if (scaleModifier > 0)
                scaleModifierString = ", Size mod +" + scaleModifier.toString();
            else
                scaleModifierString = ", Size mod " + scaleModifier.toString();
        }
        return getSizeName(size) + " (" + size.toString() + scaleModifierString + ")";
    }

    // ========================================
    // DERIVED BOOST ACCESSOR
    // ========================================

    /**
     * Get a derived stat boost value by name
     */
    getDerivedBoost(derived: string): number {
        const char = this._char as any;
        switch (derived.toLowerCase().trim()) {
            case "toughness": {
                return char._derivedBaseBoosts.toughness;
            }
            case "pace": {
                return char._derivedBaseBoosts.pace;
            }
            case "scholarship": {
                return char._derivedBaseBoosts.scholarship;
            }
            case "starting_funds_multiplier": {
                return char._derivedBaseBoosts.starting_funds_multiplier;
            }
            case "pace_multiplier": {
                return char._derivedBaseBoosts.pace_multiplier;
            }
            case "wealth": {
                return char._derivedBaseBoosts.wealth;
            }
            case "sanity": {
                return char._derivedBaseBoosts.sanity;
            }
            case "pace_flying": {
                return char._derivedBaseBoosts.pace_flying;
            }
            case "pace_swimming": {
                return char._derivedBaseBoosts.pace_swimming;
            }
            case "armor": {
                return char._derivedBaseBoosts.armor;
            }
            case "heavy_armor": {
                return char._derivedBaseBoosts.heavy_armor;
            }
            case "charisma": {
                return char._derivedBaseBoosts.charisma;
            }
            case "parry": {
                return char._derivedBaseBoosts.parry;
            }
            case "size": {
                return char._derivedBaseBoosts.size;
            }
            case "rippers_reason": {
                return char._derivedBaseBoosts.rippers_reason;
            }
            case "rippers_status": {
                return char._derivedBaseBoosts.rippers_status;
            }
            case "strain": {
                return char._derivedBaseBoosts.strain;
            }
            default: {
                return 0;
            }
        }
    }

    // ========================================
    // LOAD / ENCUMBRANCE METHODS
    // ========================================

    /**
     * Get the character's load limit based on strength and settings
     */
    getLoadLimit(): number {
        const char = this._char as any;
        if (char.setting.primaryIsSWADE) {
            if (char.setting.settingIsEnabled("super_strength")) {
                switch (this.getEncumbranceStrength()) {
                    case 1: return 21;    // d4
                    case 2: return 41;    // d6
                    case 3: return 61;    // d8
                    case 4: return 81;    // d10
                    case 5: return 101;   // d12
                    case 6: return 126;   // d12+1
                    case 7: return 251;   // d12+2
                    case 8: return 501;   // d12+3
                    case 9: return 1001;  // d12+4
                    case 10: return 2501; // d12+5
                    case 11: return 5001; // d12+6
                    case 12: return 10001; // d12+7
                    case 13: return 25001; // d12+8
                    case 14: return 50001; // d12+9
                    case 15: return 100001; // d12+10
                    case 16: return 250001; // d12+11
                    // Note: original code had duplicate case 16, keeping d12+12 here
                }
            } else {
                return (this.getEncumbranceStrength() - 1) * 20 + 21;
            }
        } else {
            return getDieValueFromIndex(this.getEncumbranceStrength()) * 5;
        }
        return 0;
    }

    /**
     * Get the base load limit (without encumbrance bonus)
     */
    getBaseLoadLimit(): number {
        const char = this._char as any;
        if (char.setting.primaryIsSWADE) {
            if (char.setting.settingIsEnabled("super_strength")) {
                switch (char.getAttributeCurrent("strength")) {
                    case 1: return 21;    // d4
                    case 2: return 41;    // d6
                    case 3: return 61;    // d8
                    case 4: return 81;    // d10
                    case 5: return 101;   // d12
                    case 6: return 126;   // d12+1
                    case 7: return 251;   // d12+2
                    case 8: return 501;   // d12+3
                    case 9: return 1001;  // d12+4
                    case 10: return 2501; // d12+5
                    case 11: return 5001; // d12+6
                    case 12: return 10001; // d12+7
                    case 13: return 25001; // d12+8
                    case 14: return 50001; // d12+9
                    case 15: return 100001; // d12+10
                    case 16: return 250001; // d12+11
                    // Note: original code had duplicate case 16
                }
            } else {
                return (char.getAttributeCurrent("strength") - 1) * 20 + 21;
            }
        } else {
            return getDieValueFromIndex(char.getAttributeCurrent("strength")) * 5;
        }
        return 0;
    }

    /**
     * Get current load weight
     */
    getCurrentLoad(): number {
        const char = this._char as any;
        return fixFloat(char._loadCurrent);
    }

    /**
     * Get current combat load weight
     */
    getCurrentCombatLoad(): number {
        const char = this._char as any;
        return fixFloat(char._loadCurrentCombat);
    }

    /**
     * Get maximum weight capacity based on strength and super strength settings
     */
    getMaxWeight(): number {
        const char = this._char as any;

        // Check for SWADE Super Powers Companion (book 169)
        if (char.setting.book_is_used(169) && char.setting.settingIsEnabled("super_strength")) {
            switch (this.getEncumbranceStrength()) {
                case 1: return 20;      // d4
                case 2: return 40;      // d6
                case 3: return 60;      // d8
                case 4: return 80;      // d10
                case 5: return 100;     // d12
                case 6: return 125;     // d12+1
                case 7: return 250;     // d12+2
                case 8: return 500;     // d12+3
                case 9: return 1000;    // d12+4
                case 10: return 1 * 2000;   // d12+5
                case 11: return 2 * 2000;   // d12+6
                case 12: return 4 * 2000;   // d12+7
                case 13: return 8 * 2000;   // d12+8
                case 14: return 16 * 2000;  // d12+9
                case 15: return 32 * 2000;  // d12+10
                case 16: return 64 * 2000;  // d12+11
                case 17: return 125 * 2000; // d12+12
                case 18: return 250 * 2000; // d12+13
                case 19: return 500 * 2000; // d12+14
                case 20: return 1000 * 2000; // d12+15
            }
        }

        // Check for Deluxe Super Powers Companion (book 4)
        if (char.setting.book_is_used(4) && char.setting.settingIsEnabled("super_strength")) {
            switch (this.getEncumbranceStrength()) {
                case 1: return 80;      // d4
                case 2: return 160;     // d6
                case 3: return 240;     // d8
                case 4: return 320;     // d10
                case 5: return 400;     // d12
                case 6: return 500;     // d12+1
                case 7: return 1000;    // d12+2
                case 8: return 1 * 2000;    // d12+3
                case 9: return 2 * 2000;    // d12+4
                case 10: return 5 * 2000;   // d12+5
                case 11: return 10 * 2000;  // d12+6
                case 12: return 20 * 2000;  // d12+7
                case 13: return 50 * 2000;  // d12+8
                case 14: return 100 * 2000; // d12+9
                case 15: return 200 * 2000; // d12+10
                case 16: return 500 * 2000; // d12+11
                // Note: original code had duplicate case 16 for d12+12
            }
        }

        // Default: load limit * 4
        return this.getLoadLimit() * 4;
    }

    /**
     * Get encumbrance strength (base strength + bonus)
     */
    getEncumbranceStrength(): number {
        const char = this._char as any;
        return char.getAttributeCurrent("strength") + char._encumbranceStrengthBonus;
    }

    // ========================================
    // WEALTH METHODS
    // ========================================

    /**
     * Get current wealth value
     */
    getCurrentWealth(): number {
        const char = this._char as any;
        return fixFloat(char._wealthCurrent + char._wealthAdjusted);
    }

    /**
     * Get human-readable current wealth string
     */
    getCurrentWealthHR(): string {
        const char = this._char as any;
        return FormatMoney(this.getCurrentWealth(), char.setting);
    }

    /**
     * Get wealth die string (for wealth die systems)
     */
    getWealthDie(): string {
        const char = this._char as any;
        if (char.wealthDieBonus > 0) {
            return char.wealthDie + "+" + char.wealthDieBonus.toString();
        }
        return char.wealthDie;
    }

    // ========================================
    // BENNIES
    // ========================================

    /**
     * Get starting bennies count
     */
    getStartingBennies(): number {
        const char = this._char as any;
        return char._startingBennies;
    }

    // ========================================
    // CHARISMA / SOCIAL STATS
    // ========================================

    /**
     * Get charisma value
     */
    getCharisma(): number {
        return this.getDerivedBoost("charisma");
    }

    /**
     * Get Rippers Reason value
     */
    getRippersReason(): number {
        const char = this._char as any;
        const reasonBoost = this.getDerivedBoost("rippers_reason");
        const baseReason = getDieValueFromIndex(char.getAttributeCurrent("spirit")) / 2 + 2;
        return baseReason + reasonBoost;
    }

    /**
     * Get Rippers Status value
     */
    getRippersStatus(): number {
        return 2 + this.getDerivedBoost("rippers_status");
    }

    // ========================================
    // MOVEMENT STATS
    // ========================================

    /**
     * Get pace value
     */
    getPace(): string {
        const char = this._char as any;
        if (char._paceOverride && char._paceOverride.trim()) {
            return char._paceOverride;
        } else {
            let pace = (char._basePace * this.getDerivedBoost("pace_multiplier") + this.getDerivedBoost("pace"));
            if (pace < 1) {
                pace = 1;
            }
            return pace.toString();
        }
    }

    /**
     * Get flying pace value
     */
    getPaceFlying(): number {
        return this.getDerivedBoost("pace_flying");
    }

    /**
     * Get swimming pace value
     */
    getPaceSwimming(): number {
        const char = this._char as any;
        if (+this.getDerivedBoost("pace_swimming") > 0) {
            // Has explicit swimming pace boost
        } else if (char._is_aquatic) {
            return +this.getPace();
        }

        return (+this.getPace() / 2);
    }

    /**
     * Check if character has alternate swimming pace
     */
    hasAlternateSwimmingPace(): boolean {
        const char = this._char as any;
        if (this.getDerivedBoost("pace_swimming") > 0) {
            return true;
        }

        if (char._is_aquatic) {
            return true;
        }

        return false;
    }

    /**
     * Get running die string
     */
    getRunningDie(): string {
        const char = this._char as any;
        if (char._runningDieOverride.trim()) {
            return char._runningDieOverride;
        } else {
            return getDieLabelFromIndex(char._runningDie);
        }
    }

    // ========================================
    // COMBAT STATS
    // ========================================

    /**
     * Get parry value
     */
    getParry(): number {
        const char = this._char as any;
        let rv = 0;
        const fightingSkill = char.getSkill("Fighting");
        if (fightingSkill && fightingSkill.currentValue() > 0) {
            rv = Math.floor(getDieValueFromIndex(fightingSkill.currentValue()) / 2) + 2 + this.getDerivedBoost("parry");
        } else {
            rv = 2 + this.getDerivedBoost("parry");
        }

        return rv;
    }

    /**
     * Get human-readable parry string (includes shield bonus for Pathfinder)
     */
    getParryHR(): string {
        const char = this._char as any;
        const parry = this.getParry();
        let rv = parry.toString();

        if (char.setting.isPathfinder()) {
            const shieldParryBonus = char._parryBonusFromShield;
            if (shieldParryBonus != 0) {
                rv += " (" + char._parryBonusFromShield.toString() + ")";
            }
        }

        return rv;
    }

    /**
     * Get shield parry bonus
     */
    getShieldParryBonus(): number {
        const char = this._char as any;
        return char._parryBonusFromShield;
    }

    // ========================================
    // SANITY / STRAIN
    // ========================================

    /**
     * Get sanity value
     */
    getSanity(): number {
        const char = this._char as any;
        let sanityValue = getDieValueFromIndex(char.getAttributeCurrent("spirit")) / 2 + 2;
        sanityValue += this.getDerivedBoost("sanity");
        return sanityValue;
    }

    /**
     * Get current strain value
     */
    getCurrentStrain(): number {
        const char = this._char as any;
        return char._currentStrain;
    }

    /**
     * Get max strain value
     */
    getMaxStrain(): number {
        const char = this._char as any;
        return char._maxStrain;
    }

    /**
     * Get total strain from cyberware
     */
    getTotalStrain(): number {
        const char = this._char as any;
        let strain = 0;
        for (const cyber of char.getCyberwarePurchased()) {
            strain += cyber.getStrain();
        }
        return strain;
    }

    // ========================================
    // WOUNDS
    // ========================================

    /**
     * Get maximum wounds
     */
    getWoundsMax(): number {
        const char = this._char as any;
        return 3 + getSizeExtraWounds(this.getSize()) + char._derivedBaseBoosts.wounds;
    }
}
