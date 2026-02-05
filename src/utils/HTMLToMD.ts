export default function HTMLToMD( ToString: string ): string {
    // Handle null/undefined inputs
    if (ToString == null || typeof ToString !== 'string') {
        return '';
    }

    const replacements = [
        {
            from: '<br />',
            to: ''
        },
        {
            from: '<br/>',
            to: ''
        },
        {
            from: '<strong>',
            to: '**'
        },
        {
            from: '</strong>',
            to: '**'
        },
        {
            from: '<h1>',
            to: '**'
        },
        {
            from: '</h1>',
            to: '**'
        },
        {
            from: '<h2>',
            to: '**'
        },
        {
            from: '</h2>',
            to: '**'
        },
        {
            from: '<h3>',
            to: '**'
        },
        {
            from: '</h3>',
            to: '**'
        },
        {
            from: '<h4>',
            to: '**'
        },
        {
            from: '</h4>',
            to: '**'
        },
        {
            from: '<h5>',
            to: '**'
        },
        {
            from: '</h5>',
            to: '**'
        },
        {
            from: '<h6>',
            to: '**'
        },
        {
            from: '</h6>',
            to: '**'
        },
        {
            from: '<em>',
            to: '_'
        },
        {
            from: '</em>',
            to: '_'
        },
        {
            from: '<i>',
            to: '_'
        },
        {
            from: '</i>',
            to: '_'
        },
        {
            from: '<p>',
            to: ''
        },
        {
            from: '</p>',
            to: ''
        },
        {
            from: '<span>',
            to: ''
        },
        {
            from: '</span>',
            to: ''
        },
        {
            from: '<div>',
            to: ''
        },
        {
            from: '</div>',
            to: ''
        },
        {
            from: '<ul>',
            to: ''
        },
        {
            from: '<ul class="no-margins">',
            to: ''
        },
        {
            from: '<ul class="weapon-list">',
            to: ''
        },
        {
            from: '</ul>',
            to: ''
        },
        {
            from: '<ol>',
            to: ''
        },
        {
            from: '</ol>',
            to: ''
        },
        {
            from: '<li>',
            to: '- '
        },
        {
            from: '</li>',
            to: ''
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