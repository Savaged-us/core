import { IEffectVailidtyResults } from '../../interfaces/IEffectVailidtyResults';
import { ApplyCharacterEffects } from '../../utils/ApplyCharacterMod';
import { BaseObject, IBaseObjectExport } from '../_base_object';
import { ArcaneBackground } from './arcane_background';
import { Hindrance } from './hindrance';
import { PlayerCharacter } from './player_character';
import { Power } from './power';
import { ISuperPower2014ObjectVars, SuperPower2014 } from './super_power_2014';
import { ISuperPower2021ObjectVars, SuperPower2021 } from './super_power_2021';

export interface IChargenRaceAbility extends IBaseObjectExport{
    adjusted_value: number;
    custom_effects: string[];
    custom_name: string;
    custom_summary: string;
    custom_value: number;
    effects: string | string[];
    max: string;
    needs_selected_attribute: boolean;
    needs_selected_edge: boolean;
    needs_selected_hindrance: boolean;
    needs_selected_skill: boolean;
    needs_selected_trait: boolean;
    needs_selected_super_powers: boolean;
    needs_selected_power: boolean;
    positive: boolean;
    selected_attribute: string;
    selected_edge: string;
    selected_hindrance: string;
    selected_hindrance_major: boolean;
    selected_skill: string;
    selected_skill_specify: string;
    selected_trait: string;
    selected_trait_specify: string;

    selected_super_power_2021_options: ISuperPower2021ObjectVars;
    selected_super_power_2021: number;

    selected_super_power: number;
    selected_super_power_options: ISuperPower2014ObjectVars;
    selected_power: number;

    value: number;
    alternateChoices: PlayerCharacterRaceAbility[];
}

export class PlayerCharacterRaceAbility extends BaseObject {
    adjusted_value: number = 0;
    customEffects: string[] = [];
    customName: string = "";
    customSummary: string = "";
    customValue: number = 0;
    max: string = "";

    _hasBeenApplied: boolean = false;

    needsSelectedAttribute: boolean = false;
    needsSelectedEdge: boolean = false;
    needsSelectedHindrance: boolean = false;
    needsSelectedSkill: boolean = false;
    needsSelectedTrait: boolean = false;
    needsSelectedPower: boolean = false;
    needsSelectedSuperPower: boolean = false;

    positive: boolean = false;
    selectedAttribute: string = "";
    selectedEdge: string = "";
    selectedHindrance: string = "";
    selectedHindranceMajor: boolean = false;;
    selectedSkill: string = "";
    selectedSkillSpecify: string = "";
    selectedTrait: string = "";
    selectedTraitSpecify: string = "";

    selectedPower: number = 0;
    selectedSuperPower2014: number = 0;
    selectedSuperPower2014Options: ISuperPower2014ObjectVars;

    selectedSuperPower2021: number = 0;
    selectedSuperPower2021Options: ISuperPower2021ObjectVars;

    value: number = 0;
    effects: string[] = [];

    filter: string[] = [];

    hindranceObj: Hindrance;

    selectedSuperPower2014Obj: SuperPower2014 = new SuperPower2014();
    selectedSuperPower2021Obj: SuperPower2021 = new SuperPower2021();

    alternateChoices: PlayerCharacterRaceAbility[] = [];
    selectedChoice: number = -1;

    constructor(
        initObj: IChargenRaceAbility | null,
        charObj: PlayerCharacter | null,
    ) {
        super( initObj, charObj );
        this.import( initObj );
    }

    calcReset() {
        this._hasBeenApplied = false;
    }

