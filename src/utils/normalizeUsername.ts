export function normalizeUsername( newValue: string ): string {
    newValue = newValue.toLowerCase().trim();
    newValue = newValue.replace(/[^A-Z0-9]+/ig, "-");
    return newValue;
}