import { Dictionary } from "lodash";
import { IBestiaryEntry } from "../classes/bestiary_entry";
import { IChargenArcaneBackgroundObjectVars } from "../classes/player_character/arcane_background";
import { IArmorObjectVars, IChargenArmor } from "../classes/player_character/armor";
import { IChargenCyberware, ICyberwareObjectVars } from "../classes/player_character/cyberware";
import { IChargenEdge, IChargenEdgeObjectVars } from "../classes/player_character/edge";
import { IChargenGear, IGearObjectVars } from "../classes/player_character/gear";
import { IGearEnhancementItemExport } from "../classes/player_character/gear_enhancement";
import { IChargenHindrance, IChargenHindranceOptions } from "../classes/player_character/hindrance";
import { IAdditionalStatistic } from "../classes/player_character/player_character";
import { IChargenAdvancement } from "../classes/player_character/player_character_advancement";
import { IFrameworkSelection } from "../classes/player_character/player_character_framework";
import { IMonsterFrameworkSelection } from "../classes/player_character/player_character_monster_framework";
import { IChargenRace, IRaceOptions } from "../classes/player_character/player_character_race";
import { IChargenPowers, IChargenPowerVars } from "../classes/player_character/power";
import { IChargenRiftsTattoo, IRiftsTattoosObjectVars } from "../classes/player_character/riftsTattoos";
import { IChargenRobotMod, IRobotModObjectVars } from "../classes/player_character/robot_mod";
import { ISuperPower2014ObjectVars } from "../classes/player_character/super_power_2014";
import { IChargenWeapon, IWeaponObjectVars } from "../classes/player_character/weapon";
import { IVehicleEntry, IVehicleObjectVars } from "../classes/vehicle_entry";
import { IBaseAttributes } from "./IBaseAttributes";
import { ICharacterState } from "./ICharacterState";
import { IEdgeCustom } from "./IChargenEdgeCustom";
import { IHindranceCustom } from "./IChargenHindranceCustom";
// import { IChargenArcaneBackground } from "./IChargenArcaneBackground";
// import { IChargenPowers } from "../classes/player_character/powers";
import { IPowerCustom } from "./IChargenPowerCustom";
import { IJournalEntry } from "./IJournalEntry";
import { IJSONSettingExport } from "./IJSONSettingExport";
import { IPeoplePlacesThings } from "./IPeoplePlacesThings";
import { ISkillAssignmentExport } from "./ISkillExport";
import { ISkillListImport } from "./ISkillListImport";

export interface ILooseAbility {
    name: string;
    description: string;
    value: string;
    enabled: boolean;
}

export interface IHindranceExport {
    id: number;
    specify: string | null;
    major: boolean;
}

export interface IEquippedInnateItems {
    primary: string;
    secondary: string;
}

export interface IEdgeExport {
    id: number;
    edgeOptions: IChargenEdgeObjectVars;

    // LEGACY
    specify?: string;

    selected_power_id_1?: string;
    selected_power_id_2?: string;
    selected_power_id_3?: string;

    selected_power_ab_1?: number;
    selected_power_ab_2?: number;
    selected_power_ab_3?: number;

    selected_power_name_1?: string;
    selected_power_name_2?: string;
    selected_power_name_3?: string;

    selected_power_summary_1?: string;
    selected_power_summary_2?: string;
    selected_power_summary_3?: string;

    selected_power_custom_1?: IPowerCustom;
    selected_power_custom_2?: IPowerCustom;
    selected_power_custom_3?: IPowerCustom;

    selected_skill_1?: string;
    selected_skill_2?: string;

    selected_combat_edge?: string;

    selected_ab_uuid?: string;

    selected_power_limitation_range_1?: string;
    selected_power_limitation_range_2?: string;
    selected_power_limitation_range_3?: string;

    selected_power_limitation_aspect_1?: string;
    selected_power_limitation_aspect_2?: string;
    selected_power_limitation_aspect_3?: string;

    selected_power_innate_1?: boolean;
    selected_power_innate_2?: boolean;
    selected_power_innate_3?: boolean;

