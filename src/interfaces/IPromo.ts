export interface IPromo {

    deleted_on: Date;
    deleted: boolean;
    claimed_by: number;
    claimed_on: Date;
    claimed_with: string;
    for_or_event: string;
    code: string;
    expires: Date;
    created_by: number;
    created_on: Date;
    updated_by: number;
    updated_on: Date;
    deleted_by: number;
    id: number;

    user_first_name: string,
    user_last_name: string,
    user_is_premium: boolean,
    user_premium_expires: Date,

    qr_code_string?: string;
    qr_code_url?: string;
}