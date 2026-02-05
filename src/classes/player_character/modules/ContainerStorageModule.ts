/**
 * ContainerStorageModule - Handles container and vehicle storage operations
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Storing items in containers (storeGearPurchasedInContainer, storeWeaponPurchasedInContainer, storeArmorPurchasedInContainer)
 * - Storing items in vehicles (storeGearPurchasedInVehicle, storeWeaponPurchasedInVehicle, storeArmorPurchasedInVehicle)
 * - Removing items from containers/vehicles (removeFromContainer, removeFromVehicle)
 * - Getting contained item info (getContainedItemTypeAndName, getVehicleContainedItemTypeAndName)
 */

import type { PlayerCharacter, INameAndType } from '../player_character';
import type { IContainerItemExport } from '../../../interfaces/IJSONPlayerCharacterExport';
import type { IChargenGear } from '../gear';
import type { IChargenWeapon } from '../weapon';
import type { IChargenArmor } from '../armor';
import { BaseModule } from './BaseModule';

export class ContainerStorageModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Container state is managed by PlayerCharacter's reset()
    }

    /**
     * Store gear in a container (gear item with container flag)
     */
    storeGearPurchasedInContainer(
        gearIndex: number,
        containerIndex: number,
        customData: IChargenGear | null = null,
    ): boolean {
        const char = this._char as any;
        if (char._gearPurchased.length > containerIndex && char._gearPurchased[containerIndex] && char._gearPurchased[containerIndex].container) {
            if (char._gearPurchased.length > gearIndex && char._gearPurchased[gearIndex] && char._gearPurchased[gearIndex].contains.length == 0) {
                // don't store a container within itself, or *poof* it's gone! LOL
                if (containerIndex != gearIndex) {
                    const storeItem: IContainerItemExport = {
                        cost_buy: char._gearPurchased[gearIndex].buyCost,
                        custom: customData,
                        quantity: char._gearPurchased[gearIndex].quantity,
                        id: char._gearPurchased[gearIndex].id,
                        container: char._gearPurchased[gearIndex].container,
                        name: char._gearPurchased[gearIndex].name,
                        count_current: char._gearPurchased[gearIndex].quantity,
                        total_cost_buy: char._gearPurchased[gearIndex].getTotalBuyCost(),
                        total_weight: char._gearPurchased[gearIndex].getTotalWeight(),
                        type: "gear",
                        enhancements: [],
                        weight: char._gearPurchased[gearIndex].getTotalWeight(),
                        weight_display: char._gearPurchased[gearIndex].getTotalWeightHR(),
                        scifi_mod: "",
                        contains: char._gearPurchased[gearIndex].contains,
                        uuid: char._gearPurchased[gearIndex].uuid,
                        setting_item: char._gearPurchased[gearIndex].setting_item,
                    };
                    // store item
                    char._gearPurchased[containerIndex].contains.push(storeItem);

                    // remove item
                    char._gearPurchased.splice(gearIndex, 1);
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * Store gear in a vehicle
     */
    storeGearPurchasedInVehicle(
        gearIndex: number,
        containerIndex: number,
        customData: IChargenGear | null = null,
    ): boolean {
        const char = this._char as any;
        if (char._vehiclesPurchased.length > containerIndex && char._vehiclesPurchased[containerIndex]) {
            if (char._gearPurchased.length > gearIndex && char._gearPurchased[gearIndex]) {

                const storeItem: IContainerItemExport = {
                    cost_buy: char._gearPurchased[gearIndex].buyCost,
                    custom: customData,
                    quantity: char._gearPurchased[gearIndex].quantity,
                    id: char._gearPurchased[gearIndex].id,
                    container: char._gearPurchased[gearIndex].container,
                    name: char._gearPurchased[gearIndex].name,
                    count_current: char._gearPurchased[gearIndex].quantity,
                    total_cost_buy: char._gearPurchased[gearIndex].getTotalBuyCost(),
                    total_weight: char._gearPurchased[gearIndex].getTotalWeight(),
                    type: "gear",
                    enhancements: [],
                    contains: char._gearPurchased[gearIndex].contains,
                    weight: char._gearPurchased[gearIndex].getTotalWeight(),
                    weight_display: char._gearPurchased[gearIndex].getTotalWeightHR(),
                    scifi_mod: "",

                    uuid: char._gearPurchased[gearIndex].uuid,
                    setting_item: char._gearPurchased[gearIndex].setting_item,
                };

                // store item
                char._vehiclesPurchased[containerIndex].contains.push(storeItem);

                // remove item
                char._gearPurchased.splice(gearIndex, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Get type and name of an item contained in a gear container
     */
    getContainedItemTypeAndName(
        gearIndex: number,
        containedIndex: number,
    ): INameAndType {
        const char = this._char as any;
        if (char._gearPurchased.length > gearIndex && char._gearPurchased[gearIndex] && char._gearPurchased[gearIndex].container) {
            if (char._gearPurchased[gearIndex].contains.length > containedIndex && char._gearPurchased[gearIndex].contains[containedIndex]) {
                return {
                    name: char._gearPurchased[gearIndex].contains[containedIndex].type,
                    type: char._gearPurchased[gearIndex].contains[containedIndex].type.toLowerCase().trim(),
                };
            }
        }

        return {
            name: "",
            type: ""
        };
    }

    /**
     * Get type and name of an item contained in a vehicle
     */
    getVehicleContainedItemTypeAndName(
        vehicleIndex: number,
        containedIndex: number,
    ): INameAndType {
        const char = this._char as any;
        if (char._vehiclesPurchased.length > vehicleIndex && char._vehiclesPurchased[vehicleIndex]) {
            if (char._vehiclesPurchased[vehicleIndex].contains.length > containedIndex && char._vehiclesPurchased[vehicleIndex].contains[containedIndex]) {
                return {
                    name: char._vehiclesPurchased[vehicleIndex].contains[containedIndex].type,
                    type: char._vehiclesPurchased[vehicleIndex].contains[containedIndex].type.toLowerCase().trim(),
                };
            }
        }

        return {
            name: "",
            type: ""
        };
    }

    /**
     * Remove an item from a vehicle and add it back to inventory
     */
    removeFromVehicle(
        vehicleIndex: number,
        containedIndex: number,
    ): boolean {
        const char = this._char as any;

        if (char._vehiclesPurchased.length > vehicleIndex && char._vehiclesPurchased[vehicleIndex]) {

            if (char._vehiclesPurchased[vehicleIndex].contains.length > containedIndex && char._vehiclesPurchased[vehicleIndex].contains[containedIndex]) {

                switch (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].type.toLowerCase().trim()) {
                    case "gear": {
                        let contains: IContainerItemExport[] = [];
                        if (typeof (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].contains) !== "undefined") {
                            //@ts-ignore
                            contains = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].contains ? char._vehiclesPurchased[vehicleIndex].contains[containedIndex].contains : [];
                        }
                        if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id > 0) {
                            char.LEGACYPurchaseGear(
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                false,
                                false,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                contains,
                                false
                            );
                            char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                            return true;
                        } else {
                            if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom) {
                                const customData = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom;

                                customData.quantity = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current;

                                char.LEGACYPurchaseGear(
                                    0,
                                    customData,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                    contains,
                                    false,
                                );
                                char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                                return true;
                            } else if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item) {
                                const customData = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom;

                                customData.quantity = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current;

                                char.LEGACYPurchaseGear(
                                    0,
                                    customData,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                    contains,
                                    false,
                                    true,
                                );
                                char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);

                                return true;
                            }
                            return false;
                        }
                    }
                    case "weapon": {
                        if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id > 0) {
                            char.LEGACYPurchaseWeapon(
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id,
                                null,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                false,
                                false,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].scifi_mod,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].uuid,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item,
                                undefined,
                                null,
                            );
                            char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                            return true;
                        } else {

                            if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom) {
                                const customData = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseWeapon(
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id,
                                    customData,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].scifi_mod,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].uuid,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item,
                                    undefined,
                                    null,
                                );
                                char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                                return true;
                            } else if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item) {
                                const customData = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseWeapon(
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id,
                                    customData,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].scifi_mod,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].uuid,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item,
                                    undefined,
                                    null,
                                );
                                char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                                return true;
                            }

                            return false;
                        }
                    }
                    case "armor": {
                        if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id > 0) {
                            char.LEGACYPurchaseArmor(
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id,
                                null,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                false,
                                false,
                                false,
                                false,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].uuid,
                                char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item,
                                undefined,
                                undefined,
                                null,
                            );
                            char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                            return true;
                        } else {

                            if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom) {
                                const customData = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseArmor(
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id,
                                    customData,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    false,
                                    false,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].uuid,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item,
                                    undefined,
                                    undefined,
                                    null,
                                );
                                char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                                return true;
                            } else if (char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item) {
                                const customData = char._vehiclesPurchased[vehicleIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseArmor(
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].id,
                                    customData,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    false,
                                    false,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].count_current,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].uuid,
                                    char._vehiclesPurchased[vehicleIndex].contains[containedIndex].setting_item,
                                    undefined,
                                    undefined,
                                    null,
                                );
                                char._vehiclesPurchased[vehicleIndex].contains.splice(containedIndex, 1);
                                return true;
                            }
                            return false;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Remove an item from a container and add it back to inventory
     */
    removeFromContainer(
        gearIndex: number,
        containedIndex: number,
    ): boolean {
        const char = this._char as any;

        if (char._gearPurchased.length > gearIndex && char._gearPurchased[gearIndex] && char._gearPurchased[gearIndex].container) {

            if (char._gearPurchased[gearIndex].contains.length > containedIndex && char._gearPurchased[gearIndex].contains[containedIndex]) {

                switch (char._gearPurchased[gearIndex].contains[containedIndex].type.toLowerCase().trim()) {
                    case "gear": {
                        if (char._gearPurchased[gearIndex].contains[containedIndex].id > 0) {
                            char.LEGACYPurchaseGear(
                                char._gearPurchased[gearIndex].contains[containedIndex].id,
                                char._gearPurchased[gearIndex].contains[containedIndex].custom,
                                char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                false,
                                false,
                                char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                [],
                                false
                            );
                            char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                            return true;
                        } else {
                            if (char._gearPurchased[gearIndex].contains[containedIndex].custom) {
                                const customData = char._gearPurchased[gearIndex].contains[containedIndex].custom;

                                customData.quantity = char._gearPurchased[gearIndex].contains[containedIndex].count_current;

                                char.LEGACYPurchaseGear(
                                    0,
                                    customData,
                                    char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                    [],
                                    false,
                                );
                                char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                                return true;
                            } else if (char._gearPurchased[gearIndex].contains[containedIndex].setting_item) {
                                const customData = char._gearPurchased[gearIndex].contains[containedIndex].custom;

                                customData.quantity = char._gearPurchased[gearIndex].contains[containedIndex].count_current;

                                char.LEGACYPurchaseGear(
                                    0,
                                    customData,
                                    char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                    [],
                                    false,
                                    true,
                                );
                                char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);

                                return true;
                            }
                            return false;
                        }
                    }
                    case "weapon": {
                        if (char._gearPurchased[gearIndex].contains[containedIndex].id > 0) {
                            char.LEGACYPurchaseWeapon(
                                char._gearPurchased[gearIndex].contains[containedIndex].id,
                                null,
                                char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                false,
                                false,
                                char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                char._gearPurchased[gearIndex].contains[containedIndex].scifi_mod,
                                char._gearPurchased[gearIndex].contains[containedIndex].uuid,
                                char._gearPurchased[gearIndex].contains[containedIndex].setting_item,
                            );
                            char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                            return true;
                        } else {

                            if (char._gearPurchased[gearIndex].contains[containedIndex].custom) {
                                const customData = char._gearPurchased[gearIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseWeapon(
                                    char._gearPurchased[gearIndex].contains[containedIndex].id,
                                    customData,
                                    char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                    char._gearPurchased[gearIndex].contains[containedIndex].scifi_mod,
                                    char._gearPurchased[gearIndex].contains[containedIndex].uuid,
                                    char._gearPurchased[gearIndex].contains[containedIndex].setting_item,
                                );
                                char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                                return true;
                            } else if (char._gearPurchased[gearIndex].contains[containedIndex].setting_item) {
                                const customData = char._gearPurchased[gearIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseWeapon(
                                    char._gearPurchased[gearIndex].contains[containedIndex].id,
                                    customData,
                                    char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                    char._gearPurchased[gearIndex].contains[containedIndex].scifi_mod,
                                    char._gearPurchased[gearIndex].contains[containedIndex].uuid,
                                    char._gearPurchased[gearIndex].contains[containedIndex].setting_item,
                                );
                                char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                                return true;
                            }

                            return false;
                        }
                    }
                    case "armor": {
                        if (char._gearPurchased[gearIndex].contains[containedIndex].id > 0) {
                            char.LEGACYPurchaseArmor(
                                char._gearPurchased[gearIndex].contains[containedIndex].id,
                                null,
                                char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                false,
                                false,
                                false,
                                false,
                                char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                char._gearPurchased[gearIndex].contains[containedIndex].uuid,
                                char._gearPurchased[gearIndex].contains[containedIndex].setting_item,
                                undefined,
                                undefined,
                            );
                            char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                            return true;
                        } else {

                            if (char._gearPurchased[gearIndex].contains[containedIndex].custom) {
                                const customData = char._gearPurchased[gearIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseArmor(
                                    char._gearPurchased[gearIndex].contains[containedIndex].id,
                                    customData,
                                    char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    false,
                                    false,
                                    char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                    char._gearPurchased[gearIndex].contains[containedIndex].uuid,
                                    char._gearPurchased[gearIndex].contains[containedIndex].setting_item,
                                    undefined,
                                    undefined,
                                );
                                char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                                return true;
                            } else if (char._gearPurchased[gearIndex].contains[containedIndex].setting_item) {
                                const customData = char._gearPurchased[gearIndex].contains[containedIndex].custom;
                                char.LEGACYPurchaseArmor(
                                    char._gearPurchased[gearIndex].contains[containedIndex].id,
                                    customData,
                                    char._gearPurchased[gearIndex].contains[containedIndex].cost_buy,
                                    false,
                                    false,
                                    false,
                                    false,
                                    char._gearPurchased[gearIndex].contains[containedIndex].count_current,
                                    char._gearPurchased[gearIndex].contains[containedIndex].uuid,
                                    char._gearPurchased[gearIndex].contains[containedIndex].setting_item,
                                    undefined,
                                    undefined,
                                );
                                char._gearPurchased[gearIndex].contains.splice(containedIndex, 1);
                                return true;
                            }
                            return false;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Store weapon in a vehicle
     */
    storeWeaponPurchasedInVehicle(
        weaponIndex: number,
        containerIndex: number,
        customData: IChargenWeapon | null = null,
    ): boolean {
        const char = this._char as any;
        if (char._vehiclesPurchased.length > containerIndex && char._vehiclesPurchased[containerIndex]) {
            if (char._weaponsPurchased.length > weaponIndex && char._weaponsPurchased[weaponIndex]) {
                const storeItem: IContainerItemExport = {
                    cost_buy: char._weaponsPurchased[weaponIndex].buyCost,
                    custom: customData,
                    id: char._weaponsPurchased[weaponIndex].id,
                    quantity: char._weaponsPurchased[weaponIndex].quantity,
                    name: char._weaponsPurchased[weaponIndex].name,
                    count_current: char._weaponsPurchased[weaponIndex].quantity,
                    total_cost_buy: char._weaponsPurchased[weaponIndex].getTotalBuyCost(),
                    total_weight: char._weaponsPurchased[weaponIndex].getTotalWeight(),
                    type: "weapon",
                    weight: char._weaponsPurchased[weaponIndex].getTotalWeight(),
                    weight_display: char._weaponsPurchased[weaponIndex].getWeightHR(),
                    scifi_mod: "",
                    container: false,
                    contains: char._weaponsPurchased[weaponIndex].contains,

                    uuid: char._weaponsPurchased[weaponIndex].uuid,
                    setting_item: char._weaponsPurchased[weaponIndex].setting_item,
                    enhancements: char._weaponsPurchased[weaponIndex].getEnhancementExport(),
                };
                // store item
                char._vehiclesPurchased[containerIndex].contains.push(storeItem);

                // remove item
                char._weaponsPurchased.splice(weaponIndex, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Store weapon in a container (gear item with container flag)
     */
    storeWeaponPurchasedInContainer(
        weaponIndex: number,
        containerIndex: number,
        customData: IChargenWeapon | null = null,
    ): boolean {
        const char = this._char as any;
        if (char._gearPurchased.length > containerIndex && char._gearPurchased[containerIndex] && char._gearPurchased[containerIndex].container) {
            if (char._weaponsPurchased.length > weaponIndex && char._weaponsPurchased[weaponIndex]) {
                const storeItem: IContainerItemExport = {
                    cost_buy: char._weaponsPurchased[weaponIndex].buyCost,
                    custom: customData,
                    id: char._weaponsPurchased[weaponIndex].id,
                    quantity: char._weaponsPurchased[weaponIndex].quantity,
                    name: char._weaponsPurchased[weaponIndex].name,
                    count_current: char._weaponsPurchased[weaponIndex].quantity,
                    total_cost_buy: char._weaponsPurchased[weaponIndex].getTotalBuyCost(),
                    total_weight: char._weaponsPurchased[weaponIndex].getTotalWeight(),
                    type: "weapon",
                    weight: char._weaponsPurchased[weaponIndex].getTotalWeight(),
                    weight_display: char._weaponsPurchased[weaponIndex].getWeightHR(),
                    scifi_mod: "",
                    container: false,
                    uuid: char._weaponsPurchased[weaponIndex].uuid,
                    setting_item: char._weaponsPurchased[weaponIndex].setting_item,
                    contains: char._weaponsPurchased[weaponIndex].contains,
                    enhancements: char._weaponsPurchased[weaponIndex].getEnhancementExport(),
                };
                // store item
                char._gearPurchased[containerIndex].contains.push(storeItem);

                // remove item
                char._weaponsPurchased.splice(weaponIndex, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Store armor in a container (gear item with container flag)
     */
    storeArmorPurchasedInContainer(
        armorIndex: number,
        containerIndex: number,
        customData: IChargenArmor | null = null,
    ): boolean {
        const char = this._char as any;
        if (char._gearPurchased.length > containerIndex && char._gearPurchased[containerIndex] && char._gearPurchased[containerIndex].container) {
            if (char._armorPurchased.length > armorIndex && char._armorPurchased[armorIndex]) {
                const storeItem: IContainerItemExport = {
                    cost_buy: char._armorPurchased[armorIndex].buyCost,
                    custom: customData,
                    id: char._armorPurchased[armorIndex].id,
                    quantity: char._armorPurchased[armorIndex].quantity,
                    name: char._armorPurchased[armorIndex].name,
                    count_current: char._armorPurchased[armorIndex].quantity,
                    total_cost_buy: char._armorPurchased[armorIndex].getTotalBuyCost(),
                    total_weight: char._armorPurchased[armorIndex].getTotalWeight(),
                    type: "armor",
                    weight: char._armorPurchased[armorIndex].getTotalWeight(),
                    weight_display: char._armorPurchased[armorIndex].getWeightHR(),
                    scifi_mod: "",
                    container: false,
                    setting_item: char._armorPurchased[armorIndex].setting_item,
                    uuid: char._armorPurchased[armorIndex].uuid,
                    enhancements: char._armorPurchased[armorIndex].getEnhancementExport(),
                    contains: [],
                };
                // store item
                char._gearPurchased[containerIndex].contains.push(storeItem);

                // remove item
                char._armorPurchased.splice(armorIndex, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Store armor in a vehicle
     */
    storeArmorPurchasedInVehicle(
        armorIndex: number,
        containerIndex: number,
        customData: IChargenArmor | null = null,
    ): boolean {
        const char = this._char as any;
        if (char._vehiclesPurchased.length > containerIndex && char._vehiclesPurchased[containerIndex]) {
            if (char._armorPurchased.length > armorIndex && char._armorPurchased[armorIndex]) {
                const storeItem: IContainerItemExport = {
                    cost_buy: char._armorPurchased[armorIndex].buyCost,
                    custom: customData,
                    id: char._armorPurchased[armorIndex].id,
                    quantity: char._armorPurchased[armorIndex].quantity,
                    name: char._armorPurchased[armorIndex].name,
                    count_current: char._armorPurchased[armorIndex].quantity,
                    total_cost_buy: char._armorPurchased[armorIndex].getTotalBuyCost(),
                    total_weight: char._armorPurchased[armorIndex].getTotalWeight(),
                    type: "armor",
                    weight: char._armorPurchased[armorIndex].getTotalWeight(),
                    weight_display: char._armorPurchased[armorIndex].getWeightHR(),
                    scifi_mod: "",
                    container: false,
                    setting_item: char._armorPurchased[armorIndex].setting_item,
                    uuid: char._armorPurchased[armorIndex].uuid,
                    enhancements: char._armorPurchased[armorIndex].getEnhancementExport(),
                    contains: [],
                };
                // store item
                char._vehiclesPurchased[containerIndex].contains.push(storeItem);

                // remove item
                char._armorPurchased.splice(armorIndex, 1);
                return true;
            }
        }

        return false;
    }
}
