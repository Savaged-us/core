import { isNative } from 'lodash';
import { ISVGOptions, normalizeSvgOptions } from '../../../character-sheet/SVGOptions';
import { IChargenData } from '../../interfaces/IChargenData';
import { IJSONSettingExport } from '../../interfaces/IJSONSettingExport';
import { ISkillListImport } from '../../interfaces/ISkillListImport';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { cleanUpStringArray, FormatMoney } from '../../utils/CommonFunctions';
import { Book } from '../book';
import { IVehicleEntry } from '../vehicle_entry';
import { BaseObject } from '../_base_object';
import { IChargenArcaneBackground } from './arcane_background';
import { IChargenArmor } from './armor';
import { IChargenCyberware } from './cyberware';
import { IChargenEdge } from './edge';
import { IChargenGear } from './gear';
import { IGearEnhancementExport } from './gear_enhancement';
import { IChargenHindrance } from './hindrance';
import { PlayerCharacter } from './player_character';
import { IChargenFramework } from './player_character_framework';
import { IChargenRace } from './player_character_race';
import { IChargenPowers } from './power';
import { IChargenRiftsTattoo } from './riftsTattoos';
import { IChargenRobotMod } from './robot_mod';
import { IChargenWeapon } from './weapon';

export interface ISettingRules {
    tag: string;
    label: string;
    description: string;
    active: boolean;
    visible: boolean;
    wildcard_only: boolean;
    developer_only: boolean;
};

interface ISuperPowerLevels {
    tag: string;
    label: string;
    power_points: number;
    rising_stars_power_points: number;
    super_karma_amount: number;
};

export const SPC_POWER_LEVELS: ISuperPowerLevels[] = [
    {
        tag:"pulp-heroes",
        label: "Pulp Heroes",
        power_points: 15,
        rising_stars_power_points: 5,
        super_karma_amount: 5,
    },
    {
        tag:"street-fighters",
        label: "Street Fighters",
        power_points: 30,
        rising_stars_power_points: 10,
        super_karma_amount: 5,
    },
    {
        tag:"four-colors",
        label: "Four Colors",
        power_points: 45,
        rising_stars_power_points: 20,
        super_karma_amount: 10,
    },
    {
        tag:"heavy-hitters",
        label: "Heavy Hitters",
        power_points: 60,
        rising_stars_power_points: 30,
        super_karma_amount: 10,
    },
    {
        tag:"cosmic",
        label: "Cosmic",
        power_points: 75,
        rising_stars_power_points: 50,
        super_karma_amount: 10,
    },
];

