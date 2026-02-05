import { el } from "date-fns/locale";
import { IExportArmor, IExportShield } from "../../interfaces/IExportStatsOutput";
import { ICustomArmorExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { FormatMoney, replaceAll } from "../../utils/CommonFunctions";
import { convertMarkdownToHTML } from "../../utils/convertMarkdownToHTML";
import { getDieIndexFromLabel, getDieLabelFromIndex } from "../../utils/Dice";
import { getPathfinderArmorLabel } from "../../utils/PathfinderFunctions";
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from "../_base_object";
import { GearEnhancement, IGearEnhancementItemExport } from "./gear_enhancement";
import { IAlternateArmorData, PlayerCharacter } from "./player_character";
import { IChargenWeapon, Weapon } from "./weapon";

export enum EPathfinderArmorType {
    None = 0,
    Light = 1,
    Medium = 2,
    Heavy = 3,
}

export interface IChargenArmor extends IBaseObjectExport {
    armor_value: number;
    abilities: string[];
    hardness: number;
    stacks_with_other_armor: boolean;
    secondary_armor_value: number;
    toughness: number;
    pf_armor_type: EPathfinderArmorType;
    ap_vs_lasers: number;
    rigid_armor: boolean;
    covers_head: boolean;
    covers_face: boolean;
    covers_torso: boolean;
    covers_arms: boolean;
    covers_legs: boolean;
    negate_4_ap: boolean;
    is_shield: boolean;
    is_energy_screen: boolean;
    shield_parry_bonus: number;
    shield_armor_vs_ranged: number;
    shield_cover_vs_ranged: number;
    minimum_strength: string;
    requires_2_hands: boolean;
    readOnly: boolean;
    pace: number,
    run: string,
    set_strength: string;
    heavy: boolean,
    size: number;
    default_model_label: string;
    alternate_modes: IArmorAlternateMode[];
    integrated_weapons: IChargenWeapon[];
    zero_weight_when_equipped: boolean;

    cost: number;
    effects: string[];
    weight: number;
    quantity: number;

}

export interface IArmorAlternateMode {
    name: string;
    armor_value: number;
    minimum_strength: string;
    secondary_armor_value: number;
    toughness: number;
    heavy: boolean;
    effects: string[];
    weight: number;
}

export class Armor extends BaseObject {
    // _char: PlayerCharacter | null = null;
    // isCustom: boolean = false;
    readOnly: boolean = false;
    gear_enhancements: GearEnhancement[] = [];
    pfArmorType: number = 0;

    _hasBeenApplied: boolean = false;

    selectedMode: number = -1;
    defaultModeLabel: string = "normal";

    size: number = 0;

    heavy: boolean = false;
    integratedWeapons: Weapon[];

    frameworkItem: boolean = false;

    buyCost: number = 0;
    equippedArmor: boolean = false;
    equippedPrimary: boolean = false;
    equippedScreen: boolean = false;
    equippedSecondary: boolean = false;
    quantity: number = 1;

    pace: number;
    run: string;
    setStrength: string;

    active: boolean;
    apVsLasers: number;
    armorValue: number;
    cost: number;
    coversArms: boolean = false;
    coversFace: boolean = false;
    coversHead: boolean = false;
    coversLegs: boolean = false;
    coversTorso: boolean = true;
    createdBy: number;
    createdOn: Date;
    deleted: boolean;
    deletedBy: number;
    deletedOn: Date;
    id: number;
    isEnergyScreen: boolean;
    isShield: boolean;
    minimumStrength: string;
    name: string;
    namePlural: string;
    negate4ap: boolean;
    page: string;
    rigidArmor: boolean;
    secondaryArmorValue: number;
    shieldArmorVsRanged: number;
    shieldCoverVsRanged: number;
    shieldParryBonus: number;
    stacksWithOtherArmor: boolean;
    abilities: string[];
    toughness: number;
    type: string;
    updatedBy: number;
    updatedOn: Date;
    versionOf: number;
    weight: number;
    requires2Hands: boolean;
    hardness: number = 0;

    effects: string[] = [];

    createdByName: string;
    updatedByName: string;
    deletedByName: string;

    summary: string;
    zeroWeightWhenEquipped: boolean;

    alternateModes: IArmorAlternateMode[] = [];
    constructor(
        initObj: IChargenArmor | null = null,
        characterObject: PlayerCharacter | null = null,
    ) {
        super(
            initObj as IBaseObjectExport,
            characterObject,
        )
        this.reset();
        // if( characterObject ) {
        //     this._char = characterObject;
        // }
        if( initObj ) {
            this.import( initObj )
        }

        this.buyCost = this.cost;
    }

    import( initObj: IChargenArmor) {
        super.import( initObj as IBaseObjectExport, this._char ? this._char.getAvailableData().books : []  );
        this.gear_enhancements = [];
        this.pfArmorType = 0;
        if( initObj.pf_armor_type ) {
            //@ts-ignore
            if(  initObj.pf_armor_type !== "string " ) {
                this.pfArmorType = initObj.pf_armor_type;
            } else {
                //@ts-ignore
                if( initObj.pf_armor_type.toLowerCase() == "none" )
                    this.pfArmorType = EPathfinderArmorType.None;
                //@ts-ignore
                if( initObj.pf_armor_type.toLowerCase() == "light" )
                    this.pfArmorType = EPathfinderArmorType.Light;
                //@ts-ignore
                if( initObj.pf_armor_type.toLowerCase() == "medium" )
                    this.pfArmorType = EPathfinderArmorType.Medium;
                //@ts-ignore
                if( initObj.pf_armor_type.toLowerCase() == "heavy" )
                    this.pfArmorType = EPathfinderArmorType.Heavy;
            }
        }

        if( initObj.zero_weight_when_equipped ) {
            this.zeroWeightWhenEquipped = true;
        }

        if( initObj.set_strength ) {
            this.setStrength = initObj.set_strength;
        }
        if( initObj.pace ) {
            this.pace = initObj.pace;
        }
        if( initObj.run ) {
            this.run = initObj.run;
        }
        if( initObj.hardness ) {
            this.hardness = initObj.hardness;
        }

        if( initObj.abilities ) {
            this.abilities = initObj.abilities;
        }

        if( initObj.size ) {
            this.size = initObj.size;
        }
        if( initObj.cost ) {
            this.cost = initObj.cost;
        }

        if( initObj.default_model_label ) {
            this.defaultModeLabel = initObj.default_model_label;
        }

        if( typeof(initObj.cost) !== "undefined" ) {
            this.cost = initObj.cost;
        }
        if( initObj.weight ) {
            this.weight = initObj.weight;
        }
        if( initObj.effects ) {
            this.effects = initObj.effects;
        }
        if( initObj.quantity ) {
            this.quantity = initObj.quantity;
        }

        if( initObj.integrated_weapons && initObj.integrated_weapons.length > 0 ) {
            for( let weaponDef of initObj.integrated_weapons ) {
                let weapon = new Weapon(  weaponDef, this._char );
                weapon.isArmorWeapon = true;
                this.integratedWeapons.push( weapon);
            }
        }

        if( initObj.alternate_modes ) {
            this.alternateModes = initObj.alternate_modes;
        }

        for( let mode of this.alternateModes ) {
            if( !mode.effects ) {
                mode.effects = [];
            }
            if( !mode.weight ) {
                mode.weight = initObj.weight;
            }
        }

        if( initObj.heavy ) {
            this.heavy = initObj.heavy;
        }

        // if( initObj.active ) {
        //     this.active = initObj.active;
        // }
        // if( initObj.name_plural ) {
        //     this.namePlural = initObj.name_plural;
        // }
        // if( initObj.page ) {
        //     this.page = initObj.page;
        // }
        // if( initObj.type ) {
        //     this.type = initObj.type;
        // }
        // if( initObj.book_id ) {
        //     this.book_id = initObj.book_id;
        // }

        if( typeof(initObj.cost) !== "undefined" ) {
            this.cost = initObj.cost;
        }
        if( initObj.weight ) {
            this.weight = initObj.weight;
        }
        if( initObj.armor_value ) {
            this.armorValue = initObj.armor_value;
        }
        if( initObj.stacks_with_other_armor ) {
            this.stacksWithOtherArmor = initObj.stacks_with_other_armor;
        }

        if( initObj.secondary_armor_value ) {
            this.secondaryArmorValue = +initObj.secondary_armor_value;
        }
        if( initObj.toughness ) {
            this.toughness = initObj.toughness;
        }
        if( initObj.ap_vs_lasers ) {
            this.apVsLasers = initObj.ap_vs_lasers;
        }
        if( initObj.rigid_armor ) {
            this.rigidArmor = initObj.rigid_armor;
        }

        if( typeof(initObj.covers_head) != "undefined" ) {
            this.coversHead = initObj.covers_head;
        }
        if( typeof(initObj.covers_face) != "undefined" ) {
            this.coversFace = initObj.covers_face;
        }
        if( typeof(initObj.covers_torso) != "undefined" ) {
            this.coversTorso = initObj.covers_torso;
        }
        if( typeof(initObj.covers_arms) != "undefined" ) {
            this.coversArms = initObj.covers_arms;
        }
        if( typeof(initObj.covers_legs) != "undefined" ) {
            this.coversLegs = initObj.covers_legs;
        }

        this.effects = [];
        if( initObj.effects ) {
            this.effects = initObj.effects;
        }

        // if( initObj.readOnly ) {
        //     this.readOnly = true;
        // }

        if( initObj.negate_4_ap ) {
            this.negate4ap = initObj.negate_4_ap;
        }
        if( initObj.is_shield ) {
            this.isShield = initObj.is_shield;
        }
        if( initObj.requires_2_hands ) {
            this.requires2Hands = initObj.requires_2_hands;
        }
        if( initObj.is_energy_screen ) {
            this.isEnergyScreen = initObj.is_energy_screen;
        }
        if( initObj.shield_parry_bonus ) {
            this.shieldParryBonus = initObj.shield_parry_bonus;
        }

        if( initObj.shield_armor_vs_ranged ) {
            this.shieldArmorVsRanged = initObj.shield_armor_vs_ranged;
        }
        if( initObj.shield_cover_vs_ranged ) {
            this.shieldCoverVsRanged = initObj.shield_cover_vs_ranged;
        }
        if( initObj.deleted ) {
            this.deleted = initObj.deleted;
        }
        if( initObj.shield_parry_bonus ) {
            this.shieldParryBonus = initObj.shield_parry_bonus;
        }

        if( initObj.minimum_strength ) {
            this.minimumStrength = initObj.minimum_strength;
        }

        if( initObj.quantity ) {
            this.quantity = initObj.quantity;
        }

        for( let alt of this.alternateModes ) {
            alt.secondary_armor_value = +alt.secondary_armor_value;
        }
    }

    getName(withQuantities: boolean = false): string {

        let suffix = "";
        let prefix = "";

        // console.log("getName this.gear_enhancements", this.gear_enhancements)
        for( let enh of this.gear_enhancements ) {

            if( enh.name_suffix.trim() ) {
                suffix = suffix + " " + enh.name_suffix.trim();
            }
            if( enh.name_prefix.trim() ) {
                prefix = prefix + enh.name_prefix.trim() + " ";
            }
        }

        // console.log("prefix", prefix)

        let modeText = "";
        if(
            this.alternateModes.length > 0
                &&
            this.selectedMode > -1
                &&
            this.alternateModes.length > this.selectedMode
        ) {
            modeText = " (" + this.alternateModes[ this.selectedMode].name + ")";
        }
        if( withQuantities && this.quantity > 1 ) {
            return prefix + this.namePlural + modeText  + suffix + "x" + this.quantity.toString();
        } else {
            return prefix + this.name + modeText + suffix;
        }
    }

    apply( charObj: PlayerCharacter | null = null ) {

        if( this._hasBeenApplied ) {
            console.warn( this.name + " has already been applied, skipping");
            return;
        }

        if( !charObj )
            charObj = this._char;

        if( !charObj )
            return;
        this._hasBeenApplied = true;

        if( this.equippedArmor || this.equippedPrimary || this.equippedSecondary || this.equippedScreen) {
            ApplyCharacterEffects(
                this.getEffects(),
                charObj,
                "Armor: " + this.name,
                "",
                "",
                null,
                true,
            );
        }
    }

    getBuyCost(): number {
        return this.buyCost;
    }

    getTotalWeight(): number {

        return this.getWeight();
    }

    getTotalCombatWeight(): number {
        return this.getWeight();
    }

    addAlternateMode() {
        this.alternateModes.push(
            {
                name: "",
                armor_value: this.armorValue,
                secondary_armor_value: 0,
                toughness: this.toughness,
                heavy: this.heavy,
                minimum_strength: this.minimumStrength,
                effects: this.effects,
                weight: this.weight,
            }
        );
    }

    getWeightHR(): string {

        if( this.zeroWeightWhenEquipped && this.equippedArmor ) {
            return "0 (" + this.getWeight(true).toLocaleString() + ")"
        } else {
            return  this.getWeight().toLocaleString();
        }

    }

    public calcReset() {
        this._hasBeenApplied = false;
    }

    getTotalBuyCost() {
        if(!this.quantity)
            this.quantity = 1;
        if(!this.buyCost)
            this.buyCost = 0;
        return this.buyCost * this.quantity;
    }

    getTotalCost(): number {
        return this.getCost() * this.quantity;
    }

    getCost() {
        let cost = this.cost;
        for( let enh of this.gear_enhancements ) {

            if( enh.armor_cost_adjustment_is_multiplied ) {
                if( this.isShield )
                    cost = cost * enh.shield_cost_adjustment;
                else
                    cost = cost * enh.armor_cost_adjustment;
            } else if ( enh.armor_cost_adjustment_is_per_armor_value ) {
                if( this.isShield )
                    cost += this.getArmorValue(true) * enh.shield_cost_adjustment;
                else
                    cost += this.getArmorValue(true) * enh.armor_cost_adjustment;
            } else if ( enh.armor_cost_adjustment_is_per_pound ) {
                if( this.isShield )
                    cost += this.getWeight() * enh.shield_cost_adjustment;
                else
                    cost += this.getWeight() * enh.armor_cost_adjustment;
            } else {
                if( this.isShield )
                    cost += enh.shield_cost_adjustment;
                else
                    cost += enh.armor_cost_adjustment;
            }

        }
        return cost;
    }
    getTotalCostHR(): string {
        if( this.cost != this.buyCost ) {
            return FormatMoney(this.buyCost * this.quantity, this._char && this._char.setting ? this._char.setting : null);
        } else {
            return FormatMoney(this.cost * this.quantity, this._char && this._char.setting ? this._char.setting : null);
        }
    }

    getCostHR(): string {
        if( this._char && this._char.setting ) {
            if( this.cost != this.buyCost ) {
                return FormatMoney(this.buyCost, this._char.setting);
            } else {
                return FormatMoney(this.cost * this.quantity, this._char.setting);
            }
        } else {
            if( this.cost != this.buyCost ) {
                return FormatMoney(this.buyCost, null);
            } else {
                return FormatMoney(this.cost * this.quantity, null);
            }
        }

    }

    getEffects(): string[]  {
        if(
            this.alternateModes.length > 0
                &&
            this.selectedMode > -1
                &&
            this.alternateModes.length > this.selectedMode
        ) {
            return this.alternateModes[ this.selectedMode ].effects;
        } else {
            return this.effects;
        }
    }

    getArmorValue(
        no_adjustments: boolean = false,
    ): number {
        let adj_value = 0;

        if( no_adjustments == false ) {
            for( let enh of this.gear_enhancements ){
                adj_value = enh.armor_armor_bonus;
            }
        }

        if(
            this.alternateModes.length > 0
                &&
            this.selectedMode > -1
                &&
            this.alternateModes.length > this.selectedMode
        ) {
            return (this.alternateModes[ this.selectedMode].armor_value ? this.alternateModes[ this.selectedMode].armor_value : 0) + adj_value;
        } else {
            return (this.armorValue ? this.armorValue : 0) + adj_value;
        }
    }

    getWeight( trueWeight: boolean = false ): number {
        if( this.equippedArmor && this.zeroWeightWhenEquipped && !trueWeight) {
            return 0;
        } else {
            let weight_multiplier = 1;
            for( let enh of this.gear_enhancements ) {
                if( this.isShield )
                    weight_multiplier = enh.shield_weight_multiplier;
                else
                    weight_multiplier = enh.armor_weight_multiplier;
            }
            if(
                this.alternateModes.length > 0
                    &&
                this.selectedMode > -1
                    &&
                this.alternateModes.length > this.selectedMode
            ) {
                return this.alternateModes[ this.selectedMode].weight * weight_multiplier;
            } else {
                return this.weight * weight_multiplier;
            }
        }
    }

    getHardness(): number {
        let hardness = this.hardness;

        for( let enh of this.gear_enhancements ) {
            if( this.isShield )
                hardness += enh.shield_hardness_bonus;
            else
                hardness += enh.armor_hardness_bonus;
        }

        return hardness;
    }

    getMinimumStrength(): string {

        let min_strength = "";
        if(
            this.alternateModes.length > 0
                &&
            this.selectedMode > -1
                &&
            this.alternateModes.length > this.selectedMode
        ) {
            min_strength = this.alternateModes[ this.selectedMode].minimum_strength;
        } else {
            min_strength =this.minimumStrength;
        }

        for( let enh of this.gear_enhancements ) {
            if( this.isShield ) {
                if( enh.shield_min_str_adjustment != 0 ) {
                    let die_value = getDieIndexFromLabel(min_strength);
                    die_value += enh.shield_min_str_adjustment;
                    if( die_value < 1 ) {
                        die_value = 1;
                    }
                    min_strength = getDieLabelFromIndex( die_value );
                }
            } else {
                if( enh.armor_min_str_adjustment != 0 ) {
                    let die_value = getDieIndexFromLabel(min_strength);
                    die_value += enh.armor_min_str_adjustment;
                    if( die_value < 1 ) {
                        die_value = 1;
                    }
                    min_strength = getDieLabelFromIndex( die_value );
                }
            }

        }

        return min_strength;
    }

    getToughness(): number {
        if(
            this.alternateModes.length > 0
                &&
            this.selectedMode > -1
                &&
            this.alternateModes.length > this.selectedMode
        ) {
            return this.alternateModes[ this.selectedMode].toughness;
        } else {
            return this.toughness;
        }
    }

    getArmorValueHR(): string {
        let heavyLabel = "";
        if( this.heavy ) {
            heavyLabel = " Heavy";
            if(
                this._char
            ) {
                heavyLabel = " " + this._char.getHeavyArmorLabel();
            }
        }
        if( this.secondaryArmorValue ) {
            return "+" + this.getArmorValue().toString() + "/+" + this.secondaryArmorValue + heavyLabel;
        } else {
            return "+" + this.getArmorValue().toString() + heavyLabel;
        }
    }

    getShieldParryBonus(): number {
        let parry = this.shieldParryBonus;

        for( let enh of this.gear_enhancements ) {
            parry += enh.shield_parry_bonus;
        }

        return parry;
    }
    export(): IChargenArmor {
        let exportObject = super.export() as IChargenArmor;

        exportObject.zero_weight_when_equipped = this.zeroWeightWhenEquipped;
        exportObject.set_strength = this.setStrength;
        exportObject.size = this.size;
        exportObject.abilities = this.abilities;
        exportObject.pf_armor_type = this.pfArmorType;

        exportObject.heavy = this.heavy;
        exportObject.pace = this.pace;
        exportObject.hardness = this.hardness;

        exportObject.run = this.run;
        exportObject.effects = this.effects;
        exportObject.type = this.type;

        exportObject.cost = this.cost;
        exportObject.weight = this.weight;
        exportObject.armor_value = this.getArmorValue();
        exportObject.stacks_with_other_armor = this.stacksWithOtherArmor;
        exportObject.secondary_armor_value = this.secondaryArmorValue;
        exportObject.toughness = this.toughness;
        exportObject.ap_vs_lasers = this.apVsLasers;
        exportObject.rigid_armor = this.rigidArmor;

        exportObject.covers_head = this.coversHead;
        exportObject.alternate_modes = this.alternateModes;
        exportObject.covers_face = this.coversFace;
        exportObject.covers_torso = this.coversTorso;
        exportObject.covers_arms = this.coversArms;
        exportObject.covers_legs = this.coversLegs;
        exportObject.negate_4_ap = this.negate4ap;
        exportObject.default_model_label = this.defaultModeLabel;
        exportObject.is_shield = this.isShield;
        exportObject.is_energy_screen = this.isEnergyScreen;
        exportObject.description = this.description;
        exportObject.shield_parry_bonus = this.shieldParryBonus;
        exportObject.shield_armor_vs_ranged = this.shieldArmorVsRanged;
        exportObject.shield_cover_vs_ranged = this.shieldCoverVsRanged;
        exportObject.minimum_strength = this.minimumStrength;
        exportObject.requires_2_hands = this.requires2Hands;
        exportObject.summary = this.summary;
        exportObject.quantity = this.quantity;
        exportObject.integrated_weapons = [];

        for( let weapon of this.integratedWeapons ) {
            exportObject.integrated_weapons.push( weapon.export() )
        }

        exportObject = cleanUpReturnValue(exportObject);
        return exportObject;
    }

    getPathfinderArmorTypeName(): string {
        return getPathfinderArmorLabel( this.pfArmorType );
    }

    reset() {
        super.reset();
        this.abilities = [];
        this.integratedWeapons = [];
        this.setStrength = "";
        this.pfArmorType = 0;
        this.defaultModeLabel = "Normal";
        this.alternateModes = [];
        this.zeroWeightWhenEquipped = false;
        this.equippedArmor = false;
        this.equippedPrimary = false;
        this.equippedScreen = false;
        this.equippedSecondary = false;
        this.quantity = 1;
        this.apVsLasers = 0;
        this.armorValue = 0;
        this.pace = 0;
        this.run = "";
        this.coversArms = false;
        this.coversFace = false;
        this.coversHead = false;
        this.coversLegs = false;
        this.coversTorso = true;
        this.isEnergyScreen = false;
        this.isShield = false;
        this.minimumStrength = "";
        this.name = "";
        this.namePlural = "";
        this.negate4ap = false;
        this.page = "";
        this.rigidArmor = false;
        this.secondaryArmorValue = 0;
        this.shieldArmorVsRanged = 0;
        this.shieldCoverVsRanged = 0;
        this.shieldParryBonus = 0;
        this.stacksWithOtherArmor = false;
        this.toughness = 0;
        this.type = "armor";
        this.weight = 0;
        this.requires2Hands = false;
        this.summary = "";
    }

    // DEPRECATED_importFromCustomArmor( importData: ICustomArmorExport ) {
    //     this.reset();
    //     this.is_custom = true;
    //     this.quantity = +importData.quantity;
    //     this.armorValue = +importData.armor;
    //     this.cost = +importData.cost;
    //     this.coversArms = importData.covers_arms ? true : false;
    //     this.coversFace = importData.covers_face ? true : false;
    //     this.coversHead = importData.covers_head ? true : false;
    //     this.coversLegs = importData.covers_legs ? true : false;
    //     this.coversTorso = importData.covers_torso ? true : false;
    //     this.equippedArmor = importData.equipped_armor ? true : false;
    //     if( importData.equipped_armor2) {
    //         this.equippedArmor = importData.equipped_armor2 ? true : false;
    //     }
    //     this.equippedPrimary = importData.equipped_primary ? true : false;
    //     this.equippedScreen = importData.equipped_screen ? true : false;
    //     this.equippedSecondary = importData.equipped_secondary ? true : false;
    //     this.isShield = importData.is_shield ? true : false;

    //     this.minimumStrength = importData.min_strength;
    //     this.name = importData.name;
    //     this.shieldParryBonus= +importData.parry;
    //     this.quantity = +importData.count_current;
    //     this.summary = importData.summary;
    //     this.cost = +importData.total_cost;
    //     this.toughness = +importData.toughness;
    //     this.weight = +importData.weight;
    //     this.stacksWithOtherArmor = importData.stackable ? true : false;
    //     this.requires2Hands = importData.requires_2_hands ? true : false;
    // }

    public exportHTML(hideImage: boolean = false): string {

        let exportHTML = "";

        if( this.getName() ) {
            exportHTML += "<h1>" + this.getName() + "</h1>\n";
        }

        if( this.getCost() ) {
            exportHTML += "<strong>Cost:</strong> " + FormatMoney(this.getCost(), null) + "";
            exportHTML += "<br />";
        }

        if( this.getWeight() ) {
            exportHTML += "<strong>Weight:</strong> " + this.getWeight() + "";
            exportHTML += "<br />";
        }

        if( this.getMinimumStrength() ) {
            exportHTML += "<strong>Minimum Strength:</strong> " + this.getMinimumStrength() + "";
            exportHTML += "<br />";
        }

        if( this.getHardness() ) {
            exportHTML += "<strong>Hardness:</strong> " + this.getHardness() + "";
            exportHTML += "<br />";
        }

        if( this.isShield ) {

            if( this.shieldCoverVsRanged ) {
                exportHTML += "<strong>Cover vs Ranged:</strong> " + this.shieldCoverVsRanged + "";
                exportHTML += "<br />";
            }

            if( this.getShieldParryBonus() ) {
                exportHTML += "<strong>Shield Parry Bonus:</strong> " + this.getShieldParryBonus() + "";
                exportHTML += "<br />";
            }

        } else {

            if( this.getArmorValue() ) {
                exportHTML += "<strong>Armor:</strong> " + this.getArmorValue() + "";
                exportHTML += "<br />";
            }

            if( this.toughness != 0 ) {
                exportHTML += "<strong>Toughness:</strong> " + this.toughness + "";
                exportHTML += "<br />";
            }

            exportHTML += "<strong>Locations:</strong> ";
            let locationString = "";
            if( this.coversHead ) {
                locationString += "head, ";
            }
            if( this.coversFace ) {
                locationString += "face, ";
            }
            if( this.coversArms ) {
                locationString += "arms, ";
            }
            if( this.coversTorso ) {
                locationString += "torso, ";
            }
            if( this.coversTorso ) {
                locationString += "legs, ";
            }

            if( this.isShield ) {
                locationString += "shield, ";
            }

            if( locationString ) {
                locationString = locationString.substring( 0, locationString.length - 2);
            } else {
                locationString = "(none)";
            }
            exportHTML += locationString;
            exportHTML += "<br />";
        }

        if( this.summary ) {
            exportHTML += "<p><strong>Summary:</strong> " + this.summary + "</p>\n";
        }

        if( this.description.length > 0 ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>\n";
        }
        return exportHTML;
    }
    getShortStats( withNotes: boolean = false): string {
        let returnString = "";

        if( this.isShield ) {
            if( this.summary.trim() ) {
                returnString += this.summary + ". ";
            }
            if( this.getShieldParryBonus() != 0 ) {
                if( this.getShieldParryBonus() < 0 )
                    returnString += "" + this.getShieldParryBonus() + " Parry, ";
                else
                    returnString += "+" + this.getShieldParryBonus() + " Parry, ";
            }

            if( this.shieldCoverVsRanged ) {
                if( this.shieldCoverVsRanged < 0 )
                    returnString += "" + this.shieldCoverVsRanged + " Cover, ";
                else
                    returnString += "-" + this.shieldCoverVsRanged + " Cover, ";
            }
            if( this.hardness > 0 ) {
                    returnString += "Hardness " + this.hardness + ", ";
            }
        } else {
            if( this.armorValue > 0 ) {
                returnString += "Armor " + this.armorValue + ", ";
            }
        }

        if( returnString.length > 0 ) {
            returnString = returnString.substring(0, returnString.length - 2);
        }

        return returnString;
    }

    getEnhancementExport(): IGearEnhancementItemExport[] {
        let gear_enhancements: IGearEnhancementItemExport[] = [];
        for( let item of this.gear_enhancements ) {
            if( item.id == 0 ) {
                gear_enhancements.push({
                    id: 0,
                    def: item.export(),
                    setting_item: false,
                });
            } else {
                gear_enhancements.push({
                    id: item.id,
                    def: null,
                    setting_item: false,
                });
            }
        }

        return gear_enhancements;
    }

    exportOptions(): IArmorObjectVars {
        let rv = super.exportOptions() as IArmorObjectVars;

        rv.equipped_primary = this.equippedPrimary;
        rv.equipped_armor = this.equippedArmor;
        rv.equipped_secondary = this.equippedSecondary;
        rv.equipped_screen = this.equippedScreen;
        rv.buy_cost = this.buyCost;

        rv.integrated_weapon_uuids = [];
        for( let w of this.integratedWeapons)
            rv.integrated_weapon_uuids.push( w.uuid );

        rv.gear_enhancements = this.getEnhancementExport();

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    importOptions( iVars: IArmorObjectVars | null ) {
        super.importOptions( iVars as IBaseObjectVars );

        if( iVars ) {
            typeof( iVars.buy_cost ) != "undefined" ? this.buyCost = iVars.buy_cost : null;
            typeof( iVars.equipped_primary ) != "undefined" ? this.equippedPrimary = iVars.equipped_primary : null;
            typeof( iVars.equipped_armor ) != "undefined" ? this.equippedArmor = iVars.equipped_armor : null;
            typeof( iVars.equipped_secondary ) != "undefined" ? this.equippedSecondary = iVars.equipped_secondary : null;
            typeof( iVars.equipped_screen ) != "undefined" ? this.equippedScreen = iVars.equipped_screen : null;

            for( let wIndex in this.integratedWeapons ) {
                if( iVars.integrated_weapon_uuids && iVars.integrated_weapon_uuids.length > +wIndex ) {
                    this.integratedWeapons[+wIndex].uuid = iVars.integrated_weapon_uuids[+wIndex];
                }
            }

            // console.log("armor importOptions iVars.gear_enhancements ", iVars.gear_enhancements )

            if( iVars.gear_enhancements ) {
                for( let enh of iVars.gear_enhancements ) {
                    if( enh.id == 0 ) {
                        this.gear_enhancements.push( new GearEnhancement( enh.def ));
                    } if( enh.setting_item ) {
                        // TODO
                    } else if( enh.id > 0 && this._char ) {
                        for( let def of this._char._availableData.gear_enhancements ) {
                            if( def.id == enh.id) {
                                this.gear_enhancements.push( new GearEnhancement( def ));
                                break;
                            }
                        }

                    }

                }
            }
        }

    }

    getGenericExportArmor(armoredCharStat: IAlternateArmorData | null = null,  withBookData: boolean = false ): IExportArmor {
        let rv: IExportArmor =  {
            id: this.id,
            uuid: this.uuid,
            isShield: false,
            name: this.getName(),
            weight: this.getTotalWeight(),
            quantity: this.quantity,
            descriptionHTML: this.getDescriptionHTML(),

            armor: this.getArmorValue(),
            bookName: this.getBookName(),
            bookPublisher: this.getBookPublisher(),
            bookPublished: this.getBookPublished(),
            coversFace: this.coversFace,
            coversHead: this.coversHead,
            coversTorso: this.coversTorso,
            coversLegs: this.coversLegs,
            coversArms: this.coversArms,
            notes: this.summary,
            takenFrom: this.getBookPage(),
            bookID: this.book_id,

            equipped: this.equippedArmor,
            cost: this.cost,
            costBuy: this.buyCost,
            minStr: this.minimumStrength,
            equippedToughness: armoredCharStat ? armoredCharStat.toughnessAndArmor : "n/a",
            equippedStrength: armoredCharStat ? armoredCharStat.strength : "n/a",
            heavyArmor: this.heavy,
        }

        if( withBookData ) {
            rv.bookCore = this.book_obj.core;
            rv.bookPrimary = this.book_obj.primary;
            rv.bookName = this.book_obj.name;
        }

        return rv;
    }

    getDescriptionHTML(): string {
        let rv: string = convertMarkdownToHTML( this.description );
        rv = replaceAll(rv, "\n", " ");

        // if( this.description.length == 0 || (this.description.length > 1 && this.description[0].trim() == "")) {
        //     rv = "<p>" + this.summary + "</p>"
        // }

        rv += "<p><cite>" + this.getLongBookPage() + "</cite></p>";

        return rv;
    }

    getGenericExportShield( withBookData: boolean = false ): IExportShield {
        let rv: IExportShield = {
            id: this.id,
            isShield: true,
            uuid: this.uuid,
            name: this.getName(),
            descriptionHTML: this.getDescriptionHTML(),
            weight: this.getTotalWeight(),
            quantity: this.quantity,
            bookName: this.getBookName(),
            bookPublisher: this.getBookPublisher(),
            bookPublished: this.getBookPublished(),
            cover: this.shieldCoverVsRanged > 0 ? this.shieldCoverVsRanged * -1 : this.shieldCoverVsRanged,
            notes: this.summary,
            hardness: this.hardness,
            parry: this.getShieldParryBonus(),
            equipped: this.equippedPrimary || this.equippedSecondary ? true : false,
            cost: this.cost,
            takenFrom: this.getBookPage(),
            bookID: this.book_id,
            costBuy: this.buyCost,
            minStr: this.minimumStrength,
        }

        if( withBookData ) {
            rv.bookCore = this.book_obj.core;
            rv.bookPrimary = this.book_obj.primary;
            rv.bookName = this.book_obj.name;
        }

        return rv;
    }

    isUnderStrength(): boolean {

        if( this._char && this._char.setting && this._char.setting.usesMinimumStrength === false) {
            return false;
        }

        if( this._char ) {
            if(
                this._char.getWeaponStrength()
                <
                getDieIndexFromLabel( this.getMinimumStrength() )
            ) {
                return true;
            }
        }
        return false;
    }
}

export interface IArmorObjectVars extends IBaseObjectVars {
    equipped_primary: boolean;
    equipped_armor: boolean;
    equipped_secondary: boolean;
    equipped_screen: boolean;
    buy_cost: number;
    integrated_weapon_uuids: string[];
    gear_enhancements: IGearEnhancementItemExport[];
}