import { ISkillListImport } from "../interfaces/ISkillListImport";
import { cleanUpReturnValue } from "../utils/cleanUpReturnValue";
import { User, UserGroup } from "./user";
import { DataObject, IDataObjectExport } from "./_data_object";

export interface IBook extends IDataObjectExport{
    // id: number;
    // active: boolean;
    name: string;
    image_upload?: string;
    logo_upload: string;
    image?: string;
    logo: string;
    short_name: string;
    publisher: string;
    published: string;
    core: boolean;
    unseen: boolean;
    primary: boolean;
    buylink?: string;
    buy_link?: string;
    swade_optimized: boolean;
    write_groups: number[];
    partner_id: number;
    access_anonymous: boolean;
    access_registered: boolean;
    access_wildcard: boolean;
    access_developer: boolean;
    access_admin: boolean;
    access_premium?: boolean;               // old database field.

    setting_rules: string | string[];
    knowledge_list: string | string[];
    skill_list: ISkillListImport[];
    add_skills: string | string[];
    del_skills: string | string[];
    // ab_list: string | IABListImport[];
    core_skills: string | string[];
    has_charisma: boolean;
    uses_xp: boolean;
    starting_skill_points: number;
    starting_attribute_points: number;
    language_list: string | string[];

    bestiary_count?: number;
    weapons_count?: number;
    gear_count?: number;
    armor_count?: number;

}

export class Book extends DataObject{

    imageUpload: string = "";
    shortName: string;
    publisher: string;
    published: string;
    core: boolean;
    primary: boolean;

    unseen: boolean = false;

    buyLink : string;

    languageList: string[] = [];
    settingRules: string[] = [];
    knowledgeList: string[] = [];
    skillList: ISkillListImport[] = [];
    addSkills: string | string[] = [];
    delSkills: string[] = [];
    // abList: IABListImport[] = [];
    coreSkills: string[] = [];
    hasCharisma: boolean;
    usesXP: boolean;
    startingSkillPoints: number;
    startingAttributePoints: number;

    swadeOptimized: boolean = false;

    accessAnonymous: boolean = false;
    accessRegistered: boolean = false;
    accessWildcard: boolean = false;
    accessDeveloper: boolean = false;
    accessAdmin: boolean = false;

    logoUpload: string = "";

    used: boolean = false;
    available: boolean = false;

    writeGroups: number[] = [];
    partnerID: number = 0;

    constructor(
        bookImport: IBook | null = null,
        bookUsed: boolean = false
    ) {
        super(bookImport);
        if( bookImport ) {
            this.import( bookImport);
        }

        this.used = bookUsed;
    }

