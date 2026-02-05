export function clearOutImageCacheBuster( imageString: string ): string {
    if( !imageString ) {
        return "";
    }
    if( imageString.indexOf("?") > -1 ) {
        imageString = imageString.substring(0, imageString.indexOf("?"));
    }

    imageString = imageString.replace("/data-images/", "");

    return imageString;
}