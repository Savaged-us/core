import { IBook } from "../classes/book";
import { IChargenEdge } from "../classes/player_character/edge";
import { IChargenHindrance } from "../classes/player_character/hindrance";
import { IChargenGear } from "../classes/player_character/gear";
import { IChargenWeapon } from "../classes/player_character/weapon";
import { IChargenRace } from "../classes/player_character/player_character_race";
import { IChargenArmor } from "../classes/player_character/armor";
import { IChargenRaceAbility } from "../classes/player_character/player_character_race_ability";
import { IChargenArcaneBackground } from "../classes/player_character/arcane_background";
import { IChargenPowers } from "../classes/player_character/power";
import { IChargenSuperPower2014 } from "../classes/player_character/super_power_2014";
import { IChargenCyberware } from "../classes/player_character/cyberware";
import { IJSONSettingExport } from "./IJSONSettingExport";
import { IChargenFramework } from "../classes/player_character/player_character_framework";
import { IChargenMonsterFramework } from "../classes/player_character/player_character_monster_framework";
import { IChargenFrameworkTableDefinition } from "../classes/player_character/player_character_framework_table";
import { IVehicleEntry } from "../classes/vehicle_entry";
import { IChargenRobotMod } from "../classes/player_character/robot_mod";
import { IBestiaryEntry } from "../classes/bestiary_entry";
import { IChargenSuperPower2021 } from "../classes/player_character/super_power_2021";
import { IChargenRiftsTattoo } from "../classes/player_character/riftsTattoos";
import { IGearEnhancementExport, IGearEnhancementItemExport } from "../classes/player_character/gear_enhancement";

export interface IChargenData {
    arcane_backgrounds: IChargenArcaneBackground[],
    armor: IChargenArmor[],
    books: IBook[],
    cyberware: IChargenCyberware[],
    edges: IChargenEdge[],
    gear: IChargenGear[],
    hindrances: IChargenHindrance[],
    powers: IChargenPowers[],
    race_abilities: IChargenRaceAbility[],
    races: IChargenRace[],
    super_powers_2014: IChargenSuperPower2014[],
    super_powers_2021: IChargenSuperPower2021[],
    weapons: IChargenWeapon[],
    chargen_rifts_tattoos: IChargenRiftsTattoo[],
    settings: IJSONSettingExport[],
    frameworks: IChargenFramework[],
    monster_frameworks: IChargenMonsterFramework[],
    tables: IChargenFrameworkTableDefinition[],
    vehicles: IVehicleEntry[],
    robot_mods: IChargenRobotMod[],
    bestiary: IBestiaryEntry[];

    gear_enhancements: IGearEnhancementExport[];
}