    selected_attribute?: string;

    selected_ability_item?: string;

    selected_trait?: string;

    herosJourneyTableSelections?: number[];
    herosJourneyTableItemSelections?: number[];
    herosJourneyTableItemCompletions?: number[];
    herosJourneyTableItemSubChoices?: number[];
    herosJourneyTableItemSpecifications?: string[];
}

// export interface DEPRECATED_IJSONArmorExport {
//     cost_buy: number;
//     custom?: IChargenArmor;
//     equipped_armor: boolean;
//     equipped_armor2: boolean;
//     equipped_primary: boolean;
//     equipped_screen: boolean;
//     equipped_secondary: boolean;
//     id: number;
//     count_current: number;
//     requires_2_hands: boolean;
//     settingItem: boolean;
//     uuid: string;
//     selected_mode: number;
//     framework_item: boolean;
// }

export interface IJSONArmorExport {
    id: number;
    def: IChargenArmor | null;
    options: IArmorObjectVars | null;
}

export interface IJSONVehicleExport {
    id: number;
    def: IVehicleEntry | null;
    options: IVehicleObjectVars | null;
}

export interface IJSONRobotModExport {
    id: number;
    def: IChargenRobotMod | null;
    options: IRobotModObjectVars | null;
}
export interface IJSONCyberwareExport {
    id: number;
    def: IChargenCyberware | null;
    options: ICyberwareObjectVars | null;
}

export interface IJSONRiftsTattoosExport {
    id: number;
    def: IChargenRiftsTattoo | null;
    options: IRiftsTattoosObjectVars | null;
}

export interface IJSONSPC2014PowerExport {
    id: number;
    def: IChargenWeapon | null;
    options: ISuperPower2014ObjectVars | null;
}

export interface IJSONWeaponExport {
    id: number;
    def: IChargenWeapon | null;
    options: IWeaponObjectVars | null;
}

// export interface DEPRECATED_IJSONWeaponExport {
//     cost_buy: number;
//     custom?: IChargenWeapon;
//     equipped_primary: boolean;
//     equipped_secondary: boolean;
//     id: number;
//     scifi_mod: string;
//     count_current: number;
//     uuid: string;
//     settingItem: boolean;
//     framework_item: boolean;
// }

export interface IVehiclesExport {
    cost_buy: number;
    custom?: IVehicleEntry;
    id: number;
    contains: IContainerItemExport[];
    uuid: string;
    settingItem: boolean;
    framework_item: boolean;
}

// export interface DEPRECATED_IJSONGearExport {
//     cost_buy: number;
//     custom?: IChargenGear;
//     id: number;
//     count_current: number;
//     contains: IContainerItemExport[];
//     equipped_primary: boolean;
//     ​​​equipped_secondary: boolean;
//     dropped_in_combat: boolean;
//     equipped: boolean;
//     settingItem: boolean;
//     uuid: string;
//     framework_item: boolean;
// }

export interface IJSONGearExport {
    id: number;
    def: IChargenGear | null;
    options: IGearObjectVars | null;
}

export interface IContainerItemExport {
    cost_buy: number;
    custom: IChargenGear| IChargenWeapon | IChargenArmor | null;
    id: number;
    name: string;
    count_current: number;
    container: boolean;
    total_cost_buy: number;
    total_weight: number;
    type: string;
    weight: number;
    quantity: number;
    weight_display: string;
    scifi_mod?: string;
    setting_item: boolean;
    uuid: string;
    contains: IContainerItemExport[];
    enhancements: IGearEnhancementItemExport[];
}

export interface IAdvancementExport {
    type: string;
    target1: string;
    target2: string;
    target3: string;
    target4: string;
    target5: string;
    target6: string;
    target7: string;
    target8: string;
}

export interface ICustomGearExport {
    quantity: number;
    cost: number;
    name: string;
    summary: string;
    weight: number;
    rippersReasonCost?: number;
    dropped_in_combat: boolean;             // For V2 Custom Containers
    container?: boolean;                    // For V2 Custom Containers
    contains?: IContainerItemExport[];      // For V2 Custom Containers
}

