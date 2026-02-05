export interface IBillingLogs {
    id: number;
    user_id: string,
    action: string,
    data: string,
    timestamp: Date,
    user_first_name: string,
    user_last_name: string,
    user_is_premium: boolean,
}

