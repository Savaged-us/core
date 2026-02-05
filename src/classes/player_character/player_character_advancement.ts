import { ValidityLevel } from "../../enums/ValidityLevel";
import { IValidationMessage } from "../../interfaces/IValidationMessage";
import { ucFirstLetter } from "../../utils/CommonFunctions";
import { Edge, IChargenEdge, IChargenEdgeObjectVars } from "./edge";
import { PlayerCharacter } from "./player_character";

export interface IChargenAdvancement {
    type: string;
    target1: string;
    target2: string;
    target3: string;
    target4: string;
    target5: string;
    target6: string;
    target7: string;
    target8: string;
    target9: string;
    target10: string;
    // target11: string;
    // target12: string;
    // target13: string;
    // target14: string;
    // target15: string;
    // target16: string;
    // target17: string;
    // target18: string;
    // target19: string;
    // target20: string;
    // target21: string;
    // target22: string;
    // target23: string;
    // target24: string;
    // target25: string;
    selectedEdgeOptions: IChargenEdgeObjectVars | null;
    customEdgeDef: IChargenEdge | null;
}

export class PlayerCharacterAdvancement {

    charObj: PlayerCharacter;
    advanceIndex: number;
    type: string = "";
    target1: string = "";
    target2: string = "";
    target3: string = "";
    target4: string = "";
    target5: string = "";
    target6: string = "";
    target7: string = "";
    target8: string = "";
    target9: string = "";
    target10: string = "";
    // target11: string = "";
    // target12: string = "";
    // target13: string = "";
    // target14: string = "";
    // target15: string = "";
    // target16: string = "";
    // target17: string = "";
    // target18: string = "";
    // target19: string = "";
    // target20: string = "";
    // target21: string = "";
    // target22: string = "";
    // target23: string = "";
    // target24: string = "";
    // target25: string = "";

    selectedEdgeOptions: IChargenEdgeObjectVars | null = null;
    selectedEdge: Edge  | null= null;
    customEdgeDef: IChargenEdge | null = null;

    _hasBeenApplied = false;

    constructor(
        advanceIndex: number,
        importObj: IChargenAdvancement | null = null,
        charObj: PlayerCharacter | null = null,
    ) {
        if( advanceIndex > -1 ) {
            this.advanceIndex = advanceIndex;
        }
        if( charObj ) {
            this.charObj = charObj
        }
        if( importObj ) {
            if( importObj.type ) {
                this.type = importObj.type;
            }

            if( importObj.selectedEdgeOptions ) {
                this.selectedEdgeOptions = importObj.selectedEdgeOptions;
            }

            if( importObj.customEdgeDef ) {
                this.customEdgeDef = importObj.customEdgeDef;
            }

            if( importObj.target1 ) {
                this.target1 = importObj.target1;
            }

            if( importObj.target2 ) {
                this.target2 = importObj.target2;
            }

            if( importObj.target3 ) {
                this.target3 = importObj.target3;
            }

            if( importObj.target4 ) {
                this.target4 = importObj.target4;
            }

            if( importObj.target5 ) {
                this.target5 = importObj.target5;
            }

            if( importObj.target6 ) {
                this.target6 = importObj.target6;
            }

            if( importObj.target7 ) {
                this.target7 = importObj.target7;
            }

            if( importObj.target8 ) {
                this.target8 = importObj.target8;
            }

            if( importObj.target9 ) {
                this.target9 = importObj.target9;
            }

            if( importObj.target10 ) {
                this.target10 = importObj.target10;
            }

            // Remove after next data migration

            if( importObj.target1 == "custom" && !this.customEdgeDef ) {
                this.selectedEdge  = new Edge( null, this.charObj, );
                this.selectedEdge.name = importObj.target2;
                this.selectedEdge.summary = importObj.target3;
                this.selectedEdge.effects = importObj.target4.split("\n");

                this.customEdgeDef = this.selectedEdge.export();

                this.selectedEdge.is_custom = true;

            } else {
                if( importObj.target1 == "custom"  ) {
                    this.selectedEdge  = new Edge( this.customEdgeDef, this.charObj, );
                    this.selectedEdge.is_custom = true;
                }
            }

            // END OF Remove after next data migration

            if( this.selectedEdge ) {
                this.selectedEdge.takenAtRank = this._getRankFromAdvanceIndex( this.advanceIndex );
                this.selectedEdge.takenAtAdvance = this.advanceIndex;
                this.selectedEdge.importOptions( this.selectedEdgeOptions );
            }
        }

    }

