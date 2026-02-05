import { ValidityLevel } from "../../enums/ValidityLevel";
import { getRankName, replaceAll, rSplit } from "../../utils/CommonFunctions";
import { getDieIndexFromLabel, getDieValueFromLabel } from "../../utils/Dice";
import { generateUUID } from "../../utils/generateUUID";
import { ParseEffectChoices } from "../../utils/ParseEffectChoices";
import { split_by_max_two } from "../../utils/split_by_max_two";
import { EParentType } from "../_base_object";
import { Edge } from "./edge";
import { PlayerCharacter } from "./player_character";
import { PlayerCharacterRace } from "./player_character_race";
import { IChargenPowers } from "./power";

export interface IModLineExport {
    action: string;
    target: string;
    value: string;
}

export interface ICharModParseResult {
    good: boolean;
    message: string;
    modline: string;
}

interface ICharMod {
    action: string;
    target: string;
    value: string | number;
    rawLine: string;
}

export class CharMod {

    action: string = "";
    target: string = "";
    value: string = "";
    importedRawLine: string = "";
    addedFrom: string = "Modline";
    callingEdge: Edge | null = null;
    specifyOverride: string | null = "";
    specifyValueOverride: string | null = "";
    applyImmediately: boolean = false;

    constructor( importMod: IModLineExport | null = null ) {
        if( importMod ) {
            this.importDef( importMod );
        }
    }

    importDef( importMod: IModLineExport ) {
        this.action = importMod.action;
        this.target = importMod.target;
        this.value = importMod.value;
    }

    importModLine( modline: string ) {
        let parsed = this._normalizeModline(modline);
        this.importedRawLine = modline;
        if( parsed ) {
            this.action = parsed.action;
            this.target = parsed.target;
            this.value = parsed.value.toString();
        }
    }

