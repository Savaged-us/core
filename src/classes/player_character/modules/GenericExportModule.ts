/**
 * GenericExportModule - Handles character export to generic JSON format
 *
 * Extracted from PlayerCharacter class.
 * This module handles:
 * - exportGenericJSON: Export character data to a generic JSON format for VTTs, printouts, etc.
 */

import type { PlayerCharacter } from '../player_character';
import { CONFIGLiveHost } from '../../../../ConfigGeneral';
import { IExportArcaneBackground, IExportStatsOutput, sortPowerExports } from '../../../interfaces/IExportStatsOutput';
import { capitalCase, getRankName, normalizeCharacters, replaceAll } from '../../../utils/CommonFunctions';
import { getDisplayText } from '../../../utils/escapeCharacterFixer';
import { getDieLabelFromIndex, getDieValueFromIndex } from '../../../utils/Dice';
import { formatDateYYYYMMDD } from '../../../utils/FormatDateYYYYMMDD';
import { getSizeExtraWounds, getSizeName } from '../../../utils/getSizeName';
import { ParseDamageString } from '../../../utils/ParseDamageString';
import { removeExtraImageURL } from '../../../utils/removeExtraImageURL';
import { BestiaryEntry } from '../../bestiary_entry';
import { BaseModule } from './BaseModule';

export class GenericExportModule extends BaseModule {
    constructor(character: PlayerCharacter) {
        super(character);
    }

    /**
     * Reset module state.
     */
    reset(): void {
        // Generic export has no persistent state
    }

