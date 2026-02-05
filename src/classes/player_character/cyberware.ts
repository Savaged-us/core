import { ValidityLevel } from "../../enums/ValidityLevel";
import { ICustomCyberwareExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { INameSummary } from "../../interfaces/INameSummary";
import { IValidationMessage } from "../../interfaces/IValidationMessage";
import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { FormatMoney } from "../../utils/CommonFunctions";
import { ParseRequirementLine } from "../../utils/ParseRequirementLine";
import { Gear, IChargenGear, IGearObjectVars } from "./gear";
import { PlayerCharacter } from "./player_character";

export interface IChargenCyberware extends IChargenGear {
    requirements: string[];

    needs_selected_edge: boolean;
    needs_selected_skill: boolean;
    needs_selected_trait: boolean;
    strain: number;
    zero_strain: boolean;

    cost_times_rank: boolean;
    max: number;
    max_ranks: number;
    needs_selected_attribute: boolean;

    needs_selected_ranged_weapon: boolean;
    needs_selected_melee_weapon: boolean;

    iz3_modifiers: boolean;

}

export class Cyberware extends Gear {

    customName: string = "";

    zeroStrain: boolean = false;

    selectedAttribute: string = "";
    selectedSkill: string = "";
    selectedTrait: string = "";
    selectedEdge: string = "";

    requirements: string[] = [];

    needsSelectedEdge: boolean = false;
    needsSelectedSkill: boolean = false;
    needsSelectedTrait: boolean = false;
    needsSelectedAttribute: boolean = false;
    strain: number = 1;
    costTimesRank: boolean = false;
    max: number = 1;
    maxRanks: number = 1;

    ranks: number = 1;

    needsSelectedRangedWeapon: boolean = false;
    needsSelectedMeleeWeapon: boolean = false;

    selectedMeleeWeaponUUID: string = "";
    selectedRangedWeaponUUID: string = "";
    iz3_modifiers: boolean = false;

    iz3_grade: EIZ3Grade;
    iz3_trapping: EIZ3Trapping;

    constructor(
        initObj: IChargenCyberware | null = null,
        characterObject: PlayerCharacter | null = null,
    ) {
        super(initObj, characterObject)
        this.reset();

        if( initObj ) {
            this.import(initObj)
        }

    }

    strainOnlyWhenActive(): boolean {

        if(  this.iz3_trapping == EIZ3Trapping.Chemtech || this.iz3_trapping == EIZ3Trapping.Nanotech ) {
            return true;
        }

        return false;
    }

    import( initObj: IChargenCyberware ) {
        super.import( initObj);
        typeof(initObj.requirements) != "undefined" ? this.requirements = initObj.requirements : null;
        typeof(initObj.needs_selected_edge) != "undefined" ? this.needsSelectedEdge = initObj.needs_selected_edge : null;
        typeof(initObj.needs_selected_skill) != "undefined" ? this.needsSelectedSkill = initObj.needs_selected_skill : null;
        typeof(initObj.needs_selected_trait) != "undefined" ? this.needsSelectedTrait = initObj.needs_selected_trait : null;
        typeof(initObj.needs_selected_attribute) != "undefined" ? this.needsSelectedAttribute = initObj.needs_selected_attribute : null;
        // typeof(this.mods) != "undefined" ? this.mods = initObj.mods : null;
        // typeof(this.ranks) != "undefined" ? this.ranks = initObj.ranks : null;
        typeof(initObj.cost_times_rank) != "undefined" ? this.costTimesRank = initObj.cost_times_rank : null;
        typeof(initObj.max) != "undefined" ? this.max = initObj.max : null;
        typeof(initObj.max_ranks) != "undefined" ? this.maxRanks = initObj.max_ranks : null;
        typeof(initObj.strain) != "undefined" ? this.strain = initObj.strain : null;
        typeof(initObj.needs_selected_ranged_weapon) != "undefined" ? this.needsSelectedRangedWeapon = initObj.needs_selected_ranged_weapon : null;
        typeof(initObj.needs_selected_melee_weapon) != "undefined" ? this.needsSelectedMeleeWeapon = initObj.needs_selected_melee_weapon : null;
        typeof(initObj.iz3_modifiers) != "undefined" ? this.iz3_modifiers = initObj.iz3_modifiers : null;
        typeof(initObj.zero_strain) != "undefined" ? this.zeroStrain = initObj.zero_strain : null;

        if(!this.requirements )
            this.requirements = [];
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

        let tech = this.getTechnology();
        if( tech )
            extra.push( tech );

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

    getStrain(): number {

        let countStrain = true;

        if( this.strainOnlyWhenActive() ) {
            if( this.equippedGear == false ) {
                countStrain = false;
            }
        }

        let strainMultiplier = 1;
        let strainSumModifier = 0;

        if( this.iz3_modifiers ) {
            switch( this.iz3_grade ) {
                case EIZ3Grade.Gutterware: {
                    strainSumModifier = 0;
                    strainMultiplier = 2;
                    break;
                }
                case EIZ3Grade.Streetware: {
                    strainSumModifier = 0;
                    strainMultiplier = 1;
                    break;
                }
                case EIZ3Grade.Customware: {
                    strainSumModifier = -1;
                    strainMultiplier = 1;
                    break;
                }
                case EIZ3Grade.Milware: {
                    strainSumModifier = -2;
                    strainMultiplier = 1;
                    break;
                }
            }
        }

        let rv = 0;

        if( countStrain && this._char ) {
            if(
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
                        rv = Math.ceil(weap.getTotalWeight() / 25);
                    }

                    if(
                        weap.uuid == this.selectedRangedWeaponUUID
                    ) {
                        rv = Math.ceil(weap.getTotalWeight() / 100);
                    }
                }
            } else {
                rv = +(this.quantity * this.strain).toFixed(1)

            }
        }

        rv = Math.floor( rv * strainMultiplier );
        rv = rv + strainSumModifier;

        if( rv < 1 && !this.zeroStrain ) {
            return 1;
        }

        return rv;
    }

    getTechnology(): string {
        let returnString = "";

        if( this.iz3_modifiers ) {
            if( this.iz3_trapping > -1 ){
                returnString += getEIZ3TrappingName( this.iz3_trapping );
            }

            if( this.iz3_grade > -1 ){
                returnString += " " + getEIZ3GradeName( this.iz3_grade );
            }
        }

        return returnString.trim();
    }

    getHTMLLine(): string {
        let abilityLine = this.getSpecialAbilityLine();

        return "<strong>" + abilityLine.name + ":</strong> " + abilityLine.summary;
    }

    getSpecialAbilityLine(): INameSummary {

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

        let countNumber = "";
        if( this.quantity > 1 ) {
            countNumber = this.quantity.toString() + "x ";
        }
        if( this.is_custom) {
            let name = countNumber + this.getName() + " (" + ranksText + this.getStrain() + " strain, " + selectText + "Custom)"
            let summary = this.summary;
            return {
                name: name,
                summary: summary,
            }
        } else {
            // if( this.customName.trim() ) {
            //     exportHTML = "<strong>" + countNumber + this.getName() + " (" + this.name + ", " + ranksText + this.getStrain() + " strain, " + selectText + this.getBookShortName() + " " + this.getBookPage() + "):</strong> " + this.summary;
            // } else {
                // exportHTML = "<strong>" + countNumber + this.getName() + " (" + ranksText + this.getStrain() + " strain, " + selectText + this.getBookShortName() + " " + this.getBookPage() + "):</strong> " + this.summary;
            // }
            let name = countNumber + this.getName() + " (" + ranksText + this.getStrain() + " strain, " + selectText + this.getBookShortName() + " " + this.getBookPage() + ")";
            let summary = this.summary;
            return {
                name: name,
                summary: summary,
            }
        }
    }

    getBuyCost(): number {
       return this.buyCost;
    }

    getTotalWeight(): number {

        return this.weight;

    }

    toggleDroppedInCombat() {
        this.droppedInCombat = !this.droppedInCombat;
    }

    getTotalBuyCost() {

        let costMultiplier = 1;
        let baseCost = 0;

        if( this.iz3_modifiers ) {
            switch( this.iz3_grade ) {
                case EIZ3Grade.Gutterware: {
                    costMultiplier = .25;
                    break;
                }
                case EIZ3Grade.Streetware: {
                    costMultiplier = 1;
                    break;
                }
                case EIZ3Grade.Customware: {
                    costMultiplier = 4;
                    break;
                }
                case EIZ3Grade.Milware: {
                    costMultiplier = 8;
                    break;
                }
            }

            switch( this.iz3_trapping ) {
                case EIZ3Trapping.Biotech: {
                    baseCost = 500 * this.strain;
                    break;
                }
                case EIZ3Trapping.Chemtech: {
                    baseCost = 100 * this.strain;
                    break;
                }
                case EIZ3Trapping.Cybertech: {
                    baseCost = 600 * this.strain;
                    break;
                }
                case EIZ3Trapping.Genetech: {
                    baseCost = 1000 * this.strain;
                    break;
                }
                case EIZ3Trapping.Nanotech: {
                    baseCost = 5000 * this.strain;
                    break;
                }
            }
        }

        if(
            this.cost > 0
        ) {
            if (this.costTimesRank )
                return baseCost + this.buyCost * this.quantity * costMultiplier;
            else
                return baseCost + this.buyCost * this.quantity * this.ranks* costMultiplier ;
        } else {
            if (this.costTimesRank )
                return baseCost + this.getCost() * this.quantity * costMultiplier ;
            else
                return baseCost + this.getCost() * this.quantity * this.ranks * costMultiplier;
        }
    }

    isValid(): IValidationMessage {

        let rv: IValidationMessage = {
            message: "",    // no message
            severity: ValidityLevel.NoMessage,   // no validation message
            goURL: "/character/creator/cyberware"
        }

        if(!this._char )
            return rv;

        let count = 0;
        for( let cyb of this._char._cyberwarePurchased) {
            if( cyb.name && this.name && cyb.name.toLowerCase().trim() == this.name.toLowerCase().trim() ) {
                count += cyb.quantity;
            }
        }

        if( this.max && this.max > 0 && count > this.max ) {
            rv.severity = ValidityLevel.Error
            rv.message = this.name + " can only be taken no more than " + this.max.toString() + " times"
        }

        // Requirements!
        if( this.requirements ) {
            for( let req of this.requirements ) {
                if( req && req.trim() ) {
                    let result = ParseRequirementLine( req, this._char);
                    if( result && !result.empty && !result.found ) {
                        rv.message = this.name +  " requires: " + result.parseMessage
                        rv.severity = ValidityLevel.Error
                    }
                }
            }
        }

        return rv;
    }

    getTotalCost() {

        return this.getCost() * this.quantity;

    }

    setIZ3Grade( newGrade: EIZ3Grade ) {
        this.iz3_grade = newGrade;
    }

    setIZ3Trapping( newTrap: EIZ3Trapping ) {
        this.iz3_trapping = newTrap;
    }

    getCost(): number {

        let costMultiplier = 1;
        let baseCost = 0;

        if( this.iz3_modifiers ) {
            switch( this.iz3_grade ) {
                case EIZ3Grade.Gutterware: {
                    costMultiplier = .25;
                    break;
                }
                case EIZ3Grade.Streetware: {
                    costMultiplier = 1;
                    break;
                }
                case EIZ3Grade.Customware: {
                    costMultiplier = 4;
                    break;
                }
                case EIZ3Grade.Milware: {
                    costMultiplier = 8;
                    break;
                }
            }

            switch( this.iz3_trapping ) {
                case EIZ3Trapping.Biotech: {
                    baseCost = 500 * this.strain;
                    break;
                }
                case EIZ3Trapping.Chemtech: {
                    baseCost = 100 * this.strain;
                    break;
                }
                case EIZ3Trapping.Cybertech: {
                    baseCost = 600 * this.strain;
                    break;
                }
                case EIZ3Trapping.Genetech: {
                    baseCost = 1000 * this.strain;
                    break;
                }
                case EIZ3Trapping.Nanotech: {
                    baseCost = 5000 * this.strain;
                    break;
                }
            }
        }

        let rv = 0 + baseCost;

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
                        rv = weap.getCost() / 2  * this.ranks;
                    } else {
                        rv = weap.getCost() / 2;
                    }
                }
            }
        } else {
            if( this.costTimesRank ) {
                rv = this.cost * this.ranks;
            } else {
                rv = this.cost;
            }
        }

        rv = costMultiplier * rv;

        return rv;
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

    export(): IChargenCyberware {
        let rv = super.export() as IChargenCyberware;

        rv.requirements = this.requirements;
        rv.needs_selected_edge = this.needsSelectedEdge;
        rv.needs_selected_skill = this.needsSelectedSkill;
        rv.needs_selected_trait = this.needsSelectedTrait;
        rv.needs_selected_attribute = this.needsSelectedAttribute;
        rv.strain = this.strain;
        rv.cost_times_rank = this.costTimesRank;
        rv.max = this.max;
        rv.max_ranks = this.maxRanks;
        rv.needs_selected_ranged_weapon = this.needsSelectedRangedWeapon;
        rv.needs_selected_melee_weapon = this.needsSelectedMeleeWeapon;

        rv.iz3_modifiers = this.iz3_modifiers;
        rv.zero_strain = this.zeroStrain;

        rv = cleanUpReturnValue(rv);
        return rv;
    }

    reset() {
        super.reset();
        this.ranks = 1;
        this.customName = "";

        this.requirements = [];
        this.needsSelectedEdge = false;
        this.needsSelectedSkill = false;
        this.needsSelectedTrait = false;
        this.needsSelectedAttribute = false;
        this.strain = 0;
        this.costTimesRank = false;
        this.max = 0;
        this.maxRanks = 0;
        this.needsSelectedRangedWeapon = false;
        this.needsSelectedMeleeWeapon = false;

        this.iz3_modifiers = false;

        this.iz3_grade = EIZ3Grade.Streetware;
        this.iz3_trapping = EIZ3Trapping.Cybertech;
    }

    public exportHTML(hideImage: boolean = false): string {

        let exportHTML = "";

        if( this.name ) {
            exportHTML += "<h1>" + this.getName() + "</h1>\n";
        }

        if( this.cost ) {
            exportHTML += "<strong>Cost:</strong> " + FormatMoney(this.cost, null) + "";
            if( this.costTimesRank ) {
                exportHTML + "/rank";
            }
            exportHTML += "<br />";
        }

        if( this.strain ) {
            exportHTML += "<strong>Strain:</strong> " +this.strain + "";
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

    // DEPRECATED_importFromCustomCyberware( data: ICustomCyberwareExport) {
    //     this.reset();

    //     this.is_custom = true;
    //     if( data.quantity )
    //         this.quantity = data.quantity;
    //     this.cost = data.cost;
    //     this.buyCost = data.cost;
    //     this.name = data.name;
    //     this.summary = data.summary;

    //     // this.effects = data.effects;
    //     this.strain = data.strain;

    //     this.effects = [];
    //     if( data.effects ) {
    //         if(typeof( data.effects) === 'string'){
    //             this.effects = JSON.parse(data.effects);
    //         } else {
    //             this.effects = data.effects;
    //         }
    //     }

    //     if( this.effects.length == 1 && this.effects[0].trim() == "" ) {
    //         this.effects = [];
    //     }
    // }

    apply(charObj: PlayerCharacter | null ) {

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
                //     "Cyberware: " + this.getName(),
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
            // console.log("parsedEffects", parsedEffects)
            // console.log("this.effects", this.effects)
            if( this.quantity < 1 ) {
                this.quantity = 1;
            }
            for( let quantityC = 0; quantityC < this.quantity; quantityC++) {

                ApplyCharacterEffects(
                    parsedEffects,
                    charObj,
                    "Cyberware: " + this.getName(),
                    null,
                    null,
                );
            }

            // if( this.needsSelectedEdge && this.selectedEdge ) {
            //     this._char.edgeAddByName( this.selectedEdge )
            // }

        }
    }

    importOptions(initObj: ICyberwareObjectVars | null ) {
        super.importOptions(initObj);

        if( initObj ) {
            typeof( initObj.buy_cost ) != "undefined" ? this.buyCost = initObj.buy_cost : null;
            typeof( initObj.frameworkItem ) != "undefined" ? this.frameworkItem = initObj.frameworkItem : null;
            typeof( initObj.selectedAttribute ) != "undefined" ? this.selectedAttribute = initObj.selectedAttribute : null;
            typeof( initObj.selectedSkill ) != "undefined" ? this.selectedSkill = initObj.selectedSkill : null;
            typeof( initObj.selectedTrait ) != "undefined" ? this.selectedTrait = initObj.selectedTrait : null;
            typeof( initObj.selectedEdge ) != "undefined" ? this.selectedEdge = initObj.selectedEdge : null;
            typeof( initObj.ranks ) != "undefined" ? this.ranks = initObj.ranks : null;

            typeof( initObj.selectedMeleeWeaponUUID ) != "undefined" ? this.selectedMeleeWeaponUUID = initObj.selectedMeleeWeaponUUID : null;
            typeof( initObj.selectedRangedWeaponUUID ) != "undefined" ? this.selectedRangedWeaponUUID = initObj.selectedRangedWeaponUUID : null;

            typeof( initObj.iz3_grade ) != "undefined" ? this.iz3_grade = initObj.iz3_grade : null;
            typeof( initObj.iz3_trapping ) != "undefined" ? this.iz3_trapping = initObj.iz3_trapping : null;
        }
    }

    exportOptions(): ICyberwareObjectVars {
        let rv = super.exportOptions() as ICyberwareObjectVars;

        rv.buy_cost = this.buyCost;
        rv.frameworkItem = this.frameworkItem;
        rv.selectedAttribute = this.selectedAttribute;
        rv.selectedSkill = this.selectedSkill;
        rv.selectedTrait = this.selectedTrait;
        rv.selectedEdge = this.selectedEdge;
        rv.ranks = this.ranks;
;

        rv.selectedMeleeWeaponUUID = this.selectedMeleeWeaponUUID;
        rv.selectedRangedWeaponUUID = this.selectedRangedWeaponUUID;

        rv.iz3_grade = this.iz3_grade;
        rv.iz3_trapping = this.iz3_trapping;

        rv = cleanUpReturnValue(rv);
        return rv;
    }

}

