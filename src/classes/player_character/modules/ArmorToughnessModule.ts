/**
 * ArmorToughnessModule - Handles character armor and toughness calculations
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Toughness calculations (getToughnessValue, getToughnessAndArmor, getToughness)
 * - Armor value calculations (getArmorValue, getArmorValueHR, isHeavyArmor)
 * - Toughness modifiers (noteToughnessSource, getToughnessModifiers)
 * - Armor getters (getArmor, getArmorString, getArmorStrength, getArmorMinStrengthPenalty)
 * - Pathfinder armor methods
 * - Heavy armor/weapon labels
 */

import type { PlayerCharacter, IArmorInformation, IAlternateArmorData } from '../player_character';
import type { Armor } from '../armor';
import type { IToughnessModifier } from '../../../interfaces/IExportStatsOutput';
import { getDieValueFromIndex, getDieIndexFromLabel } from '../../../utils/Dice';
import { getPathfinderArmorLabel } from '../../../utils/PathfinderFunctions';
import { ValidityLevel } from '../../../enums/ValidityLevel';
import { BaseModule } from './BaseModule';

/**
 * Sort function for armor locations - sorts by value descending
 */
function armorLocationSortFunction(a: IArmorInformation, b: IArmorInformation): number {
    if (a.value < b.value) {
        return 1;
    } else if (a.value > b.value) {
        return -1;
    } else {
        return 0;
    }
}

