/**
 * PurchaseModule - Handles item purchasing and custom item management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Standard purchases (purchaseArmor, purchaseGear, purchaseWeapon, etc.)
 * - Vehicle purchases (purchaseVehicle)
 * - Cyberware/RobotMod/RiftsTattoo purchases
 * - Custom item creation (addArmorCustom, addWeaponCustom, addGearCustom, etc.)
 * - Custom item updates (updateArmorCustom, updateWeaponCustom, etc.)
 */

import type { PlayerCharacter } from '../player_character';
import type { IArmorObjectVars, IChargenArmor } from '../armor';
import type { IChargenGear, IGearObjectVars } from '../gear';
import type { IChargenWeapon, IWeaponObjectVars } from '../weapon';
import type { IVehicleEntry, IVehicleObjectVars } from '../../vehicle_entry';
import type { IChargenRobotMod, IRobotModObjectVars } from '../robot_mod';
import type { IChargenCyberware, ICyberwareObjectVars } from '../cyberware';
import type { IChargenRiftsTattoo, IRiftsTattoosObjectVars } from '../riftsTattoos';
import { BaseModule } from './BaseModule';

// Late imports to avoid circular dependencies - these are loaded after player_character.ts initializes
let Armor: any;
let Gear: any;
let Weapon: any;
let VehicleEntry: any;
let RobotMod: any;
let Cyberware: any;
let RiftsTattoos: any;

function ensureImports() {
    if (!Armor) {
        Armor = require('../armor').Armor;
        Gear = require('../gear').Gear;
        Weapon = require('../weapon').Weapon;
        VehicleEntry = require('../../vehicle_entry').VehicleEntry;
        RobotMod = require('../robot_mod').RobotMod;
        Cyberware = require('../cyberware').Cyberware;
        RiftsTattoos = require('../riftsTattoos').RiftsTattoos;
    }
}

