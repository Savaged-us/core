import { readConfigFile } from 'typescript';
import { ValidityLevel } from '../../enums/ValidityLevel';
import { IPowerCustom } from '../../interfaces/IChargenPowerCustom';
import { IItemUpdateItemAvailability } from '../../interfaces/IItemAvailability';
import { IPromptSpecification } from '../../interfaces/IPromptSpecification';
import { IValidationMessage } from '../../interfaces/IValidationMessage';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { getPowerName, replaceAll } from '../../utils/CommonFunctions';
import { convertMarkdownToHTML } from '../../utils/convertMarkdownToHTML';
import { isNumeric } from '../../utils/isNumeric';
import { ParseRequirementLine } from '../../utils/ParseRequirementLine';
import { split_by_max_two } from '../../utils/split_by_max_two';
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from '../_base_object';
import { ArcaneBackground, IChargenArcaneBackgroundObjectVars, IChargenArcaneBackground } from './arcane_background';
import { ISpecialAbilityItem, PlayerCharacter } from './player_character';
import { IChargenPowers, IChargenPowerVars, Power } from './power';
import { IChargenSuperPower2021, ISuperPower2021ObjectVars, SuperPower2021 } from './super_power_2021';
import { ISuperPowerSetComboDefinition, SuperPowerSet2021 } from './super_power_set_2021';

export interface IChargenEdge extends IBaseObjectExport {

    selectedOptions?: IChargenEdgeObjectVars | null ;

    hidden_on_character_sheet: boolean;
    can_toggle: boolean;
    group: string;

    is_linguist: boolean;
    instructions: string;

    // custom_name: string;
    // uuid: string;

    counts_as_other: string[];

    selected_edge: string;

    provides_swade_super_powers: boolean;

    free_edge: boolean;

    effects: string[];
    conflicts: string | string[];
    needs_to_specify: boolean;
    can_be_taken_more_than_once: boolean;
    number_times_taken : number;
    requirements: string | string[];
    arcane_background: boolean;
    once_per_rank: boolean;

    specify?: string;

    selected_ab_uuid: string;

    selected_power_id_1?: string;
    selected_power_id_2?: string;
    selected_power_id_3?: string;

    selected_power_ab_1?: number|string;
    selected_power_ab_2?: number|string;
    selected_power_ab_3?: number|string;

    powerEdgeOptions1?: IChargenPowerVars;
    powerEdgeOptions2?: IChargenPowerVars;
    powerEdgeOptions3?: IChargenPowerVars;

    /* Legacy Options */
    selected_power_name_1?: string;
    selected_power_name_2?: string;
    selected_power_name_3?: string;

    selected_power_trappings_1?: string;
    selected_power_trappings_2?: string;
    selected_power_trappings_3?: string;

    selected_power_summary_1?: string;
    selected_power_summary_2?: string;
    selected_power_summary_3?: string;

    selected_power_custom_1?: IPowerCustom | null;
    selected_power_custom_2?: IPowerCustom | null;
    selected_power_custom_3?: IPowerCustom | null;

    selected_power_limitation_range_1?: string;
    selected_power_limitation_range_2?: string;
    selected_power_limitation_range_3?: string;

    selected_power_limitation_aspect_1?: string;
    selected_power_limitation_aspect_2?: string;
    selected_power_limitation_aspect_3?: string;

    selected_power_innate1: boolean;
    selected_power_innate2: boolean;
    selected_power_innate3: boolean;

    /* End Legacy Options */

    selected_skill_1?: string;
    selected_skill_2?: string;

    selected_combat_edge: string;

    selected_ab?: number;

    selected_attribute?: string;

    selected_ability_item: string;

    selected_trait: string;

    pathfinderClassEdge: boolean;

    needs_selected_weapon: boolean;

    is_arcane_background: boolean;
    arcane_background_def: IChargenArcaneBackground | null;

}

export interface ISuperPower2021ComboDefinition {
    id: number;
    def?: IChargenSuperPower2021;
    options: ISuperPower2021ObjectVars;
}

export interface IChargenEdgeObjectVars extends IBaseObjectVars{

    specify?: string;

    arcane_background_options?: IChargenArcaneBackgroundObjectVars | null

    is_active: boolean;

    show_options: boolean;

    swade_super_powers: ISuperPower2021ComboDefinition[];

    super_power_sets: ISuperPowerSetComboDefinition[];

    selected_ab_uuid: string;
    selected_trait: string;

    selected_power_id_1?: string | null;
    selected_power_id_2?: string | null;
    selected_power_id_3?: string | null;

    selected_power_ab_1?: number | string | null;
    selected_power_ab_2?: number | string | null;
    selected_power_ab_3?: number | string | null;

    powerEdgeOptions1?: IChargenPowerVars | null;
    powerEdgeOptions2?: IChargenPowerVars | null;
    powerEdgeOptions3?: IChargenPowerVars | null;

    /* Legacy Options REMOVE ON NEXT DATA MIGRATION */
    selected_power_name_1?: string;
    selected_power_name_2?: string;
    selected_power_name_3?: string;

    selected_power_trappings_1?: string;
    selected_power_trappings_2?: string;
    selected_power_trappings_3?: string;

    selected_power_summary_1?: string;
    selected_power_summary_2?: string;
    selected_power_summary_3?: string;

    selected_power_custom_1?: IPowerCustom | null;
    selected_power_custom_2?: IPowerCustom | null;
    selected_power_custom_3?: IPowerCustom | null;

    selected_power_limitation_range_1?: string;
    selected_power_limitation_range_2?: string;
    selected_power_limitation_range_3?: string;

    selected_power_limitation_aspect_1?: string;
    selected_power_limitation_aspect_2?: string;
    selected_power_limitation_aspect_3?: string;

    selected_power_innate1: boolean;
    selected_power_innate2: boolean;
    selected_power_innate3: boolean;

    /* Legacy Options REMOVE ON NEXT DATA MIGRATION */

    selected_skill_1?: string;
    selected_skill_2?: string;

    selected_combat_edge: string;

    selected_ab?: number;

    selected_attribute?: string;

    selected_ability_item: string;
    selected_edge: string;

    needs_selected_weapon: boolean;

    heros_journey_table_selections: number[];
    heros_journey_table_item_selections: number[];
    heros_journey_table_item_completions: number[];
    heros_journey_table_item_sub_choices: number[];
    heros_journey_table_item_specifications: string[];

}

export class Edge  extends BaseObject {

    _hasBeenApplied: boolean = false;
    _hasPreCalcBeenApplied: boolean = false;

    addedArcaneBackground: boolean = false;

    pathfinderClassEdge: boolean = false;

    instructions: string = "";
    nameAppend: string = "";
    effects: string[] = [];
    needsToSpecify: boolean = false;

    hiddenOnCharacterSheet: boolean = false;

    canToggle: boolean = false;
    isActive: boolean = false;

    showOptions: boolean = true;

    addedFrom: string = "";
    group: string = "";
    arcaneBackground: ArcaneBackground | null = null;

    countsAsOther: string[] = [];

    // bookID: number = 0;
    // bookName: string = "";
    // bookPublisher: string = "";
    // bookPublished: string = "";
    // bookPage: string = "";
    // bookShortName: string = "";
    // bookPrimary: boolean = false;
    // bookCore: boolean = false;

    abCount: number = 0;

    noApply: boolean = false;
    freeEdge: boolean = false;

    numberTimesTaken: number = 0;

    isSelectedEdge: boolean = false;

    selectedCombatEdge: string = "";
    selectedEdge: string = "";
    selectedEdgeLimitGroup: string[] = [];

    conflicts: string[] = [];
    requirements: string[] = [];

    specify: string = "";
    specifyReadOnly: boolean = false;

    selectedABUUID: string = "";

    oncePerRank: boolean = false;
    addsArcaneBackground: boolean = false;

    canBeTakenMoreThanOnce: boolean = false;
    // hasBeenApplied: boolean = false;

    isArcaneBackground: boolean = false;

    takenAtRank: number = 0;
    takenAtAdvance: number = -1;

    selectedAbilityItems: string[] = [];
    selectAbilityItem: string = "";

    // for New Power(s) Edges
    selectedPowerID1: string = "0";
    selectedPowerID2: string = "0";
    selectedPowerID3: string = "0";

    selectedCustomPower1: IPowerCustom | null = null;
    selectedCustomPower2: IPowerCustom | null = null;
    selectedCustomPower3: IPowerCustom | null = null;

    selectedABIndex1: number|string = 0;
    selectedABIndex2: number|string = 0;
    selectedABIndex3: number|string = 0;

    selectedAttribute: string = "";

    // selectedCustomPowerName1: string = "";
    // selectedCustomPowerName2: string = "";
    // selectedCustomPowerName3: string = "";

    // selectedCustomPowerTrappings1: string = "";
    // selectedCustomPowerTrappings2: string = "";
    // selectedCustomPowerTrappings3: string = "";

    // selectedCustomPowerSummary1: string = "";
    // selectedCustomPowerSummary2: string = "";
    // selectedCustomPowerSummary3: string = "";

    // selectedPowerLimitationRange1: string = "";
    // selectedPowerLimitationRange2: string = "";
    // selectedPowerLimitationRange3: string = "";

    // selectedPowerLimitationAspect1: string = "";
    // selectedPowerLimitationAspect2: string = "";
    // selectedPowerLimitationAspect3: string = "";

    // selectedPowerInnate1: boolean = false;
    // selectedPowerInnate2: boolean = false;
    // selectedPowerInnate3: boolean = false;

    needsSelectedPower1 = false;
    needsSelectedPower2 = false;
    needsSelectedPower3 = false;

    powerEdgeOptions1: IChargenPowerVars;
    powerEdgeOptions2: IChargenPowerVars;
    powerEdgeOptions3: IChargenPowerVars;

    limitedSelectedPowers: string[] = [];

    selectedSkill1: string = "";
    selectedSkill2: string = "";

    needsSelectedSmartsSkill1 = false;
    needsSelectedSmartsSkill2 = false;
    needsSelectedSkill1 = false;
    needsSelectedSkill2 = false;
    needsSelectedSkill1Filter: string[] = [];
    needsSelectedSkill2Filter: string[] = [];

    needsSelectedCombatEdge = false;
    needsSelectedEdge = false;
    needsSelectedWeapon = false;

    isLinguist: boolean = false;

    herosJourneyTableSelections: number[] = [];
    herosJourneyTableItemSelections: number[] = [];
    herosJourneyTableItemCompletions: number[] = [];
    herosJourneyTableItemSubChoices: number[] = [];
    herosJourneyTableItemSpecifications: string[] = [];

    selectedTrait: string = "";

    swade_super_powers: SuperPower2021[] = [];
    swade_super_power_sets: SuperPowerSet2021[] = [];

    provides_swade_super_powers: boolean = false;

    constructor(
        edgeDef: IChargenEdge | null,
        characterObject: PlayerCharacter | null,
    ) {
        super( edgeDef, characterObject )
        this._char = characterObject;
        this.import( edgeDef )
    }

    getTotalSPCPowerPoints(): number {
        if( this._char ) {
            let rv = this._char.setting.swade_spc_campaign_power_level + this._char.setting.swade_spc_campaign_points_adjust;
            for( let power of this.swade_super_powers) {
                rv -= power.getPointsApplied();
            }
            return rv;
        }
        return 0;
    }

    getRemainingSPCPowerPoints(): number {
        if( this._char ) {
            let rv = this._char.setting.swade_spc_campaign_power_level + this._char.setting.swade_spc_campaign_points_adjust;

            for( let power of this.swade_super_powers ) {
                rv -= power.getPointsApplied();
            }
            for( let set of this.swade_super_power_sets ) {
                rv -= set.getTotalPoints();
            }

            return rv;
        }
        return 0;
    }


