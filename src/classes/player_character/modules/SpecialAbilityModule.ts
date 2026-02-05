/**
 * SpecialAbilityModule - Handles character special abilities
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Adding special abilities (addSpecialAbility)
 * - Getting special abilities list (getSpecialAbilitiesList)
 */

import type { PlayerCharacter } from '../player_character';
import type { ISpecialAbilityItem } from '../player_character';
import { split_by_max_two } from '../../../utils/split_by_max_two';
import { BaseModule } from './BaseModule';

export interface ISpecialAbilitySimple {
    name: string;
    summary: string;
    book_name: string;
    page: string;
    bookID: number;
}

export class SpecialAbilityModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Special ability state is managed by PlayerCharacter's reset()
    }

    /**
     * Add a special ability to the character
     */
    addSpecialAbility(
        name: string,
        summary: string,
        bookName: string,
        bookPage: string,
        bookID: number,
    ): void {
        const char = this._char as any;

        for (const ability of char._addedSpecialAbilities) {
            if (ability.name.toLowerCase().trim() == name.toLowerCase().trim()) {
                ability.summary = summary;
                ability.name = name;
                return;
            }
        }

        // not found, add it
        char._addedSpecialAbilities.push({
            name: name,
            summary: summary,
            book_name: bookName,
            page: bookPage,
            bookID: bookID,
        });
    }

    /**
     * Get list of all special abilities from various sources
     */
    getSpecialAbilitiesList(
        includeFramework: boolean = true,
        suppressHumanAdatpable: boolean = false
    ): ISpecialAbilityItem[] {
        const char = this._char as any;
        let rv: ISpecialAbilityItem[] = [];
        rv = rv.concat(char.race.getEffectiveRaceAbilityList());

        if (char.monsterFramework) {
            rv = rv.concat(char.monsterFramework.getSpecialAbilityList());
        }

        if (suppressHumanAdatpable && char.race.name.toLowerCase().trim() === "human") {
            let filtered: ISpecialAbilityItem[] = [];
            for (const ability of rv) {
                if (ability.name.toLowerCase().trim() != "adaptable") {
                    filtered.push(ability);
                }
            }

            rv = filtered;
        }

        for (const edge of char.getAllEdgeObjects()) {
            if (edge.arcaneBackground) {
                rv.push(edge.arcaneBackground.getSpecialAbilityText());
                if (edge.arcaneBackground.extraAbilityText && edge.arcaneBackground.extraAbilityText.length > 0) {

                    for (const line of edge.arcaneBackground.extraAbilityText) {
                        if (line.indexOf(":") > -1) {
                            const abSplit = split_by_max_two(line, ":");
                            if (abSplit[0].trim() && abSplit[1].trim())
                                rv.push({
                                    name: abSplit[0].trim(),
                                    summary: abSplit[1].trim(),
                                    specify: "",
                                    specifyValue: "",
                                    specifyLimit: [],
                                    alternate_options: [],
                                    selectItems: [],
                                    from: "Arcane Background",
                                    positive: true,
                                    book_name: edge.arcaneBackground.getBookShortName(),
                                    page: edge.arcaneBackground.book_page,
                                    book_id: edge.arcaneBackground.book_id,
                                    custom: edge.is_custom,
                                });
                        }
                    }
                }
            }
        }
        // other special abilities... perhaps from iconic frameworks, etc
        for (const ab of char._selectedArcaneBackgrounds) {
            if (ab) {
                rv.push(ab.getSpecialAbilityText());
                if (ab.extraAbilityText && ab.extraAbilityText.length > 0) {

                    for (const line of ab.extraAbilityText) {
                        if (line.indexOf(":") > -1) {
                            const abSplit = split_by_max_two(line, ":");
                            if (abSplit[0].trim() && abSplit[1].trim())
                                rv.push({
                                    name: abSplit[0].trim(),
                                    summary: abSplit[1].trim(),
                                    specify: "",
                                    specifyValue: "",
                                    specifyLimit: [],
                                    alternate_options: [],
                                    selectItems: [],
                                    from: "Arcane Background",
                                    positive: true,
                                    book_name: ab.getBookShortName(),
                                    page: ab.book_page,
                                    book_id: ab.book_id,
                                    custom: ab.book_id > 0 ? false : true,
                                });
                        }
                    }
                }
            }
        }

        // H3 Cyberware
        const cyberware = char.getUniqueCyberwarePurchased();
        if (cyberware.length > 0) {
            for (const item of cyberware) {
                if (item) {
                    const data = item.getSpecialAbilityLine();
                    rv.push({
                        name: data.name,
                        summary: data.summary,
                        specify: "",
                        specifyValue: "",
                        specifyLimit: [],
                        selectItems: [],
                        from: "Cyberware",
                        alternate_options: [],
                        positive: true,
                        book_name: item.getBookShortName(),
                        page: item.getBookPage(),
                        book_id: item.book_id,
                        custom: item.is_custom,
                    });
                }
            }
        }

        for (const item of char._addedSpecialAbilities) {
            rv.push({
                name: item.name,
                summary: item.summary,
                specify: "",
                specifyValue: "",
                specifyLimit: [],
                selectItems: [],
                from: "Special Ability",
                alternate_options: [],
                positive: true,
                book_name: item.book_name,
                book_id: item.bookID,
                page: item.page,
                custom: item.bookID > 0 ? false : true,
            });
        }

        for (const item of char._armorPurchased) {
            if (item.equippedArmor && item.abilities && item.abilities.length > 0) {
                for (const line of item.abilities) {
                    if (line.indexOf(":") > -1) {
                        const abSplit = split_by_max_two(line, ":");
                        if (abSplit[0].trim() && abSplit[1].trim())
                            rv.push({
                                name: abSplit[0].trim(),
                                summary: abSplit[1].trim(),
                                specify: "",
                                specifyValue: "",
                                specifyLimit: [],
                                selectItems: [],
                                from: "Armor",
                                alternate_options: [],
                                positive: true,
                                book_name: item.getBookShortName(),
                                page: item.page,
                                book_id: item.book_id,
                                custom: item.is_custom,
                            });
                    }
                }
            }
        }

        for (const item of char._gearPurchased) {
            if (item.equippedGear && item.abilities && item.abilities.length > 0) {
                for (const line of item.abilities) {
                    if (line.indexOf(":") > -1) {
                        const abSplit = split_by_max_two(line, ":");
                        if (abSplit[0].trim() && abSplit[1].trim())
                            rv.push({
                                name: abSplit[0].trim(),
                                summary: abSplit[1].trim(),
                                specify: "",
                                specifyValue: "",
                                specifyLimit: [],
                                alternate_options: [],
                                selectItems: [],
                                from: "Gear",
                                positive: true,
                                book_name: item.getBookShortName(),
                                page: item.book_page,
                                book_id: item.book_id,
                                custom: item.is_custom,
                            });
                    }
                }
            }
        }

        for (const item of char._weaponsPurchased) {
            if ((item.equippedPrimary || item.equippedSecondary) && item.abilities && item.abilities.length > 0) {
                for (const line of item.abilities) {
                    if (line.indexOf(":") > -1) {
                        const abSplit = split_by_max_two(line, ":");
                        if (abSplit[0].trim() && abSplit[1].trim())
                            rv.push({
                                name: abSplit[0].trim(),
                                summary: abSplit[1].trim(),
                                specify: "",
                                specifyValue: "",
                                specifyLimit: [],
                                selectItems: [],
                                from: "Weapon",
                                positive: true,
                                book_name: item.getBookShortName(),
                                page: item.book_page,
                                book_id: item.book_id,
                                alternate_options: [],
                                custom: item.is_custom,
                            });
                    }
                }
            }
        }

        for (const spc of char.superPowers2014) {
            rv.push({
                name: spc.getName(),
                summary: spc.getSummary(),
                specify: "",
                specifyValue: "",
                alternate_options: [],
                specifyLimit: [],
                selectItems: [],
                from: "Super Power",
                positive: true,
                book_name: spc.bookShortName,
                page: spc.book_page,
                book_id: spc.book_id,
                custom: false,
            });
        }

        if (char.currentFramework && includeFramework) {
            rv = rv.concat(char.currentFramework.getSpecialAbilityList());
        }

        for (const edge of char.getAllEdgeObjects()) {
            rv = rv.concat(edge.getSpecialAbilityList(char));
        }

        if (
            rv.length == 1
            && suppressHumanAdatpable
            && (
                rv[0].name.toLowerCase().trim() == "adaptable"
                ||
                rv[0].name.toLowerCase().trim() == "extra edge"
            )
        ) {
            // don't bother showing just the standard plain Extra Edge
            return [];
        } else {
            return rv;
        }
    }
}
