import { PlayerCharacterSetting } from '../classes/player_character/player_character_setting';
import { IChargenPowers } from '../classes/player_character/power';

declare const window: any;

export function FormatMoney(
    amount: number,
    setting: PlayerCharacterSetting | null = null
): string {
    amount = fixFloat(amount);

    let rv = amount.toLocaleString();

    if( rv.toString().indexOf(".") > 0 ) {
        rv = amount.toFixed(2).toString()
    }

    if( !setting ) {
        rv = "$" + rv;
    } else {
        if( setting.wealthSymbolAfterAmount ) {
            rv = rv + setting.wealthSymbol;
        } else {
            rv =  setting.wealthSymbol + rv;
        }

    }

    return rv;
}

export function getPerkLabel( perkTag: string, isSwade: boolean ): string {
    switch( perkTag ) {
        case "de-attribute": {
            return "Raise an Attribute";
        }
        case "de-edge": {
            return "Add an Edge";
        }
        case "de-skill": {
            return "Add a skill";
        }
        case "de-wealth": {
            if( isSwade ) {
                return "Add double starting wealth";
            } else {
                return "Double Starting Wealth";
            }

        }
        default: {
            return perkTag;
        }
    }
}

// export function getSeverityLabel( severity: number ): string {
//     if( severity == 0 ) {
//         return "Information";
//     }

//     if( severity == 2 ) {
//         return "Warning";
//     }

//     if( severity == 3 ) {
//         return "Error";
//     }
//     return "n/a";
// }

export function rSplit(inputString: string, sep: string, maxsplit: number) {
    let split = inputString.split(sep);
    return maxsplit ? [ split.slice(0, -maxsplit).join(sep) ].concat(split.slice(-maxsplit)) : split;
}

export function cleanUpStringArray( incomingArray: string[]): string[] {
    let exportArray: string[] = [];

    for( let item of incomingArray ) {
        item = item.trim();
        if( item ) {
            exportArray.push( item );
        }
    }

    return exportArray;
}

// export function getQueryVariable(variable: string) {
//     if(!variable ) {
//         variable = "";
//     }
//     if( typeof(window) != "undefined" ){
//         let query: string = window.location.search.substring(1);
//         let queryVars: string[] = query.split("&");
//         for (let varPair of queryVars ) {
//             let valuePair = varPair.split("=");
//             if(
//                 valuePair[0].toString().toLowerCase().trim()
//                     ==
//                 variable.toString().toLowerCase().trim()
//             ){
//                 return valuePair[1];
//             }
//         }

//     }
//     return("");
// }

export function removeQuotes( incoming: string ): string {
    if( incoming ) {
        incoming = incoming.toString().trim();
        if( incoming && incoming[0] == '"') {
            incoming = incoming.substring(1, incoming.length);
        }

        if( incoming && incoming[incoming.length - 1] == '"') {
            incoming = incoming.substring(0, incoming.length - 1);
        }
    }

    return incoming;
}

export function removeSpecialCharacters( incomingString: string ): string {

    incomingString = replaceAll(incomingString, '“', '');
    incomingString = replaceAll(incomingString, '”', '');
    incomingString = replaceAll(incomingString, '"', '');
    incomingString = replaceAll(incomingString, '\'', '');
    incomingString = replaceAll(incomingString, '’', '');
    incomingString = replaceAll(incomingString, ' ', '');
    incomingString = replaceAll(incomingString, '-', '');
    incomingString = replaceAll(incomingString, '−', '');
    incomingString = replaceAll(incomingString, '\t', '');
    incomingString = replaceAll(incomingString, '\n', '');

    return incomingString;
}

export function normalizeCharacters( incomingString: string ): string {

    incomingString = replaceAll(incomingString, '“', '"');
    incomingString = replaceAll(incomingString, '”', '"');
    incomingString = replaceAll(incomingString, '’', '\'');
    incomingString = replaceAll(incomingString, '−', '-');
    incomingString = replaceAll(incomingString, '\t', '    ');

    return incomingString;
}

export function stringsAreCloseEnough( string1: string, string2: string ): boolean {
    // string1 = removeSpecialCharacters(string1).toLowerCase().trim();
    // string2 = removeSpecialCharacters(string2).toLowerCase().trim();

    // string1 = replaceAll(string1, "(TW)", "");
    // string1 = replaceAll(string1, "(tw)", "");

    // string2 = replaceAll(string2, "(TW)", "");
    // string2 = replaceAll(string2, "(tw)", "");

    let string1alt = replaceAll(string1, " eba", " armor");
    let string2alt = replaceAll(string2, " eba", " armor");

    string1 = string1.replace(/\W/g, '').toLowerCase().trim();
    string2 = string2.replace(/\W/g, '').toLowerCase().trim();

    string1alt = string1alt.replace(/\W/g, '').toLowerCase().trim();
    string2alt = string2alt.replace(/\W/g, '').toLowerCase().trim();

    if(
        string1.startsWith( string2 )
        || string2.startsWith( string1 )

        || string2alt.startsWith( string1alt )
        || string1alt.startsWith( string2alt )
    ) {
        // eh, close enough
        return true;
    }

    return false;
}