export class ArmorToughnessModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Armor/toughness state is managed by PlayerCharacter's reset()
    }

    /**
     * Record a source of toughness modification
     */
    noteToughnessSource(source: string, value: number): void {
        const char = this._char as any;

        let name = "";
        let type = "";
        if (source.indexOf(":") > -1) {
            const split = source.split(":");
            type = split[0].trim();
            name = split[1].trim();
        } else {
            name = source;
        }

        for (const item of char._toughnessModifierList) {
            if (
                item.type.toLowerCase().trim() === type
                &&
                item.name.toLowerCase().trim() === name
            ) {
                item.value += value;
                return;
            }
        }
        char._toughnessModifierList.push({
            type: type,
            name: name,
            value: value,
        });
    }

    /**
     * Get list of toughness modifiers
     */
    getToughnessModifiers(): IToughnessModifier[] {
        return (this._char as any)._toughnessModifierList;
    }

    /**
     * Calculate toughness value
     */
    getToughnessValue(withArmor: boolean = false): number {
        const char = this._char as any;
        let toughness = Math.floor(getDieValueFromIndex(char.getAttributeCurrent("vigor")) / 2) + 2 + char.getDerivedBoost("toughness");

        if (withArmor) {
            toughness += this.getArmorValue();
        }

        return toughness;
    }

    /**
     * Get toughness and armor as formatted string
     */
    getToughnessAndArmor(
        noHeavyLabel: boolean = false,
        addArmor: number = 0,
        addToughness: number = 0,
    ): string {
        const toughnessValue = this.getToughnessValue(true) + addToughness + addArmor;
        const armorValue = this.getArmorValue() + addArmor;
        const armorValueHR = this.getArmorValueHR("", noHeavyLabel, addArmor);

        if (armorValue > 0) {
            return toughnessValue.toString() + " (" + armorValueHR + ")";
        } else {
            return toughnessValue.toString();
        }
    }

    /**
     * Get armor value for a location
     */
    getArmorValue(location: string = "torso"): number {
        const char = this._char as any;
        const armorValue = 0;
        if (char.naturalArmorIsHeavy) {
            return armorValue + char.getDerivedBoost("heavy_armor");
        } else {
            return armorValue + char.getDerivedBoost("armor");
        }
    }

    /**
     * Get human-readable armor value
     */
    getArmorValueHR(
        location: string = "torso",
        noHeavyLabel: boolean = false,
        addArmor: number = 0,
    ): string {
        const char = this._char as any;
        let heavyLabel = "";
        if (this.isHeavyArmor()) {
            heavyLabel = " " + this.getHeavyArmorLabel();
            if (noHeavyLabel) {
                heavyLabel = "";
            }
        }

        if (char.naturalArmorIsHeavy) {
            const armor = addArmor + char.getDerivedBoost("heavy_armor");
            return armor.toString() + heavyLabel;
        } else {
            const armor = addArmor + char.getDerivedBoost("armor");
            return armor.toString() + heavyLabel;
        }
    }

    /**
     * Get toughness heavy armor label
     */
    getToughnessHeavyLabel(): string {
        if (this.isHeavyArmor()) {
            return this.getHeavyArmorLabel();
        } else {
            return "";
        }
    }

    /**
     * Check if character has heavy armor equipped
     */
    isHeavyArmor(): boolean {
        const char = this._char as any;
        if (char.naturalArmorIsHeavy)
            return true;
        for (const armor of char._armorPurchased) {
            if (armor.equippedArmor && armor.heavy)
                return true;
        }

        return false;
    }

    /**
     * Get heavy armor label (M.D.C. for Rifts, Heavy otherwise)
     */
    getHeavyArmorLabel(): string {
        const char = this._char as any;
        if (
            char.setting
            && char.setting.settingIsEnabled("rifts_mdc")
        ) {
            return "M.D.C.";
        }

        return "Heavy";
    }

    /**
     * Get heavy weapon label (M.D.C. for Rifts, HW otherwise)
     */
    getHeavyWeaponLabel(): string {
        const char = this._char as any;
        if (
            char.setting
            && char.setting.settingIsEnabled("rifts_mdc")
        ) {
            return "M.D.C.";
        }

        return "HW";
    }

    /**
     * Get formatted toughness string
     */
    getToughness(): string {
        const toughnessValue = this.getToughnessValue(false);
        const armorValue = this.getArmorValue("torso");

        if (armorValue > 0) {
            return toughnessValue.toString() + " (" + armorValue.toString() + ")";
        }
        return "n/a";
    }

    /**
     * Get all purchased armor
     */
    getArmor(): Armor[] {
        return (this._char as any)._armorPurchased;
    }

    /**
     * Get armor names as comma-separated string
     */
    getArmorString(): string {
        const rv: string[] = [];

        for (const armor of this.getArmor()) {
            rv.push((armor as any).name);
        }

        rv.sort();

        return rv.join(", ");
    }

    /**
     * Get effective strength for armor purposes
     */
    getArmorStrength(): number {
        const char = this._char as any;
        return char.getAttributeCurrent("strength") + char._armorStrengthBonus;
    }

    /**
     * Calculate armor minimum strength penalty
     */
    getArmorMinStrengthPenalty(): number {
        const char = this._char as any;
        if (char.setting && char.setting.primaryIsSWADE && char.setting.usesMinimumStrength) {
            let minStrength = 0;
            for (const armor of char._armorPurchased) {
                if (armor.equippedArmor || armor.equippedSecondary || armor.equippedPrimary || armor.equippedScreen) {
                    if (getDieIndexFromLabel(armor.getMinimumStrength()) > minStrength) {
                        minStrength = getDieIndexFromLabel(armor.getMinimumStrength());
                    }
                }
            }
            const penalty = minStrength - this.getArmorStrength();

            if (penalty > 0) {
                return penalty;
            } else {
                return 0;
            }
        }
        return 0;
    }

    /**
     * Get current Pathfinder armor level (0-3)
     */
    getPathfinderCurrentArmorLevel(): number {
        const char = this._char as any;
        let level = 0;
        for (const armor of char._armorPurchased) {
            if (armor.equippedArmor || armor.equippedScreen || armor.equippedPrimary || armor.equippedSecondary) {
                if (armor.pfArmorType > level)
                    level = armor.pfArmorType;
            }
        }

        return level;
    }

    /**
     * Get current Pathfinder armor level as human-readable string
     */
    getPathfinderCurrentArmorLevelHR(): string {
        return getPathfinderArmorLabel(this.getPathfinderCurrentArmorLevel());
    }

    /**
     * Get effective Pathfinder armor level (after interference adjustments)
     */
    getPathfinderEffectiveCurrentArmorLevel(): number {
        const char = this._char as any;
        let level = 0;
        for (const armor of char._armorPurchased) {
            if (armor.equippedArmor || armor.equippedScreen || armor.equippedPrimary || armor.equippedSecondary) {
                if (armor.pfArmorType > level)
                    level = armor.pfArmorType;
            }
        }

        level -= char._derivedBaseBoosts.pathfinder_armor_interference_mod;

        if (level < 0)
            level = 0;
        return level;
    }

    /**
     * Get effective Pathfinder armor level as human-readable string
     */
    getPathfinderEffectiveCurrentArmorLevelHR(): string {
        return getPathfinderArmorLabel(this.getPathfinderEffectiveCurrentArmorLevel());
    }

    /**
     * Calculate armor values and apply armor effects
     */
    calcArmor(): void {
        const char = this._char as any;

        char._alternateArmorProfiles = [];

        char._alternateArmorProfiles.push({
            name: "Unarmored",
            strength: char.getAttributeCurrentHR("strength"),
            armor: char._derivedBaseBoosts.armor,
            toughnessAndArmor: this.getToughnessAndArmor(true),
            isHeavyArmor: char.naturalArmorIsHeavy,
        });

        const currentArmorLevel = this.getPathfinderCurrentArmorLevel();

        char.validationMessages = [];

        if (char._derivedBaseBoosts.pathfinder_armor_interference_mod > 0 && currentArmorLevel > 0) {
            char.addValidationMessage(
                ValidityLevel.Information,
                "Your Arcane Armor has adjusted your effective worn armor from " + getPathfinderArmorLabel(currentArmorLevel) + " to " + getPathfinderArmorLabel(currentArmorLevel - char._derivedBaseBoosts.pathfinder_armor_interference_mod) + " in regards to Armor Interference",
                "/character/creator/armor",
            );
        }

        for (const traitName in char.pathfinderArmorInterference) {
            const traitObj = char.pathfinderArmorInterference[traitName];

            let adjMod = 0;

            switch (currentArmorLevel - char._derivedBaseBoosts.pathfinder_armor_interference_mod) {
                case 3: {
                    // heavy armor
                    adjMod = traitObj.heavy;
                    if (adjMod != 0) {
                        char.addValidationMessage(
                            ValidityLevel.Warning,
                            "You have will have a " + adjMod + " penalty to your " + traitName + " rolls due to Pathfinder " + getPathfinderArmorLabel(currentArmorLevel) + " Armor Interference",
                            "/character/creator/armor",
                        );
                    }
                    break;
                }
                case 2: {
                    // medium armor
                    adjMod = traitObj.medium;
                    if (adjMod != 0) {
                        char.addValidationMessage(
                            ValidityLevel.Warning,
                            "You have will have a " + adjMod + " penalty to your " + traitName + " rolls due to Pathfinder " + getPathfinderArmorLabel(currentArmorLevel) + " Armor Interference",
                            "/character/creator/armor",
                        );
                    }
                    break;
                }
                case 1: {
                    // light armor
                    adjMod = traitObj.light;
                    if (adjMod != 0) {
                        char.addValidationMessage(
                            ValidityLevel.Warning,
                            "You have will have a " + adjMod + " penalty to your " + traitName + " rolls due to Pathfinder " + getPathfinderArmorLabel(currentArmorLevel) + "Armor Interference",
                            "/character/creator/armor",
                        );
                    }
                    break;
                }
            }

            if (adjMod != 0) {
                switch (traitName) {
                    case "agility":
                    case "smarts":
                    case "spirit":
                    case "strength":
                    case "vigor": {
                        char.addTraitBonus(traitName, adjMod, "Armor Interference");
                        break;
                    }
                    default: {
                        char.addSkillBonus(traitName, adjMod, null, "Armor Interference");
                        break;
                    }
                }
            }
        }

        for (const item of char._armorPurchased) {
            char._loadCurrent += item.getTotalWeight();
            char._loadCurrentCombat += item.getTotalCombatWeight();
            char._wealthCurrent -= item.getTotalBuyCost();

            char._alternateArmorProfiles.push({
                name: item.name,
                strength: item.setStrength ? item.setStrength : char.getAttributeCurrentHR("strength"),
                armor: char._derivedBaseBoosts.armor + item.armorValue,
                toughnessAndArmor: this.getToughnessAndArmor(true, item.armorValue, item.toughness),
                isHeavyArmor: item.heavy,
            });

            if (item.equippedArmor) {
                let stackable = false;
                if (item.stacksWithOtherArmor || item.isEnergyScreen) {
                    stackable = true;
                }

                char._hasArmorEquipped = true;
                const toughness = item.getToughness();
                if (toughness) {
                    char._derivedBaseBoosts.toughness += toughness;
                    this.noteToughnessSource(
                        "Armor Property: " + item.getName(),
                        toughness,
                    );
                }

                let itemArmorValue = item.getArmorValue();
                let itemHeavyArmorValue = 0;
                if (item.heavy)
                    itemHeavyArmorValue = item.getArmorValue();
                if (char.naturalArmorIsHeavy) {
                    if (item.heavy != char.naturalArmorIsHeavy) {
                        char._equippedArmorIsNotHeavyValidation = true;
                        itemArmorValue = 0;
                    }
                }
                if (item.coversHead && !item.isShield) {
                    char.armorLocations.head.push({
                        name: item.name,
                        value: itemArmorValue,
                        heavyValue: itemHeavyArmorValue,
                        adjustedValue: 0,
                        stackable: stackable,
                        minStrength: item.minimumStrength,
                    });
                }
                if (item.coversFace && !item.isShield) {
                    char.armorLocations.face.push({
                        name: item.name,
                        value: itemArmorValue,
                        heavyValue: itemHeavyArmorValue,
                        adjustedValue: 0,
                        stackable: stackable,
                        minStrength: item.minimumStrength,
                    });
                }
                if (item.coversTorso && !item.isShield) {
                    char.armorLocations.torso.push({
                        name: item.name,
                        value: itemArmorValue,
                        heavyValue: itemHeavyArmorValue,
                        adjustedValue: 0,
                        stackable: stackable,
                        minStrength: item.minimumStrength,
                    });
                }
                if (item.coversArms && !item.isShield) {
                    char.armorLocations.arms.push({
                        name: item.name,
                        value: itemArmorValue,
                        heavyValue: itemHeavyArmorValue,
                        adjustedValue: 0,
                        stackable: stackable,
                        minStrength: item.minimumStrength,
                    });
                }
                if (item.coversLegs && !item.isShield) {
                    char.armorLocations.legs.push({
                        name: item.name,
                        value: itemArmorValue,
                        heavyValue: itemHeavyArmorValue,
                        adjustedValue: 0,
                        stackable: stackable,
                        minStrength: item.minimumStrength,
                    });
                }
            }

            // calculate Shield Bonuses
            if (item.isShield) {
                char._hasArmorEquipped = true;
                if (item.equippedPrimary || item.equippedSecondary) {
                    char._derivedBaseBoosts.parry += item.getShieldParryBonus();
                    char._parryBonusFromShield += item.getShieldParryBonus();
                }
            }
        }

        // Sort each location by the value in reverse order
        char.armorLocations.head.sort(armorLocationSortFunction);
        char.armorLocations.face.sort(armorLocationSortFunction);
        char.armorLocations.torso.sort(armorLocationSortFunction);
        char.armorLocations.arms.sort(armorLocationSortFunction);
        char.armorLocations.legs.sort(armorLocationSortFunction);

        if (char.setting.primaryIsSWADE) {
            this.calculateSWADEArmorValues();
        } else {
            this.calculateDeluxeArmorValues();
        }

        this.calculateToughnessValueLocations();
        char._derivedBaseBoosts.armor += char.armorValues.torso;
        char._derivedBaseBoosts.heavy_armor += char.armorValuesHeavy.torso;
    }

    /**
     * Calculate SWADE armor values - highest + half of second highest (if not stackable)
     */
    private calculateSWADEArmorValues(): void {
        const char = this._char as any;

        if (char.armorLocations.head.length > 0) {
            char.armorValues.head += char.armorLocations.head[0].value;
            char.armorValuesHeavy.head += char.armorLocations.head[0].heavyValue;
            char.armorLocations.head[0].adjustedValue = char.armorLocations.head[0].value;
            if (char.armorLocations.head.length > 1) {
                if (char.armorLocations.head[1] && !char.armorLocations.head[1].stackable) {
                    char.armorValues.head = Math.floor(char.armorLocations.head[1].value / 2);
                    char.armorValuesHeavy.head = Math.floor(char.armorLocations.head[1].heavyValue / 2);
                    char.armorLocations.head[1].adjustedValue = Math.floor(char.armorLocations.head[1].value / 2);
                } else {
                    char.armorValues.head += char.armorLocations.head[1].value;
                    char.armorValuesHeavy.head += char.armorLocations.head[1].heavyValue;
                    char.armorLocations.head[1].adjustedValue = char.armorLocations.head[1].value;
                }
            }
        }

        if (char.armorLocations.face.length > 0) {
            char.armorValues.face += char.armorLocations.face[0].value;
            char.armorValuesHeavy.face += char.armorLocations.face[0].heavyValue;
            char.armorLocations.face[0].adjustedValue = char.armorLocations.face[0].value;
            if (char.armorLocations.face.length > 1) {
                if (char.armorLocations.face[1] && !char.armorLocations.face[1].stackable) {
                    char.armorValues.face = Math.floor(char.armorLocations.face[1].value / 2);
                    char.armorValuesHeavy.face = Math.floor(char.armorLocations.face[1].heavyValue / 2);
                    char.armorLocations.face[1].adjustedValue = Math.floor(char.armorLocations.face[1].value / 2);
                } else {
                    char.armorValues.face += char.armorLocations.face[1].value;
                    char.armorValuesHeavy.face += char.armorLocations.face[1].heavyValue;
                    char.armorLocations.face[1].adjustedValue = char.armorLocations.face[1].value;
                }
            }
        }

        if (char.armorLocations.torso.length > 0) {
            char.armorValues.torso += char.armorLocations.torso[0].value;
            char.armorValuesHeavy.torso += char.armorLocations.torso[0].heavyValue;
            char.armorLocations.torso[0].adjustedValue = char.armorLocations.torso[0].value;
            if (char.armorLocations.torso.length > 1) {
                if (char.armorLocations.torso[1] && !char.armorLocations.torso[1].stackable) {
                    char.armorValues.torso += Math.floor(char.armorLocations.torso[1].value / 2);
                    char.armorValuesHeavy.torso = Math.floor(char.armorLocations.torso[1].heavyValue / 2);
                    char.armorLocations.torso[1].adjustedValue = Math.floor(char.armorLocations.torso[1].value / 2);
                } else {
                    char.armorValues.torso += char.armorLocations.torso[1].value;
                    char.armorValuesHeavy.torso += char.armorLocations.torso[1].heavyValue;
                    char.armorLocations.torso[1].adjustedValue = char.armorLocations.torso[1].value;
                }
            }
        }

        if (char.armorLocations.arms.length > 0) {
            char.armorValues.arms += char.armorLocations.arms[0].value;
            char.armorValuesHeavy.arms += char.armorLocations.arms[0].heavyValue;
            char.armorLocations.arms[0].adjustedValue = char.armorLocations.arms[0].value;
            if (char.armorLocations.arms.length > 1) {
                if (char.armorLocations.arms[1] && !char.armorLocations.arms[1].stackable) {
                    char.armorValues.arms += Math.floor(char.armorLocations.arms[1].value / 2);
                    char.armorValuesHeavy.arms = Math.floor(char.armorLocations.arms[1].heavyValue / 2);
                    char.armorLocations.arms[1].adjustedValue = Math.floor(char.armorLocations.arms[1].value / 2);
                } else {
                    char.armorValues.arms += char.armorLocations.arms[1].value;
                    char.armorValuesHeavy.arms += char.armorLocations.arms[1].heavyValue;
                    char.armorLocations.arms[1].adjustedValue = char.armorLocations.arms[1].value;
                }
            }
        }

        if (char.armorLocations.legs.length > 0) {
            char.armorValues.legs += char.armorLocations.legs[0].value;
            char.armorValuesHeavy.legs += char.armorLocations.legs[0].heavyValue;
            char.armorLocations.legs[0].adjustedValue = char.armorLocations.legs[0].value;
            if (char.armorLocations.legs.length > 1) {
                if (char.armorLocations.legs[1] && !char.armorLocations.legs[1].stackable) {
                    char.armorValues.legs += Math.floor(char.armorLocations.legs[1].value / 2);
                    char.armorValuesHeavy.legs = Math.floor(char.armorLocations.legs[1].heavyValue / 2);
                    char.armorLocations.legs[1].adjustedValue = Math.floor(char.armorLocations.legs[1].value / 2);
                } else {
                    char.armorValues.legs += char.armorLocations.legs[1].value;
                    char.armorValuesHeavy.legs += char.armorLocations.legs[1].heavyValue;
                    char.armorLocations.legs[1].adjustedValue = char.armorLocations.legs[1].value;
                }
            }
        }
    }

    /**
     * Calculate Deluxe armor values - only highest non-stackable counts
     */
    private calculateDeluxeArmorValues(): void {
        const char = this._char as any;

        // Head
        let armorValue = 0;
        let gotPrimaryArmor = false;
        for (const itemIndex in char.armorLocations.head) {
            if (char.armorLocations.head[itemIndex].stackable) {
                armorValue += char.armorLocations.head[itemIndex].value;
                char.armorLocations.head[itemIndex].adjustedValue = char.armorLocations.head[itemIndex].value;
            } else {
                if (!gotPrimaryArmor) {
                    armorValue += char.armorLocations.head[itemIndex].value;
                    char.armorLocations.head[itemIndex].adjustedValue = char.armorLocations.head[itemIndex].value;
                    gotPrimaryArmor = true;
                }
            }
        }
        char.armorValues.head = armorValue;

        // Face
        armorValue = 0;
        gotPrimaryArmor = false;
        for (const itemIndex in char.armorLocations.face) {
            if (char.armorLocations.face[itemIndex].stackable) {
                armorValue += char.armorLocations.face[itemIndex].value;
                char.armorLocations.face[itemIndex].adjustedValue = char.armorLocations.face[itemIndex].value;
            } else {
                if (!gotPrimaryArmor) {
                    armorValue += char.armorLocations.face[itemIndex].value;
                    char.armorLocations.face[itemIndex].adjustedValue = char.armorLocations.face[itemIndex].value;
                    gotPrimaryArmor = true;
                }
            }
        }
        char.armorValues.face = armorValue;

        // Torso
        armorValue = 0;
        gotPrimaryArmor = false;
        for (const itemIndex in char.armorLocations.torso) {
            if (char.armorLocations.torso[itemIndex].stackable) {
                armorValue += char.armorLocations.torso[itemIndex].value;
                char.armorLocations.torso[itemIndex].adjustedValue = char.armorLocations.torso[itemIndex].value;
            } else {
                if (!gotPrimaryArmor) {
                    armorValue += char.armorLocations.torso[itemIndex].value;
                    char.armorLocations.torso[itemIndex].adjustedValue = char.armorLocations.torso[itemIndex].value;
                    gotPrimaryArmor = true;
                }
            }
        }
        char.armorValues.torso = armorValue;

        // Arms
        armorValue = 0;
        gotPrimaryArmor = false;
        for (const itemIndex in char.armorLocations.arms) {
            if (char.armorLocations.arms[itemIndex].stackable) {
                armorValue += char.armorLocations.arms[itemIndex].value;
                char.armorLocations.arms[itemIndex].adjustedValue = char.armorLocations.arms[itemIndex].value;
            } else {
                if (!gotPrimaryArmor) {
                    armorValue += char.armorLocations.arms[itemIndex].value;
                    char.armorLocations.arms[itemIndex].adjustedValue = char.armorLocations.arms[itemIndex].value;
                    gotPrimaryArmor = true;
                }
            }
        }
        char.armorValues.arms = armorValue;

        // Legs
        armorValue = 0;
        gotPrimaryArmor = false;
        for (const itemIndex in char.armorLocations.legs) {
            if (char.armorLocations.legs[itemIndex].stackable) {
                armorValue += char.armorLocations.legs[itemIndex].value;
                char.armorLocations.legs[itemIndex].adjustedValue = char.armorLocations.legs[itemIndex].value;
            } else {
                if (!gotPrimaryArmor) {
                    armorValue += char.armorLocations.legs[itemIndex].value;
                    char.armorLocations.legs[itemIndex].adjustedValue = char.armorLocations.legs[itemIndex].value;
                    gotPrimaryArmor = true;
                }
            }
        }
        char.armorValues.legs = armorValue;
    }

    /**
     * Calculate toughness values for each body location
     */
    private calculateToughnessValueLocations(): void {
        const char = this._char as any;

        if (char.armorValues.head > 0) {
            char.toughnessValues.head = (this.getToughnessValue(false) + char.armorValues.head) + " (" + char.armorValues.head + ")";
        } else {
            char.toughnessValues.head = this.getToughnessValue(false).toString();
        }

        if (char.armorValues.face > 0) {
            char.toughnessValues.face = (this.getToughnessValue(false) + char.armorValues.face) + " (" + char.armorValues.face + ")";
        } else {
            char.toughnessValues.face = this.getToughnessValue(false).toString();
        }

        if (char.armorValues.torso > 0) {
            char.toughnessValues.torso = (this.getToughnessValue(false) + char.armorValues.torso) + " (" + char.armorValues.torso + ")";
        } else {
            char.toughnessValues.torso = this.getToughnessValue(false).toString();
        }

        if (char.armorValues.arms > 0) {
            char.toughnessValues.arms = (this.getToughnessValue(false) + char.armorValues.arms) + " (" + char.armorValues.arms + ")";
        } else {
            char.toughnessValues.arms = this.getToughnessValue(false).toString();
        }

        if (char.armorValues.legs > 0) {
            char.toughnessValues.legs = (this.getToughnessValue(false) + char.armorValues.legs) + " (" + char.armorValues.legs + ")";
        } else {
            char.toughnessValues.legs = this.getToughnessValue(false).toString();
        }
    }

    // ========================================
    // ARMOR EQUIPMENT METHODS
    // ========================================

    /**
     * Check if character has armor equipped
     */
    hasArmorEquipped(): boolean {
        return (this._char as any)._hasArmorEquipped;
    }

    /**
     * Get alternate armor profile by name
     */
    getAlternateArmorProfile(armorName: string): IAlternateArmorData | null {
        const char = this._char as any;
        for (const armor of char._alternateArmorProfiles) {
            if (armor.name.toLowerCase().trim() === armorName.trim().toLowerCase()) {
                return armor;
            }
        }
        return null;
    }

    /**
     * Get the name of currently equipped armor
     */
    getEquippedArmorName(): string {
        const char = this._char as any;
        for (const armor of char._armorPurchased) {
            if (armor.equippedArmor) {
                return armor.name;
            }
        }
        return "Unarmored";
    }

    /**
     * Get the index of currently equipped armor
     */
    getEquippedArmorIndex(): number {
        const char = this._char as any;
        let aIndex = 0;
        for (const armor of char._armorPurchased) {
            if (armor.equippedArmor) {
                return aIndex;
            }
            aIndex++;
        }
        return -1;
    }

    /**
     * Equip armor by name (unequips all other armor first)
     */
    equipArmorName(armorName: string): void {
        const char = this._char as any;
        // unequip all other armor
        for (const armor of char._armorPurchased) {
            armor.equippedArmor = false;
        }

        if (armorName) {
            for (const armor of char._armorPurchased) {
                if (armor.name.toLowerCase().trim() === armorName.trim().toLowerCase()) {
                    armor.equippedArmor = true;
                }
            }
        }

        char.calc();
    }

    /**
     * Unequip all armor
     */
    unEquipAllArmor(): void {
        const char = this._char as any;
        for (const armor of char._armorPurchased) {
            armor.equippedArmor = false;
        }
    }

    /**
     * Equip armor at index
     */
    equipArmor(armorIndex: number): void {
        const char = this._char as any;
        if (char._armorPurchased.length > armorIndex && char._armorPurchased[armorIndex]) {
            char._armorPurchased[armorIndex].equippedArmor = true;
        }
    }

    /**
     * Unequip armor at index
     */
    unequipArmor(armorIndex: number): void {
        const char = this._char as any;
        if (char._armorPurchased.length > armorIndex && char._armorPurchased[armorIndex]) {
            char._armorPurchased[armorIndex].equippedArmor = false;
            char._armorPurchased[armorIndex].equippedPrimary = false;
            char._armorPurchased[armorIndex].equippedSecondary = false;
        }
    }

    /**
     * Remove armor at index
     */
    removeArmor(armorIndex: number): void {
        const char = this._char as any;
        if (char._armorPurchased.length > armorIndex && char._armorPurchased[armorIndex]) {
            char._armorPurchased.splice(armorIndex, 1);
        }
    }
}
