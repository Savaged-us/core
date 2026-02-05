import SanitizeHTML from 'sanitize-html';
import { CONFIGLiveHost, CONFIGSiteTitle } from '../../../ConfigGeneral';
import { ValidityLevel } from '../../enums/ValidityLevel';
import { IBaseAttributes } from '../../interfaces/IBaseAttributes';
import { IChargenData } from '../../interfaces/IChargenData';
import { IDerivedAttributes } from '../../interfaces/IDerivedAttributes';
import { IExportArcaneBackground, IExportStatsOutput, INaturalArmorList, IToughnessModifier, IWeaponProfile, sortPowerExports } from '../../interfaces/IExportStatsOutput';
import { IJournalEntry } from '../../interfaces/IJournalEntry';
import { IContainerItemExport, IEquippedInnateItems, IJSONArcaneItemExport, IJSONArmorExport, IJSONBaseSpecify, IJSONCyberwareExport, IJSONGearExport, IJSONPlayerCharacterExport, IJSONRiftsTattoosExport, IJSONRobotModExport, IJSONSPC2014PowerExport, IJSONVehicleExport, IJSONWeaponExport, ILEGACYJSONPowerExport, ILooseAbility } from '../../interfaces/IJSONPlayerCharacterExport';
import { IJSONSettingExport } from '../../interfaces/IJSONSettingExport';
import { IPeoplePlacesThings } from '../../interfaces/IPeoplePlacesThings';
import { IPromptSpecification } from '../../interfaces/IPromptSpecification';
import { ISkillAssignmentExport } from '../../interfaces/ISkillExport';
import { ISkillListImport } from '../../interfaces/ISkillListImport';
import { IValidationMessage } from '../../interfaces/IValidationMessage';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { capitalCase, fixFloat, FormatMoney, getPerkLabel, getRankName, normalizeCharacters, replaceAll } from '../../utils/CommonFunctions';
import { needsEscapeFixing, unescapeOverEscapedString, getDisplayText } from '../../utils/escapeCharacterFixer';
import { getDieIndexFromLabel, getDieLabelFromIndex, getDieValueFromIndex } from '../../utils/Dice';
import { emboldenBeforeColon } from '../../utils/emboldenBeforeColon';
import { formatDateYYYYMMDD } from '../../utils/FormatDateYYYYMMDD';
import { generateUUID } from '../../utils/generateUUID';
import { getSizeExtraWounds, getSizeName, getSizeScaleModifier } from '../../utils/getSizeName';
import { ParseDamageString } from '../../utils/ParseDamageString';
import { getPathfinderArmorLabel } from '../../utils/PathfinderFunctions';
import { removeExtraImageURL } from '../../utils/removeExtraImageURL';
import { sortByObjectName } from '../../utils/sortByObjectName';
import { split_by_max_two } from '../../utils/split_by_max_two';
import { BestiaryEntry, IBestiaryEntry } from '../bestiary_entry';
import { Book, IBook } from '../book';
import { User } from '../user';
import { IVehicleEntry, IVehicleObjectVars, VehicleEntry } from '../vehicle_entry';
import { ArcaneBackground, IChargenArcaneBackground, IChargenArcaneBackgroundObjectVars } from './arcane_background';
import { ArcaneItem } from './arcane_item';
import { Armor, IArmorObjectVars, IChargenArmor } from './armor';
import { Cyberware, IChargenCyberware, ICyberwareObjectVars } from './cyberware';
import { Edge, IChargenEdge, IChargenEdgeObjectVars } from './edge';
import { Gear, IChargenGear, IGearObjectVars } from './gear';
import { GearEnhancement, IGearEnhancementExport } from './gear_enhancement';
import { Hindrance, IChargenHindrance, IChargenHindranceOptions } from './hindrance';
import { PlayerCharacterAdvancement } from './player_character_advancement';
import { IChargenFramework, PlayerCharacterFramework } from './player_character_framework';
import { IChargenMonsterFramework, PlayerCharacterMonsterFramework } from './player_character_monster_framework';
import { IRaceEffects, PlayerCharacterRace } from './player_character_race';
import { PlayerCharacterSetting } from './player_character_setting';
import { IChargenPowers, IChargenPowerVars, Power } from './power';
import { IChargenRiftsTattoo, IRiftsTattoosObjectVars, RiftsTattoos } from './riftsTattoos';
import { IChargenRobotMod, IRobotModObjectVars, RobotMod } from './robot_mod';
import { ISkillSpecialty, Skill } from './skill';
import { IChargenSuperPower2014, SuperPower2014 } from './super_power_2014';
import { IChargenSuperPower2021, SuperPower2021 } from './super_power_2021';
import { IChargenWeapon, IWeaponObjectVars, Weapon } from './weapon';
import { ValidationModule } from './modules/ValidationModule';
import { ImportExportModule } from './modules/ImportExportModule';
import { AttributeModule } from './modules/AttributeModule';
import { SkillModule } from './modules/SkillModule';
import { EquipmentModule } from './modules/EquipmentModule';
import { ArmorToughnessModule } from './modules/ArmorToughnessModule';
import { EdgeHindranceModule } from './modules/EdgeHindranceModule';
import { ArcaneModule } from './modules/ArcaneModule';
import { SuperPowerModule } from './modules/SuperPowerModule';
import { AdvancementModule } from './modules/AdvancementModule';
import { PowerModule } from './modules/PowerModule';
import { SpecialAbilityModule } from './modules/SpecialAbilityModule';
import { ContainerStorageModule } from './modules/ContainerStorageModule';
import { DisplayModule } from './modules/DisplayModule';
import { DerivedStatsModule } from './modules/DerivedStatsModule';
import { FactionModule } from './modules/FactionModule';
import { LanguageModule } from './modules/LanguageModule';
import { CharacterInfoModule } from './modules/CharacterInfoModule';
import { InnateWeaponModule } from './modules/InnateWeaponModule';
import { CalcOrchestratorModule } from './modules/CalcOrchestratorModule';
import { GenericExportModule } from './modules/GenericExportModule';
import { EdgeDataModule, IEdgeData } from './modules/EdgeDataModule';
import { HindranceDataModule, IHindranceData } from './modules/HindranceDataModule';
import { LegacyPurchaseModule } from './modules/LegacyPurchaseModule';
import { PurchaseModule } from './modules/PurchaseModule';
import { CombatModule } from './modules/CombatModule';
import { FrameworkModule } from './modules/FrameworkModule';
import { GearEnhancementModule } from './modules/GearEnhancementModule';

export interface INameAndType {
    name: string;
    type: string;
}

export interface IAdditionalStatistic {
    name: string;
    value: string;
}

export interface ISpecialAbilityItem {
    name: string;
    summary: string;
    specify: string;
    specifyValue: string;
    specifyLimit: string[];
    selectItems: string[];
    from: string;
    positive: boolean;
    book_name: string,
    book_id: number;
    page: string,
    custom: boolean;
    alternate_options: IRaceEffects[];
    originalIndex?: number; // Track original index in effects array for alternative abilities
}

export interface IValidationCount {
    errors: number;
    warnings: number;
}

export interface IValidationCounts {
    [id: string]: IValidationCount
}

export interface ISPCPowerSetTable {
    activated: boolean;
    set: string;
    name: string;
    mods: string;
    points: number;
    cost: number;
    customDescription: string;
    levels: number;
}

export interface IContainerListItem {
    index: number;
    label: string;
    isCustom: boolean;
}

export interface IArmorLocations {
    face: IArmorInformation[];
    head: IArmorInformation[];
    torso: IArmorInformation[];
    arms: IArmorInformation[];
    legs: IArmorInformation[];
}

export interface IArmorValues {
    face: number;
    head: number;
    torso: number;
    arms: number;
    legs: number;
}

export interface IToughnessValues {
    face: string;
    head: string;
    torso: string;
    arms: string;
    legs: string;
}

export interface IArmorInformation {
    value: number;
    heavyValue: number;
    name: string;
    adjustedValue: number;
    stackable: boolean;
    minStrength: string;
}

export interface IInnateWeapon {
    name: string;
    damage: string;
    addsStrength: boolean;
    range: string;
    reach: number;
    ap: number;
    rof?: number;
    notes?: string;
    attackProfiles?: IWeaponProfile[];
    parry: number;
    apIsAgilityDie: boolean;
    apIsPsionic: boolean;
    dontStepUnarmedDamage: boolean;
    apIsHalfPsionic: boolean;
    apIsDoublePsionic: boolean;
    apIsSize: boolean;
    apSizeBonus: number;
    equippedPrimary: boolean;
    equippedSecondary: boolean;

    additionalDamage: string,

    tempParry: number;
    tempToHit: number;

    powerID?: number;
    powerPoints?: number;

    damageBoost: number;
    noGlobalDamageAdd: boolean;
}

interface IPowerList {
    name: string;
    abName: string;
    range: string;
    damage: string;
    showRange: string;
    powerPointMod: string;
    duration: string;
    powerPoints: string;
    bookPage: string;
    bookID: number;
    summary: string;
    customDescription: string,
    skillName: string;
    skillValue: string;
}

interface ISpecialAbilitySimple {
    name: string;
    summary: string;
    book_name: string;
    page: string;
    bookID: number;
}

interface IBannedItem {
    name: string;
    from: string;
}

function createEmptyChargenData(): IChargenData {
    return {
        arcane_backgrounds: [],
        armor: [],
        books: [],
        cyberware: [],
        edges: [],
        gear: [],
        hindrances: [],
        powers: [],
        race_abilities: [],
        races: [],
        super_powers_2014: [],
        super_powers_2021: [],
        weapons: [],
        chargen_rifts_tattoos: [],
        settings: [],
        frameworks: [],
        monster_frameworks: [],
        tables: [],
        vehicles: [],
        robot_mods: [],
        bestiary: [],
        gear_enhancements: []
    };
}

function filterAvailableData(
    _availableData: IChargenData,
    registeredOnly: boolean
): IChargenData {
    let data: IChargenData = JSON.parse(JSON.stringify(_availableData));

    if( registeredOnly ) {
        data.books = data.books.filter(
            (a: IBook) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        );

        data.arcane_backgrounds = data.arcane_backgrounds.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.armor = data.armor.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )
        data.cyberware = data.cyberware.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.edges = data.edges.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.frameworks = data.frameworks.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.gear = data.gear.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.hindrances = data.hindrances.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.powers = data.powers.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.race_abilities = data.race_abilities.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.races = data.races.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.robot_mods = data.robot_mods.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.settings = data.settings.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.settings = data.settings.filter(
            (a: IJSONSettingExport) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.wildcard_only == false
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.super_powers_2014 = data.super_powers_2014.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.tables = data.tables.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.vehicles = data.vehicles.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )

        data.weapons = data.weapons.filter(
            (a: any) => {
                if(
                    // a.access_wildcard == true
                    // //     &&
                    a.book_def && a.book_def.access_registered == true
                ) {
                    return true;
                } else {
                    return false;
                }
            }
        )
    }

    return data;

}

export class PlayerCharacter {

    private _promptSpecifyValues: { [index: string]: string } = {};

    wealthDieInitialCalculation: number = 0;
    wealthDieBonus: number = 0;
    name: string = "";
    playerName: string = "";
    gender: string = "";
    age: string = "";
    background: string = "";
    description: string = "";

    gmSessionID: number = 0;
    settingReadOnly: boolean = false;

    image_url: string = "";
    image_updated: Date = new Date();

    additional_statistics: IAdditionalStatistic[] = [];

    saved_token_image: string = "";
    saved_setting_image: string = "";
    saved_image: string = "";

    _equippedInnate: IEquippedInnateItems = {
        primary: "",
        secondary: "",
    }

    _is_aquatic: boolean = false;

    _addedSpecialAbilities: ISpecialAbilitySimple[] = [];

    isSuper: boolean = false;
    _thrownWeaponRangeIncrement: number = 0;

    _bannedEdges: IBannedItem[] = [];
    _bannedABs: IBannedItem[] = [];
    _bannedHindrances: IBannedItem[] = [];

    _bonusesLog: string[] = [];

    _hasArmorEquipped: boolean = false;

    superPowerCostTable: ISPCPowerSetTable[] = [];
    superPowers2014: SuperPower2014[] = [];
    superPowers2021: SuperPower2021[] = [];
    superPowers2014SuperKarma: boolean = false;
    superPowers2014CurrentPowerPoints: number = 0;
    superPowers2014ExtraPowerPoints: number = 0;
    superPowers2014PowerPoints: number = 0;
    addedSuperPowers2014: SuperPower2014[] = [];

    _equippedArmorIsNotHeavyValidation: boolean = false;

    imageTokenURL: string = "";
    imageTokenUpdated: Date = new Date();

    // savedImageURL: string = "";
    // savedImageUpdated: Date = new Date();

    // savedImageTokenURL: string = "";
    // savedImageTokenUpdated: Date = new Date();

    _numberOfArcaneBackgrounds: number = 0;
    _startingSelectedArcaneBackground: number = 0;
    _selectedArcaneBackgrounds: Array<ArcaneBackground | null> = [];
    UUID: string = "";

    raceNameOverride: string = "";

    ETUScholarshipBonus: number = 0;
    ETUMajors: string = "";
    ETUExtracurricularChoice: string = "";

    rangesInYardsOrMeters: boolean = false;
    rangesInFeet: boolean = false;

    _fullConversionBorg: boolean = false;

    chargenValidationErrors: IValidationCounts = {};

    // Extracted modules
    private _validationModule: ValidationModule;
    private _importExportModule: ImportExportModule;
    private _attributeModule: AttributeModule;
    private _skillModule: SkillModule;
    private _equipmentModule: EquipmentModule;
    private _armorToughnessModule: ArmorToughnessModule;
    private _edgeHindranceModule: EdgeHindranceModule;
    private _arcaneModule: ArcaneModule;
    private _superPowerModule: SuperPowerModule;
    private _advancementModule: AdvancementModule;
    private _powerModule: PowerModule;
    private _specialAbilityModule: SpecialAbilityModule;
    private _containerStorageModule: ContainerStorageModule;
    private _displayModule: DisplayModule;
    private _derivedStatsModule: DerivedStatsModule;
    private _factionModule: FactionModule;
    private _languageModule: LanguageModule;
    private _characterInfoModule: CharacterInfoModule;
    private _innateWeaponModule: InnateWeaponModule;
    private _calcOrchestratorModule: CalcOrchestratorModule;
    private _genericExportModule: GenericExportModule;
    private _edgeDataModule: EdgeDataModule;
    private _hindranceDataModule: HindranceDataModule;
    private _legacyPurchaseModule: LegacyPurchaseModule;
    private _purchaseModule: PurchaseModule;
    private _combatModule: CombatModule;
    private _frameworkModule: FrameworkModule;
    private _gearEnhancementModule: GearEnhancementModule;

    // _powerPointEdgeMultiplier: number = 1;
    _newPowersEdgeBonus: number = 0;

    _blockedHindrances: string[] = [];
    _blockedEdges: string[] = [];

    isSubCalcCharacter: boolean = false;

    lastImportError: string | null = null;

    _advancement_precalc: number = 0;
    _advancement_count: number = 0;
    _advancement_bonus: number = 0;
    _xp: number = 0;
    _xp_precalc: number = 0;

    setting: PlayerCharacterSetting;
    last_save_id: number = 0;

    selectedFactions: string[] = [];

    // nativeLanguage: string = "";
    multipleLanguages: string[] = [];
    nativeLanguages: string[] = ["Native"];
    _addedLanguages: string[] = [];

    _availableData: IChargenData;

    _advancements: PlayerCharacterAdvancement[] = [];
    _attributeAssignments: IBaseAttributes = {
        agility: 0,
        smarts: 0,
        spirit: 0,
        strength: 0,
        vigor: 0,
    };

    state = {
        shaken: false,
        stunned: false,
        distracted: false,
        vulnerable: false,
        entangled: false,
        bound: false,
        incapacitated: false,

    }

    pathfinderArmorInterference:{ [index: string]: IPathfinderArmorInterferenceMod } = {}

    deny_race_select: boolean = false;
    professionOrTitle: string = "";

    _armorPurchased: Armor[] = [];
    armorLocations: IArmorLocations = {
        face: [],
        head: [],
        torso: [],
        arms: [],
        legs: [],
    }

    _startingBennies: number = 3;
    _runningDie: number = 2;

    _innateAttacks: IInnateWeapon[] = [];

    _innateAttackObjs: Weapon[] = [];

    _skillSnapShots: ISkillFlatList[][] = [];

    armorValues: IArmorValues = {
        face: 0,
        head: 0,
        torso: 0,
        arms: 0,
        legs: 0,
    }

    armorValuesHeavy: IArmorValues = {
        face: 0,
        head: 0,
        torso: 0,
        arms: 0,
        legs: 0,
    }

    toughnessValues: IToughnessValues = {
        face: "",
        head: "",
        torso: "",
        arms: "",
        legs: "",
    }

    _baseThowingRange = "3/6/12";

    _attributesMin: IBaseAttributes = {
        agility: 1,
        smarts: 1,
        spirit: 1,
        strength: 1,
        vigor: 1,
    };

    _attributesMax: IBaseAttributes = {
        agility: 5,
        smarts: 5,
        spirit: 5,
        strength: 5,
        vigor: 5,
    };

    _attributeCurrent: IBaseAttributes = {
        agility: 0,
        smarts: 0,
        spirit: 0,
        strength: 0,
        vigor: 0,
    };

    _attributeAdvances: IBaseAttributes = {
        agility: 0,
        smarts: 0,
        spirit: 0,
        strength: 0,
        vigor: 0,
    };

    gmSettingShare: string = "";

    _attributeBoosts: IBaseAttributes = {
        agility: 0,
        smarts: 0,
        spirit: 0,
        strength: 0,
        vigor: 0,
    };

    _toughnessModifierList: IToughnessModifier[] = [];

    _CyberneticsProhibited: boolean = false;
    _CyberneticsPsionicsStrainModifier: boolean = false;
    _CyberneticsArcaneStrainModifier: boolean = false;
    _CyberneticsMagicStrainModifier: boolean = false;
    _CyberneticsMiraclesStrainModifier: boolean = false;

    naturalArmorIsHeavy: boolean = false;
    naturalArmor: INaturalArmorList[] = [];

    _basePace: number = 6;

    freePPEPool: number = 0;
    freeISPPool: number = 0;

    createdById: number = 0;
    createdByName: string = "";
    shareURL: string = "";

    createdOn: Date = new Date();
    updatedOn: Date = new Date();
    appVersion: string = "";

