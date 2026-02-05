import { IChargenData } from "../interfaces/IChargenData";

export function getSkillBookID(
    skillName: string,
    chargenData: IChargenData,
    bookID: number,
): number {

    if( bookID == 9 )
        return 9;
    // try for current id book
    for( let book of chargenData.books ) {
        if( book.id == bookID ) {
            for( let skill of book.skill_list ) {
                if( skillName.toLowerCase().trim().startsWith( skill.name.trim().toLowerCase() )) {
                    return book.id;
                }
            }
        }
    }

    // try for current id book
    // for( let book of chargenData.books ) {

    // }

    return 9;
}