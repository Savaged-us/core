import { ValidityLevel } from "../enums/ValidityLevel";

export interface IValidationMessage {
    message: string;
    severity: ValidityLevel;
    goURL: string;
}