    import( initObj: IChargenRaceAbility | null ) {
        if( initObj ) {
            super.import(initObj, this._char ? this._char.getAvailableData().books : [] );
            this.adjusted_value = initObj.adjusted_value;
            this.customEffects = initObj.custom_effects;
            this.customName = initObj.custom_name;
            this.customSummary = initObj.custom_summary;
            this.customValue = initObj.custom_value;
            this.needsSelectedAttribute = initObj.needs_selected_attribute;
            this.needsSelectedEdge = initObj.needs_selected_edge;
            this.needsSelectedHindrance = initObj.needs_selected_hindrance;
            this.needsSelectedSkill = initObj.needs_selected_skill;
            this.needsSelectedTrait = initObj.needs_selected_trait;
            this.needsSelectedPower = initObj.needs_selected_power;
            this.needsSelectedSuperPower = initObj.needs_selected_super_powers;
            this.positive = initObj.positive;
            this.selectedAttribute = initObj.selected_attribute;
            this.selectedEdge = initObj.selected_edge;
            this.selectedHindrance = initObj.selected_hindrance;
            this.selectedHindranceMajor = initObj.selected_hindrance_major;
            this.selectedSkill = initObj.selected_skill;
            this.selectedSkillSpecify = initObj.selected_skill_specify;
            this.selectedTrait = initObj.selected_trait;
            this.selectedTraitSpecify = initObj.selected_trait_specify;
            this.selectedPower = initObj.selected_power;
            this.selectedSuperPower2014 = initObj.selected_super_power;
            this.selectedSuperPower2014Options = initObj.selected_super_power_options;

            if( initObj.alternateChoices ) {
                this.alternateChoices = initObj.alternateChoices;
            }

            if( initObj.selected_super_power_2021_options) {

                this.selectedSuperPower2021Options = initObj.selected_super_power_2021_options;
            }
            if( initObj.selected_super_power_2021) {
                this.selectedSuperPower2021 = initObj.selected_super_power_2021;
            }
            if( initObj.id > 0 )
                this.value = initObj.value;

            if( !this.customSummary )
                this.customSummary = "";
            if( !this.customName )
                this.customName = "";

            if( initObj.effects ) {
                if( typeof(initObj.effects) == "string") {
                    this.effects = JSON.parse(initObj.effects);
                } else {
                    this.effects = initObj.effects;
                }
            }
            // Add Super Power....
            if( this.needsSelectedSuperPower && this._char && this._char.setting.book_is_used(4)) {
                // Add Super Power....
                if( this.selectedSuperPower2014 ) {
                    if( this.selectedSuperPower2014Obj ) {
                        this.selectedSuperPower2014Options = this.selectedSuperPower2014Obj.exportOptions();
                    }
                    for( let powerDef of this._char.getAvailableData().super_powers_2014 ) {
                        if( powerDef.id == this.selectedSuperPower2014 ) {
                            this.selectedSuperPower2014Obj = new SuperPower2014(
                                powerDef,
                                // this.selectedSuperPower2014Options,
                                this._char,
                            );

                            this.selectedSuperPower2014Obj.importOptions( this.selectedSuperPower2014Options )
                            // this._char.addedSuperPowers2014.push(
                            //     this.selectedSuperPower2014Obj
                            // );

                        }

                    }
                    // if( this.selectedSuperPower2014Obj )
                    //     this.value = 2 + this.selectedSuperPower2014Obj.getPoints()
                }
            }

            this.makeSPC2021PowerObject();
        }
    }

    makeSPC2021PowerObject() {
        if( this.needsSelectedSuperPower && this._char && this._char.setting.book_is_used(169) ) {
            // Add Super Power....

            if( this.selectedSuperPower2021 ) {
                if( this.selectedSuperPower2021Obj && this.selectedSuperPower2021Obj.id > 0 ) {
                    this.selectedSuperPower2021Options = this.selectedSuperPower2021Obj.exportOptions();
                }
                for( let powerDef of this._char.getAvailableData().super_powers_2021 ) {
                    if( powerDef.id == this.selectedSuperPower2021 ) {
                        this.selectedSuperPower2021Obj = new SuperPower2021(
                            powerDef,
                            // this.selectedSuperPower2014Options,
                            this._char,
                        );

                        this.selectedSuperPower2021Obj.importOptions( this.selectedSuperPower2021Options )
                        // this._char.addedSuperPowers2014.push(
                        //     this.selectedSuperPower2014Obj
                        // );

                    }
                }
                // if( this.selectedSuperPower2021Obj )
                //     this.value = 2 + this.selectedSuperPower2014Obj.getPoints();

            }
        }
    }