export interface ICyberwareObjectVars extends IGearObjectVars {
    selectedAttribute: string;
    selectedSkill: string;
    selectedTrait: string;
    selectedEdge: string;

    frameworkItem: boolean;

    ranks: number;

    selectedMeleeWeaponUUID: string;
    selectedRangedWeaponUUID: string;

    iz3_grade: EIZ3Grade;
    iz3_trapping: EIZ3Trapping;
}

export enum EIZ3Grade {
    Gutterware = 0,
    Streetware = 1,
    Customware = 2,
    Milware = 3,

}

export enum EIZ3Trapping {
    Biotech = 0,
    Chemtech = 1,
    Cybertech = 2,
    Genetech = 3,
    Nanotech = 4,
}

export interface ISimpleIDStringValue {
    id: number;
    label: string;
}

// export function getEIZ3Grades(): ISimpleIDStringValue[] {
//     let rv: ISimpleIDStringValue[] = [];

//     rv.push({
//         id: EIZ3Grade.Gutterware,
//         label: getEIZ3GradeName( EIZ3Grade.Gutterware )
//     });

//     rv.push({
//         id: EIZ3Grade.Streetware,
//         label: getEIZ3GradeName( EIZ3Grade.Streetware )
//     });

//     rv.push({
//         id: EIZ3Grade.Customware,
//         label: getEIZ3GradeName( EIZ3Grade.Customware )
//     });

