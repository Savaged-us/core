    import * as showdown from 'showdown';
    export function convertMarkdownToHTML( input: string | string[] ): string {

        if( typeof(input) != "string") {
            input = input.join("\n\n");
        }
        let converter = new showdown.Converter();

        converter.setOption("tables", true)
        converter.setOption("ghCodeBlocks", true)
        // converter.setOption("prefixHeaderId", true)
        // converter.setOption("headerLevelStart", 2);
        converter.setOption("smoothLivePreview", true)
        input = input.replace(/  /g, '\t');
        input = input.replace(/\t/g, '    ');

        return converter.makeHtml( input );;
    }