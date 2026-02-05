/**
 * PowerModule - Handles character power management for arcane backgrounds
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Power point management (setPowerPointsName)
 * - Power list management (setPowerList, appendPowerList, setStartingPowerCount)
 * - Power selection (addPowerByName, selectPowerByName, selectPowerByID)
 * - Power modifications (setPowerPowerPoints, setMegaPower)
 * - Custom powers (addCustomPower, updateCustomPower, removeCustomPower)
 * - Selected powers (addSelectedPower, addSelectedPowerByID, removeSelectedPower)
 * - Legacy support (LEGACY_selectPowerByPowerDef)
 */

import type { PlayerCharacter } from '../player_character';
import { Power, IChargenPowers, IChargenPowerVars } from '../power';
import { ILEGACYJSONPowerExport } from '../../../interfaces/IJSONPlayerCharacterExport';
import { replaceAll } from '../../../utils/CommonFunctions';
import { BaseModule } from './BaseModule';

export class PowerModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Power state is managed by PlayerCharacter's reset()
    }

    /**
     * Set the power points name for an arcane background
     */
    setPowerPointsName(ppName: string, abName: string): void {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();

        if (abName) {
            for (const abIndex in char._selectedArcaneBackgrounds) {
                if (
                    char._selectedArcaneBackgrounds[abIndex]
                    && char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == abName
                ) {
                    char._selectedArcaneBackgrounds[abIndex].powerPointsName = ppName;
                }
            }
        } else {
            const abIndex = 0;
            if (char._selectedArcaneBackgrounds[abIndex]) {
                char._selectedArcaneBackgrounds[abIndex].powerPointsName = ppName;
            }
        }
    }

    /**
     * Set the allowed power list for an arcane background
     */
    setPowerList(powerList: string[], abName: string): void {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();

        if (abName) {
            for (const abIndex in char._selectedArcaneBackgrounds) {
                if (
                    char._selectedArcaneBackgrounds[abIndex]
                    && char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == abName
                ) {
                    char._selectedArcaneBackgrounds[abIndex].allowedPowers = powerList;
                    for (let power of char._selectedArcaneBackgrounds[abIndex].allowedPowers) {
                        power = power.trim().toLowerCase();
                    }
                }
            }
        } else {
            const abIndex = 0;
            if (char._selectedArcaneBackgrounds[abIndex]) {
                char._selectedArcaneBackgrounds[abIndex].allowedPowers = powerList;
                for (let power of char._selectedArcaneBackgrounds[abIndex].allowedPowers) {
                    power = power.trim().toLowerCase();
                }
            }
        }
    }

    /**
     * Set the starting power count for an arcane background
     */
    setStartingPowerCount(newValue: number, abName: string): void {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();

        if (abName) {
            for (const abIndex in char._selectedArcaneBackgrounds) {
                if (
                    char._selectedArcaneBackgrounds[abIndex]
                    && char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == abName
                ) {
                    char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(newValue);
                    for (let power of char._selectedArcaneBackgrounds[abIndex].allowedPowers) {
                        power = power.trim().toLowerCase();
                    }
                }
            }
        } else {
            const abIndex = 0;
            if (char._selectedArcaneBackgrounds[abIndex]) {
                char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(newValue);
                for (let power of char._selectedArcaneBackgrounds[abIndex].allowedPowers) {
                    power = power.trim().toLowerCase();
                }
            }
        }
    }

    /**
     * Append powers to the allowed power list for an arcane background
     */
    appendPowerList(powerList: string[], abName: string): void {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();

        if (abName) {
            for (const abIndex in char.getArcaneBackgrounds()) {
                if (
                    char._selectedArcaneBackgrounds[abIndex]
                    && char._selectedArcaneBackgrounds[abIndex]?.countsAsOtherAB(abName)
                ) {
                    char._selectedArcaneBackgrounds[abIndex].allowedPowers = char._selectedArcaneBackgrounds[abIndex].allowedPowers.concat(powerList);
                    for (let power of char._selectedArcaneBackgrounds[abIndex].allowedPowers) {
                        power = power.trim().toLowerCase();
                    }
                    char._selectedArcaneBackgrounds[abIndex].allowedPowers = char._selectedArcaneBackgrounds[abIndex].allowedPowers.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
                    return;
                }
            }

            for (const edge of char._edgesSelected) {
                if (edge && edge.arcaneBackground && edge.arcaneBackground.isNamed(abName)) {
                    edge.arcaneBackground.allowedPowers = edge.arcaneBackground.allowedPowers.concat(powerList);
                    for (let power of edge.arcaneBackground.allowedPowers) {
                        power = power.trim().toLowerCase();
                    }
                    edge.arcaneBackground.allowedPowers = edge.arcaneBackground.allowedPowers.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
                    return;
                }
            }
        } else {
            const abIndex = 0;
            if (char._selectedArcaneBackgrounds[abIndex]) {
                char._selectedArcaneBackgrounds[abIndex].allowedPowers = char._selectedArcaneBackgrounds[abIndex].allowedPowers.concat(powerList);
                for (let power of char._selectedArcaneBackgrounds[abIndex].allowedPowers) {
                    power = power.trim().toLowerCase();
                }
                char._selectedArcaneBackgrounds[abIndex].allowedPowers = char._selectedArcaneBackgrounds[abIndex].allowedPowers.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
                return;
            }
            for (const edge of char._edgesSelected) {
                if (edge && edge.arcaneBackground) {
                    edge.arcaneBackground.allowedPowers = edge.arcaneBackground.allowedPowers.concat(powerList);
                    for (let power of edge.arcaneBackground.allowedPowers) {
                        power = power.trim().toLowerCase();
                    }
                    edge.arcaneBackground.allowedPowers = edge.arcaneBackground.allowedPowers.filter((v: string, i: number, a: string[]) => a.indexOf(v) === i);
                    return;
                }
            }
        }
    }

    /**
     * Set power points cost for a specific power
     */
    setPowerPowerPoints(powerName: string, abName: string, newPPCost: number = 0): boolean {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();
        powerName = replaceAll(powerName, "*", "");
        const powerNameLC = powerName.toLowerCase().trim();

        if (abName) {
            for (const abIndex in char._selectedArcaneBackgrounds) {
                if (char._selectedArcaneBackgrounds[abIndex]) {
                    if (char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == abName) {
                        char._selectedArcaneBackgrounds[abIndex].setPowerPowerPoints(powerName, newPPCost);
                    }
                }
            }
        } else {
            const abIndex = 0;
            if (char._selectedArcaneBackgrounds[abIndex]) {
                char._selectedArcaneBackgrounds[abIndex].setPowerPowerPoints(powerName, newPPCost);
            }
        }

        console.warn("setPowerPowerPoints - couldn't find power", powerNameLC);
        return false;
    }

    /**
     * Add a power by name to an arcane background
     */
    addPowerByName(
        powerName: string,
        abName: string,
        decrementPowerCount: boolean = false,
        innatePower: boolean = false,
        rangeLimitation: string = "",
        addedManually: boolean = false,
    ): boolean {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();
        powerName = replaceAll(powerName, "*", "");
        const powerNameLC = powerName.toLowerCase().trim();

        if (rangeLimitation.toLowerCase().trim() == "self") rangeLimitation = "Self";
        if (rangeLimitation.toLowerCase().trim() == "touch") rangeLimitation = "Touch";
        if (innatePower) addedManually = true;

        if (abName) {
            for (const abIndex in char._selectedArcaneBackgrounds) {
                if (char._selectedArcaneBackgrounds[abIndex]) {
                    if (char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == abName) {
                        for (const powerDef of char._availableData.powers) {
                            const otherAspects: string[] = [];
                            const nameSplit = powerDef.name.toLowerCase().trim().split(" ", 2);
                            let traitSplit: string[];
                            if (nameSplit.length > 0) {
                                traitSplit = nameSplit[0].split("/", 2);
                            } else {
                                traitSplit = powerDef.name.toLowerCase().trim().split("/", 2);
                            }
                            let addendum = "";
                            if (nameSplit.length > 1) {
                                addendum = nameSplit[1];
                            }
                            for (const trait of traitSplit) {
                                otherAspects.push(trait.trim() + " " + addendum);
                            }

                            if (
                                char.setting.book_is_used(powerDef.book_id)
                                && char.setting.powerIsEnabled(powerDef.id)
                                && (
                                    powerDef.name.toLowerCase().trim() == powerNameLC
                                    || powerDef.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                                    || powerDef.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                                    || otherAspects.indexOf(powerNameLC) > -1
                                )
                            ) {
                                const addPower = new Power(powerDef, char, char._selectedArcaneBackgrounds[abIndex]);
                                addPower.innatePower = innatePower;
                                addPower.limitationRange = rangeLimitation;
                                addPower.addedManually = addedManually;

                                for (const aspect of addPower.getAspectLimitations()) {
                                    if (aspect.label.toLowerCase().trim().indexOf(powerNameLC) == 0) {
                                        addPower.limitationAspect = aspect.key;
                                    }
                                }

                                if (decrementPowerCount) {
                                    char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(char._selectedArcaneBackgrounds[abIndex].startingPowerCount - 1);
                                    if (char._selectedArcaneBackgrounds[abIndex].startingPowerCount < 0) {
                                        char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(0);
                                    }
                                }

                                let hasPower = false;
                                for (const curPow of char._selectedArcaneBackgrounds[abIndex].addedPowers) {
                                    if (curPow.getBaseName().toLowerCase().trim() == powerNameLC) {
                                        hasPower = true;
                                        return false;
                                    }
                                }

                                if (!hasPower) {
                                    char._selectedArcaneBackgrounds[abIndex].addedPowers.push(addPower);
                                }
                                return true;
                            }
                        }
                    }
                }
            }
        } else {
            const abIndex = 0;
            if (typeof char._selectedArcaneBackgrounds[abIndex] != "undefined" && char._selectedArcaneBackgrounds[abIndex]) {
                for (const powerDef of char._availableData.powers) {
                    const otherAspects: string[] = [];
                    const nameSplit = powerDef.name.toLowerCase().trim().split(" ", 2);
                    let traitSplit: string[];
                    if (nameSplit.length > 0) {
                        traitSplit = nameSplit[0].split("/", 2);
                    } else {
                        traitSplit = powerDef.name.toLowerCase().trim().split("/", 2);
                    }
                    let addendum = "";
                    if (nameSplit.length > 1) {
                        addendum = nameSplit[1];
                    }
                    for (const trait of traitSplit) {
                        otherAspects.push(trait.trim() + " " + addendum);
                    }

                    if (
                        char.setting.book_is_used(powerDef.book_id)
                        && char.setting.powerIsEnabled(powerDef.id)
                        && (
                            powerDef.name.toLowerCase().trim() == powerNameLC
                            || powerDef.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                            || powerDef.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                            || otherAspects.indexOf(powerNameLC) > -1
                        )
                    ) {
                        const addPower = new Power(powerDef, char, char._selectedArcaneBackgrounds[abIndex]);

                        for (const aspect of addPower.getAspectLimitations()) {
                            if (aspect.label.toLowerCase().trim().indexOf(powerNameLC) == 0) {
                                addPower.limitationAspect = aspect.key;
                            }
                        }

                        addPower.innatePower = innatePower;
                        addPower.limitationRange = rangeLimitation;
                        if (decrementPowerCount) {
                            char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(char._selectedArcaneBackgrounds[abIndex].startingPowerCount - 1);
                            if (char._selectedArcaneBackgrounds[abIndex].startingPowerCount < 0) {
                                char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(0);
                            }
                        }
                        char._selectedArcaneBackgrounds[abIndex].addedPowers.push(addPower);
                        return true;
                    }
                }
            }
        }

        for (const edge of char.getEdgesSelected()) {
            if (
                edge.arcaneBackground
                && (
                    edge.arcaneBackground.name.trim().toLowerCase() == abName.toLowerCase().trim()
                    || abName == ""
                )
            ) {
                for (const powerDef of char._availableData.powers) {
                    const otherAspects: string[] = [];
                    const nameSplit = powerDef.name.toLowerCase().trim().split(" ", 2);
                    let traitSplit: string[];
                    if (nameSplit.length > 0) {
                        traitSplit = nameSplit[0].split("/", 2);
                    } else {
                        traitSplit = powerDef.name.toLowerCase().trim().split("/", 2);
                    }
                    let addendum = "";
                    if (nameSplit.length > 1) {
                        addendum = nameSplit[1];
                    }
                    for (const trait of traitSplit) {
                        otherAspects.push(trait.trim() + " " + addendum);
                    }

                    if (
                        char.setting.book_is_used(powerDef.book_id)
                        && char.setting.powerIsEnabled(powerDef.id)
                        && (
                            powerDef.name.toLowerCase().trim() == powerNameLC
                            || powerDef.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                            || powerDef.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                            || otherAspects.indexOf(powerNameLC) > -1
                        )
                    ) {
                        const addPower = new Power(powerDef, char, edge.arcaneBackground);
                        addPower.innatePower = innatePower;
                        addPower.limitationRange = rangeLimitation;
                        addPower.addedManually = addedManually;

                        for (const aspect of addPower.getAspectLimitations()) {
                            if (aspect.label.toLowerCase().trim().indexOf(powerNameLC) == 0) {
                                addPower.limitationAspect = aspect.key;
                            }
                        }

                        if (decrementPowerCount) {
                            edge.arcaneBackground.setStartingPowerCount(edge.arcaneBackground.startingPowerCount - 1);
                            if (edge.arcaneBackground.startingPowerCount < 0) {
                                edge.arcaneBackground.setStartingPowerCount(0);
                            }
                        }
                        edge.arcaneBackground.addedPowers.push(addPower);
                        return true;
                    }
                }
            }
        }

        console.warn("addPowerByName - couldn't find power", powerNameLC);
        return false;
    }

    /**
     * Select a power by name for an arcane background
     */
    selectPowerByName(
        powerName: string,
        abName: string,
        decrementPowerCount: boolean = false,
        innatePower: boolean = false,
        rangeLimitation: string = "",
        addedManually: boolean = false,
    ): boolean {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();
        powerName = replaceAll(powerName, "*", "");
        const powerNameLC = powerName.toLowerCase().trim();

        if (rangeLimitation.toLowerCase().trim() == "self") rangeLimitation = "Self";
        if (rangeLimitation.toLowerCase().trim() == "touch") rangeLimitation = "Touch";
        if (innatePower) addedManually = true;

        if (abName) {
            for (const abIndex in char._selectedArcaneBackgrounds) {
                if (char._selectedArcaneBackgrounds[abIndex]) {
                    if (char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == abName) {
                        if (!char._selectedArcaneBackgrounds[abIndex].hadSelectedPower(powerNameLC)) {
                            for (const powerDef of char._availableData.powers) {
                                const otherAspects: string[] = [];
                                const nameSplit = powerDef.name.toLowerCase().trim().split(" ", 2);
                                let traitSplit: string[];
                                if (nameSplit.length > 0) {
                                    traitSplit = nameSplit[0].split("/", 2);
                                } else {
                                    traitSplit = powerDef.name.toLowerCase().trim().split("/", 2);
                                }
                                let addendum = "";
                                if (nameSplit.length > 1) {
                                    addendum = nameSplit[1];
                                }
                                for (const trait of traitSplit) {
                                    otherAspects.push(trait.trim() + " " + addendum);
                                }

                                if (
                                    char.setting.book_is_used(powerDef.book_id)
                                    && (
                                        powerDef.name.toLowerCase().trim() == powerNameLC
                                        || powerDef.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                                        || powerDef.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                                        || otherAspects.indexOf(powerNameLC) > -1
                                    )
                                ) {
                                    const addPower = new Power(powerDef, char, char._selectedArcaneBackgrounds[abIndex]);
                                    addPower.innatePower = innatePower;
                                    addPower.limitationRange = rangeLimitation;
                                    addPower.addedManually = addedManually;
                                    addPower.selectedProgrammatically = true;

                                    for (const aspect of addPower.getAspectLimitations()) {
                                        if (aspect.label.toLowerCase().trim().indexOf(powerNameLC) == 0) {
                                            addPower.limitationAspect = aspect.key;
                                        }
                                    }

                                    if (char._selectedArcaneBackgrounds[abIndex] && decrementPowerCount) {
                                        char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(char._selectedArcaneBackgrounds[abIndex].startingPowerCount - 1);
                                        if (char._selectedArcaneBackgrounds[abIndex].startingPowerCount < 0) {
                                            char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(0);
                                        }
                                    }
                                    char._selectedArcaneBackgrounds[abIndex].selectedPowers.push(addPower);
                                    return true;
                                }
                            }
                        }
                    }
                }
            }
        } else {
            const abIndex = 0;
            if (typeof char._selectedArcaneBackgrounds[abIndex] != "undefined" && char._selectedArcaneBackgrounds[abIndex]) {
                if (!char._selectedArcaneBackgrounds[abIndex].hadSelectedPower(powerNameLC)) {
                    for (const powerDef of char._availableData.powers) {
                        const otherAspects: string[] = [];
                        const nameSplit = powerDef.name.toLowerCase().trim().split(" ", 2);
                        let traitSplit: string[];
                        if (nameSplit.length > 0) {
                            traitSplit = nameSplit[0].split("/", 2);
                        } else {
                            traitSplit = powerDef.name.toLowerCase().trim().split("/", 2);
                        }
                        let addendum = "";
                        if (nameSplit.length > 1) {
                            addendum = nameSplit[1];
                        }
                        for (const trait of traitSplit) {
                            otherAspects.push(trait.trim() + " " + addendum);
                        }

                        if (
                            char.setting.book_is_used(powerDef.book_id)
                            && (
                                powerDef.name.toLowerCase().trim() == powerNameLC
                                || powerDef.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                                || powerDef.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                                || otherAspects.indexOf(powerNameLC) > -1
                            )
                        ) {
                            const addPower = new Power(powerDef, char, char._selectedArcaneBackgrounds[abIndex]);
                            addPower.innatePower = innatePower;
                            addPower.limitationRange = rangeLimitation;
                            addPower.selectedProgrammatically = true;

                            for (const aspect of addPower.getAspectLimitations()) {
                                if (aspect.label.toLowerCase().trim().indexOf(powerNameLC) == 0) {
                                    addPower.limitationAspect = aspect.key;
                                }
                            }

                            if (decrementPowerCount) {
                                char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(char._selectedArcaneBackgrounds[abIndex].startingPowerCount - 1);
                                if (char._selectedArcaneBackgrounds[abIndex].startingPowerCount < 0) {
                                    char._selectedArcaneBackgrounds[abIndex].setStartingPowerCount(0);
                                }
                            }
                            char._selectedArcaneBackgrounds[abIndex].selectedPowers.push(addPower);
                            return true;
                        }
                    }
                }
            }
        }

        for (const edge of char.getEdgesSelected()) {
            if (
                edge.arcaneBackground
                && (
                    edge.arcaneBackground.name.trim().toLowerCase() == abName.toLowerCase().trim()
                    || abName == ""
                )
            ) {
                if (!edge.arcaneBackground.hadSelectedPower(powerNameLC)) {
                    for (const powerDef of char._availableData.powers) {
                        const otherAspects: string[] = [];
                        const nameSplit = powerDef.name.toLowerCase().trim().split(" ", 2);
                        let traitSplit: string[];
                        if (nameSplit.length > 0) {
                            traitSplit = nameSplit[0].split("/", 2);
                        } else {
                            traitSplit = powerDef.name.toLowerCase().trim().split("/", 2);
                        }
                        let addendum = "";
                        if (nameSplit.length > 1) {
                            addendum = nameSplit[1];
                        }
                        for (const trait of traitSplit) {
                            otherAspects.push(trait.trim() + " " + addendum);
                        }

                        if (
                            char.setting.book_is_used(powerDef.book_id)
                            && (
                                powerDef.name.toLowerCase().trim() == powerNameLC
                                || powerDef.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                                || powerDef.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                                || otherAspects.indexOf(powerNameLC) > -1
                            )
                        ) {
                            const addPower = new Power(powerDef, char, edge.arcaneBackground);
                            addPower.innatePower = innatePower;
                            addPower.limitationRange = rangeLimitation;
                            addPower.addedManually = addedManually;
                            addPower.selectedProgrammatically = true;

                            for (const aspect of addPower.getAspectLimitations()) {
                                if (aspect.label.toLowerCase().trim().indexOf(powerNameLC) == 0) {
                                    addPower.limitationAspect = aspect.key;
                                }
                            }

                            if (decrementPowerCount) {
                                edge.arcaneBackground.setStartingPowerCount(edge.arcaneBackground.startingPowerCount - 1);
                                if (edge.arcaneBackground.startingPowerCount < 0) {
                                    edge.arcaneBackground.setStartingPowerCount(0);
                                }
                            }
                            edge.arcaneBackground.selectedPowers.push(addPower);
                            return true;
                        }
                    }
                }
            }
        }

        console.warn("selectPowerByName - couldn't find power", abName, powerNameLC);
        return false;
    }

    /**
     * Set a power as a mega power
     */
    setMegaPower(powerName: string, abName: string): boolean {
        const char = this._char as any;
        abName = abName.toLowerCase().trim();
        powerName = replaceAll(powerName, "*", "");
        const powerNameLC = powerName.toLowerCase().trim();

        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                if (ab.name.toLowerCase().trim() == abName || abName == "") {
                    for (const power of ab.addedPowers) {
                        if (
                            power.name.toLowerCase().trim() == powerNameLC
                            || power.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                            || power.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                        ) {
                            power.megaPower = true;
                            return true;
                        }
                    }

                    for (const power of ab.selectedPowers) {
                        if (
                            power.name.toLowerCase().trim() == powerNameLC
                            || power.name.toLowerCase().trim().indexOf(powerNameLC + "/") > -1
                            || power.name.toLowerCase().trim().indexOf("/" + powerNameLC) > -1
                        ) {
                            power.megaPower = true;
                            return true;
                        }
                    }
                }
            }
        }
        console.warn("setMegaPower - couldn't find power", powerNameLC);
        return false;
    }

    /**
     * Add a selected power to an arcane background
     */
    addSelectedPower(abIndex: number, findPower: IChargenPowers): boolean {
        const char = this._char as any;
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            if (char._selectedArcaneBackgrounds[abIndex]) {
                if (!findPower.id) {
                    if (findPower.setting_item) {
                        for (const custPower of char.setting.customPowers) {
                            if (custPower.name == findPower.name) {
                                const addPower = new Power(custPower, char, char._selectedArcaneBackgrounds[abIndex]);
                                addPower.setting_item = true;
                                char._selectedArcaneBackgrounds[abIndex].selectedPowers.push(addPower);
                                return true;
                            }
                        }
                    } else {
                        const addPower = new Power(findPower, char, char._selectedArcaneBackgrounds[abIndex]);
                        addPower.is_custom = true;
                        char._selectedArcaneBackgrounds[abIndex].selectedPowers.push(addPower);
                        return true;
                    }
                } else {
                    for (const powerDef of char._availableData.powers) {
                        if (powerDef.id == findPower.id) {
                            const addPower = new Power(powerDef, char, char._selectedArcaneBackgrounds[abIndex]);
                            char._selectedArcaneBackgrounds[abIndex].selectedPowers.push(addPower);
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Add a selected power by ID to an arcane background
     */
    addSelectedPowerByID(abIndex: number, powerID: number): boolean {
        const char = this._char as any;
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            if (char._selectedArcaneBackgrounds[abIndex]) {
                for (const powerDef of char._availableData.powers) {
                    if (powerDef.id == powerID) {
                        const addPower = new Power(powerDef, char, char._selectedArcaneBackgrounds[abIndex]);
                        char._selectedArcaneBackgrounds[abIndex].selectedPowers.push(addPower);
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Add a custom power to an arcane background
     */
    addCustomPower(abIndex: number, customPower: IChargenPowers, isAdded: boolean = false): boolean {
        const char = this._char as any;
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            if (char._selectedArcaneBackgrounds[abIndex]) {
                const power = new Power(customPower, char, char._selectedArcaneBackgrounds[abIndex]);
                power.is_custom = true;
                power.readOnly = isAdded;
                char._selectedArcaneBackgrounds[abIndex].customPowers.push(power);
            }
        }
        return false;
    }

    /**
     * Update a custom power in an arcane background
     */
    updateCustomPower(abIndex: number, powerIndex: number, customPower: IChargenPowers): boolean {
        const char = this._char as any;
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            if (char._selectedArcaneBackgrounds[abIndex]) {
                if (char._selectedArcaneBackgrounds[abIndex].customPowers.length > powerIndex) {
                    char._selectedArcaneBackgrounds[abIndex].customPowers[powerIndex] = new Power(customPower, char, char._selectedArcaneBackgrounds[abIndex]);
                }
            }
        }
        return false;
    }

    /**
     * Remove a custom power from an arcane background
     */
    removeCustomPower(abIndex: number, powerIndex: number): boolean {
        const char = this._char as any;
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            if (char._selectedArcaneBackgrounds[abIndex]) {
                if (char._selectedArcaneBackgrounds[abIndex].customPowers.length > powerIndex) {
                    for (let skillCount = char.skills.length - 1; skillCount > -1; skillCount--) {
                        if (char.skills[skillCount].arcaneAddedUUID == char._selectedArcaneBackgrounds[abIndex].customPowers[powerIndex].uuid) {
                            char.skills.splice(skillCount, 1);
                        }
                    }
                    char._selectedArcaneBackgrounds[abIndex].customPowers.splice(powerIndex, 1);
                }
            }
        }
        return false;
    }

    /**
     * Remove a selected power from an arcane background
     */
    removeSelectedPower(abIndex: number | undefined, powerIndex: number): boolean {
        const char = this._char as any;
        if (abIndex === undefined) {
            abIndex = 0;
        }
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            if (char._selectedArcaneBackgrounds[abIndex]) {
                if (char._selectedArcaneBackgrounds[abIndex].selectedPowers.length > powerIndex) {
                    if (char._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex]) {
                        for (let skillCount = char.skills.length - 1; skillCount > -1; skillCount--) {
                            if (char.skills[skillCount].arcaneAddedUUID == char._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex].uuid) {
                                char.skills.splice(skillCount, 1);
                            }
                        }
                        char._selectedArcaneBackgrounds[abIndex].selectedPowers.splice(powerIndex, 1);
                    }
                }
            }
        }
        return false;
    }

    /**
     * Legacy method to select power by power definition
     * @deprecated
     */
    LEGACY_selectPowerByPowerDef(powerDef: ILEGACYJSONPowerExport, abIndex: number = 0): void {
        const char = this._char as any;
        let abIndexCount = 0;
        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab && ab.id == powerDef.abid && abIndex == abIndexCount) {
                if (powerDef.setting_item) {
                    for (const power of char.setting.customPowers) {
                        if (power.name == powerDef.name) {
                            const powerObj = new Power(power, char, ab);
                            powerObj.setting_item = true;

                            if (powerDef.limitation_aspect) {
                                powerObj.limitationAspect = powerDef.limitation_aspect;
                            } else {
                                powerObj.limitationAspect = "";
                            }

                            if (powerDef.selected_programmatically) {
                                powerObj.selectedProgrammatically = true;
                            }

                            if (powerDef.uuid) {
                                powerObj.uuid = powerDef.uuid;
                            }

                            if (powerDef.limitation_range) {
                                powerObj.limitationRange = powerDef.limitation_range;
                            } else {
                                powerObj.limitationRange = "";
                            }

                            powerObj.innatePower = false;
                            if (powerDef.innate_power) {
                                powerObj.innatePower = true;
                            }

                            ab.selectedPowers.push(powerObj);
                        }
                    }
                } else {
                    for (const power of char._availableData.powers) {
                        if (power.id == powerDef.id) {
                            const powerObj = new Power(power, char, ab);

                            if (powerDef.custom_description) {
                                if (typeof powerDef.custom_description === "string") {
                                    if (powerDef.custom_description.startsWith("[")) {
                                        powerObj.customDescription = JSON.parse(powerDef.custom_description);
                                    } else {
                                        powerObj.customDescription = JSON.parse(powerDef.custom_description);
                                    }
                                } else {
                                    powerObj.customDescription = powerDef.custom_description.join("\n");
                                }
                            } else {
                                powerObj.customDescription = "";
                            }

                            if (powerDef.custom_name) {
                                powerObj.customName = powerDef.custom_name;
                            } else {
                                powerObj.customName = "";
                            }

                            if (powerDef.limitation_aspect) {
                                powerObj.limitationAspect = powerDef.limitation_aspect;
                            } else {
                                powerObj.limitationAspect = "";
                            }

                            if (powerDef.selected_programmatically) {
                                powerObj.selectedProgrammatically = true;
                            }

                            if (powerDef.uuid) {
                                powerObj.uuid = powerDef.uuid;
                            }

                            if (powerDef.limitation_range) {
                                powerObj.limitationRange = powerDef.limitation_range;
                            } else {
                                powerObj.limitationRange = "";
                            }

                            powerObj.innatePower = false;
                            if (powerDef.innate_power) {
                                powerObj.innatePower = true;
                            }

                            ab.selectedPowers.push(powerObj);
                        }
                    }
                }
            }
            abIndexCount++;
        }
    }

    /**
     * Select a power by ID
     */
    selectPowerByID(powerID: number, powerVars: IChargenPowerVars, abIndex: number = 0): void {
        const char = this._char as any;
        if (char._selectedArcaneBackgrounds.length > abIndex && char._selectedArcaneBackgrounds[abIndex]) {
            const ab = char._selectedArcaneBackgrounds[abIndex];
            for (const power of char._availableData.powers) {
                if (power.id == powerID && ab) {
                    const powerObj = new Power(power, char, ab);
                    powerObj.importOptions(powerVars);
                    ab.selectedPowers.push(powerObj);
                }
            }
        }
    }
}
