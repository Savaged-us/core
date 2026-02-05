export function emptyTextArray( data: string | string[] ): boolean {
    if( typeof(data) == "string" ) {
        if( data.trim() == "" )
            return true;
        else
            return false;
    } else {
        let stringData = data.join("\n").trim();
        if( stringData.trim() == "" )
            return true;
        else
            return false;
    }
}