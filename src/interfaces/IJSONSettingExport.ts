import { IPowerCustom } from "./IChargenPowerCustom";
import { IChargenRace } from "../classes/player_character/player_character_race";
import { IChargenWeapon } from "../classes/player_character/weapon";
import { IChargenGear } from "../classes/player_character/gear";
import { IChargenArmor } from "../classes/player_character/armor";
import { IChargenHindrance } from "../classes/player_character/hindrance";
import { IChargenEdge } from "../classes/player_character/edge";
import { ISkillListImport } from "./ISkillListImport";
import { IChargenPowers } from "../classes/player_character/power";
import { IVehicleEntry } from "../classes/vehicle_entry";
import { IChargenCyberware } from "../classes/player_character/cyberware";
import { IChargenFramework } from "../classes/player_character/player_character_framework";
import { IChargenArcaneBackground } from "../classes/player_character/arcane_background";
import { ISVGOptions } from "../character-sheet/SVGOptions";
import { IBaseObjectExport } from "../classes/_base_object";
import { IChargenRobotMod } from "../classes/player_character/robot_mod";
import { IChargenRiftsTattoo } from "../classes/player_character/riftsTattoos";
import { IGearEnhancementExport } from "../classes/player_character/gear_enhancement";

export interface IJSONSettingExport extends IBaseObjectExport {
    active_setting_rules: string[];
    svgPrintOptions: ISVGOptions | null;

    number_native_languages: number;
    native_language_name: string;

    swade_spc_campaign_power_level: number;
    swade_spc_campaign_points_adjust: number
    // setting_item: boolean;
    ​books: number[];
    ​core_skills: string[];
    ​extra_edges: number;
    ​extra_perk_points: number;
    image_updated: Date;
    ​image_upload: string;
    ​intro: string[] | string;
    background: string[] | string;
    maxLimitationPowerBonus: number;
    commonPowerTrappings: string[];
    // ​name: string;
    // id: number;
    // uuid: string;
    // active: boolean;
    wildcard_only: boolean;
    developer_only: boolean;
    admin_only: boolean;
    ​notes: string[] | string;
    ​skills_add: string[];
    ​skills_banned: string[];
    ​skills_knowledge: string[];
    skills_languages: string[];

    effects: string[];
    additional_statistics: string[];

    uses_factions: boolean;
    setting_factions: string[];

    custom_vehicles: IVehicleEntry[];
    custom_gear_enhancements: IGearEnhancementExport[];

    no_validation: boolean;

    hide_human_race: boolean;
    hide_native_language: boolean;

    ​spc_power_level_key: string;
    ​spc_power_limit: number;
    ​spc_power_points: number;
    ​spc_rising_stars: boolean;
    ​starting_attribute_points: number;
    ​starting_skill_points: number;
    ​uses_encumbrance: boolean;
    ​uses_min_strength: boolean;
    ​uses_wealth: boolean;
    ​uses_wealth_die: boolean;
    ​wealth_notation: string;
    ​wealth_notation_trailing: boolean;
    ​wealth_starting: number;
    // wealth_die: string;

    disableCustomRace?: boolean;
    disableCustomFramework?: boolean;
    enableBookRaceCustomizing?: boolean;

    remove_skills: string[];
    custom_skills: ISkillListImport[];
    custom_armor: IChargenArmor[];
    custom_weapons: IChargenWeapon[];
    custom_gear: IChargenGear[];
    custom_powers: IChargenPowers[];
    // custom_arcane_backgrounds: ICustomGearExport[];
    custom_races: IChargenRace[];
    custom_edges: IChargenEdge[];
    custom_hindrances: IChargenHindrance[];
    custom_cyberware: IChargenCyberware[];
    custom_frameworks: IChargenFramework[];
    custom_robot_mods: IChargenRobotMod[];
    custom_arcane_backgrounds: IChargenArcaneBackground[];
    custom_rifts_tattoos: IChargenRiftsTattoo[];

    forbidden_edges: number[];
    forbidden_races: number[];
    forbidden_hindrances: number[];
    forbidden_gear: number[];
    forbidden_weapons: number[];
    forbidden_armor: number[];
    forbidden_gear_enhancements: number[];
    forbidden_powers: number[];
    forbidden_arcane_backgrounds: number[];
    forbidden_vehicles: number[];
    forbidden_cyberware: number[];
    forbidden_frameworks: number[];
    forbidden_rifts_tattoos: number[];
    forbidden_robot_mods: number[];

    // created_by_name: string;
    // updated_by_name: string;
    // deleted_by_name: string;

    // updated_by: number;
    // updated_on: Date;

    // created_by: number;
    // created_on: Date;
    // deleted: number;
    // deleted_by: number;
    // deleted_on: Date;

    rank_name_novice: string;
    rank_name_seasoned: string;
    rank_name_veteran: string;
    rank_name_heroic: string;
    rank_name_legendary: string;
}
