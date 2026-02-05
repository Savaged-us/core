export interface IUpdateSaveData {
    save_id: number;
    wounds: number;
    fatigue: number;
    power_points: IUpdateSaveDataPowerPoints;
    shots: IUpdateSaveDataShots;
    gear_quantities: IUpdateSaveDataQuantity;
}

export interface IUpdateSaveDataShots {
    uuid: string;
    profile_shots: number[];
}

export interface IUpdateSaveDataPowerPoints {
    uuid: string;
    power_points: number;
}

export interface IUpdateSaveDataQuantity {
    uuid: string;
    quantity: number;
}