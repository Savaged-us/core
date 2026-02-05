export function isRiftsBookID( bookID: number ): boolean {

    if(
        bookID == 81 // TPLG
        ||
        bookID == 91 // Arcana && Myst
        ||
        bookID == 92 // Blood & Banes
        ||
        bookID == 93 // EoH
        ||
        bookID == 94 // TPFG
        ||
        bookID == 96   // Foes
        ||
        bookID == 129 // coalition
    ) {
        return true;
    }

    return false;
}