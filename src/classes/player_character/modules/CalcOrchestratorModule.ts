/**
 * CalcOrchestratorModule - Orchestrates character calculation pipeline
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - calc: Main calculation orchestrator
 * - calcReset: Reset all calculated state
 * - calcSetting: Apply setting effects
 * - calcFramework: Apply framework effects
 * - calcRace: Apply race and monster framework effects
 * - calcGearArmorWeaponEffects: Apply equipment effects
 * - calcRiftsTattoos: Apply Rifts tattoo effects
 * - calcUpgrades: Apply edge upgrade chains
 * - calcInitialWealth: Calculate starting wealth
 * - calcFinalAdjustments: Final adjustments after all calculations
 */

import type { PlayerCharacter, IInnateWeapon } from '../player_character';
import type { ISkillSpecialty } from '../skill';
import { Skill } from '../skill';
import { PlayerCharacterAdvancement } from '../player_character_advancement';
import { getDieIndexFromLabel, getDieValueFromIndex } from '../../../utils/Dice';
import { getDisplayText } from '../../../utils/parseEscapedString';
import { BaseModule } from './BaseModule';

export class CalcOrchestratorModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Calc orchestrator state is managed by PlayerCharacter's reset()
    }

    /**
     * Main calculation orchestrator - coordinates all character calculations
     */
    calc(saveAddedEdges: boolean = false, calcLanguages: boolean = true): void {
        const char = this._char as any;

        char._toughnessModifierList = [];

        if (saveAddedEdges) {
            char.saveAddedEdges();
        }

        while (char.nativeLanguages.length < char.setting.number_native_languages) {
            char.nativeLanguages.push("Native #" + (char.nativeLanguages.length + 1).toString());
        }

        this.calcReset();

        this.calcSetting();
        this.calcFramework();
        this.calcRace();

        // Apply cybernetics strain modifiers
        if (char._CyberneticsArcaneStrainModifier) {
            const skill = char.getSkill("arcane_skill");
            if (skill) skill.bonusValue -= char.getTotalStrain();
        }

        if (char._CyberneticsMagicStrainModifier) {
            const skill = char.getSkill("spellcasting");
            if (skill) skill.bonusValue -= char.getTotalStrain();
        }

        if (char._CyberneticsMiraclesStrainModifier) {
            const skill = char.getSkill("faith");
            if (skill) skill.bonusValue -= char.getTotalStrain();
        }

        if (char._CyberneticsPsionicsStrainModifier) {
            const skill = char.getSkill("psionics");
            if (skill) skill.bonusValue -= char.getTotalStrain();
        }

        // Process edge options
        const _addedEdgeOptionCount: { [index: string]: number } = {};

        for (const edge of char._edgesAdded) {
            if (char._addedEdgeOptions[edge.name]) {
                if (!_addedEdgeOptionCount[edge.name]) {
                    _addedEdgeOptionCount[edge.name] = 0;
                }
                if (char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]) {
                    edge.importOptions(char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]);
                    _addedEdgeOptionCount[edge.name]++;
                }
            }
        }

        for (const edge of char._edgesAdded) {
            if (char._addedEdgeOptions[edge.name]) {
                if (!_addedEdgeOptionCount[edge.name]) {
                    _addedEdgeOptionCount[edge.name] = 0;
                }
                if (char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]) {
                    edge.importOptions(char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]);
                    _addedEdgeOptionCount[edge.name]++;
                }
            }
        }

        char._calcAndApplyEdges(true);

        // Apply super powers
        if (char.setting && char.setting.settingIsEnabled("spcpowers")) {
            char.isSuper = true;
            for (const power of char.superPowers2014) {
                power.apply(char, false);
            }
        }

        for (const power of char.addedSuperPowers2014) {
            power.apply(char, false);
        }

        // Ensure non-negative values
        if (char._xp < 0) char._xp = 0;
        if (char._xp_precalc < 0) char._xp_precalc = 0;
        if (char._advancement_count < 0) char._advancement_count = 0;
        if (char._advancement_precalc < 0) char._advancement_precalc = 0;

        while (char._advancements.length < char.getAdvancementPrecalcCount()) {
            char._advancements.push(new PlayerCharacterAdvancement(char._advancements.length, null, char));
        }

        char.superPowers2014PowerPoints = char.setting.spcPowerPoints;
        if (char.superPowers2014SuperKarma) {
            char.superPowers2014PowerPoints += char.setting.getSuperKarmaAmount();
        }

        char._calcCurrentAttributes();

        for (const power of char.superPowers2014) {
            power.apply(char, true);
        }
        for (const power of char.addedSuperPowers2014) {
            power.apply(char, true);
        }

        for (const edge of char._edgesAdded) {
            if (char._addedEdgeOptions[edge.name]) {
                if (!_addedEdgeOptionCount[edge.name]) {
                    _addedEdgeOptionCount[edge.name] = 0;
                }
                if (char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]) {
                    edge.importOptions(char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]);
                    _addedEdgeOptionCount[edge.name]++;
                }
            }
        }

        char._calcAndApplyEdges(false);

        // Process hindrance options
        const _addedHindranceOptionCount: { [index: string]: number } = {};

        for (const hindrance of char._hindrancesAdded) {
            if (char._addedHindranceOptions[hindrance.name]) {
                if (!_addedHindranceOptionCount[hindrance.name]) {
                    _addedHindranceOptionCount[hindrance.name] = 0;
                }
                if (char._addedHindranceOptions[hindrance.name][_addedHindranceOptionCount[hindrance.name]]) {
                    hindrance.importOptions(char._addedHindranceOptions[hindrance.name][_addedHindranceOptionCount[hindrance.name]]);
                    _addedHindranceOptionCount[hindrance.name]++;
                }
            }
        }

        char._calcHindrancesAndPerks();
        this.calcInitialWealth();
        char._calcArcaneBackgrounds();
        this.calcGearArmorWeaponEffects();
        this.calcRiftsTattoos();
        char._calcAdvancements();
        char._trimArcaneBackgrounds();

        for (const attr of char._noSelectAttributes) {
            char.assignAttribute(attr, 0);
        }

        char._calcCurrentAttributes();

        // Language calculations
        if (
            char.setting.settingIsEnabled("swade_multiplelanguages") ||
            (char.hasALinguistEdge() && char.setting.primaryIsSWADE)
        ) {
            let num_language_boosts = 0;

            if (char.setting.settingIsEnabled("swade_multiplelanguages")) {
                if (char.hasALinguistEdge()) {
                    num_language_boosts = getDieValueFromIndex(char.getAttributeCurrentNoAdvances("smarts"));
                } else {
                    num_language_boosts = getDieValueFromIndex(char.getAttributeCurrentNoAdvances("smarts")) / 2;
                }
            } else {
                if (char.hasALinguistEdge()) {
                    num_language_boosts = getDieValueFromIndex(char.getAttributeCurrentNoAdvances("smarts")) / 2;
                }
            }

            if (calcLanguages) {
                let applied_count = 0;

                if (char.setting.isPathfinderStyleLanguages() == false && char.setting.primaryIsSWADE) {
                    char._linguistBoostedSkills = char._linguistBoostedSkills.splice(0, num_language_boosts);

                    for (const skill of char.skills) {
                        if (skill.name && skill.name.toLowerCase().trim() == "language") {
                            for (const skillName of char._linguistBoostedSkills) {
                                if (applied_count <= num_language_boosts) {
                                    if (char.nativeLanguages.indexOf(skillName) == -1) {
                                        char.addSkillBoost(
                                            "Language (" + skillName + ")",
                                            2,
                                            true,
                                            -1,
                                            true,
                                        );
                                        applied_count++;
                                    }
                                }
                            }
                        }
                    }

                    const numberSkillToAdd = num_language_boosts - applied_count;
                    for (let skillCount = 0; skillCount < numberSkillToAdd; skillCount++) {
                        const skillName = "Linguist #" + (applied_count + 1).toString();
                        char.multipleLanguages.push("Linguist #" + (applied_count + 1).toString());
                        char.addSkillBoost(
                            "Language (" + skillName + ")",
                            2,
                            true,
                            -1,
                            true,
                        );
                        applied_count++;
                    }
                }
            }
        }

        // Remove any zero value specialties
        for (const skill of char.skills) {
            if (skill.isKnowledge || skill.isLanguage) {
                for (let specIndex = skill.specialties.length - 1; specIndex >= 0; specIndex--) {
                    if (
                        skill.specialties[specIndex].assignedValue +
                        skill.specialties[specIndex].boostValue +
                        skill.specialties[specIndex].advanceBoost +
                        skill.specialties[specIndex].superBoost == 0
                    ) {
                        skill.specialties.splice(specIndex, 1);
                    }
                }
            }
        }

        char._calcAttributesAndSkillPoints();

        char._loadCurrent = 0;
        char._loadCurrentCombat = 0;

        // Calculate Strain
        if (char.getAttributeCurrent("spirit") < char.getAttributeCurrent("vigor")) {
            char._currentStrain = getDieValueFromIndex(char.getAttributeCurrent("spirit"));
        } else {
            char._currentStrain = getDieValueFromIndex(char.getAttributeCurrent("vigor"));
        }

        if (char._doubleBaseStrain) {
            char._currentStrain = char._currentStrain * 2;
        }
        if (char._halfBaseStrain) {
            char._currentStrain = char._currentStrain / 2;
        }

        char._currentStrain += char.getDerivedBoost("strain");
        char._maxStrain = char._currentStrain;

        if (char.setting.settingIsEnabled("iz3_strain")) {
            char._maxStrain = getDieValueFromIndex(char.getAttributeCurrent("vigor"));
            char._currentStrain = 0;
        }

        char._calcGear();
        char._calcWeapons();
        char._calcArmor();
        char._calcVehicles();
        char._calRobotMods();

        char._calcSuperPower2014s();

        this.calcUpgrades();
        this.calcFinalAdjustments();
        char._createInnateAttackObjs();

        char._calcCyberware();

        // Final edge options processing
        for (const edge of char._edgesAdded) {
            if (char._addedEdgeOptions[edge.name]) {
                if (!_addedEdgeOptionCount[edge.name]) {
                    _addedEdgeOptionCount[edge.name] = 0;
                }
                if (char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]) {
                    edge.importOptions(char._addedEdgeOptions[edge.name][_addedEdgeOptionCount[edge.name]]);
                    _addedEdgeOptionCount[edge.name]++;
                }
            }
        }

        if (char.getSize() != 0) {
            char.noteToughnessSource("Size", char.getSize());
        }

        char.addSpecialAbility(
            "Languages Known",
            getDisplayText(char.getLanguages().join(", ")),
            "",
            "",
            0
        );

        char._validate();
    }

    /**
     * Reset all calculated state before recalculation
     */
    calcReset(): void {
        const char = this._char as any;

        if (!char._advancements) char._advancements = [];
        char._hasArmorEquipped = false;
        char.wealthDieInitialCalculation = 2; // d6
        char.wealthDieBonus = 0;
        char.isSuper = false;
        char._parryBonusFromShield = 0;
        char.validationMessages = [];
        char._addedLanguages = [];
        char._skillRequirementAliases = [];
        char._bonusesLog = [];
        char._extraHJRolls = 0;
        char._oneWithMagicRank = 0;
        char.deny_race_select = false;
        char._maxAttributeModifier = 0;
        char._toughnessModifierList = [];

        char.pathfinderArmorInterference = {};

        char._unarmedDamageStepBonus = 0;
        char._unarmedDamageAPBonus = 0;

        char.freePPEPool = 0;
        char.freeISPPool = 0;

        char._perkPointAdjustment = 0;

        char._additionalMeleeDamage = "";

        char.race.readOnlyName = false;
        char._bannedEdges = [];
        char._bannedABs = [];
        char._bannedHindrances = [];

        char._CyberneticsProhibited = false;
        char._CyberneticsPsionicsStrainModifier = false;
        char._CyberneticsArcaneStrainModifier = false;
        char._CyberneticsMagicStrainModifier = false;
        char._CyberneticsMiraclesStrainModifier = false;

        char._CyberneticsProhibited = false;

        for (const att of char._looseAttributes) {
            att.enabled = false;
        }

        if (char.race) {
            char.race.noEffects = false;
            char.race.nameOverride = "";
            char.race.hideRaceTab = false;
            char.race.calcReset();
        }

        if (char.currentFramework) {
            char.currentFramework.calcReset();
        }

        if (char.monsterFramework) {
            char.monsterFramework.calcReset();
        }

        for (const adv of char._advancements) {
            adv.calcReset();
        }

        char._newPowersEdgeBonus = 0;
        char.raceNameOverride = "";

        char._maxRobotMods = 0;
        char._currentRobotMods = 0;

        char._innateAttacks = [];
        char._innateAttackObjs = [];

        char._fullConversionBorg = false;

        char._advancement_bonus = 0;
        char._addedSpecialAbilities = [];
        char._noSelectAttributes = [];
        char.naturalArmorIsHeavy = false;
        char.naturalArmor = [];
        char._runningDieOverride = "";
        char._is_aquatic = false;

        char._wealthCurrent = 0;
        char._startingWealthOverride = 0;

        char._upgrade_luck = 0;
        char._upgrade_attractive = 0;
        char._upgrade_martial_arts = 0;
        char._upgrade_dirty_fighter = 0;
        char._upgrade_channeling = 0;
        char._upgrade_rapid_recharge = 0;
        char._add_quick_or_level_headed = 0;

        char.superPowers2014ExtraPowerPoints = 0;
        char._thrownWeaponRangeIncrement = 0;

        char.chargenValidationErrors = {};

        char._loadLimitMultiplier = 1;
        char._blockedHindrances = [];
        char._blockedEdges = [];
        char._basePace = 6;
        char._powerRankEquivalentBonus = 0;
        char._paceOverride = "";
        char._startingBennies = 3;
        char._runningDie = 2;
        char._wealthBase = char.setting.wealthStarting;
        char._wealthStarting = char.setting.wealthStarting;
        char._currentSkillAllocationPoints = char.setting.startingSkillPoints;
        char._maxSkillAllocationPoints = char.setting.startingSkillPoints;
        char._maxEdgesCount = 0;
        char._currentAttributeAllocationPoints = +char.setting.startingAttributePoints;
        char._maxAttributeAllocationPoints = +char.setting.startingAttributePoints;

        char._currentSmartsSkillAllocationPoints = 0;
        char._maxSmartsSkillAllocationPoints = 0;
        char._numberOfArcaneBackgrounds = 0;
        char._equippedArmorIsNotHeavyValidation = false;

        char._isArtificer = false;
        char._noPowerLimits = false;
        char._ignoreTwoHandsMelee = false;

        char._edgesCustomAdded = [];
        char._advancementEdges = [];
        char._edgesAdded = [];

        char._cannotSwim = false;

        char.validLevel = 0;
        char.validationMessages = [];

        char._attributesMin = {
            agility: 1,
            smarts: 1,
            spirit: 1,
            strength: 1,
            vigor: 1,
        };

        char._attributesMax = {
            agility: 5,
            smarts: 5,
            spirit: 5,
            strength: 5,
            vigor: 5,
        };

        char._armorStrengthBonus = 0;
        char._encumbranceStrengthBonus = 0;
        char._weaponStrengthBonus = 0;

        char._attributesBuyCost = {
            agility: 1,
            smarts: 1,
            spirit: 1,
            strength: 1,
            vigor: 1,
        };

        char._attributesAdvanceCost = {
            agility: 1,
            smarts: 1,
            spirit: 1,
            strength: 1,
            vigor: 1,
        };

        char._attributeBoosts = {
            agility: 0,
            smarts: 0,
            spirit: 0,
            strength: 0,
            vigor: 0,
        };

        char._attributeBonuses = {
            agility: 0,
            smarts: 0,
            spirit: 0,
            strength: 0,
            vigor: 0,
        };

        char._attributeAdvances = {
            agility: 0,
            smarts: 0,
            spirit: 0,
            strength: 0,
            vigor: 0,
        };

        char._traitBonuses = {
            agility: 0,
            smarts: 0,
            spirit: 0,
            strength: 0,
            vigor: 0,
        };

        char._traitHardSet = {
            agility: 0,
            smarts: 0,
            spirit: 0,
            strength: 0,
            vigor: 0,
        };

        char.armorLocations = {
            face: [],
            head: [],
            torso: [],
            arms: [],
            legs: [],
        };

        char.armorValues = {
            face: 0,
            head: 0,
            torso: 0,
            arms: 0,
            legs: 0,
        };

        char.armorValuesHeavy = {
            face: 0,
            head: 0,
            torso: 0,
            arms: 0,
            legs: 0,
        };

        char.toughnessValues = {
            face: "",
            head: "",
            torso: "",
            arms: "",
            legs: "",
        };

        char._derivedBaseBoosts = {
            pathfinder_armor_interference_mod: 0,
            toughness: 0,
            pace: 0,
            size: 0,
            parry: 0,
            armor: 0,
            heavy_armor: 0,
            reach: 0,
            wealth: 0,
            pace_flying: 0,
            pace_swimming: 0,
            starting_funds_multiplier: 1,
            pace_multiplier: 1,
            charisma: 0,
            sanity: 0,
            wounds: 0,
            rippers_reason: 0,
            rippers_status: 0,
            strain: 0,
            scholarship: 0,
        };

        // Install Skills from Books
        if (char.setting.primaryBook) {
            const skillList = char.setting.primaryBook.skillList;
            for (const skillDef of skillList) {
                if (skillDef.name) {
                    const foundSkill = char.getSkill(skillDef.name, skillDef.attribute);
                    if (!foundSkill) {
                        char.skills.push(new Skill(char, skillDef, char.setting.primaryBook.id));
                    }
                }
            }
        }

        for (const book of char.setting.activeBooks) {
            if (book.id != char.setting.primaryBook.id) {
                const skillList = book.skillList;
                for (const skillDef of skillList) {
                    if (skillDef.name) {
                        const foundSkill = char.getSkill(skillDef.name, skillDef.attribute);
                        if (!foundSkill) {
                            const newSkill = new Skill(char, skillDef, book.id);
                            newSkill.settingSkill = true;
                            char.skills.push(newSkill);
                        }
                    }
                }
            }
        }

        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                ab.calcReset();
            }
        }

        for (const item of char._edgesSelected) item.calcReset();
        for (const item of char._hindrancesSelected) item.calcReset();
        for (const item of char._edgesAdded) item.calcReset();
        for (const item of char._hindrancesAdded) item.calcReset();
        for (const item of char._edgesCustom) item.calcReset();
        for (const item of char._hindrancesCustom) item.calcReset();
        for (const item of char._edgesCustomAdded) item.calcReset();
        for (const item of char._armorPurchased) item.calcReset();
        for (const item of char._weaponsPurchased) item.calcReset();
        for (const item of char._gearPurchased) item.calcReset();
        for (const item of char._cyberwarePurchased) item.calcReset();
        for (const item of char._riftsTattoosPurchased) item.calcReset();
        for (const item of char._robotModsPurchased) item.calcReset();

        char.skills.sort((a: Skill, b: Skill) => {
            if (a.name > b.name) return 1;
            else if (a.name < b.name) return -1;
            else return 0;
        });

        for (const skill of char.skills) {
            if (skill) {
                skill.isCore = false;
                skill.attribute = skill.originalAttribute;
                skill.boostValue = 0;
                skill.bonusValue = 0;
                skill.advanceBoostValue = 0;
                skill.minValue = 0;
                skill.maxValue = 5;
                skill.superBoost = 0;
                skill.added_specializations = [];

                if (char._isCoreSkill(skill.name)) {
                    skill.boostValue = 1;
                    skill.minValue = 1;
                    skill.maxValue = 5;
                    skill.isCore = true;
                }

                for (let specIndex = skill.specialties.length - 1; specIndex > -1; specIndex--) {
                    skill.specialties[specIndex].bonusValue = 0;
                    skill.specialties[specIndex].boostValue = 0;
                    skill.specialties[specIndex].advanceBoost = 0;
                    skill.specialties[specIndex].minValue = 0;
                    skill.specialties[specIndex].maxValue = 5;
                    skill.specialties[specIndex].superBoost = 0;

                    if (skill.specialties[specIndex].nativeLanguageIndex > -1 && char.setting.hideNativeLanguage) {
                        skill.specialties[specIndex].assignedValue = 0;
                    }

                    if (skill.currentValue(specIndex) == 0) {
                        skill.specialties.splice(specIndex, 1);
                    }
                }
            }
        }

        for (const weapon of char._weaponsPurchased) {
            weapon.calcReset();
        }

        if (char._base_specifies && char._base_specifies.length > 0) {
            for (const addSspec of char._base_specifies) {
                for (const skill of char.skills) {
                    if (skill.name && skill.name.toLowerCase().trim() == addSspec.skill.toLowerCase().trim()) {
                        let foundSpecify = false;
                        for (const spec of skill.specialties) {
                            if (spec.name.toLowerCase().trim() == addSspec.specify.toLowerCase().trim()) {
                                foundSpecify = true;
                            }
                        }

                        if (!foundSpecify) {
                            skill.specialties.push({
                                name: addSspec.specify,
                                assignedValue: 0,
                                boostValue: 0,
                                advanceBoost: 0,
                                maxValue: 5,
                                superBoost: 0,
                                minValue: 0,
                                bonusValue: 0,
                                isLanguage: true,
                                nativeLanguageIndex: -1,
                                isLinguistLanguage: false,
                            });
                        }
                    }
                }
            }
        }

        for (let skillCount = char.skills.length - 1; skillCount > -1; skillCount--) {
            for (const bannedSkill of char.setting.removeSkills) {
                if (char.skills[skillCount] && char.skills[skillCount].name && bannedSkill.toLowerCase().trim() == char.skills[skillCount].name.toLowerCase().trim()) {
                    char.skills.splice(skillCount, 1);
                }
            }
        }

        for (let skillCount = char.skills.length - 1; skillCount > -1; skillCount--) {
            for (const book of char.setting.activeBooks) {
                for (const bannedSkill of book.delSkills) {
                    if (char.skills[skillCount] && char.skills[skillCount].name && bannedSkill.toLowerCase().trim() == char.skills[skillCount].name.toLowerCase().trim()) {
                        char.skills.splice(skillCount, 1);
                    }
                }
            }
        }

        for (let skillCount = char.skills.length - 1; skillCount > -1; skillCount--) {
            if (char.skills[skillCount] && char.skills[skillCount].settingSkill) {
                let stillInSetting = false;
                for (const currentSkill of char.setting.customSkills) {
                    if (
                        currentSkill.Name &&
                        currentSkill.Name == char.skills[skillCount].name &&
                        currentSkill.Name == char.skills[skillCount].name
                    ) {
                        stillInSetting = true;
                    }

                    if (
                        currentSkill.name &&
                        currentSkill.name == char.skills[skillCount].name &&
                        currentSkill.name == char.skills[skillCount].name
                    ) {
                        stillInSetting = true;
                    }
                }

                const hasAssignedValue = char.skills[skillCount].assignedValue > 0;
                const hasSpecialtyValues = char.skills[skillCount].specialties.some((s: ISkillSpecialty) => s.assignedValue > 0);

                if (!stillInSetting && !hasAssignedValue && !hasSpecialtyValues) {
                    char.skills.splice(skillCount, 1);
                }
            }
        }

        for (const customSkill of char.setting.customSkills) {
            if (customSkill.name) {
                let findSkill = char.getSkill(customSkill.name);
                if (!findSkill) {
                    const newSkill = new Skill(char, null, 0);
                    newSkill.name = customSkill.name;
                    newSkill.attribute = customSkill.attribute;
                    newSkill.originalAttribute = customSkill.attribute;
                    if (customSkill.AlwaysLanguage) newSkill.alwaysLanguage = true;
                    if (customSkill.Language) newSkill.isLanguage = true;
                    if (customSkill.IsKnowledge) newSkill.isKnowledge = true;
                    newSkill.settingSkill = true;
                    char.skills.push(newSkill);
                }
            }

            if (customSkill.name) {
                const findSkill = char.getSkill(customSkill.name);
                if (!findSkill) {
                    const newSkill = new Skill(char, null, 0);
                    newSkill.name = customSkill.name;
                    newSkill.attribute = customSkill.attribute;
                    newSkill.originalAttribute = customSkill.attribute;
                    if (customSkill.AlwaysLanguage) newSkill.alwaysLanguage = true;
                    if (customSkill.Language) newSkill.isLanguage = true;
                    if (customSkill.IsKnowledge) newSkill.isKnowledge = true;
                    newSkill.settingSkill = true;
                    char.skills.push(newSkill);
                }
            }
        }

        char._edgesAdded = [];
        char._hindrancesAdded = [];

        if (char.setting.primaryIsSWADE) {
            for (let langIndex = 0; langIndex < char.setting.number_native_languages; langIndex++) {
                char.addSkillBoost(
                    "Language (" + char.getNativeLanguage(langIndex) + ")",
                    3,
                    true,
                    langIndex,
                    false,
                );
            }
        }

        char._innateAttacks = [
            {
                name: "Unarmed",
                damage: "",
                addsStrength: true,
                reach: 0,
                ap: 0,
                range: "Melee",
                apIsPsionic: false,
                dontStepUnarmedDamage: false,
                apIsHalfPsionic: false,
                apIsAgilityDie: false,
                apIsDoublePsionic: false,
                apIsSize: false,
                apSizeBonus: 0,
                equippedPrimary: false,
                additionalDamage: "",
                equippedSecondary: false,
                parry: 0,
                tempParry: 0,
                tempToHit: 0,
                damageBoost: 0,
                noGlobalDamageAdd: false,
            }
        ];

        for (const weapon of char._weaponsPurchased) {
            for (const profile of weapon.profiles) {
                profile.damage = profile.damage_original;
            }
        }

        for (const edge of char._edgesSelected) {
            edge.nameAppend = "";
            if (edge.arcaneBackground) {
                edge.arcaneBackground.calcReset();
            }
        }

        char._addedSpecialAbilities = [];
    }

    /**
     * Apply setting effects
     */
    calcSetting(): void {
        const char = this._char as any;
        if (char.setting) {
            char.setting.apply();
        }
    }

    /**
     * Apply framework effects
     */
    calcFramework(): void {
        const char = this._char as any;
        if (char.currentFramework) {
            char.currentFramework.apply();
        }
    }

    /**
     * Apply race and monster framework effects
     */
    calcRace(): void {
        const char = this._char as any;
        if (char.race) {
            char.race.apply();
        }

        if (char.monsterFramework) {
            char.monsterFramework.apply();
        }
    }

    /**
     * Apply gear, armor, weapon, cyberware, and robot mod effects
     */
    calcGearArmorWeaponEffects(): void {
        const char = this._char as any;

        for (const item of char._gearPurchased) {
            item.apply(char);
        }

        for (const item of char._armorPurchased) {
            item.apply(char);
        }

        for (const item of char._weaponsPurchased) {
            item.apply(char);
        }

        for (const item of char._cyberwarePurchased) {
            item.apply(char);
        }

        for (const item of char._robotModsPurchased) {
            item.apply(char);
        }
    }

    /**
     * Apply Rifts tattoo effects
     */
    calcRiftsTattoos(): void {
        const char = this._char as any;
        for (const item of char._riftsTattoosPurchased) {
            item.apply(char);
        }
    }

    /**
     * Apply edge upgrade chains (e.g., Luck → Great Luck)
     */
    calcUpgrades(): void {
        const char = this._char as any;

        for (let _lCount = 0; _lCount < char._upgrade_dirty_fighter; _lCount++) {
            if (char.hasEdge("Dirty Fighter")) {
                if (!char.hasEdge("Tricky Fighter")) {
                    char.addEdgeByNameAndApply("Tricky Fighter");
                }
            } else {
                char.addEdgeByNameAndApply("Dirty Fighter");
            }
        }

        for (let _lCount = 0; _lCount < char._upgrade_channeling; _lCount++) {
            if (char.hasEdge("Channeling")) {
                if (!char.hasEdge("Concentration")) {
                    char.addEdgeByNameAndApply("Concentration");
                }
            } else {
                char.addEdgeByNameAndApply("Channeling");
            }
        }

        for (let _lCount = 0; _lCount < char._upgrade_rapid_recharge; _lCount++) {
            if (char.hasEdge("Rapid Recharge")) {
                if (!char.hasEdge("Improved Rapid Recharge")) {
                    char.addEdgeByNameAndApply("Improved Rapid Recharge");
                }
            } else {
                char.addEdgeByNameAndApply("Rapid Recharge");
            }
        }

        for (let _lCount = 0; _lCount < char._add_quick_or_level_headed; _lCount++) {
            if (char.hasEdge("Quick")) {
                if (!char.hasEdge("Level Headed")) {
                    char.addEdgeByNameAndApply("Level Headed");
                }
            } else {
                char.addEdgeByNameAndApply("Quick");
            }
        }

        for (let _lCount = 0; _lCount < char._upgrade_luck; _lCount++) {
            if (char.hasEdge("Luck")) {
                if (!char.hasEdge("Great Luck")) {
                    char.addEdgeByNameAndApply("Great Luck");
                }
            } else {
                char.addEdgeByNameAndApply("Luck");
            }
        }

        for (let _lCount = 0; _lCount < char._upgrade_attractive; _lCount++) {
            if (char.hasEdge("Attractive")) {
                if (!char.hasEdge("Very Attractive")) {
                    char.addEdgeByNameAndApply("Vert Attractive");
                }
            } else {
                char.addEdgeByNameAndApply("Attractive");
            }
        }

        for (let _lCount = 0; _lCount < char._upgrade_martial_arts; _lCount++) {
            if (char.hasEdge("Martial Artist")) {
                if (!char.hasEdge("Martial Warrior")) {
                    char.addEdgeByNameAndApply("Martial Warrior");
                }
            } else {
                char.addEdgeByNameAndApply("Martial Artist");
            }
        }
    }

    /**
     * Calculate initial wealth based on setting and framework
     */
    calcInitialWealth(): void {
        const char = this._char as any;

        if (char._startingWealthOverride > 0) {
            char._wealthCurrent = char._startingWealthOverride;
        } else {
            char._wealthStarting = char.setting.wealthStarting;
            let startingWealth = char.setting.wealthStarting;
            if (char.currentFramework) {
                startingWealth = char.currentFramework.getStartingWealth(startingWealth);
            }

            if (char.setting.primaryIsSWADE) {
                char._wealthCurrent += startingWealth * char.getDerivedBoost("starting_funds_multiplier");
                char._wealthCurrent += char.getDerivedBoost("wealth");
            } else {
                char._wealthCurrent = startingWealth * char.getDerivedBoost("starting_funds_multiplier");
                char._wealthCurrent += char.getDerivedBoost("wealth");
                char._wealthStarting = startingWealth * char.getDerivedBoost("starting_funds_multiplier");
            }
        }
    }

    /**
     * Apply final adjustments after all calculations
     */
    calcFinalAdjustments(): void {
        const char = this._char as any;

        for (const entry of char.journal) {
            if (!isNaN(+entry.funds_gained)) {
                char._wealthCurrent += +entry.funds_gained;
            }

            if (entry.wealth_die_set) {
                char.wealthDie = entry.wealth_die_set;
            }
        }

        char.skills.sort((a: Skill, b: Skill) => {
            if (a.name > b.name) return 1;
            else if (a.name < b.name) return -1;
            else return 0;
        });

        for (const skill of char.skills) {
            skill.specialties.sort((a: ISkillSpecialty, b: ISkillSpecialty) => {
                if (a.nativeLanguageIndex > -1) {
                    return 1;
                } else {
                    if (a.name > b.name) return 1;
                    else if (a.name < b.name) return -1;
                    else return 0;
                }
            });
        }

        char._perkPointsCurrent = char._perkPointsAllocated - char._perkPointsSpent + char.setting.extraPerkPoints + char._perkPointAdjustment;
        if (char._perkPointsExtra != 0) {
            let extraAllocation = char._perkPointsTotal - char._perkPointsAllocated;
            if (extraAllocation > char._perkPointsExtra) {
                extraAllocation = char._perkPointsExtra;
            }
            char._perkPointsCurrent -= extraAllocation;
        }

        // Apply Equipped Armor Pace and Run Die
        for (const armor of char._armorPurchased) {
            if (armor.equippedArmor && armor.pace > 0) {
                char._paceOverride = armor.pace.toString();
            }
            if (armor.equippedArmor && armor.run.trim()) {
                char._runningDieOverride = armor.run.toString();
            }
            if (armor.equippedArmor && armor.setStrength.trim()) {
                char.setAttributeHard("strength", getDieIndexFromLabel(armor.setStrength));
            }
        }

        // Apply Armor Strength Penalties
        char._traitBonuses.agility -= char.getArmorMinStrengthPenalty();
        char._derivedBaseBoosts.pace -= char.getArmorMinStrengthPenalty();
        char._wealthCurrent = +char._wealthCurrent.toFixed(2);

        // Apply Encumbrance Penalties
        if (char.setting.usesEncumbrance) {
            if (char.setting.primaryIsSWADE) {
                const encumbranceBreak = char.getLoadLimit();
                if (char.getCurrentCombatLoad() / encumbranceBreak > 0) {
                    const loadPenalty = Math.floor(char.getCurrentCombatLoad() / encumbranceBreak);
                    char._traitBonuses.agility -= loadPenalty;
                    char._derivedBaseBoosts.pace -= loadPenalty;
                }
            } else {
                // Deluxe Style Encumbrance
                const encumbranceBreak = char.getLoadLimit();
                if (char.getCurrentCombatLoad() / encumbranceBreak > 0) {
                    const loadPenalty = Math.floor(char.getCurrentCombatLoad() / encumbranceBreak);
                    char._traitBonuses.agility -= loadPenalty;
                    char._traitBonuses.strength -= loadPenalty;
                }
            }
        }
    }
}
