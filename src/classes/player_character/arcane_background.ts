import { IPowerCustom } from "../../interfaces/IChargenPowerCustom";
import { IItemUpdateItemAvailability } from "../../interfaces/IItemAvailability";
import { IJSONArcaneItemExport, IJSONPowerExport, ILEGACYJSONPowerExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { replaceAll } from "../../utils/CommonFunctions";
import { convertMarkdownToHTML } from "../../utils/convertMarkdownToHTML";
import { ParseRequirementLine } from "../../utils/ParseRequirementLine";
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from "../_base_object";
import { ArcaneItem } from "./arcane_item";
import { ISpecialAbilityItem, PlayerCharacter } from "./player_character";
import { IChargenPowers, IChargenPowerVars, Power } from "./power";
import { Skill } from "./skill";

export interface IChargenArcaneBackground extends IBaseObjectExport {
    // version_of: number;
    // deleted: boolean;
    // active: boolean;
    // is_custom: boolean;
    // name: string;
    // setting_item: boolean;
    effects: string | string[];
    starting_power_points: number;
    starting_power_count: number;
    // description: string | string[];
    allowed_powers: string | string[];
    backlash_name: string;
    // book: number;
    backlash_description: string | string[];
    arcane_skill: ArcaneSkillDef | null;
    power_points_per_power: boolean;
    skill_per_power: boolean;

    ignoresPowerRankRequirements: boolean;
    // page: string;
    // created_by: number;
    // created_on: Date;
    // updated_by: number;
    // updated_on: Date;
    // deleted_by: number;
    // deleted_on: Date;
    // id: number;
    extra_ability_text: string[] | string;
    ab_power_modifiers: string[];

    doesNotProvidePowers: boolean;
    notSelectable: boolean;
    countsAsOtherAB: string[];

    power_points_name: string;

    // book_id: number;
    // book_name: string;
    // book_short_name: string;
    // book_publisher: string;
    // book_published: string;
    // book_core: number;
    // book_primary: number;

    // created_by_name: string;
    // updated_by_name: string;
    // deleted_by_name: string;

    requirements: string[];
    conflicts: string[];
    instructions: string[];

    set_power_ranges_to_touch: string[];
    set_power_ranges_to_self: string[];

    set_power_ranges_to_touch_discount: boolean;
    set_power_ranges_to_self_discount: boolean
}

interface ArcaneSkillDef {
    name: string;
    attribute: string;
}

export class ArcaneBackground extends BaseObject {
    // _char: PlayerCharacter;
    _hasBeenApplied: boolean = false;

    // setting_item: boolean = false;
    instructions: string[] = [];
    // versionOf: number;
    // deleted: boolean;
    // active: boolean = true;
    // name: string = "Custom Arcane Background";
    effects: string[] = [];
    startingPowerPoints: number = 10;
    currentPowerPoints: number = 0;
    startingPowerCount: number = 2;
    _baseStartingPowerCount: number = 2;
    // description: string[] = [];
    allowedPowers: string[] = [];
    backlashName: string = "Backlash";

    takenAtAdvance: number = -1;
    // book: number;
    backlashDescription: string = "";
    arcaneSkill: ArcaneSkillDef | null = {
        name: "Arcane Skill",
        attribute: "smarts"
    };
    powerPointsPerPower: boolean = false;
    skillPerPower: boolean;
    // bookPage: string;
    // createdBy: number;
    // createdOn: Date;
    // updatedBy: number;
    // updatedOn: Date;
    // deletedBy: number;
    deletedOn: Date;
    // id: number = 0;

    abPowerModifiers: string[] = [];

    ignoresPowerRankRequirements: boolean = false;

    requirements: string[] = [];
    conflicts: string[] = [];

    // uuid: string = generateUUID();

    // isCustom: boolean = false;
    // readOnly: boolean = false;

    doesNotProvidePowers: boolean = false;
    notSelectable: boolean = false;

    powerPointsName: string = "Power Points";

    customPowers: Power[] = [];
    // arcaneDevices: IJSONArcaneItemExport[] = [];
    selectedPowers: Power[] = [];
    addedPowers: Power[] = [];      // From Advances...
    addedCustomPowers: IPowerCustom[] = [];

    unchangeable: boolean = false;

    bonusPPE: number = 0;

    // bookID: number;
    // bookName: string;
    // bookShortName: string;
    // bookPublisher: string;
    // bookPublished: string;
    // bookPrimary: boolean = false;
    // bookCore: boolean = false;

    mysticPowerModifiers: boolean = false;

    countsAsOtherAB: string[] = [];

    fromRace: boolean = false;

    megaPowers: boolean = false;

    // createdByName: string;
    // updatedByName: string;
    // deletedByName: string;

    powerPointMultiplier: number = 1;
    powerPointEdgeMultiplier: number = 1;
    addedPowerPoints: number = 0;

    extraAbilityText: string[] = [];

    arcaneItems: ArcaneItem[] = [];

    addedPowerInnate: { [index: string]: boolean } = {};
    addedPowerCustomName: { [index: string]: string } = {};
    addedPowerCustomDescription: { [index: string]: string[] } = {};
    addedPowerRangeLimitation: { [index: string]: string } = {};
    addedPowerAspectLimitation: { [index: string]: string } = {};

    setPowerRangesToTouch: string[] = [];
    setPowerRangesToSelf: string[] = [];

    setPowerRangesToTouchGivesDiscount: boolean = true;
    setPowerRangesToSelfGivesDiscount: boolean = true;

    constructor(
        abDef: IChargenArcaneBackground | null = null,
        characterObject: PlayerCharacter | null = null,
    ) {
        super( abDef, characterObject );
        this._char = characterObject;
        this.reset();
        this.import( abDef )
        this.makeABSkills();
        this.currentPowerPoints = this.startingPowerPoints;

        if(!this.effects)
            this.effects = [];
    }

    toggleAddedPowerInnate( powerName: string ) {
        if( powerName in this.addedPowerInnate ) {
            this.addedPowerInnate[ powerName ] = !this.addedPowerInnate[ powerName ];
        } else {
            this.addedPowerInnate[ powerName ] = true;
        }
    }

    setAddedPowerCustomName( powerName: string, newValue: string ) {
        this.addedPowerCustomName[ powerName ] = newValue;
    }

    setAddedPowerCustomDescription( powerName: string, newValue: string ) {
        this.addedPowerCustomDescription[ powerName ] = newValue.split("\n");
    }

    setAddedPowerRangeLimitation( powerName: string, newValue: string ) {
        this.addedPowerRangeLimitation[ powerName ] = newValue;
    }
    setAddedPowerAspectLimitation( powerName: string, newValue: string ) {
        this.addedPowerAspectLimitation[ powerName ] = newValue;
    }

    makeABSkills() {

        if( !this.doesNotProvidePowers && this.arcaneSkill && this.arcaneSkill.name && this.arcaneSkill.attribute ) {
            if( this._char) {
                let arcaneSkill = this._char.getSkill( this.arcaneSkill.name, this.arcaneSkill.attribute );

                if( !arcaneSkill ) {
                    let newSkill = new Skill(
                        this._char,
                        {
                            name: this.arcaneSkill.name,
                            attribute: this.arcaneSkill.attribute,
                            is_knowledge: false,
                            language: false,
                            always_language: false,
                            base_parry: false,
                        },
                        0,
                    );
                    newSkill.arcaneAddedSkill = true;
                    newSkill.arcaneAddedUUID = this.uuid;

                    this._char.skills.push(
                        newSkill
                    );
                }
            }
        }

        if( this.skillPerPower && this._char ) {
            for( let power of this.getAllPowers() ) {
                let powerSkill = this._char.getSkill( power.name, "" );
                if( !powerSkill ) {
                    let powerSkill = new Skill(
                        this._char,
                        {
                            name: power.name,
                            attribute: "",
                            is_knowledge: false,
                            language: false,
                            always_language: false,
                            base_parry: false,
                        },
                        power.book_id,
                    );

                    powerSkill.arcaneAddedSkill = true;
                    powerSkill.arcaneAddedUUID = power.uuid;

                    this._char.skills.push(
                        powerSkill
                    );
                }
            }
        }
    }

    public setCustom() {
        this.id = -1;
        this.is_custom = true;
    }

    // public getBookShortName(): string {
    //     if( this.setting_item ) {
    //         return "Setting AB"
    //     } else if (this.is_custom ) {
    //         return "Custom"
    //     } else {
    //         return this.book_obj.name + ", " + this.book_page;
    //     }
    // }

    public import(jsonImportObj: IChargenArcaneBackground | null ) {
        super.import(jsonImportObj, this._char ? this._char.getAvailableData().books : [] );
        // console.log("AB jsonImportObj", jsonImportObj);
        if( jsonImportObj ) {

            if( jsonImportObj.instructions )
                this.instructions = jsonImportObj.instructions;
            // this.versionOf = jsonImportObj.version_of;
            // this.deleted = jsonImportObj.deleted;
            // this.active = jsonImportObj.active;
            // if( jsonImportObj.id ) {
            //     this.id = jsonImportObj.id;
            //     this.is_custom = false;
            // } else {
            //     this.id = -1;
            //     this.is_custom = true;
            // }
            // this.name = jsonImportObj.name;

            this.effects = [];
            if(jsonImportObj.effects && typeof( jsonImportObj.effects) !== 'undefined'){
                if(typeof( jsonImportObj.effects) === 'string'){
                    this.effects = JSON.parse(jsonImportObj.effects);
                } else {
                    this.effects = jsonImportObj.effects;
                }
            }
            let cleanEffects: string[] = [];
            for( let effect of this.effects ) {
                if( effect.trim() ) {
                    cleanEffects.push( effect.trim() );
                }
            }
            this.effects = cleanEffects;

            if(jsonImportObj.ignoresPowerRankRequirements )
                this.ignoresPowerRankRequirements = jsonImportObj.ignoresPowerRankRequirements;

            this.notSelectable = false;
            if( jsonImportObj.notSelectable ) {
                this.notSelectable = true;
            }
            // this.setting_item = false;
            // if( jsonImportObj.setting_item ) {
            //     this.setting_item = true;
            // }

            this.setting_item = false;
            if( jsonImportObj.setting_item ) {
                this.setting_item = true;
            }

            this.countsAsOtherAB = [];
            if( jsonImportObj.countsAsOtherAB ) {
                this.countsAsOtherAB = jsonImportObj.countsAsOtherAB;
            }

            this.requirements = [];
            if( jsonImportObj.requirements ) {
                this.requirements = jsonImportObj.requirements;
            }
            this.conflicts = [];
            if( jsonImportObj.conflicts ) {
                this.conflicts = jsonImportObj.conflicts;
            }

            this.startingPowerPoints = jsonImportObj.starting_power_points;

            // console.log(" ab import jsonImportObj.starting_power_count", jsonImportObj.starting_power_count)
            this.startingPowerCount = jsonImportObj.starting_power_count;
            this._baseStartingPowerCount = jsonImportObj.starting_power_count;

            // if( typeof(jsonImportObj.description) === "string") {
            //     if( jsonImportObj.description.trim() ) {
            //         try {
            //             this.description = JSON.parse(jsonImportObj.description);
            //         }
            //         catch {
            //             this.description = [];
            //         }
            //     }
            // } else {
            //     this.description = jsonImportObj.description;
            // }
            if( typeof(jsonImportObj.allowed_powers) === "string") {
                if( jsonImportObj.allowed_powers.trim() ) {
                    try {
                        this.allowedPowers = JSON.parse(jsonImportObj.allowed_powers);
                    }
                    catch {
                        this.allowedPowers = [];
                    }
                }
            } else {
                this.allowedPowers = jsonImportObj.allowed_powers;
            }

            if( this.allowedPowers.length > 0 && this.allowedPowers[0].indexOf(",")> 0) {

                let aps = this.allowedPowers[0].split(",");
                for( let ap of aps)
                    this.allowedPowers.push( ap.trim().toLowerCase() )
            }

            if( jsonImportObj.doesNotProvidePowers ) {
                this.doesNotProvidePowers = true;
            }

            this.backlashName = jsonImportObj.backlash_name;
            // this.book = jsonImportObj.book;
            // this.backlashDescription = jsonImportObj.backlash_description;
            if( typeof(jsonImportObj.backlash_description) === "string") {

                this.backlashDescription = jsonImportObj.backlash_description
                // if( jsonImportObj.backlash_description.trim() ) {
                //     try {
                //         this.backlashDescription = JSON.parse(jsonImportObj.backlash_description);
                //     }
                //     catch {
                //         this.backlashDescription = "";
                //     }
                // }
            } else {
                this.backlashDescription = jsonImportObj.backlash_description.join("\n");
            }

            // if( typeof(jsonImportObj.arcane_skill) === "string") {
            //     if( jsonImportObj.arcane_skill.trim() ) {
            //         try {
            //             this.arcaneSkill = JSON.parse(jsonImportObj.arcane_skill);
            //         }
            //         catch {
            //             this.arcaneSkill = null;
            //         }
            //     }
            // } else {
                this.arcaneSkill = jsonImportObj.arcane_skill;
            // }

            this.extraAbilityText = [];
            if( jsonImportObj.extra_ability_text ) {
                if( typeof( jsonImportObj.extra_ability_text) == "string") {
                    this.extraAbilityText = jsonImportObj.extra_ability_text.split("\n");
                } else {
                    this.extraAbilityText = jsonImportObj.extra_ability_text;
                }

            }

            this.abPowerModifiers = [];
            if( jsonImportObj.ab_power_modifiers ) {
                this.abPowerModifiers = jsonImportObj.ab_power_modifiers;
            }

            this.setPowerRangesToSelf = [];
            if( jsonImportObj.set_power_ranges_to_self ) {
                this.setPowerRangesToSelf = jsonImportObj.set_power_ranges_to_self;
            }
            this.setPowerRangesToTouch = [];
            if( jsonImportObj.set_power_ranges_to_touch ) {
                this.setPowerRangesToTouch = jsonImportObj.set_power_ranges_to_touch;
            }

            this.setPowerRangesToTouchGivesDiscount = true;
            if( typeof(jsonImportObj.set_power_ranges_to_touch_discount) !== "undefined" ) {
                this.setPowerRangesToTouchGivesDiscount = jsonImportObj.set_power_ranges_to_touch_discount;
            }

            this.setPowerRangesToSelfGivesDiscount = true;
            if( typeof(jsonImportObj.set_power_ranges_to_self_discount) !== "undefined" ) {
                this.setPowerRangesToSelfGivesDiscount = jsonImportObj.set_power_ranges_to_self_discount;
            }

            this.powerPointsPerPower = jsonImportObj.power_points_per_power;
            this.skillPerPower = jsonImportObj.skill_per_power;
            // this.book_page = jsonImportObj.page;
            // this.createdBy = jsonImportObj.created_by;
            // this.createdOn = jsonImportObj.created_on;
            // this.updatedBy = jsonImportObj.updated_by;
            // this.updatedOn = jsonImportObj.updated_on;
            // this.deletedBy = jsonImportObj.deleted_by;
            // this.deletedOn = jsonImportObj.deleted_on;
            // this.id = jsonImportObj.id;
            // this.book_id = jsonImportObj.book_id;
            // this.bookName = jsonImportObj.book_name;
            // this.bookShortName = jsonImportObj.book_short_name;
            // this.bookPublisher = jsonImportObj.book_publisher;
            // this.bookPublished = jsonImportObj.book_published;
            if( jsonImportObj.power_points_name ) {
                this.powerPointsName = jsonImportObj.power_points_name;
            }
            // if(typeof( jsonImportObj.book_primary) !== 'undefined' &&  jsonImportObj.book_primary > 0){
            //     this.bookPrimary = true;
            // }
            // if(typeof( jsonImportObj.book_core) !== 'undefined' &&  jsonImportObj.book_core > 0){
            //     this.bookCore = true;
            // }

            // this.updatedByName = jsonImportObj.updated_by_name;
            // this.deletedByName = jsonImportObj.deleted_by_name
            // this.createdByName = jsonImportObj.created_by_name;

        }
        if( this.allowedPowers && this.allowedPowers.length == 0 ) {
            this.allowedPowers.push( "(all)");
        } else {
            for( let pIndex in this.allowedPowers ) {
                this.allowedPowers[pIndex] = this.allowedPowers[pIndex].toLowerCase().trim();
            }
        }
        if(!this.requirements )
            this.requirements = [];
    }

    public selectedPowerCount(): number {
        let count = 0;

        for( let power of this.selectedPowers ) {
            count += power.spellSlotCost;
        }
        for( let power of this.customPowers ) {
            count += power.spellSlotCost;
        }
        return count;
    }

    public availablePowerCount(): number {
        return this.startingPowerCount - (this.selectedPowerCount() );
    }

    public getStartingPowerCount(): number {
        // console.log("ab getStartingPowerCount", this.startingPowerCount, this)
        return this.startingPowerCount;
    }

    public isNamed( nameOrCountsAs: string ): boolean {

        if( this.name.toLowerCase().trim() == nameOrCountsAs.toLowerCase().trim() ) {
            return true;
        }

        for( let countsAs of this.countsAsOtherAB ) {
            if( countsAs ) {
                if( countsAs.toLowerCase().trim() == nameOrCountsAs.toLowerCase().trim() ) {
                    return true;
                }
            }
        }

        let noAbName = this.name.toLowerCase().replace("arcane", "").replace("background", "").replace(":", "").trim()
        nameOrCountsAs = nameOrCountsAs.toLowerCase().replace("arcane", "").replace("background", "").replace(":", "").trim();
        // console.log("noAbName", noAbName)
        // console.log("nameOrCountsAs", nameOrCountsAs)
        if(
            noAbName == nameOrCountsAs
            ||
            noAbName.indexOf( nameOrCountsAs ) === 0
        ) {
            return true;
        }

        return false;
    }

    public export(): IChargenArcaneBackground {
        let returnItem: IChargenArcaneBackground = super.export() as IChargenArcaneBackground;

        returnItem.ignoresPowerRankRequirements = this.ignoresPowerRankRequirements;
        returnItem.set_power_ranges_to_touch = this.setPowerRangesToTouch;
        returnItem.set_power_ranges_to_self = this.setPowerRangesToSelf;
        returnItem.effects = this.effects;
        returnItem.set_power_ranges_to_touch_discount = this.setPowerRangesToTouchGivesDiscount;
        returnItem.set_power_ranges_to_self_discount = this.setPowerRangesToSelfGivesDiscount;
        returnItem.ab_power_modifiers = this.abPowerModifiers;
        returnItem.instructions = this.instructions;
        returnItem.conflicts = this.conflicts;
        returnItem.requirements = this.requirements;
        returnItem.notSelectable = this.notSelectable;
        returnItem.starting_power_points = this.startingPowerPoints;
        returnItem.starting_power_count = this._baseStartingPowerCount;
        returnItem.allowed_powers = this.allowedPowers;
        returnItem.backlash_name = this.backlashName;
        returnItem.countsAsOtherAB = this.countsAsOtherAB;
        returnItem.backlash_description = this.backlashDescription;
        returnItem.arcane_skill = this.arcaneSkill;
        returnItem.power_points_per_power = this.powerPointsPerPower;
        returnItem.skill_per_power = this.skillPerPower;
        returnItem.doesNotProvidePowers = this.doesNotProvidePowers;
        returnItem.power_points_name = this.powerPointsName;
        returnItem.extra_ability_text = this.extraAbilityText;
        returnItem.setting_item = this.setting_item;

        returnItem = cleanUpReturnValue(returnItem);

        return returnItem;
    }

    canBeOppositionSchool(): boolean {

        if( this._char && this._char.setting && this._char.setting.isPathfinder() )
            return true;

        return false;
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

    selectPowerByID(
        powerID: number,
        powerVars: IChargenPowerVars | null,
    ) {

        if( !this._char ) {
            return;
        }

        for( let power of this._char.getAvailableData().powers ) {
            if( power.id ==powerID) {
                let powerObj = new Power(
                    power,
                    this._char,
                    this,

                );

                powerObj.importOptions( powerVars );

                this.selectedPowers.push(
                    powerObj
                );
            }

        }
    }

    public importOptions( ab: IChargenArcaneBackgroundObjectVars ) {
        if( !this._char ) {
            return;
        }
        if( ab ) {
            super.importOptions( ab );

            this.selectedPowers = [];
            if( ab.powers_selected ) {
                for( let power of ab.powers_selected ) {
                    if( power.power_id ) {
                        this.selectPowerByID(
                            power.power_id,
                            power.power_vars,
                        )
                    } else {
                        let cPower = new Power(
                            power.power_def,
                            this._char,
                            this,
                        )
                        cPower.importOptions( power.power_vars );
                        if( power.power_vars && power.power_vars.setting_item ) {
                            this.selectedPowers.push( cPower );
                        } else {
                            this.customPowers.push( cPower );
                        }

                    }
                }
            }

            if( ab.added_power_innate ) {
                this.addedPowerInnate = ab.added_power_innate;
            } else {
                this.addedPowerInnate = {};
            }

            if( ab.added_power_custom_name ) {
                this.addedPowerCustomName = ab.added_power_custom_name;
            } else {
                this.addedPowerCustomName = {};
            }

            if( ab.added_power_custom_description ) {
                this.addedPowerCustomDescription = ab.added_power_custom_description;
            } else {
                this.addedPowerCustomDescription = {};
            }

            if( ab.added_power_aspect_limitation ) {
                this.addedPowerAspectLimitation = ab.added_power_aspect_limitation;
            } else {
                this.addedPowerAspectLimitation = {};
            }

            if( ab.added_power_range_limitation ) {
                this.addedPowerRangeLimitation = ab.added_power_range_limitation;
            } else {
                this.addedPowerRangeLimitation = {};
            }

            if( ab.power_points_name ) {
                this.powerPointsName = ab.power_points_name;
            }

            if( ab.unchangeable ) {
                this.unchangeable = true;
            }

            if( ab.arcane_items && ab.arcane_items.length > 0 ) {
                for( let def of ab.arcane_items ) {
                    this.arcaneItems.push(
                        new ArcaneItem( this._char, def)
                    );
                }
            }
        }

    }

    public exportOptions(): IChargenArcaneBackgroundObjectVars {
        let returnItem: IChargenArcaneBackgroundObjectVars = {
            ab_selected: this.id,
            // custom_powers: this.customPowers,
            // custom_powers: [],
            arcane_items: [],
            power_points_name: this.powerPointsName,
            // powers_installed: [],
            custom_export: this.export(),
            unchangeable: this.unchangeable,
            added_power_innate: this.addedPowerInnate,
            added_power_custom_name: this.addedPowerCustomName,
            added_power_custom_description: this.addedPowerCustomDescription,
            added_power_aspect_limitation: this.addedPowerAspectLimitation,
            added_power_range_limitation: this.addedPowerRangeLimitation,
            uuid: this.uuid,
            // powers_installed: [],
            powers_selected: [],
        }

        // for( let power of this.customPowers ) {
        //     returnItem.custom_powers.push( power.export() );
        // }

        // for( let power of this.selectedPowers ) {
        //     returnItem.powers_installed.push( power.exportOptions() );
        // }
        for( let power of this.selectedPowers ) {
            let exp: IJSONPowerExport = {
                power_id: power.id,
                power_def: power.id == 0 ? power.export() : null,
                power_vars: power.exportOptions(),
            }
            returnItem.powers_selected.push( exp )
        }

        for( let power of this.customPowers ) {
            let exp: IJSONPowerExport = {
                power_id: 0,
                power_def: power.export(),
                power_vars: power.exportOptions(),
            }
            returnItem.powers_selected.push( exp )
        }

        for( let item of this.arcaneItems ) {
            returnItem.arcane_items.push(
                item.export()
            )
        }

        returnItem = cleanUpReturnValue(returnItem);

        // console.log("ab export", returnItem)
        return returnItem;
    }

    public getPowersList(): string[] {
        let rv: string[] = [];

        // Use getAllPowers() to get deduplicated power list
        for( let power of this.getAllPowers() ) {
            if (power.is_custom) {
                rv.push( power.name + " (Custom)" );
            } else {
                rv.push( power.getLineItem() );
            }
        }

        rv.sort();

        return rv;
    }

    public getArcaneItemList(): string[] {
        let rv: string[] = [];

        for( let item of this.arcaneItems) {
            let lineItem = item.name + " (";
            lineItem += item.powerPoints + " PP";
            for( let power of item.powers ) {
                lineItem += "; " + power.name;
                lineItem += ", " + power.book_page;
            }
            lineItem += ")";
            rv.push( lineItem );
        }

        return rv;

    }

    public getSpecialAbilityText(): ISpecialAbilityItem {
        let summary = "Power Points: " + this.getMaxPowerPoints();
        let powers = this.getPowersList();
        if( powers.length > 0 )
            summary += "; Powers: " + powers.join(", ");

        // console.log("XXXX ab.getSpecialAbilityText() this.name", this.name)
        let rv: ISpecialAbilityItem = {
            name: this.getName(),
            summary: summary,
            specify: "",
            specifyValue: "",
            specifyLimit: [],
            alternate_options: [],
            selectItems: [],
            from: "",
            positive: true,
            book_name: this.getBookShortName(),
            page: this.book_page,
            book_id: this.book_id,
            custom: this.book_id > 0 ? true : false,
        }

        return rv;
    }

    public getAvailablePowers( abIndex: number, anyPower: boolean = false): Power[] {
        let rv: Power[] = [];
        if( !this._char ) {
            return [];
        }

        for( let power of this._char.getAvailableData().powers) {
            let powerObj = new Power( power, this._char, this,  );
            if( this._char.setting.book_is_used( power.book_id)) {

                if( anyPower || powerObj.LEGACY_isAvailable( abIndex, false, this._char ) ) {
                    rv.push( powerObj );
                }
            }
        }

        rv.sort( ( a: Power, b:Power) => {
            if( a.name > b.name ) {
                return 1;
            } else if( a.name < b.name ) {
                return -1;
            } else {
                return 0;
            }
        })

        return rv;
    }

    public getAllPowers(): Power[] {
        let rv: Power[] = [];
        let seenUuids: Set<string> = new Set();

        for( let power of this.addedPowers ) {
            if (power.uuid && !seenUuids.has(power.uuid)) {
                seenUuids.add(power.uuid);
                rv.push( power );
            } else if (!power.uuid) {
                // For powers without UUID, still add them (shouldn't happen in normal cases)
                rv.push( power );
            }
        }

        for( let power of this.customPowers ) {
            if (power.uuid && !seenUuids.has(power.uuid)) {
                seenUuids.add(power.uuid);
                rv.push( power );
            } else if (!power.uuid) {
                rv.push( power );
            }
        }

        for( let power of this.addedCustomPowers ) {
            let powerItem: Power = new Power(
                null,
                this._char,
                this,

            );

            powerItem.name = power.name;
            powerItem.duration = power.duration;
            powerItem.powerPoints = power.power_points;
            powerItem.range = power.range;
            powerItem.summary = power.summary;
            powerItem.is_custom = true;

            // Custom powers from addedCustomPowers don't have UUIDs, so add them directly
            rv.push( powerItem );
        }

        for( let power of this.selectedPowers ) {
            if (power.uuid && !seenUuids.has(power.uuid)) {
                seenUuids.add(power.uuid);
                rv.push( power);
            } else if (!power.uuid) {
                rv.push( power);
            }
        }

        return rv;
    }

    public getCurrentPowerPoints(): number {
        let rv = this.getMaxPowerPoints();

        for( let arcaneItem of this.arcaneItems ) {
            rv -= +arcaneItem.powerPoints;
        }

        return rv;
    }

    public getMaxPowerPoints(): number {

        let startingPowerPointModifier = 1;
        let powerPointEdgeMultiplier = 1;
        if( this.powerPointMultiplier > startingPowerPointModifier ) {
            startingPowerPointModifier = this.powerPointMultiplier;
        }

        if( this.powerPointMultiplier > powerPointEdgeMultiplier ) {
            powerPointEdgeMultiplier = this.powerPointMultiplier;
        }

        if( this.powerPointEdgeMultiplier > powerPointEdgeMultiplier ) {
            powerPointEdgeMultiplier = this.powerPointEdgeMultiplier;
        }

        // console.log("powerPointEdgeMultiplier", powerPointEdgeMultiplier)
        // console.log("startingPowerPointModifier", startingPowerPointModifier)
        // console.log("this.startingPowerPoints", this.startingPowerPoints)
        // console.log("this.addedPowerPoints", this.addedPowerPoints)
        // console.log("this.bonusPPE", this.bonusPPE)
        let startingPowerPoints = this.startingPowerPoints;
        let racialBonus = 0;
        if( this._char && this._char.setting.isPathfinder() ) {
            for( let ab of this._char._selectedArcaneBackgrounds ) {
                if( ab && ab.startingPowerCount > startingPowerPoints )  {
                    // console.log("X", ab.getName(), startingPowerPoints, ab.startingPowerCount)
                    startingPowerPoints = ab.startingPowerCount;
                    // console.log("X2", ab.getName(), startingPowerPoints, ab.startingPowerCount)
                }
            }

            if( this._char.race ) {
                racialBonus = this._char.race.getRacialPowerPoints();
            }
        }

        let rv = (startingPowerPoints * startingPowerPointModifier)
            + (this.addedPowerPoints * powerPointEdgeMultiplier)
            + this.bonusPPE + racialBonus;

        // console.log("rv", rv)

        return rv;
    }

    getName() {
        return this.name;
    }

    public isAvailable( charObj: PlayerCharacter | null = null): IItemUpdateItemAvailability {
        if( !charObj ) {
            charObj = this._char;
        }

        if( !charObj ) {
            return {
                canBeTaken: false,
                messages: [],
            };
        }

        let messages: string[] = [];

        let canBeTaken = true;

        if( !charObj.setting.abIsEnabled( this.id ) && !this.fromRace ) {
            messages.push("Arcane Background \"" + this.getName() + "\" is not enabled in the Character Settings")
            canBeTaken = false;
        }

        // Requirements!
        for( let req of this.requirements ) {

            if( req.trim() ) {
                let result = ParseRequirementLine( req, charObj);

                if( !result.empty && !result.found ) {
                    messages.push("Arcane Background \"" + this.getName() + "\" requires: " + result.parseMessage)
                    canBeTaken = false;
                }
            }
        }

        // Conflicts
        for( let conflict of this.conflicts ) {
            let result = ParseRequirementLine( conflict, charObj);

            if( !result.empty &&  result.found ) {
                messages.push( result.parseMessage)
                canBeTaken = false;
            }
        }

        return {
            canBeTaken: canBeTaken,
            messages: messages,
        };
    }

    public isAvailableBool( charObj: PlayerCharacter | null = null): boolean {
        if( !charObj ) {
            charObj = this._char;
        }

        if( !charObj ) {
            return false;
        }

        if( !charObj.setting.abIsEnabled( this.id )) {
            return false;
        }

        // Requirements!
        for( let req of this.requirements ) {

            if( req.trim() ) {
                let result = ParseRequirementLine( req, charObj);

                if( !result.empty && !result.found ) {

                    return false;
                }
            }
        }

        // Conflicts
        for( let conflict of this.conflicts ) {
            let result = ParseRequirementLine( conflict, charObj);

            if( !result.empty &&  result.found ) {
                return false;
            }
        }

        return true;
    }

    setPowerPowerPoints(
        powerName: string,
        newPPCost: number = 0,
    ) {
        powerName = replaceAll(powerName, "*", "");
        let powerNameLC = powerName.toLowerCase().trim();

        for( let power of this.selectedPowers ) {
            if( power.name.toLowerCase().trim() == powerNameLC ) {
                power.powerPointsOverride = newPPCost
            }
        }

        for( let power of this.addedPowers ) {
            if( power.name.toLowerCase().trim() == powerNameLC ) {
                power.powerPointsOverride = newPPCost
            }
        }

    }

    hadSelectedPower( name: string ): boolean {
        for( let power of this.selectedPowers ) {
            if(
                power.name.toLowerCase().trim == name.toLowerCase().trim
            ) {
                return true;
            }
        }

        return false;
    }

    hasPowerPointPool(): boolean {

        if( this._char && this._char.setting && this._char.setting.isPathfinder() ) {
            let abs = this._char.getArcaneBackgrounds();
            for( let index in abs ) {
                if( +index > 0 && abs[index].uuid == this.uuid ) {
                    return false;
                }
            }
        }

        return true;
    }

    apply() {

        if(!this._char) {
            return;
        }
        if( this._hasBeenApplied ) {
            console.log( this.getName() + " has already been applied, skipping");
            return;
        }

        this._hasBeenApplied = true;

        for( let power of this.selectedPowers ) {
            power.apply();
        }

        for( let power of this.customPowers ) {
            power.apply();
        }

        for( let power of this.addedPowers ) {
            power.apply();
        }

        let skill = this._char.getSkill( this.arcaneSkill ? this.arcaneSkill.name : "");
        if( !skill && this.arcaneSkill ) {
            let skill = new Skill( this._char);
            skill.name = this.arcaneSkill.name.trim();
            skill.attribute = this.arcaneSkill.attribute.toLowerCase().trim();
            skill.originalAttribute = this.arcaneSkill.attribute.toLowerCase().trim();
            this._char.skills.push(
                skill
            )
        }

        if(
            this.arcaneSkill
            && this._char
            && this._char.setting
            && this._char.setting.isPathfinder()
            && this.takenAtAdvance > -1
        ) {
            this._char.addSkillBoostIfZero(
                this.arcaneSkill.name,
                1,
            );
        }

        ApplyCharacterEffects(
            this.effects,
            this._char,
            "Arcane Background",
        )

        for( let power of this.addedPowers) {
            power.innatePower = false;
            if( this.addedPowerInnate && power.getBaseName() in this.addedPowerInnate ) {
                power.innatePower = this.addedPowerInnate[power.name];
            }

            if( this.addedPowerCustomName && power.getBaseName() in this.addedPowerCustomName ) {
                power.customName = this.addedPowerCustomName[power.getBaseName()];
            }

            if( this.addedPowerCustomDescription && power.getBaseName() in this.addedPowerCustomDescription ) {
                power.customDescription = this.addedPowerCustomDescription[power.getBaseName()].join();
            }

            if( this.addedPowerRangeLimitation && power.getBaseName() in this.addedPowerRangeLimitation ) {
                power.limitationRange = this.addedPowerRangeLimitation[power.getBaseName()];
            }

            if( this.addedPowerAspectLimitation && power.getBaseName() in this.addedPowerAspectLimitation ) {
                power.limitationAspect = this.addedPowerAspectLimitation[power.getBaseName()];
            }
        }

        for( let powerName of this.setPowerRangesToSelf ) {
            if( powerName ) {
                for( let power of this.selectedPowers ) {
                    power.allowedToSelectAspectLimitation = true;
                    power.allowedToSelectRangeLimitation = true;
                    if( power.isNamed( powerName )) {
                        power.rangeLimitationGivesPPDiscount = this.setPowerRangesToSelfGivesDiscount;
                        power.allowedToSelectRangeLimitation = false;
                        power.limitationRange = "Self"
                    }
                }
                for( let power of this.addedPowers ) {
                    power.allowedToSelectAspectLimitation = true;
                    power.allowedToSelectRangeLimitation = true;
                    if( power.isNamed( powerName )) {
                        power.rangeLimitationGivesPPDiscount = this.setPowerRangesToSelfGivesDiscount;
                        power.allowedToSelectRangeLimitation = false;
                        power.limitationRange = "Self"
                    }
                }
            }
        }
        for( let powerName of this.setPowerRangesToTouch ) {
            if( powerName ) {
                for( let power of this.selectedPowers ) {
                    power.allowedToSelectAspectLimitation = true;
                    power.allowedToSelectRangeLimitation = true;
                    if( power.isNamed( powerName )) {
                        power.rangeLimitationGivesPPDiscount = this.setPowerRangesToTouchGivesDiscount;
                        power.allowedToSelectRangeLimitation = false;
                        power.limitationRange = "Touch"
                    }
                }

                for( let power of this.addedPowers ) {
                    power.allowedToSelectAspectLimitation = true;
                    power.allowedToSelectRangeLimitation = true;
                    if( power.isNamed( powerName )) {
                        power.rangeLimitationGivesPPDiscount = this.setPowerRangesToTouchGivesDiscount;
                        power.allowedToSelectRangeLimitation = false;
                        power.limitationRange = "Touch"
                    }
                }
            }
        }
    }

    reset() {
        super.reset();
        this.effects = [];
    }

    setStartingPowerCount(nv: number) {
        // console.log("ab setStartingPowerCount", nv)
        this.startingPowerCount = nv;
        // this._baseStartingPowerCount = nv;
    }

    incrementStartingPowers(nv: number) {
        // console.log("ab ncrementStartingPowers", nv)
        this.startingPowerCount += nv;
        // this._baseStartingPowerCount += nv;
    }

    calcReset() {
        this._hasBeenApplied = false;
        this.makeABSkills();
        this.bonusPPE = 0;
        this.powerPointMultiplier = 1;
        this.addedPowerPoints = 0;
        this.megaPowers = false;
        this.mysticPowerModifiers = false;
        this.startingPowerCount = this._baseStartingPowerCount;
        // console.log("ab calcReset()", this.startingPowerCount, this._baseStartingPowerCount)

        this.currentPowerPoints = this.startingPowerPoints;
        this.addedPowers = [];
        this.addedCustomPowers = [];

        for( let power of this.selectedPowers ) {
            power.calcReset()
        }
        for( let power of this.addedPowers ) {
            power.calcReset()
        }
    }

    public removeCustomPower(
        powerIndex: number
    ) {
        if(!this._char)
            return;
        if( this.customPowers.length > powerIndex ) {
            for( let skillCount = this._char.skills.length -1; skillCount > -1; skillCount--) {
                if(this._char.skills[skillCount].arcaneAddedUUID == this.customPowers[powerIndex].uuid ) {
                    this._char.skills.splice(skillCount, 1);
                }
            }
            this.customPowers.splice(powerIndex, 1);

        }
    }

    public removeSelectedPower(
        powerIndex: number
    ) {
        if(!this._char)
            return;
        if( this.selectedPowers.length > powerIndex ) {
            for( let skillCount = this._char.skills.length -1; skillCount > -1; skillCount--) {
                if(this._char.skills[skillCount].arcaneAddedUUID == this.selectedPowers[powerIndex].uuid ) {
                    this._char.skills.splice(skillCount, 1);
                }
            }
            this.selectedPowers.splice(powerIndex, 1);

        }
    }

    addCustomPower(
        customPower: IChargenPowers,
        isAdded: boolean = false,
    ) {

        let power = new Power( customPower, this._char, this, );
        power.is_custom = true;
        power.readOnly = isAdded;
        this.customPowers.push(
            power
        )

        return false;
    }

    updateCustomPower(
        powerIndex: number,
        customPower: IChargenPowers
    ) {

        if( this.customPowers.length > powerIndex ) {
            this.customPowers[powerIndex] =  new Power( customPower, this._char, this, )
        }

        return false;
    }

    // public getBookPage(): string {

    //     if(
    //         this.is_custom
    //         || (!this.bookShortName && this.book_page )
    //     ) {
    //         return "Custom";
    //     } else {
    //         if( this.setting_item ) {
    //             return "Setting Power";
    //         } else {
    //             return this.bookShortName + " p" + replaceAll(this.book_page, "p", "")
    //         }

    //     }

    // }
}

export interface IChargenArcaneBackgroundObjectVars extends IBaseObjectVars{
    ab_selected: number;

    powers_installed?: ILEGACYJSONPowerExport[]; // LEGACY
    custom_powers?: IChargenPowers[]; // LEGACY

    arcane_items: IJSONArcaneItemExport[];
    power_points_name?: string;
    unchangeable: boolean;
    custom_export: IChargenArcaneBackground | null;
    added_power_innate: { [index: string]: boolean };
    added_power_custom_name: { [index: string]: string };
    added_power_custom_description: { [index: string]: string[] };
    added_power_range_limitation: { [index: string]: string };
    added_power_aspect_limitation: { [index: string]: string };

    powers_selected: IJSONPowerExport[];
    // powers_custom: ILEGACYJSONPowerExport[];

}