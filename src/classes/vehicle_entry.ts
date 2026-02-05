import { IChargenData } from "../interfaces/IChargenData";
import { IExportContainerItems, IExportVehicleStatsOutput } from "../interfaces/IExportStatsOutput";
import { IContainerItemExport } from "../interfaces/IJSONPlayerCharacterExport";
import { cleanUpReturnValue } from '../utils/cleanUpReturnValue';
import { FormatMoney, replaceAll } from "../utils/CommonFunctions";
import { generateUUID } from "../utils/generateUUID";
import { getSizeName } from "../utils/getSizeName";
import { ParseDamageString } from "../utils/ParseDamageString";
import { IBook } from "./book";
import { Armor, IChargenArmor } from './player_character/armor';
import { Gear, IChargenGear } from './player_character/gear';
import { GearEnhancement } from "./player_character/gear_enhancement";
import { PlayerCharacter } from "./player_character/player_character";
import { IChargenWeapon, Weapon } from "./player_character/weapon";
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from "./_base_object";

export interface IVehicleEntry extends IBaseObjectExport{
    // uuid: string;  // Legacy Import
    contains?: IContainerItemExport[];  // Legacy Import
    buy_cost?: number;  // Legacy Import
    // book_page?: string // Legacy Import

    size: number;
    handling: string;
    glitches: string;
    // description: string;
    cost: number;

    top_speed_mph: number;
    top_speed_kph: number;
    uses_pace: boolean;
    running_die: string;
    pace: string;
    pace_fly: string;
    pace_swim: string;
    pace_mph: string;
    pace_fly_mph: string;
    pace_swim_mph: string;
    pace_kph: string;
    pace_fly_kph: string;
    pace_swim_kph: string;
    toughness: number;
    armor: number;
    crew: string;
    strength: string;
    notes: string[] | string;
    special_abilities: string[];
    weapons: Weapon[];
    textWeapons: string[];
    remaining_mods: number;

    no_select: boolean;

}

export class VehicleEntry extends BaseObject  {
    // uuid: string;
    no_select: boolean = false;
    quantity: number = 1;
    size: number;
    handling: string;

    gear_enhancements: GearEnhancement[] = [];
    uses_pace: boolean = false;

    cost: number;
    buy_cost: number;

    glitches: string = "";

    top_speed_mph: number;
    top_speed_kph: number;

    pace: string;
    pace_fly: string;
    pace_swim: string;

    pace_mph: string;
    pace_fly_mph: string;
    pace_swim_mph: string;

    pace_kph: string;
    pace_fly_kph: string;
    pace_swim_kph: string;

    toughness: number;
    armor: number;

    crew: string;
    strength: string;

    notes: string;
    textWeapons: string[];
    special_abilities: string[];
    weapons: Weapon[];

    remaining_mods: number;
    running_die: string = "d6";

    contains: IContainerItemExport[] = [];

    active: boolean;

    framework_item: boolean = false;
    setting_item: boolean = false;

    // private _char: PlayerCharacter = null;

    constructor(
        data: IVehicleEntry | null = null,
        charObj: PlayerCharacter | null = null
    ) {
        super(data, charObj)
        if( data ) {
            this.import( data );
        } else {
            this.reset();
        }

    }

