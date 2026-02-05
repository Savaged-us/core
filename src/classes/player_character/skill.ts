import { ISkillListImport } from '../../interfaces/ISkillListImport';
import { getDieLabelFromIndex } from '../../utils/Dice';
import { PlayerCharacter } from './player_character';

export interface ISkillSpecialty {
    name: string;
    assignedValue: number;
    boostValue: number;
    advanceBoost: number;
    superBoost: number;
    maxValue: number;
    minValue: number;
    bonusValue: number;
    isLanguage: boolean;
    nativeLanguageIndex: number;
    isLinguistLanguage: boolean;
}

export class Skill {
    _char: PlayerCharacter;

    name: string = "";
    attribute: string = "";
    originalAttribute: string = "";
    assignedValue: number = 0;
    specialties: ISkillSpecialty[] = [];
    specializations: string[] = [];
    added_specializations: string[] = [];

    isLanguage: boolean = false;
    isLinguistLanguage: boolean = false;

    alwaysLanguage: boolean = false;
    isKnowledge: boolean = false;   // better aptly named "Uses Specialties"

    bonus: number = 0;
    maxValue: number = 5;
    minValue: number = 0;
    boostValue: number = 0;
    advanceBoostValue: number = 0;
    superBoost: number = 0;

    isCore: boolean = false;
    settingSkill: boolean = false;

    bonusValue: number = 0;
    arcaneAddedSkill: boolean = false;
    arcaneAddedUUID: string = "";
    setValue: number = 0;

    takenAtAdvance: number[] = [];

    is_custom: boolean = false;

    bookID: number = 0;

    // multipleLangIndex: number = 0;

    constructor(
        charObj: PlayerCharacter,
        importDef: ISkillListImport | null = null,
        bookID: number = 0,
    ) {
        this._char = charObj;

        if( bookID)
            this.bookID = bookID;

        if( importDef ) {
            if( importDef.name )
                this.name = importDef.name;
            if( importDef.attribute )
                this.attribute = importDef.attribute;
            if( importDef.attribute )
                this.originalAttribute = importDef.attribute;
            if( importDef.language )
                this.isLanguage = true;

            if( importDef.always_language )
                this.alwaysLanguage = true;

            if( importDef.is_knowledge )
                this.isKnowledge = true;

            if( importDef.Name )
                this.name = importDef.Name;
            if( importDef.Attribute )
                this.attribute = importDef.Attribute;
            if( importDef.Attribute )
                this.originalAttribute = importDef.Attribute;
            if( importDef.Language )
                this.isLanguage = true;
            if( importDef.AlwaysLanguage )
                this.alwaysLanguage = true;
            if( importDef.IsKnowledge )
                this.isKnowledge = true;
        }
        this.is_custom = false;

    }

    getAllSpecializations(): string[] {
        // Use spread operator for shallow copy instead of JSON.parse(JSON.stringify()) 
        // to avoid creating additional escape characters
        let rv = [...this.specializations];

        for( let spec of this.added_specializations )
            rv.push( spec )

        rv.sort();
        return rv;
    }

