/**
 * AdvancementModule - Handles character advancement and rank calculations
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Advancement calculations (_calcAdvancements)
 * - Advancement count queries (getAdvancementCount, getSelectedAdvancementCount, getAdvancementPrecalcCount)
 * - Advancement edges (getAdvancementEdges)
 * - XP-based advancement (setAdvancementCountPerXP)
 * - Rank calculations (getCurrentRankName, getCurrentRank)
 */

import type { PlayerCharacter } from '../player_character';
import type { Edge } from '../edge';
import { PlayerCharacterAdvancement } from '../player_character_advancement';
import { BaseModule } from './BaseModule';

export class AdvancementModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Advancement state is managed by PlayerCharacter's reset()
    }

    /**
     * Calculate advancements and apply their effects
     */
    calcAdvancements(): void {
        const char = this._char as any;

        char._skillSnapShots = [];
        let advCount = 0;
        if (char._advancement_precalc < this.getAdvancementCount()) {
            char._advancement_precalc = this.getAdvancementCount();
        }

        char._advancements = char._advancements.splice(0, char._advancement_precalc);

        for (const adv of char._advancements) {
            char._skillSnapShots[advCount] = char.getSkillList();

            // apply mods
            if (adv && advCount < this.getAdvancementCount()) {
                adv.apply();
                char._calcCurrentAttributes();

                // Pathfinder Spellcasting Minimum Value when multiclassing....
                if (adv.selectedEdge && adv.selectedEdge.arcaneBackground && adv.selectedEdge.arcaneBackground.arcaneSkill && char.setting.isPathfinder()) {
                    const spellcastingSkill = char.getSkill(adv.selectedEdge.arcaneBackground.arcaneSkill.name);
                    if (spellcastingSkill && spellcastingSkill.currentValue() < 1) {
                        spellcastingSkill.boostValue += 1;
                    }
                }
            }

            advCount++;
        }
    }

    /**
     * Get total advancement count (including bonus advancements)
     */
    getAdvancementCount(): number {
        const char = this._char as any;
        return char._advancement_count + char._advancement_bonus;
    }

    /**
     * Get selected advancement count (without bonus)
     */
    getSelectedAdvancementCount(): number {
        const char = this._char as any;
        return char._advancement_count;
    }

    /**
     * Get precalculated advancement count
     */
    getAdvancementPrecalcCount(): number {
        const char = this._char as any;
        return char._advancement_precalc;
    }

    /**
     * Get edges gained from advancements
     */
    getAdvancementEdges(): Edge[] {
        const char = this._char as any;
        const rv: Edge[] = [];
        for (const adv of char._advancements) {
            if (adv.selectedEdge) {
                rv.push(adv.selectedEdge);
            }
        }
        return rv;
    }

    /**
     * Set advancement count based on XP
     */
    setAdvancementCountPerXP(): void {
        const char = this._char as any;
        char._advancement_count = Math.floor(char._xp / 5);
        char._advancement_precalc = Math.floor(char._xp_precalc / 5);
    }

    /**
     * Get current rank name based on advancement count
     */
    getCurrentRankName(
        advancementCount: number = -1,
        showLegendaryNumber: boolean = false,
    ): string {
        const char = this._char as any;
        if (advancementCount === -1) {
            advancementCount = this.getAdvancementCount();
        }
        if (advancementCount < 4) {
            return char.setting.getRankLabelNovice();
        } else if (advancementCount < 8) {
            return char.setting.getRankLabelSeasoned();
        } else if (advancementCount < 12) {
            return char.setting.getRankLabelVeteran();
        } else if (advancementCount < 16) {
            return char.setting.getRankLabelHeroic();
        } else {
            let legendaryTier = 1;
            if (showLegendaryNumber)
                legendaryTier = Math.floor((advancementCount - 15) / 2) + 1;
            return char.setting.getRankLabelLegendary(legendaryTier);
        }
    }

    /**
     * Get current rank number based on advancement count
     */
    getCurrentRank(
        advancementCount: number = -1,
        forPower: boolean = false,
    ): number {
        const char = this._char as any;
        let rankBonus = 0;
        if (forPower) {
            rankBonus = char._powerRankEquivalentBonus;
        }

        if (advancementCount === -1) {
            advancementCount = this.getAdvancementCount();
        }

        if (advancementCount < 4) {
            return 0 + rankBonus;
        } else if (advancementCount < 8) {
            return 1 + rankBonus;
        } else if (advancementCount < 12) {
            return 2 + rankBonus;
        } else if (advancementCount < 16) {
            return 3 + rankBonus;
        } else {
            return Math.floor((advancementCount - 15) / 2) + 4 + rankBonus;
        }
    }
}
