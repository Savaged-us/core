import { IJSONArcaneItemExport, IJSONArcaneItemPowerExport } from "../../interfaces/IJSONPlayerCharacterExport";
import { PlayerCharacter } from "./player_character";

export class ArcaneItem {
    _char: PlayerCharacter | null = null;

    currentPowerPoints: number;
    name: string;
    summary: string;
    powerPoints: number;
    powers: IJSONArcaneItemPowerExport[];
    select_any_power: boolean = false;
    select_tw_powers: boolean = false;

    constructor(
        characterObject: PlayerCharacter | null = null,
        initObj: IJSONArcaneItemExport | null = null,
    ) {

        this.reset();
        if( characterObject ) {
            this._char = characterObject;
        }
        if( initObj ) {
            this.currentPowerPoints = +initObj.current_power_points;
            this.name = initObj.name;
            this.summary = initObj.summary;
            this.powerPoints  = +initObj.power_points;
            this.powers = initObj.powers;
            this.select_any_power = false;
            if( initObj.select_any_power )
                this.select_any_power = true;
            this.select_tw_powers = false;
            if( initObj.select_tw_powers )
                this.select_tw_powers = true;
        }
    }

    reset() {
        this.currentPowerPoints = 0;
        this.name = "";
        this.summary = "";
        this.powerPoints = 0;
        this.powers = [];
        this.select_any_power = false;
        this.select_tw_powers = false;
    }

    export(): IJSONArcaneItemExport {
        let returnItem: IJSONArcaneItemExport = {
            current_power_points: this.currentPowerPoints.toString(),
            name: this.name,
            summary: this.summary,
            power_points: this.powerPoints,
            powers: this.powers,
            select_any_power: this.select_any_power,
            select_tw_powers: this.select_tw_powers,
        }

        return returnItem;
    }
}