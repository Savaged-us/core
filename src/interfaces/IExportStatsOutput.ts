export interface IExportStatsOutput {
    saveID: number;
    id: number;
    riftsDisclaimer: boolean,               // Show Rifts copyright notice

    alliedExtras: IExportStatsOutput[];
    wealthDieActive: boolean;
    wealthDieValue: string;
    wealthDieCalculated: string;
    wealthDieBonus: number;
    usesSanity: boolean;
    scholarship: number;
    usesETUScholarship: boolean;

    usesRippersReason: boolean;
    ripperReason: number;

    usesRippersStatus: boolean;
    ripperStatus: number;

    noPowerPoints: boolean;
    unarmoredHero: boolean;
    hideHumanRaceDisplay: boolean;          // Setting is hiding "human" race on character sheets (good for human only campaigns such as near-real-world settings )

    usesStrain: boolean;                    // Setting uses Strain
    strainMax: number;
    strainCurrent: number;

    toughnessAsRead: string;                // toughness as it shows up on export
    toughnessHeavyLabel: string;            // Heavy, MDC, etc
    toughnessAsReadNoHeavy: string;                // toughness as it shows up on export with no toughnessHeavyLabel

    playerName: string;                     // Player name specified by chargen

    naturalArmor: INaturalArmorList[];
    naturalIsHeavy: boolean;
    raceGenderAndProfession: string,
    playerCharacter: boolean,               // Was built using the Player Character Creator
    appVersion: string;                     // savaged.us app version on export
    updatedDate: Date;                      // the save item updated date, or the date of export for a session
    createdDate: Date;                      // the save item created date, or the date of export for a session
    abilities: ISpecialAbilityItem[];
    abs: IExportArcaneBackground[];
    advances: IExportAdvanceItem[];
    advancesCount: number;
    age: string;
    armor: IExportArmor[];
    armorValue: number;
    attributes: IAttributeItem[],
    background: string;
    bennies: number;
    benniesMax: number;
    bookName: string;
    bookID: number;
    bookPublished: string;
    bookPublisher: string;
    bookPrimary: boolean;
    bookCore: boolean;
    charisma: number;
    cyberware: IExportCyberware[];
    description: string;
    edges: IExportListItem[];
    fatigue: number;
    fatigueMax: number;
    gear: IExportGear[];
    gender: string;
    heavyArmor: boolean;
    hindrances: IExportHindranceItem[];
    iconicFramework: string;                // Just the name, if one is selected
    image: string;
    settingImage: string;
    imageToken: string;
    journal: IExportJournal[];
    languages: IExportSkillItem[];
    load: number;
    loadLimit: number;
    loadLimitBase: number;
    loadLimitModifier: number;
    name: string;
    paceBase: number;
    paceMod: number;
    paceTotal: number;
    parryBase: number;
    parryMod: number;
    parryTotal: number;
    parryShield: number;
    parryHR: string;
    professionOrTitle: string;
    race: string;
    rank: number;
    rankName: string;
    runningDie: string;
    sanity: number;
    savagedUsShareURL: string;
    shields: IExportShield[];
    size: number;                           // size number, just a number for reference
    sizeLabel: string;                      // size number + name in parenthesis
    skills: IExportSkillItem[];             // only skills with values
    allSkills: IExportSkillItem[];          // all skills in setting whether has a value or not
    swade: boolean;
    toughnessBase: number;                  // Vigor/2 +2
    toughnessMod: number;                   // Total modifiers between toughnessTotalNoArmor and toughnessBase
    toughnessTotal: number;                 // toughnessTotalNoArmor + armorValue
    toughnessTotalNoArmor: number;          // sum of toughnessBase and other toughness modifiers (size, etc)
    usesCharisma: boolean;
    usesXP: boolean;
    uuid: string;
    vehicles: IExportVehicleStatsOutput[];
    wealth: number;
    wealthFormatted: string;
    weapons: IExportWeapon[];
    otherAttacks: IExportWeapon[];          // other attacks, from powers, etc
    wildcard: boolean;
    wounds: number;
    woundsMax: number;
    woundsSizeMod: number;
    woundsBase: number;
    woundsOtherMod: number;
    xp: number;
    toughnessModifiers: IToughnessModifier[];
}

