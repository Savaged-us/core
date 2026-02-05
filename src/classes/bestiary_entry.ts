import { CONFIGLiveHost } from "../../ConfigGeneral";
import { IChargenData } from "../interfaces/IChargenData";
import { IExportArcaneBackground, IExportStatsOutput } from "../interfaces/IExportStatsOutput";
import { capitalCase, getRankName, normalizeCharacters, replaceAll } from "../utils/CommonFunctions";
import { getDieValueFromLabel } from "../utils/Dice";
import { emboldenBeforeColon } from "../utils/emboldenBeforeColon";
import { getEdgeBookID } from "../utils/getEdgeBookID";
import { getHindranceBookID } from "../utils/getHindranceBookID";
import { getSizeExtraWounds, getSizeName } from "../utils/getSizeName";
import { getSkillBookID } from "../utils/getSkillBookID";
import { isRiftsBookID } from "../utils/isRiftsBookID";
import { makeGenericAttackLine } from "../utils/makeGenericAttackLine";
import { ParseDamageString } from "../utils/ParseDamageString";
import { Edge } from "./player_character/edge";
import { Hindrance } from "./player_character/hindrance";
import { Power } from "./player_character/power";
import { IChargenWeapon, Weapon } from "./player_character/weapon";
import { BaseObject, IBaseObjectExport } from "./_base_object";
import SanitizeHTML from 'sanitize-html';
import HTMLToMD from "../utils/HTMLToMD";

const IMPORT_ABILITY_DOTS: string[] = [
    '',
    "•",
    " ",
    '',
    '*',
];

export interface IBestiaryEntry extends IBaseObjectExport {
    UUID?: string; // legacy
    uuid: string;
    abilities: string | IBestiaryAbility[];
    // active: boolean;
    armor: string;
    attributes: string | IBestiaryAttributes;
    book: number;
    charisma: number;
    climb: number;
    // created_by: number;
    // created_on: Date;
    cyberware: string | string[];
    customName?: string;
    // deleted: boolean;
    // deleted_by: number;
    // deleted_on: Date;
    edges: string | string[];
    flies: number;
    flying_pace: number;
    swimming_pace: number;
    gear: string | string[];
    hindrances: string | string[];
    image: string;
    // name: string;
    // name_plural: string;
    pace: string;
    // page: string;
    parry: string;
    race: string;
    skills: string | IBestiarySkill[];
    tags: string | string[];
    toughness: string;
    treasure: string;
    // updated_by: number;
    wildcard: boolean;
    // version_of: number;
    // id: number;
    // updated_on: Date;
    powers: string[];
    powerPoints: number;
    powerPointName: string;

    heavy_armor: boolean;
    customSaveId?: number;

    // book_id: number;
    // book_name: string;
    // book_short_name: string;
    // book_publisher: string;
    // book_published: string;
    // book_primary: boolean;
    // book_core: boolean;
    // book_buylink: string;

    // created_by_name: string;
    // updated_by_name: string;
    // deleted_by_name: string;
    export_generic_json?: string;
}

interface IBestiaryAttributes {
    Agility: string;
    Smarts: string;
    Spirit: string;
    Strength: string;
    Vigor: string;
}

export interface IBestiaryAbility {
    Name: string;
    Notes: string;
}

export interface IBestiarySkill {
    Name: string;
    Value: string;
}

export class BestiaryEntry extends BaseObject {
    abilities: IBestiaryAbility[] = [];
    armor: string = "";
    attributes: IBestiaryAttributes = {
        Agility: "-",
        Smarts: "-",
        Spirit: "-",
        Strength: "-",
        Vigor: "-",
    };

    imageURL: string = "";
    isSessionEdit: boolean = false;
    saveID: number = 0;
    heavyArmor: boolean = false;
    shareURL: string = "";

    powers: string[] = [];
    powerPoints: number = 0;
    powerPointName: string = "Power Points";

    customSaveId: number = 0;
    charisma: number = 0;
    climb: number = 0;
    customName: string;
    cyberware: string[] = [];
    edges: string[] = [];
    flies: number = 0;
    flying_pace: number = 0;
    swimming_pace: number = 0;
    gear: string[] = [];
    hindrances: string[] = [];
    image: string = "";
    speciesName: string = "";
    speciesNamePlural: string = "";
    pace: string = "";
    parry: string = "";
    race: string = "";
    skills: IBestiarySkill[] = [];
    tags: string[] = [];
    toughness: string = "";
    treasure: string = "";
    wildcard: boolean;
    skillsText: string = "";
    abilitiesText: string = "";

    constructor( importDef: IBestiaryEntry | null = null ) {

        super( importDef, null );
        this.reset();
        if( importDef )
            this.import( importDef );
    }

    reset() {
        super.reset();

        this.wildcard = false;

        this.abilities = [];
        this.armor = "";
        this.attributes = {
            Agility: "-",
            Smarts: "-",
            Spirit: "-",
            Strength: "-",
            Vigor: "-",
        };
        this.heavyArmor = false;
        this.shareURL = "";
        this.customSaveId = 0;
        this.charisma = 0;
        this.climb = 0;
        this.customName;
        this.cyberware = [];
        this.edges = [];
        this.flies = 0;
        this.flying_pace = 0;
        this.swimming_pace = 0;
        this.gear = [];
        this.hindrances = [];
        this.image = "";
        this.speciesName = "";
        this.speciesNamePlural = "";
        this.pace = "";
        this.parry = "";
        this.race = "";
        this.skills = [];
        this.tags = [];
        this.toughness = "";
        this.treasure = "";
        this.wildcard;
        this.skillsText = "";
        this.abilitiesText = "";
    }

    import( importDef: IBestiaryEntry) {
        if( importDef ) {
            super.import( importDef, this._char ? this._char.getAvailableData().books : []  );

            typeof(importDef.uuid) != "undefined" && importDef.uuid ? this.uuid = importDef.uuid : null;
            typeof(importDef.UUID) != "undefined" && importDef.uuid ? this.uuid = importDef.UUID : null;
            typeof(importDef.name) != "undefined" ? this.speciesName = importDef.name : null;
            typeof(importDef.name_plural) != "undefined" ? this.speciesNamePlural = importDef.name_plural : null;
            if( importDef.abilities ) {
                if( typeof(importDef.abilities) == "string") {
                    if( importDef.abilities.trim() != "" ) {
                        try {
                            this.abilities = JSON.parse(importDef.abilities)
                        }
                        catch {

                        }
                    }
                } else {
                    this.abilities = importDef.abilities
                }

            }

            if( importDef.heavy_armor ) {
                this.heavyArmor = importDef.heavy_armor
            }

            // if( importDef.active ) {
            //     this.active = importDef.active
            // }

            if( importDef.powerPoints ) {
                this.powerPoints = importDef.powerPoints;
            }
            if( importDef.powerPointName ) {
                this.powerPointName = importDef.powerPointName;
            }
            if( importDef.powers ) {
                this.powers = importDef.powers;
            }

            if( importDef.powerPoints ) {
                this.powerPoints = importDef.powerPoints;
            }
            if( importDef.armor ) {
                this.armor = importDef.armor
            }
            if( importDef.attributes ) {
                if( typeof(importDef.attributes) == "string") {
                    if( importDef.attributes.trim() != "" ) {
                        try {
                            let temp = JSON.parse(importDef.attributes);
                            if( temp.length > 0 ) {
                                this.attributes = temp[0];
                            } else {
                                this.attributes = temp;
                            }
                        }
                        catch {

                        }
                    }
                } else {
                    this.attributes = <IBestiaryAttributes>importDef.attributes;
                }

            }

            if( importDef.charisma ) {
                this.charisma = +importDef.charisma
            }

            if( importDef.climb ) {
                this.climb = +importDef.climb
            }

            if( importDef.customName ) {
                this.customName = importDef.customName
            }

            if( importDef.cyberware ) {
                if( typeof(importDef.cyberware) == "string") {
                    if( importDef.cyberware.trim() != "" ) {
                        try {
                            this.cyberware = JSON.parse(importDef.cyberware)
                        }
                        catch {

                        }
                    }
                } else {
                    this.cyberware = importDef.cyberware
                }
            }

            if( importDef.hindrances ) {
                if( typeof(importDef.hindrances) == "string") {
                    if( importDef.hindrances.trim() != "" ) {
                        try {
                            this.hindrances = JSON.parse(importDef.hindrances)
                        }
                        catch {

                        }
                    }
                } else {
                    this.hindrances = <string[]>importDef.hindrances;
                }
            }
            if( importDef.edges ) {
                if( typeof(importDef.edges) == "string") {
                    if( importDef.edges.trim() != "" ) {
                        try {
                            this.edges = JSON.parse(importDef.edges)
                        }
                        catch {

                        }
                    }
                } else {
                    this.edges = <string[]>importDef.edges;
                }
            }
            if( importDef.flies ) {
                this.flies = importDef.flies
            }
            if( importDef.flying_pace ) {
                this.flying_pace = importDef.flying_pace
            }
            if( importDef.swimming_pace ) {
                this.swimming_pace = importDef.swimming_pace
            }

            if( importDef.gear ) {
                if( typeof(importDef.gear) == "string") {
                    if( importDef.gear.trim() != "" ) {
                        try{
                            this.gear = JSON.parse(importDef.gear)
                        }
                        catch {

                        }
                    }
                } else {
                    this.gear = <string[]>importDef.gear;
                }
            }
            if( importDef.image ) {
                this.image = importDef.image;
            }

            if( importDef.image_url ) {
                this.image_url = importDef.image_url;
                if( this.image === "" ) {
                    this.image = importDef.image_url;
                }
            }

            // if( importDef.name ) {
            //     this.speciesName = importDef.name
            // }
            // if( importDef.name_plural ) {
            //     this.speciesNamePlural = importDef.name_plural
            // }
            if( importDef.pace ) {
                this.pace = importDef.pace
            }
            // if( importDef.page ) {
            //     this.page = importDef.page
            // }
            if( importDef.parry ) {
                this.parry = importDef.parry
            }
            if( importDef.race ) {
                this.race = importDef.race
            }

            if( importDef.skills ) {
                if( typeof(importDef.skills) == "string") {
                    if( importDef.skills.trim() != "" ) {
                        try {
                            this.skills = JSON.parse(importDef.skills)
                        }
                        catch {

                        }
                    }
                } else {
                    this.skills = <IBestiarySkill[]>importDef.skills;
                }
            }

            if( importDef.tags ) {
                if( typeof(importDef.tags) == "string") {
                    if( importDef.tags.trim() != "" ) {

                        if( importDef.tags.trim()[0] == "{" || importDef.tags.trim()[0] == "[") {
                            // might be a JSON entry
                            try{
                                this.tags = JSON.parse(importDef.tags)
                            }
                            catch {

                            }
                        } else {
                            // might be a separated by comma string
                            this.tags = importDef.tags.split(",");
                        }
                    }
                } else {
                    this.tags = <string[]>importDef.tags;

                }
            }

            // okay if all else fails, make sure that the tag list wasn't imported straight into the first (and only)entry
            if( this.tags.length == 1 && this.tags[0].indexOf(",") > 0) {
                this.tags = this.tags[0].split(",");
            }

            // finally remove all other commas from stray tags
            let filteredTags: string[] = []
            for( let tag of this.tags ) {
                tag = replaceAll(tag, ",", "");
                if( tag.trim() ) {
                    filteredTags.push( tag );
                }
            }
            this.tags = filteredTags;

            if( importDef.toughness ) {
                this.toughness = importDef.toughness
            }
            if( importDef.treasure ) {
                this.treasure = importDef.treasure
            }

            if( importDef.wildcard ) {
                this.wildcard = importDef.wildcard
            }

            if( importDef.customSaveId ) {
                this.customSaveId = importDef.customSaveId;

            }

            this.importAbilitiesString();
            this.importSkillsString();
        }

    }

