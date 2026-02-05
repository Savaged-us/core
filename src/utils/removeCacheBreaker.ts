export function removeCacheBreaker( imgURL: string ): string {
    if( imgURL.indexOf("?") > -1 ) {
        imgURL = imgURL.substring(0, imgURL.indexOf("?"));
    }

    return imgURL;
}