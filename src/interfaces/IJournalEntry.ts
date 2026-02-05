export interface IJournalEntry {
    date: Date;
    title?: string;
    entry: string[] | string;
    xp_gained: number;
    gmOnly: boolean;
    funds_gained: string;
    advancements_gained: number;
    ​​​wealth_die_set?: string;
    expanded?: boolean;
}