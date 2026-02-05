import { replaceAll } from "../utils/CommonFunctions";
import { generateUUID } from "../utils/generateUUID";
import { Book, IBook } from "./book";
import { PlayerCharacter } from "./player_character/player_character";
import { DataObject, IDataObjectExport } from "./_data_object";


export enum EParentType {
    None = 0,
    Setting = 1,
    Race = 2,
    Framework = 3,
    Gear = 4,
    Weapon = 5,
    Armor = 6,
    Implant = 7,
}

export class BaseObject extends DataObject {

    book?: number; // LEGACY

    book_short_name: string | null = "";

    save_id: number;

    parent_uuid: string = "";
    parent_type: EParentType = EParentType.None;
    uuid: string;
    id: number;
    is_custom: boolean;
    book_id: number;
    active: boolean;
    book_obj: Book;

    no_select: boolean = false;

    summary: string = "";
    image_url: string = "";
    image_updated: Date = new Date();
    // description: string[];

    setting_item: boolean = false;

    book_page: string = "";

    _char: PlayerCharacter | null = null;

    constructor(
        initObj: IBaseObjectExport | null = null,
        pcObj: PlayerCharacter | null = null,
    ) {
        super(initObj);
        this._char = pcObj;
        this.reset();
        if( initObj ) {
            let book_list: IBook[] = [];
            if( this._char && this._char._availableData && this._char._availableData.books ) {
                book_list = this._char._availableData.books;
            }
            this.import(initObj, book_list);
        }
    }

    public reset() {
        super.reset();
        // this.id = 0;
        this.no_select = false;
        this.uuid = generateUUID();
        this.is_custom = false;
        this.parent_uuid = "";
        this.parent_type = EParentType.None;

        // this.active = true;
        this.book_id = 0;
        this.book_page = "";

        this.image_url = "";
        // this.description = [];

    }

    public getName(): string {
        return this.name;
    }

    public import(
        initObj: IBaseObjectExport | null,
        book_list: IBook[],
    ) {
        if( initObj ) {
            super.import( initObj );


            typeof(initObj.book_page) != "undefined" ? this.book_page = initObj.book_page : null;

            typeof(initObj.book_id) != "undefined" ? this.book_id = initObj.book_id : null;


            typeof(initObj.setting_item) != "undefined" ? this.setting_item = initObj.setting_item : null;
            typeof(initObj.uuid) != "undefined" ? this.uuid = initObj.uuid : null;

            typeof(initObj.image_url) != "undefined" ? this.image_url = initObj.image_url : null;
            typeof(initObj.image_updated) != "undefined" ? this.image_updated = new Date(initObj.image_updated) : null;

            typeof(initObj.parent_type) != "undefined" ? this.parent_type = initObj.parent_type : null;
            typeof(initObj.parent_uuid) != "undefined" ? this.parent_uuid = initObj.parent_uuid : this.parent_uuid = "";

            typeof(initObj.is_custom) != "undefined" ? this.is_custom = initObj.is_custom : null;

            if( initObj.book_def ) {
                this.book_obj = new Book( initObj.book_def )
                this.book_id = initObj.book_def.id;
            } else {
                let found = false;

                if( book_list ) {
                    for( let book_def of book_list ) {
                        if( book_def.id == initObj.book_id ) {
                            this.book_obj = new Book( book_def );
                            found = true;
                            break;
                        }

                    }
                }
                if( found == false  ) {
                    this.book_obj = new Book();
                    this.book_obj.name = "UNDEFINED BOOK?"
                    this.book_obj.shortName = "UNDEF"
                    this.book_id = 0;
                }
            }

            !this.save_id && typeof(initObj.saveID) != "undefined" && initObj.saveID > 0 ? this.save_id = initObj.saveID : null;
            !this.save_id && typeof(initObj.save_id) != "undefined" && initObj.save_id > 0 ? this.save_id = initObj.save_id : null;
            this.no_select = false;
            if( initObj.no_select ) {
                this.no_select = true;
            }
             // LEGACY
            !this.book_id && typeof(initObj.book) != "undefined" && initObj.book > 0 ? this.book_id = initObj.book : null;
            typeof(initObj.bookPage) != "undefined" ? this.book_page = initObj.bookPage : null;
            !this.book_page && typeof(initObj.page) != "undefined" && initObj.page ? this.book_page = initObj.page : null;
            typeof(initObj.settingItem) != "undefined" ? this.setting_item = initObj.settingItem : null;
            typeof(initObj.imageUpdated) != "undefined" ? this.image_updated = new Date(initObj.imageUpdated) : null;
            typeof(initObj.imageURL) != "undefined" ? this.image_url = initObj.imageURL : null;
            // console.log("super initObj.book_id", initObj?.book_id);
            if( initObj.book_id ) {
                this.book_id = initObj.book_id;
            }

            // console.log("super initObj.book_id", this.book_id);
            if( !this.book_obj || this.book_id == 0 ) {
                this.is_custom = true;
            } else {
                this.book_id = this.book_obj.id;

                if( this.book_obj.id == 0 )
                    this.is_custom = true;
            }
            if( initObj.book_id ) {
                this.book_id = initObj.book_id;
            }
            // console.log("super initObj.book_id 2", this.book_id);
            if( typeof(initObj.description) != "undefined" && initObj.description) {
                // console.log('base obj typeof( initObj.description )', initObj.name, typeof( initObj.description ), initObj.description);
		        if( typeof( initObj.description ) == "string" ) {
		 	        this.description = initObj.description;
		        } else {
		 	        this.description = initObj.description.join("\n");
		        }
	        } else {
		        this.description = "";
    	    }
        }

        // if( !this.description ) {
        //     this.description = [];
        // }

    }