export interface IToughnessModifier {
    type: string;
    name: string;
    value: number;
}

export interface IExportJournal {
    date: Date;
    text: string[] | string;
    title: string;
}

export interface IExportArcaneBackground {
    id: number;
    uuid: string;
    arcaneSkill: string;
    name: string;
    takenFrom: string;                      // Book and Page, will be either blank or BookShortName and page number such as SWADE p123, Flash p12, etc
    bookID: number;
    powerPointsCurrent: number;
    powerPointsMax: number;
    powerPointsName: string;
    powers: IExportPower[];
    powersTotal: number;
    hasMegaPowerOptions: boolean;
    hasPowerPointPool: boolean;
}

export interface IExportPower {
    id: number;
    uuid: string;
    damage: string;
    damageWithBrackets: string;
    description: string;
    duration: string;
    takenFrom: string;                      // Book and Page, will be either blank or BookShortName and page number such as SWADE p123, Flash p12, etc
    bookID: number;
    innate: boolean;
    name: string;
    originalName: string;
    powerPoints: string;
    range: string;
    summary: string;
    bookPowerName: string;
    aspectOnlyName: string;              // Aspected only power name
    customName: string;
    rank: string;
    trappings: string;
    skillModifier: number;
    arcaneSkillName: string;
    arcaneSkillRoll: string;
    powerModifiers: string[];
    megaPowerOptions: string[];
    additionalTargets: string[];
    descriptionHTML: string;
    customDescription: string;
}

export interface IExportSkillItem {
    attribute: string;
    dieValue: number;
    mod: number;
    name: string;
    value: string;
    isCore: boolean;
    bookID: number;
}

export interface IExportListItem {
    id: number;
    description: string;
    name: string;
    note: string;
    // book_name_page: string;  // Deprecated
    takenFrom: string;
    bookID: number;
    isHidden: boolean;
    descriptionHTML: string;
    customDescription: string;
}

export interface IExportAdvanceItem {
    description: string;
    name: string;
    number: number;
}

export interface INaturalArmorList {
    name: string;
    from: string;
    armor: number;
    heavy: boolean;
}
interface IExportHindranceItem {
    id: number;
    description: string;
    major: boolean;
    name: string;
    note: string;
    // book_name_page: string;  // Deprecated
    takenFrom: string;
    bookID: number;
    isHidden: boolean;
    descriptionHTML: string;
    customDescription: string;
}

export interface ISpecialAbilityItem {
    name: string;
    description: string;
    note: string;
    positive: boolean;
    from: string;
    // book_name_page: string;  // Deprecated
    takenFrom: string;
    bookID: number;
}

export interface IAttributeItem {
    dieValue: number;
    label: string;
    mod: number;
    name: string;
    value: string;
}

export interface IExportArmor {
    id: number;
    isShield: boolean;
    uuid: string;
    armor: number;
    cost: number;
    costBuy: number;                // cost of gear as it was purchased
    coversArms: boolean;
    coversFace: boolean;
    coversHead: boolean;
    coversLegs: boolean;
    coversTorso: boolean;
    equipped: boolean;
    minStr: string;
    name: string;
    notes: string;
    quantity: number;
    weight: number;
    equippedStrength: string;
    equippedToughness: string;
    heavyArmor: boolean;
    takenFrom: string;                      // Book and Page, will be either blank or BookShortName and page number such as SWADE p123, Flash p12, etc
    bookID: number;
    descriptionHTML: string;

    bookPublisher: string;
    bookPublished: string;
    bookPrimary?: boolean;
    bookCore?: boolean;
    bookName?: string;
}

export interface IExportShield {
    id: number;
    isShield: boolean;
    uuid: string;
    cost: number;
    costBuy: number;                // cost of gear as it was purchased
    cover: number;
    equipped: boolean;
    hardness: number;
    minStr: string;
    name: string;
    notes: string;
    parry: number;
    quantity: number;
    weight: number;
    takenFrom: string;                      // Book and Page, will be either blank or BookShortName and page number such as SWADE p123, Flash p12, etc
    bookID: number;
    descriptionHTML: string;

    bookPublisher: string;
    bookPublished: string;
    bookPrimary?: boolean;
    bookCore?: boolean;
    bookName?: string;
}