    importFromPaste( importText: string ) {
        let replace_text = []

        importText = importText.replace("-\n", "")
        importText = importText.replace("- \n", "")
        importText = importText.replace("- \n", "")
        importText = importText.replace("-\t\n", "")

        let items = importText.split("\n");

        let name = "";

        let in_name = true;
        let in_attributes = false;
        let in_skills = false;
        let in_derived = false;
        let in_hindrances = false;
        let in_edges = false;
        let in_gear = false;
        let in_cyberware = false;
        let in_abilities = false;
        let in_description = false;
        let in_race = false;
        let in_treasure = false;

        let in_powers = false;
        let in_power_points = false;

        function disable_other_modes() {
            in_name = false;
            in_attributes = false;
            in_skills = false;
            in_derived = false;
            in_hindrances = false;
            in_edges = false;
            in_gear = false;
            in_cyberware = false;
            in_abilities = false;
            in_description = false;
            in_race = false;
            in_treasure = false;
            in_powers = false;
            in_power_points = false;
        }

        let line_name: string = "";
        let line_attributes: string = "";
        let line_skills: string = "";
        let line_derived: string = "";
        let line_description: string = "";
        let line_race: string = "";

        let line_edges: string = "";
        let line_hindrances: string = "";
        let line_gear: string = "";
        let line_cyberware: string = "";

        let line_abilities: string = "";
        let line_treasure: string = "";

        let line_powers: string = "";
        let line_power_points: string = "";

        function assign_line( line_text: string ) {

            line_text = line_text.replace("—", "-");

            if( in_description ) {
                line_description += line_text + " ";
            }
            if( in_name ) {
                line_name += line_text + " ";
                disable_other_modes();
                in_description = true;
            }

            if( in_treasure ) {
                line_treasure += line_text + " ";
            }
            if( in_attributes ) {
                line_attributes += line_text + " ";
            }
            if( in_skills ) {
                line_skills += line_text + " ";
            }
            if( in_derived ) {
                line_derived += line_text + " ";
            }
            if( in_race ) {
                line_race += line_text + " ";
            }
            if( in_edges ) {
                line_edges += line_text + " ";
            }
            if( in_hindrances ) {
                line_hindrances += line_text + " ";
            }

            if( in_gear ) {
                line_gear += line_text + " ";
            }

            if( in_cyberware ) {
                line_cyberware += line_text + " ";
            }
            if( in_abilities ) {
                line_abilities += line_text + " ";
            }

            if( in_power_points ) {
                line_power_points += line_text + " ";
            }

            if( in_powers ) {
                line_powers += line_text + " ";
            }
        }

        for( let item_index in items ) {
            // Look for name
            let line = items[item_index].trim();

            if(
                line.toLowerCase().startsWith("attributes:")
                    ||
                line.toLowerCase().startsWith("a�ributes")
            ) {

                disable_other_modes();
                in_attributes = true;
            }

            if( line.toLowerCase().startsWith("skills:") ) {
                disable_other_modes();
                in_skills = true;
            }

            if( line.toLowerCase().startsWith("gear:") ) {

                disable_other_modes();
                in_gear = true;
            }
            if( line.toLowerCase().startsWith("race:") ) {

                disable_other_modes();
                in_race = true;
            }
            if( line.toLowerCase().startsWith("treasure:") ) {

                disable_other_modes();
                in_treasure = true;
            }
            if( line.toLowerCase().startsWith("cyberware:") ) {

                disable_other_modes();
                in_cyberware = true;
            }

            if( line.toLowerCase().startsWith("special abilities") || line.toLowerCase().startsWith("abilities") ) {
                disable_other_modes();
                in_abilities = true;
            }

            if( line.toLowerCase().startsWith("hindrances:") ) {

                disable_other_modes();
                in_hindrances = true;
            }

            if( line.toLowerCase().startsWith("edges:") ) {

                disable_other_modes();
                in_edges = true;
            }

            if(
                line.toLowerCase().startsWith("powers:")
            ) {

                disable_other_modes();
                in_powers = true;
                // console.log("in powers", line)
            }

            if( line.toLowerCase().startsWith("power points:") ) {

                disable_other_modes();
                in_power_points = true;
                // console.log( "in power points ", line )
            }

            if(
                line.toLowerCase().startsWith("pace: ")
                ||
                line.toLowerCase().startsWith("charisma: ")
                ||
                line.toLowerCase().startsWith("cha: ")
            ) {

                disable_other_modes();
                in_derived = true;
            }

            assign_line( line )

        }

        line_attributes = line_attributes.replace(/attributes:/ig, '').trim();
        line_attributes = line_attributes.replace(/a�ributes:/ig, '').trim();

        line_powers = line_powers.replace(/powers:/ig, '').trim();
        line_power_points = line_power_points.replace(/power points:/ig, '').trim();

        line_race = line_race.replace(/race:/ig, '').trim();
        line_edges = line_edges.replace(/edges:/ig, '').trim();
        line_gear = line_gear.replace(/gear:/ig, '').trim();
        line_cyberware = line_cyberware.replace(/cyberware:/ig, '').trim();
        line_hindrances = line_hindrances.replace(/hindrances:/ig, '').trim();
        line_abilities = line_abilities.replace(/special abilities:/ig, '').trim();
        line_abilities = line_abilities.replace(/special abilities/ig, '').trim();
        if( line_abilities.trim() == "" ) {
            line_abilities = line_abilities.replace(/abilities/ig, '').trim();
        }
        line_treasure = line_treasure.replace(/treasure:/ig, '').trim();

        let items_attributes: string[] = line_attributes.split(/\,\s?(?![^\(]*\))/);

        let items_derived: string[] = []
        if( line_derived.indexOf(",") > -1 ) {
            items_derived = line_derived.split(",");
        } else if (line_derived.indexOf(";") > -1) {
            items_derived = line_derived.split(";");
        }
        let items_edges: string[] = line_edges.split(/\,\s?(?![^\(]*\))/);
        let items_hindrances: string[] = line_hindrances.split(/\,\s?(?![^\(]*\))/);
        let items_gear: string[] = line_gear.split(/\,\s?(?![^\(]*\))/);
        let items_cyberware: string[] = line_cyberware.split(/\,\s?(?![^\(]*\))/);

        let items_abilities: string[] = []

        for( let abilityDot of IMPORT_ABILITY_DOTS ) {
            if( line_abilities.indexOf( abilityDot ) > -1 ) {
                items_abilities = line_abilities.split(abilityDot);
                break;
            }
        }

        // Abilities
        let insert_abilities: IBestiaryAbility[] = [];

        // console.log("line_power_points", line_power_points)
        // console.log("line_powers", line_powers)
        if( line_power_points ) {
            insert_abilities.push({
                "Name": "Power Points",
                "Notes": line_power_points
            });
        }

        if( line_powers ) {
            insert_abilities.push({
                "Name": "Powers",
                "Notes": line_powers
            });
        }

        for( let item_index in items_abilities ) {
            items_abilities[item_index] = items_abilities[item_index].trim()
            if( items_abilities[item_index] ) {
                let name = items_abilities[item_index].substring(0, items_abilities[item_index].indexOf(":") + 1).replace(":", "").trim();
                let notes = items_abilities[item_index].substring(items_abilities[item_index].indexOf(":") + 1, items_abilities[item_index].length).trim().replace("\n", " ").replace("  ", " ");
                notes = notes.replace("’", "'")
                notes = notes.replace("”", "\"")

                if( name.trim() || notes.trim() ) {
                    insert_abilities.push({
                        "Name": name.trim(),
                        "Notes": notes.trim()
                    });
                }
            }
        }

        this.abilities = insert_abilities;

        // Attribute Assignments
        for( let item_index in items_attributes ) {
            let split = items_attributes[item_index].replace(":", "").split(" ");
            if( split.length == 2 ) {
                split[1] = split[1].replace("—", "-");
                split[1] = split[1].replace("−", "-");

                split[1] = split[1].replace("4(", "4 (");
                split[1] = split[1].replace("6(", "6 (");
                split[1] = split[1].replace("8(", "8 (");
                split[1] = split[1].replace("10(", "10 (");
                split[1] = split[1].replace("12(", "12 (");

                split[1] = split[1].replace(" (a)", " (A)");

                switch(split[0].trim().toLowerCase()) {
                    case "agility": {
                        this.attributes.Agility = split[1];
                        break
                    }
                    case "smarts": {
                        this.attributes.Smarts = split[1];
                        break
                    }
                    case "spirit": {
                        this.attributes.Spirit = split[1];
                        break
                    }
                    case "strength": {
                        this.attributes.Strength = split[1];
                        break
                    }
                    case "vigor": {
                        this.attributes.Vigor = split[1];
                        break
                    }
                }
            } else if( split.length == 3 ) {
                // Ability likely has a (A) or (M)
                split[1] = split[1].replace("—", "-");
                split[1] = split[1].replace("−", "-");

                split[2] = split[2].trim().toUpperCase();

                switch(split[0].trim().toLowerCase()) {
                    case "agility": {
                        this.attributes.Agility = split[1];
                        break
                    }
                    case "smarts": {
                        this.attributes.Smarts = split[1] + " " + split[2];
                        break
                    }
                    case "spirit": {
                        this.attributes.Spirit = split[1];
                        break
                    }
                    case "strength": {
                        this.attributes.Strength = split[1];
                        break
                    }
                    case "vigor": {
                        this.attributes.Vigor = split[1];
                        break
                    }
                }
            }
        }

        // Derived

        for( let item_index in items_derived ) {
            let name: string = items_derived[item_index].trim().substring(0, items_derived[item_index].trim().indexOf(" ") + 1).replace(":","").toLowerCase().trim();
            let value: string = items_derived[item_index].trim().substring(items_derived[item_index].trim().indexOf(" ") + 1, items_derived[item_index].trim().length).toLowerCase().trim();
            value = value.replace("–", "-");
            if( name == "pace") {
                this.pace = value;
            }
            else if( name == "cha" || name == "charisma" ) {
                this.charisma = +value;
            }
            else if( name == "parry") {
                this.parry = value;
            }
            else if( name == "toughness") {

                if( value.indexOf("(") > -1 ) {
                    let tsplit = value.split("(");

                    this.toughness = tsplit[0].trim();
                    this.armor = tsplit[1].replace(")", "").trim()
                } else {

                    this.toughness = value;
                    this.armor = "0";
                }

            }
        }

        // Skill Assignments
        // let skill_text = "";
        // console.log("line_skills", line_skills)
        this.pasteSkillsLine(line_skills)
        // this.skillsText = skill_text;
        // this.importSkillsString();

        line_name = line_name.trim()
        if( line_name.length > 0 ) {
            line_name = line_name.charAt(0).toUpperCase() + line_name.slice(1)
        }

        line_name = capitalCase( line_name.toLowerCase() );

        this.description = line_description.replace("\n", " ").replace("  ", " ").trim()
        this.speciesName = line_name.trim();

        this.race = line_race.trim();
        this.speciesNamePlural = line_name.trim() + "s" ;
        this.gear = items_gear;
        this.hindrances = items_hindrances;
        this.edges = items_edges;
        this.cyberware = items_cyberware;

        this.treasure = line_treasure;

        this.importAbilitiesString();
        this.importSkillsString();
    }

