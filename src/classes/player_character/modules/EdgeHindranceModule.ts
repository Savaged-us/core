/**
 * EdgeHindranceModule - Handles character edges, hindrances, and perk points
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - Edge queries (getEdgesSelected, getTotalEdgesSelected, getEdgesAdded, hasEdge)
 * - Hindrance queries (getHindrancesSelected, getHindrancesAdded, hasHindrance)
 * - Edge/hindrance availability (edgeIsAvailable, banEdge, banHindrance)
 * - Perk point management (getPerkPointsCurrent, getPerksSelected, getPerksAvailable)
 * - Calculation methods (_calcHindrancesAndPerks, _calcAndApplyEdges)
 */

import type { PlayerCharacter } from '../player_character';
import type { Edge, IChargenEdge } from '../edge';
import type { Hindrance } from '../hindrance';
import { Edge as EdgeClass } from '../edge';
import { getPerkLabel } from '../../../utils/CommonFunctions';
import { BaseModule } from './BaseModule';

export class EdgeHindranceModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Edge/hindrance state is managed by PlayerCharacter's reset()
    }

    /**
     * Ban a hindrance from being selected
     */
    banHindrance(name: string, from: string): void {
        const char = this._char as any;
        char._bannedHindrances.push({
            name: name,
            from: from,
        });
    }

    /**
     * Ban an edge from being selected
     */
    banEdge(name: string, from: string): void {
        const char = this._char as any;
        char._bannedEdges.push({
            name: name,
            from: from,
        });
    }

    /**
     * Check if an edge is available for selection
     */
    edgeIsAvailable(
        edge: IChargenEdge,
        edgeRequirementsOnly: boolean = false,
    ): boolean {
        const edgeObj = new EdgeClass(edge, this._char);
        const avail = edgeObj.isAvailable(this._char, edgeRequirementsOnly);
        if (avail.canBeTaken) {
            return true;
        }
        return false;
    }

    /**
     * Calculate hindrances and perk points
     */
    calcHindrancesAndPerks(): void {
        const char = this._char as any;

        char._perkPointsCurrent = 0;
        char._perkPointsExtra = 0;
        char._perkPointsTotal = 0;
        char._perkPointsAllocated = 0;
        char._perkPointsSpent = 0;

        let perkPointsSpent = 0;
        // Add Perks from Selected Hindrances
        if (char.setting.primaryIsSWADE) {
            // SWADE - no more than 4 points total
            for (const hind of char._hindrancesSelected) {
                if (hind.major) {
                    perkPointsSpent += 2;
                    char._perkPointsTotal += 2;
                } else {
                    perkPointsSpent += 1;
                    char._perkPointsTotal += 1;
                }

                if (char.hasBoughtOffHindrance(hind.name) === "")
                    hind.apply();
            }

            // Custom Hindrances
            for (const hind of char._hindrancesCustom) {
                if (hind.major) {
                    perkPointsSpent += 2;
                    char._perkPointsTotal += 2;
                } else {
                    perkPointsSpent += 1;
                    char._perkPointsTotal += 1;
                }
                if (char.hasBoughtOffHindrance(hind.name) === "")
                    hind.apply();
            }

            if (char.setting.settingIsEnabled("larger_than_life")) {
                if (perkPointsSpent > 6) {
                    perkPointsSpent = 6;
                }
            } else {
                if (perkPointsSpent > 4) {
                    perkPointsSpent = 4;
                }
            }

            char._perkPointsAllocated = perkPointsSpent;
        } else {
            // Deluxe - no more than 1 major, and 2 minor
            let _majorPoints = 0;
            let _minorPoints = 0;
            for (const hind of char._hindrancesSelected) {
                if (hind.major) {
                    _majorPoints += 2;
                    char._perkPointsTotal += 2;
                } else {
                    _minorPoints += 1;
                    char._perkPointsTotal += 1;
                }
                hind.apply();
            }
            if (_majorPoints > 2) {
                _majorPoints = 2;
            }
            if (_minorPoints > 2) {
                _minorPoints = 2;
            }

            // Custom Hindrances
            for (const hind of char._hindrancesCustom) {
                if (hind.major) {
                    _majorPoints += 2;
                    char._perkPointsTotal += 2;
                } else {
                    _minorPoints += 1;
                    char._perkPointsTotal += 1;
                }
                hind.apply();
            }

            if (_majorPoints > 2) {
                _majorPoints = 2;
            }
            if (_minorPoints > 2) {
                _minorPoints = 2;
            }

            char._perkPointsAllocated = _majorPoints + _minorPoints;
        }

        char._perkPointsCurrent += char.setting.extraPerkPoints;
        // Allocate Perks
        for (const perk of char._perksSelected) {
            if (perk === "de-edge") {
                char._maxEdgesCount += 1;
                char._perkPointsCurrent -= 2;
                char._perkPointsSpent += 2;
            } else if (perk === "de-attribute") {
                char._maxAttributeAllocationPoints += 1;
                char._currentAttributeAllocationPoints += 1;
                char._perkPointsCurrent -= 2;
                char._perkPointsSpent += 2;
            } else if (perk === "de-wealth") {
                if (char.setting.primaryIsSWADE) {
                    char._wealthCurrent += char.setting.wealthStarting * 2;
                } else {
                    char._derivedBaseBoosts.starting_funds_multiplier = char._derivedBaseBoosts.starting_funds_multiplier * 2;
                }

                char._perkPointsCurrent -= 1;
                char._perkPointsSpent += 1;
            } else if (perk === "de-skill") {
                char._maxSkillAllocationPoints += 1;
                char._currentSkillAllocationPoints += 1;
                char._perkPointsCurrent -= 1;
                char._perkPointsSpent += 1;
            }
        }
    }

    /**
     * Calculate and apply edges
     */
    calcAndApplyEdges(preCalc: boolean = false): void {
        const char = this._char as any;

        let abCount = 0;
        for (const edge of char._edgesSelected) {
            if (!preCalc) {
                if (edge.addsArcaneBackground && !edge.addedArcaneBackground) {
                    edge.abCount = abCount;
                    abCount++;
                    char._numberOfArcaneBackgrounds++;
                }
            }
            edge.apply(char, preCalc);
        }

        for (const customEdge of char._edgesCustom) {
            for (const settingDef of char.setting.customEdges) {
                if (settingDef.name === customEdge.name) {
                    settingDef.is_custom = true;
                    settingDef.setting_item = true;
                    customEdge.import(settingDef);
                    break;
                }
            }

            if (!preCalc) {
                if (customEdge.addsArcaneBackground && !customEdge.addedArcaneBackground) {
                    customEdge.abCount = abCount;
                    abCount++;
                    char._numberOfArcaneBackgrounds++;
                }
            }
            customEdge.apply(char, preCalc);
        }

        for (const customEdge of char._edgesCustomAdded) {
            if (!preCalc) {
                if (customEdge.addsArcaneBackground && !customEdge.addedArcaneBackground) {
                    customEdge.abCount = abCount;
                    abCount++;
                    char._numberOfArcaneBackgrounds++;
                }
            }
            customEdge.apply(char, preCalc);
        }

        // finally apply any edges added from before
        for (const edge of char._edgesAdded) {
            if (preCalc) {
                if (edge.addsArcaneBackground && !edge.addedArcaneBackground) {
                    edge.abCount = abCount;
                    abCount++;
                    char._numberOfArcaneBackgrounds++;
                }
            }
            edge.apply(char, preCalc);
        }
    }

    /**
     * Get selected edges
     */
    getEdgesSelected(): Edge[] {
        return (this._char as any)._edgesSelected;
    }

    /**
     * Get total edges selected (including custom)
     */
    getTotalEdgesSelected(ignoreFreeEdges: boolean = false): Edge[] {
        const char = this._char as any;
        const edges: Edge[] = [];

        for (const edge of char._edgesSelected) {
            if (ignoreFreeEdges === false) {
                edges.push(edge);
            } else if (edge.freeEdge === false) {
                edges.push(edge);
            }
        }

        for (const edge of char._edgesCustom) {
            if (ignoreFreeEdges === false) {
                edges.push(edge);
            } else if (edge.freeEdge === false) {
                edges.push(edge);
            }
        }
        return edges;
    }

    /**
     * Get edges added via abilities
     */
    getEdgesAdded(): Edge[] {
        return (this._char as any)._edgesAdded;
    }

    /**
     * Get maximum number of edges that can be selected
     */
    getEdgesSelectMax(): number {
        return (this._char as any)._maxEdgesCount;
    }

    /**
     * Get custom edges
     */
    getEdgesCustom(): Edge[] {
        return (this._char as any)._edgesCustom;
    }

    /**
     * Get current perk points
     */
    getPerkPointsCurrent(): number {
        return (this._char as any)._perkPointsCurrent;
    }

    /**
     * Get custom hindrances
     */
    getHindrancesCustom(): Hindrance[] {
        return (this._char as any)._hindrancesCustom;
    }

    /**
     * Get hindrances added via abilities
     */
    getHindrancesAdded(): Hindrance[] {
        return (this._char as any)._hindrancesAdded;
    }

    /**
     * Get selected hindrances
     */
    getHindrancesSelected(sortByMajorFirst: boolean = false): Hindrance[] {
        const char = this._char as any;

        if (sortByMajorFirst) {
            // Sort by majors then name..
            char._hindrancesSelected.sort(
                function (a: Hindrance, b: Hindrance) {
                    if (a.major > b.major) {
                        return -1;
                    } else if (a.major < b.major) {
                        return 1;
                    } else {
                        if (a.name < b.name) {
                            return -1;
                        } else if (a.name > b.name) {
                            return 1;
                        } else {
                            return 0;
                        }
                    }
                }
            );
        } else {
            // Sort by name..
            char._hindrancesSelected.sort(
                function (a: Hindrance, b: Hindrance) {
                    if (a.name < b.name) {
                        return -1;
                    } else if (a.name > b.name) {
                        return 1;
                    } else {
                        return 0;
                    }
                }
            );
        }
        char._hindrancesSelected.sort(
            function (a: Hindrance, b: Hindrance) {
                if (a.name < b.name) {
                    return -1;
                } else if (a.name > b.name) {
                    return 1;
                } else {
                    return 0;
                }
            });
        return char._hindrancesSelected;
    }

    /**
     * Get selected perks as labels
     */
    getPerksSelected(): string[] {
        const char = this._char as any;
        const returnObj: string[] = [];
        const isSWADE = char.setting.primaryIsSWADE;

        char._perksSelected.sort(
            function (a: string, b: string) {
                if (getPerkLabel(a, isSWADE) < getPerkLabel(b, isSWADE)) {
                    return -1;
                } else if (getPerkLabel(a, isSWADE) > getPerkLabel(b, isSWADE)) {
                    return 1;
                } else {
                    return 0;
                }
            });

        for (const perkTag of char._perksSelected) {
            returnObj.push(getPerkLabel(perkTag, char.setting.primaryIsSWADE));
        }

        return returnObj;
    }

    /**
     * Get available perks
     */
    getPerksAvailable(): string[] {
        const char = this._char as any;

        if (char.setting.primaryIsSWADE) {
            return [
                "de-attribute",
                "de-edge",
                "de-skill",
                "de-wealth",
            ];
        } else {
            return [
                "de-attribute",
                "de-edge",
                "de-skill",
                "de-wealth",
            ];
        }
    }

    /**
     * Install a perk
     */
    perkInstall(perkKey: string): void {
        const char = this._char as any;
        if (perkKey) {
            char._perksSelected.push(perkKey);
        }
    }

    /**
     * Remove a selected perk
     */
    removePerkSelected(perkIndex: number): boolean {
        const char = this._char as any;
        if (char._perksSelected.length > perkIndex) {
            char._perksSelected.splice(perkIndex, 1);
            return true;
        }
        return false;
    }

    /**
     * Check if character has a specific edge
     */
    hasEdge(
        edgeName: string,
        atRank: number = -1,
        selectedABIndex: number | string = 0,
        debug: boolean = false,
    ): number {
        const char = this._char as any;
        let countEdges = 0;

        if (atRank === null)
            atRank = -1;
        if (selectedABIndex === null)
            selectedABIndex = 0;
        if (debug === null)
            debug = false;

        if (debug) console.log("PC hasEdge", edgeName, atRank, selectedABIndex);

        for (const edge of char.getAllEdgeObjects()) {
            if (edgeName.trim()[edgeName.trim().length - 1] === "*") {
                // wildcard in edge name, look for anything like it
                if (edge.name.toLowerCase().trim().indexOf(edgeName.replace("*", "").toLowerCase().trim()) === 0) {
                    if (atRank === -1 || edge.takenAtRank === atRank) {
                        if (edge.needsSelectedArcaneBackground()) {
                            if (selectedABIndex === edge.selectedABIndex1) {
                                countEdges++;
                            }
                        } else {
                            countEdges++;
                        }
                    }
                }
            } else {
                if (edge.isNamedOrCountsAs(edgeName, debug)) {
                    if (atRank === -1 || edge.takenAtRank === atRank) {
                        if (edge.needsSelectedArcaneBackground()) {
                            if (selectedABIndex === edge.selectedABIndex1 || edge.arcaneBackground != null) {
                                countEdges++;
                            }
                        } else {
                            countEdges++;
                        }
                    }
                }
            }
        }

        if (debug) console.log("PC hasEdge return ", edgeName, countEdges);
        return countEdges;
    }

    /**
     * Check if character has a specific hindrance
     */
    hasHindrance(hindranceName: string): boolean {
        const char = this._char as any;

        for (const hind of this.getHindrancesAdded()) {
            if (hind.isNamedOrCountsAs(hindranceName)) {
                return true;
            }
        }

        for (const hind of this.getHindrancesCustom()) {
            if (hind.isNamedOrCountsAs(hindranceName)) {
                return true;
            }
        }

        for (const hind of this.getHindrancesSelected()) {
            if (hind.isNamedOrCountsAs(hindranceName)) {
                return true;
            }
        }
        return false;
    }
}
