import { IEffectVailidtyResults } from '../../interfaces/IEffectVailidtyResults';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { BaseObject, IBaseObjectExport } from '../_base_object';
import { ISpecialAbilityItem, PlayerCharacter } from "./player_character";

export interface IChargenMonsterFramework extends IBaseObjectExport {
    effects: IMonsterFrameworkEffect[];
    counts_as_other: string[];
    starting_equipment: string[];
    starting_cyberware: string[];
    starting_equipment_instructions: string[];
    starting_wealth_text: string;
    starting_wealth: number;
    modified: boolean;
}

export interface IMonsterFrameworkSelection {
    monsterFrameworkID: number,
    monsterFrameworkDef: IChargenMonsterFramework | null,
    effectSelections: string[];
    equipmentSelections: number[];
    startingWealthOverride: number;
    modified: boolean;
}

export interface IMonsterFrameworkEffect {
    name: string;
    description: string;
    effects: string[];
    specify: string;
    specifyValue: string;
    specifyLimit: string[];
    selectItems: string[];
    rank: number;
}

export class PlayerCharacterMonsterFramework extends BaseObject {

    _hasBeenApplied: boolean = false;

    public effects: IMonsterFrameworkEffect[];
    modified: boolean;

    effectSelections: string[];

    equipmentSelections: number[];

    countsAsOther: string[];

    startingEquipment: string[];
    startingCyberware: string[];
    startingEquipmentInstructions: string[];

    startingWealthText: string = "";
    startingWealthOverride: number = 0;
    startingWealth: number = 0;

    constructor(
        monsterFrameworkDef: IChargenMonsterFramework | null = null,
        characterObject: PlayerCharacter | null ,
    ) {
        super(monsterFrameworkDef, characterObject);
        this._char = characterObject;
        this.import( monsterFrameworkDef )
    }

    calcReset() {
        this._hasBeenApplied = false;
    }

    public reset() {
        super.reset();
        this.modified = false;
        this.startingEquipment = [];
        this.startingCyberware = [];
        this.effectSelections = [];
        this.startingEquipmentInstructions = [];
        this.effects = [];
        this.countsAsOther = [];
        this.equipmentSelections = [];
        this.startingWealthText = "";
        this.startingWealthOverride = 0;
        this.startingWealth = 0;
    }

    public import(jsonImportObj: IChargenMonsterFramework | null ) {
        if( jsonImportObj ) {
            super.import( jsonImportObj, this._char ? this._char.getAvailableData().books : []  );

            if( jsonImportObj.effects )
                this.effects = jsonImportObj.effects;

            if( jsonImportObj.starting_equipment )
                this.startingEquipment = jsonImportObj.starting_equipment;

            if( jsonImportObj.counts_as_other ) {
                this.countsAsOther = jsonImportObj.counts_as_other;
            }

            if( jsonImportObj.starting_equipment_instructions )
                this.startingEquipmentInstructions = jsonImportObj.starting_equipment_instructions;

            if( jsonImportObj.starting_wealth_text )
                this.startingWealthText = jsonImportObj.starting_wealth_text;

            if( jsonImportObj.starting_wealth )
                this.startingWealth = jsonImportObj.starting_wealth;
            if( jsonImportObj.starting_cyberware )
                this.startingCyberware = jsonImportObj.starting_cyberware;

            // Clean up empty strings
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

            for( let item of this.effects ) {
                if( !item.rank ) {
                    item.rank = 0;
                }
            }
        }
    }

