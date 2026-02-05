/**
 * LegacyPurchaseModule - Handles legacy purchase methods for backwards compatibility
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - LEGACYPurchaseArmor: Legacy armor purchasing
 * - LEGACYPurchaseGear: Legacy gear purchasing
 * - LEGACYPurchaseWeapon: Legacy weapon purchasing
 */

import type { PlayerCharacter } from '../player_character';
import type { IContainerItemExport } from '../../../interfaces/IJSONPlayerCharacterExport';
import { Armor, IArmorObjectVars, IChargenArmor } from '../armor';
import { Gear, IChargenGear, IGearObjectVars } from '../gear';
import { IChargenWeapon, IWeaponObjectVars, Weapon } from '../weapon';
import { BaseModule } from './BaseModule';

export class LegacyPurchaseModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Legacy purchase has no persistent state to reset
    }

    /**
     * Legacy armor purchasing method
     */
    LEGACYPurchaseArmor(
        armorID: number,
        armorDef: IChargenArmor | null,
        buyCost: number,
        equippedArmor: boolean,
        equippedPrimary: boolean,
        equippedSecondary: boolean,
        equippedScreen: boolean,
        quantity: number,
        uuid: string,
        settingItem: boolean,
        selectedMode: number = -1,
        frameworkItem: boolean = false,
        objVars: IArmorObjectVars | null = null,
    ) {
        const char = this._char as any;

        if( frameworkItem ) {
            for( let _pv of char._vehiclesPurchased ) {
                if( armorID == _pv.id ) {
                    return;
                }
            }
        }
        if( armorID == 0 && armorDef ) {
            // Custom Gear
            let insertArmor = new Armor( armorDef, char );

            if( objVars ) {
                insertArmor.importOptions( objVars );
            }

            if( buyCost !== null && buyCost > -1 && buyCost != armorDef.cost ) {
                insertArmor.buyCost = buyCost;
            } else {
                insertArmor.buyCost = armorDef.cost;
            }

            insertArmor.setting_item = settingItem;

            insertArmor.frameworkItem = frameworkItem;
            insertArmor.quantity = quantity;
            insertArmor.equippedArmor = equippedArmor;
            insertArmor.equippedScreen = equippedScreen;
            insertArmor.equippedPrimary = equippedPrimary;
            insertArmor.equippedSecondary = equippedSecondary;
            insertArmor.equippedScreen = equippedScreen;
            insertArmor.selectedMode = selectedMode;

            if( uuid ) {
                insertArmor.uuid = uuid;
            }

            char._armorPurchased.push(
                insertArmor
            );
            return true;

        } else {
            //standard armor
            for( let armorDef of char._availableData.armor) {
                if( !quantity ) {
                    quantity = 1;
                }
                if( armorDef.id == armorID ) {

                    let insertArmor = new Armor(
                        armorDef,
                        char,
                    );

                    if( objVars ) {
                        insertArmor.importOptions( objVars );
                    }

                    if( buyCost !== null && buyCost > -1 && buyCost != armorDef.cost ) {
                        insertArmor.buyCost = buyCost;
                    } else {
                        insertArmor.buyCost = armorDef.cost;
                    }
                    if( uuid ) {
                        insertArmor.uuid = uuid;
                    }

                    insertArmor.frameworkItem = frameworkItem;
                    insertArmor.quantity = quantity;
                    insertArmor.equippedArmor = equippedArmor;
                    insertArmor.equippedScreen = equippedScreen;
                    insertArmor.equippedPrimary = equippedPrimary;
                    insertArmor.equippedSecondary = equippedSecondary;
                    insertArmor.equippedScreen = equippedScreen;
                    insertArmor.selectedMode = selectedMode;

                    char._armorPurchased.push(
                        insertArmor
                    );
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Legacy gear purchasing method
     */
    LEGACYPurchaseGear(
        gearID: number,
        gearDef: IChargenGear | null,
        buyCost: number,
        equippedPrimary: boolean,
        equippedSecondary: boolean,
        quantity: number,
        contains: IContainerItemExport[],
        droppedInCombat: boolean,
        equipped: boolean = false,
        settingItem: boolean = false,
        frameworkItem: boolean = false,
        objVars: IGearObjectVars | null = null,
        addInitialItems: boolean = false,
    ) {
        const char = this._char as any;

        if( frameworkItem ) {
            for( let _pv of char._vehiclesPurchased ) {
                if( gearID == _pv.id ) {
                    return;
                }
            }
        }
        if( gearID == 0 && gearDef ) {
            // Custom Gear
            let insertGear = new Gear( gearDef, char );

            if( objVars ) {
                insertGear.importOptions( objVars );
            }

            if( buyCost !== null && buyCost > -1 && buyCost != gearDef.cost ) {
                insertGear.buyCost = buyCost;
            } else {
                insertGear.buyCost = gearDef.cost;
            }

            for( let item of contains ) {
                if( !item.count_current ) {
                    item.count_current = 1;
                }
                if( !item.total_weight ) {
                    item.total_weight = item.weight;
                }
            }

            if( addInitialItems &&  insertGear.initial_contents ) {
                insertGear.contains = insertGear.initial_contents;
            }

            insertGear.setting_item = settingItem;
            if( settingItem ) {
                insertGear.is_custom = false;
            }

            insertGear.frameworkItem = frameworkItem;
            insertGear.contains = contains;
            insertGear.droppedInCombat = droppedInCombat;
            insertGear.equippedGear = equipped;
            insertGear.quantity = quantity;
            insertGear.equippedPrimary = equippedPrimary;
            insertGear.equippedSecondary = equippedSecondary;

            char._gearPurchased.push(
                insertGear
            );
            return true;

        } else {
            // Standard Gear
            if( !quantity ) {
                quantity = 1;
            }
            for( let gearDef of char._availableData.gear) {

                if( gearDef.id == gearID ) {

                    let insertGear = new Gear(
                        gearDef,
                        char,
                    );
                    if( objVars ) {
                        insertGear.importOptions( objVars );
                    }
                    if( buyCost !== null && buyCost > -1 && buyCost != gearDef.cost ) {
                        insertGear.buyCost = buyCost;
                    } else {
                        insertGear.buyCost = gearDef.cost;
                    }

                    for( let item of contains ) {
                        if( !item.count_current ) {
                            item.count_current = 1;
                        }

                        if( !item.total_weight ) {
                            item.total_weight = item.weight;
                        }

                    }

                    insertGear.frameworkItem = frameworkItem;
                    insertGear.contains = contains;
                    insertGear.droppedInCombat = droppedInCombat;
                    insertGear.quantity = quantity;
                    insertGear.equippedPrimary = equippedPrimary;
                    insertGear.equippedGear = equipped;
                    insertGear.equippedSecondary = equippedSecondary;
                    insertGear.is_custom = false;

                    if( addInitialItems &&  insertGear.initial_contents ) {
                        insertGear.contains = insertGear.initial_contents;
                    }

                    char._gearPurchased.push(
                        insertGear
                    );
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Legacy weapon purchasing method
     */
    LEGACYPurchaseWeapon(
        weaponID: number,
        weaponDef: IChargenWeapon | null,
        buyCost: number,
        equippedPrimary: boolean,
        equippedSecondary: boolean,
        quantity: number,
        scifiMod: string = "",
        uuid: string = "",
        settingItem: boolean,
        frameworkItem: boolean = false,
        objVars: IWeaponObjectVars | null = null,
    ) {
        const char = this._char as any;

        if( frameworkItem ) {
            for( let _pv of char._vehiclesPurchased ) {
                if( weaponID == _pv.id ) {
                    return;
                }
            }
        }
        if( weaponID == 0 && weaponDef ) {
            // Custom Weapon
            let insertWeapon = new Weapon(
                weaponDef,
                char,
            );

            if( objVars ) {
                insertWeapon.importOptions( objVars );
            }
            if( buyCost !== null && buyCost > -1 && buyCost != weaponDef.cost ) {
                insertWeapon.buyCost = buyCost;
            } else {
                insertWeapon.buyCost = weaponDef.cost;
            }

            insertWeapon.frameworkItem = frameworkItem;
            insertWeapon.setting_item = settingItem;
            insertWeapon.quantity = quantity;

            insertWeapon.equippedPrimary = equippedPrimary;
            if( uuid )
                insertWeapon.uuid = uuid;
            insertWeapon.equippedSecondary = equippedSecondary;
            insertWeapon.scifiMod = scifiMod;

            char._weaponsPurchased.push(
                insertWeapon
            );
            return true;

        } else {
            //standard Weapon

            for( let weaponDef of char._availableData.weapons) {
                if( !quantity ) {
                    quantity = 1;
                }
                if( weaponDef.id == weaponID ) {

                    let insertWeapon = new Weapon(
                        weaponDef,
                        char,
                    );
                    if( objVars ) {
                        insertWeapon.importOptions( objVars );
                    }
                    if( buyCost !== null && buyCost > -1 && buyCost != weaponDef.cost ) {
                        insertWeapon.buyCost = buyCost;
                    } else {
                        insertWeapon.buyCost = weaponDef.cost;
                    }

                    insertWeapon.quantity = quantity;
                    insertWeapon.frameworkItem = frameworkItem;
                    insertWeapon.equippedPrimary = equippedPrimary;
                    insertWeapon.equippedSecondary = equippedSecondary;
                    insertWeapon.scifiMod = scifiMod;
                    if( uuid )
                        insertWeapon.uuid = uuid;

                    char._weaponsPurchased.push(
                        insertWeapon
                    );
                    return true;
                }
            }
        }
        return false;
    }
}
