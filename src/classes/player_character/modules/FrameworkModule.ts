/**
 * FrameworkModule - Handles character framework management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Creating custom frameworks (newCustomFramework)
 * - Customizing current framework (customizeCurrentFramework)
 * - Clearing framework (clearFramework)
 */

import type { PlayerCharacter } from '../player_character';
import type { IChargenFramework } from '../player_character_framework';
import { BaseModule } from './BaseModule';

// Late import to avoid circular dependencies
let PlayerCharacterFramework: any;

function ensureImports() {
    if (!PlayerCharacterFramework) {
        PlayerCharacterFramework = require('../player_character_framework').PlayerCharacterFramework;
    }
}

export class FrameworkModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Framework state is managed by PlayerCharacter's reset()
    }

    /**
     * Create a new custom framework
     */
    newCustomFramework(editData: IChargenFramework | null = null): void {
        ensureImports();
        const char = this._char as any;

        if (char.currentFramework) {
            char.currentFramework.removeEquipmentPackage();
        }

        char.currentFramework = new PlayerCharacterFramework(editData, char);
        char.currentFramework.is_custom = true;
    }

    /**
     * Customize the current framework (makes it editable)
     */
    customizeCurrentFramework(): void {
        ensureImports();
        const char = this._char as any;

        if (char.currentFramework) {
            char.currentFramework.removeEquipmentPackage();
        }

        if (char.currentFramework) {
            const currentData = char.currentFramework.export();
            currentData.book_def = undefined;
            currentData.updated_by_user = undefined;
            currentData.deleted_by_user = undefined;
            currentData.created_by_user = undefined;
            const currentOptions = char.currentFramework.exportData();
            char.currentFramework = new PlayerCharacterFramework(currentData, char);
            char.currentFramework.setData(currentOptions);
            char.currentFramework.book_id = 0;
            char.currentFramework.is_custom = true;
        } else {
            char.currentFramework = new PlayerCharacterFramework(null, char);
            char.currentFramework.is_custom = true;
        }
    }

    /**
     * Clear the current framework
     */
    clearFramework(): void {
        const char = this._char as any;

        if (char.currentFramework) {
            char.currentFramework.removeEquipmentPackage();
        }

        char.currentFramework = null;
    }
}