    import( bookImport: IBook ) {
        super.import( bookImport );
        // this.active = bookImport.active;
        // this.id = bookImport.id;
        // this.name = bookImport.name;
        this.imageUpload = bookImport.image_upload ? bookImport.image_upload : "";

        if( bookImport.image ) {
            this.imageUpload = bookImport.image;
        }

        if( bookImport.logo_upload )
            this.logoUpload = bookImport.logo_upload;

        if( bookImport.logo ) {
            this.logoUpload = bookImport.logo;
        }

        this.unseen = false;
        if( bookImport.unseen ) {
            this.unseen = true;
        }


        this.shortName = bookImport.short_name;
        this.publisher = bookImport.publisher;
        this.published = bookImport.published;
        this.core = bookImport.core;
        this.primary = bookImport.primary;

        if( bookImport.buylink )
            this.buyLink  = bookImport.buylink;

        if( bookImport.buy_link )
            this.buyLink  = bookImport.buy_link;

        this.accessAnonymous = false;
        this.accessRegistered = false;
        this.accessWildcard = false;
        this.accessDeveloper = false;
        this.accessAdmin = false;

        if( typeof(bookImport.setting_rules) == "string") {
            if( bookImport.setting_rules.trim() != "" ) {
                try {
                    this.settingRules = JSON.parse( bookImport.setting_rules );      // JSON encoded ""
                }
                catch {

                }
            }
        } else {
            this.settingRules =  bookImport.setting_rules;
        }

        if( typeof(bookImport.knowledge_list) == "string") {
            if( bookImport.knowledge_list.trim() != "" ) {
                try {
                    this.knowledgeList = JSON.parse( bookImport.knowledge_list );      // JSON encoded ""
                }
                catch {

                }
            }
        } else {
            this.knowledgeList =  bookImport.knowledge_list;
        }

        if( typeof(bookImport.language_list) == "string") {
            if( bookImport.language_list.trim() != "" ) {
                try {
                    this.languageList = JSON.parse( bookImport.language_list );      // JSON encoded ""
                }
                catch {

                }
            }
        } else {
            this.languageList =  bookImport.language_list;
        }

        if( typeof(bookImport.skill_list) == "string") {
            // if( bookImport.skill_list.trim() != "" ) {
            //     try {
            //         this.skillList = JSON.parse( bookImport.skill_list );      // JSON encoded ""
            //     }
            //     catch {

            //     }
            // }
        } else {
            this.skillList =  bookImport.skill_list;
        }

        if( typeof(bookImport.add_skills) == "string") {
            if( bookImport.add_skills.trim() != "" ) {
                try {
                    this.addSkills = JSON.parse( bookImport.add_skills );      // JSON encoded ""
                }
                catch {

                }
            }
        } else {
            this.addSkills =  bookImport.add_skills;
        }

        if( typeof(bookImport.del_skills) == "string") {
            if( bookImport.del_skills.trim() != "" ) {
                try {
                    this.delSkills = JSON.parse( bookImport.del_skills );      // JSON encoded ""
                }
                catch {

                }
            }
        } else {
            this.delSkills =  bookImport.del_skills;
        }

        // if( typeof(bookImport.ab_list) == "string") {
        //     if( bookImport.ab_list.trim() != "" ) {
        //         try {
        //             this.abList = JSON.parse( bookImport.ab_list );      // JSON encoded ""
        //         }
        //         catch {

        //         }
        //     }
        // } else {
        //     this.abList =  bookImport.ab_list;
        // }

        this.writeGroups = [];
        if( bookImport.write_groups ) {
            this.writeGroups = bookImport.write_groups
        }

        this.partnerID = 0;
        if( bookImport.partner_id ) {
            this.partnerID = bookImport.partner_id
        }

        if( typeof(bookImport.core_skills) == "string") {
            if( bookImport.core_skills.trim() != "" ) {
                try {
                    this.coreSkills = JSON.parse( bookImport.core_skills );      // JSON encoded ""
                }
                catch {

                }
            }
        } else {
            this.coreSkills =  bookImport.core_skills;
        }

        this.hasCharisma = bookImport.has_charisma;
        this.usesXP = bookImport.uses_xp;
        this.startingSkillPoints = bookImport.starting_skill_points;
        this.startingAttributePoints = bookImport.starting_attribute_points;
        // this.createdBy = bookImport.created_by;
        // this.createdOn = new Date(bookImport.created_on);
        // this.deleted = bookImport.deleted;
        // this.deletedBy = bookImport.deleted_by;
        // this.deletedOn = new Date(bookImport.deleted_on);
        // this.updatedBy = bookImport.updated_by;
        // this.updatedOn = new Date(bookImport.updated_on);
        // this.createdByName = bookImport.created_by_name;
        // this.updatedByName = bookImport.updated_by_name;
        // this.deletedByName = bookImport.deleted_by_name;

        if( bookImport.access_admin )
            this.accessAdmin = true;
        if( bookImport.access_anonymous )
            this.accessAnonymous = true;
        if( bookImport.access_developer )
            this.accessDeveloper = true;
        if( bookImport.access_registered )
            this.accessRegistered = true;
        if( bookImport.access_wildcard )
            this.accessWildcard = true;
        if( bookImport.access_premium )
            this.accessWildcard = true;

        if( bookImport.swade_optimized )
            this.swadeOptimized = true;

    }

    getWriteGroupNames(userGroups: UserGroup[]): string[] {
        let rv: string[] = [];

        if(!userGroups)
            return [];

        for( let group of userGroups ) {
            if( this.writeGroups.indexOf(group.id) > -1)
                rv.push( group.name );
        }

        rv.sort();

        return rv;
    }

    toggleGroupID( groupID: number, groupList: UserGroup[] ) {
        let foundGroup = false;

        for( let groupIndex in this.writeGroups ) {
            if( this.writeGroups[ groupIndex ] == groupID ) {
                foundGroup = true;
                this.writeGroups.splice( +groupIndex, 1);
            }
        }
        if( !foundGroup ) {
            for( let group of groupList ) {
                if( groupID === group.id ) {
                    this.writeGroups.push( group.id )
                }
            }
        }
    }

    groupIDCanWrite( groupID: number): boolean {
        for( let writeGroupID of this.writeGroups ) {
            if( writeGroupID === groupID ) {
                return true;
            }
        }
        return false;
    }

