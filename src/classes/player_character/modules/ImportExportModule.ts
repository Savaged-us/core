/**
 * ImportExportModule - Handles character import/export functionality
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - exportObj() - Serializes character to JSON-compatible object
 * - jsonExport() - Serializes character to JSON string
 * - getSkillAssignments() - Helper for skill export
 * - importObj() - Deserializes character from JSON object
 * - fixEscapedCharacterData() - Fixes over-escaped string data
 */

import type { PlayerCharacter } from '../player_character';
import {
    IJSONPlayerCharacterExport,
    IJSONArmorExport,
    IJSONWeaponExport,
    IJSONGearExport,
    IJSONCyberwareExport,
    IJSONRiftsTattoosExport,
    IJSONRobotModExport,
    IJSONVehicleExport,
    IJSONSPC2014PowerExport,
} from '../../../interfaces/IJSONPlayerCharacterExport';
import { IJSONSettingExport } from '../../../interfaces/IJSONSettingExport';
import { ISkillAssignmentExport } from '../../../interfaces/ISkillExport';
import { IChargenArmor } from '../armor';
import { IChargenWeapon } from '../weapon';
import { IChargenGear } from '../gear';
import { IChargenCyberware } from '../cyberware';
import { IChargenRiftsTattoo } from '../riftsTattoos';
import { IChargenRobotMod } from '../robot_mod';
import { IVehicleEntry } from '../../vehicle_entry';
import { cleanUpReturnValue } from '../../../utils/cleanUpReturnValue';
import { needsEscapeFixing, unescapeOverEscapedString, getDisplayText } from '../../../utils/escapeCharacterFixer';
import { generateUUID } from '../../../utils/generateUUID';
import { BaseModule } from './BaseModule';
import { PlayerCharacterAdvancement } from '../player_character_advancement';
import { PlayerCharacterFramework } from '../player_character_framework';
import { PlayerCharacterMonsterFramework } from '../player_character_monster_framework';
import { Hindrance } from '../hindrance';
import { Edge } from '../edge';
import { ArcaneBackground } from '../arcane_background';
import { SuperPower2014 } from '../super_power_2014';

