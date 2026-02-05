import { IVTTEnhancementSuiteAttribs } from "../interfaces/IVTTEnhancementSuite";

export function makeRoll20BaseAttribs(
    idPre: string,
    logoNumber: string = "1",
    backgroundNumber: string = "1,"
): IVTTEnhancementSuiteAttribs[] {

    let returnItems: IVTTEnhancementSuiteAttribs[] = [
        {
            "name": "fightingname",
            "current": "Fighting",
            "max": "",
            "id": idPre + "lUvH_SCUVrOKa"
        },
        {
            "name": "academicsname",
            "current": "Academics",
            "max": "",
            "id": idPre + "lUvH_SCUVrOKb"
        },
        {
            "name": "athleticsname",
            "current": "Athletics",
            "max": "",
            "id": idPre + "mXX-yOS3bcMqj"
        },
        {
            "name": "battlename",
            "current": "Battle",
            "max": "",
            "id": idPre + "na0k6IPLne41T"
        },
        {
            "name": "boatingname",
            "current": "Boating",
            "max": "",
            "id": idPre + "na0k6IPLne41U"
        },
        {
            "name": "climbingname",
            "current": "Climbing",
            "max": "",
            "id": idPre + "oEmdIsD2lt4t0"
        },
        {
            "name": "commonknowledgename",
            "current": "Common Knowledge",
            "max": "",
            "id": idPre + "oEmdIsD2lt4t1"
        },
        {
            "name": "drivingname",
            "current": "Driving",
            "max": "",
            "id": idPre + "pnTvZeVzjGuP5"
        },
        {
            "name": "electronicsname",
            "current": "Electronics",
            "max": "",
            "id": idPre + "qcOe6ARY_m8bU"
        },
        {
            "name": "faithname",
            "current": "Faith",
            "max": "",
            "id": idPre + "rlrJekdsNUV3y"
        },
        {
            "name": "focusname",
            "current": "Focus",
            "max": "",
            "id": idPre + "sk1FKc5etfQxM"
        },
        {
            "name": "gamblingname",
            "current": "Gambling",
            "max": "",
            "id": idPre + "tm2ShiYajsGK9"
        },
        {
            "name": "gutsname",
            "current": "Guts",
            "max": "",
            "id": idPre + "uyY3rm3eIfVft"
        },
        {
            "name": "hackingname",
            "current": "Hacking",
            "max": "",
            "id": idPre + "vRgj7g_0k4kW8"
        },
        {
            "name": "healingname",
            "current": "Healing",
            "max": "",
            "id": idPre + "vRgj7g_0k4kW9"
        },
        {
            "name": "intimidationname",
            "current": "Intimidation",
            "max": "",
            "id": idPre + "wxx54H5TGIVp_"
        },
        {
            "name": "investigationname",
            "current": "Investigation",
            "max": "",
            "id": idPre + "wxx54H5TGIVpa"
        },
        {
            "name": "native-languagename",
            "current": "Native Language",
            "max": "",
            "id": idPre + "xL35r7ItYbRdn"
        },
        {
            "name": "lockpickingname",
            "current": "Lockpicking",
            "max": "",
            "id": idPre + "xL35r7ItYbRdo"
        },
        {
            "name": "noticename",
            "current": "Notice",
            "max": "",
            "id": idPre + "yy-ST4OOx3WXT"
        },
        {
            "name": "occultname",
            "current": "Occult",
            "max": "",
            "id": idPre + "ztIQqu2bkecUU"
        },
        {
            "name": "performancename",
            "current": "Performance",
            "max": "",
            "id": idPre + "ztIQqu2bkecUV"
        },
        {
            "name": "persuasionname",
            "current": "Persuasion",
            "max": "",
            "id": idPre + "Z6-QlTOrmssL3gI"
        },
        {
            "name": "pilotingname",
            "current": "Piloting",
            "max": "",
            "id": idPre + "Z6-QlTOrmssL3gJ"
        },
        {
            "name": "psionicsname",
            "current": "Psionics",
            "max": "",
            "id": idPre + "Z60-D0_UAv5Gils"
        },
        {
            "name": "repairname",
            "current": "Repair",
            "max": "",
            "id": idPre + "Z61z-FtDkeTn-f3"
        },
        {
            "name": "researchname",
            "current": "Research",
            "max": "",
            "id": idPre + "Z61z-FtDkeTn-f4"
        },
        {
            "name": "ridingname",
            "current": "Riding",
            "max": "",
            "id": idPre + "Z64yrvBmNJNndFj"
        },
        {
            "name": "ritualname",
            "current": "Ritual",
            "max": "",
            "id": idPre + "Z65nXFr4_bV5BXG"
        },
        {
            "name": "sciencename",
            "current": "Science",
            "max": "",
            "id": idPre + "Z66s7SK24cipaJ6"
        },
        {
            "name": "shootingname",
            "current": "Shooting",
            "max": "",
            "id": idPre + "Z69KO_sqyVhN-d-"
        },
        {
            "name": "spellcastingname",
            "current": "Spellcasting",
            "max": "",
            "id": idPre + "Z6Bb0WltSQ-HMkV"
        },
        {
            "name": "stealthname",
            "current": "Stealth",
            "max": "",
            "id": idPre + "Z6CG9eqzGSmzI4M"
        },
        {
            "name": "streetwisename",
            "current": "Streetwise",
            "max": "",
            "id": idPre + "Z6DzYUh8ppmN8dm"
        },
        {
            "name": "survivalname",
            "current": "Survival",
            "max": "",
            "id": idPre + "Z6Ealy850qpWoTa"
        },
        {
            "name": "swimmingname",
            "current": "Swimming",
            "max": "",
            "id": idPre + "Z6Ealy850qpWoTb"
        },
        {
            "name": "tauntname",
            "current": "Taunt",
            "max": "",
            "id": idPre + "Z6FX6F7JCCdu5W4"
        },
        {
            "name": "thieveryname",
            "current": "Thievery",
            "max": "",
            "id": idPre + "Z6GBzr0mRLYNxQ8"
        },
        {
            "name": "throwingname",
            "current": "Throwing",
            "max": "",
            "id": idPre + "Z6GBzr0mRLYNxQ9"
        },
        {
            "name": "trackingname",
            "current": "Tracking",
            "max": "",
            "id": idPre + "Z6Hx6aSAFhVslUv"
        },
        {
            "name": "weirdsciencename",
            "current": "Weird Science",
            "max": "",
            "id": idPre + "Z6I9Hh4vNLNx6le"
        },
        {
            "name": "chardesc",
            "current": "{{name=@{character_name}}} {{wci=@{WCI}}} {{description=@{physdescription}}}",
            "max": "",
            "id": "-M4vDZ6RWRVK-uPFwyP9"
        },
        {
            "name": "charderived",
            "current": "[**^{pace}:** @{paceCur}](~RunningRoll); **^{parry}:** @{parryCur}; **^{toughness}:** @{toughnesscur}(@{toughnessArmor})",
            "max": "",
            "id": "-M4vDZ6SultEW4eHkBBf"
        },

        {
            "name": "logo",
            "current": logoNumber,
            "max": "",
            "id": "-M4vDZ6f6NblPfiino54"
        },
        {
            "name": "background",
            "current": backgroundNumber,
            "max": "",
            "id": "-M4vDZ6gFZwh04J08vw6"
        },
        {
            "name": "initdesc",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6I9Hh4vNLNx6lf"
        },
        {
            "name": "initskills",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6JICmRi7aNcfhq"
        },
        {
            "name": "initderived",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6KKs4QgUKWBQB2"
        },
        {
            "name": "initgear",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6M-ilwuT_hVXEP"
        },
        {
            "name": "inithindrances",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6NZQPJOlPixEt5"
        },
        {
            "name": "initsbedges",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6PWiB69VAsb2vv"
        },
        {
            "name": "initspecabilities",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6Q-LHBuoycJ68A"
        },
        {
            "name": "initpowers",
            "current": "1",
            "max": "",
            "id": "-M4vDZ6RWRVK-uPFwyP8"
        },
    ];

    return returnItems;
}

export function makeRoll20BaseAttrib(
    idPre: string,
    name: string,
    value: string | number,
    max: string | number = "",
): IVTTEnhancementSuiteAttribs {
    return {
        "name": name,
        "current": value,
        "max": max,
        "id": idPre + "-" + name
    };
}

export function convertToRoll20DamageString(roll20DamageString: string ): string {
    roll20DamageString = roll20DamageString.replace(/str/ig, "@{strength_rank}");
    roll20DamageString = roll20DamageString.replace(/d4/ig, "d4!");
    roll20DamageString = roll20DamageString.replace(/d6/ig, "d6!");
    roll20DamageString = roll20DamageString.replace(/d8/ig, "d8!");
    roll20DamageString = roll20DamageString.replace(/d10/ig, "d10!");
    roll20DamageString = roll20DamageString.replace(/d12/ig, "d12!");
    roll20DamageString = roll20DamageString.replace(/d20/ig, "d20!");

    return roll20DamageString
}