    reset() {
        super.reset();
        // this.id = 0;
        // this.active = true;
        // this.name = "";
        this.imageUpload = "";
        this.logoUpload = "";
        this.shortName = "";
        this.publisher = "";
        this.published = "";
        this.core = false;
        this.primary = false;
        this.buyLink  = "";
        this.settingRules = [];      // JSON encoded ""
        this.knowledgeList = [];     // JSON encoded ""
        this.skillList = [];         // JSON encoded ""
        this.addSkills = [];         // JSON encoded ""
        this.delSkills = [];         // JSON encoded ""
        // this.abList = [];            // JSON encoded ""
        this.coreSkills = [];         // JSON encoded ""
        this.hasCharisma = false;
        this.usesXP = false;
        this.startingSkillPoints = 0;
        this.startingAttributePoints = 0;
        // this.createdBy = 0;
        // this.createdOn = new Date();
        // this.deleted = 0;
        // this.deletedBy = 0;
        // this.deletedOn = new Date();
        // this.updatedBy = 0;
        // this.updatedOn = new Date();
        // this.createdByName = "";
        // this.updatedByName = "";
        // this.deletedByName = "";

        this.used = false;
        this.available = false;
    }

    export(): IBook {
        let rv: IBook = super.export() as IBook;

        rv.logo = this.logoUpload;
        rv.image = this.imageUpload;
        rv.short_name = this.shortName;
        rv.publisher = this.publisher;
        rv.published = this.published;
        rv.core = this.core;
        rv.primary = this.primary;
        rv.write_groups = this.writeGroups;
        rv.partner_id = this.partnerID;
        rv.swade_optimized = this.swadeOptimized;
        rv.buy_link = this.buyLink;
        rv.setting_rules = this.settingRules;
        rv.knowledge_list = this.knowledgeList;
        rv.language_list = this.languageList;
        rv.skill_list = this.skillList;
        rv.add_skills = this.addSkills;
        rv.del_skills = this.delSkills;
        rv.core_skills = this.coreSkills;
        rv.has_charisma = this.hasCharisma;
        rv.uses_xp = this.usesXP;
        rv.starting_skill_points = this.startingSkillPoints;
        rv.starting_attribute_points = this.startingAttributePoints;

        rv.access_anonymous = this.accessAnonymous;
        rv.access_registered = this.accessRegistered;
        rv.access_wildcard = this.accessWildcard;
        rv.access_developer = this.accessDeveloper;
        rv.access_admin = this.accessAdmin;

        // rv.deleted = false;
        // let rv: IBook = {
        //     id: this.id,
        //     logo_upload: this.logoUpload,
        //     active: this.active,
        //     name: this.name,
        //     image_upload: this.imageUpload,
        //     short_name: this.shortName,
        //     publisher: this.publisher,
        //     published: this.published,
        //     core: this.core,
        //     primary: this.primary,

        //     write_groups: this.writeGroups,
        //     partner_id: this.partnerID,

        //     swade_optimized: this.swadeOptimized,

        //     buylink: this.buyLink,

        //     setting_rules: this.settingRules,
        //     knowledge_list: this.knowledgeList,
        //     language_list: this.languageList,
        //     skill_list: this.skillList,
        //     add_skills: this.addSkills,
        //     del_skills: this.delSkills,
        //     // ab_list: this.abList,
        //     core_skills: this.coreSkills,
        //     has_charisma: this.hasCharisma,
        //     uses_xp: this.usesXP,
        //     starting_skill_points: this.startingSkillPoints,
        //     starting_attribute_points: this.startingAttributePoints,

        //     created_by: this.createdBy,
        //     created_on: this.createdOn,

        //     deleted: this.deleted,
        //     deleted_by: this.deletedBy,
        //     deleted_on: this.deletedOn,

        //     updated_by: this.updatedBy,
        //     updated_on: this.updatedOn,

        //     access_anonymous: this.accessAnonymous,
        //     access_registered: this.accessRegistered,
        //     access_wildcard: this.accessWildcard,
        //     access_developer: this.accessDeveloper,
        //     access_admin: this.accessAdmin,

        //     created_by_name: this.createdByName,
        //     updated_by_name: this.updatedByName,
        //     deleted_by_name: this.deletedByName,
        // }
        rv  = cleanUpReturnValue(rv);
        return rv;
    }

    getName(): string {
        return this.name;
    }

    getShortName(): string {
        return this.shortName;
    }

    userCanWrite( user: User ): boolean {

        // console.log("user.groups", user.groups);
        // console.log("this.writeGroups", this.writeGroups);

        if( user.isAdmin ) {
            return true;
        }
        if( this.createdUser && this.createdUser.id === user.id ) {
            return true;
        }

        for( let userGroup of user.groups ) {
            // console.log("userGroup", userGroup);
            for( let groupID of this.writeGroups ) {
                // console.log("groupID", groupID, userGroup);
                if( groupID == userGroup.id ) {
                    // console.log("return true");
                    return true;
                }
            }
        }

        return false;
    }
}