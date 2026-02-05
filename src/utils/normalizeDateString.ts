export function normalizeDateString(  date: Date | string | null ): string  {
    if( !date ) {
        return "n/a"
    }
    if( typeof(date) == "string" ) {
        let dateString = date;
        dateString = dateString.replace(".000Z", "");
        dateString = dateString.replace("T", " ");

        dateString = dateString.replace("Z", "");

        if( dateString.indexOf(".") > -1 ) {
            dateString = dateString.substring(0,  dateString.indexOf(".") );
        }

        date = new Date(dateString.replace(/-/g, "/") + " UTC");

        if (isNaN(date.getTime())) {
            return "n/a"
        }
    }
    let dateStr = date.toUTCString();
    if( !dateStr ) {
        return "n/a"
    }

    return dateStr;

}