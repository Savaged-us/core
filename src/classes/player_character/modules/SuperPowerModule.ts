/**
 * SuperPowerModule - Handles character super powers (SPC 2014 and 2021)
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Super power queries (getAvailableSuperPowers2014, getAvailableSuperPowers2021)
 * - Super power management (addSuperPower2014, removeSuperPower2014, etc.)
 * - Power point calculations (getSuperPowers2014MaxPowerPoints, getSuperPowers2014CurrentPowerPoints)
 * - Super power cost table calculations (_calcSuperPower2014s)
 * - Power limits (getSuperPowers2021CurrentPowerLimit)
 */

import type { PlayerCharacter } from '../player_character';
import { IChargenSuperPower2014, SuperPower2014 } from '../super_power_2014';
import { IChargenSuperPower2021, SuperPower2021 } from '../super_power_2021';
import { BaseModule } from './BaseModule';

export interface ISPCPowerSetTable {
    activated: boolean;
    set: string;
    name: string;
    mods: string;
    points: number;
    cost: number;
    customDescription: string;
    levels: number;
}

export class SuperPowerModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Super power state is managed by PlayerCharacter's reset()
    }

    /**
     * Get maximum power points for 2014 super powers
     */
    getSuperPowers2014MaxPowerPoints(): number {
        const char = this._char as any;
        return char.superPowers2014PowerPoints + char.superPowers2014ExtraPowerPoints;
    }

    /**
     * Get current power points spent on 2014 super powers
     */
    getSuperPowers2014CurrentPowerPoints(): number {
        const char = this._char as any;
        return char.superPowers2014CurrentPowerPoints;
    }

    /**
     * Calculate super power 2014 costs and build cost table
     */
    calcSuperPower2014s(): void {
        const char = this._char as any;

        char.superPowerCostTable = [];
        char.superPowers2014CurrentPowerPoints = 0;

        for (const power of char.superPowers2014) {
            char.superPowerCostTable.push({
                activated: power.activated,
                set: power.switchableSet,
                name: power.getName(),
                cost: power.getPoints(),
                points: power.getPoints(),
                mods: power.getModsString(),
                levels: power.levels,
                customDescription: power.customDescription,
            });
        }

        // sort by set then by cost h-l
        char.superPowerCostTable.sort((a: ISPCPowerSetTable, b: ISPCPowerSetTable) => {
            if (a.set < b.set) {
                return -1;
            } else if (a.set > b.set) {
                return 1;
            } else {
                if (a.points < b.points) {
                    return 1;
                } else if (a.points > b.points) {
                    return -1;
                } else {
                    return 0;
                }
            }
        });

        let lastSetName: string = "";
        for (const item of char.superPowerCostTable) {
            if (item.set != "") {
                if (item.set == lastSetName) {
                    item.cost = 2;
                }
                lastSetName = item.set;
            }
            char.superPowers2014CurrentPowerPoints += item.cost;
        }
    }

    /**
     * Get available super powers for SPC 2014
     */
    getAvailableSuperPowers2014(ignoreSPCBook: boolean = false): IChargenSuperPower2014[] {
        const char = this._char as any;
        const rv: IChargenSuperPower2014[] = [];

        for (const item of char._availableData.super_powers_2014) {
            if (
                (
                    item.book_id == 4 // SPC Companion
                    &&
                    ignoreSPCBook
                )
                ||
                char.setting.book_is_used(item.book_id)
            ) {
                rv.push(item);
            }
        }

        rv.sort(
            (a: IChargenSuperPower2014, b: IChargenSuperPower2014) => {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                } else {
                    return 0;
                }
            }
        );

        return rv;
    }

    /**
     * Add a super power 2014 by ID
     */
    addSuperPower2014(powerID: number): void {
        const char = this._char as any;
        for (const powerDef of char._availableData.super_powers_2014) {
            if (powerDef.id == powerID) {
                char.superPowers2014.push(
                    new SuperPower2014(powerDef, null)
                );
            }
        }
    }

    /**
     * Remove a super power 2014 by index
     */
    removeSuperPower2014(powerIndex: number): void {
        const char = this._char as any;
        if (char.superPowers2014.length > powerIndex) {
            char.superPowers2014.splice(powerIndex, 1);
        }
    }

    /**
     * Get available super powers for SPC 2021 (SWADE)
     */
    getAvailableSuperPowers2021(ignoreSPCBook: boolean = false): IChargenSuperPower2021[] {
        const char = this._char as any;
        const rv: IChargenSuperPower2021[] = [];

        for (const item of char._availableData.super_powers_2021) {
            if (
                (
                    item.book_id == 4 // SPC Companion
                    &&
                    ignoreSPCBook
                )
                ||
                char.setting.book_is_used(item.book_id)
            ) {
                rv.push(item);
            }
        }

        rv.sort(
            (a: IChargenSuperPower2021, b: IChargenSuperPower2021) => {
                if (a.name > b.name) {
                    return 1;
                } else if (a.name < b.name) {
                    return -1;
                } else {
                    return 0;
                }
            }
        );

        return rv;
    }

    /**
     * Add a super power 2021 by ID
     */
    addSuperPower2021(powerID: number): void {
        const char = this._char as any;
        for (const powerDef of char._availableData.super_powers_2021) {
            if (powerDef.id == powerID) {
                char.superPowers2021.push(
                    new SuperPower2021(powerDef, null)
                );
            }
        }
    }

    /**
     * Remove a super power 2021 by index
     */
    removeSuperPower2021(powerIndex: number): void {
        const char = this._char as any;
        if (char.superPowers2021.length > powerIndex) {
            char.superPowers2021.splice(powerIndex, 1);
        }
    }

    /**
     * Get current power limit for 2021 super powers
     */
    getSuperPowers2021CurrentPowerLimit(theBestThereIs: boolean = false): number {
        const char = this._char as any;
        if (char.setting.book_is_used(169)) {
            let rv = 0;

            if (theBestThereIs) {
                rv = Math.floor(char.setting.swade_spc_campaign_power_level / 2);
            } else {
                rv = char.setting.swade_spc_campaign_power_level / 3;
            }

            return rv;
        }

        return 0;
    }
}
