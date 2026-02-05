import { IEffectVailidtyResults } from '../../interfaces/IEffectVailidtyResults';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { BaseObject, IBaseObjectExport } from '../_base_object';
import { PlayerCharacter } from "./player_character";

export interface IChargenFrameworkTableDefinition extends IBaseObjectExport{
    lines: ITableLine[];
    die_roll: string;
}

export interface ITableLine  {
    rollFrom: string;
    rollTo: string;
    name: string;
    summary: string;
    instructions: string;
    effects: string[];
    abilityLine: string;
    specify: boolean;
    choices: ITableLine[];
}

export interface ITableSelection {
    tableName: string;
    bookID: number;
    roll: number;
    completed: boolean;
    specify: string;
    selectedData: string;
}

export class ChargenFrameworkTable extends BaseObject {

    public lines: ITableLine[];
    public dieRoll: string = "d20";
    public tableSelection: null | ITableSelection;

    constructor(
        frameworkDef: IChargenFrameworkTableDefinition,
        characterObject: PlayerCharacter,

    ) {
        super(frameworkDef, characterObject);
        this._char = characterObject;
        this.import( frameworkDef )
    }

    public reset() {
        super.reset()
        this.lines = [];
    }

    public import(jsonImportObj: IChargenFrameworkTableDefinition) {
        if( jsonImportObj ) {
            super.import( jsonImportObj, this._char ? this._char.getAvailableData().books : [] );

            this.lines = jsonImportObj.lines;

            if( this.lines ) {
                for( let line of this.lines ) {
                    if( line.specify ) {
                        line.specify = true;
                    } else {
                        line.specify = false;
                    }
                }
            } else {
                this.lines = [];
            }

            this.dieRoll = jsonImportObj.die_roll;
        }
    }

    public export(): IChargenFrameworkTableDefinition {
        let rv: IChargenFrameworkTableDefinition = super.export() as IChargenFrameworkTableDefinition;

        rv.lines = this.lines;
        rv.die_roll = this.dieRoll;

        rv = cleanUpReturnValue(rv);
        return rv;
    }

    // public apply( charObj: PlayerCharacter = null ) {
    //     if( !charObj ) {
    //         charObj = this._char
    //     }
    // }

    public getName() {
        return this.name;
    }

    public getEffectValidity(): IEffectVailidtyResults {
        let rv: IEffectVailidtyResults = {
            total: 0,
            good: 0,
            valid: true,
            messages: [],
        }

        for( let line of this.lines ) {
            let validityMessages = ApplyCharacterEffects( line.effects );

            for( let message of validityMessages) {
                rv.total++;
                if( message.good ) {
                    rv.good++;
                } else  {
                    rv.valid = false;
                }
                rv.messages.push( message );
            }
        }

        return rv;
    }

}