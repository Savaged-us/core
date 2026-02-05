/**
 * FactionModule - Handles character faction management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Checking faction membership (hasFaction)
 * - Adding factions (addFaction)
 * - Setting factions (setFaction)
 * - Getting factions (getFactions)
 * - Checking setting factions (isInSettingFactions)
 * - Clearing factions (clearFactions)
 * - Removing factions (removeFaction)
 * - Toggling factions (toggleFaction)
 */

import type { PlayerCharacter } from '../player_character';
import { getDisplayText } from '../../../utils/parseEscapedString';
import { BaseModule } from './BaseModule';

export class FactionModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Faction state is managed by PlayerCharacter's reset()
    }

    /**
     * Check if character has a specific faction
     */
    hasFaction(factionName: string): boolean {
        const char = this._char as any;
        if (char.setting.usesFactions) {
            for (const faction of char.selectedFactions) {
                if (faction.toLowerCase().trim() === factionName.toLowerCase().trim()) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Add a faction to the character
     */
    addFaction(factionName: string): boolean {
        const char = this._char as any;
        if (char.setting.usesFactions) {
            char.selectedFactions.push(factionName.trim());
            return true;
        }
        return false;
    }

    /**
     * Set faction (replaces all existing factions)
     */
    setFaction(factionName: string): boolean {
        const char = this._char as any;
        if (char.setting.usesFactions) {
            char.selectedFactions = [factionName.trim()];
            return true;
        }
        return false;
    }

    /**
     * Get list of character's factions (filtered and sorted)
     */
    getFactions(): string[] {
        const char = this._char as any;
        const filtered: string[] = [];

        for (const faction of char.selectedFactions) {
            if (faction.trim()) {
                if (this.isInSettingFactions(faction))
                    filtered.push(getDisplayText(faction.trim()));
            }
        }

        filtered.sort();

        return filtered;
    }

    /**
     * Check if a faction exists in the setting's faction list
     */
    isInSettingFactions(fac: string): boolean {
        const char = this._char as any;
        for (const setFac of char.setting.getFactionList()) {
            if (fac.trim().toLowerCase().trim() == setFac.trim().toLowerCase().trim())
                return true;
        }
        return false;
    }

    /**
     * Clear all factions
     */
    clearFactions(): boolean {
        const char = this._char as any;
        char.selectedFactions = [];
        return true;
    }

    /**
     * Remove a specific faction
     */
    removeFaction(factionName: string): boolean {
        const char = this._char as any;
        for (let fIndex = 0; fIndex < char.selectedFactions.length; fIndex++) {
            if (char.selectedFactions[fIndex].toLowerCase().trim() === factionName.toLowerCase().trim()) {
                char.selectedFactions.splice(fIndex, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Toggle a faction on/off
     */
    toggleFaction(factionName: string): boolean {
        const char = this._char as any;
        if (char.setting.usesFactions) {
            for (let fIndex = 0; fIndex < char.selectedFactions.length; fIndex++) {
                if (char.selectedFactions[fIndex].toLowerCase().trim() === factionName.toLowerCase().trim()) {
                    char.selectedFactions.splice(fIndex, 1);
                    return true;
                }
            }

            char.selectedFactions.push(factionName.trim());

            return true;
        }
        return false;
    }
}