    public import(
        data: IVehicleEntry | null ,
        book_list: IBook[] = [],
    ) {
        this.reset();
        if( data ) {
            //@ts-ignore
            super.import(data, book_list);
            if( data.uuid ) {
                this.uuid = data.uuid;
            }

            // typeof(data.book_page) != "undefined" ? this.book_page = data.book_page : null;

            if( data.contains ) {
                this.contains = data.contains;
            }
            if( data.buy_cost ) {
                this.buy_cost = data.buy_cost;
            }

            if( data.glitches ) {
                this.glitches = data.glitches;
            }

            this.uses_pace = false;
            if( data.uses_pace ) {
                this.uses_pace = true;
            }
            if( data.cost ) {
                this.cost = data.cost;
            }

            if( data.size ) {
                this.size = data.size;
            }
            if( data.handling ) {
                this.handling = data.handling;
            }

            if( data.top_speed_mph ) {
                this.top_speed_mph = data.top_speed_mph;
            }
            if( data.top_speed_kph ) {
                this.top_speed_kph = data.top_speed_kph;
            }

            if( data.pace ) {
                this.pace = data.pace;
            }
            if( data.pace_fly ) {
                this.pace_fly = data.pace_fly;
            }
            if( data.pace_swim ) {
                this.pace_swim = data.pace_swim;
            }

            if( data.pace_mph ) {
                this.pace_mph = data.pace_mph;
            }
            if( data.pace_fly_mph ) {
                this.pace_fly_mph = data.pace_fly_mph;
            }
            if( data.pace_swim_mph ) {
                this.pace_swim_mph = data.pace_swim_mph;
            }

            data.no_select = false;
            if( data.no_select ) {
                this.no_select = true;
            }

            if( data.pace_kph ) {
                this.pace_kph = data.pace_kph;
            }
            if( data.pace_fly_kph ) {
                this.pace_fly_kph = data.pace_fly_kph;
            }
            if( data.pace_swim_kph ) {
                this.pace_swim = data.pace_swim;
            }

            if( data.toughness ) {
                this.toughness = data.toughness;
            }
            if( data.armor ) {
                this.armor = data.armor;
            }
            if( data.crew ) {
                this.crew = data.crew;
            }

            if( data.strength ) {
                this.strength = data.strength;
            }

            if( data.notes ) {
                if( typeof( data.notes) == "string")
                    this.notes = data.notes;
                else
                    this.notes = data.notes.join("\n");
            }
            if( data.running_die ) {
                this.running_die = data.running_die;
            }
            if( data.textWeapons ) {
                this.textWeapons = data.textWeapons;
            }

            if( data.special_abilities ) {
                this.special_abilities = data.special_abilities;
            }
            if( data.remaining_mods ) {
                this.remaining_mods = data.remaining_mods;
            }

            if( data.weapons ) {
                this.weapons = data.weapons;
            }

        }
    }

    public getWeaponLines(): string[] {
        let returnVal: string[] = [];

        for( let line of this.textWeapons  ) {
            if( line.trim() )
                returnVal.push( line.trim() );
        }

        returnVal.sort();

        return returnVal;
    }

    public reset() {
        super.reset();
        this.active = true;
        this.uuid = generateUUID();

        // this.id = 0;
        // this.is_custom = false;
        this.textWeapons = [];

        this.name = "";
        this.size = 0;
        this.handling = "";
        this.running_die = "d6";

        this.cost = 0;
        this.buy_cost = 0;

        this.top_speed_mph = 0;
        this.top_speed_kph = 0;

        this.pace = "";
        this.pace_fly = "";
        this.pace_swim = "";

        this.pace_mph = "";
        this.pace_fly_mph = "";
        this.pace_swim_mph = "";

        this.pace_kph = "";
        this.pace_fly_kph = "";
        this.pace_swim_kph = "";

        this.toughness = 0;
        this.armor = 0;

        this.crew = "";
        this.strength = "";

        this.notes = "";
        this.special_abilities = [];
        this.weapons = [];

        this.remaining_mods = 0;

        this.contains = [];

    }

    public export(): IVehicleEntry {
        let returnObj = super.export() as IVehicleEntry;

        returnObj.no_select = this.no_select;
        returnObj.running_die = this.running_die;
        returnObj.cost = this.cost;
        returnObj.buy_cost = this.buy_cost;
        returnObj.glitches = this.glitches;
        returnObj.size = this.size;
        returnObj.handling = this.handling;
        returnObj.top_speed_mph = this.top_speed_mph;
        returnObj.top_speed_kph = this.top_speed_kph;
        returnObj.pace = this.pace;
        returnObj.pace_fly = this.pace_fly;
        returnObj.pace_swim = this.pace_swim;
        returnObj.uses_pace = this.uses_pace;
        returnObj.pace_mph = this.pace_mph;
        returnObj.pace_fly_mph = this.pace_fly_mph;
        returnObj.pace_swim_mph = this.pace_swim_mph;
        returnObj.pace_kph = this.pace_kph;
        returnObj.pace_fly_kph = this.pace_fly_kph;
        returnObj.pace_swim_kph = this.pace_swim_kph;
        returnObj.toughness = this.toughness;
        returnObj.armor = this.armor;
        returnObj.crew = this.crew;
        returnObj.strength = this.strength;
        returnObj.notes = this.notes;
        returnObj.textWeapons = this.textWeapons;
        returnObj.special_abilities = this.special_abilities;
        returnObj.weapons = this.weapons;
        returnObj.remaining_mods = this.remaining_mods;

        returnObj = cleanUpReturnValue(returnObj);

        // console.log(returnObj);
        return returnObj;
    }

