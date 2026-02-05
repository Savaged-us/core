export interface INotification {
    id: number;
    user_id: number;
    read: boolean;
    subject: string;
    message: string;
    created_by: number;
    created_on: Date;
    
    // Enhanced structured data for rich notifications
    notification_type?: 'feedback' | 'admin' | 'system' | 'user' | 'billing';
    metadata?: INotificationMetadata;
}

export interface INotificationMetadata {
    // For feedback notifications
    feedback_id?: number;
    feedback_type?: 'bug' | 'feature' | 'question' | 'other';
    feedback_title?: string;
    feedback_status?: 'open' | 'closed' | 'pending';
    
    // For user interactions
    from_user_id?: number;
    from_user_name?: string;
    from_user_email?: string;
    
    // Action buttons/links
    actions?: INotificationAction[];
    
    // Additional context
    context?: {
        [key: string]: any;
    };
}

export interface INotificationAction {
    type: 'link' | 'button' | 'external';
    label: string;
    url?: string;
    action?: string; // For internal actions
    style?: 'primary' | 'secondary' | 'danger' | 'success';
    icon?: string;
}