    currentValueNoSuperNoAdvance( specIndex: number = -1): number {
        if( specIndex > -1 ) {
            if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
                return this.specialties[specIndex].assignedValue + this.specialties[specIndex].boostValue ;
            }
        } else {
            return this.assignedValue + this.boostValue;
        }
        return 0;
    }

    currentValueNoNoAdvance( specIndex: number = -1): number {
        if( specIndex > -1 ) {
            if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
                return this.specialties[specIndex].assignedValue  ;
            }
        } else {
            return this.assignedValue + this.boostValue;
        }
        return 0;
    }

    currentValueNoNoAdvanceHR(specIndex: number = -1, showBonusValue: boolean = true): string {
        let returnString = "n/a";
        if( specIndex === null ) {
            specIndex = -1;
        }

        let traitBonusValue = this._char.getTraitBonusValue( this.attribute );

        if( showBonusValue === null ) {
            showBonusValue = true;
        }
        if( specIndex > -1 ) {
            if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
                returnString = getDieLabelFromIndex( this.specialties[specIndex].assignedValue + this.specialties[specIndex].boostValue + this.specialties[specIndex].advanceBoost  + this.specialties[specIndex].superBoost);
                if( (traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue) > 0 && showBonusValue ) {
                    returnString += "+" + (traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue).toString();
                } else if ((traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue) < 0 && showBonusValue) {
                    returnString += "" + (traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue).toString();
                }
            }
        }
        else {
            if( this.setValue > 0 ) {
                returnString = getDieLabelFromIndex( this.setValue + this.boostValue + this.superBoost );
                if( (traitBonusValue + this.bonusValue) > 0  && showBonusValue ) {
                    returnString += "+" + (traitBonusValue + this.bonusValue).toString();
                } else if (traitBonusValue + this.bonusValue < 0  && showBonusValue ) {
                    returnString += "" + (traitBonusValue + this.bonusValue).toString();
                }
            } else {
                returnString = getDieLabelFromIndex( this.assignedValue + this.boostValue + this.superBoost );
                if( (traitBonusValue + this.bonusValue) > 0  && showBonusValue ) {
                    returnString += "+" + (traitBonusValue + this.bonusValue).toString();
                } else if (traitBonusValue + this.bonusValue < 0  && showBonusValue ) {
                    returnString += "" + (traitBonusValue + this.bonusValue).toString();
                }
            }

        }
        return returnString;
    }

    currentValueNoSuper( specIndex: number = -1): number {
        if( specIndex > -1 ) {
            if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
                return this.specialties[specIndex].assignedValue + this.specialties[specIndex].advanceBoost + this.specialties[specIndex].boostValue;
            }
        } else {
            return this.assignedValue+ this.advanceBoostValue + this.boostValue;
        }
        return 0;
    }

    currentValue( specIndex: number = -1): number {
        if( specIndex > -1 ) {
            if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
                return this.specialties[specIndex].assignedValue + this.specialties[specIndex].boostValue + this.specialties[specIndex].advanceBoost  + this.specialties[specIndex].superBoost;
            }
        } else {
            if( this.setValue > 0 ) {
                return this.setValue + this.boostValue + this.advanceBoostValue + this.superBoost;
            } else {
                return this.assignedValue + this.boostValue + this.advanceBoostValue + this.superBoost;
            }

        }
        return 0;
    }

    currentValueHR(
        specIndex: number = -1,
        showBonusValue: boolean = true
    ): string {
        // let returnString = "n/a (base)";
        // if( specIndex === null ) {
        //     specIndex = -1;
        // }

        // let traitBonusValue = this._char.getTraitBonusValue( this.attribute );

        // if( showBonusValue === null ) {
        //     showBonusValue = true;
        // }

        // if( specIndex > -1 ) {
        //     // console.log("skill currentValueHR specIndex", this.name, specIndex, this.specialties.length )
        //     if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
        //         returnString = getDieLabelFromIndex( this.specialties[specIndex].assignedValue + this.specialties[specIndex].boostValue + this.specialties[specIndex].advanceBoost  + this.specialties[specIndex].superBoost);
        //         if( (traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue) > 0 && showBonusValue ) {
        //             returnString += "+" + (traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue).toString();
        //         } else if ((traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue) < 0 && showBonusValue) {
        //             returnString += "" + (traitBonusValue + this.bonusValue + this.specialties[specIndex].bonusValue).toString();
        //         }
        //     }
        // }
        // else {

        //     console.log("skill currentValueHR this.setValue, this.assignedValue", this.name, this.setValue, this.assignedValue )
        //     if( this.setValue > 0 ) {
        //         returnString = getDieLabelFromIndex( this.setValue + this.boostValue  + this.advanceBoostValue + this.superBoost );
        //         if( (traitBonusValue + this.bonusValue) > 0  && showBonusValue ) {
        //             returnString += "+" + (traitBonusValue + this.bonusValue).toString();
        //         } else if (traitBonusValue + this.bonusValue < 0  && showBonusValue ) {
        //             returnString += "" + (traitBonusValue + this.bonusValue).toString();
        //         }
        //     } else {
        //         returnString = getDieLabelFromIndex( this.assignedValue + this.boostValue  + this.advanceBoostValue + this.superBoost );
        //         if( (traitBonusValue + this.bonusValue) > 0  && showBonusValue ) {
        //             returnString += "+" + (traitBonusValue + this.bonusValue).toString();
        //         } else if (traitBonusValue + this.bonusValue < 0  && showBonusValue ) {
        //             returnString += "" + (traitBonusValue + this.bonusValue).toString();
        //         }
        //     }

        // }
        let currentValue = this.currentValue(specIndex);
        // console.log("currentValueHR", this.name, currentValue)
        let  returnString = getDieLabelFromIndex( currentValue );
        let traitBonusValue = this._char.getTraitBonusValue( this.attribute );
        if( (traitBonusValue + this.bonusValue) > 0  && showBonusValue ) {
            returnString += "+" + (traitBonusValue + this.bonusValue).toString();
        } else if (traitBonusValue + this.bonusValue < 0  && showBonusValue ) {
            returnString += "" + (traitBonusValue + this.bonusValue).toString();
        }
        return returnString;
    }

    boostSkill( amount: number = 1 ) {
        // this.maxValue += amount;
        this.minValue += amount;
        this.boostValue += amount;
    }

    setSkillValue( amount: number = 0 ) {
        // this.maxValue += amount;
        this.setValue = amount;
    }

    clearBoosts() {
        this.maxValue = 5;
        this.minValue = 0;
        this.boostValue = 0;
    }

    advanceBoostSkill( amount: number, advanceNumber: number ) {
        this.advanceBoostValue += amount;
        this.takenAtAdvance.push( advanceNumber );
    }

    incrementSkill( amount: number = 1, specIndex: number = -1 ) {
        // console.log("skill incrementSkill", this.name, amount, specIndex, this.maxValue)
        if( specIndex == -1 || !this.isKnowledge ) {
            this.assignedValue += amount;

            if( this.assignedValue > this.maxValue ) {
                this.assignedValue = this.maxValue;
            }
            // console.log("skill incrementSkill.assignedValue a", this.assignedValue)
            this._char.calc(false);
            // console.log("skill incrementSkill.assignedValue b", this.assignedValue)
            return true;
        } else {
            if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
                this.specialties[specIndex].assignedValue += amount;

                if( this.specialties[specIndex].assignedValue > this.specialties[specIndex].maxValue ) {
                    this.specialties[specIndex].assignedValue = this.specialties[specIndex].maxValue;
                }
                this._char.calc(false);
                return true;
            }

        }
        return false;
    }

    renameSpecialty( specIndex: number, newValue: string ) {
        if( this.specialties.length > specIndex && this.specialties[specIndex] ) {

            this.specialties[specIndex].name = newValue;
            this._char.multipleLanguages.sort();

            if( this._char.setting.primaryIsSWADE && this.isLanguage ) {
                if( this.boostValue == 0 ) {
                    while( this._char.multipleLanguages.length < specIndex ) {
                        this._char.multipleLanguages.push("");
                    }
                    this._char.multipleLanguages[specIndex - 1] = newValue;
                }
            }
            if( this.specialties[specIndex].isLinguistLanguage ) {
                this._char.updateLinguistSkillNames();
            }
            return true;
        }
        return false;
    }

    renameSpecialization( specializationIndex: number, newValue: string ) {
        if( this.specializations.length > specializationIndex ) {
            this.specializations[specializationIndex] = newValue;
            // this._char.calc(false);
            return true;
        }
        return false;
    }

    addSpecialization() {
        this.specializations.push("");
    }

    removeSpecialization( specializationIndex: number) {
        if( this.specializations.length > specializationIndex ) {
            this.specializations.splice(specializationIndex, 1);
            this._char.calc(false);
            return true;
        }
        return false;
    }

    addSpecialty(
        specialtyName: string = "",
        speciatlyValue: number = 1,
        isLang: boolean = false,
        nativeLanguageIndex: number = -1,
        calcLang: boolean = true,
    ) {
        this.specialties.push({
            name: specialtyName,
            assignedValue: speciatlyValue,
            minValue: 1,
            maxValue: 5,
            advanceBoost: 0,
            bonusValue: 0,
            boostValue: 0,
            superBoost: 0,
            isLanguage: isLang,
            nativeLanguageIndex: nativeLanguageIndex,
            isLinguistLanguage: false,
        });
        this._char.calc(false, calcLang);
        return true;
    }

    toggleSpecialtyLanguage( specIndex: number ) {
        if( this.specialties.length > specIndex && this.specialties[specIndex] ) {
            this.specialties[specIndex].isLanguage = !this.specialties[specIndex].isLanguage;
            this._char.calc(false);
        }
    }

    decrementSkill( amount: number = 1, specIndex: number = -1) {
        if( specIndex == -1 || this.specialties.length == 0 ) {
            this.assignedValue -= amount;

            if( this.assignedValue < 0 ) {
                this.assignedValue = 0;
            }
            this._char.calc(false);
            return true;
        } else {
            if( this.specialties.length > specIndex && this.specialties[specIndex] ) {

                this.specialties[specIndex].assignedValue -= amount;

                // remove skill if the value is below minimum value
                if( this.currentValueNoSuper( specIndex ) < this.specialties[specIndex].minValue) {
                    this.specialties.splice( +specIndex, 1);
                }
                this._char.calc(false);
                return true;
            }
        }
        return false;
    }
}