    _attributeBonuses: IBaseAttributes = {
        agility: 0,
        smarts: 0,
        spirit: 0,
        strength: 0,
        vigor: 0,
    };

    _traitBonuses: IBaseAttributes = {
        agility: 0,
        smarts: 0,
        spirit: 0,
        strength: 0,
        vigor: 0,
    };

    _traitHardSet: IBaseAttributes = {
        agility: 0,
        smarts: 0,
        spirit: 0,
        strength: 0,
        vigor: 0,
    };

    _attributesBuyCost: IBaseAttributes = {
        agility: 1,
        smarts: 1,
        spirit: 1,
        strength: 1,
        vigor: 1,
    }
    _attributesAdvanceCost: IBaseAttributes = {
        agility: 1,
        smarts: 1,
        spirit: 1,
        strength: 1,
        vigor: 1,
    }

    _derivedBaseBoosts: IDerivedAttributes = {
        pathfinder_armor_interference_mod: 0,
        toughness: 0,
        pace: 0,
        scholarship: 0,
        size: 0,
        parry: 0,
        armor: 0,
        heavy_armor: 0,
        reach: 0,
        starting_funds_multiplier: 1,

        pace_multiplier: 1,
        wealth: 0,

        sanity: 0,

        pace_flying: 0,
        pace_swimming: 0,

        // Deluxe
        charisma: 0,

        // Rippers
        rippers_reason: 0,
        rippers_status: 0,

        wounds: 0,

        // Cyberware
        strain: 0,
    }

    wealthDie: string = "d6";

    _armorStrengthBonus: number = 0;
    _encumbranceStrengthBonus: number = 0;
    _weaponStrengthBonus: number = 0;
    _runningDieOverride: string = "";

    _extraHJRolls: number = 0;
    _oneWithMagicRank: number = 0;

    peoplePlacesThings: IPeoplePlacesThings[];
    skills: Skill[] = [];

    _looseAttributes: ILooseAbility[] = [];
    currentFramework: PlayerCharacterFramework | null = null;
    monsterFramework: PlayerCharacterMonsterFramework | null = null;
    _custom_skills: ISkillListImport[] = [];

    // woundsMax = 3
    fatigueMax = 2
    woundsCurrent = 0
    fatigueCurrent = 0
    woundsPermanent = 0
    fatiguePermanent = 0

    _linguistBoostedSkills: string[] = [];

    race: PlayerCharacterRace;
    _perksSelected: string[] = [];
    _perkPointsCurrent: number = 0;
    _perkPointsExtra: number = 0;
    _perkPointsTotal: number = 0;
    _perkPointsAllocated: number = 0;
    _perkPointsSpent: number = 0;
    _perkPointAdjustment: number = 0;

    _powerRankEquivalentBonus: number = 0;

    _paceOverride: string = "";

    _currentStrain: number = 0;
    _currentRobotMods: number = 0;
    _maxRobotMods: number = 0;
    _maxStrain: number = 0;
    _doubleBaseStrain: boolean = false;
    _halfBaseStrain: boolean = false;

    _currentSkillAllocationPoints: number = 0;
    _currentSmartsSkillAllocationPoints: number = 0;
    _maxSmartsSkillAllocationPoints: number = 0;
    _maxSkillAllocationPoints: number = 0;
    _currentAttributeAllocationPoints: number = 0;
    _maxAttributeAllocationPoints: number = 0;
    _maxAttributeModifier: number = 0;
    _maxEdgesCount: number = 0;

    _hindrancesSelected: Hindrance[] = [];
    _edgesSelected: Edge[] = [];

    _raceAbilitySpecifies: string[] = []
    _raceAbilityAlternativeChoices: number[] = [] // stores selected alternative choice index for each race ability (-1 = default, 0+ = alternative index)
    _advancementEdges: Edge[] = [];

    _hindrancesAdded: Hindrance[] = [];
    _edgesAdded: Edge[] = [];

    _hindrancesCustom: Hindrance[] = [];
    _edgesCustom: Edge[] = [];
    _edgesCustomAdded: Edge[] = [];

    _parryBonusFromShield: number = 0;

    _cannotSwim: boolean = false;

    _skillRequirementAliases: string[][] = [];

    _unarmedDamageStepBonus: number = 0;
    _unarmedDamageAPBonus: number = 0;
    registeredDataOnly: boolean = true;

    _gearPurchased: Gear[] = [];
    _vehiclesPurchased: VehicleEntry[] = [];
    _weaponsPurchased: Weapon[] = [];

    _cyberwarePurchased: Cyberware[] = [];
    _riftsTattoosPurchased: RiftsTattoos[] = [];
    _robotModsPurchased: RobotMod[] = [];
    // _gearCustom: ICustomGearExport[] = [];
    // _armorCustom: ICustomArmorExport[] = [];
    // _weaponsCustom: ICustomWeaponExport[] = [];
    _allies: IBestiaryEntry[] = [];

    _loadCurrent = 0;
    _loadCurrentCombat = 0;
    _loadLimitMultiplier = 1;

    _base_specifies: IJSONBaseSpecify[];

    _wealthBase: number;
    _wealthStarting: number;
    _wealthCurrent: number;
    _startingWealthOverride: number;
    _wealthAdjusted: number;

    _isArtificer: boolean = false;
    _noPowerLimits: boolean = false;
    _ignoreTwoHandsMelee: boolean = false;

    journal: IJournalEntry[];

    validationMessages: IValidationMessage[] = [];
    isValid: boolean = true;
    validLevel: number = 0;
    // raceCustom: IChargenRace | null = null;

    // counts_as_other_race: string[] = [];
    _noSelectAttributes: string[] = [];

    _additionalMeleeDamage: string = "";

    _upgrade_attractive: number = 0;
    _upgrade_luck: number = 0;
    _upgrade_martial_arts: number = 0;
    _upgrade_dirty_fighter: number = 0;
    _upgrade_channeling: number = 0;
    _upgrade_rapid_recharge: number = 0;
    _add_quick_or_level_headed: number = 0;

    _alternateArmorProfiles: IAlternateArmorData[] = [];
    saveID: number = 0;
    isSessionEdit: boolean = false; // used for v3 to see if session needs to be deleted after save

    allowAdvancementTraitAlteration: boolean = false;

    public _addedEdgeOptions: { [index: string]: IChargenEdgeObjectVars[] } = {};
    private _addedHindranceOptions: { [index: string]: IChargenHindranceOptions[] } = {};
    constructor(
        _availableData: IChargenData | null,
        jsonImportString: string = "",
        noCalc: boolean = false,
        gmShareSetting: IJSONSettingExport | null = null,
        registeredOnly: boolean = false,
        // doNotSortData: boolean = false,
    ) {
        // console.log("PlayerCharacter", "constructor", "called", new Date());
        if( gmShareSetting ) {
            registeredOnly = false;
        }

        // noCalc is already a boolean parameter, no need to reassign

        if( _availableData )
            this._availableData = filterAvailableData( _availableData, registeredOnly);
        else
            this._availableData = createEmptyChargenData();

        // this.setting = new PlayerCharacterSetting( null, this, this._availableData );
        // this.race = new PlayerCharacterRace(null, this);

        // if( !doNotSortData )
        //     this._sortData();

        // Initialize extracted modules
        this._validationModule = new ValidationModule(this);
        this._importExportModule = new ImportExportModule(this);
        this._attributeModule = new AttributeModule(this);
        this._skillModule = new SkillModule(this);
        this._equipmentModule = new EquipmentModule(this);
        this._armorToughnessModule = new ArmorToughnessModule(this);
        this._edgeHindranceModule = new EdgeHindranceModule(this);
        this._arcaneModule = new ArcaneModule(this);
        this._superPowerModule = new SuperPowerModule(this);
        this._advancementModule = new AdvancementModule(this);
        this._powerModule = new PowerModule(this);
        this._specialAbilityModule = new SpecialAbilityModule(this);
        this._containerStorageModule = new ContainerStorageModule(this);
        this._displayModule = new DisplayModule(this);
        this._derivedStatsModule = new DerivedStatsModule(this);
        this._factionModule = new FactionModule(this);
        this._languageModule = new LanguageModule(this);
        this._characterInfoModule = new CharacterInfoModule(this);
        this._innateWeaponModule = new InnateWeaponModule(this);
        this._calcOrchestratorModule = new CalcOrchestratorModule(this);
        this._genericExportModule = new GenericExportModule(this);
        this._edgeDataModule = new EdgeDataModule(this);
        this._hindranceDataModule = new HindranceDataModule(this);
        this._legacyPurchaseModule = new LegacyPurchaseModule(this);
        this._purchaseModule = new PurchaseModule(this);
        this._combatModule = new CombatModule(this);
        this._frameworkModule = new FrameworkModule(this);
        this._gearEnhancementModule = new GearEnhancementModule(this);

        this.reset();

        // console.log("New PC");
        if( jsonImportString ) {
            this.jsonImportString( jsonImportString, gmShareSetting, noCalc );
            if (this.lastImportError) {
                console.warn("Character creation with import failed:", this.lastImportError);
                // Continue with character creation even if import fails
            }
        } else {
            // this.UUID = generateUUID();

            if( !noCalc )
                this.calc(false, false);
        }
        // console.log("PlayerCharacter", "constructor", "complete", new Date());
    }

    newUUID() {
        this.UUID = generateUUID();
    }

    public getAvailableData(): IChargenData {
        return this._availableData;
    }

    public getSuperPowers2014MaxPowerPoints(): number {
        // Delegated to SuperPowerModule
        return this._superPowerModule.getSuperPowers2014MaxPowerPoints();
    }

    public getSuperPowers2014CurrentPowerPoints(): number {
        // Delegated to SuperPowerModule
        return this._superPowerModule.getSuperPowers2014CurrentPowerPoints();
    }

    public logNaturalArmor(
        name: string,
        armor: number,
        heavy: boolean
    ) {
        let foundName = name;
        let from: string = "";
        if( name.indexOf(":") > -1) {
            let foundSplit = name.split(":", 2);
            foundName = foundSplit[1].trim();
            from = foundSplit[0].trim();
        }

        for( let item of (this.naturalArmor || []) ) {
            if(
                item.name == foundName
                &&
                from == from
            ) {
                item.armor += armor;
                return;
            }
        }
        this.naturalArmor.push({
            name: foundName,
            from: from,
            armor: armor,
            heavy: heavy,
        })
    }
    public reset() {
        this.UUID = generateUUID();
        this.gmSessionID = 0;
        this.saveID = 0;
        this.settingReadOnly = false;
        this.registeredDataOnly = true;
        this.name = "";
        this.last_save_id = 0;
        this.saved_token_image = "";
        this.saved_image = "";
        this.playerName = "";

        this.allowAdvancementTraitAlteration = false;

        this._is_aquatic = false;

        this.gmSettingShare = "";
        this._equippedInnate = {
            primary: "",
            secondary: "",
        };
        this.wealthDie = "d6";

        this.nativeLanguages = [ this.setting ? this.setting.getNativeLanguageName() : "Native" ];

        this.deny_race_select = false;

        this.additional_statistics = [];

        this._addedHindranceOptions = {};
        this._wealthAdjusted = 0;
        this._runningDieOverride = "";
        this.selectedFactions = [];
        this.background = "";
        this.description = "";
        this.gender = "";
        this.age = "";
        this.professionOrTitle = "";

        this.currentFramework = null;

        this._currentStrain = 0;
        this._currentRobotMods = 0;
        this._doubleBaseStrain = false;
        this._halfBaseStrain = false;

        this.superPowers2014 = [];
        this.addedSuperPowers2014 = [];

        this.naturalArmorIsHeavy = false;
        this.naturalArmor = [];

        this._advancements = [];
        this._xp = 0;
        this._advancement_count = 0;
        this._advancement_bonus = 0;
        this._advancement_precalc = 0;

        // this.nativeLanguage = "Native";
        this.multipleLanguages = [this.setting ? this.setting.getNativeLanguageName() : "Native"];
        this._addedLanguages = [];

        this.peoplePlacesThings  = [];
        this.journal  = [];

        // this.raceCustom = null;
        // this.setting.reset();
        this._base_specifies = [];

        this.setting = new PlayerCharacterSetting(
            null,
            this,
            this._availableData,
            null
        );

        this.race = new PlayerCharacterRace(null, this);
        this.monsterFramework = null;

        this._hindrancesSelected = [];
        this._edgesSelected = [];
        this._edgesCustom = [];
        this._hindrancesCustom = [];
        this._perksSelected = [];

        this._raceAbilitySpecifies = []
        // DO NOT clear _raceAbilityAlternativeChoices - this is user input, not calculated state
        // this._raceAbilityAlternativeChoices = []

        this._selectedArcaneBackgrounds = [];
        this._startingSelectedArcaneBackground = 0;

        this._attributeAssignments = {
            agility: 0,
            smarts: 0,
            spirit: 0,
            strength: 0,
            vigor: 0,
        };

        this._armorPurchased = [];
        this._gearPurchased = [];
        this._weaponsPurchased = [];
        this._cyberwarePurchased = [];
        this._riftsTattoosPurchased = [];
        this._robotModsPurchased = [];
        this._vehiclesPurchased = [];

        this._allies = [];
        this._noSelectAttributes = [];

        this._custom_skills = [];
        // this._armorCustom = [];
        // this._gearCustom = [];
        // this._weaponsCustom = [];
        this._addedEdgeOptions = {};
        this._addedHindranceOptions = {};
        this.resetSkills();
    }

    removeCustomSkill( skillName: string, attribute: string ) {
        for( let skillIndex = 0; skillIndex < this._custom_skills.length; skillIndex++ ) {
            if(
                this._custom_skills[skillIndex].name.trim().toLowerCase() == skillName.toLowerCase().trim()
                    &&
                this._custom_skills[skillIndex].attribute.trim().toLowerCase() == attribute.toLowerCase().trim()
            ) {
                this._custom_skills.splice( skillIndex, 1 );
            }
        }

        for( let skillIndex = 0; skillIndex < this.skills.length; skillIndex++ ) {
            if(
                this.skills
                    &&
                this.skills[skillIndex]
                    &&
                this.skills[skillIndex].name.trim().toLowerCase() == skillName.toLowerCase().trim()
                    &&
                this.skills[skillIndex].attribute.trim().toLowerCase() == attribute.toLowerCase().trim()
            ) {
                this.skills.splice( skillIndex, 1 );
            }
        }
    }

    addCustomSkill( custSkill: ISkillListImport ): boolean {

        let is_knowledge = false;
        if( custSkill.IsKnowledge ) {
            is_knowledge = true;
        }

        if( custSkill.is_knowledge ) {
            is_knowledge = true;
        }

        let is_language = false;
        if( custSkill.Language ) {
            is_language = true;
        }

        if( custSkill.language ) {
            is_language = true;
        }

        let always_language = false;
        if( custSkill.AlwaysLanguage ) {
            always_language = true;
        }

        if( custSkill.always_language ) {
            always_language = true;
        }

        let base_parry = false;
        if( custSkill.base_parry ) {
            base_parry = true;
        }
        let att = "";
        if( custSkill.attribute )
            att = custSkill.attribute.toLowerCase().trim();

        let skillDef: ISkillListImport = {
            name: custSkill.name,
            attribute: att,
            is_knowledge: is_knowledge,
            language: is_language,
            always_language: always_language,
            base_parry: base_parry,
        }

        let findSkill = this.getSkill( custSkill.name );
        if( !findSkill ) {
            this._custom_skills.push( skillDef )
            let newSkill = new Skill( this, skillDef, 0 );
            newSkill.is_custom = true;
            newSkill.bonusValue = 0;
            this.skills.push( newSkill );
            return true;
        }
        return false
    }

    public resetSkills(): void {
        // Delegated to SkillModule
        this._skillModule.resetSkills();
    }

    public banHindrance(name: string, from: string): void {
        // Delegated to EdgeHindranceModule
        this._edgeHindranceModule.banHindrance(name, from);
    }

    public banEdge(name: string, from: string): void {
        // Delegated to EdgeHindranceModule
        this._edgeHindranceModule.banEdge(name, from);
    }

    public banAB( name: string, from: string ): void {
        this._bannedABs.push({
            name: name,
            from: from,
        })
    }

    getToughnessModifiers(): IToughnessModifier[] {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getToughnessModifiers();
    }

    private _calcReset(): void {
        this._calcOrchestratorModule.calcReset();
    }

    public getNativeLanguage(nativeIndex: number): string {
        // Delegated to LanguageModule
        return this._languageModule.getNativeLanguage(nativeIndex);
    }

    public clearSkillBoosts(skillName: string): boolean {
        // Delegated to SkillModule
        return this._skillModule.clearBoosts(skillName);
    }

    public edgeIsAvailable(
        edge: IChargenEdge,
        edgeRequirementsOnly: boolean = false,
    ): boolean {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.edgeIsAvailable(edge, edgeRequirementsOnly);
    }

    public addSkillBoost(
        skillName: string,
        amount: number,
        noMaxRaise: boolean = false,
        nativeLanguageIndex: number = 1,
        isLinguistLanguage: boolean = false,
    ): boolean {
        // Delegated to SkillModule
        return this._skillModule.addBoost(skillName, amount, noMaxRaise, nativeLanguageIndex, isLinguistLanguage);
    }

    public addSkillBoostIfZero(
        skillName: string,
        amount: number,
        noMaxRaise: boolean = false,
        nativeLanguageIndex: number = 1,
        isLinguistLanguage: boolean = false,
    ): boolean {
        // Delegated to SkillModule
        return this._skillModule.addBoostIfZero(skillName, amount, noMaxRaise, nativeLanguageIndex, isLinguistLanguage);
    }

    public forceSkillValue(
        skillName: string,
        amount: number,
        _isNativeLanguage: boolean = false,
        _isLinguistLanguage: boolean = false,
    ): boolean {
        // Delegated to SkillModule
        return this._skillModule.forceValue(skillName, amount, _isNativeLanguage, _isLinguistLanguage);
    }

    public setSkillBoost(
        skillName: string,
        amount: number,
        nativeLanguageIndex: number = -1,
        isLinguistLanguage: boolean = false,
        boostLinkedAttribute: number = 0,
    ): boolean {
        // Delegated to SkillModule
        return this._skillModule.setBoost(skillName, amount, nativeLanguageIndex, isLinguistLanguage, boostLinkedAttribute);
    }

    public addSuperSkillBoost(
        skillName: string,
        amount: number,
    ): boolean {
        // Delegated to SkillModule
        return this._skillModule.addSuperBoost(skillName, amount);
    }