    public export(): IBaseObjectExport {

        let rv: IBaseObjectExport = {
            id: this.id,

            saveID: this.save_id,
            parent_uuid: this.parent_uuid,
            parent_type: this.parent_type,

            image_url: this.image_url,
            image_updated: this.image_updated,

            uuid: this.uuid,
            bookPage: this.book_page,
            is_custom: this.is_custom ? true : false,
            active: this.active ? true : false,

            book_id: this.book_id,
            type: this.type,

            name: this.name,
            name_plural: this.namePlural,

            no_select: this.no_select,

            version_of: this.versionOf,
            deleted: this.deleted ? true : false,
            deleted_by: this.deletedUser ? this.deletedUser.id : 0,
            deleted_on: this.deletedOn,
            created_by: this.createdUser ? this.createdUser.id : 0,
            created_on: this.createdOn,
            updated_by: this.updatedUser ? this.updatedUser.id : 0,
            updated_on: this.updatedOn,
            read_only: this.readOnly,

            summary: this.summary,
            description: this.description,

            created_by_user: undefined,
            updated_by_user: undefined,
            deleted_by_user: undefined,
            book_def: undefined,
            book_page: "",
            setting_tem: false,
            save_id: 0,
            setting_item: false,

        }

        return rv;

    }

    getBookShortName(): string {
        if( this.setting_item ) {
            return "Setting Item";
        }
        if( !this.book_obj || this.book_id == 0) {
            return "Custom";
        } else {
            if( this.book_obj && this.book_obj.shortName )
                return this.book_obj.shortName;
        }

        return "n/a";
    }

    getBookName(): string {
        if( this.is_custom  || this.book_id == 0 ) {
            return "Custom";
        } else {
            if( this.book_obj )
                return this.book_obj.name;
        }

        return "n/a";
    }

    getBookPublisher(): string {
        if( this.is_custom  || this.book_id == 0 ) {
            return "Custom";
        } else {
            if( this.book_obj )
                return this.book_obj.publisher;
        }

        return "n/a";
    }

    getBookPublished(): string {
        if( this.is_custom  || this.book_id == 0 ) {
            return "Custom";
        } else {
            if( this.book_obj )
                return this.book_obj.published;
        }

        return "n/a";
    }

    public getBookPage(
        book_short_name: string | null = null,
    ): string {

        if( book_short_name ) {
            let page = "";
                if( this.book_page ) {
                    page = replaceAll(this.book_page, "p", "");
                    page = replaceAll(page, ".", "");
                }

                if( page.trim() )
                    return book_short_name + " p." + page; // + " - " + this.book_obj.id + " - " + this.book_id;
                else
                    return book_short_name + " n/a"
        }

        if(
            !this.book_obj
            ||
            !this.book_obj.id

        ) {
            if( this.book_obj && this.book_obj.id > 0 )
                // return  this.book_obj.getShortName() + " p" + replaceAll(this.book_page, "p", "");
                return "Custom";
            else
                return "Custom";
        } else {
            if( this.setting_item ) {
                return "Setting Item";
            } else {
                let bookShortName = this.getBookShortName();
                let page = "";
                if( this.book_page ) {
                    page = replaceAll(this.book_page, "p", "");
                    page = replaceAll(page, ".", "");
                }

                if( page.trim() )
                    return bookShortName + " p." + page; // + " - " + this.book_obj.id + " - " + this.book_id;
                else
                    return bookShortName + " n/a"

            }

        }

    }

    public getLongBookPage(): string {

        if(
            !this.book_obj
            ||
            !this.book_obj.id
            // || (!bookShortName + " p" + replaceAll(this.book_page, "p", "") )
        ) {
            if( this.book_id > 0 )
                return "Custom (" + this.book_id + ")";
            else
                return "Custom";
        } else {
            if( this.setting_item ) {
                return "Setting Item";
            } else {
                let bookShortName = this.getBookName();
                let page = "";
                if( this.book_page ) {
                    page = replaceAll(this.book_page, "p", "");
                }

                if( page.trim() )
                    return bookShortName + " p." + page; // + " - " + this.book_obj.id + " - " + this.book_id;
                else
                    return bookShortName + " n/a"

            }

        }

    }

    importOptions( iVars: IBaseObjectVars | null ) {
        if( iVars ) {
            if( iVars.uuid )
                this.uuid = iVars.uuid;
        }
    }

    exportOptions(): IBaseObjectVars {
        return {
            uuid: this.uuid,
        }
    }

    getSummary(): string {
        return this.summary;
    }
}

export interface IBaseObjectVars {
    uuid: string;
}

export interface IBaseObjectExport extends IDataObjectExport {

    uuid: string;
    parent_uuid: string;
    parent_type: EParentType;

    no_select: boolean;
    is_custom: boolean;

    book_id: number;
    book_def?: IBook;

    book_page: string;

    setting_tem: boolean;
    image_url: string;
    image_updated: Date;
    save_id: number;
    setting_item: boolean;


    // legacy values - let's eradicate these!
    book?: number;
    bookPage: string;
    page?: string;

    imageUpdated?: Date;
    imageURL?: string;

    settingItem?: boolean;
    saveID?: number;
}