    export(): IBestiaryEntry {
        let returnObj = super.export() as IBestiaryEntry

        returnObj.uuid = this.uuid;
        returnObj.abilities = this.abilities;
        returnObj.armor = this.armor;
        returnObj.attributes = this.attributes;
        returnObj.customSaveId = this.customSaveId;
        returnObj.charisma = this.charisma;
        returnObj.climb = this.climb;
        returnObj.customName = this.customName;
        returnObj.heavy_armor = this.heavyArmor;
        returnObj.cyberware = this.cyberware;
        returnObj.edges = this.edges;
        returnObj.flies = this.flies;
        returnObj.flying_pace = this.flying_pace;
        returnObj.swimming_pace = this.swimming_pace;
        returnObj.gear = this.gear;
        returnObj.hindrances = this.hindrances;
        returnObj.image = this.image;
        returnObj.image_url = this.image_url;
        returnObj.name = this.speciesName;
        returnObj.name_plural = this.speciesNamePlural;
        returnObj.pace = this.pace;
        returnObj.parry = this.parry;
        returnObj.race = this.race;
        returnObj.skills = this.skills;
        returnObj.tags = this.tags;
        returnObj.toughness = this.toughness;
        returnObj.treasure = this.treasure;
        returnObj.wildcard = this.wildcard;

        return returnObj
    }

    getToughness(): string {
        if( this.armor && this.armor != "0" ) {
            return this.toughness.toString() + " (" + this.armor.toString() + ")";
        } else {
            return this.toughness.toString();
        }
    }

    getName(): string {
        if( this.customName ) {
            if( this.speciesName ) {
                return this.customName + " (" + this.speciesName + ")";
            } else {
                return this.customName;
            }

        } else {
            return this.speciesName;
        }
    }

    update() {
        this._setAbilitiesString();
        this._setSkillsString();

        let hinds: string[] = [];
        for( let hind of this.hindrances) {
            if( hind.trim() ) {
                hinds.push(hind.trim());
            }
        }
        this.hindrances = hinds;

        let tags: string[] = [];
        for( let tag of this.tags) {
            if( tag.trim() ) {
                tags.push(tag.trim());
            }
        }
        this.tags = tags;

        let edges: string[] = [];
        for( let edge of this.edges) {
            if( edge.trim() ) {
                edges.push(edge.trim());
            }
        }
        this.edges = edges;

        let gear: string[] = [];
        for( let item of this.gear) {
            if( item.trim() ) {
                gear.push(item.trim());
            }
        }
        this.gear = gear;
    }

    importAbilitiesString() {
        this.abilitiesText = "";

        for( let ability of this.abilities ) {
            this.abilitiesText += ability.Name.trim() + ": " +  ability.Notes.trim() + "\n";
        }
    }

    importSkillsString() {
        this.skillsText = "";

        for( let skill of this.skills ) {
            this.skillsText += skill.Name.trim() + ": " + skill.Value.trim() + "\n";
        }
    }

    _setAbilitiesString() {
        let lines = this.abilitiesText.split("\n");

        let newValue: IBestiaryAbility[] = [];
        for( let line of lines) {

            if( line.trim() && line.indexOf(":") > -1) {

                let colon = line.indexOf(":");
                let name = line.slice(0, colon);
                let notes = line.slice(colon + 1);

                newValue.push({
                    Name: name,
                    Notes: notes,
                });
            }
        }

        this.abilities = newValue;
        // this._makeAbilitiesText( newValue );
    }

    _setSkillsString() {
        let lines = this.skillsText.split("\n");
        let newValue: IBestiarySkill[] = [];

        for( let line of lines) {

            if( line && line.trim() && line.indexOf(":") > -1) {
                let colon = line.indexOf(":");
                let name = line.slice(0, colon);
                let notes = line.slice(colon + 1);

                newValue.push({
                    Name: name,
                    Value: notes,
                });
            }
        }

        this.skills = newValue;
        // this._makeSkillsText( newValue );
    }

    getURL(basePath: string | null = null): string {
        if( !basePath )
            basePath = "/bestiary/"
        if( this.getBookShortName() != "custom" ) {
            return basePath + this.getBookShortName().toLowerCase().replace("\"", "").replace("\"", "") + "/" + this.urlSafeName();
        } else {
            if( this.shareURL.trim() ) {
                return "/s/" + this.shareURL.trim();
            } else {
                return "";
            }

        }
    }

    urlSafeName(): string {
        return this.getName().toLowerCase().trim().replace(",", "").replace(",", "").replace("\"", "").replace("/", "-").replace(" ", "-")
    }

    getSize(): number {
        let size = 0;

        for( let ability of this.getAbilities() ) {

            let abName = ability.name.toLowerCase().trim();

            if( abName.indexOf("(") > -1 ) {
                let split = abName.split("(");
                abName = split[0].trim();
            }
            if( abName.startsWith("size ")) {
                // console.log("abName", abName)
                size = +abName.toLowerCase().trim().replace("size ", "");
            }

            // console.log("abName", abName)
            if( ability.name.toLowerCase().trim().startsWith("ancestry") ) {
                // console.log("ability.name.toLowerCase().trim()", ability.name.toLowerCase().trim(), ability.notes)
                let split = ability.notes.split(",");
                for( let subItem of split ) {
                    // console.log("subItem", subItem)
                    if( subItem.toLowerCase().trim().startsWith("size ")) {

                        size = +subItem.toLowerCase().trim().replace("size ", "");
                    }
                }
            }
        }

        // console.log("size", size);
        return size;
    }

