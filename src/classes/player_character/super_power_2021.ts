import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { replaceAll } from "../../utils/CommonFunctions";
import { getDieIndexFromLabel, getDieLabelFromIndex } from "../../utils/Dice";
import { generateUUID } from "../../utils/generateUUID";
import { titleCaseString } from "../../utils/titleCaseString";
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from "../_base_object";
import { PlayerCharacter } from "./player_character";

export interface ISuperPower2021ObjectVars extends IBaseObjectVars{
    active_mods: {
        [index: string]: number
    };
    custom_description: string;
    custom_name: string;
    id: number;
    levels: number;
    pick1: string;
    pick2: string;
    specify_contingent: string;
    specify_device: string;
    specify_limitation: string;
    specify_limitation2: string;
    specify_limitation3: string;
    specify_limitation4: string;
    specify_limitation5: string;

    switchable_set: string;
    powerType: string;
    specifyAlternateTrait: string;

    activated: boolean;
}

export interface IChargenSuperPower2021 extends IBaseObjectExport {
    effects: string[];
    power_points: string;
    perLevelSummary: string[];
    specific_mods: string | string[];
    power_points_per_level: boolean;
    pick_edge: boolean;
    pick_skill: boolean;
    pick_trait: boolean;
    pick_attribute: boolean;
    powerDown: string;

}

export interface ISPCMod {
    [tag: string]: string;
    name: string;
    value: string;
    valueLabels: string;
}

export class SuperPower2021 extends BaseObject {

    name: string = "";
    theBestThereIs = false;

    hasBeenApplied = false;

    powerDown: string = "";
    effects: string[] = [];
    activeMods: {
        [index: string]: number
    } = {};
    customDescription: string = "";
    customName: string = "";
    id: number = 0;
    levels: number;
    pick1: string = "";
    pick2: string = "";
    specifyContingent: string = "(unspecified)";
    specifyDevice: string = "(unspecified)";
    specifyLimitation: string = "(unspecified)";
    specifyLimitation2: string = "(unspecified)";
    specifyLimitation3: string = "(unspecified)";
    specifyLimitation4: string = "(unspecified)";
    specifyLimitation5: string = "(unspecified)";
    specifyAlternateTrait: string = "";

    createdByName: string = "";
    deletedByName: string = "";
    updatedByName: string = "";

    createdBy: number = 0;
    deletedBy: number = 0;
    updatedBy: number = 0;

    powerType: string = "";

    createdOn: Date = new Date();
    deletedOn: Date = new Date();
    updatedOn: Date = new Date();

    active: boolean = true;
    powerPoints: string = "";
    perLevelSummary: string[] = [];
    specificMods: {
        [index: string]: ISPCMod
    } = {};

    powerPointsPerLevel: boolean = false;
    pickEdge: boolean = false;
    pickSkill: boolean = false;
    pickAttribute: boolean = false;
    pickTrait: boolean = false;
    bookID: number = 0;
    bookName: string = "";
    bookPage: string = "";
    bookShortName: string = "";
    bookPublisher: string = "";
    bookPublished: string = "";
    bookPrimary: boolean = false;
    bookCore: boolean = false;
    activated: boolean = true;

    constructor(
        dataDefinition: IChargenSuperPower2021 | null = null,
        characterObject: PlayerCharacter | null = null,
    ) {
        super( dataDefinition, characterObject )
        this.reset();
        if(dataDefinition) {
            this.import(dataDefinition);
        }
        this.activeMods = {};
        this.levels = 1;

    }

    importOptions(importObj: ISuperPower2021ObjectVars) {
        if( importObj ) {
            super.importOptions( importObj );
            this.customName = importObj.custom_name;
            this.customDescription = importObj.custom_description;
            this.activeMods = importObj.active_mods;

            if( importObj.powerType ) {
                this.powerType = importObj.powerType;
            }

            this.levels = importObj.levels;
            this.pick1 = importObj.pick1;
            this.pick2 = importObj.pick2;
            this.specifyContingent = importObj.specify_contingent;
            this.specifyDevice = importObj.specify_device;
            this.specifyLimitation = importObj.specify_limitation;
            if( importObj.specify_limitation2 )
                this.specifyLimitation2 = importObj.specify_limitation2;
            if( importObj.specify_limitation3 )
                this.specifyLimitation3 = importObj.specify_limitation3;
            if( importObj.specify_limitation4 )
                this.specifyLimitation4 = importObj.specify_limitation4;
            if( importObj.specify_limitation5 )
                this.specifyLimitation5 = importObj.specify_limitation5;
            this.specifyAlternateTrait = importObj.specifyAlternateTrait;
            this.activated = false;
            if( typeof(importObj.activated) != "undefined" ) {
                this.activated = importObj.activated;
            } else {
                this.activated = true;
            }

            if( this.powerPoints.indexOf("/") === -1 ) {
                this.levels = 1;
            } else {
                if( this.powerPoints.split("/").length + 1 < this.levels ) {
                    this.levels = this.powerPoints.split("/").length + 1;
                }
            }
        } else {
            this.activated = true;
        }

        if( this.pick1 == "strengh" ) {
            this.pick1 = "strength";
        }

    }

