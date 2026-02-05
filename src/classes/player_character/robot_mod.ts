import { ValidityLevel } from "../../enums/ValidityLevel";
import { ICustomRobotModExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { IValidationMessage } from "../../interfaces/IValidationMessage";
import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { FormatMoney } from "../../utils/CommonFunctions";
import { ParseRequirementLine } from "../../utils/ParseRequirementLine";
import { Gear, IChargenGear, IGearObjectVars } from "./gear";
import { PlayerCharacter } from "./player_character";

export interface IChargenRobotMod extends IChargenGear {

    abilities: string[];
    requirements: string[];

    needs_selected_edge: boolean;
    needs_selected_skill: boolean;
    needs_selected_trait: boolean;
    mods: number;
    cost_times_rank: boolean;
    max: number;
    max_ranks: number;
    needs_selected_attribute: boolean;

    // ranks: number;

    needs_selected_ranged_weapon: boolean;
    needs_selected_melee_weapon: boolean;
}

export class RobotMod extends Gear {

    customName: string = "";

    selectedAttribute: string = "";
    selectedSkill: string = "";
    selectedTrait: string = "";
    selectedEdge: string = "";
    numberPer: number;
    abilities: string[];
    droppedInCombat: boolean = false;
    minimumStrength: string;
    requirements: string[];
    needsSelectedEdge: boolean = false;
    needsSelectedSkill: boolean = false;
    needsSelectedTrait: boolean = false;
    needsSelectedAttribute: boolean = false;
    mods: number = 1;
    costTimesRank: boolean = false;
    max: number = 1;
    maxRanks: number = 1;

    ranks: number = 1;

    needsSelectedRangedWeapon: boolean = false;
    needsSelectedMeleeWeapon: boolean = false;

    selectedMeleeWeaponUUID: string = "";
    selectedRangedWeaponUUID: string = "";

    constructor(
        initObj: IChargenRobotMod | null = null,
        characterObject: PlayerCharacter | null = null,

    ) {
        super( initObj, characterObject );
        this.import(initObj);
        if( characterObject ) {
            this._char = characterObject;
        }

    }

    getName(): string {
        let extra: string[] = [];
        if( this.selectedAttribute ) {
            extra.push( this.selectedAttribute);
        }
        if( this.selectedSkill ) {
            extra.push( this.selectedSkill);
        }
        if( this.selectedEdge ) {
            extra.push( this.selectedEdge);
        }

        if( this.customName.trim() ) {
            if( extra.length > 0 )
                return this.customName + " (" + this.name + "; " + extra.join(", ") + ")";
            else
                return this.customName + " (" + this.name + ")";
        } else {
            if( extra.length > 0 )
                return this.name + " (" + extra.join(", ") + ")";
            else
                return this.name;
        }
    }

    getMods(): number {
        if(
            this._char
            &&
            this._char.setting.settingIsEnabled("rifts_mdc")
                &&
            (
                this.selectedMeleeWeaponUUID
                    ||
                this.selectedRangedWeaponUUID
            )
        ) {
            for( let weap of this._char._weaponsPurchased) {
                if(
                    weap.uuid == this.selectedMeleeWeaponUUID
                ) {
                    return Math.ceil(weap.getTotalWeight() / 25);
                }

                if(
                    weap.uuid == this.selectedRangedWeaponUUID
                ) {
                    return Math.ceil(weap.getTotalWeight() / 100);
                }
            }
        } else {
            return +(this.quantity * this.mods).toFixed(1)

        }
        return 0;
    }

    getHTMLLine(): string {
        let selectText = "";
        if( this.needsSelectedAttribute && this.selectedAttribute ) {
            selectText = this.selectedAttribute;
        }
        if( this.needsSelectedTrait && this.selectedTrait ) {
            selectText = this.selectedTrait;
        }
        if( this.needsSelectedEdge && this.selectedEdge ) {
            selectText = this.selectedEdge;
        }
        if( this.needsSelectedSkill && this.selectedSkill ) {
            selectText = this.selectedSkill;
        }
        if( this._char && this.needsSelectedRangedWeapon && this.selectedRangedWeaponUUID ) {
            let weapon = this._char.getSelectedWeaponByUUIDOrName( this.selectedRangedWeaponUUID )
            if( weapon )
                selectText = weapon.name;
        }

        if( this._char && this.needsSelectedMeleeWeapon && this.selectedMeleeWeaponUUID ) {
            let weapon = this._char.getSelectedWeaponByUUIDOrName( this.selectedMeleeWeaponUUID )
            if( weapon )
                selectText = weapon.name;
        }

        if( this.needsSelectedEdge && this.selectedEdge ) {
            selectText = this.selectedEdge;
        }
        if( selectText ) {
            selectText = selectText + ", ";
        }

        let ranksText = "";
        if( this.ranks > 1 ) {
            ranksText = this.ranks.toString() + " ranks, "
        }

        let exportHTML = "";

        let countNumber = "";
        if( this.quantity > 1 ) {
            countNumber = this.quantity.toString() + "x ";
        }
        if( this.is_custom) {
            exportHTML = "<strong>" + countNumber + this.name + " (" + ranksText + this.getMods() + " mods, " + selectText + "Custom):</strong> " + this.summary;
        } else {
            if( this.customName.trim() ) {
                exportHTML = "<strong>" + countNumber + this.customName + " (" + this.name + ", " + ranksText + this.getMods() + " mods, " + selectText + this.getBookPage() + "):</strong> " + this.summary;
            } else {
                exportHTML = "<strong>" + countNumber + this.name + " (" + ranksText + this.getMods() + " mods, " + selectText + this.getBookPage() + "):</strong> " + this.summary;
            }

        }

        return exportHTML;
    }

    // getBuyCost(): number {
    //    return this.buyCost;
    // }

    // getTotalWeight(): number {

    //     return this.weight;

    // }

    toggleDroppedInCombat() {
        this.droppedInCombat = !this.droppedInCombat;
    }

    // getTotalBuyCost() {

    //     if(
    //         this.cost > 0
    //     ) {
    //         if (this.costTimesRank )
    //             return this.buyCost * this.quantity ;
    //         else
    //             return this.buyCost * this.quantity * this.ranks;
    //     } else {
    //         if (this.costTimesRank )
    //             return this.getCost() * this.quantity ;
    //         else
    //             return this.getCost() * this.quantity * this.ranks;
    //     }
    // }

    isValid(): IValidationMessage {

        let rv: IValidationMessage = {
            message: "",    // no message
            severity: ValidityLevel.NoMessage,   // no validation message
            goURL: "/character/creator/robot-mods"
        }
        if(!this._char)
            return rv;
        let count = 0;
        for( let cyb of this._char._robotModsPurchased) {
            if( cyb.name.toLowerCase().trim() == this.name.toLowerCase().trim() ) {
                count += cyb.quantity;
            }
        }

        if( this.max > 0 && count > this.max ) {
            rv.severity = ValidityLevel.Error
            rv.message = this.name + " can only be taken no more than " + this.max.toString() + " times"
        }

        // Requirements!
        for( let req of this.requirements ) {

            if( req.trim() ) {
                let result = ParseRequirementLine( req, this._char);

                if( !result.empty && !result.found ) {
                    rv.message = this.name + " requires: " + result.parseMessage
                    rv.severity = ValidityLevel.Error
                }
            }
        }

        return rv;
    }

    getTotalCost() {

        return this.getCost() * this.quantity;

    }

    getCost(): number {

        if(
            this._char
            &&
            this._char.setting.settingIsEnabled("rifts_mdc")
                &&
            (
                this.selectedMeleeWeaponUUID
                    ||
                this.selectedRangedWeaponUUID
            )
        ) {
            for( let weap of this._char._weaponsPurchased) {
                if(
                    weap.uuid == this.selectedMeleeWeaponUUID
                        ||
                    weap.uuid == this.selectedRangedWeaponUUID
                ) {
                    if( this.costTimesRank ) {
                        return weap.getCost() / 2  * this.ranks;
                    } else {
                        return weap.getCost() / 2;
                    }
                }
            }
        } else {
            if( this.costTimesRank ) {
                return this.cost * this.ranks;
            } else {
                return this.cost;
            }
        }

        return 0
    }

    getTotalCostHR(): string {
        let perRank = "";
        if( this.costTimesRank ) {
            perRank = "/rank";
        }
        if( this._char ) {
            if(
                this.getTotalCost() != this.getTotalBuyCost()
                    &&
                this.cost > 0

            ) {
                return FormatMoney(this.getTotalBuyCost(), this._char.setting) + perRank;
            } else {
                return FormatMoney(this.getTotalCost(), this._char.setting) + perRank;
            }
        } else {
            if( this.getTotalCost() != this.getTotalBuyCost() ) {
                return "$" + this.getTotalBuyCost().toLocaleString() + perRank;
            } else {
                return "$" + this.getTotalCost().toLocaleString() + perRank;
            }

        }
    }

    getCostHR(): string {
        let perRank = "";
        if( this.costTimesRank ) {
            perRank = "/rank";
        }
        if( this._char ) {
            if( this.getTotalCost() != this.getTotalBuyCost() ) {
                return FormatMoney(this.getTotalBuyCost(), this._char.setting);
            } else {
                return FormatMoney(this.getTotalCost(), this._char.setting);
            }
        } else {
            if( this.cost != this.buyCost ) {
                return "$" + this.buyCost.toLocaleString() + perRank;
            } else {
                return "$" + this.cost.toLocaleString() + perRank;
            }
        }

    }

    import( iVars: IChargenRobotMod| null  ) {
        super.import( iVars as IChargenGear );

        if( iVars ) {
            typeof(iVars.requirements) != "undefined" ? this.requirements = iVars.requirements : null;
            typeof(iVars.needs_selected_edge) != "undefined" ? this.needsSelectedEdge = iVars.needs_selected_edge : null;
            typeof(iVars.needs_selected_skill) != "undefined" ? this.needsSelectedSkill = iVars.needs_selected_skill : null;
            typeof(iVars.needs_selected_trait) != "undefined" ? this.needsSelectedTrait = iVars.needs_selected_trait : null;
            typeof(iVars.needs_selected_attribute) != "undefined" ? this.needsSelectedAttribute = iVars.needs_selected_attribute : null;
            typeof(iVars.mods) != "undefined" ? this.mods = iVars.mods : null;
            // typeof(this.ranks) != "undefined" ? this.ranks = iVars.ranks : null;
            typeof(iVars.cost_times_rank) != "undefined" ? this.costTimesRank = iVars.cost_times_rank : null;
            typeof(iVars.max) != "undefined" ? this.max = iVars.max : null;
            typeof(iVars.max_ranks) != "undefined" ? this.maxRanks = iVars.max_ranks : null;
            typeof(iVars.needs_selected_ranged_weapon) != "undefined" ? this.needsSelectedRangedWeapon = iVars.needs_selected_ranged_weapon : null;
            typeof(iVars.needs_selected_melee_weapon) != "undefined" ? this.needsSelectedMeleeWeapon = iVars.needs_selected_melee_weapon : null;
            typeof(iVars.effects) != "undefined" ? this.effects = iVars.effects : null;
        }

        // console.log("iVars", iVars.name, iVars, iVars.mods, iVars.needs_selected_attribute, this.needsSelectedAttribute);

        // if( iVars ) {
        //     if( iVars.needs_selected_edge ) {
        //         this.needsSelectedEdge = iVars.needs_selected_edge;
        //     }

        //     if( iVars.requirements ) {
        //         this.requirements = iVars.requirements;
        //     }

        //     if( iVars.needs_selected_skill ) {
        //         this.needsSelectedSkill = iVars.needs_selected_skill;
        //     }
        //     if( iVars.needs_selected_trait ) {
        //         this.needsSelectedTrait = iVars.needs_selected_trait;
        //     }
        //     if( iVars.needs_selected_attribute ) {
        //         this.needsSelectedAttribute = iVars.needs_selected_attribute;
        //     }

        //     if( iVars.needs_selected_melee_weapon ) {
        //         this.needsSelectedMeleeWeapon = iVars.needs_selected_melee_weapon;
        //     }

        //     if( iVars.needs_selected_ranged_weapon ) {
        //         this.needsSelectedRangedWeapon = iVars.needs_selected_ranged_weapon;
        //     }

        //     if( typeof( this.mods) != "undefined")
        //         this.mods = iVars.mods;

        //     // if( iVars.ranks ) {
        //     //     this.ranks = iVars.ranks;
        //     // }
        //     if( iVars.cost_times_rank ) {
        //         this.costTimesRank = iVars.cost_times_rank;
        //     }

        //     if( iVars.max ) {
        //         this.max = iVars.max;
        //     }
        //     if( iVars.max_ranks ) {
        //         this.maxRanks = iVars.max_ranks;
        //     }

        //     // this.effects = [];
        //     // if( iVars.effects ) {
        //     //     if(typeof( iVars.effects) === 'string'){
        //     //         this.effects = JSON.parse(iVars.effects);
        //     //     } else {
        //     //         this.effects = iVars.effects;
        //     //     }
        //     // }
        // }

        // this.buyCost = this.cost;

        if( this.effects.length == 1 && this.effects[0].trim() == "" ) {
            this.effects = [];
        }
    }

    export(): IChargenRobotMod {
        let rv = super.export() as IChargenRobotMod;

        rv.requirements = this.requirements;
        rv.needs_selected_edge = this.needsSelectedEdge;
        rv.needs_selected_skill = this.needsSelectedSkill;
        rv.needs_selected_trait = this.needsSelectedTrait;
        rv.needs_selected_attribute = this.needsSelectedAttribute;
        rv.mods = this.mods;
        // rv.ranks = this.ranks;
        rv.cost_times_rank = this.costTimesRank;
        rv.max = this.max;
        rv.max_ranks = this.maxRanks;
        rv.needs_selected_ranged_weapon = this.needsSelectedRangedWeapon;
        rv.needs_selected_melee_weapon = this.needsSelectedMeleeWeapon;

        return rv;
    }

    reset() {

        this.droppedInCombat = false;
        this.abilities = [];

        this.effects = [];
        this.requirements = [];

        this.numberPer = 1;

        this.ranks = 1;
        this.customName = "";

        this.requirements = [];
        this.needsSelectedEdge = false;
        this.needsSelectedSkill = false;
        this.needsSelectedTrait = false;
        this.needsSelectedAttribute = false;
        this.mods = 0;
        this.costTimesRank = false;
        this.max = 1;
        this.maxRanks = 1;
        this.needsSelectedRangedWeapon = false;
        this.needsSelectedMeleeWeapon = false;

        this.frameworkItem = false;
        this.selectedAttribute = "";
        this.selectedSkill = "";
        this.selectedTrait = "";
        this.selectedEdge = "";
        this.setting_item = false;
        this.ranks = 1;
        this.selectedMeleeWeaponUUID = "";
        this.selectedRangedWeaponUUID = "";
    }

    // getBookShortName(): string {
    //     if( this.is_custom ) {
    //         return "Custom";
    //     } else {
    //         return this.bookShortName;
    //     }
    // }

    public exportHTML(hideImage: boolean = false): string {

        let exportHTML = "";

        if( this.name ) {
            exportHTML += "<h1>" + this.name + "</h1>\n";
        }

        if( this.cost ) {
            exportHTML += "<strong>Cost:</strong> " + FormatMoney(this.cost, null) + "";
            if( this.costTimesRank ) {
                exportHTML + "/rank";
            }
            exportHTML += "<br />";
        }

        if( this.mods ) {
            exportHTML += "<strong>Mods:</strong> " +this.mods + "";
            exportHTML += "<br />";
        }
        if( this.summary ) {
            exportHTML += "<p><strong>Summary:</strong> " + this.summary + "</p>\n";
        }

        if( this.description.length > 0 ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>\n";
        }
        return exportHTML;
    }

    importFromCustomLegacy( data: ICustomRobotModExport) {
        this.reset();

        this.is_custom = true;
        if( data.quantity )
            this.quantity = data.quantity;
        this.cost = data.cost;
        this.buyCost = data.cost;
        this.name = data.name;
        this.summary = data.summary;

        // this.effects = data.effects;
        this.mods = data.mods;

        this.effects = [];
        if( data.effects ) {
            if(typeof( data.effects) === 'string'){
                this.effects = JSON.parse(data.effects);
            } else {
                this.effects = data.effects;
            }
        }

        if( this.effects.length == 1 && this.effects[0].trim() == "" ) {
            this.effects = [];
        }
    }

    apply(charObj: PlayerCharacter | null = null) {

        if( this._hasBeenApplied ) {
            console.warn( this.name + " has already been applied, skipping");
            return;
        }

        if( !charObj )
            charObj = this._char;

        if( !charObj )
            return;

        this._hasBeenApplied = true;
        if( charObj ) {

            let parsedEffects: string[] = []

            for( let effect of this.effects ) {
                effect = effect.replace("[selected_attribute]", this.selectedAttribute );
                effect = effect.replace("[selected_skill]", this.selectedSkill );
                effect = effect.replace("[selected_edge]", this.selectedEdge );
                effect = effect.replace("[selected_trait]", this.selectedTrait );
                if(  this.ranks ) {
                    effect = effect.replace("[current_ranks]", this.ranks.toString() );
                    effect = effect.replace("[ranks]", this.ranks.toString() );
                }
                // ApplyCharacterMod(
                //     NormalizeModline(effect),
                //     this._char,
                //     "RobotMod: " + this.getName(),
                // )

                if( effect.trim() == "rifts_cyber_armor") {
                    parsedEffects.push( "+" + (this.ranks * 2) + " armor" );
                    if( this.ranks > 2 ) {
                        charObj.naturalArmorIsHeavy = true;
                    }
                } else {
                    parsedEffects.push( effect )
                }
            }

            // console.log("rme", parsedEffects)
            for( let quantityC = 0; quantityC < this.quantity; quantityC++) {
                ApplyCharacterEffects(
                    parsedEffects,
                    charObj,
                    "RobotMod: " + this.name,
                    null,
                    null,
                );
            }

            // if( this.needsSelectedEdge && this.selectedEdge ) {
            //     this._char.edgeAddByName( this.selectedEdge )
            // }

        }
    }
    importOptions(iVars: IRobotModObjectVars | null) {
        super.importOptions(iVars);

        if( iVars ) {
            typeof( iVars.frameworkItem ) != "undefined" ? this.frameworkItem = iVars.frameworkItem : null;
            typeof( iVars.selectedAttribute ) != "undefined" ? this.selectedAttribute = iVars.selectedAttribute : null;
            typeof( iVars.selectedSkill ) != "undefined" ? this.selectedSkill = iVars.selectedSkill : null;
            typeof( iVars.selectedTrait ) != "undefined" ? this.selectedTrait = iVars.selectedTrait : null;
            typeof( iVars.selectedEdge ) != "undefined" ? this.selectedEdge = iVars.selectedEdge : null;
            typeof( iVars.ranks ) != "undefined" ? this.ranks = iVars.ranks : null;

            typeof( iVars.selectedMeleeWeaponUUID ) != "undefined" ? this.selectedMeleeWeaponUUID = iVars.selectedMeleeWeaponUUID : null;
            typeof( iVars.selectedRangedWeaponUUID ) != "undefined" ? this.selectedRangedWeaponUUID = iVars.selectedRangedWeaponUUID : null;
        }

    }

    exportOptions(): IRobotModObjectVars {
        let rv = super.exportOptions() as IRobotModObjectVars;

        rv.frameworkItem = this.frameworkItem;
        rv.selectedAttribute = this.selectedAttribute;
        rv.selectedSkill = this.selectedSkill;
        rv.selectedTrait = this.selectedTrait;
        rv.selectedEdge = this.selectedEdge;
        rv.ranks = this.ranks;
;

        rv.selectedMeleeWeaponUUID = this.selectedMeleeWeaponUUID;
        rv.selectedRangedWeaponUUID = this.selectedRangedWeaponUUID;

        return rv;
    }
}

export interface IRobotModObjectVars extends IGearObjectVars {
    selectedAttribute: string;
    selectedSkill: string;
    selectedTrait: string;
    selectedEdge: string;

    frameworkItem: boolean;

    ranks: number;

    selectedMeleeWeaponUUID: string;
    selectedRangedWeaponUUID: string;
}