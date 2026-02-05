export function split_by_max_two( line: string, split_by: string ): string[] {
    let find = line.indexOf( split_by );
    let name = line.slice(0, find);
    let notes = line.slice(find + 1);

    return [
        name,
        notes
    ]
}