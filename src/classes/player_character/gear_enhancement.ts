import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { BaseObject, IBaseObjectExport } from "../_base_object";
import { DataObject, IDataObjectExport } from "../_data_object";
import { Armor } from "./armor";
import { Gear } from "./gear";
import { PlayerCharacter } from "./player_character";
import { Weapon } from "./weapon";

export class GearEnhancement extends BaseObject {

    name_prefix: string = "";
    name_suffix: string = "";

    for_armor: boolean = false;
    for_ammo: boolean = false;
    for_shield: boolean = false;
    for_weapon: boolean = false;

    ammunition_cost: number = 0;
    ammunition_ap: number = 0;
    ammunition_weight_multiplier: number = 1;
    weapon_ap: number = 0;
    weapon_parry: number = 0;
    weapon_min_str_adjustment: number = 0;
    weapon_weight_multiplier: number = 1;

    weapon_accuracy: number = 0;
    weapon_damage: number = 0;

    weapon_cost_adjustment: number = 0;
    weapon_cost_adjustment_is_multiplied: boolean = false;
    weapon_cost_adjustment_is_per_pound: boolean = false;
    weapon_cost_adjustment_is_per_ap: boolean = false;

    armor_min_str_adjustment: number = 0;
    armor_weight_multiplier: number = 1;
    armor_hardness_bonus: number = 0;
    armor_cost_adjustment: number = 0;
    armor_cost_adjustment_is_multiplied: boolean = false;
    armor_cost_adjustment_is_per_pound: boolean = false;
    armor_cost_adjustment_is_per_armor_value: boolean = false;

    armor_armor_bonus: number = 0;

    shield_min_str_adjustment: number = 0;
    shield_weight_multiplier: number = 1;

    shield_hardness_bonus: number = 0;
    shield_cost_adjustment: number = 0;
    shield_cost_adjustment_is_multiplied: boolean = false;
    shield_cost_adjustment_is_per_pound: boolean = false;
    shield_cost_adjustment_is_per_ap: boolean = false;

    shield_parry_bonus: number = 0;

    effects: string[] = [];

    constructor(
        initObj: IGearEnhancementExport | null = null,
    ) {
        super(initObj);

        this.import_obj( initObj );

    }

    applyEffects(
        charObj: PlayerCharacter,
    ) {
        ApplyCharacterEffects(
            this.effects,
            charObj,
            "Gear Enhancement: " + this.name,
            "",
            "",
            null,
            true,
        );
    }

    reset() {
        super.reset();
        this.name_prefix = "";
        this.name_suffix = "";
        this.summary = "";

        this.effects = [];

        this.for_armor = false;
        this.for_shield = false;
        this.for_weapon = false;
        this.for_ammo = false;

        this.reset_shield();
        this.reset_armor();
        this.reset_gear();
        this.reset_weapon();
    }

    reset_shield() {

        this.effects = [];
        this.shield_min_str_adjustment = 0;
        this.shield_weight_multiplier = 1;
        this.shield_hardness_bonus = 0;
        this.shield_cost_adjustment = 0;
        this.shield_cost_adjustment_is_multiplied = false;
        this.shield_cost_adjustment_is_per_pound = false;
        // this.shield_cost_adjustment_is_per_ap = false;

        this.shield_parry_bonus = 0;
    }
    reset_armor() {
        this.effects = [];
        this.armor_min_str_adjustment = 0;
        this.armor_weight_multiplier = 1;
        this.armor_hardness_bonus = 0;
        this.armor_cost_adjustment = 0;
        this.armor_cost_adjustment_is_multiplied = false;
        this.armor_cost_adjustment_is_per_pound = false;
        this.armor_cost_adjustment_is_per_armor_value = false;

        this.armor_armor_bonus = 0;

    }
    reset_weapon() {
        this.effects = [];
        this.weapon_min_str_adjustment = 0;
        this.weapon_weight_multiplier = 1;

        this.weapon_cost_adjustment = 0;
        this.weapon_cost_adjustment_is_multiplied = false;
        this.weapon_cost_adjustment_is_per_pound = false;
        this.weapon_cost_adjustment_is_per_ap = false;

        this.weapon_accuracy = 0;
        this.weapon_damage = 0;
        this.weapon_ap = 0;
        this.weapon_parry = 0;
    }
    reset_gear() {
        this.effects = [];
        this.ammunition_cost = 0;
        this.ammunition_ap = 0;
        this.ammunition_weight_multiplier = 1;

    }

