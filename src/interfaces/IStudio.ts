/**
 * Studio Import Session Status
 */
export type ImportSessionStatus =
    | 'idle'
    | 'uploading'
    | 'processing'
    | 'parsing'
    | 'validating'
    | 'ready'
    | 'reconstructed'  // Backwards-constructed from existing database books
    | 'committing'
    | 'completed'
    | 'error'
    | 'cancelled';

/**
 * Import Session from database
 */
export interface IImportSession {
    id?: number;
    session_id: string;
    data?: IImportSessionData;
    status: ImportSessionStatus;
    file_name?: string;
    file_size?: number;
    version_of?: number;
    deleted?: number;
    deleted_by?: number;
    deleted_on?: Date;
    created_by?: number;
    created_on?: Date;
    updated_by?: number;
    updated_on?: Date;
    created_by_name?: string;
    updated_by_name?: string;
}

/**
 * Import Session Data stored in JSON column
 */
export interface IImportSessionData {
    file_path?: string;
    file_name?: string;
    file_size?: number;
    uploaded_at?: Date;

    // Parsed content
    book?: IImportedBook;
    edges?: IImportedEdge[];
    hindrances?: IImportedHindrance[];
    races?: IImportedRace[];
    powers?: IImportedPower[];
    weapons?: IImportedWeapon[];
    armor?: IImportedArmor[];
    gear?: IImportedGear[];
    vehicles?: IImportedVehicle[];
    bestiaries?: IImportedBestiary[];

    // Raw extracted text
    raw_text?: string;

    // PDF metadata
    metadata?: {
        page_count?: number;
        parsed_at?: string;
        parser_version?: string;
        parsing_errors?: string[];  // Errors that occurred during AI extraction
    };

    // Validation results
    validation?: IValidationResults;

    // Commit results
    commit_results?: ICommitResults;

    // Real-time progress tracking (for polling UI updates during parsing)
    progress?: number;
    progress_message?: string;
    progress_waiting?: boolean;  // True when waiting for external service (AI) with unknown duration

    // Reconstruction metadata (for sessions created from existing database books)
    source?: 'pdf_upload' | 'database_reconstruction';
    original_book_id?: number;  // Original book.id from database if reconstructed
}

/**
 * Imported Book data
 */
export interface IImportedBook {
    // Basic metadata from PDF
    title?: string;
    publisher?: string;
    year?: number | null;
    isbn?: string;
    setting?: string;
    type?: string;
    authors?: string[];  // Book authors/designers
    cover_url?: string;  // URL to cover image
    cover_image?: string;  // Base64 encoded cover image data

    // Required database fields
    book_id?: string;  // Unique book identifier (e.g., "swpf", "custom-book-123")
    short_name?: string;  // Short abbreviation (e.g., "SWPF", "CB123")
    name?: string;  // Fallback to title if not set
    published?: string;  // Year as string for database

    // Book classification flags
    core?: boolean;  // Is this a core rulebook?
    primary?: boolean;  // Is this the primary book for a setting?
    unseen?: boolean;  // Hide from public view
    swade_optimized?: boolean;  // SWADE optimized content
    active?: boolean;  // Is this book active/visible?

    // Purchase/reference links
    buylink?: string;
    buy_link?: string;

    // Access control (who can see this book)
    access_anonymous?: boolean;
    access_registered?: boolean;
    access_wildcard?: boolean;
    access_developer?: boolean;
    access_admin?: boolean;

    // Write permissions
    write_groups?: number[];
    partner_id?: number;

    // Images
    image_upload?: string;
    logo_upload?: string;

    // Setting-specific rules and lists
    setting_rules?: string[];
    knowledge_list?: string[];
    language_list?: string[];
    skill_list?: any[];
    add_skills?: string[];
    del_skills?: string[];
    core_skills?: string[];

    // Character creation defaults
    has_charisma?: boolean;
    uses_xp?: boolean;
    starting_skill_points?: number;
    starting_attribute_points?: number;
}

/**
 * Edge Effects structure (parsed requirements and effects)
 */
export interface IEdgeEffects {
    name: string;
    description: string;
    category: string;
    reqlines: string[];  // Requirements: rank:novice, agility:d8, etc.
    modlines: string[];  // Effects: pace +2, toughness +1, etc.
}

/**
 * Imported Edge data
 */
export interface IImportedEdge {
    name: string;
    description?: string;
    requirements?: string;
    category?: string;
    book_code?: string;
    page?: number | null;
    notes?: string;
    confidence?: number;
    book_id?: number;
    parsed_effects?: IEdgeEffects; // Structured, parsed requirements and effects
    is_arcane_background?: boolean; // True if this edge grants access to powers/magic
    // Special flags detected during enrichment
    needs_selected_weapon?: boolean; // True if edge applies to a specific weapon chosen by player
    counts_as_other?: string[]; // Edge names this edge should satisfy prerequisites for
    replaces_edge?: string | null; // Edge name this replaces from another book
    edge_chain_base?: string | null; // Base edge name if this is a Master/Improved variant
    needs_review?: boolean; // True if AI detected issues needing manual review
}

/**
 * Hindrance Effects structure (parsed effects)
 */
export interface IHindranceEffects {
    name: string;
    description: string;
    hindrance_type: 'minor' | 'major';
    reqlines: string[];  // Requirements/conditions: when it applies, triggers, etc.
    modlines: string[];  // Effects: pace -1, charisma -2, etc.
}

/**
 * Imported Hindrance data
 */
export interface IImportedHindrance {
    name: string;
    description?: string;
    hindrance_type: 'minor' | 'major' | 'both';  // 'both' indicates minor_or_major
    book_code?: string;
    page?: number | null;
    notes?: string;
    confidence?: number;
    // Legacy field
    severity?: 'minor' | 'major';
    category?: string;
    book_id?: number;

