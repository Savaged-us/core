import { replaceAll } from "./CommonFunctions";

export function ParseDamageString(
    damageString: string,
    strengthValue: string,
    smartsValue: string,
    spiritValue: string,
): IDieDamageExport {
    let rv = {
        dice: "",
        bonuses: 0,
    }

    // damageString = "d12+8+d4-4-d4+d6-d4";

    damageString = damageString.toLowerCase().trim();
    if( strengthValue && strengthValue.trim() ) {
        damageString = replaceAll(damageString, "str", strengthValue);
    }
    if( spiritValue && spiritValue.trim() ) {
        damageString = replaceAll(damageString, "spirit", strengthValue);
    }
    if( smartsValue && smartsValue.trim() ) {
        damageString = replaceAll(damageString, "smarts", strengthValue);
    }

    let damageSplit = damageString.split(/(?=[\+\-])/g)

    let d4 = 0;
    let d6 = 0;
    let d8 = 0;
    let d10 = 0;
    let d12 = 0;
    let d20 = 0;

    for( let item of damageSplit ) {
        item = item.trim();

        let multiplyBy = 1;
        if( item.startsWith("-")) {
            multiplyBy = -1;
        }
        item = replaceAll(item, "+", "");
        item = replaceAll(item, "-", "").trim();

        if( item.indexOf("d") > -1 ) {
            let dieSplit = item.split("d");

            let dieValue = 1;
            if( dieSplit[0].trim() ) {
                dieValue = +dieSplit[0];
            }

            switch( dieSplit[1].trim() ) {
                case "4":{
                    d4 += dieValue * multiplyBy;
                    break;
                }
                case "6":{
                    d6 += dieValue * multiplyBy;
                    break;
                }
                case "8":{
                    d8 += dieValue * multiplyBy;
                    break;
                }
                case "10":{
                    d10 += dieValue * multiplyBy;
                    break;
                }
                case "12":{
                    d12 += dieValue * multiplyBy;
                    break;
                }
                case "20":{
                    d20 += dieValue * multiplyBy;
                    break;
                }
            }

        } else {
            rv.bonuses += +item * multiplyBy;
        }
    }

    let addDice: string[] = []
    let subtractDice: string[] = [];
    if( d4 > 0 ) {
        addDice.push( d4.toString() + "d4");
    }
    if( d4 < 0 ) {
        subtractDice.push( d4.toString() + "d4");
    }

    if( d6 > 0 ) {
        addDice.push( d6.toString() + "d6");
    }
    if( d6 < 0 ) {
        subtractDice.push( d6.toString() + "d6");
    }

    if( d8 > 0 ) {
        addDice.push( d8.toString() + "d8");
    }
    if( d8 < 0 ) {
        subtractDice.push( d8.toString() + "d8");
    }

    if( d10 > 0 ) {
        addDice.push( d10.toString() + "d10");
    }
    if( d10 < 0 ) {
        subtractDice.push( d10.toString() + "d10");
    }

    if( d12 > 0 ) {
        addDice.push( d12.toString() + "d12");
    }
    if( d12 < 0 ) {
        subtractDice.push( d12.toString() + "d12");
    }

    if( d20 < 0 ) {
        addDice.push( d20.toString() + "d20");
    }
    if( d20 < 0 ) {
        subtractDice.push( d20.toString() + "d20");
    }

    rv.dice = ""

    if( addDice.length > 0 ) {
        rv.dice += addDice.join("+");
    }
    if( subtractDice.length > 0 ) {
        if( rv.dice )
            rv.dice += "-";
        rv.dice += subtractDice.join("-");
    }

    rv.dice = replaceAll(rv.dice, "++", "+");
    rv.dice = replaceAll(rv.dice, "--", "-");
    return rv;
}

export interface IDieDamageExport {
    dice: string;
    bonuses: number;
}