    public exportObj(): IChargenAdvancement {
        let rv: IChargenAdvancement = {
            type: this.type,
            target1: this.target1,
            target2: this.target2,
            target3: this.target3,
            target4: this.target4,
            target5: this.target5,
            target6: this.target6,
            target7: this.target7,
            target8: this.target8,
            target9: this.target9,
            target10: this.target10,

            selectedEdgeOptions: null,
            customEdgeDef: null,
        }

        if( this.selectedEdge ) {
            this.selectedEdgeOptions = this.selectedEdge.exportOptions()
            rv.selectedEdgeOptions = this.selectedEdge.exportOptions();

            // console.log("rv.selectedEdgeOptions", this.getName(), rv.selectedEdgeOptions);

            if( this.selectedEdge.is_custom ) {
                rv.customEdgeDef = this.customEdgeDef;
            }
        }

        return rv;
    }

    public getAdvancementSelectItems(): IAdvanceSelectItem[] {
        let returnItems: IAdvanceSelectItem[] = [];
        if( this.charObj.setting.primaryIsSWADE ) {
            returnItems = [
                {
                    value: "edge",
                    label: "Gain a New Edge",
                },
                {
                    value: "raise_skill_above",
                    label: "Increase a skill that is equal to or greater than its linked attribute one die type",
                },
                {
                    value: "swade_raise_skills_below",
                    label: "Increase two skills that are lower than their linked attributes by one die type each.",
                },
                {
                    value: "attribute",
                    label: "Increase one attribute by a die type.",
                },
                {
                    value: "swade_lower_hindrance",
                    label: "Permanently remove a Minor Hindrance, or reduce a Major Hindrance to a Minor (if possible).",
                },
            ];

            if(this.advanceIndex >= 1) { // } && this.charObj._advancements[ this.advanceIndex - 1].type == "") {
                returnItems.push({
                    value: "swade_remove_major_hindrance",
                    label: "Permanently remove a Major Hindrance (ask your GM)",
                })
            }

        } else {
            returnItems = [
                {
                    value: "edge",
                    label: "Gain a New Edge",
                },
                {
                    value: "new_skill",
                    label: "Buy a new skill at d4",
                },
                {
                    value: "raise_skill_above",
                    label: "Increase a skill that is equal to or greater than its linked attribute one die type",
                },
                {
                    value: "raise_skills_below",
                    label: "Increase two skills that are lower than their linked attributes by one die type each.",
                },
                {
                    value: "attribute",
                    label: "Increase one attribute by a die type.",
                },
            ]
        }

        if( this.charObj.usesSkillSpecializations() ) {
            returnItems.push(
                {
                    value: "add_skill_specializations",
                    label: "Add two skill specializations",
                },
            )
        }
        return returnItems;
    }

