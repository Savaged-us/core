import { replaceAll } from "./CommonFunctions";

export interface RGBValue {
    r: number;
    g: number;
    b: number;
}
export function hexToRgb(hex: string ): RGBValue {

    hex = replaceAll( hex, "#", "");

    if( hex.length == 3 ) {
        let newHex = "";
        for( let char of hex )  {
            newHex += char;
            newHex += char;
        }
        hex = newHex;
    }

    const rgb = parseInt(hex, 16);

    const r = (rgb >> 16) & 255;
    const g = (rgb >> 8) & 255;
    const b = rgb & 255;

    return {r: r, g: g, b: b};
}