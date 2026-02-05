/**
 * SkillModule - Handles character skill management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Skill retrieval and reset (getSkill, resetSkills)
 * - Skill boosts (addBoost, setBoost, addSuperBoost, clearBoosts, forceValue)
 * - Skill bonuses (addBonus)
 * - Skill values (setValue, switchAttribute)
 * - Language management (addLanguage, updateLinguistNames)
 * - Skill point tracking (getPointsMax, getPointsCurrent, etc.)
 */

import type { PlayerCharacter } from '../player_character';
import { Skill } from '../skill';
import { ISkillListImport } from '../../../interfaces/ISkillListImport';
import { BaseModule } from './BaseModule';

export class SkillModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Skill state is managed by PlayerCharacter's reset()
    }

    /**
     * Reset and rebuild skills from books and settings
     */
    resetSkills(): void {
        const char = this._char as any;

        char.skills = [];
        // Install Skills from Books
        if (char.setting.primaryBook) {
            const skillList: ISkillListImport[] = char.setting.primaryBook.skillList;
            for (const skillDef of skillList) {
                const getSkill = this.get(skillDef.name);
                if (!getSkill) {
                    char.skills.push(new Skill(char, skillDef, char.setting.primaryBook.id));
                }
            }
        }

        for (const book of char.setting.activeBooks) {
            if (book.id !== char.setting.primaryBook.id) {
                const skillList: ISkillListImport[] = book.skillList;
                for (const skillDef of skillList) {
                    const getSkill = this.get(skillDef.name);

                    if (!getSkill)
                        char.skills.push(new Skill(char, skillDef, book.id));
                }
            }
        }

        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                ab.makeABSkills();
            }
        }

        if (char._custom_skills) {
            for (const custSkill of char._custom_skills) {
                let isKnowledge = false;
                if (custSkill.IsKnowledge) {
                    isKnowledge = true;
                }

                if (custSkill.is_knowledge) {
                    isKnowledge = true;
                }

                let isLanguage = false;
                if (custSkill.Language) {
                    isLanguage = true;
                }

                if (custSkill.language) {
                    isLanguage = true;
                }

                let isAlwaysLanguage = false;
                if (custSkill.AlwaysLanguage) {
                    isAlwaysLanguage = true;
                }

                if (custSkill.always_language) {
                    isAlwaysLanguage = true;
                }

                let skillAttribute = "";
                if (custSkill.Attribute) {
                    skillAttribute = custSkill.Attribute.toLowerCase().trim();
                }
                if (custSkill.attribute) {
                    skillAttribute = custSkill.attribute.toLowerCase().trim();
                }

                let skillName = "";
                if (custSkill.Name) {
                    skillName = custSkill.Name.trim();
                }
                if (custSkill.name) {
                    skillName = custSkill.name.trim();
                }

                if (skillName) {
                    const findSkill = this.get(skillName);
                    if (!findSkill) {
                        const skillDef: ISkillListImport = {
                            name: skillName,
                            attribute: skillAttribute,
                            is_knowledge: isKnowledge,
                            language: isLanguage,
                            always_language: isAlwaysLanguage,
                            base_parry: false,
                        };
                        const newSkill = new Skill(char, skillDef, 0);
                        newSkill.is_custom = true;
                        newSkill.bonusValue = 0;
                        char.skills.push(newSkill);
                    }
                }
            }
        }

        for (const customSkill of char.setting.customSkills) {
            if (customSkill.name) {
                const findSkill = this.get(customSkill.name);
                if (!findSkill) {
                    const newSkill = new Skill(char, null, 0);
                    newSkill.name = customSkill.name;
                    newSkill.attribute = customSkill.attribute;
                    newSkill.originalAttribute = customSkill.attribute;
                    if (customSkill.AlwaysLanguage)
                        newSkill.alwaysLanguage = true;
                    if (customSkill.Language)
                        newSkill.isLanguage = true;
                    if (customSkill.IsKnowledge)
                        newSkill.isKnowledge = true;
                    if (customSkill.always_language)
                        newSkill.alwaysLanguage = true;
                    if (customSkill.language)
                        newSkill.isLanguage = true;
                    if (customSkill.is_knowledge)
                        newSkill.isKnowledge = true;
                    newSkill.settingSkill = true;
                    char.skills.push(newSkill);
                }
            }
        }
    }

    /**
     * Get a skill by name and optionally attribute
     */
    get(
        skillName: string | null,
        skillAttribute: string | null = "",
    ): Skill | null {
        const char = this._char as any;

        if (skillName) {
            skillName = skillName.toLowerCase().trim();
            if (skillAttribute)
                skillAttribute = skillAttribute.toLowerCase().trim();
            for (const skill of char.skills) {
                if (skill.name && skill.name.toLowerCase().trim() === skillName) {
                    if (!skillAttribute) {
                        return skill;
                    } else {
                        if (skill.originalAttribute.toLowerCase().trim() === skillAttribute) {
                            return skill;
                        }
                    }
                }
            }

            if (skillName.toLowerCase().trim() === "arcane_skill") {
                for (const ab of char._selectedArcaneBackgrounds) {
                    if (ab && ab.arcaneSkill) {
                        return this.get(
                            ab.arcaneSkill.name,
                            ab.arcaneSkill.attribute,
                        );
                    }
                }
            }
        }
        return null;
    }

    /**
     * Clear all boosts from a skill
     */
    clearBoosts(skillName: string): boolean {
        const char = this._char as any;

        skillName = skillName.trim();

        // Handle "Language (Native)" case by converting to actual native language
        // Also handle cases where the skill name has a trailing number like "Language (Native) 3"
        if (skillName === "Language (Native)" || skillName.match(/^Language \(Native\)\s+\d+$/)) {
            skillName = "Language (" + char.getNativeLanguage(0) + ")";
        }
        let baseSkill = "";
        let specSkill = "";
        if (skillName.indexOf("(") > -1) {
            baseSkill = skillName.substr(0, skillName.indexOf("(") - 1);
            specSkill = skillName.substr(skillName.indexOf("(") + 1, skillName.length - skillName.indexOf("(") - 2);
        } else {
            baseSkill = skillName;
        }

        const skill = this.get(baseSkill);
        if (skill) {
            if (specSkill && skill.isKnowledge) {
                for (const spec of skill.specialties) {
                    if (spec.name.toLowerCase().trim() === specSkill.toLowerCase().trim()) {
                        spec.bonusValue = 0;
                        return true;
                    }
                }

                // didn't find the specialty, add it
                skill.specialties.push({
                    name: specSkill,
                    assignedValue: 0,
                    boostValue: 0,
                    maxValue: 5,
                    minValue: 0,
                    superBoost: 0,
                    advanceBoost: 0,
                    bonusValue: 0,
                    isLanguage: skill.isLanguage,
                    nativeLanguageIndex: -1,
                    isLinguistLanguage: false,
                });

                return true;
            } else {
                skill.clearBoosts();
                return true;
            }
        } else {
            console.warn("clearSkillBoosts Warning: couldn't find skill to clear boost:", skillName);
        }

        return false;
    }

    /**
     * Add a boost to a skill
     */
    addBoost(
        skillName: string,
        amount: number,
        noMaxRaise: boolean = false,
        nativeLanguageIndex: number = 1,
        isLinguistLanguage: boolean = false,
    ): boolean {
        const char = this._char as any;

        skillName = skillName.trim();

        // Handle "Language (Native)" case by converting to actual native language
        // Also handle cases where the skill name has a trailing number like "Language (Native) 3"
        if (skillName === "Language (Native)" || skillName.match(/^Language \(Native\)\s+\d+$/)) {
            skillName = "Language (" + char.getNativeLanguage(0) + ")";
        }

        let baseSkill = "";
        let specSkill = "";
        if (skillName.indexOf("(") > -1) {
            baseSkill = skillName.substr(0, skillName.indexOf("(") - 1);
            specSkill = skillName.substr(skillName.indexOf("(") + 1, skillName.length - skillName.indexOf("(") - 2);
        } else {
            baseSkill = skillName;
        }

        const skill = this.get(baseSkill);

        let maxValue = 5 + amount;
        if (noMaxRaise === true) {
            maxValue = 5;
        }

        if (skill) {
            if (specSkill && skill.isKnowledge) {
                for (const spec of skill.specialties) {
                    if (spec.name.toLowerCase().trim() === specSkill.toLowerCase().trim()) {
                        spec.boostValue = amount;
                        spec.minValue += +amount;
                        spec.maxValue = +maxValue;
                        spec.nativeLanguageIndex = nativeLanguageIndex;
                        spec.isLinguistLanguage = isLinguistLanguage;
                        return true;
                    }
                }

                // didn't find the specialty, add it
                skill.specialties.push({
                    name: specSkill,
                    assignedValue: 0,
                    boostValue: amount,
                    maxValue: maxValue,
                    minValue: amount,
                    advanceBoost: 0,
                    bonusValue: 0,
                    superBoost: 0,
                    isLanguage: skill.isLanguage,
                    nativeLanguageIndex: nativeLanguageIndex,
                    isLinguistLanguage: isLinguistLanguage,
                });

                if (isLinguistLanguage && char._linguistBoostedSkills.indexOf(specSkill) === -1) {
                    char._linguistBoostedSkills.push(specSkill);
                }

                return true;
            } else {
                skill.boostSkill(+amount);
                return true;
            }
        } else {
            console.warn("addSkillBoost Warning: couldn't find skill to boost:", skillName, amount);
        }

        return false;
    }

    /**
     * Add a boost to a skill only if the skill currently has zero value
     */
    addBoostIfZero(
        skillName: string,
        amount: number,
        noMaxRaise: boolean = false,
        nativeLanguageIndex: number = 1,
        isLinguistLanguage: boolean = false,
    ): boolean {
        const char = this._char as any;

        skillName = skillName.trim();

        // Handle "Language (Native)" case by converting to actual native language
        // Also handle cases where the skill name has a trailing number like "Language (Native) 3"
        if (skillName === "Language (Native)" || skillName.match(/^Language \(Native\)\s+\d+$/)) {
            skillName = "Language (" + char.getNativeLanguage(0) + ")";
        }
        let baseSkill = "";
        let specSkill = "";
        if (skillName.indexOf("(") > -1) {
            baseSkill = skillName.substr(0, skillName.indexOf("(") - 1);
            specSkill = skillName.substr(skillName.indexOf("(") + 1, skillName.length - skillName.indexOf("(") - 2);
        } else {
            baseSkill = skillName;
        }

        const skill = this.get(baseSkill);

        let maxValue = 5 + amount;
        if (noMaxRaise === true) {
            maxValue = 5;
        }

        if (skill && skill.currentValue() === 0) {
            if (specSkill && skill.isKnowledge) {
                for (const spec of skill.specialties) {
                    if (spec.name.toLowerCase().trim() === specSkill.toLowerCase().trim()) {
                        spec.boostValue = amount;
                        spec.minValue += +amount;
                        spec.maxValue = +maxValue;
                        spec.nativeLanguageIndex = nativeLanguageIndex;
                        spec.isLinguistLanguage = isLinguistLanguage;
                        return true;
                    }
                }

                // didn't find the specialty, add it
                skill.specialties.push({
                    name: specSkill,
                    assignedValue: 0,
                    boostValue: amount,
                    maxValue: maxValue,
                    minValue: amount,
                    advanceBoost: 0,
                    bonusValue: 0,
                    superBoost: 0,
                    isLanguage: skill.isLanguage,
                    nativeLanguageIndex: nativeLanguageIndex,
                    isLinguistLanguage: isLinguistLanguage,
                });

                if (isLinguistLanguage && char._linguistBoostedSkills.indexOf(specSkill) === -1) {
                    char._linguistBoostedSkills.push(specSkill);
                }

                return true;
            } else {
                skill.boostSkill(+amount);
                return true;
            }
        } else {
            console.warn("addSkillBoost Warning: couldn't find skill to boost:", skillName, amount);
        }

        return false;
    }

    /**
     * Force a skill to a specific value
     */
    forceValue(
        skillName: string,
        amount: number,
        _isNativeLanguage: boolean = false,
        _isLinguistLanguage: boolean = false,
    ): boolean {
        const char = this._char as any;

        skillName = skillName.trim();

        // Handle "Language (Native)" case by converting to actual native language
        // Also handle cases where the skill name has a trailing number like "Language (Native) 3"
        if (skillName === "Language (Native)" || skillName.match(/^Language \(Native\)\s+\d+$/)) {
            skillName = "Language (" + char.getNativeLanguage(0) + ")";
        }
        let baseSkill = "";
        let specSkill = "";
        if (skillName.indexOf("(") > -1) {
            baseSkill = skillName.substr(0, skillName.indexOf("(") - 1);
            specSkill = skillName.substr(skillName.indexOf("(") + 1, skillName.length - skillName.indexOf("(") - 2);
        } else {
            baseSkill = skillName;
        }

        const skill = this.get(baseSkill);

        if (skill) {
            if (specSkill && skill.isKnowledge) {
                // Commented out logic preserved from original
            } else {
                skill.setSkillValue(amount);
                return true;
            }
        } else {
            console.warn("addSkillBoost Warning: couldn't find skill to boost:", skillName, amount);
        }

        return false;
    }

    /**
     * Update the list of linguist-boosted skill names
     */
    updateLinguistNames(): void {
        const char = this._char as any;

        char._linguistBoostedSkills = [];
        for (const skill of char.skills) {
            if (skill.isLanguage && skill.isKnowledge) {
                for (const spec of skill.specialties) {
                    if (spec.isLinguistLanguage) {
                        char._linguistBoostedSkills.push(spec.name);
                    }
                }
            }
        }
    }

    /**
     * Add a language to the character
     */
    addLanguage(nv: string): void {
        (this._char as any)._addedLanguages.push(nv.trim());
    }

    /**
     * Get maximum skill allocation points
     */
    getPointsMax(): number {
        return (this._char as any)._maxSkillAllocationPoints;
    }

    /**
     * Get current skill allocation points
     */
    getPointsCurrent(): number {
        return (this._char as any)._currentSkillAllocationPoints;
    }

    /**
     * Get maximum smarts skill allocation points
     */
    getSmartsPointsMax(): number {
        return (this._char as any)._maxSmartsSkillAllocationPoints;
    }

    /**
     * Get current smarts skill allocation points
     */
    getSmartsPointsCurrent(): number {
        return (this._char as any)._currentSmartsSkillAllocationPoints;
    }

    /**
     * Set a skill boost (sets minimum value)
     */
    setBoost(
        skillName: string,
        amount: number,
        nativeLanguageIndex: number = -1,
        isLinguistLanguage: boolean = false,
        boostLinkedAttribute: number = 0,
    ): boolean {
        const char = this._char as any;

        skillName = skillName.trim();

        // Handle "Language (Native)" case by converting to actual native language
        // Also handle cases where the skill name has a trailing number like "Language (Native) 3"
        if (skillName === "Language (Native)" || skillName.match(/^Language \(Native\)\s+\d+$/)) {
            skillName = "Language (" + char.getNativeLanguage(0) + ")";
        }
        let baseSkill = "";
        let specSkill = "";
        if (skillName.indexOf("(") > -1) {
            baseSkill = skillName.substr(0, skillName.indexOf("(") - 1);
            specSkill = skillName.substr(skillName.indexOf("(") + 1, skillName.length - skillName.indexOf("(") - 2);
        } else {
            baseSkill = skillName;
        }

        const skill = this.get(baseSkill);

        if (skill) {
            if (boostLinkedAttribute > 0) {
                char.boostAttribute(skill.attribute, boostLinkedAttribute);
            }
            if (specSkill && skill.isKnowledge) {
                for (const spec of skill.specialties) {
                    const newValue = spec.boostValue < +amount ? +amount : spec.boostValue;

                    if (spec.name.toLowerCase().trim() === specSkill.toLowerCase().trim()) {
                        spec.minValue = newValue;
                        spec.maxValue = 5;
                        spec.nativeLanguageIndex = nativeLanguageIndex;
                        spec.isLinguistLanguage = isLinguistLanguage;
                        return true;
                    }
                }
                const boostAmount = amount;

                // didn't find the specialty, add it
                skill.specialties.push({
                    name: specSkill,
                    assignedValue: 0,
                    boostValue: boostAmount,
                    maxValue: 5,
                    minValue: amount,
                    advanceBoost: 0,
                    bonusValue: 0,
                    superBoost: 0,
                    isLanguage: skill.isLanguage,
                    nativeLanguageIndex: nativeLanguageIndex,
                    isLinguistLanguage: isLinguistLanguage,
                });

                return true;

            } else {
                skill.boostValue = skill.boostValue < +amount ? +amount : skill.boostValue;
                skill.minValue = skill.minValue < +amount ? +amount : skill.minValue;
                return true;
            }
        } else {
            console.warn("addSkillBoost Warning: couldn't find skill to boost:", skillName, amount);
        }

        return false;
    }

    /**
     * Add a super power skill boost
     */
    addSuperBoost(
        skillName: string,
        amount: number,
    ): boolean {
        const char = this._char as any;

        skillName = skillName.trim();

        // Handle "Language (Native)" case by converting to actual native language
        // Also handle cases where the skill name has a trailing number like "Language (Native) 3"
        if (skillName === "Language (Native)" || skillName.match(/^Language \(Native\)\s+\d+$/)) {
            skillName = "Language (" + char.getNativeLanguage(0) + ")";
        }
        let baseSkill = "";
        let specSkill = "";
        if (skillName.indexOf("(") > -1) {
            baseSkill = skillName.substr(0, skillName.indexOf("(") - 1);
            specSkill = skillName.substr(skillName.indexOf("(") + 1, skillName.length - skillName.indexOf("(") - 2);
        } else {
            baseSkill = skillName;
        }

        const skill = this.get(baseSkill);

        const maxValue = 5;

        if (skill) {
            if (specSkill && skill.isKnowledge) {
                for (const spec of skill.specialties) {
                    if (spec.name.toLowerCase().trim() === specSkill.toLowerCase().trim()) {
                        spec.superBoost += +amount;
                        return true;
                    }
                }

                // didn't find the specialty, add it
                skill.specialties.push({
                    name: specSkill,
                    assignedValue: 0,
                    boostValue: 0,
                    maxValue: maxValue,
                    minValue: 1,
                    advanceBoost: 0,
                    bonusValue: 0,
                    superBoost: amount,
                    isLanguage: skill.isLanguage,
                    nativeLanguageIndex: -1,
                    isLinguistLanguage: false,
                });

                return true;

            } else {
                skill.superBoost += +amount;
                return true;
            }
        } else {
            console.warn("addSkillBoost Warning: couldn't find skill to boost:", skillName, amount);
        }

        return false;
    }

    /**
     * Add a skill bonus (stacks with existing bonus)
     */
    addBonus(
        skillName: string,
        amount: number,
        max: number | null = null,
        from: string,
    ): boolean {
        const char = this._char as any;

        skillName = skillName.trim();
        let baseSkill = "";
        let specSkill = "";

        char._bonusesLog.push(skillName + " " + (amount > 0 ? "+" + amount : amount) + " from " + from);

        if (skillName.indexOf("(") > -1) {
            baseSkill = skillName.substr(0, skillName.indexOf("(") - 1);
            specSkill = skillName.substr(skillName.indexOf("("), skillName.length - skillName.indexOf("("));
        } else {
            baseSkill = skillName;
        }

        const skill = this.get(baseSkill);

        if (skill && specSkill && skill.isKnowledge) {
            for (const spec of skill.specialties) {

                if (spec.name.toLowerCase().trim() === specSkill.toLowerCase().trim()) {
                    spec.bonusValue += +amount;
                    if (max !== null) {
                        if (spec.bonusValue > max)
                            spec.bonusValue = max;
                    }
                    return true;
                }

                if (max !== null) {
                    if (amount > max)
                        amount = max;
                }

                skill.specialties.push({
                    name: specSkill,
                    assignedValue: 0,
                    boostValue: 0,
                    maxValue: 5,
                    advanceBoost: 0,
                    minValue: 0,
                    superBoost: 0,
                    bonusValue: +amount,
                    isLanguage: false,
                    nativeLanguageIndex: -1,
                    isLinguistLanguage: false,
                });

                return true;
            }
        } else {
            if (skill) {
                skill.bonusValue += +amount;

                if (max !== null) {
                    if (skill.bonusValue > max)
                        skill.bonusValue = max;
                }
                return true;
            }
        }

        return false;
    }

    /**
     * Set a skill value directly
     */
    setValue(
        name: string,
        specifyName: string,
        value: number = 1,
        lang: boolean = false,
        nativeLanguageIndex: number = -1,
        isLing: boolean = false,
        calcLang: boolean = false,
    ): void {
        const char = this._char as any;

        for (const skill of char.skills) {
            if (
                skill.name
                    &&
                skill.name.toLowerCase().trim()
                    ===
                name.toLowerCase().trim()
            ) {
                if (specifyName && specifyName.trim()) {
                    // specification, add or create specification value
                    let foundSpecify = false;
                    for (const spec of skill.specialties) {
                        if (spec.name.toLowerCase().trim() === specifyName.toLowerCase().trim()) {
                            spec.assignedValue = value;
                            foundSpecify = true;
                            spec.nativeLanguageIndex = nativeLanguageIndex;
                            spec.isLinguistLanguage = isLing;
                        }
                    }
                    if (!foundSpecify) {
                        skill.addSpecialty(specifyName, value, lang, nativeLanguageIndex, calcLang);
                    }
                } else {
                    skill.assignedValue = value;
                }
            }
        }
    }

    /**
     * Switch a skill's linked attribute
     */
    switchAttribute(
        skillName: string,
        attribute: string,
        if_equal_or_higher: boolean = false,
    ): void {
        const char = this._char as any;

        skillName = skillName.toLowerCase().trim();
        for (const skill of char.skills) {
            if (skill.name && skillName === skill.name.toLowerCase().trim()) {

                const currentAttValue = char.getAttributeCurrent(skill.attribute);
                const targetAttValue = char.getAttributeCurrent(attribute.toLowerCase().trim());

                if (
                    !if_equal_or_higher
                    ||
                    (
                        if_equal_or_higher
                        &&
                        targetAttValue >= currentAttValue
                    )

                ) {
                    skill.attribute = attribute.toLowerCase().trim();
                }

            }
        }
    }
}
