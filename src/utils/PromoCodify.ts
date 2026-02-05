import { replaceAll } from "./CommonFunctions";

export function promoCodify( importString: string ): string {
    let rv = "";

    let count = 0;
    importString = importString.toUpperCase();

    importString = replaceAll(importString, "-", "")
    for( let letter of importString ) {
        if( count % 3 == 0 && count > 0) {
            rv += "-"
        }
        rv += letter;
        count++;
    }

    return rv;
}