// export function replaceSkillBoostWithSetSkill( effect: string ): string {
//     effect = replaceAll( effect, "skill_boost", "set_skill");
//     effect = replaceAll( effect, "boost_skill", "set_skill");
//     effect = replaceAll( effect, "skillboost", "set_skill");
//     effect = replaceAll( effect, "boostskill", "set_skill");
//     return effect
// }

export function replaceAll( incoming: string, replace: string, replaceWith: string): string {
    let maxCount = 500;
    let currentCount = 0;

    if(!incoming)
        return incoming;

    while( incoming.indexOf(replace) > - 1 && currentCount < maxCount ) {
        incoming = incoming.replace( replace, replaceWith );
        currentCount++;

    }
    if( currentCount > maxCount - 5) {
        console.error(  "replaceAll max count encountered!", replace, replaceWith);
    }

    return incoming;
}

export function getRankName( rankIndex: number ): string {
    switch( rankIndex ) {
        case 0: {
            return "Novice";
        }
        case 1: {
            return "Seasoned";
        }
        case 2: {
            return "Veteran";
        }
        case 3:  {
            return "Heroic";
        }
        case 4: {
            return "Legendary";
        }
        default: {
            return "????";
        }
    }
}

export function getTypeLabel( tag: string ): string {
    switch( tag.toLowerCase().trim() ) {
        case "character": {
            return "Character";
        }
        case "race": {
            return "Race";
        }
        case "setting": {
            return "Setting";
        }
        case "starship": {
            return "Scifi2014 Starship";
        }
        case "vehicle": {
            return "Scifi2014 Vehicle";
        }
        case "power_armor":
        case "power armor":
        case "power-armor":
        case "powerarmor": {
            return "Scifi2014 Power Armor";
        }
        case "walker": {
            return "Scifi2014 Walker";
        }
        case "powers":{
            return "Power";
        }
        case "weapons": {
            return "Personal Weapon";
        }
        case "armor": {
            return "Personal Armor";
        }
        case "gear": {
            return "Gear";
        }
        case "edges": {
            return "Edge";
        }
        case "hindrances": {
            return "Hindrance";
        }
        case "bestiary": {
            return "Bestiary Item";
        }
        case "vehicles": {
            return "Vehicle";
        }
        case "cyberware": {
            return "Cyberware";
        }
        default: {
            return "??? - " +  tag.toLowerCase().trim() ;
        }
    }
}

export function fixFloat( inputNumber: number): number {
    if(!inputNumber) {
        inputNumber = 0;
    }
    try {
        if( inputNumber.toString().indexOf(".") > -1) {
            return +inputNumber.toFixed(2);
        } else {
            return inputNumber;
        }
    }
    catch {
        return inputNumber;
    }
}

export function ucFirstLetter( inputString: string): string {
    if( inputString.length > 0 ) {
        let returnString = inputString[0].toUpperCase() + inputString.substring(1, inputString.length);
        return returnString;
    }
    return "";
}

export function capitalCase( inputString: string): string {
    let returnString = ""
    for( let word of inputString.split(" ") ) {
        if( word.length > 0 ) {
            returnString += word[0].toUpperCase() + word.substring(1, word.length) + " ";
        }
    }
    returnString.trim()
    return returnString;
}

export function getPowerName( powerID: number, powerList: IChargenPowers[] ): string {
    for( let powerDef of powerList ) {
        if( powerDef.id == powerID ) {
            return powerDef.name;
        }
    }
    return "(power not found!)";
}

export function ScifiHRCosts(incomingCost: number, noDecimal: boolean = false): string {
    let isNegative = 1;
    if (incomingCost < 0 ) {
        isNegative = -1;
        incomingCost = incomingCost * -1;
    } else {
        isNegative = 1;
    }
    if ( incomingCost >= 1000000000 ) {
        if (noDecimal) {
            return (incomingCost / 1000000000 * isNegative) + 'B';
        } else {
            return (incomingCost / 1000000000 * isNegative).toFixed(2) + 'B';
        }
    } else if ( incomingCost >= 1000000 ) {
        if (noDecimal) {
            return (incomingCost / 1000000 * isNegative) + 'M';
        } else {
            return (incomingCost / 1000000 * isNegative).toFixed(2) + 'M';
        }
    } else if ( incomingCost >= 1000 ) {
        if (noDecimal) {
            return (incomingCost / 1000 * isNegative) + 'K';
        } else {
            return (incomingCost / 1000 * isNegative).toFixed(2) + 'K';
        }
    } else {
        return incomingCost + '';
    }
}

export function formatNumber( x: number | string ) {
    return x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' );
};

export function kphToMPH( kph: number ): number {
    return Math.ceil(kph / 1.609344);
}

export function mphToKPH( mph: number ): number {
    return Math.ceil(mph * 1.609344);
}