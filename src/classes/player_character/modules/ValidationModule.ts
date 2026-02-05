/**
 * ValidationModule - Handles character validation logic
 *
 * Extracted from PlayerCharacter._validate() method.
 * This module validates all aspects of character creation including:
 * - Trait allocations (attributes, skills)
 * - Arcane backgrounds and powers
 * - Perk points and hindrances
 * - Super powers (2014 and 2021 systems)
 * - Edges and their requirements
 * - Cyberware and robot mods
 * - Equipment (armor, weapons, load)
 * - Wealth/money
 */

import type { PlayerCharacter } from '../player_character';
import { IValidationMessage } from '../../../interfaces/IValidationMessage';
import { ValidityLevel } from '../../../enums/ValidityLevel';
import { getDieIndexFromLabel } from '../../../utils/Dice';
import { BaseModule } from './BaseModule';

// Re-export validation count interfaces for external use
export interface IValidationCount {
    errors: number;
    warnings: number;
}

export interface IValidationCounts {
    [id: string]: IValidationCount;
}

export class ValidationModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset validation state. Called during character reset and before calc.
     */
    reset(): void {
        this._char.validationMessages = [];
        this._char.validLevel = 0;
        this._char.chargenValidationErrors = {};
    }

    /**
     * Add a validation message to the character
     */
    addMessage(
        validationLevel: ValidityLevel,
        validationMessage: string,
        validationGoURL: string = "",
    ): void {
        if (validationLevel > 0) {
            this._char.validationMessages.push({
                message: validationMessage,
                severity: validationLevel,
                goURL: validationGoURL,
            });
        }
    }

    /**
     * Add a validation message object, optionally checking for duplicates
     */
    addMessageObj(
        validationMessage: IValidationMessage,
        noDuplicates: boolean = false,
    ): void {
        if (validationMessage.severity > 0) {
            if (!noDuplicates) {
                let found = false;
                for (const message of this._char.validationMessages) {
                    if (message.message === validationMessage.message &&
                        message.severity === validationMessage.severity) {
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this._char.validationMessages.push(validationMessage);
                }
            } else {
                this._char.validationMessages.push(validationMessage);
            }
        }
    }

    /**
     * Run full character validation
     * This is the main validation entry point called at the end of calc()
     */
    validate(): void {
        this.validateTraits();
        this.validateArcaneBackgrounds();
        this.validatePerkPoints();
        this.validateSuperPowers2014();
        this.validateEdges();
        this.validateHindrances();
        this.validateAdvancements();
        this.validateCyberware();
        this.validateRobotMods();
        this.validateWealth();
        this.handleSpecialCases();
        this.validateEquipmentStrength();
        this.validateEncumbrance();
        this.finalizeValidation();
    }

    /* ***********************************************
        Validate Traits
    *********************************************** */
    private validateTraits(): void {
        const char = this._char;

        if (char._currentAttributeAllocationPoints < 0) {
            this.addMessage(
                ValidityLevel.Error,
                "You have used too many attribute allocations",
                "/character/creator/traits",
            );
        } else if (char._currentAttributeAllocationPoints > 0) {
            this.addMessage(
                ValidityLevel.Warning,
                "You still have attribute allocations to spend",
                "/character/creator/traits",
            );
        }

        if (char._currentSkillAllocationPoints < 0) {
            this.addMessage(
                ValidityLevel.Error,
                "You have used too many skill allocations",
                "/character/creator/traits",
            );
        } else if (char._currentSkillAllocationPoints > 0) {
            this.addMessage(
                ValidityLevel.Warning,
                "You still have skill allocations to spend",
                "/character/creator/traits",
            );
        }

        if (char._currentSmartsSkillAllocationPoints < 0) {
            this.addMessage(
                ValidityLevel.Error,
                "You have used too many smarts skill allocations",
                "/character/creator/traits",
            );
        } else if (char._currentSmartsSkillAllocationPoints > 0) {
            this.addMessage(
                ValidityLevel.Warning,
                "You still have smarts skill allocations to spend",
                "/character/creator/traits",
            );
        }
    }

    /* ***********************************************
        Validate Arcane Backgrounds
    *********************************************** */
    private validateArcaneBackgrounds(): void {
        const char = this._char;
        let abIndex = 0;

        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                // Check banned arcane backgrounds
                for (const bab of char._bannedABs) {
                    if (
                        ab.isNamed(bab.name.toLowerCase().trim()) &&
                        !ab.unchangeable &&
                        !ab.fromRace
                    ) {
                        this.addMessage(
                            ValidityLevel.Error,
                            "Arcane Background \"" + ab.getName() + "\" cannot be taken. It's been forbidden by a " + bab.from,
                            "/character/creator/powers",
                        );
                    }
                }

                // Check power count
                if (ab.availablePowerCount() < 0) {
                    this.addMessage(
                        ValidityLevel.Error,
                        "Arcane Background \"" + ab.getName() + "\" has too many powers selected",
                        "/character/creator/powers",
                    );
                }

                // Check power points
                if (ab.currentPowerPoints < 0) {
                    this.addMessage(
                        ValidityLevel.Error,
                        "Arcane Background \"" + ab.getName() + "\" has a negative power points (likely from Artificer)",
                        "/character/creator/powers",
                    );
                }

                // Check each power's availability
                for (const power of ab.selectedPowers) {
                    if (!power.LEGACY_isAvailable(abIndex, true, char)) {
                        this.addMessage(
                            ValidityLevel.Error,
                            "The Selected Power \"" + power.getName() + "\" in Arcane Background \"" + ab.getName() + "\" " + power.LEGACY_isNotAvailableReason(abIndex, true),
                            "/character/creator/powers",
                        );
                    }
                }

                // Check AB availability
                const message = ab.isAvailable(char);
                if (!message.canBeTaken) {
                    this.addMessage(
                        ValidityLevel.Error,
                        message.messages.join("; "),
                        "/character/creator/powers",
                    );
                }
            }
            abIndex++;
        }
    }

    /* ***********************************************
        Validate Perk Points
    *********************************************** */
    private validatePerkPoints(): void {
        const char = this._char;

        // Check hindrance availability
        for (const hind of char._hindrancesSelected) {
            if (hind.removed === false) {
                const message = hind.isAvailable(char);
                if (!message.canBeTaken) {
                    this.addMessage(
                        ValidityLevel.Error,
                        message.messages.join("; "),
                        "/character/creator/hindrances",
                    );
                }
            }
        }

        // Check perk point balance
        if (char._perkPointsCurrent < 0) {
            this.addMessage(
                ValidityLevel.Error,
                "You need to take hindrances to pay for your perk points",
                "/character/creator/hindrances",
            );
        } else if (char._perkPointsCurrent > 0) {
            this.addMessage(
                ValidityLevel.Warning,
                "You can still allocate perk points",
                "/character/creator/hindrances",
            );
        }
    }

    /* ***********************************************
        Validate Super Powers (2014 System)
    *********************************************** */
    private validateSuperPowers2014(): void {
        const char = this._char;

        if (char.getSuperPowers2014CurrentPowerPoints() > char.getSuperPowers2014MaxPowerPoints()) {
            this.addMessage(
                ValidityLevel.Error,
                "You have used too many Super Power Power Points",
                "/character/creator/super-powers",
            );
        }

        let hasGrantedTheBestThereIs: string = "";
        let theBestThereIsLimit = 0;
        let hasTheBestThereIs = false;

        if (char.hasEdge("the best there is") > 0) {
            theBestThereIsLimit = char.getTheBestThereIsPowerLimit();
            hasTheBestThereIs = true;
        } else {
            theBestThereIsLimit = char.setting.spcPowerLimit;
        }

        for (const power of char.superPowers2014) {
            if (power.getPoints() > char.setting.spcPowerLimit) {
                if (hasTheBestThereIs) {
                    if (hasGrantedTheBestThereIs === "") {
                        if (power.getPoints() > theBestThereIsLimit) {
                            this.addMessage(
                                ValidityLevel.Error,
                                "Your power \"" + power.getName() + "\" has exceeded your setting's Power Limit including \"The Best There Is\"",
                                "/character/creator/super-powers",
                            );
                        } else {
                            hasGrantedTheBestThereIs = power.getName();
                        }
                    } else {
                        this.addMessage(
                            ValidityLevel.Error,
                            "Your power \"" + power.getName() + "\" has exceeded your setting's Power Limit",
                            "/character/creator/super-powers",
                        );
                    }
                } else {
                    this.addMessage(
                        ValidityLevel.Error,
                        "Your power \"" + power.getName() + "\" has exceeded your setting's Power Limit",
                        "/character/creator/super-powers",
                    );
                }
            }
        }
    }

    /* ***********************************************
        Validate Edges
    *********************************************** */
    private validateEdges(): void {
        const char = this._char;
        let allEdgesSelected = char.getTotalEdgesSelected(true);

        // Check edge count
        if (char._maxEdgesCount < allEdgesSelected.length) {
            this.addMessage(
                ValidityLevel.Error,
                "You have too many edges selected",
                "/character/creator/edges",
            );
        } else if (char._maxEdgesCount !== allEdgesSelected.length) {
            this.addMessage(
                ValidityLevel.Warning,
                "You can still install an edge",
                "/character/creator/edges",
            );
        }

        allEdgesSelected = char.getTotalEdgesSelected(false);

        for (const edge of allEdgesSelected) {
            const valid = edge.isAvailable(char);
            if (!valid.canBeTaken) {
                for (const message of valid.messages) {
                    this.addMessage(
                        ValidityLevel.Error,
                        "Your edge \"" + edge.getName() + "\" can't be taken. " + message,
                        "/character/creator/edges",
                    );
                }
            }

            // Validate SWADE Super Powers 2021 in edges
            this.validateEdgeSuperPowers2021(edge);

            // Validate edge arcane backgrounds
            this.validateEdgeArcaneBackground(edge);
        }
    }

    /**
     * Validate SWADE Super Powers 2021 system within edges
     */
    private validateEdgeSuperPowers2021(edge: any): void {
        const char = this._char;

        if (char.setting.book_is_used(169) && edge.swade_super_powers.length > 0) {
            // Check total power points
            if (edge.getTotalSPCPowerPoints() > char.setting.swade_spc_campaign_power_level + char.setting.swade_spc_campaign_points_adjust) {
                this.addMessage(
                    ValidityLevel.Error,
                    "\"" + edge.getName() + "\" has a problem: The You have used too many Super Power Power Points",
                    "/character/creator/edges",
                );
            }

            if (edge.getRemainingSPCPowerPoints() < 0) {
                this.addMessage(
                    ValidityLevel.Error,
                    "\"" + edge.getName() + "\" has a problem: You have used too many Power Points",
                    "/character/creator/edges",
                );
            }

            let armorAndToughnessPointsTotal = 0;
            let usedTheBestThereIs = false;

            for (const power of edge.swade_super_powers) {
                const overPointLimit = power.isOverPowerLimit();

                if (overPointLimit > 0) {
                    if (char.hasEdge("The Best There Is")) {
                        const overPointLimitTBTI = power.isOverPowerLimit(true);

                        if (overPointLimitTBTI > 0 || usedTheBestThereIs) {
                            this.addMessage(
                                ValidityLevel.Error,
                                "\"" + edge.getName() + "\" has a problem: The power '" + power.getName() + "' is over your setting Power Limit: " + power.getPoints() + "/" + char.getSuperPowers2021CurrentPowerLimit(),
                                "/character/creator/edges",
                            );
                        } else {
                            usedTheBestThereIs = true;
                            power.theBestThereIs = true;

                            this.addMessage(
                                ValidityLevel.Information,
                                "\"" + edge.getName() + "\" has a note: The power '" + power.getName() + "' is using your \"The Best There Is\" Power Limit ",
                                "/character/creator/edges",
                            );
                        }
                    } else {
                        this.addMessage(
                            ValidityLevel.Error,
                            "\"" + edge.getName() + "\" has a problem: The power '" + power.getName() + "' is over your setting Power Limit: " + power.getPoints() + "/" + char.getSuperPowers2021CurrentPowerLimit(),
                            "/character/creator/edges",
                        );
                    }
                }

                // Track armor and toughness totals
                if (power.name.toLowerCase().trim() === "armor") {
                    armorAndToughnessPointsTotal += power.getPoints();
                }
                if (power.name.toLowerCase().trim() === "toughness") {
                    armorAndToughnessPointsTotal += power.getPoints();
                }

                // Add special ability
                char.addSpecialAbility(
                    power.getName(),
                    power.getSummary(),
                    power.book_obj.getShortName(),
                    power.book_page,
                    power.book_id,
                );
            }

            // Validate armor + toughness limits
            if (armorAndToughnessPointsTotal > char.getSuperPowers2021CurrentPowerLimit()) {
                this.addMessage(
                    ValidityLevel.Error,
                    "\"" + edge.getName() + "\" has a problem: The power point sum of your Armor and Toughness powers (" + armorAndToughnessPointsTotal + ") may not exceeed setting Power Limit of " + char.getSuperPowers2021CurrentPowerLimit(),
                    "/character/creator/edges",
                );
            }

            // Validate power sets
            for (const set of edge.swade_super_power_sets) {
                let hasArmorOrToughness = false;
                let setArmorAndToughnessTotal = 0;

                for (const power of set.super_powers) {
                    if (power.name.toLowerCase().trim() === "armor") {
                        setArmorAndToughnessTotal += power.getPoints();
                        hasArmorOrToughness = true;
                    }
                    if (power.name.toLowerCase().trim() === "toughness") {
                        setArmorAndToughnessTotal += power.getPoints();
                        hasArmorOrToughness = true;
                    }
                }

                if (hasArmorOrToughness && setArmorAndToughnessTotal + armorAndToughnessPointsTotal > char.getSuperPowers2021CurrentPowerLimit()) {
                    if (armorAndToughnessPointsTotal > 0) {
                        this.addMessage(
                            ValidityLevel.Error,
                            "\"" + edge.getName() + "\" has a problem: The power point sum of your Armor and Toughness powers (" + setArmorAndToughnessTotal + ") in your Power Set \"" + set.name + "\" in addition to your base powers Armor and Toughness (" + armorAndToughnessPointsTotal + ", total of " + (armorAndToughnessPointsTotal + setArmorAndToughnessTotal) + ") may not exceeed setting Power Limit of " + char.getSuperPowers2021CurrentPowerLimit(),
                            "/character/creator/edges",
                        );
                    } else {
                        this.addMessage(
                            ValidityLevel.Error,
                            "\"" + edge.getName() + "\" has a problem: The power point sum of your Armor and Toughness powers (" + (armorAndToughnessPointsTotal + setArmorAndToughnessTotal) + ") in your Power Set \"" + set.name + "\" may not exceeed setting Power Limit of " + char.getSuperPowers2021CurrentPowerLimit(),
                            "/character/creator/edges",
                        );
                    }
                }
            }
        }
    }

    /**
     * Validate arcane backgrounds within edges
     */
    private validateEdgeArcaneBackground(edge: any): void {
        const char = this._char;
        const abIndex = 0; // Default index for edge-based ABs

        if (edge.arcaneBackground) {
            // Check banned ABs
            for (const bab of char._bannedABs) {
                if (
                    edge.arcaneBackground.name.toLowerCase().trim() === bab.name.toLowerCase().trim() &&
                    !edge.arcaneBackground.unchangeable &&
                    !edge.arcaneBackground.fromRace
                ) {
                    this.addMessage(
                        ValidityLevel.Error,
                        "\"" + edge.getName() + "\" cannot be taken. It's been forbidden by a " + bab.from,
                        "/character/creator/edges",
                    );
                }
            }

            // Check power count
            if (edge.availablePowerCount() < 0) {
                this.addMessage(
                    ValidityLevel.Error,
                    "\"" + edge.getName() + "\" has too many powers selected",
                    "/character/creator/edges",
                );
            } else {
                const availCount = edge.availablePowerCount();
                if (availCount > 0) {
                    this.addMessage(
                        ValidityLevel.Warning,
                        availCount === 1
                            ? "\"" + edge.getName() + "\" can still select a power"
                            : "\"" + edge.getName() + "\" can still select " + availCount.toString() + " powers",
                        "/character/creator/edges",
                    );
                }
            }

            // Check power points
            if (edge.arcaneBackground.currentPowerPoints < 0) {
                this.addMessage(
                    ValidityLevel.Error,
                    "\"" + edge.getName() + "\" has a negative power points (likely from Artificer)",
                    "/character/creator/edges",
                );
            }

            // Check each power's availability
            for (const power of edge.arcaneBackground.selectedPowers) {
                if (!power.LEGACY_isAvailable(abIndex, true, char)) {
                    this.addMessage(
                        ValidityLevel.Error,
                        "The Selected Power \"" + power.getName() + "\" in \"" + edge.getName() + "\" " + power.isNotAvailableReason(edge.arcaneBackground, true, char),
                        "/character/creator/edges",
                    );
                }
            }

            // Check AB availability
            const message = edge.arcaneBackground.isAvailable(char);
            if (!message.canBeTaken) {
                this.addMessage(
                    ValidityLevel.Error,
                    message.messages.join("; "),
                    "/character/creator/edges",
                );
            }
        }
    }

    /* ***********************************************
        Validate Hindrances
    *********************************************** */
    private validateHindrances(): void {
        const char = this._char;

        for (const hindrance of char._hindrancesSelected) {
            if (hindrance.removed === false) {
                const valid = hindrance.isAvailable(char);
                if (!valid.canBeTaken) {
                    for (const message of valid.messages) {
                        this.addMessage(
                            ValidityLevel.Error,
                            "Your hindrance \"" + hindrance.getName() + "\" can't be taken. " + message,
                            "/character/creator/hindrances",
                        );
                    }
                }
            }
        }
    }

    /* ***********************************************
        Validate Advancements
    *********************************************** */
    private validateAdvancements(): void {
        const char = this._char;

        for (const adv of char._advancements) {
            this.addMessageObj(adv.isValid(), true);
        }
    }

    /* ***********************************************
        Validate Cyberware
    *********************************************** */
    private validateCyberware(): void {
        const char = this._char;

        if (char.setting.settingIsEnabled("strain")) {
            if (char._currentStrain < 0) {
                if (char._currentStrain <= -2) {
                    this.addMessage(
                        ValidityLevel.Error,
                        "Your strain level is below your fatigue level. Your character will be incapacitated all the time.",
                        "/character/creator/cyberware",
                    );
                } else {
                    this.addMessage(
                        ValidityLevel.Warning,
                        "Your strain level is affecting your fatigue.",
                        "/character/creator/cyberware",
                    );
                }
            }
        }

        for (const cyb of char._cyberwarePurchased) {
            this.addMessageObj(cyb.isValid());
        }

        if (char._CyberneticsProhibited && char._cyberwarePurchased.length > 0) {
            this.addMessage(
                ValidityLevel.Error,
                "Your race or framework prohibit you from taking Cyberware",
                "/character/creator/cyberware",
            );
        }
    }

    /* ***********************************************
        Validate Robot Mods
    *********************************************** */
    private validateRobotMods(): void {
        const char = this._char;

        if (char._maxRobotMods > 0) {
            if (char._currentRobotMods < 0) {
                this.addMessage(
                    ValidityLevel.Error,
                    "You've used too many Robot mods.",
                    "/character/creator/robot-mods",
                );
            }

            for (const cyb of char._robotModsPurchased) {
                this.addMessageObj(cyb.isValid());
            }
        }
    }

    /* ***********************************************
        Validate Wealth
    *********************************************** */
    private validateWealth(): void {
        const char = this._char;

        if (char.setting.usesWealth) {
            if (char.getCurrentWealth() < 0) {
                this.addMessage(
                    ValidityLevel.Error,
                    "You have overspent your current wealth.",
                    "",
                );
            }
        }
    }

    /* ***********************************************
        Handle Special Cases
    *********************************************** */
    private handleSpecialCases(): void {
        const char = this._char;

        // Remove first Seasoned requirement error for 50 Fathoms Heroic setting
        if (char.setting.settingIsEnabled("50f_heroic")) {
            for (let count = 0; count < char.validationMessages.length; count++) {
                const message = char.validationMessages[count];
                if (
                    message.message.toLowerCase().indexOf("seasoned") > 0 &&
                    message.message.toLowerCase().indexOf("edge requires") > 0
                ) {
                    char.validationMessages.splice(count, 1);
                    break;
                }
            }
        }
    }

    /* ***********************************************
        Validate Equipment Strength Requirements
    *********************************************** */
    private validateEquipmentStrength(): void {
        const char = this._char;

        // Equipped armor strength validation
        if (char.getArmorMinStrengthPenalty() > 0) {
            for (const armor of char._armorPurchased) {
                if (
                    (armor.equippedPrimary || armor.equippedSecondary ||
                        armor.equippedScreen || armor.equippedArmor) &&
                    getDieIndexFromLabel(armor.minimumStrength) > char.getArmorStrength()
                ) {
                    this.addMessage(
                        ValidityLevel.Warning,
                        "You your strength is less than the minimum strength of your " + armor.getName() + " (" + armor.minimumStrength + ")",
                        "/character/creator/armor",
                    );
                }
            }
        }

        // Heavy armor validation
        if (char._equippedArmorIsNotHeavyValidation) {
            this.addMessage(
                ValidityLevel.Warning,
                "You your equipped armor is doing you no good, it's not " + char.getHeavyArmorLabel() + ", but the natural armor is.",
                "/character/creator/armor",
            );
        }

        // Weapon strength validation
        for (const weapon of char._weaponsPurchased) {
            if (
                (weapon.equippedPrimary || weapon.equippedSecondary) &&
                getDieIndexFromLabel(weapon.getMinimumStrength()) > char.getWeaponStrength()
            ) {
                this.addMessage(
                    ValidityLevel.Warning,
                    "You your strength is less than the minimum strength of your " + weapon.getName() + " (" + weapon.getMinimumStrength() + ")",
                    "/character/creator/weapons",
                );
            }
        }
    }

    /* ***********************************************
        Validate Encumbrance
    *********************************************** */
    private validateEncumbrance(): void {
        const char = this._char;

        if (
            char.getLoadLimit() <= char.getCurrentCombatLoad() &&
            char.setting.usesEncumbrance
        ) {
            this.addMessage(
                ValidityLevel.Warning,
                "You your character is under load, and will have negative effects.",
                "/character/creator/gear",
            );

            if (char.getMaxWeight() <= char.getCurrentCombatLoad()) {
                this.addMessage(
                    ValidityLevel.Error,
                    "You your character over the maximum load and cannot move!",
                    "/character/creator/gear",
                );
            }
        }
    }

    /* ***********************************************
        Finalize Validation (Sort, Clean, Count)
    *********************************************** */
    private finalizeValidation(): void {
        const char = this._char;

        // Sort validation messages by severity (highest first)
        char.validationMessages.sort((a, b) => {
            if (a.severity > b.severity) {
                return -1;
            } else if (a.severity < b.severity) {
                return 1;
            } else {
                return 0;
            }
        });

        // Initialize default error tracking categories
        if (!("gear" in char.chargenValidationErrors)) {
            char.chargenValidationErrors["gear"] = { errors: 0, warnings: 0 };
        }
        if (!("weapons" in char.chargenValidationErrors)) {
            char.chargenValidationErrors["weapons"] = { errors: 0, warnings: 0 };
        }
        if (!("armor" in char.chargenValidationErrors)) {
            char.chargenValidationErrors["armor"] = { errors: 0, warnings: 0 };
        }

        // Count validation errors by category
        for (const val of char.validationMessages) {
            if (val.severity > char.validLevel) {
                char.validLevel = val.severity;
            }

            const theItem = val.goURL.replace("/character/creator/", "");

            if (theItem.indexOf("/") === -1) {
                if (!(theItem in char.chargenValidationErrors)) {
                    char.chargenValidationErrors[theItem] = { errors: 0, warnings: 0 };
                }

                if (val.severity === ValidityLevel.Error) {
                    char.chargenValidationErrors[theItem].errors++;
                }
                if (val.severity === ValidityLevel.Warning) {
                    char.chargenValidationErrors[theItem].warnings++;
                }
            } else {
                for (const theSplitItem of theItem.split("/")) {
                    if (!(theSplitItem in char.chargenValidationErrors)) {
                        char.chargenValidationErrors[theSplitItem] = { errors: 0, warnings: 0 };
                    }
                    char.chargenValidationErrors[theSplitItem] = { errors: 0, warnings: 0 };

                    if (val.severity === ValidityLevel.Error) {
                        char.chargenValidationErrors[theSplitItem].errors++;
                    }
                    if (val.severity === ValidityLevel.Warning) {
                        char.chargenValidationErrors[theSplitItem].warnings++;
                    }
                }
            }
        }
    }
}
