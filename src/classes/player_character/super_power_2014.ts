import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from "../_base_object";
import { PlayerCharacter } from "./player_character";

export interface ISuperPower2014ObjectVars extends IBaseObjectVars{
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
    switchable_set: string;

    activated: boolean;
}

export interface IChargenSuperPower2014 extends IBaseObjectExport {

    power_points: string;
    summary: string;
    specific_mods: string | string[];
    power_points_per_level: boolean;
    pick_edge: boolean;
    pick_skill: boolean;
    pick_attribute: boolean;

}

interface ISPCMod {
    [tag: string]: string;
    name: string;
    value: string;
    remark: string;
    noIdea: string;
    valueLabels: string;
}

export class SuperPower2014 extends BaseObject {

    name: string = "";

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
    switchableSet: string = "";

    createdByName: string = "";
    deletedByName: string = "";
    updatedByName: string = "";

    createdBy: number = 0;
    deletedBy: number = 0;
    updatedBy: number = 0;

    createdOn: Date = new Date();
    deletedOn: Date = new Date();
    updatedOn: Date = new Date();

    active: boolean = true;
    powerPoints: string = "";
    summary: string = "";
    specificMods: {
        [index: string]: ISPCMod
    } = {};

    powerPointsPerLevel: boolean = false;
    pickEdge: boolean = false;
    pickSkill: boolean = false;
    pickAttribute: boolean = false;
    bookID: number = 0;
    bookName: string = "";
    bookPage: string = "";
    bookShortName: string = "";
    bookPublisher: string = "";
    bookPublished: string = "";
    bookPrimary: boolean = false;
    bookCore: boolean = false;
    activated: boolean = false;

