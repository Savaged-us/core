import { IItemUpdateItemAvailability } from '../../interfaces/IItemAvailability';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { cleanUpReturnValue } from '../../utils/cleanUpReturnValue';
import { replaceAll } from '../../utils/CommonFunctions';
import { convertMarkdownToHTML } from '../../utils/convertMarkdownToHTML';
import { ParseRequirementLine } from '../../utils/ParseRequirementLine';
import { BaseObject, IBaseObjectExport, IBaseObjectVars } from '../_base_object';
import { PlayerCharacter } from './player_character';

export interface IChargenHindrance extends IBaseObjectExport {

    selectedOptions?: IChargenHindranceOptions | null;
    base_name: string;
    no_select: boolean;
    hidden_on_character_sheet: boolean;

    // custom_name: string;
    // uuid: string;

    setting_item: boolean;
    summary: string;
    counts_as_other: string[];
    major: boolean;
    minor_or_major: boolean;
    summary_minor: string;
    effects_minor: string | string[];

    effects: string[];
    conflicts: string | string[];
    needs_to_specify: boolean;
    always_show_long_name: boolean;
    can_be_taken_more_than_once: boolean;

    removed: boolean;
    // description: string[];

    specify?: string | null;

}

export interface IChargenHindranceOptions extends IBaseObjectVars {
    major: boolean;
    specify: string | null;
}

export class Hindrance extends BaseObject {
    _hasBeenApplied: boolean = false;

    // _char: PlayerCharacter;

    addedFrom: string = "";

    // hasBeenApplied: boolean = false;
    baseName: string = "";
    effects: string[] = [];
    major: boolean = false;
    minorOrMajor: boolean = false;
    needsToSpecify: boolean = false;

    countsAsOther: string[] = [];
    no_select: boolean = false;
    hiddenOnCharacterSheet: boolean = false;

    settingItem: boolean = false;

    removed: boolean = false;

    conflicts: string[] = [];

    specify: string | null = "";
    isCustom: boolean = false;
    readOnly: boolean = false;

    effectsMinor: string[] = [];
    summaryMinor: string = "";

    alwaysShowLongName: boolean = false;

    canBeTakenMoreThanOnce: boolean = false;

    specifyReadOnly: boolean = false;

    constructor(
        hindranceDef: IChargenHindrance | null = null,
        characterObject: PlayerCharacter| null  = null,

    ) {
        super( hindranceDef, characterObject );
        this._char = characterObject;
        this.import( hindranceDef )

    }

