import { abort } from 'process';
import { IEffectVailidtyResults } from '../../interfaces/IEffectVailidtyResults';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { replaceAll } from '../../utils/CommonFunctions';
import { generateUUID } from '../../utils/generateUUID';
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from '../_base_object';
import { ISpecialAbilityItem, PlayerCharacter } from './player_character';
import { IChargenRaceAbility, PlayerCharacterRaceAbility } from './player_character_race_ability';
import { SuperPower2021 } from './super_power_2021';
import { CharMod, IModLineExport } from './_char_mod';

export interface IRaceOptions extends IBaseObjectVars {
    selected_race_options: string[];
    chosen_race_abilities: IChargenRaceAbility[];
}
export interface IChargenRace extends IBaseObjectExport {
    // id: number;
    // name: string;
    // name_plural: string;

    // book_id: number;
    // book_name: string;
    // book_short_name: string;
    // book_publisher: string;
    // book_published: string;
    // book_core: number;
    // book_primary: number;

    // active: boolean;

    counts_as_other_race: string[];

    extra_race_abilities_points: number;

    effects: string | IRaceEffects[];
    // page: string;

    // is_custom?: boolean;
    race_value?: number;
    race_abilities_init?: IChargenRaceAbility[];

    // description: string[];

    image_upload: string,
    image_updated: Date,

    // created_by_name: string;
    // updated_by_name: string;
    // deleted_by_name: string;

    // created_by: number;
    // updated_by: number;
    // deleted_by: number;

    // created_on: Date;
    // updated_on: Date;
    // deleted_on: Date;

    // readonly: boolean;
}

export interface IRaceEffects {

    name: string;
    uuid: string;
    description: string;
    list_as: string;
    effects: string[];
    specify: string;
    specifyValue?: string;
    specifyLimit?: string[];
    selectItems?: string[];
    specify_value: string;
    specify_limit: string[];
    select_items: string[];

    alternate_options: IRaceEffects[];
}

export class PlayerCharacterRace extends BaseObject {
    selected_race_options: string[] = [];
    _hasBeenApplied: boolean = false;
    // _char: PlayerCharacter;

    readOnlyName: boolean = false;
    appendToName: string = "";

    effects: IRaceEffects[] = [];

    imageURL: string = "";
    imageUpdated: Date = new Date();

    extra_race_abilities_points: number = 0;

    customRaceAbilities: PlayerCharacterRaceAbility[] = [];
    customRaceValue: number = 0;

    nameOverride: string = "";

    noEffects: boolean = false;
    hideRaceTab: boolean = false;

    counts_as_other_race: string[] = [];
    constructor(
        raceObj: IChargenRace | null = null,
        characterObject: PlayerCharacter | null = null,
        raceId: number = 0,
    ) {
        super( raceObj, characterObject );
        this._char = characterObject;

        this.reset();
        if( raceObj ) {
            this.import( raceObj );
        } else {
            this.setRaceByID(raceId);
        }

    }

    calcReset() {
        this._hasBeenApplied = false;
        this.appendToName = "";
        for( let abi of this.customRaceAbilities ) {
            abi.calcReset();
        }
    }

    reset() {
        this.selected_race_options = [];
        super.reset();
        this.effects = [];
        this.image_url = "";
        this.imageUpdated = new Date();
        this.extra_race_abilities_points = 0;
        this.customRaceAbilities = [];
    }

    import( initData: IChargenRace ) {

        this.reset();

        if( initData ) {
            super.import(initData, this._char ? this._char.getAvailableData().books : [] );
            this.image_url = "";

            this.hideRaceTab = false;

            if(typeof(initData.image_upload) !== 'undefined'){
                this.image_url = initData.image_upload;
            }
            if(typeof(initData.image_updated) !== 'undefined'){
                this.imageUpdated = new Date(initData.image_updated);
            }

            if( initData.counts_as_other_race ) {
                this.counts_as_other_race = initData.counts_as_other_race;
            }
            if ( initData.effects && initData.effects.length > 0 ) {
                // this.effects = [];
                if(typeof(initData.effects) === "string") {
                    let tempEffects = JSON.parse(initData.effects);
                    if( tempEffects && tempEffects.length > 0 ) {
                        for( let tempEffect of tempEffects ) {
                            let newEffects: IRaceEffects = {
                                name: "",
                                alternate_options: [],
                                uuid: generateUUID(),
                                effects: [],
                                list_as: "",
                                description: "",
                                specify: "",
                                specify_limit: [],
                                specify_value: "",
                                select_items: [],
                            }

                            for( let key of Object.keys(tempEffect) ) {
                                if( key.toLowerCase() == "effects" ) {
                                    newEffects.effects = tempEffect[key];
                                }
                                if( key.toLowerCase() == "name" ) {
                                    newEffects.name = tempEffect[key];
                                }
                                if( key.toLowerCase() == "description" ) {
                                    newEffects.description = tempEffect[key];
                                }
                                if( key.toLowerCase() == "alternate_options" ) {
                                    newEffects.alternate_options = tempEffect[key];
                                }
                                if( key.toLowerCase() == "list_as" || key.toLowerCase() == "listas" ) {
                                    newEffects.list_as = tempEffect[key];
                                }
                            }
                            this.effects.push( newEffects );
                        }
                    }
                } else {
                    // console.log("initData.effects", this.name, initData.name, initData.effects);
                    this.effects = initData.effects;
                }
            }

            if( initData.extra_race_abilities_points ) {
                this.extra_race_abilities_points = initData.extra_race_abilities_points;
            }

            // this.custom = false;
            this.customRaceAbilities = [];
            this.customRaceValue = 0;

            if( initData.race_abilities_init && initData.race_abilities_init.length > 0 ) {
                for( let init of initData.race_abilities_init ) {
                    this.addCustomRaceAbility( init );
                }
            }

        }
    }

