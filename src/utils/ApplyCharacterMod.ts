import { PlayerCharacter } from '../classes/player_character/player_character';
import { Edge } from '../classes/player_character/edge';
import { IModLineExport, CharMod } from '../classes/player_character/_char_mod';

export interface ICharModParseResult {
    good: boolean;
    message: string;
    modline: string;
}

export function ApplyCharacterEffects(
    modLines: string[],
    charObj: PlayerCharacter | null = null,
    addedFrom: string = "Character Mod",
    specifyOverride: string | null = null,
    specifyValueOverride: string | null = null,
    callingEdge: Edge | null = null,
    applyImmediately: boolean = false,
) : ICharModParseResult[] {
    let returnResults: ICharModParseResult[] = [];
    // console.log("XX", modLines, addedFrom)
    if( modLines ) {
        for( let modline of modLines) {
            // console.log("XXX", modline)
            modline = modline.trim();
            if( modline && !modline.startsWith("#")) {
                let charMod = new CharMod();
                charMod.applyImmediately = applyImmediately;

                if( modline[0] === "{" ) {
                    let modDef: IModLineExport = JSON.parse( modline );
                    charMod.importDef( modDef );
                } else {
                    charMod.importModLine( modline );
                }
                charMod.addedFrom = addedFrom;
                charMod.callingEdge = callingEdge;
                charMod.specifyOverride = specifyOverride;
                charMod.specifyValueOverride = specifyValueOverride;
                returnResults.push(
                    charMod.apply( charObj )
                );
                // console.log("XXXX", charObj ? charObj.name : "no charobj", charMod.callingEdge ? charMod.callingEdge.name : "not an edge", returnResults)
            }
        }

    }
    return returnResults;
}