    public exportGenericJSON(
        chargenData: IChargenData,
        appVersion: string,
        createdOn: Date,
        updatedOn: Date,
        fullPathHost: boolean,
    ): IExportStatsOutput {

        let rv: IExportStatsOutput = {
            saveID: 0,
            id: this.id,
            wealthDieActive: false,
            usesRippersReason: false,
            ripperReason: 0,
            usesRippersStatus: false,
            ripperStatus: 0,
            wealthDieValue: "",
            wealthDieCalculated: "",
            wealthDieBonus: 0,
            raceGenderAndProfession: "",
            alliedExtras: [],
            usesSanity: false,
            scholarship: 0,
            usesETUScholarship: false,
            noPowerPoints: false,
            unarmoredHero: false,
            hideHumanRaceDisplay: false,

            toughnessModifiers: [],

            usesStrain: false,
            strainCurrent: 0,
            strainMax: 0,

            playerName: "",
            naturalArmor: [],
            naturalIsHeavy: false,

            allSkills: [],                  // unused for bestiary
            riftsDisclaimer: false,         // TODO disclaim usage of Rifts book material
            playerCharacter: false,
            createdDate: createdOn,
            updatedDate: updatedOn,
            appVersion: appVersion,
            abilities: [],
            abs: [],
            advances: [],
            advancesCount: 0,
            age: "",
            settingImage: "",
            armor: [],
            armorValue: +this.armor,
            attributes: [],
            background: "",
            bennies: 0,
            benniesMax: 0,
            bookName: this.getBookName(),
            bookID: this.book_id,
            bookPrimary: this.book_obj.primary,
            bookCore: this.book_obj.core,
            bookPublished: this.book_obj.published,
            bookPublisher: this.book_obj.publisher,
            charisma: this.charisma,
            cyberware: [],
            description: normalizeCharacters(this.description),
            edges: [],
            fatigue: 0,
            fatigueMax: 2,
            gear: [],
            gender: "",
            heavyArmor: this.heavyArmor,
            hindrances: [],
            iconicFramework: "",
            image: "", // this.image,
            imageToken: "",
            journal: [],
            languages: [],
            load: 0,
            loadLimit: 0,
            loadLimitBase: 0,
            loadLimitModifier: 0,
            name: this.getName(),
            paceBase: 6,
            paceMod: +this.pace - 6,
            paceTotal: +this.pace,
            parryBase: +this.parry,
            parryMod: 0, // calculate later in skills
            parryShield: 0, // calculate later in skills
            parryTotal: +this.parry,
            parryHR: this.parry.toString(),
            professionOrTitle: "",
            race: this.speciesName,
            rank: 0,
            rankName: "Bestiary",
            runningDie: "d6",
            sanity: 0, // unused
            savagedUsShareURL: CONFIGLiveHost + this.getURL(),
            shields: [],
            size: this.getSize(),
            sizeLabel: this.getSize() + " (" + getSizeName(this.getSize()) + ")",
            skills: [],
            swade: false,
            toughnessBase: getDieValueFromLabel( this.attributes.Vigor) / 2 + 2,
            toughnessMod: +this.toughness - +this.armor - (getDieValueFromLabel( this.attributes.Vigor) / 2 + 2),
            toughnessTotal: +this.toughness,
            toughnessTotalNoArmor: +this.toughness - +this.armor,
            toughnessAsRead: this.getToughness(),
            toughnessAsReadNoHeavy: this.getToughness(),
            toughnessHeavyLabel: this.heavyArmor ? " Heavy" : "",
            usesCharisma: true,
            usesXP: false,
            uuid: this.uuid,
            vehicles: [],
            wealth: 0,
            wealthFormatted: "0",
            weapons: [],
            otherAttacks: [],
            wildcard: this.wildcard ? true : false,
            wounds: 0,
            woundsBase: (this.wildcard ? 3 : 0),
            woundsMax: (this.wildcard ? 3 : 0) + getSizeExtraWounds( this.getSize() ),
            woundsOtherMod: 0,
            woundsSizeMod: getSizeExtraWounds(this.getSize()),
            xp: 0,
        };

        if( this.image ) {
            rv.image = "https://savaged.us" + this.image.replace("https://savaged.us", "");
        }
        if( this.image_url ) {
            rv.image = "https://savaged.us" + this.image_url.replace("https://savaged.us", "");
        }
        if( CONFIGLiveHost == rv.savagedUsShareURL ) {
            rv.savagedUsShareURL = "";
        }

        let abType = "";
        let bennies = 2;    // starting wildcard bennies, won't affect extras

        for( let edge of this.edges ) {
            let description = "";
            let id = 0;
            let htmlDescription = "";
            for( let edgeData of chargenData.edges ) {
                let fixedName = edge.toLowerCase().trim()
                if( fixedName.indexOf("(improved)") > -1 ) {
                    fixedName.replace("(improved)", "").trim();
                    fixedName = "improved " + fixedName;
                }
                if( edgeData.book_id == this.book_id ) {

                    if( edgeData.name.toLowerCase().trim() ==fixedName ) {
                        description = edgeData.summary;
                        let edgeObj = new Edge( edgeData, null );
                        id = edgeObj.id;
                        htmlDescription = edgeObj.getDescriptionHTML();
                    }
                }
            }

            if( edge.toLowerCase().startsWith("arcane background") ) {
                abType = edge.toLowerCase().replace("arcane background", "");
                abType = abType.toLowerCase().replace(")", "");
                abType = abType.toLowerCase().replace("(", "").trim();
            }

            if( edge.toLowerCase().startsWith("edge") ) {
                bennies++;
            }
            if( edge.toLowerCase().startsWith("great edge") ) {
                bennies++;
            }

            if( edge.trim() ) {
                rv.edges.push({
                    id: id,
                    name: edge,
                    customDescription: "",
                    description: description,
                    note: "",
                    takenFrom: "",
                    bookID: getEdgeBookID( edge, chargenData, this.book_id),
                    isHidden: false,
                    descriptionHTML: htmlDescription,
                })
            }
        }

        for( let hind of this.hindrances ) {
            let description = "";
            let htmlDescription = "";

            for( let hindData of chargenData.hindrances) {
                if( hindData.name.toLowerCase().trim() == hind.toLowerCase().trim() ) {
                    description = hindData.summary;
                    let hindObj = new Hindrance( hindData, null );
                    htmlDescription = hindObj.getDescriptionHTML();
                }
            }

            if( hind.trim() ) {
                rv.hindrances.push({
                    id: 0,
                    name: hind,
                    description: description,
                    customDescription: "",
                    note: "",
                    major: false,
                    takenFrom: "",
                    bookID: getHindranceBookID( hind, chargenData, this.book_id),
                    isHidden: false,
                    descriptionHTML: htmlDescription,
                })
            }
        }

        if( rv.wildcard ) {
            if( this.book_obj && this.book_obj.name.toLowerCase().indexOf("pathfinder") > -1 )
                bennies++; // pathfinder WC critters get another benny

            rv.bennies = bennies;
            rv.benniesMax = bennies;
        }

        // Agility
        let agilityDieValue = getDieValueFromLabel( this.attributes.Agility);
        let agilityDieMod = 0;
        if( agilityDieValue > 12 ) {
            agilityDieMod = agilityDieValue - 12;
            agilityDieValue = 12;
        }
        rv.attributes.push({
            name: "agility",
            label: "Agility",
            value: this.attributes.Agility,
            dieValue: agilityDieValue,
            mod: agilityDieMod,
        })
        // Smarts
        let smartsDieValue = getDieValueFromLabel( this.attributes.Smarts);
        let smartsDieMod = 0;
        if( smartsDieValue > 12 ) {
            smartsDieMod = smartsDieValue - 12;
            smartsDieValue = 12;
        }
        rv.attributes.push({
            name: "smarts",
            label: "Smarts",
            value: this.attributes.Smarts,
            dieValue: smartsDieValue,
            mod: smartsDieMod,
        })
        // Spirit
        let spiritDieValue = getDieValueFromLabel( this.attributes.Spirit);
        let spiritDieMod = 0;
        if( spiritDieValue > 12 ) {
            spiritDieMod = spiritDieValue - 12;
            spiritDieValue = 12;
        }
        rv.attributes.push({
            name: "spirit",
            label: "Spirit",
            value: this.attributes.Spirit,
            dieValue: spiritDieValue,
            mod: spiritDieMod,
        })
        // Strength
        let strengthDieValue = getDieValueFromLabel( this.attributes.Strength);
        let strengthDieMod = 0;
        if( strengthDieValue > 12 ) {
            strengthDieMod = strengthDieValue - 12;
            strengthDieValue = 12;
        }
        rv.attributes.push({
            name: "strength",
            label: "Strength",
            value: this.attributes.Strength,
            dieValue: strengthDieValue,
            mod: strengthDieMod,
        })
        // Vigor
        let vigorDieValue = getDieValueFromLabel( this.attributes.Vigor);
        let vigorDieMod = 0;
        if( vigorDieValue > 12 ) {
            vigorDieMod = vigorDieValue - 12;
            vigorDieValue = 12;
        }
        rv.attributes.push({
            name: "vigor",
            label: "Vigor",
            value: this.attributes.Vigor,
            dieValue: vigorDieValue,
            mod: vigorDieMod,
        })

        for( let skill of this.skills ) {
            let skillDie = skill.Value.replace(".", "");
            let skillDieMod = 0;
            if( skillDie && skillDie.indexOf("+") > -1 ) {
                let skillDieSplit = skillDie.split("+");
                skillDie = skillDieSplit[0];
                skillDieMod = +skillDieSplit[1];
            }

            if( skillDie && skillDie.indexOf("-") > -1 ) {
                let skillDieSplit = skillDie.split("-");
                skillDie = skillDieSplit[0];
                skillDieMod = +skillDieSplit[1] * -1;
            }

            let skillDieValue = getDieValueFromLabel(skillDie);

            if( skillDieValue > 12 ) {
                skillDieMod += skillDieValue - 12;
                skillDieValue = 12;
            }

            rv.skills.push({
                name: skill.Name,
                value: skillDie.trim(),
                dieValue: skillDieValue,
                attribute: "",
                mod: skillDieMod,
                isCore: false,
                bookID: getSkillBookID( skill.Name, chargenData, this.book_id),
            })

        }

        for( let weapon of this.getAttacks(chargenData) ) {
            let damageDie = ParseDamageString( weapon.damage, this.attributes.Strength, this.attributes.Smarts, this.attributes.Spirit );

            rv.weapons.push({
                id: weapon.id,
                uuid: "",
                activeProfile: 0,
                name: weapon.name,
                notes: weapon.notes,
                ap: weapon.ap,
                rof: weapon.rof,
                weight: weapon.weight,
                shots: weapon.shots,
                equippedAs: "primary",
                damage: weapon.damage,
                damageWithBrackets: weapon.damage,
                range: weapon.range,
                thrown: weapon.thrown,
                quantity: 1,
                descriptionHTML: "",
                reach: weapon.reach,
                innate: weapon.innate,
                takenFrom: "",
                bookID: 0,
                damageDiceBase: damageDie.dice,
                damageDiceBasePlus: damageDie.bonuses,
                equipped: true,
                cost: 0,
                costBuy: 0,
                bookPublished: "",
                bookPublisher: "",
                minStr: "",
                profiles: [ {
                    name: weapon.name,
                    range: weapon.range,
                    damage: weapon.damage,
                    damageWithBrackets: weapon.damage,
                    damage_original: weapon.damage,
                    rof: weapon.rof,
                    shots: weapon.shots,
                    ap: weapon.ap,
                    notes: weapon.notes,
                    thrown_weapon: false,
                    reach: weapon.reach,
                    damageDiceBase: damageDie.dice,
                    damageDiceBasePlus: damageDie.bonuses,
                    equipped: true,
                    currentShots: weapon.shots,

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
                    skillValue: "",
                    skillName: "",
                }]
            })
        }

        for( let armor of this.getArmor(chargenData) ) {
            rv.armor.push({
                id: 0,
                uuid: "",
                armor: armor.armor ? +armor.armor : 0,
                cost: 0,
                costBuy: 0,
                isShield: false,
                coversArms: armor.arms,
                coversFace: false,
                coversHead: armor.head,
                coversLegs: armor.legs,
                coversTorso: armor.torso,
                takenFrom: "",
                bookID: 0,
                equipped: true,
                minStr: armor.name,
                bookPublished: "",
                bookPublisher: "",
                descriptionHTML: "",
                name: armor.name,
                notes: armor.name,
                quantity: 1,
                weight: armor.weight,
                equippedStrength: this.attributes.Strength,
                equippedToughness: this.getToughness(),
                heavyArmor: false,
            })
        }

        for( let shield of this.getShields(chargenData) ) {
            rv.shields.push({
                id: 0,
                uuid: "",
                cost: 0,
                costBuy: 0,
                cover: 0,
                equipped: true,
                hardness: 0,
                minStr: "",
                bookPublished: "",
                bookPublisher: "",
                descriptionHTML: "",
                isShield: true,
                name: shield.name,
                notes: "",
                parry: shield.parry,
                quantity: 0,
                takenFrom: "",
                bookID: 0,
                weight: shield.weight,
            })
        }

        let abPowers: string[] = [];
        let abPP = 0;

        for( let ability of this.getAbilities() ) {
            // console.log("ability.name.trim()", ability.name.trim())
            rv.abilities.push({
                name: ability.name.trim(),
                note: ability.notes.trim(),
                positive: true,
                description: ability.notes.trim(),
                from: "",
                takenFrom: this.getBookPage(),
                bookID: this.book_id,
            });

            if( ability.name.toLowerCase() == "powers" ) {
                abPowers = ability.notes.trim().split(",");
            }

            if(
                ability.name.trim().toLowerCase().startsWith("power points")
                    ||
                ability.name.trim().toLowerCase().startsWith("i.s.p")
                    ||
                ability.name.trim().toLowerCase().startsWith("p.p.e")
                    ||
                ability.name.trim().toLowerCase().startsWith("isp")
                    ||
                ability.name.trim().toLowerCase().startsWith("ppe")
            ) {
                abPP = +ability.notes.trim();
            }

            if( ability.name.trim().toLowerCase().startsWith("ancestry (")) {
                let split = ability.notes.split(",");
                for( let sub of split ) {
                    sub = sub.replace("are ", "").trim();
                    if( sub[sub.length - 1] == ".") {
                        sub = sub.substring(0, sub.length - 1);
                    }
                    rv.abilities.push({
                        name: sub,
                        note: "Listed as line item from Ancestry Above",
                        positive: true,
                        description: "Listed as line item from Ancestry Above",
                        from: "Ancestry",
                        takenFrom: this.getBookPage(),
                        bookID: this.book_id,
                    });
                }

            }
        }

        if( abPowers.length > 0 && abPP > 0 ) {
            // let's make an AB! :)
            let arcaneSkill = "";
            let abName = "Arcane Background";
            switch( abType ) {
                case "psionics":
                    abName = "Psionics";
                    arcaneSkill = "Psionics";
                    break;
                case "gifted":
                    abName = "Gifted";
                    arcaneSkill = "Focus";
                    break;
                case "magic":
                    abName = "Magic";
                    arcaneSkill = "Spellcasting";
                    break;
                case "miracles":
                    abName = "Miracles";
                    arcaneSkill = "Faith";
                    break;
            }

            let ab: IExportArcaneBackground = {
                id: 0,
                uuid: "",
                hasPowerPointPool: true,
                hasMegaPowerOptions: false,
                arcaneSkill: arcaneSkill,
                name: abName,
                powerPointsCurrent: abPP,
                powerPointsMax: abPP,
                takenFrom: "",
                bookID: 0,
                powerPointsName: "Power Points",
                powers: [],
                powersTotal: 0,
            }
            for( let powerName of abPowers ) {
                let foundPower = false;
                for( let powerDef of chargenData.powers ) {
                    if(
                        powerDef.name.toLowerCase().trim() == powerName.toLowerCase().trim()
                    ) {

                        let damage = "";
                        let description = "";
                        let duration = "";
                        let name = "";
                        let range = "";
                        let power_points = "";
                        let summary = "";
                        if( powerDef.damage ) {
                            damage = powerDef.damage;
                        }
                        if( typeof(powerDef.description) == "string" ) {
                            description = powerDef.description;
                        } else {
                            description = powerDef.description.join();
                        }
                        if( powerDef.duration ) {
                            duration = powerDef.duration;
                        }
                        if( powerDef.name ) {
                            name = powerDef.name;
                        }
                        if( powerDef.range ) {
                            range = powerDef.range;
                        }
                        if( powerDef.power_points ) {
                            power_points = powerDef.power_points;
                        }
                        if( powerDef.summary ) {
                            summary = powerDef.summary;
                        }

                        let rank = "n/a";
                        if( powerDef.rank ) {
                            rank = getRankName(powerDef.rank);
                        }

                        let powerObj = new Power( powerDef, null, null);

                        if(!foundPower) {
                            ab.powers.push( {
                                id: 0,
                                uuid: "",
                                damage: damage,
                                damageWithBrackets: damage,
                                description: description.trim(),
                                duration: duration,
                                innate: false,
                                name: name,
                                originalName: name,
                                customDescription: "",
                                takenFrom: "",
                                bookID: 0,
                                powerPoints: power_points,
                                range: range,
                                summary: summary,
                                bookPowerName: name,
                                aspectOnlyName: name,
                                rank: rank,
                                customName: "",
                                trappings: "",
                                skillModifier: 0,
                                arcaneSkillName: "",
                                arcaneSkillRoll: "",
                                powerModifiers: [],
                                additionalTargets: [],
                                megaPowerOptions: [],
                                descriptionHTML: powerObj.getDescriptionHTML(),
                            })
                        }

                        foundPower = true;
                    }
                }

                if(!foundPower) {
                    // push blank power data for them to fill in.
                    ab.powers.push( {
                        id: 0,
                        uuid: "",
                        damage: "",
                        damageWithBrackets: "",
                        originalName: powerName,
                        customDescription: "",
                        description: "",
                        duration: "",
                        innate: false,
                        name: powerName,
                        takenFrom: "",
                        bookID: 0,
                        powerPoints: "",
                        range: "",
                        summary: "",
                        bookPowerName: "",
                        rank: "",
                        customName: "",
                        aspectOnlyName: "",
                        trappings: "",
                        skillModifier: 0,
                        arcaneSkillName: "",
                        arcaneSkillRoll: "",
                        powerModifiers: [],
                        additionalTargets: [],
                        megaPowerOptions: [],
                        descriptionHTML: "",
                    })
                }

            }
            rv.abs.push( ab );
        }

        // for( let item of this.armor ) {
        //     rv.armor.push({
        //         name: item,
        //         weight: 0,
        //         armor: 0,
        //         coversFace: true,
        //         coversHead: true,
        //         coversTorso: true,
        //         coversLegs: true,
        //         coversArms: true,
        //         quantity: 1,
        //     })
        // }

        for( let item of this.gear ) {
            if( item ) {
                if( !this._itemIsWeapon(item) && !this._itemIsWeaponLegacy( item )) {

                    rv.gear.push({
                        id: 0,
                        uuid: "",
                        name: item,
                        weight: 0,
                        quantity: 1,
                        bookPublished: "",
                        bookPublisher: "",
                        contains: {
                            gear: [],
                            weapons: [],
                            armor: [],
                            shields: [],
                        },
                        notes: "",
                        equipped: true,
                        cost: 0,
                        descriptionHTML: "",
                        summary: "",
                        takenFrom: "",
                        bookID: 0,
                        container: false,
                        costBuy: 0,
                    })

                }
            }
        }

        return rv;
    }

