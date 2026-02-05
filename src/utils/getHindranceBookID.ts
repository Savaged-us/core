import { IChargenData } from "../interfaces/IChargenData";

export function getHindranceBookID(
    itemName: string,
    chargenData: IChargenData,
    bookID: number,
): number {

    if( bookID == 9 )
    return 9;

    // try for current id book
    for( let item of chargenData.hindrances ) {
        if( item.book_id == bookID ) {
            if( itemName.trim().toLowerCase().startsWith( item.name.trim().toLowerCase() )  ) {
                return item.book_id;
            }
        }
    }

    return 9;

}