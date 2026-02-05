/**
 * Sort array of objects by name property
 */
export function sortByObjectName<T extends { name?: string }>(a: T, b: T): number {
    const nameA = (a.name || '').toLowerCase();
    const nameB = (b.name || '').toLowerCase();
    
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
}
