/**
 * ArcaneModule - Handles character arcane backgrounds and power management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Arcane background calculations (_calcArcaneBackgrounds, _trimArcaneBackgrounds)
 * - Arcane background queries (getArcaneBackgrounds, hasArcaneBackground, getArcaneBackgroundIndex)
 * - Arcane background setters (setArcaneBackgroundById, setArcaneBackgroundCustom, etc.)
 * - Edge arcane backgrounds (getEdgeArcaneBackgrounds)
 */

import type { PlayerCharacter } from '../player_character';
import type { Edge } from '../edge';
import { ArcaneBackground, IChargenArcaneBackground, IChargenArcaneBackgroundObjectVars } from '../arcane_background';
import { Book } from '../../book';
import { BaseModule } from './BaseModule';

export class ArcaneModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Arcane state is managed by PlayerCharacter's reset()
    }

    /**
     * Trim arcane backgrounds if none are selected
     */
    trimArcaneBackgrounds(): void {
        const char = this._char as any;
        if (char._numberOfArcaneBackgrounds === 0) {
            char._selectedArcaneBackgrounds = [];
        }
    }

    /**
     * Calculate and apply arcane backgrounds
     */
    calcArcaneBackgrounds(): void {
        const char = this._char as any;

        // reimport setting item AB
        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab && ab.setting_item) {
                let foundItem = false;
                for (const abDef of char.setting.customArcaneBackgrounds) {
                    if (abDef.name.toLowerCase().trim() === ab.name.toLowerCase().trim()) {
                        ab.import(abDef);
                        foundItem = true;
                        break;
                    }
                }

                if (!foundItem) {
                    ab.setting_item = false;
                }
            }
        }

        while (char._selectedArcaneBackgrounds.length < char._numberOfArcaneBackgrounds) {
            char._selectedArcaneBackgrounds.push(null);
        }

        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                ab.apply();
            }
        }
    }

    /**
     * Get edges that have arcane backgrounds attached
     */
    getEdgeArcaneBackgrounds(): Edge[] {
        const char = this._char as any;
        const rv: Edge[] = [];
        for (const edge of char.getAllEdgeObjects()) {
            if (edge.arcaneBackground)
                rv.push(edge);
        }
        return rv;
    }

    /**
     * Check if character has an arcane background
     */
    hasArcaneBackground(needsABType: string = ""): boolean {
        const char = this._char as any;

        for (const edge of char.getAllEdgeObjects()) {
            if (edge.arcaneBackground) {
                if (needsABType.trim()) {
                    if (edge.arcaneBackground.isNamed(needsABType)) {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        }

        if (char._numberOfArcaneBackgrounds === 0) {
            return false;
        }

        if (needsABType.trim()) {
            for (const ab of char._selectedArcaneBackgrounds) {
                if (ab && ab.isNamed(needsABType)) {
                    return true;
                }
            }
            for (const edge of char.getAllEdgeObjects()) {
                if (edge.arcaneBackground && edge.arcaneBackground.isNamed(needsABType)) {
                    return true;
                }
            }
        } else {
            if (char._numberOfArcaneBackgrounds > 0) {
                return true;
            }
            for (const edge of char.getAllEdgeObjects()) {
                if (edge.arcaneBackground) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Get the index of a specific arcane background
     */
    getArcaneBackgroundIndex(needsABType: string = "", racialOnly: boolean = false): number {
        const char = this._char as any;

        for (const abIndex in char._selectedArcaneBackgrounds) {
            if (
                char._selectedArcaneBackgrounds[+abIndex]
                &&
                char._selectedArcaneBackgrounds[+abIndex].name.trim().toLowerCase() === needsABType.trim().toLowerCase()
            ) {
                if (racialOnly && char._selectedArcaneBackgrounds[+abIndex].fromRace) {
                    return +abIndex;
                }
            }
        }

        return -1;
    }

    /**
     * Get all arcane backgrounds (selected + from edges)
     */
    getArcaneBackgrounds(): ArcaneBackground[] {
        const char = this._char as any;
        const rv: ArcaneBackground[] = [];

        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                rv.push(ab);
            }
        }

        const edgeABs = this.getEdgeArcaneBackgrounds();

        for (const edge of edgeABs) {
            if (edge.arcaneBackground) {
                rv.push(edge.arcaneBackground);
            }
        }

        return rv;
    }

    /**
     * Set arcane background from setting definition
     */
    setArcaneBackgroundFromSetting(
        abIndex: number = 0,
        abName: string = "",
    ): boolean | undefined {
        const char = this._char as any;

        while (char._selectedArcaneBackgrounds.length < abIndex + 1) {
            char._selectedArcaneBackgrounds.push(null);
        }
        char._numberOfArcaneBackgrounds++;
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            for (const sAB of char.setting.customArcaneBackgrounds) {
                if (sAB.name.toLowerCase().trim() === abName.toLowerCase().trim()) {
                    const currentAB = char._selectedArcaneBackgrounds[abIndex];
                    if (currentAB && typeof currentAB.exportOptions === 'function') {
                        const vars: IChargenArcaneBackgroundObjectVars = currentAB.exportOptions();
                        const newAB = new ArcaneBackground(sAB, char);
                        char._selectedArcaneBackgrounds[abIndex] = newAB;

                        // Set custom properties with proper type assertion
                        (newAB as any).is_custom = true;
                        (newAB as any).setting_item = true;
                        (newAB as any).id = -1;

                        if (typeof newAB.importOptions === 'function') {
                            newAB.importOptions(vars);
                        }
                    }
                    return true;
                }
            }
        } else {
            console.warn("setArcaneBackgroundFromSetting too short", char._selectedArcaneBackgrounds.length, abIndex);
        }
    }

    /**
     * Set a custom arcane background
     */
    setArcaneBackgroundCustom(
        abIndex: number = 0,
        customABDef: IChargenArcaneBackground | null = null,
        abUUID: string = "",
    ): boolean {
        const char = this._char as any;

        while (char._selectedArcaneBackgrounds.length < abIndex + 1) {
            char._selectedArcaneBackgrounds.push(null);
        }
        char._numberOfArcaneBackgrounds++;
        if (char._selectedArcaneBackgrounds.length > abIndex) {
            char._selectedArcaneBackgrounds[abIndex] = new ArcaneBackground(customABDef, char);
            char._selectedArcaneBackgrounds[abIndex].is_custom = true;
            char._selectedArcaneBackgrounds[abIndex].setting_item = true;
            char._selectedArcaneBackgrounds[abIndex].id = -1;
            if (abUUID.trim()) {
                char._selectedArcaneBackgrounds[abIndex].uuid = abUUID;
            }
            return true;
        } else {
            console.warn("setArcaneBackgroundById too short", char._selectedArcaneBackgrounds.length, abIndex);
            return false;
        }
    }

    /**
     * Check if character has an arcane background with given UUID
     */
    hasABUUID(uuid: string): boolean {
        const char = this._char as any;
        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab && ab.uuid === uuid) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check if character has a power with given UUID
     */
    hasPowerUUID(uuid: string): boolean {
        const char = this._char as any;
        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab && ab.getAllPowers().length > 0) {
                for (const power of ab.getAllPowers()) {
                    if (power && power.uuid === uuid) {
                        return true;
                    }
                }
            }
        }

        for (const edge of char.getAllEdgeObjects()) {
            if (edge && edge.arcaneBackground && edge.arcaneBackground.getAllPowers().length > 0) {
                for (const power of edge.arcaneBackground.getAllPowers()) {
                    if (power && power.uuid === uuid) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    /**
     * Set arcane background by ID
     */
    setArcaneBackgroundById(
        abID: number,
        abIndex: number = 0,
        abUUID: string = "",
    ): boolean {
        const char = this._char as any;

        while (char._selectedArcaneBackgrounds.length < abIndex + 1) {
            char._selectedArcaneBackgrounds.push(null);
        }

        if (char._selectedArcaneBackgrounds.length > abIndex) {
            if (abID === 0) {
                char._selectedArcaneBackgrounds[abIndex] = null;
                return true;
            }
            for (const ab of char._availableData.arcane_backgrounds) {
                if (ab && ab.id === abID) {
                    const newAB = new ArcaneBackground(ab, char);
                    if (abUUID.trim())
                        newAB.uuid = abUUID;
                    char._selectedArcaneBackgrounds[abIndex] = newAB;
                    return true;
                }
            }
        } else {
            console.warn("setArcaneBackgroundById too short", char._selectedArcaneBackgrounds.length, abIndex);
        }
        return false;
    }

    /**
     * Add arcane background by name
     */
    addArcaneBackgroundByName(
        abName: string = "",
        unchangeable: boolean = false,
        incrementStartingPowers: number = 0,
    ): string {
        const char = this._char as any;

        for (const ab of char._selectedArcaneBackgrounds) {
            if (
                ab
                && ab.name.toLowerCase().trim() === abName.toLowerCase().trim()
                && char.setting.book_is_used(ab.book_id)
            ) {
                char._numberOfArcaneBackgrounds++;
                return ab.uuid;
            }
        }

        // Look for AB name in non-core books first
        for (const ab of char._availableData.arcane_backgrounds) {
            if (
                ab
                && ab.name.toLowerCase().trim() === abName.toLowerCase().trim()
                && char.setting.book_id_is_used().indexOf(+ab.book_id) > -1
                && char.setting.getPrimaryBookID() !== ab.book_id
            ) {
                char._numberOfArcaneBackgrounds++;
                const newAB = new ArcaneBackground(ab, char);
                newAB.incrementStartingPowers(incrementStartingPowers);
                newAB.unchangeable = unchangeable;
                newAB.readOnly = unchangeable;
                char._selectedArcaneBackgrounds.push(newAB);
                return newAB.uuid;
            }
        }

        // Look for AB name in core book in case it's not redefined
        for (const ab of char._availableData.arcane_backgrounds) {
            if (
                ab
                && ab.name.toLowerCase().trim() === abName.toLowerCase().trim()
                && char.setting.book_id_is_used().indexOf(+ab.book_id) > -1
                && char.setting.getPrimaryBookID() === ab.book_id
            ) {
                char._numberOfArcaneBackgrounds++;
                const newAB = new ArcaneBackground(ab, char);
                newAB.incrementStartingPowers(incrementStartingPowers);
                newAB.unchangeable = unchangeable;
                newAB.readOnly = unchangeable;
                char._selectedArcaneBackgrounds.push(newAB);
                return newAB.uuid;
            }
        }

        return "";
    }

    /**
     * Add a custom arcane background
     */
    addCustomArcaneBackground(
        abName: string,
        abPowers: number,
        abPoints: number,
        abSkillName: string,
        abSkillAttribute: string,
        abPowerPointsName: string,
        abBookNumber: number = 0,
        abBookPage: string = "",
        applyNow: boolean = false,
    ): string | null {
        const char = this._char as any;

        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab && ab.name === abName) {
                if (char._selectedArcaneBackgrounds.length > char._numberOfArcaneBackgrounds) {
                    char._numberOfArcaneBackgrounds = char._selectedArcaneBackgrounds.length;
                }
                return ab.uuid;
            }
        }

        const newAB = new ArcaneBackground(null, char);
        newAB.startingPowerPoints = abPoints;

        newAB.setStartingPowerCount(abPowers);
        newAB._baseStartingPowerCount = abPowers;

        newAB.powerPointsName = abPowerPointsName;
        newAB.name = abName;
        newAB.id = -1;
        newAB.arcaneSkill = {
            name: abSkillName,
            attribute: abSkillAttribute,
        };
        newAB.unchangeable = true;
        if (abBookNumber > 0) {
            for (const book of char._availableData.books) {
                if (book.id === abBookNumber) {
                    newAB.book_id = book.id;
                    newAB.book_obj = new Book(book);
                    newAB.book_page = abBookPage;
                }
            }
        } else {
            newAB.is_custom = true;
        }

        if (applyNow)
            newAB.apply();

        char._selectedArcaneBackgrounds.push(newAB);
        char._numberOfArcaneBackgrounds++;

        return newAB.uuid;
    }
}
