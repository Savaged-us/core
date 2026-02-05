/**
 * DisplayModule - Handles character export and display formatting
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - HTML export (exportHTML)
 * - BBCode export (getBBCode)
 * - Markdown export (getMakrdown)
 * - Plain text export (getPlainText)
 * - Tattle tale HTML (getTattleTaleHTML)
 */

import type { PlayerCharacter } from '../player_character';
import type { ISpecialAbilityItem } from '../player_character';
import type { Cyberware } from '../cyberware';
import type { RobotMod } from '../robot_mod';
import type { VehicleEntry } from '../../vehicle_entry';
import { getDisplayText } from '../../../utils/parseEscapedString';
import { emboldenBeforeColon } from '../../../utils/emboldenBeforeColon';
import { replaceAll } from '../../../utils/CommonFunctions';
import { ValidityLevel } from '../../../enums/ValidityLevel';
import { CONFIGLiveHost, CONFIGSiteTitle } from '../../../ConfigGeneral';
import SanitizeHTML from 'sanitize-html';
import { BaseModule } from './BaseModule';

export class DisplayModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Display state is managed by PlayerCharacter's reset()
    }

    /**
     * Export character as HTML
     */
    exportHTML(hideImage: boolean = false): string {
        const char = this._char as any;
        let exportHTML = "";

        if (char.image_url && !hideImage) {
            exportHTML += "<span class=\"profile-image\">";
            exportHTML += "<img src=\"" + char.image_url + "?" + char.UUID + "\">";
            exportHTML += "</span>\n";
        }

        if (char.name) {
            exportHTML += "<h1>" + getDisplayText(char.name) + "</h1>\n";
        }
        exportHTML += "<div class=\"quick-des-line\">" + char.getRaceGenderAndProfession() + "</div>\n\n";
        if (char.currentFramework && char.currentFramework.name) {
            exportHTML += "<strong>" + getDisplayText(char.currentFramework.getFrameworkType()) + "Framework</strong>: " + getDisplayText(char.currentFramework.name) + "<br />\n";
        }

        if (char.background.length > 1 || (char.background.length == 1 && char.background[0].trim() != "")) {
            exportHTML += "<h2>Background</h2>\n";
            exportHTML += "<p>" + getDisplayText(char.background).split("\n").join("</p>\n<p>") + "</p>\n\n";
        }
        if (char.description.length > 1 || (char.description.length == 1 && char.description[0].trim() != "")) {
            exportHTML += "<h2>Description</h2>\n";
            exportHTML += "<p>" + getDisplayText(char.description).split("\n").join("</p>\n<p>") + "</p>\n\n";
        }

        exportHTML += "<br />\n";

        exportHTML += "<strong>Attributes</strong>: ";
        exportHTML += char._getAttributesLine() + "<br />\n";

        const activeSkillString = char._getActiveSkillLine();
        if (activeSkillString) {
            exportHTML += "<strong>Skills</strong>: " + activeSkillString + "<br />\n";
        }

        exportHTML += "<strong>Pace</strong>: " + char.getPace().toString() + "";
        if (char._runningDie != 2) {
            exportHTML += "; <strong>Running Die</strong>: " + char.getRunningDie() + "";
        }
        if (char.getPaceFlying() > 0) {
            exportHTML += "; <strong>Flying Pace</strong>: " + char.getPaceFlying().toString() + "";
        }

        exportHTML += "; <strong>Parry</strong>: " + char.getParryHR().toString() + "";
        exportHTML += "; <strong>Toughness</strong>: " + char.getToughnessAndArmor() + "";
        if (char.setting.primaryBook && char.setting.primaryBook.hasCharisma) {
            exportHTML += ", <strong>Charisma</strong>: " + char.getCharisma().toString() + "";
        }
        if (char.getSize() != 0) {
            exportHTML += "; <strong>Size</strong>: " + char.getSizeHR() + "";
        }

        if (char.setting.usesWealthDie) {
            exportHTML += "<br /><strong>Wealth Die</strong>: " + char.getWealthDie() + "";
        }

        if (char.setting.usesRipperReason()) {
            exportHTML += "<br /><strong>Rippers Reason</strong>: " + char.getRippersReason().toString() + ", ";
            exportHTML += "<br /><strong>Rippers Status</strong>: " + char.getRippersStatus().toString() + ", ";
        }

        exportHTML += "<br />\n";

        for (const stat of char.getAdditionalStatistics()) {
            exportHTML += "<strong>" + getDisplayText(stat.name) + "</strong>: " + getDisplayText(stat.value) + "<br />";
        }

        const otherLines: string[] = [];
        if (char.setting.settingIsEnabled("sanity")) {
            otherLines.push("<strong>Sanity</strong>: " + char.getSanity().toString());
        }

        if (char.setting.settingIsEnabled("strain")) {
            otherLines.push("<strong>Strain</strong>: " + char._currentStrain + "/" + char._maxStrain);
        }

        if (char._maxRobotMods > 0) {
            otherLines.push("<strong>Robot Mods Available</strong>: " + char._currentRobotMods + "/" + char._maxRobotMods);
        }

        for (const att of char._looseAttributes) {
            if (att.enabled) {
                otherLines.push("<strong>" + getDisplayText(att.name) + "</strong>: " + getDisplayText(att.value));
            }
        }

        if (char.getWoundsMax() != 3) {
            otherLines.push("<strong>Wounds</strong>: " + char.getWoundsMax());
        }

        if (char.setting.settingIsEnabled("etu_scholarship")) {
            otherLines.push("<strong>Scholarship</strong>: " + char.getDerivedBoost("scholarship"));
        }

        if (char.setting.settingIsEnabled("etu_majors")) {
            if (char.ETUMajors.trim())
                otherLines.push("<strong>Major</strong>: " + getDisplayText(char.ETUMajors));
            else
                otherLines.push("<strong>Major</strong>: (none)");
        }
        if (char.setting.settingIsEnabled("etu_majors")) {
            if (char.ETUMajors.trim())
                otherLines.push("<strong>Extracurricular</strong>: " + getDisplayText(char.ETUExtracurricularChoice));
            else
                otherLines.push("<strong>Extracurricular</strong>: (none)");
        }

        if (otherLines.length > 0) {
            exportHTML += getDisplayText(otherLines.join("; ")) + "<br />\n";
        }

        // Hindrances
        const hinds = char._getHindranceLine();
        if (hinds) {
            exportHTML += "<strong>Hindrances</strong>: " + hinds + "<br />\n";
        }

        // Edges
        const edges = char._getEdgesLine();
        if (edges) {
            exportHTML += "<strong>Edges</strong>: " + edges + "<br />\n";
        }

        // Armor
        const armor = char.getArmorList();
        if (armor.length > 0) {
            const cleanArmor = armor.map((item: string) => getDisplayText(item));
            exportHTML += "<strong>Armor</strong>: " + getDisplayText(cleanArmor.join(", ")) + "<br />\n";
        }

        // Weapons
        const weapons = char.getWeaponList();
        if (weapons.length > 0) {
            const cleanWeapons = weapons.map((item: string) => getDisplayText(item));
            exportHTML += "<strong>Weapons</strong>: " + getDisplayText(cleanWeapons.join(", ")) + "<br />\n";
        }

        // Gear
        const gear = char.getGearList();
        if (gear.length > 0) {
            const cleanGear = gear.map((item: string) => getDisplayText(item));
            exportHTML += "<strong>Gear</strong>: " + getDisplayText(cleanGear.join(", ")) + "<br />\n";
        }

        // Languages
        const languages = char.getLanguages();
        if (languages.length > 0) {
            if (languages.length > 1) {
                exportHTML += "<strong>Languages</strong>: " + getDisplayText(languages.join(", ")) + "<br />\n";
            } else {
                exportHTML += "<strong>Language</strong>: " + getDisplayText(languages.join(", ")) + "<br />\n";
            }
        }

        if (!char.setting.usesWealthDie) {
            exportHTML += "<strong>Current Wealth</strong>: " + char.getCurrentWealthHR() + "<br />\n";
        }

        if (char.setting.usesFactions && char.getFactions().length > 0) {
            exportHTML += "<strong>Factions</strong>: " + getDisplayText(char.getFactions().join(", ")) + "<br />\n";
        }

        // Arcane Background
        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                exportHTML += "<strong>Arcane Background</strong>: " + getDisplayText(ab.name) + " (" + ab.getBookShortName() + ")<br />";
                if (!ab.doesNotProvidePowers) {
                    exportHTML += "<ul>";
                    if (char.noPowerPoints() == false && ab.hasPowerPointPool()) {
                        exportHTML += "<li><strong>" + getDisplayText(ab.powerPointsName) + "</strong>: " + ab.getMaxPowerPoints().toString() + "</li>";
                    }
                    if (ab.getPowersList().length > 0) {
                        const cleanPowersList = ab.getPowersList().map((power: string) => getDisplayText(power));
                        exportHTML += "<li><strong>Powers</strong>: " + getDisplayText(cleanPowersList.join(", ")) + "</li>";
                    } else {
                        exportHTML += "<li><strong>Powers</strong>: (none selected)</li>";
                    }

                    if (ab.getArcaneItemList().length > 0) {
                        const cleanArcaneItemsList = ab.getArcaneItemList().map((item: string) => getDisplayText(item));
                        exportHTML += "<li><strong>Arcane Items</strong>: " + getDisplayText(cleanArcaneItemsList.join(", ")) + "</li>";
                    }
                    exportHTML += "</ul>";
                }
            }
        }

        for (const edge of char.getAllEdgeObjects()) {
            if (edge && edge.arcaneBackground) {
                exportHTML += "<strong>Arcane Background</strong>: " + getDisplayText(edge.arcaneBackground.name) + " (" + edge.arcaneBackground.getBookShortName() + ")<br />";
                if (!edge.arcaneBackground.doesNotProvidePowers) {
                    exportHTML += "<ul>";
                    if (char.noPowerPoints() == false && edge.arcaneBackground.hasPowerPointPool()) {
                        exportHTML += "<li><strong>" + getDisplayText(edge.arcaneBackground.powerPointsName) + "</strong>: " + edge.arcaneBackground.getMaxPowerPoints().toString() + "</li>";
                    }
                    if (edge.arcaneBackground.getPowersList().length > 0) {
                        const cleanEdgePowersList = edge.arcaneBackground.getPowersList().map((power: string) => getDisplayText(power));
                        exportHTML += "<li><strong>Powers</strong>: " + getDisplayText(cleanEdgePowersList.join(", ")) + "</li>";
                    } else {
                        exportHTML += "<li><strong>Powers</strong>: (none selected)</li>";
                    }

                    if (edge.arcaneBackground.getArcaneItemList().length > 0) {
                        const cleanEdgeArcaneItemsList = edge.arcaneBackground.getArcaneItemList().map((item: string) => getDisplayText(item));
                        exportHTML += "<li><strong>Arcane Items</strong>: " + getDisplayText(cleanEdgeArcaneItemsList.join(", ")) + "</li>";
                    }
                    exportHTML += "</ul>";
                }
            }
        }

        // H3 Abilities
        const specialAbilities: ISpecialAbilityItem[] = char.getSpecialAbilitiesList(true, true);
        if (specialAbilities.length > 0) {
            exportHTML += "\n<h3>Special Abilities</h3>\n";
            exportHTML += "<ul>";
            for (const item of specialAbilities) {
                if (item) {
                    exportHTML += "<li><strong>" + getDisplayText(item.name) + ":</strong> " + getDisplayText(item.summary);

                    if (item.selectItems.length > 0 && item.specifyValue) {
                        exportHTML += "<p>" + emboldenBeforeColon(getDisplayText(item.specifyValue)) + "</p>";
                    }
                    exportHTML += "</li>\n";
                }
            }
            exportHTML += "</ul>\n";
        }

        // H3 Cyberware
        const cyberware: Cyberware[] = char.getUniqueCyberwarePurchased();
        if (cyberware.length > 0) {
            exportHTML += "\n<h3>Cyberware</h3>\n";
            exportHTML += "<ul>";
            for (const item of cyberware) {
                if (item) {
                    exportHTML += "<li>" + item.getHTMLLine() + "</li>";
                }
            }
            exportHTML += "</ul>\n";
        }

        // H3 Robot Mods
        const robotMods: RobotMod[] = char.getUniqeRobotModsPurchased();
        if (robotMods.length > 0) {
            exportHTML += "\n<h3>Robot Mods</h3>\n";
            exportHTML += "<ul>";
            for (const item of robotMods) {
                if (item) {
                    exportHTML += "<li>" + item.getHTMLLine() + "</li>";
                }
            }
            exportHTML += "</ul>\n";
        }

        // H3 Super Powers
        if (char.isSuper) {
            exportHTML += "\n<h3>Super Powers</h3>\n";
            exportHTML += "<ul>";
            if (char.superPowerCostTable.length === 0) {
                exportHTML += "<li>( no powers selected )</li>";
            } else {
                let lastSetName = "";
                for (const power of char.superPowerCostTable) {
                    if (power.set != "" && power.set != lastSetName) {
                        if (lastSetName !== "") {
                            exportHTML += "</ul></li>";
                        }
                        exportHTML += "<li><strong>" + getDisplayText(power.set) + " (power set)</strong><br /><ul>";
                    }

                    let powerName = getDisplayText(power.name);
                    if (power.levels > 1) {
                        powerName += " (" + power.levels + ")";
                    }
                    if (power.customDescription) {
                        if (power.mods)
                            exportHTML += "<li><strong>" + powerName + "</strong>: " + getDisplayText(power.mods) + " - " + getDisplayText(power.customDescription) + "</li>";
                        else
                            exportHTML += "<li><strong>" + powerName + "</strong> - " + getDisplayText(power.customDescription) + "</li>";
                    } else {
                        if (power.mods)
                            exportHTML += "<li><strong>" + powerName + "</strong>: " + getDisplayText(power.mods) + "</li>";
                        else
                            exportHTML += "<li><strong>" + powerName + "</strong></li>";
                    }

                    lastSetName = power.set;
                }
                if (lastSetName !== "") {
                    exportHTML += "</ul></li>\n";
                }
            }

            exportHTML += "</ul>\n";
        }

        // H3 Vehicles
        const vehicles: VehicleEntry[] = char.getVehiclesPurchased();
        if (vehicles.length > 0) {
            exportHTML += "\n<h3>Vehicles</h3>\n";
            exportHTML += "<ul>";
            for (const item of vehicles) {
                if (item) {
                    exportHTML += "<li>" + item.getHTMLLine() + "</li>";
                }
            }
            exportHTML += "</ul>\n";
        }

        if (char.getStartingBennies() != 3) {
            exportHTML += "<strong>Starting Bennies</strong>: " + char.getStartingBennies().toString() + "<br />";
        }

        // Hero's Journey
        const hj = char.getHeroesJourneys();
        if (hj.length > 0) {
            exportHTML += "\n<h3>Heroe's Journey Selections</h3>\n";
            exportHTML += "<ul>\n";
            for (const item of hj) {
                if (item) {
                    exportHTML += "<li>" + getDisplayText(item.label) + ": " + getDisplayText(item.note) + "</li>";
                }
            }
            exportHTML += "</ul>";
        }

        // Advances
        const advances = char.getAdvances();
        if (advances.length > 0) {
            exportHTML += "\n<h3>Advances</h3>\n";

            for (const adv of advances) {
                if (adv) {
                    if (adv.advanceIndex == 0) {
                        exportHTML += "<strong>" + char.getCurrentRankName(adv.advanceIndex + 1) + " Advances</strong>\n<ul>";
                    } else if (adv.advanceIndex == 3) {
                        exportHTML += "</ul><strong>" + char.getCurrentRankName(adv.advanceIndex + 1) + " Advances</strong>\n<ul>";
                    } else if (adv.advanceIndex == 7) {
                        exportHTML += "</ul><strong>" + char.getCurrentRankName(adv.advanceIndex + 1) + " Advances</strong>\n<ul>";
                    } else if (adv.advanceIndex == 11) {
                        exportHTML += "</ul><strong>" + char.getCurrentRankName(adv.advanceIndex + 1) + " Advances</strong>\n<ul>";
                    } else if (adv.advanceIndex == 15) {
                        exportHTML += "</ul><strong>" + char.getCurrentRankName(adv.advanceIndex + 1, true) + " Advances</strong>\n<ul>";
                    } else if (
                        adv.advanceIndex > 15
                        && (adv.advanceIndex + 1) % 2 == 0
                    ) {
                        exportHTML += "</ul><strong>" + char.getCurrentRankName(adv.advanceIndex + 1, true) + " Advances</strong>\n<ul>";
                    }

                    exportHTML += "<li>" + getDisplayText(adv.getName()) + "</li>";
                } else {
                    exportHTML += "<li>-</li>";
                }
            }
            exportHTML += "</ul>";
        }

        exportHTML += "<hr />\n";
        exportHTML += "<div className=\"small-text\">";
        exportHTML += this.getTattleTaleHTML();
        exportHTML += "</div>";

        return exportHTML;
    }

    /**
     * Get tattle tale HTML (character metadata/debug info)
     */
    getTattleTaleHTML(): string {
        const char = this._char as any;
        let returnHTML = "";

        if (char.setting.usesEncumbrance) {
            if (char.getCurrentCombatLoad() != char.getCurrentLoad()) {
                returnHTML += "<strong>Current Load (normal/combat):</strong> ";
                returnHTML += char.getCurrentLoad();
                returnHTML += " / ";
                returnHTML += char.getCurrentCombatLoad();
            } else {
                returnHTML += "<strong>Current Load:</strong> ";
                returnHTML += char.getCurrentLoad();
            }
            returnHTML += " (" + char.getLoadLimit() + ")";
            returnHTML += "<br />\n";
        }

        if (char.setting.activeBooks.length > 0) {
            returnHTML += "<strong>Books In Use:</strong> ";
            for (const book of char.setting.activeBooks) {
                returnHTML += book.name + ", ";
            }
            returnHTML = returnHTML.substr(0, returnHTML.length - 2) + "<br />";
        }

        let settingRules = "";
        for (const rule of char.setting.settingRules) {
            if (rule.active) {
                settingRules += rule.label + ", ";
            }
        }
        if (settingRules.length > 0) {
            returnHTML += "<strong>Setting Rules:</strong> " + settingRules.substr(0, settingRules.length - 2) + "<br />";
        }

        if (char.setting.extraPerkPoints != 0) {
            returnHTML += "<strong>Extra Perk Points:</strong> " + char.setting.extraPerkPoints.toString() + "<br />";
        }

        if (char.setting.effects.length > 0 && char.setting.effects[0].trim()) {
            returnHTML += "<strong>Setting Modlines:</strong> " + char.setting.effects.join(" # ") + "<br />";
        }

        if (char.isSuper) {
            returnHTML += "<strong>Supers Campaign Level:</strong> " + char.setting.getSelectedPowerLevelName();

            if (char.setting.spcRisingStars) {
                returnHTML += " (Rising Stars)";
            }
            returnHTML += "<br />";
        }

        if (char.setting.noValidation) {
            returnHTML += "<strong>Validity has been disabled</strong><br />";
        } else {
            switch (char.validLevel) {
                case ValidityLevel.Default: {
                    returnHTML += "<strong>Validity:</strong> Character appears valid and optimal<br />";
                    break;
                }
                case ValidityLevel.Information: {
                    returnHTML += "<strong>Validity:</strong> Character appears valid and optimal<br />";
                    break;
                }
                case ValidityLevel.Warning: {
                    returnHTML += "<strong>Validity:</strong> Character appears valid, but not optimal<br />";
                    break;
                }
                case ValidityLevel.Error: {
                    returnHTML += "<strong>Validity:</strong> Character appears invalid<br />";
                    break;
                }
            }
        }

        return returnHTML;
    }

    /**
     * Export character as BBCode
     */
    getBBCode(usePercentages: boolean = false): string {
        let h1size = "22px";
        let h2size = "18px";
        let h3size = "16px";
        let h4size = "15px";
        let h5size = "14px";

        if (usePercentages) {
            h1size = "200";
            h2size = "150";
            h3size = "125";
            h4size = "110";
            h5size = "105";
        }

        let bbcode = this.exportHTML();
        bbcode = replaceAll(bbcode, "<div>", "");
        bbcode = replaceAll(bbcode, "<div class=\"stat-block\">", "");
        bbcode = replaceAll(bbcode, "<div class='stat-block'>", "");
        bbcode = replaceAll(bbcode, "<div class=\"quick-des-line\">", "");
        bbcode = replaceAll(bbcode, "<div class='quick-des-line'>", "");
        bbcode = replaceAll(bbcode, "</div>", "");

        bbcode = replaceAll(bbcode, "<h1>", "[SIZE=" + h1size + "]");
        bbcode = replaceAll(bbcode, "</h1>", "[/SIZE]\n");

        bbcode = replaceAll(bbcode, "<h2>", "[SIZE=" + h2size + "]");
        bbcode = replaceAll(bbcode, "</h2>\n", "[/SIZE]\n");

        bbcode = replaceAll(bbcode, "<h3>", "[SIZE=" + h3size + "]");
        bbcode = replaceAll(bbcode, "</h3>\n", "[/SIZE]\n");

        bbcode = replaceAll(bbcode, "<h4>", "[SIZE=" + h4size + "]");
        bbcode = replaceAll(bbcode, "</h4>\n", "[/SIZE]\n");

        bbcode = replaceAll(bbcode, "<h5>", "[SIZE=" + h5size + "]");
        bbcode = replaceAll(bbcode, "</h5>\n", "[/SIZE]\n");

        bbcode = replaceAll(bbcode, "<br />\n", "\n");
        bbcode = replaceAll(bbcode, "<p>", "");
        bbcode = replaceAll(bbcode, "</p>\n", "\n");
        bbcode = replaceAll(bbcode, "<strong>", "[B]");
        bbcode = replaceAll(bbcode, "</strong>", "[/B]");

        bbcode = replaceAll(bbcode, "<hr />", "");

        bbcode = replaceAll(bbcode, "<ol>", "[LIST=1]\n");
        bbcode = replaceAll(bbcode, "<ul>", "[LIST]\n");
        bbcode = replaceAll(bbcode, "<li>", "[*]");
        bbcode = replaceAll(bbcode, "</li>", "\n");
        bbcode = replaceAll(bbcode, "</ol>", "[/LIST]\n");
        bbcode = replaceAll(bbcode, "</ul>", "[/LIST]\n");

        bbcode += "\n\nCreated with [URL=\"https://savaged.us\"]Savaged.us[/URL]";
        return SanitizeHTML(
            bbcode,
            {
                allowedTags: []
            }
        );
    }

    /**
     * Export character as Markdown
     */
    getMakrdown(): string {
        let bbcode = this.exportHTML();
        bbcode = replaceAll(bbcode, "<div>", "");
        bbcode = replaceAll(bbcode, "<div class=\"stat-block\">", "");
        bbcode = replaceAll(bbcode, "<div class='stat-block'>", "");
        bbcode = replaceAll(bbcode, "<div class=\"quick-des-line\">", "");
        bbcode = replaceAll(bbcode, "<div class='quick-des-line'>", "");
        bbcode = replaceAll(bbcode, "</div>", "");

        bbcode = replaceAll(bbcode, "<h1>", "# ");
        bbcode = replaceAll(bbcode, "</h1>\n", "\n");

        bbcode = replaceAll(bbcode, "<h2>", "## ");
        bbcode = replaceAll(bbcode, "</h2>\n", "\n");

        bbcode = replaceAll(bbcode, "<h3>", "### ");
        bbcode = replaceAll(bbcode, "</h3>\n", "\n");

        bbcode = replaceAll(bbcode, "<h4>", "#### ");
        bbcode = replaceAll(bbcode, "</h4>\n", "\n");

        bbcode = replaceAll(bbcode, "<h5>", "##### ");
        bbcode = replaceAll(bbcode, "</h5>\n", "\n");

        bbcode = replaceAll(bbcode, "<br />\n", "\n");
        bbcode = replaceAll(bbcode, "<p>", "");
        bbcode = replaceAll(bbcode, "</p>\n", "\n");
        bbcode = replaceAll(bbcode, "<strong>", "**");
        bbcode = replaceAll(bbcode, "</strong>", "**");
        bbcode = replaceAll(bbcode, "<em>", "*");
        bbcode = replaceAll(bbcode, "</em>", "*");

        bbcode = replaceAll(bbcode, "<hr />\n", "* * *\n");

        bbcode = replaceAll(bbcode, "<ol>", "");
        bbcode = replaceAll(bbcode, "<ul>", "");
        bbcode = replaceAll(bbcode, "<li>", "- ");
        bbcode = replaceAll(bbcode, "</li>", "\n");
        bbcode = replaceAll(bbcode, "</ol>", "");
        bbcode = replaceAll(bbcode, "</ul>", "");

        bbcode += "\n\nCreated with [URL=\"" + CONFIGLiveHost + "\"]" + CONFIGSiteTitle + "[/URL]";
        return SanitizeHTML(
            bbcode,
            {
                allowedTags: []
            }
        );
    }

    /**
     * Export character as plain text
     */
    getPlainText(): string {
        let html = this.exportHTML();

        html = replaceAll(html, "<hr />", "\n------------------\n");

        return SanitizeHTML(
            html,
            {
                allowedTags: []
            }
        );
    }
}