    import( dataDefinition: IChargenSuperPower2021 ) {
        super.import(dataDefinition, this._char ? this._char.getAvailableData().books : [] );

        this.active = false;
        if( dataDefinition.active )
            this.active = true;

        if( dataDefinition.power_points)
            this.powerPoints = dataDefinition.power_points;
        if( dataDefinition.perLevelSummary ) {
            this.perLevelSummary = dataDefinition.perLevelSummary;
        }

        if( dataDefinition.powerDown ) {
            this.powerDown = dataDefinition.powerDown;
        }

        this.powerPointsPerLevel = false;
        if( dataDefinition.power_points_per_level ) {
            this.powerPointsPerLevel = true;
        }
        if( this.powerPoints.indexOf("/") > 0 ) {
            this.powerPointsPerLevel = true;
        }
        this.pickEdge = dataDefinition.pick_edge;
        this.pickSkill = dataDefinition.pick_skill;
        this.pickAttribute = dataDefinition.pick_attribute;
        if( dataDefinition.pick_trait )
            this.pickTrait = dataDefinition.pick_trait;

        if( dataDefinition.effects && dataDefinition.effects.length > 0 ) {
            this.effects = dataDefinition.effects;
        }

        this.specificMods = parse2021SpecificMods( dataDefinition.specific_mods );
        // console.log("this.specificMods", this.specificMods)
    }

    isOverPowerLimit( theBestThereIs: boolean = false ): number {
        if( this._char && this.getPoints() > this._char.getSuperPowers2021CurrentPowerLimit(theBestThereIs) ) {
            return this.getPoints() - this._char.getSuperPowers2021CurrentPowerLimit(theBestThereIs);
        }

        return 0;
    }

    getPowerPointsText(): string {

        if( this.powerPoints.length > 10 ) {
            if( this.powerPoints.indexOf("/") > -1 ) {
                let split = this.powerPoints.split("/");
                return split[0] + " to " + split[split.length -1 ];
            }
        }

        return this.powerPoints;
    }

    hasPowerModifier( mod: string ): boolean {

        for( let modName in this.activeMods ) {
            if( modName == mod ) {
                return true;
            }
        }

        return false;
    }

    getPointsApplied(): number {
        let points = this.getPoints();

        // console.log("getPointsApplied called"), this.name, this.getName(), this.uuid ;

        if( this.hasPowerModifier("switchable") && this._char ) {
            // let setCount = 0;
            let highestCost = 0;
            let highestCostUUID = "";

            let usedUUIDs: string[] = [];
            for( let edge of this._char.getEdgesSelected()) {
                // console.log("edge.swade_super_powers", edge.swade_super_powers);
                if( edge.swade_super_powers && edge.swade_super_powers.length > 0  ) {

                    for( let power of edge.swade_super_powers ) {
                        // console.log("getPointsApplied", power.getName(), power.uuid, usedUUIDs );
                        if( usedUUIDs.indexOf(power.uuid) > -1 ) {
                            // console.log("getPointsApplied", "new uuid" );
                            power.uuid = generateUUID();
                        }
                        usedUUIDs.push(power.uuid);
                        // console.log("getPointsApplied 2", power.uuid, usedUUIDs );

                        if (
                            power.id == this.id
                            &&
                            power.hasPowerModifier("switchable")
                        ) {
                            // setCount++;
                            // console.log("getPointsApplied", power.getPoints(), highestCost, highestCostUUID );
                            let power_points = power.getPoints();
                            if(
                                power_points > highestCost
                            ) {
                                highestCost = power_points
                                highestCostUUID = power.uuid;
                                // points = power_points;
                            }

                        }
                    }
                }
                if( highestCostUUID != this.uuid ) {
                    points = 1;
                }
            }

        }

        return points;
    }

    getPoints(): number {
        let currentPoints = 0;

        if( this.powerPoints.indexOf("/") > 0 ) {
            let split = this.powerPoints.split("/")
            if( split.length > this.levels - 1 ) {
                currentPoints = +split[this.levels - 1];
            }
        } else {
            currentPoints = +this.powerPoints;
        }

        for( let keyName of Object.keys( this.activeMods ) ) {
            if (this.activeMods[keyName] > -90 && keyName != "switchable" ) {
                currentPoints += this.activeMods[keyName];
            }
        }

        if( currentPoints < 1) {
            currentPoints = 1;
        }
        return currentPoints;
    }

    getPointsHR(): string {
        let currentPoints = this.getPoints();
        let currentPointsApplied = this.getPointsApplied();

        if( currentPoints == currentPointsApplied ) {
            return currentPoints.toString();
        } else {
            return currentPointsApplied.toString() + " (" + currentPoints.toString() + ")"
        }

    }

    getModPoints(): number {
        let rv = 0;
        for( let keyName of Object.keys( this.activeMods ) ) {
            if( this.activeMods[keyName] > -90 )
                rv += this.activeMods[keyName];
        }

        return rv;
    }

