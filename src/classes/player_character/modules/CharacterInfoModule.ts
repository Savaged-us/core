/**
 * CharacterInfoModule - Handles character info string generation
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - getRaceAndGender: Get race and gender string
 * - getAge: Get age string
 * - getRaceAndProfession: Get race and profession string
 * - getRaceGenderAndProfession: Get full description string with rank
 * - getFrameworkName: Get iconic framework name
 */

import type { PlayerCharacter } from '../player_character';
import { getDisplayText } from '../../../utils/parseEscapedString';
import { replaceAll } from '../../../utils/CommonFunctions';
import { BaseModule } from './BaseModule';

export class CharacterInfoModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Character info state is managed by PlayerCharacter's reset()
    }

    /**
     * Get race and gender string
     */
    getRaceAndGender(): string {
        const char = this._char as any;
        return (char.gender + " " + char.race.getName()).trim();
    }

    /**
     * Get age string
     */
    getAge(): string {
        const char = this._char as any;
        return char.age.trim();
    }

    /**
     * Get race and profession string
     */
    getRaceAndProfession(): string {
        const char = this._char as any;
        if (char.professionOrTitle) {
            return (char.race.getName() + ", " + char.professionOrTitle).trim();
        } else {
            return (char.race.getName()).trim();
        }
    }

    /**
     * Get full description string with rank, gender, race, framework, and profession
     */
    getRaceGenderAndProfession(): string {
        const char = this._char as any;
        let firstPart = "";

        if (char.setting.hideHumanRace && char.race.getName().trim().toLowerCase() == "human") {
            firstPart = (char.getCurrentRankName() + " " + getDisplayText(char.gender)).trim();
        } else {
            firstPart = (char.getCurrentRankName() + " " + getDisplayText(char.gender) + " " + getDisplayText(char.race.getName())).trim();
        }

        // Add Monster Framework if one is selected
        if (char.monsterFramework) {
            firstPart = (firstPart + " " + getDisplayText(char.monsterFramework.name)).trim();
        }

        if (char.professionOrTitle || char.currentFramework) {
            if (char.currentFramework) {
                if (
                    char.professionOrTitle
                    &&
                    (
                        getDisplayText(char.professionOrTitle).toLowerCase().trim()
                        !=
                        getDisplayText(char.currentFramework.name).toLowerCase().trim()
                    )
                ) {
                    return replaceAll(firstPart + ", " + getDisplayText(char.currentFramework.name) + ", and " + getDisplayText(char.professionOrTitle), "  ", " ");
                } else {
                    return replaceAll(firstPart + ", " + getDisplayText(char.currentFramework.name), "  ", " ");
                }
            } else {
                return replaceAll(firstPart + ", " + getDisplayText(char.professionOrTitle), "  ", " ");
            }
        } else {
            return replaceAll(firstPart, "  ", " ");
        }
    }

    /**
     * Get iconic framework name
     */
    getFrameworkName(): string {
        const char = this._char as any;
        if (char.currentFramework && char.currentFramework.getName()) {
            return char.currentFramework.getName();
        }
        return "";
    }
}
