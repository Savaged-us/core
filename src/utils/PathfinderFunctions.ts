export function getPathfinderArmorLabel( lvl: number ): string {
    if( lvl == 0 )
        return "None";
    else if( lvl == 1 )
        return "Light";
    else if( lvl == 2 )
        return "Medium";
    else if( lvl == 3 )
        return "Heavy";
}