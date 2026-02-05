import { IEffectVailidtyResults } from '../../interfaces/IEffectVailidtyResults';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { removeSpecialCharacters, stringsAreCloseEnough } from '../../utils/CommonFunctions';
import { getSelectItemsFromEffect } from '../../utils/getSelectItemsFromEffect';
import { split_by_max_two } from '../../utils/split_by_max_two';
import { BaseObject, IBaseObjectExport } from '../_base_object';
import { ISpecialAbilityItem, PlayerCharacter } from "./player_character";
import { ChargenFrameworkTable, IChargenFrameworkTableDefinition } from "./player_character_framework_table";

export interface IChargenFramework extends IBaseObjectExport {

    bonuses: IFrameworkEffect[];
    complications: IFrameworkEffect[];
    tables: IChargenFrameworkTableDefinition[];
    counts_as_other: string[];
    heros_journey_choices: number[][];
    starting_equipment: string[];
    starting_cyberware: string[];
    starting_equipment_instructions: string[];
    starting_wealth_text: string;
    starting_wealth: number;
    modified: boolean;

}

export interface IFrameworkSelection {
    frameworkID: number,
    frameworkDef: IChargenFramework | null,
    herosJourneyTableSelections: number[];
    herosJourneyTableItemSelections: number[];
    herosJourneyTableItemCompletions: number[];
    herosJourneyTableItemSubChoices: number[];
    herosJourneyTableItemSpecifications: string[];
    bonusSelections: string[];
    complicationSelections: string[];
    equipmentSelections: number[];
    startingWealthOverride: number;
    modified: boolean;
}

export interface IFrameworkEffect {
    name: string;
    description: string;
    effects: string[];
    specify: string;
    specifyValue: string;
    specifyLimit: string[];
    selectItems: string[];
    rank: number;
}

export class PlayerCharacterFramework extends BaseObject {

    _hasBeenApplied: boolean = false;

    public bonuses: IFrameworkEffect[];
    public complications: IFrameworkEffect[];
    modified: boolean;

    bonusSelections: string[];
    complicationSelections: string[]

    additionalHerosJourneyChoices: number[][];
    herosJourneyChoices: number[][];
    herosJourneyTableSelections: number[];
    herosJourneyTableItemSelections: number[];
    herosJourneyTableItemCompletions: number[];
    herosJourneyTableItemSubChoices: number[];
    herosJourneyTableItemSpecifications: string[];

    equipmentSelections: number[];

    countsAsOther: string[];

    startingEquipment: string[];
    startingCyberware: string[];
    startingEquipmentInstructions: string[];

    startingWealthText: string = "";
    startingWealthOverride: number = 0;
    startingWealth: number = 0;

    public tables: ChargenFrameworkTable[];

    constructor(
        frameworkDef: IChargenFramework | null = null,
        characterObject: PlayerCharacter | null ,
    ) {
        super(frameworkDef, characterObject);
        this._char = characterObject;
        this.import( frameworkDef )
    }

    calcReset() {
        this._hasBeenApplied = false;
        this.additionalHerosJourneyChoices = [];
    }

    getHeroesJourneyChoices(): number[][] {
        // console.log("x1", this.herosJourneyChoices)
        // console.log("x2", this.additionalHerosJourneyChoices)
        let rv = this.herosJourneyChoices.concat( this.additionalHerosJourneyChoices );

        // console.log("rv", rv)
        return rv;
    }

    public reset() {
        super.reset();
        this.modified = false;
        this.herosJourneyChoices = [];
        this.startingEquipment = [];
        this.startingCyberware = [];
        this.bonusSelections = [];
        this.complicationSelections = [];
        this.startingEquipmentInstructions = [];
        this.bonuses = [];
        this.complications = [];
        this.tables = [];
        this.countsAsOther = [];
        this.herosJourneyTableSelections = [];
        this.herosJourneyTableItemSelections = [];
        this.herosJourneyTableItemCompletions = [];
        this.herosJourneyTableItemSubChoices = [];
        this.herosJourneyTableItemSpecifications = [];
        this.equipmentSelections = [];
        this.startingWealthText = "";
        this.startingWealthOverride = 0;
        this.startingWealth = 0;
    }

    public import(jsonImportObj: IChargenFramework | null ) {
        if( jsonImportObj ) {
            super.import( jsonImportObj, this._char ? this._char.getAvailableData().books : []  );

            if( jsonImportObj.bonuses )
                this.bonuses = jsonImportObj.bonuses;

            if( jsonImportObj.starting_equipment )
                this.startingEquipment = jsonImportObj.starting_equipment;

            if( jsonImportObj.complications )
                this.complications = jsonImportObj.complications;

            this.tables = [];

            if( jsonImportObj.counts_as_other ) {
                this.countsAsOther = jsonImportObj.counts_as_other;
            }

            if( jsonImportObj.tables && this._char ) {
                for( let def of jsonImportObj.tables ) {
                    this.tables.push(
                        new ChargenFrameworkTable( def, this._char,  )
                    );
                }
            }

            if( jsonImportObj.heros_journey_choices && jsonImportObj.heros_journey_choices.length > 0 ) {
                this.herosJourneyChoices = jsonImportObj.heros_journey_choices;
            }

            if( jsonImportObj.starting_equipment_instructions )
                this.startingEquipmentInstructions = jsonImportObj.starting_equipment_instructions;

            if( jsonImportObj.starting_wealth_text )
                this.startingWealthText = jsonImportObj.starting_wealth_text;

            if( jsonImportObj.starting_wealth )
                this.startingWealth = jsonImportObj.starting_wealth;
            if( jsonImportObj.starting_cyberware )
                this.startingCyberware = jsonImportObj.starting_cyberware;

            let startEq: string[] = [];
            for( let item of this.startingEquipmentInstructions) {
                if( item.trim() ) {
                    startEq.push(item);
                }
            }

            let startEq2: string[] = [];
            for( let item of this.startingEquipment) {
                if( item.trim() ) {
                    startEq2.push(item);
                }
            }
            this.startingEquipment = startEq2;

            let startEq3: string[] = [];
            for( let item of this.startingCyberware) {
                if( item.trim() ) {
                    startEq3.push(item);
                }
            }
            this.startingCyberware = startEq3;

            while( this.equipmentSelections.length < this.startingEquipment.length ) {
                this.equipmentSelections.push( -1 )
            }

            for( let item of this.complications ) {
                if( !item.rank ) {
                    item.rank = 0;
                }
            }

            for( let item of this.bonuses ) {
                if( !item.rank ) {
                    item.rank = 0;
                }
            }
        }
    }

