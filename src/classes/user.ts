// User class stub for core package
import { IPublicUserInfo } from '../interfaces/IPublicUserInfo';

export interface UserGroup {
    id: number;
    name: string;
}

export class User {
    id: number = 0;
    username: string = '';
    shareDisplayName: string = '';
    isWildcard: boolean = false;
    isAdmin: boolean = false;
    turnOffAdvanceLimits: boolean = false;
    groups: UserGroup[] = [];
    
    constructor(data?: any, groups?: UserGroup[]) {
        if (data) {
            this.id = data.id || 0;
            this.username = data.username || '';
            this.shareDisplayName = data.shareDisplayName || '';
            this.isWildcard = data.isWildcard || false;
            this.isAdmin = data.isAdmin || false;
        }
        if (groups) {
            this.groups = groups;
        }
    }
    
    publicInfo(list?: any[], allData?: boolean): IPublicUserInfo {
        return {
            id: this.id,
            username: this.username,
            shareDisplayName: this.shareDisplayName,
        };
    }
}