     /**
     * Imports the IChargenEdge Definition
     */
    import(jsonImportObj: IChargenEdge | null) {
        super.import(jsonImportObj, this._char ? this._char.getAvailableData().books : [] );

        if( jsonImportObj ) {

            this.canToggle = false;

            if( jsonImportObj.provides_swade_super_powers ) {
                this.provides_swade_super_powers = true;
            }

            if( jsonImportObj.pathfinderClassEdge ) {
                this.pathfinderClassEdge = true;
            }

            if( jsonImportObj.can_toggle ) {
                this.canToggle = true;
            }

            if( jsonImportObj.can_toggle ) {
                this.canToggle = true;
            }

            if( jsonImportObj.counts_as_other ) {
                this.countsAsOther = jsonImportObj.counts_as_other;
            }

            if( jsonImportObj.is_linguist ) {
                this.isLinguist = jsonImportObj.is_linguist;
            }

            this.instructions = "";
            if( jsonImportObj.instructions ) {
                this.instructions = jsonImportObj.instructions;
            }

            this.effects = [];
            if(jsonImportObj.effects && typeof( jsonImportObj.effects) !== 'undefined'){
                if(typeof( jsonImportObj.effects) === 'string'){
                    this.effects = JSON.parse(jsonImportObj.effects);
                } else {
                    this.effects = jsonImportObj.effects;
                }
            }

            this.hiddenOnCharacterSheet = false;
            if( jsonImportObj.hidden_on_character_sheet ) {
                this.hiddenOnCharacterSheet = true;
            }

            this.needsSelectedWeapon = false;
            if( jsonImportObj.needs_selected_weapon ) {
                this.needsSelectedWeapon = true;
            }

            // console.log("!", this.name, jsonImportObj.needs_selected_weapon)

            if(typeof( jsonImportObj.free_edge) !== 'undefined'){
                this.freeEdge = jsonImportObj.free_edge;
            }

            if(typeof( jsonImportObj.group) !== 'undefined'){
                this.group = jsonImportObj.group;
            }
            if(typeof( jsonImportObj.specify) !== 'undefined'){
                this.specify = jsonImportObj.specify;
            }

            if(typeof( jsonImportObj.number_times_taken) !== 'undefined'){
                this.numberTimesTaken = jsonImportObj.number_times_taken;
            }

            if(typeof( jsonImportObj.selected_trait) !== 'undefined'){
                this.selectedTrait = jsonImportObj.selected_trait;
            }

            let cleanEffects: string[] = [];
            for( let effect of this.effects ) {
                if( effect.trim() ) {
                    cleanEffects.push( effect.trim() );
                }
            }
            this.effects = cleanEffects;

            if(jsonImportObj.conflicts && typeof( jsonImportObj.conflicts) !== 'undefined'){
                if(typeof( jsonImportObj.conflicts) === 'string'){
                    this.conflicts = JSON.parse(jsonImportObj.conflicts);
                } else {
                    this.conflicts = jsonImportObj.conflicts;
                }
            }

            if(jsonImportObj.requirements && typeof( jsonImportObj.requirements) !== 'undefined'){
                if(typeof( jsonImportObj.requirements) === 'string'){
                    this.requirements = JSON.parse(jsonImportObj.requirements);
                } else {
                    this.requirements = jsonImportObj.requirements;
                }
            }

            if(typeof( jsonImportObj.can_be_taken_more_than_once) !== 'undefined'){
                if( jsonImportObj.can_be_taken_more_than_once ) {
                    this.canBeTakenMoreThanOnce = true;
                }
            }

            if(typeof( jsonImportObj.once_per_rank) !== 'undefined'){
                if( jsonImportObj.once_per_rank ) {
                    this.oncePerRank = true;
                }
            }

            if(typeof( jsonImportObj.needs_to_specify) !== 'undefined'){
                if( jsonImportObj.needs_to_specify ) {
                    this.needsToSpecify = true;
                }
            }

            if(typeof( jsonImportObj.arcane_background) !== 'undefined'){
                if( jsonImportObj.arcane_background ) {
                    this.addsArcaneBackground = true;
                }
            }

            this.arcaneBackground = null;
            if(typeof( jsonImportObj.is_arcane_background) !== 'undefined'){
                if( jsonImportObj.is_arcane_background ) {
                    // console.log("XX0", this.name)
                    // console.log("jsonImportObj.is_arcane_background", this.name, jsonImportObj.arcane_background_def)
                    this.isArcaneBackground = true;
                    if(typeof( jsonImportObj.arcane_background_def) !== 'undefined' && jsonImportObj.arcane_background_def){
                        // if( jsonImportObj.arcane_background_def ) {

                            // console.log("jsonImportObj.arcane_background_def", jsonImportObj.arcane_background_def)

                            jsonImportObj.arcane_background_def.book_id = jsonImportObj.book_id;
                            jsonImportObj.arcane_background_def.book_def = jsonImportObj.book_def;
                            this.arcaneBackground = new ArcaneBackground( jsonImportObj.arcane_background_def, this._char);

                            // console.log("jsonImportObj.arcane_background_def this.arcaneBackground.name", this.arcaneBackground.name)
                            this.arcaneBackground.takenAtAdvance = this.takenAtAdvance;

                            // if( this._char && this._char._availableData ) {
                            //     for( let edge of this._char._availableData.edges ) {
                            //         if( jsonImportObj.id == edge.id && edge.arcane_background_def ) {
                            //             // console.log("XX1", edge.arcane_background_def.effects )
                            //             // console.log("XX2", jsonImportObj.arcane_background_def.effects )
                            //             this.arcaneBackground = new ArcaneBackground( edge.arcane_background_def, this._char);
                            //             this.arcaneBackground.takenAtAdvance = this.takenAtAdvance;
                            //             break;
                            //         }
                            //     }
                            // }

                        // }
                    } else {
                        // if( this._char && this._char._availableData ) {
                        //     for( let edge of this._char._availableData.edges ) {
                        //         if( jsonImportObj.id == edge.id && edge.arcane_background_def ) {
                        //             // console.log("XX2", this.name)
                        //             this.arcaneBackground = new ArcaneBackground( edge.arcane_background_def, this._char);
                        //             this.arcaneBackground.takenAtAdvance = this.takenAtAdvance;
                        //             break;
                        //         }
                        //     }
                        // }
                    }
                }
            }

            // Scholar edge / select skills
            this.selectedSkill1 = "";
            if(typeof( jsonImportObj.selected_skill_1) !== 'undefined'){
                this.selectedSkill1 = jsonImportObj.selected_skill_1;
            }

            this.selectedSkill2 = "";
            if(typeof( jsonImportObj.selected_skill_2) !== 'undefined'){
                this.selectedSkill2 = jsonImportObj.selected_skill_2;
            }

            // for New Power(s) Edges
            this.selectedPowerID1 = "0";
            if(typeof( jsonImportObj.selected_power_id_1) !== 'undefined'){
                this.selectedPowerID1 = jsonImportObj.selected_power_id_1;
            }
            this.selectedPowerID2 = "0";
            if(typeof( jsonImportObj.selected_power_id_2) !== 'undefined'){
                this.selectedPowerID2 = jsonImportObj.selected_power_id_2;
            }
            this.selectedPowerID3 = "0";
            if(typeof( jsonImportObj.selected_power_id_3) !== 'undefined'){
                this.selectedPowerID3 = jsonImportObj.selected_power_id_3;
            }

            this.selectAbilityItem = "";
            if(typeof( jsonImportObj.selected_ability_item) !== 'undefined'){
                this.selectAbilityItem = jsonImportObj.selected_ability_item;
            }

            this.selectedCustomPower1 = null;
            if(typeof( jsonImportObj.selected_power_custom_1) !== 'undefined'){
                this.selectedCustomPower1 = jsonImportObj.selected_power_custom_1;
            }
            this.selectedCustomPower2 = null;
            if(typeof( jsonImportObj.selected_power_custom_2) !== 'undefined'){
                this.selectedCustomPower2 = jsonImportObj.selected_power_custom_2;
            }
            this.selectedCustomPower3 = null;
            if(typeof( jsonImportObj.selected_power_custom_3) !== 'undefined'){
                this.selectedCustomPower3 = jsonImportObj.selected_power_custom_3;
            }
            this.selectedABIndex1 = 0;
            if(typeof( jsonImportObj.selected_power_ab_1) !== 'undefined' && jsonImportObj.selected_power_ab_1){
                this.selectedABIndex1 = jsonImportObj.selected_power_ab_1;
            }
            this.selectedABIndex2 = 0;
            if(typeof( jsonImportObj.selected_power_ab_2) !== 'undefined' && jsonImportObj.selected_power_ab_2){
                this.selectedABIndex2 = jsonImportObj.selected_power_ab_2;
            }

            this.selectedABIndex3 = 0;
            if(typeof( jsonImportObj.selected_power_ab_3) !== 'undefined' && jsonImportObj.selected_power_ab_3){
                this.selectedABIndex3 = jsonImportObj.selected_power_ab_3;
            }

            if( jsonImportObj.powerEdgeOptions1 ) {
                this.powerEdgeOptions1 = jsonImportObj.powerEdgeOptions1;
            } else {
                this.powerEdgeOptions1 = {
                    customName: "",
                    customDescription: [],
                    limitationRange: "",
                    neg2SkillPenalty: false,
                    limitationAspect: "",
                    setting_item: false,
                    limitationPersonal: "",
                    innatePower: false,
                    trappings: "",
                    effectSpecify: "",
                    abID: -1,
                    uuid: "",
                }

                if( jsonImportObj.selected_power_innate1) {
                    this.powerEdgeOptions1.innatePower = true;
                }

                if(typeof( jsonImportObj.selected_power_limitation_range_1) !== 'undefined'){
                    this.powerEdgeOptions1.limitationRange = jsonImportObj.selected_power_limitation_range_1;
                }

                if(typeof( jsonImportObj.selected_power_limitation_aspect_1) !== 'undefined'){
                    this.powerEdgeOptions1.limitationRange = jsonImportObj.selected_power_limitation_aspect_1;
                }

                if(typeof( jsonImportObj.selected_power_name_1) === 'string'){
                    this.powerEdgeOptions1.customName = jsonImportObj.selected_power_name_1;
                }

                if(typeof( jsonImportObj.selected_power_trappings_1) === 'string'){
                    this.powerEdgeOptions1.trappings = jsonImportObj.selected_power_trappings_1;
                }

                if(typeof( jsonImportObj.selected_power_summary_1) === 'string'){
                    this.powerEdgeOptions1.customDescription = jsonImportObj.selected_power_summary_1.split("\n");
                }
            }

            if( jsonImportObj.powerEdgeOptions2 ) {
                this.powerEdgeOptions2 = jsonImportObj.powerEdgeOptions2;
            } else {
                this.powerEdgeOptions2 = {
                    customName: "",
                    customDescription: [],
                    limitationPersonal: "",
                    limitationRange: "",
                    limitationAspect: "",
                    setting_item: false,
                    innatePower: false,
                    neg2SkillPenalty: false,
                    trappings: "",
                    effectSpecify: "",
                    abID: -2,
                    uuid: "",
                }

                if( jsonImportObj.selected_power_innate2) {
                    this.powerEdgeOptions2.innatePower = true;
                }

                if(typeof( jsonImportObj.selected_power_limitation_range_2) !== 'undefined'){
                    this.powerEdgeOptions2.limitationRange = jsonImportObj.selected_power_limitation_range_2;
                }

                if(typeof( jsonImportObj.selected_power_limitation_aspect_2) !== 'undefined'){
                    this.powerEdgeOptions2.limitationRange = jsonImportObj.selected_power_limitation_aspect_2;
                }

                if(typeof( jsonImportObj.selected_power_name_2) === 'string'){
                    this.powerEdgeOptions2.customName = jsonImportObj.selected_power_name_2;
                }

                if(typeof( jsonImportObj.selected_power_trappings_2) === 'string'){
                    this.powerEdgeOptions2.trappings = jsonImportObj.selected_power_trappings_2;
                }

                if(typeof( jsonImportObj.selected_power_summary_2) === 'string'){
                    this.powerEdgeOptions2.customDescription = jsonImportObj.selected_power_summary_2;
                }
            }

            if( jsonImportObj.powerEdgeOptions3 ) {
                this.powerEdgeOptions3 = jsonImportObj.powerEdgeOptions3;
            } else {
                this.powerEdgeOptions3 = {
                    customName: "",
                    customDescription: [],
                    limitationRange: "",
                    neg2SkillPenalty: false,
                    limitationAspect: "",
                    innatePower: false,
                    limitationPersonal: "",
                    setting_item: false,
                    trappings: "",
                    effectSpecify: "",
                    abID: -1,
                    uuid: "",
                }

                if( jsonImportObj.selected_power_innate3) {
                    this.powerEdgeOptions3.innatePower = true;
                }

                if(typeof( jsonImportObj.selected_power_limitation_range_3) !== 'undefined'){
                    this.powerEdgeOptions3.limitationRange = jsonImportObj.selected_power_limitation_range_3;
                }

                if(typeof( jsonImportObj.selected_power_limitation_aspect_3) !== 'undefined'){
                    this.powerEdgeOptions3.limitationRange = jsonImportObj.selected_power_limitation_aspect_3;
                }

                if(typeof( jsonImportObj.selected_power_name_3) === 'string'){
                    this.powerEdgeOptions3.customName = jsonImportObj.selected_power_name_3;
                }

                if(typeof( jsonImportObj.selected_power_name_3) === 'string'){
                    this.powerEdgeOptions3.trappings = jsonImportObj.selected_power_name_3;
                }

                if(typeof( jsonImportObj.selected_power_summary_3) === 'string'){

                    this.powerEdgeOptions3.customDescription = jsonImportObj.selected_power_summary_3;

                }
            }

            this.selectedAttribute = "";
            if(typeof( jsonImportObj.selected_attribute) !== 'undefined' && jsonImportObj.selected_attribute){
                this.selectedAttribute = jsonImportObj.selected_attribute;
            }

            this.selectedCombatEdge = "";
            if(jsonImportObj.selected_combat_edge){
                this.selectedCombatEdge = jsonImportObj.selected_combat_edge;
            }

            this.selectedEdge = "";
            if(jsonImportObj.selected_edge){
                this.selectedEdge = jsonImportObj.selected_edge;
            }

            this.selectedSkill1 = "";
            if(typeof( jsonImportObj.selected_skill_1) !== 'undefined'){
                this.selectedSkill1 = jsonImportObj.selected_skill_1;
            }

            this.selectedSkill2 = "";
            if(typeof( jsonImportObj.selected_skill_2) !== 'undefined'){
                this.selectedSkill2 = jsonImportObj.selected_skill_2;
            }
        }

        for( let line of this.effects ) {

            if( line.toLowerCase().indexOf("[pick1:smarts-skill]") > 0)  {
                this.needsSelectedSmartsSkill1 = true;
            }

            if( line.toLowerCase().indexOf("[pick2:smarts-skill]") > 0)  {
                this.needsSelectedSmartsSkill2 = true;
            }

            if( line.toLowerCase().indexOf("[pick1:skill") > 0)  {
                this.needsSelectedSkill1 = true;
                if( line.toLowerCase().indexOf("[pick1:skill;") > 0 ) {
                    let split = line.toLowerCase().split("[pick1:skill;", 2);
                    let item = split[1];
                    if( item.indexOf("]") > 0 )
                        item = item.substring( 0, item.indexOf("]") );
                    this.needsSelectedSkill1Filter = item.split("|");
                }
            }

            if( line.toLowerCase().indexOf("[pick2:skill") > 0)  {
                this.needsSelectedSkill2 = true;
                if( line.toLowerCase().indexOf("[pick2:skill;") > 0 ) {
                    let split = line.toLowerCase().split("[pick2:skill;", 2);
                    let item = split[1];
                    if( item.indexOf("]") > 0 )
                        item = item.substring( 0, item.indexOf("]") );
                    this.needsSelectedSkill2Filter = item.split("|");
                }
            }

            if( line.toLowerCase().indexOf("[select_combat_edge]") > 0)  {
                this.needsSelectedCombatEdge = true;
            }

            if( line.startsWith("choose_item:")) {
                let specifyListText = line.substring(line.indexOf("[") + 1);

                if( specifyListText.indexOf("]") > 1) {
                    specifyListText = specifyListText.substring(0, specifyListText.indexOf("]") - 1);
                }

                this.selectedAbilityItems = specifyListText.split(";");
            }

        }

        if( this._char ) {

            this.needsSelectedPower3 = false;
            if( this.hasNewPowerModline() ) {
                this.needsSelectedPower1 = true;
                this.needsSelectedPower2 = false;
                if( this._char._newPowersEdgeBonus > 0 ) {
                    this.needsSelectedPower2 = true;

                }
            }

            if( this.hasNewPowersModline() ) {
                this.needsSelectedPower1 = true;
                this.needsSelectedPower2 = true;
                if( this._char._newPowersEdgeBonus > 0 ) {
                    this.needsSelectedPower3 = true;
                }
            }
        }

        if( jsonImportObj && jsonImportObj.selectedOptions ) {
            this.importOptions( jsonImportObj.selectedOptions );
        }

        // console.log("jsonImportObj.arcane_background_def this.arcaneBackground.name 2", this.arcaneBackground?.name)

    }

