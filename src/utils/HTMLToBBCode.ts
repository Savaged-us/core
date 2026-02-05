// export default function HTMLToBBCode( ToString: string ): string {
//     const replacements = [
//         {
//             from: '<br />',
//             to: ''
//         },
//         {
//             from: '<strong>',
//             to: '[b]'
//         },
//         {
//             from: '</strong>',
//             to: '[/b]'
//         },
//         {
//             from: '<h1>',
//             to: '[b][size=28px]'
//         },
//         {
//             from: '</h1>',
//             to: '[/size][/b]'
//         },
//         {
//             from: '<h2>',
//             to: '[b][size=22px]'
//         },
//         {
//             from: '</h2>',
//             to: '[/size][/b]'
//         },
//         {
//             from: '<h3>',
//             to: '[b][size=20px]'
//         },
//         {
//             from: '</h3>',
//             to: '[/size][/b]'
//         },
//         {
//             from: '<h4>',
//             to: '[b][size=18px]'
//         },
//         {
//             from: '</h4>',
//             to: '[/size][/b]'
//         },
//         {
//             from: '<p>',
//             to: ''
//         },
//         {
//             from: '</p>',
//             to: '\n'
//         },
//         {
//             from: '<ul>',
//             to: '[list]'
//         },
//         {
//             from: '<ul class="weapon-list">',
//             to: '[list]'
//         },
//         {
//             from: '<ul class="no-margins">',
//             to: '[list]'
//         },
//         {
//             from: '</ul>',
//             to: '[/list]\n'
//         },
//         {
//             from: '<li>',
//             to: '[*] '
//         },
//         {
//             from: '</li>',
//             to: '\n'
//         },
//         {
//             from: '\n\n\n',
//             to: '\n\n'
//         },
//     ];

//     for (const replacement of replacements ) {
//         while (ToString.indexOf(replacement.from) > -1 ) {
//             ToString = ToString.replace(
//                 replacement.from,
//                 replacement.to
//             );
//         }
//     }

//     return ToString;
// }