    public import(jsonImportObj: IChargenHindrance | null) {
        super.import( jsonImportObj, this._char ? this._char.getAvailableData().books : [] );
        // this.description = [];
        if( jsonImportObj ) {
            this.setting_item = false;

            if( jsonImportObj.setting_item ) {
                this.setting_item = true;
            }

            if( jsonImportObj.counts_as_other ) {
                this.countsAsOther = jsonImportObj.counts_as_other;
            }

            this.hiddenOnCharacterSheet = false;
            if( jsonImportObj.hidden_on_character_sheet ) {
                this.hiddenOnCharacterSheet = true;
            }

            this.no_select = false;
            if( jsonImportObj.no_select ) {
                this.no_select = true;
            }

            if(typeof( jsonImportObj.removed) !== 'undefined'){
                this.removed = jsonImportObj.removed;
            }

            if(typeof( jsonImportObj.specify) !== 'undefined'){
                this.specify = jsonImportObj.specify;
            }

            if(typeof( jsonImportObj.base_name) !== 'undefined' && jsonImportObj.base_name ){
                this.baseName = jsonImportObj.base_name;
            } else {
                if(typeof( jsonImportObj.name) !== 'undefined'){
                    this.baseName = jsonImportObj.name.replace("(minor)", "").replace("(major)", "").trim();
                }
            }

            if( this.baseName == "" ) {
                this.baseName = this.name;
            }

            if(jsonImportObj.summary_minor && typeof( jsonImportObj.summary_minor) !== 'undefined'){
                this.summaryMinor = jsonImportObj.summary_minor;
            }

            this.effects = [];
            this.effectsMinor = [];
            if(jsonImportObj.effects && typeof( jsonImportObj.effects) !== 'undefined'){
                if(typeof( jsonImportObj.effects) === 'string'){
                    this.effects = JSON.parse(jsonImportObj.effects);
                } else {
                    this.effects = jsonImportObj.effects;
                }
            }

            let cleanEffects: string[] = [];
            for( let effect of this.effects ) {
                if( effect.trim() ) {
                    cleanEffects.push( effect.trim() );
                }
            }
            this.effects = cleanEffects;

            if(jsonImportObj.conflicts && typeof( jsonImportObj.conflicts) !== 'undefined'){
                if(typeof( jsonImportObj.conflicts) === 'string'){
                    this.conflicts = JSON.parse(jsonImportObj.conflicts);
                } else {
                    this.conflicts = jsonImportObj.conflicts;
                }
            }

            if(jsonImportObj.effects_minor && typeof( jsonImportObj.effects_minor) !== 'undefined'){
                if(typeof( jsonImportObj.effects_minor) === 'string'){
                    this.effectsMinor = JSON.parse(jsonImportObj.effects_minor);
                } else {
                    this.effectsMinor = jsonImportObj.effects_minor;
                }
            }

            let cleanEffectsMinor: string[] = [];
            for( let effect of this.effectsMinor ) {
                if( effect.trim() ) {
                    cleanEffectsMinor.push( effect.trim() );
                }
            }
            this.effectsMinor = cleanEffectsMinor;

            // if(typeof( jsonImportObj.active) !== 'undefined'){
            //     if( jsonImportObj.active ) {
            //         this.active = true;
            //     }
            // }

            if(typeof( jsonImportObj.can_be_taken_more_than_once) !== 'undefined'){
                if( jsonImportObj.can_be_taken_more_than_once ) {
                    this.canBeTakenMoreThanOnce = true;
                }
            }

            if(typeof( jsonImportObj.always_show_long_name) !== 'undefined'){
                if( jsonImportObj.always_show_long_name ) {
                    this.alwaysShowLongName = true;
                }
            }

            if(typeof( jsonImportObj.major) !== 'undefined'){
                if( jsonImportObj.major ) {
                    this.major = true;
                }
            }

            if(typeof( jsonImportObj.minor_or_major) !== 'undefined'){
                if( jsonImportObj.minor_or_major ) {
                    this.minorOrMajor = true;
                }
            }

            if(typeof( jsonImportObj.needs_to_specify) !== 'undefined'){
                if( jsonImportObj.needs_to_specify ) {
                    this.needsToSpecify = true;
                }
            }
            if( jsonImportObj.selectedOptions ) {
                this.importOptions( jsonImportObj.selectedOptions );
            }
        }
    }

    getName(showMajorMinor: boolean = false, showSpecify: boolean = false): string {
        let customLabel = "custom";

        if( this.setting_item ) {
            customLabel = "setting";
        }
        let customText = "";
        if( this.is_custom )
            customText = customLabel + ", ";

        if( this.alwaysShowLongName || showMajorMinor || this.minorOrMajor ) {
            if( this.major ) {
                if( showSpecify && this.needsToSpecify ) {
                    return this.baseName + " (" + customText + "major, " + this.specify + ")";
                } else {
                    return this.baseName + " (" + customText + "major)";
                }

            } else {
                if( showSpecify && this.needsToSpecify ) {
                    return this.baseName + " (" + customText + "minor, " + this.specify + ")";
                } else {
                    return this.baseName + " (" + customText + "minor)";
                }
            }
        } else {
            if( showSpecify && this.needsToSpecify  ) {
                return this.baseName + " (" + customText + "" + this.specify + ")"
            } else {

                if( this.is_custom  )
                    return this.baseName  + " (" + customLabel+ ")";
                else
                    return this.baseName;

            }

        }
    }

    getBuyName(): string {
        if( this.minorOrMajor ) {
            return this.name + " (minor/major)";
        } else {
            if( this.major ) {
                return this.name + " (major)";
            } else {
                return this.name + " (minor)";
            }
        }
    }

