/**
 * GearEnhancementModule - Handles gear enhancement management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Adding enhancements to gear (addGearEnhancementToGear)
 * - Removing enhancements from gear (removeGearEnhancementFromGear)
 */

import type { PlayerCharacter } from '../player_character';
import type { IGearEnhancementExport } from '../gear_enhancement';
import { BaseModule } from './BaseModule';

// Late import to avoid circular dependencies
let GearEnhancement: any;

function ensureImports() {
    if (!GearEnhancement) {
        GearEnhancement = require('../gear_enhancement').GearEnhancement;
    }
}

export class GearEnhancementModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Gear enhancement state is managed by PlayerCharacter's reset()
    }

    /**
     * Add an enhancement to a gear item by UUID
     */
    addGearEnhancementToGear(uuid: string, enh: IGearEnhancementExport): void {
        ensureImports();
        const char = this._char as any;

        for (const item of char._gearPurchased) {
            if (item.uuid === uuid) {
                const enhObj = new GearEnhancement(enh);
                item.gear_enhancements.push(enhObj);
            }
        }
    }

    /**
     * Remove an enhancement from a gear item by UUIDs
     */
    removeGearEnhancementFromGear(itemUuid: string, enhUuid: string): void {
        const char = this._char as any;

        for (const item of char._gearPurchased) {
            if (item.uuid === itemUuid) {
                for (const enhIndex in item.gear_enhancements) {
                    if (item.gear_enhancements[enhIndex].uuid === enhUuid) {
                        item.gear_enhancements.splice(+enhIndex, 1);
                    }
                }
            }
        }
    }
}
