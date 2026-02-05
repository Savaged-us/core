/**
 * Utility to fix escape characters in HTML content
 * Used primarily for share page HTML that may have been cached with escape issues
 */

import { parseEscapedString } from './parseEscapedString';

/**
 * Fixes common escape character issues in HTML content
 * @param html The HTML string that may contain escape issues
 * @returns The cleaned HTML string
 */
export function fixHtmlEscapes(html: string): string {
    if (!html || typeof html !== 'string') {
        return html || '';
    }

    let fixed = html;
    
    // FIRST: Fix the specific deeply nested pattern we're seeing in Roy's character
    // Pattern: ["["["[\"[\"[\"[\"[\"[\"A\"]\"]m\"]e\"]r\"]r\"]i"]c"]a"]n
    const royAmericanPattern = /\["?\["?\["?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?A\\?"?\]\\?"?\]m\\?"?\]e\\?"?\]r\\?"?\]r\\?"?\]i"\]c"\]a"\]n/g;
    fixed = fixed.replace(royAmericanPattern, 'American');
    
    // SECOND: Look for any deeply nested JSON-like escape patterns and try to parse them
    const deepJsonPattern = /\["[^"]*"[^\]]*\][^"]*"[^\]]*\]/g;
    fixed = fixed.replace(deepJsonPattern, (match) => {
        try {
            // If the match looks like deeply escaped content, try to parse it
            if (match.length > 50 && match.includes('\\')) {
                const parsed = parseEscapedString(match);
                if (parsed && parsed !== match && parsed.length > 0 && parsed.length < 50) {
                    console.log(`Fixed deeply escaped pattern: ${match.substring(0, 50)}... -> ${parsed}`);
                    return parsed;
                }
            }
        } catch (e) {
            // If parsing fails, continue with other fixes
        }
        return match;
    });
    
    // Fix common escape patterns in HTML content
    // These patterns often appear when data has been over-escaped during JSON operations
    
    // Fix escaped quotes in HTML attributes and content
    fixed = fixed.replace(/\\"/g, '"');
    
    // Fix double-escaped quotes
    fixed = fixed.replace(/\\\\"/g, '"');
    
    // Fix escaped apostrophes
    fixed = fixed.replace(/\\'/g, "'");
    
    // Fix escaped forward slashes (common in closing tags)
    fixed = fixed.replace(/\\\//g, '/');
    
    // Fix multiple backslashes (reduce to single or remove as appropriate)
    fixed = fixed.replace(/\\{2,}/g, '\\');
    
    // Fix escaped newlines that might appear in content
    fixed = fixed.replace(/\\n/g, '\n');
    
    // Fix common patterns in lists where items are over-escaped
    // Example: <li>\"Item text\"</li> -> <li>Item text</li>
    fixed = fixed.replace(/<li>\\"([^"]*)\\"<\/li>/g, '<li>$1</li>');
    
    // Fix escaped content within strong tags
    fixed = fixed.replace(/<strong>\\"([^"]*)\\"<\/strong>/g, '<strong>$1</strong>');
    
    // Fix escaped content within spans
    fixed = fixed.replace(/<span[^>]*>\\"([^"]*)\\"<\/span>/g, function(match, content) {
        return match.replace('\\"' + content + '\\"', content);
    });
    
    // Fix array-like patterns that sometimes appear
    // Example: ["text"] -> text
    fixed = fixed.replace(/\["([^"]*)"\]/g, '$1');
    
    // Fix double-encoded HTML entities
    fixed = fixed.replace(/&amp;quot;/g, '"');
    fixed = fixed.replace(/&amp;#39;/g, "'");
    fixed = fixed.replace(/&amp;amp;/g, '&');
    
    // Remove any remaining standalone backslashes that shouldn't be there
    // This is aggressive but helps with deeply nested escapes
    // Only do this if we've already made other fixes
    if (fixed !== html) {
        // Remove backslashes that precede normal characters (not special escape sequences)
        fixed = fixed.replace(/\\([^\\'"\/nrtbf])/g, '$1');
    }
    
    return fixed;
}

/**
 * Checks if HTML content appears to have escape issues
 * @param html The HTML string to check
 * @returns true if escape issues are detected
 */
export function htmlHasEscapeIssues(html: string): boolean {
    if (!html || typeof html !== 'string') {
        return false;
    }
    
    // Check for the specific deeply nested pattern from Roy's character
    if (/\["?\["?\["?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?\[\\?"?A\\?"?\]\\?"?\]m\\?"?\]e\\?"?\]r\\?"?\]r\\?"?\]i"\]c"\]a"\]n/.test(html)) {
        return true;
    }
    
    // Check for other deeply nested JSON-like escape patterns
    if (/\["[^"]*"[^\]]*\][^"]*"[^\]]*\]/.test(html) && html.length > 50) {
        return true;
    }
    
    // Check for common escape patterns
    return /\\["']|\\\\|\\\/|\[["']|&amp;quot;|&amp;#39;/.test(html);
}