    /**
     * Export character to generic JSON format
     */
    exportGenericJSON(
        appVersion: string,
        createdOn: Date | null = null,
        updatedOn: Date | null = null,
        imageUpdated: Date | null = null,
        settingImageUpdated: Date | null = null,
        tokenImageUpdated: Date | null = null,
        fullPathHost: boolean,
    ): IExportStatsOutput {
        const char = this._char as any;

        if( !createdOn )
            createdOn = char.createdOn;
        if( !updatedOn )
            updatedOn = char.updatedOn;
        if( !imageUpdated )
            imageUpdated = char.updatedOn;
        if( !imageUpdated )
            imageUpdated = char.updatedOn;
        if( !tokenImageUpdated )
            tokenImageUpdated = char.updatedOn;
        let savagedUsShareURL = "";
        if( char.shareURL ) {
            savagedUsShareURL = CONFIGLiveHost + "/s/" + char.shareURL;
        }
        let rv: IExportStatsOutput = {
            saveID: char.saveID,
            id: 0,
            usesRippersReason: char.setting.usesRipperReason(),
            ripperReason: char.getRippersReason(),
            usesRippersStatus: char.setting.usesRipperReason(),
            ripperStatus: char.getRippersStatus(),
            riftsDisclaimer: char.setting.settingIsEnabled('rifts_mdc'),
            wealthDieCalculated: getDieLabelFromIndex(char.wealthDieInitialCalculation),
            toughnessModifiers: char.getToughnessModifiers(),
            wealthDieActive: char.setting.usesWealthDie,
            wealthDieValue: char.wealthDie,
            wealthDieBonus: char.wealthDieBonus,
            usesSanity: char.setting.settingIsEnabled('sanity'),
            scholarship: char.getDerivedBoost("scholarship"),
            usesETUScholarship: char.setting.settingIsEnabled('etu_scholarship'),
            noPowerPoints: char.setting.settingIsEnabled('nopowerpoints'),
            unarmoredHero: char.setting.settingIsEnabled('swade_unarmored_hero'),
            hideHumanRaceDisplay: char.setting.hideHumanRace,

            usesStrain: char.setting.settingIsEnabled("strain"),
            strainMax: char._maxStrain,
            strainCurrent: char._currentStrain,
            wealthFormatted: char.getCurrentWealthHR(),
            playerName: char.playerName,
            naturalIsHeavy: char.naturalArmorIsHeavy,
            naturalArmor: char.naturalArmor,

            raceGenderAndProfession: char.getRaceGenderAndProfession(),
            playerCharacter: true,
            createdDate: createdOn,
            updatedDate: updatedOn,
            appVersion: appVersion,
            abilities: [],
            abs: [],
            advances: [],
            advancesCount: char._advancement_count,
            age: char.age,
            armor: [],
            armorValue: char.getArmorValue(),
            attributes: [],
            background: normalizeCharacters(char.background.trim()),
            bennies: char.getStartingBennies(),
            benniesMax: char.getStartingBennies(),
            bookName: "Custom",
            bookID: 0,
            bookPrimary: false,
            bookCore: false,
            bookPublished: "",
            bookPublisher: "",
            charisma: char.getCharisma(),
            cyberware: [],
            description: normalizeCharacters(char.description.trim()),
            edges: [],
            fatigue: 0,
            fatigueMax: 2,
            gear: [],
            gender: char.gender,
            heavyArmor: char.isHeavyArmor(),
            hindrances: [],
            iconicFramework: char.getFrameworkName(),
            settingImage: char.setting && char.setting.image_url ? char.setting.image_url : "",
            image: "",
            imageToken: "",
            alliedExtras: [],

            journal: [],
            languages: [],
            load: char.getCurrentLoad(),
            loadLimit: char.getLoadLimit(),
            loadLimitBase: char.getBaseLoadLimit(),
            loadLimitModifier: char.getLoadLimit() - char.getBaseLoadLimit(),
            name: char.name,
            paceBase: 6,
            paceMod: +char.getPace() - 6,
            paceTotal: +char.getPace(),
            parryBase: 0, // calculate later in skills
            parryMod: 0, // calculate later in skills
            parryTotal: 0, // calculate later in skills
            parryShield: 0, // calculate later in skills
            parryHR: "", // calculate later in skills
            professionOrTitle: char.professionOrTitle,
            race: char.race.getName(),
            rank: char.getCurrentRank(),
            rankName: char.getCurrentRankName(),
            runningDie: char.getRunningDie(),
            sanity: char.getSanity(),
            savagedUsShareURL: savagedUsShareURL,
            shields: [],
            size: char.getSize(),
            sizeLabel: char.getSize() + " (" + getSizeName(char.getSize()) + ")",
            skills: [],
            allSkills: [],
            swade: char.setting.primaryIsSWADE,
            toughnessBase: getDieValueFromIndex( char.getAttributeCurrent("vigor")) / 2 + 2,
            toughnessMod: char.getToughnessValue(true) - char.getArmorValue() - (getDieValueFromIndex( char.getAttributeCurrent("vigor")) / 2 + 2),
            toughnessTotal: char.getToughnessValue(true),
            toughnessTotalNoArmor: char.getToughnessValue(false),
            toughnessAsRead: char.getToughnessAndArmor(),
            toughnessAsReadNoHeavy: char.getToughnessAndArmor(true),
            toughnessHeavyLabel: char.getToughnessHeavyLabel(),
            usesCharisma: !char.setting.primaryIsSWADE,
            usesXP: !char.setting.primaryIsSWADE,
            uuid: char.UUID,
            vehicles: [],
            wealth: char.getCurrentWealth(),
            weapons: [],
            wildcard: true,
            wounds: char.woundsCurrent,
            woundsBase: 3, // PC is always 3 wounds base
            woundsMax: char.getWoundsMax(),
            woundsOtherMod: char._derivedBaseBoosts.wounds,
            woundsSizeMod: getSizeExtraWounds(char.getSize()),
            xp: char._xp,
            otherAttacks: [],
        };

        if( char.imageTokenURL && char.imageTokenURL.trim() ) {
            let cleanImageURL = removeExtraImageURL(char.imageTokenURL);
            rv.imageToken = cleanImageURL + "?v=" + (tokenImageUpdated!.getTime() / 1000).toString()
            if( fullPathHost &&  !rv.imageToken.startsWith( CONFIGLiveHost  ) ) {
                rv.imageToken = CONFIGLiveHost + rv.imageToken;
            }
        }

        if( char.image_url && char.image_url.trim() ) {
            let cleanImageURL = removeExtraImageURL(char.image_url);
            rv.image = cleanImageURL + "?v=" + (imageUpdated!.getTime() / 1000).toString()
            if( fullPathHost && !rv.image.startsWith( CONFIGLiveHost ) ) {
                rv.image = CONFIGLiveHost + rv.image;
            }
        }

        if( !rv.imageToken ) {
            if( char.saved_token_image && char.saved_token_image.trim() ) {
                rv.imageToken = char.saved_token_image + "?v=" + (tokenImageUpdated!.getTime() / 1000).toString()
                if( fullPathHost && !rv.imageToken.startsWith( CONFIGLiveHost  ) ) {
                    rv.imageToken = CONFIGLiveHost + rv.imageToken;
                }
            }
        }
        if( !rv.image ) {
            if( char.saved_image && char.saved_image.trim() ) {
                rv.image = char.saved_image + "?v=" + (imageUpdated!.getTime() / 1000).toString()
                if( fullPathHost && !rv.image.startsWith( CONFIGLiveHost ) ) {
                    rv.image = CONFIGLiveHost + rv.image;
                }
            }
        }

        for( let alliedExtra of char._allies ) {
            let extraObj = new BestiaryEntry( alliedExtra );

            rv.alliedExtras.push(
                extraObj.exportGenericJSON(
                    char._availableData,
                    appVersion,
                    createdOn,
                    updatedOn,
                    fullPathHost,
                )
            )
        }

        if( char.saved_setting_image && char.saved_setting_image.trim() ) {
            if( !settingImageUpdated )
                settingImageUpdated = new Date();

            rv.settingImage = char.saved_setting_image.trim() + "?v=" + (settingImageUpdated.getTime() / 1000).toString();
            if( !rv.settingImage.startsWith( CONFIGLiveHost ) ) {
                rv.settingImage = CONFIGLiveHost + rv.settingImage;
            }
        }

        for( let veh of char._vehiclesPurchased ) {
            rv.vehicles.push(
                veh.exportGenericJSON(
                    char._availableData,
                    appVersion,
                    veh.createdOn,
                    veh.updatedOn,
                    fullPathHost,
                )
            );
        }

        for( let entry of char.journal ) {
            rv.journal.push( {
                date: entry.date ,
                title: formatDateYYYYMMDD( entry.date ),
                text: entry.entry,
            })
        }

        // Attributes
        for( let attribute of ["agility", "smarts", "spirit", "strength", "vigor"]) {
            let dieValue = getDieValueFromIndex( char.getAttributeCurrent(attribute) );
            let dieMod = char.getAttributeBonus(attribute);
            if( dieValue > 12 ) {
                dieMod += dieValue - 12;
                dieValue = 12;
            }
            rv.attributes.push({
                name: attribute,
                label: capitalCase(attribute.toLowerCase()),
                value: char.getAttributeCurrentHR(attribute),
                mod: dieMod,
                dieValue: dieValue,
            });
        }

        // Skills
        rv.skills.push({
            name: "(Unskilled)",
            attribute: "",
            value: "d4-2",
            dieValue: 4,
            mod: -2,
            isCore: false,
            bookID: 0,
        });

        rv.allSkills.push({
            name: "(Unskilled)",
            attribute: "",
            value: "d4-2",
            dieValue: 4,
            mod: -2,
            isCore: false,
            bookID: 0,
        });

        for( let skill of char.skills ) {
            if( skill.isKnowledge || skill.isLanguage ) {

                // Language Skills
                let skillAttribute = "";
                if( skill.attribute )
                    skillAttribute = skill.attribute.toLowerCase();
                for( let sub of skill.specialties ) {

                    let mod = sub.bonusValue;
                    let dieValue = getDieValueFromIndex( sub.assignedValue + sub.boostValue )

                    if( dieValue > 12  ) {
                        mod += dieValue - 12;
                        dieValue = 12;
                    }

                    rv.skills.push({
                        name: getDisplayText(skill.name) + " (" + getDisplayText(sub.name) + ")",
                        attribute: skillAttribute,
                        value: getDieLabelFromIndex( sub.assignedValue + sub.boostValue ),
                        dieValue: dieValue,
                        mod: mod,
                        isCore: skill.isCore,
                        bookID: skill.bookID,
                    });

                    rv.allSkills.push({
                        name: getDisplayText(skill.name) + " (" + getDisplayText(sub.name) + ")",
                        attribute: skillAttribute,
                        value: getDieLabelFromIndex( sub.assignedValue + sub.boostValue ),
                        dieValue: dieValue,
                        mod: mod,
                        isCore: skill.isCore,
                        bookID: skill.bookID,
                    })

                    if( skill.isLanguage ) {
                        rv.languages.push({
                            name: sub.name,
                            attribute: skillAttribute,
                            value: getDieLabelFromIndex( sub.assignedValue + sub.boostValue ),
                            dieValue: dieValue,
                            mod: mod,
                            isCore: skill.isCore,
                            bookID: skill.bookID,
                        });
                    }
                }
            } else {
                let mod = skill.bonusValue;
                let dieValue = getDieValueFromIndex( skill.currentValue() )

                if( dieValue > 12  ) {
                    mod += dieValue - 12;
                    dieValue = 12;
                }

                if( skill.name.toLowerCase().trim() == "fighting" ) {
                    rv.parryBase = Math.floor( getDieValueFromIndex( skill.currentValue() ) / 2) + 2;
                    rv.parryTotal = char.getParry();
                    rv.parryMod = rv.parryTotal - rv.parryBase;
                    rv.parryHR = char.getParryHR();
                    rv.parryShield = char.getShieldParryBonus();
                }

                let skillAttribute = "";
                if( skill.attribute )
                    skillAttribute = skill.attribute.toLowerCase();

                if( skill.currentValue() > 0 ) {
                    // Regular Skills
                    rv.skills.push({
                        name: getDisplayText(skill.name),
                        attribute: skillAttribute,
                        value: skill.currentValueHR(),
                        dieValue: dieValue,
                        mod: mod,
                        isCore: skill.isCore,
                        bookID: skill.bookID,
                    })
                }

                rv.allSkills.push({
                    name: getDisplayText(skill.name),
                    attribute: skillAttribute,
                    value: skill.currentValueHR(),
                    dieValue: dieValue,
                    mod: mod,
                    isCore: skill.isCore,
                    bookID: skill.bookID,
                })
            }
        }

        // Advances
        let advCount = 1;
        rv.advances = [];
        for( let adv of char.getAdvances() ) {
            rv.advances.push({
                name: adv.getName(),
                number: advCount,
                description: adv.getName(),
            })

            advCount++;
        }

        // Edges
        for( let edge of char.getAllEdgesData() ) {
            let bookPage = "";
            if( edge.page ) {
                bookPage = " p" + edge.page.toString().replace("p", "")
            }
            rv.edges.push({
                id: edge.id,
                customDescription: edge.customDescription,
                name: edge.name,
                description: edge.summary,
                note: edge.from,
                takenFrom: edge.book_short_name + bookPage,
                bookID: edge.book_id,
                isHidden: edge.isHidden,
                descriptionHTML: edge.descriptionHTML,
            })
        }

        // Positive Special Abilities
        for( let ability of char.getSpecialAbilitiesList(true, true) ) {
            let bookPage = "";
            if( ability.page && !ability.custom ) {
                bookPage = " p" + ability.page.toString().replace("p", "")
            }
            rv.abilities.push({
                name: ability.name,
                description: ability.summary,
                note: ability.from,
                positive: ability.positive,
                from: ability.from,
                takenFrom: ability.book_name + bookPage,
                bookID: ability.book_id,

            })
        }

        // Hindrances
        for( let hindrance of char.getAllHindrancesData() ) {
            let bookPage = "";
            if( hindrance.page ) {
                bookPage = " p" + hindrance.page.toString().replace("p", "")
            }
            rv.hindrances.push({
                id: hindrance.id,
                name: hindrance.name,
                customDescription: hindrance.customDescription,
                description: hindrance.summary,
                note: hindrance.from,
                major: hindrance.major,
                takenFrom: hindrance.book_short_name + bookPage,
                bookID: hindrance.book_id,
                isHidden: hindrance.isHidden,
                descriptionHTML: hindrance.descriptionHTML,
            })

        }

        // Weapons
        for( let weapon of char.getWeapons() ) {

            rv.weapons.push(
                weapon.getGenericExportWeapon()
            )
        }

        // Power Attacks
        for( let power of char.getPowers() ) {
            if( power.damage ) {
                let damageDie = ParseDamageString(
                    power.damage,
                    char.getAttributeCurrentHR("strength"),
                    char.getAttributeCurrentHR("smarts"),
                    char.getAttributeCurrentHR("spirit"),
                );
                rv.weapons.push({
                    id: 0,
                    uuid: "",
                    name: power.name,
                    weight: 0,
                    range: power.range,
                    damage: power.damage,
                    damageWithBrackets: power.damage,
                    rof: 0,
                    shots: 0,
                    ap: 0,
                    descriptionHTML: "",
                    notes: "Power, Power Points: " + power.powerPoints,
                    thrown: false,
                    quantity: 1,
                    reach: 0,
                    innate: false,
                    damageDiceBase: damageDie.dice,
                    damageDiceBasePlus: damageDie.bonuses,
                    equippedAs: 'primary',
                    equipped: true,
                    cost: 0,
                    costBuy: 0,
                    takenFrom: power.bookPage,
                    bookID: power.bookID,
                    minStr: "",
                    bookPublisher: "",
                    bookPublished: "",
                    bookName: "",
                    profiles: [ {
                        name: power.name,
                        range: power.range,
                        damage: power.damage,
                        damageWithBrackets: power.damage,
                        damage_original: power.damage,
                        rof: 0,
                        shots: 0,
                        ap: 0,
                        notes: "Power, Power Points: " + power.powerPoints,
                        thrown_weapon: false,
                        reach: 0,
                        damageDiceBase: damageDie.dice,
                        damageDiceBasePlus: damageDie.bonuses,
                        equipped: false,
                        currentShots: 0,

                        parry_modifier: 0,
                        toHitMod: 0,

                        requires_2_hands: true,
                        heavy_weapon: false,
                        melee_only: false,
                        counts_as_innate: false,

                        additionalDamage: "",

                        is_shield: false,

                        usable_in_melee: false,
                        add_strength_to_damage: false,

                        ap_vs_rigid_armor_only: 0,

                        vtt_only: false,

                        skillName: power.skillName,
                        skillValue: power.skillValue,
                    }],
                    activeProfile: 0,
                })
            }
        }

        // Gear
        for( let gear of char.getGearPurchased() ) {

            rv.gear.push( gear.getGenericExport() )
        }

        // Unarmored Entry
        let unArmoredCharacterStats = char.getAlternateArmorProfile("Unarmored");

        rv.armor.push({
            id: 0,
            uuid: "",
            name: "(Unarmored)",
            weight: 0,
            quantity: 1,

            armor: unArmoredCharacterStats ? unArmoredCharacterStats.armor :  0 ,
            coversFace: true,
            coversHead: true,
            coversTorso: true,
            coversLegs: true,
            coversArms: true,
            notes: "",
            takenFrom: "",
            bookID: 0,
            descriptionHTML: "",

            bookPublisher: "",
            bookPublished: "",
            bookName: "",
            isShield: false,
            equipped: false,
            cost: 0,
            costBuy: 0,
            minStr: "",
            equippedToughness: unArmoredCharacterStats ? unArmoredCharacterStats.toughnessAndArmor : "0",
            equippedStrength: unArmoredCharacterStats ? unArmoredCharacterStats.strength : "0",
            heavyArmor: unArmoredCharacterStats ? unArmoredCharacterStats.isHeavyArmor : false,
        })

        // Armor
        for( let armor of char.getArmorPurchased() ) {
            if( !armor.isShield ) {
                let armoredCharStat = char.getAlternateArmorProfile(armor.name);

                rv.armor.push( armor.getGenericExportArmor(armoredCharStat) )
            }
        }

        // Armor
        for( let armor of char.getArmorPurchased() ) {
            if( armor.isShield ) {
                rv.shields.push( armor.getGenericExportShield() )
            }
        }

        // Cyberware
        for( let item of char.getCyberwarePurchased() ) {

            rv.cyberware.push({
                id: item.id,
                uuid: item.uuid,
                name: item.getName(),
                ranks: item.ranks,
                quantity: item.quantity,
                notes: item.summary,
                descriptionHTML: "",
                takenFrom: item.getBookPage(),
                bookID: item.book_id,
                strain: item.strain,
                cost: item.cost,
                costBuy: item.buyCost,
            })
        }

        // Arcane Backgrounds - track UUIDs to prevent duplicates
        let addedArcaneBackgroundUUIDs: Set<string> = new Set();

        for( let ab of char._selectedArcaneBackgrounds ) {
            if( ab ) {
                let foundEdge = false;
                let edgeName = "arcanebackground" + replaceAll( ab.name, " ", "").toLowerCase();
                for( let edge of rv.edges ) {
                    if(
                        replaceAll(
                            replaceAll(
                                replaceAll(edge.name, " ", ""),
                            "(", ""),
                        ")", "").toLowerCase()
                        == edgeName
                    ) {
                        foundEdge = true;
                        break;
                    }

                }

                if( foundEdge == false ) {
                    // Add Arcane Background Edge if it doesn't exist already for completeness.
                    rv.edges.push({
                        id: ab.id,
                        name: "Arcane Background (" + ab.name + ")",
                        description: "Provides Arcane Background: " + ab.name,
                        note: "Arcane Background",
                        takenFrom: ab.getBookPage(),
                        bookID: ab.book_id,
                        isHidden: false,
                        descriptionHTML: ab.getDescriptionHTML(),
                        customDescription: "",
                    })
                }

                let newAB: IExportArcaneBackground = {
                    id: ab.id,
                    hasPowerPointPool: ab.hasPowerPointPool(),
                    uuid: ab.uuid,
                    hasMegaPowerOptions: ab.megaPowers,
                    name: ab.getName(),
                    powersTotal: ab.getStartingPowerCount(),
                    powerPointsMax: ab.getMaxPowerPoints(),
                    powerPointsCurrent: ab.getCurrentPowerPoints(),
                    arcaneSkill: ab && ab.arcaneSkill ? ab.arcaneSkill.name : "",
                    takenFrom: ab.getBookPage(),
                    bookID: ab.book_id,
                    powerPointsName: ab.powerPointsName,
                    powers: [],
                }

                for( let power of ab.getAllPowers() ) {
                    let skillMod = power.getCastingSkillModifier();

                    newAB.powers.push({
                        id: power.id,
                        uuid: power.uuid,
                        name: power.getName(),
                        aspectOnlyName: power.getBaseName(),
                        customName: power.customName,
                        powerPoints: power.getPowerPoints(),
                        range: power.getRange(),
                        takenFrom: power.getBookPage(),
                        bookID: power.book_id,
                        damage: power.getDamage(),
                        damageWithBrackets: power.getDamage(),
                        duration: power.getDuration(),
                        innate: power.innatePower,
                        summary: power.getSummary(),
                        description: power.getDescription(),
                        bookPowerName: power.name,
                        trappings: power.getTrappings(),
                        rank: getRankName(power.rank).toLowerCase(),
                        skillModifier: skillMod,
                        arcaneSkillName: power.getSkillName(ab),
                        arcaneSkillRoll: power.getSkillValue(char, ab),
                        powerModifiers: power.getPowerModifiers(),
                        additionalTargets: power.getAdditionalTargets(),
                        megaPowerOptions: power.getMegaPowerOptions(),
                        descriptionHTML: power.getDescriptionHTML(),
                        customDescription: power.customDescription,
                        originalName: power.name,
                    })
                }

                newAB.powers.sort( sortPowerExports );

                rv.abs.push(
                    newAB
                )

                // Track this AB's UUID to prevent duplicate from edges
                addedArcaneBackgroundUUIDs.add(ab.uuid);
            }
        }

        for( let edge of char.getAllEdgeObjects() ) {
            let ab = edge.arcaneBackground;
            if( ab ) {
                // Skip if this arcane background was already added from _selectedArcaneBackgrounds
                if( addedArcaneBackgroundUUIDs.has(ab.uuid) ) {
                    continue;
                }

                let foundEdge = false;
                let edgeName = "arcanebackground" + replaceAll( ab.name, " ", "").toLowerCase();
                for( let edge of rv.edges ) {
                    if(
                        replaceAll(
                            replaceAll(
                                replaceAll(edge.name, " ", ""),
                            "(", ""),
                        ")", "").toLowerCase()
                        == edgeName
                    ) {
                        foundEdge = true;
                        break;
                    }

                }

                if( foundEdge == false ) {
                    // Add Arcane Background Edge if it doesn't exist already for completeness.
                    rv.edges.push({
                        id: ab.id,
                        name: "Arcane Background (" + ab.name + ")",
                        description: "Provides Arcane Background: " + ab.name,
                        note: "Arcane Background",
                        takenFrom: ab.getBookPage(),
                        bookID: ab.book_id,
                        isHidden: false,
                        descriptionHTML: ab.getDescriptionHTML(),
                        customDescription: "",
                    })
                }

                let newAB: IExportArcaneBackground = {
                    id: ab.id,
                    hasMegaPowerOptions: ab.megaPowers,
                    hasPowerPointPool: ab.hasPowerPointPool(),
                    uuid: ab.uuid,
                    name: ab.getName(),
                    powersTotal: ab.getStartingPowerCount(),
                    powerPointsMax: ab.getMaxPowerPoints(),
                    powerPointsCurrent: ab.getCurrentPowerPoints(),
                    arcaneSkill: ab && ab.arcaneSkill ? ab.arcaneSkill.name : "",
                    takenFrom: ab.getBookPage(),
                    bookID: ab.book_id,
                    powerPointsName: ab.powerPointsName,
                    powers: [],
                }

                for( let power of ab.getAllPowers() ) {
                    let skillMod = power.getCastingSkillModifier();
                    newAB.powers.push({
                        id: power.id,
                        uuid: power.uuid,
                        name: power.getName(),
                        aspectOnlyName: power.getBaseName(),
                        customName: power.customName,
                        powerPoints: power.getPowerPoints(),
                        range: power.getRange(),
                        takenFrom: power.getBookPage(),
                        bookID: power.book_id,
                        damage: power.getDamage(),
                        damageWithBrackets: power.getDamage(),
                        duration: power.getDuration(),
                        innate: power.innatePower,
                        summary: power.getSummary(),
                        description: power.getDescription(),
                        bookPowerName: power.name,
                        trappings: power.getTrappings(),
                        rank: getRankName(power.rank).toLowerCase(),
                        skillModifier: skillMod,
                        arcaneSkillName: power.getSkillName(ab),
                        arcaneSkillRoll: power.getSkillValue(char, ab),
                        powerModifiers: power.getPowerModifiers(),
                        additionalTargets: power.getAdditionalTargets(),
                        megaPowerOptions: power.getMegaPowerOptions(),
                        descriptionHTML: power.getDescriptionHTML(),
                        customDescription: power.customDescription,
                        originalName: power.name,
                    })

                }

                newAB.powers.sort( sortPowerExports )

                rv.abs.push(
                    newAB
                )

                // Track this AB's UUID to prevent future duplicates
                addedArcaneBackgroundUUIDs.add(ab.uuid);
            }
        }

        return rv;
    }
}
