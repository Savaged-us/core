import { IPublicUserInfo } from "../interfaces/IPublicUserInfo";
import { IBook } from "./book";

export class DataObject {

    id: number = 0;
    active: boolean = false;

    name: string = "";
    namePlural: string = "";

    type: string = "";

    versionOf: number = 0;
    deleted: boolean = false;
    deletedOn: Date = new Date();
    createdOn: Date = new Date();
    updatedOn: Date = new Date();

    summary: string = "";
    description: string = "";

    createdUser: IPublicUserInfo | undefined = undefined;
    updatedUser: IPublicUserInfo | undefined = undefined;
    deletedUser: IPublicUserInfo | undefined = undefined;

    readOnly: boolean = false;

    constructor(
        initObj: IDataObjectExport | null = null,
    ) {
        this.reset();
        if( initObj ) {

        }
    }

    public reset() {
        this.id = 0;
        this.type = "";
        this.active = true;
        this.name = "";
        this.namePlural = "";
        this.versionOf = 0;
        this.deleted = false;

        this.deletedOn = new Date();
        this.createdOn = new Date();
        this.updatedOn = new Date();
        this.type = "(unknown)"

        this.summary = "";
        this.description = "";
        this.createdUser = undefined;
        this.updatedUser = undefined;
        this.deletedUser = undefined;
        this.readOnly = false;
    }

    public import(
        initObj: IDataObjectExport | null,
        _books: IBook[] = [],
    ) {

        if( initObj ) {
            typeof(initObj.id) != "undefined" ? this.id = initObj.id : null;

            typeof(initObj.type) != "undefined" ? this.type = initObj.type : null;

            typeof(initObj.name) != "undefined" ? this.name = initObj.name : null;
            typeof(initObj.name_plural) != "undefined" ? this.namePlural = initObj.name_plural : null;

            typeof(initObj.version_of) != "undefined" ? this.versionOf = initObj.version_of : null;
            typeof(initObj.deleted) != "undefined" ? this.deleted = initObj.deleted : null;

            typeof(initObj.deleted_on) != "undefined" && initObj.deleted_on ? this.deletedOn = new Date(initObj.deleted_on) : null;
            typeof(initObj.created_on) != "undefined" && initObj.created_on ? this.createdOn = new Date(initObj.created_on) : null;
            typeof(initObj.updated_on) != "undefined" && initObj.updated_on ? this.updatedOn = new Date(initObj.updated_on) : null;

            typeof(initObj.created_by_user) != "undefined" ? this.createdUser = initObj.created_by_user : null;
            typeof(initObj.updated_by_user) != "undefined" ? this.updatedUser = initObj.updated_by_user : null;
            typeof(initObj.deleted_by_user) != "undefined" ? this.deletedUser = initObj.deleted_by_user : null;

            typeof(initObj.summary) != "undefined" ? this.summary = initObj.summary : null;
            if( typeof(initObj.description) != "undefined" && initObj.description) {
                // console.log('data_obj typeof( initObj.description )', initObj.name, typeof( initObj.description ), initObj.description);
		        if( typeof( initObj.description ) == "string" ) {
		 	        this.description = initObj.description;
		        } else {
		 	        this.description = initObj.description.join("\n");
		        }
	        } else {
		        this.description = "";
    	    }

            typeof(initObj.read_only) != "undefined" ? this.readOnly = initObj.read_only : null;
            typeof(initObj.active) != "undefined" ? this.active = initObj.active : null;
        }

    }

    public export(): IDataObjectExport {
        let rv: IDataObjectExport = {
            id: this.id,

            active: this.active ? true : false,

            type: this.type,

            name: this.name,
            name_plural: this.namePlural,

            version_of: this.versionOf,
            deleted: this.deleted ? true : false,
            deleted_by: this.deletedUser ? this.deletedUser.id : 0,
            deleted_on: new Date(this.deletedOn),
            created_by: this.createdUser ? this.createdUser.id : 0,
            created_on: new Date(this.createdOn),
            updated_by: this.updatedUser ? this.updatedUser.id : 0,
            updated_on: new Date(this.updatedOn),
            read_only: this.readOnly ? true : false,

            summary: this.summary,
            description: this.description,

            created_by_user: this.createdUser,
            updated_by_user: this.updatedUser,
            deleted_by_user: this.deletedUser,
        }

        return rv;

    }

}

export interface IDataObjectExport {

    id: number;
    active: boolean;
    type: string;

    read_only: boolean;

    name: string;
    name_plural: string;

    version_of: number;
    deleted: boolean;
    deleted_by: number;
    deleted_on: Date | null;
    created_by: number;
    created_on: Date | null;
    updated_by: number;
    updated_on: Date | null;

    summary: string;
    description: string[] | string;

    created_by_user: IPublicUserInfo | undefined;
    updated_by_user: IPublicUserInfo | undefined;
    deleted_by_user: IPublicUserInfo | undefined;

    last_reset_on?: Date;
    last_reset_by?: number;
    last_reset_by_user?: IPublicUserInfo;

}