export function getSPC2014PowerLevelLabel( tag: string ): string {
    for( let pl of SPC_POWER_LEVELS ) {
        if( tag == pl.tag )
            return pl.label;
    }

    return "(Unset)"
}
// setting_rule_labels
export const SETTING_RULE_DESCRIPTIONS: ISettingRules[] = [
    {
        label: "Rifts® M.D.C.",
        description: "Renames Heavy to MDC",
        tag:"rifts_mdc",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    // {
    //     label: "Rifts Armor Penalties",
    //     description: "Applies changes to Armor Penalties on Rifts® TLPG page77",
    //     tag:"rifts_armor_penalties",
    //     active: false,
    //     visible: true,
    //     developer_only: false,
    //     wildcard_only: false,
    // },
    {
        label: "Conviction",
        description: "This setting is just a label in the setting display",
        tag:"conviction",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "ETU Scholarship",
        description: "Use this setting to enable the derived Scholarship Trait",
        tag:"etu_scholarship",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "ETU Majors",
        description: "Use this setting to enable choosing one or two Majors in ETU",
        tag:"etu_majors",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Pathfinder Style Languages",
        description: "Use this setting to enable have languages either known or not",
        tag:"pathfinder-languages",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Character Frameworks",
        description: "Use this setting to enable frameworks for truly epic settings",
        tag:"character_framework",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Born a Hero",
        description: "",
        tag:"bornahero",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Multiple Languages",
        description: "",
        tag:"multiplelanguages",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "No Power Points",
        description: "",
        tag:"nopowerpoints",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },

    {
        label: "Skill Specializations",
        description: "",
        tag:"skillspecialization",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },

    {
        label: "Super Strength",
        description: "This setting uses the super strength load limits and max weight tables",
        tag:"super_strength",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Larger Than Life",
        description: "This setting allows for an extra Major Hindrance for character creation. We just up the max number of bonuses from 6 to 4.",
        tag:"larger_than_life",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Cyberware Tab",
        description: "",
        tag:"cyberware",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Rifts® Tattoos Tab",
        description: "Allows for Tattoo Magic Add ons which use Strain, but do not affect casting modifiers.",
        tag:"rifts_tattoos",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Strain Characteristic (for Cyberware)",
        description: "",
        tag:"strain",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Sanity",
        description: "",
        tag:"sanity",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Super Hero!",
        description: "",
        tag:"spcpowers",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },

    {
        label: "Last Parsec Default Skills",
        description: "This will give you an amount of smarts skill points enough to spend on your free Knowledge skill as per p67",
        tag:"last_parsec_default_skills",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Born a Hero",
        description: "",
        tag:"swade_bornahero",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Born a Hero includes Powers",
        description: "",
        tag:"swade_bornahero_includes_powers",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },

    {
        label: "Multiple Languages",
        description: "",
        tag:"swade_multiplelanguages",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Unarmored Hero",
        description: "",
        tag:"swade_unarmored_hero",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "No Power Points",
        description: "",
        tag:"swade_nopowerpoints",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },

    {
        label: "Pathfinder Languages",
        description: "",
        tag:"pathfinder_languages",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Skill Specializations",
        description: "",
        tag:"swade_skillspecialization",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        label: "Heroic (50f)",
        description: "",
        tag:"50f_heroic",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
    {
        tag: "iz3_strain",
        label: "Interface Zero Strain",
        description: "Strain is calculated off of vigor die, but not counted against",
        active: false,
        visible: true,
        developer_only: false,
        wildcard_only: false,
    },
]

export class PlayerCharacterSetting extends BaseObject {

    svgPrintOptions: ISVGOptions | null = null;

    name: string = "";
    notes: string = "";
    activeBooks: Book[] = [];
    settingRules: ISettingRules[] = [];
    coreSkills: string[] = []
    _active_setting_rule_tags: string[] = [];
    primaryBook: Book;
    _availableData: IChargenData  | null;
    extraPerkPoints: number = 0;
    startingAttributePoints: number = 5;
    startingSkillPoints: number = 15;
    usesCoreSkills: boolean = false;
    primaryIsSWADE: boolean = false;

    effects: string[] = [];
    additional_statistics: string[] = [];

    swade_spc_campaign_power_level: number = 15;
    swade_spc_campaign_points_adjust: number = 0;

    background: string = "";
    hideNativeLanguage: boolean = false;

    usesFactions: boolean = false;
    settingFactions: string[] = [];

    usesEncumbrance: boolean = true;
    usesMinimumStrength: boolean = true;
    usesWealth: boolean = true;
    usesWealthDie: boolean = false;

    maxLimitationPowerBonus: number = 2;
    commonPowerTrappings: string[] = [];

    // wealthDie: string = "d6";


    wealthStarting: number = 500;
    wealthSymbol: string = "$";
    wealthSymbolAfterAmount: boolean = false;

    noValidation: boolean = false;

    typicalKnowledgeSpecialties: string[] = [];
    typicalSettingLanguages: string[] = [];

    intro: string = "";
    customArmor: IChargenArmor[] = [];
    customWeapons: IChargenWeapon[] = [];
    customGear: IChargenGear[] = [];
    customGearEnhancements: IGearEnhancementExport[] = [];
    customVehicles: IVehicleEntry[] = [];
    customCyberware: IChargenCyberware[] = [];
    customRiftsTattoos: IChargenRiftsTattoo[] = [];
    customRobotMods: IChargenRobotMod[] = [];

    disableCustomRace: boolean = false;
    enableBookRaceCustomizing: boolean = false;
    disableCustomFramework: boolean = false;

    forbiddenGear: number[] = [];
    forbiddenGearEnhancements: number[] = [];
    forbiddenWeapons: number[] = [];
    forbiddenArmor: number[] = [];
    forbiddenVehicles: number[] = [];
    forbiddenCyberware: number[] = [];
    forbiddenRobotMods: number[] = [];
    forbiddenRiftsTattoo: number[] = [];

    forbiddenRaces: number[] = [];
    forbiddenFrameworks: number[] = [];
    forbiddenEdges: number[] = [];
    forbiddenHindrances: number[] = [];
    customFrameworks: IChargenFramework[] = [];

    forbiddenPowers: number[] = [];
    forbiddenArcaneBackgrounds: number[] = [];

    customPowers: IChargenPowers[] = [];
    // custom_arcane_backgrounds: IChargenGear[] = [];
    customRaces: IChargenRace[] = [];
    customArcaneBackgrounds: IChargenArcaneBackground[];
    customEdges: IChargenEdge[] = [];
    customHindrances: IChargenHindrance[] = [];

    spcPowerLevelKey = "pulp-heroes";
    spcPowerLimit = 0;
    spcPowerPoints = 0;
    spcRisingStars = false;
    // _char: PlayerCharacter = null;

    customSkills: ISkillListImport[] = [];
    removeSkills: string[] = [];
    active: boolean = true;
    wildcardOnly: boolean = false;
    developerOnly: boolean = false;
    adminOnly: boolean = false;

    hideHumanRace: boolean = false;

    nativeLanguageName: string = "Native";

    rank_name_novice: string = "Novice";
    rank_name_seasoned: string = "Seasoned";
    rank_name_veteran: string = "Veteran";
    rank_name_heroic: string = "Heroic";
    rank_name_legendary: string = "Legendary";

    number_native_languages: number = 1;

    saveID: number = 0;
    isSessionEdit: boolean = false;

    constructor(
        importData: IJSONSettingExport | null,
        charObj: PlayerCharacter | null,
        _availableData: IChargenData | null,
        jsonImportString: string | null = ""
    ) {
        super( importData );
        this._availableData = _availableData;
        this._char = charObj;

        this._setPrimaryToSWADE();

        this.reset();
        this.import( importData );
        if( jsonImportString ) {
            this.jsonImportString( jsonImportString );
        }
        this.svgPrintOptions = normalizeSvgOptions(this.svgPrintOptions);
    }

    public getAvailableData():IChargenData  | null{
        return this._availableData;
    }
    private _setPrimaryToSWADE() {
        if( this._availableData && this.activeBooks.length === 0 ) {
            // console.log("_setPrimaryToSWADE")
            for( let book of this._availableData.books ) {
                // console.log("book", book.id, book.short_name, book.primary);
                if( book.primary && book.short_name.toLowerCase() == "swade" ) {
                    // console.log("_setPrimaryToSWADE book", book);
                    this.primaryBook = new Book(book);
                    this.primaryIsSWADE = true;
                    if( this.book_id_is_used().indexOf( book.id ) == -1 )
                        this.activeBooks.push( new Book(book) );
                }
            }
        }
    }

    public _reloadSettingRules() {
        // importJSON Active Settings
        this._loadSettingRules();

        for( let active_setting_rule of this._active_setting_rule_tags ) {
            this.activateSetting( active_setting_rule );
        }
    }

    public getSWADESPC2021PowerLevelLabel( pl: number ): string {
        if( pl == 15 ) {
            return "I - 15 Super Power Points - 5 PL";
        }
        if( pl == 30 ) {
            return "II - 30 Super Power Points - 10 PL";
        }
        if( pl == 45 ) {
            return "III - 45 Super Power Points - 15 PL";
        }
        if( pl == 60 ) {
            return "IV - 60 Super Power Points - 20 PL";
        }
        if( pl == 75 ) {
            return "V - 75 Super Power Points - 25 PL";
        }

        return "n/a";
    }

    private _sortActiveBooks() {
        this.activeBooks.sort(
            (a,b) => {
                if( a.primary < b.primary ) {
                    return 1;
                } else if( a.primary > b.primary ) {
                    return -1;
                } else {
                    if( a.core < b.core ) {
                        return 1;
                    } else if( a.core > b.core ) {
                        return -1;
                    } else {
                        if( a.name > b.name ) {
                            return 1;
                        } else if( a.name < b.name ) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }

                }

            }
        );
    }

    private _sortSettingRules() {
        this.settingRules.sort(
            (a,b) => {
                if( a.label > b.label ) {
                    return 1;
                } else if( a.label < b.label ) {
                    return -1;
                } else {
                    return 0;
                }

            }
        );
    }

    public bornAHeroInEffect( isForPower: boolean = false ): boolean {
        if( isForPower ) {
            if( this.settingIsEnabled("swade_bornahero_includes_powers") ) {
                return true;
            }
        } else {
            if(
                this.settingIsEnabled("bornahero")
                    ||
                this.settingIsEnabled("swade_bornahero")
            ) {
                return true;
            }
        }

        return false;
    }

    hasAdditionalStatistic( statName: string): boolean {

        for( let name of this.additional_statistics) {
            if( name.toLowerCase().trim() == statName.toLowerCase().trim())
                return true;
        }
        return false;
    }

    public reset() {
        super.reset();
        this._active_setting_rule_tags = [];
        this.activeBooks = [];
        this.typicalKnowledgeSpecialties = [];
        this.typicalSettingLanguages = []
        this.coreSkills = [];

        this.forbiddenGearEnhancements = [];
        this.forbiddenRiftsTattoo = [];
        this.number_native_languages = 1;
        this.maxLimitationPowerBonus = 2;
        this.commonPowerTrappings = [];

        this.effects = [];
        this.additional_statistics = [];

        this.wildcardOnly = false;
        this.developerOnly = false;
        this.adminOnly = false;

        this.settingFactions = [];
        this.usesFactions = false;

        this.hideNativeLanguage = false;

        this.hideHumanRace = false;
        // this.id = 0;

        this.spcPowerLevelKey = "pulp-heroes";

        this.usesEncumbrance = true;
        this.usesMinimumStrength = true;
        this.usesWealth = true;
        this.usesWealthDie = false;

        this.customSkills = [];
        this.removeSkills = [];

        this.customArmor = [];
        this.customCyberware = [];
        this.customRiftsTattoos = [];
        this.customRobotMods = [];
        this.customGear = [];
        this.customWeapons = [];
        this.customPowers = [];
        this.customRaces = [];
        this.customEdges = [];
        this.customHindrances = [];
        this.customArcaneBackgrounds = [];

        this.forbiddenArmor = [];
        this.forbiddenCyberware = [];
        this.forbiddenRobotMods = [];
        this.forbiddenGear = [];
        this.forbiddenWeapons = [];
        this.forbiddenPowers = [];
        this.forbiddenRaces = [];
        this.forbiddenEdges = [];
        this.forbiddenHindrances = [];

        this.wealthStarting = 500;
        this.wealthSymbol = "$";
        this.wealthSymbolAfterAmount = false;
        this.disableCustomRace = false;
        this.disableCustomFramework = false;
        this.enableBookRaceCustomizing = false;

        // this.wealthDie = "d6";

        this.name = "";
        this.image_url = "";

        this._setPrimaryToSWADE();

        this.extraPerkPoints = 0;
        if( this.primaryBook ) {
            this.startingSkillPoints = this.primaryBook.startingSkillPoints;
            this.startingAttributePoints = this.primaryBook.startingAttributePoints;
        }

        this._loadSettingRules();

        for( let rule of this.settingRules ) {
            rule.active = false;
        }

        for( let book of this.activeBooks ) {
            if( book.primary ) {
                this.startingAttributePoints = book.startingAttributePoints;
                this.startingSkillPoints = book.startingSkillPoints;
                this.usesCoreSkills = false;
                this.primaryIsSWADE = false;
                this.coreSkills = [];
                if( book.coreSkills ) {
                    if( typeof(book.coreSkills) == "string") {
                        this.coreSkills = JSON.parse(book.coreSkills);
                    } else {
                        this.coreSkills = book.coreSkills;
                    }
                    let coreSkills = cleanUpStringArray( this.coreSkills );

                    if( coreSkills.length > 0 ) {
                        this.usesCoreSkills = true;
                    }
                    if( coreSkills.length > 0  && this.coreSkills.length == 0) {

                        this.coreSkills = coreSkills;
                    }
                }
                if( this.usesCoreSkills == false ) {
                    this.coreSkills = [];
                }

                if( book.shortName.toLowerCase().trim() == "swade" || (book.primary && book.swadeOptimized) ) {
                    this.primaryIsSWADE = true;
                } else {
                    this.coreSkills = [];
                }
            }
        }

        if( this.primaryBook ) {
            this.startingAttributePoints = this.primaryBook.startingAttributePoints;
            this.startingSkillPoints = this.primaryBook.startingSkillPoints;
        }
        this.usesCoreSkills = false;
        this.primaryIsSWADE = false;
        this.coreSkills = [];

        if( this.primaryBook && this.primaryBook.coreSkills ) {
            if( typeof(this.primaryBook.coreSkills) == "string") {
                this.coreSkills = JSON.parse(this.primaryBook.coreSkills);
            } else {
                this.coreSkills = this.primaryBook.coreSkills;
            }
            this.coreSkills = cleanUpStringArray( this.coreSkills );
            if( this.coreSkills.length > 0 ) {
                this.usesCoreSkills = true;
            }
        } else {
            this.coreSkills = [];
        }

        if( this.primaryBook && ( this.primaryBook.shortName.toLowerCase().trim() == "swade" || this.primaryBook.swadeOptimized ) ) {
            this.primaryIsSWADE = true;
        }
        this._loadSettingRules();
    }

    public wealthExample(): string {
        return FormatMoney( this.wealthStarting, this );
    }

    public jsonExport(): string {
        return JSON.stringify( this.export() );
    }

    public isPathfinder(): boolean {

        // if( this.name.toLowerCase().indexOf("pathfinder") > -1 )
        //     return true;
        if( this.primaryBook && this.primaryBook.name.toLowerCase().indexOf("pathfinder") > -1 )
            return true;
        return false;
    }

    public isPathfinderStyleLanguages(): boolean {

        // if( this.name.toLowerCase().indexOf("pathfinder") > -1 )
        //     return true;
        if( this.primaryBook && this.primaryBook.name.toLowerCase().indexOf("pathfinder") > -1 )
            return true;
        if( this.settingIsEnabled("pathfinder-languages"))
            return true;
        return false;
    }

    public getFactionList(): string[] {
        let filtered: string[] = [];

        for( let faction of this.settingFactions ) {
            if( faction.trim() ) {
                filtered.push( faction.trim() );
            }
        }

        filtered.sort();

        return filtered;

    }

    public apply() {
        if( !this._char )
            return;
        ApplyCharacterEffects(
            this.effects,
            this._char,
            "Custom Setting Rules",
            null,
            null,
            null,
            true,
        );

        for( let statName of this.additional_statistics ) {
            let foundStat = false;
            for( let stat of this._char.additional_statistics ) {
                if( stat.name.toLowerCase().trim() == statName.toLowerCase().trim() ) {
                    foundStat = true;
                    break;
                }
            }

            if( !foundStat ) {
                this._char.additional_statistics.push( {
                    name: statName,
                    value: "",
                })
            }
        }

        for( let item of this._char._gearPurchased ) {
            for( let settingItem of this.customGear ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

            if( item.gear_enhancements && item.gear_enhancements.length > 0 ) {
                for( let itemEnh of item.gear_enhancements ) {
                    for( let settingItemEnh of this.customGearEnhancements ) {
                        if( itemEnh.uuid && itemEnh.uuid == settingItemEnh.uuid ) {
                            itemEnh.import_obj( settingItemEnh );
                            break;
                        }
                    }
                }
            }

        }

        for( let item of this._char._weaponsPurchased ) {
            for( let settingItem of this.customWeapons ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

            if( item.gear_enhancements && item.gear_enhancements.length > 0 ) {
                for( let itemEnh of item.gear_enhancements ) {
                    for( let settingItemEnh of this.customGearEnhancements ) {

                        if( itemEnh.uuid && itemEnh.uuid == settingItemEnh.uuid ) {
                            itemEnh.import_obj( settingItemEnh );
                            break;
                        }
                    }
                }
            }

        }

        for( let item of this._char._armorPurchased ) {
            for( let settingItem of this.customArmor ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

            if( item.gear_enhancements && item.gear_enhancements.length > 0 ) {
                for( let itemEnh of item.gear_enhancements ) {
                    for( let settingItemEnh of this.customGearEnhancements ) {
                        if( itemEnh.uuid && itemEnh.uuid == settingItemEnh.uuid ) {
                            itemEnh.import_obj( settingItemEnh );
                            break;
                        }
                    }
                }
            }

        }

        for( let item of this._char._cyberwarePurchased ) {
            for( let settingItem of this.customCyberware ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

            if( item.gear_enhancements && item.gear_enhancements.length > 0 ) {
                for( let itemEnh of item.gear_enhancements ) {
                    for( let settingItemEnh of this.customGearEnhancements ) {
                        if( itemEnh.uuid && itemEnh.uuid == settingItemEnh.uuid ) {
                            itemEnh.import_obj( settingItemEnh );
                            break;
                        }
                    }
                }
            }

        }

        for( let item of this._char._robotModsPurchased ) {
            for( let settingItem of this.customRobotMods ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

            if( item.gear_enhancements && item.gear_enhancements.length > 0 ) {
                for( let itemEnh of item.gear_enhancements ) {
                    for( let settingItemEnh of this.customGearEnhancements ) {
                        if( itemEnh.uuid && itemEnh.uuid == settingItemEnh.uuid ) {
                            itemEnh.import_obj( settingItemEnh );
                            break;
                        }
                    }
                }
            }

        }

        for( let item of this._char._vehiclesPurchased ) {
            for( let settingItem of this.customVehicles ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

            if( item.gear_enhancements && item.gear_enhancements.length > 0 ) {
                for( let itemEnh of item.gear_enhancements ) {
                    for( let settingItemEnh of this.customGearEnhancements ) {
                        if( itemEnh.uuid && itemEnh.uuid == settingItemEnh.uuid ) {
                            itemEnh.import_obj( settingItemEnh );
                            break;
                        }
                    }
                }
            }

        }

        for( let item of this._char._edgesSelected ) {
            for( let settingItem of this.customEdges ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

        }

        for( let item of this._char._hindrancesSelected ) {
            for( let settingItem of this.customHindrances ) {
                if( item.uuid && item.uuid == settingItem.uuid ) {
                    item.import( settingItem );
                    break;
                }
            }

        }
    }

    public export(): IJSONSettingExport {
        let export_obj: IJSONSettingExport = super.export() as IJSONSettingExport;

        export_obj.swade_spc_campaign_power_level = this.swade_spc_campaign_power_level;
        export_obj.swade_spc_campaign_points_adjust = this.swade_spc_campaign_points_adjust;
        export_obj.svgPrintOptions = this.svgPrintOptions;
        export_obj.active_setting_rules = [];
        export_obj.books = [];
        export_obj.effects = this.effects;
        export_obj.native_language_name = this.nativeLanguageName;
        export_obj.additional_statistics = this.additional_statistics;
        export_obj.uses_factions = this.usesFactions;
        export_obj.setting_factions = this.settingFactions;
        export_obj.core_skills = this.coreSkills;
        export_obj.extra_edges = 0;
        export_obj.extra_perk_points = this.extraPerkPoints;
        export_obj.image_upload = this.image_url;

        // export_obj.image_updated = this.imageUpdated;
        export_obj.intro = this.intro;
        export_obj.hide_human_race = this.hideHumanRace;
        export_obj.no_validation = this.noValidation;
        export_obj.background = this.background;
        export_obj.remove_skills = this.removeSkills;
        export_obj.custom_skills = this.customSkills;
        export_obj.notes = this.notes;
        export_obj.active = this.active;
        export_obj.wildcard_only = this.wildcardOnly;
        export_obj.developer_only = this.developerOnly;
        export_obj.admin_only = this.adminOnly;
        export_obj.skills_add = [];
        export_obj.skills_banned = [];
        export_obj.skills_knowledge = this.typicalKnowledgeSpecialties;
        export_obj.skills_languages = this.typicalSettingLanguages;
        export_obj.spc_power_level_key = this.spcPowerLevelKey;
        export_obj.spc_power_limit = this.spcPowerLimit;
        export_obj.spc_power_points = this.spcPowerPoints;
        export_obj.spc_rising_stars = this.spcRisingStars;
        export_obj.starting_attribute_points = this.startingAttributePoints;
        export_obj.starting_skill_points = this.startingSkillPoints;
        export_obj.uses_encumbrance = this.usesEncumbrance;
        export_obj.uses_min_strength = this.usesMinimumStrength;
        export_obj.uses_wealth = this.usesWealth;
        export_obj.uses_wealth_die = this.usesWealthDie;
        export_obj.wealth_notation = this.wealthSymbol;
        export_obj.wealth_notation_trailing = this.wealthSymbolAfterAmount;
        export_obj.wealth_starting = this.wealthStarting;
        export_obj.custom_armor = this.customArmor;
        export_obj.custom_gear = this.customGear;
        export_obj.custom_vehicles = this.customVehicles;
        export_obj.custom_gear_enhancements = this.customGearEnhancements;
        export_obj.custom_weapons = this.customWeapons;
        export_obj.custom_edges = this.customEdges;
        export_obj.custom_hindrances = this.customHindrances;
        export_obj.custom_powers = this.customPowers;
        export_obj.custom_races = this.customRaces;
        export_obj.custom_cyberware = this.customCyberware;
        export_obj.custom_rifts_tattoos = this.customRiftsTattoos;
        export_obj.custom_robot_mods = this.customRobotMods;
        export_obj.custom_frameworks = this.customFrameworks;
        export_obj.forbidden_gear_enhancements = this.forbiddenGearEnhancements;
        export_obj.custom_arcane_backgrounds = this.customArcaneBackgrounds;
        export_obj.disableCustomRace = this.disableCustomRace;
        export_obj.enableBookRaceCustomizing = this.enableBookRaceCustomizing;
        export_obj.disableCustomFramework = this.disableCustomFramework;
        export_obj.hide_native_language = this.hideNativeLanguage;
        export_obj.forbidden_races = this.forbiddenRaces;
        export_obj.forbidden_edges = this.forbiddenEdges;
        export_obj.forbidden_hindrances = this.forbiddenHindrances;
        export_obj.forbidden_gear = this.forbiddenGear;
        export_obj.forbidden_weapons = this.forbiddenWeapons;
        export_obj.forbidden_frameworks = this.forbiddenFrameworks;
        export_obj.forbidden_armor = this.forbiddenArmor;
        export_obj.forbidden_powers = this.forbiddenPowers;
        export_obj.forbidden_arcane_backgrounds = this.forbiddenArcaneBackgrounds;
        export_obj.forbidden_vehicles = this.forbiddenVehicles;
        export_obj.forbidden_rifts_tattoos = this.forbiddenRiftsTattoo;
        export_obj.forbidden_cyberware = this.forbiddenCyberware;
        export_obj.forbidden_robot_mods = this.forbiddenRobotMods;
        export_obj.rank_name_novice = this.rank_name_novice;
        export_obj.rank_name_seasoned = this.rank_name_seasoned;
        export_obj.rank_name_veteran = this.rank_name_veteran;
        export_obj.rank_name_heroic = this.rank_name_heroic;
        export_obj.rank_name_legendary = this.rank_name_legendary;
        export_obj.number_native_languages = this.number_native_languages;
        export_obj.maxLimitationPowerBonus = this.maxLimitationPowerBonus;
        export_obj.commonPowerTrappings = this.commonPowerTrappings;

        for( let book of this.activeBooks) {
            export_obj.books.push(
                book.id
            );
        }

        for( let setting of this.settingRules) {
            if( setting.active ) {
                export_obj.active_setting_rules.push(
                    setting.tag
                );
            }
        }

        export_obj  = cleanUpReturnValue(export_obj);
        return export_obj;
    }

    private _loadSettingRules() {
        this.settingRules = [];

        // console.log("this.activeBooks", this.activeBooks);

        for( let book of this.activeBooks ) {
            if( book.primary ) {
                this.primaryBook = book;
            }
            if( book.settingRules ) {
                for( let rule of book.settingRules ) {
                    // console.log("rule", book.name, rule);
                    if( !this._settingExists( rule ))
                        this.settingRules.push( this._findLabelDescription( rule ) );
                }
            }
        }
        if( !this._settingExists( "character_framework" ))
            this.settingRules.push( this._findLabelDescription( "character_framework" ) );

        if( !this._settingExists( "pathfinder-languages" ))
            this.settingRules.push( this._findLabelDescription( "pathfinder-languages" ) );

        this._sortSettingRules();
    }

    private _settingExists( settingTag: string ): boolean {
        for( let rule of this.settingRules ) {
            if( rule.tag == settingTag ) {
                return true;
            }
        }
        return false;
    }

    private _findLabelDescription( needle_setting_tag: string ): ISettingRules {

        let description: string = "";
        let label: string = needle_setting_tag.trim();
        needle_setting_tag = label.toLowerCase();

        for( let haystack of SETTING_RULE_DESCRIPTIONS ) {
            if( haystack.tag.toLowerCase().trim() == needle_setting_tag.toLowerCase().trim() ) {
                // return a COPY of the found rule - friggin' pointers
                // otherwise subsequent activations/deactivations would mess up a list of settings
                // didn't hit the players that hard, but it hit the admin area
                return JSON.parse( JSON.stringify( haystack ));
            }
        }

        return {
            description: description,
            label: label,
            tag:needle_setting_tag,
            active: false,
            visible: true,
            developer_only: false,
            wildcard_only: false,
        }
    }

    public jsonImportString(jsonImportString: string) {
        if( typeof( jsonImportString ) == "string" ) {
            const importObj: IJSONSettingExport = JSON.parse( jsonImportString );
            this.import( importObj );
        }
        else {
            try {
                this.import( jsonImportString );
            }
            catch {
                console.log("setting.jsonImportString import error!");
            }
        }

    }

    public getCommonTrappings(): string[] {
        let rv: string[] = [];

        for( let item of this.commonPowerTrappings ) {
            if( item && item.trim() )
                rv.push( item.trim() );
        }

        rv.sort();
        return rv;
    }
    public import(importObj: IJSONSettingExport | null) {

        super.import( importObj, this._char ? this._char.getAvailableData().books : []  );

        if( importObj ) {

            if( importObj.svgPrintOptions ) {
                this.svgPrintOptions = importObj.svgPrintOptions;
            }

            if( importObj.native_language_name && importObj.native_language_name.trim() ) {
                this.nativeLanguageName = importObj.native_language_name;
            }

            if( importObj.swade_spc_campaign_power_level ) {
                this.swade_spc_campaign_power_level = importObj.swade_spc_campaign_power_level;
            }

            if( importObj.swade_spc_campaign_points_adjust ) {
                this.swade_spc_campaign_points_adjust = importObj.swade_spc_campaign_points_adjust;
            }

            if( importObj.number_native_languages ) {
                this.number_native_languages = importObj.number_native_languages;
            }

            if( importObj.maxLimitationPowerBonus ) {
                this.maxLimitationPowerBonus = importObj.maxLimitationPowerBonus;
            }

            if( importObj.commonPowerTrappings && importObj.commonPowerTrappings.length > 0 ) {
                this.commonPowerTrappings = importObj.commonPowerTrappings;
                this.commonPowerTrappings.sort();
            }

            // importJSON Core Skills
            if( importObj.remove_skills ) {
                this.removeSkills = importObj.remove_skills;
            }

            if( importObj.hide_native_language ) {
                this.hideNativeLanguage = true;
            }

            if( importObj.no_validation ) {
                this.noValidation = true;
            }

            if( importObj.effects ) {
                this.effects = importObj.effects
            }

            if( importObj.additional_statistics ) {
                this.additional_statistics = importObj.additional_statistics
            }

            if( importObj.hide_human_race ) {
                this.hideHumanRace = true;
            }

            if( importObj.uses_factions ) {
                this.usesFactions = true;
            }

            if( importObj.wildcard_only ) {
                this.wildcardOnly = true;
            }

            if( importObj.admin_only ) {
                this.adminOnly = true;
            }

            if( importObj.developer_only ) {
                this.developerOnly = true;
            }

            if( importObj.setting_factions ) {
                this.settingFactions = importObj.setting_factions;
            }

            if( importObj.custom_skills ) {
                this.customSkills = importObj.custom_skills;
                for( let skill of this.customSkills) {
                    if( skill.Name && !skill.name ) {
                        skill.name = skill.Name;
                    }
                    if( skill.Attribute && !skill.attribute ) {
                        skill.attribute = skill.Attribute;
                    }

                    if( skill.IsKnowledge ) {
                        skill.is_knowledge = true;
                    }
                    if( skill.BaseParry ) {
                        skill.base_parry = true;
                    }
                    if( skill.Language ) {
                        skill.language = true;
                    }
                    if( skill.AlwaysLanguage ) {
                        skill.always_language = true;
                    }
                }
            }

            if( importObj.rank_name_novice ) {
                this.rank_name_novice = importObj.rank_name_novice;
            }
            if( importObj.rank_name_seasoned ) {
                this.rank_name_seasoned = importObj.rank_name_seasoned;
            }
            if( importObj.rank_name_veteran ) {
                this.rank_name_veteran = importObj.rank_name_veteran;
            }
            if( importObj.rank_name_heroic ) {
                this.rank_name_heroic = importObj.rank_name_heroic;
            }
            if( importObj.rank_name_legendary ) {
                this.rank_name_legendary = importObj.rank_name_legendary;
            }

            if( importObj.disableCustomRace ) {
                this.disableCustomRace = importObj.disableCustomRace;
            }
            if( importObj.enableBookRaceCustomizing ) {
                this.enableBookRaceCustomizing = importObj.enableBookRaceCustomizing;
            }

            if( importObj.disableCustomFramework ) {
                this.disableCustomFramework = importObj.disableCustomFramework;
            }

            if(importObj.core_skills) {
                this.coreSkills = importObj.core_skills;
            }

            this.active = false;
            if(importObj.active) {
                this.active = importObj.active;
            }

            if(importObj.name) {
                this.name = importObj.name;
            }

            if(importObj.id) {
                this.id = importObj.id;
            }

            // if(importObj.uuid) {
            //     this.uuid = importObj.uuid;
            // }

            if(importObj.intro) {
                // this.intro = importObj.intro;
                if( typeof( importObj.intro ) == "string" ) {
                    this.intro = importObj.intro;
               } else {
                    this.intro = importObj.intro.join("\n");
               }
            }

            if(importObj.notes) {
                // this.notes = importObj.notes;
                if( typeof( importObj.notes ) == "string" ) {
                    this.notes = importObj.notes;
               } else {
                    this.notes = importObj.notes.join("\n");
               }
            }

            if(importObj.background) {
                // this.notes = importObj.notes;
                if( typeof( importObj.background ) == "string" ) {
                    this.background = importObj.background;
               } else {
                    this.background = importObj.background.join("\n");
               }
            }

            if(importObj.custom_armor) {
                this.customArmor = importObj.custom_armor;
            }

            if(importObj.custom_gear) {
                this.customGear = importObj.custom_gear;
            }

            if(importObj.custom_cyberware) {
                this.customCyberware = importObj.custom_cyberware;
            }

            if( importObj.custom_rifts_tattoos ) {
                this.customRiftsTattoos = importObj.custom_rifts_tattoos;
            }

            if(importObj.custom_robot_mods) {
                this.customRobotMods = importObj.custom_robot_mods;
            }

            this.customVehicles = [];
            if(importObj.custom_vehicles) {
                this.customVehicles = importObj.custom_vehicles;
            }

            this.customGearEnhancements = [];
            if(importObj.custom_gear_enhancements) {
                this.customGearEnhancements = importObj.custom_gear_enhancements;
            }

            if(importObj.custom_weapons) {
                this.customWeapons = importObj.custom_weapons;
            }

            if(importObj.custom_edges) {
                this.customEdges = importObj.custom_edges;
                // console.log("importObj.custom_edges", importObj.custom_edges);
            }

            if(importObj.custom_hindrances) {
                this.customHindrances = importObj.custom_hindrances;
            }

            if( importObj.custom_arcane_backgrounds) {
                this.customArcaneBackgrounds = importObj.custom_arcane_backgrounds;
            }

            if(importObj.custom_powers) {
                this.customPowers = importObj.custom_powers;
            }

            if(importObj.custom_frameworks) {
                this.customFrameworks = importObj.custom_frameworks;
            }

            for( let item of this.customRaces ) {
                item.id = 0;
            }

            for( let item of this.customEdges ) {
                item.id = 0;
            }

            for( let item of this.customHindrances ) {
                item.id = 0;
            }

            for( let item of this.customGear ) {
                item.id = 0;
            }

            for( let item of this.customGearEnhancements ) {
                item.id = 0;
            }

            for( let item of this.customWeapons ) {
                item.id = 0;
            }

            for( let item of this.customArmor ) {
                item.id = 0;
            }

            for( let item of this.customCyberware ) {
                item.id = 0;
            }

            for( let item of this.customArcaneBackgrounds ) {
                item.id = 0;
            }

            for( let item of this.customPowers ) {
                item.id = 0;
            }

            for( let item of this.customFrameworks ) {
                item.id = 0;
            }
            for( let item of this.customRobotMods ) {
                item.id = 0;
            }
            for( let item of this.customVehicles ) {
                item.id = 0;
            }

            if(importObj.forbidden_frameworks) {
                this.forbiddenFrameworks = importObj.forbidden_frameworks;
            }

            this.forbiddenGearEnhancements = [];
            if(importObj.forbidden_gear_enhancements) {
                this.forbiddenGearEnhancements = importObj.forbidden_gear_enhancements;
            }

            if(importObj.custom_races) {
                this.customRaces = importObj.custom_races;
            }

            if(importObj.forbidden_edges) {
                this.forbiddenEdges = importObj.forbidden_edges;
            }

            if(importObj.forbidden_hindrances) {
                this.forbiddenHindrances = importObj.forbidden_hindrances;
            }
            if(importObj.forbidden_gear) {
                this.forbiddenGear = importObj.forbidden_gear;
            }
            if(importObj.forbidden_cyberware) {
                this.forbiddenCyberware = importObj.forbidden_cyberware;
            }
            if(importObj.forbidden_robot_mods) {
                this.forbiddenRobotMods = importObj.forbidden_robot_mods;
            }

            if ( importObj.forbidden_rifts_tattoos ) {
                this.forbiddenRiftsTattoo = importObj.forbidden_rifts_tattoos;
            }

            if(importObj.forbidden_weapons) {
                this.forbiddenWeapons = importObj.forbidden_weapons;
            }
            if(importObj.forbidden_vehicles) {
                this.forbiddenVehicles = importObj.forbidden_vehicles;
            }
            if(importObj.forbidden_armor) {
                this.forbiddenArmor = importObj.forbidden_armor;
            }
            if(importObj.forbidden_powers) {
                this.forbiddenPowers = importObj.forbidden_powers;
            }
            if(importObj.forbidden_arcane_backgrounds) {
                this.forbiddenArcaneBackgrounds = importObj.forbidden_arcane_backgrounds;
            }
            if(importObj.forbidden_races) {
                this.forbiddenRaces = importObj.forbidden_races;
            }

            // if(typeof( importObj.created_by_name) !== 'undefined'){
            //     this.createdByName = importObj.created_by_name;
            // }
            // if(typeof( importObj.updated_by_name) !== 'undefined'){
            //     this.updatedByName = importObj.updated_by_name;
            // }
            // if(typeof( importObj.deleted_by_name) !== 'undefined'){
            //     this.deletedByName = importObj.deleted_by_name;
            // }

            // if( importObj.created_by ) {
            //     this.createdBy = importObj.created_by;
            // }
            // if( importObj.created_on ) {
            //     this.createdOn = new Date(importObj.created_on);
            // }

            // if( importObj.created_by ) {
            //     this.createdBy = importObj.created_by;
            // }

            // if( importObj.updated_by ) {
            //     this.updatedBy = importObj.updated_by;
            // }
            // if( importObj.updated_on ) {
            //     this.updatedOn = new Date(importObj.updated_on);
            // }
            // if( importObj.deleted_by ) {
            //     this.deletedBy = importObj.deleted_by;
            // }
            if( importObj.deleted_on ) {
                this.deletedOn = new Date(importObj.deleted_on);
            }

            // importJSON Active Books
            if( importObj.books ) {
                for( let activeBookID of importObj.books ) {
                    this.activateBook( activeBookID, true );
                    // for( let book of this._availableData.books ) {

                        // if( +book.id == +activeBookID) {
                        //     this.activeBooks.push( new Book(book) );
                        //     if( book.primary ) {
                        //         this.startingAttributePoints = book.starting_attribute_points;
                        //         this.startingSkillPoints = book.starting_skill_points;
                        //         this.usesCoreSkills = false;
                        //         this.primaryIsSWADE = false;
                        //         this.coreSkills = [];
                        //         if( book.core_skills ) {
                        //             if( typeof(book.core_skills) == "string") {
                        //                 this.coreSkills = JSON.parse(book.core_skills);
                        //             } else {
                        //                 this.coreSkills = book.core_skills;
                        //             }
                        //             this.coreSkills = cleanUpStringArray( this.coreSkills );
                        //             if( this.coreSkills.length > 0 ) {
                        //                 this.usesCoreSkills = true;
                        //             }
                        //         } else {
                        //             this.coreSkills = [];
                        //         }

                        //         if( book.short_name.toLowerCase().trim() == "swade") {
                        //             this.primaryIsSWADE = true;
                        //         }
                        //     }
                        // }
                    // }
                }

            } else {
                this._setPrimaryToSWADE();
            }

            // Load Setting Rules and Activate
            if( importObj.active_setting_rules ) {
                this._active_setting_rule_tags = importObj.active_setting_rules;
            }

            // Now load all the user settings after the Primary book has been established
            if(typeof( importObj.starting_attribute_points) !== 'undefined'){
                this.startingAttributePoints = importObj.starting_attribute_points;
            }

            if(typeof( importObj.starting_skill_points) !== 'undefined'){
                this.startingSkillPoints = importObj.starting_skill_points;
            }
            if(typeof( importObj.extra_perk_points) !== 'undefined'){
                this.extraPerkPoints = importObj.extra_perk_points;
            }

            if( importObj.skills_knowledge && importObj.skills_knowledge.length > 0 ) {
                this.typicalKnowledgeSpecialties = importObj.skills_knowledge;
                this.typicalKnowledgeSpecialties.sort();
            }

            if( importObj.skills_languages && importObj.skills_languages.length > 0 ) {
                this.typicalSettingLanguages = importObj.skills_languages;
                this.typicalSettingLanguages.sort();
            }

            if(typeof( importObj.uses_encumbrance) !== 'undefined'){
                this.usesEncumbrance = importObj.uses_encumbrance;
            }

            if(typeof( importObj.uses_min_strength) !== 'undefined'){
                this.usesMinimumStrength = importObj.uses_min_strength;
            }

            if(typeof( importObj.uses_wealth) !== 'undefined'){
                this.usesWealth = importObj.uses_wealth;
            }

            if(typeof( importObj.uses_wealth_die) !== 'undefined'){
                this.usesWealthDie = importObj.uses_wealth_die;
            }

            if(typeof( importObj.wealth_notation) !== 'undefined'){
                this.wealthStarting = importObj.wealth_starting;
            }
            if(typeof(importObj.wealth_notation) !== 'undefined'){
                this.wealthSymbol = importObj.wealth_notation;
            }
            if(typeof(importObj.wealth_notation_trailing) !== 'undefined'){
                this.wealthSymbolAfterAmount = importObj.wealth_notation_trailing;
            }
            if(typeof(importObj.image_upload) !== 'undefined'){
                this.image_url = importObj.image_upload;
            }
            // if(typeof(importObj.image_updated) !== 'undefined'){
            //     this.imageUpdated = new Date(importObj.image_updated);
            // }

            if(typeof(importObj.spc_power_level_key) !== 'undefined'){
                this.spcPowerLevelKey = importObj.spc_power_level_key;
            }
            if(typeof(importObj.spc_power_limit) !== 'undefined'){
                this.spcPowerLimit = importObj.spc_power_limit;
            }
            if(typeof(importObj.spc_power_points) !== 'undefined'){
                this.spcPowerPoints = importObj.spc_power_points;
            }
            if(typeof(importObj.spc_rising_stars) !== 'undefined'){
                this.spcRisingStars = importObj.spc_rising_stars;
            }

            this._sortActiveBooks();
            this._reloadSettingRules();

            var index = this.forbiddenArcaneBackgrounds.indexOf(0);
            if (index !== -1) {
                this.forbiddenArcaneBackgrounds.splice(index, 1);
            }

            var index = this.forbiddenArmor.indexOf(0);
            if (index !== -1) {
                this.forbiddenArmor.splice(index, 1);
            }

            var index = this.forbiddenCyberware.indexOf(0);
            if (index !== -1) {
                this.forbiddenCyberware.splice(index, 1);
            }

            var index = this.forbiddenEdges.indexOf(0);
            if (index !== -1) {
                this.forbiddenEdges.splice(index, 1);
            }

            var index = this.forbiddenFrameworks.indexOf(0);
            if (index !== -1) {
                this.forbiddenFrameworks.splice(index, 1);
            }

            var index = this.forbiddenGear.indexOf(0);
            if (index !== -1) {
                this.forbiddenGear.splice(index, 1);
            }

            var index = this.forbiddenGearEnhancements.indexOf(0);
            if (index !== -1) {
                this.forbiddenGearEnhancements.splice(index, 1);
            }

            var index = this.forbiddenHindrances.indexOf(0);
            if (index !== -1) {
                this.forbiddenHindrances.splice(index, 1);
            }

            var index = this.forbiddenPowers.indexOf(0);
            if (index !== -1) {
                this.forbiddenPowers.splice(index, 1);
            }

            var index = this.forbiddenRaces.indexOf(0);
            if (index !== -1) {
                this.forbiddenRaces.splice(index, 1);
            }

            var index = this.forbiddenRiftsTattoo.indexOf(0);
            if (index !== -1) {
                this.forbiddenRiftsTattoo.splice(index, 1);
            }

            var index = this.forbiddenRobotMods.indexOf(0);
            if (index !== -1) {
                this.forbiddenRobotMods.splice(index, 1);
            }

            var index = this.forbiddenVehicles.indexOf(0);
            if (index !== -1) {
                this.forbiddenVehicles.splice(index, 1);
            }

            var index = this.forbiddenWeapons.indexOf(0);
            if (index !== -1) {
                this.forbiddenWeapons.splice(index, 1);
            }
        }
    }

    public activateSetting( setting_tag: string) {
        for( let ruleC = 0; ruleC < this.settingRules.length; ruleC++ ) {
            if(
                setting_tag.toLowerCase().trim()
                ==
                this.settingRules[ruleC].tag.toLowerCase().trim()
            ) {
                this.settingRules[ruleC].active = true;
            }
        }
    }

    public deactivateSetting( setting_tag: string) {
        for( let ruleC = 0; ruleC < this.settingRules.length; ruleC++ ) {
            if(
                setting_tag.toLowerCase().trim()
                ==
                this.settingRules[ruleC].tag.toLowerCase().trim()
            ) {
                this.settingRules[ruleC].active = false;
            }
        }
    }

    public book_is_used( bookID: number ) {
        // for( let book of this.activeBooks ) {
        //     if (book.id === bookID ) {
        //         return true;
        //     }
        // }
        if( +bookID === 0 )
            return true;

        return this.book_id_is_used().indexOf(+bookID) > -1

        // return false;
    }

    public book_id_is_used() {
        let bookIDs: number[] = [];

        for( let book of this.activeBooks ) {
            bookIDs.push(+book.id);
        }

        return bookIDs;
    }

    public deactivateBook( bookID: number ) {
        for( let bookIndex in this.activeBooks ) {

            if (this.activeBooks[bookIndex].id == bookID ) {
                // only deactivate non-primary books, primary books are switched via activateBook below
                if( !this.activeBooks[bookIndex].primary ) {
                    this.activeBooks.splice( +bookIndex, 1);
                    this._reloadSettingRules();
                    this._sortActiveBooks();
                    this._sortSettingRules();
                    return true;
                }

            }
        }

        return false;
    }

    public settingIsEnabled( settingTag: string ) {
        for( let setting of this.settingRules ) {
            if( setting.tag.toLowerCase().trim() == settingTag.toLowerCase().trim() ){
                if( setting.active ) {
                    return true;
                } else {
                    return false;
                }
            }
        }
        return false;
    }

    public usesRipperReason(): boolean {
        for( let book of this.activeBooks ) {
            if( book.name.toLowerCase().indexOf("rippers") > -1 ) {
                return true;
            }
        }
        return false;
    }

    public activateBook( bookID: number, noCalc: boolean = false) {

        if( !this._availableData )
            return  false;
        for( let book of this._availableData.books ) {
            if (book.id == bookID ) {

                if( book.primary ) {
                    // remove other primary books, reversed so any indexes stay where they are
                    for( let removeBookIndex = this.activeBooks.length; removeBookIndex > -1; removeBookIndex-- ) {
                        if( this.activeBooks[removeBookIndex] && this.activeBooks[removeBookIndex].primary ) {
                            this.activeBooks.splice( +removeBookIndex, 1);
                        }
                    }

                    this.startingAttributePoints = book.starting_attribute_points;
                    this.startingSkillPoints = book.starting_skill_points;
                    this.usesCoreSkills = false;
                    this.primaryIsSWADE = false;
                    if( book.core_skills ) {
                        if( this.coreSkills.length == 0 ) {
                            if( typeof(book.core_skills) == "string") {

                                this.coreSkills = JSON.parse(book.core_skills);
                            } else {
                                this.coreSkills = book.core_skills;
                            }
                        }
                        let coreSkills = cleanUpStringArray( this.coreSkills );

                        if( coreSkills.length > 0 ) {
                            this.usesCoreSkills = true;
                        }
                        if( coreSkills.length > 0  && this.coreSkills.length == 0) {

                            this.coreSkills = coreSkills;
                        }
                    }
                    if( this.usesCoreSkills == false ) {
                        this.coreSkills = [];
                    }

                    if( book.short_name.toLowerCase().trim() == "swade" || (book.primary && book.swade_optimized )) {
                        this.primaryIsSWADE = true;
                    } else {
                        this.coreSkills = [];
                    }
                }

                if( this.book_id_is_used().indexOf( book.id ) == -1 )
                    this.activeBooks.push( new Book(book) );

                this._reloadSettingRules();
                this._sortActiveBooks();
                this._sortSettingRules();

                if( this._char && !noCalc ) {
                    if( book.primary ) {
                       this._char.resetSkills();
                    }
                    this._char.calc(false, false);
                }
                return true;
            }
        }

        return false;
    }

    public activeBookIds(): number[] {
        let rv: number[] = [];
        for( let book of this.activeBooks ) {
            rv.push( book.id );
        }

        return rv;
    }

    public activeBooksNames(): string[] {
        let rv: string[] = [];
        for( let book of this.activeBooks ) {
            rv.push( book.name );
        }

        return rv;
    }

    public activeBooksShortNames(): string[] {
        let rv: string[] = [];
        for( let book of this.activeBooks ) {
            rv.push( book.shortName );
        }

        return rv;
    }

    public raceIsEnabled( raceID: number ): boolean {
        if( raceID === 0 || this.forbiddenRaces.indexOf(raceID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableRace( raceID: number ): boolean {
        if( this.forbiddenRaces.indexOf(raceID) > -1 ) {
            this.forbiddenRaces.splice(this.forbiddenRaces.indexOf(raceID), 1);
            return true;
        }
        return false;
    }

    public toggleRace( raceID: number ): boolean {
        if( this.forbiddenRaces.indexOf(raceID) > -1 ) {
            this.forbiddenRaces.splice(this.forbiddenRaces.indexOf(raceID), 1);
            return true;
        } else {
            this.forbiddenRaces.push( raceID );
            return true;
        }
    }

    public disableRace( raceID: number ): boolean {
        if( this.forbiddenRaces.indexOf(raceID) == -1 ) {
            this.forbiddenRaces.push( raceID );
            return true;
        }
        return false;
    }

    public disableRaces( raceIDs: number[] ): boolean {
        for( const raceID of raceIDs ) {
            if( this.forbiddenRaces.indexOf(raceID) == -1 ) {
                this.forbiddenRaces.push( raceID );
            }
        }
        return true;
    }

    public enableRaces( raceIDs: number[] ): boolean {
        for( const raceID of raceIDs ) {
            if( this.forbiddenRaces.indexOf(raceID) > -1 ) {
                this.forbiddenRaces.splice(this.forbiddenRaces.indexOf(raceID), 1);
            }
        }
        return true;
    }

    public removeCustomRace( raceIndex: number ): boolean {

        if( this.customRaces && this.customRaces.length > raceIndex) {
            this.customRaces.splice( raceIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomRace(
        raceJSON: string,
        imageURL: string,
    ): boolean {

        let data: IChargenRace = JSON.parse(raceJSON);
        data.image_upload = imageURL;
        if( !this.customRaces )
            this.customRaces = [];
        this.customRaces.push( data )
        return false;
    }

    public hindranceIsEnabled( hindranceID: number ): boolean {
        if( hindranceID === 0 || this.forbiddenHindrances.indexOf(hindranceID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableHindrance( hindranceID: number ): boolean {
        if( this.forbiddenHindrances.indexOf(hindranceID) > -1 ) {
            this.forbiddenHindrances.splice(this.forbiddenHindrances.indexOf(hindranceID), 1);
            return true;
        }
        return false;
    }

    public toggleHindrance( hindranceID: number ): boolean {
        if( this.forbiddenHindrances.indexOf(hindranceID) > -1 ) {
            this.forbiddenHindrances.splice(this.forbiddenHindrances.indexOf(hindranceID), 1);
            return true;
        } else {
            this.forbiddenHindrances.push( hindranceID );
            return true;
        }
    }

    public disableHindrance( hindranceID: number ): boolean {
        if( this.forbiddenHindrances.indexOf(hindranceID) == -1 ) {
            this.forbiddenHindrances.push( hindranceID );
            return true;
        }
        return false;
    }

    public disableHindrances( hindranceIDs: number[] ): boolean {
        for( const hindranceID of hindranceIDs ) {
            if( this.forbiddenHindrances.indexOf(hindranceID) == -1 ) {
                this.forbiddenHindrances.push( hindranceID );
            }
        }
        return true;
    }

    public enableHindrances( hindranceIDs: number[] ): boolean {
        for( const hindranceID of hindranceIDs ) {
            if( this.forbiddenHindrances.indexOf(hindranceID) > -1 ) {
                this.forbiddenHindrances.splice(this.forbiddenHindrances.indexOf(hindranceID), 1);
            }
        }
        return true;
    }

    public removeCustomHindrance( hindranceIndex: number ): boolean {
        if( this.customHindrances.length > hindranceIndex) {
            this.customHindrances.splice( hindranceIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomHindrance( hindranceDef: IChargenHindrance ): boolean {
        // if( this.customHindrances.length > hindranceIndex) {
        //     this.customHindrances.splice( hindranceIndex, 1);
        //     return true;
        // }
        this.customHindrances.push( hindranceDef )
        return true;
    }

    public saveCustomHindrance( hindranceIndex: number, hindranceDef: IChargenHindrance ): boolean {
        if( this.customHindrances.length > hindranceIndex) {
            this.customHindrances[hindranceIndex] = hindranceDef;
            return true;
        }
        return false;
    }

    public abIsEnabled( abID: number ): boolean {
        if( abID === 0 || this.forbiddenArcaneBackgrounds.indexOf(abID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableArcaneBackground( abID: number ): boolean {
        if( this.forbiddenArcaneBackgrounds.indexOf(abID) > -1 ) {
            this.forbiddenArcaneBackgrounds.splice(this.forbiddenArcaneBackgrounds.indexOf(abID), 1);
            return true;
        }
        return false;
    }

    public toggleArcaneBackground( abID: number ): boolean {
        if( this.forbiddenArcaneBackgrounds.indexOf(abID) > -1 ) {
            this.forbiddenArcaneBackgrounds.splice(this.forbiddenArcaneBackgrounds.indexOf(abID), 1);
            return true;
        } else {
            this.forbiddenArcaneBackgrounds.push( abID );
            return true;
        }
    }

    public disableArcaneBackground( abID: number ): boolean {
        if( this.forbiddenArcaneBackgrounds.indexOf(abID) == -1 ) {
            this.forbiddenArcaneBackgrounds.push( abID );
            return true;
        }
        return false;
    }

    public disableArcaneBackgrounds( abIDs: number[] ): boolean {
        for( const abID of abIDs ) {
            if( this.forbiddenArcaneBackgrounds.indexOf(abID) == -1 ) {
                this.forbiddenArcaneBackgrounds.push( abID );
            }
        }
        return true;
    }

    public enableArcaneBackgrounds( abIDs: number[] ): boolean {
        for( const abID of abIDs ) {
            if( this.forbiddenArcaneBackgrounds.indexOf(abID) > -1 ) {
                this.forbiddenArcaneBackgrounds.splice(this.forbiddenArcaneBackgrounds.indexOf(abID), 1);
            }
        }
        return true;
    }

    public removeCustomArcaneBackground( abIndex: number ): boolean {
        if( this.customArcaneBackgrounds.length > abIndex) {
            this.customArcaneBackgrounds.splice( abIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomArcaneBackground( abDef: IChargenArcaneBackground ): boolean {
        // if( this.customArcaneBackgrounds.length > abIndex) {
        //     this.customArcaneBackgrounds.splice( abIndex, 1);
        //     return true;
        // }
        this.customArcaneBackgrounds.push( abDef )
        return true;
    }

    public saveCustomArcaneBackground( abIndex: number, abDef: IChargenArcaneBackground ): boolean {
        if( this.customArcaneBackgrounds.length > abIndex) {
            this.customArcaneBackgrounds[abIndex] = abDef;
            return true;
        }
        return false;
    }

    public edgeIsEnabled( edgeID: number ): boolean {
        if( edgeID === 0 || this.forbiddenEdges.indexOf(edgeID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableEdge( edgeID: number ): boolean {
        if( this.forbiddenEdges.indexOf(edgeID) > -1 ) {
            this.forbiddenEdges.splice(this.forbiddenEdges.indexOf(edgeID), 1);
            return true;
        }
        return false;
    }

    public toggleEdge( edgeID: number ): boolean {
        if( this.forbiddenEdges.indexOf(edgeID) > -1 ) {
            this.forbiddenEdges.splice(this.forbiddenEdges.indexOf(edgeID), 1);
            return true;
        } else {
            this.forbiddenEdges.push( edgeID );
            return true;
        }
    }

    public disableEdge( edgeID: number ): boolean {
        if( this.forbiddenEdges.indexOf(edgeID) == -1 ) {
            this.forbiddenEdges.push( edgeID );
            return true;
        }
        return false;
    }

    public disableEdges( edgeIDs: number[] ): boolean {
        for( const edgeID of edgeIDs ) {
            if( this.forbiddenEdges.indexOf(edgeID) == -1 ) {
                this.forbiddenEdges.push( edgeID );
            }
        }
        return true;
    }

    public enableEdges( edgeIDs: number[] ): boolean {
        for( const edgeID of edgeIDs ) {
            if( this.forbiddenEdges.indexOf(edgeID) > -1 ) {
                this.forbiddenEdges.splice(this.forbiddenEdges.indexOf(edgeID), 1);
            }
        }
        return true;
    }

    public removeCustomEdge( edgeIndex: number ): boolean {
        if( this.customEdges.length > edgeIndex) {
            this.customEdges.splice( edgeIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomEdge( edgeDef: IChargenEdge ): boolean {
        // if( this.customEdges.length > edgeIndex) {
        //     this.customEdges.splice( edgeIndex, 1);
        //     return true;
        // }
        this.customEdges.push( edgeDef )
        return true;
    }

    public saveCustomEdge( edgeIndex: number, edgeDef: IChargenEdge ): boolean {
        if( this.customEdges.length > edgeIndex) {
            this.customEdges[edgeIndex] = edgeDef;
            return true;
        }
        return false;
    }

    public gearIsEnabled( gearID: number ): boolean {
        if( gearID === 0 || this.forbiddenGear.indexOf(gearID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableGear( gearID: number ): boolean {
        if( this.forbiddenGear.indexOf(gearID) > -1 ) {
            this.forbiddenGear.splice(this.forbiddenGear.indexOf(gearID), 1);
            return true;
        }
        return false;
    }

    public toggleGear( gearID: number ): boolean {
        if( this.forbiddenGear.indexOf(gearID) > -1 ) {
            this.forbiddenGear.splice(this.forbiddenGear.indexOf(gearID), 1);
            return true;
        } else {
            this.forbiddenGear.push( gearID );
            return true;
        }
    }

    public gearIsEnabledEnhancement( gearID: number ): boolean {
        if( this.forbiddenGearEnhancements.indexOf(gearID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableGearEnhancement( gearID: number ): boolean {
        if( this.forbiddenGearEnhancements.indexOf(gearID) > -1 ) {
            this.forbiddenGearEnhancements.splice(this.forbiddenGear.indexOf(gearID), 1);
            return true;
        }
        return false;
    }

    public toggleGearEnhancement( gearID: number ): boolean {
        if( this.forbiddenGearEnhancements.indexOf(gearID) > -1 ) {
            this.forbiddenGearEnhancements.splice(this.forbiddenGearEnhancements.indexOf(gearID), 1);
            return true;
        } else {
            this.forbiddenGearEnhancements.push( gearID );
            return true;
        }
    }

    public disableGear( gearID: number ): boolean {
        if( this.forbiddenGear.indexOf(gearID) == -1 ) {
            this.forbiddenGear.push( gearID );
            return true;
        }
        return false;
    }

    public disableGearEnhancement( gearID: number ): boolean {
        if( this.forbiddenGearEnhancements.indexOf(gearID) == -1 ) {
            this.forbiddenGearEnhancements.push( gearID );
            return true;
        }
        return false;
    }

    public disableGears( gearIDs: number[] ): boolean {
        for( const gearID of gearIDs ) {
            if( this.forbiddenGear.indexOf(gearID) == -1 ) {
                this.forbiddenGear.push( gearID );
            }
        }
        return true;
    }

    public enableGears( gearIDs: number[] ): boolean {
        for( const gearID of gearIDs ) {
            if( this.forbiddenGear.indexOf(gearID) > -1 ) {
                this.forbiddenGear.splice(this.forbiddenGear.indexOf(gearID), 1);
            }
        }
        return true;
    }

    public disableGearEnhancements( gearIDs: number[] ): boolean {
        for( const gearID of gearIDs ) {
            if( this.forbiddenGearEnhancements.indexOf(gearID) == -1 ) {
                this.forbiddenGearEnhancements.push( gearID );
            }
        }
        return true;
    }

    public enableGearEnhancements( gearIDs: number[] ): boolean {
        for( const gearID of gearIDs ) {
            if( this.forbiddenGearEnhancements.indexOf(gearID) > -1 ) {
                this.forbiddenGearEnhancements.splice(this.forbiddenGearEnhancements.indexOf(gearID), 1);
            }
        }
        return true;
    }

    public removeCustomGearEnhancement( gearIndex: number ): boolean {
        if( this.customGearEnhancements.length > gearIndex) {
            this.customGearEnhancements.splice( gearIndex, 1);
            return true;
        }
        return false;
    }

    public removeCustomGear( gearIndex: number ): boolean {
        if( this.customGear.length > gearIndex) {
            this.customGear.splice( gearIndex, 1);
            return true;
        }
        return false;
    }

    public getNativeLanguageName(): string {
        if( this.nativeLanguageName.trim() != "") {
            return this.nativeLanguageName.trim();
        }

        return "Native";
    }

    public addCustomGear( gearDef: IChargenGear ): boolean {
        // if( this.customGear.length > gearIndex) {
        //     this.customGear.splice( gearIndex, 1);
        //     return true;
        // }
        this.customGear.push( gearDef )
        return true;
    }

    public saveCustomGear( gearIndex: number, gearDef: IChargenGear ): boolean {
        if( this.customGear.length > gearIndex) {
            this.customGear[gearIndex] = gearDef;
            return true;
        }
        return false;
    }

    public addCustomGearEnhancement( gearDef: IGearEnhancementExport ): boolean {
        // if( this.customGear.length > gearIndex) {
        //     this.customGear.splice( gearIndex, 1);
        //     return true;
        // }
        this.customGearEnhancements.push( gearDef )
        return true;
    }

    public saveCustomGearEnhancement( gearIndex: number, gearDef: IGearEnhancementExport ): boolean {
        if( this.customGearEnhancements.length > gearIndex) {
            this.customGearEnhancements[gearIndex] = gearDef;
            return true;
        }
        return false;
    }

    public riftsTattooIsEnabled( riftsTattooID: number ): boolean {
        if( riftsTattooID === 0 || this.forbiddenRiftsTattoo.indexOf(riftsTattooID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableRiftsTattoo( riftsTattooID: number ): boolean {
        if( this.forbiddenRiftsTattoo.indexOf(riftsTattooID) > -1 ) {
            this.forbiddenRiftsTattoo.splice(this.forbiddenRiftsTattoo.indexOf(riftsTattooID), 1);
            return true;
        }
        return false;
    }

    public toggleRiftsTattoo( riftsTattooID: number ): boolean {
        if( this.forbiddenRiftsTattoo.indexOf(riftsTattooID) > -1 ) {
            this.forbiddenRiftsTattoo.splice(this.forbiddenRiftsTattoo.indexOf(riftsTattooID), 1);
            return true;
        } else {
            this.forbiddenRiftsTattoo.push( riftsTattooID );
            return true;
        }
    }

    public disableRiftsTattoo( riftsTattooID: number ): boolean {
        if( this.forbiddenRiftsTattoo.indexOf(riftsTattooID) == -1 ) {
            this.forbiddenRiftsTattoo.push( riftsTattooID );
            return true;
        }
        return false;
    }

    public disableRiftsTattoos( riftsTattooIDs: number[] ): boolean {
        for( const riftsTattooID of riftsTattooIDs ) {
            if( this.forbiddenRiftsTattoo.indexOf(riftsTattooID) == -1 ) {
                this.forbiddenRiftsTattoo.push( riftsTattooID );
            }
        }
        return true;
    }

    public enableRiftsTattoos( riftsTattooIDs: number[] ): boolean {
        for( const riftsTattooID of riftsTattooIDs ) {
            if( this.forbiddenRiftsTattoo.indexOf(riftsTattooID) > -1 ) {
                this.forbiddenRiftsTattoo.splice(this.forbiddenRiftsTattoo.indexOf(riftsTattooID), 1);
            }
        }
        return true;
    }

    public cyberwareIsEnabled( cyberwareID: number ): boolean {
        if( cyberwareID === 0 || this.forbiddenCyberware.indexOf(cyberwareID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableCyberware( cyberwareID: number ): boolean {
        if( this.forbiddenCyberware.indexOf(cyberwareID) > -1 ) {
            this.forbiddenCyberware.splice(this.forbiddenCyberware.indexOf(cyberwareID), 1);
            return true;
        }
        return false;
    }

    public toggleCyberware( cyberwareID: number ): boolean {
        if( this.forbiddenCyberware.indexOf(cyberwareID) > -1 ) {
            this.forbiddenCyberware.splice(this.forbiddenCyberware.indexOf(cyberwareID), 1);
            return true;
        } else {
            this.forbiddenCyberware.push( cyberwareID );
            return true;
        }
    }

    public disableCyberware( cyberwareID: number ): boolean {
        if( this.forbiddenCyberware.indexOf(cyberwareID) == -1 ) {
            this.forbiddenCyberware.push( cyberwareID );
            return true;
        }
        return false;
    }

    public disableCyberwares( cyberwareIDs: number[] ): boolean {
        for( const cyberwareID of cyberwareIDs ) {
            if( this.forbiddenCyberware.indexOf(cyberwareID) == -1 ) {
                this.forbiddenCyberware.push( cyberwareID );
            }
        }
        return true;
    }

    public enableCyberwares( cyberwareIDs: number[] ): boolean {
        for( const cyberwareID of cyberwareIDs ) {
            if( this.forbiddenCyberware.indexOf(cyberwareID) > -1 ) {
                this.forbiddenCyberware.splice(this.forbiddenCyberware.indexOf(cyberwareID), 1);
            }
        }
        return true;
    }

    public removeCustomCyberware( cyberwareIndex: number ): boolean {
        if( this.customCyberware.length > cyberwareIndex) {
            this.customCyberware.splice( cyberwareIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomCyberware( cyberwareDef: IChargenCyberware ): boolean {
        // if( this.customCyberware.length > cyberwareIndex) {
        //     this.customCyberware.splice( cyberwareIndex, 1);
        //     return true;
        // }
        this.customCyberware.push( cyberwareDef )
        return true;
    }

    public saveCustomCyberware( cyberwareIndex: number, cyberwareDef: IChargenCyberware ): boolean {
        if( this.customCyberware.length > cyberwareIndex) {
            this.customCyberware[cyberwareIndex] = cyberwareDef;
            return true;
        }
        return false;
    }

    public removeCustomRiftsTattoo( cRiftsTattooIndex: number ): boolean {
        if( this.customRiftsTattoos.length > cRiftsTattooIndex) {
            this.customRiftsTattoos.splice( cRiftsTattooIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomRiftsTattoo( cRiftsTattooDef: IChargenRiftsTattoo ): boolean {
        // if( this.customRiftsTattoos.length > cRiftsTattooIndex) {
        //     this.customRiftsTattoos.splice( cRiftsTattooIndex, 1);
        //     return true;
        // }
        this.customRiftsTattoos.push( cRiftsTattooDef )
        return true;
    }

    public saveCustomRiftsTattoo( cRiftsTattooIndex: number, cRiftsTattooDef: IChargenRiftsTattoo ): boolean {
        if( this.customRiftsTattoos.length > cRiftsTattooIndex) {
            this.customRiftsTattoos[cRiftsTattooIndex] = cRiftsTattooDef;
            return true;
        }
        return false;
    }

    public robotModIsEnabled( cyberwareID: number ): boolean {
        if( cyberwareID === 0 || this.forbiddenRobotMods.indexOf(cyberwareID) == -1 ) {
            return true;
        }
        return false;
    }

    public toggleRobotMod( cyberwareID: number ): boolean {
        if( this.forbiddenRobotMods.indexOf(cyberwareID) > -1 ) {
            this.forbiddenRobotMods.splice(this.forbiddenRobotMods.indexOf(cyberwareID), 1);
            return true;
        } else {
            this.forbiddenRobotMods.push( cyberwareID );
            return true;
        }
    }

    public disableRobotMod( cyberwareIDs: number[] ): boolean {
        for( const cyberwareID of cyberwareIDs ) {
            if( this.forbiddenRobotMods.indexOf(cyberwareID) == -1 ) {
                this.forbiddenRobotMods.push( cyberwareID );
            }
        }
        return true;
    }

    public enableRobotMod( cyberwareIDs: number[] ): boolean {
        for( const cyberwareID of cyberwareIDs ) {
            if( this.forbiddenRobotMods.indexOf(cyberwareID) > -1 ) {
                this.forbiddenRobotMods.splice(this.forbiddenRobotMods.indexOf(cyberwareID), 1);
            }
        }
        return true;
    }

    public removeCustomRobotMod( cyberwareIndex: number ): boolean {
        if( this.customRobotMods.length > cyberwareIndex) {
            this.customRobotMods.splice( cyberwareIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomRobotMod( cyberwareDef: IChargenRobotMod ): boolean {
        // if( this.customRobotMods.length > cyberwareIndex) {
        //     this.customRobotMods.splice( cyberwareIndex, 1);
        //     return true;
        // }
        this.customRobotMods.push( cyberwareDef )
        return true;
    }

    public saveCustomRobotMod( cyberwareIndex: number, cyberwareDef: IChargenRobotMod ): boolean {
        if( this.customRobotMods.length > cyberwareIndex) {
            this.customRobotMods[cyberwareIndex] = cyberwareDef;
            return true;
        }
        return false;
    }

    public armorIsEnabled( armorID: number ): boolean {
        if( armorID === 0 || this.forbiddenArmor.indexOf(armorID) == -1 ) {
            return true;
        }
        return false;
    }

    public gearEnhancementIsEnabled( geID: number): boolean {
        if( geID > 0 &&  this.forbiddenGearEnhancements.indexOf(geID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableArmor( armorID: number ): boolean {
        if( this.forbiddenArmor.indexOf(armorID) > -1 ) {
            this.forbiddenArmor.splice(this.forbiddenArmor.indexOf(armorID), 1);
            return true;
        }
        return false;
    }

    public toggleArmor( armorID: number ): boolean {
        if( this.forbiddenArmor.indexOf(armorID) > -1 ) {
            this.forbiddenArmor.splice(this.forbiddenArmor.indexOf(armorID), 1);
            return true;
        } else {
            this.forbiddenArmor.push( armorID );
            return true;
        }
    }

    public disableArmor( armorID: number ): boolean {
        if( this.forbiddenArmor.indexOf(armorID) == -1 ) {
            this.forbiddenArmor.push( armorID );
            return true;
        }
        return false;
    }

    public disableArmors( armorIDs: number[] ): boolean {
        for( const armorID of armorIDs ) {
            if( this.forbiddenArmor.indexOf(armorID) == -1 ) {
                this.forbiddenArmor.push( armorID );
            }
        }
        return true;
    }

    public enableArmors( armorIDs: number[] ): boolean {
        for( const armorID of armorIDs ) {
            if( this.forbiddenArmor.indexOf(armorID) > -1 ) {
                this.forbiddenArmor.splice(this.forbiddenArmor.indexOf(armorID), 1);
            }
        }
        return true;
    }

    public removeCustomArmor( armorIndex: number ): boolean {
        if( this.customArmor.length > armorIndex) {
            this.customArmor.splice( armorIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomArmor( armorDef: IChargenArmor ): boolean {
        // if( this.customArmor.length > armorIndex) {
        //     this.customArmor.splice( armorIndex, 1);
        //     return true;
        // }
        this.customArmor.push( armorDef )
        return true;
    }

    public saveCustomArmor( armorIndex: number, armorDef: IChargenArmor ): boolean {
        if( this.customArmor.length > armorIndex) {
            this.customArmor[armorIndex] = armorDef;
            return true;
        }
        return false;
    }

    public weaponIsEnabled( weaponID: number ): boolean {
        if( weaponID === 0 || this.forbiddenWeapons.indexOf(weaponID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableWeapon( weaponID: number ): boolean {
        if( this.forbiddenWeapons.indexOf(weaponID) > -1 ) {
            this.forbiddenWeapons.splice(this.forbiddenWeapons.indexOf(weaponID), 1);
            return true;
        }
        return false;
    }

    public toggleWeapon( weaponID: number ): boolean {
        if( this.forbiddenWeapons.indexOf(weaponID) > -1 ) {
            this.forbiddenWeapons.splice(this.forbiddenWeapons.indexOf(weaponID), 1);
            return true;
        } else {
            this.forbiddenWeapons.push( weaponID );
            return true;
        }
    }

    public disableWeapon( weaponID: number ): boolean {
        if( this.forbiddenWeapons.indexOf(weaponID) == -1 ) {
            this.forbiddenWeapons.push( weaponID );
            return true;
        }
        return false;
    }

    public disableWeapons( weaponIDs: number[] ): boolean {
        for( const weaponID of weaponIDs ) {
            if( this.forbiddenWeapons.indexOf(weaponID) == -1 ) {
                this.forbiddenWeapons.push( weaponID );
            }
        }
        return true;
    }

    public enableWeapons( weaponIDs: number[] ): boolean {
        for( const weaponID of weaponIDs ) {
            if( this.forbiddenWeapons.indexOf(weaponID) > -1 ) {
                this.forbiddenWeapons.splice(this.forbiddenWeapons.indexOf(weaponID), 1);
            }
        }
        return true;
    }

    public removeCustomWeapon( weaponIndex: number ): boolean {
        if( this.customWeapons.length > weaponIndex) {
            this.customWeapons.splice( weaponIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomWeapon( weaponDef: IChargenWeapon ): boolean {
        // if( this.customWeapons.length > weaponIndex) {
        //     this.customWeapons.splice( weaponIndex, 1);
        //     return true;
        // }
        this.customWeapons.push( weaponDef )
        return true;
    }

    public saveCustomWeapon( weaponIndex: number, weaponDef: IChargenWeapon ): boolean {
        if( this.customWeapons.length > weaponIndex) {
            this.customWeapons[weaponIndex] = weaponDef;
            return true;
        }
        return false;
    }

    public vehicleIsEnabled( vehicleID: number ): boolean {
        if( vehicleID === 0 || this.forbiddenVehicles.indexOf(vehicleID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableVehicle( vehicleID: number ): boolean {
        if( this.forbiddenVehicles.indexOf(vehicleID) > -1 ) {
            this.forbiddenVehicles.splice(this.forbiddenVehicles.indexOf(vehicleID), 1);
            return true;
        }
        return false;
    }

    public toggleVehicle( vehicleID: number ): boolean {
        if( this.forbiddenVehicles.indexOf(vehicleID) > -1 ) {
            this.forbiddenVehicles.splice(this.forbiddenVehicles.indexOf(vehicleID), 1);
            return true;
        } else {
            this.forbiddenVehicles.push( vehicleID );
            return true;
        }
    }

    public disableVehicle( vehicleID: number ): boolean {
        if( this.forbiddenVehicles.indexOf(vehicleID) == -1 ) {
            this.forbiddenVehicles.push( vehicleID );
            return true;
        }
        return false;
    }

    public disableVehicles( vehicleIDs: number[] ): boolean {
        for( const vehicleID of vehicleIDs ) {
            if( this.forbiddenVehicles.indexOf(vehicleID) == -1 ) {
                this.forbiddenVehicles.push( vehicleID );
            }
        }
        return true;
    }

    public enableVehicles( vehicleIDs: number[] ): boolean {
        for( const vehicleID of vehicleIDs ) {
            if( this.forbiddenVehicles.indexOf(vehicleID) > -1 ) {
                this.forbiddenVehicles.splice(this.forbiddenVehicles.indexOf(vehicleID), 1);
            }
        }
        return true;
    }

    public removeCustomVehicle( vehicleIndex: number ): boolean {
        if( this.customVehicles.length > vehicleIndex) {
            this.customVehicles.splice( vehicleIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomVehicle( vehicleDef: IVehicleEntry ): boolean {
        // if( this.customVehicles.length > vehicleIndex) {
        //     this.customVehicles.splice( vehicleIndex, 1);
        //     return true;
        // }
        this.customVehicles.push( vehicleDef )
        return true;
    }

    public saveCustomVehicle( vehicleIndex: number, vehicleDef: IVehicleEntry ): boolean {
        if( this.customVehicles.length > vehicleIndex) {
            this.customVehicles[vehicleIndex] = vehicleDef;
            return true;
        }
        return false;
    }

    public powerIsEnabled( powerID: number ): boolean {
        if( powerID === 0 || this.forbiddenPowers.indexOf(powerID) == -1 ) {
            return true;
        }
        return false;
    }

    public enablePower( powerID: number ): boolean {
        if( this.forbiddenPowers.indexOf(powerID) > -1 ) {
            this.forbiddenPowers.splice(this.forbiddenPowers.indexOf(powerID), 1);
            return true;
        }
        return false;
    }

    public togglePower( powerID: number ): boolean {
        if( this.forbiddenPowers.indexOf(powerID) > -1 ) {
            this.forbiddenPowers.splice(this.forbiddenPowers.indexOf(powerID), 1);
            return true;
        } else {
            this.forbiddenPowers.push( powerID );
            return true;
        }
    }

    public disablePower( powerID: number ): boolean {
        if( this.forbiddenPowers.indexOf(powerID) == -1 ) {
            this.forbiddenPowers.push( powerID );
            return true;
        }
        return false;
    }

    public disablePowers( powerIDs: number[] ): boolean {
        for( const powerID of powerIDs ) {
            if( this.forbiddenPowers.indexOf(powerID) == -1 ) {
                this.forbiddenPowers.push( powerID );
            }
        }
        return true;
    }

    public enablePowers( powerIDs: number[] ): boolean {
        for( const powerID of powerIDs ) {
            if( this.forbiddenPowers.indexOf(powerID) > -1 ) {
                this.forbiddenPowers.splice(this.forbiddenPowers.indexOf(powerID), 1);
            }
        }
        return true;
    }

    public removeCustomPower( powerIndex: number ): boolean {
        if( this.customPowers.length > powerIndex) {
            this.customPowers.splice( powerIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomPower( powerDef: IChargenPowers ): boolean {
        // if( this.customPowers.length > powerIndex) {
        //     this.customPowers.splice( powerIndex, 1);
        //     return true;
        // }
        this.customPowers.push( powerDef )
        return true;
    }

    public saveCustomPower( powerIndex: number, powerDef: IChargenPowers ): boolean {
        if( this.customPowers.length > powerIndex) {
            this.customPowers[powerIndex] = powerDef;
            return true;
        }
        return false;
    }

    public itemIsEnabled( itemType: string, itemID: number ): boolean {
        switch( itemType.toLowerCase().trim() ) {

            case "gear_enhancement": {
                return this.gearEnhancementIsEnabled( itemID );
            }
            case "armor": {
                return this.armorIsEnabled( itemID );
            }
            case "gear": {
                return this.gearIsEnabled( itemID );
            }
            case "weapon": {
                return this.weaponIsEnabled( itemID );
            }
            case "edge": {
                return this.edgeIsEnabled( itemID );
            }
            case "hindrance": {
                return this.hindranceIsEnabled( itemID );
            }

            case "cyberware": {
                return this.cyberwareIsEnabled( itemID );
            }

            case "race": {
                return this.raceIsEnabled( itemID );
            }

            case "power": {
                return this.powerIsEnabled( itemID );
            }
            case "framework": {
                return this.frameworkIsEnabled( itemID );
            }
            case "vehicle": {
                return this.vehicleIsEnabled( itemID );
            }
        }
        return true;
    }

    public exportHTML(hideImage: boolean = false): string {

        if(!this._availableData) {
            return "exportHTML error: this._availableData not available."
        }
        let exportHTML = "";
        if( this.image_url && !hideImage ) {
            exportHTML += "<span class=\"profile-image\">";

            exportHTML += "<img src=\"" + this.image_url + "\">";

            exportHTML += "</span>\n";
        }

        if( this.name ) {
            exportHTML += "<h1>" + this.name + "</h1>\n";
        }

        if( this.intro.length > 1 || ( this.intro.length == 1 && this.intro[0].trim() != "") ) {
            exportHTML += "<h2>Introduction</h2>\n";
            exportHTML += "<p>" +this.intro.split("\n").join("</p>\n<p>") + "</p>\n\n";
        }

        if( this.background.length > 1 || ( this.background.length == 1 && this.background[0].trim() != "") ) {
            exportHTML += "<h2>Background</h2>\n";
            exportHTML += "<p>" +this.background.split("\n").join("</p>\n<p>") + "</p>\n\n";
        }

        if( this.notes.length > 1 || ( this.notes.length == 1 && this.notes[0].trim() != "") ) {
            exportHTML += "<h2>Notes</h2>\n";
            exportHTML += "<p>" +this.notes.split("\n").join("</p>\n<p>") + "</p>\n\n";
        }

        exportHTML += "<h2>Campaign Settings</h2>\n";
        exportHTML += "<div class=\"two-column\">\n";

        if( this.activeBooksNames().length > 0 ) {
            exportHTML += "<p><strong>Books Used</strong>: \n";
            exportHTML += "" +this.activeBooksNames().join(", ") + "</p>\n\n";
        } else {
            // "UNPOSSIBLE"! :D
            exportHTML += "<p><strong>Books Used</strong>: \n";
            exportHTML += "None</p>\n\n";
        }

        if( this.activeSettingRuleNames().length > 0 ) {
            exportHTML += "<p><strong>Setting Rules Used</strong>: \n";
            exportHTML += "" +this.activeSettingRuleNames().join(", ") + "</p>\n\n";
        } else {
            exportHTML += "<p><strong>Setting Rules Used</strong>: \n";
            exportHTML += "None</p>\n\n";
        }

        if( this.primaryIsSWADE && this.activeBooksNames().length > 0 ) {
            exportHTML += "<p><strong>Core Skills</strong>: \n";
            exportHTML += "" +this.coreSkills.join(", ") + "</p>\n\n";
        }

        exportHTML += "<h4>Encumbrance and Wealth</h4>\n";
        exportHTML += "<ul>\n";
        if( !this.usesEncumbrance ) {
            exportHTML += "<li><strong>This campaign doesn't count encumbrance</strong></li>\n";
        }

        if( !this.usesMinimumStrength ) {
            exportHTML += "<li><strong>This campaign doesn't count minimum strengths</strong></li>\n";
        }

        if( this.usesWealth ) {
            exportHTML += "<li>Starting Wealth: " + this.wealthExample() + "</li>\n";
        } else {
            if( this.usesWealthDie ) {
                exportHTML += "<li>This campaign uses the wealth die (SWADE p145).</li>\n";
            } else {
                exportHTML += "<li>This campaign doesn't count wealth</li>\n";
            }
        }

        exportHTML += "</ul>\n";

        exportHTML += "<h4>Campaign or Setting Tweaks</h4>\n";
        exportHTML += "<ul class=\"styleless\">\n";
        exportHTML += "<li><strong>Starting Attribute Points:</strong> " + this.startingAttributePoints + "</li>\n";
        exportHTML += "<li><strong>Starting Skill Points:</strong> " + this.startingSkillPoints + "</li>\n";
        if( this.extraPerkPoints > 0 ) {
            exportHTML += "<li>Extra Perk Points: " + this.extraPerkPoints + "</li>\n";
        }
        exportHTML += "</ul>";
        if( this.effects.length > 0 && this.effects[0].trim()) {
            exportHTML += "<h4>Campaign/Setting Modlines</h4>\n";
            exportHTML += "<ul class=\"small-text styleless\">\n";
            for( let line of this.effects )
                exportHTML += "<li>" + line + "</li>\n";
            exportHTML += "<ul>\n";
        }

        exportHTML += "<h4>Allowed/Forbidden Choices</h4>\n";
exportHTML += "<ul>";
        let allowedRaces =  this.getAllowedItems( this._availableData.races, this.forbiddenRaces );

        exportHTML += "<li><strong>Races: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedRaces) ) {
            exportHTML += "<li><strong>" + book + "" + allowedRaces[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";

        let customRaces = this.getCustomItemNames( this.customRaces );
        if( customRaces.length > 0 ) {
            exportHTML += "<li><strong>Custom Races: </strong>\n";
            exportHTML += "" + customRaces.join(", ") + "</li>\n\n";
        }

        let allowedEdges =  this.getAllowedItems( this._availableData.edges, this.forbiddenEdges );

        exportHTML += "<li><strong>Edges: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedEdges) ) {
            exportHTML += "<li><strong>" + book + "" + allowedEdges[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";

        let customEdges = this.getCustomItemNames( this.customEdges );
        if( customEdges.length > 0 ) {
            exportHTML += "<li><strong>Custom Edges: </strong>\n";
            exportHTML += "" + customEdges.join(", ") + "</li>\n\n";
        }

        let allowedHindrances =  this.getAllowedItems( this._availableData.hindrances, this.forbiddenHindrances );

        exportHTML += "<li><strong>Hindrances: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedHindrances) ) {
            exportHTML += "<li><strong>" + book + "" + allowedHindrances[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";

        let customHindrances = this.getCustomItemNames( this.customHindrances );
        if( customHindrances.length > 0 ) {
            exportHTML += "<li><strong>Custom Hindrances: </strong>\n";
            exportHTML += "" + customHindrances.join(", ") + "</li>\n\n";
        }

        let allowedGear =  this.getAllowedItems( this._availableData.gear, this.forbiddenGear );

        exportHTML += "<li><strong>Gear: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedGear) ) {
            exportHTML += "<li><strong>" + book + "" + allowedGear[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";

        let customGear = this.getCustomItemNames( this.customGear );
        if( customGear.length > 0 ) {
            exportHTML += "<li><strong>Custom Gear: </strong>\n";
            exportHTML += "" + customGear.join(", ") + "</li>\n\n";
        }

        let allowedArmor =  this.getAllowedItems( this._availableData.armor, this.forbiddenArmor );

        exportHTML += "<li><strong>Armor: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedArmor) ) {
            exportHTML += "<li><strong>" + book + "" + allowedArmor[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";

        let customArmor = this.getCustomItemNames( this.customArmor );
        if( customArmor.length > 0 ) {
            exportHTML += "<li><strong>Custom Armor: </strong>\n";
            exportHTML += "" + customArmor.join(", ") + "</li>\n\n";
        }

        let allowedWeapons =  this.getAllowedItems( this._availableData.weapons, this.forbiddenWeapons );

        exportHTML += "<li><strong>Weapons: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedWeapons) ) {
            exportHTML += "<li><strong>" + book + "" + allowedWeapons[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";
        exportHTML += "<ul>";

        let customWeapons = this.getCustomItemNames( this.customWeapons );
        if( customWeapons.length > 0 ) {
            exportHTML += "<p><strong>Custom Weapons: </strong>\n";
            exportHTML += "" + customWeapons.join(", ") + "</p>\n\n";
        }

        exportHTML += "<ul>";
        let allowedPowers =  this.getAllowedItems( this._availableData.powers, this.forbiddenPowers );

        exportHTML += "<li><strong>Powers: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedPowers) ) {
            exportHTML += "<li><strong>" + book + "" + allowedPowers[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";

        let customPowers = this.getCustomItemNames( this.customPowers );
        if( customPowers.length > 0 ) {
            exportHTML += "<p><strong>Custom Powers: </strong>\n";
            exportHTML += "" + customPowers.join(", ") + "</p>\n\n";
        }

        let allowedCyberware =  this.getAllowedItems( this._availableData.cyberware, this.forbiddenCyberware );

        exportHTML += "<li><strong>Cyberware: </strong>\n";

        exportHTML += "<ul>\n";
        for( let book of Object.keys( allowedCyberware) ) {
            exportHTML += "<li><strong>" + book + "" + allowedCyberware[book] + "</li>\n";
        }
        exportHTML += "</ul>\n";
        exportHTML += "</li>\n";

        let customCyberware = this.getCustomItemNames( this.customCyberware );
        if( customCyberware.length > 0 ) {
            exportHTML += "<li><strong>Custom Cyberware: </strong>\n";
            exportHTML += "" + customCyberware.join(", ") + "</li>\n\n";
        }

        let customRiftsTattoos = this.getCustomItemNames( this.customRiftsTattoos );
        if( customRiftsTattoos.length > 0 ) {
            exportHTML += "<li><strong>Custom Rifts&reg; Tattoos: </strong>\n";
            exportHTML += "" + customRiftsTattoos.join(", ") + "</li>\n\n";
        }

        exportHTML += "<ul>";
        exportHTML += "</ul></div>\n"; // end of campaign tweaks and settings ul
        return exportHTML;
    }

    getAllowedItems(
        itemList: any[],
        forbiddenList: number[],
    ): { [bookName: string] : string; } {

        let returnItems:  { [bookName: string] : string; } = {};

        let BookItems : { [bookName: string] : string[]; }= {};
        let ForbiddenBookItems : { [bookName: string] : string[]; }= {};
        let AllItems : { [bookName: string] : string[]; }= {};
        let TotalBookItems : { [bookName: string] : number; }= {};
        let UsedBookItems : { [bookName: string] : number; }= {};
        for( let item of itemList) {
            if( this.book_is_used(item.book_id) ) {
                if( !TotalBookItems[ item.book_name ] ) {
                    TotalBookItems[ item.book_name ] = 0;
                }
                if( !UsedBookItems[ item.book_name ] ) {
                    UsedBookItems[ item.book_name ] = 0;
                }
                TotalBookItems[ item.book_name ]++;
                if( !AllItems[ item.book_name ] ) {
                    AllItems[ item.book_name ] = [];
                }
                AllItems[ item.book_name ].push(item.name );
                if( !ForbiddenBookItems[ item.book_name ] ) {
                    ForbiddenBookItems[ item.book_name ] = [];
                }
                if( !BookItems[ item.book_name ] ) {
                    BookItems[ item.book_name ] = [];
                }

                if( forbiddenList.indexOf(item.id) == -1 ) {
                    BookItems[ item.book_name ].push(item.name );
                    UsedBookItems[ item.book_name ]++;
                } else {

                    ForbiddenBookItems[ item.book_name ].push(item.name );
                }
            }
        }

        for( let book of Object.keys(AllItems) ) {
            if(  BookItems[ book ] ) {
                BookItems[ book ].sort();
            }
            if(  ForbiddenBookItems[ book ] ) {
                ForbiddenBookItems[ book ].sort();
            }

            if(  TotalBookItems[ book ] ==  UsedBookItems[ book ] ) {
                returnItems[ book ] = "</strong>: All";
            } else if( UsedBookItems[ book ] == 0 ) {
                returnItems[ book ] = "</strong>: None";
            } else {
                if( BookItems[ book ].length < ForbiddenBookItems[book].length ) {
                    returnItems[ book ] = " Allowed Choices</strong>: " + BookItems[ book ].join(", ");
                } else {
                    returnItems[ book ] = " Forbidden Choices</strong>: - " + ForbiddenBookItems[ book ].join(", ");
                }
            }
        }

        return returnItems;
    }

    public getCustomRaces(): IChargenRace[] {
        if( !this.customRaces ) {
            this.customRaces = [];
            return this.customRaces;
        }

        return this.customRaces.sort( (a, b) => {
            if( a.name.toLowerCase() < b.name.toLowerCase() ) {
                return -1
            } else if( a.name.toLowerCase() > b.name.toLowerCase() ) {
                return 1
            } else {
                return 0
            }
        })
    }
    getCustomItemNames(
        customItemList: any[]
    ): string[] {
        let rv: string[] = [];

        for( let race of customItemList ) {
            rv.push( race.name );
        }

        return rv;
    }

    activeSettingRuleNames(): string[] {
        let rv: string[] = [];

        // for( let activeSettingTag of this._active_setting_rule_tags ) {
            for( let setting of this.settingRules ) {
                // if( setting.tag == activeSettingTag ) {
                if( setting.active ) {
                    rv.push(setting.label);
                }
            }
        // }

        return rv;
    }

    settingRuleTagIsActive(
        tag: string,
    ): boolean {
        let rv: string[] = [];

        // for( let activeSettingTag of this._active_setting_rule_tags ) {
            for( let setting of this.settingRules ) {
                // if( setting.tag == activeSettingTag ) {
                    // console.log("tag", tag, setting.tag )
                if( setting.active && tag == setting.tag ) {
                    return true
                }
            }
        // }

        return false;
    }

    setSelectedPowerLevel( setTag: string ) {
        for( let item of SPC_POWER_LEVELS ) {
            if( item.tag === setTag ) {
                // this.spcPowerLimit = item.power_points;
                // this.spcPowerPoints = item.power_points;
                this.spcPowerLevelKey = item.tag;
            }
        }
        this._calcRisingDefaultPowerPoints();
    }

    getSuperKarmaAmount(): number {
        for( let item of SPC_POWER_LEVELS ) {
            if( item.tag === this.spcPowerLevelKey ) {
                return item.super_karma_amount;
            }
        }

        return 0;
    }

    getSelectedPowerLevelName(): string {
        let rv: string = "";
        for( let item of SPC_POWER_LEVELS ) {
            if( item.tag === this.spcPowerLevelKey ) {
                rv = item.label;
            }
        }

        return rv;
    }

    getSelectedPowerLeve(): string {
        // let rv: string = "";
        // for( let item of SPC_POWER_LEVELS ) {
        //     if( item.power_points === this.spcPowerPoints ) {
        //         rv = item.tag;
        //     }
        // }

        return this.spcPowerLevelKey;
    }

    _calcRisingDefaultPowerPoints() {
        for( let item of SPC_POWER_LEVELS ) {
            if( item.tag === this.spcPowerLevelKey ) {
                if( this.spcRisingStars ) {

                    this.spcPowerPoints = item.rising_stars_power_points;
                    this.spcPowerLimit = item.rising_stars_power_points;
                } else {
                    this.spcPowerPoints = item.power_points;
                    this.spcPowerLimit = item.power_points / 3;
                }

            }
        }

    }

    toggleRisingStars() {
        this.spcRisingStars = !this.spcRisingStars;
        this._calcRisingDefaultPowerPoints();
    }

    activateRisingStars() {
        this.spcRisingStars = true;
        this._calcRisingDefaultPowerPoints();
    }

    getSPCPowerName(): string {

        for( let item of SPC_POWER_LEVELS ) {
            if( item.tag === this.spcPowerLevelKey ) {
                if( this.spcRisingStars ) {

                    return item.label + " (rising stars)";
                } else {
                    return item.label;
                }

            }
        }

        return "n/a";
    }

    getPrimaryBookID(): number {
        for( let book of this.activeBooks ) {
            if( book.primary )
                return book.id
        }
        return 0;
    }

    getRankLabelNovice(): string {
        if( this.rank_name_novice.trim() ) {
            return this.rank_name_novice;
        } else {
            return "Novice"
        }
    }

    getRankLabelVeteran(): string {
        if( this.rank_name_veteran.trim() ) {
            return this.rank_name_veteran;
        } else {
            return "Veteran"
        }
    }

    getRankLabelSeasoned(): string {
        if( this.rank_name_seasoned.trim() ) {
            return this.rank_name_seasoned;
        } else {
            return "Seasoned"
        }
    }

    getRankLabelHeroic(): string {
        if( this.rank_name_heroic.trim() ) {
            return this.rank_name_heroic;
        } else {
            return "Heroic"
        }
    }

    getRankLabelLegendary( legendaryTier: number ): string {

        let legendaryParenthetical = "";
        if( legendaryTier > 1 ) {
            legendaryParenthetical += " (" + legendaryTier + ")";
        }
        if( this.rank_name_legendary.trim() ) {
            return this.rank_name_legendary + legendaryParenthetical;
        } else {
            return "Legendary" + legendaryParenthetical
        }
    }

    public frameworkIsEnabled( frameworkID: number ): boolean {
        if( frameworkID === 0 || this.forbiddenFrameworks.indexOf(frameworkID) == -1 ) {
            return true;
        }
        return false;
    }

    public enableFramework( frameworkID: number ): boolean {
        if( this.forbiddenFrameworks.indexOf(frameworkID) > -1 ) {
            this.forbiddenFrameworks.splice(this.forbiddenFrameworks.indexOf(frameworkID), 1);
            return true;
        }
        return false;
    }

    public toggleFramework( frameworkID: number ): boolean {
        if( this.forbiddenFrameworks.indexOf(frameworkID) > -1 ) {
            this.forbiddenFrameworks.splice(this.forbiddenFrameworks.indexOf(frameworkID), 1);
            return true;
        } else {
            this.forbiddenFrameworks.push( frameworkID );
            return true;
        }
    }

    public disableFramework( frameworkID: number ): boolean {
        if( this.forbiddenFrameworks.indexOf(frameworkID) == -1 ) {
            this.forbiddenFrameworks.push( frameworkID );
            return true;
        }
        return false;
    }

    public disableFrameworks( frameworkIDs: number[] ): boolean {
        for( const frameworkID of frameworkIDs ) {
            if( this.forbiddenFrameworks.indexOf(frameworkID) == -1 ) {
                this.forbiddenFrameworks.push( frameworkID );
            }
        }
        return true;
    }

    public enableFrameworks( frameworkIDs: number[] ): boolean {
        for( const frameworkID of frameworkIDs ) {
            if( this.forbiddenFrameworks.indexOf(frameworkID) > -1 ) {
                this.forbiddenFrameworks.splice(this.forbiddenFrameworks.indexOf(frameworkID), 1);
            }
        }
        return true;
    }

    public removeCustomFramework( frameworkIndex: number ): boolean {
        if( this.customFrameworks.length > frameworkIndex) {
            this.customFrameworks.splice( frameworkIndex, 1);
            return true;
        }
        return false;
    }

    public addCustomFramework( frameworkJSON: string ): boolean {
        // if( this.customFrameworks.length > frameworkIndex) {
        //     this.customFrameworks.splice( frameworkIndex, 1);
        //     return true;
        // }
        this.customFrameworks.push( JSON.parse(frameworkJSON) )
        return false;
    }
}
