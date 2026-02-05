import { IExportPower } from "../../interfaces/IExportStatsOutput";
import { ILEGACYJSONPowerExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { ApplyCharacterEffects } from "../../utils/ApplyCharacterMod";
import { cleanUpReturnValue } from "../../utils/cleanUpReturnValue";
import { getRankName, replaceAll } from "../../utils/CommonFunctions";
import { convertMarkdownToHTML } from "../../utils/convertMarkdownToHTML";
import { getSelectItemsFromEffect } from "../../utils/getSelectItemsFromEffect";
import { NormalizeBookPage } from "../../utils/NormalizeBookPage";
import { simplifyDice } from "../../utils/simplifyDice";
import { split_by_max_two } from "../../utils/split_by_max_two";
import { titleCaseString } from "../../utils/titleCaseString";
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from "../_base_object";
import { ArcaneBackground } from "./arcane_background";
import { PlayerCharacter } from "./player_character";

interface ILimitItem {
    key: string;
    label: string;
}
export interface IChargenPowers extends IBaseObjectExport {

    rank: number;
    power_points: string;
    power_points_per: string;
    range: string;
    damage: string;
    duration: string;
    trappings: string;
    additional_effects: string | string[];
    additional_targets: string | string[];
    mega_power_options: string[];

    spell_slot_cost: number;
    limitation_range: string;
    limitation_aspect: string;
    limitation_personal: string;

    effects: string[];

    innate_power: boolean;
}

export class Power extends BaseObject {
    // _char: PlayerCharacter | null = null;
    _abObject: ArcaneBackground | null = null;

    megaPower: boolean = false;
    powerPointsOverride: number = -1;

    neg2SkillPenalty: boolean = false;

    spellSlotCost: number = 1;
    rank: number = 0;
    powerPoints: string;
    powerPointsPer: string;
    range: string = "";
    damage: string = "";
    duration: string;
    trappings: string;
    powerModifiers: string[] = [];
    additionalTargets: string[] = [];
    megaPowerOptions: string[] = [];
    bonusMegaPowerOptions: string[] = [];

    effects: string[] = [];
    innatePower: boolean = false;
    addedManually: boolean = false;

    customName: string = "";
    customDescription: string = "";

    selectedProgrammatically: boolean = false;
    singularName: string;

    limitationAspect: string = "";
    limitationPersonal: string = "";
    limitationRange: string = "";
    rangeLimitationGivesPPDiscount: boolean = true;
    aspectLimitationGivesPPDiscount: boolean = true;
    allowedToSelectAspectLimitation: boolean = true;
    allowedToSelectRangeLimitation: boolean = true;

    effectSpecify: string = "";
    originalRank: number = 0;

    constructor(
        powerDef: IChargenPowers | null = null,
        characterObject: PlayerCharacter | null = null,
        abObject: ArcaneBackground | null = null,
    ) {
        super( powerDef, characterObject )
        // this._char = characterObject;

        this._abObject = abObject;
        this.import( powerDef );
    }

    import(jsonImportObj: IChargenPowers | null ) {
        super.import(jsonImportObj, this._char ? this._char.getAvailableData().books : [] );
        if( jsonImportObj ) {

            this.rank = 0;
            if( jsonImportObj.rank)
                this.rank = jsonImportObj.rank;

            this.originalRank = this.rank;
            this.powerPoints = jsonImportObj.power_points;
            this.powerPointsPer = jsonImportObj.power_points_per;
            this.range = jsonImportObj.range;

            if( jsonImportObj.spell_slot_cost )
                this.spellSlotCost = jsonImportObj.spell_slot_cost;
            this.damage = "";
            if( jsonImportObj.damage)
                this.damage = jsonImportObj.damage;

            this.duration = jsonImportObj.duration;
            // this.trappings = jsonImportObj.trappings;
            if( typeof(jsonImportObj.additional_effects) === "string") {
                if( jsonImportObj.additional_effects.trim() ) {
                    this.powerModifiers = JSON.parse(jsonImportObj.additional_effects);
                }
            } else {
                this.powerModifiers = jsonImportObj.additional_effects;
            }
            if( typeof(jsonImportObj.additional_targets) === "string") {
                if( jsonImportObj.additional_targets.trim() ) {
                    this.additionalTargets = JSON.parse(jsonImportObj.additional_targets);
                }
            } else {
                this.additionalTargets = jsonImportObj.additional_targets;
            }

            if( jsonImportObj.mega_power_options) {
                this.megaPowerOptions = jsonImportObj.mega_power_options;
            }
            if( jsonImportObj.effects) {
                this.effects = jsonImportObj.effects;
            }
            if( jsonImportObj.innate_power ) {
                this.innatePower = true;
            }

            if( jsonImportObj.setting_item )
                this.setting_item = true;

            this.limitationAspect = jsonImportObj.limitation_aspect;
            this.limitationPersonal = jsonImportObj.limitation_personal;
            this.limitationRange = jsonImportObj.limitation_range;

        }
        if( !this.limitationAspect ) {
            this.limitationAspect = "";
        }
        if( !this.limitationRange ) {
            this.limitationRange = "";
        }
        if( !this.range ) {
            this.range = "";
        }
    }

    public getRange(): string {
        if( this.limitationRange ) {

            switch( this.limitationRange.toLowerCase().trim() ) {
                case "self": {
                    return "Self (limited)";
                }
                case "touch": {
                    return "Touch (limited)";
                }
                default:
                    return this.limitationRange + " (limited)";
            }
        } else {
            return this.range;
        }
    }

    public getLimitations(): string {
        let limitations: string[] = [];

        if( this.limitationAspect ) {
            limitations.push( this.limitationAspect )
        }
        if( this.limitationRange ) {
            limitations.push( this.limitationRange )
        }

        return limitations.join(", ");
    }

    public getPowerPointsNumber(): number {
        if( isNaN(+this.powerPoints) ) {
            return -1;
        }
        let powerPoints = +this.powerPoints;

        if( this.powerPointsOverride > -1 ) {
            powerPoints = this.powerPointsOverride;
        }
        if( this.limitationRange && this.rangeLimitationGivesPPDiscount ) {
            if( this.range.toLowerCase().trim() == "touch") {
                powerPoints--;
            } else {
                if( this.limitationRange.toLowerCase().trim() == "self") {
                    powerPoints--;
                    powerPoints--;
                } else {
                    powerPoints--;
                }
            }

        }

        if( this.limitationAspect && this.aspectLimitationGivesPPDiscount  ) {
            powerPoints--;
        }

        if( powerPoints < 1 ) {
            powerPoints = 1;
        }

        return powerPoints;
    }

    getCastingSkillModifierHR(): string {
        let mod = this.getCastingSkillModifier();
        if( mod == 0 )
            return "";
        if( mod < 0 )
            return mod.toString();
        if( mod > 0 )
            return "+" + mod.toString();
        return "";
    }
    getCastingSkillModifier(): number {

        if( isNaN(+this.powerPoints) ) {
            return 0;
        }
        let powerPoints = +this.powerPoints;

        if( this.powerPointsOverride > -1 ) {
            powerPoints = this.powerPointsOverride;
        }

        // if( this.range.toLowerCase() == "touch") {
        //     if( this.limitationRange && this.rangeLimitationGivesPPDiscount) {
        //         powerPoints--;
        //     }
        // } else
        if (this.range.toLowerCase() == "self") {
            // nothing to do
        } else {
            if( this.limitationRange && this.rangeLimitationGivesPPDiscount) {
                // if( this.limitationRange.toLowerCase() == "self") {
                //     powerPoints--;
                // }
                // powerPoints--;
                if( this.range.toLowerCase().trim() == "touch") {
                    powerPoints--;
                } else {
                    if( this.limitationRange.toLowerCase().trim() == "self") {
                        powerPoints--;
                        powerPoints--;
                    } else {
                        powerPoints--;
                    }
                }
            }
        }

        if( this.limitationAspect && this.aspectLimitationGivesPPDiscount  ) {
            powerPoints--;
        }

        if( powerPoints < 1 ) {
            let currentBonus = 1 - powerPoints;
            let maxBonus = 2;
            if( this._char && this._char.setting.maxLimitationPowerBonus) {
                maxBonus = this._char.setting.maxLimitationPowerBonus;
            }

            if( currentBonus > maxBonus)   {
                currentBonus = maxBonus;
            }

            return currentBonus;
        }

        return 0;
    }

    public getSkillName(
        abObject: ArcaneBackground | null | undefined
    ): string {
        if( this._abObject ) {
            abObject = this._abObject;
        }
        if(  abObject && abObject.arcaneSkill) {
            return abObject.arcaneSkill.name;
        }

        return "";
    }

    public getSkillValue(
        charObj: PlayerCharacter | null | undefined,
        abObject: ArcaneBackground | null | undefined
    ): string {
        if( this._abObject ) {
            abObject = this._abObject;
        }
        if( this._char ) {
            charObj = this._char;
        }

        if( charObj && abObject && abObject.arcaneSkill ) {
            let arcaneSkill = charObj.getSkill( abObject.arcaneSkill.name );
            let arcaneSkillValue = "d4-2";

            if( arcaneSkill ) {
                arcaneSkillValue = arcaneSkill.currentValueHR();

                if( arcaneSkillValue == "" || arcaneSkillValue == "-" ) {
                    arcaneSkillValue = "d4 -2"
                }
            }

            let skillMod = this.getCastingSkillModifier();

            return simplifyDice( arcaneSkillValue + " " + ( skillMod < 0 ? skillMod : "+" + skillMod) );
        }
        return "d4-2";
    }

    public getPowerPoints(): string {
        if( isNaN(+this.powerPoints) ) {
            return this.powerPoints;
        }
        let powerPoints = +this.powerPoints;

        if( this.powerPointsOverride > -1 ) {
            powerPoints = this.powerPointsOverride;
        }

        if( this.range.toLowerCase() == "touch") {
            if( this.limitationRange && this.rangeLimitationGivesPPDiscount) {
                powerPoints--;
            }
        } else if (this.range.toLowerCase() == "self") {
            // nothing to do
        } else {
            if( this.limitationRange && this.rangeLimitationGivesPPDiscount) {
                if( this.limitationRange.toLowerCase() == "self") {
                    powerPoints--;
                }
                powerPoints--;
            }
        }

        if( this.limitationAspect && this.aspectLimitationGivesPPDiscount ) {
            powerPoints--;
        }

        if( powerPoints < 1 ) {
            powerPoints = 1;
        }

        return powerPoints.toString();
    }

    public calcReset() {
        this.megaPower = false;
        this.bonusMegaPowerOptions = [];
        this.powerPointsOverride  = -1;
        this.rank = this.originalRank;
    }

    public canSelectInnate(): boolean {
        return true;
    }

    // public canSelectRangeLimitation(): boolean {

    //     if(
    //         this._char.setting.primaryIsSWADE
    //             &&
    //         this.range.toLowerCase().trim() != "touch"
    //             &&
    //         this.range.toLowerCase().trim() != "self"
    //     ) {
    //         return true;
    //     }
    //     return false;
    // }

    public getRangeLimitations(): string[] {
        let rv: string[] = [];

        if(!this._char ) {
            return [];
        }
        if(
            this._char.setting
            &&
            this._char.setting.primaryIsSWADE
        ) {
            if( this.range.toLowerCase().trim() != "touch" && this.allowedToSelectRangeLimitation) {
                rv.push("Touch");
            }
            if( this.range.toLowerCase().trim() != "self"  && this.allowedToSelectRangeLimitation ) {
                rv.push("Self");
            }
        }

        return rv;
    }

    // public getPersonalLimitations(): string[] {
    //     let rv = [];

    //     if(
    //         this._char.setting
    //         &&
    //         this._char.setting.primaryIsSWADE
    //     ) {
    //         if( this.range.toLowerCase().trim() != "touch" && this.allowedToSelectRangeLimitation) {
    //             rv.push("Touch");
    //         }
    //         if( this.range.toLowerCase().trim() != "self"  && this.allowedToSelectRangeLimitation ) {
    //             rv.push("Self");
    //         }
    //     }

    //     return rv;
    // }

    public getAspectLimitations(): ILimitItem[] {
        let rv: ILimitItem[] = [];

        if( this.name.indexOf("/") > 0 ) {

            let nameSplit = this.name.split(" ", 2);
            let traitSplit: string[];
            if( nameSplit.length > 0 ) {
                traitSplit = nameSplit[0].split("/", 2);
            } else {
                traitSplit = this.name.split("/", 2);
            }
            let addendum = "";
            if( nameSplit.length > 1 ) {
                addendum = nameSplit[1];
            }

            for( let trait of traitSplit ) {
                rv.push( {
                    key: trait.trim(),
                    label: trait.trim() + " " + addendum,
                });
            }
        }

        return rv;
    }

    public canSelectAspectLimitation(): boolean {
        if(!this._char ) {
            return false;
        }
        if(
            this._char.setting
            &&
            this._char.setting.primaryIsSWADE
                &&
            this.name.toLowerCase().trim().indexOf("/") > -1
        ) {
            return true;
        }
        return false;
    }

    public getPowerModifiers(): string[] {
        let rv = this.powerModifiers;
        if( this._abObject && this._abObject.abPowerModifiers && this._abObject.abPowerModifiers.length > 0 ) {
            rv = rv.concat( this._abObject.abPowerModifiers );
        }

        return rv;
    }

    public export(): IChargenPowers {

        let rv: IChargenPowers = super.export() as IChargenPowers;

        rv.damage = this.damage;
        rv.rank = this.rank;
        rv.power_points = this.powerPoints;
        rv.power_points_per = this.powerPointsPer;
        rv.range = this.range;
        rv.duration = this.duration;
        rv.trappings = this.trappings;
        rv.additional_effects = this.powerModifiers;
        rv.additional_targets = this.additionalTargets;
        rv.mega_power_options = this.megaPowerOptions;
        rv.limitation_aspect = this.limitationAspect;
        rv.limitation_range = this.limitationRange;
        rv.innate_power = this.innatePower;
        rv.spell_slot_cost = this.spellSlotCost;
        rv.effects = this.effects;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    getGetBasePowerName() {
        return this.name;
    }

    getBaseName() {
        let theName = this.name;

        if( this.limitationAspect ) {
            let nameSplit = this.name.split(" ", 2);
            let traitSplit: string[];
            if( nameSplit.length > 0 ) {
                traitSplit = nameSplit[0].split("/", 2);
            } else {
                traitSplit = this.name.split("/", 2);
            }
            let addendum = "";
            if( nameSplit.length > 1 ) {
                addendum = nameSplit[1];
            }
            theName = this.limitationAspect + " " + addendum;
        }

        return theName.trim();
    }

    public getName(
        showInnate: boolean = false,
    ) {

        let penaltyText = "";
        if( this.neg2SkillPenalty )  {
            penaltyText = "-2 skill"
        }

        let theName = this.getBaseName();

        if( this.effectSpecify ) {
            theName += ": " + this.effectSpecify;
        }

        if( this.customName && this.customName.trim() ) {
            if( penaltyText )
                penaltyText = ", " + penaltyText;
            if( this.innatePower && showInnate )
                return this.customName + " (Innate, " + theName + penaltyText + ")";
            else
                return this.customName + " (" + theName + penaltyText + ")";
        } else {
            if( this.innatePower && showInnate ) {
                if( penaltyText )
                    penaltyText = ", " + penaltyText;
                return theName + " (Innate" + penaltyText  +")";
            } else {
                if( penaltyText )
                    return theName + " (" + penaltyText + ")";
                else
                    return theName;
            }
        }
    }

    public getNoPowerPointModifier(): string {
        let pp = this.getPowerPointsNumber();
        if( pp >-1 ) {
            let ppMod = Math.ceil( pp / 2);
            if( ppMod < 1 ) {
                ppMod = 1;
            }

            return (ppMod * -1 ).toString();

        } else {
            return "See Text";
        }

    }

    public exportJSON(): ILEGACYJSONPowerExport {
        let returnItem: ILEGACYJSONPowerExport = {
            abid: this._abObject ? this._abObject.id : -1,
            custom_description: this.customDescription,
            custom_name: this.customName,
            id: this.id,
            name: this.name,
            innate_power: this.innatePower,
            limitation_aspect: this.limitationAspect,
            limitation_range: this.limitationRange,
            uuid: this.uuid,
            setting_item: this.setting_item,
            selected_programmatically: this.selectedProgrammatically,
        }

        return returnItem;
    }

    /** @deprecated */
    LEGACY_isAvailable(
        abIndex: number = -1,
        isInitialSelection: boolean,
        charObj: PlayerCharacter | null | undefined
    ): boolean {
        if( this._char ) {
            charObj = this._char;
        }
        if(!charObj ) {
            return false;
        }
        if(!charObj ) {
            return false;
        }
        if( charObj.setting && !charObj.setting.powerIsEnabled( this.id )) {
            return false;
        }

        if( abIndex > -1 ) {
            if(
                charObj._selectedArcaneBackgrounds[ abIndex]
            ) {

                if( this._checkRank(charObj._selectedArcaneBackgrounds[ abIndex], isInitialSelection) ) {
                    if(
                        this.rank > charObj.getCurrentRank( charObj._advancement_count, true )
                    ) {
                        return false;
                    }
                }
                //@ts-ignore
                let powers = charObj._selectedArcaneBackgrounds[ abIndex].allowedPowers;

                if(
                    ( powers.length > 0 &&  powers[0].trim().toLowerCase() === "(all)")
                        ||
                    powers.length === 0
                        ||
                    charObj._noPowerLimits
                ) {
                    return true;
                } else {
                    for( let power of powers ) {
                        if( power.trim().toLowerCase().startsWith( "and ") )
                            power = power.replace("and ", "");
                        let thinnedPowerName = this._thinPowerName( this.getBaseName());
                        let thinnedBasePowerName =  this._thinPowerName( this.getGetBasePowerName() );
                        let thinnedPowerListName = this._thinPowerName( power );

                        if(
                            (
                                thinnedPowerName
                                    ==
                                thinnedPowerListName
                            )
                            ||
                            (
                                thinnedBasePowerName
                                    ==
                                thinnedPowerListName
                            )
                        ) {
                            return true;
                        }

                    }

                    return false;
                }
            }
        }

        return true;
    }

    isAvailableByUUID(
        abUUID: string,
        isInitialSelection: boolean,
        charObj: PlayerCharacter | null | undefined
    ): boolean {
        if( this._char ) {
            charObj = this._char;
        }
        if(!charObj ) {
            console.log("isAvailableByUUID no charobj");
            return false;
        }
        if( charObj.setting && !charObj.setting.powerIsEnabled( this.id )) {
            return false;
        }

        if( abUUID ) {
            for( let edge of charObj.getEdgeArcaneBackgrounds() )
            if(
                edge && edge.arcaneBackground
            ) {

                if( this._checkRank(edge.arcaneBackground, isInitialSelection) ) {
                    if( this.rank > charObj.getCurrentRank( charObj._advancement_count, true ) ) {
                        return false;
                    }
                }

                let powers = edge.arcaneBackground.allowedPowers;

                if(
                    ( powers.length > 0 &&  powers[0].trim().toLowerCase() === "(all)")
                        ||
                    powers.length === 0
                        ||
                    charObj._noPowerLimits
                ) {
                    return true;
                } else {
                    for( let power of powers ) {
                        if( power.trim().toLowerCase().startsWith( "and ") )
                            power = power.replace("and ", "");
                        let thinnedPowerName = this._thinPowerName( this.getBaseName());
                        let thinnedBasePowerName =  this._thinPowerName( this.getGetBasePowerName() );
                        let thinnedPowerListName = this._thinPowerName( power );

                        if(
                            (
                                thinnedPowerName
                                    ==
                                thinnedPowerListName
                            )
                            ||
                            (
                                thinnedBasePowerName
                                    ==
                                thinnedPowerListName
                            )
                        ) {
                            return true;
                        }

                    }

                    return false;
                }
            }
        }

        return true;
    }

    isAvailable(
        arcaneBackground: ArcaneBackground | null | undefined,
        isInitialSelection: boolean,
        charObj: PlayerCharacter | null | undefined,
    ): boolean {

        if( this._char ) {
            charObj = this._char
        }
        if(!charObj ) {
            console.log("isAvailable no charobj");
            return false;
        }

        if( charObj.setting && !charObj.setting.powerIsEnabled( this.id )) {
            return false;
        }

        if(
            arcaneBackground
        ) {

            let powers = arcaneBackground.allowedPowers;

            if( this._checkRank(arcaneBackground, isInitialSelection) ) {
                if( this.rank > charObj.getCurrentRank( charObj._advancement_count, true ) ) {
                    return false;
                }
            }

            if(
                ( powers.length > 0 &&  powers[0].trim().toLowerCase() === "(all)")
                    ||
                powers.length === 0
                    ||
                charObj._noPowerLimits
            ) {
                return true;
            } else {
                for( let power of powers ) {

                    if( power.trim().toLowerCase().startsWith( "and ") )
                        power = power.replace("and ", "");
                    let thinnedPowerName = this._thinPowerName( this.getBaseName());
                    let thinnedBasePowerName =  this._thinPowerName( this.getGetBasePowerName() );
                    let thinnedPowerListName = this._thinPowerName( power );

                    if(
                        (
                            thinnedPowerName
                                ==
                            thinnedPowerListName
                        )
                        ||
                        (
                            thinnedBasePowerName
                                ==
                            thinnedPowerListName
                        )
                    ) {
                        return true;
                    }

                }

                return false;
            }
        }

        return true;
    }

    /** @deprecated */
    public LEGACY_isNotAvailableReason(
        abIndex: number = -1,
        isInitialSelection: boolean
    ): string {
        let rv: string[] = [];
        if(!this._char ) {
            return "";
        }
        if( abIndex > -1 ) {
            if(
                this._char._selectedArcaneBackgrounds[ abIndex]
            ) {

                if( this._checkRank(this._char._selectedArcaneBackgrounds[ abIndex], isInitialSelection) ) {
                    if( this.rank > this._char.getCurrentRank( this._char._advancement_count, true ) ) {
                        rv.push("is higher than the current rank of the character");
                    }
                }

                //@ts-ignore
                let powers = this._char._selectedArcaneBackgrounds[ abIndex].allowedPowers;

                if(
                    ( powers.length > 0 &&  powers[0].trim().toLowerCase() === "(all)")
                        ||
                    powers.length === 0
                        ||
                    this._char._noPowerLimits
                ) {
                    // do nothing
                } else {
                    let foundPower = false;
                    for( let power of powers ) {
                        if( power.trim().toLowerCase().startsWith( "and ") )
                            power = power.replace("and ", "");

                        let thinnedPowerName = this._thinPowerName( this.getBaseName());
                        let thinnedBasePowerName =  this._thinPowerName( this.getGetBasePowerName() );
                        let thinnedPowerListName = this._thinPowerName( power );

                        if(
                            (
                                thinnedPowerName
                                    ==
                                thinnedPowerListName
                            )
                            ||
                            (
                                thinnedBasePowerName
                                    ==
                                thinnedPowerListName
                            )
                        ) {
                            // do nothing
                            foundPower = true;
                            break;
                        }
                    }

                    if( !foundPower ) {
                        rv.push("is not in your allowed powers list.");
                    }
                }

                if( this._char.setting && !this._char.setting.powerIsEnabled( this.id ) ) {
                    rv.push(" is denied in the game settings.")
                }
            }
        }

        return rv.join(" and ");
    }

    public isNotAvailableReasonByUUID(
        abUUID: string = "",
        isInitialSelection: boolean
    ): string {
        let rv: string[] = [];
        if(!this._char ) {
            return "";
        }
        if( abUUID ) {
            for( let edge of this._char.getEdgeArcaneBackgrounds() )
            if(
                edge && edge.arcaneBackground
            ) {

                if( this._checkRank(edge.arcaneBackground, isInitialSelection) ) {
                    if( this.rank > this._char.getCurrentRank( this._char._advancement_count, true ) ) {
                        rv.push("is higher than the current rank of the character");
                    }
                }

                let powers = edge.arcaneBackground.allowedPowers;

                if(
                    ( powers.length > 0 &&  powers[0].trim().toLowerCase() === "(all)")
                        ||
                    powers.length === 0
                        ||
                    this._char._noPowerLimits
                ) {
                    // do nothing
                } else {
                    let foundPower = false;
                    for( let power of powers ) {
                        if( power.trim().toLowerCase().startsWith( "and ") )
                            power = power.replace("and ", "");

                        let thinnedPowerName = this._thinPowerName( this.getBaseName());
                        let thinnedBasePowerName =  this._thinPowerName( this.getGetBasePowerName() );
                        let thinnedPowerListName = this._thinPowerName( power );

                        if(
                            (
                                thinnedPowerName
                                    ==
                                thinnedPowerListName
                            )
                            ||
                            (
                                thinnedBasePowerName
                                    ==
                                thinnedPowerListName
                            )
                        ) {
                            // do nothing
                            foundPower = true;
                            break;
                        }
                    }

                    if( !foundPower ) {
                        rv.push("is not in your allowed powers list.");
                    }
                }

                if( this._char.setting && !this._char.setting.powerIsEnabled( this.id ) ) {
                    rv.push(" is denied in the game settings.")
                }
            }
        }

        return rv.join(" and ");
    }

    public isNotAvailableReason(
        arcaneBackground: ArcaneBackground | null | undefined,
        isInitialSelection: boolean,
        charObj: PlayerCharacter | null | undefined,
    ): string {
        let rv: string[] = [];
        if( this._char ) {
            charObj = this._char;
        }
        if(!charObj ) {
            return "";
        }
        if(
            arcaneBackground
        ) {

            let powers = arcaneBackground.allowedPowers;

            if( this._checkRank(arcaneBackground, isInitialSelection) ) {
                if( this.rank > charObj.getCurrentRank( charObj._advancement_count, true ) ) {
                    rv.push("is higher than the current rank of the character");
                }
            }
            if(
                ( powers.length > 0 &&  powers[0].trim().toLowerCase() === "(all)")
                    ||
                powers.length === 0
                    ||
                charObj._noPowerLimits
            ) {
                // do nothing
            } else {
                let foundPower = false;
                for( let power of powers ) {
                    if( power.trim().toLowerCase().startsWith( "and ") )
                        power = power.replace("and ", "");

                    let thinnedPowerName = this._thinPowerName( this.getBaseName());
                    let thinnedBasePowerName =  this._thinPowerName( this.getGetBasePowerName() );
                    let thinnedPowerListName = this._thinPowerName( power );

                    if(
                        (
                            thinnedPowerName
                                ==
                            thinnedPowerListName
                        )
                        ||
                        (
                            thinnedBasePowerName
                                ==
                            thinnedPowerListName
                        )
                    ) {
                        // do nothing
                        foundPower = true;
                        break;
                    }
                }

                if( !foundPower ) {
                    rv.push("is not in your allowed powers list.");
                }
            }

            if( charObj.setting && !charObj.setting.powerIsEnabled( this.id ) ) {
                rv.push(" is denied in the game settings.")
            }
        }

        return rv.join(" and ");
    }

    private _checkRank(
        abObject: ArcaneBackground | null = null,
        isInitialSelection: boolean): boolean
    {
        if(!this._char
        ) {
            return false;
        }
        if( !abObject )
            abObject = this._abObject;

        if( abObject && abObject.ignoresPowerRankRequirements ) {
            return false;
        }

        if(
            this._char.setting &&
            (
                this._char.setting.settingIsEnabled("bornahero") && isInitialSelection
                ||
                this._char.setting.settingIsEnabled("swade_bornahero") && isInitialSelection
            )
        ){
            return false;
        }

        // if(
        //     this._char.setting && this._char.setting.settingIsEnabled("swade_bornahero_includes_powers")  && isInitialSelection
        // ) {
        //     return false;
        // }

        if( this._char._advancement_count > 0 ) {
            return true;
        }

        return true;

    }

    _thinPowerName( incomingString: string ) {
        incomingString =  replaceAll( incomingString, "/", "");

        incomingString = replaceAll( incomingString, "’", "");
        incomingString = replaceAll( incomingString, "'", "");
        incomingString = replaceAll( incomingString, " ", "");
        incomingString = replaceAll( incomingString, "'", "");
        incomingString = replaceAll( incomingString, "†", "");
        incomingString = replaceAll( incomingString, "*", "");
        incomingString = replaceAll( incomingString, "*", "");
        incomingString = incomingString.toLowerCase().trim();

        return incomingString;
    }

    getTrappings(): string {
        if( this.trappings && this.trappings.trim() )
            return this.trappings.trim();

        return "";
    }
    getLineItem(): string {

        let trappingString = "";
        if( this.innatePower ) {
            trappingString += "; Innate Power";
        }
        if( this.trappings && this.trappings.trim() ) {
            trappingString += "; " + this.trappings + " Trappings";
        }

        if( this.limitationRange || this.limitationAspect ) {
            if( this.limitationRange && this.limitationAspect ) {
                trappingString += "; Limitations: One Aspect, " + this.getRange();
            } else {
                if( this.limitationRange ) {
                    trappingString += "; Limitations: " + this.getRange();
                } else {
                    trappingString += "; Limitations: One Aspect"
                }
            }
        }
        let castingBonus = this.getCastingSkillModifier()
        if( castingBonus != 0 ) {
            if( castingBonus > 0 )
                trappingString += "; Skill Bonus: +" + castingBonus;
            else
                trappingString += "; Skill Bonus: " + castingBonus;
        }

        if( this.customName ) {
            return this.customName + " (" + this.getBaseName() + "; " + this.getBookPage() + trappingString + ")";
        } else {
            return this.getName() + " (" + this.getBookPage() + trappingString +  ")";
        }

    }

    public getBookPage(): string {

        if( this.setting_item )
            return "Setting";

        if(
            this.is_custom
            ||
            !this.book_obj
            || (!this.book_obj.name && this.book_page )
        ) {
            return "Custom";
        } else {
            if( this.setting_item ) {
                return "Setting Power";
            } else {
                return this.book_obj.name + " " + NormalizeBookPage(this.book_page)
            }

        }

    }

    public exportHTML(hideImage: boolean = false): string {

        let exportHTML = "";
        // if( this.image_url && !hideImage ) {
        //     exportHTML += "<span class=\"profile-image\">";

        //     exportHTML += "<img src=\"" + this.image_url + "\">";

        //     exportHTML += "</span>";
        // }

        if( this.name ) {
            exportHTML += "<h1>" + this.name + "</h1>";
        }

        if( this.rank > 0 ) {
            exportHTML += "<strong>Rank:</strong> " +  getRankName( this.rank) + "";
            exportHTML += "<br />";
        }

        if( this._char && this._char.noPowerPoints() ) {
            exportHTML += "<strong>Base Spell Casting Modifier:</strong> " + this.getNoPowerPointModifier() + "";

            exportHTML += "<br />";
        } else {
            if( this.getPowerPoints() ) {
                exportHTML += "<strong>Power Points:</strong> " + this.getPowerPoints() + "";
                if( this.powerPointsPer )
                    exportHTML += this.powerPointsPer;
                exportHTML += "<br />";
            }
        }

        if( this.getRange() ) {
            exportHTML += "<strong>Range:</strong> " + this.getRange() + "";
            exportHTML += "<br />";
        }

        if( this.duration ) {
            exportHTML += "<strong>Duration:</strong> " + this.duration + "";
            exportHTML += "<br />";
        }

        if( this.summary ) {
            exportHTML += "<p><strong>Summary:</strong> " + this.summary + "</p>";
        }

        if( this.description.length > 0 ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>";
        }
        return exportHTML;
    }

    getDamage(): string {
        if( this.damage )
            return this.damage;
        else
            return "";
    }

    getDuration(): string {
        if( this.duration )
            return this.duration;
        else
            return "";
    }

    getDescription(): string {
        // console.log("this.customDescription", this.customDescription, this.description)
        if( this.customDescription.length > 0 && this.customDescription[0].trim() != "") {
            // console.log("returning custom?")
            return this.customDescription
        } else {
            // console.log("returning desc", this.description)
            return this.description
        }
        // return this.description
    }

    getSummary(): string {

        if( this.summary )
            return this.summary.trim() + " - " + this.customDescription;
        else
            return " - " + this.customDescription;
    }

    getMegaPowerOptions(): string[] {
        return this.megaPowerOptions.concat( this.bonusMegaPowerOptions );
    }

    getAdditionalTargets(): string[] {
        return this.additionalTargets;
    }

    getDescriptionHTML(): string {
        let rv: string = convertMarkdownToHTML( this.getDescription() );
        rv = replaceAll(rv, "\n", " ");

        let mods = this._parseMods( this.getPowerModifiers() );
        let megaMods = this._parseMods( this.getMegaPowerOptions() );
        let additionalTargets = this._parseMods( this.getAdditionalTargets() );

        if( mods && mods.trim() ) {
            rv += "<h3>Modifiers</h3>" + mods + "";
        }

        if( additionalTargets && additionalTargets.trim() ) {
            rv += "<h3>Additional Targets</h3>" + additionalTargets + "";
        }

        if(
            megaMods
            && megaMods.trim()
            && this._abObject
            && this._abObject.megaPowers
        ) {
            rv += "<h3>Mega Power Modifiers</h3>" + megaMods + "";
        }
        rv += "<p><cite>" + this.getLongBookPage() + "</cite></p>";

        return rv;
    }

    _parseMods( mods: string[] ): string {
        let rv = "";

        let modCount = 0;
        if( mods && typeof(mods) != "string" ) {
            for( let mod of mods ) {
                if( mod && mod.trim() ) {
                    if( mod.indexOf(":") > -1 ) {
                        let split = mod.split(":", 2);
                        let title = titleCaseString( split[0].toLowerCase().trim());
                        let desc = split[1].trim();
                        rv += "<li><b>" + title + "</b>: " + desc + "</li>"
                    } else {
                        rv += "<li><b>" + mod + "</b></li>"
                    }
                    modCount++;
                }
            }
        }
        // if( mods && typeof(mods) == "string" ) {
        //     for( let mod of mods.split("") ) {
        //         if( mod.indexOf(":") > -1 ) {
        //             let split = mod.split(":", 2);
        //             let title = titleCaseString( split[0].toLowerCase().trim());
        //             let desc = split[1].trim();
        //             rv += "<b>" + title + "</b>: " + desc + "<br />"
        //         } else {
        //             rv += "<b>" + mod + "</b><br />"
        //         }
        //     }
        // }

        if( rv && modCount > 0 )
            return "<ul>" + rv + "</ul>";
        return "";
    }

    isNamed( name: string ): boolean {

        name = this._thinPowerName( name );
        if(
            this._thinPowerName( this.getBaseName() ) == name
                ||
            this._thinPowerName( this.name ) == name
        ) {
            return true;
        }

        return false;
    }

    apply( charObj: PlayerCharacter | null = null ) {
        if(! charObj ) {
            charObj = this._char
        }

        let effects: string[] = [];

        for( let effect of this.effects ) {

            let effectSplit = split_by_max_two( effect, ":");

            let theValue = "";
            if( this.effectSpecify )
                theValue = this.effectSpecify.trim();

            if( theValue && effectSplit.length > 1 ) {

                if(
                    effectSplit[1].toLowerCase().indexOf("|") > -1
                ) {

                    let effectParse = getSelectItemsFromEffect( effect );
                    effect = effectParse.action + ":" + theValue + " " + effectParse.value;

                    effects.push( effect );
                }

            }

            ApplyCharacterEffects( effects, charObj, "Power: " + this.name)
        }
    }

    public exportOptions(): IChargenPowerVars {
        let rv: IChargenPowerVars = super.exportOptions() as IChargenPowerVars;

        rv.neg2SkillPenalty = this.neg2SkillPenalty;
        rv.customName = this.customName;
        rv.customDescription = this.customDescription;
        rv.limitationRange = this.limitationRange;
        rv.limitationAspect = this.limitationAspect;
        rv.innatePower = this.innatePower;
        rv.trappings = this.trappings;
        rv.effectSpecify = this.effectSpecify;
        rv.abID = this._abObject ? this._abObject.id : -1;
        // rv.setting_item = this.setting_item;
        if( this.getEffectOptions().length == 0)
            rv.effectSpecify = "";

        rv = cleanUpReturnValue(rv);
        return rv;
    }

    public importOptions( options: IChargenPowerVars | null ) {
        super.importOptions( options );

        if( options ) {
            this.neg2SkillPenalty = false;
            if( options.neg2SkillPenalty )
                this.neg2SkillPenalty = true;
            this.customName = options.customName;
            if(  typeof(options.customDescription) == "string")
                this.customDescription = options.customDescription;
            else
                this.customDescription = options.customDescription.join("\n");
            this.limitationRange = options.limitationRange;
            this.limitationAspect = options.limitationAspect;
            this.innatePower = options.innatePower;
            this.effectSpecify = options.effectSpecify;
            if( options.trappings )
                this.trappings = options.trappings;

            // if( options.setting_item )
            //     this.setting_item = true;
            if( this.getEffectOptions().length == 0)
                this.effectSpecify = "";
        }
    }

    setEffectSpecify( newValue: string ) {
        this.effectSpecify = newValue;
    }

    getEffectOptions(): string[] {
        let rv: string[] = [];

        for( let effect of this.effects ) {
            let effectSplit = split_by_max_two( effect, ":");

            if( effectSplit.length > 1 ) {

                if(
                    effectSplit[1].toLowerCase().indexOf("|") > -1
                ) {

                    rv = effectSplit[1].split("|");

                }

            }

        }

        for( let item of rv )
            item = item.trim()

        return rv;
    }
}

export interface IChargenPowerVars extends IBaseObjectVars {
    customName: string;
    customDescription: string[] | string;
    limitationRange: string;
    limitationAspect: string;
    limitationPersonal: string;

    neg2SkillPenalty: boolean;
    innatePower: boolean;

    trappings: string;
    setting_item: boolean;
    effectSpecify: string;

    abID: number;

    settingItem?: boolean;
}