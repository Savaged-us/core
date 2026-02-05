import { IBook } from "../classes/book";
import { IBaseObjectExport } from "../classes/_base_object";
import { IChargenData } from "../interfaces/IChargenData";

export function assignBookDefs(
    chargenData: IChargenData
): IChargenData {
    for( let list of Object.keys( chargenData)) {
        //@ts-ignore
        for( let item of chargenData[list] ) {
            if( typeof(item.book_def) == "undefined" || !item.book_def ) {

                item = _assignBookObj( item, chargenData.books);
                // console.log("book.id", item.name, item.book_id, item.book_def ? item.book_def.name : item.name );
            }
        }
    }

    return chargenData
}

function _assignBookObj(
    item: IBaseObjectExport,
    bookList: IBook[],
): IBaseObjectExport {

    item.book_def = undefined;
    for( let book of bookList ) {
        if( item.book_id === book.id ) {
            item.book_def = book;
            return item;
        }
    }

    return item;
}