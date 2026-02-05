import { string } from "prop-types";
import { replaceAll } from "./CommonFunctions";
import { isNumber, floor } from "lodash";

interface Die {
    index: number,
    label: string,
    value: number,
}

export interface IRollResults {
    total: number;
    totalDice: number;
    totalBonuses: number;
    rolls: {
        roll: string,
        rolls: number[]
    }[];
}

export function parseRoll(
    diceRollString: string,
    min: boolean = false,
    max: boolean = false,
    average: boolean = false,
): IRollResults {
    diceRollString = diceRollString.replace(/(?=[$-/:-?{-~!"^_`\[\]])/gi, ",");
    let stringSplit = diceRollString.toLowerCase().split(",");

    let returnTotal = 0;

    let roundDown = false;
    let rolls: {
            roll: string,
            rolls: number[]
        }[] = [];

    let totalDice = 0;
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

                let rollLog: {
                    roll: string,
                    rolls: number[]
                } = {
                    roll: bit,
                    rolls: [],
                }
                for( let count = 0; count < numberDice; count++) {
                    if( min ) {
                        returnTotal += 1;
                        totalDice += 1;
                        rollLog.rolls.push( 1 )
                        rollLog.rolls.push( 0 )
                    } else if ( max ) {
                        returnTotal += dieFaces;
                        totalDice += dieFaces;
                        rollLog.rolls.push( dieFaces )
                        rollLog.rolls.push( 0 )
                    } else if ( average ) {
                        // roll a die
                        let roll = 0;
                        if( roundDown )
                            roll = Math.floor( (dieFaces + 1) / 2 ) // 3 on a d6
                        else
                            roll = Math.ceil( (dieFaces + 1) / 2 )  // 4 on a d6

                        returnTotal += roll;
                        rollLog.rolls.push( roll )
                        roundDown = !roundDown;
                        rollLog.rolls.push( 0 )
                        totalDice += roll;
                    } else {
                        // roll a die

                        let roll = 0;
                        let subTotal = 0;
                        roll = Math.floor(Math.random() * (dieFaces - 1 + 1)) + 1;
                        subTotal += roll;
                        rollLog.rolls.push( roll )
                        while( roll == dieFaces ) {
                            roll = Math.floor(Math.random() * (dieFaces - 1 + 1)) + 1;
                            subTotal += roll;
                            rollLog.rolls.push( roll )

                        }
                        returnTotal += subTotal;
                        totalDice += subTotal;
                        rollLog.rolls.push( 0 )
                    }
                }

                rolls.push( rollLog );

            } else {
                let numericBit = +bit / 1;
                if( isNaN(numericBit) == false ) {
                    if( add ) {
                        returnTotal += +numericBit;
                        totalBonuses += +numericBit;
                    } else {
                        returnTotal -= +numericBit;
                        totalBonuses -= +numericBit;
                    }
                }
            }
        }
    }

    // console.log("returnTotal", returnTotal)
    // console.log("rolls", rolls)
    // console.log("totalBonuses", totalBonuses)
    // console.log("totalDice", totalDice)
    return {
        total: returnTotal,
        rolls: rolls,
        totalBonuses: totalBonuses,
        totalDice: totalDice,

    }

}

export function getDieLabelFromIndex( indexNumber: number ): string {
    if( diceValues.length > indexNumber && diceValues[indexNumber]) {
        return diceValues[indexNumber].label;
    }

    return "n/a";
}

export function getDieIndexFromLabel( dieLabel: string = "" ): number {
    if( dieLabel.length > 0 && dieLabel[0] == "+") {
        dieLabel = dieLabel.replace("+", "");
    }    dieLabel = replaceAll( dieLabel, " ", "");
    for( let die of diceValues ) {
        if( dieLabel ) {
            if( die.label.toLowerCase().trim() == dieLabel.trim().toLowerCase() ) {
                return die.index;
            }
        }
    }

    return 0;
}

export function getDieValueFromLabel( dieLabel: string = "" ): number {
    dieLabel = replaceAll( dieLabel.toLowerCase(), "(a)", "").trim()
    if( dieLabel.length > 0 && dieLabel[0] == "+") {
        dieLabel = dieLabel.replace("+", "");
    }
    dieLabel = replaceAll( dieLabel, " ", "");
    for( let die of diceValues ) {
        if( dieLabel ) {
            if( die.label.toLowerCase().trim() == dieLabel.trim().toLowerCase() ) {
                return die.value;
            }
        }
    }

    return 0;
}

export function getDieValueFromIndex( indexNumber: number ): number {
    if( diceValues.length > indexNumber && diceValues[indexNumber]) {
        return diceValues[indexNumber].value;
    }

    return -1
}

export function BoostDieValue( dieLabel: string, boostAmount: number ): string {
    let currentIndex = getDieIndexFromLabel( dieLabel) ;
    currentIndex += boostAmount;
    return getDieLabelFromIndex( currentIndex );
}

export const diceValues: Die[] = [
    {
        index: 0,
        label: "-",
        value: 0,
    },
    {
        index: 1,
        label: "d4",
        value: 4,
    },
    {
        index: 2,
        label: "d6",
        value: 6,
    },
    {
        index: 3,
        label: "d8",
        value: 8,
    },
    {
        index: 4,
        label: "d10",
        value: 10,
    },
    {
        index: 5,
        label: "d12",
        value: 12,
    },
    {
        index: 6,
        label: "d12+1",
        value: 13,
    },
    {
        index: 7,
        label: "d12+2",
        value: 14,
    },
    {
        index: 8,
        label: "d12+3",
        value: 15,
    },
    {
        index: 9,
        label: "d12+4",
        value: 16,
    },
    {
        index: 10,
        label: "d12+5",
        value: 17,
    },
    {
        index: 11,
        label: "d12+6",
        value: 18,
    },
    {
        index: 12,
        label: "d12+7",
        value: 19,
    },
    {
        index: 13,
        label: "d12+8",
        value: 20,
    },
    {
        index: 14,
        label: "d12+9",
        value: 21,
    },
    {
        index: 15,
        label: "d12+10",
        value: 22,
    },
    {
        index: 16,
        label: "d12+11",
        value: 23,
    },
    {
        index: 17,
        label: "d12+12",
        value: 24,
    },
    {
        index: 18,
        label: "d12+13",
        value: 25,
    },
    {
        index: 19,
        label: "d12+14",
        value: 26,
    },
    {
        index: 20,
        label: "d12+15",
        value: 27,
    },
    {
        index: 21,
        label: "d12+16",
        value: 28,
    },
    {
        index: 22,
        label: "d12+17",
        value: 29,
    },
    {
        index: 23,
        label: "d12+18",
        value: 30,
    },
    {
        index: 24,
        label: "d12+19",
        value: 31,
    },
    {
        index: 25,
        label: "d12+20",
        value: 32,
    },
    {
        index: 26,
        label: "d12+21",
        value: 33,
    },
    {
        index: 27,
        label: "d12+22",
        value: 34,
    },
    {
        index: 28,
        label: "d12+23",
        value: 35,
    },
    {
        index: 29,
        label: "d12+24",
        value: 36,
    },
];