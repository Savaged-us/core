import {PlayerCharacter} from "../classes/player_character/player_character";
import { getDieIndexFromLabel } from "./Dice";
import { Edge } from "../classes/player_character/edge";
// import { SplitModlineForSkill } from "./SplitModlineForSkill";
import { capitalCase, replaceAll } from "./CommonFunctions";

export interface IRequirementResults {
    total: number;
    valid: boolean;
    messages: IRequirementResult[];

}

export interface IRequirementResult {
    found: boolean;
    valid: boolean;
    parseMessage: string;
    foundMessage: string;
    rawLine: string;
    empty: boolean;

}

export function ParseRequirementLines( lineString: string[] ) : IRequirementResult[] {
    let returnResult: IRequirementResult[] = []

    if( lineString ) {
        for( let line of lineString ) {

            let result = ParseRequirementLine(line, null);
            returnResult.push( result );

        }
    }
    return returnResult;
}

export function ParseRequirementLine(
    reqLine: string,
    charObj: PlayerCharacter| null = null,
    selectedEdge: Edge | null = null,
    ignoreRankRequirements: boolean = false,
    debug: boolean = false,
): IRequirementResult {
    if( reqLine.indexOf("||") > -1 ) {
        let returnResult: IRequirementResult = {
            found: false,
            foundMessage: "",
            parseMessage: "",
            valid: true,
            rawLine: reqLine,
            empty: false,
        }
        let lCount = 0;
            for( let part of reqLine.split("||") ) {
                let result = _ParseRequirementLine(
                    part,
                    charObj,
                    selectedEdge,
                    ignoreRankRequirements,
                );

                if( !result.empty ) {
                    if( lCount > 0 )
                        returnResult.parseMessage += " OR ";
                    returnResult.parseMessage += result.parseMessage

                    if( result.foundMessage ) {
                        if( lCount > 0 )
                            returnResult.foundMessage += " OR ";
                        returnResult.foundMessage += result.foundMessage;
                    }

                    if( !result.valid ) {
                        returnResult.valid = false;
                    }

                    if( result.found ) {
                        returnResult.found = true;
                    }

                    lCount++;
                }
            }

        return returnResult
    } else {
        return _ParseRequirementLine(
            reqLine,
            charObj,
            selectedEdge,
            ignoreRankRequirements,
            debug,
        );
    }

}

