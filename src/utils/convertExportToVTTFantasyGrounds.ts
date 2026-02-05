import { IExportStatsOutput } from "../interfaces/IExportStatsOutput";
import { replaceAll } from "./CommonFunctions";
const { create } = require('xmlbuilder2');

export function convertExportToVTTFantasyGrounds( importObj: IExportStatsOutput): string {

    const root = create().ele('root');
    root.att('dataversion', "20200203");
    root.att('release', "5.2|CoreRPG:4");
    root.att('version', "4");

    const characterTag = root.ele('character');

    let advances = characterTag.ele("advances");
    advances.att("type", "number");
    advances.txt( importObj.advancesCount );

    let encumbered = characterTag.ele("encumbered");
    encumbered.att("type", "number");
    encumbered.txt( 0 );

    let bonuslistRoot = characterTag.ele("bonuslist");
        let agilityBonus = bonuslistRoot.ele("agility");
        let armorBonus = bonuslistRoot.ele("armor");
        let paceBonus = bonuslistRoot.ele("pace");
        let parryBonus = bonuslistRoot.ele("parry");
        let sizeBonus = bonuslistRoot.ele("size");
        if( importObj.size > 0 ) {

        }
        let smartsBonus = bonuslistRoot.ele("smarts");
        let spiritBonus = bonuslistRoot.ele("spirit");
        let strengthBonus = bonuslistRoot.ele("strength");
        let toughnessBonus = bonuslistRoot.ele("toughness");
        if( importObj.toughnessBase != importObj.toughnessTotal ) {
            let toughnessBonusCount = 0;
            let armorBonus: number  = 0;
            for( let armor of importObj.armor ) {
                if( armor.equipped && armor.coversTorso ) {
                    armorBonus += armor.armor
                }
            }
            if( armorBonus > 0 ) {
                let armorBonusItem = toughnessBonus.ele("id-" + padID(toughnessBonusCount));
                let armorBonusField = armorBonusItem.ele("bonus")
                armorBonusField.att("type", "number");
                armorBonusField.txt( armorBonus )

                let armorEnabled = armorBonusItem.ele("enabled")
                armorEnabled.att("type", "number");
                armorEnabled.txt( 1 )

                let readonly = armorBonusItem.ele("readonly")
                readonly.att("type", "number");
                readonly.txt( 1 )

                let armorName = armorBonusItem.ele("nameREMOVETHISTAGMOOMOO")
                armorName.att("type", "string");
                armorName.txt("[Armor]");
                toughnessBonusCount++;

            }

            if( importObj.toughnessBase != importObj.toughnessTotalNoArmor ) {
                let toughModBonus = importObj.toughnessTotalNoArmor - importObj.toughnessBase;
                let toughModItem = toughnessBonus.ele("id-" + padID(toughnessBonusCount));
                let toughModBonusField = toughModItem.ele("bonus")
                toughModBonusField.att("type", "number");
                toughModBonusField.txt( toughModBonus )

                let toughModEnabled = toughModItem.ele("enabled")
                toughModEnabled.att("type", "number");
                toughModEnabled.txt( 1 )

                let readonly = toughModItem.ele("readonly")
                readonly.att("type", "number");
                readonly.txt( 1 )

                let toughModName = toughModItem.ele("nameREMOVETHISTAGMOOMOO")
                toughModName.att("type", "string");
                toughModName.txt("Toughness Bonuses");

                toughnessBonusCount++;
            }

        }
        let vigorBonus = bonuslistRoot.ele("vigor");
    // TODO?

    let encumbrance = characterTag.ele("encumbrance");
        let limit = encumbrance.ele("encumbrance");
            limit.att("type", "number");
            limit.txt( importObj.loadLimit );
        let load = encumbrance.ele("load");
            load.att("type", "number");
            load.txt( importObj.loadLimit );
        let loadstr = encumbrance.ele("loadstr");
            loadstr.att("type", "number");
            loadstr.txt( 0 );       // TODO - no idea

    let allies = characterTag.ele("allies");
    // TODO?

    let main = characterTag.ele("main");
        let bennies = main.ele( "bennies" );
            bennies.att("type", "number");
            bennies.txt( importObj.bennies );
        let fatigue = main.ele( "fatigue" );
            fatigue.att("type", "number");
            fatigue.txt( importObj.fatigue );
        let wounds = main.ele( "wounds" );
            wounds.att("type", "number");
            wounds.txt( importObj.wounds );
        let powerpoints = main.ele( "powerpoints" );
            powerpoints.att("type", "number");
            powerpoints.txt( 0 );
        let powerpointsmax = main.ele( "powerpointsmax" );
            powerpointsmax.att("type", "number");
            powerpointsmax.txt( 0 );
    /*
    			<bennies type="number">0</bennies>
			< type="number">0</fatigue>
			< type="number">0</powerpoints>
			< type="number">0</powerpointsmax>
			< type="number">0</wounds>
    */

    // Attributes
    for( let att of importObj.attributes ) {
        let attribute = characterTag.ele( att.name );
        attribute.att("type", "dice");
        attribute.txt( att.value );

        let attributeAdjustment = characterTag.ele( att.name + "Adjustment" );
        attributeAdjustment.att("type", "number");
        attributeAdjustment.txt( 0 );

        let attributeMod = characterTag.ele( att.name + "Mod" );
        attributeMod.att("type", "number");
        attributeMod.txt( att.mod );
    }

    let armor = characterTag.ele("armor");
    armor.att("type", "number");
    armor.txt( importObj.armorValue );

    let armorlist = characterTag.ele("armorlist");
    let armorCount = 1
    for( let armor of importObj.armor ) {
        let armorItem = armorlist.ele("id-" + padID(armorCount));

        let count = armorItem.ele("carried");
        count.att("type", "number");
        count.txt( 1 );

        let encumbered = armorItem.ele("encumbered");
        encumbered.att("type", "number");
        encumbered.txt( 0 );

        let modifications = armorItem.ele("modifications");
        // TODO?

        let name = armorItem.ele("nameREMOVETHISTAGMOOMOO");
        name.att("type", "string");
        name.txt( armor.name );

        let pace = armorItem.ele("pace");
        pace.att("type", "number");
        pace.txt( 0 );    // TODO? is this a bonus or an override?

        let protection = armorItem.ele("protection");
        protection.att("type", "number");
        protection.txt( armor.armor );

        let rundie = armorItem.ele("rundie");
        rundie.att("type", "dice");
        // rundie.txt( "" );    // TODO?

        let size = armorItem.ele("size");
        size.att("type", "number");
        size.txt( 0 );   // TODO?

        let weight = armorItem.ele("weight");
        weight.att("type", "number");
        weight.txt( armor.weight );

        armorCount++;
    }

    let coins = characterTag.ele("coins");
        let coinsSlot1 = coins.ele("slot1");
        let countSlot1Amount = coinsSlot1.ele("amount");
        countSlot1Amount.att("type", "number");
        countSlot1Amount.txt( importObj.wealth );

        let coinsSlot2 = coins.ele("slot2");
        let countSlot2Amount = coinsSlot2.ele("amount");
        countSlot2Amount.att("type", "number");
        countSlot2Amount.txt( importObj.wealth );

        let coinsSlot3 = coins.ele("slot3");
        let countSlot3Amount = coinsSlot3.ele("amount");
        countSlot3Amount.att("type", "number");
        countSlot3Amount.txt( importObj.wealth );

    let conviction = characterTag.ele("conviction");
    conviction.att("type", "number");
    conviction.txt( 0 );

    let description = characterTag.ele("description");
    description.att("type", "string");
    description.txt( encodeHTMLString(importObj.description + importObj.background) );

    let edges = characterTag.ele("edges");
    let edgeCount = 1;
    for( let item of importObj.edges ) {
        let edgeItem = edges.ele("id-" + padID(edgeCount));

        // let link = edgeItem.ele("link");
        // link.att("type", "windowreference");

        // let linkClass = link.ele("REMOVETHISTAGMOOMOOclass");
        // linkClass.txt("sw_referencefeat");

        // let linkRecordName = link.ele("recordname");
        // linkRecordName.txt(".....id-" +  padID(edgeCount) + ".edges.id-" +  +  padID(edgeCount));

        let name = edgeItem.ele("nameREMOVETHISTAGMOOMOO");
        name.att( "type", "string" );
        name.txt( item.name );

        if( item.description.trim() ) {
            let description = edgeItem.ele("description");
            description.att( "type", "string" );
            description.txt( item.description );
        }
        edgeCount++;
    }

    let hindrances = characterTag.ele("hindrances");
    let hindranceCount = 1;
    for( let item of importObj.hindrances ) {
        let hindranceItem = hindrances.ele("id-" + padID(hindranceCount));

        // let link = hindranceItem.ele("link");
        // link.att("type", "windowreference");

        // // Stupid XMLBuilder doesn't like some tags...
        // let linkClass = link.ele("REMOVETHISTAGMOOMOOclass");
        // linkClass.txt("sw_referencefeat");

        // let linkRecordName = link.ele("recordname");
        // linkRecordName.txt(".....id-" +  padID(hindranceCount) + ".hindrances.id-" +  +  padID(hindranceCount));

        let name = hindranceItem.ele("nameREMOVETHISTAGMOOMOO");
        name.txt( item.name );
        name.att( "type", "string" );

        if( item.description.trim() ) {
            let description = hindranceItem.ele("description");
            description.txt( item.description );
            description.att( "type", "string" );
        }
        hindranceCount++;
    }

    let name = characterTag.ele("nameREMOVETHISTAGMOOMOO");
    name.att("type", "string");
    name.txt( importObj.name );

    let pace = characterTag.ele("pace");
    pace.att("type", "number");
    pace.txt( importObj.paceTotal );

    let parry = characterTag.ele("parry");
    parry.att("type", "number");
    parry.txt( importObj.parryTotal );

    let inc = characterTag.ele("inc");
    inc.att("type", "number");
    inc.txt( 0 )    // TODO - no idea

    let rundie = characterTag.ele("rundie");
    rundie.att("type", "dice");
    rundie.txt( importObj.runningDie );

    let shaken = characterTag.ele("shaken");
    shaken.att("type", "number");
    shaken.txt( 0 )    // TODO - ignore

    let size = characterTag.ele("size");
    size.att("type", "number");
    size.txt( importObj.size );

    let token = characterTag.ele("token");
    token.att("type", "token");

    let toughness = characterTag.ele("toughness");
    toughness.att("type", "number");
    toughness.txt( importObj.toughnessTotal );

    let gender = characterTag.ele("gender");
    gender.att("type", "string");
    gender.txt( importObj.gender );

    let heavyarmor = characterTag.ele("heavyarmor");
    heavyarmor.att("type", "number");
    heavyarmor.txt( importObj.heavyArmor ? 1 : 0 );

    let race = characterTag.ele("race");
    race.att("type", "race");
    race.txt( importObj.race );

    let raceLink = characterTag.ele("racelink");
    raceLink.att("type", "windowreference");
        let classItem = raceLink.ele( "REMOVETHISTAGMOOMOOclass");
        classItem.txt("");
        let recordname = raceLink.ele( "recordname");
        recordname.txt(".");

    let skills = characterTag.ele("skills");
    let skillCount = 1;
    for( let item of importObj.skills ) {
        let skillItem = skills.ele("id-" + padID(skillCount));
        // let link = skillItem.ele("link");
        // link.att("type", "windowreference");
        // let linkClass = link.ele("REMOVETHISTAGMOOMOOclass");
        // linkClass.txt("sw_referenceskill");
        // let linkRecordName = link.ele("recordname");
        // linkRecordName.txt("reference.skills." + item.name.toLowerCase().replace(" ", "") + "@SWADE Player Guide");

        let name = skillItem.ele("nameREMOVETHISTAGMOOMOO");
        name.txt( item.name );
        name.att( "type", "string" );

        let skill = skillItem.ele("skill");
        skill.txt( item.value );
        skill.att( "type", "dice" );

        let specializations = skillItem.ele("specializations");
        // TODO?

        let bonuslist = skillItem.ele("bonuslist");
    // TODO?

        let adjustment = skillItem.ele("adjustment");
        adjustment.att("type", "number");
        adjustment.txt( 0 );

        let skillmod = skillItem.ele("skillmod");
        skillmod.att("type", "number");
        skillmod.txt( item.mod );

        skillCount++;
    }

    let weight = characterTag.ele("advances");
    let inv = weight.ele("advances");
        inv.att("type", "number");
        inv.txt( importObj.load );

    let wildcard = characterTag.ele("wildcard");
    wildcard.att("type", "number");
    wildcard.txt( importObj.wildcard ? "1" : "0" );

    let specials = characterTag.ele("special");
    let specialCount = 1;
    for( let item of importObj.abilities ) {
        let specialItem = specials.ele("id-" + padID(specialCount));

        // let link = specialItem.ele("link");
        // link.att("type", "windowreference");

        // let linkClass = link.ele("REMOVETHISTAGMOOMOOclass");
        // linkClass.txt("sw_referencefeat");

        // let linkRecordName = link.ele("recordname");
        // linkRecordName.txt(".....id-" +  padID(specialCount) + ".specials.id-" +  +  padID(specialCount));

        let name = specialItem.ele("nameREMOVETHISTAGMOOMOO");
        name.txt( item.name );
        name.att( "type", "string" );

        if( item.description.trim() ) {
            let description = specialItem.ele("description");
            description.txt( item.description );
            description.att( "type", "string" );
        }
        specialCount++;
    }

    let weaponlist = characterTag.ele("weaponlist");
    let weaponlistCount = 1;
    for( let item of importObj.weapons ) {
        let weaponItem = weaponlist.ele("id-" + padID(weaponlistCount));

        let ammo = weaponItem.ele( "ammo" );
            let ammoMax = ammo.ele("max");
            ammoMax.att("type", "number");
            ammoMax.txt( item.shots);

            let ammUsed = ammo.ele("used");
            ammUsed.att("type", "number");
            ammUsed.txt( 0 );
        let ammomax = weaponItem.ele( "ammomax" );
        ammomax.att("type", "number");
        ammomax.txt( item.shots);

        let armorpiercing = weaponItem.ele( "armorpiercing" );
        armorpiercing.att("type", "number");
        armorpiercing.txt( item.ap );

        let bonusdamage = weaponItem.ele( "bonusdamage" );
        bonusdamage.att("type", "string");
        bonusdamage.txt( "d6" );

        let bonuslist = weaponItem.ele( "bonuslist" );

        let carried = weaponItem.ele( "carried" );
        carried.att("type", "number");
        carried.txt( 1  );

        let count = weaponItem.ele( "count" );
        count.att("type", "number");
        count.txt( item.quantity  );

        let damage = weaponItem.ele( "damage" );
        damage.att("type", "string");
        damage.txt( item.damage  );

        let damagedice = weaponItem.ele( "damage" );
        damagedice.att("type", "dice");
        damagedice.txt( item.damageDiceBase  );

        let damagebonus = weaponItem.ele( "damage" );
        damagebonus.att("type", "number");
        damagebonus.txt( item.damageDiceBasePlus  );

        let encumbered = weaponItem.ele( "encumbered" );
        encumbered.att("type", "number");
        encumbered.txt( 0  );

        let fumble = weaponItem.ele( "fumble" );
        fumble.att("type", "number");
        fumble.txt( 1  );

        let isequipment = weaponItem.ele( "isequipment" );
        isequipment.att("type", "number");
        isequipment.txt( item.innate ? 0 : 1  );

        let locked = weaponItem.ele( "locked" );
        locked.att("type", "number");
        locked.txt( 0  );

        let modifications = weaponItem.ele( "modifications" );

        let name = weaponItem.ele( "nameREMOVETHISTAGMOOMOO" );
        name.att("type", "string");
        name.txt( item.name  );

        let reach = weaponItem.ele( "reach" );
        reach.att("type", "number");
        reach.txt( item.reach  );

        let weight = weaponItem.ele( "weight" );
        weight.att("type", "number");
        weight.txt( item.weight  );

        let traitcount = weaponItem.ele( "traitcount" );
        traitcount.att("type", "number");
        traitcount.txt( 0 );

        let traittype = weaponItem.ele( "traittype" );
        traittype.att("type", "string");
        traittype.txt( item.range.toLowerCase().trim() == "melee" ? "Melee" : "Ranged" );

        weaponlistCount++;
    }

    let languagelist = characterTag.ele("languagelist");
    let languageCount = 1;
    for( let item of importObj.languages ) {
        let languageItem = languagelist.ele("id-" + padID(languageCount));

        let name = languageItem.ele("nameREMOVETHISTAGMOOMOO");
        name.att("type", "string");
        name.txt( item.name + "(" + item.value + ")" );

        languageCount++;
    }

    let invList = characterTag.ele("invlist");
    let invListCount = 1;
    for( let item of importObj.gear ) {
        let gearItem = invList.ele("id-" + padID(invListCount));

        let name = gearItem.ele( "nameREMOVETHISTAGMOOMOO" );
            name.att("type", "string");
            name.txt( item.name  );

        let locked = gearItem.ele( "locked" );
            locked.att("type", "number");
            locked.txt( 0  );

        let count = gearItem.ele( "count" );
            count.att("type", "number");
            count.txt( item.quantity );

        let carried = gearItem.ele( "carried" );
            carried.att("type", "number");
            carried.txt( 1  );

        let weight = gearItem.ele( "weight" );
            weight.att("type", "number");
            weight.txt( item.weight  );

        let encumbered = gearItem.ele( "encumbered" );
            encumbered.att("type", "number");
            encumbered.txt( 0  );
        let isidentified = gearItem.ele( "isidentified" );
            isidentified.att("type", "number");
            isidentified.txt( 1  );

        let text = gearItem.ele( "text" );
            text.att("type", "formattedtext");
            let textP = text.ele( "p" );
                textP.txt( item.notes );

        invListCount++;
    }

    let notesString: string = "";

    if( importObj.abs.length > 0 ) {

        let arcanetype = characterTag.ele("arcanetype");
        arcanetype.att("type", "string");
        arcanetype.txt( importObj.abs[0].name );

        let powerlist = characterTag.ele("powerlist");
        let powerCount = 1;
        let abCount = 0;
        for( let ab of importObj.abs ) {
            for( let item of ab.powers ) {
                let powerItem = powerlist.ele("id-" + padID(powerCount));

                let powerName = item.name;
                if( abCount > 0 ) {
                    item.name += " - AB#" + (abCount + 1) + " "  + ab.name;
                }
                let name = powerItem.ele("nameREMOVETHISTAGMOOMOO");
                    name.att("type", "string");
                    name.txt( powerName );

                let ammo = powerItem.ele( "ammo" );
                    let ammoMax = ammo.ele("max");
                        ammoMax.att("type", "number");
                        ammoMax.txt(0);

                let armorpiercing = ammo.ele("armorpiercing");
                    armorpiercing.att("type", "number");
                    armorpiercing.txt(0);

                let bonusdamage = ammo.ele("bonusdamage");
                    bonusdamage.att("type", "number");
                    bonusdamage.txt(0);

                let reach = ammo.ele("reach");
                    reach.att("type", "number");
                    reach.txt(0);

                let traitcount = ammo.ele("traitcount");
                    traitcount.att("type", "number");
                    traitcount.txt(0);

                let bonuslist = ammo.ele("bonuslist");

                let fumble = ammo.ele("fumble");
                    fumble.att("type", "number");
                    fumble.txt(1);

                let locked = ammo.ele("traitcount");
                    locked.att("type", "number");
                    locked.txt(0);

                let traittype = ammo.ele("traittype");
                    traittype.att("type", "string");
                    traittype.txt( ab.arcaneSkill );

                let range = ammo.ele("range");
                    range.att("type", "string");
                    range.txt( powerItem.range );

                let powerpoints = ammo.ele("powerpoints");
                    powerpoints.att("type", "number");
                    powerpoints.txt( powerItem.powerpoints );

                let damagebonus = ammo.ele("damagebonus");
                    damagebonus.att("type", "number");
                    damagebonus.txt(0);
                let damagedice = ammo.ele("damagedice");
                    damagedice.att("type", "dice");
                    damagedice.txt( powerItem.damage );
                let damage = ammo.ele("damage");
                    damage.att("type", "string");
                    damage.txt( powerItem.damage );
                let duration = ammo.ele("duration");
                    duration.att("type", "string");
                    duration.txt( powerItem.duration );

                let power = powerItem.ele( "power" );
                    let powerMax = power.ele("max");
                        powerMax.att("type", "number");
                        powerMax.txt(0);
                    let powerCurrent = power.ele("current");
                        powerCurrent.att("type", "number");
                        powerCurrent.txt(0);

                powerCount++;

            }

            if( abCount > 0 ) {
                notesString += "AB #" + (abCount + 1 ) + ": " + ab.name + " - " + ab.powerPointsMax + " Max Power Points\n";
            }
            abCount++;
        }
        if( abCount > 1 ) {
            notesString += "--------------------------------------------------------\n\n";
        }
    }

    if( importObj.background.length > 0 ) {
        notesString += "Background:\n" + importObj.background;
        notesString += "\n";
        notesString += "--------------------------------------------------------\n\n";
    }

    if( importObj.description.length > 0 ) {
        notesString += "Description:\n" + importObj.description;
        notesString += "\n";
        notesString += "--------------------------------------------------------\n\n";
    }

    let notes = characterTag.ele("notes");
    notes.att("type", "string");
    notes.txt( notesString )             // TODO or ignore

    let xml: string = root.end({ prettyPrint: true });

    xml = replaceAll(xml, "REMOVETHISTAGMOOMOO", "");
    return xml;
}

function encodeHTMLString( inputString: string): string {
    return inputString.replace(
        /[\u00A0-\u9999<>\&]/gim,
        function(i) {
            return '&#'+i.charCodeAt(0)+';';
        }
    );
}

function padID( num: number ): string {
    let numStr: string  = num.toString();
    while( numStr.length < 5 ) {
        numStr = "0" + numStr;
    }

    return numStr;
}