    exportOptions(): ISuperPower2021ObjectVars {

        let rv: ISuperPower2021ObjectVars = super.exportOptions() as ISuperPower2021ObjectVars;

        rv.specifyAlternateTrait = this.specifyAlternateTrait;
        rv.powerType = this.powerType;
        rv.active_mods = this.activeMods;
        rv.custom_description = this.customDescription;
        rv.custom_name = this.customName;
        rv.id = this.id;
        rv.levels = this.levels;
        rv.pick1 = this.pick1;
        rv.pick2 = this.pick2;
        rv.specify_contingent = this.specifyContingent;
        rv.specify_device = this.specifyDevice;
        rv.specify_limitation = this.specifyLimitation;
        rv.specify_limitation2 = this.specifyLimitation2;
        rv.specify_limitation3 = this.specifyLimitation3;
        rv.specify_limitation4 = this.specifyLimitation4;
        rv.specify_limitation5 = this.specifyLimitation5;

        rv.activated = this.activated;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    export(): IChargenSuperPower2021 {

        let specificModExport: string[] = [];

        for( let itemTag in this.specificMods ) {

            specificModExport.push(
                itemTag  + ";" + this.specificMods[itemTag].name + ";" + this.specificMods[itemTag].value + ";" + this.specificMods[itemTag].valueLabels
            )
        }

        let rv: IChargenSuperPower2021 = super.export() as IChargenSuperPower2021;

        rv.powerDown = this.powerDown;
        rv.power_points = this.powerPoints;
        rv.perLevelSummary = this.perLevelSummary;
        rv.specific_mods = specificModExport;
        rv.power_points_per_level = this.powerPointsPerLevel;
        rv.pick_edge = this.pickEdge;
        rv.pick_skill = this.pickSkill;
        rv.pick_attribute = this.pickAttribute;
        rv.pick_trait = this.pickTrait;
        rv.effects = this.effects;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    public calcReset() {
        this.hasBeenApplied = false;
        this.theBestThereIs = false;
    }

    public getName(
        noDescriptors: boolean = false,
    ): string {

        if(!this._char )
            return this.name;

        let descriptors: string[] = [];

        if( this.customName && this.customName.trim() ) {
            descriptors.push( this.name )
        }

        if( this.powerPoints.indexOf("/") > -1 ) {
            descriptors.push(this.levels.toString() );
        }

        if( this.powerType && this.powerType.trim() ) {
            descriptors.push(this.powerType );
        }

        if( this.pickAttribute ) {
            if( this.pick1 && this.pick1.trim() )
                descriptors.push( titleCaseString( this.pick1)) ;
            else
                descriptors.push( titleCaseString( "-Unselected-" ) );
        } else if( this.pickSkill ) {
            if( this.pick1 && this.pick1.trim() )
                descriptors.push( titleCaseString( this.pick1) );
            else
                descriptors.push( titleCaseString( "-Unselected-" ) );
        } else if( this.pickTrait) {
            if( this.activeMods["any-trait"] && +this.activeMods["any-trait"] > 0 ) {
                descriptors.push( titleCaseString( "Any Trait" ) );
            } else {
                if( this.pick1 && this.pick1.trim() )
                    descriptors.push( titleCaseString( this.pick1 ) );
                else
                    descriptors.push( titleCaseString( "-Unselected-" ) );
            }

        }

        let descriptorText = "";
        if(noDescriptors) {
            descriptors = [];
        }
        if( descriptors.length > 0 ) {
            descriptorText =  " (" + descriptors.join("; ") + ")"
        }

        if( this.customName && this.customName.trim() ) {
            if( descriptors.length > 0 )
            return this.customName + descriptorText;
        } else {
            return this.name + descriptorText;
        }

        // if( this.powerType && this.powerType.trim() ) {
        //     if( this.customName ) {
        //         return this.customName + " (" + this.name + ", " + this.powerType + ")";
        //     } else {
        //         if( this.name.trim().toLowerCase() == "super attribute") {
        //             return this.name + ": " + this.pick1 + " (" + this.powerType + ")";
        //         } else if( this.name.trim().toLowerCase() == "super skill") {
        //             return this.name + ": " + this.pick1 + " (" + this.powerType + ")";
        //         } else {
        //             return this.name + " (" + this.powerType + ")";
        //         }
        //     }
        // } else {
        //     if( this.customName ) {
        //         return this.customName + " (" + this.name + ")";
        //     } else {
        //         if( this.name.trim().toLowerCase() == "super attribute") {
        //             return this.name + ": " + this.pick1 + "";
        //         } else if( this.name.trim().toLowerCase() == "super skill") {
        //             return this.name + ": " + this.pick1 + "";
        //         } else {
        //             return this.name;
        //         }
        //     }
        // }
        return this.name;
    }

    public numberOfActiveMods(): number {
        let rv = 0;

        for( let mod of Object.keys(this.activeMods) ) {
            if( this.activeMods[mod] > -90 )  {
                rv++;
            }
        }

        return rv;
    }

    public getSummary(): string {
        let rv = "";

        if( this.levels -1  < this.perLevelSummary.length ) {
            if( this.perLevelSummary[this.levels -1 ] && this.perLevelSummary[this.levels -1 ].trim() ) {
                rv += this.perLevelSummary[this.levels -1 ];
            } else {
                rv += this.summary;
            }
        } else {
            rv += this.summary;
        }

        if( this.getModsString() )
            rv += " - " + this.getModsString();

        if( this.customDescription && this.customDescription.trim() )
            rv += " - " + this.customDescription;

        rv = replaceAll( rv, "[selected_level]", this.levels.toString());

        let ed = this._getExtraDamage("");
        if( ed ) {
            rv = replaceAll( rv, "+d4", ed);
        }

        if( this.theBestThereIs ) {
            if( rv ) {
                rv = rv + " | " ;
            }
            rv = rv + "\"The Best There Is!\"";
        }
        return rv;

    }

    public getModName( modKey: string ): string {
        let rv = "(" + modKey + "?)";

        if( this.specificMods[modKey] ) {
            rv = this.specificMods[modKey].name;
        } else if( modKey == "alternate-trait" ) {
            rv = "Alternate Trait";
        } else if( modKey == "contingent" ) {
            rv = "Contingent";
        } else if( modKey == "device" ) {
            rv = "Device";
        } else if( modKey == "limitation" ) {
            rv = "Limitation";
        } else if( modKey == "limitation2" ) {
            rv = "Limitation";
        } else if( modKey == "limitation3" ) {
            rv = "Limitation";
        } else if( modKey == "limitation4" ) {
            rv = "Limitation";
        } else if( modKey == "limitation5" ) {
            rv = "Limitation";
        } else if( modKey == "projectile" ) {
            rv = "Projectile";
        } else if( modKey == "ranged-touch-attack" ) {
            rv = "Ranged Touch Attack";
        } else if( modKey == "requires-activation" ) {
            rv = "Requires Activation";
        } else if( modKey == "slow-to-activate" ) {
            rv = "Slow to Activate";
        }

        return rv;
    }

    public getModPage( modKey: string ): string {
        let rv = "(" + modKey + "?)";

        if( this.specificMods[modKey] ) {
            rv = this.book_page;
        } else if( modKey == "alternate-trait" ) {
            rv = "p44";
        } else if( modKey == "contingent" ) {
            rv = "p44";
        } else if( modKey == "device" ) {
            rv = "p45";
        } else if( modKey == "limitation" ) {
            rv = "p46";
        } else if( modKey == "limitation2" ) {
            rv = "p46";
        } else if( modKey == "limitation3" ) {
            rv = "p46";
        } else if( modKey == "limitation4" ) {
            rv = "p46";
        } else if( modKey == "limitation5" ) {
            rv = "p46";
        } else if( modKey == "projectile" ) {
            rv = "p18";
        } else if( modKey == "ranged-touch-attack" ) {
            rv = "p18";
        } else if( modKey == "requires-activation" ) {
            rv = "p44";
        } else if( modKey == "slow-to-activate" ) {
            rv = "p19";
        } else if( modKey == "heavy-weapon" ) {
            rv = "p45";
        }

        return rv;
    }

    public isMeleeAttack(): boolean {
        if( this.name.trim().toLowerCase().startsWith("melee attack (") ) {
            return true;
        }
        return false;
    }

    public isRangedAttack(): boolean {
        if( this.name.trim().toLowerCase().startsWith("ranged attack (") ) {
            return true;
        }
        return false;
    }

    public apply(
        charObj: PlayerCharacter | null,
        late: boolean,
    ) {

        if( this.hasBeenApplied ) {
            return;
        }
        this.hasBeenApplied = true;

        let effects: string[] = [];

        for( let line of this.effects ) {

            line = line.toLowerCase().replace( "[selected_level]", this.levels.toString() );

            if( line.toLowerCase().indexOf("[selected_skill]") > -1)  {
                if( this.pick1 && this.pickSkill ) {
                    line = line.toLowerCase().replace(/\[(.+?)\]/g, this.pick1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[selected_attribute]") > -1)  {
                if(  this.pick1 && this.pickAttribute ) {
                    line = line.toLowerCase().replace("[selected_attribute]", this.pick1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[choose_edge") > -1)  {
                if( this.pick1 && this.pickEdge ) {
                    // line = line.toLowerCase().replace("[select_edge]", this.selectedEdge);
                    line = line.replace(/\[(.+?)\]/g, this.pick1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[select_edge") > -1)  {
                if( this.pick1 && this.pickEdge ) {
                    // line = line.toLowerCase().replace("[select_edge]", this.selectedEdge);
                    line = line.replace(/\[(.+?)\]/g, this.pick1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[selected_edge") > -1)  {
                if( this.pick1 && this.pickEdge ) {
                    // line = line.toLowerCase().replace("[selected_edge", this.selectedEdge);
                    line = line.replace(/\[(.+?)\]/g, this.pick1);
                    effects.push(line);
                }
            }
            else if( line.toLowerCase().indexOf("[select_trait]") > -1)  {
                if( this.pick1 && this.pickTrait ) {
                    line = line.toLowerCase().replace("[select_trait]", this.pick1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[selected_trait]") > -1)  {
                if( this.pick1 && this.pickTrait ) {
                    line = line.toLowerCase().replace("[selected_trait]", this.pick1);
                    effects.push(line);
                }
            } else {
                effects.push(line);
            }

        }

        if(!charObj) {
            return;
        }

        ApplyCharacterEffects(
            effects,
            charObj,
            "Super Power: " + this.name,
            null,
            null,
            null,
            true, // applyImmediately
        );

        if( this.name.trim().toLowerCase() == "ageless" ) {
            if ("very-old" in this.activeMods && this.activeMods["very-old"] > 0) {
                this._char?.addSkillBonus("Common Knowledge", 2, null, "Edge");
            }
        }

        if( this.name.trim().toLowerCase() == "growth" ) {
            if ("permanent" in this.activeMods && this.activeMods["permanent"] != 0) {
                charObj._derivedBaseBoosts.toughness +=  this.levels;
                charObj._derivedBaseBoosts.size +=  this.levels;
                charObj._attributeBoosts.strength +=  this.levels;
            }
        }

        // Speed
        if( this.name.trim().toLowerCase() == "speed" ) {
            if (this.levels >= 9 ) {
                charObj._paceOverride = "Near Light Speed"
            } else if( this.levels >= 8) {
                charObj._paceOverride = "Super Sonic Speed (Mach 2+)"
            } else if( this.levels >= 7) {
                charObj._paceOverride = "Sonic Speed (Mach 1)"
            } else if( this.levels >= 6) {
                charObj._paceOverride = "360 (240 mph)"
            } else if( this.levels >= 5) {
                charObj._paceOverride = "180 (120 mph)"
            } else if( this.levels >= 4) {
                charObj._paceOverride = "90 (60 mph)"
            } else if( this.levels >= 3) {
                charObj._paceOverride = "45 (30 mph)"
            } else if( this.levels >= 2) {
                charObj._derivedBaseBoosts.pace_multiplier = 4
            } else if( this.levels >= 1) {
                charObj._derivedBaseBoosts.pace_multiplier = 2
            }
        }

        if( this.name.trim().toLowerCase() == "ranged attack" && !late ) {
            let range = "12/24/48"
            let damage = "";

            let additionalMeleeDamage = false;

            let numberDiceDamage = this.levels + 1;
            if( numberDiceDamage > 6 ) {
                numberDiceDamage = 6;
            }
            if ("enhanced-damage" in this.activeMods && this.activeMods["enhanced-damage"] > 0) {
                damage = "" + numberDiceDamage.toString() + "d10"
            } else {
                damage = "" + numberDiceDamage.toString() + "d6"
            }

            let ap = 0;
            let rof = 1
            let notes = "Super Power, "

            // if ("range" in this.activeMods && this.activeMods["range"] > 0) {
            //     if( this.activeMods["range"] == 2 ) {
            //         range = "24/48/96";
            //     }
            //     if( this.activeMods["range"] == 4 ) {
            //         range = "50/100/200";
            //     }
            // }

            if ("heavy-weapon" in this.activeMods && this.activeMods["heavy-weapon"] > 0) {
                notes += "HW, "
            }

            if ("armor-piercing" in this.activeMods && this.activeMods["armor-piercing"] > 0) {
                // ap = (this.activeMods["armor-piercing"] ).toString()
                ap = (this.activeMods["armor-piercing"] * 2);
                notes += "AP " + ap + ", "
            }

            if ("rate-of-fire" in this.activeMods && this.activeMods["rate-of-fire"] > 0) {
                if( this.activeMods["rof"] == 3) {
                    rof = 2
                }
                if( this.activeMods["rof"] == 6 ) {
                    rof = 3
                }
                // if( this.activeMods["rof"] == 9 ) {
                //     rof = 4
                // }
                // if( this.activeMods["rof"] == 12 ) {
                //     rof = 5
                // }

                notes += "ROF " + rof.toString() + ", "
            }

            if ("cone" in this.activeMods && this.activeMods["cone"] > 0) {
                if( this.activeMods["rof"] == 0 ) {
                    range = "Cone"
                }
                if( this.activeMods["rof"] == 1 ) {
                    range = range + " or Cone"
                }
            }

            if (notes.length > 0) {
                notes = notes.substring(0, notes.length - 2);
            }

            let heavy = this.hasPowerModifier("heavy-weapon");

            // if ("stackable" in this.activeMods && this.activeMods["stackable"] > 0) {
            //     charObj._additionalMeleeDamage = damage;
            // }

            let powerHasBeenAdded = false;
            if( this.hasPowerModifier("switchable"))  {
                for( let attack of charObj._innateAttacks ) {
                    if(
                        attack.powerID
                        && attack.powerPoints
                        && this.id == attack.powerID
                        && attack.name != this.getCustomName()
                    ) {
                        if(!attack.attackProfiles) {
                            attack.attackProfiles = [];
                        }
                        attack.attackProfiles.push( {

                            name: this.getCustomName(),
                            damage: "",
                            damageWithBrackets: "",
                            damage_original: "",
                            parry_modifier: 0,
                            range: range,
                            reach: 0,
                            requires_2_hands: false,
                            rof: 1,
                            shots: 0,
                            currentShots: 0,
                            additionalDamage: damage,

                            heavy_weapon: heavy,
                            melee_only: false,
                            counts_as_innate: true,
                            notes: notes + " | Switchable Power",
                            equipped: true,

                            toHitMod: 0,

                            damageDiceBase: "",
                            damageDiceBasePlus: 0,

                            is_shield: false,
                            thrown_weapon: false,

                            usable_in_melee: false,
                            add_strength_to_damage: false,
                            ap: +ap,
                            ap_vs_rigid_armor_only: 0,

                            vtt_only: false,

                            skillName: "Shooting",
                            skillValue: this._char ? getDieLabelFromIndex(this._char.getSkillValue("Shooting")) : "",
                        });
                        powerHasBeenAdded = true;
                    }
                }
            }

            if( !powerHasBeenAdded ) {
                charObj._innateAttacks.push({
                    name: this.getCustomName(),
                    range: range,
                    damage: damage,
                    addsStrength: false,
                    ap: +ap,
                    reach: 0,
                    notes: notes,
                    apIsAgilityDie: false,
                    apIsPsionic: false,
                    apIsHalfPsionic: false,
                    apIsDoublePsionic: false,
                    apIsSize: false,
                    dontStepUnarmedDamage: false,
                    equippedSecondary: false,
                    additionalDamage: "",
                    equippedPrimary: false,
                    parry: 0,
                    tempToHit: 0,
                    apSizeBonus: 0,
                    tempParry: 0,
                    damageBoost: 0,
                    noGlobalDamageAdd: true,

                    powerID: this.id,
                    powerPoints: this.getPoints(),
                })
            }
        }

        // // Melee Attack
        if( this.isMeleeAttack() && !late ) {

            if( !charObj.hasInnateAttack(this.getCustomName()) ) {
                let range = "Melee"
                let damage = "";
                if ("enhanced-damage" in this.activeMods && this.activeMods["enhanced-damage"] > 0) {
                    damage = "" + this.levels.toString() + "d10"
                } else {
                    damage = "" + this.levels.toString() + "d6"
                }
                let ap = 0;
                let notes = "Super Power, "
                let reach = 0;
                if ("heavy-weapon" in this.activeMods && this.activeMods["heavy-weapon"] > 0) {
                    notes += "HW, "
                }

                if ("armor-piercing" in this.activeMods && this.activeMods["armor-piercing"] > 0) {
                    ap = (this.activeMods["armor-piercing"] * 2);
                    notes += "AP " + ap + ", "
                }

                if ("reach" in this.activeMods && this.activeMods["reach"] > 0) {
                    notes += "Reach " + this.activeMods["reach"].toString()
                    reach = +this.activeMods["reach"];
                }

                // console.log("power damage 1", damage, ap, late)
                damage = this._getExtraDamage(damage);
                // console.log("power damage 2", damage, ap, late)

                if (notes.length > 0) {
                    notes = notes.substring(0, notes.length - 2);
                }

                let heavy = this.hasPowerModifier("heavy-weapon");

                // if ("stackable" in this.activeMods && this.activeMods["stackable"] > 0) {
                //     charObj._additionalMeleeDamage = damage;
                // }

                let powerHasBeenAdded = false;
                if( this.hasPowerModifier("switchable"))  {
                    for( let attack of charObj._innateAttacks ) {
                        if(
                            attack.powerID
                            && attack.powerPoints
                            && this.id == attack.powerID
                            && attack.name != this.getCustomName()
                        ) {
                            if(!attack.attackProfiles) {
                                attack.attackProfiles = [];
                            }
                            attack.attackProfiles.push( {

                                name: this.getCustomName(),
                                damage: "",
                                damageWithBrackets: "",
                                damage_original: "",
                                parry_modifier: 0,
                                range: "Melee",
                                reach: reach,
                                requires_2_hands: false,
                                rof: 1,
                                shots: 0,
                                currentShots: 0,
                                additionalDamage: damage,

                                heavy_weapon: heavy,
                                melee_only: true,
                                counts_as_innate: true,
                                notes: notes + " | Switchable Power",
                                equipped: true,

                                toHitMod: 0,

                                damageDiceBase: "",
                                damageDiceBasePlus: 0,

                                is_shield: false,
                                thrown_weapon: false,

                                usable_in_melee: true,
                                add_strength_to_damage: true,
                                ap: +ap,
                                ap_vs_rigid_armor_only: 0,

                                vtt_only: false,

                                skillName: "Fighting",
                                skillValue: this._char ? getDieLabelFromIndex(this._char.getSkillValue("Fighting")) : "",
                            });
                            powerHasBeenAdded = true;
                        }
                    }
                }

                if( !powerHasBeenAdded ) {
                    charObj._innateAttacks.push({
                        name: this.getCustomName(),
                        range: range,
                        damage: "",
                        addsStrength: true,
                        ap: +ap,
                        reach: reach,
                        notes: notes,
                        apIsAgilityDie: false,
                        apIsPsionic: false,
                        apIsHalfPsionic: false,
                        apIsDoublePsionic: false,
                        apIsSize: false,
                        equippedSecondary: false,
                        dontStepUnarmedDamage: false,
                        additionalDamage: damage,
                        equippedPrimary: false,
                        parry: 0,
                        tempToHit: 0,
                        tempParry: 0,
                        apSizeBonus: 0,
                        damageBoost: 0,
                        noGlobalDamageAdd: true,
                        powerID: this.id,
                        powerPoints: this.getPoints(),
                    })
                }
            }

        }

        // Armor
        if( this.name.trim().toLowerCase() == "armor" && !late ) {
            charObj._derivedBaseBoosts.armor += this.levels * 2
        }

        // // Toughness
        // if( this.name.trim().toLowerCase() == "toughness" && !late ) {
        //     charObj._derivedBaseBoosts.toughness += this.levels
        // }

        // // Parry
        // if( this.name.trim().toLowerCase() == "parry" && !late ) {
        //     charObj._derivedBaseBoosts.parry += this.levels
        // }

        // // Undead
        // if( this.name.trim().toLowerCase() == "undead" && !late ) {
        //     charObj._derivedBaseBoosts.toughness += 2;
        // }

        // Speed
        if( this.name.trim().toLowerCase() == "speed" && late ) {
            if (this.levels >= 7 ) {
                charObj._paceOverride = "Near Light Speed"
            } else if( this.levels >= 6) {
                charObj._paceOverride = "Super Sonic Speed (Mach 2+)"
            } else if( this.levels >= 5) {
                charObj._paceOverride = "Sonic Speed (Mach 1)"
            } else if( this.levels >= 4) {
                charObj._paceOverride = "96 (240 mph)"
            } else if( this.levels >= 3) {
                charObj._paceOverride = "48 (120 mph)"
            } else if( this.levels >= 2) {
                charObj._derivedBaseBoosts.pace_multiplier = 4
            } else if( this.levels >= 1) {
                charObj._derivedBaseBoosts.pace_multiplier = 2
            }
        }

        // // Super Attribute
        // if( this.pickAttribute && this.pick1 && !late ) {
        //     if( this.pick1 == "agility" ) {
        //         charObj.boostAttribute("agility", this.levels)
        //     }
        //     if( this.pick1 == "smarts" ) {
        //         charObj.boostAttribute("smarts", this.levels)
        //     }
        //     if( this.pick1 == "spirit" ) {
        //         charObj.boostAttribute("spirit", this.levels)
        //     }
        //     if( this.pick1 == "vigor" ) {
        //         charObj.boostAttribute("vigor", this.levels)
        //     }
        //     if( this.pick1 == "strength" || this.pick1 == "strengh" ) {
        //         charObj.boostAttribute("strength", this.levels)
        //     }
        // }

        // Growth
        // if( this.name.trim().toLowerCase() === "growth"  && !late ) {
        //     charObj.boostAttribute("strength", +this.levels)
        //     charObj._derivedBaseBoosts.size += +this.levels;
        //     charObj._derivedBaseBoosts.toughness += +this.levels;
        // }

        // Super Edge
        if( this.pickEdge && this.pick1 && !late ) {
            charObj.edgeAddByNameOrId(
                this.pick1,
                this.pick2,
                "Super Power",
                false,
            )
        }

        // Super Skill
        // if( this.pickSkill && this.pick1 && !late ) {
        //     let skillName = this.pick1;
        //     if( this.pick2.trim() ) {
        //         skillName += " (" + this.pick2.trim() + ")"
        //     }
        //     charObj.addSuperSkillBoost(
        //         skillName,
        //         this.levels,
        //     )
        // }

    }

    getCustomName(): string {
        if( this.customName && this.customName.trim() ) {
            return this.customName;
        }
        return this.getName();
    }

    _getExtraDamage(
        damage: string,
    ): string {

        if( this.name.indexOf("(Claws)") > -1 ) {
            if ("upgraded-claws" in this.activeMods && this.activeMods["upgraded-claws"] > 0) {
                if( this.activeMods["upgraded-claws"] === 1 ) {
                    damage = "+1d6";
                } else if( this.activeMods["upgraded-claws"] === 3 ) {
                    damage = "+2d6";
                }
            } else {
                damage = "+1d4";
            }
        }

        if( this.name.indexOf("(Bite)") > -1 ) {
            if ("upgraded-bite" in this.activeMods && this.activeMods["upgraded-bite"] > 0) {
                if( this.activeMods["upgraded-bite"] === 1 ) {
                    damage = "+1d6";
                } else if( this.activeMods["upgraded-bite"] === 3 ) {
                    damage = "+2d6";
                }
            } else {
                damage = "+1d4";
            }
        }

        if( this.name.indexOf("(Horns)") > -1 ) {
            if ("upgraded-horns" in this.activeMods && this.activeMods["upgraded-horns"] > 0) {
                if( this.activeMods["upgraded-horns"] === 1 ) {
                    damage = "+1d6";
                } else if( this.activeMods["upgraded-horns"] === 3 ) {
                    damage = "+2d6";
                }
            } else {
                damage = "+1d4";
            }
        }

        // if( this._char ) {
        //     if(this._char._unarmedDamageStepBonus ) {
        //         let damageItems = damage.split("+");
        //         let newDamage: string[] = [];
        //         let changedPrimaryDie = false;

        //         for( let bit of damageItems ) {
        //             // console.log( "bit", bit);
        //             if(
        //                 bit.toLowerCase().indexOf("d") > -1
        //                     &&
        //                 bit.toLowerCase().indexOf("str") == -1
        //                     &&
        //                 changedPrimaryDie == false
        //             ) {
        //                 let split  = bit.split("d", 2)
        //                 let prefix = split[0];
        //                 let baseDie = "d" + split[1];
        //                 let attackDieIndex = getDieIndexFromLabel( baseDie );

        //                 attackDieIndex = attackDieIndex + this._char._unarmedDamageStepBonus

        //                 bit = prefix + getDieLabelFromIndex( attackDieIndex )

        //                 //primary die area upgraded, upgrade no more
        //                 changedPrimaryDie = true;
        //                 newDamage.push( bit )
        //             } else {
        //                 newDamage.push( bit )
        //             }
        //         }
        //         damage = newDamage.join("+")
        //     }
        // }

        return damage;
    }

    getModValueLabel( modValue: string, modTag: string ): string {

        if( this.specificMods[modTag] && this.specificMods[modTag].valueLabels ) {
            if( this.specificMods[modTag].valueLabels.indexOf("/") > -1) {
                let valueLabelArray = this.specificMods[modTag].valueLabels.split("/");
                let valueArray = this.specificMods[modTag].value.split("/");
                let modIndex = -1;

                for( let valIndex in valueArray ) {
                    if( valueArray[valIndex] === modValue || valueArray[valIndex] === "+" + modValue) {
                        modIndex = +valIndex;
                    }
                }
                if( valueLabelArray.length > modIndex && valueLabelArray[modIndex] ) {
                    return valueLabelArray[modIndex].toString();
                }
            } else {
                return this.specificMods[modTag].valueLabels;
            }
        }

        if( modTag === "heavy-weapon" ) {
            return "Heavy Weapon (" + modValue.toString() + ")";
        }
        if( modTag === "forceful" ) {
            return "Forceful (" + modValue.toString() + ")";
        }
        if( modTag === "selective" ) {
            return "Selective (" + modValue.toString() + ")";
        }
        if( modTag === "limitation" ) {
            return "Limitation (" + modValue.toString() + "): " + this.specifyLimitation;
        }
        if( modTag === "limitation2" ) {
            return "Limitation (" + modValue.toString() + "): " + this.specifyLimitation2;
        }
        if( modTag === "limitation3" ) {
            return "Limitation (" + modValue.toString() + "): " + this.specifyLimitation3;
        }
        if( modTag === "limitation4" ) {
            return "Limitation (" + modValue.toString() + "): " + this.specifyLimitation4;
        }
        if( modTag === "limitation5" ) {
            return "Limitation (" + modValue.toString() + "): " + this.specifyLimitation5;
        }
        if( modTag === "device" ) {
            return "Device (" + modValue.toString() + "): " + this.specifyDevice;
        }

        if( modTag === "alternate-trait" ) {
            return "Alternate Trait (" + modValue.toString() + "): " + this.specifyAlternateTrait;
        }

        if( modTag === "contingent" ) {
            return "Contingent (" + modValue.toString() + "): " + this.specifyContingent;
        }
        if( modTag === "special" ) {
            return "Special (" + modValue.toString() + ")";
        }

        if( modTag === "Selective" ) {
            return "Selective (" + modValue.toString() + ")";
        }

        if( modTag === "switchable" ) {
            return "Switchable (" + modValue.toString() + ")";
        }

        if( modTag === "range" ) {
            if( this.activeMods["range"] && this.activeMods["range"] === 2 )
                return "Double Range (" + modValue.toString() + ")";
            if( this.activeMods["range"] && this.activeMods["range"] === 4 )
                return "Triple Range (" + modValue.toString() + ")";
        }

        return modValue.toString()
    }

    public getModsString(): string {
        let items: string[] = []

        for( let modKey of Object.keys(this.activeMods) ) {
            let modValue = +this.activeMods[modKey]
            if(
                modValue > -90
                // &&
                // modKey != "device"
            ) {

                let valueLabel = this.getModValueLabel(modValue.toString(), modKey) ;
                if( valueLabel )
                    items.push( valueLabel )
                else
                    items.push( this.getModName(modKey) + " (" + modValue.toString() + ") " )
            }

        }

        return items.join( ", ");
    }
}

export function parse2021SpecificMods(
    specific_mods: string | string[],
): {
    [index: string]: ISPCMod
} {
    let specificMods: {
        [index: string]: ISPCMod
    } = {};

    let importMods: string[] = [];
    if( typeof( specific_mods) === "string") {
        importMods = JSON.parse( specific_mods );
    } else {
        importMods = specific_mods;
    }

    if( importMods && importMods.length > 0 ) {

        for( let item of importMods ) {
            if( item && item.trim() ) {
                let split = item.split(";")
                specificMods[ split[0] ] = {
                    name: split[1],
                    value: split[2],
                    valueLabels: "",
                };

                if( split.length > 2 && split[3] ) {
                    specificMods[ split[0] ].valueLabels = split[3];
                }

                if( split.length > 3 && split[4] ) {
                    specificMods[ split[0] ].valueLabels = split[4];
                }

                if( split.length > 4 && split[5] ) {
                    specificMods[ split[0] ].valueLabels = split[5];
                }
            }
        }
    }
    return specificMods;
}

