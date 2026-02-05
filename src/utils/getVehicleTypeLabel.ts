import { ucFirstLetter } from "./CommonFunctions";
import { titleCaseString } from "./titleCaseString";

export function getVehicleTypeLabel( input: string) : string {
    let type = input.toLowerCase().trim().replace("-", " ").replace("_", " ");

    // console.log("getVehicleTypeLabel type", type)
    let rv = "";
    type = titleCaseString( type );
    // console.log("getVehicleTypeLabel type2", type)
    if( type ) {
        rv = type;
    }
    // console.log("getVehicleTypeLabel rv", rv)

    return rv;
}