export interface IExportGear {
    id: number;
    uuid: string;
    contains: IExportContainerItems;
    cost: number;
    costBuy: number;                // cost of gear as it was purchased
    equipped: boolean;
    name: string;
    descriptionHTML: string;
    notes: string;
    summary: string;
    quantity: number;
    container: boolean;             // is a container
    weight: number;
    takenFrom: string;                      // Book and Page, will be either blank or BookShortName and page number such as SWADE p123, Flash p12, etc
    bookID: number;
    bookPublisher: string;
    bookPublished: string;
    bookPrimary?: boolean;
    bookCore?: boolean;
    bookName?: string;
}

interface IExportCyberware {
    id: number;
    uuid: string;
    cost: number;
    costBuy: number;                // cost of gear as it was purchased
    name: string;
    notes: string;
    quantity: number;
    ranks: number;
    strain: number;
    takenFrom: string;
    bookID: number;
    descriptionHTML: string;

    bookPrimary?: boolean;
    bookCore?: boolean;
    bookName?: string;
}

export interface IWeaponProfile {

    name: string;
    damage: string;
    damageWithBrackets: string;
    damage_original: string;
    parry_modifier: number;
    range: string;
    reach: number;
    requires_2_hands: boolean;
    rof: number;
    shots: number;
    currentShots: number;
    additionalDamage: string;

    heavy_weapon: boolean;
    melee_only: boolean;
    counts_as_innate: boolean;
    notes: string;
    equipped?: boolean;

    toHitMod: number;

    damageDiceBase: string;
    damageDiceBasePlus: number;

    is_shield: boolean;
    thrown_weapon: boolean;

    usable_in_melee: boolean;
    add_strength_to_damage: boolean;
    ap: number;
    ap_vs_rigid_armor_only: number;

    vtt_only: boolean;

    skillName: string;
    skillValue: string;
}

export interface IExportWeapon {
    id: number;
    uuid: string;
    ap: number | null;
    cost: number | null ;
    costBuy: number | null ;                // cost of gear as it was purchased
    damage: string;
    damageWithBrackets: string;
    damageDiceBase: string;         // will be the dice part of ParseDamageString.ts
    damageDiceBasePlus: number;     // will be the bonus part of ParseDamageString.ts
    equipped: boolean;
    innate: boolean;
    minStr: string;                 // d6, d8 ,etc
    name: string;
    notes: string;
    quantity: number | null ;
    range: string;
    reach: number | null ;
    rof: number | null ;
    shots: number | null ;
    thrown: boolean;
    descriptionHTML: string;
    weight: number | null ;
    profiles: IWeaponProfile[];
    takenFrom: string;                      // Book and Page, will be either blank or BookShortName and page number such as SWADE p123, Flash p12, etc
    bookID: number;
    activeProfile: number;
    equippedAs: string;
    bookPublisher: string;
    bookPublished: string;
    bookPrimary?: boolean;
    bookCore?: boolean;
    bookName?: string;
}

export interface IExportContainerItems {
    gear: IExportGear[],
    weapons: IExportWeapon[],
    armor: IExportArmor[],
    shields: IExportShield[],
}

export interface IExportVehicleStatsOutput {
    id: number;
    uuid: string;
    appVersion: string;
    updatedDate: Date;
    createdDate: Date;

    armor: number;
    buy_cost: number;
    contains: IExportContainerItems;
    cost: number;
    crew: string;
    description: string;
    handling: string;
    name: string;
    notes: string;
    pace: string;
    pace_fly: string;
    pace_fly_kph: string;
    pace_fly_mph: string;
    pace_kph: string;
    pace_mph: string;
    pace_swim: string;
    pace_swim_kph: string;
    pace_swim_mph: string;
    remaining_mods: number;
    running_die: string;
    size: number;
    special_abilities: ISpecialAbilityItem[];
    strength: string;
    top_speed_kph: number;
    top_speed_mph: number;
    toughness: number;
    uses_pace: boolean;
    weapons: IExportWeapon[];
}

export function sortPowerExports( a: IExportPower, b: IExportPower): number {
    if( a.name > b.name ) {
        return 1
    } else if( a.name < b.name ) {
        return -1
    } else {
        return 0;
    }
}