/**
 * HindranceDataModule - Handles hindrance data querying and creation
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - hindranceAddByName: Add hindrance by name
 * - getAllHindrancesData: Get all hindrance data for display
 */

import type { PlayerCharacter } from '../player_character';
import { Hindrance } from '../hindrance';
import { BaseModule } from './BaseModule';

export interface IHindranceData {
    id: number;
    name: string;
    base_name: string;
    book_short_name: string;
    book_name: string;
    book_id: number;
    page: string;
    majorOrMinor: boolean;
    custom: boolean;
    major: boolean;
    summary: string;
    removed: boolean;
    from: string;
    isHidden: boolean;
    descriptionHTML: string;
    originalName: string;
    customDescription: string;
}

export class HindranceDataModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Hindrance data has no persistent state to reset
    }

    /**
     * Add a hindrance by name
     */
    hindranceAddByName(
        hindranceName: string,
        hindranceSpecify: string = "",
        setMajor: boolean = false,
        addedFrom: string = "",
        specifyReadOnly: boolean = false,
        applyImmediately: boolean = false,
    ): boolean {
        const char = this._char as any;

        // first look through setting items in case there's an override
        for( let hindranceDef of char.setting.customHindrances) {

            if(
                (
                    hindranceDef.name.toLowerCase().trim() == hindranceName.toLowerCase().trim()
                        ||
                    (
                        (
                            hindranceDef.major
                                &&
                            hindranceDef.name.toLowerCase().trim() + " (major)" == hindranceName.toLowerCase().trim()
                        )
                            ||
                        (
                            hindranceDef.major == false
                                &&
                            hindranceDef.name.toLowerCase().trim() + " (minor)" == hindranceName.toLowerCase().trim()
                        )
                    )
                )
            ) {
                let insertHindrance = new Hindrance(
                    hindranceDef,
                    char,
                );
                if( hindranceSpecify ) {
                    insertHindrance.specify = hindranceSpecify;
                    insertHindrance.specifyReadOnly = true;
                }

                insertHindrance.addedFrom = addedFrom;
                insertHindrance.specifyReadOnly = specifyReadOnly;
                insertHindrance.setting_item = true;

                if( setMajor ) {
                    insertHindrance.major = true;
                }

                char._hindrancesAdded.push(
                    insertHindrance
                );

                if( applyImmediately ) {

                    if( insertHindrance.name in char._addedHindranceOptions && char._addedHindranceOptions[insertHindrance.name] && char._addedHindranceOptions[insertHindrance.name].length > 0) {

                        if( char._addedHindranceOptions[insertHindrance.name].length > 0 ) {
                            insertHindrance.importOptions( char._addedHindranceOptions[insertHindrance.name][ 0 ] );
                        }
                    }
                    insertHindrance.apply();
                }
                return true;
            }
        }

        // look through available data
        for( let hindranceDef of char._availableData.hindrances) {

            if(
                char.setting.book_is_used( hindranceDef.book_id )
                &&
                (
                    hindranceDef.name.toLowerCase().trim() == hindranceName.toLowerCase().trim()
                        ||
                    (
                        (
                            hindranceDef.major
                                &&
                            hindranceDef.name.toLowerCase().trim() + " (major)" == hindranceName.toLowerCase().trim()
                        )
                            ||
                        (
                            hindranceDef.major == false
                                &&
                            hindranceDef.name.toLowerCase().trim() + " (minor)" == hindranceName.toLowerCase().trim()
                        )
                    )
                )
            ) {
                let insertHindrance = new Hindrance(
                    hindranceDef,
                    char,
                );
                if( hindranceSpecify ) {
                    insertHindrance.specify = hindranceSpecify;
                }

                insertHindrance.addedFrom = addedFrom;
                insertHindrance.specifyReadOnly = specifyReadOnly;

                if( setMajor ) {
                    insertHindrance.major = true;
                }

                char._hindrancesAdded.push(
                    insertHindrance
                );

                if( applyImmediately ) {
                    // for hindrances added by hindrances (sheesh)
                    if( insertHindrance.name in char._addedHindranceOptions && char._addedHindranceOptions[insertHindrance.name] && char._addedHindranceOptions[insertHindrance.name].length > 0 ) {
                        insertHindrance.importOptions( char._addedHindranceOptions[insertHindrance.name][ 0 ] );
                    }
                    insertHindrance.apply();
                }

                return true;
            }
        }

        if( hindranceName.trim() != "[selected_hindrance]")
            console.warn(  "hindranceAddByName", "Couldn't find hindrance named " + hindranceName)
        return false;
    }

    /**
     * Get all hindrance data for display
     */
    getAllHindrancesData(hideHidden = false): IHindranceData[] {
        const char = this._char as any;
        let rv: IHindranceData[] = [];

        for( let hind of char._hindrancesSelected ) {
            let summary = hind.summary;
            if( !hind.major && hind.summaryMinor ) {
                summary = hind.summaryMinor;
            }
            if( !hideHidden || (hideHidden && !hind.hiddenOnCharacterSheet ) )
            rv.push( {
                id: hind.id,
                name: hind.getName(true, true),
                base_name: hind.getName(false, false),
                book_name: hind.book_obj.name,
                book_short_name: hind.book_obj.shortName,
                page: hind.book_page,
                book_id: hind.book_id,
                custom: false,
                removed: hind.removed,
                major: hind.major,
                majorOrMinor: hind.minorOrMajor,
                summary: summary,
                from: "Selected",
                isHidden: hind.hiddenOnCharacterSheet,
                descriptionHTML: hind.getDescriptionHTML(),
                customDescription: "",
                originalName: hind.name,
            })
        }

        for( let hind of char._hindrancesCustom ) {
            let summary = hind.summary;
            if( !hind.major && hind.summaryMinor ) {
                summary = hind.summaryMinor;
            }
            if( !hideHidden || (hideHidden && !hind.hiddenOnCharacterSheet ) )
            rv.push( {
                id: hind.id,
                name: hind.getName(true, true),
                base_name: hind.getName(false, false),
                book_name: hind.book_obj.name,
                book_short_name: hind.book_obj.shortName,
                book_id: hind.book_id,
                page: "",
                custom: false,
                removed: hind.removed,
                major: hind.major,
                majorOrMinor: hind.minorOrMajor,
                summary: summary,
                from: "Custom",
                isHidden: hind.hiddenOnCharacterSheet,
                descriptionHTML: hind.getDescriptionHTML(),
                customDescription: "",
                originalName: hind.name,
            })
        }

        for( let hind of char._hindrancesAdded ) {
            let summary = hind.summary;
            if( !hind.major && hind.summaryMinor ) {
                summary = hind.summaryMinor;
            }
            if( !hideHidden || (hideHidden && !hind.hiddenOnCharacterSheet ) )
            rv.push( {
                id: hind.id,
                name: hind.getName(true, true),
                base_name: hind.getName(false, false),
                book_name: hind.book_obj.name,
                book_short_name: hind.book_obj.shortName,
                book_id: hind.book_id,
                page: hind.book_page,
                custom: false,
                removed: hind.removed,
                major: hind.major,
                majorOrMinor: hind.minorOrMajor,
                summary: summary,
                from: "Added",
                isHidden: hind.hiddenOnCharacterSheet,
                descriptionHTML: hind.getDescriptionHTML(),
                customDescription: "",
                originalName: hind.name,
            })
        }

        rv.sort( (a: IHindranceData, b: IHindranceData) => {
            if( a.name > b.name ) {
                return 1;
            } else if( a.name < b.name ) {
                return -1;
            } else {
                return 0;
            }
        });

        return rv;
    }
}
