import { ICharModParseResult, ApplyCharacterEffects } from "../utils/ApplyCharacterMod";

export interface IEffectVailidtyResults {
    total: number;
    good: number;
    valid: boolean;
    messages: ICharModParseResult[];
}