    public setRaceCustom( raceInit: IChargenRace | null = null ) {
        this.book_id = 0;

        this.book_page = "";

        this.name = "";
        this.image_url = "";

        this.is_custom = true;

        this.customRaceAbilities = [];
        this.customRaceValue = 0;
        this.description = "";

        if( raceInit ) {

            if(typeof(raceInit.image_upload) !== 'undefined'){
                this.image_url = raceInit.image_upload;
            }
            if(typeof(raceInit.image_updated) !== 'undefined'){
                this.imageUpdated = new Date(raceInit.image_updated);
            }
            if(typeof(raceInit.description) !== 'undefined'){
                if(typeof(raceInit.description) == 'string'){
                    this.description = raceInit.description;
                } else {
                    this.description = raceInit.description.join("\n");
                }
            }
            this.name = raceInit.name;
            if( raceInit.race_abilities_init ) {
                for( let init of raceInit.race_abilities_init ) {
                    this.addCustomRaceAbility( init );
                }
            }



            if( raceInit.race_value)
                this.customRaceValue = raceInit.race_value;

            this.import(raceInit);

            this.is_custom = true;
        }
    }

    updateSPC2021 (
        abilityIndex: number,
        nv: SuperPower2021,
    ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[abilityIndex].selectedSuperPower2021Obj = nv;
            this.customRaceAbilities[abilityIndex].selectedSuperPower2021Options = nv.exportOptions();
        }
    }

    addCustomRaceAbilityById( abilityID: number ) {
        let newAbility = new PlayerCharacterRaceAbility( null, this._char );
        if( this._char) {
            for( let abiItem of this._char.getAvailableData().race_abilities) {
                if( abiItem.id == abilityID ) {
                    newAbility.import( abiItem );
                    break;
                }
            }
        }
        this.customRaceAbilities.push( newAbility );
    }

    removeRacialAbility( abilityIndex: number ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities.splice( abilityIndex, 1);
            return true;
        }
        return false;
    }

    updateRaceName( newValue: string ) {
        this.name = newValue;
        return true;
    }

    updateSelectedAttribute( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedAttribute = newValue;
            return true;
        }
        return false;
    }

    updateSelectedEdge( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedEdge = newValue;
            return true;
        }
        return false;
    }

    updateSelectedHindrance( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedHindrance = newValue;
            return true;
        }
        return false;
    }

    updateSelectedHindranceMajor( abilityIndex: number, newValue: boolean ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedHindranceMajor = newValue;
            return true;
        }
        return false;
    }

    updateSelectedTrait( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedTrait = newValue;
            return true;
        }
        return false;
    }

    updateSelectedTraitSpecify( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedTraitSpecify = newValue;
            return true;
        }
        return false;
    }

    updateSelectedSkillSpecify( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedSkillSpecify = newValue;
            return true;
        }
        return false;
    }

    updateSelectedSkill( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedSkill = newValue;
            return true;
        }
        return false;
    }

    updateCustomName( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].customName = newValue;
            return true;
        }
        return false;
    }

    updateSelectedPower( abilityIndex: number, powerID: number ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedPower = powerID;
            return true;
        }
        return false;
    }

    updateSelectedSuperPower( abilityIndex: number, powerID: number ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].selectedSuperPower2014 = powerID;
            return true;
        }
        return false;
    }

    updateCustomSummary( abilityIndex: number, newValue: string ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].customSummary = newValue;
            return true;
        }
        return false;
    }

    updateCustomEffects( abilityIndex: number, newValue: string[] ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].customEffects = newValue;
            return true;
        }
        return false;
    }

    updateCustomValue( abilityIndex: number, newValue: number ) {
        if( this.customRaceAbilities.length > abilityIndex && this.customRaceAbilities[abilityIndex] ) {
            this.customRaceAbilities[ abilityIndex ].customValue = newValue;
            return true;
        }
        return false;
    }

    addCustomRaceAbility( init: IChargenRaceAbility | null ) {
        let newAbility = new PlayerCharacterRaceAbility(   init, this._char, );
        if( init && init.id && this._char ) {
            for( let abiItem of this._char.getAvailableData().race_abilities) {
                if( abiItem.id == init.id ) {
                    newAbility.import( abiItem );
                    newAbility.customName = init.custom_name;
                    newAbility.customSummary = init.custom_summary;
                    newAbility.customEffects = init.custom_effects;
                    newAbility.selectedAttribute = init.selected_attribute;
                    newAbility.selectedEdge = init.selected_edge;
                    newAbility.selectedHindrance = init.selected_hindrance;
                    newAbility.selectedHindranceMajor = init.selected_hindrance_major;
                    newAbility.selectedSkill = init.selected_skill;
                    newAbility.selectedSkillSpecify = init.selected_skill_specify;
                    newAbility.selectedTrait = init.selected_trait;
                    newAbility.selectedTraitSpecify = init.selected_trait_specify;

                    newAbility.selectedSuperPower2014 = init.selected_super_power;
                    newAbility.selectedSuperPower2014Options = init.selected_super_power_options;

                    newAbility.selectedPower = init.selected_power;
                    break;
                }
            }
        }

        this.customRaceAbilities.push( newAbility );
    }

    public exportOptions(): IRaceOptions {
        let rv = super.exportOptions() as IRaceOptions;

        rv.selected_race_options = this.selected_race_options;
        rv.chosen_race_abilities = [];

        for( let abi of  this.customRaceAbilities ) {
            let abiExp = abi.export()
            abiExp = cleanUpReturnValue(abiExp);
            rv.chosen_race_abilities.push( abiExp );
        }

            rv = cleanUpReturnValue(rv);

        return rv;
    }

    public importOptions( options: IRaceOptions) {
        super.importOptions(options);
        this.customRaceAbilities = [];
        if( options.chosen_race_abilities ) {
            for( let opt of options.chosen_race_abilities ) {
                this.customRaceAbilities.push(
                    new PlayerCharacterRaceAbility(
                        opt,
                        this._char,
                    )
                )
            }

        }
        if( options.selected_race_options ) {
            this.selected_race_options = options.selected_race_options;
        }
    }

    public getBaseName( name: string ): string {
        if( name.toLowerCase().indexOf("(") > -1 ) {
            name = this.name.substring(0, this.name.toLowerCase().indexOf("("));
            return name.trim();
        } else {
            return this.name;
        }
    }

    public isNamed( nameOrCountsAs: string ): boolean {

        if( this.name.toLowerCase().trim() == nameOrCountsAs.toLowerCase().trim() ) {
            return true;
        }

        if( this.getBaseName(this.name).toLowerCase().trim() == this.getBaseName(nameOrCountsAs).toLowerCase().trim() ) {
            return true;
        }

        for( let countsAs of this.counts_as_other_race ) {
            if( countsAs ) {
                if( countsAs.toLowerCase().trim() == nameOrCountsAs.toLowerCase().trim() ) {
                    return true;
                }
            }
        }

        return false;
    }

    public export(): IChargenRace {
        let returnObj = super.export() as IChargenRace;

        returnObj.extra_race_abilities_points = this.extra_race_abilities_points;
        returnObj.effects = this.getAbilities();
        returnObj.counts_as_other_race = this.counts_as_other_race;
        returnObj.image_upload = this.image_url;
        returnObj.image_url = this.image_url;
        returnObj.image_updated = this.imageUpdated;
        returnObj.race_value = this.customRaceValue;
        returnObj.race_abilities_init = [];

        let raceAbilities: IChargenRaceAbility[] = [];
        for( let ability of this.customRaceAbilities ) {
            raceAbilities.push( ability.export() );
        }
        returnObj.race_abilities_init = raceAbilities;

        returnObj = cleanUpReturnValue(returnObj);

        // console.log("returnObj", returnObj)
        return returnObj;
    }

    getAbilities( normalizeSelections: boolean = false): IRaceEffects[] {

        if( this.noEffects ) {
            return [];
        }
        if( this.is_custom ) {
            let exportEffects: IRaceEffects[] = [];
            let abilityIndex = -1;
            let theEffects: string[] = [];
            for( let raceAbility of this.customRaceAbilities ) {
                abilityIndex++;
                let ability = this.effects[abilityIndex];
                let specify = "";
                let specifyValue = "";
                let specifyLimit: string[] = [];
                let selectItems: string[] = [];
                let alternateOptions: IRaceEffects[] = [];
                theEffects = [];
                if( ability ) {

                    alternateOptions = ability.alternate_options;
                    if( !ability.effects ) {
                        ability.effects = []
                    }
                    for( let effect of ability.effects ) {
                        if( effect.startsWith("choose_item:")) {
                            theEffects.push(effect)
                            let specifyListText = effect.substring(effect.indexOf("[") + 1);

                            if( specifyListText.indexOf("]") > 1) {
                                specifyListText = specifyListText.substring(0, specifyListText.indexOf("]") - 1);
                            }

                            selectItems = specifyListText.split(";");
                        }  else {
                            if( effect.toLowerCase().indexOf("[pace]") > -1 ) {
                                theEffects.push(effect)
                            }  if( effect.indexOf("[") > -1) {
                                let split =  effect.split("[");
                                specify = split[1].substring( split[1].indexOf(":") + 1, split[1].indexOf("]") - split[1].indexOf(":") - 1);
                                specifyValue = this.getSpecifyValue( +abilityIndex )
                                if( specify.indexOf(";") > -1 ) {
                                    let split2 = specify.split(";");
                                    specify = split2[0];
                                    specifyLimit = split2[1].split(",");
                                }

                                if( normalizeSelections ) {
                                    let firstBit = effect.substring(0, effect.indexOf("["));
                                    let chooseBit = effect.substring(effect.indexOf("["));
                                    if( chooseBit.indexOf("]") > 1) {
                                        chooseBit = effect.substring(0, effect.indexOf("]") + 1);
                                    }

                                    // console.log("chooseBit1", chooseBit)
                                    // console.log("specifyValue", specifyValue)
                                    chooseBit = effect.replace( chooseBit, " " + specifyValue + " ");
                                    // console.log("chooseBit2", chooseBit)
                                    theEffects.push( replaceAll(firstBit + chooseBit, "  ", " ") )
                                } else {
                                    theEffects.push(effect)
                                }

                            } else if( effect.indexOf("|") > -1 && effect.indexOf(":") > -1) {
                                let effectSplit = effect.split(":");
                                selectItems = effectSplit[1].split("|")
                                let specifyValue = this.getSpecifyValue( +abilityIndex );
                                if( specifyValue && normalizeSelections ) {
                                    theEffects.push( effectSplit[0] + ":" + specifyValue)
                                } else {
                                    theEffects.push(effect)
                                }

                            } else {
                                theEffects.push(effect)
                            }

                        }
                    }

                }

                exportEffects.push({
                    list_as: "a",
                    uuid: generateUUID(),
                    alternate_options: alternateOptions,
                    effects: raceAbility.getEffects(),
                    description: raceAbility.getSummary(),
                    name: raceAbility.getName(),
                    specify: specify,
                    specify_value: specifyValue,
                    specify_limit: specifyLimit,
                    select_items: selectItems,
                });
            }
            return exportEffects;
        } else {
            let rv: IRaceEffects[] = []

            for( let abilityIndex in this.effects ) {
                let ability = this.effects[abilityIndex];
                let specify = "";
                let specifyValue = "";
                let specifyLimit: string[] = [];
                let selectItems: string[] = [];

                if(ability) {
                    // Check if an alternative racial ability is selected for this ability index
                    let alternativeChoice = this.getRaceAlternativeChoice(+abilityIndex);
                    let effectiveAbility = ability;

                    // If an alternative is selected and alternatives exist, use the alternative
                    if (alternativeChoice >= 0 && ability.alternate_options && ability.alternate_options.length > alternativeChoice) {
                        effectiveAbility = ability.alternate_options[alternativeChoice];
                    }
                    
                    let theEffects: string[] = [];

                    if( !effectiveAbility.effects ) {
                        effectiveAbility.effects = []
                    }
                    for( let effect of effectiveAbility.effects ) {
                        if( effect.startsWith("choose_item:")) {
                            theEffects.push(effect)
                            let specifyListText = effect.substring(effect.indexOf("[") + 1);

                            if( specifyListText.indexOf("]") > 1) {
                                specifyListText = specifyListText.substring(0, specifyListText.indexOf("]") - 1);
                            }

                            selectItems = specifyListText.split(";");

                            theEffects.push(effect)
                        }  else {
                            if( effect.toLowerCase().indexOf("[pace]") > -1 ) {
                                theEffects.push(effect)
                            }  if( effect.indexOf("[") > -1) {
                                let split =  effect.split("[");
                                specify = split[1].substring( split[1].indexOf(":") + 1, split[1].indexOf("]") - split[1].indexOf(":") - 1);
                                specifyValue = this.getSpecifyValue( +abilityIndex )
                                if( specify.indexOf(";") > -1 ) {
                                    let split2 = specify.split(";");
                                    specify = split2[0];
                                    specifyLimit = split2[1].split(",");
                                }

                                if( normalizeSelections ) {
                                    let firstBit = effect.substring(0, effect.indexOf("["));
                                    let chooseBit = effect.substring(effect.indexOf("["));
                                    if( chooseBit.indexOf("]") > 1) {
                                        chooseBit = effect.substring(0, effect.indexOf("]") + 1);
                                    }

                                    // console.log("chooseBit1", chooseBit)
                                    // console.log("specifyValue", specifyValue)
                                    chooseBit = effect.replace( chooseBit, " " + specifyValue + " ");
                                    // console.log("chooseBit2", chooseBit)
                                    theEffects.push( replaceAll(firstBit + chooseBit, "  ", " ") )
                                } else {
                                    theEffects.push(effect)
                                }

                            } else if( effect.indexOf("|") > -1 && effect.indexOf(":") > -1) {
                                let effectSplit = effect.split(":");
                                selectItems = effectSplit[1].split("|")
                                let specifyValue = this.getSpecifyValue( +abilityIndex );
                                if( specifyValue && normalizeSelections ) {
                                    theEffects.push( effectSplit[0] + ":" + specifyValue)
                                } else {
                                    theEffects.push(effect)
                                }

                            } else {
                                theEffects.push(effect)
                            }

                        }
                    }
                    if(!ability.uuid) {
                        ability.uuid = generateUUID();
                    }

                    // console.log("getAbilities ability.alternate_options", ability.alternate_options);
                    rv.push({
                        list_as: effectiveAbility.list_as || ability.list_as,
                        effects: theEffects,
                        uuid: effectiveAbility.uuid || ability.uuid,
                        alternate_options: ability.alternate_options, // Keep original alternatives for reference
                        description: effectiveAbility.description,
                        name: effectiveAbility.name,
                        specify: specify,
                        specify_value: specifyValue,
                        specify_limit: specifyLimit,
                        select_items: selectItems,
                    })
                }

            }
            return rv;
        }
    }

    getEffectsBlock(): string[] {
        let effects: string[] = []
        for( let ability of this.getAbilities() ) {
            if( ability ) {
                if( !ability.effects ) {
                    ability.effects = []
                }
                for( let item of ability.effects ) {
                    if( item ) {
                        effects.push( item )
                    }

                }
            }
        }

        return effects;
    }

    public setRaceByID(newID: number ) {
        this.is_custom = false;
        this.customRaceAbilities = [];
        this.customRaceValue = 0;
        this.hideRaceTab = false;
        this.id = 0;
        if( newID > 0 && this._char ) {
            for( let race of this._char.getAvailableData().races ) {
                if (
                    this._char.setting.book_is_used(race.book_id)
                    &&
                    race.id == newID
                ) {
                    // console.log("found race", race);
                    this.import( race );
                }
            }
        }

        if( this.id == 0 ) {
            // set to default primary book Human
            if( this._char ) {
                for( let race of this._char.getAvailableData().races ) {
                    if(
                        this._char.setting.primaryBook
                        &&
                        race.book_id == this._char.setting.primaryBook.id
                        && race.name.toLowerCase().trim() == "human"
                    ) {
                        this.import( race );
                    }

                }
            }
        }
    }

    public getEffectiveRaceAbilityList(): ISpecialAbilityItem[] {
        // Get the base abilities
        let baseAbilities = this.getRaceAbilityList(false);
        let effectiveAbilities: ISpecialAbilityItem[] = [];

        // Process each ability to check for alternative selections
        for (let abilityIndex = 0; abilityIndex < baseAbilities.length; abilityIndex++) {
            let ability = baseAbilities[abilityIndex];
            // Use originalIndex if available (for reordered abilities like Size), otherwise use abilityIndex
            let effectiveIndex = ability.originalIndex !== undefined ? ability.originalIndex : abilityIndex;
            let alternativeChoice = this.getRaceAlternativeChoice(effectiveIndex);

            // If an alternative is selected and alternatives exist, use the alternative
            if (alternativeChoice >= 0 && ability.alternate_options && ability.alternate_options.length > alternativeChoice) {
                let alternative = ability.alternate_options[alternativeChoice];
                effectiveAbilities.push({
                    name: alternative.name,
                    summary: alternative.description,
                    specify: ability.specify,
                    specifyValue: ability.specifyValue,
                    specifyLimit: ability.specifyLimit,
                    selectItems: ability.selectItems,
                    alternate_options: [],
                    from: "Racial",
                    positive: true,
                    book_name: ability.book_name,
                    page: ability.page,
                    book_id: ability.book_id,
                    custom: ability.custom,
                });
            } else {
                // Use the default ability
                effectiveAbilities.push({
                    ...ability,
                    alternate_options: [], // Remove alternatives from effective list
                });
            }
        }

        return effectiveAbilities;
    }

    public getRaceAbilityList(
        include_options: boolean = false
    ): ISpecialAbilityItem[] {

        if( this.noEffects )
            return [];

        let rv: ISpecialAbilityItem[] = [];

        let sizeItemCount = 0;
        let sizeItem: ISpecialAbilityItem | null  = null;

        if( this.is_custom ) {
            let abilityIndex = -1;
            for( let ability of this.customRaceAbilities ) {
                abilityIndex++;
                if( ability.name.toLowerCase().trim() == "size +1" ) {
                    sizeItem = {
                        name: ability.getName(true),
                        summary: ability.getSummary(),
                        alternate_options: [],
                        specify: "",
                        specifyValue: "",
                        specifyLimit: [],
                        selectItems: [],
                        from: "Racial",
                        positive: ability.positive,
                        book_name: this.book_obj.shortName,
                        book_id: this.book_id,
                        page: this.book_page,
                        custom: this.book_id > 0 ? true : false,
                    };
                    sizeItemCount++;
                } else if( ability.name.toLowerCase().trim() == "size -1" ) {
                    sizeItem = {
                        name: ability.getName(true),
                        summary: ability.getSummary(),
                        alternate_options: [],
                        specify: "",
                        specifyValue: "",
                        specifyLimit: [],
                        selectItems: [],
                        from: "Racial",
                        positive: ability.positive,
                        book_name: this.book_obj.shortName,
                        page: this.book_page,
                        book_id: this.book_id,
                        custom: this.book_id > 0 ? true : false,
                    };
                    sizeItemCount--;
                } else {
                        if( ability.is_custom ) {

                        let specify = "";
                        let specifyValue = "";
                        let specifyLimit: string[] = []
                        let selectItems: string[] = []
                        if( ability.customEffects ) {
                            for( let effect of ability.customEffects ) {
                                if( effect.startsWith("choose_item:")) {
                                    let specifyListText = effect.substring(effect.indexOf("[") + 1);
                                    if( specifyListText.indexOf("]") > 1) {
                                        specifyListText = specifyListText.substring(0, specifyListText.indexOf("]") - 1);
                                    }
                                    selectItems = specifyListText.split(";");
                                    specifyValue = this.getSpecifyValue( +abilityIndex )
                                }  else if( effect.indexOf("[") > -1) {
                                    let split =  effect.split("[");
                                    specify = split[1].substring( split[1].indexOf(":") + 1, split[1].indexOf("]") - split[1].indexOf(":") - 1);
                                    specifyValue = this.getSpecifyValue( +abilityIndex )
                                    if( specify.indexOf(";") > -1 ) {
                                        let split2 = specify.split(";");
                                        specify = split2[0];
                                        specifyLimit = split2[1].split(",");
                                    }

                                }  else if( effect.indexOf("|") > -1 && effect.indexOf(":") > -1) {
                                    let effectSplit = effect.split(":");
                                    selectItems = effectSplit[1].split("|")
                                    specifyValue = this.getSpecifyValue( +abilityIndex )

                                }

                            }
                        }

                        rv.push( {
                            name: ability.getName(true),
                            summary: ability.getSummary(),
                            specify: specify,
                            specifyValue: specifyValue,
                            specifyLimit: specifyLimit,
                            selectItems: selectItems,
                            from: "Racial",
                            alternate_options: [],
                            positive: true,
                            book_name: "Custom",
                            book_id: 0,
                            page: "",
                            custom: true,
                        } );

                    } else {
                        rv.push( {
                            name: ability.getName(true),
                            summary: ability.getSummary(),
                            specify: "",
                            specifyValue: "",
                            specifyLimit: [],
                            alternate_options: [],
                            selectItems: [],
                            from: "Racial",
                            positive: ability.positive,
                            book_name: this.book_obj.shortName,
                            book_id: this.book_id,
                            page: this.book_page,
                            custom: this.book_id > 0 ? true : false,
                        });
                    }

                }
            }
        } else {

            for( let abilityIndex in this.effects ) {
                let ability = this.effects[abilityIndex];

                if( ability.name.toLowerCase().trim() == "size +1" ) {
                    sizeItem = {
                        name: ability.name,
                        summary: ability.description,
                        specify: "",
                        alternate_options: [],
                        specifyValue: "",
                        specifyLimit: [],
                        selectItems: [],
                        from: "Racial",
                        positive: true,
                        book_name: this.book_obj.shortName,
                        page: this.book_page,
                        book_id: this.book_id,
                        custom: this.book_id > 0 ? true : false,
                    };
                    sizeItemCount++;
                } else if( ability.name.toLowerCase().trim() == "size -1" ) {
                    sizeItem = {
                        name: ability.name,
                        summary: ability.description,
                        specify: "",
                        specifyValue: "",
                        alternate_options: [],
                        specifyLimit: [],
                        selectItems: [],
                        from: "Racial",
                        positive: true,
                        book_name: this.book_obj.shortName,
                        page: this.book_page,
                        book_id: this.book_id,
                        custom: this.book_id > 0 ? true : false,
                    };
                    sizeItemCount--;
                } else {
                    let specify = "";
                    let specifyValue = "";
                    let specifyLimit: string[] = []
                    let selectItems: string[] = [];
                    if( !ability.effects ) {
                        ability.effects = []
                    }

                        for( let effect of ability.effects ) {
                            if( effect.startsWith("choose_item:")) {
                                let specifyListText = effect.substring(effect.indexOf("[") + 1);
                                if( specifyListText.indexOf("]") > 1) {
                                    specifyListText = specifyListText.substring(0, specifyListText.indexOf("]") - 1);
                                }
                                selectItems = specifyListText.split(";");
                                specifyValue = this.getSpecifyValue( +abilityIndex )
                            }  else if( effect.indexOf("[") > -1) {
                                let split =  effect.split("[");
                                specify = split[1].substring( split[1].indexOf(":") + 1, split[1].indexOf("]") - split[1].indexOf(":") - 1);
                                specifyValue = this.getSpecifyValue( +abilityIndex )
                                if( specify.indexOf(";") > -1 ) {
                                    let split2 = specify.split(";");
                                    specify = split2[0];
                                    specifyLimit = split2[1].split(",");
                                }

                            }  else if( effect.indexOf("|") > -1 && effect.indexOf(":") > -1) {
                                let effectSplit = effect.split(":");
                                selectItems = effectSplit[1].split("|")
                                specifyValue = this.getSpecifyValue( +abilityIndex )

                            }

                        }

                    if( ability.name != "" && include_options == false) {
                        rv.push( {
                            name: ability.name,
                            alternate_options: ability.alternate_options ? ability.alternate_options : [],
                            summary: ability.description,
                            specify: specify,
                            specifyValue: specifyValue,
                            specifyLimit: specifyLimit,
                            selectItems: selectItems,
                            from: "Racial",
                            positive: true,
                            book_name: this.book_obj.shortName,
                            page: this.book_page,
                            book_id: this.book_id,
                            custom: this.book_id > 0 ? true : false,
                            originalIndex: +abilityIndex, // Track original index in effects array
                        } );
                    }
                }
            }
        }

        if( sizeItemCount > 1 && sizeItem ) {
            rv.push( {
                name: sizeItem.name.replace("+1", "+" + sizeItemCount.toString() ),
                summary: sizeItem.summary.replace(" 1.", " " + sizeItemCount.toString() + ".").replace(" 1 ", " " + sizeItemCount.toString() + " " ),
                specify: "",
                specifyLimit: [],
                alternate_options: [],
                specifyValue: "",
                selectItems: [],
                from: "Racial",
                positive: true,
                book_name: this.book_obj.shortName,
                page: this.book_page,
                book_id: this.book_id,
                custom: this.book_id > 0 ? true : false,
            })
        } else if( sizeItemCount < 1 && sizeItem) {
            rv.push( {
                name: sizeItem.name.replace("-1", "" + sizeItemCount.toString() ),
                summary: sizeItem.summary.replace(" 1.", " " + Math.abs(sizeItemCount).toString() + "." ).replace(" 1 ", " " + Math.abs(sizeItemCount).toString() + " " ),
                specify: "",
                specifyLimit: [],
                alternate_options: [],
                specifyValue: "",
                selectItems: [],
                from: "Racial",
                positive: true,
                book_name: this.book_obj.shortName,
                page: this.book_page,
                book_id: this.book_id,
                custom: this.book_id > 0 ? true : false,
            })
        } else {
            if( sizeItem ) {
                rv.push( sizeItem );
            }
        }

        return rv;
    }

    public getRaceValue(): number {
        if( this.is_custom ) {
            let rv: number = 0;

            for( let raceAbility of this.customRaceAbilities ) {
                if( raceAbility.id == 0 ) {
                    rv += raceAbility.customValue;
                } else {
                    rv += raceAbility.getPoints();
                }
            }

            return rv;
        } else {
            return 2; // Hardcoded as it't not used yet.
        }
    }

    public getSpecifyValue( abilityIndex: number ): string {
        let rv = "";

        if(this._char
            && this._char._raceAbilitySpecifies
            && this._char._raceAbilitySpecifies.length > abilityIndex
            && this._char._raceAbilitySpecifies[abilityIndex]
        ) {
            return this._char._raceAbilitySpecifies[abilityIndex];
        }

        return rv;
    }

    public setRaceSpecifyText( abilityIndex: number, newValue: string ): void {
        if(this._char ) {
            if( !this._char._raceAbilitySpecifies ) {
                this._char._raceAbilitySpecifies = []
            }
            while( this._char._raceAbilitySpecifies.length < abilityIndex) {
                this._char._raceAbilitySpecifies.push("");
            }
            this._char._raceAbilitySpecifies[abilityIndex] = newValue;
        }
    }

    public setRaceAlternativeChoice( abilityIndex: number, choiceIndex: number ): void {
        if(this._char ) {
            if( !this._char._raceAbilityAlternativeChoices ) {
                this._char._raceAbilityAlternativeChoices = []
            }
            while( this._char._raceAbilityAlternativeChoices.length <= abilityIndex) {
                this._char._raceAbilityAlternativeChoices.push(-1); // Default choice
            }
            this._char._raceAbilityAlternativeChoices[abilityIndex] = choiceIndex;
        }
    }

    public getRaceAlternativeChoice( abilityIndex: number ): number {
        if(this._char && this._char._raceAbilityAlternativeChoices && this._char._raceAbilityAlternativeChoices[abilityIndex] !== undefined ) {
            return this._char._raceAbilityAlternativeChoices[abilityIndex];
        }
        return -1; // Default choice
    }

    public exportHTML(hideImage: boolean = false): string {
        let exportHTML = "";

        if( this.image_url && !hideImage ) {
            exportHTML += "<span class=\"float-right\" id=\"character-image\">";

            exportHTML += "<img src=\"" + this.image_url + "\">";

            exportHTML += "</span>\n";
        }

        if( this.name ) {
            exportHTML += "<h1>" + this.name + "</h1>\n";
        }

        if( this.description.length > 1 || ( this.description.length == 1 && this.description[0].trim() != "") ) {
            exportHTML += "<p>" +this.description.split("\n").join("</p>\n<p>") + "</p>\n\n";
        }

        exportHTML += "<hr />\n";

        exportHTML += "<ul>\n";
        for( let item of this.getEffectiveRaceAbilityList() ) {
            exportHTML += "<li><strong>" + item.name + ":</strong> " + item.summary;

            if( item.selectItems.length > 0 && item.specifyValue) {
                exportHTML += "<p>" + item.specifyValue + "</p>";
            }
            exportHTML += "</li>\n";
        }
        exportHTML += "</ul>\n";

        return exportHTML;
    }

    public getName() {
        let append = "";
        if( this.appendToName )
            append = " (" + this.appendToName + ")";
        if( this._char && this._char.raceNameOverride.trim() ) {
            return this._char.raceNameOverride.trim() + append;
        } else {
            if( this.nameOverride ) {
                return this.nameOverride + append
            } else {
                if( this.name.trim() == "" )
                    return append.replace("(", "").replace(")", "").trim()
                else
                    return this.name + append;
            }
        }
    }

    public hasRacialAbility(
        abilityName: string,
        exceptUUID: string | null = null,
    ) : {
        totalIndex: number,
        powerIndex: number,
        totalCount: number,
        powerCount: number,
    } {
        let totalIndex: number = -1
        let powerIndex: number = -1
        let totalCount: number = 0
        let powerCount: number = 0

        for( let abi of this.customRaceAbilities ) {
            totalCount++;
            if( abi.name.toLowerCase().trim() == abilityName.toLowerCase().trim() ) {
                powerCount++;
                if( !exceptUUID || abi.uuid == exceptUUID ) {
                    powerIndex = powerCount - 1;
                    totalIndex = totalCount - 1;
                }
            }
        }

        return {
            totalIndex: totalIndex,
            powerIndex: powerIndex,
            totalCount: totalCount,
            powerCount: powerCount,
        };
    }

    public hasEffect( effectTerm: string ): boolean {
        for( let abi of this.getAbilities() ) {
            for( let effect of abi.effects ) {
                if( effect.indexOf( effectTerm) > -1 )
                        return true;
            }
        }
        return false;
    }

    public getEffectValidity(): IEffectVailidtyResults {
        let rv: IEffectVailidtyResults = {
            total: 0,
            good: 0,
            valid: true,
            messages: [],
        }
        for( let effect of this.effects ) {
            const results = ApplyCharacterEffects(
                effect.effects
            )

            for( let result of results ) {
                if( result ) {
                    rv.total++;
                    if( result.good ) {
                        rv.good++;
                    } else {
                        rv.valid = false;
                    }
                    rv.messages.push( result );
                }
            }
        }

        return rv;
    }

    public apply() {
        if( this._hasBeenApplied ) {
            console.warn( this.name + " has already been applied, skipping");
            return;
        }

        this._hasBeenApplied = true;

        if( this.getAbilities(true).length > 0 ) {

            for( let abilityEffects of this.getAbilities(true) ) {
                let effects: string[] = [];

                for(let effect of abilityEffects.effects) {
                    // effect = replaceSkillBoostWithSetSkill(effect);
                    effects.push( effect );
                }

                // console.log("race abilityEffects", abilityEffects);
                // console.log("race effects", effects);
                // console.log("abilityEffects.specify", abilityEffects.specify);
                // console.log("abilityEffects.specify_value", abilityEffects.specify_value);
                let applyImmediately = true;
                // for( let effect in effects ) {
                //     if( effect.toLowerCase().trim().startsWith("add_edge")) {
                //         applyImmediately = false;
                //     }
                //     if( effect.toLowerCase().trim().startsWith("addedge")) {
                //         applyImmediately = false;
                //     }
                //     if( effect.toLowerCase().trim().startsWith("edgeadd")) {
                //         applyImmediately = false;
                //     }
                //     if( effect.toLowerCase().trim().startsWith("edge_add")) {
                //         applyImmediately = false;
                //     }

                // }

                ApplyCharacterEffects(
                    effects,
                    this._char,
                    "Race Ability: " + abilityEffects.name,
                    abilityEffects.specify,
                    abilityEffects.specify_value,
                    null,
                    applyImmediately,
                );
                // console.log("race ApplyCharacterEffects finished");
            }

            for( let eff of  this.customRaceAbilities) {
                // console.log("eff", eff);
                if( this._char) {

                    eff.applyAdditionalEffects( this._char );
                }
            }
        }

    }
    getRacialPowerPoints(): number {
        let rv = 0;

        if( this.getAbilities(true).length > 0 ) {

            for( let abilityEffects of this.getAbilities(true) ) {

                for(let modline of abilityEffects.effects) {
                    // effect = replaceSkillBoostWithSetSkill(effect);
                        // console.log("XXX", modline)
                        modline = modline.trim();
                        if( modline && !modline.startsWith("#")) {
                            let charMod = new CharMod();
                            charMod.applyImmediately = false;

                            if( modline[0] === "{" ) {
                                let modDef: IModLineExport = JSON.parse( modline );
                                charMod.importDef( modDef );
                            } else {
                                charMod.importModLine( modline );
                            }

                            // console.log("getRacialPowerPoints charMod.action", abilityEffects.name, charMod.action)

                            if(
                                charMod.action === "boost"
                                && (
                                charMod.target === "power_points"
                                ||
                                charMod.target === "powerpoints"
                                )
                            ) {
                                rv += +charMod.value;
                            }

                        }

                }
            }
        }

        for( let eff of  this.customRaceAbilities) {
            // console.log("eff", eff);
            if( this._char) {

                for(let modline of eff.effects) {
                    // effect = replaceSkillBoostWithSetSkill(effect);
                        // console.log("XXX", modline)
                        modline = modline.trim();
                        if( modline && !modline.startsWith("#")) {
                            let charMod = new CharMod();
                            charMod.applyImmediately = false;

                            if( modline[0] === "{" ) {
                                let modDef: IModLineExport = JSON.parse( modline );
                                charMod.importDef( modDef );
                            } else {
                                charMod.importModLine( modline );
                            }

                            // console.log("getRacialPowerPoints charMod.action 2" , eff.name, charMod.action)

                            if(
                                charMod.action === "power_points"
                                ||
                                charMod.action === "powerpoints"
                            ) {
                                rv += +charMod.value;
                            }

                        }

                }
            }
        }

        return rv;
    }
}