    public addAttributeBonus(
        traitName: string,
        adjMod: number,
        from: string
    ): void {
        this._bonusesLog.push(traitName + " " + (adjMod > 0 ? "+" + adjMod : adjMod) + " from " + from);

        switch(traitName) {
            case "agility": {
                this._attributeBonuses.agility += adjMod;
                break;
            }
            case "smarts": {
                this._attributeBonuses.smarts += adjMod;
                break;
            }
            case "spirit": {
                this._attributeBonuses.spirit += adjMod;
                break;
            }
            case "strength": {
                this._attributeBonuses.strength += adjMod;
                break;
            }
            case "vigor": {
                this._attributeBonuses.vigor += adjMod;
                break;
            }
         }
    }

    public addSkillBonus(
        skillName: string,
        amount: number,
        max: number | null = null,
        from: string,
    ): boolean {
        // Delegated to SkillModule
        return this._skillModule.addBonus(skillName, amount, max, from);
    }

    /**
     * @returns A Skill object based off the skillName and/ skillAttribute if specified. If no skill by that name/attribute combination is found, a null is returned
     */
    public getSkill(
        skillName: string | null,
        skillAttribute: string | null = "",
    ): Skill | null {
        // Delegated to SkillModule
        return this._skillModule.get(skillName, skillAttribute);
    }

    /**
     * @returns A list of Skill objects which are linked to an Arcane background
     */
    getArcaneSkills(): Array<Skill> {
        let rv: Array<Skill> = [];

        for( let ab of this._selectedArcaneBackgrounds ) {
            if( ab && ab.arcaneSkill ) {
                let skill = this.getSkill( ab.arcaneSkill.name, ab.arcaneSkill.attribute );
                if( skill ) rv.push( skill );
            }

        }

        for( let edge of this.getEdgeArcaneBackgrounds() ) {
            if( edge.arcaneBackground && edge.arcaneBackground.arcaneSkill) {
                let skill = this.getSkill( edge.arcaneBackground.arcaneSkill.name, edge.arcaneBackground.arcaneSkill.attribute )
                if( skill ) rv.push( skill );
            }
        }

        return rv;
    }

    /**
     * @param {string}  skillNameString - A skill name
     * @returns {number} This is a die index value of this skill
     */
    getSkillValue(
        skillNameString: string
    ): number {
        let skillName = "";
        let skillSpecify = "";
        if( skillNameString.indexOf("(")  > -1 ) {
            let split = skillNameString.split("(", 2);

            skillName = split[0];
            skillSpecify = replaceAll(split[1], ")", "").trim().toLowerCase();
        } else {
            skillName = skillNameString.trim();
        }

        let skillObj = this.getSkill( skillName );
        if( skillObj ) {
            if( skillSpecify ) {
                for( let specIndex in skillObj.specialties) {
                    if(
                        skillObj.specialties[ specIndex ].name.toLowerCase().trim()
                            ==
                        skillSpecify
                    ) {
                        return skillObj.currentValue(+specIndex)
                    }
                }
            } else {
                return skillObj.currentValue();
            }
        }
        return 0;
    }

    private _isCoreSkill( skillName: string ) {
        if( skillName ) {
            for( let skill of this.setting.coreSkills ) {
                if( skill.toLowerCase().trim() == skillName.trim().toLowerCase() ) {
                    return true;
                }
            }
        }
        return false;
    }

    private _calcGearArmorWeaponEffects() {
        this._calcOrchestratorModule.calcGearArmorWeaponEffects();
    }

    private _calcRiftsTattoos() {
        this._calcOrchestratorModule.calcRiftsTattoos();
    }

    public getEdgeNameById( edgeID: number): string {
        for( let edge of this._availableData.edges ) {
            if( edge.id == edgeID ) {
                return edge.name
            }
        }
        return "n/a";
    }

    private _calcGear(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.calcGear();
    }

    private _calcVehicles(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.calcVehicles();
    }

    private _calRobotMods(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.calcRobotMods();
    }

    private _calcCyberware(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.calcCyberware();
    }

    public noteToughnessSource(
        source: string,
        value: number,
    ): void {
        // Delegated to ArmorToughnessModule
        this._armorToughnessModule.noteToughnessSource(source, value);
    }

    public getEdgeArcaneBackgrounds(): Edge[] {
        // Delegated to ArcaneModule
        return this._arcaneModule.getEdgeArcaneBackgrounds();
    }
    private _calcArmor(): void {
        // Delegated to ArmorToughnessModule
        this._armorToughnessModule.calcArmor();
    }

    public getPowers(): IPowerList[] {
        let rv: IPowerList[] = [];

        for( let ab of this._selectedArcaneBackgrounds ) {
            if( ab ) {
                for( let power of ab.getAllPowers() ) {
                    rv.push( {
                        name: power.getName(),
                        abName: ab.getName(),
                        damage: power.damage,
                        range: power.range,
                        showRange: power.getRange(),
                        duration: power.duration,
                        powerPoints: power.getPowerPoints(),
                        powerPointMod: power.getNoPowerPointModifier(),
                        bookPage: power.getBookPage(),
                        bookID: power.book_id,
                        summary: power.summary,
                        customDescription: power.customDescription,
                        skillName: power.getSkillName(ab),
                        skillValue: power.getSkillValue(this, ab ),
                    })
                }
            }
        }

        for( let edge of this.getAllEdgeObjects() ) {
            let ab = edge.arcaneBackground;
            if( ab ) {
                for( let power of ab.getAllPowers() ) {
                    rv.push( {
                        name: power.getName(),
                        abName: ab.getName(),
                        damage: power.damage,
                        range: power.range,
                        showRange: power.getRange(),
                        duration: power.duration,
                        powerPoints: power.getPowerPoints(),
                        powerPointMod: power.getNoPowerPointModifier(),
                        bookPage: power.getBookPage(),
                        bookID: power.book_id,
                        summary: power.summary,
                        customDescription: power.customDescription,
                        skillName: power.getSkillName(ab),
                        skillValue: power.getSkillValue(this, ab),
                    })
                }
            }
        }

        rv.sort( (a:IPowerList, b: IPowerList): number => {
            if( a.name > b.name ) {
                return 1
            } else if ( a.name < b.name ) {
                return -1
            } else {
                return 0;
            }
        });

        return rv;
    }

    private _calcWeapons(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.calcWeapons();
    }

    private _calcHindrancesAndPerks(): void {
        // Delegated to EdgeHindranceModule
        this._edgeHindranceModule.calcHindrancesAndPerks();
    }

    private _calcCurrentAttributes(): void {
        // Delegated to AttributeModule
        this._attributeModule.calcCurrentAttributes();
    }

    private _calcAttributesAndSkillPoints(): void {
        // Delegated to AttributeModule
        this._attributeModule.calcAttributesAndSkillPoints();
    }

    usesSkillSpecializations(): boolean {
        if(
            this.setting.settingIsEnabled("skillspecialization")
                ||
            this.setting.settingIsEnabled("swade_skillspecialization")

        ) {
            return true;
        }
        return false;
    }

    _decrementSkillPoints( skill: Skill, number: number ) {
        if( skill.attribute == "smarts" && this._currentSmartsSkillAllocationPoints > 0 ) {
            if( number > this._currentSmartsSkillAllocationPoints ) {
                this._currentSkillAllocationPoints -= number - this._currentSmartsSkillAllocationPoints;
                this._currentSmartsSkillAllocationPoints = 0;
            } else {
                this._currentSmartsSkillAllocationPoints -= number;
            }

        } else {
            this._currentSkillAllocationPoints -= number;
        }
    }

    _calcAndApplyEdges(preCalc: boolean = false): void {
        // Delegated to EdgeHindranceModule
        this._edgeHindranceModule.calcAndApplyEdges(preCalc);
    }

    public hasArmorEquipped(): boolean {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.hasArmorEquipped();
    }
    private _trimArcaneBackgrounds(): void {
        // Delegated to ArcaneModule
        this._arcaneModule.trimArcaneBackgrounds();
    }

    private _calcArcaneBackgrounds(): void {
        // Delegated to ArcaneModule
        this._arcaneModule.calcArcaneBackgrounds();
    }

    _calcRace() {
        this._calcOrchestratorModule.calcRace();
    }

    _calcFramework(dontAddEdges: boolean = false) {
        this._calcOrchestratorModule.calcFramework();
    }

    _calcSetting() {
        this._calcOrchestratorModule.calcSetting();
    }

    _createInnateAttackObjs() {
        this._innateWeaponModule.createInnateAttackObjs();
    }

    public clearAdvances() {
        this._advancement_count = 0;
        this._advancement_precalc = 0;
        this._advancements = [];
    }

    public saveAddedEdges() {
        this._saveAddedEdgeOptions();
        this._saveAddedHindranceOptions();
    }

    public hasInnateAttack(name: string): boolean {
        return this._innateWeaponModule.hasInnateAttack(name);
    }

    public calc(
        saveAddedEdges: boolean = false,
        calcLanguages: boolean = true,
    ) {
        this._calcOrchestratorModule.calc(saveAddedEdges, calcLanguages);
    }

    _calcUpgrades() {
        this._calcOrchestratorModule.calcUpgrades();
    }

    _calcInitialWealth() {
        this._calcOrchestratorModule.calcInitialWealth();
    }

    _calcSuperPower2014s() {
        // Delegated to SuperPowerModule
        this._superPowerModule.calcSuperPower2014s();
    }

    _calcAdvancements() {
        // Delegated to AdvancementModule
        this._advancementModule.calcAdvancements();
    }

    getAdvancementCount(): number {
        // Delegated to AdvancementModule
        return this._advancementModule.getAdvancementCount();
    }

    getSelectedAdvancementCount(): number {
        // Delegated to AdvancementModule
        return this._advancementModule.getSelectedAdvancementCount();
    }

    getAdvancementPrecalcCount(): number {
        // Delegated to AdvancementModule
        return this._advancementModule.getAdvancementPrecalcCount();
    }

    resetAdjustedWealth() {
        this._wealthAdjusted = 0;
    }

    _calcFinalAdjustments() {
        this._calcOrchestratorModule.calcFinalAdjustments();
    }

    getMaxWeight(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getMaxWeight();
    }

    getLoadLimit(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getLoadLimit();
    }

    getBaseLoadLimit(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getBaseLoadLimit();
    }

    addValidationMessage(
        validationLevel: ValidityLevel,
        validationMessage: string,
        validationGoURL: string = "",
    ): void {
        this._validationModule.addMessage(validationLevel, validationMessage, validationGoURL);
    }

    addValidationMessageObj(
        validationMessage: IValidationMessage,
        noDuplicates: boolean = false,
    ): void {
        this._validationModule.addMessageObj(validationMessage, noDuplicates);
    }

    private _validate(): void {
        // Delegated to ValidationModule - see modules/ValidationModule.ts
        this._validationModule.validate();
    }


    public getTheBestThereIsPowerLimit(): number {
        return Math.ceil(this.setting.spcPowerPoints / 2);
    }

    public getAvailableSuperPowers2014(ignoreSPCBook: boolean = false): IChargenSuperPower2014[] {
        // Delegated to SuperPowerModule
        return this._superPowerModule.getAvailableSuperPowers2014(ignoreSPCBook);
    }

    public addSuperPower2014(powerID: number): void {
        // Delegated to SuperPowerModule
        this._superPowerModule.addSuperPower2014(powerID);
    }

    public removeSuperPower2014(powerIndex: number): void {
        // Delegated to SuperPowerModule
        this._superPowerModule.removeSuperPower2014(powerIndex);
    }

    public getAvailableSuperPowers2021(ignoreSPCBook: boolean = false): IChargenSuperPower2021[] {
        // Delegated to SuperPowerModule
        return this._superPowerModule.getAvailableSuperPowers2021(ignoreSPCBook);
    }

    public addSuperPower2021(powerID: number): void {
        // Delegated to SuperPowerModule
        this._superPowerModule.addSuperPower2021(powerID);
    }

    public removeSuperPower2021(powerIndex: number): void {
        // Delegated to SuperPowerModule
        this._superPowerModule.removeSuperPower2021(powerIndex);
    }
    public getToughnessValue(withArmor: boolean = false): number {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getToughnessValue(withArmor);
    }