    public pasteSkillsLine( line_skills: string ) {
        line_skills = line_skills.replace(/skills:/ig, '').trim();
        line_skills = replaceAll(line_skills, "\n", " ");
        let items_skills: string[] = line_skills.split(/\,\s?(?![^\(]*\))/);
        this.skills = [];

        for( let item of items_skills ) {
            let skill_name = item.substring(0, item.lastIndexOf(" ") + 1);
            let skill_value = item.substring(item.lastIndexOf(" ") + 1, item.length);

            if( skill_name && skill_value ) {
                // skill_text += skill_name + ": " + skill_value + "\n";
                this.skills.push({
                    Name: skill_name.trim(),
                    Value: skill_value.trim(),
                })
            }

        }
        this.importSkillsString();
    }

    private _itemIsWeapon(item: string): boolean {
        if(
            item.indexOf("(")
                &&
            (
                item.toLowerCase().indexOf("damage ") > 0
                    ||
                item.toLowerCase().indexOf("str+") > 0
            )
        ) {
                return true;
        }

        return false;
    }

    private _itemIsWeaponLegacy(item: string): boolean {
        if(
            item.indexOf("(") > 0
                &&
            (
                item.toLowerCase().indexOf("d4") > 0
                    ||
                item.toLowerCase().indexOf("d6") > 0
                    ||
                item.toLowerCase().indexOf("d8") > 0
                    ||
                item.toLowerCase().indexOf("d10") > 0
                    ||
                item.toLowerCase().indexOf("d12") > 0
            )
        ) {
                return true;
        }

        return false;
    }

