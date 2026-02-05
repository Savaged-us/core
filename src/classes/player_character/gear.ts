import { IExportContainerItems, IExportGear } from "../../interfaces/IExportStatsOutput";
import { IContainerItemExport, ICustomGearExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { FormatMoney, replaceAll } from "../../utils/CommonFunctions";
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from "../_base_object";
import { PlayerCharacter } from "./player_character";
import type { IChargenWeapon } from "./weapon";
import type { IChargenArmor } from "./armor";
import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { convertMarkdownToHTML } from "../../utils/convertMarkdownToHTML";
import { GearEnhancement, IGearEnhancementExport, IGearEnhancementItemExport } from "./gear_enhancement";

// Late imports to avoid circular dependencies - these are loaded on first use
let Weapon: any;
let Armor: any;

function ensureImports() {
    if (!Weapon) {
        Weapon = require('./weapon').Weapon;
        Armor = require('./armor').Armor;
    }
}

export interface IChargenGear extends IBaseObjectExport {

    container: boolean;
    container_no_weight: boolean;
    container_fractional_weight: number;
    cost: number;
    abilities: string[];
    number_per: number;
    weapon_gimble_weight: number;
    weight: number;
    rippers_reason_cost: number;
    quantity: number;
    effects: string[];
    droppable_in_combat?: boolean;
    contains: IContainerItemExport[];

    initial_contents: IContainerItemExport[];
}

export class Gear extends BaseObject {
    // _char: PlayerCharacter | null = null;
    _hasBeenApplied: boolean = false;
    quantity: number = 1;
    equippedGear: boolean = false;
    equippedPrimary: boolean = false;
    equippedSecondary: boolean = false;
    equippedScreen: boolean = false;
    buyCost: number = 0;

    contains: IContainerItemExport[] = [];
    initial_contents: IContainerItemExport[] = [];

    isCustom: boolean = false;
    readOnly: boolean = false;

    rippersReasonCost: number;
    abilities: string[];

    effects: string[] = [];

    container: boolean;
    containerNoWeight: boolean;
    containerFractionalWeight: number = 1.0;
    cost: number;
    numberPer: number;
    weaponGimbleWeight: number;
    weight: number;

    settingItem: boolean = false;

    droppedInCombat: boolean = false;
    droppableInCombat: boolean = false;

    minimumStrength: string;

    frameworkItem: boolean = false;

    gear_enhancements: GearEnhancement[] = [];

    constructor(
        initObj: IChargenGear | null  = null,
        characterObject: PlayerCharacter | null  = null,
    ) {
        super( initObj, characterObject )
        this.reset();
        // if( characterObject ) {
        //     this._char = characterObject;
        // }
        if( initObj ) {
            this.import( initObj )
        }

        this.buyCost = this.cost;
    }

    import( initObj: IChargenGear | null   ) {

        super.import( initObj as IBaseObjectExport, this._char ? this._char.getAvailableData().books : []  );

        this.gear_enhancements = [];
        if(!initObj)
            return;

        if( initObj.abilities ) {
            this.abilities = initObj.abilities;
        }

        if( initObj.quantity ) {
            this.quantity = initObj.quantity;
        }

        if( initObj.initial_contents ) {
            this.initial_contents = initObj.initial_contents;
        }

        if( initObj.contains ) {
            this.contains = initObj.contains;
        }

        this.droppableInCombat = false;
        if( initObj.droppable_in_combat ) {
            this.droppableInCombat = true;
        }

        if(!this.contains) {
            this.contains = [];
        }

        this.rippersReasonCost = 0;
        if( initObj.rippers_reason_cost ) {
            this.rippersReasonCost = initObj.rippers_reason_cost;
        }

        if( typeof(initObj.cost) !== "undefined" ) {
            this.cost = initObj.cost;
        }
        if( initObj.weight ) {
            this.weight = initObj.weight;
        }

        this.containerNoWeight = false
        if( initObj.container_no_weight ) {
            this.containerNoWeight = true;
        }

        this.containerFractionalWeight = 1.0;
        if( typeof(initObj.container_fractional_weight) !== "undefined" ) {
            this.containerFractionalWeight = initObj.container_fractional_weight;
        }

        this.container = false;
        if( initObj.container ) {
            this.container = true;
        }

        this.numberPer = 1;
        if( initObj.number_per > 1 ) {
            this.numberPer = initObj.number_per;
        }

        if( initObj.weapon_gimble_weight ) {
            this.weaponGimbleWeight = initObj.weapon_gimble_weight;
        }

        this.effects = [];
        if(initObj.effects && typeof( initObj.effects) !== 'undefined'){
            if(typeof( initObj.effects) === 'string'){
                this.effects = JSON.parse(initObj.effects);
            } else {
                this.effects = initObj.effects;
            }
        }
        let cleanEffects: string[] = [];
        for( let effect of this.effects ) {
            if( effect.trim() ) {
                cleanEffects.push( effect.trim() );
            }
        }
        this.effects = cleanEffects;
    }

    getName(withQuantities: boolean = false): string {

        let suffix = "";
        let prefix = "";

        for( let enh of this.gear_enhancements ) {
            if( enh.name_suffix.trim() ) {
                suffix = suffix + " " + enh.name_suffix.trim();
            }
            if( enh.name_prefix.trim() ) {
                prefix = prefix + enh.name_prefix.trim() + " ";
            }
        }

        if( withQuantities && this.quantity > 1 ) {
            if( this.namePlural.trim() )
                return  this.quantity.toString() + "x " + prefix + this.namePlural.trim() + suffix;
            else
                return  this.quantity.toString() + "x " + prefix + this.name.trim() + suffix;
        } else {
            return prefix + this.name + suffix;
        }
    }

    getBuyCost(): number {
        if( this.container && this.contains.length > 0 ) {
            let itemCostSum: number = 0;
            if( this.contains ) {
                for( let item of this.contains ) {
                    itemCostSum += item.cost_buy;
                }
            }

            itemCostSum += this.buyCost;

            return itemCostSum;
       } else {
           return this.buyCost;
       }
    }

    getItemWeight(
        no_adjustments = false,
    ): number {
        let rv = this.weight;

        if( no_adjustments == false ) {
            for( let enh of this.gear_enhancements ) {
                rv = rv * enh.ammunition_weight_multiplier;
            }
        }

        return rv;
    }

    getTotalWeight(): number {
        let totalWeight = 0;
        if( this.container && this.contains.length > 0 ) {
            let itemWeightSum: number = 0;
            if( !this.containerNoWeight ) {
                if( this.contains ) {
                    for( let item of this.contains ) {

                        itemWeightSum += +item.weight;
                    }
                }
            }

            itemWeightSum = itemWeightSum * this.containerFractionalWeight;

            totalWeight = +((+itemWeightSum + this.getItemWeight() ));
            return totalWeight
       } else {
            totalWeight = +(this.getItemWeight() * this.quantity);
            return totalWeight / this.numberPer;
       }

    }

    getTotalCombatWeight(): number {
        if( this.droppedInCombat ) {
            return 0;
        } else {
            return this.getTotalWeight();
        }
    }

    toggleDroppedInCombat() {
        this.droppedInCombat = !this.droppedInCombat;
    }

    getWeightHR(): string {
        if( this.container && !this.containerNoWeight && this.contains.length > 0 ) {
             let itemWeightSum: number = 0;
             if( this.contains ) {
                for( let item of this.contains ) {
                    itemWeightSum += item.weight;
                }
            }

            itemWeightSum = itemWeightSum * this.containerFractionalWeight;

            itemWeightSum += this.weight;

             return  this.weight.toLocaleString() + " (" + itemWeightSum.toLocaleString() + ")";
        } else {
            return  this.weight.toLocaleString();
        }

    }

    getTotalWeightHR(): string {
        return this.getTotalWeight().toLocaleString()
    }

    getTotalBuyCost() {
        if(!this.quantity)
            this.quantity = 1;
        if(!this.buyCost)
            this.buyCost = 0;
        if( this.container && this.contains.length > 0 ) {
            let itemCostSum: number = 0;
            if( this.contains ) {
                for( let item of this.contains ) {
                    itemCostSum += item.cost_buy * item.count_current;
                }
            }

            itemCostSum += this.buyCost;

            return itemCostSum;
       } else {
           return +this.buyCost * this.quantity;
       }
    }

    getCostEach(): number {
        if( this.numberPer > 1 )
            return this.getCost() / this.numberPer;
        else
            return this.getCost()
    }

    getTotalCostHR(): string {
        if( this._char ) {

            let cost = 0
            if( this.getCostEach() != this.buyCost ) {
                cost = this.buyCost * this.quantity;
            } else {
                cost = this.getCostEach() * this.quantity;
            }

            for( let enh of this.gear_enhancements ) {
                cost = enh.ammunition_cost;
            }

            return FormatMoney(cost, this._char.setting);
        } else {

            return "$" + (this.quantity * this.getCostEach()).toLocaleString();
        }
    }

    getTotalCost(): number {
        if( this._char ) {

            let cost = 0
            if( this.getCostEach() != this.buyCost ) {
                cost = this.buyCost * this.quantity;
            } else {
                cost = this.getCostEach() * this.quantity;
            }

            for( let enh of this.gear_enhancements ) {
                cost = enh.ammunition_cost;
            }

            return cost;
        } else {

            return this.quantity * this.getCostEach();
        }
    }

    getCostEachHR(): string {
        if( this._char ) {

            if( this.getCostEach() != this.buyCost ) {
                return FormatMoney(this.buyCost, this._char.setting);
            } else {
                return FormatMoney(this.getCostEach(), this._char.setting);
            }
        } else {

            return "$" + (this.quantity * this.getCostEach());
        }
    }

    getCostHR(): string {
        if( this._char && this._char.setting ) {
            if( this.cost != this.buyCost ) {
                return FormatMoney(this.buyCost, this._char.setting);
            } else {
                return FormatMoney(this.cost, this._char.setting);
            }
        } else {
            if( this.cost != this.buyCost ) {
                return "$" + this.buyCost.toLocaleString();
            } else {
                return "$" + this.cost.toLocaleString();
            }
        }

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

        if( this.equippedGear ) {
            ApplyCharacterEffects(
                this.effects,
                charObj,
                "Gear: " + this.name,
                "",
                "",
                null,
                true,
            );

            for( let enh of this.gear_enhancements ) {
                enh.applyEffects( charObj );
            }
        }
    }

    export(): IChargenGear {
        let exportObject = super.export() as IChargenGear;

        exportObject.initial_contents = this.initial_contents;
        exportObject.rippers_reason_cost = this.rippersReasonCost;
        exportObject.quantity = this.quantity;
        exportObject.container = this.container;
        exportObject.container_no_weight = this.containerNoWeight;
        exportObject.container_fractional_weight = this.containerFractionalWeight;
        exportObject.cost = this.cost;
        exportObject.effects = this.effects;
        exportObject.number_per = this.numberPer;

        exportObject.weapon_gimble_weight = this.weaponGimbleWeight;
        exportObject.weight = this.weight;
        exportObject.abilities = this.abilities;
        exportObject.description = this.description;
        exportObject.contains = this.contains;
        exportObject.droppable_in_combat = this.droppableInCombat;

        exportObject = cleanUpReturnValue(exportObject);

        return exportObject;
    }
    calcReset() {
        this._hasBeenApplied = false;
    }
    reset() {
        super.reset();
        this.droppedInCombat = false;
        // this.description = [];
        // this.is_custom = false;
        // this.book_id = 0;
        this.container = false;
        this.contains = [];
        this.abilities = [];
        this.effects = [];
        this.containerNoWeight = false;
        this.cost = 0;

        this.weaponGimbleWeight = 0;
        this.weight = 0;
        this.rippersReasonCost = 0;
        this.quantity = 1;

        this.droppableInCombat = false;

    }

    // DEPRECATED_importFromCustomGear( data: ICustomGearExport) {
    //     this.reset();
    //     this.is_custom = true;
    //     this.quantity = data.quantity;
    //     this.cost = data.cost;
    //     this.buyCost = data.cost;
    //     this.name = data.name;
    //     this.summary = data.summary;
    //     this.weight = data.weight;
    //     this.rippersReasonCost = data.rippersReasonCost ? data.rippersReasonCost : 0;
    //     this.droppedInCombat = data.dropped_in_combat;
    //     this.container = data.container ? true : false;
    //     this.contains = data.contains ? data.contains : [];

    //     if(!this.contains) {
    //         this.contains = [];
    //     }
    // }

    getCost() {
        let cost = this.cost;
        for( let enh of this.gear_enhancements ) {
            // console.log("getCost", this.cost, enh.ammunition_cost, enh.name_prefix);
            if( this.numberPer > 1 ) {
                cost += (enh.ammunition_cost * this.numberPer);
            } else {
                cost += enh.ammunition_cost ;
            }

        }
        // console.log( "getCost", cost, this.numberPer );
        return cost;
    }

    public exportHTML(hideImage: boolean = false): string {

        let exportHTML = "";

        if( this.name ) {
            exportHTML += "<h1>" + this.getName(true) + "</h1>\n";
        }

        if( this.container ) {
            exportHTML += "This item is a container";
            exportHTML += "<br />";
        }

        if( this.quantity > 1 ) {
            exportHTML += "<strong>Cost Each:</strong> " + this.getCostEachHR() + "";
            exportHTML += "<br />";

            exportHTML += "<strong>Total Cost:</strong> " + this.getTotalCostHR() + "";
            exportHTML += "<br />";
        } else {
            if( this.getCostEach() ) {
                exportHTML += "<strong>Cost:</strong> " + this.getCostEach() + "";
                exportHTML += "<br />";
            }
        }

        if( this.weight ) {
            exportHTML += "<strong>Weight:</strong> " + this.weight + "";
            exportHTML += "<br />";
        }

        if( this.summary ) {
            exportHTML += "<p><strong>Summary:</strong> " + this.getSummary() + "</p>\n";
        }

        if( this.description.length > 0 ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>\n";
        }
        return exportHTML;
    }

    getSummary(): string {
        return this.summary;
    }

    getEnhancementExport(): IGearEnhancementItemExport[] {
        let gear_enhancements: IGearEnhancementItemExport[] = [];
        for( let item of this.gear_enhancements ) {
            if( item.id == 0 ) {
                gear_enhancements.push({
                    id: 0,
                    def: item.export(),
                    setting_item: false,
                });
            } else {
                gear_enhancements.push({
                    id: item.id,
                    def: null,
                    setting_item: false,
                });
            }
        }

        return gear_enhancements;
    }

    exportOptions(): IGearObjectVars {
        let rv = super.exportOptions() as IGearObjectVars;

        rv.buy_cost = this.buyCost;
        rv.contains = this.contains;
        rv.equipped = this.equippedGear;
        rv.dropped_in_combat = this.droppedInCombat;

        rv.framework_item = this.frameworkItem;
        rv.quantity = this.quantity;

        rv.gear_enhancements = this.getEnhancementExport();

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    importOptions( iVars: IGearObjectVars | null ) {
        super.importOptions( iVars );

        if( iVars ) {
            typeof( iVars.buy_cost ) != "undefined" ? this.buyCost = iVars.buy_cost : null;
            typeof( iVars.contains ) != "undefined" ? this.contains = iVars.contains : null;
            typeof( iVars.equipped ) != "undefined" ? this.equippedGear = iVars.equipped : null;
            typeof( iVars.framework_item ) != "undefined" ? this.frameworkItem = iVars.framework_item : null;
            typeof( iVars.dropped_in_combat ) != "undefined" ? this.droppedInCombat = iVars.dropped_in_combat : null;
            typeof( iVars.quantity ) != "undefined" ? this.quantity = iVars.quantity : null;

            if( iVars.gear_enhancements ) {
                for( let enh of iVars.gear_enhancements ) {
                    if( enh.id == 0 ) {
                        this.gear_enhancements.push( new GearEnhancement( enh.def ));
                    } if( enh.setting_item ) {
                        // TODO
                    } else if( enh.id > 0 && this._char ) {
                        for( let def of this._char._availableData.gear_enhancements ) {
                            if( def.id == enh.id) {

                                this.gear_enhancements.push( new GearEnhancement( def ));
                            }
                        }

                    }

                }
            }
        }
    }

    getGenericContains(): IExportContainerItems {
        ensureImports();
        let rv: IExportContainerItems = {
            gear: [],
            weapons: [],
            armor: [],
            shields: [],
        }

        if(!this._char)
            return rv;

        if( this.contains ) {
            for( let item of this.contains ) {
                if( item.type == "gear" ) {
                    if( item.id > 0 ) {
                        for( let itemDef of this._char.getAvailableData().gear ) {
                            if( itemDef.id == item.id ) {
                                let itemObj = new Gear( itemDef, this._char)
                                itemObj.contains = item.contains ? item.contains : [];
                                itemObj.buyCost = item.cost_buy;
                                itemObj.quantity = item.count_current;
                                rv.gear.push( itemObj.getGenericExport() )
                                break;
                            }
                        }
                    } else {
                        let itemObj = new Gear( item.custom as IChargenGear, this._char)
                        itemObj.contains = item.contains? item.contains : [];
                        itemObj.buyCost = item.cost_buy;
                        rv.gear.push( itemObj.getGenericExport() )
                    }

                }

                if( item.type == "armor" ) {
                    if( item.id > 0 ) {
                        for( let itemDef of this._char.getAvailableData().armor ) {
                            if( itemDef.id == item.id ) {
                                let itemObj = new Armor( itemDef, this._char)
                                itemObj.quantity = item.count_current;
                                if( itemObj.isShield ) {
                                    rv.shields.push( itemObj.getGenericExportShield() )
                                } else {
                                    rv.armor.push( itemObj.getGenericExportArmor() )
                                }
                                break;
                            }
                        }
                    } else {
                        let itemObj = new Armor( item.custom as IChargenArmor, this._char)
                        if( itemObj.isShield ) {
                            rv.shields.push( itemObj.getGenericExportShield() )
                        } else {
                            rv.armor.push( itemObj.getGenericExportArmor() )
                        }
                    }

                }

                if( item.type == "weapon" ) {
                    if( item.id > 0 ) {
                        for( let itemDef of this._char.getAvailableData().weapons ) {
                            if( itemDef.id == item.id ) {
                                let itemObj = new Weapon( itemDef, this._char)
                                itemObj.quantity = item.count_current;
                                rv.weapons.push( itemObj.getGenericExportWeapon() )
                                break;
                            }
                        }
                    } else {
                        let itemObj = new Weapon( item.custom as IChargenWeapon, this._char)
                        rv.weapons.push( itemObj.getGenericExportWeapon() )
                    }

                }
            }
        }

        return rv;
    }

    getDescriptionHTML(): string {
        let rv: string = convertMarkdownToHTML( this.description );
        rv = replaceAll(rv, "\n", " ");

        // if( this.description.length == 0 || (this.description.length > 1 && this.description[0].trim() == "")) {
        //     rv = "<p>" + this.summary + "</p>"
        // }

        rv += "<p><cite>" + this.getLongBookPage() + "</cite></p>";

        return rv;
    }

    getGenericExport( withBookData: boolean = false ): IExportGear {
        let rv: IExportGear = {
            id: this.id,
            uuid: this.uuid,
            name: this.getName(),
            weight: this.getTotalWeight(),
            quantity: this.quantity,
            contains: this.getGenericContains(),
            notes: this.summary,
            summary: this.summary,
            descriptionHTML: this.getDescriptionHTML(),
            container: this.container,
            bookPublished: this.getBookPublished(),
            bookPublisher: this.getBookPublisher(),
            equipped: this.equippedGear,
            cost: this.cost / this.quantity,
            takenFrom: this.getBookPage(),
            bookID: this.book_id,
            costBuy: this.buyCost / this.quantity,
        }

        if( withBookData ) {
            rv.bookCore = this.book_obj.core;
            rv.bookPrimary = this.book_obj.primary;
            rv.bookName = this.book_obj.name;
        }

        return rv;
    }
}

export interface IGearObjectVars extends IBaseObjectVars{
    buy_cost: number;
    contains: IContainerItemExport[];
    dropped_in_combat: boolean;
    equipped: boolean;
    framework_item: boolean;
    quantity: number;
    gear_enhancements: IGearEnhancementItemExport[];
}