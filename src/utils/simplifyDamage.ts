import { isNumeric } from "./isNumeric";

export function simplifyDamage(
    damage: string
): string {
    // console.log("damage 1", damage);
    if( damage.indexOf("+") > -1 ) {
        let damageSplit = damage.split("+");
        let damages: { [index: string]: number } = {};
        let sortedDamages: string[] = [];
        damages["static"] = 0;
        // console.log("damageSplit", damageSplit);
        for( let bit of damageSplit ) {
            // console.log("bit", bit);
            if(
                bit.toLowerCase().indexOf("d") > -1
                && bit.toLowerCase().indexOf("[") === -1
            ) {
                let splitBit = bit.toLowerCase().split("d");

                if( splitBit.length === 1 ) {
                    // d6
                    if( ("d" + splitBit[1]) in damages ) {
                        //@ts-ignore
                        damages["d" + splitBit[0]] += 1;
                    } else {
                        //@ts-ignore
                        damages["d" + splitBit[0]] = 1;
                    }
                } else if( splitBit.length === 2 ) {
                    // Xd6
                    if( splitBit[0] === "" )
                        splitBit[0] = "1";

                    if( ("d" + splitBit[1]) in damages )
                        damages["d" + splitBit[1]] += +splitBit[0];
                    else
                        damages["d" + splitBit[1]] = +splitBit[0];
                }

            } else {
                if( isNumeric( bit )  ) {
                    damages["static"] += +bit
                } else {
                    damages[ bit ] = 1;
                }

            }
        }

        // console.log("damages 2", damages);
        for( let item in damages ) {
            if( item.toLowerCase().startsWith("str") ) {
                sortedDamages.push( item );
            } else if (item.indexOf("d") > -1 ) {
                if( damages[ item ] > 1 )
                    sortedDamages.push( damages[ item ].toString() + item  );
                else
                    sortedDamages.push( item  );

            } else if( item == "static" && damages[ item ] > 0 ) {
                sortedDamages.push( damages[ item ].toString() );
            }
        }

        // console.log("sortedDamages 3", sortedDamages);

        sortedDamages.sort( _sortDamages );

        damage = sortedDamages.join("+");
    }

    return damage;
}

function _sortDamages( a: string, b: string ): number {
    if( a.toLowerCase().startsWith("str") ) {
        return -1;
    } else if( b.toLowerCase().startsWith("str") ) {
        return 1;
    } else if( isNumeric(a) && !isNumeric(b) ) {
        return 1;
    } else if( isNumeric(b) && !isNumeric(a) ) {
        return -1;
    } else if( a > b && !isNumeric(a) && !isNumeric(b)) {
        return 1;
    } else if ( a < b && !isNumeric(a) && !isNumeric(b) ) {
        return -1;
    }

    return 0;
}