    calcReset() {
        // console.log("adv calcReset");
        this._hasBeenApplied =  false;
    }
    apply() {

        if( this._hasBeenApplied ) {
            console.warn("advance already applied");
            return;
        }

        this._hasBeenApplied = true;

        this.selectedEdge = null;
        if( this.type == "edge" ) {

            if( this.target1 == "custom" ) {

                this.selectedEdge = new Edge(this.customEdgeDef, this.charObj, );

                this.selectedEdge.is_custom = true;
            } else if( this.target1.startsWith("setting-edge-index-") ) {
                let settingEdgeIndex = +this.target1.replace("setting-edge-index-", "");
                if( this.charObj.setting
                    && this.charObj.setting.customEdges
                    && this.charObj.setting.customEdges.length > settingEdgeIndex
                    && this.charObj.setting.customEdges[settingEdgeIndex]
                ) {
                    this.selectedEdge = new Edge(this.charObj.setting.customEdges[settingEdgeIndex], this.charObj, );
                }
            }else {
                for( let edgeDef of this.charObj.getAvailableData().edges )  {
                    if( edgeDef.id == +this.target1 ) {

                        this.selectedEdge = new Edge(edgeDef, this.charObj, );

                    }
                }
            }
            if( this.selectedEdge ) {
                this.selectedEdge.takenAtRank = this._getRankFromAdvanceIndex( this.advanceIndex );
                this.selectedEdge.takenAtAdvance = this.advanceIndex;
                this.selectedEdge.importOptions( this.selectedEdgeOptions );
                // if( this.selectedEdge.addsArcaneBackground ) {
                //     console.log("???", this.charObj._numberOfArcaneBackgrounds)
                //     this.selectedEdge.abCount = this.charObj._numberOfArcaneBackgrounds;
                //     // this.charObj._selectedArcaneBackgrounds.push( null )
                //     this.charObj._numberOfArcaneBackgrounds++;
                // }
            }

        }

        if( this.type ) {
            switch( this.type ) {
                case "edge": {
                    // apply the edge
                    if( this.selectedEdge ) {
                        if( this.selectedEdge.is_custom ) {
                            this.customEdgeDef = this.selectedEdge.export();
                        } else {
                            this.selectedEdgeOptions = this.selectedEdge.exportOptions();
                        }

                        this.selectedEdge.apply( this.charObj, false, true );

                        if( this.selectedEdge.addsArcaneBackground ) {
                            this.charObj._numberOfArcaneBackgrounds++;
                        }

                        this.charObj._advancementEdges.push( this.selectedEdge )

                        if(
                            this.selectedEdge.arcaneBackground
                            && this.selectedEdge.arcaneBackground.arcaneSkill
                            && this.charObj && this.charObj.setting
                            && this.charObj.setting.isPathfinder()
                        ) {
                            this.charObj.addSkillBoostIfZero(
                                this.selectedEdge.arcaneBackground.arcaneSkill.name,
                                1,
                            );
                        }

                    }
                    break;
                }

                case "new_skill": { // DELUXE
                    let newSkill = this.charObj.getSkill( this.target1 );
                    if( newSkill ) {
                        if( newSkill.isKnowledge ) {
                            if( this.target2 ) {

                                newSkill.specialties.push({
                                    name: this.target2,
                                    assignedValue: 0,
                                    boostValue: 0,
                                    bonusValue: 0,
                                    maxValue: 5,
                                    superBoost: 0,
                                    advanceBoost: 1,
                                    minValue: 0,
                                    isLanguage: newSkill.isLanguage,
                                    nativeLanguageIndex: -1,
                                    isLinguistLanguage: false,
                                })

                            }
                        } else {
                            newSkill.advanceBoostSkill(1, this.advanceIndex);
                        }
                    }
                    break;
                }
                case "attribute": {
                    switch( this.target1.trim().toLowerCase() ) {
                        case "agility": {
                            this.charObj._attributeAdvances.agility += 1;
                            break;
                        }
                        case "smarts": {
                            this.charObj._attributeAdvances.smarts += 1;
                            break;
                        }
                        case "spirit": {
                            this.charObj._attributeAdvances.spirit += 1;
                            break;
                        }
                        case "strength": {
                            this.charObj._attributeAdvances.strength += 1;
                            break;
                        }
                        case "vigor": {
                            this.charObj._attributeAdvances.vigor += 1;
                            break;
                        }
                    }
                    break;
                }
                case "raise_skill_above": {
                    let skill = this.charObj.getSkill( this.target1 );
                    if( skill ) {
                        skill.advanceBoostSkill(1, this.advanceIndex);
                    } else {
                        // clear out non-existent skill?
                        // this.target1 = "";
                    }
                    break;
                }
                case "add_skill_specializations": {
                    let skill = this.charObj.getSkill( this.target1 );
                    if( skill ) {
                        skill.added_specializations.push( this.target2 )
                        skill.added_specializations.push( this.target3 )
                    } else {
                        // clear out non-existent skill?
                        // this.target1 = "";
                    }
                    break;
                }

                case "swade_raise_skills_below":
                case "raise_skills_below":  {
                    let raiseSkillName1 = this.target1;
                    let raiseSkillName2 = this.target2;

                    let raiseSkillSpec1 = this.target3;
                    let raiseSkillSpec2 = this.target4;

                    if( raiseSkillName1.indexOf("(") > -1 ) {
                        let split1 = raiseSkillName1.split("(");
                        raiseSkillName1 = split1[0].trim();
                        raiseSkillSpec1 = split1[1].replace(")", "").trim();
                    }

                    if( raiseSkillName2.indexOf("(") > -1 ) {
                        let split2 = raiseSkillName2.split("(");
                        raiseSkillName2 = split2[0].trim();
                        raiseSkillSpec2 = split2[1].replace(")", "").trim();
                    }

                    let skill1 = this.charObj.getSkill( raiseSkillName1 );
                    // console.log("skill1", skill1);
                    // console.log("raiseSkillName1", raiseSkillName1);
                    // console.log("raiseSkillSpec1", raiseSkillSpec1);
                    if( skill1 ) {
                        if( skill1.isKnowledge ) {
                            if( raiseSkillSpec1 ) {
                                let foundSpec = false;
                                for( let spec of skill1.specialties )  {
                                    if( spec.name.toLowerCase().trim() == raiseSkillSpec1.toLowerCase().trim() ) {
                                        foundSpec = true;
                                        spec.advanceBoost += 1;
                                    }
                                }

                                // console.log("foundSpec", foundSpec)

                                if( foundSpec == false ) {
                                    skill1.specialties.push({
                                        name: raiseSkillSpec1,
                                        assignedValue: 0,
                                        boostValue: 0,
                                        bonusValue: 0,
                                        maxValue: 5,
                                        advanceBoost: 1,
                                        superBoost: 0,
                                        minValue: 0,
                                        isLanguage: skill1.isLanguage,
                                        nativeLanguageIndex: -1,
                                        isLinguistLanguage: false,
                                    })
                                }

                                // console.log("skill1 b", skill1);

                            }
                        } else {
                            skill1.advanceBoostSkill(1, this.advanceIndex);
                        }
                    }

                    let skill2 = this.charObj.getSkill( raiseSkillName2 );

                    if( skill2 ) {
                        if( skill2.isKnowledge ) {
                            if( raiseSkillSpec2 ) {
                                let foundSpec = false;
                                for( let spec of skill2.specialties )  {
                                    if( spec.name.toLowerCase().trim() == raiseSkillSpec2.toLowerCase().trim() ) {
                                        foundSpec = true;
                                        spec.advanceBoost += 1;
                                    }
                                }

                                if( !foundSpec ) {
                                    skill2.specialties.push({
                                        name: raiseSkillSpec2,
                                        assignedValue: 0,
                                        boostValue: 0,
                                        advanceBoost: 1,
                                        bonusValue: 0,
                                        maxValue: 5,
                                        minValue: 0,
                                        superBoost: 0,
                                        isLanguage: skill2.isLanguage,
                                        nativeLanguageIndex: -1,
                                        isLinguistLanguage: false,
                                    })
                                }

                            }
                        } else {
                            skill2.advanceBoostSkill(1, this.advanceIndex);
                        }
                    }

                    break;
                }

                case "swade_lower_hindrance": {
                    this.charObj.removeOrLowerHindrance( this.target1 );
                    break;
                }

                case "swade_remove_major_hindrance": {
                    if(
                        this.advanceIndex > 0 &&
                        this.charObj._advancements[this.advanceIndex - 1] &&
                        this.charObj._advancements[this.advanceIndex - 1].type == ""
                    ) {
                        this.charObj.removeMajorHindrance( this.target1 );
                    }
                    break;
                }

                default: {
                    console.error(  "ERROR Unhandled Advancement Apply Type", this.type );
                }
            }
        }
    }

