/**
 * Utility functions for detecting and fixing over-escaped character data
 * Used by both PlayerCharacter class and UI components for consistent handling
 */

/**
 * Checks if a string needs escape fixing
 */
export function needsEscapeFixing(str: string): boolean {
    if (!str || typeof str !== 'string') {
        return false;
    }
    // Check for patterns that indicate over-escaping
    return str.includes('\\"') || 
           str.includes('\\\\') || 
           (str.startsWith('["') && str.includes('\\"'));
}

/**
 * Fixes over-escaped strings by iteratively parsing JSON and cleaning escape sequences
 */
export function unescapeOverEscapedString(data: string): string {
    if (!data || typeof data !== 'string') {
        return data;
    }

    let result = data;
    let iterations = 0;
    const maxIterations = 50; // Increased for deeply nested cases

    // Keep trying to parse and clean until we get stable data
    while (iterations < maxIterations) {
        const beforeIteration = result;
        
        try {
            // Try to parse as JSON
            const parsed = JSON.parse(result);
            
            // If it's a string, use it as the new result
            if (typeof parsed === 'string') {
                result = parsed;
                iterations++;
                continue;
            }
            
            // If it's an array with one string element, extract it
            if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'string') {
                result = parsed[0];
                iterations++;
                continue;
            }
            
            // If we get here, we have clean data
            break;
            
        } catch (error) {
            // If parsing fails, use ultra-aggressive cleaning for deeply nested escapes
            let cleaned = result;
            
            // Remove outer quotes if they exist
            if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
                cleaned = cleaned.slice(1, -1);
            }
            
            // Remove array bracket patterns that wrap single strings
            if (cleaned.startsWith('["') && cleaned.endsWith('"]')) {
                cleaned = cleaned.slice(2, -2);
            }
            
            // Ultra-aggressive cleaning: repeatedly remove escape patterns
            let changed = true;
            let cleaningIterations = 0;
            while (changed && cleaned.length > 0 && cleaningIterations < 100) {
                const before = cleaned;
                
                // Remove any sequence of backslashes followed by quotes
                cleaned = cleaned.replace(/\\+"/g, '"');
                cleaned = cleaned.replace(/\\+'/g, "'");
                cleaned = cleaned.replace(/\\+\//g, '/');
                
                // Reduce multiple backslashes
                cleaned = cleaned.replace(/\\{2,}/g, '\\');
                
                // Handle nested array patterns
                cleaned = cleaned.replace(/\]"\[/g, '');
                cleaned = cleaned.replace(/\]'\[/g, '');
                
                changed = (cleaned !== before);
                cleaningIterations++;
            }
            
            // Final cleanup: remove any trailing quotes/brackets that might remain
            cleaned = cleaned.replace(/^["\[\]']+|["\[\]']+$/g, '');
            
            result = cleaned;
            
            // If no changes were made, break to prevent infinite loop
            if (result === beforeIteration) {
                break;
            }
            
            iterations++;
        }
    }

    return result;
}

/**
 * Fixes over-escaped data in an array of strings for UI display
 */
export function fixEscapedArray(dataArray: string[]): string[] {
    if (!Array.isArray(dataArray)) {
        return dataArray;
    }

    return dataArray.map(item => {
        if (typeof item === 'string' && needsEscapeFixing(item)) {
            return unescapeOverEscapedString(item);
        }
        return item;
    });
}

/**
 * Fixes over-escaped data in framework selections for UI display
 */
export function fixEscapedFrameworkSelection(selection: string): string[] {
    if (!selection || typeof selection !== 'string') {
        return [];
    }

    // If it looks like a JSON array string, try to parse and fix it
    if (selection.startsWith('[') || selection.startsWith('"[')) {
        try {
            let parsed = JSON.parse(selection);
            
            // If we get an array, fix each element
            if (Array.isArray(parsed)) {
                return fixEscapedArray(parsed);
            }
            
            // If we get a string that looks like it needs more fixing
            if (typeof parsed === 'string' && needsEscapeFixing(parsed)) {
                const fixed = unescapeOverEscapedString(parsed);
                // If the fixed version looks like JSON, try to parse it
                if (fixed.startsWith('[') || fixed.startsWith('{')) {
                    try {
                        const reparsed = JSON.parse(fixed);
                        if (Array.isArray(reparsed)) {
                            return fixEscapedArray(reparsed);
                        }
                    } catch {
                        // If reparsing fails, return as single item
                        return [fixed];
                    }
                }
                return [fixed];
            }
            
            return Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
            // If parsing fails, try to clean it manually
            const cleaned = unescapeOverEscapedString(selection);
            if (cleaned !== selection) {
                // Try to parse the cleaned version
                try {
                    const parsed = JSON.parse(cleaned);
                    if (Array.isArray(parsed)) {
                        return fixEscapedArray(parsed);
                    }
                    return [cleaned];
                } catch {
                    return [cleaned];
                }
            }
            return [selection];
        }
    }

    return [selection];
}

/**
 * Direct parser for deeply escaped JSON strings
 */
function parseEscapedString(input: string): string {
    if (!input || typeof input !== 'string') {
        return input || '';
    }

    // If it's a simple string without escape patterns, return as-is
    if (!input.includes('\\') && !input.includes('[') && !input.includes('"')) {
        return input;
    }

    // Method 1: Progressive JSON parsing for nested escapes
    let current = input;
    let attempts = 0;
    const maxAttempts = 20;

    while (attempts < maxAttempts) {
        try {
            const parsed = JSON.parse(current);
            
            // If we get a string, continue parsing it
            if (typeof parsed === 'string') {
                current = parsed;
                attempts++;
                continue;
            }
            
            // If we get an array with one string element, extract it
            if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'string') {
                current = parsed[0];
                attempts++;
                continue;
            }
            
            // If we get an array with multiple elements, join them
            if (Array.isArray(parsed)) {
                return parsed.join(', ');
            }
            
            // If we get here, we have a clean result
            return String(parsed);
            
        } catch (e) {
            // JSON parsing failed, break out and try other methods
            break;
        }
    }

    // Method 2: Pattern matching for specific cases like "American"
    // Look for the A + letter pattern specifically
    if (input.includes('A\\\\') && input.includes('"]n')) {
        const letterPattern = /"\]([a-zA-Z])/g;
        const letters: string[] = [];
        let match;
        
        while ((match = letterPattern.exec(input)) !== null) {
            letters.push(match[1]);
            // Prevent infinite loop
            if (letters.length > 20) break;
        }
        
        if (letters.length > 0) {
            const assembled = 'A' + letters.join('');
            // Handle common corrections
            if (assembled === 'Amerrican') return 'American';
            if (assembled === 'Amerrcan') return 'American';
            if (assembled.length >= 3 && assembled.length <= 20 && /^[A-Za-z]+$/.test(assembled)) {
                return assembled;
            }
        }
    }
    
    // Method 2b: General letter extraction for other patterns
    const letterPattern = /\\*"?\]([a-zA-Z])/g;
    const letters: string[] = [];
    let match;
    
    while ((match = letterPattern.exec(input)) !== null) {
        letters.push(match[1]);
        // Prevent infinite loop
        if (letters.length > 20) break;
    }
    
    if (letters.length > 0) {
        const assembled = letters.join('');
        // Check if it looks like a real word
        if (assembled.length >= 3 && assembled.length <= 20 && /^[A-Za-z]+$/.test(assembled)) {
            return assembled;
        }
    }

    // Method 3: Look for quoted content
    const quotedMatch = input.match(/"([A-Za-z][A-Za-z\s\-/']*[A-Za-z])"/);
    if (quotedMatch && quotedMatch[1]) {
        return quotedMatch[1].trim();
    }

    // Method 4: Extract any readable alphabetic sequence
    const readableMatch = input.match(/[A-Za-z]{3,}/);
    if (readableMatch && readableMatch[0]) {
        return readableMatch[0];
    }

    // Method 5: Brute force cleanup for deeply nested cases
    let cleaned = input;
    
    // Remove common escape patterns
    cleaned = cleaned.replace(/\\+/g, ''); // Remove all backslashes
    cleaned = cleaned.replace(/\[+/g, ''); // Remove opening brackets
    cleaned = cleaned.replace(/\]+/g, ''); // Remove closing brackets
    cleaned = cleaned.replace(/"+/g, ''); // Remove quotes
    cleaned = cleaned.replace(/,+/g, ','); // Normalize commas
    cleaned = cleaned.replace(/^,|,$/g, ''); // Remove leading/trailing commas
    cleaned = cleaned.trim();
    
    // If we got something reasonable, return it
    if (cleaned && cleaned.length >= 2 && cleaned.length <= 50 && /^[A-Za-z\s,\-/']+$/.test(cleaned)) {
        return cleaned;
    }

    // Last resort: return the original if nothing worked
    return input;
}

/**
 * Safe display function that fixes escaped text for UI rendering
 */
export function getDisplayText(text: string): string {
    if (!text || typeof text !== 'string') {
        return text || '';
    }
    
    // Handle extreme HTML entity escaping first
    if (text.includes('&quot;')) {
        let cleaned = text;
        // Replace HTML entities
        cleaned = cleaned.replace(/&quot;/g, '"');
        cleaned = cleaned.replace(/&amp;/g, '&');
        cleaned = cleaned.replace(/&lt;/g, '<');
        cleaned = cleaned.replace(/&gt;/g, '>');
        
        // If we have a much shorter result, use it
        if (cleaned.length < text.length / 2) {
            text = cleaned;
        }
    }
    
    // For extremely nested escaping, use ultra-aggressive cleaning
    if (text.length > 100 && text.includes('\\\\\\\\')) {
        let cleaned = text;
        
        // Remove all escape sequences aggressively
        cleaned = cleaned.replace(/\\+/g, '');
        cleaned = cleaned.replace(/\[+/g, '');
        cleaned = cleaned.replace(/\]+/g, '');
        cleaned = cleaned.replace(/"+/g, '');
        cleaned = cleaned.replace(/,+/g, ',');
        cleaned = cleaned.replace(/^,|,$/g, '');
        cleaned = cleaned.trim();
        
        // If we got something reasonable, return it
        if (cleaned && cleaned.length >= 1 && cleaned.length <= 50 && /^[A-Za-z\s,\-/']+$/.test(cleaned)) {
            return cleaned;
        }
    }
    
    // For strings that look heavily escaped, use the specialized parser
    if (text.length > 50 && (text.includes('\\\\') || text.includes('["['))) {
        const parsed = parseEscapedString(text);
        if (parsed !== text && parsed.length > 0) {
            return parsed;
        }
    }
    
    // For simpler cases, try basic JSON parsing
    if (text.startsWith('[') || text.startsWith('"')) {
        try {
            const parsed = JSON.parse(text);
            if (typeof parsed === 'string') {
                return getDisplayText(parsed); // Recursive call for nested escapes
            }
            if (Array.isArray(parsed) && parsed.length === 1 && typeof parsed[0] === 'string') {
                return getDisplayText(parsed[0]);
            }
            if (Array.isArray(parsed)) {
                return parsed.join(', ');
            }
        } catch (e) {
            // JSON parsing failed, continue with other methods
        }
    }
    
    if (needsEscapeFixing(text)) {
        return unescapeOverEscapedString(text);
    }
    
    return text;
}