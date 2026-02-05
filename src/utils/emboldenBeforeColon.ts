import { split_by_max_two } from "./split_by_max_two";

export function emboldenBeforeColon( value: string ) {
    if( value.indexOf(":") > 0) {
        let split = split_by_max_two(value, ":");

        value = "<strong>" + split[0].trim() + "</strong>: " + split[1].trim();
    }

    return value;
}