    isNamedOrCountsAs( name: string ): boolean {

        if(
            this.name.toLowerCase().trim() == name.toLowerCase().trim()
                ||
                this.name.toLowerCase().trim().indexOf(name.toLowerCase().trim()  +  " (" ) === 0
        ) {
            return true;
        }

        for( let countsAs of this.countsAsOther) {
            if( countsAs.toLowerCase().trim() == name.toLowerCase().trim() ) {
                return true;
            }
        }

        return false;
    }

    getDescriptionHTML(): string {
        let rv: string = convertMarkdownToHTML( this.description );
        rv = replaceAll(rv, "\n", " ");

        if( this.description.trim() == "" ) {
            rv = convertMarkdownToHTML( this.summary.trim() );
        }
        // if( this.description.length == 0 || (this.description.length > 1 && this.description[0].trim() == "")) {
        //     rv = "<p>" + this.summary + "</p>"
        // }

        rv += "<p><cite>" + this.getLongBookPage() + "</cite></p>";

        return rv;
    }

    export(): IChargenHindrance {
        let rv: IChargenHindrance = super.export() as IChargenHindrance;

        // console.log( "export this uuid", this.uuid);
        // console.log( "export rv uuid", rv.uuid);
        // rv.custom_name = "";
        // rv.uuid = "";

        rv.base_name = this.baseName;
        rv.setting_item = this.setting_item ? true : false;
        rv.counts_as_other = this.countsAsOther;
        rv.removed = this.removed ? true : false;
        rv.major = this.major ? true : false;
        rv.minor_or_major = this.minorOrMajor ? true : false;
        rv.summary_minor = this.summaryMinor;
        rv.effects_minor = this.effectsMinor;
        rv.effects = this.effects;
        rv.conflicts = this.conflicts;
        rv.needs_to_specify = this.needsToSpecify ? true : false;
        rv.always_show_long_name = this.alwaysShowLongName ? true : false;
        rv.can_be_taken_more_than_once = this.canBeTakenMoreThanOnce ? true : false;
        rv.specify = this.specify;
        rv.no_select = this.no_select ? true : false;
        rv.hidden_on_character_sheet = this.hiddenOnCharacterSheet ? true : false;

        rv.selectedOptions = null;
        if( this.is_custom || this.setting_item ) {
            rv.selectedOptions = this.exportOptions();
        }
        rv  = cleanUpReturnValue(rv);
        return rv;
    }

    isAvailable( charObj: PlayerCharacter | null = null ): IItemUpdateItemAvailability {
        let messages: string[] = [];
        if( !charObj ) {
            return {
                canBeTaken: true,
                messages: messages,
            };
        } else {
            let canBeTaken = true;

            if( !charObj.setting.hindranceIsEnabled( this.id ) ) {
                canBeTaken = false;
                messages.push( this.name + " is on the setting's block list");
            }

            for( let item of charObj._bannedHindrances ) {
                if( item.name.toLowerCase().trim() == this.name.toLowerCase().trim() ) {
                    canBeTaken = false;
                    messages.push( this.name + " blocked due to the " + item.from + "'s block list");
                }
            }

            // Conflicts
            for( let conflict of this.conflicts ) {
                let result = ParseRequirementLine( conflict, charObj);

                if( !result.empty &&  result.found ) {
                    messages.push( result.parseMessage)
                    canBeTaken = false;
                }
            }

            for( let conf of charObj._blockedHindrances ) {
                conf = conf.toLowerCase().trim();
                if( conf  == this.name.toLowerCase().trim() ) {
                    canBeTaken = false;
                    messages.push( this.name + " is on the character's internal hindrance blacklist - likely given by a race modifier");
                }
            }

            return {
                canBeTaken: canBeTaken,
                messages: messages,
            };
        }
    }

    calcReset() {
        this._hasBeenApplied = false;
    }

    public needsSelectedHindrance(): boolean {
        for( let effect of this.effects) {
            if( effect.toLowerCase().indexOf("[select_hindrance]" ) > -1 )
                return true;
        }

        return false;
    }