    public getName(): string {
        return this.name;
    }

    // public getBookShortName(): string {
    //     return this.book_short_name;
    // }

    public getToughnessHR(): string {
        let rv = this.toughness.toString();
        if( this.armor > 0 ) {
            rv += " (" + this.armor + ")";
        }

        return rv;
    }

    public getTotalCostHR(): string {
        if( this._char && this._char.setting ) {
            if( this.cost != this.buy_cost ) {
                return FormatMoney(this.buy_cost , this._char.setting);
            } else {
                return FormatMoney(this.cost , this._char.setting);
            }
        } else {
            if( this.cost != this.buy_cost ) {
                return "$" + this.buy_cost.toLocaleString();
            } else {
                return "$" + this.cost.toLocaleString();
            }

        }
    }

    public getCostHR(): string {
        if( this._char && this._char.setting ) {
            if( this.cost != this.buy_cost ) {
                return FormatMoney(this.buy_cost, this._char.setting);
            } else {
                return FormatMoney(this.cost, this._char.setting);
            }
        } else {
            if( this.cost != this.buy_cost ) {
                return "$" + this.buy_cost.toLocaleString();
            } else {
                return "$" + this.cost.toLocaleString();
            }
        }

    }

    public getHTMLLine(): string {
        let sLine = "<strong>" + this.getName() + "</strong>";

        let components = this.getNotes();

        if( components.length > 0 ) {
            sLine += " (" + components.join("; ") + ")<br />\n";
        }

        if( this.getWeaponLines().length > 0 ) {
            sLine += "<strong>Weapons</strong>\n<ul class=\"no-margins\">\n";
            for( let line of this.getWeaponLines()) {
                sLine += "<li>" ;
                sLine += line;
                let getStats = this.getWeaponStatsLine( line );
                if( getStats ) {
                    sLine += "<div class=\"small-text\">" + getStats + "</div>";
                }
                sLine +="</li>\n";
            }
            sLine += "</ul><br />\n";
        }

        if( this.contains && this.contains.length > 0 ) {
            sLine += "\n<ul><li><strong>Contains</strong>:&nbsp;";
            let names: string[] = [];

            for( let item of this.contains ) {
                names.push( item.name );
            }
            sLine += names.join(", ");
            sLine += "</li></ul><br />\n";
        }

        return sLine + "\n";
    }

    public getNotes(): string[] {
        let components: string[] = [];

        components.push("Size: " + this.size + " (" + getSizeName( this.size) + ")")
        components.push("Handling: " + this.handling)

        if( this.toughness > 0 ) {
            if( this.armor > 0 )
                components.push("Toughness: " + this.toughness.toString() + " (" + this.armor.toString() + ")")
            else
                components.push("Toughness: " + this.toughness.toString())
        }

        if( this.uses_pace ) {
            if( +this.pace > 0 )
                components.push("Pace: " + this.pace)
            if( +this.pace_fly > 0 )
                components.push("Flying Pace: " + this.pace_fly)
            if( +this.pace_swim > 0 )
                components.push("Swimming Pace: " + this.pace_swim)

            components.push( "Running Die: " + this.running_die)
        }

        if( +this.top_speed_mph > 0 )
            components.push("Top Speed: " + this.top_speed_mph + "mph/" + this.top_speed_kph + "kph")

        if( this.strength.trim() )
            components.push("Strength: " + this.strength.trim())

        if( this.notes.length > 0 && this.notes[0].trim() ) {
            components.push("Notes: " + this.notes);
        }

        if( this.glitches && this.glitches.trim() ) {
            components.push("Glitches: " + this.glitches)
        }

        return components;
    }