function _ParseRequirementLine(
    reqLine: string,
    charObj: PlayerCharacter | null = null,
    selectedEdge: Edge | null = null,
    ignoreRankRequirements: boolean = false,
    debug: boolean = false,
): IRequirementResult {
    let rv: IRequirementResult = {
        found: false,
        valid: true,
        parseMessage: "",
        foundMessage: "",
        rawLine: reqLine.toLowerCase().trim(),
        empty: false,
    }

    let effectiveRank = 0;

    if( charObj)
        effectiveRank = charObj.getCurrentRank();

    if( selectedEdge && selectedEdge.takenAtRank > -1 ) {
        effectiveRank = selectedEdge.takenAtRank;

    }

    reqLine = reqLine.toLowerCase().trim();
    if( !reqLine ) {
        // don't parse a blank line
        rv.empty = true;
        return rv;
    }

    if( reqLine.startsWith("#") ) {
        // don't parse a commented line
        rv.empty = true;
        return rv;
    }

    if( !ignoreRankRequirements ) {
        if (
            selectedEdge
            && charObj
            && (
                // !selectedEdge.isSelectedEdge
                //     ||
                (
                    selectedEdge.isSelectedEdge
                        &&
                    (
                        charObj.setting.settingIsEnabled("bornahero")
                            ||
                        charObj.setting.settingIsEnabled("swade_bornahero")
                    )
                )
            )
        ) {
            // born a hero and no advances on a selected edge this is good.
            ignoreRankRequirements = true;
        }
    }

    if( reqLine.indexOf(":") > -1 ) {
        // Colon
        let split = reqLine.split(":");
        switch( split[0].trim() ) {

            /* # DOC TODO
        tag: "arcane_background"
        name: "Arcane Background",
        example: ["arcane_background:Magic","arcane_background:Miracles"],
        description: "Matches if character has the specified Arcane Background",

            */
           case "arcane_background": {

            if( split[1].indexOf("|") > -1 ) {

                let split2 = split[1].split("|");
                let foundArcaneBackground: string = "";
                rv.parseMessage = "An Arcane Background of '" + split2.join("' or '") + "'";
                if( charObj ) {
                    for( let needArcaneBackground of split2 ) {
                        if( charObj && charObj.hasArcaneBackground(needArcaneBackground) ) {
                            foundArcaneBackground = needArcaneBackground;
                        }
                    }

                    if( foundArcaneBackground ) {
                        rv.foundMessage = "An Arcane Background of '" + foundArcaneBackground + "'";
                        rv.found = true;
                    }
                }
            } else {
                rv.parseMessage = "Arcane Background of '" + split[1] + "'";

                // not all arcane backgrounds are arcane_backgrounds now.
                if( split[1].toLowerCase().startsWith("arcane background")) {
                    let abName = "";
                    if( split[1].indexOf("(")  > 0 ) {
                        let split2 = split[1].split("(");
                        abName = split2[1].replace(")", "");
                        rv.parseMessage = "An Arcane Background of '" + abName + "'";
                    } else {
                        rv.parseMessage = "An Arcane Background";
                    }
                    if( charObj && charObj.hasArcaneBackground(abName)) {
                        rv.found = true;
                    }
                } else {
                    if( charObj ) {

                        if( charObj.hasArcaneBackground(split[1]) ) {
                            rv.foundMessage = "An Arcane Background of '" + split[1] + "'";
                            rv.found = true;
                        }
                    }
                }

            }

            break;
        }

            /* # DOC TODO
        tag: "edge"
        name: "Edge",
        example: ["edge:Alertness","edge:Trademark Weapon"],
        description: "Matches if character has the specified edge",

            */
            case "edge": {

                if( split[1].indexOf("|") > -1 ) {

                    let split2 = split[1].split("|");
                    let foundEdge: string = "";
                    rv.parseMessage = split2.join(" or ") + " edge";
                    if( charObj ) {
                        for( let needEdge of split2 ) {
                            if( needEdge.toLowerCase().startsWith("arcane background")) {
                                let abName = "";
                                if( needEdge.indexOf("(")  > 0 ) {
                                    let split2 = needEdge.split("(");
                                    abName = split2[1].replace(")", "");
                                    rv.parseMessage = "An Arcane Background of '" + abName + "'";
                                } else {
                                    rv.parseMessage = "An Arcane Background";
                                }
                                if( charObj && charObj.hasArcaneBackground(abName)) {
                                    rv.found = true;
                                }
                            } else {

                                if( charObj.hasEdge(needEdge, undefined, undefined, debug) > 0 ) {
                                    foundEdge = needEdge;
                                }
                            }
                        }

                        if( debug ) console.log("ParseReq", split2, foundEdge );
                        if( foundEdge ) {
                            rv.foundMessage = foundEdge + " edge";
                            rv.found = true;
                        }
                    }
                } else {
                    rv.parseMessage = split[1] + " edge";

                    // not all arcane backgrounds are edges now.
                    if( split[1].toLowerCase().startsWith("arcane background")) {
                        let abName = "";
                        if( split[1].indexOf("(")  > 0 ) {
                            let split2 = split[1].split("(");
                            abName = split2[1].replace(")", "");
                            rv.parseMessage = "An Arcane Background of '" + abName + "'";
                        } else {
                            rv.parseMessage = "An Arcane Background";
                        }
                        if( charObj && charObj.hasArcaneBackground(abName)) {
                            rv.found = true;
                        }
                    } else {
                        if( charObj ) {

                            if( charObj.hasEdge(split[1], undefined, undefined, debug) > 0 ) {
                                rv.foundMessage = split[1] + " edge";
                                rv.found = true;
                            }
                        }
                    }

                }

                break;
            }
            /* # DOC TODO

           */
            case "cyber":
            case "cyberware": {
                if( split[1].indexOf("|") > -1 ) {

                    let split2 = split[1].split("|");
                    let foundCyber: string = "";
                    rv.parseMessage = split2.join(" or ") + " cyberware";
                    if( charObj ) {
                        for( let needCyber of split2 ) {
                            if( charObj.hasCyberware(needCyber) ) {
                                foundCyber = needCyber;
                            }
                        }

                        if( foundCyber ) {
                            rv.foundMessage = foundCyber + " cyberware";
                            rv.found = true;
                        }
                    }

                } else {
                    rv.parseMessage = split[1] + " cyberware";

                    if( charObj ) {
                        if( charObj.hasCyberware(split[1]) ) {
                            rv.foundMessage = split[1] + " cyberware";
                            rv.found = true;
                        }
                    }

                }

                break;
            }
            /* # DOC
        tag: "hindrance"
        name: "Hindrance",
        example: ["hindrance:Slow","hindrance:bloodthirsty"],
        description: "Matches if character has the specified hindrance",
          */
            case "hind":
            case "hindrance": {
                if( split[1].indexOf("|") > -1 ) {

                    let split2 = split[1].split("|");

                    rv.parseMessage = split2.join(" or ")  + " hindrance";

                    if( charObj ) {
                        let foundHindrance = "";

                        for( let needHindrance of split2 ) {
                            if( charObj.hasHindrance(needHindrance) ) {
                                foundHindrance = needHindrance;
                            }
                        }

                        if( foundHindrance ) {
                            rv.foundMessage = foundHindrance  + " hindrance";
                            rv.found = true;
                        }
                    }

                } else {
                    rv.parseMessage = split[1] + " hindrance";

                    if( charObj ) {
                        if( charObj.hasHindrance( split[1]) ) {
                            rv.foundMessage = split[1] + " hindrance";
                            rv.found = true;
                        }
                    }

                }

                break;
            }
            /* # DOC

        tag: faction"
        name: "Faction",
        example: ["faction:MIB","faction:Wizard's Guild"],
        description: "Matches if Factions are enabled and character has named faction",

           */
            case "faction": {

                if( split[1].indexOf("|") > -1 ) {

                    let split2 = split[1].split("|");

                    rv.parseMessage = split2.join(" or ") + " faction";

                    if( charObj ) {
                        let foundFaction = "";

                        for( let needFaction of split2 ) {
                            if( charObj.hasFaction(needFaction) ) {
                                foundFaction = needFaction;
                            }
                        }

                        if( foundFaction ) {
                            rv.foundMessage = foundFaction + " faction";
                            rv.found = true;
                        }
                    }

                } else {

                    rv.parseMessage = split[1] + " faction";
                    if( charObj ) {
                        if( charObj.hasFaction( split[1]) ) {
                            rv.foundMessage = split[1] + " faction";
                            rv.found = true;
                        }
                    }

                }

                break;
            }
            /* # DOC

        tag: "power"
        name: "Power",
        example: ["power:bolt","power:speak language|zombie"],
        description: "Matches if character selected or added named power on any of its Arcane Backgrounds",

           */
            case "power": {
                rv.parseMessage = "Needs to know power '" + replaceAll(split[1], "|", "' or '") + "'";

                if( split[1].indexOf("|") > -1 ) {

                    let split2 = split[1].split("|");

                    rv.foundMessage = split2.join(" or ") + " power";

                    if( charObj ) {
                        let foundFaction = "";

                        for( let needPower of split2 ) {
                            if( charObj.knowsPower(needPower) ) {
                                foundFaction = needPower;
                            }
                        }

                        if( foundFaction ) {
                            rv.foundMessage = "Power " + foundFaction;
                            rv.found = true;
                        }
                    }

                } else {
                    // rv.parseMessage = "Power " + split[1];
                    rv.foundMessage = "Power " + split[1];
                    if( charObj ) {
                        if( charObj.knowsPower( split[1]) ) {

                            rv.found = true;
                        }
                    }

                }

                break;
            }
            /* # DOC TODO

           */
            case "max_level": {
                rv.foundMessage = "Max Level for Trait " + split[1];
                rv.parseMessage = "Max Level for Trait " + split[1];
                rv.found = false;
                if( charObj ) {
                    switch( split[1].toLowerCase().trim() ) {
                        case "agility":{
                            if( charObj.getAttributeCurrent("agility") >= charObj._attributesMax.agility  ) {
                                rv.found = true;
                            }
                            break;
                        }
                        case "smarts": {
                            if( charObj.getAttributeCurrent("smarts") >= charObj._attributesMax.smarts  ) {
                                rv.found = true;
                            }
                            break;
                        }
                        case "spirit": {
                            if( charObj.getAttributeCurrent("spirit")>= charObj._attributesMax.spirit  ) {
                                rv.found = true;
                            }
                            break;
                        }
                        case "strength": {
                            if( charObj.getAttributeCurrent("strength") >= charObj._attributesMax.strength  ) {
                                rv.found = true;
                            }
                            break;
                        }
                        case "vigor": {
                            if( charObj.getAttributeCurrent("vigor")>= charObj._attributesMax.vigor  ) {
                                rv.found = true;
                            }
                            break;
                        }
                        default: {
                            // try to get skill and test
                            let skill = charObj.getSkill(split[1].toLowerCase().trim() );
                            if( !skill ) {
                                // rv.foundMessage = "Max Level for Trait '" + split[1] + "' - COULD NOT FIND TRAIT";
                            } else {
                                if( skill.currentValue() >= skill.maxValue ) {
                                    rv.found = true;
                                }
                            }

                            break;
                        }
                    }
                }

                break;
            }
            /* # DOC
        tag: "skill"
        name: "Skill",
        example: ["skill:fighting d6","skill:research d8","skill:occult|research d8","skill:fighting d6|shooting d8"],
        description: "Matches if specified skill is at specified die level or higher",

           */
            case "skill": {

                // This update now allows for different die values in the or expression
                let skillRequirements: ISkillReq[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    for( let subSplit of split[1].split("|") ) {
                        skillRequirements.push( getSkillAndReq(subSplit) )
                    }
                } else {
                    // no strange splits... easy peasy
                    skillRequirements.push( getSkillAndReq(split[1]) )
                }

                let allDieValue = ""
                // get potential die value to be filled in
                for( let value of skillRequirements ) {
                    if( value && value.req != "" )
                        allDieValue = value.req
                }

                // fill in blank values
                let lCount = 0;
                rv.parseMessage = "";
                for( let value of skillRequirements ) {
                    if( value ) {
                        if( value.req == "" )
                            value.req = allDieValue
                        if( lCount > 0 )
                            rv.parseMessage += " or ";
                        lCount++;

                        rv.parseMessage += value.skill + " skill of " + value.req;
                    }
                }

                if( charObj ) {
                    for( let value of skillRequirements ) {
                        let foundSkillValue = charObj.getSkillValue( value.skill );

                        if( foundSkillValue >= getDieIndexFromLabel( value.req ) ) {
                            rv.foundMessage = "" + capitalCase(value.skill) + " skill of " + value.req;
                            rv.found = true;
                        }

                        for( let alias of charObj._skillRequirementAliases ) {
                            let from = alias[0].toLowerCase().trim();
                            let to = alias[1].toLowerCase().trim();
                            if( from == value.skill.toLowerCase().trim() ) {
                                let foundSkillValue = charObj.getSkillValue( to );

                                if( foundSkillValue >= getDieIndexFromLabel( value.req ) ) {
                                    rv.foundMessage = "" + capitalCase(to) + " skill of " + value.req;
                                    rv.found = true;
                                }
                            }
                        }
                    }
                }

                break;
            }

            /* # DOC
        tag: "arcane_skill"
        name: "Arcane Skill",
        example: ["arcane_skill:d8"],
        description: "Matches if any arcane skill is at specified die level or higher",

           */
        case "arcane_skill": {

            rv.parseMessage = "";

            if( split.length > 0 ) {

                rv.foundMessage = "An Arcane skill of " + split[1];

                if( charObj ) {
                    let foundSkills = charObj.getArcaneSkills();

                    for( let foundSkill of foundSkills ) {
                        if( foundSkill ) {
                            let skillValue = foundSkill.currentValueHR();
                            rv.parseMessage = "" + foundSkill.name + " (or other Arcane Skill) skill of " + split[1] + " current value: " + skillValue;
                            if( foundSkill.currentValue() >= getDieIndexFromLabel( split[1] ) ) {
                                rv.found = true;
                            }
                        }
                    }

                }
            }

            break;
        }

            /* # DOC

        tag: "race":
        name: "Race",
        example: ["race:elf","race:Half orc"],
        description: "Matches if character race name is the same as specified",
           */
            case "race": {
                let races: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    races = split[1].split("|")
                } else {
                    races = [ split[1] ]
                }

                rv.parseMessage = "Character to be " + replaceAll(split[1], "|", " or ")
                if( charObj ) {
                    rv.foundMessage = "Character is " + charObj.race.name
                } else {
                    rv.foundMessage = rv.parseMessage ;
                }
                if( charObj ) {
                    for( let race of races ) {
                        if( charObj.race && charObj.race.isNamed( race ) ) {

                            rv.found = true;
                        }

                    }

                }
                break;
            }
            /* # DOC
        tag: "ancestry":
        name: "Ancestry",
        example: ["ancestry:Vampire","ancestry:Werewolf"],
        description: "Matches if character race OR monster framework name is the same as specified",
           */
            case "ancestry": {
                let ancestries: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    ancestries = split[1].split("|")
                } else {
                    ancestries = [ split[1] ]
                }

                rv.parseMessage = "Character to be " + replaceAll(split[1], "|", " or ")
                if( charObj ) {
                    // Check monster framework first
                    if( charObj.monsterFramework && charObj.monsterFramework.name ) {
                        rv.foundMessage = "Character is " + charObj.monsterFramework.name
                    } else {
                        rv.foundMessage = "Character is " + charObj.race.name
                    }
                } else {
                    rv.foundMessage = rv.parseMessage ;
                }
                if( charObj ) {
                    for( let ancestry of ancestries ) {
                        // Check race first
                        if( charObj.race && charObj.race.isNamed( ancestry ) ) {
                            rv.found = true;
                        }
                        // Also check monster framework
                        if( charObj.monsterFramework && charObj.monsterFramework.name.toLowerCase().trim() === ancestry.toLowerCase().trim() ) {
                            rv.found = true;
                        }
                    }
                }
                break;
            }
            /* # DOC TODO
        tag: "framework":
        name: "Framework",
        example: ["framework:Juicer","framework:Glitter Boy"],
        description: "Matches if character framework name is the same as specified",
           */
            case "framework": {
                let frameworks: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    frameworks = split[1].split("|")
                } else {
                    frameworks = [ split[1] ]
                }

                rv.parseMessage = "Character's framework to be " + replaceAll(split[1], "|", " or ")
                if( charObj ) {
                    rv.foundMessage = "Character's framework is " + charObj.race.name
                } else {
                    rv.foundMessage = rv.parseMessage ;
                }
                if( charObj ) {
                    for( let framework of frameworks ) {
                        if( charObj.countsAsFramework( framework ) ) {

                            rv.found = true;
                        }

                    }

                }
                break;
            }
            /* # DOC TODO

           */
            case "heroic_except_race":
            case "heroic_except_races": {
                let races: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    races = split[1].split("|")
                } else {
                    races = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + races.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let race of races ) {
                        if( charObj.race && charObj.race.isNamed( race ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 3) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "veteran_except_race":
            case "veteran_except_races": {
                let races: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    races = split[1].split("|")
                } else {
                    races = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + races.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let race of races ) {
                        if( charObj.race && charObj.race.isNamed( race ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 2) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "seasoned_except_race":
            case "seasoned_except_races": {
                let races: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    races = split[1].split("|")
                } else {
                    races = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + races.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let race of races ) {
                        if( charObj.race && charObj.race.isNamed( race ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 1) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "heroic_except_framework":
            case "heroic_except_frameworks": {
                let frameworks: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    frameworks = split[1].split("|")
                } else {
                    frameworks = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + frameworks.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let framework of frameworks ) {
                        if( charObj.countsAsFramework( framework ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 3) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "veteran_except_framework":
            case "veteran_except_frameworks": {
                let frameworks: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    frameworks = split[1].split("|")
                } else {
                    frameworks = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + frameworks.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let framework of frameworks ) {
                        if( charObj.countsAsFramework( framework ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 2) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "seasoned_except_framework":
            case "seasoned_except_frameworks": {
                let frameworks: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    frameworks = split[1].split("|")
                } else {
                    frameworks = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + frameworks.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let framework of frameworks ) {
                        if( charObj.countsAsFramework( framework ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 1) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "heroic_except_edge":
            case "heroic_except_edges": {
                let edges: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    edges = split[1].split("|")
                } else {
                    edges = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + edges.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let edge of edges ) {
                        if( charObj.hasEdge( edge ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 3) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "veteran_except_edge":
            case "veteran_except_edges": {
                let edges: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    edges = split[1].split("|")
                } else {
                    edges = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + edges.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let edge of edges ) {
                        if( charObj.hasEdge( edge ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 2) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }
            /* # DOC TODO

           */
            case "seasoned_except_edge":
            case "seasoned_except_edges": {
                let edges: string[] = [];
                if( split[1].indexOf("|") > -1 ) {
                    edges = split[1].split("|")
                } else {
                    edges = [ split[1] ]
                }
                rv.parseMessage = "Veteran Character, except for " + edges.join(" or ");
                rv.foundMessage = rv.parseMessage.toString();

                if( charObj ) {
                    for( let edge of edges ) {
                        if( charObj.hasEdge( edge ) ) {

                            rv.found = true;
                        }

                    }

                    if( effectiveRank >= 1) {
                        rv.found = true;
                    }
                }

                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }

                break;
            }

            default: {
                rv.parseMessage = "Cannot parse";
                rv.valid = false;
                break;
            }
        }
    } else {
        // No Colon
        if( reqLine.indexOf(" ") > -1 ) {
            // has a space...

            // space
            let split = reqLine.trim().split(" ");
            switch( split[0].trim() ) {
                /* # DOC TODO

                */
                case "wild": {
                    // card :P
                    rv.parseMessage = "Wild Card required";
                    rv.foundMessage = "All PCs are a wild card.";
                    rv.found = true;
                    break;
                }

                /* # DOC TODO

                */
                case "rippers_status":
                case "rippersstatus":
                case "ripper_status":
                case "ripperstatus": {
                    rv.parseMessage = "Rippers Status of " + split[1];
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        if( charObj.getDerivedBoost( "rippers_status" ) >= +split[1]) {

                            rv.found = true;
                        }
                    }
                    break;
                }

                /* # DOC TODO

                */
                case "ripper_reason":
                case "ripperreason":
                case "rippers_reason":
                case "rippersreason": {
                    rv.parseMessage = "Rippers Reason of " + split[1];
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        if( charObj.getDerivedBoost( "rippers_reason" ) >= +split[1]) {

                            rv.found = true;
                        }
                    }
                    break;
                }

                /* # DOC TODO

                */
                case "arcane": {
                    let needsABType: string[] = [];
                    if(split.length > 2) {

                        let needsABRaw = "";
                        for( let lCounter = 2; lCounter< split.length; lCounter++ ) {
                            needsABRaw += split[lCounter].replace("(", "").replace(")", "").trim() + " ";
                        }

                        needsABRaw = needsABRaw.trim();
                        needsABRaw = capitalCase( needsABRaw );
                        if( needsABRaw.indexOf("|") > -1 ) {
                            needsABType = needsABRaw.split("|");
                        } else {
                            needsABType.push(needsABRaw);
                        }
                    }

                    if( needsABType.length > 0 ) {
                        let foundAB: string = "";
                        rv.found = false;
                        for( let abNeed of needsABType ) {
                            rv.parseMessage = "'Arcane Background' of type '" + needsABType + "'";

                            if( charObj ) {

                                if( charObj.hasArcaneBackground( abNeed ) ) {
                                    foundAB = abNeed;
                                    rv.found = true;
                                }
                            }
                        }

                        if( foundAB && charObj ) {
                            rv.found = true;
                            if( charObj.isSuper && charObj.setting.spcRisingStars ) {
                                rv.foundMessage = "Found Super Powers Rising Stars";
                                rv.found = true;
                            }
                        }
                    } else {
                        rv.parseMessage = "Arcane Background";
                        if( charObj ) {
                            if( charObj.hasArcaneBackground() ) {
                                rv.found = true;
                            }

                            if( charObj.isSuper && charObj.setting.spcRisingStars ) {
                                rv.foundMessage = "Found Super Powers Rising Stars";
                                rv.found = true;
                            }
                        }
                    }
                    rv.foundMessage = rv.parseMessage.toString();

                    break;
                }
                // Attributes

                /* # DOC TODO
        tag: "agility"
        name: "Agility",
        example: ["agility d4", "Agility d6"],
        description: "Matches if Agility is at specified die level or higher"

                */
                case "agility": {
                    rv.parseMessage = "Agility of " + split[1];
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        if( charObj.getAttributeCurrent("agility") >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }

                    break;
                }

                /* # DOC

        tag: "smarts"
        name: "Smarts",
        example: ["smarts d4", "smarts d6"],
        description: "Matches if smarts is at specified die level or higher"
                */
                case "smart": // I've seen a few typos...
                case "smarts": {
                    rv.parseMessage = "Smarts of " + split[1];
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        if( charObj.getAttributeCurrent("smarts") >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }

                    break;
                }

                /* # DOC

        tag: "spirit"
        name: "Spirit",
        example: ["spirit d4", "Spirit d6"],
        description: "Matches if spirit is at specified die level or higher"

                */
                case "spirit": {
                    rv.parseMessage = "Spirit of " + split[1];
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        if( charObj.getAttributeCurrent("spirit") >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }
                    break;
                }

                /* # DOC

        tag: "strength"
        name: "Strength",
        example: ["Strength d4", "strength d6"],
        description: "Matches if strength is at specified die level or higher"

                */
                case "strength": {
                    rv.parseMessage = "Strength of " + split[1];
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        if( charObj.getAttributeCurrent("strength") >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }
                    break;
                }

                /* # DOC
        tag: "vigor"
        name: "Vigor",
        example: ["vigor d4", "Vigor d6"],
        description: "Matches if vigor is at specified die level or higher"
                */
                case "vigor": {
                    rv.parseMessage = "Vigor of " + split[1];
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        if( charObj.getAttributeCurrent("vigor") >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }

                    break;
                }

                // Common Skills
                /* # DOC TODO

                */
                case "shooting": {
                    rv.parseMessage = "Shooting Skill " + split[1]
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        let shootingSkill = charObj.getSkill("shooting");
                        if( shootingSkill && shootingSkill.currentValue() >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }

                    break;
                }

                /* # DOC TODO

                */
                case "fighting": {
                    rv.parseMessage = "Fighting Skill " + split[1]
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        let fightingSkill = charObj.getSkill("fighting");
                        if( fightingSkill && fightingSkill.currentValue() >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }

                    break;
                }

                /* # DOC TODO

                */
                case "research": {
                    rv.parseMessage = "Rersearch Skill " + split[1]
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        let researchSkill = charObj.getSkill("research");
                        if( researchSkill && researchSkill.currentValue() >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }

                    break;
                }

                /* # DOC TODO

                */
                case "focus": {
                    rv.parseMessage = "Focus Skill " + split[1]
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        let focusSkill = charObj.getSkill("focus");
                        if( focusSkill && focusSkill.currentValue() >= getDieIndexFromLabel( split[1])) {

                            rv.found = true;
                        }
                    }

                    break;
                }
                default: {
                    rv.parseMessage = "Cannot parse";
                    rv.valid = false;
                    break;
                }
            }

        } else {
            // no space
            switch( reqLine ) {
                /* # DOC
        tag: "n/a"
        name: "No Requirements",
        example: ["n/a", "N/A", "(n/a)", "(N/A)"],
        description: "Indicates that there are no requirements for this edge. Always passes validation."

                */
                case "n/a":
                case "(n/a)": {
                    rv.parseMessage = "No requirements";
                    rv.foundMessage = "No requirements";
                    rv.found = true;
                    break;
                }

                /* # DOC TODO

                */
                case "wild card":
                case "wildcard": {
                    rv.parseMessage = "All players are a wild card";
                    rv.foundMessage = rv.parseMessage.toString();
                    rv.found = true; // every character is at least a novice!
                    break;
                }

                /* # DOC TODO

                */
                case "freshman": {
                    rv.parseMessage = "Freshman Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    rv.found = true; // every character is at least a novice!
                    break;
                }

                /* # DOC
        tag: "novice"
        name: "Novice",
        example: ["novice", "Novice"],
        description: "Matches if the character is novice rank or higher"

                */
                case "novice": {
                    rv.parseMessage = "Novice Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    rv.found = true; // every character is at least a novice!
                    break;
                }

                /* # DOC
                    tag: "not-novice"
                    name: "Not Novice",
                    aliases: ["notnovice"],
                    example: ["not-novice", "notnovice", "deny-novice", "denynovice"],
                    description: "Matches if the character is not novice rank or higher"

                */
               case "not-novice":
                case "deny-novice":
                case "denynovice":
                case "notnovice": {
                    rv.parseMessage = "Novice Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank != 0
                    ) {
                        rv.found = true;

                    }
                    break;
                }
                /* # DOC TODO

                */
                case "sophomore": {
                    rv.parseMessage = "Sophomore Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank >= 1
                    ) {

                        rv.found = true;

                    }
                    if( ignoreRankRequirements ) {
                        rv.foundMessage = "Ignoring Rank Requirement";
                        rv.found = true;
                    }
                    break;
                }

                /* # DOC
        tag: "seasoned"
        name: "Seasoned",
        example: ["seasoned", "Seasoned"],
        description: "Matches if the character is seasoned rank or higher"

                */
                case "seasoned": {
                    rv.parseMessage = "Seasoned Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank >= 1
                    ) {
                        rv.found = true;

                    }
                    if( ignoreRankRequirements ) {
                        rv.foundMessage = "Ignoring Rank Requirement";
                        rv.found = true;
                    }
                    break;
                }

                /* # DOC
                    tag: "not-seasoned"
                    name: "Not Seasoned",
                    aliases: ["notseasoned"],
                    example: ["not-seasoned", "notseasoned", "deny-seasoned", "denyseasoned"],
                    description: "Matches if the character is not seasoned rank or higher"

                */
                case "not-seasoned":
                case "deny-seasoned":
                case "denyseasoned":
                case "notseasoned": {
                    rv.parseMessage = "Seasoned Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank != 1
                    ) {
                        rv.found = true;

                    }
                    break;
                }

                /* # DOC TODO

                */
                case "junior": {
                    rv.parseMessage = "Junior Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank >= 2

                    ) {

                        rv.found = true;

                    }
                    if( ignoreRankRequirements ) {
                        rv.foundMessage = "Ignoring Rank Requirement";
                        rv.found = true;
                    }
                    break;
                }

                /* # DOC
        tag: "veteran"
        name: "Veteran",
        example: ["veteran", "Veteran"],
        description: "Matches if the character is veteran rank or higher"

                */
               case "veteran": {
                rv.parseMessage = "Veteran Character";
                rv.foundMessage = rv.parseMessage.toString();
                if(
                    charObj
                        &&
                    effectiveRank >= 2
                ) {
                    rv.found = true;

                }
                if( ignoreRankRequirements ) {
                    rv.foundMessage = "Ignoring Rank Requirement";
                    rv.found = true;
                }
                break;
            }

                /* # DOC
                    tag: "not-veteran"
                    name: "Not Veteran",
                    aliases: ["notveteran", "denyveteran", "deny-veteran"],
                    example: ["not-veteran", "noteasoned"],
                    description: "Matches if the character is not veteran rank or higher"

                */
                case "not-veteran":
                case "deny-veteran":
                case "denyveteran":
                case "notveteran": {
                    rv.parseMessage = "Veteran Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank != 2
                    ) {
                        rv.found = true;

                    }
                    break;
                }
                /* # DOC TODO

                */
                case "veteran_except_shifters":
                case "veteran_except_shifter": {
                    rv.parseMessage = "Veteran Character, except for Shifters";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank >= 2

                    ) {

                        rv.found = true;

                    } else if (
                        charObj
                            &&
                        charObj.currentFramework
                            &&
                        charObj.countsAsFramework( "shifter" )

                    ) {
                        rv.found = true;
                    }
                    if( ignoreRankRequirements ) {
                        rv.foundMessage = "Ignoring Rank Requirement";
                        rv.found = true;
                    }
                    break;
                }

                /* # DOC TODO

                */
                case "senior": {
                    rv.parseMessage = "Senior Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank >= 3
                    ) {

                            rv.found = true;

                    }
                    if( ignoreRankRequirements ) {
                        rv.foundMessage = "Ignoring Rank Requirement";
                        rv.found = true;
                    }
                    break;
                }

                /* # DOC
        tag: "heroic"
        name: "Heroic",
        example: ["heroic", "Heroic"],
        description: "Matches if the character is heroic rank or higher"

                */
                case "heroic": {
                    rv.parseMessage = "Heroic Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank >= 3
                    ) {

                            rv.found = true;

                    }
                    if( ignoreRankRequirements ) {
                        rv.foundMessage = "Ignoring Rank Requirement";
                        rv.found = true;
                    }
                    break;
                }
                /* # DOC
                    tag: "not-heroic"
                    name: "Not Heroic",
                    aliases: ["notheroic"],
                    example: ["not-heroic", "notheroic", "deny-heroic", "denyheroic"],
                    description: "Matches if the character is not heroic rank or higher"

                */
               case "not-heroic":
                case "deny-heroic":
                case "denyheroic":
                case "notheroic": {
                    rv.parseMessage = "Heroic Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank != 3
                    ) {
                        rv.found = true;

                    }
                    break;
                }

                /* # DOC
        tag: "legendary": {
        name: "Legendary",
        example: ["legendary", "Legendary"],
        description: "Matches if the character is legendary rank or higher"

                */
                case "legendary": {
                    rv.parseMessage = "Legendary Character";
                    rv.foundMessage = rv.parseMessage.toString();

                    if(
                        charObj
                            &&
                        effectiveRank >= 4
                    ) {
                        rv.found = true;
                    }
                    if( ignoreRankRequirements ) {
                        rv.foundMessage = "Ignoring Rank Requirement";
                        rv.found = true;
                    }

                    break;
                }
                /* # DOC
                    tag: "not-legendary"
                    name: "Not Legendary",
                    aliases: ["notlegendary"],
                    example: ["not-legendary", "notlegendary", "deny-legendary", "denylegendary"],
                    description: "Matches if the character is not legendary rank or higher"

                */
               case "not-legendary":
                case "deny-legendary":
                case "denylegendary":
                case "notlegendary": {
                    rv.parseMessage = "Legendary Character";
                    rv.foundMessage = rv.parseMessage.toString();
                    if(
                        charObj
                            &&
                        effectiveRank >= 4
                    ) {
                        rv.found = true;

                    }
                    break;
                }
                /* # DOC TODO

                */
                case "ppe_arcane_background": {
                    rv.parseMessage = "Character is a PPE Magician";
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        for( let ab of charObj._selectedArcaneBackgrounds ) {
                            if( ab ) {

                                let powerPointName = ab.powerPointsName.toLowerCase();
                                powerPointName = replaceAll(powerPointName, ".", "");

                                if( powerPointName === "ppe" ) {
                                    rv.found = true;
                                }

                            }
                        }

                    }
                    break;
                }

                /* # DOC TODO

                */
                case "isp_arcane_background": {
                    rv.parseMessage = "Character is a ISP Psionic";
                    rv.foundMessage = rv.parseMessage.toString()
                    if( charObj ) {
                        for( let ab of charObj._selectedArcaneBackgrounds ) {
                            if( ab ) {

                                let powerPointName = ab.powerPointsName.toLowerCase();
                                powerPointName = replaceAll(powerPointName, ".", "");

                                if( powerPointName === "isp" ) {
                                    rv.found = true;
                                }

                            }
                        }

                    }
                    break;
                }

                /* # DOC
        tag: "super_hero"
        name: "Super",
        example: ["super", "superhero"],
        description: "Matches if the character has the Super Hero setting rule enabled."

                */
                case "super":
                case "superhero":
                case "super_hero":
                case "is_super": {
                    rv.parseMessage = "Super Hero";
                    rv.foundMessage = rv.parseMessage.toString();

                    if(
                        charObj
                            &&
                        charObj.setting.settingIsEnabled("spcpowers")
                    ) {

                        rv.found = true;
                    }

                    break;
                }
                default: {
                    rv.parseMessage = "Cannot parse";
                    rv.valid = false;
                    break;
                }
            }

        }
    }

    rv.parseMessage = replaceAll( rv.parseMessage, "  ", " ");
    rv.foundMessage = replaceAll( rv.foundMessage, "  ", " ");
    return rv;
}

interface ISkillReq {
    skill: string;
    req: string;
}
function getSkillAndReq( theLine: string ): ISkillReq {
    let skillName = "";
    let skillValue = "";

    for( let chunk of theLine.split(" ") ) {
        chunk = chunk.trim().toLowerCase();
        if(
            chunk == "d4"
            || chunk == "d6"
            || chunk == "d8"
            || chunk == "d10"
            || chunk == "d12"
        ) {
            skillValue = chunk
        } else {
            skillName += " " + chunk;
        }
    }

    return {
        skill: capitalCase(skillName.trim()),
        req: skillValue.trim(),
    }
}