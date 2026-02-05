import { ValidityLevel } from "../enums/ValidityLevel";
import { IValidationMessage } from "./IValidationMessage";

export interface IStatSessionSaveRow {
    polled: Date;
    name: string;
    save_id: number;
    type: string;
    created_by: number;
    created_on: Date;
    created_by_name: string;
    errors: string[];
    validity: ValidityLevel;
    validity_messages: IValidationMessage[];
    books: string[];
    id: number;
}