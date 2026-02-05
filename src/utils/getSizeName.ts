export function getSizeName( sizeNumber: number ): string {
    if( sizeNumber <= -4 ) {
        return "Tiny"
    } else if ( sizeNumber == -3 ) {
        return "Very Small"
    } else if ( sizeNumber == -2 ) {
        return "Small"
    } else if ( sizeNumber >= -1 && sizeNumber <= 3 ) {
        return "Normal"
    } else if ( sizeNumber >= 4 && sizeNumber <= 7 ) {
        return "Large"
    } else if ( sizeNumber >= 8 && sizeNumber <= 11 ) {
        return "Huge"
    } else if ( sizeNumber >= 12  ) {
        return "Gargantuan"
    }
    return "n/a";
}

export function getSizeExtraWounds( sizeNumber: number ): number {
    if (  sizeNumber <= 3 ) {
        return 0
    } else if ( sizeNumber >= 4 && sizeNumber <= 7 ) {
        return 1
    } else if ( sizeNumber >= 8 && sizeNumber <= 11 ) {
        return 2
    } else if ( sizeNumber >= 12  ) {
        return 3
    }
    return 0;
}

export function getSizeScaleModifier( sizeNumber: number ): number {
    if( sizeNumber <= -4 ) {
        return -6
    } else if ( sizeNumber == -3 ) {
        return -4
    } else if ( sizeNumber == -2 ) {
        return -2
    } else if ( sizeNumber >= -1 && sizeNumber <= 3 ) {
        return 0
    } else if ( sizeNumber >= 4 && sizeNumber <= 7 ) {
        return 2
    } else if ( sizeNumber >= 8 && sizeNumber <= 11 ) {
        return 4
    } else if ( sizeNumber >= 12  ) {
        return 6
    }
    return 0;
}