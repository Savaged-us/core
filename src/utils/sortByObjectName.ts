import { Announcement } from "../classes/announcement";
import { BannerAd } from "../classes/banner-ad";
import { IBestiaryEntry } from "../classes/bestiary_entry";
import { Book, IBook } from "../classes/book";
import { Partner } from "../classes/partner";
import { IChargenArcaneBackground } from "../classes/player_character/arcane_background";
import { ArcaneItem } from "../classes/player_character/arcane_item";
import { IChargenArmor } from "../classes/player_character/armor";
import { IChargenCyberware } from "../classes/player_character/cyberware";
import { IChargenEdge } from "../classes/player_character/edge";
import { IChargenGear } from "../classes/player_character/gear";
import { IGearEnhancementExport } from "../classes/player_character/gear_enhancement";
import { IChargenHindrance } from "../classes/player_character/hindrance";
import { PlayerCharacter } from "../classes/player_character/player_character";
import { IChargenFramework } from "../classes/player_character/player_character_framework";
import { IChargenMonsterFramework } from "../classes/player_character/player_character_monster_framework";
import { IChargenFrameworkTableDefinition } from "../classes/player_character/player_character_framework_table";
import { IChargenRace } from "../classes/player_character/player_character_race";
import { IChargenRaceAbility } from "../classes/player_character/player_character_race_ability";
import { IChargenPowers } from "../classes/player_character/power";
import { IChargenSuperPower2014, SuperPower2014 } from "../classes/player_character/super_power_2014";
import { SuperPower2021 } from "../classes/player_character/super_power_2021";
import { IChargenWeapon } from "../classes/player_character/weapon";
import { IVehicleEntry } from "../classes/vehicle_entry";
import { BaseObject } from "../classes/_base_object";
import { IJSONSettingExport } from "../interfaces/IJSONSettingExport";

export function sortByObjectName(
    a: IJSONSettingExport | IChargenRace | IChargenRaceAbility | IBook | IChargenEdge | IChargenHindrance | IChargenGear | IChargenWeapon | IChargenArmor | IChargenPowers | IChargenArcaneBackground | IChargenCyberware | IChargenSuperPower2014  | IVehicleEntry | IChargenFramework | IChargenMonsterFramework | IChargenFrameworkTableDefinition | IBestiaryEntry | BaseObject | BannerAd | Announcement | Book | Partner | ArcaneItem | IGearEnhancementExport,
    b: IJSONSettingExport | IChargenRace | IChargenRaceAbility | IBook | IChargenEdge | IChargenHindrance | IChargenGear | IChargenWeapon | IChargenArmor | IChargenPowers | IChargenArcaneBackground | IChargenCyberware | IChargenSuperPower2014  | IVehicleEntry | IChargenFramework | IChargenMonsterFramework | IChargenFrameworkTableDefinition | IBestiaryEntry | BaseObject | BannerAd | Announcement | Book | Partner | ArcaneItem | IGearEnhancementExport,
): number {
    if( a.name.toLowerCase().trim().replace("the ", "") > b.name.toLowerCase().trim().replace("the ", "") )
        return 1
    else if ( a.name.toLowerCase().trim().replace("the ", "") < b.name.toLowerCase().trim().replace("the ", "") )
        return -1;
    else return 0;
}