    public getToughnessAndArmor(
        noHeavyLabel: boolean = false,
        addArmor: number = 0,
        addToughness: number = 0,
    ): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getToughnessAndArmor(noHeavyLabel, addArmor, addToughness);
    }

    public getHeavyArmorLabel(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getHeavyArmorLabel();
    }

    public getHeavyWeaponLabel(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getHeavyWeaponLabel();
    }

    public getArmorValue(location: string = "torso"): number {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getArmorValue(location);
    }

    public getArmorValueHR(
        location: string = "torso",
        noHeavyLabel: boolean = false,
        addArmor: number = 0,
    ): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getArmorValueHR(location, noHeavyLabel, addArmor);
    }

    getToughnessHeavyLabel(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getToughnessHeavyLabel();
    }

    public isHeavyArmor(): boolean {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.isHeavyArmor();
    }

    getToughness(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getToughness();
    }

    public getSize(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getSize();
    }

    getSizeHR(): string {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getSizeHR();
    }

    public getDerivedBoost( derived: string ): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getDerivedBoost(derived);
    }

    public knowsPower( powerName: string ): boolean {
        powerName = powerName.toLowerCase().trim();
        for( let ab of this._selectedArcaneBackgrounds) {
            if( ab ) {
                // Use getAllPowers() to get deduplicated power list
                for( let power of ab.getAllPowers() ) {
                    const baseName = power.is_custom ? power.name : power.getBaseName();
                    if( baseName.toLowerCase().trim() == powerName) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    public hasFaction(factionName: string): boolean {
        // Delegated to FactionModule
        return this._factionModule.hasFaction(factionName);
    }

    public addFaction(factionName: string): boolean {
        // Delegated to FactionModule
        return this._factionModule.addFaction(factionName);
    }

    public setFaction(factionName: string): boolean {
        // Delegated to FactionModule
        return this._factionModule.setFaction(factionName);
    }

    public getFactions(): string[] {
        // Delegated to FactionModule
        return this._factionModule.getFactions();
    }

    isInSettingFactions(fac: string): boolean {
        // Delegated to FactionModule
        return this._factionModule.isInSettingFactions(fac);
    }

    public clearFactions(): boolean {
        // Delegated to FactionModule
        return this._factionModule.clearFactions();
    }

    public removeFaction(factionName: string): boolean {
        // Delegated to FactionModule
        return this._factionModule.removeFaction(factionName);
    }

    public toggleFaction(factionName: string): boolean {
        // Delegated to FactionModule
        return this._factionModule.toggleFaction(factionName);
    }

    public getAttributeAssignment( attribute: string ): number {
        if( !attribute ) {
            attribute = "";
        }
        switch( attribute.toString().toLowerCase().trim() ) {
            case "agility": {
                return this._attributeAssignments.agility;
            }
            case "smarts": {
                return this._attributeAssignments.smarts;
            }
            case "spirit": {
                return this._attributeAssignments.spirit;
            }
            case "strength": {
                return this._attributeAssignments.strength;
            }
            case "vigor": {
                return this._attributeAssignments.vigor;
            }
            default: {
                return -1;
            }
        }
    }

    public getAttributeCurrentNoAdvances(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getCurrentNoAdvances(attribute);
    }

    public getAttributeCurrent(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getCurrent(attribute);
    }

    public setAttributeHard(attribute: string, setValue: number): boolean {
        // Delegated to AttributeModule
        return this._attributeModule.setHard(attribute, setValue);
    }

    public getAttributeBaseCurrent(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getBaseCurrent(attribute);
    }

    public getTraitBonusValue( attribute: string ): number {
        if( !attribute ) {
            attribute = "";
        }
        switch( attribute.toString().toLowerCase().trim() ) {
            case "agility": {
                return this._traitBonuses.agility;
            }
            case "smarts": {
                return this._traitBonuses.smarts;
            }
            case "spirit": {
                return this._traitBonuses.spirit;
            }
            case "strength": {
                return this._traitBonuses.strength;
            }
            case "vigor": {
                return this._traitBonuses.vigor;
            }
            case "": {
                return 0;
            }
            default: {
                return -1;
            }
        }
    }

    public getCurrentLoad(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getCurrentLoad();
    }

    public getCurrentCombatLoad(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getCurrentCombatLoad();
    }

    public getCurrentWealth(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getCurrentWealth();
    }

    public getCurrentWealthHR(): string {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getCurrentWealthHR();
    }

    public getAttributeCurrentHR(attribute: string, showBonusText: boolean = false): string {
        // Delegated to AttributeModule
        return this._attributeModule.getCurrentHR(attribute, showBonusText);
    }

    public getAttributeSkills( attribute: string ): Skill[] {
        let exportObj: Skill[] = [];

        if( !attribute ) {
            attribute = "";
        }

        for( let skill of this.skills) {
            if( !skill.attribute ) {
                skill.attribute = ""
            }
            if( skill.attribute.toLowerCase().trim() == attribute.trim().toLowerCase() ) {
                exportObj.push( skill );
            }
        }
        return exportObj;
    }

    public assignAttribute(attribute: string, newValue: number): boolean {
        // Delegated to AttributeModule
        return this._attributeModule.assign(attribute, newValue);
    }

    public getAttributeBoost(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getBoost(attribute);
    }

    public attributeCostToRaise(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getCostToRaise(attribute);
    }

    addTraitBonus(
        attribute: string,
        value: number = 1,
        from: string
    ) {
        switch( attribute.toString().toLowerCase().trim() ) {
            case "agility": {
                return this._traitBonuses.agility += value;
            }
            case "smarts": {
                return this._traitBonuses.smarts += value;
            }
            case "spirit": {
                return this._traitBonuses.spirit += value;
            }
            case "strength": {
                return this._traitBonuses.strength += value;
            }
            case "vigor": {
                return this._traitBonuses.vigor += value;
            }
            default: {
                let skill = this.getSkill(attribute);
                if( skill ) {
                    skill.bonus += value;
                    return skill.bonus;
                } else {
                    console.warn(  "Can't find trait named", attribute, value)
                    return -1;
                }

            }
        }
    }

    boostTrait( attribute: string, value: number = 1 ) {
        switch( attribute.toString().toLowerCase().trim() ) {
            case "agility": {
                return this.boostAttribute("agility", 1)
            }
            case "smarts": {
                return this.boostAttribute("smarts", 1)
            }
            case "spirit": {
                return this.boostAttribute("spirit", 1)
            }
            case "strength": {
                return this.boostAttribute("strength", 1)
            }
            case "vigor": {
                return this.boostAttribute("vigor", 1)
            }
            default: {
                let skill = this.getSkill(attribute);
                if( skill ) {
                    skill.advanceBoostValue += value;
                    return skill.advanceBoostValue;
                } else {
                    console.warn(  "Can't find trait named", attribute, value)
                    return -1;
                }

            }
        }
    }

    public getAttributeBonus(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getBonus(attribute);
    }

    public getAttributeMax(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getMax(attribute);
    }

    public getAttributeMin(attribute: string): number {
        // Delegated to AttributeModule
        return this._attributeModule.getMin(attribute);
    }

    public getAttributePointsMax(): number {
        // Delegated to AttributeModule
        return this._attributeModule.getPointsMax();
    }

    public getAttributePointsCurrent(): number {
        // Delegated to AttributeModule
        return this._attributeModule.getPointsCurrent();
    }

    public getSkillPointsMax(): number {
        // Delegated to SkillModule
        return this._skillModule.getPointsMax();
    }

    public getSkillPointsCurrent(): number {
        // Delegated to SkillModule
        return this._skillModule.getPointsCurrent();
    }

    public getSmartsSkillPointsMax(): number {
        // Delegated to SkillModule
        return this._skillModule.getSmartsPointsMax();
    }

    public getSmartsSkillPointsCurrent(): number {
        // Delegated to SkillModule
        return this._skillModule.getSmartsPointsCurrent();
    }

    public getEdgesSelected(): Edge[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getEdgesSelected();
    }

    public getTotalEdgesSelected(ignoreFreeEdges: boolean = false): Edge[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getTotalEdgesSelected(ignoreFreeEdges);
    }

    public getEdgesAdded(): Edge[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getEdgesAdded();
    }

    public getEdgesSelectMax(): number {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getEdgesSelectMax();
    }

    public getMaxMultipleLanguages(): number {
        // Delegated to LanguageModule
        return this._languageModule.getMaxMultipleLanguages();
    }

    public getAdditionalStatistics(): IAdditionalStatistic[] {
        let rv: IAdditionalStatistic[] = [];

        for( let stat of this.additional_statistics) {
            if( this.setting.hasAdditionalStatistic( stat.name) ) {
                rv.push( stat );
            }
        }

        return rv;
    }

    public setAdditionalStatistics( statName: string, newValue: string): IAdditionalStatistic[] {
        let rv: IAdditionalStatistic[] = [];

        for( let stat of this.additional_statistics) {
            if( statName.toLowerCase().trim() == stat.name.toLowerCase().trim() ) {
                stat.value = newValue;
            }
        }

        return rv;
    }

    public updateLinguistSkillNames(): void {
        // Delegated to SkillModule
        this._skillModule.updateLinguistNames();
    }


    public exportObj(): IJSONPlayerCharacterExport {
        // Delegated to ImportExportModule
        return this._importExportModule.exportObj();
    }

    private _getSkillAssignments(): ISkillAssignmentExport[] {
        // Delegated to ImportExportModule
        return this._importExportModule.getSkillAssignments();
    }

    public jsonExport(): string {
        // Delegated to ImportExportModule
        return this._importExportModule.jsonExport();
    }



    public jsonImportString(
        jsonImportString: string,
        gmShareSetting: IJSONSettingExport | null,
        noCalc: boolean = false,
    ): void {
        if (!jsonImportString || typeof jsonImportString !== 'string') {
            const error = 'Invalid input: JSON import string is required and must be a string';
            console.error("Player Character Import -", error);
            this.lastImportError = error;
            return;
        }

        try {
            const importObj: IJSONPlayerCharacterExport = JSON.parse( jsonImportString );
            this.importObj( importObj, gmShareSetting, noCalc );
            this.lastImportError = null; // Clear any previous error
        }
        catch(err) {
            const error = `Failed to import character data: ${err instanceof Error ? err.message : 'Unknown error'}`;
            console.error("Player Character Import - cannot import data", err);
            this.lastImportError = error;
        }
    }

    public traitsAreReadOnly(
        currentUser: User | null = null,
    ): boolean {
        if( currentUser && currentUser.turnOffAdvanceLimits)
            return false;
        if( this.getSelectedAdvancementCount() > 0 && this.allowAdvancementTraitAlteration == false ) {
            return true;
        }
        return false;
    }
    /**
     * Fixes over-escaped character data that may have been created by repeated JSON.stringify operations
     * Delegated to ImportExportModule
     */
    private fixEscapedCharacterData(data: IJSONPlayerCharacterExport): IJSONPlayerCharacterExport {
        return this._importExportModule.fixEscapedCharacterData(data);
    }

    /**
     * Import character from JSON-compatible object
     * Delegated to ImportExportModule
     */
    public importObj(
        importObj: IJSONPlayerCharacterExport,
        gmShareSetting: IJSONSettingExport | null,
        noCalc: boolean = false,
    ): void {
        this._importExportModule.importObj(importObj, gmShareSetting, noCalc);
    }

    setArcaneBackgroundFromSetting(
        abIndex: number = 0,
        abName: string = "",
    ): boolean | undefined {
        // Delegated to ArcaneModule
        return this._arcaneModule.setArcaneBackgroundFromSetting(abIndex, abName);
    }

    setArcaneBackgroundCustom(
        abIndex: number = 0,
        customABDef: IChargenArcaneBackground | null = null,
        abUUID: string = "",
    ): boolean {
        // Delegated to ArcaneModule
        return this._arcaneModule.setArcaneBackgroundCustom(abIndex, customABDef, abUUID);
    }

    hasABUUID(uuid: string): boolean {
        // Delegated to ArcaneModule
        return this._arcaneModule.hasABUUID(uuid);
    }

    hasPowerUUID(uuid: string): boolean {
        // Delegated to ArcaneModule
        return this._arcaneModule.hasPowerUUID(uuid);
    }

    setArcaneBackgroundById(
        abID: number,
        abIndex: number = 0,
        abUUID: string = "",
    ): boolean {
        // Delegated to ArcaneModule
        return this._arcaneModule.setArcaneBackgroundById(abID, abIndex, abUUID);
    }

    addArcaneBackgroundByName(
        abName: string = "",
        unchangeable: boolean = false,
        incrementStartingPowers: number = 0,
    ): string {
        // Delegated to ArcaneModule
        return this._arcaneModule.addArcaneBackgroundByName(abName, unchangeable, incrementStartingPowers);
    }

    addCustomArcaneBackground(
        abName: string,
        abPowers: number,
        abPoints: number,
        abSkillName: string,
        abSkillAttribute: string,
        abPowerPointsName: string,
        abBookNumber: number = 0,
        abBookPage: string = "",
        applyNow: boolean = false,
    ): string | null {
        // Delegated to ArcaneModule
        return this._arcaneModule.addCustomArcaneBackground(
            abName, abPowers, abPoints, abSkillName,
            abSkillAttribute, abPowerPointsName, abBookNumber, abBookPage, applyNow
        );
    }

    setPowerPointsName(ppName: string, abName: string): void {
        // Delegated to PowerModule
        this._powerModule.setPowerPointsName(ppName, abName);
    }

    setPowerList(powerList: string[], abName: string): void {
        // Delegated to PowerModule
        this._powerModule.setPowerList(powerList, abName);
    }

    setStartingPowerCount(newValue: number, abName: string): void {
        // Delegated to PowerModule
        this._powerModule.setStartingPowerCount(newValue, abName);
    }

    appendPowerList(powerList: string[], abName: string): void {
        // Delegated to PowerModule
        this._powerModule.appendPowerList(powerList, abName);
    }

    public addSpecialAbility(
        name: string,
        summary: string,
        bookName: string,
        bookPage: string,
        bookID: number,
    ): void {
        // Delegated to SpecialAbilityModule
        this._specialAbilityModule.addSpecialAbility(name, summary, bookName, bookPage, bookID);
    }

    setPowerPowerPoints(powerName: string, abName: string, newPPCost: number = 0): boolean {
        // Delegated to PowerModule
        return this._powerModule.setPowerPowerPoints(powerName, abName, newPPCost);
    }

    addPowerByName(powerName: string, abName: string, decrementPowerCount: boolean = false, innatePower: boolean = false, rangeLimitation: string = "", addedManually: boolean = false): boolean {
        // Delegated to PowerModule
        return this._powerModule.addPowerByName(powerName, abName, decrementPowerCount, innatePower, rangeLimitation, addedManually);
    }

    selectPowerByName(powerName: string, abName: string, decrementPowerCount: boolean = false, innatePower: boolean = false, rangeLimitation: string = "", addedManually: boolean = false): boolean {
        // Delegated to PowerModule
        return this._powerModule.selectPowerByName(powerName, abName, decrementPowerCount, innatePower, rangeLimitation, addedManually);
    }

    setMegaPower(powerName: string, abName: string): boolean {
        // Delegated to PowerModule
        return this._powerModule.setMegaPower(powerName, abName);
    }

    addSelectedPower(abIndex: number, findPower: IChargenPowers): boolean {
        // Delegated to PowerModule
        return this._powerModule.addSelectedPower(abIndex, findPower);
    }

    addSelectedPowerByID(abIndex: number, powerID: number): boolean {
        // Delegated to PowerModule
        return this._powerModule.addSelectedPowerByID(abIndex, powerID);
    }

    addCustomPower(abIndex: number, customPower: IChargenPowers, isAdded: boolean = false): boolean {
        // Delegated to PowerModule
        return this._powerModule.addCustomPower(abIndex, customPower, isAdded);
    }

    updateCustomPower(abIndex: number, powerIndex: number, customPower: IChargenPowers): boolean {
        // Delegated to PowerModule
        return this._powerModule.updateCustomPower(abIndex, powerIndex, customPower);
    }

    removeCustomPower(abIndex: number, powerIndex: number): boolean {
        // Delegated to PowerModule
        return this._powerModule.removeCustomPower(abIndex, powerIndex);
    }

    removeSelectedPower(abIndex: number | undefined, powerIndex: number): boolean {
        // Delegated to PowerModule
        return this._powerModule.removeSelectedPower(abIndex, powerIndex);
    }

    /** @deprecated */
    LEGACY_selectPowerByPowerDef(powerDef: ILEGACYJSONPowerExport, abIndex: number = 0): void {
        // Delegated to PowerModule
        this._powerModule.LEGACY_selectPowerByPowerDef(powerDef, abIndex);
    }

    selectPowerByID(powerID: number, powerVars: IChargenPowerVars, abIndex: number = 0): void {
        // Delegated to PowerModule
        this._powerModule.selectPowerByID(powerID, powerVars, abIndex);
    }

    setSkillValue(
        name: string,
        specifyName: string,
        value: number = 1,
        lang: boolean = false,
        nativeLanguageIndex: number = -1,
        isLing: boolean = false,
        calcLang: boolean = false,
    ): void {
        // Delegated to SkillModule
        this._skillModule.setValue(name, specifyName, value, lang, nativeLanguageIndex, isLing, calcLang);
    }

    getPerkPointsCurrent(): number {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getPerkPointsCurrent();
    }

    getHindrancesCustom(): Hindrance[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getHindrancesCustom();
    }

    public getHindrancesAdded(): Hindrance[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getHindrancesAdded();
    }

    getEdgesCustom(): Edge[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getEdgesCustom();
    }

    getPerksSelected(): string[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getPerksSelected();
    }

    getHindrancesSelected(sortByMajorFirst: boolean = false): Hindrance[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getHindrancesSelected(sortByMajorFirst);
    }

    perkInstall(perkKey: string): void {
        // Delegated to EdgeHindranceModule
        this._edgeHindranceModule.perkInstall(perkKey);
    }

    getPerksAvailable(): string[] {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.getPerksAvailable();
    }

    removePerkSelected(perkIndex: number): boolean {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.removePerkSelected(perkIndex);
    }

    removeHindranceInstalled( hindranceIndex: number ) {
        if( this._hindrancesSelected.length > hindranceIndex ) {
            this._hindrancesSelected.splice(hindranceIndex, 1);
            return true;
        }
        return false;
    }

    removeHindranceCustom( hindranceIndex: number ) {
        if( this._hindrancesCustom.length > hindranceIndex ) {
            this._hindrancesCustom.splice(hindranceIndex, 1);
            return true;
        }
        return false;
    }

    removeEdgeInstalled( edgeIndex: number ) {
        if( this._edgesSelected.length > edgeIndex ) {
            if(  this._edgesSelected[edgeIndex].selectedABUUID ) {
                this.removeABByUUID( this._edgesSelected[edgeIndex].selectedABUUID );
            }
            this._edgesSelected.splice(edgeIndex, 1);
            return true;
        }
        return false;
    }

    removeABByUUID( abUUID: string ) {
        for( let abIndex in this._selectedArcaneBackgrounds ) {
            //@ts-ignore
            if(  this._selectedArcaneBackgrounds[abIndex] && this._selectedArcaneBackgrounds[abIndex].uuid == abUUID ) {
                this._selectedArcaneBackgrounds.splice( +abIndex, 1);
                    return true;

            }

        }
        return false;
    }

    removeEdgeCustom( edgeIndex: number ) {
        if( this._edgesCustom.length > edgeIndex ) {
            this._edgesCustom.splice(edgeIndex, 1);
            return true;
        }
        return false;
    }

    addEdgeCustomAdvancement(
        edgeName: string,
        edgeSummary: string,
        edgeEffects: string[],
        isAdded: boolean = false,
    ) {
        let edgeObj = new Edge(null, this, );
        edgeObj.name = edgeName;
        edgeObj.summary = edgeSummary;
        edgeObj.effects = edgeEffects;
        if( isAdded ) {
            this._edgesCustomAdded.push(
                edgeObj
            );
        } else {
            this._edgesCustom.push(
                edgeObj
            );
        }

        return true;
    }

    addEdgeCustom(
        edgeDef: IChargenEdge,
        isAdded: boolean = false,
        readOnly: boolean = false,
        settingItem: boolean = false,
    ) {
        let edge = new Edge( edgeDef, this, );
        edge.setting_item = settingItem;
        edge.isSelectedEdge = true;
        if( settingItem )
            edge.uuid = edgeDef.uuid;
        edge.is_custom = true;
        edge.readOnly = readOnly;
        if( isAdded ) {
            this._edgesCustomAdded.push(
                edge
            );
        } else {
            this._edgesCustom.push(
                edge
            );
        }

        return true;
    }

    saveEdgeCustom(
        edgeIndex: number,
        edgeDef: IChargenEdge,
    ) {
        if( this._edgesCustom.length > edgeIndex && this._edgesCustom[edgeIndex] ) {
            this._edgesCustom[edgeIndex] = new Edge( edgeDef, this,  );
            return true;
        }
        return false;
    }

    addHindranceCustom(
        hindranceDef: IChargenHindrance,
        readOnly: boolean = false,
        settingItem: boolean = false,
    ) {
        let hind = new Hindrance( hindranceDef, this );
        hind.setting_item = settingItem;
        hind.readOnly = readOnly;
        hind.is_custom = true;

        this._hindrancesCustom.push(
            hind
        );
        return true;
    }

    saveHindranceCustom(
        hindIndex: number,
        hindranceDef: IChargenHindrance
    ) {
        if( this._hindrancesCustom.length > hindIndex && this._hindrancesCustom[hindIndex] ) {
            this._hindrancesCustom[hindIndex] = new Hindrance( hindranceDef, this,  );
            return true;
        }
        return false;
    }

    updateHindranceCustomSpecifyText( hindranceIndex: number, newValue: string ) {
        if( this._hindrancesCustom.length > hindranceIndex && this._hindrancesCustom[hindranceIndex] ) {
            this._hindrancesCustom[hindranceIndex].specify = newValue;
            return true;
        }
        return false;
    }

    updateAddedHindranceSpecifyText( hindranceIndex: number, newValue: string ) {
        if( this._hindrancesAdded.length > hindranceIndex && this._hindrancesAdded[hindranceIndex] ) {
            this._hindrancesAdded[hindranceIndex].specify = newValue;
            this._saveAddedHindranceOptions();
            return true;
        }
        return false;
    }
    updateHindranceSpecifyText( hindranceIndex: number, newValue: string ) {
        if( this._hindrancesSelected.length > hindranceIndex && this._hindrancesSelected[hindranceIndex] ) {
            this._hindrancesSelected[hindranceIndex].specify = newValue;
            return true;
        }
        return false;
    }

    updateEdgeSpecifyText( edgeIndex: number, newValue: string ) {
        if( this._edgesSelected.length > edgeIndex && this._edgesSelected[edgeIndex] ) {
            this._edgesSelected[edgeIndex].specify = newValue;
        }
        return false;
    }

    updateHindranceMajor( hindranceIndex: number, newValue: boolean ) {
        if( this._hindrancesSelected.length > hindranceIndex && this._hindrancesSelected[hindranceIndex] ) {
            this._hindrancesSelected[hindranceIndex].major = newValue;
            return true;
        }
        return false;
    }

    updateHindranceCustomMajor( hindranceIndex: number, newValue: boolean ) {
        if( this._hindrancesCustom.length > hindranceIndex && this._hindrancesCustom[hindranceIndex] ) {
            this._hindrancesCustom[hindranceIndex].major = newValue;
            return true;
        }
        return false;
    }

    hindranceAdd(
        hindranceID: number,
        hindranceSpecify: string | null,
        isMajor: boolean,
        addedFrom: string = "",
    ): Hindrance | boolean {
        for( let hindranceDef of this._availableData.hindrances) {

            if( hindranceDef.id == hindranceID ) {

                let insertHindrance = new Hindrance(
                    hindranceDef,
                    this,
                );
                if( hindranceSpecify ) {
                    insertHindrance.specify = hindranceSpecify;
                }
                if( isMajor && hindranceDef.minor_or_major) {
                    insertHindrance.major = true;
                }

                insertHindrance.addedFrom = addedFrom;
                this._hindrancesAdded.push(
                    insertHindrance
                );
                return insertHindrance;
            }
        }
        return false;
    }

    hindranceInstall(
        hindranceID: number,
        hindranceSpecify: string | null,
        isMajor: boolean,
    ): boolean {
        for( let hindranceDef of this._availableData.hindrances) {

            if( hindranceDef.id == hindranceID ) {

                let insertHindrance = new Hindrance(
                    hindranceDef,
                    this,
                );
                if( hindranceSpecify ) {
                    insertHindrance.specify = hindranceSpecify;
                }
                if( isMajor ) {
                    insertHindrance.major = true;
                }
                this._hindrancesSelected.push(
                    insertHindrance
                );
                return true;
            }
        }
        return false;
    }

    edgeInstall(
        edgeID: number,
        edgeOptions: IChargenEdgeObjectVars | null = null,
    ) {
        for( let edgeDef of this._availableData.edges) {

            if( edgeDef.id == edgeID ) {
                let insertEdge = new Edge(
                    edgeDef,
                    this,
                );

                if( edgeOptions)
                    insertEdge.importOptions( edgeOptions );

                insertEdge.isSelectedEdge = true;
                this._edgesSelected.push(
                    insertEdge
                );
            }
        }
    }

    addInnateWeapon(weaponStringModline: string) {
        this._innateWeaponModule.addInnateWeapon(weaponStringModline);
    }

    _getInnateWeaponLine(attack: IInnateWeapon): string {
        return this._innateWeaponModule.getInnateWeaponLine(attack);
    }

    _getInnateWeaponDamage(attack: IInnateWeapon): string {
        return this._innateWeaponModule.getInnateWeaponDamage(attack);
    }

    hindranceAddByName(
        hindranceName: string,
        hindranceSpecify: string = "",
        setMajor: boolean = false,
        addedFrom: string = "",
        specifyReadOnly: boolean = false,
        applyImmediately: boolean = false,
    ): boolean {
        return this._hindranceDataModule.hindranceAddByName(
            hindranceName,
            hindranceSpecify,
            setMajor,
            addedFrom,
            specifyReadOnly,
            applyImmediately,
        );
    }

    addEdgeByNameAndApply(
        edgeName: string,
        edgeSpecify: string = "",
        addedFrom: string = "",
        noApply: boolean = false,
        applyToArcaneBackground: string = "",

    ){
        this.edgeAddByName(
            edgeName,
            edgeSpecify,
            addedFrom,
            noApply,
            applyToArcaneBackground,
            true,
        )
    }

    makeEdgeObjNamed(
        edgeName: string,
        edgeSpecify: string = "",
        addedFrom: string = "",
        noApply: boolean = false,
        applyToArcaneBackground: string = "",
        applyImmediately: boolean = false,
        skillSpecify: string = "",
    ): Edge | null {
        return this._edgeDataModule.makeEdgeObjNamed(
            edgeName,
            edgeSpecify,
            addedFrom,
            noApply,
            applyToArcaneBackground,
            applyImmediately,
            skillSpecify,
        );
    }

    edgeAddByName(
        edgeName: string,
        edgeSpecify: string = "",
        addedFrom: string = "",
        noApply: boolean = false,
        applyToArcaneBackground: string = "",
        applyImmediately: boolean = false,
        skillSpecify: string = "",
    ): boolean {
        return this._edgeDataModule.edgeAddByName(
            edgeName,
            edgeSpecify,
            addedFrom,
            noApply,
            applyToArcaneBackground,
            applyImmediately,
            skillSpecify,
        );
    }

    edgeAddByNameOrId(
        edgeName: string,
        edgeSpecify: string = "",
        addedFrom: string = "",
        noApply: boolean = false,
        applyToArcaneBackground: string = "",
        applyImmediately: boolean = false,
        skillSpecify: string = "",
    ): boolean {
        return this._edgeDataModule.edgeAddByNameOrId(
            edgeName,
            edgeSpecify,
            addedFrom,
            noApply,
            applyToArcaneBackground,
            applyImmediately,
            skillSpecify,
        );
    }

    edgeAdd(
        edgeID: number,
        edgeSpecify: string | null,
        addedFrom: string = "",
        applyImmediately: boolean = false,
    ): boolean {
        return this._edgeDataModule.edgeAdd(edgeID, edgeSpecify, addedFrom, applyImmediately);
    }

    public getSpecialAbilitiesList(
        includeFramework: boolean = true,
        suppressHumanAdatpable: boolean = false
    ): ISpecialAbilityItem[] {
        // Delegated to SpecialAbilityModule
        return this._specialAbilityModule.getSpecialAbilitiesList(includeFramework, suppressHumanAdatpable);
    }

    public getNoticeSkillValueHR(): string {
        let noticeSkill = this.getSkill("Notice");
        if( noticeSkill ) {
            return noticeSkill.currentValueHR();
        }
        return "-"
    }

    public getRaceAndGender(): string {
        // Delegated to CharacterInfoModule
        return this._characterInfoModule.getRaceAndGender();
    }

    public getAge(): string {
        // Delegated to CharacterInfoModule
        return this._characterInfoModule.getAge();
    }

    public getRaceAndProfession(): string {
        // Delegated to CharacterInfoModule
        return this._characterInfoModule.getRaceAndProfession();
    }

    public getWealthDie(): string {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getWealthDie();
    }

    public getRaceGenderAndProfession(): string {
        // Delegated to CharacterInfoModule
        return this._characterInfoModule.getRaceGenderAndProfession();
    }

    public exportHTML(hideImage: boolean = false): string {
        // Delegated to DisplayModule
        return this._displayModule.exportHTML(hideImage);
    }

    public getAdvances( all: boolean = false ) {

        let advances: PlayerCharacterAdvancement[] = [];
        let advCounter = 0;
        for( let adv of this._advancements ) {
            if(
                adv
                &&
                (
                    all
                        ||
                    advCounter < this.getAdvancementCount()
                )
            ) {
                advances.push (adv )
            }
            advCounter++;
        }

        return advances;
    }

    public noPowerPoints(): boolean {
        if( this.setting.settingIsEnabled("nopowerpoints") ) {
            return true;
        }
        if( this.setting.settingIsEnabled("swade_nopowerpoints") ) {
            return true;
        }
        return false;
    }

    getStartingBennies(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getStartingBennies();
    }

    getTattleTaleHTML(): string {
        // Delegated to DisplayModule
        return this._displayModule.getTattleTaleHTML();
    }

    getCharisma(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getCharisma();
    }

    getRippersReason(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getRippersReason();
    }

    getRippersStatus(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getRippersStatus();
    }

    getPace(): string {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getPace();
    }

    getPaceFlying(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getPaceFlying();
    }

    getPaceSwimming(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getPaceSwimming();
    }

    hasAlternateSwimmingPace(): boolean {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.hasAlternateSwimmingPace();
    }

    getParry(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getParry();
    }

    getParryHR(): string {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getParryHR();
    }

    getShieldParryBonus(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getShieldParryBonus();
    }

    _getActiveSkillLine(): string {
        let rv = "";
        let activeSkills = this.activeSkillNamesAndValues();
        if( activeSkills.length > 0 ) {

            let isFirst = true;
            for( let skill of activeSkills ) {
                if( !isFirst ) {
                    rv += ", ";
                }
                isFirst = false;
                rv += getDisplayText(skill.name) + " " + skill.value;
                if( skill.specializations.length > 0 ) {
                    rv += " [";
                    // Ultra-aggressive fix for escaped specializations
                    const cleanSpecializations = skill.specializations.map(spec => {
                        let cleanSpec = getDisplayText(spec);
                        // Additional cleanup for deeply nested escapes that might remain
                        if (cleanSpec && cleanSpec.includes('\\') && cleanSpec.length > 50) {
                            // If it's still very long and has escapes, extract the real content
                            const match = cleanSpec.match(/[A-Za-z\s]+/);
                            if (match && match[0]) {
                                cleanSpec = match[0].trim();
                            }
                        }
                        return cleanSpec;
                    });
                    rv += cleanSpecializations.join(", ")
                    rv += "]"
                }
            }
        }

        return rv;
    }

    activeSkillNamesAndValues(): ISkillListItem[] {
        let rv: ISkillListItem[] = [];

        for( let skill of this.skills ) {

            if( skill.currentValue() > 0 && !skill.isKnowledge ) {
                rv.push(
                    {
                        name: getDisplayText(skill.name),
                        value: skill.currentValueHR(-1, true),
                        baseDie: skill.currentValueHR(),
                        bonus: skill.bonusValue,
                        specializations: skill.getAllSpecializations().map(spec => {
                            let cleanSpec = getDisplayText(spec);
                            // Additional cleanup for deeply nested escapes that might remain
                            if (cleanSpec && cleanSpec.includes('\\') && cleanSpec.length > 50) {
                                // If it's still very long and has escapes, extract the real content
                                const match = cleanSpec.match(/[A-Za-z\s]+/);
                                if (match && match[0]) {
                                    cleanSpec = match[0].trim();
                                }
                            }
                            return cleanSpec;
                        }),
                    }
                );
            }

            for( let specIndex in skill.specialties ) {

                if( skill.currentValue(+specIndex) > 0 ) {
                    if( skill.specialties[+specIndex].nativeLanguageIndex > -1 && this.setting.hideNativeLanguage ) {
                        // don't push native language if hide native language setting is true
                    } else {
                        rv.push(
                            {
                                name: getDisplayText(skill.name) + " (" + (() => {
                                    let cleanSpecName = getDisplayText(skill.specialties[+specIndex].name);
                                    // Additional cleanup for deeply nested escapes that might remain
                                    if (cleanSpecName && cleanSpecName.includes('\\') && cleanSpecName.length > 50) {
                                        // If it's still very long and has escapes, extract the real content
                                        const match = cleanSpecName.match(/[A-Za-z\s]+/);
                                        if (match && match[0]) {
                                            cleanSpecName = match[0].trim();
                                        }
                                    }
                                    return cleanSpecName;
                                })() + ")",
                                value: skill.currentValueHR(+specIndex, true),
                                baseDie: skill.currentValueHR(+specIndex),
                                bonus: skill.bonusValue,
                                specializations: [],
                            }
                        );
                    }

                }
            }
        }

        rv.sort(
            function(a: ISkillListItem, b: ISkillListItem) {
                if( a.name < b.name ) {
                    return -1;
                } else if( a.name > b.name ) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );

        return rv;
    }

    getAllHindrancesNames( hideHidden = false ): string[] {
        let rv: string[] = [];

        for( let hind of this._hindrancesSelected ) {
            if( hind.removed == false ) {
                if( !hideHidden || (hideHidden && !hind.hiddenOnCharacterSheet ) ) {
                    rv.push( hind.getName(false, true) )
                }
            }
        }

        for( let hind of this._hindrancesAdded ) {
            if( hind.removed == false ) {
                if( !hideHidden || (hideHidden && !hind.hiddenOnCharacterSheet ) ) {
                    rv.push( hind.getName(false, true) )
                }

            }
        }

        for( let hind of this._hindrancesCustom ) {
            if( hind.removed == false ) {
                if( !hideHidden || (hideHidden && !hind.hiddenOnCharacterSheet ) ) {
                    rv.push( hind.getName(false, true) );
                }
            }
        }

        rv.sort();

        return rv;
    }

    getAllHindrancesData(hideHidden = false): IHindranceData[] {
        return this._hindranceDataModule.getAllHindrancesData(hideHidden);
    }

    getAllEdgeObjects(): Edge[] {
        return this._edgeDataModule.getAllEdgeObjects();
    }

    getAdvancementEdges(): Edge[] {
        // Delegated to AdvancementModule
        return this._advancementModule.getAdvancementEdges();
    }

    getAllEdges(
        hideImprovedEdgeRequirements: boolean = false,
        includeSpecify: boolean = true,
        hideHidden: boolean = false,
    ): string[] {
        return this._edgeDataModule.getAllEdges(hideImprovedEdgeRequirements, includeSpecify, hideHidden);
    }

    getAllEdgesData(
        hideImprovedEdgeRequirements: boolean = false,
        initialOnly: boolean = false,
        hideHidden: boolean = false,
    ): IEdgeData[] {
        return this._edgeDataModule.getAllEdgesData(hideImprovedEdgeRequirements, initialOnly, hideHidden);
    }

    getBBCode(usePercentages: boolean = false): string {
        // Delegated to DisplayModule
        return this._displayModule.getBBCode(usePercentages);
    }

    getMakrdown(): string {
        // Delegated to DisplayModule
        return this._displayModule.getMakrdown();
    }

    getPlainText(): string {
        // Delegated to DisplayModule
        return this._displayModule.getPlainText();
    }

    _getHindranceLine(): string {
        let hindranceNames = this.getAllHindrancesNames( true );
        // Fix escaped characters for display
        const cleanHindranceNames = hindranceNames.map(name => getDisplayText(name));
        let rv: string = cleanHindranceNames.join(", ");

        return rv;
    }

    _getEdgesLine(): string {
        let edgeNames = this.getAllEdges(true, true, true);
        // Fix escaped characters for display
        const cleanEdgeNames = edgeNames.map(name => getDisplayText(name));
        let rv: string = cleanEdgeNames.join(", ");

        return rv;
    }

    _getAttributesLine(): string {
        let rv: string = "";
        let attributes: string[] = [
            "Agility", "Smarts", "Spirit", "Strength", "Vigor"
        ];

        let isFirst = true;
        for( let att of attributes ) {
            if( !isFirst ) {
                rv += ", ";
            }
            rv += att + " " + this.getAttributeCurrentHR( att.toLowerCase(), true );
            isFirst = false;
        }
        return rv;
    }

    purchaseArmor(
        itemID: number,
        itemDef: IChargenArmor | null = null,
        itemOptions: IArmorObjectVars | null = null,
    ) {
        // Delegated to PurchaseModule
        return this._purchaseModule.purchaseArmor(itemID, itemDef, itemOptions);
    }

    LEGACYPurchaseArmor(
        armorID: number,
        armorDef: IChargenArmor | null,
        buyCost: number,
        equippedArmor: boolean,
        equippedPrimary: boolean,
        equippedSecondary: boolean,
        equippedScreen: boolean,
        quantity: number,
        uuid: string,
        settingItem: boolean,
        selectedMode: number = -1,
        frameworkItem: boolean = false,
        objVars: IArmorObjectVars | null = null,
    ) {
        return this._legacyPurchaseModule.LEGACYPurchaseArmor(
            armorID,
            armorDef,
            buyCost,
            equippedArmor,
            equippedPrimary,
            equippedSecondary,
            equippedScreen,
            quantity,
            uuid,
            settingItem,
            selectedMode,
            frameworkItem,
            objVars,
        );
    }

    setNativeLanguage(newValue: string, nativeIndex: number = 0): void {
        // Delegated to LanguageModule
        this._languageModule.setNativeLanguage(newValue, nativeIndex);
    }

    getLanguages(): string[] {
        // Delegated to LanguageModule
        return this._languageModule.getLanguages();
    }

    public addLanguage(nv: string): void {
        // Delegated to SkillModule
        this._skillModule.addLanguage(nv);
    }

    public getPathfinderCurrentArmorLevel(): number {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getPathfinderCurrentArmorLevel();
    }

    public getPathfinderCurrentArmorLevelHR(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getPathfinderCurrentArmorLevelHR();
    }

    public getPathfinderEffectiveCurrentArmorLevel(): number {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getPathfinderEffectiveCurrentArmorLevel();
    }

    public getPathfinderEffectiveCurrentArmorLevelHR(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getPathfinderEffectiveCurrentArmorLevelHR();
    }

    purchaseGear(
        itemID: number,
        itemDef: IChargenGear | null,
        itemOptions: IGearObjectVars | null = null,
    ) {
        // Delegated to PurchaseModule
        return this._purchaseModule.purchaseGear(itemID, itemDef, itemOptions);
    }

    LEGACYPurchaseGear(
        gearID: number,
        gearDef: IChargenGear | null,
        buyCost: number,
        equippedPrimary: boolean,
        equippedSecondary: boolean,
        quantity: number,
        contains: IContainerItemExport[],
        droppedInCombat: boolean,
        equipped: boolean = false,
        settingItem: boolean = false,
        frameworkItem: boolean = false,
        objVars: IGearObjectVars | null = null,
        addInitialItems: boolean = false,
    ) {
        return this._legacyPurchaseModule.LEGACYPurchaseGear(
            gearID,
            gearDef,
            buyCost,
            equippedPrimary,
            equippedSecondary,
            quantity,
            contains,
            droppedInCombat,
            equipped,
            settingItem,
            frameworkItem,
            objVars,
            addInitialItems,
        );
    }

    purchaseVehicle(
        itemID: number,
        itemDef: IVehicleEntry | null,
        itemOptions: IVehicleObjectVars | null = null,
    ) {
        // Delegated to PurchaseModule
        return this._purchaseModule.purchaseVehicle(itemID, itemDef, itemOptions);
    }

    // DEPRECATED_purchaseVehicle(
    //     vehicleID: number,
    //     vehicleDef: IVehicleEntry | null,
    //     buyCost: number,
    //     contains: IContainerItemExport[],
    //     uuid: string = "",
    //     settingItem: boolean = false,
    //     frameworkItem: boolean = false,
    // ) {
    //     if( vehicleID == 0 && vehicleDef ) {
    //         // Custom Vehicle
    //         let insertVehicle = new VehicleEntry( vehicleDef, this );

    //         if( buyCost !== null && buyCost > -1 && buyCost != vehicleDef.cost ) {
    //             insertVehicle.buy_cost = buyCost;
    //         } else {
    //             insertVehicle.buy_cost = vehicleDef.cost;
    //         }

    //         for( let item of contains ) {
    //             if( !item.count_current ) {
    //                 item.count_current = 1;
    //             }
    //             if( !item.total_weight ) {
    //                 item.total_weight = item.weight;
    //             }
    //         }

    //         insertVehicle.setting_item = settingItem;
    //         if( settingItem ) {
    //             insertVehicle.is_custom = false;
    //         }

    //         insertVehicle.framework_item = frameworkItem;
    //         insertVehicle.contains = contains;
    //         if( uuid )
    //             insertVehicle.uuid = uuid;

    //         this._vehiclesPurchased.push(
    //             insertVehicle
    //         );
    //         return true;

    //     } else {
    //         // Standard Vehicle

    //         for( let vehDef of this._availableData.vehicles) {

    //             if( vehDef.id === vehicleID ) {

    //                 let insertVehicle = new VehicleEntry(
    //                     vehDef,
    //                     this,
    //                 );

    //                 if( buyCost !== null && buyCost > -1 && buyCost != vehDef.cost ) {
    //                     insertVehicle.buy_cost = buyCost;
    //                 } else {
    //                     insertVehicle.buy_cost = vehDef.cost;
    //                 }

    //                 for( let item of contains ) {
    //                     if( !item.count_current ) {
    //                         item.count_current = 1;
    //                     }

    //                     if( !item.total_weight ) {
    //                         item.total_weight = item.weight;
    //                     }

    //                 }

    //                 insertVehicle.framework_item = frameworkItem;
    //                 insertVehicle.contains = contains;
    //                 insertVehicle.is_custom = false;
    //                 if( uuid )
    //                     insertVehicle.uuid = uuid;
    //                 this._vehiclesPurchased.push(
    //                     insertVehicle
    //                 );
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    getSelectedWeaponByUUIDOrName( uuidOrName: string ): Weapon | null {

        for( let weapon of this._weaponsPurchased) {
            if( weapon.uuid == uuidOrName ) {
                return weapon;
            }
        }

        for( let weapon of this._weaponsPurchased) {
            if( weapon.name.toLowerCase().trim() == uuidOrName.toLowerCase().trim() ) {
                return weapon;
            }
        }

        for( let weapon of this._innateAttackObjs) {
            if(
                weapon.name.toLowerCase().trim().indexOf( uuidOrName.toLowerCase().trim() ) > -1
            ) {
                return weapon;
            }
        }

        return null;
    }

    getSelectedWeaponByUUIDOrNames( uuidOrName: string ): Weapon[] {
        let returnItems: Weapon[] = [];
        for( let weapon of this._weaponsPurchased) {
            if( weapon.uuid == uuidOrName ) {
                returnItems.push(weapon);
            }
        }

        for( let weapon of this._weaponsPurchased) {
            if( weapon.name.toLowerCase().trim() == uuidOrName.toLowerCase().trim() ) {
                returnItems.push(weapon);
            }
        }

        for( let weapon of this._innateAttackObjs) {
            if(
                weapon.name.toLowerCase().trim().indexOf( uuidOrName.toLowerCase().trim() ) > -1
            ) {
                returnItems.push(weapon);
            }
        }

        return returnItems;
    }

    purchaseRobotMod(
        itemID: number,
        itemDef: IChargenRobotMod | null,
        itemOptions: IRobotModObjectVars | null = null,
    ) {
        // Delegated to PurchaseModule
        return this._purchaseModule.purchaseRobotMod(itemID, itemDef, itemOptions);
    }

    purchaseCyberware(
        itemID: number,
        itemDef: IChargenCyberware | null,
        itemOptions: ICyberwareObjectVars | null = null,
    ) {
        // Delegated to PurchaseModule
        return this._purchaseModule.purchaseCyberware(itemID, itemDef, itemOptions);
    }

    purchaseRiftsTattoo(
        itemID: number,
        itemDef: IChargenRiftsTattoo | null,
        itemOptions: IRiftsTattoosObjectVars | null = null,
    ) {
        // Delegated to PurchaseModule
        return this._purchaseModule.purchaseRiftsTattoo(itemID, itemDef, itemOptions);
    }

    // DEPRECATED_purchaseCyberware(
    //     cyberwareID: number,
    //     cyberwareDef: IChargenCyberware | null,
    //     buyCost: number,
    //     selectedAttribute: string = "",
    //     selectedSkill: string = "",
    //     selectedTrait: string = "",
    //     selectedEdge: string = "",
    //     ranks: number = 1,
    //     customName: string = "",
    //     selectedMeleeWeaponUUID: string = "",
    //     selectedRangedWeaponUUID: string = "",
    //     quantity: number,
    //     frameworkItem: boolean = false,
    //     settingItem: boolean = false,
    // ) {
    //     if( cyberwareID == 0 && cyberwareDef ) {
    //         // Custom Cyberware
    //         let insertCyberware = new Cyberware( cyberwareDef, this, );

    //         if( buyCost !== null && buyCost > -1 && buyCost != cyberwareDef.cost ) {
    //             insertCyberware.buyCost = buyCost;
    //         } else {
    //             insertCyberware.buyCost = cyberwareDef.cost;
    //         }

    //         insertCyberware.quantity = quantity;

    //         insertCyberware.frameworkItem = frameworkItem;
    //         insertCyberware.selectedAttribute = selectedAttribute;
    //         insertCyberware.selectedSkill = selectedSkill;
    //         insertCyberware.selectedTrait = selectedTrait;
    //         insertCyberware.selectedEdge = selectedEdge;
    //         insertCyberware.setting_item = settingItem;
    //         insertCyberware.ranks = ranks;
    //         if( customName )
    //             insertCyberware.customName = customName;

    //         insertCyberware.selectedMeleeWeaponUUID = selectedMeleeWeaponUUID;
    //         insertCyberware.selectedRangedWeaponUUID = selectedRangedWeaponUUID;

    //         this._cyberwarePurchased.push(
    //             insertCyberware
    //         );
    //         this.sortCyberware();
    //         return true;

    //     } else {
    //         // Standard Cyberware

    //         for( let cyberwareDef of this._availableData.cyberware) {

    //             if( cyberwareDef.id == cyberwareID ) {
    //                 let insertCyberware = new Cyberware(
    //                     cyberwareDef,
    //                     this,
    //                 );

    //                 if( buyCost !== null && buyCost > -1 && buyCost != cyberwareDef.cost ) {
    //                     insertCyberware.buyCost = buyCost;
    //                 } else {
    //                     insertCyberware.buyCost = cyberwareDef.cost;
    //                 }

    //                 insertCyberware.frameworkItem = frameworkItem;
    //                 insertCyberware.quantity = quantity;
    //                 insertCyberware.selectedAttribute = selectedAttribute;
    //                 insertCyberware.selectedSkill = selectedSkill;
    //                 insertCyberware.selectedTrait = selectedTrait;
    //                 insertCyberware.selectedEdge = selectedEdge;
    //                 insertCyberware.setting_item = settingItem;
    //                 insertCyberware.ranks = ranks;
    //                 if( customName )
    //                     insertCyberware.customName = customName;
    //                 insertCyberware.selectedMeleeWeaponUUID = selectedMeleeWeaponUUID;
    //                 insertCyberware.selectedRangedWeaponUUID = selectedRangedWeaponUUID;

    //                 this._cyberwarePurchased.push(
    //                     insertCyberware
    //                 );
    //                 this.sortCyberware();
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    // DEPRECATED_purchaseRiftsTattoos(
    //     rifts_tattoosID: number,
    //     rifts_tattoosDef: IChargenRiftsTattoo | null,
    //     buyCost: number,
    //     selectedAttribute: string = "",
    //     selectedSkill: string = "",
    //     selectedTrait: string = "",
    //     selectedEdge: string = "",
    //     ranks: number = 1,
    //     customName: string = "",
    //     selectedMeleeWeaponUUID: string = "",
    //     selectedRangedWeaponUUID: string = "",
    //     quantity: number,
    //     frameworkItem: boolean = false,
    //     settingItem: boolean = false,
    // ) {
    //     if( rifts_tattoosID == 0 && rifts_tattoosDef ) {
    //         // Custom RiftsTattoos
    //         let insertRiftsTattoos = new RiftsTattoos( rifts_tattoosDef, this, );

    //         if( buyCost !== null && buyCost > -1 && buyCost != rifts_tattoosDef.cost ) {
    //             insertRiftsTattoos.buyCost = buyCost;
    //         } else {
    //             insertRiftsTattoos.buyCost = rifts_tattoosDef.cost;
    //         }

    //         insertRiftsTattoos.quantity = quantity;

    //         insertRiftsTattoos.frameworkItem = frameworkItem;
    //         insertRiftsTattoos.selectedAttribute = selectedAttribute;
    //         insertRiftsTattoos.selectedSkill = selectedSkill;
    //         insertRiftsTattoos.selectedTrait = selectedTrait;
    //         insertRiftsTattoos.selectedEdge = selectedEdge;
    //         insertRiftsTattoos.setting_item = settingItem;
    //         insertRiftsTattoos.ranks = ranks;
    //         if( customName )
    //             insertRiftsTattoos.customName = customName;

    //         insertRiftsTattoos.selectedMeleeWeaponUUID = selectedMeleeWeaponUUID;
    //         insertRiftsTattoos.selectedRangedWeaponUUID = selectedRangedWeaponUUID;

    //         this._riftsTattoosPurchased.push(
    //             insertRiftsTattoos
    //         );
    //         this.sortRiftsTattoos();
    //         return true;

    //     } else {
    //         // Standard RiftsTattoos

    //         for( let rifts_tattoosDef of this._availableData.chargen_rifts_tattoos) {

    //             if( rifts_tattoosDef.id == rifts_tattoosID ) {
    //                 let insertRiftsTattoos = new RiftsTattoos(
    //                     rifts_tattoosDef,
    //                     this,
    //                 );

    //                 if( buyCost !== null && buyCost > -1 && buyCost != rifts_tattoosDef.cost ) {
    //                     insertRiftsTattoos.buyCost = buyCost;
    //                 } else {
    //                     insertRiftsTattoos.buyCost = rifts_tattoosDef.cost;
    //                 }

    //                 insertRiftsTattoos.frameworkItem = frameworkItem;
    //                 insertRiftsTattoos.quantity = quantity;
    //                 insertRiftsTattoos.selectedAttribute = selectedAttribute;
    //                 insertRiftsTattoos.selectedSkill = selectedSkill;
    //                 insertRiftsTattoos.selectedTrait = selectedTrait;
    //                 insertRiftsTattoos.selectedEdge = selectedEdge;
    //                 insertRiftsTattoos.setting_item = settingItem;
    //                 insertRiftsTattoos.ranks = ranks;
    //                 if( customName )
    //                     insertRiftsTattoos.customName = customName;
    //                 insertRiftsTattoos.selectedMeleeWeaponUUID = selectedMeleeWeaponUUID;
    //                 insertRiftsTattoos.selectedRangedWeaponUUID = selectedRangedWeaponUUID;

    //                 this._riftsTattoosPurchased.push(
    //                     insertRiftsTattoos
    //                 );
    //                 this.sortRiftsTattoos();
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    // DEPRECATED_purchaseRobotMod(
    //     robotModID: number,
    //     robotModDef: IChargenRobotMod | null,
    //     buyCost: number,
    //     selectedAttribute: string = "",
    //     selectedSkill: string = "",
    //     selectedTrait: string = "",
    //     selectedEdge: string = "",
    //     ranks: number = 1,
    //     customName: string = "",
    //     selectedMeleeWeaponUUID: string = "",
    //     selectedRangedWeaponUUID: string = "",
    //     quantity: number,
    //     frameworkItem: boolean = false,
    //     settingItem: boolean = false,
    // ) {
    //     if( robotModID == 0 && robotModDef ) {
    //         // Custom RobotMod
    //         let insertRobotMod = new RobotMod( robotModDef, this );

    //         if( buyCost !== null && buyCost > -1 && buyCost != robotModDef.cost ) {
    //             insertRobotMod.buyCost = buyCost;
    //         } else {
    //             insertRobotMod.buyCost = robotModDef.cost;
    //         }

    //         insertRobotMod.quantity = quantity;

    //         insertRobotMod.frameworkItem = frameworkItem;
    //         insertRobotMod.selectedAttribute = selectedAttribute;
    //         insertRobotMod.selectedSkill = selectedSkill;
    //         insertRobotMod.selectedTrait = selectedTrait;
    //         insertRobotMod.selectedEdge = selectedEdge;
    //         insertRobotMod.ranks = ranks;
    //         if( customName )
    //             insertRobotMod.customName = customName;

    //         insertRobotMod.selectedMeleeWeaponUUID = selectedMeleeWeaponUUID;
    //         insertRobotMod.selectedRangedWeaponUUID = selectedRangedWeaponUUID;
    //         insertRobotMod.setting_item = settingItem;

    //         this._robotModsPurchased.push(
    //             insertRobotMod
    //         );
    //         this.sortRobotMods();
    //         return true;

    //     } else {
    //         // Standard RobotMod

    //         for( let robotModDef of this._availableData.robot_mods) {

    //             if( robotModDef.id == robotModID ) {
    //                 let insertRobotMod = new RobotMod(
    //                     robotModDef,
    //                     this,
    //                 );

    //                 if( buyCost !== null && buyCost > -1 && buyCost != robotModDef.cost ) {
    //                     insertRobotMod.buyCost = buyCost;
    //                 } else {
    //                     insertRobotMod.buyCost = robotModDef.cost;
    //                 }

    //                 insertRobotMod.frameworkItem = frameworkItem;
    //                 insertRobotMod.quantity = quantity;
    //                 insertRobotMod.selectedAttribute = selectedAttribute;
    //                 insertRobotMod.selectedSkill = selectedSkill;
    //                 insertRobotMod.selectedTrait = selectedTrait;
    //                 insertRobotMod.selectedEdge = selectedEdge;
    //                 insertRobotMod.ranks = ranks;
    //                 if( customName )
    //                     insertRobotMod.customName = customName;
    //                 insertRobotMod.selectedMeleeWeaponUUID = selectedMeleeWeaponUUID;
    //                 insertRobotMod.selectedRangedWeaponUUID = selectedRangedWeaponUUID;
    //                 insertRobotMod.setting_item = settingItem;

    //                 this._robotModsPurchased.push(
    //                     insertRobotMod
    //                 );
    //                 this.sortRobotMods();
    //                 return true;
    //             }
    //         }
    //     }
    //     return false;
    // }

    purchaseWeapon(
        weaponID: number,
        weaponDef: IChargenWeapon | null,
        weaponOptions: IWeaponObjectVars | null = null,
    ) {
        // Delegated to PurchaseModule
        return this._purchaseModule.purchaseWeapon(weaponID, weaponDef, weaponOptions);
    }

    LEGACYPurchaseWeapon(
        weaponID: number,
        weaponDef: IChargenWeapon | null,
        buyCost: number,
        equippedPrimary: boolean,
        equippedSecondary: boolean,
        quantity: number,
        scifiMod: string = "",
        uuid: string = "",
        settingItem: boolean,
        frameworkItem: boolean = false,
        objVars: IWeaponObjectVars | null = null,
    ) {
        return this._legacyPurchaseModule.LEGACYPurchaseWeapon(
            weaponID,
            weaponDef,
            buyCost,
            equippedPrimary,
            equippedSecondary,
            quantity,
            scifiMod,
            uuid,
            settingItem,
            frameworkItem,
            objVars,
        );
    }

    getArmor(): Armor[] {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getArmor();
    }

    _getArmorString(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getArmorString();
    }

    getGearPurchased(): Gear[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getGearPurchased();
    }

    sortCyberware(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.sortCyberware();
    }

    getCyberwarePurchased(): Cyberware[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getCyberwarePurchased();
    }

    sortRiftsTattoos(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.sortRiftsTattoos();
    }

    getRiftsTattooPurchased(): RiftsTattoos[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getRiftsTattooPurchased();
    }

    sortRobotMods(): void {
        // Delegated to EquipmentModule
        this._equipmentModule.sortRobotMods();
    }

    getRobotModsPurchased(): RobotMod[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getRobotModsPurchased();
    }

    getUniqeRobotModsPurchased(): RobotMod[] {
        this.sortRobotMods();

        let robotMods: RobotMod[] = [];

        for( let mod of this._robotModsPurchased ) {
            let found = false;

            for( let insMod of robotMods ) {
                if(
                    insMod.id == mod.id
                        ||
                    (
                        mod.is_custom == insMod.is_custom
                            &&
                            mod.getName().toLowerCase().trim() == insMod.getName().toLowerCase().trim()
                    )
                ) {
                    found = true;
                    insMod.quantity++;
                }
            }

            if( !found ) {
                let newObj = new RobotMod( mod.export(), this );
                newObj.quantity = mod.quantity;
                robotMods.push(
                    newObj
                );
            }

        }

        return robotMods;
    }
    getUniqueCyberwarePurchased(): Cyberware[] {
        this.sortCyberware();

        let cyberWare: Cyberware[] = [];

        for( let cyb of this._cyberwarePurchased ) {
            let found = false;

            for( let insCyb of cyberWare ) {
                if(
                    // insCyb.id == cyb.id
                    //     ||
                    (
                        // cyb.is_custom == insCyb.is_custom
                        //     &&
                        cyb.getName().toLowerCase().trim() == insCyb.getName().toLowerCase().trim()
                    )
                ) {
                    found = true;
                    insCyb.quantity++;
                }
            }

            if( !found ) {
                let newObj = new Cyberware( cyb.export(), this, );
                newObj.importOptions( cyb.exportOptions() );
                newObj.quantity = cyb.quantity;
                cyberWare.push(
                    newObj
                );
            }

        }

        return cyberWare;
    }

    getWeaponsPurchased(): Weapon[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getWeaponsPurchased();
    }

    getMeleeWeaponsPurchased(): Weapon[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getMeleeWeaponsPurchased();
    }

    getRangedWeaponsPurchased(): Weapon[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getRangedWeaponsPurchased();
    }

    getArmorPurchased(): Armor[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getArmorPurchased();
    }

    getInnateWeapons(): Weapon[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getInnateWeapons();
    }

    getWeapons(): Weapon[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getWeapons();
    }

    customizeSelectedRace(): void {
        this.race.id = 0;
        this.race.is_custom = true;
    }

    getWeaponList(): string[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getWeaponList();
    }

    getArmorList(): string[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getArmorList();
    }

    getGearList(): string[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getGearList();
    }

    countsAsFramework( findFrameworkName: string ): boolean {
        // look to see if the framework just STARTS with string, so that "MARS XXX" can be found with "mars"
        if(
            this.currentFramework
        ) {
            if( this.currentFramework.name.toLowerCase().trim().indexOf( findFrameworkName.toLowerCase().trim() ) === 0 )
                return true;

            for(let name of  this.currentFramework.countsAsOther ) {
                // this is for a future use of Dragon Juicers, etc.
                if( name.toLowerCase().trim().indexOf( findFrameworkName.toLowerCase().trim() ) === 0 ) {
                    return true;
                }
            }
        }

        return false;
    }

    // countsAsRace( findRaceName: string ): boolean {
    //     if( this.race.name.toLowerCase().trim() == findRaceName.toLowerCase().trim() ) {
    //         return true;
    //     }

    //     for( let raceName of this.counts_as_other_race ) {
    //         if( raceName.toLowerCase().trim() == findRaceName.toLowerCase().trim() ) {
    //             return true;
    //         }
    //     }

    //     return false;
    // }

    getContainerList(
        currentItemIndex: number = -1,
        listingContainerIsCustom: boolean = false,
    ): IContainerListItem[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getContainerList(currentItemIndex, listingContainerIsCustom);
    }

    getVehicleContainerList(
        currentItemIndex: number = -1,
        listingContainerIsCustom: boolean = false,
    ): IContainerListItem[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getVehicleContainerList(currentItemIndex, listingContainerIsCustom);
    }

    public storeGearPurchasedInContainer(
        gearIndex: number,
        containerIndex: number,
        customData: IChargenGear | null = null,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.storeGearPurchasedInContainer(gearIndex, containerIndex, customData);
    }

    public storeGearPurchasedInVehicle(
        gearIndex: number,
        containerIndex: number,
        customData: IChargenGear | null = null,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.storeGearPurchasedInVehicle(gearIndex, containerIndex, customData);
    }

    public addGearCustom(
        gearData: IChargenGear,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.addGearCustom(gearData);
    }

    public updateGearCustom(
        index: number,
        gearData: IChargenGear,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.updateGearCustom(index, gearData);
    }

    public addVehicleCustom(
        vehicleData: IVehicleEntry,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.addVehicleCustom(vehicleData);
    }

    public getVehiclesPurchased(): VehicleEntry[] {
        // Delegated to EquipmentModule
        return this._equipmentModule.getVehiclesPurchased();
    }

    public updateVehicleCustom(
        index: number,
        vehicleData: IVehicleEntry,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.updateVehicleCustom(index, vehicleData);
    }

    public getFatiguePenalty(numberFatigue: number): number {
        // Delegated to CombatModule
        return this._combatModule.getFatiguePenalty(numberFatigue);
    }

    public getWoundPenalty(numberWounds: number): number {
        // Delegated to CombatModule
        return this._combatModule.getWoundPenalty(numberWounds);
    }

    public addRiftsTattooCustom(rtData: IChargenRiftsTattoo): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.addRiftsTattooCustom(rtData);
    }

    public updateRiftsTattooCustom(index: number, rtData: IChargenRiftsTattoo): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.updateRiftsTattooCustom(index, rtData);
    }

    public addCyberwareCustom(cyberwareData: IChargenCyberware): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.addCyberwareCustom(cyberwareData);
    }

    public updateCyberwareCustom(index: number, cyberwareData: IChargenCyberware): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.updateCyberwareCustom(index, cyberwareData);
    }

    public addRobotModCustom(modData: IChargenRobotMod): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.addRobotModCustom(modData);
    }

    public updateRobotModCustom(index: number, modData: IChargenRobotMod): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.updateRobotModCustom(index, modData);
    }

    public getContainedItemTypeAndName(
        gearIndex: number,
        containedIndex: number,
    ): INameAndType {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.getContainedItemTypeAndName(gearIndex, containedIndex);
    }

    public getVehicleContainedItemTypeAndName(
        vehicleIndex: number,
        containedIndex: number,
    ): INameAndType {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.getVehicleContainedItemTypeAndName(vehicleIndex, containedIndex);
    }

    public setPowerRank(
        powerName: string,
        newValue: number,
    ) {
        // console.log("setPowerRank", powerName, newValue );
        for( let ab of this._selectedArcaneBackgrounds ) {
            if( ab ) {
                for( let power of ab.selectedPowers ) {
                    if( power.isNamed( powerName ) ) {
                        power.rank = newValue;
                    }
                }
            }
        }

        for( let edge of this._edgesAdded ) {
            if( edge.arcaneBackground ) {
                for( let power of edge.arcaneBackground .selectedPowers ) {
                    if( power.isNamed( powerName ) ) {
                        power.rank = newValue;
                    }
                }
            }
        }

        for( let edge of this._edgesSelected ) {
            if( edge.arcaneBackground ) {
                for( let power of edge.arcaneBackground .selectedPowers ) {
                    if( power.isNamed( powerName ) ) {
                        power.rank = newValue;
                    }
                }
            }
        }
    }
    public removeFromVehicle(
        vehicleIndex: number,
        containedIndex: number,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.removeFromVehicle(vehicleIndex, containedIndex);
    }

    public removeFromContainer(
        gearIndex: number,
        containedIndex: number,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.removeFromContainer(gearIndex, containedIndex);
    }

    public getAlternateArmorProfile(armorName: string): IAlternateArmorData | null {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getAlternateArmorProfile(armorName);
    }

    public getEquippedArmorName(): string {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getEquippedArmorName();
    }

    public getEquippedArmorIndex(): number {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getEquippedArmorIndex();
    }

    public eqiupArmorName(armorName: string): void {
        // Delegated to ArmorToughnessModule
        this._armorToughnessModule.equipArmorName(armorName);
    }

    public getSuperPowers2021CurrentPowerLimit(theBestThereIs: boolean = false): number {
        // Delegated to SuperPowerModule
        return this._superPowerModule.getSuperPowers2021CurrentPowerLimit(theBestThereIs);
    }

    public stepUnarmedToHit(): void {
        // Delegated to CombatModule
        this._combatModule.stepUnarmedToHit();
    }

    public stepUnarmedDamage(): void {
        // Delegated to CombatModule
        this._combatModule.stepUnarmedDamage();
    }

    public incrementUnarmedAP(apBonus: number = 0): void {
        // Delegated to CombatModule
        this._combatModule.incrementUnarmedAP(apBonus);
    }

    unequipPrimaryItems( removeSecondaryItemsToo: boolean = false ) {
        for( let armor of this._armorPurchased ) {
            armor.equippedPrimary = false;
            if( armor.requires2Hands ) {
                armor.equippedSecondary = false;
            }
        }

        for( let weapon of this._weaponsPurchased ) {
            weapon.equippedPrimary = false;
            if( weapon.profiles[0].requires_2_hands && this._ignoreTwoHandsMelee == false ) {
                weapon.equippedSecondary = false;
            }
        }

        for( let weapon of this._innateAttacks ) {
            weapon.equippedPrimary = false;
        }

        if( removeSecondaryItemsToo ) {
            for( let armor of this._armorPurchased ) {
                armor.equippedSecondary = false;
                if( armor.requires2Hands ) {
                    armor.equippedPrimary = false;
                }
            }

            for( let weapon of this._weaponsPurchased ) {
                if (  this._ignoreTwoHandsMelee == false ) {
                    weapon.equippedSecondary = false;
                    if( weapon.profiles[0].requires_2_hands ) {
                        weapon.equippedPrimary = false;
                    }
                }
            }

        }
        this.saveInnateEquips();
    }

    unequipSecondaryItems(removePrimaryToo: boolean = false ) {
        for( let armor of this._armorPurchased ) {
            armor.equippedSecondary = false;
            if( armor.requires2Hands ) {
                armor.equippedPrimary = false;
            }
        }

        for( let weapon of this._weaponsPurchased ) {
            weapon.equippedSecondary = false;
            if( weapon.profiles[0].requires_2_hands && this._ignoreTwoHandsMelee == false) {
                weapon.equippedPrimary = false;
            }
        }

        for( let weapon of this._innateAttacks ) {
            weapon.equippedSecondary = false;
        }

        if( removePrimaryToo ) {
            for( let armor of this._armorPurchased ) {
                armor.equippedPrimary = false;
                if( armor.requires2Hands ) {
                    armor.equippedSecondary = false;
                }
            }

            for( let weapon of this._weaponsPurchased ) {
                if (  this._ignoreTwoHandsMelee == false ) {
                    weapon.equippedPrimary = false;
                    if( weapon.profiles[0].requires_2_hands) {
                        weapon.equippedSecondary = false;
                    }
                }
            }
        }
        this.saveInnateEquips();
    }

    eqiupPurchasedPrimaryArmor( armorIndex: number ) {

        if( this._armorPurchased.length > armorIndex && this._armorPurchased[ armorIndex ] ) {
            this.unequipPrimaryItems( this._armorPurchased[ armorIndex ].requires2Hands );
            this._armorPurchased[ armorIndex ].equippedPrimary = true;
        }
    }

    eqiupPurchasedSecondaryArmor( armorIndex: number ) {
        this.unequipSecondaryItems( this._armorPurchased[ armorIndex ].requires2Hands );
        if( this._armorPurchased.length > armorIndex && this._armorPurchased[ armorIndex ] ) {
            this._armorPurchased[ armorIndex ].equippedSecondary = true;
        }
    }

    unEquipAllArmor(): void {
        // Delegated to ArmorToughnessModule
        this._armorToughnessModule.unEquipAllArmor();
    }

    eqiupArmor(armorIndex: number): void {
        // Delegated to ArmorToughnessModule
        this._armorToughnessModule.equipArmor(armorIndex);
    }

    uneqiupArmor(armorIndex: number): void {
        // Delegated to ArmorToughnessModule
        this._armorToughnessModule.unequipArmor(armorIndex);
    }

    removeArmor(armorIndex: number): void {
        // Delegated to ArmorToughnessModule
        this._armorToughnessModule.removeArmor(armorIndex);
    }

    storeWeaponPurchasedInVehicle(
        weaponIndex: number,
        containerIndex: number,
        customData: IChargenWeapon | null = null,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.storeWeaponPurchasedInVehicle(weaponIndex, containerIndex, customData);
    }

    public storeWeaponPurchasedInContainer(
        weaponIndex: number,
        containerIndex: number,
        customData: IChargenWeapon | null = null,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.storeWeaponPurchasedInContainer(weaponIndex, containerIndex, customData);
    }

    public storeArmorPurchasedInContainer(
        armorIndex: number,
        containerIndex: number,
        customData: IChargenArmor | null = null,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.storeArmorPurchasedInContainer(armorIndex, containerIndex, customData);
    }

    public storeArmorPurchasedInVehicle(
        armorIndex: number,
        containerIndex: number,
        customData: IChargenArmor | null = null,
    ): boolean {
        // Delegated to ContainerStorageModule
        return this._containerStorageModule.storeArmorPurchasedInVehicle(armorIndex, containerIndex, customData);
    }

    updateArmorCustom(
        index: number,
        armorData: IChargenArmor,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.updateArmorCustom(index, armorData);
    }

    addArmorCustom(
        armorData: IChargenArmor,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.addArmorCustom(armorData);
    }

    updateWeaponCustom(
        index: number,
        weaponData: IChargenWeapon,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.updateWeaponCustom(index, weaponData);
    }

    addWeaponCustom(
        weaponData: IChargenWeapon,
    ): boolean {
        // Delegated to PurchaseModule
        return this._purchaseModule.addWeaponCustom(weaponData);
    }

    saveInnateEquips() {
        this._innateWeaponModule.saveInnateEquips();
    }

    eqiupWeaponPrimary( weaponIndex: number ) {
        this.unequipPrimaryItems( this._weaponsPurchased[ weaponIndex ].profiles[0].requires_2_hands );
        if( this._weaponsPurchased.length > weaponIndex && this._weaponsPurchased[ weaponIndex ] ) {
            this._weaponsPurchased[ weaponIndex ].equippedPrimary = true;
        }
    }

    eqiupWeaponSecondary( weaponIndex: number ) {

        if( this._weaponsPurchased.length > weaponIndex && this._weaponsPurchased[ weaponIndex ] ) {
            this.unequipSecondaryItems( this._weaponsPurchased[ weaponIndex ].profiles[0].requires_2_hands );
            this._weaponsPurchased[ weaponIndex ].equippedSecondary = true;
        }
    }

    uneqiupWeapon( weaponIndex: number ) {
        if( this._weaponsPurchased.length > weaponIndex && this._weaponsPurchased[ weaponIndex ] ) {
            this._weaponsPurchased[ weaponIndex ].equippedPrimary = false;
            this._weaponsPurchased[ weaponIndex ].equippedSecondary = false;
        }
    }

    addAlly( newAlly: IBestiaryEntry ): boolean {
        newAlly.uuid = generateUUID();
        this._allies.push( newAlly );
        return true;
    }

    updateAlly( allyIndex: number, newAlly: IBestiaryEntry ): boolean {
        if( this._allies.length > allyIndex && this._allies[allyIndex] ) {
            this._allies[allyIndex] = newAlly;
            return true;
        }
        return false;
    }

    removeAlly(  allyIndex: number ) {
        if( this._allies.length > allyIndex ) {
            this._allies.splice(allyIndex, 1);
            return true;
        }
        return false;
    }

    getAllies(): IBestiaryEntry[] {
        return this._allies;
    }

    sortPeoplePlacesThings() {
        this.peoplePlacesThings.sort(
            function(a: IPeoplePlacesThings, b: IPeoplePlacesThings) {
                if( a.name < b.name ) {
                    return -1;
                } else if( a.name > b.name ) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }

    sortJournal() {
        this.journal.sort(
            function(a: IJournalEntry, b: IJournalEntry) {
                if( a.date < b.date ) {
                    return -1;
                } else if( a.date > b.date ) {
                    return 1;
                } else {
                    return 0;
                }
            }
        );
    }

    setFrameworkModified() {
        if( this.currentFramework ) {
            this.currentFramework.modified = true;
        }
    }

    setAdvancementCountPerXP() {
        // Delegated to AdvancementModule
        this._advancementModule.setAdvancementCountPerXP();
    }

    getCurrentRankName(
        advancementCount: number = -1,
        showLegendaryNumber: boolean = false,
    ): string {
        // Delegated to AdvancementModule
        return this._advancementModule.getCurrentRankName(advancementCount, showLegendaryNumber);
    }

    getCurrentRank(
        advancementCount: number = -1,
        forPower: boolean = false,
    ): number {
        // Delegated to AdvancementModule
        return this._advancementModule.getCurrentRank(advancementCount, forPower);
    }

    hasALinguistEdge(): boolean {
        for( let edge of this.getAllEdgeObjects() ) {

            if( edge.isLinguist )
                return true;
        }

        return false;
    }

    hasEdge(
        edgeName: string,
        atRank: number = -1,
        selectedABIndex: number | string = 0,
        debug: boolean = false,
    ): number {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.hasEdge(edgeName, atRank, selectedABIndex, debug);
    }

    hasCyberware(cyberName: string): boolean {
        for (const cyber of this.getCyberwarePurchased()) {
            if (
                cyber.name.toLowerCase().trim() === cyberName.toLowerCase().trim()
                ||
                cyber.name.toLowerCase().trim().indexOf(cyberName.toLowerCase().trim() + " (") === 0) {
                return true;
            }
        }
        return false;
    }

    hasHindrance(hindranceName: string): boolean {
        // Delegated to EdgeHindranceModule
        return this._edgeHindranceModule.hasHindrance(hindranceName);
    }

    hasArcaneBackground(needsABType: string = ""): boolean {
        // Delegated to ArcaneModule
        return this._arcaneModule.hasArcaneBackground(needsABType);
    }

    getSanity(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getSanity();
    }

    getArcaneBackgroundIndex(needsABType: string = "", racialOnly: boolean = false): number {
        // Delegated to ArcaneModule
        return this._arcaneModule.getArcaneBackgroundIndex(needsABType, racialOnly);
    }

    getArcaneBackgrounds(): ArcaneBackground[] {
        // Delegated to ArcaneModule
        return this._arcaneModule.getArcaneBackgrounds();
    }

    getSkillList(
    ): ISkillFlatList[] {
        let returnList: ISkillFlatList[] = [];

        for( let skill of this.skills ) {
            if( skill.isKnowledge ) {
                returnList.push({
                    name: skill.name,
                    value: skill.currentValue(),
                    attributeDisplay: this.getAttributeCurrentHR( skill.attribute ),
                    valueDisplay: skill.currentValueHR(),
                    attributeValue: this.getAttributeCurrent( skill.attribute  ),
                    isKnowledge: true,
                });
                let specIndex = 0;
                for( let spec of skill.specialties ) {
                    returnList.push({
                        name: getDisplayText(skill.name) + " (" + getDisplayText(spec.name) + ")",
                        value: spec.assignedValue + spec.boostValue + spec.advanceBoost,
                        // value: skill.currentValue(specIndex),

                        attributeDisplay: this.getAttributeCurrentHR( skill.attribute ),
                        valueDisplay: getDieLabelFromIndex(spec.assignedValue + spec.boostValue + spec.advanceBoost),
                        attributeValue: this.getAttributeCurrent( skill.attribute ),
                        isKnowledge: true,
                    })
                    specIndex++;
                }
            } else {
                returnList.push({
                    name: skill.name,
                    value: skill.currentValueNoSuper(),
                    attributeDisplay: this.getAttributeCurrentHR( skill.attribute ),
                    valueDisplay: skill.currentValueHR(),
                    attributeValue: this.getAttributeCurrent( skill.attribute ),
                    isKnowledge: false,
                })
            }
        }
        return returnList;
    }

    hasBoughtOffHindrance( hindranceName: string ): "" | "remove" | "lower" {
        for( let adv of this._advancements) {
            if( adv.type == "swade_remove_major_hindrance" && adv.target1.toLowerCase().trim() == hindranceName.toLowerCase().trim() ) {
                return "remove"
            }
            if( adv.type == "swade_lower_hindrance" && adv.target1.toLowerCase().trim() == hindranceName.toLowerCase().trim() ) {
                return "remove"
            }
        }
        return "";
    }

    removeSkill( skillName: string, attribute: string ) {
        for(let lCounter = 0; lCounter < this.skills.length; lCounter++) {
            if(
                skillName.toLowerCase().trim() == this.skills[lCounter].name.toLowerCase().trim()
                    &&
                attribute.toLowerCase().trim() == this.skills[lCounter].attribute.toLowerCase().trim()
            )  {
                this.skills.splice(lCounter, 1);
                return true;
            }

        }
        return false;
    }

    renameArcaneSkill(
        oldName: string,
        oldAttribute: string,
        newName: string,
        newAttribute: string,
    ) {

        for( let skill of this.skills ) {
            if(
                oldName.toLowerCase().trim() == skill.name .toLowerCase().trim()
                    &&
                oldAttribute.toLowerCase().trim() == skill.attribute.toLowerCase().trim()
            ) {

                skill.name = newName.trim();
                skill.attribute = newAttribute.toLowerCase().trim();
                skill.originalAttribute = newAttribute.toLowerCase().trim();

                return true;
            }
        }
        return false;
    }

    removeOrLowerHindrance( hindName: string ) {

        for( let hind of this._hindrancesAdded) {
            if( hind.baseName == hindName) {
                if( hind.major ) {
                    hind.major = false;
                } else {
                    hind.removed = true;
                }

                return;
            }
        }

        for( let hind of this._hindrancesSelected ) {
            if( hind.baseName == hindName ) {
                if( hind.major ) {
                    hind.major = false;
                } else {
                    hind.removed = true;
                }
                return;
            }
        }

        for( let hind of this._hindrancesCustom ) {
            if( hind.name == hindName ) {
                if( hind.major ) {
                    hind.major = false;
                } else {
                    hind.removed = true;
                }
                return;
            }
        }
    }

    removeMajorHindrance( hindName: string ) {
        for( let hind of this._hindrancesAdded) {
            if( hind.baseName == hindName  && hind.major) {
                hind.removed = true;
                return;
            }
        }

        for( let hind of this._hindrancesSelected ) {
            if( hind.baseName == hindName  && hind.major) {
                hind.removed = true;
                return;
            }
        }

        for( let hind of this._hindrancesCustom ) {
            if( hind.name == hindName && hind.major ) {
                hind.removed = true;
                return;
            }
        }
    }

    getNumberOfArcaneBackgrounds(): number {
        // console.log("getNumberOfArcaneBackgrounds this._numberOfArcaneBackgrounds", this._numberOfArcaneBackgrounds);
        return this._numberOfArcaneBackgrounds;
    }

    getNumberOfSelectedArcaneBackgrounds(): number {
        let rv = 0;

        for( let ab of this._selectedArcaneBackgrounds) {
            if( ab ) {
                rv++;
            }
        }

        for( let edge of this.getAllEdgeObjects() ) {
            if( edge && edge.arcaneBackground ) {
                rv++;
            }
        }

        return rv;
    }

    getNumberOfEdgeArcaneItems():  number {
        let rv = 0;

        let abs = this.getEdgeArcaneBackgrounds();

        for( let edge of abs) {
            if( edge && edge.arcaneBackground ) {
                rv += edge.arcaneBackground.arcaneItems.length;
            }
        }
        return rv;
    }

    getNumberOfArcaneItems(): number {
        let rv = 0;

        for( let ab of this._selectedArcaneBackgrounds) {
            if( ab ) {
                rv += ab.arcaneItems.length;
            }
        }
        return rv;
    }

    updatePowerCustomDescription( abIndex: number, powerIndex: number, newValue: string[] ) {
        if( this._selectedArcaneBackgrounds[abIndex] ) {
            //@ts-ignore
            if( this._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex] ) {
                //@ts-ignore
                this._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex].customDescription = newValue;
            }
        }
    }

    updatePowerCustomName( abIndex: number, powerIndex: number, newValue: string ) {
        if( this._selectedArcaneBackgrounds[abIndex] ) {
            //@ts-ignore
            if( this._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex] ) {
                //@ts-ignore
                this._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex].customName = newValue;
            }
        }
    }

    setPowerEffectSpecify( abIndex: number, powerIndex: number, newValue: string ) {
        if( this._selectedArcaneBackgrounds[abIndex] ) {
            //@ts-ignore
            if( this._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex] ) {
                //@ts-ignore
                this._selectedArcaneBackgrounds[abIndex].selectedPowers[powerIndex].setEffectSpecify( newValue );
            }
        }
    }

    updateABPowerPointsName( abIndex: number, newValue: string ) {
        if( newValue == "" ) {
            newValue = "Power Points";
        }
        if( this._selectedArcaneBackgrounds[abIndex] ) {
            //@ts-ignore
            this._selectedArcaneBackgrounds[abIndex].powerPointsName = newValue;
        }
    }

    getArmorStrength(): number {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getArmorStrength();
    }

    getWeaponStrength(): number {
        return this.getAttributeCurrent("strength") + this._weaponStrengthBonus;
    }

    getEncumbranceStrength(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getEncumbranceStrength();
    }

    getArmorMinStrengthPenalty(): number {
        // Delegated to ArmorToughnessModule
        return this._armorToughnessModule.getArmorMinStrengthPenalty();
    }

    switchSkillAttribute(
        skillName: string,
        attribute: string,
        if_equal_or_higher: boolean = false,
    ): void {
        // Delegated to SkillModule
        this._skillModule.switchAttribute(skillName, attribute, if_equal_or_higher);
    }

    getRunningDie(): string {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getRunningDie();
    }

    getCurrentStain(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getCurrentStrain();
    }
    getMaxStrain(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getMaxStrain();
    }

    getTotalStrain(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getTotalStrain();
    }

    boostAttribute( attribute: string, boostValue: number = 1 ) {
        if( !attribute ) {
            attribute = "";
        }
        switch( attribute.toString().toLowerCase().trim() ) {
            case "agility": {
                this._attributeBoosts.agility += boostValue;
                this._attributesMax.agility += boostValue;
                this._attributesMin.agility += boostValue;
                break;
            }
            case "smarts": {
                this._attributeBoosts.smarts += boostValue;
                this._attributesMax.smarts += boostValue;
                this._attributesMin.smarts += boostValue;
                break;
            }
            case "spirit": {
                this._attributeBoosts.spirit += boostValue;
                this._attributesMax.spirit += boostValue;
                this._attributesMin.spirit += boostValue;
                break;
            }
            case "strength": {
                this._attributeBoosts.strength += boostValue;
                this._attributesMax.strength += boostValue;
                this._attributesMin.strength += boostValue;
                break;
            }
            case "vigor": {
                this._attributeBoosts.vigor += boostValue;
                this._attributesMax.vigor += boostValue;
                this._attributesMin.vigor += boostValue;
                break;
            }
        }
    }

    removeArcaneItem(
        abIndex: number,
        deletingItemIndex: number,
    ) {
        if( this._selectedArcaneBackgrounds.length > abIndex && this._selectedArcaneBackgrounds[abIndex]) {
            //@ts-ignore
            if( this._selectedArcaneBackgrounds[abIndex].arcaneItems.length > deletingItemIndex && this._selectedArcaneBackgrounds[abIndex].arcaneItems[deletingItemIndex]) {
                //@ts-ignore
                this._selectedArcaneBackgrounds[abIndex].arcaneItems.splice( deletingItemIndex, 1);
            }

        }
    }

    removeEdgeArcaneItem(
        edgeIndex: number,
        deletingItemIndex: number,
    ) {
        let abs = this.getEdgeArcaneBackgrounds();
        if( abs.length > edgeIndex && abs[edgeIndex]) {
            //@ts-ignore
            if( abs[edgeIndex].arcaneItems.length > deletingItemIndex && abs[edgeIndex].arcaneItems[deletingItemIndex]) {
                //@ts-ignore
                abs[edgeIndex].arcaneItems.splice( deletingItemIndex, 1);
            }

        }
    }

    saveEdgeArcaneItem(
        edgeIndex: number,
        editingItemIndex: number,
        itemData: IJSONArcaneItemExport,
    ) {
        let abs = this.getEdgeArcaneBackgrounds();
        if( abs.length > edgeIndex && abs[edgeIndex] && abs[edgeIndex].arcaneBackground) {
            //@ts-ignore
            if( abs[edgeIndex].arcaneBackground.arcaneItems.length > editingItemIndex && abs[edgeIndex].arcaneBackground.arcaneItems[editingItemIndex]) {
                //@ts-ignore
                abs[edgeIndex].arcaneBackground.arcaneItems[editingItemIndex] = new ArcaneItem( this, itemData );
            }

        }
    }

    addEdgeArcaneItem(
        edgeIndex: number,
        itemData: IJSONArcaneItemExport,
    ) {
        let abs = this.getEdgeArcaneBackgrounds();
        if( abs.length > edgeIndex && abs[edgeIndex] && abs[edgeIndex].arcaneBackground) {
            //@ts-ignore
            abs[edgeIndex].arcaneBackground.arcaneItems.push( new ArcaneItem( this, itemData ) );
        }
    }

    getEdgeArcaneItems(): ArcaneItem[] {
        let rv: ArcaneItem[] = [];

        let abs = this.getEdgeArcaneBackgrounds();

        for( let edge of abs) {
            if( edge && edge.arcaneBackground ) {
                for( let item of edge.arcaneBackground.arcaneItems ) {
                    rv.push( item );
                }
            }
        }

        return rv;
    }

    saveArcaneItem(
        abIndex: number,
        editingItemIndex: number,
        itemData: IJSONArcaneItemExport,
    ) {
        if( this._selectedArcaneBackgrounds.length > abIndex && this._selectedArcaneBackgrounds[abIndex]) {
            //@ts-ignore
            if( this._selectedArcaneBackgrounds[abIndex].arcaneItems.length > editingItemIndex && this._selectedArcaneBackgrounds[abIndex].arcaneItems[editingItemIndex]) {
                //@ts-ignore
                this._selectedArcaneBackgrounds[abIndex].arcaneItems[editingItemIndex] = new ArcaneItem( this, itemData );
            }

        }
    }

    addArcaneItem(
        abIndex: number,
        itemData: IJSONArcaneItemExport,
    ) {
        if( this._selectedArcaneBackgrounds.length > abIndex && this._selectedArcaneBackgrounds[abIndex]) {
            //@ts-ignore
            this._selectedArcaneBackgrounds[abIndex].arcaneItems.push( new ArcaneItem( this, itemData ) );
        }
    }

    getArcaneItems(): ArcaneItem[] {
        let rv: ArcaneItem[] = [];

        for( let ab of this._selectedArcaneBackgrounds) {
            if( ab ) {
                for( let item of ab.arcaneItems ) {
                    rv.push( item );
                }
            }
        }

        return rv;
    }

    getAllArcaneItems(): ArcaneItem[] {
        let rv: ArcaneItem[] = [];

        for( let ab of this._selectedArcaneBackgrounds) {
            if( ab ) {
                for( let item of ab.arcaneItems ) {
                    rv.push( item );
                }
            }
        }

        let abs = this.getEdgeArcaneBackgrounds();
        for( let ab of abs) {
            if( ab && ab.arcaneBackground) {
                for( let item of ab.arcaneBackground.arcaneItems ) {
                    rv.push( item );
                }
            }
        }

        rv.sort( sortByObjectName );

        return rv;
    }

    setCurrentFrameworkById( id: number, initialSet = false ) {

        if( this.currentFramework ) {
            this.currentFramework.removeEquipmentPackage();
        }

        this.currentFramework  = null;

        for( let framework of this._availableData.frameworks) {
            if(
                id == framework.id
                    &&
                this.setting.book_id_is_used().indexOf( +framework.book_id ) > -1
            ) {
                this.currentFramework = new PlayerCharacterFramework(  framework, this,);
                if( initialSet ) {
                    this.currentFramework.installEquipmentPackage();
                    this.currentFramework.installCyberwarePackage();
                }
            }
        }
    }

    setMonsterFrameworkById( id: number, initialSet = false ) {
        this.monsterFramework = null;

        if (this._availableData.monster_frameworks && Array.isArray(this._availableData.monster_frameworks)) {
            for( let monsterFramework of this._availableData.monster_frameworks) {
                if(
                    id == monsterFramework.id
                        &&
                    this.setting.book_id_is_used().indexOf( +monsterFramework.book_id ) > -1
                ) {
                    this.monsterFramework = new PlayerCharacterMonsterFramework( monsterFramework, this);
                }
            }
        }
    }

    public canSelectAttribute( attribute: string ): boolean {
        attribute = attribute.toLowerCase().trim()
        let pts = this.getAttributePointsMax() + this._maxAttributeModifier - this.setting.startingAttributePoints;
        // console.log( "X", attribute, this._maxAttributeModifier, this.getAttributePointsMax(), this.setting.startingAttributePoints, this.getAttributePointsMax() - this.setting.startingAttributePoints)
        for( let att of this._noSelectAttributes ) {
            if( att.toLowerCase().trim() == attribute && pts < 1) {
                return false;
            }
        }

        return true;
    }

    getAddedEdge( edgeName: string ): Edge | null {
        for( let edge of this._edgesAdded ) {
            if( edge.name.toLowerCase().trim() == edgeName.toLowerCase().trim() )
                return edge;
        }
        return null;
    }

    addLooseAttribute(
        attributeName: string,
        description: string,
    ) {

        for( let att of this._looseAttributes ) {
            if( att.name.toLowerCase().trim() == attributeName.toLowerCase().trim () ) {
                att.name = attributeName;
                att.description = description;
                att.enabled = true;
                return;
            }
        }

        this._looseAttributes.push({
            name: attributeName,
            description: description,
            enabled: true,
            value: "",
        })

    }

    setLooseValue( attributeName: string, newValue: string ) {
        for( let att of this._looseAttributes ) {
            if( att.name.toLowerCase().trim() == attributeName.toLowerCase().trim () ) {
                att.value = newValue;
                att.enabled = true;
                return;
            }
        }
    }

    getLooseAttributes(): ILooseAbility[] {
        return this._looseAttributes;
    }

    private _saveAddedEdgeOptions() {
        if( this._edgesAdded.length > 0 ) {
            let addedEdgeOptions: { [index: string]: IChargenEdgeObjectVars[] } = {};

            for( let edge of this._edgesAdded) {
                if( !addedEdgeOptions[edge.name] ) {
                    addedEdgeOptions[edge.name ] = [];
                }
                addedEdgeOptions[ edge.name ].push(edge.exportOptions());
            }

            this._addedEdgeOptions = addedEdgeOptions;
        }
    }

    private _saveAddedHindranceOptions() {
        if( this._hindrancesAdded.length > 0 ) {
            let addedHindranceOptions: { [index: string]: IChargenHindranceOptions[] } = {};

            for( let hindrance of this._hindrancesAdded) {
                if( !addedHindranceOptions[hindrance.name] ) {
                    addedHindranceOptions[hindrance.name ] = [];
                }
                addedHindranceOptions[ hindrance.name ].push(hindrance.exportOptions());
            }

            this._addedHindranceOptions = addedHindranceOptions;
        }
    }

    getFrameworkName(): string {
        // Delegated to CharacterInfoModule
        return this._characterInfoModule.getFrameworkName();
    }

    exportGenericJSON(
        appVersion: string,
        createdOn: Date | null = null,
        updatedOn: Date | null = null,
        imageUpdated: Date | null = null,
        settingImageUpdated: Date | null = null,
        tokenImageUpdated: Date | null = null,
        fullPathHost: boolean,
    ): IExportStatsOutput {
        return this._genericExportModule.exportGenericJSON(
            appVersion,
            createdOn,
            updatedOn,
            imageUpdated,
            settingImageUpdated,
            tokenImageUpdated,
            fullPathHost,
        );
    }

    getWoundsMax(): number {
        // Delegated to DerivedStatsModule
        return this._derivedStatsModule.getWoundsMax();
    }

    getTWPowers(): Power[]  {

        let TWPowerList = "arcane protection, barrier, blast, blind, bolt, boost/lower Trait, burrow, burst, confusion, damage field, darksight, deflection, detect/conceal arcana, dispel, drain Power Points, entangle, environmental protection, farsight, fly, havoc, healing, intangibility, invisibility, light/darkness, protection, relief, slumber, smite, sound/silence, speak language, sloth/speed, stun, telekinesis, teleport, wall walker, warrior’s gift";

        if( !this.setting.settingIsEnabled("rifts_mdc") ) {
            return [];
        }

        let rv: Power[] = [];

        for( let power of this._availableData.powers  ) {
            let powerObj = new Power(power, this, null,  );
            for( let availPower of TWPowerList.split(",") ) {
                availPower =  powerObj._thinPowerName(availPower);
                let powerName = powerObj._thinPowerName(powerObj.name);
                if( powerName == availPower ) {
                    rv.push( powerObj );
                }

            }

        }
        return rv;
    }

    getHeroesJourneys(): IHerosJourneyListItem[] {
        let returnItem: IHerosJourneyListItem[] = [];
        return [];
        // console.log("this.currentFramework.herosJourneyTableItemSelections", this.currentFramework.herosJourneyTableItemSelections);

        // if( this.currentFramework && this.currentFramework.herosJourneyTableItemSelections.length > 0 ) {
        //     for( let choiceIndex in this.currentFramework.herosJourneyTableItemSelections ){
        //         let choice = this.currentFramework.herosJourneyTableItemSelections[choiceIndex];
        //         for( let table of this._availableData.tables ) {
        //             if( table.id == choice ) {
        //                 returnItem.push({
        //                     label: table.name,
        //                     note: "",
        //                 })
        //             }
        //         }
        //     }
        // }

        // return returnItem;
    }

    public newCustomFramework(editData: IChargenFramework | null = null): void {
        // Delegated to FrameworkModule
        this._frameworkModule.newCustomFramework(editData);
    }

    public customizeCurrentFramework(): void {
        // Delegated to FrameworkModule
        this._frameworkModule.customizeCurrentFramework();
    }

    public clearFramework(): void {
        // Delegated to FrameworkModule
        this._frameworkModule.clearFramework();
    }

    getPromptSpecifications(
        effects: string[],
        defaultValue: string = "",
    ): IPromptSpecification[]  {
        let rv: IPromptSpecification[] = [];

        for( let effect of effects ) {
            if(
                effect.startsWith("specify_prompt:")
                ||
                effect.startsWith("prompt_specify:")
            ) {
                effect = effect.replace("prompt_specify:", "");
                effect = effect.replace("specify_prompt:", "");
                let effect_split = effect.split(";");
                if( effect_split.length > 1 ) {
                    let summary = "";
                    if( effect_split.length > 2 ) {
                        summary = effect_split[2]
                    }
                    let value = this.getPromptSpecifyValue( effect_split[0])
                    if(!value)
                        value = defaultValue;

                    let options: string[] = [];
                    if( effect_split.length > 3 ) {
                        options = effect_split[3].split(",")
                    }

                    let specify: IPromptSpecification = {
                        key: effect_split[0],
                        label: effect_split[1],
                        summary: summary,
                        value: value,
                        options: options,
                    }

                    rv.push( specify);
                }

            }
        }

        return rv;
    }

    getPromptSpecifyValue(
        key: string
    ): string {

        if( key in this._promptSpecifyValues ) {
            return this._promptSpecifyValues[key];
        }
        return "";
    }

    setPromptSpecifyValue(
        key: string,
        nv: string,
    ): void {
        this._promptSpecifyValues[key] = nv;
    }

    public addGearEnhancementToGear(uuid: string, enh: IGearEnhancementExport): void {
        // Delegated to GearEnhancementModule
        this._gearEnhancementModule.addGearEnhancementToGear(uuid, enh);
    }

    public removeGearEnhancementFromGear(itemUuid: string, enhUuid: string): void {
        // Delegated to GearEnhancementModule
        this._gearEnhancementModule.removeGearEnhancementFromGear(itemUuid, enhUuid);
    }

}

interface IHerosJourneyListItem {
    label: string;
    note: string;
}

export interface ISkillListItem {
    name: string;
    value: string;
    baseDie: string;
    bonus: number;
    specializations: string[],
}

export interface IAlternateArmorData {
    name: string;
    strength: string;
    armor: number;
    toughnessAndArmor: string;
    isHeavyArmor: boolean;
}

// Re-export IHindranceData from HindranceDataModule for backwards compatibility
export type { IHindranceData } from './modules/HindranceDataModule';

// Re-export IEdgeData from EdgeDataModule for backwards compatibility
export type { IEdgeData } from './modules/EdgeDataModule';

export interface ISkillFlatList {
     name: string;
    value: number;
    valueDisplay: string;
    attributeValue: number;
    attributeDisplay: string;
    isKnowledge: boolean;
}

export interface IPathfinderArmorInterferenceMod {
    light: number;
    medium: number;
    heavy: number;
}