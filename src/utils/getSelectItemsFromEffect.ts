import { split_by_max_two } from "./split_by_max_two";

export interface IReturn {
    action: string;
    target: string;
    value: string;
}
export function getSelectItemsFromEffect( effectLine: string ): IReturn {

    let rv = {
        action: "",
        target: "",
        value: "",
    }

    if( effectLine.indexOf(":") > -1 ) {
        let effectSplit = split_by_max_two(effectLine, ":");
        rv.action = effectSplit[0];

        if( effectSplit[1].indexOf("[") > 0 ) {
            let bracketsSplit = effectSplit[1].split("]");
            rv.target = bracketsSplit[0].replace("[", "").trim();
            rv.value = bracketsSplit[1].trim();

        } else {
            rv.target = effectSplit[1];
        }
    }

    return rv;
}