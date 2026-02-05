/**
 * Skill value parser to identify and fix escaped skill names and specializations
 * Specifically handles skills with deeply nested escape patterns
 */

import { parseEscapedString } from './parseEscapedString';

export interface SkillEntry {
    name: string;
    specialization?: string;
    value: string;
    originalText?: string;
}

/**
 * Detects if a skill name or specialization contains escape patterns
 */
function hasEscapePattern(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    // Check for deeply nested patterns
    if (text.includes('["') && text.includes('"]') && text.length > 20) return true;
    
    // Check for multiple backslashes
    if (text.includes('\\\\') && text.includes('"')) return true;
    
    // Check for JSON array patterns
    if (text.match(/^\[".*"\]$/) && text.length > 10) return true;
    
    return false;
}

/**
 * Fixes escaped skill name or specialization
 */
function fixSkillValue(text: string): string {
    if (!text || !hasEscapePattern(text)) return text;
    
    try {
        // Try the comprehensive parser first
        const parsed = parseEscapedString(text);
        if (parsed && parsed !== text && parsed.length > 0 && parsed.length < 100) {
            console.log(`Fixed skill value: ${text.substring(0, 30)}... -> ${parsed}`);
            return parsed;
        }
    } catch (e) {
        // If parsing fails, try pattern matching
    }
    
    // Fallback: extract any readable alphabetic content
    const readableMatch = text.match(/[A-Za-z][A-Za-z\s\/\-']{2,}/);
    if (readableMatch && readableMatch[0]) {
        const extracted = readableMatch[0].trim();
        if (extracted.length >= 3 && extracted.length <= 50) {
            console.log(`Extracted skill value: ${text.substring(0, 30)}... -> ${extracted}`);
            return extracted;
        }
    }
    
    return text;
}

/**
 * Parses a skills line and fixes any escaped values
 * Expected format: "Skills: Skill1 d6, Skill2 (specialization) d8, ..."
 */
export function parseAndFixSkillsLine(skillsText: string): string {
    if (!skillsText || !skillsText.includes('Skills:')) {
        return skillsText;
    }
    
    // Split on "Skills:" to get the prefix and the skills part
    const parts = skillsText.split('Skills:');
    if (parts.length !== 2) return skillsText;
    
    const prefix = parts[0] + 'Skills:';
    const skillsPart = parts[1];
    
    // Split skills by comma
    const skillEntries = skillsPart.split(',');
    const fixedSkills: string[] = [];
    
    for (let entry of skillEntries) {
        entry = entry.trim();
        if (!entry) continue;
        
        // Parse skill entry: "Skill Name (specialization) d8" or "Skill Name d6"
        const skillMatch = entry.match(/^(.+?)\s+(d\d+(?:\+\d+)?)$/);
        if (skillMatch) {
            let skillPart = skillMatch[1].trim();
            const dicePart = skillMatch[2];
            
            // Check if this skill has a specialization in parentheses
            const specMatch = skillPart.match(/^(.+?)\s*\((.+)\)$/);
            if (specMatch) {
                // Has specialization
                let skillName = specMatch[1].trim();
                let specialization = specMatch[2].trim();
                
                // Fix escaped patterns
                const fixedSkillName = fixSkillValue(skillName);
                const fixedSpecialization = fixSkillValue(specialization);
                
                if (fixedSkillName !== skillName || fixedSpecialization !== specialization) {
                    console.log(`Fixed skill with specialization: "${skillName} (${specialization})" -> "${fixedSkillName} (${fixedSpecialization})"`);
                }
                
                fixedSkills.push(`${fixedSkillName} (${fixedSpecialization}) ${dicePart}`);
            } else {
                // No specialization
                const fixedSkillName = fixSkillValue(skillPart);
                
                if (fixedSkillName !== skillPart) {
                    console.log(`Fixed skill: "${skillPart}" -> "${fixedSkillName}"`);
                }
                
                fixedSkills.push(`${fixedSkillName} ${dicePart}`);
            }
        } else {
            // Couldn't parse the entry, keep as-is but try to fix any obvious escape patterns
            if (hasEscapePattern(entry)) {
                const fixed = fixSkillValue(entry);
                fixedSkills.push(fixed);
            } else {
                fixedSkills.push(entry);
            }
        }
    }
    
    return prefix + ' ' + fixedSkills.join(', ');
}

/**
 * Parses a languages line and fixes any escaped values
 * Expected format: "Languages: Language1 (d8), Language2 (d6), ..."
 */
export function parseAndFixLanguagesLine(languagesText: string): string {
    if (!languagesText || !languagesText.includes('Languages:')) {
        return languagesText;
    }
    
    // Split on "Languages:" to get the prefix and the languages part
    const parts = languagesText.split('Languages:');
    if (parts.length !== 2) return languagesText;
    
    const prefix = parts[0] + 'Languages:';
    const languagesPart = parts[1];
    
    // Split languages by comma
    const languageEntries = languagesPart.split(',');
    const fixedLanguages: string[] = [];
    
    for (let entry of languageEntries) {
        entry = entry.trim();
        if (!entry) continue;
        
        // Parse language entry: "Language (d8)" or "Language (native, d8)"
        const langMatch = entry.match(/^(.+?)\s*\(([^)]+)\)$/);
        if (langMatch) {
            let languageName = langMatch[1].trim();
            const dicePart = langMatch[2];
            
            // Fix escaped language name
            const fixedLanguageName = fixSkillValue(languageName);
            
            if (fixedLanguageName !== languageName) {
                console.log(`Fixed language: "${languageName}" -> "${fixedLanguageName}"`);
            }
            
            fixedLanguages.push(`${fixedLanguageName} (${dicePart})`);
        } else {
            // Couldn't parse the entry, keep as-is but try to fix any obvious escape patterns
            if (hasEscapePattern(entry)) {
                const fixed = fixSkillValue(entry);
                fixedLanguages.push(fixed);
            } else {
                fixedLanguages.push(entry);
            }
        }
    }
    
    return prefix + ' ' + fixedLanguages.join(', ');
}

/**
 * Main function to parse and fix skills and languages in HTML content
 */
export function parseAndFixSkillsInHtml(html: string): string {
    if (!html || typeof html !== 'string') {
        return html;
    }
    
    let fixed = html;
    let changesMade = false;
    
    // Fix Skills: lines
    const skillsLineRegex = /(.*Skills:\s*)([^\n\r<]+)/g;
    fixed = fixed.replace(skillsLineRegex, (match, prefix, skillsContent) => {
        const originalLine = prefix + skillsContent;
        const fixedLine = parseAndFixSkillsLine(originalLine);
        if (fixedLine !== originalLine) {
            changesMade = true;
            console.log('Fixed skills line in HTML');
        }
        return fixedLine;
    });
    
    // Fix Languages: lines
    const languagesLineRegex = /(.*Languages:\s*)([^\n\r<]+)/g;
    fixed = fixed.replace(languagesLineRegex, (match, prefix, languagesContent) => {
        const originalLine = prefix + languagesContent;
        const fixedLine = parseAndFixLanguagesLine(originalLine);
        if (fixedLine !== originalLine) {
            changesMade = true;
            console.log('Fixed languages line in HTML');
        }
        return fixedLine;
    });
    
    if (changesMade) {
        console.log('HTML skills/languages parsing completed with fixes');
    }
    
    return fixed;
}