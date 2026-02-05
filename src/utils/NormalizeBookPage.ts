import { replaceAll } from "./CommonFunctions"

export function NormalizeBookPage( input: string ): string {
    input = input.toLowerCase().trim()
    input = replaceAll(input, "p", "");

    return "p" + input;
}