    export(): IChargenRaceAbility {
        let returnObject = super.export() as IChargenRaceAbility;

        // let superPowerOptions: ISuperPower2014ObjectVars;
        if( this.selectedSuperPower2014Obj ) {
            this.selectedSuperPower2014Options = this.selectedSuperPower2014Obj.exportOptions();
        }

        if( this.selectedSuperPower2021Obj ) {
            this.selectedSuperPower2021Options = this.selectedSuperPower2021Obj.exportOptions();
        }

        returnObject.effects = this.effects;
        returnObject.alternateChoices = this.alternateChoices;
        returnObject.adjusted_value = this.adjusted_value;
        returnObject.custom_effects = this.customEffects;
        returnObject.custom_name = this.customName;
        returnObject.custom_summary = this.customSummary;
        returnObject.custom_value = this.customValue;
        returnObject.max = this.max;
        returnObject.needs_selected_attribute = this.needsSelectedAttribute;
        returnObject.needs_selected_edge = this.needsSelectedEdge;
        returnObject.needs_selected_hindrance = this.needsSelectedHindrance;
        returnObject.needs_selected_skill = this.needsSelectedSkill;
        returnObject.needs_selected_trait = this.needsSelectedTrait;
        returnObject.needs_selected_power = this.needsSelectedPower;
        returnObject.needs_selected_super_powers = this.needsSelectedSuperPower;
        returnObject.positive = this.positive;
        returnObject.selected_attribute = this.selectedAttribute;
        returnObject.selected_edge = this.selectedEdge;
        returnObject.selected_hindrance = this.selectedHindrance;
        returnObject.selected_hindrance_major = this.selectedHindranceMajor;
        returnObject.selected_skill = this.selectedSkill;
        returnObject.selected_skill_specify = this.selectedSkillSpecify;
        returnObject.selected_trait = this.selectedTrait;
        returnObject.selected_trait_specify = this.selectedTraitSpecify;
        returnObject.selected_power = this.selectedPower;
        returnObject.selected_super_power = this.selectedSuperPower2014;
        returnObject.selected_super_power_options = this.selectedSuperPower2014Options;
        returnObject.value = this.value;

        returnObject.selected_super_power_2021 = this.selectedSuperPower2021;
        returnObject.selected_super_power_2021_options = this.selectedSuperPower2021Options;

        return returnObject;
    }

    getName( getTargets: boolean = false ):string {

        let rv = "";
        if( this.customName ) {
            rv = this.customName;
        } else {
            rv = this.name;
        }

        if( getTargets ) {
            rv += " (Racial)"

            if( this.needsSelectedAttribute ) {
                rv += " - " + this.selectedAttribute;
            }

            if( this.needsSelectedSkill ) {
                rv += " - " + this.selectedSkill;
            }

            if( this.needsSelectedEdge ) {
                if( this._char && !isNaN(+this.selectedEdge) )
                    rv += " - " + this._char.getEdgeNameById(+this.selectedEdge);
                else
                    rv += " - " + this.selectedEdge;
            }

            if( this.needsSelectedPower ) {
                if( this._char ) {
                    for( let pow of this._char.getAvailableData().powers ) {
                        if( pow.id == this.selectedPower ) {
                            rv += " - " + pow.name;
                            break;
                        }
                    }

                }
            }

            if( this.needsSelectedSuperPower ) {
                if( this.selectedSuperPower2014Obj && this.selectedSuperPower2014Obj.id > 0) {
                    rv += " - " + this.selectedSuperPower2014Obj.name;
                } if( this.selectedSuperPower2021Obj && this.selectedSuperPower2021Obj.id > 0 ) {
                    rv += " - " + this.selectedSuperPower2021Obj.name;
                } else {
                    rv += " - n/a";
                }
            }

        } else {
            rv += " (Racial)"
        }
        return rv;
    }

