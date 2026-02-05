/**
 * InnateWeaponModule - Handles character innate weapon/attack management
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Creating innate attack objects (_createInnateAttackObjs)
 * - Checking for innate attacks (hasInnateAttack)
 * - Adding innate weapons (addInnateWeapon)
 * - Getting innate weapon display strings (_getInnateWeaponLine, _getInnateWeaponDamage)
 * - Saving innate weapon equip state (saveInnateEquips)
 */

import type { PlayerCharacter, IInnateWeapon } from '../player_character';
import { Weapon } from '../weapon';
import { replaceAll } from '../../../utils/CommonFunctions';
import { getDieLabelFromIndex } from '../../../utils/Dice';
import { BaseModule } from './BaseModule';

export class InnateWeaponModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Innate weapon state is managed by PlayerCharacter's reset()
    }

    /**
     * Create weapon objects from innate attack definitions
     */
    createInnateAttackObjs(): void {
        const char = this._char as any;

        for (const weapon of char._innateAttacks) {
            weapon.equippedPrimary = false;
            weapon.equippedSecondary = false;
            if (
                char._equippedInnate.primary
                &&
                weapon.name.toLowerCase().trim()
                ==
                char._equippedInnate.primary.toLowerCase().trim()
            ) {
                weapon.equippedPrimary = true;
            }

            if (
                char._equippedInnate.secondary
                &&
                weapon.name.toLowerCase().trim()
                ==
                char._equippedInnate.secondary.toLowerCase().trim()
            ) {
                weapon.equippedSecondary = true;
            }
        }

        char._innateAttackObjs = [];
        // add Innate Attacks
        for (const innateAttack of char._innateAttacks) {
            const innateWeapon = new Weapon();

            innateWeapon.dontStepUnarmedDamage = innateAttack.dontStepUnarmedDamage;

            if (
                innateAttack.name.trim().toLowerCase().indexOf("bite") > -1
                || innateAttack.name.trim().toLowerCase().indexOf("horns") > -1
                || innateAttack.name.trim().toLowerCase().indexOf("tail lash") > -1
                || innateAttack.name.trim().toLowerCase().indexOf("breath") > -1
            ) {
                innateWeapon.dontStepUnarmedDamage = true;
            }

            innateWeapon._apIsAgilityDie = innateAttack.apIsAgilityDie;
            innateWeapon._apIsPsionicSkillValue = innateAttack.apIsPsionic;
            innateWeapon._apIsHalfPsionicSkillValue = innateAttack.apIsHalfPsionic;
            innateWeapon._apIsDoublePsionicSkillValue = innateAttack.apIsDoublePsionic;
            innateWeapon._apIsSize = innateAttack.apIsSize;
            innateWeapon._apSizeBonus = innateAttack.apSizeBonus;

            innateWeapon.name = innateAttack.name;
            innateWeapon.profiles[0].add_strength_to_damage = innateAttack.addsStrength;
            innateWeapon.profiles[0].damage = innateAttack.damage;
            innateWeapon.profiles[0].range = innateAttack.range;
            innateWeapon.profiles[0].ap = innateAttack.ap;
            innateWeapon.profiles[0].reach = innateAttack.reach;

            innateWeapon.profiles[0].parry_modifier = innateAttack.parry;
            innateWeapon.tempParryModifier = innateAttack.tempParry;
            innateWeapon.tempToHitModifier = innateAttack.tempToHit;
            innateWeapon.weight = 0;
            innateWeapon.noGlobalDamageAdd = innateAttack.noGlobalDamageAdd;

            if (innateAttack.additionalDamage) {
                innateWeapon.profiles[0].additionalDamage = innateAttack.additionalDamage;
            }
            if (!innateAttack.notes) {
                innateWeapon.profiles[0].notes = "Innate Attack";
            } else {
                innateWeapon.profiles[0].notes = "Innate Attack, " + innateAttack.notes;
            }

            innateWeapon._char = char;
            innateWeapon.isInnate = true;

            innateWeapon.equippedPrimary = innateAttack.equippedPrimary;
            innateWeapon.equippedSecondary = innateAttack.equippedSecondary;

            if (innateAttack.attackProfiles && innateAttack.attackProfiles.length > 0) {
                innateWeapon.profiles = innateWeapon.profiles.concat(innateAttack.attackProfiles);
            }
            char._innateAttackObjs.push(innateWeapon);
        }
    }

    /**
     * Check if character has a specific innate attack
     */
    hasInnateAttack(name: string): boolean {
        const char = this._char as any;
        name = name.toLowerCase().trim();
        for (const att of char._innateAttacks) {
            if (att.name.toLowerCase().trim() === name) {
                return true;
            }
        }
        return false;
    }

    /**
     * Add an innate weapon from a modline string
     */
    addInnateWeapon(weaponStringModline: string): void {
        const char = this._char as any;
        weaponStringModline = weaponStringModline.trim();
        let ap = 0;
        let name = "";
        let damage = "";
        let range = "";
        let reach = 0;
        let notes = "";

        let apIsPsionic = false;
        let apIsHalfPsionic = false;
        let apIsDoublePsionic = false;

        let apIsSize = false;
        let apSizeBonus = 0;
        let dontStepUnarmedDamage = false;

        let apIsAgilityDie = false;

        if (weaponStringModline.indexOf(";") > -1) {
            const lineSplit = weaponStringModline.trim().split(";");

            if (lineSplit.length == 2) {   //  just name and damage
                name = lineSplit[0];
                damage = lineSplit[1];
                range = "Melee";
            } else if (lineSplit.length == 3) {     //  has range
                name = lineSplit[0].trim();
                range = lineSplit[1];
                damage = lineSplit[2];
            } else if (lineSplit.length == 4) {     //  has range and AP
                name = lineSplit[0];
                range = lineSplit[1];
                damage = lineSplit[2];
                ap = +lineSplit[3];

                if (
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionicx2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionicsx2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionic*2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionics*2") > -1
                ) {
                    apIsDoublePsionic = true;
                } else if (
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionic/2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionics/2") > -1
                ) {
                    apIsHalfPsionic = true;
                } else if (lineSplit[3].toLowerCase().indexOf("psionic") > -1) {
                    apIsPsionic = true;
                } else if (lineSplit[3].toLowerCase().indexOf("agility") > -1) {
                    apIsAgilityDie = true;
                }

                if (lineSplit[3].toLowerCase().indexOf("size") > -1) {
                    apIsSize = true;
                    if (lineSplit[3].toLowerCase().indexOf("+") > -1) {
                        const itemSplit = lineSplit[3].toLowerCase().split("+");
                        apSizeBonus = +itemSplit[1].replace("]", "").trim();
                    }
                }
            } else if (lineSplit.length == 5) {     //  has range and AP and Reach
                name = lineSplit[0];
                range = lineSplit[1];
                damage = lineSplit[2];
                ap = +lineSplit[3];
                reach = +lineSplit[4];
                if (
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionicx2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionicsx2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionic*2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionics*2") > -1
                ) {
                    apIsDoublePsionic = true;
                } else if (
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionic/2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionics/2") > -1
                ) {
                    apIsHalfPsionic = true;
                } else if (lineSplit[3].toLowerCase().indexOf("psionic") > -1) {
                    apIsPsionic = true;
                } else if (lineSplit[3].toLowerCase().indexOf("agility") > -1) {
                    apIsAgilityDie = true;
                }
                if (lineSplit[3].toLowerCase().indexOf("size") > -1) {
                    apIsSize = true;
                    if (lineSplit[3].toLowerCase().indexOf("+") > -1) {
                        const itemSplit = lineSplit[3].toLowerCase().split("+");
                        apSizeBonus = +itemSplit[1].replace("]", "").trim();
                    }
                }
            } else if (lineSplit.length >= 6) {     //  has range and AP and Reach and Notes
                name = lineSplit[0];
                range = lineSplit[1];
                damage = lineSplit[2];
                ap = +lineSplit[3];
                reach = +lineSplit[4];
                notes = lineSplit[5];
                if (
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionicx2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionicsx2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionic*2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionics*2") > -1
                ) {
                    apIsDoublePsionic = true;
                } else if (
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionic/2") > -1
                    ||
                    replaceAll(lineSplit[3], " ", "").toLowerCase().indexOf("psionics/2") > -1
                ) {
                    apIsHalfPsionic = true;
                } else if (lineSplit[3].toLowerCase().indexOf("psionic") > -1) {
                    apIsPsionic = true;
                } else if (lineSplit[3].toLowerCase().indexOf("agility") > -1) {
                    apIsAgilityDie = true;
                }
                if (lineSplit[3].toLowerCase().indexOf("size") > -1) {
                    apIsSize = true;
                    if (lineSplit[3].toLowerCase().indexOf("+") > -1) {
                        const itemSplit = lineSplit[3].toLowerCase().split("+");
                        apSizeBonus = +itemSplit[1].replace("]", "").trim();
                    }
                }
            }
        } else if (weaponStringModline.indexOf(" ") > -1) {
            const lineSplit = weaponStringModline.split(" ");

            if (lineSplit.length == 3) {    //  has range
                name = lineSplit[0];
                range = lineSplit[1];
                damage = lineSplit[2];
            } else if (lineSplit.length == 2) {   //  just name and damage
                name = lineSplit[0];
                damage = lineSplit[1];
                range = "Melee";
            }
        }
        let addsStrength = false;
        if (damage.toLowerCase().indexOf("str") > -1) {
            addsStrength = true;
            damage = damage.toLowerCase().replace("str", "").trim();
            if (damage[0] == "+") {
                damage = damage.slice(1).trim();
            }
        }
        range = range.replace("melee", "Melee");
        if (range.trim() == "") {
            range = "Melee";
        }
        name = name.charAt(0).toUpperCase() + name.slice(1);

        let found = false;

        if (name.toLowerCase().trim().indexOf("psi-") > -1) {
            dontStepUnarmedDamage = true;
        }
        let parryBonus = 0;

        if (notes.toLowerCase().indexOf("parry") > -1) {
            const split = notes.split(" ");
            let lCount = 0;
            for (const item of split) {
                if (
                    item.toLowerCase().trim() == "parry"
                    &&
                    lCount > 0
                ) {
                    parryBonus = +split[lCount - 1];
                }
                lCount++;
            }
        }

        for (let att of char._innateAttacks) {
            if (att.name.toLowerCase().trim() == name.toLowerCase().trim()) {
                found = true;
                att = {
                    name: name,
                    damage: damage,
                    addsStrength: addsStrength,
                    ap: ap,
                    reach: reach,
                    range: range,
                    additionalDamage: "",
                    parry: parryBonus,
                    notes: notes,
                    dontStepUnarmedDamage: dontStepUnarmedDamage,
                    apIsAgilityDie: apIsAgilityDie,
                    apIsPsionic: apIsPsionic,
                    apIsHalfPsionic: apIsHalfPsionic,
                    apIsDoublePsionic: apIsDoublePsionic,
                    apIsSize: apIsSize,
                    apSizeBonus: apSizeBonus,
                    equippedSecondary: false,
                    equippedPrimary: false,
                    tempToHit: 0,
                    tempParry: 0,
                    damageBoost: 0,
                    noGlobalDamageAdd: false,
                };
            }
        }
        if (!found) {
            char._innateAttacks.push({
                name: name,
                damage: damage,
                addsStrength: addsStrength,
                ap: ap,
                reach: reach,
                range: range,
                notes: notes,
                parry: parryBonus,
                apIsAgilityDie: apIsAgilityDie,
                apIsPsionic: apIsPsionic,
                apIsHalfPsionic: apIsHalfPsionic,
                apIsDoublePsionic: apIsDoublePsionic,
                dontStepUnarmedDamage: dontStepUnarmedDamage,
                apIsSize: apIsSize,
                additionalDamage: "",
                apSizeBonus: apSizeBonus,
                equippedSecondary: false,
                equippedPrimary: false,
                tempToHit: 0,
                tempParry: 0,
                damageBoost: 0,
                noGlobalDamageAdd: false,
            });
        }
    }

    /**
     * Get display line for an innate weapon
     */
    getInnateWeaponLine(attack: IInnateWeapon): string {
        let rv: string = attack.name + " (";
        rv += this.getInnateWeaponDamage(attack);
        rv += ", " + attack.range;
        if (attack.ap > 0) {
            rv += ", ap " + attack.ap.toString();
        }
        if (attack.reach > 0) {
            rv += ", reach " + attack.reach.toString();
        }
        rv += ")";

        return rv;
    }

    /**
     * Get damage string for an innate weapon
     */
    getInnateWeaponDamage(attack: IInnateWeapon): string {
        const char = this._char as any;
        if (attack.addsStrength) {
            if (attack.damage.trim()) {
                return "Str[" + getDieLabelFromIndex(char.getAttributeCurrent("strength")) + "]+" + attack.damage.trim();
            } else {
                return "Str[" + getDieLabelFromIndex(char.getAttributeCurrent("strength")) + "]";
            }
        } else {
            return attack.damage;
        }
    }

    /**
     * Save innate weapon equip state
     */
    saveInnateEquips(): void {
        const char = this._char as any;
        char._equippedInnate.primary = "";
        char._equippedInnate.secondary = "";
        for (const weapon of char._innateAttacks) {
            if (weapon.equippedPrimary) {
                char._equippedInnate.primary = weapon.name;
            }

            if (weapon.equippedSecondary) {
                char._equippedInnate.secondary = weapon.name;
            }
        }
    }
}
