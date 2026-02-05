import { SETTING_RULE_DESCRIPTIONS } from "../classes/player_character/player_character_setting";

export function getSettingRuleLabel( needle_setting_tag: string ): string {
    for( let haystack of SETTING_RULE_DESCRIPTIONS ) {
        if( haystack.tag.toLowerCase().trim() == needle_setting_tag.toLowerCase().trim() ) {

            return haystack.label;
        }
    }
}