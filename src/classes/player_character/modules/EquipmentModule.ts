/**
 * EquipmentModule - Handles character equipment management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Equipment calculations (_calcGear, _calcWeapons, _calcVehicles, _calcCyberware, _calcRobotMods)
 * - Equipment getters (getGearPurchased, getWeaponsPurchased, getVehiclesPurchased, etc.)
 * - Equipment lists (getWeaponList, getGearList, getArmorList)
 * - Container management (getContainerList, getVehicleContainerList)
 * - Sorting methods (sortCyberware, sortRobotMods, sortRiftsTattoos)
 */

import type { PlayerCharacter } from '../player_character';
import type { Gear } from '../gear';
import type { Weapon } from '../weapon';
import type { Armor } from '../armor';
import type { Cyberware } from '../cyberware';
import type { RobotMod } from '../robot_mod';
import type { RiftsTattoos } from '../riftsTattoos';
import type { VehicleEntry } from '../../vehicle_entry';
import type { IContainerListItem } from '../player_character';
import { BaseModule } from './BaseModule';

export class EquipmentModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Equipment state is managed by PlayerCharacter's reset()
    }

    /**
     * Calculate gear load and wealth
     */
    calcGear(): void {
        const char = this._char as any;

        for (const item of char._gearPurchased) {
            char._loadCurrent += item.getTotalWeight();
            char._loadCurrentCombat += item.getTotalCombatWeight();
            char._wealthCurrent -= item.getTotalBuyCost();
        }
    }

    /**
     * Calculate vehicle wealth
     */
    calcVehicles(): void {
        const char = this._char as any;

        for (const item of char._vehiclesPurchased) {
            char._wealthCurrent -= item.getTotalBuyCost();
        }
    }

    /**
     * Calculate robot mods
     */
    calcRobotMods(): void {
        const char = this._char as any;

        for (const item of char._robotModsPurchased) {
            char._currentRobotMods -= +item.getMods();
            char._wealthCurrent -= item.getTotalBuyCost();
        }
        char._currentRobotMods = +char._currentRobotMods.toFixed(1);
    }

    /**
     * Calculate cyberware strain and wealth
     */
    calcCyberware(): void {
        const char = this._char as any;

        if (char._fullConversionBorg === false) {
            for (const item of char._cyberwarePurchased) {
                if (char.setting.settingIsEnabled("iz3_strain"))
                    char._currentStrain += +item.getStrain();
                else
                    char._currentStrain -= +item.getStrain();
                char._wealthCurrent -= item.getTotalBuyCost();
            }
            char._currentStrain = +char._currentStrain.toFixed(1);
        } else {
            char._currentStrain = 0;
            let totalNonFrameworkCyberwareStrain = 0;
            for (const item of char._cyberwarePurchased) {
                if (!item.frameworkItem)
                    totalNonFrameworkCyberwareStrain += +item.getStrain();
                char._wealthCurrent -= item.getTotalBuyCost();
            }

            char._currentStrain = 6 - totalNonFrameworkCyberwareStrain;
            char._maxStrain = 6;
        }
    }

    /**
     * Calculate weapons load, wealth, and parry bonuses
     */
    calcWeapons(): void {
        const char = this._char as any;
        let primaryHasParryBonus: number = 0;

        for (const item of char._weaponsPurchased) {
            char._loadCurrent += item.getTotalWeight();
            char._loadCurrentCombat += item.getTotalCombatWeight();
            char._wealthCurrent -= item.getTotalBuyCost();

            if (item.equippedPrimary) {
                primaryHasParryBonus = item.getParryModifier();
                char._derivedBaseBoosts.parry += item.getParryModifier();
            }

            if (item.equippedSecondary) {
                if (
                    char.hasEdge("ambidextrous") > 0
                    ||
                    item.name.toLowerCase().trim() === "psi-shield"
                    ||
                    item.isShield
                ) {
                    char._derivedBaseBoosts.parry += item.getParryModifier();
                } else {
                    if (item.getParryModifier() > primaryHasParryBonus) {
                        char._derivedBaseBoosts.parry += item.getParryModifier() - primaryHasParryBonus;
                    }
                }
            }
        }

        for (const item of char._innateAttackObjs) {
            if (item.equippedPrimary) {
                primaryHasParryBonus = item.getParryModifier();
                char._derivedBaseBoosts.parry += item.getParryModifier();
            }

            if (item.equippedSecondary) {
                if (
                    char.hasEdge("ambidextrous") > 0
                    ||
                    item.name.toLowerCase().trim() === "psi-shield"
                    ||
                    item.isShield
                ) {
                    char._derivedBaseBoosts.parry += item.getParryModifier();
                } else {
                    if (item.getParryModifier() > primaryHasParryBonus) {
                        char._derivedBaseBoosts.parry += item.getParryModifier() - primaryHasParryBonus;
                    }
                }
            }
        }
    }

    /**
     * Get all purchased gear
     */
    getGearPurchased(): Gear[] {
        return (this._char as any)._gearPurchased;
    }

    /**
     * Get all purchased weapons
     */
    getWeaponsPurchased(): Weapon[] {
        return (this._char as any)._weaponsPurchased;
    }

    /**
     * Get melee weapons only
     */
    getMeleeWeaponsPurchased(): Weapon[] {
        return (this._char as any)._weaponsPurchased.filter(
            (weapon: Weapon) => {
                if ((weapon as any).profiles[0].melee_only === true) {
                    return true;
                }
                return false;
            }
        );
    }

    /**
     * Get ranged weapons only
     */
    getRangedWeaponsPurchased(): Weapon[] {
        return (this._char as any)._weaponsPurchased.filter(
            (weapon: Weapon) => {
                if ((weapon as any).profiles[0].melee_only === false) {
                    return true;
                }
                return false;
            }
        );
    }

    /**
     * Get all purchased armor
     */
    getArmorPurchased(): Armor[] {
        return (this._char as any)._armorPurchased;
    }

    /**
     * Get innate weapons
     */
    getInnateWeapons(): Weapon[] {
        return (this._char as any)._innateAttackObjs;
    }

    /**
     * Get all weapons (innate + armor integrated + purchased)
     */
    getWeapons(): Weapon[] {
        const char = this._char as any;
        let weapons: Weapon[] = [];

        const innateWeapons = this.getInnateWeapons();
        weapons = weapons.concat(innateWeapons);

        for (const armor of char.getArmor()) {
            if (armor.equippedArmor && armor.integratedWeapons.length > 0) {
                for (const weapon of armor.integratedWeapons) {
                    weapons.push(weapon);
                }
            }
        }

        const weaponsPurchased = this.getWeaponsPurchased();
        weaponsPurchased.sort((a: Weapon, b: Weapon) => {
            if ((a as any).name > (b as any).name) {
                return 1;
            } else if ((a as any).name < (b as any).name) {
                return -1;
            } else {
                return 0;
            }
        });

        weapons = weapons.concat(weaponsPurchased);

        return weapons;
    }

    /**
     * Sort cyberware by name
     */
    sortCyberware(): void {
        const char = this._char as any;

        char._cyberwarePurchased.sort(
            (a: Cyberware, b: Cyberware): number => {
                if ((a as any).getName() > (b as any).getName()) {
                    return 1;
                } else if ((a as any).getName() > (b as any).getName()) {
                    return -1;
                } else {
                    return 0;
                }
            }
        );
    }

    /**
     * Get all purchased cyberware
     */
    getCyberwarePurchased(): Cyberware[] {
        this.sortCyberware();
        return (this._char as any)._cyberwarePurchased;
    }

    /**
     * Sort Rifts tattoos by name
     */
    sortRiftsTattoos(): void {
        const char = this._char as any;

        char._riftsTattoosPurchased.sort(
            (a: RiftsTattoos, b: RiftsTattoos): number => {
                if ((a as any).getName() > (b as any).getName()) {
                    return 1;
                } else if ((a as any).getName() > (b as any).getName()) {
                    return -1;
                } else {
                    return 0;
                }
            }
        );
    }

    /**
     * Get all purchased Rifts tattoos
     */
    getRiftsTattooPurchased(): RiftsTattoos[] {
        this.sortRiftsTattoos();
        return (this._char as any)._riftsTattoosPurchased;
    }

    /**
     * Sort robot mods by name
     */
    sortRobotMods(): void {
        const char = this._char as any;

        char._robotModsPurchased.sort(
            (a: RobotMod, b: RobotMod): number => {
                if ((a as any).getName() > (b as any).getName()) {
                    return 1;
                } else if ((a as any).getName() > (b as any).getName()) {
                    return -1;
                } else {
                    return 0;
                }
            }
        );
    }

    /**
     * Get all purchased robot mods
     */
    getRobotModsPurchased(): RobotMod[] {
        this.sortRobotMods();
        return (this._char as any)._robotModsPurchased;
    }

    /**
     * Get all purchased vehicles
     */
    getVehiclesPurchased(): VehicleEntry[] {
        return (this._char as any)._vehiclesPurchased;
    }

    /**
     * Get formatted weapon list
     */
    getWeaponList(): string[] {
        const returnList: string[] = [];

        for (const item of this.getWeapons()) {
            let name = (item as any).getName(true);
            name += " (" + (item as any).getShortStats() + ")";
            returnList.push(name);
        }

        return returnList;
    }

    /**
     * Get formatted armor list
     */
    getArmorList(): string[] {
        const returnList: string[] = [];

        const armors = this.getArmorPurchased();
        armors.sort((a: Armor, b: Armor) => {
            if ((a as any).name > (b as any).name) {
                return 1;
            } else if ((a as any).name < (b as any).name) {
                return -1;
            } else {
                return 0;
            }
        });

        for (const item of armors) {
            let name = (item as any).getName(true);
            name += " (" + (item as any).getShortStats() + ")";
            returnList.push(name);
        }

        return returnList;
    }

    /**
     * Get formatted gear list
     */
    getGearList(): string[] {
        const returnList: string[] = [];

        const gear = this.getGearPurchased();
        gear.sort((a: Gear, b: Gear) => {
            if ((a as any).name > (b as any).name) {
                return 1;
            } else if ((a as any).name < (b as any).name) {
                return -1;
            } else {
                return 0;
            }
        });

        for (const item of gear) {
            let quantity = "";
            if ((item as any).quantity > 1) {
                quantity = " x" + (item as any).quantity;
            }

            let name = (item as any).getName(true);
            if ((item as any).showContains) {
                for (const contains of (item as any).contains) {
                    let containsQuantity = "";
                    if (contains.quantity > 1) {
                        containsQuantity = " x" + contains.quantity;
                    }
                    name += " [" + contains.name + containsQuantity + "]";
                }
            }
            name += quantity;
            returnList.push(name);
        }

        return returnList;
    }

    /**
     * Get list of container items from gear
     */
    getContainerList(
        currentItemIndex: number = -1,
        listingContainerIsCustom: boolean = false,
    ): IContainerListItem[] {
        const char = this._char as any;
        const containers: IContainerListItem[] = [];

        for (const itemIndex in char._gearPurchased) {
            if (
                char._gearPurchased[itemIndex].container
                && !(
                    +itemIndex === currentItemIndex
                    && listingContainerIsCustom === false
                )
            ) {
                containers.push({
                    index: +itemIndex,
                    label: char._gearPurchased[itemIndex].name,
                    isCustom: false,
                });
            }
        }

        return containers;
    }

    /**
     * Get list of vehicles as containers
     */
    getVehicleContainerList(
        currentItemIndex: number = -1,
        listingContainerIsCustom: boolean = false,
    ): IContainerListItem[] {
        const char = this._char as any;
        const containers: IContainerListItem[] = [];

        for (const itemIndex in char._vehiclesPurchased) {
            if (
                !(
                    +itemIndex === currentItemIndex
                    && listingContainerIsCustom === false
                )
            ) {
                containers.push({
                    index: +itemIndex,
                    label: char._vehiclesPurchased[itemIndex].name,
                    isCustom: false,
                });
            }
        }

        return containers;
    }
}
