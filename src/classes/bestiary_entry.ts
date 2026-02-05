// Bestiary entry stub for core package
export interface IBestiaryEntry {
    id: number;
    name: string;
    description: string | string[];
    uuid: string;
    book_id: number;
    book_page: string;
    wildcard: boolean;
    // Add other fields as needed
    [key: string]: any;
}

export class BestiaryEntry implements IBestiaryEntry {
    id: number = 0;
    name: string = '';
    description: string | string[] = '';
    uuid: string = '';
    book_id: number = 0;
    book_page: string = '';
    wildcard: boolean = false;
    saveID: number = 0;
    image_url: string = '';
    
    [key: string]: any;
    
    constructor(data?: Partial<IBestiaryEntry>) {
        if (data) {
            Object.assign(this, data);
        }
    }
    
    exportHTML(): string {
        return `<div class="bestiary-entry"><h3>${this.name}</h3></div>`;
    }
}