    constructor(
        dataDefinition: IChargenSuperPower2014 | null = null,
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

    importOptions(importObj: ISuperPower2014ObjectVars | null ) {
        if( importObj ) {
            super.importOptions( importObj );
            this.customName = importObj.custom_name;
            this.customDescription = importObj.custom_description;
            this.switchableSet = importObj.switchable_set;
            this.activeMods = importObj.active_mods;

            this.levels = importObj.levels;
            this.pick1 = importObj.pick1;
            this.pick2 = importObj.pick2;
            this.specifyContingent = importObj.specify_contingent;
            this.specifyDevice = importObj.specify_device;
            this.specifyLimitation = importObj.specify_limitation;
            this.activated = false;
            if( typeof(importObj.activated) != "undefined" ) {
                this.activated = importObj.activated;
            } else {
                this.activated = true;
            }
        } else {
            this.activated = true;
        }

        if( this.pick1 == "strengh" ) {
            this.pick1 = "strength";
        }

        if( !this.switchableSet ) {
            this.switchableSet = "";
        }
    }

    import( dataDefinition: IChargenSuperPower2014 ) {
        super.import(dataDefinition, this._char ? this._char.getAvailableData().books : [] );

        this.active = false;
        if( dataDefinition.active )
            this.active = true;

        if( dataDefinition.power_points)
            this.powerPoints = dataDefinition.power_points;
        if( dataDefinition.summary )
            this.summary = dataDefinition.summary;

        this.powerPointsPerLevel = false;
        if( dataDefinition.power_points_per_level ) {
            this.powerPointsPerLevel = true;
        }
        if( this.powerPoints.indexOf(",") > 0 ) {
            this.powerPointsPerLevel = true;
        }
        this.pickEdge = dataDefinition.pick_edge;
        this.pickSkill = dataDefinition.pick_skill;
        this.pickAttribute = dataDefinition.pick_attribute;

        this.specificMods = {}
        let importMods: string[] = [];
        if( typeof( dataDefinition.specific_mods) == "string") {
            importMods = JSON.parse( dataDefinition.specific_mods );
        } else {
            importMods =  dataDefinition.specific_mods;
        }

        if( importMods && importMods.length > 0 ) {
            for( let item of importMods ) {
                let split = item.split(";")
                this.specificMods[ split[0] ] = {
                    name: split[1],
                    value: split[2],
                    remark: "",
                    noIdea: "",
                    valueLabels: "",
                };

                if( split.length > 2 && split[3] ) {
                    this.specificMods[ split[0] ].remark = split[3];
                }

                if( split.length > 3 && split[4] ) {
                    this.specificMods[ split[0] ].noIdea = split[4];
                }

                if( split.length > 4 && split[5] ) {
                    this.specificMods[ split[0] ].valueLabels = split[5];
                }
            }
        }
    }

    getPoints(): number {
        let currentPoints = 0;

        if( this.powerPoints.indexOf(",") > 0 ) {
            let split = this.powerPoints.split(",")
            if( split.length > this.levels - 1 ) {
                currentPoints = +split[this.levels - 1];
            }
        } else {
            currentPoints = +this.powerPoints;
        }

        for( let keyName of Object.keys( this.activeMods ) ) {
            currentPoints += this.activeMods[keyName];
        }

        if( currentPoints < 1) {
            currentPoints = 1;
        }
        return currentPoints;
    }

    exportOptions(): ISuperPower2014ObjectVars {

        let rv: ISuperPower2014ObjectVars = super.exportOptions() as ISuperPower2014ObjectVars;

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
        rv.switchable_set = this.switchableSet;
        rv.activated = this.activated;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    export(): IChargenSuperPower2014 {

        let specificModExport: string[] = [];

        for( let itemTag in this.specificMods ) {

            specificModExport.push(
                itemTag
                + ";" + this.specificMods[itemTag].name
                + ";" + this.specificMods[itemTag].value
                + ";" + this.specificMods[itemTag].remark + ";"
                + this.specificMods[itemTag].noIdea + ";"
                + this.specificMods[itemTag].valueLabels
            )
        }

        let rv: IChargenSuperPower2014 = super.export() as IChargenSuperPower2014;

        rv.power_points = this.powerPoints;
        rv.summary = this.summary;
        rv.specific_mods = specificModExport;
        rv.power_points_per_level = this.powerPointsPerLevel;
        rv.pick_edge = this.pickEdge;
        rv.pick_skill = this.pickSkill;
        rv.pick_attribute = this.pickAttribute;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    public getName(): string {
        if( this.customName ) {
            return this.customName + " (" + this.name + ")";
        } else {
            if( this.name.trim().toLowerCase() == "super attribute") {
                return this.name + ": " + this.pick1 + "";
            } else if( this.name.trim().toLowerCase() == "super skill") {
                return this.name + ": " + this.pick1 + "";
            } else {
                return this.name;
            }
        }
    }

    public numberOfActiveMods(): number {
        let rv = 0;

        for( let mod of Object.keys(this.activeMods) ) {
            if( this.activeMods[mod] !== 0 )  {
                rv++;
            }
        }

        return rv;
    }

    public getSummary(): string {
        let rv = this.summary;

        if( this.getModsString() )
            rv += " - " + this.getModsString();

        if( this.customDescription )
            rv += " - " + this.customDescription;
        return rv;

    }
    public getModName( modKey: string ): string {
        let rv = "(" + modKey + "?)";

        if( this.specificMods[modKey] ) {
            rv = this.specificMods[modKey].name;
        } else if( modKey == "contingent" ) {
            rv = "Contingent";
        } else if( modKey == "device" ) {
            rv = "Device";
        } else if( modKey == "limitation" ) {
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
        } else if( modKey == "contingent" ) {
            rv = "p18";
        } else if( modKey == "device" ) {
            rv = "p18";
        } else if( modKey == "limitation" ) {
            rv = "p18";
        } else if( modKey == "projectile" ) {
            rv = "p18";
        } else if( modKey == "ranged-touch-attack" ) {
            rv = "p18";
        } else if( modKey == "requires-activation" ) {
            rv = "p18";
        } else if( modKey == "slow-to-activate" ) {
            rv = "p19";
        }

        return rv;
    }

    public apply(
        charObj: PlayerCharacter,
        late: boolean,
    ) {
        // Ranged Attack
        if( !this.activated ) {
            return;
        }

        if( this.name.trim().toLowerCase() == "attack, ranged" && !late ) {
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

            let ap = "0";
            let rof = 1
            let notes = "Super Power, "

            if ("range" in this.activeMods && this.activeMods["range"] > 0) {
                if( this.activeMods["range"] == 2 ) {
                    range = "24/48/96";
                }
                if( this.activeMods["range"] == 4 ) {
                    range = "50/100/200";
                }
            }

            if ("heavy-weapon" in this.activeMods && this.activeMods["heavy-weapon"] > 0) {
                notes += "HW, "
            }

            if ("armor-piercing" in this.activeMods && this.activeMods["armor-piercing"] > 0) {
                ap = (this.activeMods["armor-piercing"] * 2).toString()
                notes += "AP " + ap + ", "
            }

            if ("rof" in this.activeMods && this.activeMods["rof"] > 0) {
                if( this.activeMods["rof"] == 3) {
                    rof = 2
                }
                if( this.activeMods["rof"] == 6 ) {
                    rof = 3
                }
                if( this.activeMods["rof"] == 9 ) {
                    rof = 4
                }
                if( this.activeMods["rof"] == 12 ) {
                    rof = 5
                }

                notes += "ROF " + rof.toString() + ", "
            }

            if ("cone" in this.activeMods && this.activeMods["cone"] > 0) {
                if( this.activeMods["rof"] == 1 ) {
                    range = "Cone"
                }
                if( this.activeMods["rof"] == 2 ) {
                    range = range + " or Cone"
                }
            }

            if (notes.length > 0) {
                notes = notes.substring(0, notes.length - 2);
            }

            charObj._innateAttacks.push({
                name: this.getName(),
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
                additionalDamage: "",
                dontStepUnarmedDamage: false,
                equippedSecondary: false,
                equippedPrimary: false,
                parry: 0,
                tempToHit: 0,
                apSizeBonus: 0,
                tempParry: 0,
                damageBoost: 0,
                noGlobalDamageAdd: true,
            })
        }

        // Melee Attack
        if( this.name.trim().toLowerCase() == "attack, melee" && !late ) {
            let range = "Melee"
            let damage = "";
            if ("enhanced-damage" in this.activeMods && this.activeMods["enhanced-damage"] > 0) {
                damage = "" + this.levels.toString() + "d10"
            } else {
                damage = "" + this.levels.toString() + "d6"
            }
            let ap = "0"
            let notes = "Super Power, "
            let reach = 0;
            if ("heavy-weapon" in this.activeMods && this.activeMods["heavy-weapon"] > 0) {
                notes += "HW, "
            }

            if ("armor-piercing" in this.activeMods && this.activeMods["armor-piercing"] > 0) {
                ap = (this.activeMods["armor-piercing"] * 2).toString()
                notes += "AP " + ap + ", "
            }

            if ("reach" in this.activeMods && this.activeMods["reach"] > 0) {
                notes += "Reach " + this.activeMods["reach"].toString()
                reach = +this.activeMods["reach"];
            }

            if (notes.length > 0) {
                notes = notes.substring(0, notes.length - 2);
            }

            if ("stackable" in this.activeMods && this.activeMods["stackable"] > 0) {
                charObj._additionalMeleeDamage = damage;
            }

            charObj._innateAttacks.push({
                name: this.getName(),
                range: range,
                damage: damage,
                addsStrength: true,
                ap: +ap,
                reach: reach,
                notes: notes,
                apIsAgilityDie: false,
                apIsPsionic: false,
                apIsHalfPsionic: false,
                apIsDoublePsionic: false,
                apIsSize: false,
                additionalDamage: "",
                equippedSecondary: false,
                dontStepUnarmedDamage: true,
                equippedPrimary: false,
                parry: 0,
                tempToHit: 0,
                tempParry: 0,
                apSizeBonus: 0,
                damageBoost: 0,
                noGlobalDamageAdd: true,
            })

        }

        // Armor
        if( this.name.trim().toLowerCase() == "armor" && !late ) {
            charObj._derivedBaseBoosts.armor += this.levels * 2
        }

        // Toughness
        if( this.name.trim().toLowerCase() == "toughness" && !late ) {
            charObj._derivedBaseBoosts.toughness += this.levels
        }

        // Parry
        if( this.name.trim().toLowerCase() == "parry" && !late ) {
            charObj._derivedBaseBoosts.parry += this.levels
        }

        // Undead
        if( this.name.trim().toLowerCase() == "undead" && !late ) {
            charObj._derivedBaseBoosts.toughness += 2;
        }

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

        // Super Attribute
        if( this.pickAttribute && this.pick1 && !late ) {
            if( this.pick1 == "agility" ) {
                charObj.boostAttribute("agility", this.levels)
            }
            if( this.pick1 == "smarts" ) {
                charObj.boostAttribute("smarts", this.levels)
            }
            if( this.pick1 == "spirit" ) {
                charObj.boostAttribute("spirit", this.levels)
            }
            if( this.pick1 == "vigor" ) {
                charObj.boostAttribute("vigor", this.levels)
            }
            if( this.pick1 == "strength" || this.pick1 == "strengh" ) {
                charObj.boostAttribute("strength", this.levels)
            }
        }

        // Growth
        if( this.name.trim().toLowerCase() === "growth"  && !late ) {
            charObj.boostAttribute("strength", +this.levels)
            charObj._derivedBaseBoosts.size += +this.levels;
            charObj._derivedBaseBoosts.toughness += +this.levels;
        }

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
        if( this.pickSkill && this.pick1 && late ) {
            let skillName = this.pick1;
            if( this.pick2.trim() ) {
                skillName += " (" + this.pick2.trim() + ")"
            }
            charObj.addSuperSkillBoost(
                skillName,
                this.levels,
            )
        }
    }

    getModValueLabel( modValue: string, modTag: string ): string {

        if( modTag in this.specificMods ) {
            if( this.specificMods[modTag].valueLabels.indexOf(",") > -1 ) {
                let valueLabelArray = this.specificMods[modTag].valueLabels.split(",");
                let valueArray = this.specificMods[modTag].value.split(",");
                let modIndex = valueArray.indexOf( modValue )
                if( valueLabelArray.length > modIndex ) {
                    return valueLabelArray[modIndex].toString() + " (" + modValue.toString() + ")";
                }
            }
        }

        return modValue.toString()
    }

    public getModsString(): string {
        let items: string[] = []
        for( let modKey of Object.keys(this.activeMods) ) {
            let modValue = +this.activeMods[modKey]
            if( modValue !== 0 ) {

                items.push( this.getModName(modKey) + " " + this.getModValueLabel(modValue.toString(), modKey))
            }

        }

        return items.join( ", ");
    }
}