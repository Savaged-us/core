export interface IEffectChoice {
    label: string,
    effect: string,
}

export function ParseEffectChoices( effectsList: string[] ): IEffectChoice[] {
    let effectItems: IEffectChoice[] = [];
    for( let effect of effectsList ) {
        let effectSplit = effect.split(";");
        if( effectSplit.length > 1 ) {
            effectItems.push( {
                label: effectSplit[0],
                effect: effectSplit[1],
            });
        } else {
            effectItems.push( {
                label: effectSplit[0],
                effect: effectSplit[0],
            });
        }

    }

    return effectItems;
}