    /**
     * Returns true if this edge requires an Arcane Background to be selected
     */
    needsSelectedArcaneBackground(): boolean {

        if(! this._char ) {
            return false;
        }

        if( this.needsSelectedPower1 && !this._char.isSuper ) {
            return true;
        }
        if( this._char && this._char.getNumberOfSelectedArcaneBackgrounds() > 0 && this.hasPowerPointModline() ) {
            return true;
        }
        return false;
    }

    /**
     * Returns true if this edge provides Power Points
     */
    hasPowerPointModline(): boolean {
        for( let effect of this.effects ) {
            if(
                effect.trim().toLowerCase().indexOf("power_points") > -1
                ||
                effect.trim().toLowerCase().indexOf("powerpoints") > -1
            ) {
                return true;
            }
        }

        return false;
    }

    /**
    * Sets the specify string property
    */
    setSpecify( nv: string ) {
        this.specify = nv;
    }

    /**
     * Returns true if this edge provides a single Power
     */
    hasNewPowerModline(): boolean {
        for( let effect of this.effects ) {
            if(
                effect.trim().toLowerCase().indexOf("new_powers_edge_bonus") == -1
                && (
                    effect.trim().toLowerCase().indexOf("new_powers") > -1
                    ||
                    effect.trim().toLowerCase().indexOf("newpowers") > -1
                )

            ) {
                if( effect.indexOf(":") > -1 ) {
                    let split = effect.split(":");
                    if( split.length > 1 && split[1].trim() && split[1].indexOf(",") > -1 ) {
                        this.limitedSelectedPowers = [];
                        for( let power of split[1].split(",") ) {
                            if( power.toLowerCase().trim() )
                                this.limitedSelectedPowers.push( power.toLowerCase().trim() );
                        }
                    }
                }
                return true;
            }
        }

        return false;
    }
    /**
     * Returns true if this edge provides a single Power
     */
    hasSingleNewPowersModline(): boolean {
        for( let effect of this.effects ) {

            if(

                effect.trim().toLowerCase() == "new_power"
                ||
                effect.trim().toLowerCase() == "newpower"

            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns true if this edge provides a a "zero" Power. This is intended to be used along with other modifiers or edges which will add a power
     */
    hasZeroNewPowersModline(): boolean {
        for( let effect of this.effects ) {

            if(

                effect.trim().toLowerCase() == "zero_new_power"
                ||
                effect.trim().toLowerCase() == "zero_newpower"
                ||
                effect.trim().toLowerCase() == "zeronewpower"
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns true if this edge provides new Powers
     */
    hasNewPowersModline(): boolean {
        for( let effect of this.effects ) {

            if(

                effect.trim().toLowerCase() == "new_powers"
                ||
                effect.trim().toLowerCase() == "newpowers"
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Returns true if this edge provides Power Points
     */
    hasPowerPointModLine(): boolean {
        for( let effect of this.effects ) {
            if(

                effect.trim().toLowerCase() == "power_points"
                ||
                effect.trim().toLowerCase() == "powerpoints"
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * This gets the fullly displayed name whether it's modified or custom, etc.
     */
    getName(includeSpecify: boolean = false ): string {

        let customName = "custom";
        if( this.setting_item ) {
            customName = "setting";
        }

        let customText = "";

        if(!includeSpecify) {

            return this.name + this.nameAppend;
        }

        if( this.needsSelectedWeapon && this.specify && this._char  ) {
            let weaponName = "Not Found";

            for( let weapon of this._char.getWeapons() ) {
                if(
                    weapon.name.toLowerCase().trim() == this.specify.toLowerCase().trim()
                        ||
                    weapon.uuid.toLowerCase().trim() == this.specify.toLowerCase().trim()
                ) {
                    weaponName = weapon.name;
                    break;
                }
            }

            return this.name + this.nameAppend + " (" + weaponName + ")";
        }

        if( this.needsSelectedCombatEdge && this.selectedCombatEdge )
            return this.name + this.nameAppend + " (" + this.selectedCombatEdge + ")";

        if( this._char && this.addsArcaneBackground ) {
            let abName = ""

            //@ts-ignore
            if( this.abCount < this._char._selectedArcaneBackgrounds.length && this._char._selectedArcaneBackgrounds[this.abCount]) {
                //@ts-ignore
                abName = this._char._selectedArcaneBackgrounds[this.abCount].name;
            }

            if( abName )
                return this.name  + this.nameAppend+ " (" + abName + ")";
            else
                return this.name + this.nameAppend + " (unselected)";
        }

        if( this.needsToSpecify ) {
            // Check if the specified item is a setting skill (added by sourcebook, not player-created)
            const isSettingSkill = this._char && this._char.getSkill(this.specify)?.settingSkill;

            if( this.is_custom && !isSettingSkill )
                customText = customName + ", ";

            if( this.specify.trim() )
                return this.name + this.nameAppend + " (" + customText + this.specify + ")";
            else {
                if( customText )
                    return this.name + this.nameAppend + " (" + customText + ")";
                else
                    return this.name + this.nameAppend;
            }
        } else {
            let returnDetails = customText;

            if( this._char && +this.selectedPowerID1 && this.needsSelectedPower1 ) {
                if( !returnDetails ) {
                    returnDetails += " (";
                    if( this.is_custom )
                        returnDetails = customName + ", ";

                }
                returnDetails += getPowerName(+this.selectedPowerID1, this._char.getAvailableData().powers);
            }

            if( this._char && +this.selectedPowerID2 && this.needsSelectedPower2 ) {
                if( !returnDetails ) {
                    returnDetails += " (";
                    if( this.is_custom )
                        returnDetails = customName + ", ";

                } else {
                    returnDetails += ", ";
                }
                returnDetails += getPowerName(+this.selectedPowerID2, this._char.getAvailableData().powers);
            }

            if( this._char &&  +this.selectedPowerID3 && this.needsSelectedPower3 ) {
                if( !returnDetails ) {
                    returnDetails += " (";
                    if( this.is_custom )
                        returnDetails = customName + ", ";

                } else {
                    returnDetails += ", ";
                }
                returnDetails += getPowerName(+this.selectedPowerID3, this._char.getAvailableData().powers);
            }

            if( this.selectedCustomPower1 ) {
                if( !returnDetails ) {
                    returnDetails += " (";
                    if( this.is_custom )
                        returnDetails = customName + ", ";

                } else {
                    returnDetails += ", ";
                }
                returnDetails += this.selectedCustomPower1.name;
            }

            if( this.selectedCustomPower2 ) {
                if( !returnDetails ) {
                    returnDetails += " (";
                    if( this.is_custom )
                        returnDetails = customName + ", ";
                } else {
                    returnDetails += ", ";
                }
                returnDetails += this.selectedCustomPower2.name;
            }
            if( this.selectedCustomPower3 ) {
                if( !returnDetails ) {
                    returnDetails += " (";
                    if( this.is_custom )
                        returnDetails = customName + ", ";

                } else {
                    returnDetails += ", ";
                }
                returnDetails += this.selectedCustomPower3.name;
            }
            if( returnDetails ) {
                returnDetails += ")";
            }
            if( returnDetails == "" && this.is_custom && customName ) {
                returnDetails = " (" + customName + ")";
            }

            return this.name + this.nameAppend + returnDetails;
        }
    }

    /**
     * This exports the user's selected options for the edge into the IChargenEdgeObjectVars format
     */
    exportOptions(): IChargenEdgeObjectVars {
        let rv: IChargenEdgeObjectVars = super.exportOptions() as IChargenEdgeObjectVars;

        rv.swade_super_powers = [];

        for( let obj of this.swade_super_powers) {
            if( obj.id > 0 ) {
                rv.swade_super_powers.push({
                    id: obj.id,
                    options: obj.exportOptions(),
                });
            } else {
                rv.swade_super_powers.push({
                    id: 0,
                    def: obj.export(),
                    options: obj.exportOptions(),
                });
            }
        }
        rv.super_power_sets = [];
        for( let obj of this.swade_super_power_sets ) {
            rv.super_power_sets.push(
                obj.export()
            );
        }

        rv.selected_combat_edge = this.selectedCombatEdge;
        rv.selected_edge = this.selectedEdge;
        rv.selected_ab_uuid = this.selectedABUUID;
        rv.needs_selected_weapon = this.needsSelectedWeapon;
        rv.specify = this.specify;
        rv.is_active = this.isActive;
        rv.selected_power_id_1 = this.selectedPowerID1;
        rv.selected_power_id_2 = this.selectedPowerID2;
        rv.selected_power_id_3 = this.selectedPowerID3;
        rv.selected_power_ab_1 = this.selectedABIndex1;
        rv.selected_power_ab_2 = this.selectedABIndex2;
        rv.selected_power_ab_3 = this.selectedABIndex3;
        // rv.selected_power_name_1 = this.selectedCustomPowerName1;
        // rv.selected_power_name_2 = this.selectedCustomPowerName2;
        // rv.selected_power_name_3 = this.selectedCustomPowerName3;
        // rv.selected_power_trappings_1 = this.selectedCustomPowerTrappings1;
        // rv.selected_power_trappings_2 = this.selectedCustomPowerTrappings2;
        // rv.selected_power_trappings_3 = this.selectedCustomPowerTrappings3;
        // rv.selected_power_summary_1 = this.selectedCustomPowerSummary1;
        // rv.selected_power_summary_2 = this.selectedCustomPowerSummary2;
        // rv.selected_power_summary_3 = this.selectedCustomPowerSummary3;
        rv.selected_power_custom_1 = this.selectedCustomPower1;
        rv.selected_power_custom_2 = this.selectedCustomPower2;
        rv.selected_power_custom_3 = this.selectedCustomPower3;
        // rv.selected_power_innate1 = this.selectedPowerInnate1;
        // rv.selected_power_innate2 = this.selectedPowerInnate2;
        // rv.selected_power_innate3 = this.selectedPowerInnate3;

        rv.powerEdgeOptions1 = this.powerEdgeOptions1;
        rv.powerEdgeOptions2 = this.powerEdgeOptions2;
        rv.powerEdgeOptions3 = this.powerEdgeOptions3;

        rv.selected_skill_1 = this.selectedSkill1;
        rv.selected_skill_2 = this.selectedSkill2;
        rv.selected_attribute = this.selectedAttribute;
        rv.selected_trait = this.selectedTrait;
        rv.selected_ability_item = this.selectAbilityItem;
        // rv.selected_power_limitation_range_1 = this.selectedPowerLimitationRange1;
        // rv.selected_power_limitation_range_2 = this.selectedPowerLimitationRange2;
        // rv.selected_power_limitation_range_3 = this.selectedPowerLimitationRange3;
        // rv.selected_power_limitation_aspect_1 = this.selectedPowerLimitationAspect1;
        // rv.selected_power_limitation_aspect_2 = this.selectedPowerLimitationAspect2;
        // rv.selected_power_limitation_aspect_3 = this.selectedPowerLimitationAspect3;
        rv.heros_journey_table_selections = this.herosJourneyTableItemSelections;
        rv.heros_journey_table_item_selections = this.herosJourneyTableSelections;
        rv.heros_journey_table_item_completions = this.herosJourneyTableItemCompletions;
        rv.heros_journey_table_item_sub_choices = this.herosJourneyTableItemSubChoices;
        rv.heros_journey_table_item_specifications = this.herosJourneyTableItemSpecifications;

        rv.show_options = this.showOptions;

        // rv.custom_description = this.desc

        rv.arcane_background_options = null;
        if( this.isArcaneBackground && this.arcaneBackground ) {
            rv.arcane_background_options = this.arcaneBackground.exportOptions();
        }

        rv  = cleanUpReturnValue(rv);

        // console.log("rv", this.name, rv);
        // console.log("this.selectedPowerID1", this.name, this.selectedPowerID1);

        return rv;
    }

    /**
     * Checks whether the edge is named `name` or if there are aliases that the edge counts as
     */
    isNamedOrCountsAs(
        name: string,
        debug: boolean = false,
    ): boolean {

        if( debug ) console.log("edge.isNamedOrCountsAs() 1", this.name, name);
        if(
            this.name.toLowerCase().trim() == name.toLowerCase().trim()
                ||
            this.name.toLowerCase().trim().indexOf(name.toLowerCase().trim()  +  " (" ) === 0
        ) {
            if( debug ) console.log("edge.isNamedOrCountsAs() 1.5 returning true");
            return true;
        }

        for( let countsAs of this.countsAsOther) {
            if( debug ) console.log("edge.isNamedOrCountsAs() 2,", this.name, name, countsAs);
            if( countsAs.toLowerCase().trim() == name.toLowerCase().trim() ) {
                if( debug ) console.log("edge.isNamedOrCountsAs() 2.5 returning true");
                return true;
            }
        }

        if( debug ) console.log("edge.isNamedOrCountsAs() 3,", this.name, name, this.isArcaneBackground || this.arcaneBackground || this.addsArcaneBackground, this.isArcaneBackground , this.arcaneBackground != null, this.addsArcaneBackground);
        if( name.toLowerCase().trim() == "arcane background" && (this.isArcaneBackground || this.arcaneBackground || this.addsArcaneBackground)) {
            if( debug ) console.log("edge.isNamedOrCountsAs() 3.5 returning true");
            return true;
        }

        if( debug ) console.log("edge.isNamedOrCountsAs() 4 returning FALSE");
        return false;
    }
    /**
     * Exports the definition of the current edge into the IChargenEdge format
     */
    export(): IChargenEdge {
        let rv: IChargenEdge = super.export() as IChargenEdge;

        rv.provides_swade_super_powers = this.provides_swade_super_powers ? true : false;

        rv.pathfinderClassEdge = this.pathfinderClassEdge ? true : false;
        rv.instructions = this.instructions;
        rv.is_linguist = this.isLinguist ? true : false;
        rv.counts_as_other = this.countsAsOther;
        rv.free_edge = this.freeEdge ? true : false;
        rv.hidden_on_character_sheet = this.hiddenOnCharacterSheet ? true : false;
        rv.can_toggle = this.canToggle ? true : false;
        rv.group = this.group;
        rv.effects = this.effects;
        rv.conflicts = this.conflicts;
        rv.needs_to_specify = this.needsToSpecify ? true : false;
        rv.can_be_taken_more_than_once = this.canBeTakenMoreThanOnce ? true : false;
        rv.number_times_taken = this.numberTimesTaken;
        rv.requirements = this.requirements;
        rv.arcane_background = this.addsArcaneBackground ? true : false;
        rv.once_per_rank = this.oncePerRank ? true : false;
        rv.specify = this.specify;
        rv.selected_combat_edge = this.selectedCombatEdge;
        rv.selected_edge = this.selectedEdge;
        rv.selected_ab_uuid = this.selectedABUUID;
        rv.needs_selected_weapon = this.needsSelectedWeapon;
        rv.selected_trait = this.selectedTrait;
        rv.selected_power_id_1 = this.selectedPowerID1;
        rv.selected_power_id_2 = this.selectedPowerID2;
        rv.selected_power_id_3 = this.selectedPowerID3;
        rv.selected_power_ab_1 = this.selectedABIndex1;
        rv.selected_power_ab_2 = this.selectedABIndex2;
        rv.selected_power_ab_3 = this.selectedABIndex3;
        // rv.selected_power_name_1 = this.selectedCustomPowerName1;
        // rv.selected_power_name_2 = this.selectedCustomPowerName2;
        // rv.selected_power_name_3 = this.selectedCustomPowerName3;

        // rv.selected_power_trappings_1 = this.selectedCustomPowerTrappings1;
        // rv.selected_power_trappings_2 = this.selectedCustomPowerTrappings2;
        // rv.selected_power_trappings_3 = this.selectedCustomPowerTrappings3;

        // rv.selected_power_summary_1 = this.selectedCustomPowerSummary1;
        // rv.selected_power_summary_2 = this.selectedCustomPowerSummary2;
        // rv.selected_power_summary_3 = this.selectedCustomPowerSummary3;
        rv.selected_power_custom_1 = this.selectedCustomPower1;
        rv.selected_power_custom_2 = this.selectedCustomPower2;
        rv.selected_power_custom_3 = this.selectedCustomPower3;
        // rv.selected_power_innate1 = this.selectedPowerInnate1;
        // rv.selected_power_innate2 = this.selectedPowerInnate2;
        // rv.selected_power_innate3 = this.selectedPowerInnate3;
        rv.selected_skill_1 = this.selectedSkill1;
        rv.selected_skill_2 = this.selectedSkill2;
        rv.selected_attribute = this.selectedAttribute;
        rv.selected_ability_item = this.selectAbilityItem;
        // rv.selected_power_limitation_range_1 = this.selectedPowerLimitationRange1;
        // rv.selected_power_limitation_range_2 = this.selectedPowerLimitationRange2;
        // rv.selected_power_limitation_range_3 = this.selectedPowerLimitationRange3;
        // rv.selected_power_limitation_aspect_1 = this.selectedPowerLimitationAspect1;
        // rv.selected_power_limitation_aspect_2 = this.selectedPowerLimitationAspect2;
        // rv.selected_power_limitation_aspect_3 = this.selectedPowerLimitationAspect3;
        rv.powerEdgeOptions1 = this.powerEdgeOptions1;
        rv.powerEdgeOptions2 = this.powerEdgeOptions2;
        rv.powerEdgeOptions3 = this.powerEdgeOptions3;

        // rv.custom_name = "";
        // rv.uuid = "";

        rv.is_arcane_background = this.isArcaneBackground;
        if( rv.is_arcane_background ) {
            if( this.arcaneBackground ) {
                rv.arcane_background_def = this.arcaneBackground.export();
            } else {

                rv.arcane_background_def = new ArcaneBackground(null, this._char).export();
            }
        } else {
            rv.arcane_background_def = null;
        }

        rv.selectedOptions = null;
        if( this.is_custom || this.setting_item ) {
            rv.selectedOptions = this.exportOptions();
        }

        rv  = cleanUpReturnValue(rv);

        return rv;
    }

    /**
     * This returns a boolean if the edge is available for selection
     */
    public isAvailable(
        charObj: PlayerCharacter | null = null,
        ignoreRankRequirements: boolean = false,
        forSelection: boolean = false,
        debug: boolean = false,
    ): IItemUpdateItemAvailability {

        let messages: string[] = [];

        if( !charObj ) {
            return {
                canBeTaken: true,
                messages: messages,
            };
        } else {
            let canBeTaken = true;

            for( let conf of charObj._blockedHindrances ) {
                conf = conf.toLowerCase().trim();
                if( conf  == this.name.toLowerCase().trim() ) {
                    canBeTaken = false;
                    messages.push( this.name + " is on the character's internal edge blacklist - likely given by a race modifier");
                }
            }

            if( !charObj.setting.edgeIsEnabled( this.id ) && !this.setting_item ) {
                canBeTaken = false;
                messages.push( this.name + " is on the setting's block list");
            }

            for( let item of charObj._bannedEdges ) {
                if( item.name.toLowerCase().trim() == this.name.toLowerCase().trim() ) {
                    canBeTaken = false;
                    messages.push( this.name + " blocked due to the " + item.from + "'s block list");
                }
            }

            // Requirements!
            for( let req of this.requirements ) {
                if( this.selectedTrait ) {
                    req = replaceAll(req, "[selected_trait]", this.selectedTrait)
                    req = replaceAll(req, "[select_trait]", this.selectedTrait)
                }

                if( req.trim() ) {

                    let result = ParseRequirementLine(
                        req,
                        charObj,
                        this,
                        ignoreRankRequirements,
                        debug,
                    );
                    // if( this.name == "Mentalist")
                    //     console.log(result, charObj._selectedArcaneBackgrounds)
                    if( !result.empty && !result.found ) {
                        // if a trait or whatever isn't selected,...
                        if( req.indexOf("[select") == -1 && req.indexOf("[choose") == -1) {
                            messages.push("Edge requires: " + result.parseMessage)
                            canBeTaken = false;
                        }
                    }
                }

                // if a trait or whatever isn't selected,...

            }

            // Conflicts
            for( let conflict of this.conflicts ) {
                if( this.selectedTrait ) {
                    conflict = replaceAll(conflict, "[selected_trait]", this.selectedTrait)
                    conflict = replaceAll(conflict, "[select_trait]", this.selectedTrait)
                }
                let result = ParseRequirementLine(
                    conflict,
                    charObj,
                    this,
                    undefined,
                );

                if( !result.empty && result.found ) {
                    // if a trait or whatever isn't selected,...
                    if( conflict.indexOf("[select") == -1 && conflict.indexOf("[choose") == -1) {
                        messages.push( result.parseMessage)
                        canBeTaken = false;
                    }
                }

            }

            let findCount = 1;

            if( forSelection )
                findCount = 0;

            if( this.oncePerRank ) {
                if( this.name.toLowerCase() == "power points" && charObj.getCurrentRank() > 4 ) {
                    // canBeTaken = true;
                } else {
                    let count = charObj.hasEdge( this.name, charObj.getCurrentRank(), this.selectedABIndex1 );
                    if( count > findCount) {
                        messages.push( "Already has selected edge " + this.name + " at rank " + charObj.getCurrentRankName() ); //  + " (" + count + ")")
                        canBeTaken = false;
                    }
                }
            } else {
                if( !this.canBeTakenMoreThanOnce ) {

                    let count = charObj.hasEdge( this.name );
                    if( count > findCount ) {
                        messages.push( "Already has selected edge " + this.name ); // + " (" + count + ")")
                        canBeTaken = false;
                    }
                }
            }

            // Selected Edges
            if( this.needsSelectedEdge ) {
                if( this.selectedEdge && this._char ) {
                    // check to see if selected Edge is valid
                    let edge = this._char.makeEdgeObjNamed( this.selectedEdge );

                    if( edge ) {
                        let avail = edge.isValid( this._char );
                        this._char.addValidationMessage(
                            avail.severity,
                            "Added '" + edge.name + "' - " + avail.message,
                            "/character/creator/edges",
                        );
                    }
                } else {
                    canBeTaken = false;
                    messages.push("You need to select an edge")
                }
            }

            return {
                canBeTaken: canBeTaken,
                messages: messages,
            };
        }
    }

    availablePowerCount(): number {

        // console.log("this.needsSelectedPower1", this.needsSelectedPower1)
        // console.log("this.needsSelectedPower2", this.needsSelectedPower2)
        // console.log("this.needsSelectedPower3", this.needsSelectedPower3)

        if( this.needsSelectedPower1 ) {
            let numberAvailable = 0;

            if(
                (
                this.selectedPowerID1.trim() == ""
                ||
                this.selectedPowerID1.trim() == "0"
                )
                &&
                this.selectedCustomPower1 == null
            ) {
                numberAvailable++;
            }

            if( this.needsSelectedPower2 ) {
                if(
                    (
                    this.selectedPowerID2.trim() == ""
                    ||
                    this.selectedPowerID2.trim() == "0"
                    )
                    &&
                    this.selectedCustomPower2 == null
                ) {
                    numberAvailable++;
                }

                if( this.needsSelectedPower3 ) {
                    if(
                        (
                        this.selectedPowerID3.trim() == ""
                        ||
                        this.selectedPowerID3.trim() == "0"
                        )
                        &&
                        this.selectedCustomPower3 == null
                    ) {
                        numberAvailable++;
                    }
                }

                return numberAvailable;
            }
        }

        if( this.arcaneBackground ) {
            return this.arcaneBackground.availablePowerCount();
        }

        return 0;
    }

    togglePowerSetActive(
        index: number
    ) {
        for( let setIndex in this.swade_super_power_sets ) {
            // let activeVal = false;
            // if( index === +setIndex ) {
            //     activeVal = this.swade_super_power_sets[setIndex].active;
            // }

            // console.log("togglePowerSetActive", index, this.swade_super_power_sets[setIndex].active)
            if( index === +setIndex ) {
                this.swade_super_power_sets[setIndex].active = !this.swade_super_power_sets[setIndex].active;
            } else {
                this.swade_super_power_sets[setIndex].active = false;
            }
            // console.log("togglePowerSetActive", index, this.swade_super_power_sets[setIndex].active)
        }
    }

    calcReset() {
        this._hasBeenApplied = false;
        this._hasPreCalcBeenApplied = false;
        this.addedArcaneBackground = false;
        for( let power of this.swade_super_powers) {
            power.calcReset();
        }
        for( let power_set of this.swade_super_power_sets) {
            for( let power of power_set.super_powers ) {
                power.calcReset();
            }
        }
        if( this.arcaneBackground ) {
            this.arcaneBackground.calcReset();
        }
    }

    public apply(
        charObj: PlayerCharacter | null = null,
        preCalc: boolean = false,
        forAdvance: boolean = false,
    ) {

        // console.log("edge.apply", this.name, this.effects)
        if( preCalc ) {
            if( this._hasPreCalcBeenApplied  ) {
                console.warn( this.name + " has already been applied (pre-calc), skipping");
                return;
            }

            this._hasPreCalcBeenApplied = true;
            // this._hasBeenApplied = true;
        } else {
            if( this._hasBeenApplied ) {
                console.warn( this.name + " has already been applied, skipping");
                return;
            }

            this._hasBeenApplied = true;
            // this._hasPreCalcBeenApplied = true;
        }

        // let applyImmediately = false;
        if(
            this.canToggle == true
                &&
            this.isActive == false
        ) {
            return;
        }

        if( this.noApply == true ) {
            return;
        }

        if(!charObj ) {
            charObj = this._char;
        }
        if(!charObj) {
            return
        }
        let effects: string[] = [];

        for( let power of this.swade_super_powers ) {
            power.apply( this._char, false);
        }

        for( let set of this.swade_super_power_sets ) {
            if( set.active ) {
                set.apply( this._char, false );
                // for( let power of this.swade_super_powers ) {
                //     power.apply( this._char, false );
                // }
            }
        }

        // console.log("this.effects", this.name, this.effects, this._char.name)
        for( let line of this.effects ) {
            if( line.toLowerCase().indexOf("[pick1:smarts-skill]") > -1)  {
                if( this.selectedSkill1 ) {
                    line = line.toLowerCase().replace("[pick1:smarts-skill]", this.selectedSkill1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[pick2:smarts-skill]") > -1)  {
                if( this.selectedSkill2 ) {
                    line = line.toLowerCase().replace("[pick2:smarts-skill]", this.selectedSkill2);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[pick1:skill") > -1)  {
                if( this.selectedSkill1 ) {
                    line = line.toLowerCase().replace(/\[(.+?)\]/g, this.selectedSkill1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[pick2:skill") > -1)  {
                if( this.selectedSkill2 ) {
                    line = line.toLowerCase().replace(/\[(.+?)\]/g, this.selectedSkill2);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[selected_attribute]") > -1)  {
                if( this.selectedAttribute ) {
                    line = line.toLowerCase().replace("[selected_attribute]", this.selectedAttribute);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[pick1:skill") > -1)  {
                if( this.selectedSkill1 ) {
                    line = line.toLowerCase().replace(/\[(.+?)\]/g, this.selectedSkill1);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[select_combat_edge]") > -1)  {
                if( this.selectedCombatEdge ) {
                    line = line.toLowerCase().replace("[select_combat_edge]", this.selectedCombatEdge);
                    effects.push(line);
                }
            }
            else if( line.toLowerCase().indexOf("[choose_edge") > -1)  {
                if( this.selectedEdge ) {
                    // line = line.toLowerCase().replace("[select_edge]", this.selectedEdge);
                    line = line.replace(/\[(.+?)\]/g, this.selectedEdge);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[select_edge") > -1)  {
                if( this.selectedEdge ) {
                    // line = line.toLowerCase().replace("[select_edge]", this.selectedEdge);
                    line = line.replace(/\[(.+?)\]/g, this.selectedEdge);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[selected_edge") > -1)  {
                if( this.selectedEdge ) {
                    // line = line.toLowerCase().replace("[selected_edge", this.selectedEdge);
                    line = line.replace(/\[(.+?)\]/g, this.selectedEdge);
                    effects.push(line);
                }
            }
            else if( line.toLowerCase().indexOf("[select_trait]") > -1)  {
                if( this.selectedTrait ) {
                    line = line.toLowerCase().replace("[select_trait]", this.selectedTrait);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[selected_trait]") > -1)  {
                if( this.selectedTrait ) {
                    line = line.toLowerCase().replace("[selected_trait]", this.selectedTrait);
                    effects.push(line);
                }
            } else if( line.toLowerCase().indexOf("[selected_hindrance]") > -1)  {
                if( this.specify ) {
                    line = line.toLowerCase().replace("[selected_hindrance]", this.specify);
                    effects.push(line);
                    // applyImmediately = true;
                }
            }
            else {

                if( this.needsSelectedHindranceOptions().length > 0 && this.specify ) {
                    let split = split_by_max_two(line, ":");
                    if( split.length > 1 ) {
                        if( split[1].indexOf("|") ) {
                            line = split[0] + ":" + this.specify;
                            // applyImmediately = true;
                        }
                    }
                }

                effects.push(line);
            }

        }

        let filteredLines: string[] = [];

        // console.log("effects",effects, preCalc)
        if( forAdvance ) {
            for( let line of effects ) {
                filteredLines.push( line )
            }
        } else {
            if( preCalc ) {

                for( let line of effects ) {
                    if(
                        this._isPrecalcLine( line )
                    )  {
                        filteredLines.push( line )
                    }
                }
            } else {
                for( let line of effects ) {
                    if(
                        !this._isPrecalcLine( line )
                    )  {
                        filteredLines.push( line )
                    }
                }
            }
        }

        // console.log("filteredLines", preCalc, this.name, filteredLines, effects)
        effects = filteredLines;

        let effectCount = 0;
        for( let effect of effects) {
            for( let effect_tag of ["table_roll", "roll_table"]) {
                if( effect.toLowerCase().startsWith( effect_tag + ":") ) {
                    // let table = this._char.getTableByName( )
                    // let tableIDs: number[] = [];
                    let tableCount = 0;
                    for( let item of effect.toLowerCase().replace(effect_tag + ":", "").trim().split("|"))  {
                        for( let table of charObj.getAvailableData().tables ) {
                            if(
                                table.name.toLowerCase().trim() == item.trim()
                                && (
                                    this.herosJourneyTableSelections.length > effectCount
                                    &&
                                    table.id == this.herosJourneyTableSelections[ effectCount ]
                                )
                            ) {
                                // tableIDs.push( table.id )
                                // console.log( "effects - table", table.name, table.lines );
                                // console.log( "effects - this.herosJourneyTableItemCompletions", this.herosJourneyTableItemCompletions);
                                // console.log( "effects - this.herosJourneyTableItemSelections",this.herosJourneyTableItemSelections);
                                // console.log( "effects - this.herosJourneyTableSelections", this.herosJourneyTableSelections );
                                // console.log( "effects - this.herosJourneyTableItemSubChoices", this.herosJourneyTableItemSubChoices );
                                // console.log( "effects - this.herosJourneyTableItemSpecifications", this.herosJourneyTableItemSpecifications );
                                let lineCount = 0;
                                for( let lineSelection of this.herosJourneyTableItemSelections) {
                                    if( table.lines.length > lineSelection ) {
                                        // console.log("lineSelection", lineSelection)
                                        // console.log("table.name", table.name)
                                        // console.log("table.id", table.id)
                                        // console.log("tableCount", tableCount);
                                        // console.log("item.trim()", item.trim());
                                        // console.log("table.lines[ lineSelection ].effects", table.lines[ lineSelection ].effects)
                                        // console.log("table.lines[ lineSelection ].name", table.lines[ lineSelection ].name)
                                        if(
                                            table.lines[ lineSelection ]
                                            && table.lines[ lineSelection ].effects
                                        ) {
                                            let tableEffectCount = 0;
                                            // if( )
                                            for( let tableEffect of table.lines[ lineSelection ].effects ) {
                                                // console.log("tableEffect1", tableEffect)
                                                if( this.herosJourneyTableItemSpecifications.length > lineCount && this.herosJourneyTableItemSpecifications[lineCount] ) {
                                                    tableEffect = replaceAll( tableEffect, "[selected_hindrance]", this.herosJourneyTableItemSpecifications[lineCount]);
                                                    tableEffect = replaceAll( tableEffect, "[select_hindrance]", this.herosJourneyTableItemSpecifications[lineCount]);
                                                    tableEffect = replaceAll( tableEffect, "[choose_hindrance]", this.herosJourneyTableItemSpecifications[lineCount]);
                                                    tableEffect = replaceAll( tableEffect, "[selected_edge]", this.herosJourneyTableItemSpecifications[lineCount]);
                                                    tableEffect = replaceAll( tableEffect, "[select_edge]", this.herosJourneyTableItemSpecifications[lineCount]);
                                                    tableEffect = replaceAll( tableEffect, "[choose_edge]", this.herosJourneyTableItemSpecifications[lineCount]);

                                                    if( tableEffect.indexOf("|") > -1 )  {
                                                        let effectSplit = split_by_max_two(tableEffect, ":");
                                                        tableEffect = effectSplit[0] + ":" + this.herosJourneyTableItemSpecifications[lineCount];
                                                    }
                                                }
                                                // console.log("tableEffect1", tableEffectCount, tableEffect)

                                                // console.log("this.herosJourneyTableItemSubChoices", this.herosJourneyTableItemSubChoices);
                                                // console.log("this.herosJourneyTableItemSpecifications", this.herosJourneyTableItemSpecifications);
                                                // if( this.herosJourneyTableItemSelections[effectCount] == tableEffectCount ) {
                                                    // console.log("X", this.herosJourneyTableItemSelections[0], lineCount, tableEffect)
                                                    effects.push( tableEffect );
                                                // }
                                                // lineCount++;
                                                // tableEffectCount++;
                                            }
                                        }

                                        // console.log("lineCount", selectCount)
                                        let selectCount = 0;
                                        if(
                                            table.lines[ lineSelection]
                                            && table.lines[ lineSelection].choices
                                            && table.lines[ lineSelection].choices.length > 0
                                            && table.lines[ lineSelection].choices.length > this.herosJourneyTableItemSubChoices[selectCount]
                                        ) {
                                            let tableEffectCount = 0;
                                            for( let tableEffect of table.lines[ lineSelection].choices[ this.herosJourneyTableItemSubChoices[0] ].effects ) {
                                                if( this.herosJourneyTableItemSpecifications.length > selectCount && this.herosJourneyTableItemSpecifications[selectCount] ) {
                                                    tableEffect = replaceAll( tableEffect, "[selected_hindrance]", this.herosJourneyTableItemSpecifications[selectCount]);
                                                    tableEffect = replaceAll( tableEffect, "[select_hindrance]", this.herosJourneyTableItemSpecifications[selectCount]);
                                                    tableEffect = replaceAll( tableEffect, "[choose_hindrance]", this.herosJourneyTableItemSpecifications[selectCount]);
                                                    tableEffect = replaceAll( tableEffect, "[selected_edge]", this.herosJourneyTableItemSpecifications[selectCount]);
                                                    tableEffect = replaceAll( tableEffect, "[select_edge]", this.herosJourneyTableItemSpecifications[selectCount]);
                                                    tableEffect = replaceAll( tableEffect, "[choose_edge]", this.herosJourneyTableItemSpecifications[selectCount]);

                                                    if( tableEffect.indexOf("|") > -1 )  {
                                                        let effectSplit = split_by_max_two(tableEffect, ":");
                                                        tableEffect = effectSplit[0] + ":" + this.herosJourneyTableItemSpecifications[selectCount];
                                                    }
                                                }
                                                // console.log("tableEffect2", tableEffect)
                                                // effects.push( tableEffect );
                                                if( this.herosJourneyTableItemSelections[effectCount] == tableEffectCount)
                                                    effects.push( tableEffect );

                                            }
                                            tableEffectCount++;
                                        }
                                    }
                                    lineCount++;
                                }

                            }
                        }
                        tableCount++;
                    }
                    // if( tableIDs.length > 0 )
                        // rv.push( tableIDs );
                }
            }
            effectCount++;
        }

        // add edge effects need to be applied immediately
        let applyImmediately = true;
        // console.log("effects", this.name, effects)

        ApplyCharacterEffects(
            effects,
            charObj,
            "Edge: " + this.name,
            null,
            null,
            this,
            applyImmediately
        );

        if( !preCalc ) {
            if( this.selectedPowerID1 && this.needsSelectedPower1) {
                // console.log("edge XX.5", this.selectedABIndex1, this.selectedPowerID1, this.name);
                // console.log("edge XX.6", this.selectedABIndex2, this.selectedPowerID2, this.name);
                // console.log("edge XX.6", this.selectedABIndex3, this.selectedPowerID3, this.name);
                if( this.selectedPowerID1 == "custom") {
                    if( this.selectedCustomPower1 ) {
                        if( ! isNumeric(this.selectedABIndex1) ) {
                            // add to edge ab UUID
                            for( let edge of charObj.getAllEdgeObjects() ) {
                                if( edge.arcaneBackground && edge.uuid == this.selectedABIndex1) {
                                    edge.arcaneBackground.addedCustomPowers.push(
                                        this.selectedCustomPower1
                                    )
                                }
                            }
                        } else {
                            if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex1 ) {
                                if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ] ) {
                                    //@ts-ignore
                                    charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ].addedCustomPowers.push(
                                        this.selectedCustomPower1
                                    )
                                }
                            }
                        }

                    }
                } else {

                    if( ! isNumeric(this.selectedABIndex1) ) {
                        // console.log("edge XX1", this.selectedABIndex1, this.name);
                        // add to edge ab UUID
                        for( let edge of charObj.getAllEdgeObjects() ) {
                            if( edge.uuid == this.selectedABIndex1) {

                                if( this.selectedPowerID1.indexOf("{") === 0) {

                                    let powerDef: IChargenPowers = JSON.parse( this.selectedPowerID1 );
                                    let newPower = new Power(
                                        powerDef,
                                        charObj,
                                        edge.arcaneBackground,

                                    );
                                    newPower.setting_item = true;
                                    if( edge.arcaneBackground ) {
                                        edge.arcaneBackground.addedPowers.push(
                                            newPower
                                        );
                                    } else {
                                        if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ] ) {
                                            //@ts-ignore
                                        charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ].addedPowers.push(
                                                newPower
                                            );
                                        }
                                    }
                                } else {
                                    for( let powerDef of charObj.getAvailableData().powers ) {
                                        if( powerDef.id == +this.selectedPowerID1 && this.needsSelectedPower1 ) {
                                            let newPower = new Power(
                                                powerDef,
                                                charObj,
                                                edge.arcaneBackground,

                                            );
                                            // newPower.customName = this.selectedCustomPowerName1;
                                            // newPower.trappings = this.selectedCustomPowerTrappings1;
                                            // newPower.customDescription = this.selectedCustomPowerSummary1.split("\n");

                                            // newPower.limitationAspect = this.selectedPowerLimitationAspect1;
                                            // newPower.limitationRange = this.selectedPowerLimitationRange1;

                                            // if( this.selectedPowerInnate1 )
                                            //     newPower.innatePower = true;

                                            newPower.importOptions( this.powerEdgeOptions1 );
                                            if( edge.arcaneBackground ) {
                                                edge.arcaneBackground.addedPowers.push(
                                                    newPower
                                                );
                                            } else {
                                                if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ] ) {
                                                    //@ts-ignore
                                                charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ].addedPowers.push(
                                                        newPower
                                                    );
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex1 && this.needsSelectedPower1 ) {
                            // console.log("edge XX2", this.selectedABIndex1, this.name);
                            if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ] ) {

                                if( this.selectedPowerID1.indexOf("{") === 0) {

                                    let powerDef: IChargenPowers = JSON.parse( this.selectedPowerID1 );
                                    let newPower = new Power(
                                        powerDef,
                                        charObj,
                                        charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ],

                                    );
                                    newPower.setting_item = true;

                                    //@ts-ignore
                                    charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ].addedPowers.push(
                                        newPower
                                    );
                                } else {
                                    for( let powerDef of charObj.getAvailableData().powers ) {
                                        if( powerDef.id == +this.selectedPowerID1 && this.needsSelectedPower1 ) {
                                            let newPower = new Power(
                                                powerDef,
                                                charObj,
                                                charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ],

                                            );
                                            // newPower.customName = this.selectedCustomPowerName1;
                                            // newPower.trappings = this.selectedCustomPowerTrappings1;
                                            // newPower.customDescription = this.selectedCustomPowerSummary1.split("\n");

                                            // newPower.limitationAspect = this.selectedPowerLimitationAspect1;
                                            // newPower.limitationRange = this.selectedPowerLimitationRange1;

                                            // if( this.selectedPowerInnate1 )
                                            //     newPower.innatePower = true;
                                            newPower.importOptions( this.powerEdgeOptions1 );

                                            //@ts-ignore
                                            charObj._selectedArcaneBackgrounds[+this.selectedABIndex1 ].addedPowers.push(
                                                newPower
                                            );
                                        }
                                    }
                                }

                            }

                        }
                    }
                }
            }

            if( this._char ) {

                if( this.hasZeroNewPowersModline() ) {
                    // this.needsSelectedPower1 = true;
                    // this.needsSelectedPower2 = false;
                    if( this._char._newPowersEdgeBonus > 0 ) {
                        this.needsSelectedPower1 = true;
                    }
                }

                // this.needsSelectedPower3 = false;
                if( this.hasSingleNewPowersModline() ) {
                    // this.needsSelectedPower1 = true;
                    // this.needsSelectedPower2 = false;
                    if( this._char._newPowersEdgeBonus > 0 ) {
                        this.needsSelectedPower2 = true;

                    }
                }

                if( this.hasNewPowersModline() ) {
                    // this.needsSelectedPower1 = true;
                    // this.needsSelectedPower2 = true;
                    if( this._char._newPowersEdgeBonus > 0 ) {
                        this.needsSelectedPower3 = true;
                    }
                }
            }

            if( this.selectedPowerID2 && this.needsSelectedPower2) {
                if( this.selectedPowerID2 == "custom") {
                    if( this.selectedCustomPower2 ) {
                        if( ! isNumeric(this.selectedABIndex2) ) {
                            // add to edge ab UUID
                            for( let edge of charObj.getAllEdgeObjects() ) {
                                if( edge.arcaneBackground && edge.uuid == this.selectedABIndex2) {
                                    edge.arcaneBackground.addedCustomPowers.push(
                                        this.selectedCustomPower2
                                    )
                                }
                            }
                        } else {
                            if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex2 ) {
                                if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex2 ] ) {
                                    //@ts-ignore
                                    charObj._selectedArcaneBackgrounds[+this.selectedABIndex2 ].addedCustomPowers.push(
                                        this.selectedCustomPower2
                                    )
                                }
                            }
                        }

                    }
                } else {

                    if( ! isNumeric(this.selectedABIndex2) ) {
                        // add to edge ab UUID
                        for( let edge of charObj.getAllEdgeObjects() ) {
                            if( edge.uuid == this.selectedABIndex2) {

                                if( this.selectedPowerID2.indexOf("{") === 0) {

                                    let powerDef: IChargenPowers = JSON.parse( this.selectedPowerID2 );
                                    let newPower = new Power(
                                        powerDef,
                                        charObj,
                                        edge.arcaneBackground,

                                    );
                                    newPower.setting_item = true;
                                    if( edge.arcaneBackground ) {
                                        edge.arcaneBackground.addedPowers.push(
                                            newPower
                                        );
                                    }
                                } else {
                                    for( let powerDef of charObj.getAvailableData().powers ) {
                                        if( powerDef.id == +this.selectedPowerID2 && this.needsSelectedPower2 ) {
                                            let newPower = new Power(
                                                powerDef,
                                                charObj,
                                                edge.arcaneBackground,

                                            );
                                            // newPower.customName = this.selectedCustomPowerName2;
                                            // newPower.trappings = this.selectedCustomPowerTrappings2;
                                            // newPower.customDescription = this.selectedCustomPowerSummary2.split("\n");

                                            // newPower.limitationAspect = this.selectedPowerLimitationAspect2;
                                            // newPower.limitationRange = this.selectedPowerLimitationRange2;

                                            // if( this.selectedPowerInnate2 )
                                            //     newPower.innatePower = true;
                                            newPower.importOptions( this.powerEdgeOptions2 );
                                            if( edge.arcaneBackground ) {
                                                edge.arcaneBackground.addedPowers.push(
                                                    newPower
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex2 && this.needsSelectedPower2 ) {
                            if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex2 ] ) {

                                if( this.selectedPowerID2.indexOf("{") === 0) {

                                    let powerDef: IChargenPowers = JSON.parse( this.selectedPowerID2 );
                                    let newPower = new Power(
                                        powerDef,
                                        charObj,
                                        charObj._selectedArcaneBackgrounds[+this.selectedABIndex2 ],

                                    );
                                    newPower.setting_item = true;
                                    //@ts-ignore
                                    charObj._selectedArcaneBackgrounds[+this.selectedABIndex2 ].addedPowers.push(
                                        newPower
                                    );
                                } else {
                                    for( let powerDef of charObj.getAvailableData().powers ) {
                                        if( powerDef.id == +this.selectedPowerID2 && this.needsSelectedPower2 ) {
                                            let newPower = new Power(
                                                powerDef,
                                                charObj,
                                                charObj._selectedArcaneBackgrounds[+this.selectedABIndex2 ],

                                            );
                                            // newPower.customName = this.selectedCustomPowerName2;
                                            // newPower.trappings = this.selectedCustomPowerTrappings2;
                                            // newPower.customDescription = this.selectedCustomPowerSummary2.split("\n");

                                            // newPower.limitationAspect = this.selectedPowerLimitationAspect2;
                                            // newPower.limitationRange = this.selectedPowerLimitationRange2;

                                            // if( this.selectedPowerInnate2 )
                                            //     newPower.innatePower = true;
                                            newPower.importOptions( this.powerEdgeOptions2 );

                                            //@ts-ignore
                                            charObj._selectedArcaneBackgrounds[+this.selectedABIndex2 ].addedPowers.push(
                                                newPower
                                            );
                                        }
                                    }
                                }

                            }

                        }
                    }
                }
            }

            if( this.selectedPowerID3 && this.needsSelectedPower3) {
                if( this.selectedPowerID3 == "custom") {
                    if( this.selectedCustomPower3 ) {
                        if( ! isNumeric(this.selectedABIndex3)  ) {
                            // add to edge ab UUID
                            for( let edge of charObj.getAllEdgeObjects() ) {
                                if( edge.arcaneBackground && edge.uuid == this.selectedABIndex3) {
                                    edge.arcaneBackground.addedCustomPowers.push(
                                        this.selectedCustomPower3
                                    )
                                }
                            }
                        } else {
                            if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex3 ) {
                                if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex3 ] ) {
                                    //@ts-ignore
                                    charObj._selectedArcaneBackgrounds[+this.selectedABIndex3 ].addedCustomPowers.push(
                                        this.selectedCustomPower3
                                    )
                                }
                            }
                        }

                    }
                } else {

                    if( ! isNumeric(this.selectedABIndex3) ) {
                        // add to edge ab UUID
                        for( let edge of charObj.getAllEdgeObjects() ) {
                            if( edge.uuid == this.selectedABIndex3) {

                                if( this.selectedPowerID3.indexOf("{") === 0) {

                                    let powerDef: IChargenPowers = JSON.parse( this.selectedPowerID3 );
                                    let newPower = new Power(
                                        powerDef,
                                        charObj,
                                        edge.arcaneBackground,

                                    );
                                    newPower.setting_item = true;
                                    if( edge.arcaneBackground ) {
                                        edge.arcaneBackground.addedPowers.push(
                                            newPower
                                        );
                                    }
                                } else {
                                    for( let powerDef of charObj.getAvailableData().powers ) {
                                        if( powerDef.id == +this.selectedPowerID3 && this.needsSelectedPower3 ) {
                                            let newPower = new Power(
                                                powerDef,
                                                charObj,
                                                edge.arcaneBackground,

                                            );
                                            // newPower.customName = this.selectedCustomPowerName3;
                                            // newPower.trappings = this.selectedCustomPowerTrappings3;
                                            // newPower.customDescription = this.selectedCustomPowerSummary3.split("\n");

                                            // newPower.limitationAspect = this.selectedPowerLimitationAspect3;
                                            // newPower.limitationRange = this.selectedPowerLimitationRange3;

                                            // if( this.selectedPowerInnate3 )
                                            //     newPower.innatePower = true;
                                            newPower.importOptions( this.powerEdgeOptions3 );
                                            if( edge.arcaneBackground ) {
                                                edge.arcaneBackground.addedPowers.push(
                                                    newPower
                                                );
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex3 && this.needsSelectedPower3 ) {
                            if( charObj._selectedArcaneBackgrounds[+this.selectedABIndex3 ] ) {

                                if( this.selectedPowerID3.indexOf("{") === 0) {

                                    let powerDef: IChargenPowers = JSON.parse( this.selectedPowerID3 );
                                    let newPower = new Power(
                                        powerDef,
                                        charObj,
                                        charObj._selectedArcaneBackgrounds[+this.selectedABIndex3 ],

                                    );
                                    newPower.setting_item = true;
                                    //@ts-ignore
                                    charObj._selectedArcaneBackgrounds[+this.selectedABIndex3 ].addedPowers.push(
                                        newPower
                                    );
                                } else {
                                    for( let powerDef of charObj.getAvailableData().powers ) {
                                        if( powerDef.id == +this.selectedPowerID3 && this.needsSelectedPower3 ) {
                                            let newPower = new Power(
                                                powerDef,
                                                charObj,
                                                charObj._selectedArcaneBackgrounds[+this.selectedABIndex3 ],

                                            );
                                            // newPower.customName = this.selectedCustomPowerName3;
                                            // newPower.trappings = this.selectedCustomPowerTrappings3;
                                            // newPower.customDescription = this.selectedCustomPowerSummary3.split("\n");

                                            // newPower.limitationAspect = this.selectedPowerLimitationAspect3;
                                            // newPower.limitationRange = this.selectedPowerLimitationRange3;

                                            // if( this.selectedPowerInnate3 )
                                            //     newPower.innatePower = true;
                                            newPower.importOptions( this.powerEdgeOptions3 );

                                            //@ts-ignore
                                            charObj._selectedArcaneBackgrounds[+this.selectedABIndex3 ].addedPowers.push(
                                                newPower
                                            );
                                        }
                                    }
                                }

                            }

                        }
                    }
                }
            }

        }   // !preCalc check

        if( this.arcaneBackground ) {
            // console.log("edge ab apply", this.name, this.arcaneBackground.effects )
            this.arcaneBackground.apply();

        }
    }

    private _isPrecalcLine( line: string ): boolean {

        let testLine = line.toLowerCase().trim();

        if(
            testLine.indexOf("new_powers_edge_bonus") == 0
                ||
            testLine.indexOf("natural_attack:") === 0
                ||
            testLine.indexOf("power_points") > -1
                ||
            testLine.indexOf("naturalattack:") === 0
                ||
            testLine.indexOf("naturalweapon:") === 0
                ||
            testLine.indexOf("naturalweapons:") === 0
                ||
            testLine.indexOf("natural_weapons:") === 0
            ||
            testLine.indexOf("arcane_background:") === 0
            ||
            testLine.indexOf("arcanebackground:") === 0
            ||
            testLine.indexOf("starting_funds_multiplier") === 0

        ) {
            return true;
        }

        return false;
    }

    public getSpecialAbilityList(charObj: PlayerCharacter): ISpecialAbilityItem[] {
        let rv: ISpecialAbilityItem[] = [];

        if( this.selectAbilityItem && this.selectedAbilityItems.length > 0 ) {
                for( let ability of this.selectedAbilityItems ) {
                let abilitySplit = this.selectAbilityItem.split(":", 2)

                if( abilitySplit.length > 0 ) {
                    if( abilitySplit[0] )
                        rv.push( {
                            name: abilitySplit[0],
                            summary: abilitySplit[1],
                            specify: "",
                            specifyValue: "",
                            specifyLimit: [],
                            alternate_options: [],
                            selectItems: [],
                            from: "Edge",
                            positive: true,
                            book_name: this.getBookShortName(),
                            page: this.book_page,
                            book_id: this.book_id,
                            custom: this.book_id > 0 ? true : false,
                        } );
                } else {
                    rv.push( {
                        name: this.name,
                        summary: abilitySplit[0],
                        specify: "",
                        specifyValue: "",
                        specifyLimit: [],
                        alternate_options: [],
                        selectItems: [],
                        from: "Edge",
                        positive: true,
                        book_name: this.getBookShortName(),
                        page: this.book_page,
                        book_id: this.book_id,
                        custom: this.book_id > 0 ? true : false,
                    } );
                }
            }
        }

        return rv;
    }

    public isValid(
        charObj: PlayerCharacter | null = null,
        debug: boolean = false,
    ): IValidationMessage {
        if( !charObj ) {
            charObj = this._char;
        }

        let rv: IValidationMessage = {
            severity: ValidityLevel.Default,
            message: "",
            goURL: "/character/creator/edges",
        }
        if(!charObj)
            return rv;

        // Check for selected skills, etc
        let canBeTaken = this.isAvailable( charObj, undefined, undefined, debug );

        if( !canBeTaken.canBeTaken ) {
            rv.severity = ValidityLevel.Error,
            rv.message = canBeTaken.messages.join("; ");
        }

        // Check if selected Power(s) are valid.
        if( this.needsSelectedPower1 && this.selectedABIndex1 && this.selectedPowerID1 ) {
            if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex1 ) {
                let ab = charObj._selectedArcaneBackgrounds[+this.selectedABIndex1]
                if( ab ) {
                    for( let power of ab.addedPowers ) {

                        if(
                            power.id == +this.selectedPowerID1
                        ) {
                            if( power.LEGACY_isAvailable(
                                    +this.selectedABIndex1,
                                    this.addedFrom.toLowerCase().trim() == "advance" ? false : true,
                                    charObj,
                                ) == false
                            ) {
                                let powerReason = power.LEGACY_isNotAvailableReason(
                                    +this.selectedABIndex1,
                                    this.addedFrom.toLowerCase().trim() == "advance" ? false : true
                                );
                                rv.severity = ValidityLevel.Error;
                                if( rv.message.trim() ) {
                                    rv.message += "; "
                                }
                                rv.message += "The power '" + power.name + "' " + powerReason;
                                rv.goURL = this.addedFrom.toLowerCase().trim() == "advance" ? "/character/creator/advances" : "/character/creator/edges";
                            }
                        }
                    }
                }
            }
        }

        if( this.needsSelectedPower2 && this.selectedABIndex2 && this.selectedPowerID2 ) {
            if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex2 ) {
                let ab = charObj._selectedArcaneBackgrounds[+this.selectedABIndex2]
                if( ab ) {
                    for( let power of ab.addedPowers ) {

                        if(
                            power.id == +this.selectedPowerID2
                        ) {
                            if( power.LEGACY_isAvailable(
                                    +this.selectedABIndex2,
                                    this.addedFrom.toLowerCase().trim() == "advance" ? false : true,
                                    charObj,
                                ) == false
                            ) {
                                let powerReason = power.LEGACY_isNotAvailableReason(
                                    +this.selectedABIndex2,
                                    this.addedFrom.toLowerCase().trim() == "advance" ? false : true
                                );
                                rv.severity = ValidityLevel.Error;
                                if( rv.message.trim() ) {
                                    rv.message += "; "
                                }
                                rv.message += "The power '" + power.name + "' " + powerReason;
                                rv.goURL = this.addedFrom.toLowerCase().trim() == "advance" ? "/character/creator/advances" : "/character/creator/edges";
                            }
                        }
                    }
                }
            }
        }

        if( this.needsSelectedPower3 && this.selectedABIndex3 && this.selectedPowerID3 ) {
            if( charObj && charObj._selectedArcaneBackgrounds && charObj._selectedArcaneBackgrounds.length > +this.selectedABIndex3 ) {
                let ab = charObj._selectedArcaneBackgrounds[+this.selectedABIndex3]
                if( ab ) {
                    for( let power of ab.addedPowers ) {

                        if(
                            power.id == +this.selectedPowerID3
                        ) {
                            if( power.LEGACY_isAvailable(
                                    +this.selectedABIndex3,
                                    this.addedFrom.toLowerCase().trim() == "advance" ? false : true,
                                    charObj,
                                ) == false
                            ) {
                                let powerReason = power.LEGACY_isNotAvailableReason(
                                    +this.selectedABIndex3,
                                    this.addedFrom.toLowerCase().trim() == "advance" ? false : true
                                );
                                rv.severity = ValidityLevel.Error;
                                if( rv.message.trim() ) {
                                    rv.message += "; "
                                }
                                rv.message += "The power '" + power.name + "' " + powerReason;
                                rv.goURL = this.addedFrom.toLowerCase().trim() == "advance" ? "/character/creator/advances" : "/character/creator/edges";
                            }
                        }
                    }
                }
            }
        }

        return rv;
    }

    public exportHTML(hideImage: boolean = false): string {

        let exportHTML = "";

        if( this.name ) {
            exportHTML += "<h1>" + this.name + "</h1>\n";
        }

        if( this.requirements.length > 0 ) {
            exportHTML += "<p><strong>Requirements</strong>: " + this.requirements.join(", ") + "</p>\n";
        }

        if( this.summary ) {
            exportHTML += "<p><strong>Summary:</strong> " + this.summary + "</p>\n";
        }

        if( this.description.length > 0 ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>\n";
        }

        return exportHTML;
    }

    public needsSelectedAttribute(): boolean {
        for( let effect of this.effects ) {
            if( effect.toLowerCase().indexOf("[selected_attribute") > -1 ) {
                return true;
            }
        }
        return false;
    }

    public needsSelectedHindrance(): boolean {
        for( let effect of this.effects ) {
            if( effect.toLowerCase().indexOf("[selected_hindrance") > -1 ) {
                return true;
            }
            if(
                effect.toLowerCase().indexOf("add_hindrance:") > -1
                    &&
                effect.toLowerCase().indexOf("|") > -1
            ) {
                return true;
            }
        }
        return false;
    }

    needsSelectedHindranceOptions(): string[] {
        for( let effect of this.effects ) {

            if(
                effect.toLowerCase().indexOf("add_hindrance:") > -1
                    &&
                effect.toLowerCase().indexOf("|") > -1
            ) {
                let split  = split_by_max_two( effect, ":");
                if( split.length > 1 ) {
                    if( split[1].indexOf("|") > -1 ) {
                        return split[1].split("|")
                    }
                }
            }
        }

        return [];
    }

    public needsSelectedTrait(): boolean {
        for( let effect of this.effects ) {
            if( effect.toLowerCase().indexOf("[selected_trait") > -1 ) {
                return true;
            }
            if( effect.toLowerCase().indexOf("[select_trait") > -1 ) {
                return true;
            }
        }
        return false;
    }

    public newPowerSet(): SuperPowerSet2021 {
        let obj = new SuperPowerSet2021(
            this._char,
            null,
        );

        return obj;
    }

    public getSummary(): string {
        return this.summary;
    }

    public getHeroicTableList(): number[][] {

        let rv: number[][] = [];

        if(!this._char)
            return [];

        for( let effect of this.effects ) {
            for( let effect_tag of ["table_roll", "roll_table"]) {
                if( effect.toLowerCase().startsWith( effect_tag + ":") ) {
                    // let table = this._char.getTableByName( )
                    let tableIDs: number[] = [];
                    for( let item of effect.toLowerCase().replace(effect_tag + ":", "").trim().split("|"))  {

                        for( let table of this._char.getAvailableData().tables ) {
                            if( table.name.toLowerCase().trim() == item.trim() ) {
                                tableIDs.push( table.id )
                            }
                        }
                    }
                    if( tableIDs.length > 0 )
                        rv.push( tableIDs );
                }
            }
        }

        return rv;
    }

    hasOptions(): boolean {
        if( this.provides_swade_super_powers )
            return true;
        if( this.arcaneBackground )
            return true;

        if( this._char && this._char.getPromptSpecifications(this.effects).length > 0 )
            return true;

        if( this.needsASelectedEdge() )
            return true;

        if( this.needsSelectedArcaneBackground() )
            return true;

        if( this.needsSelectedAttribute() )
            return true;

        if( this.needsSelectedHindrance() )
            return true;

        if( this.needsSelectedHindranceOptions().length > 0 )
            return true;

        if( this.needsSelectedPower1 )
            return true;

        if( this.needsSelectedPower2 )
            return true;

        if( this.needsSelectedPower3 )
            return true;

        if( this.needsToSpecify )
            return true;
        if( this.needsSelectedSkill1 )
            return true;
        if( this.needsSelectedSkill2 )
            return true;
        if( this.needsSelectedSmartsSkill1 )
            return true;
        if( this.needsSelectedSmartsSkill2 )
            return true;
        if( this.needsSelectedTrait() )
            return true;

        if( this.needsSelectedWeapon )
            return true;

        if( this.needsASelectedEdge() )
            return true;

        return false;
    }

    importOptions(jsonImportObj: IChargenEdgeObjectVars | null) {
        super.importOptions( jsonImportObj );

        if(!this._char)
            return;
        if( jsonImportObj ) {
            this.isActive = false;

            // this.needsSelectedWeapon = false;
            // if( jsonImportObj.needs_selected_weapon ) {
            //     this.needsSelectedWeapon = true;
            // }

            this.swade_super_powers = [];
            if( jsonImportObj.swade_super_powers && jsonImportObj.swade_super_powers.length > 0 ) {
                for( let def of jsonImportObj.swade_super_powers ) {
                    if( def.id > 0 ) {
                        for( let def2021 of this._char._availableData.super_powers_2021 ) {
                            if( def2021.id == def.id ) {
                                let spcObj = new SuperPower2021( def2021, this._char);
                                spcObj.importOptions( def.options );
                                this.swade_super_powers.push(
                                    spcObj
                                );
                                break;
                            }
                        }
                    } else {
                        let spcObj = new SuperPower2021( def.def, this._char);
                        spcObj.importOptions( def.options );
                        this.swade_super_powers.push(
                            spcObj
                        );
                    }
                }
            }

            this.swade_super_power_sets = [];
            if( jsonImportObj.super_power_sets && jsonImportObj.super_power_sets.length > 0 ) {
                for( let def of jsonImportObj.super_power_sets ) {
                    this.swade_super_power_sets.push(
                        new SuperPowerSet2021(
                            this._char,
                            def
                        )
                    )
                }
            }

            this.isActive = false;
            if( jsonImportObj.is_active ) {
                this.isActive = true;
            }

            if( jsonImportObj.specify ) {
                this.specify = jsonImportObj.specify;
            }

            // Scholar edge / select skills
            this.selectedSkill1 = "";
            if(typeof( jsonImportObj.selected_skill_1) !== 'undefined'){
                this.selectedSkill1 = jsonImportObj.selected_skill_1;
            }

            this.selectedSkill2 = "";
            if(typeof( jsonImportObj.selected_skill_2) !== 'undefined'){
                this.selectedSkill2 = jsonImportObj.selected_skill_2;
            }

            if(typeof( jsonImportObj.show_options) !== 'undefined'){
                this.showOptions = jsonImportObj.show_options;
            }

            // for New Power(s) Edges
            this.selectedPowerID1 = "0";
            if(typeof( jsonImportObj.selected_power_id_1) !== 'undefined'){
                this.selectedPowerID1 = jsonImportObj.selected_power_id_1 ? jsonImportObj.selected_power_id_1 : "";
            }
            this.selectedPowerID2 = "0";
            if(typeof( jsonImportObj.selected_power_id_2) !== 'undefined'){
                this.selectedPowerID2 = jsonImportObj.selected_power_id_2 ? jsonImportObj.selected_power_id_2 : "";
            }
            this.selectedPowerID3 = "0";
            if(typeof( jsonImportObj.selected_power_id_3) !== 'undefined'){
                this.selectedPowerID3 = jsonImportObj.selected_power_id_3 ? jsonImportObj.selected_power_id_3 : "";
            }

            this.selectAbilityItem = "";
            if(typeof( jsonImportObj.selected_ability_item) !== 'undefined'){
                this.selectAbilityItem = jsonImportObj.selected_ability_item;
            }

            this.selectedTrait = "";
            if(typeof( jsonImportObj.selected_trait) !== 'undefined'){
                this.selectedTrait = jsonImportObj.selected_trait;
            }

            this.selectedCustomPower1 = null;
            if(typeof( jsonImportObj.selected_power_custom_1) !== 'undefined'){
                this.selectedCustomPower1 = jsonImportObj.selected_power_custom_1;
            }
            this.selectedCustomPower2 = null;
            if(typeof( jsonImportObj.selected_power_custom_2) !== 'undefined'){
                this.selectedCustomPower2 = jsonImportObj.selected_power_custom_2;
            }
            this.selectedCustomPower3 = null;
            if(typeof( jsonImportObj.selected_power_custom_3) !== 'undefined'){
                this.selectedCustomPower3 = jsonImportObj.selected_power_custom_3;
            }
            this.selectedABIndex1 = 0;
            if(typeof( jsonImportObj.selected_power_ab_1) !== 'undefined' && jsonImportObj.selected_power_ab_1){
                this.selectedABIndex1 = jsonImportObj.selected_power_ab_1;
            }
            this.selectedABIndex2 = 0;
            if(typeof( jsonImportObj.selected_power_ab_2) !== 'undefined' && jsonImportObj.selected_power_ab_2){
                this.selectedABIndex2 = jsonImportObj.selected_power_ab_2;
            }

            this.selectedABIndex3 = 0;
            if(typeof( jsonImportObj.selected_power_ab_3) !== 'undefined' && jsonImportObj.selected_power_ab_3){
                this.selectedABIndex3 = jsonImportObj.selected_power_ab_3;
            }

            // this.selectedPowerInnate1 = false;
            // if( jsonImportObj.selected_power_innate1) {
            //     this.selectedPowerInnate1 = true;
            // }
            // this.selectedPowerInnate2 = false;
            // if( jsonImportObj.selected_power_innate2) {
            //     this.selectedPowerInnate2 = true;
            // }
            // this.selectedPowerInnate3 = false;
            // if( jsonImportObj.selected_power_innate3) {
            //     this.selectedPowerInnate3 = true;
            // }

            this.selectedAttribute = "";
            if(typeof( jsonImportObj.selected_attribute) !== 'undefined' && jsonImportObj.selected_attribute){
                this.selectedAttribute = jsonImportObj.selected_attribute;
            }

            // this.selectedPowerLimitationRange1 = "";
            // if(typeof( jsonImportObj.selected_power_limitation_range_1) !== 'undefined'){
            //     this.selectedPowerLimitationRange1 = jsonImportObj.selected_power_limitation_range_1;
            // }
            // this.selectedPowerLimitationRange2 = "";
            // if(typeof( jsonImportObj.selected_power_limitation_range_2) !== 'undefined'){
            //     this.selectedPowerLimitationRange2 = jsonImportObj.selected_power_limitation_range_2;
            // }
            // this.selectedPowerLimitationRange3 = "";
            // if(typeof( jsonImportObj.selected_power_limitation_range_3) !== 'undefined'){
            //     this.selectedPowerLimitationRange3 = jsonImportObj.selected_power_limitation_range_3;
            // }
            // this.selectedPowerLimitationAspect1 = "";
            // if(typeof( jsonImportObj.selected_power_limitation_aspect_1) !== 'undefined'){
            //     this.selectedPowerLimitationAspect1 = jsonImportObj.selected_power_limitation_aspect_1;
            // }
            // this.selectedPowerLimitationAspect3 = "";
            // if(typeof( jsonImportObj.selected_power_limitation_aspect_3) !== 'undefined'){
            //     this.selectedPowerLimitationAspect3 = jsonImportObj.selected_power_limitation_aspect_3;
            // }
            // this.selectedPowerLimitationAspect2 = "";
            // if(typeof( jsonImportObj.selected_power_limitation_aspect_2) !== 'undefined'){
            //     this.selectedPowerLimitationAspect2 = jsonImportObj.selected_power_limitation_aspect_2;
            // }

            // this.selectedCustomPowerName1 = "";
            // if(typeof( jsonImportObj.selected_power_name_1) !== 'undefined'){
            //     this.selectedCustomPowerName1 = jsonImportObj.selected_power_name_1;
            // }
            // this.selectedCustomPowerName2 = "";
            // if(typeof( jsonImportObj.selected_power_name_2) !== 'undefined'){
            //     this.selectedCustomPowerName2 = jsonImportObj.selected_power_name_2;
            // }
            // this.selectedCustomPowerName3 = "";
            // if(typeof( jsonImportObj.selected_power_name_3) !== 'undefined'){
            //     this.selectedCustomPowerName3 = jsonImportObj.selected_power_name_3;
            // }

            // this.selectedCustomPowerTrappings1 = "";
            // if(typeof( jsonImportObj.selected_power_trappings_1) !== 'undefined'){
            //     this.selectedCustomPowerTrappings1 = jsonImportObj.selected_power_trappings_1;
            // }
            // this.selectedCustomPowerTrappings2 = "";
            // if(typeof( jsonImportObj.selected_power_trappings_2) !== 'undefined'){
            //     this.selectedCustomPowerTrappings2 = jsonImportObj.selected_power_trappings_2;
            // }
            // this.selectedCustomPowerTrappings3 = "";
            // if(typeof( jsonImportObj.selected_power_trappings_3) !== 'undefined'){
            //     this.selectedCustomPowerTrappings3 = jsonImportObj.selected_power_trappings_3;
            // }

            // console.log("edge io jsonImportObj.powerEdgeOptions1", jsonImportObj.powerEdgeOptions1)
            if( jsonImportObj.powerEdgeOptions1 ) {
                this.powerEdgeOptions1 = jsonImportObj.powerEdgeOptions1;
            } else {
                this.powerEdgeOptions1 = {
                    customName: "",
                    customDescription: "",
                    limitationRange: "",
                    limitationAspect: "",
                    limitationPersonal: "",
                    innatePower: false,
                    trappings: "",
                    neg2SkillPenalty: false,
                    effectSpecify: "",
                    abID: -1,
                    setting_item: false,
                    uuid: "",
                }

                if( jsonImportObj.selected_power_innate1) {
                    this.powerEdgeOptions1.innatePower = true;
                }

                if(typeof( jsonImportObj.selected_power_limitation_range_1) !== 'undefined'){
                    this.powerEdgeOptions1.limitationRange = jsonImportObj.selected_power_limitation_range_1;
                }

                if(typeof( jsonImportObj.selected_power_limitation_aspect_1) !== 'undefined'){
                    this.powerEdgeOptions1.limitationRange = jsonImportObj.selected_power_limitation_aspect_1;
                }

                if(typeof( jsonImportObj.selected_power_name_1) !== 'undefined'){
                    this.powerEdgeOptions1.customName = jsonImportObj.selected_power_name_1;
                }

                if(typeof( jsonImportObj.selected_power_name_1) !== 'undefined' && jsonImportObj.selected_power_name_1){
                    this.powerEdgeOptions1.trappings = jsonImportObj.selected_power_trappings_1 ? jsonImportObj.selected_power_trappings_1 : "" ;
                }

                if(typeof( jsonImportObj.selected_power_summary_1) !== 'undefined' && jsonImportObj.selected_power_summary_1){
                    this.powerEdgeOptions1.customDescription = jsonImportObj.selected_power_summary_1.split("\n");
                }
            }

            if( jsonImportObj.powerEdgeOptions2 ) {
                this.powerEdgeOptions2 = jsonImportObj.powerEdgeOptions2;
            } else {
                this.powerEdgeOptions2 = {
                    customName: "",
                    customDescription: "",
                    limitationRange: "",
                    limitationAspect: "",
                    limitationPersonal: "",
                    innatePower: false,
                    trappings: "",
                    effectSpecify: "",
                    neg2SkillPenalty: false,
                    setting_item: false,
                    abID: -2,
                    uuid: "",
                }

                if( jsonImportObj.selected_power_innate2) {
                    this.powerEdgeOptions2.innatePower = true;
                }

                if(typeof( jsonImportObj.selected_power_limitation_range_2) !== 'undefined'){
                    this.powerEdgeOptions2.limitationRange = jsonImportObj.selected_power_limitation_range_2;
                }

                if(typeof( jsonImportObj.selected_power_limitation_aspect_2) !== 'undefined'){
                    this.powerEdgeOptions2.limitationRange = jsonImportObj.selected_power_limitation_aspect_2;
                }

                if(typeof( jsonImportObj.selected_power_name_2) !== 'undefined'){
                    this.powerEdgeOptions2.customName = jsonImportObj.selected_power_name_2;
                }

                if(typeof( jsonImportObj.selected_power_name_2) !== 'undefined' && jsonImportObj.selected_power_name_2){
                    this.powerEdgeOptions2.trappings = jsonImportObj.selected_power_trappings_2 ? jsonImportObj.selected_power_trappings_2 : "";
                }

                if(typeof( jsonImportObj.selected_power_summary_2) !== 'undefined' && jsonImportObj.selected_power_summary_2){
                    this.powerEdgeOptions2.customDescription = jsonImportObj.selected_power_summary_2;
                }
            }

            if( jsonImportObj.powerEdgeOptions3 ) {
                this.powerEdgeOptions3 = jsonImportObj.powerEdgeOptions3;
            } else {
                this.powerEdgeOptions3 = {
                    customName: "",
                    customDescription: "",
                    limitationRange: "",
                    limitationPersonal: "",
                    limitationAspect: "",
                    innatePower: false,
                    trappings: "",
                    neg2SkillPenalty: false,
                    effectSpecify: "",
                    setting_item: false,
                    abID: -1,
                    uuid: "",
                }

                if( jsonImportObj.selected_power_innate3) {
                    this.powerEdgeOptions3.innatePower = true;
                }

                if(typeof( jsonImportObj.selected_power_limitation_range_3) !== 'undefined'){
                    this.powerEdgeOptions3.limitationRange = jsonImportObj.selected_power_limitation_range_3;
                }

                if(typeof( jsonImportObj.selected_power_limitation_aspect_3) !== 'undefined'){
                    this.powerEdgeOptions3.limitationRange = jsonImportObj.selected_power_limitation_aspect_3;
                }

                if(typeof( jsonImportObj.selected_power_name_3) !== 'undefined'){
                    this.powerEdgeOptions3.customName = jsonImportObj.selected_power_name_3;
                }

                if(typeof( jsonImportObj.selected_power_name_3) !== 'undefined' && jsonImportObj.selected_power_name_3){
                    this.powerEdgeOptions3.trappings = jsonImportObj.selected_power_trappings_3 ? jsonImportObj.selected_power_trappings_3 : "";
                }

                if(typeof( jsonImportObj.selected_power_summary_3) !== 'undefined' && jsonImportObj.selected_power_summary_3){
                    this.powerEdgeOptions3.customDescription = jsonImportObj.selected_power_summary_3.split("\n");
                }
            }

            this.selectedCombatEdge = "";
            if(jsonImportObj.selected_combat_edge){
                this.selectedCombatEdge = jsonImportObj.selected_combat_edge;
            }

            this.selectedEdge = "";
            if(jsonImportObj.selected_edge){
                this.selectedEdge = jsonImportObj.selected_edge;
            }

            // this.selectedCustomPowerSummary1 = "";
            // if(typeof( jsonImportObj.selected_power_summary_1) !== 'undefined'){
            //     this.selectedCustomPowerSummary1 = jsonImportObj.selected_power_summary_1;
            // }
            // this.selectedCustomPowerSummary2 = "";
            // if(typeof( jsonImportObj.selected_power_summary_2) !== 'undefined'){
            //     this.selectedCustomPowerSummary2 = jsonImportObj.selected_power_summary_2;
            // }
            // this.selectedCustomPowerSummary3 = "";
            // if(typeof( jsonImportObj.selected_power_summary_3) !== 'undefined'){
            //     this.selectedCustomPowerSummary3 = jsonImportObj.selected_power_summary_3;
            // }

            this.selectedSkill1 = "";
            if(typeof( jsonImportObj.selected_skill_1) !== 'undefined'){
                this.selectedSkill1 = jsonImportObj.selected_skill_1;
            }
            this.selectedSkill2 = "";
            if(typeof( jsonImportObj.selected_skill_2) !== 'undefined'){
                this.selectedSkill2 = jsonImportObj.selected_skill_2;
            }

            this.herosJourneyTableItemCompletions = []
            if(typeof( jsonImportObj.heros_journey_table_item_completions) !== 'undefined'){
                this.herosJourneyTableItemCompletions = jsonImportObj.heros_journey_table_item_completions;
            }

            this.herosJourneyTableItemSelections = []
            if(typeof( jsonImportObj.heros_journey_table_selections) !== 'undefined'){
                this.herosJourneyTableItemSelections = jsonImportObj.heros_journey_table_selections;
            }
            this.herosJourneyTableSelections = []
            if(typeof( jsonImportObj.heros_journey_table_item_selections) !== 'undefined'){
                this.herosJourneyTableSelections = jsonImportObj.heros_journey_table_item_selections;
            }
            this.herosJourneyTableItemSubChoices = []
            if(typeof( jsonImportObj.heros_journey_table_item_sub_choices) !== 'undefined'){
                this.herosJourneyTableItemSubChoices = jsonImportObj.heros_journey_table_item_sub_choices;
            }
            this.herosJourneyTableItemSpecifications = []
            if(typeof( jsonImportObj.heros_journey_table_item_completions) !== 'undefined'){
                this.herosJourneyTableItemSpecifications = jsonImportObj.heros_journey_table_item_specifications;
            }

            if( this.isArcaneBackground && this.arcaneBackground && jsonImportObj.arcane_background_options ) {
                this.arcaneBackground.importOptions( jsonImportObj.arcane_background_options )

            }

        }

        for( let line of this.effects ) {
            if( line.toLowerCase().indexOf("[pick1:smarts-skill]") > 0)  {
                this.needsSelectedSmartsSkill1 = true;
            }
            if( line.toLowerCase().indexOf("[pick2:smarts-skill]") > 0)  {
                this.needsSelectedSmartsSkill2 = true;
            }
            if( line.toLowerCase().indexOf("[pick1:skill") > 0)  {
                this.needsSelectedSkill1 = true;
                if( line.toLowerCase().indexOf("[pick1:skill;") > 0 ) {
                    let split = line.toLowerCase().split("[pick1:skill;", 2);
                    let item = split[1];
                    if( item.indexOf("]") > 0 )
                        item = item.substring( 0, item.indexOf("]") );
                    this.needsSelectedSkill1Filter = item.split("|");
                }
            }
            if( line.toLowerCase().indexOf("[pick2:skill") > 0)  {
                this.needsSelectedSkill2 = true;
                if( line.toLowerCase().indexOf("[pick2:skill;") > 0 ) {
                    let split = line.toLowerCase().split("[pick2:skill;", 2);
                    let item = split[1];
                    if( item.indexOf("]") > 0 )
                        item = item.substring( 0, item.indexOf("]") );
                    this.needsSelectedSkill2Filter = item.split("|");
                }
            }

            if( line.toLowerCase().indexOf("[select_combat_edge]") > 0)  {
                this.needsSelectedCombatEdge = true;
            }

            this.selectedEdgeLimitGroup = [];
            if( line.toLowerCase().indexOf("[select_edge") > 0)  {
                this.needsSelectedEdge = true;
                if( line.indexOf(";") > -1 ) {
                    let split = line.split(";");
                    if( split.length > 1) {
                        let workingGroups = split[1].replace("]", "");
                        this.selectedEdgeLimitGroup = workingGroups.split("|");
                    }
                }
            }
            if( line.toLowerCase().indexOf("[choose_edge") > 0)  {
                this.needsSelectedEdge = true;
                if( line.indexOf(";") > -1 ) {
                    let split = line.split(";");
                    if( split.length > 1) {
                        let workingGroups = split[1].replace("]", "");
                        this.selectedEdgeLimitGroup = workingGroups.split("|");
                    }
                }
            }
            if( line.toLowerCase().indexOf("[selected_edge") > 0)  {
                this.needsSelectedEdge = true;
                if( line.indexOf(";") > -1 ) {
                    let split = line.split(";");
                    if( split.length > 1) {
                        let workingGroups = split[1].replace("]", "");
                        this.selectedEdgeLimitGroup = workingGroups.split("|");
                    }
                }
            }

            if( line.startsWith("choose_item:")) {
                let specifyListText = line.substring(line.indexOf("[") + 1);

                if( specifyListText.indexOf("]") > 1) {
                    specifyListText = specifyListText.substring(0, specifyListText.indexOf("]") - 1);
                }

                this.selectedAbilityItems = specifyListText.split(";");
            }

        }

        if( this._char ) {

            this.needsSelectedPower3 = false;
            if( this.hasSingleNewPowersModline() ) {
                this.needsSelectedPower1 = true;
                this.needsSelectedPower2 = false;
                if( this._char._newPowersEdgeBonus > 0 ) {
                    this.needsSelectedPower2 = true;

                }
            }

            if( this.hasNewPowersModline() ) {
                this.needsSelectedPower1 = true;
                this.needsSelectedPower2 = true;
                if( this._char._newPowersEdgeBonus > 0 ) {
                    this.needsSelectedPower3 = true;
                }
            }
        }

    }

    needsASelectedEdge(): boolean {
        for( let line of this.effects ) {
            this.selectedEdgeLimitGroup = [];
            if(
                line.toLowerCase().indexOf("[select_edge") > -1
                    ||
                line.toLowerCase().indexOf("[selected_edge") > -1
                    ||
                line.toLowerCase().indexOf("[choose_edge") > -1
            ) {
                if( line.indexOf(";") > -1 ) {
                    let split = line.split(";");
                    if( split.length > 1) {
                        let workingGroups = split[1].replace("]", "");
                        this.selectedEdgeLimitGroup = workingGroups.split("|");
                    }
                }
                return true;
            }
        }
        return false;
    }

    getDescriptionHTML(): string {
        let rv: string = convertMarkdownToHTML( this.description.trim() );

        if( this.description.trim() == "" ) {
            rv = convertMarkdownToHTML( this.summary.trim() );
        }
        rv = replaceAll(rv, "\n", " ");

        // if( this.description.length == 0 || (this.description.length > 1 && this.description[0].trim() == "")) {
        //     rv = "<p>" + this.summary + "</p>"
        // }

        rv += "<p><cite>" + this.getLongBookPage() + "</cite></p>";

        return rv;
    }

    addSelectedPower(
        findPower: IChargenPowers
    ): boolean {
        if(!this._char)
            return false;
        if( this.arcaneBackground ) {

            if( !findPower.id ) {
                if( findPower.setting_item ) {
                    for(let custPower of this._char.setting.customPowers ) {
                        if( custPower.name == findPower.name ) {
                            let addPower = new Power( custPower, this._char, this.arcaneBackground );
                            addPower.setting_item = true;
                            this.arcaneBackground.selectedPowers.push(
                                addPower
                            );
                            return true;
                        }
                    }
                } else {
                    let addPower = new Power( findPower, this._char, this.arcaneBackground );
                    addPower.is_custom = true;
                    this.arcaneBackground.selectedPowers.push(
                        addPower
                    );
                    return true;
                }

            } else {
                for( let powerDef of this._char.getAvailableData().powers ) {
                    if( powerDef.id == findPower.id) {
                        let addPower = new Power( powerDef, this._char, this.arcaneBackground,  );
                        this.arcaneBackground.selectedPowers.push(
                            addPower
                        );
                        return true;
                    }
                }
            }
        }

        return false;
    }

    isPathfinderClassEdge(): boolean {
        if( this.book_obj.name.toLowerCase().indexOf("pathfinder") > -1 ) {
            if( this.group.toLowerCase().trim().indexOf("class edge") > -1 ) {
                return true;
            }
            if( this.group.toLowerCase().trim().indexOf("prestige edge") > -1 ) {
                return true;
            }
        }
        return false;
    }
}