    skillNeedsSpecify( skillName: string ): boolean {

        let skill = this.charObj.getSkill( skillName );

        if( skill && skill.isKnowledge ) {
            return true;
        }
        return false;
    }

    nextAdvanceNeedsTwoSlots(): boolean {
        if(
            this.charObj._advancements.length > this.advanceIndex + 1
            && this.charObj._advancements[this.advanceIndex + 1]
        ) {
            return this.charObj._advancements[this.advanceIndex + 1].requiresTwoSlots();
        }

        return false;
    }

    requiresTwoSlots(): boolean {
        if( this.type == "swade_remove_major_hindrance") {
            return true;
        }

        if( this.type == "attribute") {
            switch( this.target1.trim().toLowerCase() ) {
                case "agility": {
                    if( this.charObj._attributesAdvanceCost.agility > 1 ) {
                        return true;
                    }
                }
                case "smarts": {
                    if( this.charObj._attributesAdvanceCost.smarts > 1 ) {
                        return true;
                    }
                }
                case "spirit": {
                    if( this.charObj._attributesAdvanceCost.spirit > 1 ) {
                        return true;
                    }
                }
                case "strength": {
                    if( this.charObj._attributesAdvanceCost.strength > 1 ) {
                        return true;
                    }
                }
                case "vigor": {
                    if( this.charObj._attributesAdvanceCost.vigor > 1 ) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    lastSlotNotEmptyMessage(): boolean {

        if(
            this.requiresTwoSlots() == true
            &&
            (
                (
                    this.advanceIndex == 0
                )
                ||
                (
                    this.charObj._advancements[this.advanceIndex - 1]
                &&
                    this.charObj._advancements[this.advanceIndex - 1].type != ""
                )
            )
        ) {
            return true;
        }
        return false;
    }

    _getRankFromAdvanceIndex( advanceIndex: number ) {
        if( advanceIndex < 3 ) {
            return 0;
        } else if( advanceIndex < 7 ) {
            return 1;
        } else if( advanceIndex < 11 ) {
            return 2;
        } else if( advanceIndex < 15 ) {
            return 3;
        } else {
            return Math.floor( (advanceIndex - 15) / 2) + 4;

        }
    }

    numberOfAttributesTakenAtCurrentRank(): number {
        let rv = 0;

        let charObj: PlayerCharacter = this.charObj;

        let takenRank = this._getRankFromAdvanceIndex( this.advanceIndex );

        for( let adv of charObj._advancements ) {
            let advRank = this._getRankFromAdvanceIndex( adv.advanceIndex )
            if( adv && adv.type == "attribute" && takenRank == advRank ) {
                rv++;
            }
        }

        return rv;
    }

    isValid(): IValidationMessage {

        let rv: IValidationMessage = {
            message: "",    // no message
            severity: ValidityLevel.NoMessage,   // no validation message
            goURL: "/character/creator/advances"
        }

        if( this.type == "" && !this.nextAdvanceNeedsTwoSlots() ) {
            rv.severity = ValidityLevel.Warning;
            rv.message = "Don't forget to select your advancement type on Advance #" + (this.advanceIndex + 1) + "!";
        }

        if( this.lastSlotNotEmptyMessage() ) {
            rv.severity = ValidityLevel.Error;
            rv.message = "Advance #" + (this.advanceIndex + 1) + " takes two advancements and requires the previous advancement to be empty";
        }

        if( this.numberOfAttributesTakenAtCurrentRank() > 1 ) {
            rv.severity = ValidityLevel.Error;
            rv.message = "Advance #" + (this.advanceIndex + 1) + " has already had an Attribute Advance taken this rank";
        }

        if( this.selectedEdge && this.selectedEdge.arcaneBackground ) {
            let ab = this.selectedEdge.arcaneBackground;
            if ( ab.availablePowerCount() < 0 ) {
                this.charObj.addValidationMessage(
                    ValidityLevel.Error,
                    "Arcane Background \"" + ab.getName() + "\" has too many powers selected",
                    "/character/creator/advances",
                );
            }

            if( ab.currentPowerPoints < 0 ) {
                this.charObj.addValidationMessage(
                    ValidityLevel.Error,
                    "Arcane Background \"" + ab.getName() + "\" has a negative power points (likely from Artificer)",
                    "/character/creator/advances",
                );
            }

            for( let power of ab.selectedPowers ) {
                if( !power.isAvailable(this.selectedEdge.arcaneBackground, true, this.charObj) ) {
                    this.charObj.addValidationMessage(
                        ValidityLevel.Error,
                        "The Selected Power \"" + power.getName() + "\" in Arcane Background \"" + ab.getName() + "\" " + power.isNotAvailableReason(this.selectedEdge.arcaneBackground, true, this.charObj),
                        "/character/creator/advances",
                    );
                }
            }

            // let valid = this.selectedEdge.isAvailable( this.charObj );

            // if( valid.severity >= rv.severity) {
            //     rv.severity = valid.severity;
            //     rv.message = "Selected Edge (" + this.selectedEdge.getName() + "): " + valid.message;
            // }
        }

        if( this.type ) {
            switch( this.type ) {
                case "edge": {
                    if( this.selectedEdge ) {

                        let valid = this.selectedEdge.isValid( this.charObj, false );

                        if( valid.severity >= rv.severity) {
                            rv.severity = valid.severity;
                            rv.message = "Selected Edge (" + this.selectedEdge.getName() + "): " + valid.message;
                        }

                    } else {
                        if(this.target1.trim() == "" ) {

                            rv.severity = ValidityLevel.Warning;
                            rv.message = "Don't forget to select an Edge on Advance #" + (this.advanceIndex + 1) + "!";
                        }
                    }
                    break;
                }
                case "raise_skill_above": {
                    let skillObj = this.charObj.getSkill(this.target1);
                    if( skillObj) {

                        if( this.charObj.getAttributeCurrent(skillObj.attribute) > skillObj.currentValue() ) {
                            rv.severity = ValidityLevel.Error;
                            rv.message = "Skill \"" + this.target1 + "\" selected on Advance #" + (this.advanceIndex + 1) + " is no longer above the attribute";
                        }
                        if( skillObj.currentValue() > 5 ) {
                            rv.severity = ValidityLevel.Error;
                            rv.message = "Skill \"" + this.target1 + "\" selected on Advance #" + (this.advanceIndex + 1) + " is now over the d12 maximum raise with this type of advance";
                        }
                    }
                    break;
                }
                case "swade_raise_skills_below":
                case "raise_skills_below":  {

                    let skill1Valid = false;
                    let skill2Valid = false;
                    let skill1Name = this.target1
                    if( this.target3 ) {
                        skill1Name += " (" + this.target3 + ")";
                    }
                    let skill2Name = this.target2
                    if( this.target4 ) {
                        skill2Name += " (" + this.target4 + ")";
                    }
                    let foundSkill1 = false;
                    let foundSkill2 = false;

                    if( this.charObj._skillSnapShots ) {
                        // console.log("this.charObj._skillSnapShots", this.advanceIndex + 1, this.charObj._skillSnapShots)
                        for( let skill of this.charObj._skillSnapShots[this.advanceIndex]) {
                            if(

                                skill1Name.toLowerCase().trim() == skill.name.toLowerCase().trim()
                            ) {
                                // console.log("skill1", this.advanceIndex, skill1Name,skill.attributeValue, skill.value)
                                if( skill.attributeValue >= skill.value )
                                    skill1Valid = true;
                                foundSkill1 = true;
                            }

                            if(
                                skill2Name.toLowerCase().trim() == skill.name.toLowerCase().trim()
                            ) {
                                // console.log("skill2", this.advanceIndex, skill2Name,skill.attributeValue, skill.value)
                                if( skill.attributeValue >= skill.value )
                                    skill2Valid = true;
                                foundSkill2 = true;
                            }
                        }
                    }

                    if( !foundSkill1 ) {
                        skill1Valid = true;
                    }

                    if( !foundSkill2 ) {
                        skill2Valid = true;
                    }

                    // Check for warnings
                    if(this.target1.trim() == "" || this.target2.trim() == "" || !foundSkill1 || !foundSkill2) {

                        rv.severity = ValidityLevel.Warning;
                        if( (this.target1.trim() == "" && this.target2.trim() == "" ) || (!foundSkill1 && !foundSkill2) )
                            rv.message = "Don't forget to select skills on Advance #" + (this.advanceIndex + 1) + "!";
                        else
                            rv.message = "Don't forget to select a skill on Advance #" + (this.advanceIndex + 1) + "!";
                    }

                    // Check for Errors
                    if( !skill1Valid ) {
                        // this.target1 = "";
                        // this.target3 = "";
                        rv.severity = ValidityLevel.Error;
                        rv.message = "Skill \"" + skill1Name + "\" selected on Advance #" + (this.advanceIndex + 1) + " is no longer below the attribute";
                    }

                    if( !skill2Valid ) {
                        rv.severity = ValidityLevel.Error;
                        rv.message = "Skill \"" + skill2Name + "\" selected on Advance #" + (this.advanceIndex + 1) + " is no longer below the attribute";
                    }

                    break;

                }
            }
        }

        return rv;
    }

    clearOutPreviousAdvance() {
        if( this.advanceIndex > 0 && this.charObj._advancements[this.advanceIndex - 1] ) {
            this.charObj._advancements[this.advanceIndex - 1].type = "";

            this.charObj._advancements[this.advanceIndex - 1].target1 = "";
            this.charObj._advancements[this.advanceIndex - 1].target2 = "";
            this.charObj._advancements[this.advanceIndex - 1].target3 = "";
            this.charObj._advancements[this.advanceIndex - 1].target4 = "";
            this.charObj._advancements[this.advanceIndex - 1].target5 = "";
            this.charObj._advancements[this.advanceIndex - 1].target6 = "";
            this.charObj._advancements[this.advanceIndex - 1].target7 = "";
            this.charObj._advancements[this.advanceIndex - 1].target8 = "";
            this.charObj._advancements[this.advanceIndex - 1].target9 = "";
            this.charObj._advancements[this.advanceIndex - 1].target10 = "";

        }
    }

    getName(): string {

        switch( this.type ) {
            case "attribute": {
                return "Raise Attribute: " + ucFirstLetter(this.target1)
            }
            case "edge": {

                if( this.selectedEdge ) {
                    this.selectedEdge.takenAtRank = this._getRankFromAdvanceIndex( this.advanceIndex );
                    this.selectedEdge.takenAtAdvance = this.advanceIndex;
                    this.selectedEdge.importOptions( this.selectedEdgeOptions );
                }

                if( this.selectedEdge ) {

                    return "Edge: " + this.selectedEdge.getName(true);

                } else {
                    return "( Unselected Edge )";
                }
            }
            case "swade_raise_skills_below":
            case "raise_skills_below": {
                let raiseSkillName1 = this.target1;
                let raiseSkillName2 = this.target2;

                let raiseSkillSpec1 = this.target3;
                let raiseSkillSpec2 = this.target4;

                let returnDetail = "";
                if( raiseSkillName1 ) {
                    returnDetail += raiseSkillName1;
                    if( raiseSkillSpec1 ) {
                        returnDetail += " (" + raiseSkillSpec1 + ")"
                    }
                }
                if( raiseSkillName2 ) {
                    if( raiseSkillName1 ) {
                        returnDetail += "/";
                    }
                    returnDetail += raiseSkillName2;
                    if( raiseSkillSpec2 ) {
                        returnDetail += " (" + raiseSkillSpec2 + ")"
                    }
                }

                return "Raise Skills: " + returnDetail;
            }
            case "new_skill": {
                let returnSkillDetail = "";
                let newSkillSpec1 = this.target2;
                let newSkillName1 = this.target1;
                if( newSkillName1 ) {
                    returnSkillDetail += newSkillName1;
                    if( newSkillSpec1 ) {
                        returnSkillDetail += " (" + newSkillSpec1 + ")"
                    }
                }
                return "New Skill: " + returnSkillDetail;
            }
            case "raise_skill_above": {
                let returnSkillAboveDetail = "";
                let aboveSkillSpec1 = this.target2;
                let aboveSkillName1 = this.target1;
                if( aboveSkillName1 ) {
                    returnSkillAboveDetail += aboveSkillName1;
                    if( aboveSkillSpec1 ) {
                        aboveSkillSpec1 += " (" + aboveSkillSpec1 + ")"
                    }
                }
                return "Raise Skill: " + returnSkillAboveDetail;
            }
            case "swade_remove_major_hindrance": {
                let selectedHind = this.target1;

                return "Remove Major Hind: " + selectedHind;
            }
            case "swade_lower_hindrance": {

                    let selectedMinHind = this.target1;

                    return "Remove Minor Hind: " + selectedMinHind;
            }
            case "add_skill_specializations": {

                let selectedItems = "";
                if( this.target2 ) {
                    selectedItems += this.target2 + ", ";
                }

                if( this.target3 ) {
                    selectedItems += this.target3 + ", ";
                }

                return "Add Skill Specializations: " + selectedItems;
        }
            case "": {
                return "( Unselected )";
            }
            default: {
                return "Unhandled getName(): " + this.type;
            }
        }

    }

    getNextAdvance(): PlayerCharacterAdvancement | null {

        if( this.charObj._advancements.length > this.advanceIndex + 1 ) {
            if( this.charObj._advancements[ this.advanceIndex + 1]) {
                return this.charObj._advancements[ this.advanceIndex + 1];
            }
        }

        return null;
    }

}

export interface IAdvanceSelectItem {
    value: string;
    label: string;
}