    public addAdditionalHJChoice() {
        let tableList: number[] = []
        for( let choice of this.herosJourneyChoices ) {
            for( let num of choice ) {
                if( tableList.indexOf( num ) == -1)
                tableList.push( num )
            }
        }
        this.additionalHerosJourneyChoices.push(
            tableList
        )

    }

    public export(): IChargenFramework {
        let rv: IChargenFramework = super.export() as IChargenFramework;

        rv.modified = this.modified;
        rv.bonuses = this.bonuses;
        rv.complications = this.complications;
        rv.starting_cyberware = this.startingCyberware;
        rv.starting_equipment = this.startingEquipment;
        rv.starting_equipment_instructions = this.startingEquipmentInstructions;
        rv.heros_journey_choices = this.herosJourneyChoices;
        rv.starting_wealth = this.startingWealth;
        rv.tables = [];
        rv.counts_as_other = this.countsAsOther;
        rv.starting_wealth_text = this.startingWealthText;

        for( let table of this.tables ) {
            rv.tables.push( table.export() );
        }

        rv = cleanUpReturnValue(rv);

        return rv;

    }

    public exportData(): IFrameworkSelection {
        let rv: IFrameworkSelection = {
            frameworkID: this.id,
            frameworkDef: null,
            herosJourneyTableSelections: this.herosJourneyTableSelections,
            herosJourneyTableItemSelections: this.herosJourneyTableItemSelections,
            herosJourneyTableItemCompletions: this.herosJourneyTableItemCompletions,
            herosJourneyTableItemSubChoices: this.herosJourneyTableItemSubChoices,
            herosJourneyTableItemSpecifications: this.herosJourneyTableItemSpecifications,
            equipmentSelections: this.equipmentSelections,
            startingWealthOverride: this.startingWealthOverride,
            bonusSelections: this.bonusSelections,
            complicationSelections: this.complicationSelections,
            modified: false,
        }

        if( this.modified ) {
            rv.modified = true;
        }
        if( this.is_custom ) {
            rv.frameworkDef = this.export();
        }

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    public setData( data: IFrameworkSelection ) {
        if( data.equipmentSelections )
            this.equipmentSelections = data.equipmentSelections;
        if( data.herosJourneyTableSelections )
            this.herosJourneyTableSelections = data.herosJourneyTableSelections;
        if( data.herosJourneyTableItemSelections)
            this.herosJourneyTableItemSelections = data.herosJourneyTableItemSelections;
        if( data.herosJourneyTableItemSubChoices)
            this.herosJourneyTableItemSubChoices = data.herosJourneyTableItemSubChoices;
        if( data.herosJourneyTableItemCompletions)
            this.herosJourneyTableItemCompletions = data.herosJourneyTableItemCompletions;
        if( data.herosJourneyTableItemSpecifications )
            this.herosJourneyTableItemSpecifications = data.herosJourneyTableItemSpecifications;

        if( data.startingWealthOverride )
            this.startingWealthOverride = data.startingWealthOverride;

        if( data.bonusSelections ) {
            this.bonusSelections = data.bonusSelections;
        }

        if( data.complicationSelections ) {
            this.complicationSelections = data.complicationSelections;
        }

        while( this.equipmentSelections.length < this.startingEquipment.length ) {
            this.equipmentSelections.push( -1 )
        }
        this.modified = true;
    }

    public getStartingWealth( startingWealth: number ): number {

        if( this.startingWealthText.trim() ) {
            startingWealth = this.startingWealthOverride;
        } else {
            if( this.startingWealth > 0  ) {
                startingWealth = this.startingWealth;
            }
        }

        return startingWealth;
    }

    public preCalc( charObj: PlayerCharacter | null = null ) {
        if( !charObj ) {
            charObj = this._char
        }
        if( !charObj )
            return;

        let precalcTags: string[] = ["power_point_edge_multiplier", "new_powers_edge_bonus"];

        for( let bonusCount = 0; bonusCount < this.bonuses.length; bonusCount++ ) {
            let item = this.bonuses[bonusCount];
            let effects: string[] = [];
            if( item ) {
                let foundEffectCount = 0;
                for( let effectCount = 0; effectCount < item.effects.length; effectCount++ ) {
                    let effect = item.effects[effectCount];
                    let itemValues: string[] = [];
                    if( this.bonusSelections.length > bonusCount && this.bonusSelections[bonusCount] ) {
                        try {
                            itemValues = JSON.parse(this.bonusSelections[bonusCount] );
                        }
                        catch {
                            itemValues = [];
                        }
                    }

                    let effectSplit = split_by_max_two( effect, ":");

                    if( effectSplit.length > 1 ) {
                        if( effectSplit[1].trim().toLowerCase().indexOf("[select_edge") > -1 )  {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_edge") > -1 )  {

                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[select_skill") > -1 )  {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_skill") > -1 )  {

                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        }

                    }

                    for( let preCalc of precalcTags) {
                        if( effect.toLowerCase().trim().indexOf( preCalc.toLowerCase().trim())  === 0 ) {
                            // effect = replaceSkillBoostWithSetSkill(effect);
                            effects.push( effect );
                        }
                    }
                }
            }

            ApplyCharacterEffects( effects, charObj, "Framework Precalc", null, null, null, true)

        }

    }

    public apply(
        charObj: PlayerCharacter | null = null
    ) {
        if( this._hasBeenApplied ) {
            console.warn( this.name + " has already been applied, skipping");
            return;
        }

        this._hasBeenApplied = true;

        if( !charObj ) {
            charObj = this._char
        }
        if( !charObj )
            return;

        for( let bonusCount = 0; bonusCount < this.bonuses.length; bonusCount++ ) {
            let item = this.bonuses[bonusCount];
            let effects: string[] = [];
            if( item && item.rank <= charObj.getCurrentRank() ) {

                let foundEffectCount = 0;
                for( let effectCount = 0; effectCount < item.effects.length; effectCount++ ) {
                    let effect = item.effects[effectCount];
                    let itemValues: string[] = [];
                    if( this.bonusSelections.length > bonusCount && this.bonusSelections[bonusCount] ) {
                        try {
                            itemValues = JSON.parse(this.bonusSelections[bonusCount] );
                        }
                        catch {
                            itemValues = [];
                        }
                    }

                    let effectSplit = split_by_max_two( effect, ":");

                    if( effectSplit.length > 1 ) {
                        if( effectSplit[1].trim().toLowerCase().indexOf("[select_edge") > -1 )  {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_edge") > -1 )  {

                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[select_skill") > -1 )  {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_skill") > -1 )  {

                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);

                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("|") > -1 ) {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + itemValues[foundEffectCount];
                                // let effectParse = getSelectItemsFromEffect( effect );
                                // effect = effectParse.action + ":" + itemValues[0] + " " + effectParse.value;
                                foundEffectCount++;
                            }
                        }

                        if( effectSplit.length > 2 ) {

                        }
                    }

                    if(
                        itemValues.length > 0
                            &&
                        itemValues[0]
                            &&
                        effect.toLowerCase().trim().startsWith("effect_choice:")
                    ) {
                        effect = itemValues[bonusCount]
                    }
                    // effect = replaceSkillBoostWithSetSkill(effect);
                    effects.push( effect );
                }
            }

            let applyImmediately = true;

            for( let effect of effects ) {

                if( effect.toLowerCase().indexOf("zero_new_power") === - 1)
                    applyImmediately = false;
                else if( effect.toLowerCase().indexOf("zero_newpower") === - 1)
                    applyImmediately = false;
                else if( effect.toLowerCase().indexOf("zeronewpower") === - 1)
                    applyImmediately = false;
                else if( effect.toLowerCase().indexOf("power points") === - 1)
                    applyImmediately = false;
                else if( effect.toLowerCase().indexOf("new_power") === - 1)
                    applyImmediately = false;
                else if( effect.toLowerCase().indexOf("new_powers") === - 1)
                    applyImmediately = false;
                else if( effect.toLowerCase().indexOf("newpower") === - 1)
                    applyImmediately = false;

                else if( effect.toLowerCase().indexOf("add_edge") === - 1)
                    applyImmediately = false;
                else if( effect.toLowerCase().indexOf("edge_add") === - 1)
                    applyImmediately = false;

            }

            // console.log("effects 777", effects, applyImmediately)
            ApplyCharacterEffects( effects, charObj, "Framework Bonus", null, null, null, applyImmediately)

            // let _addedEdgeOptionCount: { [index: string]: number } = {}
            // for( let edge of charObj._edgesAdded ) {
            //     if( charObj._addedEdgeOptions[edge.name] ) {
            //         if( !_addedEdgeOptionCount[ edge.name] ) {
            //             _addedEdgeOptionCount[ edge.name] = 0;
            //         }
            //         if( charObj._addedEdgeOptions[edge.name][ _addedEdgeOptionCount[ edge.name] ] ) {
            //             console.log("ae io ", edge.name, charObj._addedEdgeOptions[edge.name][ _addedEdgeOptionCount[ edge.name] ] )
            //             edge.importOptions( charObj._addedEdgeOptions[edge.name][ _addedEdgeOptionCount[ edge.name] ] );
            //             _addedEdgeOptionCount[ edge.name]++;
            //         }

            //     }
            // }
        }

