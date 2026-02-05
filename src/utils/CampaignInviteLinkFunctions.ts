import { generateUUID } from './generateUUID';
import { isNumeric } from './isNumeric';

export function makeInviteLink(
    campaignID: number
): string {
    let uuuid = generateUUID();
    return campaignID.toString() + "-" + uuuid;
}

export function extractCampaignIDFromInviteLink(
    inviteURL: string
): number {
    if( inviteURL.indexOf("-") > -1 ) {
        let cut = inviteURL.split("-");
        if( isNumeric( cut[0]) ) {
            return +cut[0]
        }
    }
    return 0;
}

export function makeInviteLinkURL(
    campaignInviteData: string,
    baseURL: string = "https://savaged.us",
): string {
    return baseURL + "/campaigns/" + campaignInviteData;
}