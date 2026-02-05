import { replaceAll } from "./CommonFunctions";

export function simplifyDice( diceRollString: string): string {
    let rv = "";
    diceRollString = diceRollString.replace(/(?=[$-/:-?{-~!"^_`\[\]])/gi, ",");
    let stringSplit = diceRollString.toLowerCase().split(",");

    // let totalDice = 0;
    let totalDice: string[] = [];
    let totalBonuses = 0;
    for( let bit of stringSplit ) {
        bit = bit.trim();
        if( bit && bit.length > 0 ) {
            let add = true;

            if( bit.startsWith("-")) {
                add = false;
            }

            // remove those plusses and minuses to not skew the parse
            bit = replaceAll(bit, "+", "");
            bit = replaceAll(bit, "-", "");

            // bit = bit.trim();
            if( bit.indexOf("d") > -1 ) {
                let dieSplit = bit.split("d");
                // multiple dice, ie 4d12
                let dieFaces: number = +dieSplit[1];
                if( dieSplit[1].trim() === "" ) {
                    dieFaces = 6;
                }

                let numberDice: number = +dieSplit[0];
                if( dieSplit[0].trim() === "" ) {
                    numberDice = 1;
                }

                for( let count = 0; count < numberDice; count++) {

                    // roll a die

                    totalDice.push( dieFaces.toString() )

                }

            } else {
                let numericBit = +bit / 1;
                if( isNaN(numericBit) == false ) {
                    if( add ) {
                        totalBonuses += +numericBit;
                    } else {
                        totalBonuses -= +numericBit;
                    }
                }
            }
        }

    }

    rv += "d" + totalDice.join(" + d");
    if( totalBonuses > 0 )
        rv += "+" + totalBonuses.toString();
    else if( totalBonuses < 0 )
        rv += "" + totalBonuses.toString();
    return rv.trim();
}