    public export(): IChargenMonsterFramework {
        let rv: IChargenMonsterFramework = super.export() as IChargenMonsterFramework;

        rv.modified = this.modified;
        rv.effects = this.effects;
        rv.starting_cyberware = this.startingCyberware;
        rv.starting_equipment = this.startingEquipment;
        rv.starting_equipment_instructions = this.startingEquipmentInstructions;
        rv.starting_wealth = this.startingWealth;
        rv.counts_as_other = this.countsAsOther;
        rv.starting_wealth_text = this.startingWealthText;

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    public exportData(): IMonsterFrameworkSelection {
        let rv: IMonsterFrameworkSelection = {
            monsterFrameworkID: this.id,
            monsterFrameworkDef: null,
            equipmentSelections: this.equipmentSelections,
            startingWealthOverride: this.startingWealthOverride,
            effectSelections: this.effectSelections,
            modified: false,
        }

        if( this.modified ) {
            rv.modified = true;
        }
        if( this.is_custom ) {
            rv.monsterFrameworkDef = this.export();
        }

        rv = cleanUpReturnValue(rv);

        return rv;
    }

    public setData( data: IMonsterFrameworkSelection ) {
        if( data.equipmentSelections )
            this.equipmentSelections = data.equipmentSelections;

        if( data.startingWealthOverride )
            this.startingWealthOverride = data.startingWealthOverride;

        if( data.effectSelections ) {
            this.effectSelections = data.effectSelections;
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

    public apply(
        charObj: PlayerCharacter | null = null
    ) {
        if( this._hasBeenApplied ) {
            console.warn( this.name + " monster framework has already been applied, skipping");
            return;
        }

        this._hasBeenApplied = true;

        if( !charObj ) {
            charObj = this._char
        }
        if( !charObj )
            return;

        for( let effectCount = 0; effectCount < this.effects.length; effectCount++ ) {
            let item = this.effects[effectCount];
            let effects: string[] = [];
            if( item && item.rank <= charObj.getCurrentRank() ) {

                let foundEffectCount = 0;
                for( let subEffectCount = 0; subEffectCount < item.effects.length; subEffectCount++ ) {
                    let effect = item.effects[subEffectCount];
                    let itemValues: string[] = [];
                    if( this.effectSelections.length > effectCount && this.effectSelections[effectCount] ) {
                        try {
                            itemValues = JSON.parse(this.effectSelections[effectCount] );
                        }
                        catch {
                            itemValues = [];
                        }
                    }

                    // Handle selection-based effects
                    let effectSplit = effect.split(":");
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
                        effect = itemValues[effectCount]
                    }

                    effects.push( effect );
                }
            }

            let applyImmediately = true;

            // Check if effects should be delayed
            for( let effect of effects ) {
                if( effect.toLowerCase().indexOf("add_edge") >= 0)
                    applyImmediately = false;
                if( effect.toLowerCase().indexOf("edge_add") >= 0)
                    applyImmediately = false;
                if( effect.toLowerCase().indexOf("new_power") >= 0)
                    applyImmediately = false;
                if( effect.toLowerCase().indexOf("newpower") >= 0)
                    applyImmediately = false;
            }

            ApplyCharacterEffects( effects, charObj, "Monster Framework", null, null, null, applyImmediately)
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

        for( let effectCount = 0; effectCount < this.effects.length; effectCount++ ) {
            let item = this.effects[effectCount];
            let itemDescription = item.description.trim();
            let chosenItems: string[] = [];
            if( item ) {
                for( let subEffectCount = 0; subEffectCount < item.effects.length; subEffectCount++ ) {
                    let effect = item.effects[subEffectCount];
                    let itemValues: string[] = [];
                    if( this.effectSelections.length > effectCount && this.effectSelections[effectCount] ) {
                        try {
                            itemValues = JSON.parse(this.effectSelections[effectCount] );
                        }
                        catch {
                            itemValues = [];
                        }
                    }
                    if( effect.trim() ) {
                        let effectSplit = effect.split(":");

                        if( effectSplit.length > 1 ) {
                            if( effectSplit[1].toLowerCase().indexOf("[select_") > -1 )  {
                                if( itemValues.length > subEffectCount && itemValues[subEffectCount] && itemValues[subEffectCount].trim() ) {
                                    chosenItems.push( itemValues[subEffectCount])
                                }
                            } else if( effectSplit[1].toLowerCase().indexOf("[choose_") > -1 )  {
                                if( itemValues.length > subEffectCount && itemValues[subEffectCount] && itemValues[subEffectCount].trim() ) {
                                    chosenItems.push( itemValues[subEffectCount])
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
                    from: "Monster Framework",
                    alternate_options: [],
                    book_name: this.book_obj.shortName,
                    page: this.book_page,
                    book_id: this.book_id,
                    custom: this.book_id > 0 ? true : false,
                } );
            }
        }

        return rv;
    }

    public setMonsterFrameworkByID(newID: number ) {
        this.is_custom = false;
        this.id = 0;
        if( newID > 0 && this._char ) {
            const monsterFrameworks = this._char.getAvailableData().monster_frameworks;
            if (monsterFrameworks && Array.isArray(monsterFrameworks)) {
                for( let monsterFramework of monsterFrameworks ) {
                    if (
                        this._char.setting.book_is_used(monsterFramework.book_id)
                        &&
                        monsterFramework.id == newID
                    ) {
                        this.import( monsterFramework );
                    }
                }
            }
        }
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