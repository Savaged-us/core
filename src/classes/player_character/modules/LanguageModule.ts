/**
 * LanguageModule - Handles character language management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Getting native language (getNativeLanguage)
 * - Setting native language (setNativeLanguage)
 * - Getting all languages (getLanguages)
 * - Getting max multiple languages (getMaxMultipleLanguages)
 */

import type { PlayerCharacter } from '../player_character';
import { getDisplayText } from '../../../utils/parseEscapedString';
import { getDieValueFromIndex, getDieLabelFromIndex } from '../../../utils/Dice';
import { BaseModule } from './BaseModule';

export class LanguageModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Language state is managed by PlayerCharacter's reset()
    }

    /**
     * Get native language by index
     */
    getNativeLanguage(nativeIndex: number): string {
        const char = this._char as any;
        while (char.nativeLanguages.length < nativeIndex) {
            if (nativeIndex > 0)
                char.nativeLanguages.push("Native #" + (nativeIndex + 1).toString());
        }

        return char.nativeLanguages[nativeIndex];
    }

    /**
     * Set native language by index
     */
    setNativeLanguage(newValue: string, nativeIndex: number = 0): void {
        const char = this._char as any;

        while (char.multipleLanguages.length < nativeIndex) {
            char.multipleLanguages.push("");
        }
        while (char.nativeLanguages.length < nativeIndex) {
            if (nativeIndex > 0)
                char.nativeLanguages.push("Native #" + (nativeIndex + 1).toString());
        }

        char.nativeLanguages[nativeIndex] = newValue;
        char.multipleLanguages[nativeIndex] = newValue;

        for (const skill of char.skills) {
            for (const spec of skill.specialties) {
                if (spec.nativeLanguageIndex > -1) {
                    spec.name = newValue;
                    char.calc(false, true);
                    return;
                }
            }
        }
    }

    /**
     * Get list of all character's languages
     */
    getLanguages(): string[] {
        const char = this._char as any;
        let returnItems: string[] = [];

        for (const lang of char.multipleLanguages) {
            if (lang.trim() != "") {
                returnItems.push(getDisplayText(lang.trim()));
            }
        }

        if (char.setting.primaryIsSWADE && char.setting.isPathfinderStyleLanguages() == false) {
            returnItems = [];
        }

        if (char.setting.primaryIsSWADE == true && char.setting.isPathfinderStyleLanguages() == false) {
            for (const skill of char.skills) {
                if (skill.isKnowledge) {
                    for (const spec of skill.specialties) {
                        if (spec.isLanguage || skill.alwaysLanguage) {
                            let nativeNote = "";
                            if (spec.nativeLanguageIndex > -1) {
                                nativeNote = "native, ";
                            }
                            if (spec.boostValue + spec.assignedValue > 0) {
                                if (spec.nativeLanguageIndex > -1 && char.setting.hideNativeLanguage) {
                                    // don't show native language hide native language setting is true
                                } else {
                                    returnItems.push(getDisplayText(spec.name.trim()) + " (" + nativeNote + getDieLabelFromIndex(spec.boostValue + spec.assignedValue) + ")");
                                }
                            }
                        }
                    }
                } else {
                    if (skill.alwaysLanguage || skill.isLanguage) {
                        if (skill.currentValue() > 0) {
                            returnItems.push(getDisplayText(skill.name.trim()) + " (" + skill.currentValueHR() + ")");
                        }
                    }
                }
            }
        }

        for (const lang of char._addedLanguages) {
            if (lang && lang.trim())
                returnItems.push(getDisplayText(lang));
        }

        if (char.setting.primaryIsSWADE == false || char.setting.isPathfinderStyleLanguages() == true) {
            for (const lang of char.nativeLanguages) {
                returnItems.push(getDisplayText(lang));
            }
        }

        returnItems.sort((a: string, b: string) => {
            if (char.setting.isPathfinderStyleLanguages() == true) {
                if (a.toLowerCase().trim() == "common") {
                    return -1;
                } else if (a.toLowerCase().trim() != "common") {
                    return 1;
                } else {
                    if (a > b) {
                        return -1;
                    } else if (a < b) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            } else {
                if (a.indexOf("native,") > -1) {
                    return 1;
                } else if (b.indexOf("native,") == -1) {
                    return -1;
                } else {
                    if (a > b) {
                        return -1;
                    } else if (a < b) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            }
        });

        returnItems = returnItems.filter((item, index) => returnItems.indexOf(item) === index);
        return returnItems;
    }

    /**
     * Get maximum number of multiple languages based on Smarts and Linguist edge
     */
    getMaxMultipleLanguages(): number {
        const char = this._char as any;
        const smartsValue = getDieValueFromIndex(char.getAttributeCurrent("smarts"));
        if (char.setting.primaryIsSWADE && char.setting.isPathfinderStyleLanguages() == false) {
            if (char.hasALinguistEdge()) {
                return smartsValue;
            } else {
                return smartsValue / 2;
            }
        } else {
            if (char.hasALinguistEdge()) {
                return smartsValue;
            } else {
                return smartsValue / 2;
            }
        }
    }
}