    getSummary():string {

        if( this.customSummary ) {
            return this.customSummary;
        } else {
            if( this.needsSelectedSuperPower && this.selectedSuperPower2021Obj && this.selectedSuperPower2021Obj.id > 0 ) {
                return this.selectedSuperPower2021Obj.getSummary()
            } else {
                return this.summary;
            }

        }

    }

    getSelectedSkillLong(): string {

        if( this.selectedSkill ) {
            if( this.selectedSkillSpecify ) {
                return this.selectedSkill + " (" + this.selectedSkillSpecify + ")";
            } else {
                return this.selectedSkill;
            }
        } else {
            return "";
        }

    }

    getEffects():string[] {
        let returnEffects: string[] = [];

        // due to pointers, the array needs to be copied
         if( this.id == 0 ) {
            for( let effect of this.customEffects ) {
                returnEffects.push(effect)
            }

        } else {
            for( let effect of this.effects ) {
                returnEffects.push(effect)
            }
        }

        for( let lCounter = 0; lCounter < returnEffects.length; lCounter++) {
            // Replace Attribute Select
            if( this.needsSelectedAttribute && this.selectedAttribute ) {

                while( returnEffects[lCounter].indexOf( '[selected_attribute]') > -1 ) {
                    returnEffects[lCounter] = returnEffects[lCounter].replace('[selected_attribute]', this.selectedAttribute);
                }
            }

            // Replace Skill Select
            if( this.needsSelectedSkill && this.selectedSkill ) {
                while( returnEffects[lCounter].indexOf( '[selected_skill]') > -1 ) {
                    returnEffects[lCounter] = returnEffects[lCounter].replace('[selected_skill]', this.getSelectedSkillLong() );
                }
            }

            // Replace Edge Select
            if( this.needsSelectedSkill && this.selectedSkill ) {
                while( returnEffects[lCounter].indexOf( '[selected_edge]') > -1 ) {
                    returnEffects[lCounter] = returnEffects[lCounter].replace('[selected_edge]', this.getSelectedSkillLong() );
                }
            }

            // Replace Hindrance Select
            if( this.needsSelectedSkill && this.selectedSkill ) {
                while( returnEffects[lCounter].indexOf( '[selected_hindrance]') > -1 ) {
                    returnEffects[lCounter] = returnEffects[lCounter].replace('[selected_hindrance]', this.getSelectedSkillLong() );
                }
            }
            // Replace Trait Select
            if( this.needsSelectedSkill && this.selectedSkill ) {
                while( returnEffects[lCounter].indexOf( '[selected_trait]') > -1 ) {
                    returnEffects[lCounter] = returnEffects[lCounter].replace('[selected_trait]', this.getSelectedSkillLong() );
                }
            }
        }

        return returnEffects;
    }