    public getAttacksLists( chargenData: IChargenData | null | undefined  ): string[] {
        let rv: string[] = [];

        if( chargenData ) {
            // console.log("getAttacksLists", "called")
            for( let attack of this.getAttacks( chargenData )) {
                rv.push( makeGenericAttackLine( attack) )
            }
        }

        return rv;
    }

    public flagAttacks( chargenData: IChargenData | null | undefined  ): boolean {

        if( chargenData ) {
            for( let attack of this.getAttacks( chargenData )) {
                if(
                    attack.damage.toLowerCase().indexOf("str") == -1
                    &&
                    attack.damage.toLowerCase().indexOf("d4") == -1
                    &&
                    attack.damage.toLowerCase().indexOf("d6") == -1
                    &&
                    attack.damage.toLowerCase().indexOf("d8") == -1
                    &&
                    attack.damage.toLowerCase().indexOf("d10") == -1
                    &&
                    attack.damage.toLowerCase().indexOf("d12") == -1

                ) {
                    return true
                }
            }
        }
        return false;
    }

    public getAttacks( chargenData: IChargenData | null | undefined  ): IBasicAttackInfo[] {
        let rv: IBasicAttackInfo[] = [];

        if( chargenData ) {
            for( let ability of this.abilities ) {
                if(
                    ability.Notes.trim()
                    &&
                    (
                        ability.Notes.trim().toLowerCase().indexOf("str+") > -1
                            ||
                        ability.Notes.trim().toLowerCase().indexOf("d4+") == 0
                            ||
                        ability.Notes.trim().toLowerCase().indexOf("d6+") == 0
                            ||
                        ability.Notes.trim().toLowerCase().indexOf("d8+") == 0
                            ||
                        ability.Notes.trim().toLowerCase().indexOf("d10+") == 0
                            ||
                        ability.Notes.trim().toLowerCase().indexOf("d12+") == 0

                        || ability.Notes.trim().toLowerCase().indexOf("2d6") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("3d6") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("4d6") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("5d6") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("6d6") > -1

                        || ability.Notes.trim().toLowerCase().indexOf("2d8") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("3d8") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("4d8") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("5d8") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("6d8") > -1

                        || ability.Notes.trim().toLowerCase().indexOf("2d10") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("3d10") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("4d10") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("5d10") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("6d10") > -1

                        || ability.Notes.trim().toLowerCase().indexOf("2d12") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("3d12") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("4d12") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("5d12") > -1
                        || ability.Notes.trim().toLowerCase().indexOf("6d12") > -1

                    )
                ) {
                    let dataSplit = ability.Notes.trim().split(".");
                    let notes = "";
                    if( dataSplit.length > 1 )
                        notes = dataSplit[1];

                    let damage = dataSplit[0].trim().toLowerCase();

                    let notesAppend = "";
                    if( damage.indexOf("m.d.c.") > 0 ) {
                        notesAppend = "M.D.C.";
                        damage = damage.replace("m.d.c.", "").trim();
                    }
                    if( damage.indexOf("mdc") > 0 ) {
                        notesAppend = "M.D.C.";
                        damage = damage.replace("mdc", "").trim();
                    }
                    if( damage.indexOf("mega damage") > 0 ) {
                        notesAppend = "M.D.C.";
                        damage = damage.replace("mega damage", "").trim();
                    }
                    if( damage.indexOf("mega") > 0 ) {
                        notesAppend = "M.D.C.";
                        damage = damage.replace("mega", "").trim();
                    }
                    if( damage.indexOf("heavy") > 0 ) {
                        notesAppend = "Heavy";
                        damage = damage.replace("heavy", "").trim();
                    }

                    // console.log("innate damage", damage);

                    let damageSplit = damage.split(" ");

                    damage = damageSplit[0];
                    let ap = 0;
                    let reach = 0;
                    damage = replaceAll(damage, ",", "")

                    let range = "Melee";

                    for( let dc = 1; dc < damageSplit.length; dc++) {
                        if( damageSplit[dc] == "ap") {
                            ap = +damageSplit[dc +1];
                        } else {
                            if( damageSplit[dc].indexOf("ap")  == 0) {
                                ap = +replaceAll( damageSplit[dc], "ap", "")
                            }
                        }

                        if( damageSplit[dc] == "reach") {
                            reach = +damageSplit[dc +1];
                        } else {
                            if( damageSplit[dc].indexOf("reach")  == 0) {
                                reach = +replaceAll( damageSplit[dc], "reach", "")
                            }
                        }

                        if( damageSplit[dc] == "range") {
                            range = damageSplit[dc +1];
                        }

                        if( damageSplit[dc] == "range:") {
                            range = damageSplit[dc +1];
                        }
                    }

                    rv.push({
                        id: 0,
                        name: ability.Name,
                        range: range,
                        damage: damage,
                        weight: 0,
                        notes: notes,
                        thrown: false,
                        rof: 0,
                        shots: 0,
                        ap: ap,
                        innate: true,
                        reach: reach,
                    })
                }
            }

            for( let item of this.gear ) {

                if( item && this._itemIsWeapon(item)) {
                    let split = item.split("(", 2);
                    let name = split[0].trim();
                    let damage = "";
                    let ap = 0;
                    let rof = 0;
                    let shots = 0;
                    let range = "Melee";
                    let stats_split: string[] = [];
                    if( split.length > 1 )
                        stats_split = split[1].split(",");
                    let notes = "";
                    let reach = 0;

                    let weaponStats = this.getWeaponStats( name, chargenData )

                    if( weaponStats ) {
                        // console.log("WEAPON ASSIGN AND MAKE WEAPON", weaponStats)
                        let weaponObj = new Weapon( weaponStats, null );
                        rv.push({
                            id: weaponObj.id,
                            name: weaponObj.getName(),
                            range: weaponObj.getRange(),
                            damage: weaponObj.getDamage(),
                            weight: weaponObj.getTotalWeight(),
                            notes: weaponObj.getNotes(),
                            thrown: weaponObj.getThrownWeapon(),
                            rof: weaponObj.getROF(),
                            shots: weaponObj.getShots(),
                            ap: weaponObj.getAP(),
                            innate: false,
                            reach: weaponObj.getReach(),
                        })
                    } else {
                        for( let data of stats_split ) {
                            data = data.toLowerCase().trim();
                            data = replaceAll(data, ")", "");

                            if( data.indexOf("damage") > -1) {
                                damage = data.replace("damage", "").trim();
                            } else if( data.indexOf("str+") > -1) {
                                damage = data.trim();
                            } else if( data.indexOf("range") > -1) {
                                range = data.replace("range", "").trim();
                            }  else if( (data.match(/\//g) || []).length == 2 ) {
                                range = data.trim();
                            } else if( data.indexOf("cone") > -1) {
                                range = "Cone";
                            } else if( data.indexOf("rof") > -1) {
                                rof = +data.replace("rof", "").trim();
                            } else if( data.indexOf("shots") > -1) {
                                shots = +data.replace("shots", "").trim();
                            }  else if( data.indexOf("ap") > -1) {
                                ap = +data.replace("ap", "").trim();
                            }  else if( data.indexOf("reach") > -1) {
                                reach = +data.replace("reach", "").trim();
                            }else {
                                notes = data.trim() + ", "
                            }
                        }

                        damage = damage.toLowerCase();

                        let notesAppend = "";
                        if( damage.indexOf("m.d.c.") > 0 ) {
                            notesAppend = "M.D.C.";
                            damage = damage.replace("m.d.c.", "").trim();
                        }
                        if( damage.indexOf("mdc") > 0 ) {
                            notesAppend = "M.D.C.";
                            damage = damage.replace("mdc", "").trim();
                        }
                        if( damage.indexOf("mega damage") > 0 ) {
                            notesAppend = "M.D.C.";
                            damage = damage.replace("mega damage", "").trim();
                        }
                        if( damage.indexOf("mega") > 0 ) {
                            notesAppend = "M.D.C.";
                            damage = damage.replace("mega", "").trim();
                        }
                        if( damage.indexOf("heavy") > 0 ) {
                            notesAppend = "Heavy";
                            damage = damage.replace("heavy", "").trim();
                        }

                        // console.log("damage 1", damage);

                        notes = replaceAll(notes, "\n", " ");
                        notes = replaceAll(notes, "  ", " ");
                        notes = replaceAll(notes, ") ", " ");
                        if( notes.length > 0 ) {
                            // remove end comma
                            notes = notes.substring(0, notes.length - 2)
                            if( notesAppend )
                                notes += ", " + notesAppend;
                        } else {
                            if( notesAppend )
                                notes = notesAppend;
                        }

                        rv.push({
                            id: 0,
                            name: name,
                            range: range,
                            damage: damage.replace(").", ""),
                            weight: 0,
                            notes: notes,
                            thrown: false,
                            rof: rof,
                            shots:shots,
                            ap: ap,
                            innate: false,
                            reach: reach,
                        })
                    }
                    } else {
                            // try an older style weapon check
                            if( item && this._itemIsWeaponLegacy( item )) {

                                let split = item.split("(", 2);
                                let name = split[0].trim();
                                let damage = "";
                                let ap = 0;
                                let rof = 0;
                                let shots = 0;
                                let range = "Melee";
                                let stats_split: string[] = [];
                                if( split.length > 1 )
                                    stats_split = split[1].split(",");
                                let notes = "";
                                let reach = 0;

                                let weaponStats = this.getWeaponStats( name, chargenData )

                                if( weaponStats ) {
                                    // console.log("LEGACY ASSIGN AND MAKE WEAPON", weaponStats)
                                    let weaponObj = new Weapon( weaponStats, null );
                                    rv.push({
                                        id: weaponObj.id,
                                        name: weaponObj.getName(),
                                        range: weaponObj.getRange(),
                                        damage: weaponObj.getDamage(),
                                        weight: weaponObj.getTotalWeight(),
                                        notes: weaponObj.getNotes(),
                                        thrown: weaponObj.getThrownWeapon(),
                                        rof: weaponObj.getROF(),
                                        shots: weaponObj.getShots(),
                                        ap: weaponObj.getAP(),
                                        innate: false,
                                        reach: weaponObj.getReach(),
                                    })
                                } else {
                                for( let data of stats_split ) {
                                    data = data.toLowerCase().trim();
                                    data = replaceAll(data, ")", "");

                                    if( data.indexOf("d4") > -1) {
                                        damage = data.trim();
                                    } else if( data.indexOf("d6") > -1) {
                                        damage = data.trim();
                                    } else if( data.indexOf("d8") > -1) {
                                        damage = data.trim();
                                    } else if( data.indexOf("d10") > -1) {
                                        damage = data.trim();
                                    } else if( data.indexOf("d12") > -1) {
                                        damage = data.trim();
                                    } else if( data.indexOf("str+") > -1) {
                                        damage = data.trim();
                                    } else if( (data.match(/\//g) || []).length == 2 ) {
                                        range = data.trim();
                                    } else if( data.indexOf("cone") > -1) {
                                        range = "Cone";
                                    } else if( data.indexOf("rof") > -1) {
                                        rof = +data.replace("rof", "").trim();
                                    }  else if( data.indexOf("rof") > -1) {
                                        rof = +data.replace("rof", "").trim();
                                    }else if( data.indexOf("shots") > -1) {
                                        shots = +data.replace("shots", "").trim();
                                    } else if( data.indexOf("reach") > -1) {
                                        reach = +data.replace("reach", "").trim();
                                    }else {
                                        notes = data.trim() + ", "
                                    }
                                }

                                damage = damage.toLowerCase();

                                let notesAppend = "";
                                if( damage.indexOf("m.d.c.") > -1 ) {
                                    notesAppend = "M.D.C.";
                                    damage = damage.replace("m.d.c.", "").trim();
                                }
                                if( damage.indexOf("mdc") > -1 ) {
                                    notesAppend = "M.D.C.";
                                    damage = damage.replace("mdc", "").trim();
                                }
                                if( damage.indexOf("mega damage") > -1 ) {
                                    notesAppend = "M.D.C.";
                                    damage = damage.replace("mega damage", "").trim();
                                }
                                if( damage.indexOf("mega") > -1 ) {
                                    notesAppend = "M.D.C.";
                                    damage = damage.replace("mega", "").trim();
                                }
                                if( damage.indexOf("heavy") > -1 ) {
                                    notesAppend = "Heavy";
                                    damage = damage.replace("heavy", "").trim();
                                }

                                notes = replaceAll(notes, "\n", " ");
                                notes = replaceAll(notes, "  ", " ");
                                notes = replaceAll(notes, ") ", " ");
                                if( notes.length > 0 ) {
                                    // remove end comma
                                    notes = notes.substring(0, notes.length - 2)
                                    if( notesAppend )
                                        notes += ", " + notesAppend;
                                } else {
                                    if( notesAppend )
                                        notes = notesAppend;
                                }

                                // console.log("damage 2", damage);
                                rv.push({
                                    id: 0,
                                    name: name,
                                    range: range,
                                    damage: damage.replace(").", ""),
                                    weight: 0,
                                    notes: notes,
                                    thrown: false,
                                    rof: rof,
                                    shots:shots,
                                    ap: ap,
                                    innate: false,
                                    reach: reach,
                                })
                            }
                        }
                    }
                }

            }
        // console.log("getAttacks rv", rv)

        return rv;
    }

    public getWeaponStats(
        weaponName: string,
        availableData: IChargenData,
    ): IChargenWeapon|null {

        // look for current book item
        for( let item of availableData.weapons ) {
            if(
                item.name.toLowerCase() == weaponName.toLowerCase()
                &&
                item.book_id == this.book_id
            ) {
                return item;
            }
        }

        // look for swade current book item
        for( let item of availableData.weapons ) {
            if(
                item.name.toLowerCase() == weaponName.toLowerCase()
                &&
                isRiftsBookID(item.book_id)
                &&
                isRiftsBookID(item.book_id) == isRiftsBookID(this.book_id) // RiftsBook
            ) {
                return item;
            }
        }

        // look for swade current book item
        for( let item of availableData.weapons ) {
            if(
                item.name.toLowerCase() == weaponName.toLowerCase()
                &&
                item.book_id == 9 // SWADE
            ) {
                return item;
            }
        }
        return null;
    }

    public getAbilities(): IBasicEdgeInfo[] {
        let rv: IBasicEdgeInfo[] = [];

        for( let ability of this.abilities ) {
            // if( ability.Notes.toLowerCase().indexOf("str+") > -1 ) {
            //     // Handled by Attacks
            // } else {
            rv.push({
                name: replaceAll(ability.Name, "−", "-"),
                notes: replaceAll(ability.Notes, "−", "-"),
            })
            // }
        }

        return rv;
    }

    public getArmor( chargenData: IChargenData ): IBasicArmorInfo[] {
        let rv: IBasicArmorInfo[] = [];

        // console.log( "getArmor", this.gear );

        for( let armorString of this.gear ) {
            if( armorString && armorString.trim()  ) {
                // console.log("armorString", armorString);
                let armorName = "";
                let baseNotes = "";
                if( armorString && armorString.indexOf("(") > -1 ) {
                    let split = armorString.split("(", 2);
                    armorName = split[0];
                    baseNotes = split[1];
                    baseNotes = replaceAll( baseNotes, ")", "");
                } else {
                    armorName = armorString;
                }

                // console.log("getArmor armorName", armorName)
                // console.log("getArmor baseNotes", baseNotes)

                let foundItem = false;
                if( baseNotes && baseNotes[0] == "+" && baseNotes.toLowerCase().indexOf("parry") == -1) {
                    for( let armor of chargenData.armor ) {
                        if(
                            armor.name.toLowerCase().trim() == armorName.toLowerCase().trim()
                            &&
                            armor.armor_value == +baseNotes
                            &&
                            armor.is_shield == false
                        ) {
                            // console.log("    Adding Found", armor.name);
                            rv.push( {
                                name: armor.name,
                                weight: armor.weight,
                                armor: armor.armor_value.toString(),
                                head: armor.covers_head,
                                torso: armor.covers_torso,
                                arms: armor.covers_arms,
                                legs: armor.covers_legs,
                            });
                            foundItem = true;
                            break;
                        }
                    }
                }

                if( !foundItem ) {
                    if( armorName && baseNotes && baseNotes[0] == "+") {
                        // console.log("    Adding Custom", armorName);
                        rv.push( {
                            name: armorName,
                            weight: 0,
                            armor: baseNotes,
                            head: false,
                            torso: true,
                            arms: false,
                            legs: false,
                        });

                    }
                }

            }
        }

        return rv;
    }

    public getShields( chargenData: IChargenData ): IBasicShieldInfo[] {
        let rv: IBasicShieldInfo[] = [];
        // console.log( "getShields", this.gear );

        for( let armorString of this.gear ) {
            if( armorString && armorString.trim()  ) {
                let armorName = "";
                let baseNotes = "";
                let baseParry = 0;
                let baseCover = 0;
                if( armorString && armorString.indexOf("(") > -1 ) {
                    let split = armorString.split("(", 2);
                    armorName = split[0];
                    baseNotes = split[1];
                    baseNotes = replaceAll( baseNotes, ")", "");
                } else {
                    armorName = armorString;
                }
                if( baseNotes && baseNotes.toLowerCase().indexOf("parry") > -1 ) {
                    baseParry = +baseNotes.toLowerCase().replace("parry", "").trim()
                }

                if( baseParry ) {
                    // console.log("getShields armorName", armorName)
                    // console.log("getShields baseNotes", baseNotes)
                    let foundItem = false;
                    for( let shield of chargenData.armor ) {
                        if(
                            shield.name.toLowerCase().trim() == armorName.toLowerCase().trim()
                                &&
                                shield.is_shield == true
                        ) {
                            // console.log("   getShield - adding found", shield.name)
                            rv.push( {
                                name: shield.name,
                                parry: shield.shield_parry_bonus,
                                cover: shield.shield_cover_vs_ranged,
                                weight: shield.weight,
                            })
                            foundItem = true;
                            break;
                        }
                    }

                    if( !foundItem && baseParry ) {
                        // console.log("   getShield - adding custom", armorName)
                        rv.push( {
                            name: armorName,
                            parry: baseParry,
                            cover: baseCover,
                            weight: 0,
                        })
                    }
                }
            }
        }

        return rv;
    }

    public getDescription(): string {
        return this.description.trim();
    }

    private _getActiveSkillLine(): string {
        let rv: string[] = [];

        for( let skill of this.skills ) {
            rv.push( skill.Name + " " + skill.Value )
        }

        return rv.join( ", " );
    }

    private _getAttributesLine(): string {
        return "Agility " + this.attributes.Agility
            + ", Smarts " + this.attributes.Smarts
            + ", Spirit " + this.attributes.Spirit
            + ", Strength " + this.attributes.Strength
            + ", Vigor " + this.attributes.Vigor

    }

    public getPlainText(): string {
        let html = this.exportHTML();

        html = replaceAll(html, "<hr />", "\n------------------\n" );

        return SanitizeHTML(
            html,
            {
                allowedTags: []
            }
        );
    }

    public getMarkdown(): string {
        return HTMLToMD( this.exportHTML() );
    }

    public exportHTML(hideImage: boolean = false): string {
        let exportHTML = "";

        if( this.image_url && !hideImage ) {
            exportHTML += "<span class=\"profile-image\">";

            exportHTML += "<img src=\"" + this.image_url + "\">";

            exportHTML += "</span>\n";
        }

        if( this.name ) {
            exportHTML += "<h1>" + this.name + "</h1>\n";
        }
        // exportHTML += "<div class=\"quick-des-line\">" + this.getRaceGenderAndProfession() + "</div>\n\n";
        //     if(this.currentFramework && this.currentFramework.name ) {

        //     exportHTML += "<strong>" + this.currentFramework.getFrameworkType() + "Framework</strong>: " + this.currentFramework.name + "<br />\n";

        // }

        // if( this.background.length > 1 || ( this.background.length == 1 && this.background[0].trim() != "") ) {
        //     exportHTML += "<h2>Background</h2>\n";
        //     exportHTML += "<p>" +this.background.join("</p>\n<p>") + "</p>\n\n";
        // }
        if( this.description && this.description.trim() ) {
            exportHTML += "<h2>Description</h2>\n";
            exportHTML += "<p>" +this.description.split("\n").join("</p>\n<p>") + "</p>\n\n";
        }

        exportHTML += "<br />\n";

        exportHTML += "<strong>Attributes</strong>: ";
        exportHTML += this._getAttributesLine() + "<br />\n";

        let activeSkillString = this._getActiveSkillLine();
        if( activeSkillString ) {
            exportHTML += "<strong>Skills</strong>: " + activeSkillString + "<br />\n";
        }

        exportHTML += "<strong>Pace</strong>: " + this.pace.toString() + "";
        // if( this._runningDie != 2 ) {
        //     exportHTML += "; <strong>Running Die</strong>: " + this.getRunningDie() + "";
        // }
        if( this.flying_pace > 0 ) {
            exportHTML += "; <strong>Flying Pace</strong>: " + this.flying_pace.toString() + "";
        }

        exportHTML += "; <strong>Parry</strong>: " + this.parry.toString() + "";
        if(+this.armor > 0 )
            exportHTML += "; <strong>Toughness</strong>: " + this.toughness + " (" + this.armor + ")";
        else
            exportHTML += "; <strong>Toughness</strong>: " + this.toughness + "";
        if( this.charisma != 0 ) {
            exportHTML += ", <strong>Charisma</strong>: " + this.charisma.toString() + "";
        }
        if( this.getSize() != 0 ) {
            exportHTML += "; <strong>Size</strong>: " + this.getSize() + "";
        }

        // if( this.setting.usesWealthDie ) {
        //     exportHTML += "<br /><strong>Wealth Die</strong>: " + this.getWealthDie() + "";
        // }

        // if( this.setting.usesRipperReason() ) {
        //     exportHTML += "<br /><strong>Rippers Reason</strong>: " + this.getRippersReason().toString() + ", ";
        //     exportHTML += "<br /><strong>Rippers Status</strong>: " + this.getRippersStatus().toString() + ", ";
        // }

        exportHTML += "<br />\n";

        // for( let stat of this.getAdditionalStatistics() ) {
        //     exportHTML += "<strong>" + stat.name + "</strong>: " + stat.value + "<br />";
        // }

        let otherLines: string[] = [];
        // if( this.setting.settingIsEnabled("sanity") ) {
        //     otherLines.push("<strong>Sanity</strong>: " + this.getSanity().toString() );
        // }

        // if( this.setting.settingIsEnabled("strain") ) {
        //     otherLines.push("<strong>Strain</strong>: " + this._currentStrain + "/" + this._maxStrain )
        // }

        // if( this._maxRobotMods > 0 ) {
        //     otherLines.push("<strong>Robot Mods Available</strong>: " + this._currentRobotMods  + "/" + this._maxRobotMods )
        // }

        // for( let att of this._looseAttributes ) {
        //     if( att.enabled ) {
        //         otherLines.push("<strong>" + att.name + "</strong>: " + att.value )
        //     }
        // }

        if( getSizeExtraWounds(this.getSize())  + 3 > 3 ) {
            otherLines.push("<strong>Wounds</strong>: " + getSizeExtraWounds(this.getSize())  + 3);
        }

        if( otherLines.length > 0 ) {
            exportHTML += otherLines.join("; ") + "<br />\n";
        }

        // Hindrances
        let hinds = this.hindrances.join(", ")
        if( hinds ) {
            exportHTML += "<strong>Hindrances</strong>: " + hinds + "<br />\n";
        }

        // Edges
        let edges = this.edges.join(", ");
        if( edges ) {
            exportHTML += "<strong>Edges</strong>: " + edges + "<br />\n";
        }

        // // Armor
        // let armor = this.getArmorList();
        // if( armor.length > 0 ) {
        //     exportHTML += "<strong>Armor</strong>: " + armor.join(", ") + "<br />\n";
        // }

        // // Weapons
        // let weapons = this.weapons;
        // if( weapons.length > 0 ) {
        //     exportHTML += "<strong>Weapons</strong>: " + weapons.join(", ") + "<br />\n";
        // }

        // Gear
        let gear = this.gear;
        if( gear.length > 0 ) {
            exportHTML += "<strong>Gear</strong>: " + gear.join(", ") + "<br />\n";
        }
        // Wealth

        // H3 Abilities
        let specialAbilities: IBestiaryAbility[] = this.abilities;
        if( specialAbilities.length > 0 ) {
            exportHTML += "\n<h3>Special Abilities</h3>\n";
            exportHTML += "<ul>";
            for( let item of specialAbilities ) {
                if( item ) {
                    exportHTML += "<li><strong>" + item.Name + ":</strong> " + item.Notes;

                    exportHTML += "</li>\n";
                }
            }
            exportHTML += "</ul>\n";
        }

        return exportHTML;

    }
}

export interface IBasicAttackInfo {
    id: number;
    name: string;
    range: string;
    damage: string;
    notes: string;
    weight: number;
    thrown: boolean;
    ap: number;
    shots: number;
    rof: number;

    innate: boolean;
    reach: number;
}

export interface IBasicEdgeInfo {
    name: string;
    notes: string;
}
export interface IBasicArmorInfo {
    name: string;
    armor: string;
    weight: number;
    head: boolean;
    torso: boolean;
    arms: boolean;
    legs: boolean;
}
export interface IBasicShieldInfo {
    name: string;
    weight: number;
    parry: number;
    cover: number;
}