//     rv.push({
//         id: EIZ3Grade.Milware,
//         label: getEIZ3GradeName( EIZ3Grade.Milware )
//     });

//     return rv;
// }

// export function getEIZ3Trappings(): ISimpleIDStringValue[] {
//     let rv: ISimpleIDStringValue[] = [];

//     rv.push({
//         id: EIZ3Trapping.Biotech,
//         label: getEIZ3TrappingName( EIZ3Trapping.Biotech )
//     });

//     rv.push({
//         id: EIZ3Trapping.Chemtech,
//         label: getEIZ3TrappingName( EIZ3Trapping.Chemtech )
//     });

//     rv.push({
//         id: EIZ3Trapping.Cybertech,
//         label: getEIZ3TrappingName( EIZ3Trapping.Cybertech )
//     });

//     rv.push({
//         id: EIZ3Trapping.Genetech,
//         label: getEIZ3TrappingName( EIZ3Trapping.Genetech )
//     });

//     rv.push({
//         id: EIZ3Trapping.Nanotech,
//         label: getEIZ3TrappingName( EIZ3Trapping.Nanotech )
//     });

//     return rv;
// }
export function getEIZ3GradeName( item: EIZ3Grade ): string {
    switch( item ) {
        case EIZ3Grade.Streetware: {
            return "Streetware"
        }
        case EIZ3Grade.Gutterware: {
            return "Gutterware"
        }
        case EIZ3Grade.Customware: {
            return "CustomWare"
        }
        case EIZ3Grade.Milware: {
            return "Milware"
        }
        default:
            return "(unknown)"
    }

}
export function getEIZ3TrappingName( item: EIZ3Trapping ): string {
    switch( item ) {
        case EIZ3Trapping.Biotech: {
            return "Biotech"
        }
        case EIZ3Trapping.Chemtech: {
            return "Chemtech"
        }
        case EIZ3Trapping.Cybertech: {
            return "Cybertech"
        }
        case EIZ3Trapping.Genetech: {
            return "Genetech"
        }
        case EIZ3Trapping.Nanotech: {
            return "Nanotech"
        }
        default:
            return "(unknown)"
    }
}