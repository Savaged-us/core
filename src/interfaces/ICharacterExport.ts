export interface ICharDataExportSkill {
    name: string;
    attribute: string;
    value: string;
}

export interface  ICharDataExportEdgeHindrancePowerExport {
    name: string,
    summary: string[],
}

export interface  ICharDataExportGearExport {
    name: string,
    weight: number,
    summary: string[],
}

export interface  ICharDataExportWeaponsExport {
    name: string,
    weight: number,
    notes: string,
    range: string,
    damage: string,
    summary: string[],
}

export interface ICharDataExport {
    name: string;
    traits: {
        attributes: {
            agility: string,
            smarts: string,
            spirit: string,
            strength: string,
            vigor: string,
        },
        skills: ICharDataExportSkill[],
    },
    derived: {
        pace: number,
        parry: number,
        charisma: number,
        scholarship: number,
        pace_flying: number,
        pace_swimming: number,
        toughness: number,
        armor: number,
    },
    edges: ICharDataExportEdgeHindrancePowerExport[],
    hindrances: ICharDataExportEdgeHindrancePowerExport[],
    powers: ICharDataExportEdgeHindrancePowerExport[],
    weapons: ICharDataExportWeaponsExport[],
    armor: ICharDataExportGearExport[],
    gear: ICharDataExportGearExport[],
    special_abilities: ICharDataExportEdgeHindrancePowerExport[],   // includes super powers
}