    import_obj(
        initObj: IGearEnhancementExport | null = null
    ) {
        // console.log("initObj.book_id", initObj?.book_id);
        super.import( initObj, this._char ? this._char.getAvailableData().books : []  );
        if( initObj ) {

            this.name_prefix = initObj.name_prefix;
            this.name_suffix = initObj.name_suffix;

            this.ammunition_cost = initObj.ammunition_cost;

            if( initObj.ammunition_ap )
                this.ammunition_ap = initObj.ammunition_ap;

            this.for_armor = initObj.for_armor;
            this.for_shield = initObj.for_shield;
            this.for_weapon = initObj.for_weapon;
            this.for_ammo = initObj.for_ammo;

            this.weapon_min_str_adjustment = initObj.weapon_min_str_adjustment;
            this.weapon_weight_multiplier = initObj.weapon_weight_multiplier;

            this.weapon_cost_adjustment = initObj.weapon_cost_adjustment;
            this.weapon_cost_adjustment_is_multiplied = initObj.weapon_cost_adjustment_is_multiplied;
            this.weapon_cost_adjustment_is_per_pound = initObj.weapon_cost_adjustment_is_per_pound;
            this.weapon_cost_adjustment_is_per_ap = initObj.weapon_cost_adjustment_is_per_ap;

            this.weapon_accuracy = initObj.weapon_accuracy;
            this.weapon_damage = initObj.weapon_damage;
            this.weapon_ap = initObj.weapon_ap;

            if(initObj.weapon_parry) {
                this.weapon_parry = initObj.weapon_parry
            }

            if(initObj.effects) {
                this.effects = initObj.effects
            }

            this.armor_min_str_adjustment = initObj.armor_min_str_adjustment;
            this.armor_weight_multiplier = initObj.armor_weight_multiplier;
            if( initObj.armor_hardness_bonus )
                this.armor_hardness_bonus = initObj.armor_hardness_bonus;
            this.armor_cost_adjustment = initObj.armor_cost_adjustment;
            this.armor_cost_adjustment_is_multiplied = initObj.armor_cost_adjustment_is_multiplied;
            this.armor_cost_adjustment_is_per_pound = initObj.armor_cost_adjustment_is_per_pound;
            this.armor_cost_adjustment_is_per_armor_value = initObj.armor_cost_adjustment_is_per_armor_value;

            this.ammunition_weight_multiplier = 1;
            if( initObj.ammunition_weight_multiplier )
                this.ammunition_weight_multiplier = initObj.ammunition_weight_multiplier;

            this.armor_armor_bonus = initObj.armor_armor_bonus;

            this.shield_min_str_adjustment = initObj.shield_min_str_adjustment;
            this.shield_weight_multiplier = initObj.shield_weight_multiplier;
            if( initObj.shield_hardness_bonus )
                this.shield_hardness_bonus = initObj.shield_hardness_bonus;
            this.shield_cost_adjustment = initObj.shield_cost_adjustment;
            this.shield_cost_adjustment_is_multiplied = initObj.shield_cost_adjustment_is_multiplied;
            this.shield_cost_adjustment_is_per_pound = initObj.shield_cost_adjustment_is_per_pound;
            // this.shield_cost_adjustment_is_per_ap = initObj.shield_cost_adjustment_is_per_ap;

            this.shield_parry_bonus = initObj.shield_parry_bonus;
        }
    }

