/**
 * BaseModule - Abstract base class for PlayerCharacter modules
 *
 * This provides the foundation for extracting functionality from the
 * PlayerCharacter class into smaller, more maintainable modules.
 *
 * Pattern: Delegation - modules hold a reference to the PlayerCharacter
 * and are called by PlayerCharacter methods to delegate work.
 */

// Use type import to avoid circular dependency issues
import type { PlayerCharacter } from '../player_character';

export abstract class BaseModule {
    /**
     * Reference to the parent PlayerCharacter instance.
     * Modules use this to access and modify character state.
     */
    protected readonly _char: PlayerCharacter;

    constructor(character: PlayerCharacter) {
        this._char = character;
    }

    /**
     * Reset module state. Called during PlayerCharacter.reset()
     * and at the start of calc() cycles.
     */
    abstract reset(): void;

    /**
     * Optional hook called during the calculation phase.
     * Override in subclasses that need to participate in calc().
     */
    calc?(): void;

    /**
     * Optional hook called at the end of the calculation phase.
     * Override for post-calculation cleanup or finalization.
     */
    calcFinalize?(): void;
}
