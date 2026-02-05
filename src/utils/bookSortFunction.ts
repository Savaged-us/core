import { IBook } from '../classes/book';

export  function bookSortFunction( a: IBook, b:IBook,): number {
    if( a.primary > b.primary ) {
        return -1
    } else if( a.primary < b.primary ) {
        return 1
    } else {
        if( a.core > b.core ) {
            return -1
        } else if( a.core < b.core ) {
            return 1
        } else {
            if( a.swade_optimized > b.swade_optimized ) {
                return -1
            } else if( a.swade_optimized < b.swade_optimized ) {
                return 1
            } else {
                if( a.name > b.name ) {
                    return 1
                } else if( a.name < b.name ) {
                        return -1
                }  else {
                    return 0;
                }
            }
        }
    }

};