export interface ICustomCyberwareExport {
    quantity: number;
    cost: number;
    name: string;
    summary: string;
    weight: number;
    strain: number;
    effects: string[];
    settingItem: boolean;
}

export interface ICustomRobotModExport {
    quantity: number;
    cost: number;
    name: string;
    summary: string;
    weight: number;
    mods: number;
    effects: string[];
    settingItem: boolean;
}

export interface IRobotModExport {
    cost_buy: number;
    custom?: IChargenRobotMod;
    id: number;
    selected_trait: string;
    selected_edge: string;
    selected_skill: string;
    selected_attribute: string;
    ranks: number;
    customName: string;
    selected_melee_weapon_uuid: string;
    selected_ranged_weapon_uuid: string;
    quantity: number;
    framework_item: boolean;
    settingItem: boolean;
}

export interface ICyberwareExport {
    cost_buy: number;
    custom?: IChargenCyberware;
    id: number;
    selected_trait: string;
    selected_edge: string;
    selected_skill: string;
    selected_attribute: string;
    ranks: number;
    customName: string;
    selected_melee_weapon_uuid: string;
    selected_ranged_weapon_uuid: string;
    quantity: number;
    framework_item: boolean;
    settingItem: boolean;
}

export interface ICustomWeaponExport {
    quantity: number;
    ap: number;
    cost: number;
    damage: string;
    display_weight: boolean;
    equipped_armor: boolean;
    equipped_armor2: boolean;
    equipped_primary: boolean;
    equipped_screen: boolean;
    equipped_secondary: boolean;
    name: string;
    requires_2_hands: boolean;
    parry_modifier: number;
    count_current: number;
    range: string;
    reach: number;
    rof: number;
    shots: number;
    summary: string;
    total_cost: number;
    total_cost_hr: string;
    total_weight: number;
    total_weight_hr: string;
    two_hands: number;
    weight: number;
}

export interface ICustomArmorExport {
    quantity: number;
    armor: number;
    cost: number;
    covers_arms: boolean;
    covers_face: boolean;
    covers_head: boolean;
    covers_legs: boolean;
    covers_torso: boolean;
    equipped_armor: boolean;
    equipped_armor2: boolean;
    equipped_primary: boolean;
    equipped_screen: boolean;
    equipped_secondary: boolean;
    is_shield: boolean;
    min_strength: string;
    name: string;
    parry: number;
    count_current: number;
    summary: string;
    total_cost: number;
    total_cost_hr: string;
    total_weight: number;
    total_weight_hr: string;
    toughness: number;
    weight: number;
    stackable: boolean;
    requires_2_hands: boolean;
}

export interface ILEGACYJSONPowerExport {
    abid: number;
​​​    custom_description: string[] | string;
​​​    custom_name: string;
    id: number;
    name: string;
    limitation_aspect: string;
    limitation_range: string;
    innate_power: boolean;
    uuid: string;
    setting_item: boolean;
    selected_programmatically: boolean;
}

// export interface IPowerCustom {
//     duration: string;
//     name: string;
//     power_points: string;
//     range: string;
//     summary: string;
// }

export interface IJSONArcaneItemPowerExport {
    book_page: string;
    duration: string;
    name: string;
    power_points: string;
    range: string;
}

export interface IJSONArcaneItemExport {
    current_power_points: string;
    name: string;
    power_points: number;
    powers: IJSONArcaneItemPowerExport[];
    summary: string;
    select_any_power: boolean;
    select_tw_powers: boolean;
}

export interface IJSONPowerExport {
    power_id: number,
    power_def: IChargenPowers | null,
    power_vars: IChargenPowerVars | null;
}

export interface IJSONBaseSpecify {
    skill: string;
    specify: string;
    index: number;
}

export interface IJSONPlayerCharacterExport {
    version: number;
    session_id: number;
    allowAdvancementTraitAlteration: boolean;

    prompt_specify_values: { [index: string]: string };