    // Dual version support
    description_minor?: string;  // Description for minor version
    description_major?: string;  // Description for major version (if different from main description)

    parsed_effects?: IHindranceEffects; // Structured, parsed effects for major
    parsed_effects_minor?: IHindranceEffects; // Structured, parsed effects for minor
}

/**
 * Race Effects structure (from character generator)
 */
export interface IRaceEffects {
    name: string;
    uuid: string;
    description: string;
    list_as: string;
    effects: string[];
    specify: string;
    specify_value: string;
    specify_limit: string[];
    select_items: string[];
    alternate_options: IRaceEffects[];
}

/**
 * Imported Race data
 */
export interface IImportedRace {
    name: string;
    description?: string;
    abilities?: string; // Raw text from PDF
    parsed_effects?: IRaceEffects[]; // Structured, parsed abilities
    book_id?: number;
}

/**
 * Imported Power data
 */
export interface IImportedPower {
    name: string;
    description?: string;
    rank?: string;
    power_points?: number | null;
    range?: string;
    duration?: string;
    book_code?: string;
    page?: number | null;
    notes?: string;
    confidence?: number;
    book_id?: number;
}

/**
 * Imported Weapon data
 */
export interface IImportedWeapon {
    name: string;
    description?: string;
    damage?: string;
    range?: string;
    ap?: string;
    rof?: string;
    shots?: string;
    min_str?: string;
    weight?: string;
    cost?: string;
    book_id?: number;
}

/**
 * Imported Armor data
 */
export interface IImportedArmor {
    name: string;
    description?: string;
    armor?: string;
    min_str?: string;
    weight?: string;
    cost?: string;
    book_id?: number;
}

/**
 * Imported Gear data
 */
export interface IImportedGear {
    name: string;
    description?: string;
    weight?: string;
    cost?: string;
    book_id?: number;
}

/**
 * Imported Vehicle data
 */
export interface IImportedVehicle {
    name: string;
    description?: string;
    size?: string;
    handling?: string;
    top_speed?: string;
    toughness?: string;
    crew?: string;
    cost?: string;
    book_id?: number;
}

/**
 * Bestiary Ability structure
 */
export interface IBestiaryAbility {
    Name: string;
    Notes: string;
}

/**
 * Bestiary Skill structure
 */
export interface IBestiarySkill {
    Name: string;
    Value: string;
}

/**
 * Bestiary Attributes structure
 */
export interface IBestiaryAttributes {
    Agility: string;
    Smarts: string;
    Spirit: string;
    Strength: string;
    Vigor: string;
}

/**
 * Imported Bestiary data
 */
export interface IImportedBestiary {
    name: string;
    name_plural?: string;
    description?: string;

    // Core stats
    attributes?: IBestiaryAttributes | string;
    skills?: IBestiarySkill[] | string;

    // Derived stats
    pace?: string;
    parry?: string;
    toughness?: string;
    armor?: string;
    charisma?: number;

    // Special attributes
    size?: number;
    wildcard?: boolean;
    flying_pace?: number;
    swimming_pace?: number;
    climb?: number;

    // Character features
    edges?: string[] | string;
    hindrances?: string[] | string;
    abilities?: IBestiaryAbility[] | string;
    gear?: string[] | string;

    // Powers (for creatures with arcane abilities)
    powers?: string[];
    powerPoints?: number;
    powerPointName?: string;

    // Misc
    treasure?: string;
    tags?: string[] | string;
    image?: string;
    heavy_armor?: boolean;

    // Metadata
    book_id?: number;
    page?: number | null;
    confidence?: number;
}

/**
 * Validation Results
 */
export interface IValidationResults {
    is_valid: boolean;
    errors: IValidationError[];
    warnings: IValidationWarning[];
    summary: {
        total_items: number;
        valid_items: number;
        items_with_errors: number;
        items_with_warnings: number;
    };
}

/**
 * Validation Error
 */
export interface IValidationError {
    item_type: string;
    item_name: string;
    field?: string;
    message: string;
    severity: 'error';
}

/**
 * Validation Warning
 */
export interface IValidationWarning {
    item_type: string;
    item_name: string;
    field?: string;
    message: string;
    severity: 'warning';
}

/**
 * Commit Results
 */
export interface ICommitResults {
    success: boolean;
    committed_at?: Date;
    book_id?: number;
    items_committed: {
        edges: number;
        hindrances: number;
        races: number;
        powers: number;
        weapons: number;
        armor: number;
        gear: number;
        vehicles: number;
        bestiaries: number;
    };
    errors?: string[];
}

/**
 * Import Wizard Step (simplified 3-step flow)
 */
export type WizardStep =
    | 'upload'
    | 'processing'
    | 'editor';

/**
 * Legacy wizard step type (for backward compatibility with existing sessions)
 */
export type LegacyWizardStep =
    | 'upload'
    | 'processing'
    | 'review'
    | 'validation'
    | 'confirm';

/**
 * Map legacy wizard steps to new simplified steps
 */
export function mapLegacyStep(step: LegacyWizardStep | WizardStep): WizardStep {
    switch (step) {
        case 'upload':
            return 'upload';
        case 'processing':
            return 'processing';
        case 'review':
        case 'validation':
        case 'confirm':
        case 'editor':
            return 'editor';
        default:
            return 'upload';
    }
}

/**
 * Content Type for filtering/tabs
 */
export type ContentType =
    | 'all'
    | 'book'
    | 'edges'
    | 'hindrances'
    | 'races'
    | 'powers'
    | 'weapons'
    | 'armor'
    | 'gear'
    | 'vehicles'
    | 'bestiaries'
    | 'skills';
