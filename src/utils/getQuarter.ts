export function getQuarter( theDate: Date ): number {
    if( theDate.getMonth() > -1 && theDate.getMonth() < 3) {
        return 1;
    }
    else if( theDate.getMonth() >= 3 && theDate.getMonth() < 6) {
        return 2;
    }
    else if( theDate.getMonth() >= 6 && theDate.getMonth() < 9) {
        return 3;
    } else {
        return 4;
    }
}