    apply( charObj: PlayerCharacter | null = null ) {

        if( charObj ) {
            if(  this.action.toLowerCase().trim() == "[pace]") {
                this.action = charObj._basePace.toString();
            }

            if(  this.value.toString().toLowerCase().trim() == "[pace]") {
                this.value = charObj._basePace.toString();
            }

            if(  this.action.toLowerCase().trim() == "[size]") {
                this.action = charObj.getSize().toString();
            }
            if(  this.value.toLowerCase().trim() == "[size]") {
                this.value = charObj.getSize().toString();
            }
        }

        /*
        Potentially unused from last version....

    // "use_extra_perks": {
    //     name: "Perk Points",
    //     example: ["use_extra_perks"],
    //     description: "This is almost always used with Perk Points Boost Target below."
    // },

    // "cyber_mule": {
    //     name: "Adds Cyber Mule Edge effects",
    //     example: ["cyber_mule" ],
    //     description: "Adds the effects of the Cyber Mule edge from the Science Fiction Companion."
    // },

    // "set_attribute_points": {
    //     name: "Set Attribute Points",
    //     example: ["set_attribute_points:3", "set_attribute_points:4" ],
    //     description: "Sets the attribute points"
    // },

    // "noraise": {
    //     name: "Attribute No Raise",
    //     example: ["noraise:strength", "noraise:smarts" ],
    //     description: "Limits the ability for a character to raise an attribute after character creation."
    // },

        */

        switch( this.action ) {
                /* # DOC
                    tag: "zero_new_power",
                    name: "Zero New Powers",
                    aliases: ["zero_newpower"],
                    example: ["zero_new_power"],
                    description: "Adds no power, but will trigger an extra power if there's a new_powers_edge_bonus of 1 or more.",

                */
                case "zero_new_power":
                case "zeronewpower":
                case "zero_newpower": {

                    return this._makeReturnResult(
                        "Adds no power, but will trigger an extra power if there's a new_powers_edge_bonus of 1 or more.",
                        this.importedRawLine
                    );
                    // break;
                }
            /* # DOC
                tag: "new_powers",
                name: "New Powers",
                aliases: ["newpower"],
                example: ["new_power:Bolt", "new_power:Psionics;Mind Wipe", "new_power:Miracles;Healing" ],
                description: "Adds the effects of adding a power to an Arcane Background. You can specify the power by placing the AB name before the power name separated by a semicolon",

            */
            case "new_powers":
            case "newpowers": {

                return this._makeReturnResult(
                    "Adds Powers to Arcane Background as the New Powers edge",
                    this.importedRawLine
                );
                // break;
            }

           /* # DOC
                tag: "new_power",
                name: "New Power",
                aliases: ["newpower"],
                example: ["new_power:Bolt", "new_power:Psionics;Mind Wipe", "new_power:Miracles;Healing" ],
                description: "Adds the effects of adding a power to an Arcane Background. You can specify the power by placing the AB name before the power name separated by a semicolon",

            */
                case "new_power":
                    case "newpower": {

                        return this._makeReturnResult(
                            "Adds a Power to Arcane Background",
                            this.importedRawLine
                        );
                        // break;
                    }

            /* # DOC

            */
            case "choose_item": {
                // break;
                return this._makeReturnResult(
                    "Just a simple choice which has no effects",
                    this.importedRawLine
                );
            }

            /* # DOC TODO
        tag: "enable_supers":
        name: "Enable Supers",
        example: ["enable_supers" ],
        description: "Enables the Super Power Companion, and sets the character as a Super"
            */
            case "enable_supers": {
                // break;
                if( charObj ) {
                    charObj.setting.activateBook(4, true);
                    charObj.setting.activateSetting("spcpowers")
                }
                return this._makeReturnResult(
                    "Enables the Super Power Companion, and sets the character as a Super",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_rising_stars":
        name: "Set Rising Stars",
        example: ["set_rising_stars" ],
        description: "Enables the Super Power Companion, and sets the character as a Super"
            */
            case "set_rising_stars": {
                // break;
                if( charObj ) {
                    charObj.setting.activateBook(4, true);
                    charObj.setting.activateSetting("spcpowers")
                    charObj.setting.activateRisingStars();
                    charObj.isSuper = true;
                }
                return this._makeReturnResult(
                    "Enables the Super Power Companion, and sets the character as a Super",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "rifts_cyber_armor":
        name: "Rifts Cyber Armor",
        example: ["rifts_cyber_armor" ],
        aliases: ["riftscyberarmor"]
        description: "Sets the Cyberware type to Rifts style strain and inner workings"
            */
            case "rifts_cyber_armor":
            case "riftscyberarmor": {

                return this._makeReturnResult(
                    "Rifts Cyber Armor - handled in Cyberware class",
                    this.importedRawLine
                );
            }

                        /* # DOC
        tag: "arcane_armor":
        name: "Arcane Armor",
        example: ["arcane_armor" ],
        aliases: ["arcanearmor"]
        description: "Arcane Armor effect for Pathfinder"
            */
        case "arcane_armor":
            case "arcanearmor": {
                if( charObj ) {
                    charObj._derivedBaseBoosts.pathfinder_armor_interference_mod += 1;
                }

                return this._makeReturnResult(
                    "Arcane Armor effect for Pathfinder",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "double_pace":
        name: "Double Pace",
        example: ["double_pace" ],
        aliases: ["doublepace"]
        description: "Doubles Calculated Pace"
            */
            case "double_pace":
            case "doublepace": {
                if( charObj ) {
                    if( 2 > charObj._derivedBaseBoosts.pace_multiplier ) {
                        charObj._derivedBaseBoosts.pace_multiplier = 2;
                    }
                }

                return this._makeReturnResult(
                    "Doubles Calculated Pace",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_street_fighters":
        name: "Set Street Fighters",
        example: ["set_street_fighters" ],
        description: "Enables the Super Power Companion, and sets the character as a Super"
            */
            case "set_street_fighters": {
                // break;
                if( charObj ) {
                    charObj.setting.activateBook(4, true);
                    charObj.setting.activateSetting("spcpowers")
                    charObj.setting.setSelectedPowerLevel("street-fighters")
                    charObj.isSuper = true;
                }
                return this._makeReturnResult(
                    "Enables the Super Power Companion, and sets the character as a Super",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "quick_to_level_headed":
        name: "Quick to Level Headed",
        example: ["quick_to_level_headed" ],
        description: "Gives Quick Edge, and Level head if already has Quick Edge"
            */
            case "quick_to_level_headed": {
                if( charObj ) {
                    charObj._add_quick_or_level_headed++;
                }
                return this._makeReturnResult(
                    "Adds Quick or Level Headed Edge",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "consoleLog":
        name: "consoleLog",
        example: ["consoleLog"] ,
        aliases: ["console_log" ]
        description: "Logs this effects this.value and this.target - calls console.log( this.value, this.target) - good for testing"
            */
            case "consoleLog": {
                if( charObj ) {
                    console.log( this.value, this.target)
                }
                return this._makeReturnResult(
                    "Outputs data to console",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "no_cyberware":
        name: "No Cyberware",
        example: ["prohibit_cyberware" , "no_cyberware"],
        aliases: ["nocyberware", "prohibitcyberware", "bancyberware", "prohibit_cyberware", "ban_cyberware" ]
        description: "Prohibits Cyberware"
            */
            case "nocyberware":
            case "prohibitcyberware":
            case "bancyberware":
            case "no_cyberware":
            case "prohibit_cyberware":
            case "ban_cyberware": {
                if( charObj ) {
                    charObj._CyberneticsProhibited = true;
                }
                return this._makeReturnResult(
                    "Prohibits Cyberware",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_power_rank":
        name: "Set Power Rank",
        example: ["set_power_rank: Zombie 1"],
        description: "Sets the Power Rank when installed. Powers may still read as n/a on selection"
            */
            case "set_power_rank": {
                if( charObj ) {
                    charObj.setPowerRank(this.target, +this.value);
                }

                return this._makeReturnResult(
                    "Setting Power " + this.target + " rank to " + getRankName( +this.value ),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "cyber_strain_arcane":
        name: "Cyberware Strain to Arcane Skill",
        example: ["cyber_strain_arcane" ],
        description: "-1 to Arcane skill for each strain of Cyberware"
            */
            case "cyber_strain_arcane": {
                if( charObj ) {
                    charObj._CyberneticsArcaneStrainModifier = true;
                }
                return this._makeReturnResult(
                    "-1 to Arcane skill for each strain of Cyberware",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "troubadour_leadership":
        name: "Troubadour Leadership",
        example: ["troubadour_leadership" ],
        description: "Allows for the Performance Skill to count as Battle for leadership edges"
            */
        case "troubadour_leadership": {
            if( charObj ) {
                charObj._skillRequirementAliases.push( ["Battle", "Performance"] );
            }
            return this._makeReturnResult(
                "Allows for the Performance Skill to count as Battle for leadership edges",
                this.importedRawLine
            );
        }

            /* # DOC
        tag: "cyber_strain_psionics":
        name: "Cyberware Strain to Psionics",
        example: ["cyber_strain_psionics" ],
        description: "-1 to Psionics skill for each strain of Cyberware"
            */
            case "cyber_strain_psionics": {
                if( charObj ) {
                    charObj._CyberneticsPsionicsStrainModifier = true;
                }
                return this._makeReturnResult(
                    "-1 to Psionics skill for each strain of Cyberware",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "cyber_strain_magic":
        name: "Cyberware Strain to Magic/Spellcasting",
        example: ["cyber_strain_magic" ],
        aliases: ["cyber_strain_spellcasting"]
        description: "-1 to Spellcasting skill for each strain of Cyberware"
            */
            case "cyber_strain_magic":
            case "cyber_strain_spellcasting": {
                if( charObj ) {
                    charObj._CyberneticsMagicStrainModifier = true;
                }
                return this._makeReturnResult(
                    "-1 to Spellcasting skill for each strain of Cyberware",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "cyber_strain_miracles":
        name: "Cyberware Strain to Miracles/Faith",
        example: ["cyber_strain_miracles" ],
        aliases: ["cyber_strain_faith"]
        description: "-1 to Faith skill for each strain of Cyberware"
            */
            case "cyber_strain_miracles":
            case "cyber_strain_faith": {
                if( charObj ) {
                    charObj._CyberneticsMiraclesStrainModifier = true;
                }
                return this._makeReturnResult(
                    "-1 to Faith skill for each strain of Cyberware",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "upgrade_channeling":
        name: "Channeling Upgrade",
        example: ["upgrade_channeling" ],
        aliases: ["channeling_upgrade"]
        description: "Upgrades Channeling Edge"
            */
            case "upgrade_channeling":
            case "channeling_upgrade": {
                if( charObj ) {
                    charObj._upgrade_channeling++;
                }
                return this._makeReturnResult(
                    "Upgrades Martial Artist Edge",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "upgrade_rapid_recharge":
        name: "Rapid Recharge Upgrade",
        example: ["upgrade_rapid_recharge" ],
        aliases: ["rapid_recharge_upgrade"]
        description: "Upgrades Rapid Recharge Edge"
            */
            case "upgrade_rapid_recharge":
            case "rapid_recharge_upgrade": {
                if( charObj ) {
                    charObj._upgrade_rapid_recharge++;
                }
                return this._makeReturnResult(
                    "Upgrades Rapid Recharge Edge",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "martial_artist_upgrade":
        name: "Martial Artist Upgrade",
        example: ["martial_artist_upgrade" ],
        description: "Upgrades Martial Artist Edge"
            */
            case "martial_artist_upgrade": {
                if( charObj ) {
                    charObj._upgrade_martial_arts++;
                }
                return this._makeReturnResult(
                    "Upgrades Martial Artist Edge",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "dirty_fighter_upgrade":
        name: "Dirty Fighter Upgrade",
        example: ["dirty_fighter_upgrade" ],
        description: "Upgrades Dirty Fighter Edge"
            */
            case "dirty_fighter_upgrade": {
                if( charObj ) {
                    charObj._upgrade_dirty_fighter++;
                }
                return this._makeReturnResult(
                    "Upgrades Dirty Fighter Edge",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "upgrade_luck":
        name: "Luck Upgrade",
        example: ["upgrade_luck" ],
        description: "Upgrades Luck Edge"
            */
            case "upgrade_luck":
            case "luck_upgrade": {
                if( charObj ) {
                    charObj._upgrade_luck++;
                }
                return this._makeReturnResult(
                    "Upgrades Luck Edge",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "upgrade_attractive":
        name: "Attractive Upgrade",
        example: ["upgrade_attractive" ],
        description: "Upgrades Attractive Edge"
            */
        case "upgrade_attractive":
            case "attractive_upgrade": {
                if( charObj ) {
                    charObj._upgrade_attractive++;
                }
                return this._makeReturnResult(
                    "Upgrades Attractive Edge",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "ignore_two_hand":
        name: "Ignore Two Handed Weapons",
        example: ["ignore_two_hand" ],
        aliases: ["ignore_two_hand_melee", "no_two_hand_melee"]
        description: "Sets the no ignore two hands for melee flag"
            */
            case "ignore_two_hand":
            case "ignore_two_hand_melee":
            case "no_two_hand_melee": {
                if( charObj ) {
                    charObj._ignoreTwoHandsMelee = true;
                }
                return this._makeReturnResult(
                    "Sets the no ignore two hands for melee flag",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "no_power_limits":
        name: "No Power Limits",
        example: ["no_power_limits" ],
        description: "Sets the no power limits for Arcane Backgrounds flag"
            */
            case "no_power_limits": {
                if( charObj ) {
                    charObj._noPowerLimits = true;
                }
                return this._makeReturnResult(
                    "Sets the no power limits for Arcane Backgrounds flag",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "full_conversion_borg":
        name: "Full Conversion Borg",
        example: ["full_conversion_borg" ],
        description: "Removes all strain before Edges are calculated"
            */
            case "full_conversion_borg":
            {
                if( charObj ) {
                    charObj._fullConversionBorg = true;
                }
                return this._makeReturnResult(
                    "Removes all strain before Edges are calculated",
                    this.importedRawLine
                );
                // break;
            }

            /* # DOC
        tag: "cant_swim":
        name: "Can't Swim",
        aliases:  ["cantswim" ],
        example: ["cant_swim" ],
        description: "Sets note that the race cannot swim"
            */
            case "cantswim":
            case "cant_swim": {
                if( charObj ) {
                    charObj._cannotSwim = true;
                    charObj.addSpecialAbility(
                        "Can't Swim",
                        "You cannot swim!",
                        "",
                        "",
                        0,
                    );
                }
                return this._makeReturnResult(
                    "Setting Cannot Swim Flag",
                    this.importedRawLine
                );
                // break;
            }

            /* # DOC
        tag: "aquatic":
        name: "Aquatic",
        example: ["aquatic" ],
        description: "Sets the Swimming pace to be equal to pace (instead of half pace)"
            */
            case "aquatic": {
                if( charObj ) {
                    charObj._is_aquatic = true

                }
                return this._makeReturnResult(
                    "Setting Swimming Pace to Aquatic",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "psi_blade_as_claws"
                name: "Psi Blade Unarmed Attack Bonuses",
                example: ["psi_blade_as_claws" ],
                description: "Allow stepping of damage for Psi-Blade through Martial Arts, Brawling, etc"
            */
            case "psi_blade_as_claws": {
                if( charObj ) {
                    for( let weapon of charObj._innateAttacks ) {
                        if( weapon && weapon.name.toLowerCase().trim().indexOf("psi-") > -1)
                            weapon.dontStepUnarmedDamage = false;
                    }
                }
                return this._makeReturnResult(
                    "Allow stepping of damage for Psi-Blade",
                    this.importedRawLine
                );
                // break;
            }

            /* # DOC
                tag: "step_unarmed_damage"
                name: "Step Unarmed Damage",
                aliases: ["stepunarmeddamage"]
                example: ["step_unarmed_damage" ],
                description: "Raises damage die of natural attacks by one die type. Take multiple times on different lines if one more die type is needed."
            */
            case "step_unarmed_damage":
            case "stepunarmeddamage": {
                if( charObj ) {
                    // if( this.callingEdge )
                    //     console.log("XX step_unarmed_damage", this.callingEdge.name )
                    charObj.stepUnarmedDamage();
                }
                return this._makeReturnResult(
                    "Stepping Unarmed Damage",
                    this.importedRawLine
                );
                // break;
            }

            /* # DOC
                tag: "prompt_specify":
                name: "Prompt Specify",
                example: ["prompt_specify:favored_enemy;Favored Enemy", "specify_prompt:favorite_color;Favorite Color;My Favorite Color;Blue,Green,Red," ],
                description: "Adds a prompt to be saved and listed in the Abilities section. This currently works only for Edges. Make sure to keep the Ability label unique, otherwise it'll overwrite the ability entry. You can have many prompts per Edge."
            */
                case "prompt_specify":
                case "specify_prompt": {

                    let rawLine = this.importedRawLine;

                    // console.log("rawLine", rawLine);

                    if( charObj && this.callingEdge ) {

                        rawLine = rawLine.replace("prompt_specify:", "");
                        rawLine = rawLine.replace("specify_prompt:", "");
                        let effect_split = rawLine.split(";");
                        if( effect_split.length > 1 ) {
                            let summary = "";
                            if( effect_split.length > 2 ) {
                                summary = effect_split[2]
                            }
                            let label = effect_split[1];
                            let key = effect_split[0];
                            let value = charObj.getPromptSpecifyValue( key )

                            // console.log("value", value);
                            // console.log("key", key);
                            if(!value && !value.trim() ) {
                                value = "(not set)";
                            }
                            let options: string[] = [];
                            if( effect_split.length > 3 ) {
                                options = effect_split[3].split(",")
                            }
                            // console.log("label", label);
                            // console.log("value2", value);
                            if( charObj && label ) {
                                charObj.addSpecialAbility(
                                    label,
                                    value.trim(),
                                    "",
                                    "",
                                    0,
                                )
                            }
                        }
                    }

                    return this._makeReturnResult(
                        "Adding Prompt Specify",
                        this.importedRawLine
                    );
                }

            /* # DOC
                tag: "add_heros_journey_choice":
                name: "Add hero's journey choice",
                example: ["add_heros_journey_choice", "add_heros_journey_roll" ],
                description: "Adds a a hero's journey choice if a framework is selected."
            */
                case "add_heros_journey_roll":
                case "add_heros_journey_choice": {
                    let specifyValue = "";
                    if( this.importedRawLine.indexOf(":") > 0) {
                        specifyValue = this.importedRawLine.replace("arcane_background:", "");
                    }

                    if( charObj && charObj.currentFramework ) {
                        charObj.currentFramework.addAdditionalHJChoice();
                    }

                    return this._makeReturnResult(
                        "Adding hero's journey choice",
                        this.importedRawLine
                    );
                }

            /* # DOC
                tag: "step_unarmed_to_hit"
                name: "Step Unarmed Damage",
                aliases: ["step_unarmed_tohit", "step_unarmed_tohit"]
                example: ["step_unarmed_to_hit" ],
                description: "Raises to hit bonus of natural attacks affected by step_unarmed_damage by one "
            */
            case "step_unarmed_to_hit":
            case "step_unarmed_tohit":
            case "stepunarmedtohit": {
                if( charObj ) {
                    // if( this.callingEdge )
                    //     console.log("XX step_unarmed_damage", this.callingEdge.name )
                    charObj.stepUnarmedToHit();
                }
                return this._makeReturnResult(
                    "Stepping Unarmed Damage",
                    this.importedRawLine
                );
                // break;
            }

            /* # DOC
                tag: "rifts_needs_power_armor_jock":
                name: "Requires Power Armor Jock Edge",
                example: ["rifts_needs_power_armor_jock"],
                description: "Used in the effects field of Power Armor, this will give a -2 agility and warning if the characer doesn't have the \"Power Armor Jock\" edge"
            */
            case "rifts_needs_power_armor_jock": {
                if( charObj ) {
                    if( !charObj.hasEdge("Power Armor Jock")) {
                        charObj.addValidationMessage(
                            ValidityLevel.Warning,
                            "Your equipped power armor requires the edge Power Armor Jock to be efficient",
                            ""
                        );
                        charObj._traitBonuses.agility += -2;
                    }
                }
                return this._makeReturnResult(
                    "This item requires the edge Power Armor Jock to be efficient",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "set_to_custom_race":
                name: "Set to Custom Race",
                example: ["set_to_custom_race", "set_to_custom_race:Strange Race" ],
                description: "Sets the race to a custom race specified if not already set as a custom Race."
            */
            case "set_to_custom_race": {
                let raceName = this.importedRawLine.replace("set_to_custom_race:", "");
                raceName = raceName.replace("set_to_custom_race", "").trim();

                if( charObj ) {

                    if( !charObj.race.is_custom ) {
                        charObj.race = new PlayerCharacterRace( null, charObj );
                        charObj.race.is_custom = true;
                        if( raceName ) {
                            charObj.race.name = raceName;
                            charObj.race.readOnlyName = true;
                        }
                    } else {
                        if( raceName ) {
                            charObj.race.name = raceName;
                            charObj.race.readOnlyName = true;
                        }
                    }
                }

                if( !raceName ) {
                    raceName = "(unspecified)"
                }

                return this._makeReturnResult(
                    "Sets the race to a custom race named '" + raceName + "' if not already set as a custom Race.",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "append_to_custom_race":
                name: "Appends Text to Custom Race Name",
                example: ["append_to_custom_race:(Intelligent Construct)", "append_to_custom_race:(Robot)" ],
                description: "Appends the text to a custom race specified if not already set as a custom Race."
            */
                case "append_to_custom_race": {
                    let raceName = this.importedRawLine.replace("append_to_custom_race:", "");
                    raceName = raceName.replace("append_to_custom_race", "").trim();

                    if( charObj ) {
                        charObj.race.appendToName = raceName;

                    }

                    if( !raceName ) {
                        raceName = "(unspecified)"
                    }

                    return this._makeReturnResult(
                        "Sets the race to a custom race named '" + raceName + "' if not already set as a custom Race.",
                        this.importedRawLine
                    );
                }

            /* # DOC
                tag: "turn_off_race_select":
                name: "Turns off Race Select",
                example: ["turn_off_race_select" ],
                description: "Sets the character race to custom and turns off race select."
            */
           case "turn_off_race_select": {
            if( charObj ) {

                charObj.deny_race_select = true;
                if( !charObj.race.is_custom ) {
                    charObj.race = new PlayerCharacterRace( null, charObj );
                    charObj.race.is_custom = true;
                    if( this.value ) {
                        charObj.race.name = this.value;
                    }
                }
            }

            return this._makeReturnResult(
                "Sets the race to a custom race and denies ability to switch to normal race.",
                this.importedRawLine
            );
        }

            /* # DOC
                tag: "arcane_background":
                name: "Arcane Background",
                example: ["arcane_background", "arcane_background:Miracles" ],
                description: "Adds a slot of Arcane Backgrounds. You can specify the arcane background after a colon."
            */
            case "arcane_background": {
                let specifyValue = "";
                if( this.importedRawLine.indexOf(":") > 0) {
                    specifyValue = this.importedRawLine.replace("arcane_background:", "");
                }

                if( charObj ) {

                    if( charObj.hasArcaneBackground(specifyValue) == false ) {

                        if( specifyValue ) {

                            let abName = "";
                            let abPoints = -1;
                            let abPowers = -1;
                            let abSkillName = "";
                            let abSkillAttribute = "";
                            let abBookID = 0;
                            let abBookPage = "";
                            let abPowerPointsName = "Power Points";

                            if( specifyValue.toString().indexOf(";") > -1 ) {
                                let split = specifyValue.toString().split(";");
                                abName = split[0].trim();

                                if( split[1]) {
                                    abPowers = +split[1].trim();
                                }

                                if( split[2]) {
                                    abPoints = +split[2].trim();
                                }

                                if( split[3]) {
                                    abSkillName = split[3].trim();
                                }

                                if( split[4]) {
                                    abSkillAttribute = split[4].toLowerCase().trim();
                                }
                                if( split[5]) {
                                    abPowerPointsName = split[5].toLowerCase().trim();
                                }
                                if( split[6]) {
                                    abBookID = +split[6].toLowerCase().trim();
                                }
                                if( split[7]) {
                                    abBookPage = split[7].toLowerCase().trim();
                                }

                            } else {
                                abName = specifyValue.toString();
                            }

                            if( abPowerPointsName.indexOf(".") > 0 ) {
                                abPowerPointsName = abPowerPointsName.toUpperCase();
                            }

                            let abUUID: string | null = "";
                            if( abPowers > -1 ) {
                                // console.log("addCustomArcaneBackground arcane_background modline", abName, abPowers);

                                abUUID = charObj.addCustomArcaneBackground(
                                    abName,
                                    abPowers,
                                    abPoints,
                                    abSkillName,
                                    abSkillAttribute,
                                    abPowerPointsName,
                                    abBookID,
                                    abBookPage,
                                    true,
                                );
                            } else {
                                // console.log("addArcaneBackgroundByName arcane_background modline", abName);

                                abUUID = charObj.addArcaneBackgroundByName(
                                    abName,
                                    true // unchangeable
                                );
                            }

                            if( abUUID && this.callingEdge ) {
                                // this.callingEdge.addedArcaneBackground = true;
                            }

                        } else {
                            console.warn("unspecified arcane_background modline");

                            charObj._numberOfArcaneBackgrounds++;
                        }
                        // console.log("_numberOfArcaneBackgrounds", charObj._numberOfArcaneBackgrounds)
                    }
                }
                return this._makeReturnResult(
                    "Adding arcane background: " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "rifts_blaster"
                name: "Adds BLASTER effects (Rifts)",
                example: ["rifts_blaster"  ],
                description: "Adds BLASTER effects (Rifts)"
            */
            case "rifts_blaster": {
                let powerText = "BLASTER (+2): When using at least one Mega Power Modifier in conjunction with the blast, bolt, burst, or damage field powers increase the damage dice from d6 to d8. Armor Piercing grants an extra +1 AP.";
                if(charObj ) {
                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            for( let power of ab.addedPowers ) {

                                if(
                                    power.name.toLowerCase() == "blast"
                                        ||
                                    power.name.toLowerCase() == "bolt"
                                        ||
                                    power.name.toLowerCase() == "burst"
                                        ||
                                    power.name.toLowerCase() == "damage field"
                                ) {
                                    power.bonusMegaPowerOptions.push(
                                        powerText
                                    )
                                }
                            }

                            for( let power of ab.selectedPowers ) {
                                if(
                                    power.name.toLowerCase().trim() == "blast"
                                        ||
                                    power.name.toLowerCase().trim() == "bolt"
                                        ||
                                    power.name.toLowerCase().trim() == "burst"
                                        ||
                                    power.name.toLowerCase().trim() == "damage field"
                                ) {
                                    power.bonusMegaPowerOptions.push(
                                        powerText
                                    )
                                }
                            }
                        }
                    }

                    if( charObj.currentFramework && charObj.currentFramework.countsAsNamed("burster" ) ) {
                        charObj.addSpecialAbility(
                            "Innate Power Bolt Blaster Edge Effects",
                            powerText,
                            "",
                            "",
                            0,
                        )
                    }
                }

                return this._makeReturnResult(
                    "Adds Rifts® Blaster Mega Power Modifier for Edge to appropriate Powers",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "rifts_expert_blaster"
                name: "Adds EXPERT BLASTER effects (Rifts)",
                example: ["rifts_expert_blaster"  ],
                description: "Adds EXPERT BLASTER effects (Rifts)"
            */
            case "rifts_expert_blaster": {
                let powerText = "EXPERT BLASTER (+3): When using at least one Mega Power Modifier in conjunction with the blast, bolt, burst, or damage field powers increase the damage dice from d6 to d10. Armor Piercing grants an extra +2 AP.";
                if(charObj ) {
                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            for( let power of ab.addedPowers ) {
                                if(
                                    power.name.toLowerCase() == "blast"
                                        ||
                                    power.name.toLowerCase() == "bolt"
                                        ||
                                    power.name.toLowerCase() == "burst"
                                        ||
                                    power.name.toLowerCase() == "damage field"
                                ) {
                                    power.bonusMegaPowerOptions.push(
                                        powerText
                                    )
                                }
                            }

                            for( let power of ab.selectedPowers ) {
                                if(
                                    power.name.toLowerCase() == "blast"
                                        ||
                                    power.name.toLowerCase() == "bolt"
                                        ||
                                    power.name.toLowerCase() == "burst"
                                        ||
                                    power.name.toLowerCase() == "damage field"
                                ) {
                                    power.bonusMegaPowerOptions.push(
                                        powerText
                                    )
                                }
                            }
                        }
                    }

                    if( charObj.currentFramework && charObj.currentFramework.countsAsNamed("burster" ) ) {
                        charObj.addSpecialAbility(
                            "Innate Power Bolt Expert Blaster Edge Effects",
                            powerText,
                            "",
                            "",
                            0,

                        )
                    }
                }

                return this._makeReturnResult(
                    "Adds Rifts® Expert Blaster Mega Power Modifier for Edge to appropriate Powers",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "rifts_master_psionic_powers"
                name: "Adds Master Psionic Power Availabilities (Rifts)",
                example: ["rifts_master_psionic_powers"  ],
                description: "Adds Master Psionic Power Availabilities - Elemental Manipulation and Mind Reading (Rifts)"
            */
            case "rifts_master_psionic_powers": {
                if(charObj ) {
                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab && ab.isNamed("psionics")) {
                            let hasElementalManipulation = false;
                            let hasMindLink = false;
                            let hasMinReading = false;
                            for( let power of ab.allowedPowers ) {
                                if( power.toLowerCase().trim() == "mind link")
                                    hasMindLink = true;
                                if( power.toLowerCase().trim() == "mind reading")
                                    hasMinReading = true;
                                if( power.toLowerCase().trim() == "elemental manipulation")
                                    hasMindLink = true;
                            }

                            if(!hasElementalManipulation) {
                                // console.log("rifts_master_psionic_powers", "elemental manipulation not found in allowed list - adding")
                                ab.allowedPowers.push( "elemental manipulation" )
                            }
                            if( hasMindLink && !hasMinReading ) {
                                // console.log("rifts_master_psionic_powers", "mind link found but mind reading not found in allowed list - adding")
                                ab.allowedPowers.push( "mind reading" )
                            }
                        }
                    }
                }

                return this._makeReturnResult(
                    "Adds Master Psionic Power Availabilities (Rifts)",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "rifts_master_blaster"
                name: "Adds MASTER BLASTER effects (Rifts)",
                example: ["rifts_master_blaster"  ],
                description: "Adds MASTER BLASTER effects (Rifts)"
            */
            case "rifts_master_blaster": {
                let powerText = "MASTER BLASTER (+4): When using at least one Mega Power Modifier in conjunction with the blast, bolt, burst, or damage field powers increase the damage dice from d6 to d12. Armor Piercing grants an extra +3 AP.";
                if(charObj ) {
                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            for( let power of ab.addedPowers ) {
                                if(
                                    power.name.toLowerCase() == "blast"
                                        ||
                                    power.name.toLowerCase() == "bolt"
                                        ||
                                    power.name.toLowerCase() == "burst"
                                        ||
                                    power.name.toLowerCase() == "damage field"
                                ) {
                                    power.bonusMegaPowerOptions.push(
                                        powerText
                                    )
                                }
                            }

                            for( let power of ab.selectedPowers ) {
                                if(
                                    power.name.toLowerCase() == "blast"
                                        ||
                                    power.name.toLowerCase() == "bolt"
                                        ||
                                    power.name.toLowerCase() == "burst"
                                        ||
                                    power.name.toLowerCase() == "damage field"
                                ) {
                                    power.bonusMegaPowerOptions.push(
                                        powerText
                                    )
                                }
                            }
                        }
                    }

                    if( charObj.currentFramework && charObj.currentFramework.countsAsNamed("burster" ) ) {
                        charObj.addSpecialAbility(
                            "Innate Power Bolt Master Blaster Edge Effects",
                            powerText,
                            "Rifts®: TLPG",
                            "p77",
                            81,
                        )
                    }
                }

                return this._makeReturnResult(
                    "Adds Rifts® Master Blaster Mega Power Modifier for Edge to appropriate Powers",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "racial_psionics"
                name: "Racial Psionics",
                example: ["racial_psionics:2", "racial_psionics:-1", "racial_psionics:0", "racial_psionics"  ],
                description: "Add Psionics as an Arcane Background. If a framework provides Psionics, it will increment the AB's starting powers by the amount specified. Inherent Powers should be added via add_powers. You might also need to increment_starting_powers:Psionics;-1 here and there too. "
            */
            case "racial_psionic":
            case "racial_psionics":
            case "race_psionic":
            case "race_psionics": {
                let incrementStartingPowers = 0;

                let args = "";
                if( this.importedRawLine.indexOf(":") > -1 ) {
                    let split = split_by_max_two( this.importedRawLine, ":");
                    args = split[1];
                }

                let split = args.split(";");
                if( split.length > 0 && split[0])
                    incrementStartingPowers = +split[0];

                if( charObj ) {
                    if( charObj.hasArcaneBackground("psionics") ) {
                        for( let ab of charObj._selectedArcaneBackgrounds ) {
                            if( ab && ab.name.toLowerCase().trim() == "psionics" ) {

                                // ab.incrementStartingPowers( incrementStartingPowers );
                                // ab.startingPowerCount += incrementStartingPowers;
                                ab.incrementStartingPowers( incrementStartingPowers );
                                // ab._baseStartingPowerCount += incrementStartingPowers;
                                if( ab._baseStartingPowerCount < 0 ) {
                                    ab._baseStartingPowerCount = 0;
                                }
                                if( ab.startingPowerCount < 0 ) {
                                    ab.startingPowerCount = 0;
                                }
                            }
                        }
                    } else {

                        charObj.addArcaneBackgroundByName("Psionics", true);
                    }
                }

                return this._makeReturnResult(
                    "Handler for racial Psionics",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "one_with_magic"
                name: "One With Magic (Rifts)",
                example: ["one_with_magic"  ],
                description: "Adds the effects of One With Magic depending on how many times this modline takes affect"
            */
            case "one_with_magic": {
                if( charObj && this.callingEdge ) {
                    charObj._oneWithMagicRank++;

                    switch( charObj._oneWithMagicRank ) {
                       case 1: {
                            // first time
                            this.callingEdge.nameAppend = " (Novice)";
                            this.callingEdge.summary = `Gain detect/conceal arcana as an Innate Ability; may sense supernatural beings within line of sight with a Notice check. Conceal arcana even works while sleeping, it only stops working if forcibly Incapacitated. Those who already have this power gain a +2 on all rolls related to its use.`;
                            charObj.addPowerByName(
                                "Detect/Conceal Arcana",
                                "Magic",
                                false,
                                true,
                                ""
                            );
                            break;
                        }
                       case 2: {
                            // second time
                            this.callingEdge.nameAppend = " (Seasoned)";
                            this.callingEdge.summary = `Gains the Ley Line Rejuvenation and Ley Line Sense abilities of a Ley Line Walker. Ley Line Walkers instead gain a +2 bonus on rolls related to either ability.`;
                            charObj.addSpecialAbility(
                                "One With Magic - Ley Line Sense",
                                "Can sense a ley line within 10 miles, and he can automatically tell how powerful it is, in what directions it flows, where it meets other ley lines at nexus points, and other aspects as might apply (such as if a huge amount of its energy is being siphoned for some other purpose). He can also sense any nearby Rifts within 10 miles, as well as the arcane tremors created by the eruption of new or recurring Rifts within 50 miles.",
                                "Rifts®: A&M",
                                "p33",
                                91,
                            );
                            charObj.addSpecialAbility(
                                "One With Magic - Ley Line Rejuvenation",
                                "While on a ley line, gains a natural healing roll once per day.",
                                "Rifts®: A&M",
                                "p33",
                                91,
                            );
                            break;
                        }
                       case 3: {
                            // third time
                            this.callingEdge.nameAppend = " (Veteran)";
                            this.callingEdge.summary = `The character begins aging only one year for every five, and may make a natural healing roll once per day (instead of every five days), even when not on a ley line. On a ley line, the caster gains a natural healing roll once per hour and may recover permanent injuries—see Regeneration in Savage Worlds`;
                            break;
                        }
                        default: {
                            // fourth time
                            this.callingEdge.nameAppend = " (Heroic)";
                            this.callingEdge.summary = `Choose one power to use as an Innate Ability, requiring no PPE (additional Power Modifiers cost the normal amount). The power does not work if the caster is unconscious, asleep, or otherwise Incapacitated. Only powers with a Duration longer than instant may be selected.`;
                            break;
                        }
                       case 5: {
                            // fifth time
                            this.callingEdge.nameAppend = " (Legendary)";
                            this.callingEdge.summary = `The caster’s body transforms, infused with arcane energies granting +4 MDC natural Armor (stacks with both worn MDC body armor and the protection power). The character is considered a creature of magic.`;
                            charObj.naturalArmorIsHeavy = true;
                            charObj._derivedBaseBoosts.heavy_armor += 4;
                            break;
                        }
                    }
                }

                return this._makeReturnResult(
                    "Adding effects per rank of One With Magic",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "add_five_power_points_per_rank"
                name: "Adds 5 Power Power Points every rank",
                example: ["add_five_power_points_per_rank:Magic", "add_power_points_per_rank" ],
                description: "Adds five Power Power Points every rank... you can specify arcane background as well, see examples "
            */
            case "add_five_power_points_per_rank": {

                let abName: string = "";
                let workLine = this.importedRawLine.replace("add_five_power_points_per_rank:", "").trim();

                if( workLine.trim() ) {
                    abName = workLine.trim().toLowerCase();
                } else {
                    abName = "(first)";
                }

                if( charObj ) {
                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {

                            if(
                                ab.name.toLowerCase().trim() == abName
                                    ||
                                abName == "(first)"
                            ) {

                                ab.addedPowerPoints += ( charObj.getCurrentRank() + 1) * 5;
                                break;
                            }
                        }
                    }
                }

                return this._makeReturnResult(
                    "Adds five power points to " + abName + " arcane background per character rank",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "add_power_points_per_rank"
                name: "Adds Power Power Points every rank",
                example: ["add_power_points_per_rank:Magic;2", "add_power_points_per_rank:5", "add_power_points_per_rank:Psionics;4"  ],
                description: "Adds Specified Power Power Points every rank... you can specify arcane background as well, see examples "
            */
            case "add_power_points_per_rank": {

                let abName: string = "";
                let workLine = this.importedRawLine.replace("add_power_points_per_rank:", "").trim();
                let powerPoints = 0;

                if( workLine.indexOf(";")) {
                    let split = workLine.split(";");
                    abName = split[0];
                    powerPoints = +split[0];
                } else {
                    abName = "(first)";
                    powerPoints = +workLine;
                }

                if( charObj ) {
                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {

                            if(
                                ab.name.toLowerCase().trim() == abName
                                    ||
                                abName == "(first)"
                            ) {

                                ab.addedPowerPoints += ( charObj.getCurrentRank() + 1) * powerPoints;
                                break;
                            }
                        }
                    }
                }

                return this._makeReturnResult(
                    "Adds five power points to " + abName + " arcane background per character rank",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "set_power_pp"
                name: "Set/Override Power Power Points",
                example: ["set_power_pp:Bolt 0", "set_power_pp:Magic;Healing;0", "set_power_pp:Burst;4"  ],
                description: "Set/Override selected Power's Power Points... you can specify arcane background as well, see examples "
            */
            case "set_power_pp": {
                let abName: string = "";
                let powerName: string = "";
                let workLine = this.importedRawLine.replace("set_power_pp:", "").trim();
                let newPP = 0;

                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")

                    if( split.length > 2 ) {
                        abName = split[0].trim();
                        powerName = split[1].trim();
                        if( split.length > 2 )
                            newPP = +split[2].trim();
                    } else {
                        powerName = split[1].trim();
                        if( split.length > 1 )
                            newPP = +split[2].trim();
                    }

                } else {
                    powerName = this.target;
                    newPP = +this.value
                    abName = "";
                }

                if( charObj ) {
                    if( powerName) {
                        charObj.setPowerPowerPoints(
                            powerName,
                            abName,
                            newPP,
                        );
                    }
                }
                return this._makeReturnResult(
                    "Setting Power points of " + powerName  + "' of '" + abName  + "' to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "add_power"
                name: "Adds a Power",
                example: ["add_power:Bolt", "add_power:Magic;Healing;self", "add_power:Psionics;Elemental Manipulation;;innate"  ],
                description: "Adds a power. If you want just a single aspect of the power, just use that aspect, such as Darkness or Light or Boost Trait or Lower Trait. When using the more complex form the format is: add_power:(AB Name);(Power Name);(Any Range Limitation);(innate) "
            */
            case "add_power": {
                let abName: string = "";
                let powerName: string = "";
                let workLine = this.importedRawLine.replace("add_power:", "").trim();
                let rangeLimitation: string = "";
                let innate = false;

                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")
                    abName = split[0].trim();
                    powerName = split[1].trim();
                    if( split.length > 2 )
                        rangeLimitation = split[2].trim();
                    if( split.length > 3 ) {
                        if( split[3].trim() == "innate" )
                            innate = true;
                    }
                } else {
                    powerName = workLine
                    abName = "";
                }

                if( charObj ) {
                    if( powerName) {
                        charObj.addPowerByName(
                            powerName,
                            abName,
                            false,
                            innate,
                            rangeLimitation,
                            true,
                        );
                    }
                }
                return this._makeReturnResult(
                    "Adding power '" + powerName  + "' to '" + abName  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "choose_power"
                name: "Chooses (Selects) a Power",
                aliases: [ "select_power"]
                example: ["choose_power:Bolt", "choose_power:Magic;Healing;self", "choose_power:Psionics;Elemental Manipulation;;innate"  ],
                description: "Chooses a power, using a starting power slot. When using the more complex form the format is: add_power:(AB Name);(Power Name);(Any Range Limitation);(innate) "
            */
            case "choose_power":
            case "select_power": {
            let abName: string = "";
            let powerName: string = "";
            let workLine = this.importedRawLine.replace("choose_power:", "").trim();
            workLine = workLine.replace("select_power:", "").trim();
            let rangeLimitation: string = "";
            let innate = false;

            if( workLine.toString().indexOf(";") > -1 ) {
                let split =  workLine.split(";")
                abName = split[0].trim();
                powerName = split[1].trim();
                if( split.length > 2 )
                    rangeLimitation = split[2].trim();
                if( split.length > 3 ) {
                    if( split[3].trim() == "innate" )
                        innate = true;
                }
            } else {
                powerName = workLine
                abName = "";
            }

            if( charObj ) {
                if( powerName) {
                    charObj.selectPowerByName(
                        powerName,
                        abName,
                        false,
                        innate,
                        rangeLimitation,
                        true,
                    );
                }
            }
            return this._makeReturnResult(
                "Selecting power '" + powerName  + "' for '" + abName  + "'",
                this.importedRawLine
            );
        }

            /* # DOC TODO

            */
            case "mega_power": {
                let abName: string = "";
                let powerName: string = "";
                let workLine = this.importedRawLine.replace("mega_power:", "").trim();
                let rangeLimitation: string = "";
                let innate = false;

                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")
                    abName = split[0].trim();
                    powerName = split[1].trim();
                    if( split.length > 2 )
                        rangeLimitation = split[2].trim();
                    if( split.length > 3 ) {
                        if( split[3].trim() == "innate" )
                            innate = true;
                    }
                } else {
                    powerName = workLine
                    abName = "";
                }

                if( charObj ) {
                    if( powerName) {
                        charObj.setMegaPower(
                            powerName,
                            abName,
                        );
                    }
                }
                return this._makeReturnResult(
                    "Adding power '" + powerName  + "' to '" + abName  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "clear_power_list"
                name: "Completely clears an AB's Power List",
                example: [ "clear_power_list;Magic", "clear_power_list;Psionics" ],
                description: "Clears the power list for the specified AB Name."
            */
            case "clear_power_list": {

                let abName = this.importedRawLine.replace("clear_power_list:", "").trim();

                if( charObj ) {
                    charObj.setPowerList( [], abName );
                }
                if( abName ) {
                    return this._makeReturnResult(
                        "Clearing allowed powers on AB '" + abName  + "'",
                        this.importedRawLine
                    );
                } else {
                    return this._makeReturnResult(
                        "Clearing allowed powers needs a specified AB name clear_power_list:Magic'",
                        this.importedRawLine,
                        false,
                    );
                }

            }

            /* # DOC
                tag: "set_power_points_name"
                name: "Set AB Power Points Name",
                example: [ "set_power_points_name;Magic;PPE", "set_starting_power_count;Mana Points" ],
                description: "Sets the Starting Power Points Name for a possibly specified AB Name."
            */
            case "set_power_points_name": {

                let abName: string = "";
                let powerList: string = "";

                let workLine = this.importedRawLine.replace("set_power_list:", "").trim();
                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")
                    abName = split[0].trim();
                    powerList = split[1].trim();
                } else {
                    powerList = workLine
                    abName = "";
                }

                if( charObj ) {
                    if( powerList) {
                        charObj.setPowerPointsName( powerList, abName );
                    }
                }
                return this._makeReturnResult(
                    "Setting Power Points Name to '" + powerList  + "' on AB '" + abName  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "set_starting_power_count"
                name: "Set AB Power List",
                example: [ "set_starting_power_count;Magic;3", "set_starting_power_count;2" ],
                description: "Sets the Starting Power Count a possibly specified AB Name."
            */
            case "set_starting_power_count":
            case "set_ab_starting_powers": {

            let abName: string = "";
            let numberPowers: number = 0;

            let workLine = this.importedRawLine.replace("set_starting_power_count:", "").trim();
            if( workLine.toString().indexOf(";") > -1 ) {
                let split =  workLine.split(";")
                abName = split[0].trim();
                numberPowers = +split[1].trim();
            } else {
                numberPowers = +workLine
                abName = "";
            }

            if( charObj ) {
                charObj.setStartingPowerCount( numberPowers, abName );
            }
            return this._makeReturnResult(
                "Setting Starting Power Count to '" + numberPowers.toString()  + "' on AB '" + abName  + "'",
                this.importedRawLine
            );
        }

            /* # DOC
                tag: "set_power_list"
                name: "Set AB Power List",
                example: [ "set_power_list;Magic;Bolt,Blast", "set_power_list;Puppet,Farsight" ],
                description: "Sets the Allowed Power List a possibly specified AB Name."
            */
            case "set_power_list": {

                let abName: string = "";
                let powerList: string = "";

                let workLine = this.importedRawLine.replace("set_power_list:", "").trim();
                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")
                    abName = split[0].trim();
                    powerList = split[1].trim();
                } else {
                    powerList = workLine
                    abName = "";
                }

                if( charObj ) {
                    if( powerList) {
                        charObj.setPowerList( powerList.split(","), abName );
                    }
                }
                return this._makeReturnResult(
                    "Setting allowed powers to '" + powerList  + "' on AB '" + abName  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "append_power_list"
                name: "Set AB Power List",
                example: [ "append_power_list;Magic;Bolt,Blast", "append_power_list;Puppet,Farsight" ],
                description: "Appends the Allowed Power List a possibly specified AB Name."
            */
            case "append_power_list": {

                let abName: string = "";
                let powerList: string = "";

                let workLine = this.importedRawLine.replace("append_power_list:", "").trim();
                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")
                    abName = split[0].trim();
                    powerList = split[1].trim();
                } else {
                    powerList = workLine
                    abName = "";
                }

                if( charObj ) {
                    if( powerList) {
                        charObj.appendPowerList( powerList.split(","), abName );
                    }
                }
                return this._makeReturnResult(
                    "Setting allowed powers to '" + powerList  + "' on AB '" + abName  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "increment_starting_powers"
                name: "Increment Starting Powers",
                example: [ "increment_starting_powers;Magic;2", "increment_starting_powers;1" ],
                description: "Adds the specified number to the starting powers of a possibly specified AB Name."
            */
            case "increment_starting_powers": {
                let abName: string = "";
                let incrementValue: number = 1;

                let workLine = this.importedRawLine.replace("increment_starting_powers:", "").trim();
                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")
                    abName = split[0].toLowerCase().trim();
                    incrementValue = +split[1].trim();
                } else {
                    incrementValue = +workLine
                    abName = "";
                }

                // console.log("increment_starting_powers", incrementValue)
                if( charObj ) {
                    if( abName ) {
                        for( let ab of charObj._selectedArcaneBackgrounds) {
                            if( ab && ab.name.toLowerCase().trim() == abName ) {

                                ab.incrementStartingPowers( incrementValue );
                                if( ab.startingPowerCount < 0 ) {
                                    ab.setStartingPowerCount( 0 );
                                }
                            }
                        }
                    } else {
                        abName = "First AB"
                        if( charObj._selectedArcaneBackgrounds[0] ) {
                            charObj._selectedArcaneBackgrounds[0].incrementStartingPowers (incrementValue) ;
                        }
                    }
                }
                return this._makeReturnResult(
                    "Incrementing Startings Powers of " + abName  + "' by " + incrementValue.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "add_custom_power": {

                let abName: string = "";
                let powerName: string = "";
                let powerPoints: string = "";
                let powerDuration: string = "";
                let powerRange: string = "";

                let workLine = this.importedRawLine.replace("add_custom_power:", "").trim();
                if( workLine.toString().indexOf(";") > -1 ) {
                    let split =  workLine.split(";")
                    powerName = split[0];

                    if( split[1] ) {
                        powerPoints = split[1].trim();
                    }
                    if( split[2] ) {
                        powerRange = split[2].trim();
                    }
                    if( split[3] ) {
                        powerDuration = split[3].trim();
                    }

                    if( split[4] ) {
                        abName = split[4].trim();
                    }
                } else {
                    powerName = workLine
                    abName = "";
                }

                let abFoundIndex = 0;
                if( abName && charObj ) {
                    abFoundIndex = -1;
                    for( let abIndex in charObj._selectedArcaneBackgrounds ) {

                        if(
                            charObj._selectedArcaneBackgrounds[abIndex]
                            //@ts-ignore
                            && charObj._selectedArcaneBackgrounds[abIndex].name
                            //@ts-ignore
                            && charObj._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == abName.toLowerCase()
                        ) {
                            abFoundIndex = +abIndex;
                        }

                    }
                }

                let customPowerDef: IChargenPowers = {
                    uuid: generateUUID(),
                    deleted: false,
                    no_select: false,
                    version_of: 0,
                    damage: "",
                    setting_item: false,
                    parent_uuid: "",
                    active: true,
                    name: powerName,
                    limitation_personal: "",
                    rank: 0,
                    power_points: powerPoints,
                    power_points_per: "",
                    range: powerRange,
                    duration: powerDuration,
                    trappings: "",
                    additional_effects: [],
                    mega_power_options: [],
                    additional_targets: [],
                    summary: "",
                    settingItem: false,
                    page: "",
                    created_by: 0,
                    created_on: null,
                    updated_by: 0,
                    updated_on: null,
                    deleted_by: 0,
                    deleted_on: null,
                    id: 0,
                    description: [],
                    book_id: 0,
                    limitation_range: "",
                    limitation_aspect: "",
                    innate_power: false,
                    is_custom: true,
                    bookPage: "Custom",
                    read_only: false,
                    updated_by_user: undefined,
                    created_by_user: undefined,
                    deleted_by_user: undefined,
                    name_plural: powerName + "s",
                    type: "power",
                    effects: [],
                    spell_slot_cost: 1,
                    parent_type: EParentType.None,
                    book_page: "",
                    setting_tem: false,
                    image_url: "",
                    image_updated: new Date(),
                    save_id: 0
                }

                if( charObj ) {
                    if( powerName && abFoundIndex > -1) {
                        charObj.addCustomPower(
                            abFoundIndex,
                            customPowerDef,
                            true,
                        );
                    }
                }

                return this._makeReturnResult(
                    "Adding power '" + powerName  + "' to '" + abName  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "artificier"
                name: "Artificer Effects",
                example: ["artificer" ],
                description: "Adds the effects of artificer edge. This sets several tags within the character for Arcane Item creation."
            */
            case "artificer": {
                if( charObj ) {
                    charObj._isArtificer = true;
                }
                return this._makeReturnResult(
                    "Setting artificer flag",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "double_strain"
                name: "Double Strain",
                example: ["double_strain" ],
                description: "Doubles starting Strain after Attribute bonuses are applied"
            */
            case "double_strain":
            case "doublestrain": {
                if( charObj ) {

                    charObj._doubleBaseStrain = true;

                }
                return this._makeReturnResult(
                    "Doubling base strain",
                    this.importedRawLine
                );
            }

            /* # DOC
                tag: "half_strain"
                name: "Half Strain",
                example: ["half_strain" ],
                description: "Halves starting Strain after Attribute bonuses are applied"
            */
                case "half_strain":
                    case "halfstrain": {
                        if( charObj ) {

                            charObj._halfBaseStrain = true;

                        }
                        return this._makeReturnResult(
                            "Doubling base strain",
                            this.importedRawLine
                        );
                    }

            /* # DOC TODO

            */
            case "clearskill":
            case "clear_skill": {
                let skillName = this.importedRawLine.toLowerCase().replace("clearskill:", "").replace("clear_skill:", "").trim();
                if( charObj ) {

                    charObj.clearSkillBoosts(skillName)
                }
                return this._makeReturnResult(
                    "Clearing Skill Boosts on " + skillName,
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_smarts_skill_points"
        name: "Smarts",
        aliases: [ "setsmartsskillpoints" ],
        example: ["set_smarts_skill_points:5", "setsmartsskillpoints:6"],
        description: "Sets the points to a smarts-only skill points pool. See Elderly hindrance"

            */
            case "setsmartsskillpoints":
            case "set_smarts_skill_points": {
                if( charObj ) {
                    charObj._currentSmartsSkillAllocationPoints = +this.value;
                    charObj._maxSmartsSkillAllocationPoints = +this.value;
                }
                return this._makeReturnResult(
                    "Setting " + this.target + " by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "ab_powers_ignores_rank": {

                if( charObj ) {
                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab && ab.name.toLowerCase().trim() == this.value.trim().toLowerCase() ) {
                            ab.ignoresPowerRankRequirements = true;
                        }
                    }
                }

                return this._makeReturnResult(
                    "Setting AB " + this.value + " to ignore rank requirements",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_skill_points":
        name: "Set Skill Points",
        example: ["set_skill_points:8", "set_skill_points:15" ],
        description: "Sets the skill points"

            */
            case "set_skills_point":
            case "set_skills_points":
            case "set_skill_point":
            case "set_skill_points": {
                if( charObj ) {
                    charObj._maxSkillAllocationPoints = +this.value;
                    charObj._currentSkillAllocationPoints = +this.value;
                }
                return this._makeReturnResult(
                    "Setting " + this.target + " by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "set_attributes_point":
            case "set_attributes_points":
            case "set_attribute_point":
            case "set_attribute_points": {
                if( charObj ) {
                    charObj._maxAttributeAllocationPoints = +this.value;
                    charObj._currentAttributeAllocationPoints = +this.value;
                    charObj._maxAttributeModifier = charObj._currentAttributeAllocationPoints + +this.value;
                }
                return this._makeReturnResult(
                    "Setting " + this.target + " to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "flying_pace"
        name: "Flying Pace",
        aliases: ["pacefly", "pace_fly", "fly_pace", "flypace", "paceflying", "pace_flying", "flying_pace", "flyingpace"]
        example: ["+2 flying_pace", "flying_pace -1"],
        description: "Adds a the number to the character's Flying Pace. Use a negative value to subtract."
            */
            case "pacefly":
            case "pace_fly":
            case "fly_pace":
            case "flypace":
            case "paceflying":
            case "pace_flying":
            case "flying_pace":
            case "flyingpace": {
                if( charObj ) {
                    charObj._derivedBaseBoosts.pace_flying += +this.value;

                }
                return this._makeReturnResult(
                    "Setting Flying Pace to " + this.value.toString(),
                    this.importedRawLine
                );
            }

                        /* # DOC
        tag: "set_pace_flying"
        name: "Set Flying Pace",
        aliases: ["set_pace_fly", "setflypace", "setflypace", "setpaceflying", "setflyingpace", "set_flying_pace"]
        example: ["12 flying_pace", "flying_pace 6"],
        description: "Sets the number to the character's Flying Pace."
            */
        case "set_pace_flying":
            case "set_pace_fly":
            case "set_fly_pace":
            case "setflypace":
            case "setpaceflying":
            case "set_flying_pace":
            case "setflyingpace": {
                if( charObj ) {
                    charObj._derivedBaseBoosts.pace_flying += +this.value;

                }
                return this._makeReturnResult(
                    "Setting Flying Pace to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "swim_pace"
        name: "Swimming Pace",
        aliases: ["paceswim", "pace_swim", "swim_pace", "swimpace", "paceswimming", "pace_swimming", "swimming_pace", "swimmingpace"]
        example: ["+2 pace_swimming", "swim_pace -1"],
        description: "Adds a the number to the character's Swimming Pace. Use a negative value to subtract."
            */
            case "paceswim":
            case "pace_swim":
            case "swim_pace":
            case "swimpace":
            case "paceswimming":
            case "pace_swimming":
            case "swimming_pace":
            case "swimmingpace": {
                if( charObj ) {
                    charObj._derivedBaseBoosts.pace_swimming += +this.value;

                }
                return this._makeReturnResult(
                    "Incrementing Swimming Pace by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_swim_pace"
        name: "Swimming Pace",
        aliases: ["set_pace_swim", "setpaceswim", "setpaceswimming", "set_swimming_pace", "set_pace_swimming", "set_swimming_pace", "set_swimmingpace"]
        example: ["set_swim_pace 12", "set_pace_swim 4"],
        description: "Set the number to the character's Swimming Pace. "
            */
        case "setpaceswim":
            case "set_pace_swim":
            case "set_swim_pace":
            case "setswimpace":
            case "setpaceswimming":
            case "set_pace_swimming":
            case "set_swimming_pace":
            case "set_swimmingpace": {
                if( charObj ) {
                    charObj._derivedBaseBoosts.pace_swimming = +this.value;

                }
                return this._makeReturnResult(
                    "Setting Swimming Pace to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "selected_weapon_parry": {
                if( charObj && this.callingEdge && this.callingEdge.specify ) {
                    let theWeapons = charObj.getSelectedWeaponByUUIDOrNames( this.callingEdge.specify );
                    for( let theWeapon of theWeapons) {
                        theWeapon.tempParryModifier += +this.value
                    }

                    for( let innate of charObj._innateAttacks ) {
                        if(
                            innate.name.toLowerCase().trim().indexOf(this.callingEdge.specify.toLowerCase().trim() ) > -1
                        ) {
                            innate.tempParry += +this.value
                        }
                    }

                }
                return this._makeReturnResult(
                    "Boosting Selected Weapon Parry by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "selected_weapon_to_hit": {
                if( charObj && this.callingEdge && this.callingEdge.specify ) {
                    let theWeapons = charObj.getSelectedWeaponByUUIDOrNames( this.callingEdge.specify );
                    for( let theWeapon of theWeapons) {
                        theWeapon.tempToHitModifier += +this.value
                    }
                    for( let innate of charObj._innateAttacks ) {
                        if(
                            innate.name.toLowerCase().trim().indexOf(this.callingEdge.specify.toLowerCase().trim() ) > -1
                        ) {
                            innate.tempToHit += +this.value
                        }
                    }
                }

                return this._makeReturnResult(
                    "Boosting Selected Weapon To Hit by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "starting_funds_multiplier"
        name: "Staring Funds Multiplier",
        example: ["starting_funds_multiplier:5" ],
        description: "Multiplies the starting funds of the character by the number indicated. This is a one time only boost, and if multiple edges multiply the amount, only the largest boost is taken."

            */
            case "starting_funds_multiplier": {
                // console.log("starting_funds_multiplier")
                if( charObj ) {
                    if( +this.value >= 1 ) {
                        // one or more
                        if( +this.value > charObj._derivedBaseBoosts.starting_funds_multiplier ) {
                            charObj._derivedBaseBoosts.starting_funds_multiplier = +this.value ;
                        }
                    } else {
                        // less than one
                        if( +this.value < charObj._derivedBaseBoosts.starting_funds_multiplier ) {
                            charObj._derivedBaseBoosts.starting_funds_multiplier = +this.value ;
                        }
                    }

                }
                return this._makeReturnResult(
                    "Setting Starting Funds Multiplier to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "pace_multiplier": {
                if( charObj ) {
                    if( +this.value > charObj._derivedBaseBoosts.pace_multiplier ) {
                        charObj._derivedBaseBoosts.pace_multiplier = +this.value;
                    }

                }
                return this._makeReturnResult(
                    "Setting Starting Funds Multiplier to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "force_pace_multiplier": {
                if( charObj ) {
                    charObj._derivedBaseBoosts.pace_multiplier = +this.value;
                }
                return this._makeReturnResult(
                    "Setting Starting Funds Multiplier to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
                tag:"natural_weapon"
                name: "Natural Weapons"
                aliases: ["naturalweapon", "naturalweapons", "natural_weapons"]
                example: ["natural_weapon:Claws d6", "natural_weapons:Claws;;Str+d6;2", "natural_weapons:Shooty-Spikes;4/8/18;2d4;0" ]
                description: "Adds a natural weapon to your character such as teeth or claws.<br />This can take several arguments separated by semicolons the current is: name;range;damage;ap;reach;notes"
            */
            case "natural_weapon":
            case "naturalweapon":
            case "naturalweapons":
            case "natural_weapons": {
                if( charObj ) {
                    let theLine = this.importedRawLine.replace("naturalweapon:", "")
                    .replace("natural_weapon:", "")
                    .replace("naturalweapons:", "")
                    .replace("natural_weapons:", "").trim();

                    // console.log("theLine", theLine)
                    if( theLine ) {
                        charObj.addInnateWeapon(theLine);
                    }

                }
                return this._makeReturnResult(
                    "Adding Natural Weapons",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "trait_bonus"
        name: "Trait Bonus",
        example: ["trait_bonus:strength -2", "trait_bonus:smarts 2" ],
        description: "Not to be confused with boosting the die (see below). This adds or subtracts the number from all attribute and skills associated with that attribute rolls and is noted with a -2/+1, etc after the attribute on the character sheet."
            */
            case "trait_bonus":
            case "bonus_trait": {
                if( charObj ) {

                    if( +this.target > 0 ) {
                        charObj.addTraitBonus(
                            this.value.toString(),
                            +this.target,
                            this.addedFrom,
                        );
                    } else {
                        charObj.addTraitBonus(
                            this.target.toString(),
                            +this.value,
                            this.addedFrom,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Trait " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "skill_bonus"
        name: "Skill Bonus",
        example: ["skill_bonus:Driving -2", "skill_bonus:Riding 2", "skill_bonus:Piloting 2" ],
        description: "Not to be confused with boosting the die (see below). This adds or subtracts the number from all skill rolls specified and is noted with a -2/+1, etc after the attribute on the character sheet."

            */
            case "skill_bonus":
            case "skill_roll_mod":
            case "skillrollmod":
            case "bonusskill":
            case "skillbonus": {
                if( charObj ) {

                    if( +this.target > 0 ) {
                        charObj.addSkillBonus(
                            this.value.toString(),
                            +this.target,
                            null,
                            this.addedFrom,
                        );
                    } else {
                        charObj.addSkillBonus(
                            this.target.toString(),
                            +this.value,
                            null,
                            this.addedFrom,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "skill_requirement_alias"
        name: "Skill Requirement Alias",
        example: ["skill_requirement_alias:Driving;Piloting", "skill_requirement_alias:Battle;Performance" ],
        description: "Allows for one skill to count as another skill as far as requirements are concerned. The modline troubador_leadership works like this internally"

            */
        case "skill_requirement_alias": {

                let from = "";
                let to = "";

                let split = this.value.split(";");
                if( split.length > 0 ) {
                    from = split[0].trim();
                }
                if( split.length > 0 ) {
                    to = split[1].trim();
                }

                if( charObj ) {

                    charObj._skillRequirementAliases.push( [from, to] );

                }

                if( from && to ) {
                    return this._makeReturnResult(
                        "Aliasing Skill: " + from + " will count as " + to,
                        this.importedRawLine
                    );
                } else {
                    return this._makeReturnResult(
                        "Skill Requirement Alias usage - skill_requirement_alias:Alias Skill;Target Skill",
                        this.importedRawLine,
                        false,
                    );
                }

            }

            /* # DOC TODO

            */
            case "skill_bonus_max_0":
            case "skill_roll_mod_max_0":
            case "skillrollmod_max_0":
            case "bonusskill_max_0":
            case "skillbonus_max_0": {
                if( charObj ) {

                    if( +this.target > 0 ) {
                        charObj.addSkillBonus(
                            this.value.toString(),
                            +this.target,
                            0,
                            this.addedFrom,
                        );
                    } else {
                        charObj.addSkillBonus(
                            this.target.toString(),
                            +this.value,
                            0,
                            this.addedFrom,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "clear_skill"
        name: "Clear Skill",
        example: ["clear_skill:Stealth", "clear_skill:Notice" ],
        description: "Clears a core skill"

            */
            case "clear_skill": {
                if( charObj ) {

                    charObj.clearSkillBoosts(
                        // Names with Spaces were broken, grab it from raw line
                        this.importedRawLine.replace("clear_skill:", "").toString(),
                    );

                }
                return this._makeReturnResult(
                    "Clearing Skill " + this.target + " Boosts ",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "deny_arcane_background"
        name: "Ban or Deny an Arcane Background",
        example: ["deny_arcane_background:Magic", "ban_arcane_background:Psionics" ],
        description: "Make an Arcane Background show up as not able to be taken"
            */
            case "deny_arcane_background":
            case "denyarcanebackground":
            case "ban_arcane_background":
            case "banarcanebackground": {
                let split = split_by_max_two(this.importedRawLine, ":");
                if( split.length > 1 ) {
                        if( charObj ) {

                        if( split.length > 1 ) {
                            charObj.banAB(
                                // Names with Spaces were broken, grab it from raw line
                                split[1],
                                this.addedFrom,
                            );
                        }

                    }
                    return this._makeReturnResult(
                        "Banning Arcane Background " + split[1] + " ",
                        this.importedRawLine
                    );
                }
            }

            /* # DOC
        tag: "ban_edge"
        name: "Ban or Deny an Edge",
        example: ["ban_edge:Martial Artist", "deny_edge:First Strike" ],
        description: "Make an edge show up as not able to be taken"
            */
            case "ban_edge":
            case "banedge":
            case "deny_edge":
            case "denyedge": {
                let split = split_by_max_two(this.importedRawLine,":");
                if( split.length > 1 ) {
                    if( charObj ) {

                        if( split.length > 1 ) {
                            charObj.banEdge(
                                // Names with Spaces were broken, grab it from raw line
                                split[1],
                                this.addedFrom,
                            );
                        }

                    }
                    return this._makeReturnResult(
                        "Banning Edge " + split[1] + "",
                        this.importedRawLine
                    );
                }
            }

            /* # DOC
        tag: "ban_hindrance"
        name: "Ban or Deny a Hindrance",
        example: ["ban_hindrance:Ruthless", "ban_hind:Mean", "deny_hind:Ugly", "deny_hindrance:Obese" ],
        description: "Make a hindrance show up as not able to be taken"
            */
            case "ban_hind":
            case "banhind":
            case "ban_hindrance":
            case "banhindrance":
            case "deny_hind":
            case "denyhind":
            case "deny_hindrance":
            case "denyhindrance": {
                let split = split_by_max_two(this.importedRawLine, ":");
                if( split.length > 1 ) {
                        if( charObj ) {

                        if( split.length > 1 ) {
                            charObj.banHindrance(
                                // Names with Spaces were broken, grab it from raw line
                                split[1],
                                this.addedFrom,
                            );
                        }

                    }
                    return this._makeReturnResult(
                        "Banning Hindrance " + split[1] + "",
                        this.importedRawLine
                    );
                }
            }

            /* # DOC TODO

            */
            case "throwing_range":
            case "throwingrange":
            case "boost_throwing_range": {
                if( charObj ) {

                    charObj._baseThowingRange = this.target.toString();

                }
                return this._makeReturnResult(
                    "Setting base throwing range to" + this.target.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "switch_skill_attribute"
        name: "Switch Skill Linked Attribute",
        example: ["switch_skill_attribute:Fighting;Strength", "switch_skill_attribute:Boating;Smarts" ],
        description: "Switch a Skill's Base Attribute for limits and raising"
            */
            case "switch_skill_attribute": {
                if( this.target.indexOf(";") > -1 ) {
                    let split =  this.target.split(";")
                    this.target = split[0];
                    this.value = split[1];
                }
                if( this.value.indexOf(";") > -1 ) {
                    let split =  this.value.split(";")
                    this.target = split[0];
                    this.value = split[1];
                }

                if( this.target.indexOf(",") > -1 ) {
                    let split =  this.target.split(",")
                    this.target = split[0];
                    this.value = split[1];
                }
                if( this.value.indexOf(",") > -1 ) {
                    let split =  this.value.split(",")
                    this.target = split[0];
                    this.value = split[1];
                }

                if( charObj ) {

                    charObj.switchSkillAttribute(
                        this.target.toString(),
                        this.value.toString(),
                    );

                }
                return this._makeReturnResult(
                    "Swiching Skill Attribute: '" + this.target.toString() + "' skill to '" + this.value.toString() + "' attribute ",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "switch_skill_attribute_if_higher"
        name: "Switch Skill Linked Attribute if target attribute is higher",
        example: ["switch_skill_attribute_if_higher:Fighting;Strength", "switch_skill_attribute:Boating;Smarts" ],
        description: "Switch a Skill's Base Attribute for limits and raising if the target attriubute is equal or higher"
            */
        case "switch_skill_attribute_if_higher": {
            if( this.target.indexOf(";") > -1 ) {
                let split =  this.target.split(";")
                this.target = split[0];
                this.value = split[1];
            }
            if( this.value.indexOf(";") > -1 ) {
                let split =  this.value.split(";")
                this.target = split[0];
                this.value = split[1];
            }

            if( this.target.indexOf(",") > -1 ) {
                let split =  this.target.split(",")
                this.target = split[0];
                this.value = split[1];
            }
            if( this.value.indexOf(",") > -1 ) {
                let split =  this.value.split(",")
                this.target = split[0];
                this.value = split[1];
            }

            if( charObj ) {

                charObj.switchSkillAttribute(
                    this.target.toString(),
                    this.value.toString(),
                    true,
                );

            }
            return this._makeReturnResult(
                "Swiching Skill Attribute: '" + this.target.toString() + "' skill to '" + this.value.toString() + "' attribute ",
                this.importedRawLine
            );
        }

            /* # DOC TODO

            */
            case "boost_trait":
            case "boosttrait": {
                if( charObj ) {

                    if( !this.target ) {
                        charObj.boostTrait(
                            this.value.toString(),
                            1,
                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.boostTrait(
                            this.target.toString(),
                            +theValue,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Trait " + this.target + " by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "skill_boost":
        name: "Boost Skill",
        example: ["skill_boost:Swimming 2", "skill_boost:Notice 1", "skill_boost:Knowledge (Engineering) 1", "skill_boost:Language (Elven) 2"],
        description: "Raises a skill the number of dice indicated. You can add specifications to the skill by adding the specification in parentheses."
            */
            case "boostskill":
            case "boost_skill":
            case "skill_boost":
            case "skillboost": {

                let target = this.target;
                let value = this.value;

                if( this.importedRawLine.indexOf(";") > -1 && this.importedRawLine.indexOf(":") > -1 ) {
                    let blocksplit = this.importedRawLine.split(":");

                    if( blocksplit.length > 1 ) {
                        if( blocksplit[1].indexOf(";") > 0 ) {
                            let valSplit = blocksplit[1].split(";");
                            target = valSplit[0];
                            value = valSplit[1];
                        }
                     }
                }

                if(
                    target
                    && this.specifyOverride
                    && this.specifyValueOverride
                    && this.specifyOverride.trim()
                    && this.specifyValueOverride.trim()
                    && target.trim().toLowerCase() == "[" + this.specifyOverride +  "]"
                ) {
                    target = this.specifyValueOverride;
                }

                if( charObj ) {

                    if( !target ) {
                        charObj.addSkillBoost(
                            value.toString(),
                            1,
                            true,
                        );
                    } else {
                        if( value.startsWith("d") )  {
                            value = getDieIndexFromLabel(value).toString();
                        }
                        charObj.addSkillBoost(
                            target.toString(),
                            +value,
                            true,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + value + " Bonus by " + target.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "super_skill_boost":
        name: "Boost Skill",
        example: ["super_skill_boost:Swimming 2", "super_skill_boost:Notice 1", "skill_boost:Knowledge (Engineering) 1", "super_skill_boost:Language (Elven) 2"],
        description: "Raises a skill the number of dice indicated. You can add specifications to the skill by adding the specification in parentheses. This is done 'after all calculations' so it's not counted off skill points "
            */
           case "boostskill":
            case "boost_skill":
            case "skill_boost":
            case "skillboost": {

                if( charObj ) {

                    if( !this.target ) {
                        charObj.addSuperSkillBoost(
                            this.value.toString(),
                            1,
                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.addSuperSkillBoost(
                            this.target.toString(),
                            +theValue,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "force_skill":
        name: "Force Skill",
        aliases: ["forceskill"],
        example: ["forceskill:Swimming 2", "force_skill:Notice 1", "force_skill:Knowledge (Engineering) 1", "force_skill:Language (Elven) 2"],
        description: "Force-sets the value a skill to the number of dice indicated. You can add specifications to the skill by adding the specification in parentheses."
            */
            case "force_skill":
            case "forceskill": {

                if( charObj ) {

                    if( !this.target ) {
                        charObj.forceSkillValue(
                            this.value.toString(),
                            1,
                            false,
                            false,
                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.forceSkillValue(
                            this.target.toString(),
                            +theValue,
                            false,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Forcing Skill " + this.target + " Value to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "boost_skill_and_bonus_2":
        name: "Boost Skill, add 2 bonus",
        example: ["boost_skill_and_bonus_2:Swimming 2", "skill_boost_and_bonus_2:Notice 1", "boost_skill_and_bonus_2:Knowledge (Engineering) 1", "boost_skill_and_bonus_2:Language (Elven) 2"],
        description: "Raises a skill the number of dice indicated ands adds a bonus of two to the roll as well. You can add specifications to the skill by adding the specification in parentheses."

            */
            case "boost_skill_and_bonus_2":
            case "skill_boost_and_bonus_2": {

                if( charObj ) {

                    if( !this.target ) {
                        charObj.addSkillBoost(
                            this.value.toString(),
                            1,
                            false,
                        );
                        charObj.addSkillBonus(
                            this.value.toString(),
                            2,
                            null,
                            this.addedFrom,
                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.addSkillBoost(
                            this.target.toString(),
                            +theValue,
                            false,
                        );
                        charObj.addSkillBonus(
                            this.value.toString(),
                            2,
                            null,
                            this.addedFrom,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "superboostskill":
            case "super_boost_skill":
            case "super_skill_boost":
            case "superskillboost": {

                if( charObj ) {

                    if( !this.target ) {
                        charObj.addSuperSkillBoost(
                            this.value.toString(),
                            1,
                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.addSuperSkillBoost(
                            this.target.toString(),
                            +theValue,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_skill":
        name: "Set Skill",
        example: ["set_skill:Swimming 2", "setskill:Notice d6", "set_skill:Knowledge (Engineering) 1", "set_skill:Language (Elven) d8"],
        description: "Raises a skill to the number of dice indicated. if the skill is already as high or higher than the skill is set, it will not lower the skill value. You can add specifications to the skill by adding the specification in parentheses."

            */
            case "setskill":
            case "skill_set":
            case "skillset":
            case "set_skill": {

                if( charObj ) {

                    if( !this.target ) {
                        charObj.setSkillBoost(
                            this.value.toString(),
                            1,
                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.setSkillBoost(
                            this.target.toString(),
                            +theValue,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_skill_and_boost_attribute":
        name: "Set Skill and boost attribute",
        example: ["set_skill_and_boost_attribute:Swimming 2",],
        description: "Raises a skill to the number of dice indicated. It will also boost the skill's associated attribute by one. if the skill is already as high or higher than the skill is set, it will not lower the skill value. You can add specifications to the skill by adding the specification in parentheses."

            */
        case "setskill":
            case "set_skill_and_boost_attribute":
             {

                if( charObj ) {

                    if( !this.target ) {
                        charObj.setSkillBoost(
                            this.value.toString(),
                            1,
                            undefined,
                            undefined,
                            1,
                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.setSkillBoost(
                            this.target.toString(),
                            +theValue,
                            undefined,
                            undefined,
                            1,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "boostskillandmax":
            case "boost_skill_and_max":
            case "skill_boost_and_max":
            case "skillboostandmax": {

                if( charObj ) {

                    if( !this.target ) {
                        charObj.addSkillBoost(
                            this.value.toString(),
                            1,

                        );
                    } else {
                        let theValue = this.value;
                        if( theValue.startsWith("d") )  {
                            theValue = getDieIndexFromLabel(theValue).toString();
                        }
                        charObj.addSkillBoost(
                            this.target.toString(),
                            +theValue,
                        );
                    }

                }
                return this._makeReturnResult(
                    "Boosting Skill " + this.target + " Bonus by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "uses_extra_perks":
            case "usesextraperks": {
                // Legacy, not used in 2.0 (I don't think....)
                if( charObj ) {

                    charObj._perkPointsExtra += +this.value;

                }
                return this._makeReturnResult(
                    "Allowing for " + this.value.toString() + " extra perk points",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "no_select_attribute":
            case "no_attribute_select":
            case "deny_attribute_select": {

                let theTarget = this.target.trim().toLowerCase();
                let theValue = this.value.trim().toLowerCase();

                if( charObj ) {
                    if( theValue )
                        charObj._noSelectAttributes.push( theValue );
                }

                return this._makeReturnResult(
                    "Denying attribute '" + theValue + "'  to select at character creation",
                    this.importedRawLine
                );

            }

            /* # DOC TODO

            */
            case "set_race_name":
            case "setracename": {

                let theTarget = this.target.trim();
                let theValue = this.value.trim();

                if( charObj ) {
                    if( theValue )
                        charObj.raceNameOverride = this.importedRawLine.replace("set_race_name:", "").replace("setracename:", "").trim();
                }

                return this._makeReturnResult(
                    "Setting Race name to '" + theValue + "'",
                    this.importedRawLine
                );

            }

            /* # DOC
                tag: "armor_interference"
                name: "Armor interference",
                example: ["armor_interference:Agility;0;0;-4", "armorinterference:Agility,Performance;0;-4;-4"],
                description: "This is for the Pathfinder Armor Interferences. The first semicolon parameter is a comma separated Skill/and or Attribute which will have the negative; the first number after that is the modifier for light, second is modifier for medium armor, last is for heavy armors"
            */
            case "armor_interference":
                case "armorinterference": {

                    let rawData = this.importedRawLine.replace("armor_interference:", "");
                    rawData = rawData.replace("armorinterference:", "");

                    let splitData = rawData.split(";");

                    if( splitData.length >= 4 ) {

                        let items: string[] = [];
                        if( splitData[0].indexOf(",") > -1 ) {
                            items = splitData[0].split(",");
                        } else {
                            items = [splitData[0]];
                        }
                        let lightMod = 0;
                        let medMod = 0;
                        let heavyMod = 0;

                        if( +splitData[1] != 0 ) {
                            lightMod = +splitData[1];
                        }
                        if( +splitData[2] != 0 ) {
                            medMod = +splitData[2];
                        }
                        if( +splitData[3] != 0 ) {
                            heavyMod = +splitData[3];
                        }

                        if( charObj ) {
                            for( let item of items ) {
                                item = item.toLowerCase().trim();
                                if( item in charObj.pathfinderArmorInterference ) {
                                    if( charObj.pathfinderArmorInterference[ item ].light > lightMod )
                                        charObj.pathfinderArmorInterference[ item ].light = lightMod;
                                    if( charObj.pathfinderArmorInterference[ item ].medium > medMod )
                                        charObj.pathfinderArmorInterference[ item ].medium = medMod;
                                    if( charObj.pathfinderArmorInterference[ item ].heavy > heavyMod )
                                        charObj.pathfinderArmorInterference[ item ].heavy = heavyMod;
                                } else {
                                    charObj.pathfinderArmorInterference[ item ] = {
                                        light: lightMod,
                                        medium: medMod,
                                        heavy: heavyMod,
                                    }
                                }
                            }
                        }

                        return this._makeReturnResult(
                            "Adding Armor Interference for '" + items.join(", ") + "': Light: " + lightMod + " Medium: " + medMod + " Heavy: " + heavyMod,
                            this.importedRawLine,
                            true
                        );
                    } else {
                        return this._makeReturnResult(
                            "This is for the Pathfinder Armor Interferences. The first semicolon parameter is a comma separated Skill/and or Attribute which will have the negative; the first number after that is the modifier for light, second is modifier for medium armor, last is for heavy armors",
                            this.importedRawLine,
                             false
                        );
                    }
                    // let theTarget = this.target.trim();
                    // let theValue = this.value.trim();

                    // if( charObj ) {
                    //     if( theValue )
                    //         charObj.raceNameOverride = this.importedRawLine.replace("set_race_name:", "").replace("setracename:", "").trim();
                    // }

                }

            /* # DOC TODO
            */
            case "add_cyberware":
            case "add_cyber":
            case "addcyberware":
            case "addcyber": {
                let cleanedLine = this.importedRawLine.toString();
                cleanedLine = replaceAll(cleanedLine, "add_cyberware:", "");
                cleanedLine = replaceAll(cleanedLine, "add_cyber:", "");
                cleanedLine = replaceAll(cleanedLine, "addcyberware:", "");
                cleanedLine = replaceAll(cleanedLine, "addcyber:", "");

                let theTarget = cleanedLine;
                let ranks = "1"
                if( cleanedLine.toString().indexOf(";") > -1 ) {
                    let split = cleanedLine.toString().split(";")
                    theTarget = split[0].trim();
                    ranks = split[1].trim();
                }
                if( charObj ) {
                    let foundCyber = false;
                    for( let cyberDef of charObj.getAvailableData().cyberware) {
                        if( cyberDef && cyberDef.name.toLowerCase().trim() == theTarget.toLowerCase().trim() ) {
                            foundCyber = true;
                            charObj.purchaseCyberware(
                                cyberDef.id,
                                cyberDef,
                            );

                        }
                    }
                    if(!foundCyber) {
                        console.warn(  "Couldn't find the cyberware '" + theTarget + "' to install!");
                    }
                }

                return this._makeReturnResult(
                    "Adding Cyberware " + theTarget + " (ranks " + ranks.toString() + ")",
                    this.importedRawLine
                );
            }

    /* # DOC
        tag: "wealth_die"
        name: "Wealth Die",
        example: ["wealth_die:d4", "wealthdie:d8"],
        description: "Sets the initial calculated wealth die suggestion to a die value"
                    */
        case "wealth_die":
            case "wealthdie": {
                let tSplit = split_by_max_two(this.importedRawLine, ":");
                if( tSplit.length > 1 ) {
                    if( charObj ) {
                        charObj.wealthDieInitialCalculation =
                            getDieIndexFromLabel( tSplit[1] )
                        ;
                    }
                    return this._makeReturnResult(
                        "Setting Wealth Die to " + this.value.toString(),
                        this.importedRawLine
                    );
                }
            }
        /* # DOC

        tag: "loadlimitmultiplier"
        name: "Load Limit Multiplier",
        example: ["loadlimitmultiplier: 5" ],
        description: "Sets the Load Limit Multiplier for encumbrance. Especially used by the Brawny edge."

                    */
        case "load_limit_multiplier":
        case "loadlimitmultiplier": {
            if( charObj ) {
                charObj._loadLimitMultiplier += +this.value;
            }
            return this._makeReturnResult(
                "Setting Load Limit Multiplier to " + this.value.toString(),
                this.importedRawLine
            );
        }

            /* # DOC
        tag: "add_edge":
        name: "Add Edge",
        example: ["add_edge:Alertness", "add_edge:Block", "add_edge:The Best there is" ],
        description: "Adds an edge that's not acounted against character's edge count."
            */
            case "edgeadd":
            case "edge_add":
            case "add_edge":
            case "addedge": {
                let tSplit = split_by_max_two(this.importedRawLine, ":");
                let theTarget = this.target;
                let theABSpecify = "";
                let theSpecify = "";
                if( tSplit.length > 1 ) {
                    theTarget = tSplit[1];

                    if( theTarget.indexOf(";") > -1 ) {
                        let split = theTarget.split(";");
                        theTarget = split[0];
                        theSpecify = split[1];
                        if( split.length > 2 ) {
                            theABSpecify = split[2];
                        }
                    }

                    if( charObj ) {

                        charObj.edgeAddByName(
                            theTarget,
                            theSpecify,
                            this.addedFrom,
                            false,
                            theABSpecify,
                            this.applyImmediately,
                            theSpecify,
                        );

                    }

                }
                return this._makeReturnResult(
                    "Adding Edge " + theTarget,
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "add_language":
        name: "Add Language",
        example: ["add_language:French", "add_language:Kobold", "add_language:Crazy Clown" ],
        description: "Adds an non-skilled language to the Language List."
            */
            case "add_language":
            case "language_add":
            {
                let tSplit = split_by_max_two(this.importedRawLine, ":");
                let theTarget = this.target;

                if( tSplit.length > 1 ) {
                    theTarget = tSplit[1].trim();

                    if( charObj ) {

                        charObj.addLanguage(
                            theTarget,
                        );

                    }

                }
                return this._makeReturnResult(
                    "Adding Language " + theTarget,
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "isp_power_point_multiplier":
            case "isppowerpointmultiplier": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            let powerPointName = ab.powerPointsName.toLowerCase();
                            powerPointName = replaceAll(powerPointName, ".", "");

                            if( powerPointName === "isp" ) {
                                ab.powerPointMultiplier = +this.value;
                            }
                        }

                    }

                }
                return this._makeReturnResult(
                    "Multiplying ISP Power Points by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "clear_race_and_set_name":
            case "clear_race": {

                let newRaceName = replaceAll( this.importedRawLine, "clear_race_and_set_name:", "")
                newRaceName = replaceAll( newRaceName, "clear_race:", "").trim().toString();
                if( charObj ) {

                    charObj.race.hideRaceTab = true;
                    charObj.race.noEffects = true;
                    if( newRaceName.trim() ) {
                        charObj.race.nameOverride = newRaceName;
                    }
                }
                return this._makeReturnResult(
                    "Clearing Race and setting name to " + newRaceName,
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "effect_choice":
            {

                let effectsList: string[] = replaceAll( this.importedRawLine, "effect_choice:", "").split("|")

                let effectItems = ParseEffectChoices( effectsList );

                if( charObj ) {
                    // TODO
                }

                return this._makeReturnResult(
                    "Making a drop down for choosing an effect (" + effectItems.length + " choices)",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "bonus_ppe": {
        name: "Bonus PPE",
        aliases: ["bonusppe"],
        example: ["bonus_ppe:4", "bonusppe:5"],
        description: "Adds PPE to an acrane background which is not multiplied by edges or other modifiers "
            */
            case "bonus_ppe":
            case "bonusppe": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            let powerPointName = ab.powerPointsName.toLowerCase();
                            powerPointName = replaceAll(powerPointName, ".", "");

                            if( powerPointName === "ppe" ) {
                                ab.bonusPPE += +this.value;
                            }
                        }

                    }

                }
                return this._makeReturnResult(
                    "Multiplying PPE Power Points by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "ppe_power_point_multiplier":
            case "ppepowerpointmultiplier": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            let powerPointName = ab.powerPointsName.toLowerCase();
                            powerPointName = replaceAll(powerPointName, ".", "");

                            if( powerPointName === "ppe" ) {
                                ab.powerPointMultiplier = +this.value;
                            }
                        }

                    }

                }
                return this._makeReturnResult(
                    "Multiplying PPE Power Points by " + this.value.toString(),
                    this.importedRawLine
                );
            }

                        /* # DOC TODO

            */
           case "ppe_power_point_multiplier_no_starting":
            case "ppepowerpointmultipliernostarting": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            let powerPointName = ab.powerPointsName.toLowerCase();
                            powerPointName = replaceAll(powerPointName, ".", "");

                            if( powerPointName === "ppe" ) {
                                ab.powerPointEdgeMultiplier = +this.value;
                            }
                        }

                    }

                }
                return this._makeReturnResult(
                    "Multiplying PPE Power Points by " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "isp_mega_powers":
            case "ispmegapowers": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            let powerPointName = ab.powerPointsName.toLowerCase();
                            powerPointName = replaceAll(powerPointName, ".", "").trim();

                            if( powerPointName === "isp" || ab.name.toLowerCase().trim() == "psionics" ) {
                                ab.megaPowers = true;
                            }
                        }
                        if( charObj.currentFramework && charObj.currentFramework.name.toLowerCase().trim() === "momano headhunter" ) {
                            // Mind Melter List
                            let powerList = "arcane protection, barrier, blind, bolt, boost/lower Trait, confusion, damage field*, darksight*, deflection*, disguise, divination, elemental manipulation, empathy, entangle, environmental protection*, farsight*, fear, fly*, havoc, healing, illusion, intangibility*, invisibility*, mind reading, mind link, mind wipe, object reading, protection*, puppet, relief, sloth/speed, slumber, smite*, sound/silence, speak language*, stun, telekinesis, warrior’s gift*";
                            charObj.setPowerList( powerList.split(","), "Psionics" );
                        }
                    }

                }
                return this._makeReturnResult(
                    "Access to ISP Mega Powers",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "pp_mega_powers":
            case "ppmegapowers": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            let powerPointName = ab.powerPointsName.toLowerCase();
                            powerPointName = replaceAll(powerPointName, ".", "");

                            if( powerPointName === "power points" || powerPointName === "pp" ) {
                                ab.megaPowers = true
                            }
                        }

                    }

                }
                return this._makeReturnResult(
                    "Access to PP Mega Powers",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "mystic_power_mods":
            case "mysticpowermods":
            case "mystic_power_mod":
            case "mysticpowermod": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            if( ab.name == this.target || this.target == "") {
                                ab.mysticPowerModifiers = true
                            }
                        }
                    }

                }
                return this._makeReturnResult(
                    "Access to Mystic Power Modifiers (specified " + this.target + ")",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "ppe_mega_powers":
            case "ppemegapowers": {

                if( charObj ) {

                    for( let ab of charObj._selectedArcaneBackgrounds ) {
                        if( ab ) {
                            let powerPointName = ab.powerPointsName.toLowerCase();
                            powerPointName = replaceAll(powerPointName, ".", "");

                            if( powerPointName === "ppe" ) {
                                ab.megaPowers = true;
                            }
                        }

                    }

                }
                return this._makeReturnResult(
                    "Access to PPE Mega Powers",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "set_wealth":
            case "setwealth": {

                if( charObj ) {

                    charObj._startingWealthOverride = +this.target;

                }
                return this._makeReturnResult(
                    "Setting Starting Wealth to " + this.target,
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "table_roll":
            case "roll_table": {
                // This is handled in the Edge Class
                return this._makeReturnResult(
                    "Roll on a Table or an option of Tables.",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "add_faction": {
        name: "Add Faction",
        example: ["add_faction:Illuminati", "add_faction:Thieve's Guild"],
        description: "Adds an faction to the character if the faction settings are enabled."
            */
            case "factionadd":
            case "faction_add":
            case "add_faction":
            case "addfaction": {
                if( charObj ) {

                    charObj.addFaction(
                        this.target.toString()
                    );

                }
                return this._makeReturnResult(
                    "Adding Faction " + this.target + " " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "new_powers_edge_bonus": {
                if( charObj ) {
                    charObj._newPowersEdgeBonus = +this.value;
                }
                return this._makeReturnResult(
                    "Settting New Powers Edge Bonus to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            case "runningdie":
            case "running_die": {
                if( charObj ) {
                    charObj._runningDie = getDieIndexFromLabel( this.value.toString() );
                }
                return this._makeReturnResult(
                    "Settting Running Die to " + this.value.toString(),
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "add_loose_attribute":
            case "loose_attribute": {

                let attributeName = this.importedRawLine.toString().split(":", 2)[1];
                let description = "";
                if( attributeName.indexOf(";") > 0 ) {
                    let split = attributeName.split(";")
                    if( split.length > 1 ) {
                        attributeName = split[0];
                        description = split[1];
                    }
                }
                if( charObj ) {
                    charObj.addLooseAttribute( attributeName, description );
                }
                return this._makeReturnResult(
                    "Adding Loose Attribute Named " + attributeName,
                    this.importedRawLine
                );
            }

         /* # DOC
        tag: "unarmed_ap":
        name: "Increment Unarmed AP",
        example: ["unarmed_ap:-1", "unarmed_ap:+2", ],
        description: "Adds or subtracts AP to Unarmed damage"

            */
            case "unarmed_ap": {

                let lineSplit = this.importedRawLine.split(":");
                let number = 0;
                if( lineSplit.length > 0 ) {
                    if( lineSplit[1] ) {
                        try{
                            number = +lineSplit[1]
                        }
                        catch {

                        }
                    }
                }
                if( charObj ) {
                    charObj.incrementUnarmedAP(
                        number
                    );
                }

                let specifyReturn = "Incrementing Unarmed AP by " + number;

                return this._makeReturnResult(
                    specifyReturn,
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "add_hindrance":
        name: "Add Hindrance",
        example: ["add_hindrance:Clumsy", "add_hindrance:Phobia;Spiders", "add_hindrance:Vow (Major);To be honest with everyone" ],
        description: "Adds an Hindrance that's not acounted against character's perks. If a hindrance needs to be specified just append the text with a semicolon after the hindrance name."

            */
            case "hindranceadd":
            case "hindrance_add":
            case "add_hindrance":
            case "addhind":
            case "add_hind":
            case "addhindrance": {
                // console.log("this.importedRawLine", this.importedRawLine);
                let lineSplit = this.importedRawLine.split(":");
                let hindrance = lineSplit[1];
                let specify = "";
                let isMajor = false;
                let specifyReadOnly = false;
                if( hindrance && hindrance.indexOf(";") > - 1) {
                    let split = hindrance.split(";")
                    if( split.length > 2 ) {
                        hindrance = split[0].trim();
                        specify = split[1].trim();
                        if( split[2] ) {
                            isMajor = true;
                        }
                    } else {
                        hindrance = split[0].trim();
                        if( split[1] ) {
                            if( +split[1] / 1 == 0 || +split[1] / 1 == 0 ) {
                                if( +split[1] > 0 )
                                isMajor = true;
                            } else {
                                specify = split[1];
                                specifyReadOnly = true;
                            }

                        }
                    }

                }

                if( hindrance && hindrance.indexOf("(") > -1 ) {
                    let parenSplit = hindrance.split("(");
                    hindrance = parenSplit[0].trim();
                    if( parenSplit[1].toLowerCase().indexOf("major") > -1 ) {
                        isMajor = true;
                    }

                }

                if( charObj ) {
                    charObj.hindranceAddByName(
                        hindrance,
                        specify,
                        isMajor,
                        this.addedFrom,
                        specifyReadOnly,
                        this.applyImmediately,
                    );
                }

                let specifyReturn = "Adding " + (isMajor ? "major " : "minor (if possible)") + "\"" + hindrance + "\"";
                if( specify )
                    specifyReturn == " - Specify: '" + specify + "'";
                return this._makeReturnResult(
                    specifyReturn,
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "set_pace"
        name: "Set Pace",
        example: ["set_pace:6", "set_pace:12" ],
        description: "Sets the pace"

            */
            case "set_pace": {

                if( charObj ) {
                    if( +this.value ) {
                        charObj._basePace = +this.value
                    }
                }
                return this._makeReturnResult(
                    "Setting pace  to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "set_size": {

                if( charObj ) {
                    if( +this.value ) {
                        // set the toughness equal to size, minus the current size just in case it was already big
                        charObj._derivedBaseBoosts.toughness += +this.value - charObj._derivedBaseBoosts.size;
                        charObj._derivedBaseBoosts.size = +this.value;
                    }
                }

                return this._makeReturnResult(
                    "Setting size to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "set_attribute_hard": {
                if( charObj ) {
                    if( this.value && this.target ) {
                        charObj.setAttributeHard(this.target, getDieIndexFromLabel( this.value.toString() ) );
                    }
                }
                return this._makeReturnResult(
                    "Setting " + this.target + " to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "max_skill": {
                let split = this.importedRawLine.split(";");
                let skillName = "";
                let maxValue = "";
                if( split.length > 1 ) {
                    maxValue = split[1].trim();
                }
                if( split.length > 2 ) {
                    skillName = split[2].trim();
                }
                if( charObj ) {
                    let skill = charObj.getSkill( skillName );
                    if( skill && maxValue ) {
                        if(getDieValueFromLabel(maxValue.toString()) ) {
                            skill.maxValue = getDieIndexFromLabel(this.value.toString());
                        }
                    }
                }
                return this._makeReturnResult(
                    "Setting skill '" + skillName + "' maximum  to '" + maxValue  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "max_str"
        name: "Set Maximum Strength",
        aliases: ["max_strength", "max_st"]
        example: ["max_str:d12+3", "max_strength:d6" ],
        description: "Sets the Maximum for the Strength Attribute"

            */
            case "max_st":
            case "max_str":
            case "max_strength": {

                if( charObj ) {
                    if(getDieValueFromLabel(this.value.toString()) ) {
                        charObj._attributesMax.strength = getDieIndexFromLabel(this.value.toString());
                    }
                }
                return this._makeReturnResult(
                    "Setting strength maximum  to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "max_vig":
        name: "Set Maximum Vigor",
        aliases: ["max_vigor"]
        example: ["max_vig:d12+3", "max_vigor:d6" ],
        description: "Sets the Maximum for the Vigor Attribute"

            */
            case "max_vig":
            case "max_vigor": {

                if( charObj ) {
                    if( getDieValueFromLabel(this.value.toString()) ) {
                        charObj._attributesMax.vigor = getDieIndexFromLabel(this.value.toString());
                    }
                }
                return this._makeReturnResult(
                    "Setting vigor maximum  to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "max_agi"
        name: "Set Maximum Agility",
        aliases: ["max_agility"]
        example: ["max_agi:d12+3", "max_agility:d6" ],
        description: "Sets the Maximum for the Agility Attribute"

            */
            case "max_agi":
            case "max_agility": {

                if( charObj ) {
                    if( getDieValueFromLabel(this.value.toString()) ) {
                        charObj._attributesMax.agility = getDieIndexFromLabel(this.value.toString());
                    }
                }
                return this._makeReturnResult(
                    "Setting agility maximum  to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "max_sma"
        name: "Set Maximum Smarts",
        aliases: ["max_smart", "max_smarts"]
        example: ["max_sma:d12+3", "max_smarts:d6" ],
        description: "Sets the Maximum for the Smarts Attribute"
            */
            case "max_smart":
            case "max_sma":
            case "max_smarts": {

                if( charObj ) {
                    if( getDieValueFromLabel(this.value.toString()) ) {
                        charObj._attributesMax.smarts = getDieIndexFromLabel(this.value.toString());
                    }
                }
                return this._makeReturnResult(
                    "Setting smarts maximum  to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC
        tag: "max_spirit"
        name: "Set Maximum Spirit",
        aliases: ["max_spi", "max_spirits"]
        example: ["max_spi:d12+3", "max_spirit:d6" ],
        description: "Sets the Maximum for the Spirit Attribute"

            */
            case "max_spirit":
            case "max_spi":
            case "max_spirits": {

                if( charObj ) {
                    if( getDieValueFromLabel(this.value.toString()) ) {
                        charObj._attributesMax.spirit = getDieIndexFromLabel(this.value.toString());
                    }
                }
                return this._makeReturnResult(
                    "Setting spirit maximum  to '" + this.value  + "'",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "no_hind":
            case "no_hindrance": {
                if( charObj ) {
                    if( this.value ) {
                        charObj._blockedHindrances.push( this.value.toString() );
                    }
                }
                return this._makeReturnResult(
                    "Adds hindrance '" + this.value  + "' to not allowed list",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "no_edge":
            case "no_edges": {
                if( charObj ) {
                    if( this.value ) {
                        charObj._blockedEdges.push( this.value.toString() );
                    }
                }
                return this._makeReturnResult(
                    "Adds hindrance '" + this.value  + "' to not allowed list",
                    this.importedRawLine
                );
            }

            /* # DOC TODO

            */
            case "natural_attack":
            case "naturalattack":
            case "naturalweapon":
            case "natural_weapon":
            case "naturalweapons":
            case "natural_weapons": {
                if( charObj ) {
                    charObj.addInnateWeapon( this.target.toString() + " " +this.value.toString() );
                }
                return this._makeReturnResult(
                    "Adding Natural Attack: " + this.value,
                    this.importedRawLine
                );
            }

            /* # DOC TODO
        tag: "add_ability"
        name: "Add ability line",
        aliases: ["add_special_ability", "addability", "addspecialability"]
        example: ["add_ability:Frostbitten;Has a -2 to defenses against heat", "add_special_ability:Nice;This character is kinda nice" ],
        description: "Add a special ability line"

            */
            case "add_ability":
            case "add_special_ability":
            case "addspecialability":
            case "addability": {
                    let abilityName = "";
                    let abilitySummary = "";
                    // console.log("add_ability this.target", this.target)
                    // console.log("add_ability this.value", this.value)
                    if( this.target.indexOf(";") > -1 ) {
                        let split = this.target.split(";", 2);
                        abilityName = split[0].trim();
                        if( split.length > 1 ) {
                            abilitySummary = split[1].trim() + " " + this.value.toString();
                        }
                    } else {
                        // maybe I forgot to use a semicolon, let's try a colon
                        if( this.target.indexOf(":") > -1 ) {
                            let split = this.target.split(":", 2);
                            abilityName = split[0].trim();
                            if( split.length > 1 ) {
                                abilitySummary = split[1].trim() + " " + this.value.toString()
                            }
                        } else {
                            return this._makeReturnResult(
                                "Adding Special Ability Line Needs formatted ability line where the name and description are separated by colon or semicolon",
                                this.importedRawLine,
                                false
                            );
                        }
                    }

                    if( charObj && abilityName ) {
                        charObj.addSpecialAbility(
                            abilityName,
                            abilitySummary.trim(),
                            "",
                            "",
                            0,
                        )
                    }

                    return this._makeReturnResult(
                        "Adding Special Ability Line: " + abilityName,
                        this.importedRawLine
                    );
                }

            /* # DOC TODO

            */
            case "add_race_requirement": {
                if( charObj && charObj.race ) {
                    charObj.race.counts_as_other_race.push( this.value.toString())
                }

                if(!this.value.toString().trim()) {
                    return this._makeReturnResult(
                        "Allows character to count as a specified race for requirements purposes (you need to specify after a colon)",
                        this.importedRawLine,
                        false,
                    );
                } else {
                    return this._makeReturnResult(
                        "Allows character to count as a '" + this.value.toString() + "' for requirements purposes",
                        this.importedRawLine,
                    );
                }

            }

            /* # DOC
        tag: "attribute_bonus"
        name: "Attribute Bonus",
        example: ["attribute_bonus:strength -2", "attribute_bonus:smarts 2" ],
        description: "Not to be confused with boosting the die (see below). This adds or subtracts the number from all attribute rolls and is noted with a -2/+1, etc after the attribute on the character sheet."

            */
            case "attribute_bonus": {
                switch( this.target.toLowerCase() ) {

                    case "agility": {
                        if( charObj ) {
                            charObj._attributeBonuses.agility += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " Bonus by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "smarts": {
                        if( charObj ) {
                            charObj._attributeBonuses.smarts += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " Bonus by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "spirit": {
                        if( charObj ) {
                            charObj._attributeBonuses.spirit += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " Bonus by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    case "strength": {
                        if( charObj ) {
                            charObj._attributeBonuses.strength += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " Bonus by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    case "vigor": {
                        if( charObj ) {
                            charObj._attributeBonuses.vigor += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " Bonus by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    default: {
                        return this._makeReturnResult(
                            "Unhandled attribute_bonus Target '" + this.target + "'",
                            this.importedRawLine,
                            false
                        );
                    }
                }
            }

            /* # DOC
        tag: "boost_attribute"
        name: "Attribute Boost",
        aliases: ["attribute_boost"]
        example: ["attribute_boost:strength -2", "boost_attribute:smarts 2" ],
        description: "This adds or subtracts a number of dice to the attribute. Other shortcuts are +1 agility, vigor +2. In many areas you can place a [selected_attribute] tag and a dropdown should appear for selection"

            */
            case "boost_attribute":
            case "attribute_boost": {
                switch( this.target.toLowerCase() ) {
                    /* # DOC
                        tag: "agility"
                        name: "Agility",
                        example: ["+1 agility", "agility +2"],
                        description: "Adds a die step to the character's Agility attribute. Use a negative value to subtract."
                    */
                    case "agility": {
                        if( charObj ) {
                            charObj.boostAttribute( "agility", +this.value);
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " with min/max by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
                        tag: "smarts"
                        name: "Smarts",
                        example: ["+1 smarts", "smarts +2"],
                        description: "Adds a die step to the character's Smarts attribute. Use a negative value to subtract."
                    */
                    case "smarts": {
                        if( charObj ) {
                            charObj.boostAttribute( "smarts", +this.value);
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " with min/max by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "spirit"
        name: "Spirit",
        example: ["+1 spirit", "spirit +2"],
        description: "Adds a die step to the character's Spirit attribute. Use a negative value to subtract."
                    */
                    case "spirit": {
                        if( charObj ) {
                            charObj.boostAttribute( "spirit", +this.value);
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " with min/max by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "strength"
        name: "Strength",
        example: ["+1 strength", "strength +2"],
        description: "Adds a die step to the character's Strength attribute. Use a negative value to subtract."
                    */
                    case "strength": {
                        if( charObj ) {
                            charObj.boostAttribute( "strength", +this.value);
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " with min/max by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "vigor"
        name: "Vigor",
        example: ["+1 vigor", "vigor +2"],
        description: "Adds a die step to the character's Vigor attribute. Use a negative value to subtract."
                    */
                    case "vigor": {
                        if( charObj ) {
                            charObj.boostAttribute( "vigor", +this.value);
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " with min/max by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "[select_attribute]":
                    case "[selected_attribute]": {
                        return this._makeReturnResult(
                            "Boosting [selected_attribute] with min/max by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    default: {
                        return this._makeReturnResult(
                            "Unhandled attribute_boost Target '" + this.target + "'",
                            this.importedRawLine,
                            false
                        );
                    }
                }
            }

            /* # DOC
        tag: "double_attribute_cost"
        name: "Double Attribute Cost",
        example: ["double_attribute_cost:strength" ],
        description: "Causes the selected attribute to be double points costs at time of character creation"

            */
            case "double_attribute_cost": {
                switch( this.value.toString().toLowerCase() ) {
                    case "agility": {
                        if( charObj ) {
                            charObj._attributesBuyCost.agility = 2;
                        }
                        return this._makeReturnResult(
                            "Doubling cost to buy of  " + this.value.toString() + "",
                            this.importedRawLine
                        );
                    }

                    case "smarts": {
                        if( charObj ) {
                            charObj._attributesBuyCost.smarts = 2;
                        }
                        return this._makeReturnResult(
                            "Doubling cost to buy of  " + this.value.toString() + "",
                            this.importedRawLine
                        );
                    }

                    case "spirit": {
                        if( charObj ) {
                            charObj._attributesBuyCost.spirit = 2;
                        }
                        return this._makeReturnResult(
                            "Doubling cost to buy of  " + this.value.toString() + "",
                            this.importedRawLine
                        );
                    }

                    case "strength": {
                        if( charObj ) {
                            charObj._attributesBuyCost.strength = 2;
                        }
                        return this._makeReturnResult(
                            "Doubling cost to buy of  " + this.value.toString() + "",
                            this.importedRawLine
                        );
                    }

                    case "[select_attribute]":
                    case "[selected_attribute]": {
                        return this._makeReturnResult(
                            "Boosting [selected_attribute] with min/max by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "vigor": {
                        if( charObj ) {
                            charObj._attributesBuyCost.vigor = 2;
                        }
                        return this._makeReturnResult(
                            "Doubling cost to buy of  " + this.value.toString() + "",
                            this.importedRawLine
                        );
                    }

                    default: {
                        return this._makeReturnResult(
                            "Unhandled attribute_bonus Target '" + this.value.toString() + "'",
                            this.importedRawLine,
                            false
                        );
                    }
                }
            }

            /* # DOC
        tag: "max_attribute"
        name: "Set Max Attribute ",
        aliases: ["max_attribute_value"]
        example: ["max_attribute:strength 4",  "max_attribute_value:strength d8", ],
        description: "If a plain number is selected it will be the die \"index\" where d4 is 1, d6 is 2, d8 is 3, etc."

            */
            case "max_attribute":
            case "max_attribute_value": {

                let theValue = 0
                if (this.value && this.value.toString()[0] == "d") {
                    theValue = getDieIndexFromLabel( this.value );
                } else {
                    theValue = +this.value;
                }
                switch( this.target.toLowerCase() ) {

                    case "agility": {
                        if( charObj ) {
                            charObj._attributesMax.agility = theValue;
                        }
                        return this._makeReturnResult(
                            "Setting attribute max of " + this.target + " to " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    case "smarts": {
                        if( charObj ) {
                            charObj._attributesMax.smarts = theValue;
                        }
                        return this._makeReturnResult(
                            "Setting attribute max of " + this.target + " to " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    case "spirit": {
                        if( charObj ) {
                            charObj._attributesMax.spirit = theValue;
                        }
                        return this._makeReturnResult(
                            "Setting attribute max of " + this.target + " to " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    case "strength": {
                        if( charObj ) {
                            charObj._attributesMax.strength = theValue;
                        }
                        return this._makeReturnResult(
                            "Setting attribute max of " + this.target + " to " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    case "vigor": {
                        if( charObj ) {
                            charObj._attributesMax.vigor = theValue;
                        }
                        return this._makeReturnResult(
                            "Setting attribute max of " + this.target + " to " + this.value.toString(),
                            this.importedRawLine
                        );
                    }
                    default: {
                        return this._makeReturnResult(
                            "Unhandled attribute_bonus Target '" + this.target + "'",
                            this.importedRawLine,
                            false
                        );
                    }
                }
            }

            case "boost":
                switch( this.target.toLowerCase() ) {
                    /* # DOC TODO

                    */
                    case "thrownweaponrange":
                    case "thrown_weapon_range": {
                        if( charObj ) {
                            charObj._thrownWeaponRangeIncrement += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "perk_points"
        name: "Perk Points",
        aliases: ["perk_point", "perkpoint", "perkpoints"]
        example: ["+2 perk_points", "perk_points -1"],
        description: "Adds a the number to the character's Perk Points. Use a negative value to subtract.<br />This is useful for extremely powerful edges which require a Major Hindrance. Just put in '-2 perk_points' to require a major hindrance."
                    */
                    case "perk_point":
                    case "perkpoint":
                    case "perkpoints":
                    case "perk_points": {
                        if( charObj ) {
                            charObj._perkPointAdjustment += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "min_str_mod_weapons"
        name: "Weapon Strength",
        aliases: ["weapons_min_str_mod", "min_str_mod_weapon", "weapon_min_str_mod"],
        example: ["+1 min_str_mod_weapons", "weapon_min_str_mod +2"],
        description: "Adds a die step to the character's Strength when calculating minimum strengths of Weapons."

                    */
        case "min_str_mod_weapons":
        case "weapons_min_str_mod":
        case "min_str_mod_weapon":
        case "weapon_min_str_mod": {

            if( charObj ) {
                // charObj._armorStrengthBonus += +this.value;
                charObj._weaponStrengthBonus += +this.value;
            }
            return this._makeReturnResult(
                "Boosting " + this.target + " by " + this.value.toString(),
                this.importedRawLine
            );
        }

              /* # DOC
        tag: "min_str_mod"
        name: "Weapon/Armor Strength",
        example: ["+1 min_str_mod", "min_str_mod +2"],
        description: "Adds a die step to the character's Strength when calculating minimum strengths of both Weapons and Armor."

                    */
                    case "min_str_mod": {
                        if( charObj ) {
                            charObj._armorStrengthBonus += +this.value;
                            charObj._weaponStrengthBonus += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "enc_str_mod"
        name: "Encumbrance Strength",
        example: ["+1 enc_str_mod", "enc_str_mod +2"],
        description: "Adds a die step to the character's Strength attribute when encumbered. This is not displayed on the character sheet or stats, but is affected for calculations and verification. Use a negative value to subtract."

                    */
                    case "enc_str_mod": {
                        if( charObj ) {
                            charObj._encumbranceStrengthBonus += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC

        tag: "edges":
        name: "Edges",
        aliases: ["edge"]
        example: ["+2 edges", "edge -1"],
        description: "Adds a the number to the character's Edges. Use a negative value to subtract."

                    */
                    case "edge":
                    case "edges": {
                        if( charObj ) {
                            charObj._maxEdgesCount += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC TODO

                    */
                    case "hjroll":
                    case "hj_roll":
                    case "hjrolls":
                    case "hj_rolls": {
                        if( charObj ) {
                            charObj._extraHJRolls += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "agility": {
                        if( charObj ) {
                            charObj._attributeBoosts.agility += +this.value;
                            charObj._attributesMax.agility += +this.value;
                            charObj._attributesMin.agility += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "advance": {
        name: "Advances",
        example: ["+2 advance", "advance -1"],
        description: "Adds a number of advance to the character."
                    */
                    case "advance":
                    case "advances": {
                        if( charObj ) {
                            charObj._advancement_bonus += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " Bonus by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "smarts": {
                        if( charObj ) {
                            charObj._attributeBoosts.smarts += +this.value;
                            charObj._attributesMax.smarts += +this.value;
                            charObj._attributesMin.smarts += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "spirit": {
                        if( charObj ) {
                            charObj._attributeBoosts.spirit += +this.value;
                            charObj._attributesMax.spirit += +this.value;
                            charObj._attributesMin.spirit += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "strength": {
                        if( charObj ) {
                            charObj._attributeBoosts.strength += +this.value;
                            charObj._attributesMax.strength += +this.value;
                            charObj._attributesMin.strength += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "vigor": {
                        if( charObj ) {
                            charObj._attributeBoosts.vigor += +this.value;
                            charObj._attributesMax.vigor += +this.value;
                            charObj._attributesMin.vigor += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "max_agility": {
                        if( charObj ) {
                            charObj._attributesMax.agility += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting Max " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "max_smarts": {
                        if( charObj ) {
                            charObj._attributesMax.smarts += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting Max " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "max_spirit": {
                        if( charObj ) {
                            charObj._attributesMax.spirit += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting Max " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "max_strength": {
                        if( charObj ) {
                            charObj._attributesMax.strength += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting Max " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "max_vigor": {
                        if( charObj ) {
                            charObj._attributesMax.vigor += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting Max " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "toughness": {
        name: "Toughness",
        example: ["+2 toughness", "toughness -1"],
        description: "Adds a the number to the character's toughness. Use a negative value to subtract."
                    */
                    case "toughness": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.toughness += +this.value;

                            charObj.noteToughnessSource(
                                this.addedFrom,
                                +this.value,
                            )
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "wounds"
        name: "Wounds",
        example: ["+2 wounds", "wounds -1"],
        description: "Adds a the number to the character's wounds. Do not use in conjunction with size, that'll be calculated automatically."

                    */
                    case "wounds":
                    case "wound": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.wounds += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "sanity"
        name: "Sanity",
        example: ["+2 sanity", "sanity -1"],
        description: "Adds a the number to the character's sanity. Use a negative value to subtract."

                    */
                    case "sanity": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.sanity += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "armor_strength"
        name: "Armor Strength",
        aliases: ["armorstrength", "min_str_mod_armor", "armor_min_str_mod"]
        example: ["+1 armor_strength", "armor_strength +2"],
        description: "Adds a die step to the character's Strength attribute when wearing armor. This is not displayed on the character sheet or stats, but is affected for calculations and verification. Use a negative value to subtract."
                    */
                    case "min_str_mod_armor":
                    case "armor_min_str_mod":
                    case "armor_strength":
                    case "armorstrength": {
                        if( charObj ) {
                            charObj._armorStrengthBonus += +this.value;
                        }
                        return this._makeReturnResult(
                            "Adjusting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }


                    /* # DOC
        tag: "smarts_skill_points"
        name: "Smarts Skill Points",
        aliases: ["smartsskillpoints"]
        example: ["+2 smarts_skill_points", "smarts_skill_points -1"],
        description: "Adds a the number to the character's Smarts Skill Points in a special skill pool. Use a negative value to subtract."

                    */
                    case "smartsskillpoints":
                    case "smarts_skill_points": {
                        if( charObj ) {
                            charObj._currentSmartsSkillAllocationPoints += +this.value;
                            charObj._maxSmartsSkillAllocationPoints += +this.value;
                        }
                        return this._makeReturnResult(
                            "Setting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "running_die"
        name: "Running Die",
        aliases: ["runningdie"]
        example: ["+1 running_die", "running_die +2"],
        description: "Adds a die step to the running die. Use a negative value to subtract. To set a running die, use the action of the same name above"
                    */
                    case "runningdie":
                    case "running_die": {
                        if( charObj ) {
                            charObj._runningDie += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting Running Die by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "bennie":
        name: "Benny",
        aliases: ["bennie", "bennies"]
        example: ["benny: 2", "bennie: -1"],
        description: "Adds a the number to the character's Bennies. Use a negative value to subtract."

                    */
                    case "benny":
                    case "bennies":
                    case "bennie": {
                        if( charObj ) {
                            charObj._startingBennies += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting Starting Bennies by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "armor"
        name: "Armor",
        example: ["+2 armor", "armor -1"],
        description: "Adds a the number to the character's armor. Use a negative value to subtract."

                    */
                    case "armor": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.armor += +this.value;
                            charObj.logNaturalArmor(
                                this.addedFrom,
                                +this.value,
                                false,
                            )
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "toughness_bonus_if_no_armor"
        name: "Tooughness Bonus if no Armor is Equipped",
        example: ["+2 toughness_bonus_if_no_armor", "toughness_bonus_if_no_armor -1"],
        description: "Adds a the number to the character's toughness. Use a negative value to subtract. Only applies if no armor is equipped."

                    */
        case "toughness_bonus_if_no_armor": {
            if( charObj ) {
                if( charObj.hasArmorEquipped() == false ) {
                    charObj._derivedBaseBoosts.toughness += +this.value;
                    // charObj.logNaturalArmor(
                    //     this.addedFrom,
                    //     +this.value,
                    //     false,
                    // )
                }
            }
            return this._makeReturnResult(
                "Boosting toughness by " + this.value.toString() + " if no armor is equipped",
                this.importedRawLine
            );
        }

                    /* # DOC
        tag: "heavy_armor"
        name: "Heavy Armor",
        example: ["+2 heavy_armor", "heavy_armor -1"],
        description: "Adds a the number to the character's armor. Use a negative value to subtract. It also sets the character's armor to the setting's Heavy armor label."

                    */
                    case "heavy_armor": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.heavy_armor += +this.value;
                            charObj.naturalArmorIsHeavy = true;
                            charObj.logNaturalArmor(
                                this.addedFrom,
                                +this.value,
                                true,
                            )
                        }

                        return this._makeReturnResult(
                            "Boosting Heavy Armor by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
                        tag: "reach"
                        name: "Reach",
                        example: ["+2 reach", "reach -1"],
                        description: "Adds a the number to the character's global melee reach"
                    */
                    case "reach": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.reach += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
                        tag: "robot_mods"
                        name: "Robot Mods",
                        example: ["+2 robot_mods", "robot_mods -1"],
                        description: "Adds a the number to the character's allowed Robot Modifications. Use a negative value to subtract."
                    */
                    case "robot_mods": {
                        if( charObj ) {
                            charObj._currentRobotMods += +this.value;
                            charObj._maxRobotMods += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "skill_points"
        name: "Skill Points",
        example: ["+2 skill_points", "skill_points -1"],
        description: "Adds a the number to the character's Skill Points. Use a negative value to subtract."
                    */
                    case "skills_point":
                    case "skills_points":
                    case "skill_point":
                    case "skill_points": {
                        if( charObj ) {
                            charObj._maxSkillAllocationPoints += +this.value;
                            charObj._currentSkillAllocationPoints += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "size"
        name: "Size",
        example: ["+2 size", "size -1"],
        description: "Adds a the number to the character's size. Use a negative value to subtract."

                    */
                    case "size": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.size += +this.value;
                            charObj._derivedBaseBoosts.toughness += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString() + "\n\nREMINDER: There's no need to put +/- toughness along with the size modifier, it's calculatd in with the -1 size",
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "charisma"
        name: "Charisma",
        example: ["+2 charisma", "charisma -1"],
        description: "Adds a the number to the character's Charisma (Savage Worlds: Deluxe only). Use a negative value to subtract."

                    */
                    case "charisma": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.charisma += +this.value;
                        }
                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC

        tag: "pace"
        name: "Pace",
        example: ["+2 pace", "pace -1"],
        description: "Adds a the number to the character's Pace. Use a negative value to subtract."

                    */
                    case "pace": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.pace += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "swimming_pace":
                    case "swim_pace": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.pace_swimming += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    case "fly_pace":
                    case "flying_pace": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.pace_flying += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "scholarship"
        name: "Scholarship",
        example: ["+2 scholarship", "scholarship -1"],
        description: "Adds a the number to the ETU Scholarship derived attribute"
                    */
                    case "scholarship": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.scholarship += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "spc_power_points"
        name: "Scholarship",
        aliases: ["spcpowerpoints"]
        example: ["+2 spc_power_points", "spcpowerpoints -1"],
        description: "Adds a the number to the SPC Power Points "
                    */
                    case "spc_power_points":
                    case "spcpowerpoints": {
                        if( charObj ) {

                            charObj.superPowers2014ExtraPowerPoints += +this.value;

                        }
                    }

                    /* # DOC
        tag: "ppe"
        name: "PPE",
        example: ["+2 ppe", "ppe -1"],
        description: "Adds a the number to the character's PPE. If a character doesn't have a PPE Arcane Background, the points will be dumped into a global pool"

                    */
                    case "ppe": {
                        if( charObj ) {
                            let abIndex = 0;

                            let foundAB = false;

                            for( let ab of charObj._selectedArcaneBackgrounds ) {
                                if( ab
                                    &&
                                    (
                                        ab.powerPointsName.toLowerCase().trim() == "ppe"
                                            ||
                                        ab.powerPointsName.toLowerCase().trim() == "p.p.e."
                                            ||
                                        ab.powerPointsName.toLowerCase().trim() == "p.p.e"
                                    )
                                ) {
                                    ab.addedPowerPoints += +this.value;
                                    foundAB = true;
                                    break;
                                }
                            }

                             if(
                                !foundAB
                             ) {
                                charObj.freePPEPool += +this.value;

                             }
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "isp"
        name: "ISP",
        example: ["+2 isp", "isp -1"],
        description: "Adds a the number to the character's ISP. If a character doesn't have a ISP Arcane Background, the points will be dumped into a global pool"

                    */
                   case "isp": {
                    if( charObj ) {
                        let abIndex = 0;

                        let foundAB = false;

                        for( let ab of charObj._selectedArcaneBackgrounds ) {
                            if( ab
                                &&
                                (
                                    ab.powerPointsName.toLowerCase().trim() == "isp"
                                        ||
                                    ab.powerPointsName.toLowerCase().trim() == "i.s.p."
                                    ||
                                    ab.powerPointsName.toLowerCase().trim() == "i.s.p"
                                )
                            ) {
                                ab.addedPowerPoints += +this.value;
                                foundAB = true;
                                break;
                            }
                        }

                         if(
                            !foundAB
                         ) {
                            charObj.freeISPPool += +this.value;

                         }
                    }

                    return this._makeReturnResult(
                        "Boosting " + this.target + " by " + this.value.toString(),
                        this.importedRawLine
                    );
                }

                    /* # DOC
        tag: "power_points"
        name: "Power Points",
        aliases: ["powerpoints"]
        example: ["+2 power_points", "power_points -1"],
        description: "Adds a the number to the character's Power Points. Use a negative value to subtract."

                    */
                    case "power_points":
                    case "powerpoints": {
                        if( charObj ) {
                            let abIndex: string | number = 0;

                            // let isPowerPointsEdge = false;
                            // if(
                            //     this.callingEdge
                            //     && this.callingEdge.name.toLowerCase().trim() == "power points"
                            // ) {
                            //     isPowerPointsEdge = true;
                            // }

                            if(
                                this.callingEdge
                                    &&
                                    this.callingEdge.selectedABIndex1
                                    &&
                                    (
                                        typeof(this.callingEdge.selectedABIndex1) == "string"
                                            ||
                                        (
                                            charObj._selectedArcaneBackgrounds.length > 0
                                                &&
                                            charObj._selectedArcaneBackgrounds[ abIndex ]
                                        )
                                    )

                            ) {
                                abIndex = this.callingEdge.selectedABIndex1
                            }

                            // console.log("abIndex", abIndex, typeof(abIndex))
                            if( typeof(abIndex) == "string" ) {
                                for( let edge of charObj.getAllEdgeObjects() ) {
                                    if( edge.arcaneBackground && edge.uuid == abIndex ) {
                                        if( this.callingEdge && this.callingEdge.takenAtRank > 4 ) // legendary or greater
                                        edge.arcaneBackground.addedPowerPoints += 2;
                                    else
                                    edge.arcaneBackground.addedPowerPoints += +this.value;
                                    }
                                }
                            } else {
                                if(
                                    charObj._selectedArcaneBackgrounds.length > 0
                                        &&
                                    charObj._selectedArcaneBackgrounds[ abIndex ]
                                ) {
                                    // console.log("charObj._selectedArcaneBackgrounds[ abIndex ]", charObj._selectedArcaneBackgrounds[ abIndex ])
                                    // if( isPowerPointsEdge ) {
                                    //     charObj._selectedArcaneBackgrounds[ abIndex ].addedPowerPoints += +this.value * charObj._powerPointEdgeMultiplier;
                                    // } else {
                                    if( this.callingEdge && this.callingEdge.takenAtRank > 4 ) {// legendary or greater
                                        //@ts-ignore
                                        charObj._selectedArcaneBackgrounds[ abIndex ].addedPowerPoints += 2;
                                    } else {
                                        //@ts-ignore
                                        charObj._selectedArcaneBackgrounds[ abIndex ].addedPowerPoints += +this.value;
                                    }
                                    // }

                                }
                            }

                             if(
                                charObj.setting.spcRisingStars
                             ) {
                                charObj.superPowers2014ExtraPowerPoints += +this.value;

                             }
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "attribute_points"
        name: "Attribute Points",
        example: ["+2 attribute_points", "attribute_points -1"],
        description: "Adds a the number to the character's Skill Points. Use a negative value to subtract."

                    */
                    case "attribute_point":
                    case "attribute_points": {
                        if( charObj ) {
                            charObj._currentAttributeAllocationPoints += +this.value;
                            charObj._maxAttributeAllocationPoints += +this.value;
                            charObj._maxAttributeModifier += +this.value;
                            // console.log("X2", this.addedFrom,+this.value)
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC TODO

                    */
                    case "skill_point":
                    case "skill_points": {
                        if( charObj ) {
                            charObj._currentSkillAllocationPoints += +this.value;
                            charObj._maxSkillAllocationPoints += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "parry"
        name: "Parry",
        example: ["+2 parry", "parry -1"],
        description: "Adds a the number to the character's parry. Use a negative value to subtract."
                    */
                    case "parry": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.parry += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC TODO

                    */
                    case "rank_power_bonus":
                    case "rank_bonus_power":
                    case "power_rank_bonus": {
                        if( charObj ) {
                            charObj._powerRankEquivalentBonus += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "wealth"
        name: "Wealth",
        example: ["+2 wealth", "wealth -1"],
        description: "Adds a the number to the character's starting wealth. Use a negative value to subtract.."
                    */
                    case "wealth": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.wealth += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                /* # DOC
        tag: "wealth_die_bonus"
        name: "Wealth Die Bonus",
        example: ["wealth_die_bonus:+1", "wealth_die_bonus:-2"],
        description: "Boosts the Wealth Die Roll Bonus by a the specified amount Use a negative value to subtract."
                    */
        case "wealth_die_bonus":
        case "wealthdiebonus": {
                if( charObj ) {
                    charObj.wealthDieBonus += +this.value;
                }
                return this._makeReturnResult(
                    "Setting Wealth Die to " + this.value.toString(),
                    this.importedRawLine
                );
            }
                    /* # DOC
        tag: "strain"
        name: "Strain",
        example: ["+2 strain", "strain -1"],
        description: "Adds a the number to the character's Strain (Science Fiction Derived Stat). Use a negative value to subtract."

                    */
                    case "strain": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.strain += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "rippersstatus": {
        name: "Rippers Status",
        example: ["+2 rippersstatus", "rippersstatus -1"],
        description: "Adds a the number to the character's Status score in Rippers. Use a negative value to subtract."
                    */
                    case "ripperstatus":
                    case "rippersstatus": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.rippers_status += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    /* # DOC
        tag: "rippersreason": {
        name: "Rippers reason",
        example: ["+2 rippersreason", "rippersreason -1"],
        description: "Adds a the number to the character's Reason score in Rippers. Use a negative value to subtract."
                    */
                    case "rippersreason":
                    case "ripperreason": {
                        if( charObj ) {
                            charObj._derivedBaseBoosts.rippers_reason += +this.value;
                        }

                        return this._makeReturnResult(
                            "Boosting " + this.target + " by " + this.value.toString(),
                            this.importedRawLine
                        );
                    }

                    default: {
                        // console.warn(
                        //     "Unhandled Modline Boost Target '" + this.target + "' / '" + this.importedRawLine + "'",
                        //     this
                        // );
                        return this._makeReturnResult(
                            "Unhandled Modline Boost Target '" + this.target + "'",
                            this.importedRawLine,
                            false
                        );
                    }
                }

            default: {
                // console.warn(
                //     "Unhandled Modline '" + this.importedRawLine + "'",
                //     this
                // );
                if( charObj ) {
                    charObj.addValidationMessage(
                        2,                                              // validation level error
                        "Unhandled Modline '" + this.importedRawLine + "'",  // validation message
                    )
                }
                return this._makeReturnResult(
                    "Unhandled Modline '" + this.importedRawLine + "'",
                    this.importedRawLine,
                    false
                );
            }
        }
    }

    _makeReturnResult(
        message: string,
        modline: string,
        good: boolean = true,
    ): ICharModParseResult {
        return {
            message: message,
            modline: modline,
            good: good,
        };
    }

    exportObj(): IModLineExport {
        let rv = {
            action: this.action,
            target: this.target,
            value: this.value,
        }

        return rv;
    }

    _normalizeModline(
        modLine: string,
        charObj: PlayerCharacter | null = null,
    ): ICharMod | null {

        let returnObj: ICharMod = {
            action: "",
            target: "",
            value: "",
            rawLine: modLine,
        }
        if( !this._isCommented(modLine) ) {
            modLine = replaceAll( modLine, "  ", " ");
            modLine = modLine.trim();

            if( modLine.indexOf(":") > 0 ) {
                let colSplit = split_by_max_two(modLine.trim(), ":");
                returnObj.action = colSplit[0];
                let modSplit = rSplit(colSplit[1].trim(), " ", 1);  //colSplit[1].trim().split(" ", 2);
                returnObj.target = modSplit[0];
                returnObj.value = modSplit[1];
            } else {
                let modSplit = modLine.trim().split(" ", 2);
                if( modSplit.length == 1 ) {
                    returnObj.target = "";
                    returnObj.action = modSplit[0];
                } else if( modSplit.length == 2 ) {
                    if( modSplit[0][0] == "+" ) {
                        returnObj.target = modSplit[1];
                        returnObj.action = "boost";
                        let value =  modSplit[0].replace("+", "").trim();

                        if( +value > 1 || +value < 0) {
                            returnObj.value = +value;
                        } else {
                            returnObj.value = 1;
                        }
                    } else if (modSplit[1][0] == "+" ) {
                        returnObj.target = modSplit[0];
                        returnObj.action = "boost";
                        let value =  modSplit[1].replace("+", "").trim();
                        if( +value > 1 || +value < 0) {
                            returnObj.value = +value;
                        } else {
                            returnObj.value = 1;
                        }
                    } else if( modSplit[0][0] == "-" ) {
                        returnObj.target = modSplit[1];
                        returnObj.action = "boost";
                        let value =  modSplit[0].trim();

                            if( +value > 1 || +value < 0) {
                            returnObj.value = +value;
                        } else {
                            returnObj.value = 1;
                        }
                    } else if (modSplit[1][0] == "-" ) {
                        returnObj.target = modSplit[0];
                        returnObj.action = "boost";
                        let value =  modSplit[1].trim();
                        if( +value > 1 || +value < 0) {
                            returnObj.value = +value;
                        } else {
                            returnObj.value = 1;
                        }
                    }
                }
            }
        }

        return returnObj;

    }

    _isCommented( modline: string ): boolean {
        if(
            modline.trim().substring(0,1) === "#"
                ||
            modline.trim().substring(0,2) === "//"
        ) {
            return true;
        } else {
            return false;
        }
    }

}