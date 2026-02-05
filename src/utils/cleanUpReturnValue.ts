export function cleanUpReturnValue( data: any): any {
    data.deleted = false;
    return data;
    // for( let key of Object.keys(data) ) {
    //     if( isEmpty(data[key]) ) {
    //         delete data[key];
    //     } else {
    //         if( typeof( data[key] ) == "object" ) {
    //             cleanUpReturnValue( data[key] );
    //         }
    //     }
    // }

    // return data;
}
