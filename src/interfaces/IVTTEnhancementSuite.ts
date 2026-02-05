export interface IVTTEnhancementSuiteAttribs {
    name: string;
    current: string | number;
    max: string | number;
    id: string;
}

export interface IVTTEnhancementSuiteAbilities {
    name: string;
    description: string;
    istokenaction: boolean;
    action: string;
    order: number;
}

export interface IVTTEnhancementSuiteToken {
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    imgsrc: string;
}

export interface IVTTEnhancementSuite {
    schema_version: number;
    oldId: string;
    name: string;
    avatar: string;
    bio: string;
    gmnotes: string;
    defaulttoken: string;
    tags: string;
    controlledby: string;
    inplayerjournals: string;
    attribs: IVTTEnhancementSuiteAttribs[];
    abilities: IVTTEnhancementSuiteAbilities[];
}