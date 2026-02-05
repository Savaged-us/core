export function removeExtraImageURL( imageString: string ): string {
    if( imageString.indexOf("?") > -1 ) {
        imageString = imageString.substring(0, imageString.indexOf("?"));
    }

    imageString = imageString.replace("http://savaged.us", "");
    imageString = imageString.replace("https://savaged.us", "");
    imageString = imageString.replace("http://localhost:5001", "");
    imageString = imageString.replace("http://localhost:5000", "");

    return imageString;
}