    export(): IGearEnhancementExport {
        let rv = super.export() as IGearEnhancementExport;

        rv.name_prefix = this.name_prefix;
        rv.name_suffix = this.name_suffix;

        rv.ammunition_cost = this.ammunition_cost;
        rv.ammunition_ap = this.ammunition_ap;
        rv.ammunition_weight_multiplier = this.ammunition_weight_multiplier;

        rv.for_armor = this.for_armor;
        rv.for_shield = this.for_shield;
        rv.for_weapon = this.for_weapon;
        rv.for_ammo = this.for_ammo;

        rv.effects = this.effects;

        rv.weapon_min_str_adjustment = this.weapon_min_str_adjustment;
        rv.weapon_weight_multiplier = this.weapon_weight_multiplier;

        rv.weapon_cost_adjustment = this.weapon_cost_adjustment;
        rv.weapon_cost_adjustment_is_multiplied = this.weapon_cost_adjustment_is_multiplied;
        rv.weapon_cost_adjustment_is_per_pound = this.weapon_cost_adjustment_is_per_pound;
        rv.weapon_cost_adjustment_is_per_ap = this.weapon_cost_adjustment_is_per_ap;

        rv.weapon_accuracy = this.weapon_accuracy;
        rv.weapon_damage = this.weapon_damage;
        rv.weapon_ap = this.weapon_ap;
        rv.weapon_parry = this.weapon_parry;
        rv.armor_min_str_adjustment = this.armor_min_str_adjustment;
        rv.armor_weight_multiplier = this.armor_weight_multiplier;

        rv.armor_hardness_bonus = this.armor_hardness_bonus;
        rv.armor_cost_adjustment = this.armor_cost_adjustment;
        rv.armor_cost_adjustment_is_multiplied = this.armor_cost_adjustment_is_multiplied;
        rv.armor_cost_adjustment_is_per_pound = this.armor_cost_adjustment_is_per_pound;
        rv.armor_cost_adjustment_is_per_armor_value = this.armor_cost_adjustment_is_per_armor_value;

        rv.armor_armor_bonus = this.armor_armor_bonus;

        rv.shield_min_str_adjustment = this.shield_min_str_adjustment;
        rv.shield_weight_multiplier = this.shield_weight_multiplier;
        rv.shield_hardness_bonus = this.shield_hardness_bonus;
        rv.shield_cost_adjustment = this.shield_cost_adjustment;
        rv.shield_cost_adjustment_is_multiplied = this.shield_cost_adjustment_is_multiplied;
        rv.shield_cost_adjustment_is_per_pound = this.shield_cost_adjustment_is_per_pound;
        // rv.shield_cost_adjustment_is_per_ap = this.shield_cost_adjustment_is_per_ap;

        rv.shield_parry_bonus = this.shield_parry_bonus;
        return rv;
    }

    apply_shield( obj: Armor  ) {

    }

    apply_gear( obj: Gear  ) {

    }

    apply_armor( obj: Armor  ) {

    }

    apply_weapon( obj: Weapon  ) {

    }
}

export interface IGearEnhancementExport extends IBaseObjectExport{

    name_prefix: string;
    name_suffix: string;

    effects: string[];
    ammunition_cost: number;
    ammunition_ap: number;
    ammunition_weight_multiplier: number;

    for_armor: boolean;
    for_shield: boolean;
    for_weapon: boolean;
    for_ammo: boolean;

    weapon_min_str_adjustment: number;
    weapon_weight_multiplier: number;

    weapon_cost_adjustment: number;
    weapon_cost_adjustment_is_multiplied: boolean;
    weapon_cost_adjustment_is_per_pound: boolean;
    weapon_cost_adjustment_is_per_ap: boolean;

    weapon_accuracy: number;
    weapon_damage: number;
    weapon_ap: number;
    weapon_parry: number;

    armor_min_str_adjustment: number;
    armor_weight_multiplier: number;

    armor_cost_adjustment: number;
    armor_hardness_bonus: number;
    armor_cost_adjustment_is_multiplied: boolean;
    armor_cost_adjustment_is_per_pound: boolean;
    armor_cost_adjustment_is_per_armor_value: boolean;

    armor_armor_bonus: number;

    shield_min_str_adjustment: number;
    shield_weight_multiplier: number;

    shield_cost_adjustment: number;
    shield_hardness_bonus: number;
    shield_cost_adjustment_is_multiplied: boolean;
    shield_cost_adjustment_is_per_pound: boolean;
    // shield_cost_adjustment_is_per_ap: boolean;
    shield_parry_bonus: number;
}

export interface IGearEnhancementItemExport {
    id: number;
    def: IGearEnhancementExport | null;
    setting_item: boolean,
}