    race_choices: IRaceOptions;
    last_save_id: number;
    saved_image: string;
    saved_token_image: string;
    saved_setting_image: string;

    linguist_boosted_skills: string[];

    ab_selected: number;
    profession_or_title: string;
    ​advancement_count: number;
    advancement_precalc: number;
    advancements: IChargenAdvancement[];
    allied_extras: IBestiaryEntry[];
    arcane_backgrounds: IChargenArcaneBackgroundObjectVars[];
    // arcane_items: Array [];

    // wealthDie: string;
    attribute_assignments: IBaseAttributes;
    background: string | string[];
    wealth_die: string;

    additional_statistics: IAdditionalStatistic[];

    gm_setting_share: string;

    selected_factions: string[];

    wealth_adjusted: number;

    state?: ICharacterState;

    fatigue_current: number;
    wounds_current: number;

    loose_attributes: ILooseAbility[];

    image_updated: Date;
    image_upload: string;

    image_token_updated: Date;
    image_token_upload: string;

    base_specifies: IJSONBaseSpecify[];
    custom_armor: ICustomArmorExport[];

    custom_gear: ICustomGearExport [];

    // custom_powers: IPowerCustom [];
    custom_weapons: ICustomWeaponExport[];
    cyberware_custom: ICustomCyberwareExport [];

    description: string[] | string;
    edges: IEdgeExport[];
    // fatigue_current: 0

    custom_edges: IChargenEdge[];
    custom_hindrances: IChargenHindrance[];

    vehicles_purchased?: IVehiclesExport[];
    gender: string;
    age: string;
    hindrances: IHindranceExport[];
    journal: IJournalEntry[];
    multiple_languages: string[];
    name: string;
    native_language?: string;
    native_languages: string[];
    ​people_places_things: IPeoplePlacesThings[];
    perks: string[];
    player_name: string;
    powers_installed: ILEGACYJSONPowerExport[];
    precalc_xp: number;
    race: number;
    race_custom: IChargenRace | null;
    race_ability_specifies: string[];
    race_ability_alternative_choices: number[];
    // robot_mods_custom: Array [];
    // robot_mods_purchased: Array [];
    setting: IJSONSettingExport;
    skill_assignments: ISkillAssignmentExport[];
    skill_specializations: Dictionary<string[]>;
    skills_custom: ISkillListImport[];
    spc_powers?: ISuperPower2014ObjectVars[];

    spc_2014_powers: IJSONSPC2014PowerExport[];
    spc_super_karma: boolean;
    ​
    uuid: string;
    // wealth_die: string;
    ​
    // weapons_purchased?: DEPRECATED_IJSONWeaponExport[] ;    // LEGACY - DELETE LATER
    // gear_purchased?: DEPRECATED_IJSONGearExport[] ;                // LEGACY - DELETE LATER
    // armor_purchased?: DEPRECATED_IJSONArmorExport [] ;             // LEGACY - DELETE LATER
    // cyberware_purchased?: ICyberwareExport [];             // LEGACY - DELETE LATER
    // robot_mods_purchased?: IRobotModExport[];             // LEGACY - DELETE LATER

    purchased_weapons: IJSONWeaponExport[];
    purchased_gear: IJSONGearExport[];
    purchased_armor: IJSONArmorExport[];
    purchased_cyberware: IJSONCyberwareExport[];
    purchased_rifts_tattoos: IJSONRiftsTattoosExport[];
    purchased_robot_mods: IJSONRobotModExport[];
    purchased_vehicles: IJSONVehicleExport[];
    ​
    // wounds_current: number;
    // image_upload: string;
    etu_scholarship_bonus: number;
    etu_majors: string;
    etu_extracurricular: string;
    ​
    xp: number;

    framework: IFrameworkSelection | null;
    monster_framework: IMonsterFrameworkSelection | null;

    added_edge_options: { [index: string]: IChargenEdgeObjectVars[] };
    added_hindrance_options: { [index: string]: IChargenHindranceOptions[] };

    equipped_innate: IEquippedInnateItems;
}