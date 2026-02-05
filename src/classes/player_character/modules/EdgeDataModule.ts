/**
 * EdgeDataModule - Handles edge data querying and creation
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - makeEdgeObjNamed: Create edge object by name
 * - edgeAddByName: Add edge by name
 * - edgeAddByNameOrId: Add edge by name or ID
 * - edgeAdd: Add edge by ID
 * - getAllEdgeObjects: Get all edge objects
 * - getAllEdges: Get all edge names
 * - getAllEdgesData: Get all edge data for display
 */

import type { PlayerCharacter } from '../player_character';
import { Edge } from '../edge';
import { ApplyCharacterEffects } from '../../../utils/ApplyCharacterMod';
import { BaseModule } from './BaseModule';

export interface IEdgeData {
    id: number;
    name: string;
    base_name: string;
    book_short_name: string;
    book_name: string;
    book_id: number;
    page: string;
    custom: boolean;
    summary: string;
    from: string;
    isHidden: boolean;
    descriptionHTML: string;
    originalName: string;
    customDescription: string;
}

export class EdgeDataModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Edge data has no persistent state to reset
    }

    /**
     * Create an edge object by name
     */
    makeEdgeObjNamed(
        edgeName: string,
        edgeSpecify: string = "",
        addedFrom: string = "",
        noApply: boolean = false,
        applyToArcaneBackground: string = "",
        applyImmediately: boolean = false,
        skillSpecify: string = "",
    ): Edge | null {
        const char = this._char as any;

        // look through setting in case they have an override
        for( let edgeDef of char.setting.customEdges ) {

            if(
                edgeDef.name.toLowerCase().trim() == edgeName.toLowerCase().trim()
            ) {

                let insertEdgeByName = new Edge(
                    edgeDef,
                    char,
                );
                if( edgeSpecify ) {
                    insertEdgeByName.specify = edgeSpecify;
                    insertEdgeByName.specifyReadOnly = true;
                    if( insertEdgeByName.needsSelectedSmartsSkill1 ) {
                        insertEdgeByName.selectedSkill1 = skillSpecify;
                    }
                }

                insertEdgeByName.addedFrom = addedFrom;
                insertEdgeByName.setting_item = true;

                insertEdgeByName.noApply = noApply;

                if( applyToArcaneBackground ) {

                    applyToArcaneBackground = applyToArcaneBackground.toLowerCase().trim();
                    for( let abIndex = 0; abIndex < char._selectedArcaneBackgrounds.length; abIndex++) {

                        //@ts-ignore
                        if( char._selectedArcaneBackgrounds[abIndex] && char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == applyToArcaneBackground) {
                            insertEdgeByName.selectedABIndex1 = abIndex;
                        }
                    }
                }

                return insertEdgeByName;
            }
        }

        // then look through available data
        for( let edgeDef of char._availableData.edges) {

            if(
                char.setting.book_is_used(edgeDef.book_id)
                    &&
                edgeDef.name.toLowerCase().trim() == edgeName.toLowerCase().trim()
            ) {

                let insertEdgeByName = new Edge(
                    edgeDef,
                    char,

                );

                if( edgeSpecify ) {
                    insertEdgeByName.specify = edgeSpecify;
                    if( insertEdgeByName.needsSelectedSmartsSkill1 ) {
                        insertEdgeByName.selectedSkill1 = skillSpecify;
                    }
                }

                insertEdgeByName.addedFrom = addedFrom;

                insertEdgeByName.noApply = noApply;

                if( applyToArcaneBackground ) {

                    applyToArcaneBackground = applyToArcaneBackground.toLowerCase().trim();

                    for( let abIndex = 0; abIndex < char._selectedArcaneBackgrounds.length; abIndex++) {

                        if(
                            char._selectedArcaneBackgrounds[abIndex]
                            //@ts-ignore
                            && char._selectedArcaneBackgrounds[abIndex].name.toLowerCase().trim() == applyToArcaneBackground
                            //@ts-ignore
                            && char.setting.book_is_used( char._selectedArcaneBackgrounds[abIndex].book_id )
                        ) {
                            insertEdgeByName.selectedABIndex1 = abIndex;
                        }
                    }
                }

                return insertEdgeByName;
            }
        }

        if( edgeName.trim() != "[selected_edge]")
            console.warn(  "edgeAddByName", "Couldn't find edge named " + edgeName)
        return null;
    }

    /**
     * Add an edge by name
     */
    edgeAddByName(
        edgeName: string,
        edgeSpecify: string = "",
        addedFrom: string = "",
        noApply: boolean = false,
        applyToArcaneBackground: string = "",
        applyImmediately: boolean = false,
        skillSpecify: string = "",
    ): boolean {
        const char = this._char as any;

        let insertEdge = this.makeEdgeObjNamed(
            edgeName,
            edgeSpecify,
            addedFrom,
            noApply,
            applyToArcaneBackground,
            applyImmediately,
            skillSpecify,
        );

        if( insertEdge ) {
            char._edgesAdded.push(
                insertEdge
            );

            if( applyImmediately ) {
                // run the precalc immediately since natural_attacks may be missed
                insertEdge.apply( char, true );
                insertEdge.apply( char );
            }
        } else {

            if( edgeName.trim() != "[selected_edge]")
                console.warn(  "edgeAddByName", "Couldn't find edge named " + edgeName)
            return false;
        }
        return false;
    }

    /**
     * Add an edge by name or ID
     */
    edgeAddByNameOrId(
        edgeName: string,
        edgeSpecify: string = "",
        addedFrom: string = "",
        noApply: boolean = false,
        applyToArcaneBackground: string = "",
        applyImmediately: boolean = false,
        skillSpecify: string = "",
    ): boolean {
        const char = this._char as any;

        if( !isNaN(+edgeName)) {
            this.edgeAdd(
                +edgeName,
                edgeSpecify,
                addedFrom,
                applyImmediately,
            );
        } else {
            let insertEdge = this.makeEdgeObjNamed(
                edgeName,
                edgeSpecify,
                addedFrom,
                noApply,
                applyToArcaneBackground,
                applyImmediately,
                skillSpecify,
            );

            if( insertEdge ) {
                char._edgesAdded.push(
                    insertEdge
                );

                if( applyImmediately )
                    insertEdge.apply( char );
            } else {

                if( edgeName.trim() != "[selected_edge]")
                    console.warn(  "edgeAddByName", "Couldn't find edge named " + edgeName)
                return false;
            }
        }

        return false;
    }

    /**
     * Add an edge by ID
     */
    edgeAdd(
        edgeID: number,
        edgeSpecify: string | null,
        addedFrom: string = "",
        applyImmediately: boolean = false,
    ): boolean {
        const char = this._char as any;

        for( let edgeDef of char._availableData.edges) {

            if( edgeDef.id == edgeID ) {
                let insertEdge = new Edge(
                    edgeDef,
                    char,
                );
                if( edgeSpecify ) {
                    insertEdge.specify = edgeSpecify;
                }

                insertEdge.addedFrom = addedFrom;

                char._edgesAdded.push(
                    insertEdge
                );
                if( applyImmediately ) {
                    ApplyCharacterEffects(
                        insertEdge.effects,
                        char,
                    );
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Get all edge objects
     */
    getAllEdgeObjects(): Edge[] {
        const char = this._char as any;
        let rv: Edge[] = [];

        for( let edge of char._edgesSelected ) {

            rv.push( edge )
        }

        for( let edge of char._edgesAdded ) {
            rv.push( edge )
        }

        for( let edge of char._edgesCustom ) {
            rv.push( edge )
        }

        for( let edge of char._edgesCustomAdded ) {
            rv.push( edge )
        }

        for( let adv of char._advancements ) {
            if( adv.selectedEdge ) {

                rv.push( adv.selectedEdge );
            }
        }

        return rv
    }

    /**
     * Get all edge names
     */
    getAllEdges(
        hideImprovedEdgeRequirements: boolean = false,
        includeSpecify: boolean = true,
        hideHidden: boolean = false,
    ): string[] {
        const char = this._char as any;
        let rv: string[] = [];

        for( let edge of char._edgesSelected ) {

            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
                rv.push( edge.getName(includeSpecify) )
        }

        for( let edge of char._edgesAdded ) {
            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
                rv.push( edge.getName(includeSpecify) )
        }

        for( let edge of char._edgesCustom ) {
            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
                rv.push( edge.getName(includeSpecify) )
        }

        for( let edge of char._edgesCustomAdded ) {
            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
                rv.push( edge.getName(includeSpecify) )
        }

        for( let adv of char._advancements ) {
            if( adv.selectedEdge ) {
                if( !hideHidden || (hideHidden && !adv.selectedEdge.hiddenOnCharacterSheet ) )
                    rv.push( adv.selectedEdge.getName(includeSpecify) );
            }
        }

        if( hideImprovedEdgeRequirements ) {
            for( let outerCount = rv.length - 1; outerCount > -1; outerCount-- ) {
                let edgeName = rv[outerCount];
                if( edgeName.toLowerCase().trim().indexOf("improved ") === 0 ) {
                    let unImprovedName = edgeName.toLowerCase().replace("improved ", "").trim();
                    for( let innerCount = rv.length - 1; innerCount > -1; innerCount-- ) {
                        let unImprovedEdgeName = rv[innerCount];

                        if(unImprovedEdgeName.toLowerCase().trim() == unImprovedName ) {
                            rv.splice( innerCount, 1);
                            break;
                        }
                    }
                    break;
                }
            }
        }

        rv.sort();

        return rv;
    }

    /**
     * Get all edge data for display
     */
    getAllEdgesData(
        hideImprovedEdgeRequirements: boolean = false,
        initialOnly: boolean = false,
        hideHidden: boolean = false,
    ): IEdgeData[] {
        const char = this._char as any;
        let rv: IEdgeData[] = [];

        for( let edge of char._edgesSelected ) {
            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
            rv.push( {
                id: edge.id,
                name: edge.getName(true),
                base_name: edge.getName(false),
                summary: edge.summary,
                book_name: edge.getBookName(),
                book_short_name: edge.getBookShortName(),
                book_id: edge.book_id,
                page: edge.book_page,
                custom: false,
                from: "Selected",
                isHidden: edge.hiddenOnCharacterSheet,
                descriptionHTML: edge.getDescriptionHTML(),
                customDescription: "",
                originalName: edge.name,
            });
        }

        if( initialOnly == false ) {
            for( let edge of char._advancementEdges ) {
                if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
                rv.push( {
                    id: edge.id,
                    name: edge.getName(true),
                    base_name: edge.getName(false),
                    summary: edge.summary,
                    book_name: edge.getBookName(),
                    book_short_name: edge.getBookShortName(),
                    book_id: edge.book_id,
                    page: edge.book_page,
                    custom: false,
                    from: "Advance",
                    isHidden: edge.hiddenOnCharacterSheet,
                    descriptionHTML: edge.getDescriptionHTML(),
                    customDescription: "",
                    originalName: edge.name,
                });
            }
        }

        for( let edge of char._edgesAdded ) {
            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
            rv.push( {
                id: edge.id,
                name: edge.getName(true),
                base_name: edge.getName(false),
                summary: edge.summary,
                book_name: edge.getBookName(),
                book_short_name: edge.getBookShortName(),
                book_id: edge.book_id,
                page: edge.book_page,
                custom: false,
                from: "Added",
                isHidden: edge.hiddenOnCharacterSheet,
                descriptionHTML: edge.getDescriptionHTML(),
                customDescription: "",
                originalName: edge.name,
            });
        }

        for( let edge of char._edgesCustom ) {
            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
            rv.push( {
                id: edge.id,
                name: edge.getName(true),
                base_name: edge.getName(false),
                summary: edge.summary,
                book_name: edge.book_obj.name,
                book_id: edge.book_id,
                book_short_name: edge.getBookShortName(),
                page: edge.book_page,
                custom: false,
                from: "Custom",
                isHidden: edge.hiddenOnCharacterSheet,
                descriptionHTML: edge.getDescriptionHTML(),
                customDescription: "",
                originalName: edge.name,
            });
        }

        for( let edge of char._edgesCustomAdded ) {
            if( !hideHidden || (hideHidden && !edge.hiddenOnCharacterSheet ) )
            rv.push( {
                id: edge.id,
                name: edge.getName(true),
                base_name: edge.getName(false),
                summary: edge.summary,
                book_name: edge.getBookName(),
                book_id: edge.book_id,
                book_short_name: edge.getBookShortName(),
                page: edge.book_page,
                custom: false,
                from: "Added Custom",
                isHidden: edge.hiddenOnCharacterSheet,
                descriptionHTML: edge.getDescriptionHTML(),
                customDescription: "",
                originalName: edge.name,
            });
        }

        if( hideImprovedEdgeRequirements ) {
            for( let outerCount = rv.length - 1; outerCount > -1; outerCount-- ) {
                let edgeName = rv[outerCount].name;
                if( edgeName.toLowerCase().trim().indexOf("improved ") === 0 ) {
                    let unImprovedName = edgeName.toLowerCase().replace("improved ", "").trim();
                    for( let innerCount = rv.length - 1; innerCount > -1; innerCount-- ) {
                        let unImprovedEdgeName = rv[innerCount].name;

                        if(unImprovedEdgeName.toLowerCase().trim() == unImprovedName ) {
                            rv.splice( innerCount, 1);
                            break;
                        }
                    }
                    break;
                }
            }
        }

        rv.sort( (a: IEdgeData, b: IEdgeData) => {
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
