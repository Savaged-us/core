import { IExportWeapon, IWeaponProfile } from "../../interfaces/IExportStatsOutput";
import { ICustomWeaponExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { FormatMoney } from "../../utils/CommonFunctions";
import { getDieIndexFromLabel, getDieLabelFromIndex, getDieValueFromIndex, getDieValueFromLabel } from "../../utils/Dice";
import { IDieDamageExport, ParseDamageString } from "../../utils/ParseDamageString";
import { simplifyDamage } from "../../utils/simplifyDamage";
import { simplifyDice } from "../../utils/simplifyDice";
import { Gear, IChargenGear, IGearObjectVars } from "./gear";
import { PlayerCharacter } from "./player_character";

export interface IChargenWeapon extends IChargenGear {

    minimum_strength: string;

    tw_cost: number;
    tw_effects: string;

    vehicle_mods: number;
    extra_notes: string;

    profiles: IWeaponProfile[];

    // deprecated profiles
    damage?: string;
    parry_modifier?: number;
    range?: string;
    reach?: number;
    requires_2_hands?: boolean;
    rof?: number;
    shots?: number;
    heavy_weapon?: boolean;
    melee_only?: boolean;
    notes?: string;

    is_shield?: boolean;
    thrown_weapon?: boolean;
    usable_in_melee?: boolean;
    add_strength_to_damage: boolean;
    ap: number;
    ap_vs_rigid_armor_only: number;
    counts_as_innate: boolean;
}

export function getBaseWeaponStat(): IWeaponProfile {
    return {
        name: "",
        damage: "",
        damageWithBrackets: "",
        damage_original: "",
        parry_modifier: 0,
        range: "",
        reach: 0,
        requires_2_hands: false,
        rof: 0,
        shots: 0,
        heavy_weapon: false,
        melee_only: false,
        notes: "",
        currentShots: 0,

        additionalDamage: "",

        damageDiceBasePlus: 0,      // unused here
        damageDiceBase: "",         // unused here

        toHitMod: 0,

        is_shield: false,
        thrown_weapon: false,
        // type: "",
        usable_in_melee: false,
        counts_as_innate: false,
        add_strength_to_damage: false,
        ap: 0,
        ap_vs_rigid_armor_only: 0,

        vtt_only: false,

        skillName: "",
        skillValue: "",
    }
}

interface IScifiWeaponMod {
    tag: string;
    name: string,
    prefix: string,
    cost: number,
    weight: number,
    damage: string,
    ap: number,
    needs_power: boolean,
    page: string,
    notes: string;
    half_die_ap: boolean;
}

export const scifi2014WeaponMods: IScifiWeaponMod[] = [
    {
        tag: "chain",
        name: "Chain",
        prefix: "Chain-",
        cost: 500,
        weight: 2,
        damage: "+1d6",
        ap: 2,
        needs_power: true,
        page: "SciFi p18",
        half_die_ap: false,
        notes: "",
    },
    {
        tag: "vibro",
        name: "Vibro",
        prefix: "Vibro-",
        cost: 500,
        weight: 2,
        damage: "+1d6",
        ap: 2,
        needs_power: true,
        page: "SciFi p18",
        half_die_ap: false,
        notes: "",
    },
    {
        tag: "energy",
        name: "Energy",
        prefix: "Energy-",
        cost: 500,
        weight: 0,
        damage: "+2",
        ap: 0,
        half_die_ap: true,
        notes: "HW",
        needs_power: true,
        page: "SciFi p18",
    },
    {
        tag: "molecular",
        name: "Molecular",
        prefix: "Molecular-",
        cost: 500,
        weight: 1,
        needs_power: false,
        page: "SciFi p18",
        half_die_ap: false,
        notes: "",
        ap: 0,
        damage: "",
    },
    {
        tag: "power",
        name: "Energy",
        prefix: "Energy-",
        cost: 500,
        weight: 1,
        damage: "+1d6",
        needs_power: true,
        page: "SciFi p18",
        half_die_ap: false,
        notes: "",
        ap: 0,
    },
    {
        tag: "stun",
        name: "Stun",
        prefix: "Stun-",
        cost: 500,
        weight: 1,
        needs_power: true,
        page: "SciFi p18",
        half_die_ap: false,
        notes: "",
        ap: 0,
        damage: "",
    }
];

export class Weapon extends Gear {
    equippedPrimary: boolean = false;
    equippedSecondary: boolean = false;

    isArmorWeapon: boolean = false;
    scifiMod: string = "";

    activeProfile: number = 0;

    isCustom: boolean = false;
    readOnly: boolean = false;

    isShield: boolean = false;

    dontStepUnarmedDamage: boolean = true;

    _apIsPsionicSkillValue: boolean = false;
    _apIsAgilityDie: boolean = false;
    _apIsHalfPsionicSkillValue: boolean = false;
    _apIsDoublePsionicSkillValue: boolean = false;
    _apIsSize: boolean = false;
    _apSizeBonus: number = 0;

    settingItem: boolean = false;

    minimumStrength: string;

    isInnate: boolean = false;

    frameworkItem: boolean = false;

    vehicleMods: number;
    noGlobalDamageAdd: boolean = false;

    twCost: number;
    twEffects: string;
    extraNotes: string = "";

    tempToHitModifier: number = 0;
    tempParryModifier: number = 0;

    profiles: IWeaponProfile[];

    constructor(
        initObj: IChargenWeapon | null = null,
        characterObject: PlayerCharacter | null = null,
    ) {
        super( initObj, characterObject);
        this.reset();
        if( characterObject ) {
            this._char = characterObject;
        }

        this.import(initObj);

        this.buyCost = this.getCost();
    }

    apply( charObj: PlayerCharacter | null ) {

        if( this._hasBeenApplied ) {
            console.warn( this.name + " has already been applied, skipping");
            return;
        }

        if( !charObj )
            charObj = this._char;

        if( !charObj )
            return;

        this._hasBeenApplied = true;

        if( this.equippedPrimary || this.equippedSecondary) {
            // console.log("item.effects", item.effects);
            ApplyCharacterEffects(
                this.effects,
                charObj,
                "Weapon: " + this.name,
                "",
                "",
                null,
                true,
            );
        }
    }

    import( initObj: IChargenWeapon | null ) {

        if( initObj ) {
            super.import( initObj )

            if( initObj.tw_cost ) {
                this.twCost = initObj.tw_cost;
            }

            if( initObj.vehicle_mods ) {
                this.vehicleMods = initObj.vehicle_mods;
            }

            if( initObj.abilities ) {
                this.abilities = initObj.abilities;
            }

            if( initObj.minimum_strength ) {
                this.minimumStrength = initObj.minimum_strength;
            }

            if( initObj.tw_effects ) {
                this.twEffects = initObj.tw_effects;
            }

            if( initObj.extra_notes ) {
                this.extraNotes = initObj.extra_notes;
            }

            this.profiles = [];
            if( typeof( initObj.profiles ) == "undefined" || initObj.profiles.length == 0 ) {

                let statsObj = getBaseWeaponStat();

                if( initObj.counts_as_innate ) {
                    statsObj.counts_as_innate = true;
                }
                if( initObj.rof ) {
                    statsObj.rof = initObj.rof;
                }
                if( initObj.shots ) {
                    statsObj.shots = initObj.shots;
                }
                if( initObj.thrown_weapon ) {
                    statsObj.thrown_weapon = initObj.thrown_weapon;
                }

                initObj.usable_in_melee = false;
                if( initObj.usable_in_melee ) {
                    statsObj.usable_in_melee = true;
                }

                if( initObj.is_shield ) {
                    statsObj.is_shield = true;
                }

                statsObj.add_strength_to_damage = false;
                if( initObj.add_strength_to_damage ) {
                    statsObj.add_strength_to_damage = true;
                }

                if( initObj.ap ) {
                    statsObj.ap = initObj.ap;
                }

                if( initObj.ap_vs_rigid_armor_only ) {
                    statsObj.ap_vs_rigid_armor_only = initObj.ap_vs_rigid_armor_only;
                }

                if( initObj.damage ) {
                    statsObj.damage = initObj.damage;
                    statsObj.damage_original = statsObj.damage;
                }

                if( initObj.heavy_weapon ) {
                    statsObj.heavy_weapon = initObj.heavy_weapon;
                }

                statsObj.melee_only = false;
                if( initObj.melee_only ) {
                    statsObj.melee_only = true;
                }

                if( initObj.notes ) {
                    statsObj.notes = initObj.notes;
                }

                if( initObj.parry_modifier ) {
                    statsObj.parry_modifier = initObj.parry_modifier;
                }

                if( initObj.range ) {
                    statsObj.range = initObj.range;
                }
                if( initObj.reach ) {
                    statsObj.reach = initObj.reach;
                }
                statsObj.requires_2_hands = false;
                if( initObj.requires_2_hands ) {
                    statsObj.requires_2_hands = true;
                }
                statsObj.heavy_weapon = false;
                if( initObj.heavy_weapon ) {
                    statsObj.heavy_weapon = true;
                }

                statsObj.thrown_weapon = false;
                if( initObj.thrown_weapon ) {
                    statsObj.thrown_weapon = true;
                }
                if( statsObj.counts_as_innate )
                    this.dontStepUnarmedDamage = false
                this.profiles.push( statsObj);

            } else {
                this.profiles = initObj.profiles;
                for( let prof of this.profiles ) {
                    prof.damage_original = prof.damage;
                    if(! prof.toHitMod )
                        prof.toHitMod = 0;

                    if( prof.add_strength_to_damage ) {
                        prof.add_strength_to_damage = true;
                    } else {
                        prof.add_strength_to_damage = false;
                    }

                    if( prof.usable_in_melee ) {
                        prof.usable_in_melee = true;
                    } else {
                        prof.usable_in_melee = false;
                    }

                    if( prof.requires_2_hands ) {
                        prof.requires_2_hands = true;
                    } else {
                        prof.requires_2_hands = false;
                    }

                    if( prof.thrown_weapon ) {
                        prof.thrown_weapon = true;
                    } else {
                        prof.thrown_weapon = false;
                    }

                    if( prof.heavy_weapon ) {
                        prof.heavy_weapon = true;
                    } else {
                        prof.heavy_weapon = false;
                    }

                    if( prof.counts_as_innate )
                        this.dontStepUnarmedDamage = false
                }
            }

        }
    }

    getName(withQuantities: boolean = false): string {

        let prefix = "";
        let suffix = "";

        for( let enh of this.gear_enhancements ) {
            if( enh.name_suffix.trim() ) {
                suffix = suffix + " " + enh.name_suffix.trim();
            }
            if( enh.name_prefix.trim() ) {
                prefix = prefix + enh.name_prefix.trim() + " ";
            }
        }

        if( this.scifiMod ) {
            for( let mod of scifi2014WeaponMods ) {
                if( this.scifiMod == mod.tag ) {
                    prefix = prefix + mod.prefix.trim() + " ";
                }
            }
        }
        if( withQuantities && this.quantity > 1 ) {
            return this.quantity.toString() + "x " + prefix + this.getNamePlural() + suffix;
        } else {
            return prefix + this.name + suffix;
        }
    }

    getNamePlural(): string {
        if( this.namePlural.trim() ) {
            return this.namePlural;
        } else {
            //try to default with an "s"
            // return this.name + "s";
            return this.name;
        }
    }

    public getSkillName(
        profileNumber: number = 0,
    ): string {
        if( this.profiles.length < profileNumber )
            profileNumber = 0;
        if( this.profiles[profileNumber].melee_only )
            return "Fighting"
        if( this.profiles[profileNumber].thrown_weapon )
            return "Athletics"

        return "Shooting";
    }

    public getSkillValue(
        profileNumber: number = 0,
    ): string {

        if( this._char ) {
            if( this.profiles.length < profileNumber )
                profileNumber = 0;
            let arcaneSkill = this._char.getSkill( this.getSkillName(profileNumber) );
            let arcaneSkillValue = "d4-2";

            if( arcaneSkill ) {
                arcaneSkillValue = arcaneSkill.currentValueHR();

                if( arcaneSkillValue == "" || arcaneSkillValue == "-" ) {
                    arcaneSkillValue = "d4 -2"
                }
            }

            let skillMod = this.tempToHitModifier;

            return simplifyDice( arcaneSkillValue + " " + ( skillMod < 0 ? skillMod : "+" + skillMod) );
        }
        return "d4-2";
    }

    getAP(
        profileIndex: number | null = null,
        no_adjustments: boolean = false,
    ): number {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let ap = this.profiles[profileIndex].ap;

        if( !ap ) {
            ap = 0;
        }

        let adj = 0;
        if( no_adjustments == false ) {
            for( let enh of this.gear_enhancements ) {
                ap += enh.weapon_ap;
            }
        }

        if( this.isInnate || this.profiles[profileIndex].counts_as_innate ) {
            if( this._char )
                ap += this._char._unarmedDamageAPBonus;
            else
                console.warn("This would have broke the weapon list", this.getName() )
        }

        if( this._apIsSize ) {
            if( this._char ) {
                return this._char.getSize() + this._apSizeBonus;
            } else {
                return 0;
            }

        } else {

            if( this._char && this._apIsPsionicSkillValue ) {
                let psiSkill = this._char.getSkill("Psionics");
                if( psiSkill )
                    return getDieValueFromIndex( psiSkill.currentValue() )
            } else if( this._char && this._apIsHalfPsionicSkillValue ) {
                let psiSkill = this._char.getSkill("Psionics");
                if( psiSkill )
                    return getDieValueFromIndex( psiSkill.currentValue() ) / 2
            } else if( this._char && this._apIsDoublePsionicSkillValue ) {
                let psiSkill = this._char.getSkill("Psionics");
                if( psiSkill )
                    return getDieValueFromIndex( psiSkill.currentValue() ) * 2
            }  else if( this._char && this._apIsAgilityDie ) {
                let attributeValue = this._char.getAttributeCurrent("Agility");
                return getDieValueFromIndex( attributeValue )
            }
            else {
                if( this.scifiMod ) {
                    let baseAP = ap;

                    for( let mod of scifi2014WeaponMods ) {
                        if( this.scifiMod == mod.tag ) {
                            baseAP += mod.ap;

                            if( mod.half_die_ap ) {
                                if( this.profiles[profileIndex].damage )
                                    baseAP += getDieValueFromLabel(this.profiles[profileIndex].damage) / 2;
                            }
                        }
                    }

                    return baseAP;
                } else {
                    return ap;
                }
            }
        }
        return 0;
    }

    getMinimumStrength(): string {
        let min_strength = this.minimumStrength;
        if( this.vehicleMods > 0 ) {
            min_strength = "d12+" + this.vehicleMods.toString();
        }
        for( let enh of this.gear_enhancements ) {
            if( enh.weapon_min_str_adjustment != 0 ) {
                let die_value = getDieIndexFromLabel(min_strength);
                die_value += enh.weapon_min_str_adjustment;
                if( die_value < 1 ) {
                    die_value = 1;
                }
                min_strength = getDieLabelFromIndex( die_value );
            }
        }

        return min_strength;
    }

    isUnderStrength(): boolean {
        if( this.isInnate ) {
            return false;
        }

        if( this._char && this._char.setting && this._char.setting.usesMinimumStrength === false) {
            return false;
        }

        if( this._char ) {
            if(
                this._char.getWeaponStrength()
                <
                getDieIndexFromLabel( this.getMinimumStrength() )
            ) {
                return true;
            }
        }
        return false;
    }

    getRange(
        profileIndex: number | null = null,
    ): string {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let range = this.profiles[profileIndex].range;

        let thrownWeapon = this.profiles[profileIndex].thrown_weapon;
        if(range && range.trim()) {
            if( this._char && this._char._thrownWeaponRangeIncrement > 0 && thrownWeapon ) {

                if( range.indexOf("/") > 0 ) {

                    let rangeSplit = range.split("/");
                    if( rangeSplit.length == 3 ) {

                        let short = +rangeSplit[0] + this._char._thrownWeaponRangeIncrement;
                        let medium = +rangeSplit[1] + this._char._thrownWeaponRangeIncrement * 2;
                        let long = +rangeSplit[2] + this._char._thrownWeaponRangeIncrement * 4;

                        return short.toString() + "/" + medium.toString() + "/" + long.toString();
                    } else {
                        return range;
                    }
                } else {
                    return range;
                }
            } else {
                return range;
            }

        } else {
            return "Melee"
        }
    }

    getTotalCost(): number {
        return this.getCost() * this.quantity;
    }

    getCost(): number {
        let cost = this.cost;

        if( this.scifiMod ) {
            let baseCost = this.cost;

            for( let mod of scifi2014WeaponMods ) {
                if( this.scifiMod == mod.tag ) {
                    baseCost += mod.cost;
                }
            }

            cost = baseCost
        } else {
            cost = this.cost;
        }

        for( let enh of this.gear_enhancements ) {

            if( enh.weapon_cost_adjustment_is_multiplied ) {
                cost = cost * enh.weapon_cost_adjustment;
            } else if ( enh.weapon_cost_adjustment_is_per_ap ) {
                cost += this.getAP(null, true) * enh.weapon_cost_adjustment;
            } else if ( enh.weapon_cost_adjustment_is_per_pound ) {
                cost += this.getWeight() * enh.weapon_cost_adjustment;
            } else {
                cost += enh.weapon_cost_adjustment;
            }

        }
        return cost;
    }

    getWeight(
        no_adjustments = false,
    ): number {

        let rv = this.weight / 1;

        if( no_adjustments == false ) {
            for( let enh of this.gear_enhancements ) {
                rv = rv * enh.weapon_weight_multiplier;
            }
        }

        return rv;
    }

    getThrownWeapon(
        profileIndex: number | null = null,
    ): boolean {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        return this.profiles[profileIndex].thrown_weapon;
    }

    getMeleeOnly(
        profileIndex: number | null = null,
    ): boolean {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        return this.profiles[profileIndex].melee_only;
    }

    getRequiresTwoHands(
        profileIndex: number | null = null,
    ): boolean {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        return this.profiles[profileIndex].requires_2_hands;
    }

    getDamage(
        showStrValueInBrackets = false,
        profileIndex: number | null = null,
    ): string {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let returnString = "";
        let damageAdd = "";
        if( this.scifiMod ) {
            for( let mod of scifi2014WeaponMods ) {
                if( this.scifiMod == mod.tag ) {
                    damageAdd = mod.damage;
                }
            }
        }

        let damage_bonus = 0;
        for( let enh of this.gear_enhancements ) {
            damage_bonus += enh.weapon_damage;
        }

        let damage = "";
        let addStrengthToDamage = false;

        // if( this.damage )
        //     damage = this.damage.toString();

        if( this.profiles.length > 0 && this.profiles[profileIndex].damage ) {
            damage = this.profiles[profileIndex].damage;
        }

        if( this.profiles.length > 0 && this.profiles[profileIndex].add_strength_to_damage ) {

            addStrengthToDamage = this.profiles[profileIndex].add_strength_to_damage;
        }

        if( this._char ) {
            damage = damage.replace(/spirit x2/ig, "2" + getDieLabelFromIndex(this._char.getAttributeCurrent("spirit")) );
            damage = damage.replace(/spirit/ig, "" + getDieLabelFromIndex(this._char.getAttributeCurrent("spirit")) );
            damage = damage.replace(/smarts x2/ig, "2" + getDieLabelFromIndex(this._char.getAttributeCurrent("smarts")) );
            damage = damage.replace(/smarts/ig, "" + getDieLabelFromIndex(this._char.getAttributeCurrent("smarts")) );
        }

        if( addStrengthToDamage ) {
            if( this._char ) {

                if( this.isUnderStrength() ) {
                    if( showStrValueInBrackets ) {
                        returnString += "Str[" + getDieLabelFromIndex(this._char.getAttributeCurrent("strength")) + "]+" + getDieLabelFromIndex(this._char.getAttributeCurrent("strength")) + "<sup title=\"This weapon's mimimum strength is greater than your character's strength\">US</sup>";
                    } else {
                        returnString += "Str+" + getDieLabelFromIndex(this._char.getAttributeCurrent("strength")) + "<sup title=\"This weapon's mimimum strength is greater than your character's strength\">US</sup>";
                    }
                } else {
                    if( damage.trim() ) {
                        if( showStrValueInBrackets ) {
                            returnString += "Str[" + getDieLabelFromIndex(this._char.getAttributeCurrent("strength")) + "]+" + damage;
                        } else {
                            returnString += "Str+" + damage;
                        }
                    } else {
                        if( showStrValueInBrackets ) {
                            returnString += "Str[" + getDieLabelFromIndex(this._char.getAttributeCurrent("strength")) + "]";
                        } else {
                            returnString += "Str";
                        }
                    }

                }

            } else {
                if( damage.trim() ) {
                    returnString += "Str+" + damage;
                } else {
                    returnString += "Str";
                }
            }

        } else {
            returnString += damage;
        }

        if( this._char
            && this._char._unarmedDamageStepBonus > 0
            && addStrengthToDamage
            && this.dontStepUnarmedDamage == false

        ) {

            // console.log("1118 Boosting damage!", this.name, this._char._unarmedDamageStepBonus, returnString);

            let damageItems = returnString.split("+");

            let newDamage: string[] = [];
            let changedPrimaryDie = false;
            if(
                damageItems.length == 1
                    &&
                (
                    damageItems[0].toLowerCase().trim() == "str"
                    || (
                        damageItems[0].toLowerCase().trim().indexOf("str[") == 0
                    )
                )
            ) {
                newDamage.push(damageItems[0])
                newDamage.push( getDieLabelFromIndex( this._char._unarmedDamageStepBonus ) );
            } else {
                for( let bit of damageItems ) {
                    // console.log( "bit", bit);
                    if(
                        bit.toLowerCase().indexOf("d") > -1
                            &&
                        bit.toLowerCase().indexOf("str") == -1
                            &&
                        changedPrimaryDie == false
                    ) {
                        let split  = bit.split("d", 2)
                        let prefix = split[0];
                        let baseDie = "d" + split[1];
                        let attackDieIndex = getDieIndexFromLabel( baseDie );

                        attackDieIndex = attackDieIndex + this._char._unarmedDamageStepBonus

                        bit = prefix + getDieLabelFromIndex( attackDieIndex )

                        //primary die area upgraded, upgrade no more
                        changedPrimaryDie = true;
                        newDamage.push( bit )
                    } else {
                        newDamage.push( bit )
                    }
                }
            }
            returnString = newDamage.join("+")
            // console.log("Boosted damage!", returnString);

        }

        // console.log("????", returnString, damageAdd ,"+", this._char._additionalMeleeDamage)

        let damage_bonus_string = "";
        if( damage_bonus > 0 ) {
            damage_bonus_string = "+" + damage_bonus.toString();
        }
        if( damage_bonus < 0 ) {
            damage_bonus_string = damage_bonus.toString();
        }

        // if( this.additionalDamage && this.additionalDamage.trim() ) {
        //     damage += "+"+ this.additionalDamage;
        // }

        if( this.profiles[profileIndex].additionalDamage && this.profiles[profileIndex].additionalDamage ) {
            damageAdd += "+"+ this.profiles[profileIndex].additionalDamage;
        }

        if(
            this.getRange().toLowerCase().trim() == "melee"
            && this.noGlobalDamageAdd == false
            && this._char
            && this._char._additionalMeleeDamage.trim()
        ) {
            return simplifyDamage(returnString + damage_bonus_string + damageAdd + "+" + this._char._additionalMeleeDamage );
        } else {
            return simplifyDamage(returnString + damage_bonus_string + damageAdd);
        }

    }

    isHeavyWeapon(
        profileIndex: number | null = null,
    ): boolean {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let heavyWeapon = this.profiles[profileIndex].heavy_weapon;
        let notes = this.profiles[profileIndex].notes;

        if( heavyWeapon ) {
            return true;
        }

        if( this.scifiMod ) {
            for( let mod of scifi2014WeaponMods ) {
                if( this.scifiMod == mod.tag && mod.notes.indexOf("HW") > -1 ) {
                    return true;
                }
            }
        }

        if(
            notes
            &&
            (
            notes.toLowerCase().trim().indexOf("hw") > -1
                ||
            notes.toLowerCase().trim().indexOf("heavy") > -1
                ||
            notes.toLowerCase().trim().indexOf("m.d.c") > -1
                ||
            notes.toLowerCase().trim().indexOf("mdc") > -1
            )
        ) {
            return true;
        }

        return false;
    }

    getShortStats(
        withNotes: boolean = false,
        profileIndex: number | null = null,
    ): string {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let returnString = "";

        let rof = this.profiles[profileIndex].rof;
        let reach = this.profiles[profileIndex].reach;

        if( this.getRange() ) {
            returnString += "Range " + this.getRange() + ", ";
        }

        returnString += "Damage " + this.getDamage() + ", ";

        // returnString += "XXX: " + (this.dontStepUnarmedDamage ? "NOSTEP" : "STEP") + ", "

        if( rof ) {
            returnString += "ROF " + rof.toString() + ", ";
        }

        if( this.getAP() ) {
            returnString += "AP " + this.getAP().toString() + ", ";
        }

        let tempToHitModifier = this.getToHitModifier()
        if( tempToHitModifier ) {
            if( tempToHitModifier > 0 ) {
                returnString += "+" + tempToHitModifier.toString() + " to Hit, ";
            } else {
                returnString += tempToHitModifier.toString() + " to Hit, ";
            }
        }

        if( this.isHeavyWeapon() ) {
            if( this._char ) {
                returnString += this._char.getHeavyWeaponLabel() + ", ";
            } else {
                returnString += "HW, ";
            }

        }

        if( this.getReach() ) {
            returnString += "Reach " + reach.toString() + ", ";
        }

        if( this.isShield ) {
            returnString += "Shield ,";
        }

        if( this.getParryModifier() != 0 ) {
            if( this.getParryModifier() > 0 ) {
                returnString += "+" + this.getParryModifier().toString() + " Parry, ";
            } else {
                returnString += this.getParryModifier().toString() + " Parry, ";
            }
        }

        if( withNotes ) {
            returnString += ", " + this.getNotes();
        }

        if( returnString.length > 0 ) {
            returnString = returnString.substring(0, returnString.length - 2);
        }

        return returnString;
    }

    getProfiles(): IWeaponProfile[] {
        let rv: IWeaponProfile[] = [];

        let count = 0;
        for( let item of JSON.parse(JSON.stringify(this.profiles)) ) {
            rv.push( item );
            rv[count].notes = this.getNotes(count);
            rv[count].damage = this.getDamage(false, count);
            rv[count].damageWithBrackets = this.getDamage(true, count);
            rv[count].range = this.getRange(count);
            rv[count].ap = this.getAP(count);
            rv[count].shots = this.getShots(count);
            rv[count].rof = this.getROF(count);
            rv[count].reach = this.getReach(count);
            rv[count].toHitMod = this.getToHitModifier(count);

            rv[count].skillName = this.getSkillName( count );
            rv[count].skillValue = this.getSkillValue( count );

            count++;
        }

        return rv;
    }

    getROF(
        profileIndex: number | null = null,
    ): number {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        if( this.profiles[profileIndex].rof === 0 ) {
            return 0;
        }

        return this.profiles[profileIndex].rof;    }

    getReach(
        profileIndex: number | null = null,
    ): number {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        if( this.profiles[profileIndex].reach === 0 ) {
            return 0;
        }

        return this.profiles[profileIndex].reach;
    }

    getShots(
        profileIndex: number | null = null,
    ): number {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( this.profiles[profileIndex].shots === 0 ) {
            return 0;
        }

        return this.profiles[profileIndex].shots;
    }

    getParryModifier(
        profileIndex: number | null = null,
    ): number {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let parryModifier = this.profiles[profileIndex].parry_modifier;

        for( let enh of this.gear_enhancements ) {
            parryModifier += enh.weapon_parry;
        }

        return (parryModifier + this.tempParryModifier);
    }

    getToHitModifier(
        profileIndex: number | null = null,
    ): number {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let toHitMod = this.profiles[profileIndex].toHitMod;

        for( let enh of this.gear_enhancements ) {
            toHitMod += enh.weapon_accuracy;
        }
        return (toHitMod + this.tempToHitModifier);
    }

    getNotes(
        profileIndex: number | null = null,
    ): string {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let baseNotes = this.profiles[profileIndex].notes;

        if( this.isHeavyWeapon(profileIndex) ) {
            if( this._char ) {

                baseNotes = this._char.getHeavyArmorLabel() + ", " + baseNotes;
            } else {
                baseNotes = "HW, " + baseNotes;
            }

        }

        if( this.getReach(profileIndex) ) {
            baseNotes = "Reach " + this.getReach(profileIndex).toString() + ", " + baseNotes;
        }

        if( this.getParryModifier(profileIndex) != 0 ) {
            if( this.getParryModifier(profileIndex) > 0 ) {
                baseNotes = "+" + this.getParryModifier().toString() + " Parry, " + baseNotes;
            } else {
                baseNotes = this.getParryModifier().toString() + " Parry, " + baseNotes;
            }
        }

        // remove last comma if exists...
        if( baseNotes.substring(baseNotes.length - 2, baseNotes.length) == ", " ) {
            baseNotes = baseNotes.substring(0, baseNotes.length - 2);
        }

        let toHitModifier = this.getToHitModifier( profileIndex )
        if(toHitModifier  != 0 ) {
            if( toHitModifier > 0 ) {
                baseNotes = "+" + (toHitModifier ).toString() + " to Hit, " + baseNotes;
            } else {
                baseNotes = ( toHitModifier ).toString() + " to Hit, " + baseNotes;
            }
        }

        if( this.getRequiresTwoHands(profileIndex) ) {
            if( baseNotes.trim() ) {
                baseNotes += ", Two Hands"
            } else {
                baseNotes = "Two Hands"
            }
        }

        return baseNotes.trim();
    }

    getBuyCost(): number {
        return this.buyCost;
    }

    getTotalWeight(): number {
        let baseWeight = this.weight * this.quantity;

        let weight_multiplier = 1;
        for( let enh of this.gear_enhancements ) {
            if( this.isShield )
                weight_multiplier = enh.shield_weight_multiplier;
            else
                weight_multiplier = enh.armor_weight_multiplier;
        }

        if( this.vehicleMods > 0 ) {
            baseWeight = 0;
            for( let double = 0; double < this.vehicleMods -1; double++)
                baseWeight = baseWeight * 2;
        }
        if( this.scifiMod ) {

            for( let mod of scifi2014WeaponMods ) {
                if( this.scifiMod == mod.tag ) {
                    baseWeight += mod.weight;
                }
            }

            return baseWeight * weight_multiplier;
        } else {
            return baseWeight * weight_multiplier;
        }

    }

    getTotalWeightHR(): string {

        return (this.getTotalWeight()).toLocaleString();

    }

    getTotalCombatWeight(): number {

        return this.getTotalWeight();
    }

    getWeightHR(): string {
        return  this.getTotalWeight().toLocaleString();
    }

    getTotalBuyCost() {
        if(!this.quantity)
            this.quantity = 1;
        if(!this.buyCost)
            this.buyCost = 0;
        return this.buyCost * this.quantity;
    }

    getTotalCostHR(): string {
        return this.getCostHR();
    }

    getCostHR(): string {
        if( this._char && this._char.setting ) {
            if( this.getCost() != this.buyCost ) {
                return FormatMoney(this.buyCost, this._char.setting);
            } else {
                return FormatMoney(this.getCost() * this.quantity, this._char.setting);
            }
        } else {
            if( this.getCost() != this.buyCost ) {
                return FormatMoney(this.buyCost, null);
            } else {
                return FormatMoney(this.getCost() * this.quantity, null);
            }
        }

    }

    reset() {
        super.reset();
        this.profiles = [];
        this.profiles.push( getBaseWeaponStat() );

        this.isInnate = false;
        this.buyCost = 0;
        this.abilities = [];
        this.equippedPrimary = false;
        this.equippedSecondary = false;
        this.quantity =  1;
        this.scifiMod = "";
        this.twEffects = "";
        this.twCost = 0;
        this.type = "";
        this._apIsPsionicSkillValue = false;
        this._apIsSize = false;
        this.summary = "";
        this.vehicleMods = 0;
        this.active = true;
        this.cost = 0;
        this.minimumStrength = "";
        this.activeProfile = 0;
    }

    // DEPRECATED_importFromCustomWeapon( importItem: ICustomWeaponExport ) {
    //     this.effects = [];
    //     this.is_custom = true;
    //     this.quantity = +importItem.quantity;
    //     this.summary = importItem.summary;
    //     this.cost = +importItem.cost;
    //     this.buyCost = +importItem.cost;
    //     this.equippedPrimary = importItem.equipped_primary ? true : false;
    //     this.equippedSecondary = importItem.equipped_secondary ? true : false;
    //     this.name = importItem.name;

    //     this.quantity = +importItem.count_current;

    //     this.summary = importItem.summary;

    //     this.weight = +importItem.weight;

    //     if(!this.quantity) {
    //         this.quantity = 1;
    //     }
    //     if(!this.weight) {
    //         this.weight = 0;
    //     }
    //     if(!this.cost) {
    //         this.cost = 0;
    //     }
    //     if(!this.buyCost) {
    //         this.buyCost = 0;
    //     }
    // }

    isCyberWare(): boolean {
        if( this._char ) {
            for( let ware of this._char.getCyberwarePurchased() ) {
                if(
                    ware.selectedMeleeWeaponUUID == this.uuid
                    ||
                    ware.selectedRangedWeaponUUID == this.uuid
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    public calcReset() {
        super.calcReset();
        this.tempToHitModifier = 0;
        this.tempParryModifier = 0;
    }

    public exportHTML(
        hideImage: boolean = false,
        profileIndex: number | null = null,
    ): string {
        if( profileIndex === null )
            profileIndex = this.activeProfile;

        if( profileIndex > this.profiles.length )
            profileIndex = 0;

        let rof = this.profiles[profileIndex].rof;
        let shots = this.profiles[profileIndex].shots;
        let reach = this.profiles[profileIndex].reach;
        let exportHTML = "";

        if( this.getName() ) {
            exportHTML += "<h1>" + this.getName() + "</h1>\n";
        }

        if( this.getCost() ) {
            exportHTML += "<strong>Cost:</strong> " + FormatMoney(this.getCost(), null);
            exportHTML += "<br />";
        }

        if( this.getWeight() ) {
            exportHTML += "<strong>Weight:</strong> " + this.getWeight() + "";
            exportHTML += "<br />";
        }
        if( this.getMinimumStrength() ) {
            exportHTML += "<strong>Minimum Strength:</strong> " + this.getMinimumStrength() + "";
            exportHTML += "<br />";
        }
        if( this.getDamage() ) {
            // let strPlus = "";
            // if( this.profiles[profileIndex].add_strength_to_damage ) {
            //     strPlus = "Str+"
            // }

            exportHTML += "<strong>Damage:</strong> " + this.getDamage() + "";
            exportHTML += "<br />";
        }

        if( this.getAP() ) {
            // let strPlus = "";
            // if( this.profiles[profileIndex].add_strength_to_damage ) {
            //     strPlus = "Str+"
            // }

            exportHTML += "<strong>AP:</strong> " + this.getAP() + "";
            exportHTML += "<br />";
        }

        if( this.getRange().toLowerCase().trim() != "melee" ) {
            exportHTML += "<strong>Range:</strong> " + this.getRange() + "";
            exportHTML += "<br />";

            if( rof ) {
                exportHTML += "<strong>ROF:</strong> " + rof + "";
                exportHTML += "<br />";
            }

            if( shots ) {
                exportHTML += "<strong>Shots:</strong> " + shots + "";
                exportHTML += "<br />";
            }
        }

        if( this.getNotes() ) {
            exportHTML += "<p><strong>Notes:</strong> " + this.getNotes() + "</p>\n";
        }

        if( this.summary ) {
            exportHTML += "<p><strong>Summary:</strong> " + this.summary + "</p>\n";
        }

        if( this.description.length > 0 ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>\n";
        }
        return exportHTML;
    }

    export(): IChargenWeapon {
        let rv = super.export() as IChargenWeapon;

        rv.extra_notes = this.extraNotes;
        rv.tw_cost = this.twCost;
        rv.tw_effects = this.twEffects;
        rv.is_shield = this.isShield;
        rv.minimum_strength = this.minimumStrength;
        rv.vehicle_mods = this.vehicleMods;
        rv.profiles = this.profiles;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    exportOptions(): IWeaponObjectVars {
        let rv = super.exportOptions() as IWeaponObjectVars;

        rv.current_shots = [];
        for(let profile of this.profiles)
            rv.current_shots.push(profile.currentShots);

        rv.equipped_primary = this.equippedPrimary;
        rv.equipped_secondary = this.equippedSecondary;
        rv.active_profile = this.activeProfile;
        rv.buy_cost = this.buyCost;

        rv.gear_enhancements = [];
        for( let item of this.gear_enhancements ) {
            if( item.id == 0 ) {
                rv.gear_enhancements.push({
                    id: 0,
                    def: item.export(),
                    setting_item: false,
                });
            } else {
                rv.gear_enhancements.push({
                    id: item.id,
                    def: null,
                    setting_item: false,
                });
            }
        }

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    setActiveProfile( profileIndex: number ) {
        if( this.profiles.length > profileIndex ) {
            this.activeProfile = profileIndex;
        }

    }

    importOptions( iVars: IWeaponObjectVars | null ) {
        super.importOptions( iVars as IWeaponObjectVars );

        if( iVars ) {
            for( let index in this.profiles ) {
                typeof( iVars.current_shots ) != "undefined" && typeof( iVars.current_shots[+index] ) != "undefined" ? this.profiles[+index].currentShots = iVars.current_shots[+index] : this.profiles[+index].currentShots = this.profiles[+index].shots;
            }
            typeof( iVars.buy_cost ) != "undefined" ? this.buyCost = iVars.buy_cost : null;
            typeof( iVars.equipped_primary ) != "undefined" ? this.equippedPrimary = iVars.equipped_primary : null;
            typeof( iVars.equipped_secondary ) != "undefined" ? this.equippedSecondary = iVars.equipped_secondary : null;
            typeof( iVars.active_profile ) != "undefined" ? this.setActiveProfile( iVars.active_profile) : null;
        }
    }

    getGenericExportWeapon(withBookData: boolean = false): IExportWeapon {

        let damageDie: IDieDamageExport|null = null ;
        if( this._char  ) {
            damageDie = ParseDamageString(
                this.profiles[0].damage,
                this._char.getAttributeCurrentHR("strength"),
                this._char.getAttributeCurrentHR("smarts"),
                this._char.getAttributeCurrentHR("spirit"),
            );
        }

        for( let profileIndex in this.profiles ) {
            if( this._char  ) {
                let profDamage = ParseDamageString(
                    this.getDamage( false, +profileIndex),
                    this._char.getAttributeCurrentHR("strength"),
                    this._char.getAttributeCurrentHR("smarts"),
                    this._char.getAttributeCurrentHR("spirit"),
                );
                this.profiles[profileIndex].damageDiceBase = profDamage.dice;
                this.profiles[profileIndex].damageDiceBasePlus = profDamage.bonuses;
            }
        }

        let equippedAs = ""

        if( this.equippedPrimary ) {
            equippedAs = "primary";
            if( this.getRequiresTwoHands() ) {
                equippedAs = "two-hands";
            }
        }

        if( this.equippedSecondary ) {
            equippedAs = "secondary";
            if( this.getRequiresTwoHands() ) {
                equippedAs = "two-hands";
            }
        }

        let rv: IExportWeapon = {
            id: this.id,
            uuid: this.uuid,
            name: this.getName(),
            weight: this.getTotalWeight() / this.quantity,
            range: this.getRange(),
            damage: this.getDamage(),
            equippedAs: equippedAs,
            descriptionHTML: this.getDescriptionHTML(),
            damageWithBrackets: this.getDamage(true),
            rof: this.profiles[0].rof,
            shots: this.profiles[0].shots,
            ap: this.getAP(),
            bookName: this.getBookName(),
            bookPublisher: this.getBookPublisher(),
            bookPublished: this.getBookPublished(),
            notes: this.getNotes(),
            takenFrom: this.getBookPage(),
            thrown: this.profiles[0].thrown_weapon,
            quantity: this.quantity,
            reach: this.profiles[0].reach,
            innate: this.isInnate,
            damageDiceBase: damageDie ? damageDie.dice : "",
            damageDiceBasePlus: damageDie ? damageDie.bonuses : 0,
            equipped: ( this.equippedPrimary || this.equippedSecondary ),
            cost: this.cost / this.quantity,
            costBuy: this.buyCost /this.quantity,
            minStr: this.minimumStrength,
            profiles: this.getProfiles(),
            bookID: this.book_id,
            activeProfile: this.activeProfile,
        }

        if( withBookData ) {
            rv.bookCore = this.book_obj.core;
            rv.bookPrimary = this.book_obj.primary;
            rv.bookName = this.book_obj.name;
        }

        return rv;
    }

}

export interface IWeaponObjectVars extends IGearObjectVars {
    current_shots: number[];
    equipped_primary: boolean;
    equipped_secondary: boolean;
    active_profile: number;
}