    getTotalCost(): number {
        return this.cost;
    }

    getCost(): number {
        return this.cost;
    }
    getTotalWeight(): number {
        return 0;
    }

    getWeaponStatsLine( weaponName: string ): string {
        if( !this._char  ) {
            return "";
        }

        if( this.is_custom  ) {
            return "";
        }

        weaponName = weaponName.trim().toLowerCase();
        if( weaponName.indexOf( " x " ) > -1 ) {
            let split = weaponName.split( " x ", 2 );
            weaponName = split[1].trim();
        }

        let weaponNameAlt2 = "";
        if( weaponName.indexOf( "(" ) > -1 ) {
            let split = weaponName.split( "(", 2 );
            weaponName = split[0].trim();
            weaponNameAlt2 = split[1].trim();
        }

        if( weaponName[ weaponName.length - 1 ] == "s") {
            weaponName = weaponName.substring( 0, weaponName.length - 1 );
        }

        let dualLinked = false;
        let quadLinked = false;
        if( weaponName.indexOf("dual-link") > 0 )
            dualLinked = true;
        if( weaponName.indexOf("dual-link") > 0 )
            quadLinked = true;

        weaponName = replaceAll( weaponName, "dual-linked", "");
        weaponName = replaceAll( weaponName, "quad-linked", "");
        weaponName = replaceAll( weaponName, "dual-link", "");
        weaponName = replaceAll( weaponName, "quad-link", "");

        weaponNameAlt2 = replaceAll( weaponNameAlt2, "dual-linked", "");
        weaponNameAlt2 = replaceAll( weaponNameAlt2, "quad-linked", "");
        weaponNameAlt2 = replaceAll( weaponNameAlt2, "dual-link", "");
        weaponNameAlt2 = replaceAll( weaponNameAlt2, "quad-link", "");

        let weaponNameAlt = weaponName;
        weaponNameAlt = replaceAll(weaponNameAlt, "sm. ", "small ");
        weaponNameAlt = replaceAll(weaponNameAlt, "med. ", "medium ");
        weaponNameAlt = replaceAll(weaponNameAlt, "lg. ", "large ");
        weaponNameAlt = replaceAll(weaponNameAlt, "md ", "medium ");
        weaponNameAlt = replaceAll(weaponNameAlt, "sm ", "small ");
        weaponNameAlt = replaceAll(weaponNameAlt, "lg ", "large ");

        weaponNameAlt2 = replaceAll(weaponNameAlt2, "sm. ", "small ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "med. ", "medium ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "lg. ", "large ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "md ", "medium ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "sm ", "small ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "lg ", "large ");

        for( let weapon of this._char.getAvailableData().weapons ) {

            let itemName = weapon.name.toLowerCase();

            if(

                this._char.setting.book_is_used(weapon.book_id)

                    &&
                !weapon.melee_only
                    &&
                (
                    weaponNameAlt.indexOf(itemName) > -1
                        ||
                    itemName.indexOf(weaponNameAlt) > -1
                        ||
                    weaponName.indexOf(itemName) > -1
                        ||
                    itemName.indexOf(weaponName) > -1
                        ||
                    ( weaponNameAlt2.trim() && weaponNameAlt2.indexOf(itemName) > -1 )
                        ||
                    ( weaponNameAlt2.trim() &&  itemName.indexOf(weaponNameAlt2) > -1 )
                )
            ) {

                let weaponObj = new Weapon( weapon,  this._char, );
                if( dualLinked )
                    weaponObj.profiles[0].notes += " * Dual Linked: +1 to hit, +2 to damage";
                if( quadLinked )
                    weaponObj.profiles[0].notes += " * Quad Linked: +2 to hit, +4 to damage";
                return weapon.name + " - " + weaponObj.getShortStats();
            }
        }

        return "";
    }

    getWeaponStats( weaponName: string ): Weapon | null {
        if( !this._char ) {
            return null;
        }

        weaponName = weaponName.trim().toLowerCase();
        if( weaponName.indexOf( " x " ) > -1 ) {
            let split = weaponName.split( " x ", 2 );
            weaponName = split[1].trim();
        }

        let weaponNameAlt2 = "";
        if( weaponName.indexOf( "(" ) > -1 ) {
            let split = weaponName.split( "(", 2 );
            weaponName = split[0].trim();
            weaponNameAlt2 = split[1].trim();
        }

        if( weaponName[ weaponName.length - 1 ] == "s") {
            weaponName = weaponName.substring( 0, weaponName.length - 1 );
        }

        let dualLinked = false;
        let quadLinked = false;
        if( weaponName.indexOf("dual-link") > 0 )
            dualLinked = true;
        if( weaponName.indexOf("dual-link") > 0 )
            quadLinked = true;

        weaponName = replaceAll( weaponName, "dual-linked", "");
        weaponName = replaceAll( weaponName, "quad-linked", "");
        weaponName = replaceAll( weaponName, "dual-link", "");
        weaponName = replaceAll( weaponName, "quad-link", "");

        weaponNameAlt2 = replaceAll( weaponNameAlt2, "dual-linked", "");
        weaponNameAlt2 = replaceAll( weaponNameAlt2, "quad-linked", "");
        weaponNameAlt2 = replaceAll( weaponNameAlt2, "dual-link", "");
        weaponNameAlt2 = replaceAll( weaponNameAlt2, "quad-link", "");

        let weaponNameAlt = weaponName;
        weaponNameAlt = replaceAll(weaponNameAlt, "sm. ", "small ");
        weaponNameAlt = replaceAll(weaponNameAlt, "med. ", "medium ");
        weaponNameAlt = replaceAll(weaponNameAlt, "lg. ", "large ");
        weaponNameAlt = replaceAll(weaponNameAlt, "md ", "medium ");
        weaponNameAlt = replaceAll(weaponNameAlt, "sm ", "small ");
        weaponNameAlt = replaceAll(weaponNameAlt, "lg ", "large ");

        weaponNameAlt2 = replaceAll(weaponNameAlt2, "sm. ", "small ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "med. ", "medium ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "lg. ", "large ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "md ", "medium ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "sm ", "small ");
        weaponNameAlt2 = replaceAll(weaponNameAlt2, "lg ", "large ");

        for( let weapon of this._char.getAvailableData().weapons ) {

            let itemName = weapon.name.toLowerCase();

            if(

                this._char.setting.book_is_used(weapon.book_id)

                    &&
                !weapon.melee_only
                    &&
                (
                    weaponNameAlt.indexOf(itemName) > -1
                        ||
                    itemName.indexOf(weaponNameAlt) > -1
                        ||
                    weaponName.indexOf(itemName) > -1
                        ||
                    itemName.indexOf(weaponName) > -1
                        ||
                    ( weaponNameAlt2.trim() && weaponNameAlt2.indexOf(itemName) > -1 )
                        ||
                    ( weaponNameAlt2.trim() &&  itemName.indexOf(weaponNameAlt2) > -1 )
                )
            ) {

                return new Weapon( weapon, this._char, );

            }
        }

        return null;
    }

    getGenericContains(): IExportContainerItems {
        let rv: IExportContainerItems = {
            gear: [],
            weapons: [],
            armor: [],
            shields: [],
        }

        if(!this._char) {
            return rv;
        }

        if( this.contains )  {
            for( let item of this.contains ) {
                if( item.type == "gear" ) {
                    if( item.id > 0 ) {
                        for( let itemDef of this._char.getAvailableData().gear ) {
                            if( itemDef.id == item.id ) {
                                let itemObj = new Gear( itemDef, this._char)
                                itemObj.contains = item.contains ? item.contains : [];
                                itemObj.buyCost = item.cost_buy;
                                rv.gear.push( itemObj.getGenericExport() )
                                break;
                            }
                        }
                    } else {
                        let itemObj = new Gear( item.custom as IChargenGear, this._char)
                        itemObj.contains = item.contains ? item.contains : [];
                        itemObj.buyCost = item.cost_buy;
                        rv.gear.push( itemObj.getGenericExport() )
                    }

                }

                if( item.type == "armor" ) {
                    if( item.id > 0 ) {
                        for( let itemDef of this._char.getAvailableData().armor ) {
                            if( itemDef.id == item.id ) {
                                let itemObj = new Armor( itemDef, this._char)
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

    public exportGenericJSON(
        chargenData: IChargenData,
        appVersion: string,
        createdOn: Date,
        updatedOn: Date,
        fullPathHost: boolean,
    ): IExportVehicleStatsOutput {

        let rv: IExportVehicleStatsOutput =  {
            id: this.id,
            uuid: this.uuid,
            createdDate: createdOn,
            updatedDate: updatedOn,
            appVersion: appVersion,

            description: this.description,

            name: this.name,
            size: this.size,
            handling: this.handling,

            cost: this.cost,
            buy_cost: this.buy_cost,

            top_speed_mph: this.top_speed_mph,
            top_speed_kph: this.top_speed_kph,

            uses_pace: this.uses_pace,
            running_die: this.running_die,

            pace: this.pace,
            pace_fly: this.pace_fly,
            pace_swim: this.pace_swim,

            pace_mph: this.pace_mph,
            pace_fly_mph: this.pace_fly_mph,
            pace_swim_mph: this.pace_swim_mph,

            pace_kph: this.pace_kph,
            pace_fly_kph: this.pace_fly_kph,
            pace_swim_kph: this.pace_swim_kph,

            toughness: this.toughness,
            armor: this.armor,

            crew: this.crew,
            strength: this.strength,

            notes: this.notes,
            special_abilities: [],

            remaining_mods: this.remaining_mods,

            contains: this.getGenericContains(),
            weapons: [],
        }

        // console.log("contains", rv.contains)

        for( let weaponName of this.getWeaponLines() ) {
            let weapon = this.getWeaponStats( weaponName );
            if( weapon ) {
                let damageDie = ParseDamageString(
                    weapon.profiles[0].damage,
                    "",
                    "",
                    "",
                );
                rv.weapons.push({
                    id: weapon.id,
                    uuid: weapon.uuid,
                    activeProfile: 0,
                    name: weapon.getName(),
                    weight: weapon.getTotalWeight(),
                    range: weapon.getRange(),
                    damage: weapon.getDamage(),
                    damageWithBrackets:  weapon.getDamage( true, ),
                    rof: weapon.profiles[0].rof,
                    shots: weapon.profiles[0].shots,
                    ap: weapon.getAP(),
                    notes: weapon.getNotes(),
                    thrown: weapon.profiles[0].thrown_weapon,
                    quantity: weapon.quantity,
                    bookPublisher: "",
                    bookPublished: "",
                    bookName: "",
                    reach: weapon.profiles[0].reach,
                    innate: weapon.isInnate,
                    descriptionHTML: "",
                    damageDiceBase: damageDie.dice,
                    damageDiceBasePlus: damageDie.bonuses,
                    equipped: ( weapon.equippedPrimary || weapon.equippedSecondary ),
                    equippedAs: "primary",
                    cost: weapon.cost,
                    bookID: weapon.book_id,
                    takenFrom: weapon.getBookPage(),
                    costBuy: weapon.buyCost,
                    minStr: weapon.minimumStrength,
                    profiles: weapon.profiles,
                })
            } else {

                let weaponFoundName = "";
                let weaponWeight = 0;
                let weaponRange = "";
                let weaponDamage = "";
                let weaponROF = 1;
                let weaponShots = 0;
                let weaponAP = 0;
                let weaponNotes = "";
                let weaponCount = 1;
                let weaponReach = 0;

                let weaponBookPage = "";
                let weaponBookID = 0;

                let nameStatSplit = weaponName.split(" - ", 2);
                let statsBit = "";
                let bitCount1 = 0;
                for( let bit of nameStatSplit ) {
                    if( bitCount1 == 0 ) {
                        weaponFoundName = bit.trim();
                    } else {

                    }
                }

                if( statsBit ) {
                    let statSplit = statsBit.split(",");
                    for( let bit of statSplit ) {
                        if( bit.toLowerCase().indexOf("range") > -1 ) {
                            bit = bit.toLowerCase();
                            weaponRange = bit.replace("range", "").trim();
                        }
                        else if( bit.toLowerCase().indexOf("rof") > -1 ) {
                            bit = bit.toLowerCase();
                            weaponROF = +bit.replace("rof", "").trim();
                        }
                        else if( bit.toLowerCase().indexOf("damage") > -1 ) {
                            bit = bit.toLowerCase();
                            weaponDamage = bit.replace("damage", "").trim();
                        }
                        else if( bit.toLowerCase().indexOf("ap") > -1 && bit.length < 6) {
                            bit = bit.toLowerCase();
                            weaponDamage = bit.replace("ap", "").trim();
                        }
                        else if( bit.toLowerCase().indexOf("reach") > -1 ) {
                            bit = bit.toLowerCase();
                            weaponReach = +bit.replace("reach", "").trim();
                        }
                        else {
                            weaponNotes = bit.trim();
                        }
                    }

                }

                let damageDie = ParseDamageString(
                    weaponDamage,
                    "",
                    "",
                    "",
                );

                let weaponMinimumStrength = "";
                let weaponCost = 0;
                let weaponBuyCost = 0;

                rv.weapons.push({
                    id: 0,
                    uuid: "",
                    activeProfile: 0,
                    name: weaponFoundName,
                    weight: weaponWeight,
                    range: weaponRange,
                    damage: weaponDamage,
                    damageWithBrackets: weaponDamage,
                    rof: weaponROF,
                    shots: weaponShots,
                    ap: weaponAP,
                    notes: weaponNotes,
                    thrown: false,
                    descriptionHTML: "",
                    quantity: weaponCount,
                    bookPublisher: "",
                    bookPublished: "",
                    bookName: "",
                    reach: weaponReach,
                    innate: false,
                    takenFrom: weaponBookPage,
                    bookID: weaponBookID,
                    damageDiceBase: damageDie.dice,
                    damageDiceBasePlus: damageDie.bonuses,
                    equipped: true,
                    equippedAs: "primary",
                    cost: weaponCost,
                    costBuy: weaponBuyCost,
                    minStr: weaponMinimumStrength,
                    profiles: [ {
                        name: weaponFoundName,
                        range: weaponRange,
                        damage: weaponDamage,
                        damageWithBrackets: weaponDamage,
                        damage_original: weaponDamage,
                        rof: weaponROF,
                        shots: weaponShots,
                        ap: weaponAP,
                        notes: weaponNotes,
                        thrown_weapon: false,
                        reach: weaponReach,
                        damageDiceBase: damageDie.dice,
                        damageDiceBasePlus: damageDie.bonuses,
                        equipped: false,
                        currentShots: -1,
                        parry_modifier: 0,

                        requires_2_hands: true,
                        heavy_weapon: false,
                        melee_only: false,
                        counts_as_innate: false,
                        additionalDamage: "",
                        is_shield: false,

                        usable_in_melee: false,
                        add_strength_to_damage: false,

                        ap_vs_rigid_armor_only: 0,
                        vtt_only: false,
                        toHitMod: 0,
                        skillName: "",
                        skillValue: "",
                    }]
                })
            }
        }

        return rv;

    }

    exportOptions(): IVehicleObjectVars {
        let rv = super.exportOptions() as IVehicleObjectVars;

        rv.buy_cost = this.buy_cost;
        rv.contains = this.contains;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    importOptions( iVars: IVehicleObjectVars | null ) {
        super.importOptions( iVars );

        if( iVars ) {
            typeof( iVars.buy_cost ) != "undefined" ? this.buy_cost = iVars.buy_cost : null;
            typeof( iVars.contains ) != "undefined" ? this.contains = iVars.contains : null;
        }

    }
    getTotalBuyCost() {
        if( this.contains.length > 0 ) {
            let itemCostSum: number = 0;
            if( this.contains ) {
                for( let item of this.contains ) {
                    itemCostSum += item.cost_buy * item.count_current;
                }
            }

            itemCostSum += this.buy_cost;

            return itemCostSum;
       } else {
           return this.buy_cost;
       }
    }
}

export interface IVehicleObjectVars extends IBaseObjectVars{
    buy_cost: number;
    contains: IContainerItemExport[];
}