    public apply( charObj: PlayerCharacter | null = null) {
        if( this._hasBeenApplied ) {
            console.log( this.name + " has already been applied, skipping");
            return;
        }

        this._hasBeenApplied = true;

        if(!charObj ) {
            charObj = this._char;
        }

        if(!charObj ) {
            return;
        }

        let applyImmediately = false;
        for( let effect of this.effects) {
            if(
                effect.toLowerCase().trim().indexOf("add_hindrance") > -1
                && effect.toLowerCase().trim().indexOf(":" + this.name.toLowerCase().trim()) == -1
            ) {
                applyImmediately = true;
            } else {
                if( effect.toLowerCase().trim().indexOf(":" + this.name.toLowerCase().trim()) > -1 ) {
                    console.error("Seriously? Don't try to add the same hindrance over and over and over and over....\nmodline", effect)
                }
            }
        }

        let parsedEffects: string[] = [];
        let parsedMinorEffects: string[] = [];

        for( let effect of this.effects) {
            let parsedEffect = effect.toString();
            if( this.specify )
                parsedEffect = replaceAll(parsedEffect, "[select_hindrance]", this.specify);

            parsedEffects.push(parsedEffect)

        }

        for( let effect of this.effectsMinor) {
            let parsedEffect = effect.toString();
            if( this.specify )
                parsedEffect = replaceAll(parsedEffect, "[select_hindrance]", this.specify);

                parsedMinorEffects.push(parsedEffect)

        }

        if( this.major ) {
            ApplyCharacterEffects(
                parsedEffects,
                charObj,
                "Hindrance: " + this.name,
                null,
                null,
                null,
                applyImmediately
            )
        } else {
            if( this.minorOrMajor ) {
                ApplyCharacterEffects(
                    parsedMinorEffects,
                    charObj,
                    "Hindrance: " + this.name,
                    null,
                    null,
                    null,
                    applyImmediately
                )
            } else {
                ApplyCharacterEffects(
                    parsedEffects,
                    charObj,
                    "Hindrance: " + this.name,
                    null,
                    null,
                    null,
                    applyImmediately
                )
            }
        }

    }

    public exportHTML(hideImage: boolean = false): string {

        let exportHTML = "";

        if( this.name ) {
            let majorMinor = " (minor)";
            if( this.major ) {
                majorMinor = " (major)";
            }
            if( this.minorOrMajor ) {
                majorMinor = " (major or minor)";
            }
            exportHTML += "<h1>" + this.name + majorMinor + "</h1>\n";
        }

        if( this.description.length > 0 && (this.description[0].trim() != "" && this.description.length == 1) ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>\n";
        }

        if( this.minorOrMajor ) {
            exportHTML += "<h3>As a Major Hindrance</h3>"
            exportHTML += "<p><strong>Summary</strong>: " + this.summary + "</p>\n";
            exportHTML += "<h3>As a Minor Hindrance</h3>"
            exportHTML += "<p><strong>Summary</strong>: " + this.summaryMinor + "</p>\n";
        } else {
            exportHTML += "<p><strong>Summary</strong>: " + this.summary + "</p>\n";
        }

        if( this.description.length > 0 ) {
            exportHTML += "<p>" + this.description.split("\n").join("</p><p>") + "</p>\n";
        }
        return exportHTML;
    }

    public getSummary(): string {
        if( this.minorOrMajor ) {
            if( this.major || !this.summaryMinor.trim() ) {
                return this.summary;
            } else {
                return this.summaryMinor;
            }
        } else {
            return this.summary;
        }
    }

    exportOptions(): IChargenHindranceOptions {
        let rv = super.exportOptions() as IChargenHindranceOptions;

        rv.specify = this.specify;
        rv.major = this.major;

        return rv;
    }

    importOptions( importOption: IChargenHindranceOptions) {
        super.importOptions( importOption )
        this.specify = importOption.specify;
        this.major = false;
        if( importOption.major ) {
            this.major = true;
        }
    }
}