    applyAdditionalEffects( charObj: PlayerCharacter ) {

        if( this._hasBeenApplied ) {
            console.warn( this.name + " has already been applied, skipping");
            return;
        }

        this._hasBeenApplied = true;
        // Standard Gifted Power
        if( this.needsSelectedPower ) {
            let giftedABIndex = charObj.getArcaneBackgroundIndex("Gifted", true);

            if( giftedABIndex == -1 ) {
                // extra power + ab costs 2

                // no gifted ab found, add it
                for( let ab of charObj.getAvailableData().arcane_backgrounds) {

                    if(
                        ab.name.toLowerCase().trim() == "gifted"
                            &&
                        charObj.setting.getPrimaryBookID() == ab.book_id
                    ) {
                        charObj._numberOfArcaneBackgrounds++;
                        charObj._startingSelectedArcaneBackground++;
                        let newAB = new ArcaneBackground(
                            ab,
                            charObj,

                        );

                        newAB.currentPowerPoints = ab.starting_power_points;
                        newAB.fromRace = true;
                        charObj._selectedArcaneBackgrounds.push(
                            newAB
                        );
                        giftedABIndex = charObj._selectedArcaneBackgrounds.length - 1;
                    }
                }

                charObj.edgeAddByName(
                    "Arcane Background",
                    "",
                    "Racial Ability",
                    true,
                );

            } else {
                // extra power only costs 1
                charObj._numberOfArcaneBackgrounds++;
                charObj._startingSelectedArcaneBackground++;
            }

            let racialAbilitySpot = charObj.race.hasRacialAbility("Power", this.uuid);

            if( racialAbilitySpot.powerIndex == 0 ) {
                this.value = 2;
            } else {
                this.value = 1;
            }

            // add selected Power
            if( charObj._selectedArcaneBackgrounds[ giftedABIndex ] ) {
                for( let powerDef of charObj.getAvailableData().powers ) {
                    if( powerDef.id == this.selectedPower ) {
                        let addPower = new Power( powerDef, charObj, charObj._selectedArcaneBackgrounds[ giftedABIndex ],  );
                        addPower.customName = this.customName;
                        addPower.customDescription = this.customSummary;
                        //@ts-ignore
                        charObj._selectedArcaneBackgrounds[ giftedABIndex ].addedPowers.push(
                            addPower
                        );
                    }
                }

            }

        }

        // Add Edge....
        if( this.needsSelectedEdge ) {
            // Add Edge....
            if( this.selectedEdge ) {
                charObj.edgeAdd( +this.selectedEdge, "", "Custom Race", false );
            }
        }

        // Add Hindrance....
        if( this.needsSelectedHindrance ) {
            //  Add Hindrance....
            if( this.selectedHindrance ) {

                let hindranceObj = charObj.hindranceAdd( +this.selectedHindrance, "", this.selectedHindranceMajor, "Custom Race" );
                if( hindranceObj !== false && hindranceObj !== true ) {
                    this.hindranceObj = hindranceObj;
                    hindranceObj.apply();
                    if( this.hindranceObj.major ) {
                        this.value = -2;
                    } else {
                        this.value = -1;
                    }
                }
            }
        }

        // Add Super Power....
        if( this.needsSelectedSuperPower ) {
            //  Add Super Power....
            if( this.selectedSuperPower2014 ) {
                if( this.selectedSuperPower2014Obj && this.selectedSuperPower2014Obj.id > 0 ) {
                    this.selectedSuperPower2014Options = this.selectedSuperPower2014Obj.exportOptions();
                }
                for( let powerDef of charObj.getAvailableData().super_powers_2014 ) {
                    if( powerDef.id == this.selectedSuperPower2014 ) {

                        this.selectedSuperPower2014Obj = new SuperPower2014(
                            powerDef,
                            this._char
                        );
                        this.selectedSuperPower2014Obj.importOptions( this.selectedSuperPower2014Options );
                        charObj.addedSuperPowers2014.push(
                            this.selectedSuperPower2014Obj
                        );
                    }
                }
                // if( this.selectedSuperPower2014Obj )
                //     this.value = 2 + this.selectedSuperPower2014Obj.getPoints()
            }

            this.makeSPC2021PowerObject();
        }
    }

    public getPoints() {
        let rv = this.value;
        if( this.selectedSuperPower2014Obj && this.selectedSuperPower2014Obj.id > 0 )
            rv = 2 + this.selectedSuperPower2014Obj.getPoints()
        if( this.selectedSuperPower2021Obj && this.selectedSuperPower2021Obj.id > 0 )
            rv = 2 + this.selectedSuperPower2021Obj.getPoints()

        if( this.needsSelectedHindrance && this.hindranceObj  ) {

            if( this.hindranceObj.major ) {
                this.value = -2;
            } else {
                this.value = -1;
            }

        }
        return rv;
    }

    public getEffectValidity(): IEffectVailidtyResults {
        let rv: IEffectVailidtyResults = {
            total: 0,
            good: 0,
            valid: true,
            messages: [],
        }

        const results = ApplyCharacterEffects(
            this.effects
        )

        for( let result of results ) {
            if( result ) {
                rv.total++;
                if( result.good ) {
                    rv.good++;
                } else {
                    rv.valid = false;
                }
                rv.messages.push( result );
            }
        }

        return rv;
    }
}