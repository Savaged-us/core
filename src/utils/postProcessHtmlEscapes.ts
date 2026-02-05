/**
 * Post-process HTML to fix deeply nested escape patterns that appear in the final output
 * This handles cases where escaped JSON patterns make it into the rendered HTML
 */

import { parseEscapedString } from './parseEscapedString';
import { parseAndFixSkillsInHtml } from './skillValueParser';

/**
 * Scans HTML content and fixes any deeply nested escape patterns
 * @param html The HTML content to scan and fix
 * @returns The cleaned HTML content
 */
export function postProcessHtmlEscapes(html: string): string {
    if (!html || typeof html !== 'string') {
        return html || '';
    }

    let fixed = html;
    let changesMade = false;
    
    // FIRST: Use targeted skills/languages parsing
    const skillsParsed = parseAndFixSkillsInHtml(fixed);
    if (skillsParsed !== fixed) {
        fixed = skillsParsed;
        changesMade = true;
        console.log('Applied targeted skills/languages parsing');
    }

    // Pattern 1: The specific Roy's American pattern
    const royAmericanPattern = /\["?\["?\["?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?A\\?"?\]\\?"?\]m\\?"?\]e\\?"?\]r\\?"?\]r\\?"?\]i"\]c"\]a"\]n/g;
    if (royAmericanPattern.test(fixed)) {
        fixed = fixed.replace(royAmericanPattern, 'American');
        changesMade = true;
        console.log('Fixed Roy American pattern in HTML');
    }

    // Pattern 2: Any deeply nested bracket patterns that start with [" and end with "]
    // This catches patterns like ["["["something"]"]"]
    const deepBracketPattern = /\["["\[\]\\]*[A-Za-z]["\[\]\\]*"\]/g;
    const matches = fixed.match(deepBracketPattern);
    if (matches) {
        for (const match of matches) {
            if (match.length > 20) { // Only process long patterns that are likely escaped
                try {
                    const parsed = parseEscapedString(match);
                    if (parsed && parsed !== match && parsed.length > 0 && parsed.length < 50) {
                        fixed = fixed.replace(match, parsed);
                        changesMade = true;
                        console.log(`Fixed deeply nested pattern: ${match.substring(0, 30)}... -> ${parsed}`);
                    }
                } catch (e) {
                    // If parsing fails, try a simpler approach
                    const simpleExtract = match.match(/[A-Za-z]{3,}/);
                    if (simpleExtract && simpleExtract[0]) {
                        fixed = fixed.replace(match, simpleExtract[0]);
                        changesMade = true;
                        console.log(`Simple extract: ${match.substring(0, 30)}... -> ${simpleExtract[0]}`);
                    }
                }
            }
        }
    }

    // Pattern 3: Look for any content between Language ( and ) that has escape patterns
    const languagePattern = /Language \(([^)]*)\)/g;
    fixed = fixed.replace(languagePattern, (fullMatch, content) => {
        if (content.includes('[') && content.includes('"') && content.length > 20) {
            try {
                const parsed = parseEscapedString(content);
                if (parsed && parsed !== content && parsed.length > 0 && parsed.length < 50) {
                    changesMade = true;
                    console.log(`Fixed language content: ${content.substring(0, 30)}... -> ${parsed}`);
                    return `Language (${parsed})`;
                }
            } catch (e) {
                // Try simple extraction
                const simpleExtract = content.match(/[A-Za-z]{3,}/);
                if (simpleExtract && simpleExtract[0]) {
                    changesMade = true;
                    console.log(`Simple language extract: ${content.substring(0, 30)}... -> ${simpleExtract[0]}`);
                    return `Language (${simpleExtract[0]})`;
                }
            }
        }
        return fullMatch;
    });

    // Pattern 4: Fix standalone deeply escaped content at the start of lines
    // This catches patterns like ["["["..."]] (d8)
    const standalonePattern = /^(\s*)(\["["\[\]\\]*[A-Za-z]["\[\]\\]*"\])(\s*\([^)]*\))?/gm;
    fixed = fixed.replace(standalonePattern, (fullMatch, whitespace, escapedContent, suffix) => {
        if (escapedContent.length > 20) {
            try {
                const parsed = parseEscapedString(escapedContent);
                if (parsed && parsed !== escapedContent && parsed.length > 0 && parsed.length < 50) {
                    changesMade = true;
                    console.log(`Fixed standalone pattern: ${escapedContent.substring(0, 30)}... -> ${parsed}`);
                    return whitespace + parsed + (suffix || '');
                }
            } catch (e) {
                const simpleExtract = escapedContent.match(/[A-Za-z]{3,}/);
                if (simpleExtract && simpleExtract[0]) {
                    changesMade = true;
                    console.log(`Simple standalone extract: ${escapedContent.substring(0, 30)}... -> ${simpleExtract[0]}`);
                    return whitespace + simpleExtract[0] + (suffix || '');
                }
            }
        }
        return fullMatch;
    });

    if (changesMade) {
        console.log('HTML post-processing fixed escape patterns');
    }

    return fixed;
}

/**
 * Checks if HTML contains deeply nested escape patterns that need post-processing
 */
export function htmlNeedsPostProcessing(html: string): boolean {
    if (!html || typeof html !== 'string') {
        return false;
    }

    // Check for Roy's specific pattern
    if (/\["?\["?\["?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?A\\?"?\]\\?"?\]m\\?"?\]e\\?"?\]r\\?"?\]r\\?"?\]i"\]c"\]a"\]n/.test(html)) {
        return true;
    }

    // Check for any deeply nested bracket patterns with letters
    if (/\["["\[\]\\]*[A-Za-z]["\[\]\\]*"\]/.test(html)) {
        return true;
    }

    // Check for Language entries with suspicious content
    if (/Language \([^)]*\[.*".*\].*\)/.test(html)) {
        return true;
    }
    
    // Check for Skills: lines with escape patterns
    if (/Skills:.*\[.*".*\]/.test(html)) {
        return true;
    }
    
    // Check for Languages: lines with escape patterns
    if (/Languages:.*\[.*".*\]/.test(html)) {
        return true;
    }

    return false;
}