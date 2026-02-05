export interface ICustomSaveArmor {
    custom_cost: number;
 ​   custom_name: string;
​    custom_summary: string;
    custom_weight: number;
    // custom_quantity: number;

    custom_armor_value: number;
    custom_toughness: number;
    custom_parry: number;
    custom_is_shield: boolean;

    custom_covers_head: boolean;
    custom_covers_face: boolean;
    custom_covers_torso: boolean;
    custom_covers_arms: boolean;
    custom_covers_legs: boolean;

    requires_2_hands: boolean;
}