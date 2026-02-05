export default function HTMLToString( ToString: string ): string {

    const replacements = [
        {
            from: '<br />',
            to: ''
        },
        {
            from: '<strong>',
            to: ''
        },
        {
            from: '</strong>',
            to: ''
        },
        {
            from: '<h2>',
            to: ''
        },
        {
            from: '</h2>',
            to: ''
        },
        {
            from: '<h1>',
            to: ''
        },
        {
            from: '</h1>',
            to: ''
        },
        {
            from: '<p>',
            to: ''
        },
        {
            from: '</p>',
            to: '\n'
        },
        {
            from: '<h4>',
            to: ''
        },
        {
            from: '</h4>',
            to: '\n'
        },
        {
            from: '<ul>',
            to: ''
        },
        {
            from: '<ul class="weapon-list">',
            to: ''
        },
        {
            from: '<ul class="no-margins">',
            to: ''
        },
        {
            from: '</ul>',
            to: '\n'
        },
        {
            from: '<li>',
            to: '\t* '
        },
        {
            from: '</li>',
            to: '\n'
        },
        {
            from: '\n\n\n',
            to: '\n\n'
        },
    ];

    for (const replacement of replacements ) {
        while (ToString.indexOf(replacement.from) > -1 ) {
            ToString = ToString.replace(
                replacement.from,
                replacement.to
            );
        }
    }

    return ToString;
}