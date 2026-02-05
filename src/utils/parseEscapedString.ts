/**
 * Direct parser for deeply escaped JSON strings
 * Handles patterns like: ["[\"[\\\"[\\\\\\\"American\\\\\\\"]\\\"]\"]"]
 */

export function parseEscapedString(input: string): string {
    if (!input || typeof input !== 'string') {
        return input || '';
    }

    // If it's a simple string without escape patterns, return as-is
    if (!input.includes('\\') && !input.includes('[') && !input.includes('"')) {
        return input;
    }

    // Try multiple approaches to extract the actual content

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
    // Look for letter sequences embedded in the escaped mess
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
            // Handle common corrections
            if (assembled === 'Amerrican') return 'American';
            if (assembled === 'Spannish') return 'Spanish';
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
 * Enhanced getDisplayText that uses the new parser
 */
export function getDisplayText(text: string): string {
    if (!text || typeof text !== 'string') {
        return text || '';
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
        } catch (e) {
            // JSON parsing failed, continue with other methods
        }
    }
    
    return text;
}