export class PurchaseModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Purchase state is managed by PlayerCharacter's reset()
    }

    // ========================================
    // ARMOR PURCHASE METHODS
    // ========================================

    /**
     * Purchase armor by ID or custom definition
     */
    purchaseArmor(
        itemID: number,
        itemDef: IChargenArmor | null = null,
        itemOptions: IArmorObjectVars | null = null,
    ): boolean | undefined {
        ensureImports();
        const char = this._char as any;

        if (itemID === 0 && itemDef) {
            // Custom armor
            const insertItem = new Armor(itemDef, char);
            insertItem.importOptions(itemOptions);
            char._armorPurchased.push(insertItem);
            return true;
        } else {
            for (const itemDefin of char._availableData.armor) {
                if (itemDefin.id === itemID) {
                    const insertItem = new Armor(itemDefin, char);
                    insertItem.importOptions(itemOptions);
                    char._armorPurchased.push(insertItem);
                    return true;
                }
            }
        }
    }

    /**
     * Add custom armor
     */
    addArmorCustom(armorData: IChargenArmor): boolean {
        ensureImports();
        const char = this._char as any;
        char._armorPurchased.push(new Armor(armorData, char));
        return true;
    }

    /**
     * Update custom armor at index
     */
    updateArmorCustom(index: number, armorData: IChargenArmor): boolean {
        ensureImports();
        const char = this._char as any;
        if (char._armorPurchased.length > index && char._armorPurchased[index]) {
            const buyCost = char._armorPurchased[index].buyCost;
            char._armorPurchased[index] = new Armor(armorData, char);
            char._armorPurchased[index].buyCost = buyCost;
            return true;
        }
        return false;
    }

    // ========================================
    // GEAR PURCHASE METHODS
    // ========================================

    /**
     * Purchase gear by ID or custom definition
     */
    purchaseGear(
        itemID: number,
        itemDef: IChargenGear | null,
        itemOptions: IGearObjectVars | null = null,
    ): boolean | undefined {
        ensureImports();
        const char = this._char as any;

        if (itemID === 0 && itemDef) {
            // Custom gear
            const insertItem = new Gear(itemDef, char);
            insertItem.importOptions(itemOptions);
            char._gearPurchased.push(insertItem);
            return true;
        } else {
            for (const itemDefin of char._availableData.gear) {
                if (itemDefin.id === itemID) {
                    const insertItem = new Gear(itemDefin, char);
                    insertItem.importOptions(itemOptions);
                    char._gearPurchased.push(insertItem);
                    return true;
                }
            }
        }
    }

    /**
     * Add custom gear
     */
    addGearCustom(gearData: IChargenGear): boolean {
        ensureImports();
        const char = this._char as any;
        char._gearPurchased.push(new Gear(gearData, char));
        return true;
    }

    /**
     * Update custom gear at index
     */
    updateGearCustom(index: number, gearData: IChargenGear): boolean {
        ensureImports();
        const char = this._char as any;
        if (char._gearPurchased.length > index && char._gearPurchased[index]) {
            const buyCost = char._gearPurchased[index].buyCost;
            char._gearPurchased[index] = new Gear(gearData, char);
            char._gearPurchased[index].buyCost = buyCost;
            return true;
        }
        return false;
    }

    // ========================================
    // WEAPON PURCHASE METHODS
    // ========================================

    /**
     * Purchase weapon by ID or custom definition
     */
    purchaseWeapon(
        weaponID: number,
        weaponDef: IChargenWeapon | null,
        weaponOptions: IWeaponObjectVars | null = null,
    ): boolean | undefined {
        ensureImports();
        const char = this._char as any;

        if (weaponID === 0 && weaponDef) {
            // Custom weapon
            const insertWeapon = new Weapon(weaponDef, char);
            insertWeapon.importOptions(weaponOptions);
            char._weaponsPurchased.push(insertWeapon);
            return true;
        } else {
            for (const weaponDefin of char._availableData.weapons) {
                if (weaponDefin.id === weaponID) {
                    const insertWeapon = new Weapon(weaponDefin, char);
                    insertWeapon.importOptions(weaponOptions);
                    char._weaponsPurchased.push(insertWeapon);
                    return true;
                }
            }
        }
    }

    /**
     * Add custom weapon
     */
    addWeaponCustom(weaponData: IChargenWeapon): boolean {
        ensureImports();
        const char = this._char as any;
        char._weaponsPurchased.push(new Weapon(weaponData, char));
        return true;
    }

    /**
     * Update custom weapon at index
     */
    updateWeaponCustom(index: number, weaponData: IChargenWeapon): boolean {
        ensureImports();
        const char = this._char as any;
        if (char._weaponsPurchased.length > index && char._weaponsPurchased[index]) {
            const buyCost = char._weaponsPurchased[index].buyCost;
            char._weaponsPurchased[index] = new Weapon(weaponData, char);
            char._weaponsPurchased[index].buyCost = buyCost;
            return true;
        }
        return false;
    }

    // ========================================
    // VEHICLE PURCHASE METHODS
    // ========================================

    /**
     * Purchase vehicle by ID or custom definition
     */
    purchaseVehicle(
        itemID: number,
        itemDef: IVehicleEntry | null,
        itemOptions: IVehicleObjectVars | null = null,
    ): boolean | undefined {
        ensureImports();
        const char = this._char as any;

        if (itemID === 0 && itemDef) {
            // Custom vehicle
            const insertItem = new VehicleEntry(itemDef, char);
            insertItem.importOptions(itemOptions);
            char._vehiclesPurchased.push(insertItem);
            return true;
        } else {
            // Check if vehicle already purchased
            let vehicleAlreadyPurchased = false;
            for (const _pv of char._vehiclesPurchased) {
                if (itemID === _pv.id) {
                    vehicleAlreadyPurchased = true;
                    break;
                }
            }

            if (!vehicleAlreadyPurchased) {
                for (const itemDefin of char._availableData.vehicles) {
                    if (itemDefin.id === itemID) {
                        const insertItem = new VehicleEntry(itemDefin, char);
                        insertItem.importOptions(itemOptions);
                        char._vehiclesPurchased.push(insertItem);
                        return true;
                    }
                }
            }
        }
    }

    /**
     * Add custom vehicle
     */
    addVehicleCustom(vehicleData: IVehicleEntry): boolean {
        ensureImports();
        const char = this._char as any;
        char._vehiclesPurchased.push(new VehicleEntry(vehicleData, char));
        return true;
    }

    /**
     * Update custom vehicle at index
     */
    updateVehicleCustom(index: number, vehicleData: IVehicleEntry): boolean {
        ensureImports();
        const char = this._char as any;
        if (char._vehiclesPurchased.length > index && char._vehiclesPurchased[index]) {
            const buyCost = char._armorPurchased[index].buyCost;
            char._vehiclesPurchased[index] = new VehicleEntry(vehicleData, char);
            char._armorPurchased[index].buyCost = buyCost;
            return true;
        }
        return false;
    }

    // ========================================
    // ROBOT MOD PURCHASE METHODS
    // ========================================

    /**
     * Purchase robot mod by ID or custom definition
     */
    purchaseRobotMod(
        itemID: number,
        itemDef: IChargenRobotMod | null,
        itemOptions: IRobotModObjectVars | null = null,
    ): boolean | undefined {
        ensureImports();
        const char = this._char as any;

        if (itemID === 0 && itemDef) {
            // Custom robot mod
            const insertItem = new RobotMod(itemDef, char);
            insertItem.importOptions(itemOptions);
            char._robotModsPurchased.push(insertItem);
            return true;
        } else {
            for (const itemDefin of char._availableData.robot_mods) {
                if (itemDefin.id === itemID) {
                    const insertItem = new RobotMod(itemDefin, char);
                    insertItem.importOptions(itemOptions);
                    char._robotModsPurchased.push(insertItem);
                    return true;
                }
            }
        }
    }

    // ========================================
    // CYBERWARE PURCHASE METHODS
    // ========================================

    /**
     * Purchase cyberware by ID or custom definition
     */
    purchaseCyberware(
        itemID: number,
        itemDef: IChargenCyberware | null,
        itemOptions: ICyberwareObjectVars | null = null,
    ): boolean | undefined {
        ensureImports();
        const char = this._char as any;

        if (itemID === 0 && itemDef) {
            // Custom cyberware
            const insertItem = new Cyberware(itemDef, char);
            insertItem.importOptions(itemOptions);
            char._cyberwarePurchased.push(insertItem);
            return true;
        } else {
            for (const itemDefin of char._availableData.cyberware) {
                if (itemDefin.id === itemID) {
                    const insertItem = new Cyberware(itemDefin, char);
                    insertItem.importOptions(itemOptions);
                    char._cyberwarePurchased.push(insertItem);
                    return true;
                }
            }
        }
    }

    // ========================================
    // RIFTS TATTOO PURCHASE METHODS
    // ========================================

    /**
     * Purchase Rifts tattoo by ID or custom definition
     */
    purchaseRiftsTattoo(
        itemID: number,
        itemDef: IChargenRiftsTattoo | null,
        itemOptions: IRiftsTattoosObjectVars | null = null,
    ): boolean | undefined {
        ensureImports();
        const char = this._char as any;

        if (itemID === 0 && itemDef) {
            // Custom tattoo
            const insertItem = new RiftsTattoos(itemDef, char);
            insertItem.importOptions(itemOptions);
            char._riftsTattoosPurchased.push(insertItem);
            return true;
        } else {
            for (const itemDefin of char._availableData.cyberware) {
                if (itemDefin.id === itemID) {
                    const insertItem = new RiftsTattoos(itemDefin, char);
                    insertItem.importOptions(itemOptions);
                    char._riftsTattoosPurchased.push(insertItem);
                    return true;
                }
            }
        }
    }

    /**
     * Add custom Rifts tattoo
     */
    addRiftsTattooCustom(rtData: IChargenRiftsTattoo): boolean {
        ensureImports();
        const char = this._char as any;
        char._riftsTattoosPurchased.push(new RiftsTattoos(rtData, char));
        return true;
    }

    /**
     * Update custom Rifts tattoo at index
     */
    updateRiftsTattooCustom(index: number, rtData: IChargenRiftsTattoo): boolean {
        ensureImports();
        const char = this._char as any;
        if (char._riftsTattoosPurchased.length > index && char._riftsTattoosPurchased[index]) {
            char._riftsTattoosPurchased[index] = new RiftsTattoos(rtData, char);
            return true;
        }
        return false;
    }

    /**
     * Add custom cyberware
     */
    addCyberwareCustom(cyberwareData: IChargenCyberware): boolean {
        ensureImports();
        const char = this._char as any;
        char._cyberwarePurchased.push(new Cyberware(cyberwareData, char));
        return true;
    }

    /**
     * Update custom cyberware at index
     */
    updateCyberwareCustom(index: number, cyberwareData: IChargenCyberware): boolean {
        ensureImports();
        const char = this._char as any;
        if (char._cyberwarePurchased.length > index && char._cyberwarePurchased[index]) {
            char._cyberwarePurchased[index] = new Cyberware(cyberwareData, char);
            return true;
        }
        return false;
    }

    /**
     * Add custom robot mod
     */
    addRobotModCustom(modData: IChargenRobotMod): boolean {
        ensureImports();
        const char = this._char as any;
        char._robotModsPurchased.push(new RobotMod(modData, char));
        return true;
    }

    /**
     * Update custom robot mod at index
     */
    updateRobotModCustom(index: number, modData: IChargenRobotMod): boolean {
        ensureImports();
        const char = this._char as any;
        if (char._robotModsPurchased.length > index && char._robotModsPurchased[index]) {
            char._robotModsPurchased[index] = new RobotMod(modData, char);
            return true;
        }
        return false;
    }
}