        for( let complicationCount = 0; complicationCount < this.complications.length; complicationCount++ ) {
            let item = this.complications[complicationCount];
            let effects: string[] = [];
            if( item && item.rank <= charObj.getCurrentRank() ) {
                let foundEffectCount = 0;
                for( let effectCount = 0; effectCount < item.effects.length; effectCount++ ) {
                    let effect = item.effects[effectCount];
                    let itemValues: string[] = [];
                    if( this.complicationSelections.length > complicationCount && this.complicationSelections[complicationCount] ) {
                        try {
                            itemValues = JSON.parse(this.complicationSelections[complicationCount] );
                        }
                        catch {
                            itemValues = [];
                        }
                    }

                    let effectSplit = split_by_max_two( effect, ":");

                    if( effectSplit.length > 1 ) {
                        if( effectSplit[1].trim().toLowerCase().indexOf("[select_edge") > -1 )  {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_edge") > -1 )  {

                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[select_skill") > -1 )  {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_skill") > -1 )  {

                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                foundEffectCount++;
                            }
                        } else if( effectSplit[1].trim().toLowerCase().indexOf("|") > -1 ) {
                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                effect = effectSplit[0] + ":" + itemValues[foundEffectCount];
                                foundEffectCount++;
                            }
                        }

                    }

                    if(
                        itemValues.length > 0
                            &&
                        itemValues[0]
                            &&
                        effect.toLowerCase().trim().startsWith("effect_choice:")
                    ) {
                        effect = itemValues[0]
                    }

                    if(
                        itemValues.length > 0
                            &&
                        itemValues[0]
                            &&
                        effect.indexOf("|") > -1
                    ) {
                        // let split  = split_by_max_two( effect, ":");
                        // effect = split[0] + ":" + itemValues[0];
                        let effectParse = getSelectItemsFromEffect( effect );
                        effect = effectParse.action + ":" + itemValues[0] + " " + effectParse.value;
                    }

                    // effect = replaceSkillBoostWithSetSkill(effect);
                    effects.push( effect );
                }
            }

            ApplyCharacterEffects( effects, charObj, "Framework Complication", null, null, null, true)
        }

        let foundSpecificationCount = 0;
        let hjChoices = this.getHeroesJourneyChoices();

        // console.log("hjChoices", hjChoices)
        for( let choiceIndex = 0; choiceIndex < hjChoices.length; choiceIndex ++ ) {
            foundSpecificationCount = choiceIndex;
            let hj = hjChoices[choiceIndex];
            let tableID = -1;
            if( hj && hj.length > 1 ) {
                if( this.herosJourneyTableSelections.length > choiceIndex && this.herosJourneyTableSelections[choiceIndex] > 0 ) {
                    tableID = this.herosJourneyTableSelections[choiceIndex];

                }
            } else {
                if( hj && hj.length > 0 )
                    tableID = hj[0];

            }

            let lineSelection = -1;
            if( this.herosJourneyTableItemSelections.length > choiceIndex && this.herosJourneyTableItemSelections[choiceIndex] > -1) {
                lineSelection = this.herosJourneyTableItemSelections[choiceIndex];
            }

            for( let table of charObj.getAvailableData().tables ) {
                if( table.id == tableID ) {

                    if(
                        lineSelection > -1
                        && table.lines.length > lineSelection
                        && typeof(table.lines[lineSelection]) != "undefined"
                        && table.lines[lineSelection].effects.length > 0
                    ) {

                        let item = table.lines[lineSelection];
                        let effects: string[] = [];
                        if( item ) {

                            for( let effectCount = 0; effectCount < item.effects.length; effectCount++ ) {
                                let effect = item.effects[effectCount];

                                // console.log("effect1", effect);
                                let itemValues: string[] = [];

                                try {
                                    itemValues = this.herosJourneyTableItemSpecifications;
                                }
                                catch {
                                    itemValues = [];
                                }

                                let theValue = "";
                                if( itemValues[choiceIndex] && itemValues[choiceIndex].startsWith("[")) {
                                    try {
                                        let arrVal = JSON.parse(itemValues[choiceIndex]);
                                        foundSpecificationCount++;
                                        if( arrVal && arrVal.length > effectCount ) {
                                            theValue = arrVal[effectCount];
                                        } else {
                                            theValue = arrVal[0];
                                        }
                                    }
                                    catch {

                                    }
                                } else {
                                    if( itemValues[choiceIndex] ) {
                                        theValue = itemValues[choiceIndex];
                                        foundSpecificationCount++;
                                    }
                                }

                                if(!theValue)
                                    theValue = "";

                                if( theValue && theValue.startsWith("[")) {
                                    try {
                                        let arrVal = JSON.parse(theValue);
                                        if( arrVal && arrVal.length > effectCount ) {
                                            theValue = arrVal[effectCount];
                                        } else {
                                            theValue = arrVal[0];
                                        }
                                    }
                                    catch {

                                    }
                                }

                                let effectSplit = split_by_max_two( effect, ":");

                                if( theValue && effectSplit.length > 1 ) {
                                    if( effectSplit[1].trim().toLowerCase().indexOf("[select_") > -1 )  {
                                        effect = effectSplit[0] + ":" + theValue;
                                            // foundSpecificationCount++;

                                    } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_") > -1 )  {

                                        effect = effectSplit[0] + ":" + theValue;

                                    } else {
                                        if(
                                            effectSplit[1].toLowerCase().indexOf("|") > -1
                                        ) {

                                            let effectParse = getSelectItemsFromEffect( effect );
                                            effect = effectParse.action + ":" + theValue + " " + effectParse.value;

                                        }
                                    }

                                }

                                // console.log("effect1.2", effect);

                                effect = effect.replace("[specify]",theValue );
                                // effect = replaceSkillBoostWithSetSkill(effect);

                                // console.log("effect1.3", effect, effectSplit.length );
                                if( effectSplit.length > 1 ) {
                                    if( effectSplit[1].trim().indexOf(" ") > -1) {
                                        let es2 = effectSplit[1].trim().split(" ");
                                        if( es2.length > 1 && +es2[1] > 1 && effect.indexOf(" " + es2[1]) === -1)
                                            effect += effects + " " + es2[1]
                                    }
                                }

                                // console.log("effectSplit", effectSplit);
                                // console.log("effect2", effect);

                                effects.push( effect );
                            }
                            // console.log("effects XX",effects)

                            let applyImmediately = true;
                            for( let effect of effects ) {
                                if( effect.toLowerCase().indexOf("power points") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("new_power") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("new_powers") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("newpower") === - 1)
                                    applyImmediately = false;

                                if( effect.toLowerCase().indexOf("add_edge") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("edge_add") === - 1)
                                    applyImmediately = false;

                            }
                            ApplyCharacterEffects( effects, charObj, "Hero's Journey", null, null, null, applyImmediately)

                        }

                        // ApplyCharacterEffects( table.lines[lineSelection].effects, charObj);
                        if( table.lines[lineSelection].choices && table.lines[lineSelection].choices.length > 0 ) {
                            let selectedChoice = 0;
                            if( this.herosJourneyTableItemSubChoices.length > choiceIndex && this.herosJourneyTableItemSubChoices[choiceIndex] > 0) {
                                selectedChoice = this.herosJourneyTableItemSubChoices[choiceIndex]
                            }

                            if(  table.lines[lineSelection].choices[selectedChoice].effects.length > 0  ) {
                                if( table.lines[lineSelection].choices.length > selectedChoice && table.lines[lineSelection].choices[selectedChoice]) {

                                    let filteredEffects: string[] = [];
                                    let effectCount = 0;
                                    for( let effect of table.lines[lineSelection].choices[selectedChoice].effects ) {
                                        if( effect.trim() ) {
                                            if( effect.indexOf("|") > 0 ) {
                                                if( effect.indexOf(":") > 0 ) {
                                                    let split = split_by_max_two( effect, ":");

                                                    let selectedValue = this.herosJourneyTableItemSpecifications.length > choiceIndex ? this.herosJourneyTableItemSpecifications[choiceIndex] : split[2];

                                                    selectedValue = selectedValue.replace("[specify]", selectedValue );
                                                    let orig = selectedValue;
                                                    if( selectedValue.startsWith("[")) {
                                                        try {
                                                            let arrVal = JSON.parse(selectedValue);
                                                            if( arrVal && arrVal.length > effectCount ) {
                                                                selectedValue = arrVal[effectCount];
                                                            } else {
                                                                selectedValue = arrVal[0];
                                                            }
                                                        }
                                                        catch {

                                                        }
                                                    }

                                                    if( selectedValue && typeof(selectedValue) == "object") {
                                                        //@ts-ignore
                                                        selectedValue = selectedValue[effectCount];
                                                    }

                                                    let effectParse = getSelectItemsFromEffect( effect );
                                                    filteredEffects.push( effectParse.action + ":" + selectedValue + " " + effectParse.value);
                                                }
                                            } else {
                                                filteredEffects.push( effect );
                                            }
                                            effectCount++;
                                        }
                                    }

                            let applyImmediately = true;
                            for( let effect of filteredEffects ) {
                                if( effect.toLowerCase().indexOf("power points") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("new_power") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("new_powers") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("newpower") === - 1)
                                    applyImmediately = false;

                                if( effect.toLowerCase().indexOf("add_edge") === - 1)
                                    applyImmediately = false;
                                if( effect.toLowerCase().indexOf("edge_add") === - 1)
                                    applyImmediately = false;

                            }
                                    // console.log("effects XY",effects)
                                    ApplyCharacterEffects( filteredEffects, charObj, "Hero's Journey", null, null, null, applyImmediately);
                                }

                            }
                        }
                    }

                }
            }
        }

        let foundEffectCount = 0;

        for( let extraChoiceIndex =  0; extraChoiceIndex < this.getExtraHJChoices().length; extraChoiceIndex ++ ) {

            let choiceIndex = extraChoiceIndex + hjChoices.length;
            let hj = this.getExtraHJChoices()[extraChoiceIndex];
            let tableID = -1;
            if( hj && hj.length > 1 ) {
                if( this.herosJourneyTableSelections.length > choiceIndex && this.herosJourneyTableSelections[choiceIndex] > 0 ) {
                    tableID = this.herosJourneyTableSelections[choiceIndex];

                }
            } else {
                if( hj && hj.length > 0 )
                    tableID = hj[0];

            }

            let lineSelection = -1;
            if( this.herosJourneyTableItemSelections.length > choiceIndex && this.herosJourneyTableItemSelections[choiceIndex] > -1) {
                lineSelection = this.herosJourneyTableItemSelections[choiceIndex];
            }

            for( let table of charObj.getAvailableData().tables ) {
                if( table.id == tableID ) {

                    if(  lineSelection > -1 && table.lines.length > lineSelection && typeof(table.lines[lineSelection]) != "undefined" && table.lines[lineSelection].effects.length > 0 ) {

                        let item = table.lines[lineSelection];
                        let effects: string[] = [];
                        if( item ) {

                            for( let effectCount = 0; effectCount < item.effects.length; effectCount++ ) {
                                let effect = item.effects[effectCount];
                                let itemValues: string[] = [];

                                try {
                                    itemValues = this.herosJourneyTableItemSpecifications;
                                }
                                catch {
                                    itemValues = [];
                                }

                                let effectSplit = split_by_max_two( effect, ":");

                                if( effectSplit.length > 1 ) {
                                    if( effectSplit[1].trim().toLowerCase().indexOf("[select_") > -1 )  {
                                        if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                            effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                            foundEffectCount++;
                                        }
                                    } else if( effectSplit[1].trim().toLowerCase().indexOf("[choose_") > -1 )  {

                                        if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                            effect = effectSplit[0] + ":" + effectSplit[1].replace(/\[(.+?)\]/g, itemValues[foundEffectCount]);
                                            foundEffectCount++;
                                        }
                                    } else {
                                        if(
                                            effectSplit[1].toLowerCase().indexOf("|") > -1
                                        ) {
                                            if( itemValues.length > foundEffectCount && itemValues[foundEffectCount] && itemValues[foundEffectCount].trim() ) {
                                                effect = effectSplit[0] + ":" + itemValues[foundEffectCount];
                                                foundEffectCount++;
                                            }
                                        }
                                    }

                                }
                                if( effectSplit.length > 1 ) {
                                    if( effectSplit[1].trim().indexOf(" ") > -1) {
                                        let es2 = effectSplit[1].trim().split(" ");
                                        if( es2.length > 1 && +es2[1] > 1)
                                            effect += effects + " " + es2[1]
                                    }
                                }
                                // effect = replaceSkillBoostWithSetSkill(effect);
                                effects.push( effect );
                            }

                            ApplyCharacterEffects( effects, charObj, "Hero's Journey", null, null, null, true)

                        }

                        // ApplyCharacterEffects( table.lines[lineSelection].effects, charObj);
                        if( table.lines[lineSelection].choices && table.lines[lineSelection].choices.length > 0 ) {
                            let selectedChoice = 0;
                            if( this.herosJourneyTableItemSubChoices.length > choiceIndex && this.herosJourneyTableItemSubChoices[choiceIndex] > 0) {
                                selectedChoice = this.herosJourneyTableItemSubChoices[choiceIndex]
                            }

                            if(  table.lines[lineSelection].choices[selectedChoice].effects.length > 0  ) {
                                if( table.lines[lineSelection].choices.length > selectedChoice && table.lines[lineSelection].choices[selectedChoice])

                                    ApplyCharacterEffects( table.lines[lineSelection].choices[selectedChoice].effects, charObj, "Hero's Journey", null, null, null, true);
                            }
                        }
                    }

                }
            }

        }

    }

    public getName(): string {
        return this.name;
    }

    public getEffectValidity(): IEffectVailidtyResults {
        let rv: IEffectVailidtyResults = {
            total: 0,
            good: 0,
            valid: true,
            messages: [],
        }

        return rv;
    }

    public getSpecialAbilityList(): ISpecialAbilityItem[] {
        let rv: ISpecialAbilityItem[] = [];

        if( !this._char )
            return [];

        for( let bonusCount = 0; bonusCount < this.bonuses.length; bonusCount++ ) {
            let item = this.bonuses[bonusCount];
            let itemDescription = item.description.trim();
            let chosenItems: string[] = [];
            if( item ) {
                for( let effectCount = 0; effectCount < item.effects.length; effectCount++ ) {
                    let effect = item.effects[effectCount];
                    let itemValues: string[] = [];
                    if( this.bonusSelections.length > bonusCount && this.bonusSelections[bonusCount] ) {
                        try {
                            itemValues = JSON.parse(this.bonusSelections[bonusCount] );
                        }
                        catch {
                            itemValues = [];
                        }
                    }
                    if( effect.trim() ) {
                        let effectSplit = effect.split(":");

                        if( effectSplit.length > 1 ) {
                            if( effectSplit[1].toLowerCase().indexOf("[select_edge") > -1 )  {
                                if( itemValues.length > effectCount && itemValues[effectCount] && itemValues[effectCount].trim() ) {
                                    chosenItems.push( itemValues[effectCount])
                                }
                            } else if( effectSplit[1].toLowerCase().indexOf("[choose_edge") > -1 )  {

                                if( itemValues.length > effectCount && itemValues[effectCount] && itemValues[effectCount].trim() ) {
                                    chosenItems.push( itemValues[effectCount])
                                }
                            }

                        }
                        if( effectSplit.length > 1 ) {
                            if( effectSplit[1].toLowerCase().indexOf("[select_skill") > -1 )  {
                                if( itemValues.length > effectCount && itemValues[effectCount] && itemValues[effectCount].trim() ) {
                                    chosenItems.push( itemValues[effectCount])
                                }
                            } else if( effectSplit[1].toLowerCase().indexOf("[choose_skill") > -1 )  {

                                if( itemValues.length > effectCount && itemValues[effectCount] && itemValues[effectCount].trim() ) {
                                    chosenItems.push( itemValues[effectCount])
                                }
                            }

                        }
                    }

            }

        }
        if( item.name.trim() ) {
            if(chosenItems.length > 0 ) {
                itemDescription += " " + chosenItems.join(", ");
            }
            rv.push( {
                name: item.name,
                summary: itemDescription,
                specify: "",
                specifyValue: "",
                specifyLimit: [],
                selectItems: [],
                positive: true,
                from: "Framework",
                alternate_options: [],
                book_name: this.book_obj.shortName,
                page: this.book_page,
                book_id: this.book_id,
                custom: this.book_id > 0 ? true : false,
            } );
        }
    }

        for( let item of this.complications ) {
            if( item.name.trim() )
                rv.push( {
                    name: item.name,
                    summary: item.description.trim(),
                    specify: "",
                    specifyValue: "",
                    alternate_options: [],
                    specifyLimit: [],
                    selectItems: [],
                    positive: false,
                    from: "Framework",
                    book_name: this.book_obj.shortName,
                    page: this.book_page,
                    book_id: this.book_id,
                    custom: this.book_id > 0 ? true : false,
                } );
        }

        let hjChoices = this.herosJourneyChoices;
        for( let choiceIndex = 0; choiceIndex < hjChoices.length; choiceIndex ++ ) {

            let hj = hjChoices[choiceIndex];
            let tableID = -1;
            if( hj && hj.length > 1 ) {
                if( this.herosJourneyTableSelections.length > choiceIndex && this.herosJourneyTableSelections[choiceIndex] > 0 ) {
                    tableID = this.herosJourneyTableSelections[choiceIndex];

                }
            } else {
                if( hj && hj.length > 0 )
                    tableID = hj[0];

            }

            let lineSelection = -1;
            if( this.herosJourneyTableItemSelections.length > choiceIndex && this.herosJourneyTableItemSelections[choiceIndex] > -1) {
                lineSelection = this.herosJourneyTableItemSelections[choiceIndex];
            }

            for( let table of this._char.getAvailableData().tables ) {
                if( table.id == tableID ) {
                    if( lineSelection > -1 && table.lines.length > lineSelection ) {
                        // Base Table Choice Ability
                        if( table.lines[lineSelection].abilityLine && table.lines[lineSelection].abilityLine.trim() ) {
                            if(
                                table.lines.length > lineSelection
                                && typeof(table.lines[lineSelection]) != "undefined"
                                && table.lines[lineSelection].abilityLine.trim()
                            ) {

                                let specify: string = "";

                                let itemName = table.lines[lineSelection].name;

                                if( table.lines[lineSelection].specify && this.herosJourneyTableItemSpecifications.length && this.herosJourneyTableItemSpecifications[choiceIndex] ) {
                                    specify = this.herosJourneyTableItemSpecifications[choiceIndex];
                                    itemName = itemName + ": " + specify;
                                }

                                if( itemName ) {

                                    if( !table.book_def && table.book_id ) {
                                        for( let book of this._char._availableData.books ) {
                                            if( book.id == table.book_id ) {
                                                table.book_def = book;
                                                break;
                                            }
                                        }
                                    }

                                    rv.push( {
                                        name: itemName + " (Hero's Journey)",
                                        summary: table.lines[lineSelection].abilityLine.trim(),
                                        specify: "",
                                        specifyValue: "",
                                        specifyLimit: [],
                                        selectItems: [],
                                        positive: true,
                                        alternate_options: [],
                                        from: "HJ Roll",
                                        book_name: table.book_def ? table.book_def.short_name : "n/a",
                                        page: table.book_page,
                                        book_id: table.book_id,
                                        custom: this.book_id > 0 ? true : false,
                                    } );
                                }
                            }
                        }

                        // Selected Choice Ability
                        if( table.lines[lineSelection].choices && table.lines[lineSelection].choices.length > 0 ) {
                            let selectedChoice = 0;
                            if( this.herosJourneyTableItemSubChoices.length > choiceIndex && this.herosJourneyTableItemSubChoices[choiceIndex] > 0) {
                                selectedChoice = this.herosJourneyTableItemSubChoices[choiceIndex]
                            }

                            if(
                                table.lines.length > lineSelection
                                && typeof(table.lines[lineSelection]) != "undefined"
                                && table.lines[lineSelection].choices[selectedChoice].abilityLine.trim()
                            ) {
                                let specify: string = "";

                                let itemName = table.lines[lineSelection].choices[selectedChoice].name;
                                if( table.lines[lineSelection].choices[selectedChoice].specify && this.herosJourneyTableItemSpecifications.length && this.herosJourneyTableItemSpecifications[choiceIndex] ) {
                                    specify = this.herosJourneyTableItemSpecifications[choiceIndex];
                                    itemName = itemName + ": " + specify;
                                }
                                if( itemName )
                                    rv.push( {
                                        name: itemName + " (Hero's Journey)",
                                        summary: table.lines[lineSelection].choices[selectedChoice].abilityLine.trim(),
                                        specify: "",
                                        alternate_options: [],
                                        specifyValue: "",
                                        specifyLimit: [],
                                        selectItems: [],
                                        positive: true,
                                        from: "HJ Roll",
                                        book_name: table.book_def ? table.book_def.short_name : "",
                                        page: table.book_page,
                                        book_id: table.book_id,
                                        custom: this.book_id > 0 ? true : false,
                                    } );
                            }
                        }
                    }

                }
            }
        }

        return rv;
    }

    getFrameworkType(): string {
        if( this._char && this._char.setting && this._char.setting.settingIsEnabled("rifts_mdc") ) {
            return "Iconic ";
        }
        return "";
    }

    setComplicationChoice(
        complicationSelectionLine: number,
        subIndex: number,
        stringChoice: string,
    ) {
        while( this.complicationSelections.length <= complicationSelectionLine ) {
            this.complicationSelections.push("[]");
        }

        if( this.complicationSelections[complicationSelectionLine] ) {
            this.modified = true;
            const existingData = this.complicationSelections[complicationSelectionLine];
            let parseValue: string[] = [];
            
            // Only parse if it's actually a JSON string (starts with [ or {)
            if (existingData && (existingData.startsWith('[') || existingData.startsWith('{'))) {
                try {
                    parseValue = JSON.parse(existingData);
                    // Ensure parseValue is an array
                    if (!Array.isArray(parseValue)) {
                        parseValue = [];
                    }
                } catch {
                    parseValue = [];
                }
            } else {
                parseValue = [];
            }
            
            while( parseValue.length <= subIndex ) {
                parseValue.push("");
            }
            parseValue[subIndex] = stringChoice;
            this.complicationSelections[complicationSelectionLine] = JSON.stringify(parseValue);
        }
    }

    setBonusChoice(
        bonusSelectionLine: number,
        subIndex: number,
        stringChoice: string,
    ) {
        while( this.bonusSelections.length <= bonusSelectionLine ) {
            this.bonusSelections.push("[]");
        }

        if( this.bonusSelections[bonusSelectionLine] ) {
            this.modified = true;
            const existingData = this.bonusSelections[bonusSelectionLine];
            let parseValue: string[] = [];
            
            // Only parse if it's actually a JSON string (starts with [ or {)
            if (existingData && (existingData.startsWith('[') || existingData.startsWith('{'))) {
                try {
                    parseValue = JSON.parse(existingData);
                    // Ensure parseValue is an array
                    if (!Array.isArray(parseValue)) {
                        parseValue = [];
                    }
                } catch {
                    parseValue = [];
                }
            } else {
                parseValue = [];
            }
            
            while( parseValue.length <= subIndex ) {
                parseValue.push("");
            }
            parseValue[subIndex] = stringChoice;
            this.bonusSelections[bonusSelectionLine] = JSON.stringify(parseValue);
        }
    }

    makeEquipmentPackageChoice( equipmentLine: number, stringChoice: number ) {
        if(!this._char)
            return;
        if( this.startingEquipment.length > equipmentLine && this.startingEquipment[equipmentLine]) {
            this.modified = true;
            while( this.equipmentSelections.length < equipmentLine ) {
                this.equipmentSelections.push( -1 )
            }
            let currentSelection = this.equipmentSelections[ equipmentLine ];
            this.equipmentSelections[ equipmentLine ] = stringChoice;

            let items = this.startingEquipment[equipmentLine].split("|")

            let equipName = "";
            if( stringChoice > -1 && items.length > stringChoice) {
                equipName = items[stringChoice];
            }
            equipName = removeSpecialCharacters(equipName);

            if( currentSelection != stringChoice ) {

                // remove old selected item
                if( currentSelection > -1 && items.length > currentSelection) {
                    let otherItem = items[currentSelection];
                    otherItem = removeSpecialCharacters(otherItem);
                    let removedItem = false;
                    if( !removedItem )
                        for( let itemIndex = this._char._gearPurchased.length -1; itemIndex >= 0; itemIndex-- ) {
                            if(
                                this._char._gearPurchased[itemIndex].frameworkItem
                                    &&
                                // removeSpecialCharacters(this._char._gearPurchased[itemIndex].name).toLowerCase().trim().startsWith( otherItem.toLowerCase().trim() )
                                stringsAreCloseEnough( this._char._gearPurchased[itemIndex].name, otherItem )
                            ) {
                                this._char._gearPurchased.splice( +itemIndex, 1 );
                                removedItem = true;
                                break;
                            }
                        }

                    if( !removedItem )
                        for( let itemIndex = this._char._weaponsPurchased.length -1; itemIndex >= 0; itemIndex-- ) {
                            if(
                                this._char._weaponsPurchased[itemIndex].frameworkItem
                                &&
                                // removeSpecialCharacters(this._char._weaponsPurchased[itemIndex].name).toLowerCase().trim().startsWith( otherItem.toLowerCase().trim() )
                                stringsAreCloseEnough( this._char._weaponsPurchased[itemIndex].name, otherItem )
                            ) {
                                this._char._weaponsPurchased.splice( +itemIndex, 1 );
                                removedItem = true;
                                break;
                            }
                        }

                    if( !removedItem )
                        for( let itemIndex = this._char._armorPurchased.length -1; itemIndex >= 0; itemIndex-- ) {
                            if(
                                this._char._armorPurchased[itemIndex].frameworkItem
                                    &&
                                // removeSpecialCharacters(this._char._armorPurchased[itemIndex].name).toLowerCase().trim().startsWith( otherItem.toLowerCase().trim() )
                                stringsAreCloseEnough( this._char._armorPurchased[itemIndex].name, otherItem )
                            ) {
                                this._char._armorPurchased.splice( +itemIndex, 1 );
                                removedItem = true;
                                break;
                            }
                        }

                    if( !removedItem )
                        for( let itemIndex = this._char._cyberwarePurchased.length -1; itemIndex >= 0; itemIndex-- ) {
                            if(
                                this._char._cyberwarePurchased[itemIndex].frameworkItem
                                    &&
                                // removeSpecialCharacters(this._char._cyberwarePurchased[itemIndex].name).toLowerCase().trim().startsWith( otherItem.toLowerCase().trim() )
                                stringsAreCloseEnough( this._char._cyberwarePurchased[itemIndex].name, otherItem )
                            ) {
                                this._char._cyberwarePurchased.splice( +itemIndex, 1 );
                                removedItem = true;
                                break;
                            }
                        }

                }

                // install newly selected item
                if( equipName ) {
                    let gotInstalled = false;
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().gear ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.LEGACYPurchaseGear(
                                    item.id,
                                    item,
                                    0,
                                    false,
                                    false,
                                    1,
                                    [],
                                    false,
                                    false,
                                    false,
                                    true,
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }

                    // try weapons
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().weapons ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.LEGACYPurchaseWeapon(
                                    item.id,
                                    item,
                                    0,
                                    false,
                                    false,
                                    1,
                                    "",
                                    "",
                                    false,
                                    true,
                                    null
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }
                    // try armor
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().armor ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.LEGACYPurchaseArmor(
                                    item.id,
                                    item,
                                    0,
                                    false,
                                    false,
                                    false,
                                    false,
                                    1,
                                    "",
                                    false,
                                    -1,
                                    true,
                                    null,
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }
                    // try cyberware
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().cyberware ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.purchaseCyberware(
                                    item.id,
                                    item,
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    installCyberwarePackage(): string[] {

        let couldNotInstall: string[] = [];
        if(!this._char)
            return ["No character object!"];
        for( let equipName of this.startingCyberware ) {
            let gotInstalled = false;
            equipName = removeSpecialCharacters(equipName);
            if( equipName.trim() ) {
                if( equipName.indexOf("|") < 1 ) {

                    let itemName = equipName;
                    let quantity = 1;
                    if( itemName.indexOf(";") > 1) {
                        let split = itemName.split(";");
                        itemName = split[0].trim();
                        quantity = +split[1];
                    }
                    // try cyberware
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().cyberware ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.purchaseCyberware(
                                    item.id,
                                    item,
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }
                    if( !gotInstalled ) {
                        couldNotInstall.push( equipName);
                    }
                }
            }
        }
        return couldNotInstall;
    }

    installEquipmentPackage(): string[] {
        if(!this._char)
            return ["No character object!"];
        let couldNotInstall: string[] = [];
        for( let equipName of this.startingEquipment ) {
            let gotInstalled = false;
            equipName = removeSpecialCharacters(equipName);
            if( equipName.trim() ) {
                if( equipName.indexOf("|") < 1 ) {
                    // try equipment
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().gear ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.LEGACYPurchaseGear(
                                    item.id,
                                    item,
                                    0,
                                    false,
                                    false,
                                    1,
                                    [],
                                    false,
                                    false,
                                    false,
                                    true,
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }

                    // try weapons
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().weapons ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.LEGACYPurchaseWeapon(
                                    item.id,
                                    item,
                                    0,
                                    false,
                                    false,
                                    1,
                                    "",
                                    "",
                                    false,
                                    true,
                                    null
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }
                    // try armor
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().armor ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                    &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.LEGACYPurchaseArmor(
                                    item.id,
                                    item,
                                    0,
                                    false,
                                    false,
                                    false,
                                    false,
                                    1,
                                    "",
                                    false,
                                    -1,
                                    true,
                                    null,
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }
                    // try cyberware
                    if( !gotInstalled ) {
                        for( let item of this._char.getAvailableData().cyberware ) {
                            if(
                                this._char.setting.book_is_used( item.book_id)
                                &&
                                item.name.trim() && stringsAreCloseEnough( item.name, equipName )
                            ) {
                                this._char.purchaseCyberware(
                                    item.id,
                                    item,
                                );
                                gotInstalled = true;
                                break;
                            }
                        }
                    }
                    if( !gotInstalled ) {
                        couldNotInstall.push( equipName);
                    }
                }
            }
        }
        return couldNotInstall;
    }

    removeEquipmentPackage() {
        if(!this._char)
            return;
        for( let itemIndex = this._char._gearPurchased.length -1; itemIndex >= 0; itemIndex-- ) {
            if( this._char._gearPurchased[itemIndex].frameworkItem ) {
                this._char._gearPurchased.splice( +itemIndex, 1 );
            }
        }

        for( let itemIndex = this._char._weaponsPurchased.length -1; itemIndex >= 0; itemIndex-- ) {
            if( this._char._weaponsPurchased[itemIndex].frameworkItem ) {
                this._char._weaponsPurchased.splice( +itemIndex, 1 );

            }
        }

        for( let itemIndex = this._char._armorPurchased.length -1; itemIndex >= 0; itemIndex-- ) {
            if( this._char._armorPurchased[itemIndex].frameworkItem ) {
                this._char._armorPurchased.splice( +itemIndex, 1 );

            }
        }

        for( let itemIndex = this._char._cyberwarePurchased.length -1; itemIndex >= 0; itemIndex-- ) {
            if( this._char._cyberwarePurchased[itemIndex].frameworkItem ) {
                this._char._cyberwarePurchased.splice( +itemIndex, 1 );
            }
        }

    }

    getExtraHJChoices(): number[][] {
        let returnObject: number[][] = [];
        if( this._char ) {
            for( let hjCount = 0; hjCount < this._char._extraHJRolls; hjCount++) {

                let newArray: number[] = [];
                returnObject.push( newArray );

                for( let table of this._char.getAvailableData().tables ) {
                    if(
                        this._char.setting.book_is_used( table.book_id)
                        &&
                        !table.name.toLowerCase().trim().startsWith("mars fortune ")
                        &&
                        !table.name.toLowerCase().trim().startsWith("narrative ")
                    ) {
                        returnObject[hjCount].push( table.id)
                    }
                }
            }

        }

        return returnObject;
    }

    countsAsNamed( name: string ): boolean {
        if( this.name.toLowerCase().trim() == name.toLowerCase().trim() ) {
            return true;
        }

        for( let countsAs of this.countsAsOther) {
            if( countsAs.toLowerCase().trim() == name.toLowerCase().trim() ) {
                return true;
            }
        }

        return false;
    }
}