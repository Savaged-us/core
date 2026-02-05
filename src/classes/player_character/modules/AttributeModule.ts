/**
 * AttributeModule - Handles character attribute management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Attribute getters (getCurrent, getMin, getMax, getBonus, getBoost)
 * - Attribute setters (assign, setHard)
 * - Attribute calculations (_calcCurrentAttributes, _calcAttributesAndSkillPoints)
 * - Point tracking (allocation points for attributes and skills)
 */

import type { PlayerCharacter } from '../player_character';
import { getDieLabelFromIndex } from '../../../utils/Dice';
import { BaseModule } from './BaseModule';

export class AttributeModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Attribute state is managed by PlayerCharacter's reset()
    }

    /**
     * Calculate current attribute values from assignments, boosts, and advances
     */
    calcCurrentAttributes(): void {
        const char = this._char as any;

        if (char._derivedBaseBoosts["parry"] > 10) {
            char._derivedBaseBoosts["parry"] = 10;
        }

        char._attributeCurrent.agility = 1 + char._attributeAssignments.agility + char._attributeBoosts.agility + char._attributeAdvances.agility;
        char._attributeCurrent.smarts = 1 + char._attributeAssignments.smarts + char._attributeBoosts.smarts + char._attributeAdvances.smarts;
        char._attributeCurrent.spirit = 1 + char._attributeAssignments.spirit + char._attributeBoosts.spirit + char._attributeAdvances.spirit;
        char._attributeCurrent.strength = 1 + char._attributeAssignments.strength + char._attributeBoosts.strength + char._attributeAdvances.strength;
        char._attributeCurrent.vigor = 1 + char._attributeAssignments.vigor + char._attributeBoosts.vigor + char._attributeAdvances.vigor;
    }

    /**
     * Calculate attribute and skill point expenditure
     */
    calcAttributesAndSkillPoints(): void {
        const char = this._char as any;

        char._currentAttributeAllocationPoints -= char._attributeAssignments.agility * char._attributesBuyCost.agility;
        char._currentAttributeAllocationPoints -= char._attributeAssignments.smarts * char._attributesBuyCost.smarts;
        char._currentAttributeAllocationPoints -= char._attributeAssignments.spirit * char._attributesBuyCost.spirit;
        char._currentAttributeAllocationPoints -= char._attributeAssignments.strength * char._attributesBuyCost.strength;
        char._currentAttributeAllocationPoints -= char._attributeAssignments.vigor * char._attributesBuyCost.vigor;

        for (const skill of char.skills) {
            if (skill.isKnowledge) {
                for (const specIndex in skill.specialties) {
                    const specObj = skill.specialties[specIndex];

                    if (specObj.assignedValue > 0) {
                        if (
                            skill.currentValueNoSuperNoAdvance(+specIndex) > this.getBaseCurrent(skill.attribute)
                        ) {
                            const remainder = skill.currentValueNoSuperNoAdvance(+specIndex) - this.getBaseCurrent(skill.attribute);
                            const base = +specObj.assignedValue - +remainder;

                            const cost = +remainder * 2 + +base;
                            if (cost > specObj.assignedValue * 2) {
                                char._decrementSkillPoints(skill, specObj.assignedValue * 2);
                            } else {
                                char._decrementSkillPoints(skill, cost);
                            }
                        } else {
                            char._decrementSkillPoints(skill, +specObj.assignedValue);
                        }
                    }
                }
            } else {
                if (skill.assignedValue) {
                    if (!skill.attribute) {
                        char._decrementSkillPoints(skill, +skill.assignedValue);
                    } else {
                        if (skill.currentValueNoSuperNoAdvance() > this.getBaseCurrent(skill.attribute)) {
                            const remainder = skill.currentValueNoSuperNoAdvance() - this.getBaseCurrent(skill.attribute);
                            const base = +skill.assignedValue - +remainder;

                            const cost = +remainder * 2 + +base;
                            if (cost > skill.assignedValue * 2) {
                                char._decrementSkillPoints(skill, skill.assignedValue * 2);
                            } else {
                                char._decrementSkillPoints(skill, cost);
                            }
                        } else {
                            char._decrementSkillPoints(skill, +skill.assignedValue);
                        }
                    }
                }

                if (skill.currentValue() > 0 && skill.specializations.length > 0 && char.usesSkillSpecializations()) {
                    // first one is always free ;)
                    char._currentSkillAllocationPoints -= (skill.specializations.length - 1);
                }
            }
        }
    }

    /**
     * Get current attribute value (excluding advances)
     */
    getCurrentNoAdvances(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }
        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                if (char._traitHardSet.agility > char._attributeCurrent.agility - char._attributeAdvances.agility) {
                    return char._traitHardSet.agility;
                } else {
                    return char._attributeCurrent.agility - char._attributeAdvances.agility;
                }
            }
            case "smarts": {
                if (char._traitHardSet.smarts > char._attributeCurrent.smarts - char._attributeAdvances.smarts) {
                    return char._traitHardSet.smarts;
                } else {
                    return char._attributeCurrent.smarts - char._attributeAdvances.smarts;
                }
            }
            case "spirit": {
                if (char._traitHardSet.spirit > char._attributeCurrent.spirit - char._attributeAdvances.spirit) {
                    return char._traitHardSet.spirit;
                } else {
                    return char._attributeCurrent.spirit - char._attributeAdvances.spirit;
                }
            }
            case "strength": {
                if (char._traitHardSet.strength > char._attributeCurrent.strength - char._attributeAdvances.strength) {
                    return char._traitHardSet.strength;
                } else {
                    return char._attributeCurrent.strength - char._attributeAdvances.strength;
                }
            }
            case "vigor": {
                if (char._traitHardSet.vigor > char._attributeCurrent.vigor - char._attributeAdvances.vigor) {
                    return char._traitHardSet.vigor;
                } else {
                    return char._attributeCurrent.vigor - char._attributeAdvances.vigor;
                }
            }
            default: {
                return -1;
            }
        }
    }

    /**
     * Get current attribute value
     */
    getCurrent(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }
        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                if (char._traitHardSet.agility > char._attributeCurrent.agility) {
                    return char._traitHardSet.agility;
                } else {
                    return char._attributeCurrent.agility;
                }
            }
            case "smarts": {
                if (char._traitHardSet.smarts > char._attributeCurrent.smarts) {
                    return char._traitHardSet.smarts;
                } else {
                    return char._attributeCurrent.smarts;
                }
            }
            case "spirit": {
                if (char._traitHardSet.spirit > char._attributeCurrent.spirit) {
                    return char._traitHardSet.spirit;
                } else {
                    return char._attributeCurrent.spirit;
                }
            }
            case "strength": {
                if (char._traitHardSet.strength > char._attributeCurrent.strength) {
                    return char._traitHardSet.strength;
                } else {
                    return char._attributeCurrent.strength;
                }
            }
            case "vigor": {
                if (char._traitHardSet.vigor > char._attributeCurrent.vigor) {
                    return char._traitHardSet.vigor;
                } else {
                    return char._attributeCurrent.vigor;
                }
            }
            default: {
                return -1;
            }
        }
    }

    /**
     * Set attribute to a hard value (overrides calculated value)
     */
    setHard(attribute: string, setValue: number): boolean {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }

        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                char._traitHardSet.agility = setValue;
                return true;
            }
            case "smarts": {
                char._traitHardSet.smarts = setValue;
                return true;
            }
            case "spirit": {
                char._traitHardSet.spirit = setValue;
                return true;
            }
            case "strength": {
                char._traitHardSet.strength = setValue;
                return true;
            }
            case "vigor": {
                char._traitHardSet.vigor = setValue;
                return true;
            }
            default: {
                return false;
            }
        }
    }

    /**
     * Get base current attribute value (without advances)
     */
    getBaseCurrent(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }
        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                return char._attributeCurrent.agility - char._attributeAdvances.agility;
            }
            case "smarts": {
                return char._attributeCurrent.smarts - char._attributeAdvances.smarts;
            }
            case "spirit": {
                return char._attributeCurrent.spirit - char._attributeAdvances.spirit;
            }
            case "strength": {
                return char._attributeCurrent.strength - char._attributeAdvances.strength;
            }
            case "vigor": {
                return char._attributeCurrent.vigor - char._attributeAdvances.vigor;
            }
            default: {
                return -1;
            }
        }
    }

    /**
     * Get human-readable attribute value
     */
    getCurrentHR(attribute: string, showBonusText: boolean = false): string {
        let bonusText = "";
        const bonusValue: number = this.getBonus(attribute);
        if (!attribute) {
            attribute = "";
        }
        if (showBonusText && bonusValue !== 0) {
            if (bonusValue > 0) {
                bonusText = "+" + bonusValue.toString();
            } else if (bonusValue < 0) {
                bonusText = "" + bonusValue.toString();
            }
        }

        return getDieLabelFromIndex(this.getCurrent(attribute)) + bonusText;
    }

    /**
     * Assign attribute points
     */
    assign(attribute: string, newValue: number): boolean {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }

        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                char._attributeAssignments.agility = newValue;
                return true;
            }
            case "smarts": {
                char._attributeAssignments.smarts = newValue;
                return true;
            }
            case "spirit": {
                char._attributeAssignments.spirit = newValue;
                return true;
            }
            case "strength": {
                char._attributeAssignments.strength = newValue;
                return true;
            }
            case "vigor": {
                char._attributeAssignments.vigor = newValue;
                return true;
            }
            default: {
                return false;
            }
        }
    }

    /**
     * Get attribute boost value
     */
    getBoost(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }

        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                return char._attributeBoosts.agility;
            }
            case "smarts": {
                return char._attributeBoosts.smarts;
            }
            case "spirit": {
                return char._attributeBoosts.spirit;
            }
            case "strength": {
                return char._attributeBoosts.strength;
            }
            case "vigor": {
                return char._attributeBoosts.vigor;
            }
            default: {
                return -1;
            }
        }
    }

    /**
     * Get attribute bonus value (includes trait bonuses)
     */
    getBonus(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }
        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                return char._attributeBonuses.agility + char._traitBonuses.agility;
            }
            case "smarts": {
                return char._attributeBonuses.smarts + char._traitBonuses.smarts;
            }
            case "spirit": {
                return char._attributeBonuses.spirit + char._traitBonuses.spirit;
            }
            case "strength": {
                return char._attributeBonuses.strength + char._traitBonuses.strength;
            }
            case "vigor": {
                return char._attributeBonuses.vigor + char._traitBonuses.vigor;
            }
            default: {
                return -1;
            }
        }
    }

    /**
     * Get maximum attribute value
     */
    getMax(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }

        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                return char._attributesMax.agility;
            }
            case "smarts": {
                return char._attributesMax.smarts;
            }
            case "spirit": {
                return char._attributesMax.spirit;
            }
            case "strength": {
                return char._attributesMax.strength;
            }
            case "vigor": {
                return char._attributesMax.vigor;
            }
            default: {
                return -1;
            }
        }
    }

    /**
     * Get minimum attribute value
     */
    getMin(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }

        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                return char._attributesMin.agility;
            }
            case "smarts": {
                return char._attributesMin.smarts;
            }
            case "spirit": {
                return char._attributesMin.spirit;
            }
            case "strength": {
                return char._attributesMin.strength;
            }
            case "vigor": {
                return char._attributesMin.vigor;
            }
            default: {
                return -1;
            }
        }
    }

    /**
     * Get cost to raise an attribute
     */
    getCostToRaise(attribute: string): number {
        const char = this._char as any;
        if (!attribute) {
            attribute = "";
        }

        switch (attribute.toString().toLowerCase().trim()) {
            case "agility": {
                return char._attributesBuyCost.agility;
            }
            case "smarts": {
                return char._attributesBuyCost.smarts;
            }
            case "spirit": {
                return char._attributesBuyCost.spirit;
            }
            case "strength": {
                return char._attributesBuyCost.strength;
            }
            case "vigor": {
                return char._attributesBuyCost.vigor;
            }
        }

        return 0;
    }

    /**
     * Get maximum attribute allocation points
     */
    getPointsMax(): number {
        return (this._char as any)._maxAttributeAllocationPoints;
    }

    /**
     * Get current attribute allocation points
     */
    getPointsCurrent(): number {
        return (this._char as any)._currentAttributeAllocationPoints;
    }
}
