import { IExportStatsOutput } from "../interfaces/IExportStatsOutput";
import { IVTTEnhancementSuite, IVTTEnhancementSuiteToken } from "../interfaces/IVTTEnhancementSuite";
import { makeRoll20BaseAttribs, makeRoll20BaseAttrib, convertToRoll20DamageString } from "./makeRoll20BaseAttribs";
import { getDieValueFromIndex, getDieLabelFromIndex, getDieValueFromLabel } from "./Dice";
import { replaceAll } from "./CommonFunctions";

export function convertExportToVTTRollToTabbed( importObject: IExportStatsOutput): IVTTEnhancementSuite {
    let bioBackground = "";

    if( importObject.description.trim() ) {
        bioBackground += "<p><b>Description</b></p>";
        bioBackground += "<p>" + importObject.description.trim().split("\n").join("</p><p>") + "</p>";
        bioBackground += "<p></p>";
    }

    if( importObject.background.trim() ) {
        bioBackground += "<p><b>Background</b></p>";
        bioBackground += "<p>" + importObject.background.trim().split("\n").join("</p><p>") + "</p>";
        bioBackground += "<p></p>";
    }

    bioBackground = encodeURI( bioBackground );

    let defaultToken = "";
    if( importObject.imageToken) {
        let defaultTokenObj: IVTTEnhancementSuiteToken = {
            imgsrc:  importObject.imageToken,
            height: 70,
            width: 70,
        };
        defaultToken = JSON.stringify( defaultTokenObj );
    }
    let exportItem: IVTTEnhancementSuite = {
        schema_version: 2,
        oldId: importObject.uuid,
        name: importObject.name,
        defaulttoken: defaultToken,
        avatar: importObject.image,
        bio: bioBackground,
        gmnotes: "Imported from Savaged.us",
        tags: "savaged.us,",
        controlledby: "",
        inplayerjournals: "all",
        attribs: [],
        abilities: [],
    }

    let idPre = "-svgd-us-" + importObject.uuid
    exportItem.attribs = makeRoll20BaseAttribs( idPre );

    // Wildcard (not an NPC)
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "is_npc", importObject.wildcard ? 0 : 1 ) );

    // Race
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "race", importObject.race ) );

    // Attributes
    for( let attribute of importObject.attributes) {
        // d12 + 4 broke Roll20 and defaulted to d4
        if( attribute.value.toString().indexOf("+") > -1 ) {
            let attributeSplit = attribute.value.toString().split("+");
            attribute.value = attributeSplit[0];
            attribute.mod = +attributeSplit[1];
        }
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, attribute.name.toLowerCase(), getDieValueFromLabel( attribute.value )  ));
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, attribute.name.toLowerCase() + "_display", attribute.value  ) );
        if( attribute.mod != 0 ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre,  attribute.name.toLowerCase() + "mod", attribute.mod ));
            if( attribute.mod > 0 ) {
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, attribute.name.toLowerCase() + "_rank", "1" + attribute.value + "!+" + attribute.mod.toString() + "[trait]") );
            } else {
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, attribute.name.toLowerCase() + "_rank", "1" + attribute.value + "!-" + attribute.mod.toString() + "[trait]") );
            }
        } else {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, attribute.name.toLowerCase() + "_rank", "1" + attribute.value + "![trait]") );
        }
    }

    // Sanity
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "sanity", importObject.sanity ));
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "sanityCur", importObject.sanity ));

    // Toughness
    let toughness = Math.floor(getDieValueFromIndex(importObject.toughnessBase));
    // let toughnessBonus = importObject.getDerivedBoost("toughness");
    // exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "toughness", toughness) );
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "tufnessMod", importObject.toughnessMod) );
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "toughnessArmor", importObject.armorValue ) );
    // exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "toughnessMod", toughnessBonus) );
    // exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ntoughness", importObject.getToughnessValue(true)) );
    // exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ntoughnesscur", importObject.getToughnessValue(true)) );

    // Parry
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "parryMod", importObject.parryMod) );

    // Pace
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "paceMod", importObject.paceMod) );
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "paceCur", importObject.paceTotal ) );
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "runningDie", importObject.runningDie ) );

    // Skills
    let charSkills: string[] = [];
    let extraSkills: string[] = [];
    let tabbedSkillList = ["academics", "athletics", "battle", "boating", "climbing", "common knowledge", "driving", "electronics", "faith", "focus", "fighting", "gambling", "guts", "hacking", "healing", "intimidation", "investigation", "lockpicking", "notice", "occult", "performance", "persuasion", "piloting", "psionics", "repair", "research", "riding", "ritual", "science", "shooting", "spellcasting", "stealth", "streetwise", "survival", "swimming", "taunt", "thievery", "throwing", "tracking", "weird science"];
    let extraSkillsCount = 0;
    for( let skill of importObject.skills ) {

            if( tabbedSkillList.indexOf(skill.name.toLowerCase() ) > -1 ) {
                let skillName = replaceAll(skill.name.toLowerCase().trim(), " ", "");

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre + "-" + skillName, skillName, skill.dieValue) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre + "-" + skillName, skillName + "_rank", "1d" + skill.dieValue + "!")  );
                // exportItem.attribs.push( makeRoll20BaseAttrib( idPre + "-" + skillName, skillName + "_rank", convertToRoll20DamageString( skill.value) ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre + "-" + skillName, skillName + "_display", skill.value ) );
                if( skill.mod != 0 ) {
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre + "-" + skillName, skillName + "mod", skill.mod ) );
                }

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre + "-" + skillName, "Static" + replaceAll(skill.name, " ", ""), "on" ) );
                charSkills.push( "[@{" + skillName + "name} @{" + skillName + "_display}](~t" + replaceAll(skill.name, " ", "") + "Roll)" )

            } else {
                // add repeating skill
                if( extraSkillsCount == 0 ) {
                    // turn on other skills
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre , "staticKnowledgeOther", "on" ) );
                }

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_SkillName", skill.name ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_skillnamerank", skill.dieValue) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_skillnamerank_rank", "1d" + skill.dieValue + "!" ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_skillnamerank_display", skill.value ) );

                switch( skill.attribute ) {
                    case "agility": {
                        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_linkedotherattscore", "(AGL)" ) );
                    }
                    case "smarts": {
                        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_linkedotherattscore", "(SMA)" ) );
                    }
                    case "spirit": {
                        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_linkedotherattscore", "(SPI)" ) );
                    }
                    case "strength": {
                        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_linkedotherattscore", "(STR)" ) );
                    }
                    case "vigor": {
                        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_linkedotherattscore", "(VIG)" ) );
                    }
                }

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_skills_id-M86Sk-" + extraSkillsCount + "_showOtherRollMod", "0" ) );

                extraSkillsCount++;
            }

    }

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "charskills", charSkills.join(", ") ));

    // SWADE/Deluxe
    if( importObject.swade ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "usecharisma", 0) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "charismaCur", 0) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "usexp", 0) );
    } else {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "usecharisma", "on") );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "charismaCur", importObject.charisma ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "charismaMod", importObject.charisma ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "usexp", "on") );
    }

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "xp", importObject.advancesCount ) );
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "Rank", importObject.rankName ) );

    // Edges
    let edgeCount = 0;
    for( let edge of importObject.edges ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edge", edge.name ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edgedescription", edge.description ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_showEdgeDesc", 0 ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edgeType", edge.note ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_tookat", edge.note ) );

        edgeCount++;
    }

    // Positive Special Abilities
    for( let ability of importObject.abilities ) {
        if( ability.positive ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edge", ability.name ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edgedescription", ability.description ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_showEdgeDesc", 0 ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edgeType", ability.note ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_tookat", ability.note ) );

            edgeCount++;
        }
    }

    // Hindrances
    let hindranceCount = 0;
    for( let hindrance of importObject.hindrances ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_hindrances_id" + hindranceCount + "_hindrance", hindrance.name ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_hindrances_id" + hindranceCount + "_hindrancedescription", hindrance.description ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_hindrances_id" + hindranceCount + "_showHindraceDesc", 0 ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_hindrances_id" + hindranceCount + "_tookat", hindrance.note ) );
        if( hindrance.major ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_hindrances_id" + hindranceCount + "_hindranceType", "Major" ) );
        } else {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_hindrances_id" + hindranceCount + "_hindranceType", "Minor" ) );
        }

        hindranceCount++;
    }

    // Negative Special Abilities
    for( let ability of importObject.abilities ) {
        if( !ability.positive ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edge", ability.name ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edgedescription", ability.description ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_showEdgeDesc", 0 ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_edgeType", ability.note ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_edges_id" + edgeCount + "_tookat", ability.note ) );

            hindranceCount++;
        }
    }

    // TODO AB & Powers
    let abCount = 1;
    let powerCount = 0;

    let ab1Name = "AB 1";
    let ab2Name = "AB 2";
    let ab3Name = "AB 3";
    let ab4Name = "AB 4";
    let ab5Name = "AB 5";

    let ab1Color = "white";
    let ab2Color = "green";
    let ab3Color = "blue";
    let ab4Color = "purple";
    let ab5Color = "yellow";

    let abPowerList1 = [];
    let abPowerList2 = [];
    let abPowerList3 = [];
    let abPowerList4 = [];
    let abPowerList5 = [];
    for( let ab of importObject.abs ) {
        if( ab ) {
            let abLabel = "";

            if( abCount > 1 ) {
                abLabel = abCount.toString();
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "PowerPoints", ab.powerPointsCurrent, ab.powerPointsMax ) );
            } else {
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "powerpoints" + abLabel, ab.powerPointsCurrent, ab.powerPointsMax  ) );
            }

            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ablabel" + abLabel, ab.name ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "powercount" + abLabel, ab.powers.length ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ppelabel" + abLabel, ab.powerPointsName ) );

            if( abCount == 0 )
                ab1Name = ab.name;
            else if( abCount == 2 )
                ab2Name = ab.name;
            else if( abCount == 3 )
                ab3Name = ab.name;
            else if( abCount == 4 )
                ab4Name = ab.name;
            else if( abCount == 5 )
                ab5Name = ab.name;

            abCount++;
        }
    }
            // push powers
    abCount = 0;
    for( let ab of importObject.abs ) {
        if( ab ) {
            for( let power of ab.powers ) {
                let powerID = "repeating_spells_-M7pAB" + abCount + "-pindx" + powerCount + "-";

                if( abCount == 0 ) {
                    abPowerList1.push( powerID + "_power" );
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powercolor", ab1Color ) );
                }
                else if( abCount == 2 ) {
                    abPowerList2.push( powerID + "_power" );
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powercolor", ab2Color ) );
                }
                else if( abCount == 3 ) {
                    abPowerList3.push( powerID + "_power" );
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powercolor", ab3Color ) );
                }
                else if( abCount == 4 ) {
                    abPowerList4.push( powerID + "_power" );
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powercolor", ab4Color ) );
                }
                else if( abCount == 5 ) {
                    abPowerList5.push( powerID + "_power" );
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powercolor", ab5Color ) );
                }

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_power", power.name ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_ablabsinit", "1" ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptablabel", ab1Name ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptablabel2", ab2Name ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptablabel3", ab3Name ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptablabel4", ab4Name ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptablabel5", ab5Name ) );

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptab1color", ab1Color ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptab2color", ab2Color ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptab3color", ab3Color ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptab4color", ab4Color ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_rptab5color", ab5Color ) );

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_showspellconfig", "0" ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_ablabsinit", "1" ) );

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_pp", power.powerPoints ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powerrange", power.range ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_pp", power.powerPoints  ) );

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_shighlightdamage", "0" ) );

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powerduration", power.duration ) );

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spelldamageatt", "na" ) );
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powerdamage", power.damage ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spelldmg", convertToRoll20DamageString(power.damage) ));
                let numDie = "1";
                let dieType = "d4";
                if( power.damage.toLowerCase().indexOf("d") > -1 ) {
                    let split = power.damage.toLowerCase().split("d", 2);
                    if( split.length == 0 ) {
                        dieType = "d" + split[0]
                    } else {
                        numDie = split[0]
                        dieType = "d" + split[1]
                    }
                }
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spelldmg", convertToRoll20DamageString(power.damage) ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spelldmgdietype", convertToRoll20DamageString( dieType ) ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spelldmgdietype",  numDie  ));

                if( power.damage ) {
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spellbutton", "0" ) );
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spellroll", "@{spellskillNDamage}" ) );
                } else {
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spellbutton", "2" ) );
                    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spellroll", "@{skillOnly}" ) );
                }

                let spellBaseName = ab.arcaneSkill.toLowerCase().trim().replace(" ", "");
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spellskillNDamage",  "@{whisperspell} &{template:roll} {{source=@{power}}} {{trappings=@{trappings}}} {{PowerTemplate=y}} @{shownotes} {{trait=@{" + spellBaseName +"name}}} @{rollt" + spellBaseName +"} @{linked" + spellBaseName +"attbutton} @{showtraitmods} {{button=y}} {{DmgRoll=[Roll Damage](~repeating_spells_spelldmg) }}"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_skillOnly",  "@{whisperspell} &{template:roll} {{source=@{power}}} {{trappings=@{trappings}}} {{PowerTemplate=y}} @{shownotes} {{trait=@{" + spellBaseName +"name}}} @{rollt" + spellBaseName +"} @{linked" + spellBaseName +"attbutton} @{showtraitmods}"  ));

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_dmgshownotes",  "{{notes=@{spellnotes}}}"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_shownotes",  "{{notes=@{spellnotes}}}"  ));

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_sfaithname",  "Faith"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_sathleticsname",  "Athletics"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_sfocusname",  "Focus"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spsionicsname",  "Psionics"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_sperformancename",  "Performance"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_sritualname",  "Ritual"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_sspellcastingname",  "Spellcasting"  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_sweirdsciencename",  "Weird Science"  ));

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_powergroup",  "ab" + abCount  ));
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spellskill",  ab.name.toLowerCase().trim().replace(" ", "")  ));

                let powerNotes = "";
                if(  power.summary ) {
                    powerNotes += power.summary + "\n\n";
                }
                powerNotes += power.description;
                powerNotes = powerNotes.trim();

                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, powerID + "_spellnotes",  powerNotes ) );

                powerCount++;
            }

            abCount++;
        }
    }

    if( abPowerList1.length > 0 )
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab1powerlist", abPowerList1.join( ", ") ) );
    else
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab1powerlist", "not used" ) );
    if( abPowerList2.length > 1 )
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab2powerlist", abPowerList2.join( ", ") ) );
    else
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab2powerlist", "not used" ) );
    if( abPowerList3.length > 2 )
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab3powerlist", abPowerList3.join( ", ") ) );
    else
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab3powerlist", "not used" ) );
    if( abPowerList4.length > 3 )
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab4powerlist", abPowerList4.join( ", ") ) );
    else
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab4powerlist", "not used" ) );

    if( abPowerList5.length > 4 )
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab5powerlist", abPowerList5.join( ", ") ) );
    else
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "ab5powerlist", "not used" ) );

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "numberofabs", abCount ) );
    // Advances

    let advCount = 1;
    for( let adv of importObject.advances ) {
        let advKeyNumber = "repeating_advancement_id" + advCount + "_tookat";
        let advKeylabel = "repeating_advancement_id" + advCount + "_advancement";
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, advKeyNumber, advCount ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, advKeylabel, adv.name ) );

        advCount++;
    }
    let charGear: string[] = [];

    // Weapons
    let weaponCount = 0;
    let weaponWeight = 0;
    for( let weapon of importObject.weapons ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weapon", weapon.name ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponnotes", weapon.notes ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponroll", "@{skillNDamage}" ) );
        if( weapon.range.toLowerCase().trim() == "melee") {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_skillNDamage", "@{whisperweapon} &{template:roll} {{trait=@{fightingname}}} {{source=@{weapon}}} @{rolltFighting} {{button=y}} {{DmgRoll=[Roll Damage](~repeating_weapons_dmg) }} @{setmodsenc} @{showtraitmods} @{multiattack}" ) );
        } else {
            if( weapon.thrown ) {
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_skillNDamage", "@{whisperweapon} &{template:roll} {{trait=@{athleticsname}}} {{source=@{weapon}}} @{rolltAthletics} {{button=y}} {{DmgRoll=[Roll Damage](~repeating_weapons_dmg) }} @{setmodsenc} @{showtraitmods} @{multiattack}" ) );

            } else {
                exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_skillNDamage", "@{whisperweapon} &{template:roll} {{trait=@{shootingname}}} {{source=@{weapon}}} @{rolltShooting} {{button=y}} {{DmgRoll=[Roll Damage](~repeating_weapons_dmg) }} @{setmodsenc} @{showtraitmods} @{multiattack}" ) );
            }
        }
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_range", weapon.range ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_rof", weapon.rof ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponbutton", "0" ) );

        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_multiattack", "0" ) );

        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_rfightingname", "Fighting" ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_rathleticsname", "Athletics" ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_rshootingname", "Shooting" ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_rthrowingname", "Throwing" ) );

        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_showweaponconfig", "0" ) );
        // if( weapon.equippedPrimary || weapon.equippedSecondary )
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponcarried", "on" ) );
        // else
            // exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponcarried", 0 ) );

        let roll20DamageString = weapon.damage.toLowerCase().trim();
        roll20DamageString = convertToRoll20DamageString( roll20DamageString )

        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponweight", weapon.weight ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_dmgdietype", roll20DamageString ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weapondamage", weapon.damage ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponap", weapon.ap ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weaponshowmulti", weapon.rof ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_shots", weapon.shots, weapon.shots) );

        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weapondmg", roll20DamageString ) );
        // exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_weapons_-Mweaponid-X" + weaponCount + "_weapons_dmg", roll20DamageString ) );

        weaponWeight += weapon.weight;

        charGear.push("[@{repeating_weapons_-Mweaponid-X" + weaponCount + "_weapon} (@{repeating_weapons_-Mweaponid-X" + weaponCount + "_weapondamage})](~repeating_weapons_-Mweaponid-X" + weaponCount + "_tWeapon)");

        weaponCount++;
    }
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "weapontotalweightcarried", weaponWeight ) );

    // Armor
    let armorID: number = 0;
    let armorWeight: number = 0;

    for( let item of importObject.armor ) {

        // Armor Area Protection
        // 1 - Head
        // 2 - Torso
        // 3 - Torso+Arms
        // 4 - Torso + Legs
        // 5 - Torso + legs + Arms
        // 6 - Arms
        // 7 - Legs
        // 8 - Full Body
        let coverCode = 2;
        if( item.coversTorso ) {
            if( item.coversLegs ) {
                if( item.coversArms) {
                    if( item.coversHead ) {
                        // Full Body
                        coverCode = 8
                    } else {
                        // Torso + legs + Arms
                        coverCode = 5
                    }
                } else {
                    // Torso + Legs
                    coverCode = 4
                }
            } else {
                if( item.coversArms) {
                    // Torso+Arms
                    coverCode = 3
                } else {
                    // Torso
                    coverCode = 2
                }
            }
        } else {
            if( item.coversHead ) {
                // head
                coverCode = 1
            } else {
                if( item.coversArms ) {
                    // arms
                    coverCode = 6
                } else {
                    if( item.coversLegs ) {
                        // legs
                        coverCode = 7
                    }
                }
            }
        }

        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_armor_-Marmorid-X" + armorID + "_AreaProtected", coverCode ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_armor_-Marmorid-X" + armorID + "_ArmorType", item.name ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_armor_-Marmorid-X" + armorID + "_ArmorTypeWeight", item.weight ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_armor_-Marmorid-X" + armorID + "_ArmorTypeProtection", item.armor ) );
        armorWeight += item.weight

        charGear.push( "@{repeating_gear_-armorid" + armorID + "_ArmorType} +@{repeating_gear_-armorid" + armorID + "_ArmorTypeProtection}")

        armorID++;
    }

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "armortotalweightcarried", armorWeight ) );
    // Gear

    let gearID: number = 0;
    let gearWeight: number = 0;

    for( let item of importObject.gear ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_item", item.name ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_itemweight", item.weight ) );
        gearWeight += item.weight
        charGear.push( "@{repeating_gear_-gearid" + gearID + "_item}")
        gearID++;
        for( let subItem of item.contains.armor ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_item", subItem.name ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_itemweight", subItem.weight ) );
            gearWeight += subItem.weight
            charGear.push( "@{repeating_gear_-gearid" + gearID + "_item}")
            gearID++;
        }
        for( let subItem of item.contains.gear ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_item", subItem.name ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_itemweight", subItem.weight ) );
            gearWeight += subItem.weight
            charGear.push( "@{repeating_gear_-gearid" + gearID + "_item}")
            gearID++;
        }
        for( let subItem of item.contains.shields ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_item", subItem.name ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_itemweight", subItem.weight ) );
            gearWeight += subItem.weight
            charGear.push( "@{repeating_gear_-gearid" + gearID + "_item}")
            gearID++;
        }
        for( let subItem of item.contains.weapons ) {
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_item", subItem.name ) );
            exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_gear_-Mgearid-X" + gearID + "_itemweight", subItem.weight ) );
            gearWeight += subItem.weight
            charGear.push( "@{repeating_gear_-gearid" + gearID + "_item}")
            gearID++;
        }

    }

    // JournalItems
    let journalItemCount = 0;
    for( let journalItem of importObject.journal ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_quests_-M63-idid" + journalItemCount + "_Quest", journalItem.title ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_quests_-M63-idid" + journalItemCount + "_questLog", typeof(journalItem.text) == "string" ? journalItem.text :journalItem.text.join("\n") ) );

        journalItemCount++;
    }

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "chargear", charGear.join(", ") ) );
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "geartotalweightcarried", gearWeight ) );

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "totalloadcarried", gearWeight + armorWeight + weaponWeight ) );

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "loadlimitmod", importObject.loadLimit - importObject.loadLimitBase ) );
    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "loadlimit", importObject.loadLimitBase ) );

    exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "money", importObject.wealth ) );

    if( importObject.iconicFramework ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "IconicFramwork", importObject.iconicFramework ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "IF", "on" ) );
    }

    let cyberwareID: number = 0;

    if( importObject.cyberware.length > 0 ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "Cybernetics", 1 ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "izStrain", "on" ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "augment", "on" ) );
    }

    for( let item of importObject.cyberware ) {
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_augmentation_-Mcyberwareid-X" + cyberwareID + "_augment", item.name ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_augmentation_-Mcyberwareid-X" + cyberwareID + "_augStrain", item.strain ) );
        exportItem.attribs.push( makeRoll20BaseAttrib( idPre, "repeating_augmentation_-Mcyberwareid-X" + cyberwareID + "_augDeets", item.notes ) );
        charGear.push( "@{repeating_augmentation_-cyberwareid" + cyberwareID + "_item}")
        cyberwareID++;

    }

    return exportItem;
}