export class ImportExportModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state. Export module has no state to reset.
     */
    reset(): void {
        // No state to reset for export functionality
    }

    /**
     * Fix over-escaped character data before processing
     */
    fixEscapedCharacterData(data: IJSONPlayerCharacterExport): IJSONPlayerCharacterExport {
        try {
            // Create a deep copy to avoid modifying the original
            const fixed = JSON.parse(JSON.stringify(data));
            let hasChanges = false;

            // Fix framework data if it exists
            if (fixed.currentFramework) {
                // Fix bonus selections
                if (Array.isArray(fixed.currentFramework.bonusSelections)) {
                    fixed.currentFramework.bonusSelections = fixed.currentFramework.bonusSelections.map((selection: string) => {
                        if (typeof selection === 'string' && needsEscapeFixing(selection)) {
                            hasChanges = true;
                            return unescapeOverEscapedString(selection);
                        }
                        return selection;
                    });
                }

                // Fix complication selections
                if (Array.isArray(fixed.currentFramework.complicationSelections)) {
                    fixed.currentFramework.complicationSelections = fixed.currentFramework.complicationSelections.map((selection: string) => {
                        if (typeof selection === 'string' && needsEscapeFixing(selection)) {
                            hasChanges = true;
                            return unescapeOverEscapedString(selection);
                        }
                        return selection;
                    });
                }

                // Fix table item specifications
                if (Array.isArray(fixed.currentFramework.herosJourneyTableItemSpecifications)) {
                    fixed.currentFramework.herosJourneyTableItemSpecifications = fixed.currentFramework.herosJourneyTableItemSpecifications.map((spec: string) => {
                        if (typeof spec === 'string' && needsEscapeFixing(spec)) {
                            hasChanges = true;
                            return unescapeOverEscapedString(spec);
                        }
                        return spec;
                    });
                }
            }

            // Fix skill specializations
            if (Array.isArray(fixed.skills)) {
                fixed.skills.forEach((skill: any) => {
                    if (Array.isArray(skill.specializations)) {
                        skill.specializations = skill.specializations.map((spec: string) => {
                            if (typeof spec === 'string' && needsEscapeFixing(spec)) {
                                hasChanges = true;
                                return unescapeOverEscapedString(spec);
                            }
                            return spec;
                        });
                    }

                    if (Array.isArray(skill.added_specializations)) {
                        skill.added_specializations = skill.added_specializations.map((spec: string) => {
                            if (typeof spec === 'string' && needsEscapeFixing(spec)) {
                                hasChanges = true;
                                return unescapeOverEscapedString(spec);
                            }
                            return spec;
                        });
                    }
                });
            }

            // Fix string fields that might be over-escaped
            const stringFields = ['background', 'description', 'name'];
            stringFields.forEach(field => {
                if (typeof fixed[field] === 'string' && needsEscapeFixing(fixed[field])) {
                    hasChanges = true;
                    fixed[field] = unescapeOverEscapedString(fixed[field]);
                }
            });

            if (hasChanges) {
                console.log('Fixed escaped character data during character load');
            }

            return fixed;
        } catch (error) {
            console.error('Error fixing escaped character data:', error);
            return data; // Return original data if fixing fails
        }
    }

    /**
     * Import character from JSON-compatible object
     */
    importObj(
        importObj: IJSONPlayerCharacterExport,
        gmShareSetting: IJSONSettingExport | null,
        noCalc: boolean = false,
    ): void {
        const char = this._char as any;

        // Debug: Log critical fields before import
        if (typeof window !== 'undefined') {
            console.log('📥 ImportExportModule.importObj - Critical fields check:', {
                hasName: typeof importObj.name !== 'undefined',
                name: importObj.name,
                hasBackground: typeof importObj.background !== 'undefined',
                background: typeof importObj.background === 'string' 
                    ? importObj.background.substring(0, 50) 
                    : importObj.background,
                hasAttributes: typeof importObj.attribute_assignments !== 'undefined',
                attributes: importObj.attribute_assignments,
                hasGender: typeof importObj.gender !== 'undefined',
                gender: importObj.gender,
                hasAge: typeof importObj.age !== 'undefined',
                age: importObj.age,
            });
        }

        char.reset();

        // Fix any escaped character data before processing
        importObj = this.fixEscapedCharacterData(importObj);

        if (importObj.prompt_specify_values) {
            char._promptSpecifyValues = importObj.prompt_specify_values;
        } else {
            char._promptSpecifyValues = {};
        }

        if (typeof importObj.last_save_id !== 'undefined') {
            char.last_save_id = importObj.last_save_id;
        }

        if (typeof importObj.allowAdvancementTraitAlteration !== 'undefined') {
            char.allowAdvancementTraitAlteration = importObj.allowAdvancementTraitAlteration;
        }

        char.settingReadOnly = false;
        char.gmSessionID = 0;
        if (
            typeof importObj.session_id !== 'undefined'
            && importObj.session_id > 0
        ) {
            char.gmSessionID = importObj.session_id;
            char.settingReadOnly = true;
            char.registeredDataOnly = false;
        }

        if (typeof importObj.loose_attributes !== 'undefined') {
            char._looseAttributes = importObj.loose_attributes;
        }

        if (typeof importObj.linguist_boosted_skills !== 'undefined') {
            char._linguistBoostedSkills = importObj.linguist_boosted_skills;
        }

        if (importObj.additional_statistics) {
            char.additional_statistics = importObj.additional_statistics;
        }
        if (typeof importObj.equipped_innate !== 'undefined') {
            char._equippedInnate = importObj.equipped_innate;
        }

        if (typeof importObj.wealth_adjusted !== 'undefined') {
            char._wealthAdjusted = importObj.wealth_adjusted;
        }

        if (typeof importObj.wealth_die !== 'undefined') {
            char.wealthDie = importObj.wealth_die;
        }

        if (importObj.selected_factions) {
            char.selectedFactions = importObj.selected_factions;
        }

        if (importObj.added_edge_options) {
            char._addedEdgeOptions = importObj.added_edge_options;
        }
        if (importObj.added_hindrance_options) {
            char._addedHindranceOptions = importObj.added_hindrance_options;
        }
        if (typeof importObj.skills_custom !== 'undefined') {
            char._custom_skills = importObj.skills_custom;
        }

        if (char.gmSettingShare && gmShareSetting) {
            char.setting.import(gmShareSetting);
        } else {
            if (typeof importObj.setting !== 'undefined') {
                char.setting.import(importObj.setting);
            }
        }

        if (importObj.framework) {
            if (importObj.framework.frameworkDef) {
                char.currentFramework = new PlayerCharacterFramework(importObj.framework.frameworkDef, char);
                if (char.currentFramework) {
                    char.currentFramework.setData(importObj.framework);
                }
            } else {
                char.setCurrentFrameworkById(importObj.framework.frameworkID);
                if (char.currentFramework) {
                    char.currentFramework.setData(importObj.framework);
                }
            }

            if (char.currentFramework)
                char.currentFramework.preCalc();
        }

        if (importObj.monster_framework) {
            if (importObj.monster_framework.monsterFrameworkDef) {
                char.monsterFramework = new PlayerCharacterMonsterFramework(importObj.monster_framework.monsterFrameworkDef, char);
                if (char.monsterFramework) {
                    char.monsterFramework.setData(importObj.monster_framework);
                }
            } else {
                char.setMonsterFrameworkById(importObj.monster_framework.monsterFrameworkID);
                if (char.monsterFramework) {
                    char.monsterFramework.setData(importObj.monster_framework);
                }
            }
        }

        if (typeof importObj.uuid !== 'undefined' && importObj.uuid) {
            char.UUID = importObj.uuid;
        } else {
            char.UUID = generateUUID();
        }

        if (typeof importObj.journal !== 'undefined') {
            char.journal = importObj.journal;
        }

        for (const item of char.journal) {
            if (typeof item.entry !== 'string') {
                item.entry = item.entry.join("\n");
            }
        }

        char.woundsCurrent = 0;
        if (importObj.wounds_current) {
            char.woundsCurrent = importObj.wounds_current;
        }
        char.state = {
            shaken: false,
            stunned: false,
            distracted: false,
            vulnerable: false,
            entangled: false,
            bound: false,
            incapacitated: false,
        };

        char._base_specifies = [];
        if (importObj.base_specifies && importObj.base_specifies.length > 0) {
            char._base_specifies = importObj.base_specifies;
        }

        if (importObj.state) {
            char.state = importObj.state;
        }

        char.fatigueCurrent = 0;
        if (importObj.fatigue_current) {
            char.fatigueCurrent = importObj.fatigue_current;
        }

        if (typeof importObj.profession_or_title !== 'undefined') {
            char.professionOrTitle = importObj.profession_or_title;
        }

        if (typeof importObj.advancements !== 'undefined') {
            for (const adv of importObj.advancements) {
                char._advancements.push(
                    new PlayerCharacterAdvancement(char._advancements.length, adv, char)
                );
            }
        }

        for (const entryIndex in char.journal) {
            char.journal[entryIndex].date = new Date(char.journal[entryIndex].date);
            if (!char.journal[entryIndex].funds_gained) {
                char.journal[entryIndex].funds_gained = "0";
            }

            if (!char.journal[entryIndex].xp_gained) {
                char.journal[entryIndex].xp_gained = 0;
            }

            if (!char.journal[entryIndex].advancements_gained) {
                char.journal[entryIndex].advancements_gained = 0;
            }

            if (!char.journal[entryIndex].wealth_die_set) {
                char.journal[entryIndex].wealth_die_set = "";
            }
        }

        if (typeof importObj.people_places_things !== 'undefined') {
            char.peoplePlacesThings = importObj.people_places_things;
        }

        for (const item of char.peoplePlacesThings) {
            if (typeof item.notes !== 'string') {
                item.notes = item.notes.join("\n");
            }
        }

        if (typeof importObj.race_ability_specifies !== 'undefined') {
            char._raceAbilitySpecifies = importObj.race_ability_specifies;
        } else {
            char._raceAbilitySpecifies = [];
        }

        if (typeof importObj.race_ability_alternative_choices !== 'undefined') {
            char._raceAbilityAlternativeChoices = importObj.race_ability_alternative_choices;
        } else {
            char._raceAbilityAlternativeChoices = [];
        }

        if (typeof importObj.race !== 'undefined') {
            char.race.setRaceByID(importObj.race);
        }

        if (typeof importObj.race_custom !== 'undefined') {
            if (importObj.race_custom) {
                char.race.setRaceCustom(importObj.race_custom);
            }
        }

        if (char.race && importObj.race_choices) {
            char.race.importOptions(importObj.race_choices);
        }

        if (typeof importObj.name !== 'undefined') {
            char.name = getDisplayText(importObj.name);
        }

        if (typeof importObj.player_name !== 'undefined') {
            char.playerName = getDisplayText(importObj.player_name);
        }

        if (typeof importObj.attribute_assignments !== 'undefined') {
            char._attributeAssignments = importObj.attribute_assignments;
        }

        if (char._attributeAssignments.agility < 0) {
            char._attributeAssignments.agility = 0;
        }
        if (char._attributeAssignments.smarts < 0) {
            char._attributeAssignments.smarts = 0;
        }
        if (char._attributeAssignments.spirit < 0) {
            char._attributeAssignments.spirit = 0;
        }
        if (char._attributeAssignments.strength < 0) {
            char._attributeAssignments.strength = 0;
        }
        if (char._attributeAssignments.vigor < 0) {
            char._attributeAssignments.vigor = 0;
        }

        if (typeof importObj.gender !== 'undefined') {
            char.gender = importObj.gender;
        }
        if (typeof importObj.age !== 'undefined') {
            char.age = importObj.age;
        }

        char.background = "";
        if (importObj.background && typeof importObj.background !== 'undefined') {
            if (typeof importObj.background === 'string') {
                char.background = getDisplayText(importObj.background);
            } else {
                char.background = getDisplayText((importObj.background as string[]).join("\n"));
            }
        }

        char.description = "";
        if (importObj.description && typeof importObj.description !== 'undefined') {
            if (typeof importObj.description === 'string') {
                char.description = getDisplayText(importObj.description);
            } else {
                char.description = getDisplayText((importObj.description as string[]).join("\n"));
            }
        }

        if (typeof importObj.image_upload !== 'undefined') {
            char.image_url = importObj.image_upload;
            char.saved_image = importObj.image_upload;
        }

        if (typeof importObj.image_updated !== 'undefined') {
            char.image_updated = new Date(importObj.image_updated);
        }

        if (typeof importObj.image_token_upload !== 'undefined') {
            char.imageTokenURL = importObj.image_token_upload;
            char.saved_token_image = importObj.image_token_upload;
        }

        if (typeof importObj.saved_token_image !== 'undefined' && importObj.saved_token_image.trim()) {
            char.saved_token_image = importObj.saved_token_image;
        }

        if (typeof importObj.saved_setting_image !== 'undefined' && importObj.saved_setting_image.trim()) {
            char.saved_setting_image = importObj.saved_setting_image;
        }

        if (typeof importObj.saved_image !== 'undefined' && importObj.saved_image.trim()) {
            char.saved_image = importObj.saved_image;
        }

        if (typeof importObj.image_token_updated !== 'undefined') {
            char.imageTokenUpdated = new Date(importObj.image_token_updated);
        }

        if (typeof (importObj as any).native_language !== 'undefined') {
            char.setNativeLanguage((importObj as any).native_language, 0);
        }

        if (typeof importObj.native_languages !== 'undefined') {
            char.nativeLanguages = importObj.native_languages;
        }

        if (typeof importObj.multiple_languages !== 'undefined') {
            if (typeof importObj.multiple_languages === "string") {
                char.multipleLanguages = (importObj.multiple_languages as string).split("\n");
            } else {
                char.multipleLanguages = importObj.multiple_languages || [];
            }

            // Fix escape characters in imported languages
            char.multipleLanguages = char.multipleLanguages.map((lang: any) =>
                typeof lang === 'string' ? getDisplayText(lang) : lang
            );

            if (char._linguistBoostedSkills.length === 0 && char.multipleLanguages.length > 1) {
                char._linguistBoostedSkills = char.multipleLanguages;
                // remove native skill name
                char._linguistBoostedSkills.splice(1, 1);
            }
        }

        if (typeof importObj.custom_hindrances !== 'undefined') {
            for (const hindDef of importObj.custom_hindrances) {
                if ('base_name' in hindDef) {
                    const newHindrance = new Hindrance(hindDef, char);
                    newHindrance.is_custom = true;
                    char._hindrancesCustom.push(newHindrance);
                }
            }
        }

        if (typeof importObj.custom_edges !== 'undefined') {
            for (const edgeDef of importObj.custom_edges) {
                if (edgeDef.setting_item) {
                    for (const settingDef of char.setting.customEdges) {
                        if (settingDef.uuid === edgeDef.uuid) {
                            const newEdge = new Edge(edgeDef, char);
                            newEdge.is_custom = true;
                            newEdge.isSelectedEdge = true;
                            char._edgesCustom.push(newEdge);
                        }
                    }
                } else {
                    if ('group' in edgeDef) {
                        const newEdge = new Edge(edgeDef, char);
                        newEdge.is_custom = true;
                        newEdge.isSelectedEdge = true;
                        char._edgesCustom.push(newEdge);
                    }
                }
            }
        }

        if (typeof importObj.perks !== 'undefined') {
            char._perksSelected = importObj.perks;
        }

        if (typeof importObj.hindrances !== 'undefined') {
            for (const hindImport of importObj.hindrances) {
                char.hindranceInstall(
                    hindImport.id,
                    hindImport.specify,
                    hindImport.major,
                );
            }
        }

        if (typeof importObj.edges !== 'undefined') {
            for (const edgeImport of importObj.edges) {
                if (edgeImport.edgeOptions) {
                    char.edgeInstall(
                        edgeImport.id,
                        edgeImport.edgeOptions,
                    );
                }
            }
        }

        if (typeof importObj.xp !== "undefined") {
            char._xp = importObj.xp;
        }

        if (typeof importObj.precalc_xp !== "undefined") {
            char._xp_precalc = importObj.precalc_xp;
        }

        if (typeof importObj.advancement_count !== "undefined") {
            char._advancement_count = importObj.advancement_count;
        }

        if (typeof importObj.advancement_precalc !== "undefined") {
            char._advancement_precalc = importObj.advancement_precalc;
        }

        if (!char.setting.primaryIsSWADE) {
            char.setAdvancementCountPerXP();
        }

        if (typeof importObj.allied_extras !== "undefined") {
            char._allies = importObj.allied_extras;
        }

        let allyCount = 0;
        for (const ally of char._allies) {
            if (!ally.uuid) {
                ally.uuid = generateUUID();
                ally.uuid += "X" + allyCount.toString();
            }
            allyCount++;
        }

        if (
            typeof importObj.arcane_backgrounds !== 'undefined'
            && importObj.arcane_backgrounds.length > 0
        ) {
            // Current style AB
            // make sure that the AB array is ready....
            char._calcFramework();
            char._calcRace();
            char._calcArcaneBackgrounds();
            let abIndex = char._startingSelectedArcaneBackground;
            for (const ab of importObj.arcane_backgrounds) {
                if (ab) {
                    if (ab.ab_selected === -1 || ab.ab_selected === 0) {
                        if (!ab.custom_export) {
                            ab.custom_export = null;
                        }

                        char.setArcaneBackgroundCustom(
                            abIndex,
                            ab.custom_export,
                            ab.uuid,
                        );
                    } else {
                        char.setArcaneBackgroundById(ab.ab_selected, abIndex, ab.uuid);
                    }

                    const selectedAB = char._selectedArcaneBackgrounds[abIndex];
                    if (selectedAB && typeof selectedAB.importOptions === 'function') {
                        selectedAB.importOptions(ab);
                    }
                }
                abIndex++;
            }
        } else {
            if (typeof importObj.ab_selected !== 'undefined' && importObj.ab_selected > 0) {
                // Old style AB
                // make sure that the AB array is ready....
                char._calcArcaneBackgrounds();
                char.setArcaneBackgroundById(importObj.ab_selected, 0);

                if (typeof importObj.powers_installed !== 'undefined' && importObj.powers_installed.length > 0) {
                    for (const power of importObj.powers_installed) {
                        char.LEGACY_selectPowerByPowerDef(power);
                    }
                }
            }
        }

        char.resetSkills();

        if (typeof importObj.skill_assignments !== 'undefined') {
            for (const assign of importObj.skill_assignments) {
                if (assign.value < 0) {
                    assign.value = 0;
                }

                let nativeLanguageIndex = assign.nativeLanguageIndex;
                if ((assign as any).isNative) {
                    nativeLanguageIndex = 0;
                }
                char.setSkillValue(
                    assign.name,
                    assign.specify,
                    assign.value,
                    assign.lang,
                    nativeLanguageIndex,
                    assign.isLing,
                    false,
                );
            }
        }

        if (importObj.etu_majors) {
            char.ETUMajors = importObj.etu_majors;
        }

        char.ETUExtracurricularChoice = "";
        if (importObj.etu_extracurricular) {
            char.ETUExtracurricularChoice = importObj.etu_extracurricular;
        }

        if (char.ETUMajors.length === 0) {
            char.ETUMajors = "";
        }

        if (importObj.etu_scholarship_bonus) {
            char.ETUScholarshipBonus = importObj.etu_scholarship_bonus;
        }

        if (importObj.skill_specializations) {
            for (const skill_name in importObj.skill_specializations) {
                if (
                    importObj.skill_specializations[skill_name]
                    && importObj.skill_specializations[skill_name].length > 0
                ) {
                    for (const skill of char.skills) {
                        if (skill.name && skill.name.toLowerCase().trim() === skill_name.toLowerCase().trim()) {
                            skill.specializations = importObj.skill_specializations[skill_name];
                        }
                    }
                }
            }
        }

        if (typeof importObj.purchased_armor !== 'undefined') {
            for (const armorImport of importObj.purchased_armor) {
                char.purchaseArmor(
                    armorImport.id,
                    armorImport.def,
                    armorImport.options,
                );
            }
        }

        if (typeof importObj.purchased_gear !== 'undefined') {
            for (const gearImport of importObj.purchased_gear) {
                char.purchaseGear(
                    gearImport.id,
                    gearImport.def,
                    gearImport.options,
                );
            }
        }

        if (typeof importObj.purchased_weapons !== 'undefined') {
            for (const weaponImport of importObj.purchased_weapons) {
                char.purchaseWeapon(
                    weaponImport.id,
                    weaponImport.def,
                    weaponImport.options,
                );
            }
        }

        if (typeof importObj.purchased_vehicles !== 'undefined') {
            for (const itemImport of importObj.purchased_vehicles) {
                char.purchaseVehicle(
                    itemImport.id,
                    itemImport.def,
                    itemImport.options,
                );
            }
        }

        if (typeof importObj.purchased_cyberware !== 'undefined') {
            for (const cyberImport of importObj.purchased_cyberware) {
                char.purchaseCyberware(
                    cyberImport.id,
                    cyberImport.def,
                    cyberImport.options,
                );
            }
        }

        if (typeof importObj.purchased_rifts_tattoos !== 'undefined') {
            for (const cyberImport of importObj.purchased_rifts_tattoos) {
                char.purchaseRiftsTattoo(
                    cyberImport.id,
                    cyberImport.def,
                    cyberImport.options,
                );
            }
        }

        if (typeof importObj.purchased_robot_mods !== 'undefined') {
            for (const rmImport of importObj.purchased_robot_mods) {
                char.purchaseRobotMod(
                    rmImport.id,
                    rmImport.def,
                    rmImport.options,
                );
            }
        }

        if (typeof (importObj as any).spc_powers !== 'undefined' && (importObj as any).spc_powers.length > 0) {
            for (const spData of (importObj as any).spc_powers) {
                for (const spDef of char._availableData.super_powers_2014) {
                    if (spData.id === spDef.id) {
                        console.warn("Legacy SPC Import", spDef);
                        const superPower = new SuperPower2014(spDef, char);
                        superPower.importOptions(spData);
                        char.superPowers2014.push(superPower);
                        break;
                    }
                }
            }
        }

        if (typeof importObj.spc_2014_powers !== 'undefined' && importObj.spc_2014_powers.length > 0) {
            for (const spData of importObj.spc_2014_powers) {
                if (spData.id > 0) {
                    for (const spDef of char._availableData.super_powers_2014) {
                        if (spData.id === spDef.id) {
                            const superPower = new SuperPower2014(spDef, char);
                            superPower.importOptions(spData.options);
                            char.superPowers2014.push(superPower);
                            break;
                        }
                    }
                }
            }
        }

        char.superPowers2014SuperKarma = false;
        if (importObj.spc_super_karma) {
            char.superPowers2014SuperKarma = true;
        }

        // Debug: Log critical fields after import
        if (typeof window !== 'undefined') {
            console.log('📤 ImportExportModule.importObj - After import:', {
                name: char.name,
                background: char.background?.substring(0, 50),
                description: char.description?.substring(0, 50),
                gender: char.gender,
                age: char.age,
                attributes: char._attributeAssignments,
            });
        }

        if (!noCalc) {
            char.calc(false, true);
        }
    }

    /**
     * Export character to JSON-compatible object
     */
    exportObj(): IJSONPlayerCharacterExport {
        // Use 'any' cast to access private properties - this is a "friend class" pattern
        const char = this._char as any;

        let exportObj: IJSONPlayerCharacterExport = {
            version: 2.2,
            prompt_specify_values: char._promptSpecifyValues,
            session_id: char.gmSessionID,
            image_token_upload: "",
            image_token_updated: char.imageTokenUpdated,
            wealth_die: char.wealthDie,
            last_save_id: char.last_save_id,
            saved_token_image: char.saved_token_image,
            saved_image: char.saved_image,
            saved_setting_image: char.saved_setting_image,

            allowAdvancementTraitAlteration: char.allowAdvancementTraitAlteration,

            linguist_boosted_skills: char._linguistBoostedSkills,
            additional_statistics: char.additional_statistics,

            race_choices: char.race.exportOptions(),

            image_upload: "",  // Temporary
            name: char.name,
            gm_setting_share: char.gmSettingShare,
            profession_or_title: char.professionOrTitle,
            player_name: char.playerName,
            loose_attributes: char._looseAttributes,
            setting: char.setting.export(),
            gender: char.gender,
            age: char.age,
            background: char.background,
            description: char.description,
            native_languages: char.nativeLanguages,
            multiple_languages: char.multipleLanguages,
            race: char.race.id,
            hindrances: [],
            selected_factions: char.selectedFactions,
            edges: [],
            state: char.state,
            perks: char._perksSelected,
            custom_hindrances: [],
            custom_edges: [],
            attribute_assignments: char._attributeAssignments,
            skill_assignments: [],
            skill_specializations: {},
            race_custom: null,
            uuid: char.UUID,
            image_updated: char.image_updated,
            purchased_armor: [],
            purchased_weapons: [],
            purchased_gear: [],
            purchased_cyberware: [],
            purchased_rifts_tattoos: [],
            purchased_robot_mods: [],
            allied_extras: char._allies,
            race_ability_specifies: char._raceAbilitySpecifies,
            race_ability_alternative_choices: char._raceAbilityAlternativeChoices,
            people_places_things: char.peoplePlacesThings,
            journal: char.journal,
            xp: char._xp,
            precalc_xp: char._xp_precalc,
            advancement_count: char._advancement_count,
            advancement_precalc: char._advancement_precalc,
            advancements: [],
            skills_custom: [],
            arcane_backgrounds: [],
            ab_selected: 0,
            powers_installed: [],
            custom_armor: [],
            custom_gear: [],
            custom_weapons: [],
            spc_2014_powers: [],
            spc_super_karma: char.superPowers2014SuperKarma,

            cyberware_custom: [],
            wounds_current: char.woundsCurrent,
            fatigue_current: char.fatigueCurrent,
            base_specifies: [],
            etu_majors: char.ETUMajors,
            etu_extracurricular: char.ETUExtracurricularChoice,
            etu_scholarship_bonus: char.ETUScholarshipBonus,
            framework: null,
            monster_framework: null,
            wealth_adjusted: char._wealthAdjusted,
            added_edge_options: char._addedEdgeOptions,
            added_hindrance_options: char._addedHindranceOptions,
            equipped_innate: char._equippedInnate,
            purchased_vehicles: [],
        };

        if (char.currentFramework) {
            exportObj.framework = char.currentFramework.exportData();
        }

        if (char.monsterFramework) {
            exportObj.monster_framework = char.monsterFramework.exportData();
        }

        if (char.setting.primaryIsSWADE && char.setting.isPathfinderStyleLanguages() === false) {
            exportObj.multiple_languages = [];
            for (const skill of char.skills) {
                if (skill.isLanguage) {
                    for (const spec of skill.specialties) {
                        exportObj.multiple_languages.push(spec.name);
                    }
                }
            }
        }

        // Export super powers 2014
        for (const sp of char.superPowers2014) {
            const spcExport: IJSONSPC2014PowerExport = {
                id: sp.id,
                def: null,
                options: sp.exportOptions(),
            };
            exportObj.spc_2014_powers.push(spcExport);
        }

        // Export arcane backgrounds
        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                if (!ab.fromRace) {
                    exportObj.arcane_backgrounds.push(ab.exportOptions());
                }
            }
        }

        // Export advancements
        for (const adv of char._advancements) {
            exportObj.advancements.push(adv.exportObj());
        }

        // Export armor
        for (const armor of char._armorPurchased) {
            let customDef: IChargenArmor | null = null;
            if (armor.is_custom || armor.id === 0) {
                customDef = armor.export();
                customDef.book_def = undefined;
                customDef.updated_by_user = undefined;
                customDef.deleted_by_user = undefined;
                customDef.created_by_user = undefined;
            }
            const exportDef: IJSONArmorExport = {
                id: armor.id,
                def: customDef,
                options: armor.exportOptions(),
            };
            exportObj.purchased_armor.push(exportDef);
        }

        // Export weapons
        for (const weapon of char._weaponsPurchased) {
            let customDef: IChargenWeapon | null = null;
            if (weapon.is_custom || weapon.id === 0) {
                customDef = weapon.export();
                customDef.book_def = undefined;
                customDef.updated_by_user = undefined;
                customDef.deleted_by_user = undefined;
                customDef.created_by_user = undefined;
            }
            const exportDef: IJSONWeaponExport = {
                id: weapon.id,
                def: customDef,
                options: weapon.exportOptions(),
            };
            exportObj.purchased_weapons.push(exportDef);
        }

        // Export vehicles
        for (const vehicle of char._vehiclesPurchased) {
            let customDef: IVehicleEntry | null = null;
            if (vehicle.is_custom || vehicle.id === 0) {
                customDef = vehicle.export();
                customDef.book_def = undefined;
                customDef.updated_by_user = undefined;
                customDef.deleted_by_user = undefined;
                customDef.created_by_user = undefined;
            }
            const exportDef: IJSONVehicleExport = {
                id: vehicle.id,
                def: customDef,
                options: vehicle.exportOptions(),
            };
            exportObj.purchased_vehicles.push(exportDef);
        }

        // Export base specifies (skill specialties)
        exportObj.base_specifies = [];
        for (const skill of char.skills) {
            let indexNumber = 1;
            for (const spec of skill.specialties) {
                exportObj.base_specifies.push({
                    skill: skill.name,
                    specify: spec.name,
                    index: indexNumber,
                });
                indexNumber++;
            }
        }

        // Export gear
        for (const gear of char._gearPurchased) {
            let customDef: IChargenGear | null = null;
            if (gear.is_custom || gear.id === 0) {
                customDef = gear.export();
                customDef.book_def = undefined;
                customDef.updated_by_user = undefined;
                customDef.deleted_by_user = undefined;
                customDef.created_by_user = undefined;
            }
            const exportDef: IJSONGearExport = {
                id: gear.id,
                def: customDef,
                options: gear.exportOptions(),
            };
            exportObj.purchased_gear.push(exportDef);
        }

        // Export cyberware
        for (const ware of char._cyberwarePurchased) {
            let customDef: IChargenCyberware | null = null;
            if (ware.is_custom || ware.id === 0) {
                customDef = ware.export();
                customDef.book_def = undefined;
                customDef.updated_by_user = undefined;
                customDef.deleted_by_user = undefined;
                customDef.created_by_user = undefined;
            }
            if (customDef || ware.id) {
                const exportDef: IJSONCyberwareExport = {
                    id: ware.id,
                    def: customDef,
                    options: ware.exportOptions(),
                };
                exportObj.purchased_cyberware.push(exportDef);
            }
        }

        // Export Rifts tattoos
        for (const ware of char._riftsTattoosPurchased) {
            let customDef: IChargenRiftsTattoo | null = null;
            if (ware.is_custom || ware.id === 0) {
                customDef = ware.export();
                customDef.book_def = undefined;
                customDef.updated_by_user = undefined;
                customDef.deleted_by_user = undefined;
                customDef.created_by_user = undefined;
            }
            if (customDef || ware.id) {
                const exportDef: IJSONRiftsTattoosExport = {
                    id: ware.id,
                    def: customDef,
                    options: ware.exportOptions(),
                };
                exportObj.purchased_rifts_tattoos.push(exportDef);
            }
        }

        // Export robot mods
        for (const ware of char._robotModsPurchased) {
            let customDef: IChargenRobotMod | null = null;
            if (ware.is_custom || ware.id === 0) {
                customDef = ware.export();
                customDef.book_def = undefined;
                customDef.updated_by_user = undefined;
                customDef.deleted_by_user = undefined;
                customDef.created_by_user = undefined;
            }
            if (customDef || ware.id) {
                const exportDef: IJSONRobotModExport = {
                    id: ware.id,
                    def: customDef,
                    options: ware.exportOptions(),
                };
                exportObj.purchased_robot_mods.push(exportDef);
            }
        }

        // Export custom race
        if (char.race.is_custom) {
            exportObj.race_custom = char.race.export();
        }

        // Export custom edges
        for (const edge of char._edgesCustom) {
            exportObj.custom_edges.push(edge.export());
        }

        // Export custom hindrances
        for (const hind of char._hindrancesCustom) {
            exportObj.custom_hindrances.push(hind.export());
        }

        // Export selected hindrances
        for (const hind of char._hindrancesSelected) {
            exportObj.hindrances.push({
                id: hind.id,
                specify: hind.specify,
                major: hind.major,
            });
        }

        // Export selected edges
        for (const edge of char._edgesSelected) {
            exportObj.edges.push({
                id: edge.id,
                edgeOptions: edge.exportOptions(),
            });
        }

        // Export skill assignments
        exportObj.skill_assignments = this.getSkillAssignments();
        exportObj.skills_custom = char._custom_skills;

        // Export skill specializations
        for (const skill of char.skills) {
            if (skill.specializations.length > 0) {
                exportObj.skill_specializations[skill.name] = skill.specializations;
            }
        }

        exportObj = cleanUpReturnValue(exportObj);
        return exportObj;
    }

    /**
     * Export character to JSON string
     */
    jsonExport(): string {
        return JSON.stringify(this.exportObj());
    }

    /**
     * Get skill assignments for export
     */
    getSkillAssignments(): ISkillAssignmentExport[] {
        const char = this._char as any;
        const skill_assignments: ISkillAssignmentExport[] = [];

        for (const skill of char.skills) {
            if (skill.assignedValue > 0) {
                skill_assignments.push({
                    lang: skill.isLanguage,
                    name: skill.name,
                    specify: "",
                    specify_index: -1,
                    value: skill.assignedValue,
                    nativeLanguageIndex: -1,
                    isLing: false,
                });
            }

            for (const specIndex in skill.specialties) {
                if (
                    skill.specialties[specIndex] &&
                    (
                        skill.specialties[specIndex].assignedValue > 0 ||
                        skill.specialties[specIndex].nativeLanguageIndex > -1 ||
                        skill.specialties[specIndex].isLinguistLanguage
                    )
                ) {
                    skill_assignments.push({
                        lang: skill.specialties[specIndex].isLanguage,
                        name: skill.name,
                        specify: skill.specialties[specIndex].name,
                        specify_index: +specIndex,
                        value: skill.specialties[specIndex].assignedValue,
                        nativeLanguageIndex: skill.specialties[specIndex].nativeLanguageIndex,
                        isLing: skill.specialties[specIndex].isLinguistLanguage,
                    });
                }
            }
        }

        return skill_assignments;
    }
}
