import { ISuperPower2021ComboDefinition } from "./edge";
import { PlayerCharacter } from "./player_character";
import { SuperPower2021 } from "./super_power_2021";

export interface ISuperPowerSetComboDefinition {
    name: string;
    super_powers: ISuperPower2021ComboDefinition[];
    active: boolean;
}

export class SuperPowerSet2021 {

    name: string;
    super_powers: SuperPower2021[] = [];
    active: boolean = false;

    _char: PlayerCharacter | null;
    constructor(
        characterObject: PlayerCharacter | null,
        io: ISuperPowerSetComboDefinition | null,
    ) {
        this._char = characterObject;
        this.import( io )
    }

    getSetBaseCost(): number {
        if( this._char ) {
            let val = this._char.setting.swade_spc_campaign_power_level;
            switch( val ) {
                case 15:
                    return 3;
                case 30:
                    return 5;
                case 45:
                    return 8;
                case 60:
                    return 10;
                case 75:
                    return 12;
            }
            console.log("unhandled setting.swade_spc_campaign_power_level", val)
        } else {
            console.warn( "SuperPowerSet2021", "getSetBaseCost", " no this._char object!")
        }
        return 0;
    }

    getSetLimit(): number {
        if( this._char  ) {
            let val = this._char.setting.swade_spc_campaign_power_level;
            switch( val ) {
                case 15:
                    return 4;
                case 30:
                    return 8;
                case 45:
                    return 12;
                case 60:
                    return 16;
                case 75:
                    return 20;
            }
            console.log("unhandled setting.swade_spc_campaign_power_level", val)
        } else {
            console.warn( "SuperPowerSet2021", "getSetBaseCost", " no this._char object!")
        }
        return 0;
    }

    getTotalPoints() {
        let rv = this.getSetBaseCost();

        rv += this.getPowerPointCost();

        return rv;
    }

    getPowerPointCost(): number {
        let rv = 0;
        for( let obj of this.super_powers ) {
            rv += obj.getPoints();
        }
        return rv;
    }

    getRemainingSPCPowerPoints(): number {
        let rv = this.getSetLimit();

        rv -= this.getPowerPointCost();

        return rv;
    }

    export(): ISuperPowerSetComboDefinition {
        let rv: ISuperPowerSetComboDefinition = {
            name: this.name,
            super_powers: [],
            active: this.active,
        }

        for( let obj of this.super_powers) {
            if( obj.id > 0 ) {
                rv.super_powers.push({
                    id: obj.id,
                    options: obj.exportOptions(),
                });
            } else {
                rv.super_powers.push({
                    id: 0,
                    def: obj.export(),
                    options: obj.exportOptions(),
                });
            }
        }

        return rv;
    }

    apply(
        charObj: PlayerCharacter | null,
        activeOnly: boolean = true,
    ) {
        if(!charObj)
            return;
        if( this.active || !activeOnly ) {
            let powerNames: string[] = [];
            for( let power of this.super_powers ) {
                powerNames.push( power.getName() );
            }
            charObj.addSpecialAbility(
                this.name,
                "Super Power Set - " + (powerNames.length > 0 ? powerNames.join(", ") + ". See items below" : "Why No Powers?"),
                "",
                "",
                0,
            );

            for( let abi of this.super_powers ) {
                abi.apply( charObj, false );
            }
        }
    }

    import(
        io: ISuperPowerSetComboDefinition | null,
    ) {
        if(!this._char)
            return;
        if( io ) {
            this.name = "";
            if( io.name ) {
                this.name = io.name;
            }
            this.active = false;
            if( io.active ) {
                this.active = true;
            }
            this.super_powers = [];
            if( io.super_powers && io.super_powers.length > 0 ) {
                for( let def of io.super_powers ) {
                    if( def.id > 0 ) {
                        for( let def2021 of this._char._availableData.super_powers_2021 ) {
                            if( def2021.id == def.id ) {
                                let spcObj = new SuperPower2021( def2021, this._char);
                                spcObj.importOptions( def.options );
                                this.super_powers.push(
                                    spcObj
                                );
                                break;
                            }
                        }
                    } else {
                        let spcObj = new SuperPower2021( def.def, this._char);
                        spcObj.importOptions( def.options );
                        this.super_powers.push(
                            spcObj
                        );
                    }
                }
            }
        }
    }
}